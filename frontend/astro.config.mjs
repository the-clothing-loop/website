import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import getLanguages from "./src/languages";

import reactI18next from "astro-react-i18next";

// https://astro.build/config
export default defineConfig({
  output: "static",
  site: import.meta.env.PUBLIC_BASE_URL,
  integrations: [
    reactI18next({
      defaultLocale: "en",
      locales: getLanguages(false),
      defaultNamespace: "translation",
      namespaces: [
        "about",
        "faq",
        "testimonials",
        "translation",
        "contribute",
        "survey",
      ],
      prefixDefaultLocale: true,
      // localesDir: "/locales/",
    }),
    react(),
    tailwind(),
  ],
  server: { port: 3000 },
  outDir: "build",
  // i18n: {
  //   defaultLocale: "en",
  //   locales: getLanguages(false),
  //   routing: {
  //     prefixDefaultLocale: true,
  //   },
  // },
  redirects: {
    "/": "/en/",
  },
  vite: {
    server: {
      proxy: {
        "/api": {
          target: "http://server:8084",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  },
});
