const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");

const { getCoverPath, getCoverCandidates } = require("../src/queue");

async function makeDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), "autosocial-cover-"));
}

test("getCoverPath returns the .kapak.jpg sidecar when present", async () => {
  const dir = await makeDir();
  const video = path.join(dir, "01_ping.mp4");
  await fs.writeFile(path.join(dir, "01_ping.kapak.jpg"), "");
  assert.equal(await getCoverPath(video), path.join(dir, "01_ping.kapak.jpg"));
});

test("getCoverPath prefers .jpg over .png and falls back to .png", async () => {
  const dir = await makeDir();
  const video = path.join(dir, "clip.mp4");
  await fs.writeFile(path.join(dir, "clip.kapak.png"), "");
  assert.equal(await getCoverPath(video), path.join(dir, "clip.kapak.png"));
  await fs.writeFile(path.join(dir, "clip.kapak.jpg"), "");
  assert.equal(await getCoverPath(video), path.join(dir, "clip.kapak.jpg"));
});

test("getCoverPath returns empty string when there is no cover", async () => {
  const dir = await makeDir();
  assert.equal(await getCoverPath(path.join(dir, "clip.mp4")), "");
});

test("getCoverCandidates lists the jpg and png sidecar paths", () => {
  const candidates = getCoverCandidates("/q/pending/clip.mp4");
  assert.deepEqual(candidates.map((p) => path.basename(p)), ["clip.kapak.jpg", "clip.kapak.png"]);
});
