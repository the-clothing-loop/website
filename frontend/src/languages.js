/**
 * @param {boolean} isProduction
 * @returns {string[]}
 */
export default function getLanguages(isProduction) {
  /**
   * @typedef {string[]}
   */
  let languages = ["en", "nl", "de", "fr", "es", "sv"];
  if (!isProduction) {
    languages = languages.concat(["he", "it"]);
  }
  return languages;
}

/**
 * @param {boolean} isProduction
 * @returns {{lng:string; title:string; flag: string;}[]}
 */
export function getLanguageFlags(isProduction) {
  /**
   * @typedef {{lng:string; title:string; flag: string;}[]}
   */
  let flags = [
    { lng: "en", title: "English", flag: "/images/flags/gb.svg" },
    { lng: "nl", title: "Dutch", flag: "/images/flags/nl.svg" },
    { lng: "de", title: "German", flag: "/images/flags/de.svg" },
    { lng: "fr", title: "French", flag: "/images/flags/fr.svg" },
    { lng: "es", title: "Spanish", flag: "/images/flags/es.svg" },
    { lng: "sv", title: "Swedish", flag: "/images/flags/se.svg" },
  ];
  if (!isProduction) {
    flags = flags.concat([
      { lng: "it", title: "Italian", flag: "/images/flags/it.svg" },
      { lng: "he", title: "Hebrew", flag: "/images/flags/il.svg" },
    ]);
  }
  return flags;
}
