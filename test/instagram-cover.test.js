const test = require("node:test");
const assert = require("node:assert/strict");

const { _private } = require("../src/instagram-uploader");

test("cover input filter accepts only the image-only cover picker", () => {
  assert.equal(_private.isCoverInputAccept("image/jpeg,image/png"), true);
});

test("cover input filter rejects the main media picker that also takes video", () => {
  assert.equal(
    _private.isCoverInputAccept("image/avif,image/jpeg,image/png,image/heic,image/heif,video/mp4,video/quicktime"),
    false
  );
  assert.equal(_private.isCoverInputAccept(""), false);
});
