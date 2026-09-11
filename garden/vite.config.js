import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildGarden } from "./src/publish/index.js";

const root = dirname(fileURLToPath(import.meta.url));
const vault = process.env.GARDEN_VAULT || resolve(root, "notes");

function gardenDataPlugin() {
  const virtual = "virtual:garden-data";
  const resolvedVirtual = `\0${virtual}`;

  function source() {
    const garden = buildGarden(vault, {
      siteTitle: "Garden",
      host: "garden.axelquack.de",
    });
    return `export default ${JSON.stringify(garden)};`;
  }

  return {
    name: "garden-data",
    resolveId(id) {
      if (id === virtual) return resolvedVirtual;
      return null;
    },
    load(id) {
      if (id === resolvedVirtual) return source();
      return null;
    },
    configureServer(server) {
      server.watcher.add(vault);
      const reload = (file) => {
        if (!String(file).startsWith(vault)) return;
        const mod = server.moduleGraph.getModuleById(resolvedVirtual);
        if (mod) server.reloadModule(mod);
      };
      server.watcher.on("change", reload);
      server.watcher.on("add", reload);
      server.watcher.on("unlink", reload);
    },
  };
}

export default defineConfig({
  root,
  base: "./",
  publicDir: resolve(root, "public"),
  plugins: [gardenDataPlugin()],
  build: {
    outDir: resolve(root, "../dist-garden"),
    emptyOutDir: true,
    assetsDir: "assets",
    sourcemap: false,
    target: "es2020",
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: "iife",
        inlineDynamicImports: true,
        entryFileNames: "assets/garden.js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
  server: {
    port: 5178,
    open: false,
    fs: { allow: [".."] },
  },
  preview: {
    port: 4178,
  },
});
