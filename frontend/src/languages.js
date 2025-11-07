/**
 * @param {boolean} isProduction
 * @returns {string[]}
 */
export default function getLanguages(isProduction) {
  /**
   * @typedef {string[]}
   */
  let languages = getLanguageFlags(isProduction).map((f) => f.lng);

  return languages;
}

/**
 * @param {boolean} isProduction
 * @returns {{lng:string; title:string; code: string; rtl?: boolean}[]}
 */
export function getLanguageFlags(isProduction) {
  /**
   * @typedef {{lng:string; title:string; code: string; rtl?: boolean; }[]}
   */
  let flags = [
    { lng: "en", title: "English", code: "EN" },
    { lng: "nl", title: "Nederlands", code: "NL" },
    { lng: "de", title: "Deutsch", code: "DE" },
    { lng: "fr", title: "Français", code: "FR" },
    { lng: "es", title: "Español", code: "ES" },
    { lng: "it", title: "Italiano", code: "IT" },
    { lng: "sv", title: "svenska", code: "SV" },
    { lng: "he", title: "עִברִית", code: "HE", rtl: true },
  ];
  if (!isProduction) {
    flags = flags.concat([
      { lng: "pt", title: "Português", code: "PT" },
      {
        lng: "ar",
        title: "العربية",
        code: "AR",
        rtl: true,
      },
    ]);
  }
  return flags;
}

/**
 *
 * @param {string} lang
 * @param {string} path
 * @returns string
 */
export function localizePath(lang, path) {
  if (/^\/[a-z]{2}\//.test(path)) {
    return path;
  }
  if (!path.startsWith("/")) {
    path = "/" + path;
  }
  return "/" + lang + path;
}
