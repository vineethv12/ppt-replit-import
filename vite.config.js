import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";
import pptApiPlugin from "./server/api-middleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Load ALL .env vars (no prefix filter) and inject into process.env
  // so server-side middleware (api-middleware.js) can read them via process.env
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);

  const port = Number(process.env.PORT) || 5000;
  const basePath = process.env.BASE_PATH || "/";

  return {
  base: basePath,
  plugins: [react(), tailwindcss(), pptApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: __dirname,
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: true,
    allowedHosts: true,
    watch: {
      ignored: ["**/.local/**", "**/.cache/**", "**/.git/**", "**/node_modules/**"],
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: true,
  },
  };
});