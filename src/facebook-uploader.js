const fs = require("fs/promises");
const path = require("path");
const { chromium } = require("playwright");
const { config } = require("./config");
const uiLabels = require("./platform-ui-labels");
const {
  getActiveAccount,
  getPlatformProfileDir,
  hasSavedPlatformSession,
} = require("./account-manager");

const LOGIN_URL = "https://www.facebook.com/login";

let loginSessionContext = null;
let loginSessionAccountId = null;

async function openPersistentContext(accountId) {
  const profileDir = await getPlatformProfileDir("facebook", accountId);
  await fs.mkdir(profileDir, { recursive: true });
  return chromium.launchPersistentContext(profileDir, {
    headless: config.headless,
    viewport: { width: 1400, height: 1000 },
    locale: config.browserLocale,
    timezoneId: config.timezone,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-first-run",
      "--no-default-browser-check",
    ],
  });
}

async function startLoginSession() {
  const activeAccount = await getActiveAccount();
  if (loginSessionContext && loginSessionAccountId !== activeAccount.id) {
    const previous = loginSessionContext;
    loginSessionContext = null;
    loginSessionAccountId = null;
    await previous.close().catch(() => { });
  }

  if (loginSessionContext) {
    return { ok: true, alreadyOpen: true };
  }

  const context = await openPersistentContext(activeAccount.id);
  const page = context.pages()[0] || (await context.newPage());
  loginSessionContext = context;
  loginSessionAccountId = activeAccount.id;
  context.on("close", () => {
    if (loginSessionContext === context) {
      loginSessionContext = null;
      loginSessionAccountId = null;
    }
  });

  await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  return { ok: true, alreadyOpen: false, url: page.url() };
}

async function getLoginSessionStatus() {
  const activeAccount = await getActiveAccount();
  const saved = await hasSavedPlatformSession("facebook", activeAccount.id);
  return {
    open: Boolean(loginSessionContext) && loginSessionAccountId === activeAccount.id,
    saved,
  };
}

async function closeLoginSession() {
  if (!loginSessionContext) {
    return { ok: true, alreadyClosed: true };
  }
  const context = loginSessionContext;
  loginSessionContext = null;
  loginSessionAccountId = null;
  await context.close().catch(() => { });
  return { ok: true, alreadyClosed: false };
}

// Pure helpers (unit tested)

function normalizeName(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLocaleLowerCase("tr");
}

function isExpectedPageProfile(activeName, expectedName) {
  const expected = normalizeName(expectedName);
  return Boolean(expected) && normalizeName(activeName) === expected;
}

function isLoginUrl(url) {
  try {
    const { pathname } = new URL(url);
    return /^\/(login|checkpoint)(\/|$)|^\/login\.php$/.test(pathname);
  } catch {
    return false;
  }
}

// The empty composer greets the active profile: "What's on your mind, <name>?"
function extractProfileName(label) {
  const match = /^(?:what['\u2019]s on your mind|ne d\u00fc\u015f\u00fcn\u00fcyorsun),\s*(.+?)\?$/i.exec(
    String(label || "").trim()
  );
  return match ? match[1].trim() : "";
}

function captionMatches(actual, expected) {
  const squash = (value) => String(value || "").replace(/\s+/g, " ").trim();
  return squash(actual) === squash(expected);
}

function exactLabel(key) {
  const escaped = uiLabels.terms(key).map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`^(${escaped.join("|")})$`, "i");
}

// Upload flow

async function dismissDialogs(page) {
  const close = page.getByRole("alertdialog").getByRole("button", { name: exactLabel("facebookClose") });
  if (await close.count()) {
    await close.first().click().catch(() => { });
    await page.waitForTimeout(800);
  }
}

async function readActiveProfileName(page) {
  const boxes = page.getByRole("textbox");
  const count = await boxes.count();
  for (let i = 0; i < count; i++) {
    const label = (await boxes.nth(i).getAttribute("aria-label").catch(() => "")) || "";
    const name = extractProfileName(label);
    if (name) return name;
  }
  return "";
}

