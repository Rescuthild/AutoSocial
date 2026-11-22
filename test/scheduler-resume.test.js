const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");

const { DaemonController } = require("../src/daemon-controller");
const { InstagramDaemonController } = require("../src/instagram-daemon-controller");
const { YouTubeDaemonController } = require("../src/youtube-daemon-controller");
const { FacebookDaemonController } = require("../src/facebook-daemon-controller");

const CONTROLLERS = {
  tiktok: DaemonController,
  instagram: InstagramDaemonController,
  youtube: YouTubeDaemonController,
  facebook: FacebookDaemonController,
};

async function makeOptions() {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), "autosocial-resume-"));
  for (const sub of ["pending", "posted", "failed"]) {
    await fs.mkdir(path.join(base, sub));
  }
  return {
    accountId: "test",
    queueDir: path.join(base, "pending"),
    postedDir: path.join(base, "posted"),
    failedDir: path.join(base, "failed"),
    statePath: path.join(base, "scheduler-state.json"),
  };
}

for (const [name, Controller] of Object.entries(CONTROLLERS)) {
  test(`${name} scheduler that was started resumes after a restart`, async () => {
    const options = await makeOptions();
    const first = new Controller(options);
    first.start();
    await first.setDailyTimes(["13:00", "20:00"]);
    first.task.stop();

    const restarted = new Controller(options);
    const status = await restarted.getStatus();

    assert.equal(status.running, true);
    assert.deepEqual(status.schedulePlan, { type: "daily-times", times: ["13:00", "20:00"] });
    restarted.stop();
  });

  test(`${name} scheduler that was stopped stays stopped after a restart`, async () => {
    const options = await makeOptions();
    const first = new Controller(options);
    first.start();
    await first.setDailyTimes(["13:00"]);
    first.stop();
    await first.setInstantPost(false);

    const restarted = new Controller(options);
    const status = await restarted.getStatus();

    assert.equal(status.running, false);
    restarted.stop();
  });
}
