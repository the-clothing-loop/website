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
 * @returns {{lng:string; title:string; flag: string; rtl?: boolean}[]}
 */
export function getLanguageFlags(isProduction) {
  /**
   * @typedef {{lng:string; title:string; flag: string; rtl?: boolean; }[]}
   */
  let flags = [
    { lng: "en", title: "English", flag: "/images/flags/gb.svg" },
    { lng: "nl", title: "Nederlands", flag: "/images/flags/nl.svg" },
    { lng: "de", title: "Deutsch", flag: "/images/flags/de.svg" },
    { lng: "fr", title: "Français", flag: "/images/flags/fr.svg" },
    { lng: "es", title: "Español", flag: "/images/flags/es.svg" },
    { lng: "it", title: "Italiano", flag: "/images/flags/it.svg" },
    { lng: "sv", title: "svenska", flag: "/images/flags/se.svg" },
    { lng: "he", title: "עִברִית", flag: "/images/flags/il.svg", rtl: true },
  ];
  if (!isProduction) {
    flags = flags.concat([
      { lng: "pt", title: "Português", flag: "/images/flags/pt.svg" },
      {
        lng: "ar",
        title: "العربية",
        flag: "/images/flags/hejaz.svg",
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
