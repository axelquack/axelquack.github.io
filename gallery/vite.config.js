import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
  base: "/",
  publicDir: resolve(root, "public"),
  build: {
    outDir: resolve(root, "../dist-gallery"),
    emptyOutDir: true,
    assetsDir: "assets",
    sourcemap: false,
    target: "es2020",
    chunkSizeWarningLimit: 1500,
  },
  optimizeDeps: {
    include: ["aframe"],
  },
  server: {
    port: 5174,
    open: false,
    fs: { allow: [".."] },
  },
  preview: {
    port: 4174,
  },
});
