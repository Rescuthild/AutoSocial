const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");

const { FacebookDaemonController } = require("../src/facebook-daemon-controller");

test("facebook scheduler run with an empty queue skips without opening a browser", async () => {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), "autosocial-fb-daemon-"));
  const daemon = new FacebookDaemonController({
    accountId: "test",
    queueDir: path.join(base, "pending"),
    postedDir: path.join(base, "posted"),
    failedDir: path.join(base, "failed"),
    statePath: path.join(base, "facebook-scheduler-state.json"),
  });

  const result = await daemon.runOnce("test");

  assert.equal(result.skipped, true);
  assert.equal(result.reason, "Facebook queue is empty.");
});

test("facebook scheduler accepts daily times", async () => {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), "autosocial-fb-daemon-"));
  const daemon = new FacebookDaemonController({
    accountId: "test",
    queueDir: path.join(base, "pending"),
    postedDir: path.join(base, "posted"),
    failedDir: path.join(base, "failed"),
    statePath: path.join(base, "facebook-scheduler-state.json"),
  });

  const result = await daemon.setDailyTimes(["20:00", "13:00"]);

  assert.deepEqual(result.schedulePlan, { type: "daily-times", times: ["13:00", "20:00"] });
  daemon.stop();
});
