import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig((mode) => {
  const env = loadEnv(mode as any, process.cwd(), "");
  const IS_DOCKER = env.VITE_DOCKER === "true";

  return {
    plugins: [react(), VitePWA({ registerType: "autoUpdate" })],
    server: {
      proxy: {
        "/api": {
          target: IS_DOCKER ? "http://server:8084" : "http://127.0.0.1:8084",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    build: { outDir: "build" },
  };
});