async function waitForEnabledButton(page, labelKey, timeoutMs) {
  const button = page.getByRole("button", { name: exactLabel(labelKey) }).last();
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if ((await button.count()) && (await button.getAttribute("aria-disabled")) !== "true") {
      return button;
    }
    await page.waitForTimeout(2000);
  }
  throw new Error(`Facebook "${labelKey}" button did not become enabled in ${timeoutMs / 1000}s.`);
}

// insertText avoids key events, so "@" and "#" typeahead menus cannot pick a
// suggestion; Escape closes any menu before the line break.
async function setCaption(page, caption) {
  const box = page.getByRole("textbox", { name: uiLabels.pattern("facebookCaptionBox") }).first();
  await box.click();
  const lines = String(caption || "").split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]) await page.keyboard.insertText(lines[i]);
    await page.keyboard.press("Escape");
    if (i < lines.length - 1) await page.keyboard.press("Enter");
  }
  await page.waitForTimeout(1000);
  const actual = await box.innerText();
  if (!captionMatches(actual, caption)) {
    throw new Error("Facebook caption box text does not match the queued caption; not posting.");
  }
}

async function waitForPublishResult(page, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  const published = uiLabels.pattern("facebookPublished");
  const failed = uiLabels.pattern("facebookError");
  while (Date.now() < deadline) {
    if (!/\/reels\/create/.test(page.url())) return { ok: true };
    const alerts = await page.getByRole("alert").allInnerTexts().catch(() => []);
    const text = alerts.join(" ");
    if (failed.test(text)) return { ok: false, reason: `Facebook reported: ${text.slice(0, 200)}` };
    if (published.test(text)) return { ok: true };
    await page.waitForTimeout(2000);
  }
  return { ok: false, reason: `No Facebook publish confirmation within ${timeoutMs / 1000}s.` };
}

async function uploadVideo({ videoPath, caption, accountId }) {
  const absoluteVideoPath = path.resolve(videoPath);
  const context = await openPersistentContext(accountId);
  const page = context.pages()[0] || (await context.newPage());
  let closeHoldMs = 0;

  try {
    if (!config.facebookPageName) {
      throw new Error("FACEBOOK_PAGE_NAME is not set; refusing to post.");
    }
    await page.goto(config.facebookUploadPageUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(6000);
    if (isLoginUrl(page.url())) {
      throw new Error("Facebook session expired; log in again from Accounts.");
    }
    await dismissDialogs(page);

    const activeName = await readActiveProfileName(page);
    if (!isExpectedPageProfile(activeName, config.facebookPageName)) {
      throw new Error(
        `Active Facebook profile is "${activeName || "unknown"}", expected "${config.facebookPageName}". Not posting.`
      );
    }

    await page.locator('input[type="file"]').first().setInputFiles(absoluteVideoPath);
    const next = await waitForEnabledButton(page, "facebookNext", 180000);
    await setCaption(page, caption || config.defaultCaption);
    await next.click();

    const publish = await waitForEnabledButton(page, "facebookPublish", 60000);
    await publish.click();

    const result = await waitForPublishResult(page, 120000);
    if (!result.ok) {
      throw new Error(result.reason);
    }

    const successScreenshotPath = path.resolve(config.projectRoot, "last-facebook-upload-success.png");
    await page.screenshot({ path: successScreenshotPath, fullPage: true }).catch(() => { });
    closeHoldMs = Math.max(config.postPublishHoldMs || 15000, 15000);
    return { ok: true };
  } catch (error) {
    const screenshotPath = path.resolve(config.projectRoot, "last-facebook-upload-error.png");
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => { });
    closeHoldMs = Math.max(config.failureHoldMs, 0);
    return { ok: false, error: error.message, screenshotPath };
  } finally {
    if (closeHoldMs > 0) {
      await page.waitForTimeout(closeHoldMs).catch(() => { });
    }
    await context.close();
  }
}

module.exports = {
  uploadVideo,
  _private: { isExpectedPageProfile, isLoginUrl, extractProfileName, captionMatches },
  openPersistentContext,
  startLoginSession,
  getLoginSessionStatus,
  closeLoginSession,
};
