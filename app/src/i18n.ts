import i18next from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

const i18n = i18next
  .use(Backend)
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    load: "languageOnly",
    ns: ["translation", "faq"],
    supportedLngs: ["en", "nl"],
    lng: "nl",
    fallbackLng: "en",
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
  });

export default i18n;
