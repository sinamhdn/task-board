import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { reactRouter } from "@react-router/dev/vite";
import babel from "@rolldown/plugin-babel";

// https://vite.dev/config/
export default defineConfig({
  base: "./", // Ensures relative paths for assets (js/css)
  build: {
    outDir: "dist", // Standard output directory
    // ...
  },
  plugins: [
    react(),
    reactRouter(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
});
