import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import svgr from "vite-plugin-svgr";
import monacoEditorPlugin from "vite-plugin-monaco-editor";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr({ svgrOptions: { icon: true } }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (monacoEditorPlugin as any).default({
      languageWorkers: ["json", "editorWorkerService"],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://qqlx.net",
        // target: "http://localhost:8080",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("proxyRes", (_, __, res) => {
            res.setHeader(
              "Access-Control-Allow-Origin",
              "http://localhost:5173",
            );
          });
        },
      },
    },
  },
});
