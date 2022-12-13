import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/v2": "http://localhost:8084",
    },
  },
  build: { outDir: "build" },
});
