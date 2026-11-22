const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");

const { getNextQueuedItem } = require("../src/facebook-queue");
const { getAccountQueueDirs } = require("../src/account-manager");
const { getAllowedSetupFolderPath } = require("../src/setup-health");
const { config } = require("../src/config");

test("account queue dirs include facebook pending/posted/failed", () => {
  const dirs = getAccountQueueDirs("brand-x");
  assert.match(dirs.facebook.pending, /queue[\\/]brand-x[\\/]facebook[\\/]pending$/);
  assert.match(dirs.facebook.posted, /queue[\\/]brand-x[\\/]facebook[\\/]posted$/);
  assert.match(dirs.facebook.failed, /queue[\\/]brand-x[\\/]facebook[\\/]failed$/);
});

test("facebook getNextQueuedItem reads the .txt caption sidecar", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "autosocial-fb-queue-"));
  const videoPath = path.join(dir, "reel.mp4");
  await fs.writeFile(videoPath, "");
  await fs.writeFile(path.join(dir, "reel.txt"), "  reel caption \n");

  const item = await getNextQueuedItem(dir);

  assert.equal(item.videoPath, videoPath);
  assert.equal(item.caption, "reel caption");
});

test("setup folder resolver exposes the facebook pending folder", () => {
  const facebookPath = getAllowedSetupFolderPath("facebookPending", "default");
  assert.match(facebookPath, /queue[\\/]default[\\/]facebook[\\/]pending$/);
});

test("facebook config defaults are safe", () => {
  assert.equal(config.facebookUploadPageUrl, "https://www.facebook.com/reels/create");
  assert.equal(config.facebookCronExpression, "0 */2 * * *");
  assert.equal(typeof config.facebookPageName, "string");
});
