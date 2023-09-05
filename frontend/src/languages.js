/**
 * @param {boolean} isProduction
 * @returns {string[]}
 */
export default function getLanguages(isProduction) {
  /**
   * @typedef {string[]}
   */
  let languages = ["en", "nl", "de", "fr", "es", "sv", "he"];
  if (!isProduction) {
    languages = languages.concat(["it"]);
  }
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
    { lng: "sv", title: "svenska", flag: "/images/flags/se.svg" },
    { lng: "he", title: "עִברִית", flag: "/images/flags/il.svg", rtl: true },
  ];
  if (!isProduction) {
    flags = flags.concat([
      { lng: "it", title: "Italian", flag: "/images/flags/it.svg" },
    ]);
  }
  return flags;
}
