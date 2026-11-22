const test = require("node:test");
const assert = require("node:assert/strict");

const { _private } = require("../src/instagram-uploader");
const uiLabels = require("../src/platform-ui-labels");

test("a 9:16 video asks for the 9:16 crop instead of Instagram's square default", () => {
  assert.equal(_private.chooseCropOption(1080, 1920), "portrait");
  assert.equal(_private.chooseCropOption(720, 1280), "portrait");
});

test("any other shape keeps its own aspect ratio", () => {
  assert.equal(_private.chooseCropOption(1920, 1080), "original");
  assert.equal(_private.chooseCropOption(1080, 1350), "original");
  assert.equal(_private.chooseCropOption(1080, 1080), "original");
});

test("unknown dimensions give no crop choice", () => {
  assert.equal(_private.chooseCropOption(0, 0), null);
  assert.equal(_private.chooseCropOption(undefined, 1920), null);
});

test("crop is applied when the whole video fits inside the crop frame", () => {
  const frame = { width: 781, height: 824 };
  assert.equal(_private.isCropFitted({ width: 439, height: 781 }, frame), true);
});

test("crop is not applied while the video still overflows the frame", () => {
  const frame = { width: 781, height: 824 };
  assert.equal(_private.isCropFitted({ width: 781, height: 1389 }, frame), false);
  assert.equal(_private.isCropFitted(null, frame), false);
  assert.equal(_private.isCropFitted({ width: 0, height: 0 }, frame), false);
});

test("crop labels exist for the crop menu button and both options", () => {
  assert.ok(uiLabels.terms("instagramSelectCrop").includes("select crop"));
  assert.ok(uiLabels.terms("instagramCropPortrait").includes("9:16"));
  assert.ok(uiLabels.terms("instagramCropOriginal").includes("original"));
});
