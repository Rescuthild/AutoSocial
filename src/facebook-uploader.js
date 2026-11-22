const fs = require("fs/promises");
const { chromium } = require("playwright");
const { config } = require("./config");
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

module.exports = {
  openPersistentContext,
  startLoginSession,
  getLoginSessionStatus,
  closeLoginSession,
};
