import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), svgr({ svgrOptions: { icon: true } })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://qqlx.net",
        // target: "http://10.0.0.5:8080",
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
