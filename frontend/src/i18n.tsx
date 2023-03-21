import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

const IS_PRODUCTION =
  import.meta.env.VITE_BASE_URL === "https://www.clothingloop.org";

let supportedLngs = ["en", "nl", "de", "fr", "es", "sv"];
if (!IS_PRODUCTION) {
  supportedLngs = ["en", "nl", "de", "fr", "es", "sv"];
}

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs,
    fallbackLng: "en",
    debug: false,
    detection: {
      order: ["path", "cookie"],
      caches: ["cookie"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
