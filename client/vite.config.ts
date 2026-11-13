import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
// import multiServer from "vite-plugin-multiserver";
import svgr from "vite-plugin-svgr";
// import react, { reactCompilerPreset } from "@vitejs/plugin-react";
// import babel from "@rolldown/plugin-babel";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    reactRouter(),
    tailwindcss(),
    svgr(),
    // multiServer({ port: 5174 }),
    // react(),
    // babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  // base: "./", // Ensures relative paths for assets (js/css)
  // build: {
  //   outDir: "dist", // Standard output directory
  //   // ...
  // },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000", // resolved on the PC, not the phone
        changeOrigin: true,
        ws: true, // ← proxies the WebSocket too
      },
      "/client1": {
        target: "http://localhost:5174",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/app-a/, ""), // Remove the prefix
      },
      "/client2": {
        target: "http://localhost:5175",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/app-b/, ""),
      },
    },
  },
});
