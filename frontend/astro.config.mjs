import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import astroI18next from "astro-i18next";
import tailwind from "@astrojs/tailwind";
import sentry from "@sentry/astro";

const BASE_URL = import.meta.env.PUBLIC_BASE_URL;
const sentryEnv =
  BASE_URL === "https://www.clothingloop.org"
    ? "production"
    : BASE_URL === "https://acc.clothingloop.org"
      ? "qa"
      : "dev";

// https://astro.build/config
export default defineConfig({
  output: "static",
  site: BASE_URL,
  integrations: [
    react(),
    astroI18next(),
    tailwind(),
    sentry({
      dsn: "https://4728b06e8f498ef563db2811cde028b1@o4506932463730688.ingest.us.sentry.io/4506936391565312",
      environment: sentryEnv,
      tracesSampleRate: 0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      tracePropagationTargets: [
        "localhost",
        /^https:\/\/[\w\.]+\.clothingloop\.org\//,
      ],
    }),
  ],
  server: {
    port: 3000,
  },
  outDir: "build",
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
