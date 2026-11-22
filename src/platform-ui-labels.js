// Localized third-party platform labels used only for browser automation selectors.
const LABELS = {
  create: ["create", "erstellen"],
  instagramPostFormat: ["post", "beitrag"],
  instagramReelFormat: ["reel", "reels"],
  instagramUploadTrigger: ["from computer", "select from computer", "vom computer", "ausw\u00e4hlen"],
  next: ["next", "weiter"],
  captionAttribute: ["caption", "beschreib"],
  share: ["share", "post", "publish", "teilen", "posten"],
  posted: ["shared", "posted", "geteilt", "ver\u00f6ffentlicht", "beitrag wurde geteilt"],
  error: ["error", "failed", "couldn't", "fehler", "nicht m\u00f6glich", "konnte nicht"],

  youtubeCreate: ["create", "erstellen"],
  youtubeUploadVideo: ["upload videos", "upload video", "videos hochladen", "video hochladen"],
  youtubeSelectFiles: ["select files", "dateien ausw\u00e4hlen"],
  youtubeTitleAttribute: ["title", "titel"],
  youtubeDescriptionAttribute: ["description", "beschreibung"],
  youtubeNotMadeForKids: [
    "not made for kids",
    "nicht fur kinder",
    "nicht f\u00fcr kinder",
    "nicht speziell fur kinder",
    "nicht speziell f\u00fcr kinder",
  ],
  youtubePublic: ["public", "\u00f6ffentlich"],
  youtubePublish: ["publish", "ver\u00f6ffentlichen"],
  youtubeSave: ["save", "speichern"],
  youtubePublished: ["published", "processing", "ver\u00f6ffentlicht", "verarbeitet"],

  tiktokSearchSounds: ["Search sounds", "Sounds suchen"],
  tiktokEdit: ["edit", "bearbeiten"],
  tiktokSounds: ["sound", "sounds", "audio"],
  tiktokText: ["text"],
  tiktokSave: ["Save", "Speichern"],
  tiktokCancel: ["Cancel", "Abbrechen"],
  tiktokShortContentCheck: ["short content check", "kurze inhaltsprufung", "kurze inhaltspr\u00fcfung"],
  tiktokEnable: ["enable", "turn on", "allow", "ok", "einschalten", "aktivieren"],
  tiktokContinue: ["got it", "continue", "verstanden", "weiter", "fortfahren"],
  tiktokLater: ["later", "not now", "skip", "spater", "spaeter", "sp\u00e4ter"],
  tiktokClose: ["cancel", "close", "abbrechen", "schliessen", "schlie\u00dfen"],
  tiktokPublish: ["publish", "post", "ver\u00f6ffentlichen", "veroeffentlichen", "publicar", "publier", "pubblica"],
  tiktokPublished: [
    "published",
    "posted",
    "success",
    "scheduled",
    "ver\u00f6ffentlicht",
    "veroeffentlicht",
    "erfolgreich",
    "geplant",
    "zur prufung eingereicht",
    "zur pr\u00fcfung eingereicht",
  ],
  tiktokFailed: [
    "failed",
    "error",
    "could not",
    "retry",
    "nicht moglich",
    "nicht m\u00f6glich",
    "fehlgeschlagen",
    "erneut versuchen",
  ],
  tiktokConfirm: [
    "publish",
    "post",
    "confirm",
    "continue",
    "ver\u00f6ffentlichen",
    "veroeffentlichen",
    "best\u00e4tigen",
    "bestaetigen",
    "fortfahren",
  ],
};

// Turkish labels. JavaScript's "i" flag does not fold "İ" to "i", so words
// that start with "İ" are listed in both forms.
const TURKISH_LABELS = {
  create: ["oluştur"],
  instagramPostFormat: ["gönderi"],
  instagramReelFormat: ["reels videosu"],
  instagramUploadTrigger: ["bilgisayardan seç", "bilgisayarından seç"],
  next: ["ileri", "İleri"],
  captionAttribute: ["açıklama", "altyazı"],
  share: ["paylaş"],
  posted: ["paylaşıldı", "yayınlandı"],
  error: ["hata", "başarısız", "yapılamadı", "bir sorun oluştu"],

  youtubeCreate: ["oluştur"],
  youtubeUploadVideo: ["video yükle", "videoları yükle"],
  youtubeSelectFiles: ["dosya seç", "dosyaları seç"],
  youtubeTitleAttribute: ["başlık"],
  youtubeDescriptionAttribute: ["açıklama"],
  youtubeNotMadeForKids: ["çocuklara özel değil", "çocuklar için yapılmadı"],
  youtubePublic: ["herkese açık"],
  youtubePublish: ["yayınla"],
  youtubeSave: ["kaydet"],
  youtubePublished: ["yayınlandı", "işleniyor"],

  tiktokSearchSounds: ["ses ara", "sesleri ara"],
  tiktokEdit: ["düzenle"],
  tiktokSounds: ["ses", "sesler"],
  tiktokText: ["metin"],
  tiktokSave: ["Kaydet"],
  tiktokCancel: ["İptal", "iptal"],
  tiktokShortContentCheck: ["içerik kontrolü", "içerik denetimi"],
  tiktokEnable: ["etkinleştir", "izin ver", "tamam"],
  tiktokContinue: ["anladım", "devam"],
  tiktokLater: ["daha sonra", "şimdi değil", "atla"],
  tiktokClose: ["İptal", "iptal", "kapat"],
  tiktokPublish: ["yayınla", "paylaş"],
  tiktokPublished: ["yayınlandı", "paylaşıldı", "başarılı", "planlandı", "incelemeye gönderildi"],
  tiktokFailed: ["başarısız", "hata", "yapılamadı", "tekrar dene"],
  tiktokConfirm: ["yayınla", "paylaş", "onayla", "devam"],
};

// Facebook Reels composer (facebook.com/reels/create), English + Turkish.
const FACEBOOK_LABELS = {
  facebookClose: ["close", "kapat"],
  facebookNext: ["next", "ileri", "İleri"],
  facebookPublish: ["post", "share", "publish", "gönderi", "paylaş", "yayınla"],
  facebookCaptionBox: ["describe your reel", "reels videonu açıkla"],
  facebookPublished: [
    "published",
    "shared",
    "posted",
    "paylaşıldı",
    "yayınlandı",
    "yayınlanıyor",
  ],
  facebookError: ["something went wrong", "couldn't", "failed", "bir sorun", "başarısız", "yapılamadı"],
};

for (const [key, values] of Object.entries({ ...TURKISH_LABELS, ...FACEBOOK_LABELS })) {
  LABELS[key] = [...(LABELS[key] || []), ...values];
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function terms(...keys) {
  return keys.flatMap((key) => LABELS[key] || []);
}

function pattern(...keys) {
  const values = terms(...keys);
  if (values.length === 0) {
    throw new Error(`No platform UI labels configured for: ${keys.join(", ")}`);
  }
  return new RegExp(values.map(escapeRegExp).join("|"), "i");
}

function textSelector(selector, ...keys) {
  return terms(...keys)
    .map((value) => `${selector}:has-text("${value.replace(/"/g, '\\"')}")`)
    .join(", ");
}

function attrSelector(selector, attr, ...keys) {
  return terms(...keys)
    .map((value) => `${selector}[${attr}*="${value.replace(/"/g, '\\"')}" i]`)
    .join(", ");
}

module.exports = {
  attrSelector,
  pattern,
  terms,
  textSelector,
};
