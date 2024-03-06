import getLanguages from "./src/languages.js";

const languages = getLanguages(false);

/** @type {import('astro-i18next').AstroI18nextConfig} */
export default {
  locales: languages,
  namespaces: ["about", "faq", "testimonials", "translation", "contribute"],
  defaultNamespace: "translation",
  load: ["server", "client"], // load i18next server and client side
  i18nextServerPlugins: {
    "{initReactI18next}": "react-i18next",
  },
  i18nextClientPlugins: {
    "{initReactI18next}": "react-i18next",
  },
  i18nextClient: {
    fallbackLng: "en",
    debug: false,
    cleanCode: true,
  },
};
