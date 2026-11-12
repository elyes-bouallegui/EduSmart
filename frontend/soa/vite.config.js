import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/soap": {
        target: "http://localhost:3002",
        changeOrigin: true,
      },
    },
  },
});
