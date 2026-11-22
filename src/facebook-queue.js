const { config } = require("./config");
const queue = require("./queue");

// Facebook uses the shared queue logic; only the default folder differs.
async function getNextQueuedItem(queueDir) {
  return queue.getNextQueuedItem(queueDir || config.facebookQueueDir);
}

module.exports = {
  getNextQueuedItem,
  getCaptionPaths: queue.getCaptionPaths,
};
