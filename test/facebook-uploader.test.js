const test = require("node:test");
const assert = require("node:assert/strict");

const { _private } = require("../src/facebook-uploader");

const { isExpectedPageProfile, isLoginUrl, extractProfileName, captionMatches } = _private;

test("page profile guard accepts the expected name case-insensitively", () => {
  assert.equal(isExpectedPageProfile("Mirelotta", "mirelotta"), true);
  assert.equal(isExpectedPageProfile("  Mirelotta ", "Mirelotta"), true);
});

test("page profile guard rejects a personal profile or an empty expected name", () => {
  assert.equal(isExpectedPageProfile("Mire Lotta", "Mirelotta"), false);
  assert.equal(isExpectedPageProfile("Mirelotta", ""), false);
  assert.equal(isExpectedPageProfile("", "Mirelotta"), false);
});

test("login and checkpoint urls are detected", () => {
  assert.equal(isLoginUrl("https://www.facebook.com/login/?next=x"), true);
  assert.equal(isLoginUrl("https://www.facebook.com/checkpoint/123"), true);
  assert.equal(isLoginUrl("https://m.facebook.com/login.php"), true);
  assert.equal(isLoginUrl("https://www.facebook.com/reels/create"), false);
});

test("profile name is read from the composer placeholder in Turkish and English", () => {
  assert.equal(extractProfileName("Ne d\u00fc\u015f\u00fcn\u00fcyorsun, Mirelotta?"), "Mirelotta");
  assert.equal(extractProfileName("What's on your mind, Mire Lotta?"), "Mire Lotta");
  assert.equal(extractProfileName("Reels videonu a\u00e7\u0131kla..."), "");
});

test("caption check ignores whitespace differences but not text changes", () => {
  const caption = "Ping neden?\n\nSpecial thanks and credit to: youtube.com/@evanciao\n\n#ping #oyun";
  assert.equal(captionMatches("Ping neden?\nSpecial thanks and credit to: youtube.com/@evanciao\n#ping  #oyun", caption), true);
  assert.equal(captionMatches("Ping neden?\nSpecial thanks and credit to: youtube.com/Evan Ciao\n#ping #oyun", caption), false);
});
