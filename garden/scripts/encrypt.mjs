#!/usr/bin/env node
/**
 * Inline the Vite garden build into one HTML file, then optionally encrypt
 * it with StatiCrypt so GitHub Pages serves ciphertext (no plaintext note
 * bodies in HTML/JS/JSON).
 */
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo = join(root, "..");
const dist = join(repo, "dist-garden");
const publicDist = join(repo, "dist-garden-public");
const template = join(root, "templates/password.html");
const encrypt = process.argv.includes("--encrypt");
const password =
  process.env.GARDEN_SITE_PASSWORD ||
  process.env.SITE_PASSWORD ||
  "garden";

const MIME = {
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".woff2": "font/woff2",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function dataUri(abs) {
  const buf = readFileSync(abs);
  const mime = MIME[extname(abs).toLowerCase()] || "application/octet-stream";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

function resolveFrom(fromFile, url) {
  if (/^(data:|https?:|mailto:|#|javascript:)/i.test(url)) return null;
  const clean = url.split("?")[0].split("#")[0];
  return join(dirname(fromFile), clean);
}

export function inlineHtml(html, htmlFile) {
  let out = html;
  out = out.replace(
    /<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,
    (full, href) => {
      const abs = resolveFrom(htmlFile, href);
      if (!abs || !existsSync(abs)) return full;
      const css = readFileSync(abs, "utf8");
      return `<style>\n${css}\n</style>`;
    },
  );
  out = out.replace(
    /<script([^>]*) src="([^"]+)"([^>]*)><\/script>/g,
    (full, pre, src, post) => {
      const abs = resolveFrom(htmlFile, src);
      if (!abs || !existsSync(abs)) return full;
      const code = readFileSync(abs, "utf8");
      // Classic script: StatiCrypt re-injects decrypted markup in a way that
      // may not execute type=module. main.js waits for DOMContentLoaded.
      const attrs = `${pre} ${post}`
        .replace(/\s+type="module"/g, "")
        .replace(/\s+crossorigin(="[^"]*")?/g, "")
        .trim();
      return `<script${attrs ? ` ${attrs}` : ""}>\n${code}\n</script>`;
    },
  );
  out = out.replace(
    /(href|src)="([^"]+\.(?:ico|png|jpe?g|svg|woff2))"/gi,
    (full, attr, url) => {
      const abs = resolveFrom(htmlFile, url);
      if (!abs || !existsSync(abs)) return full;
      try {
        return `${attr}="${dataUri(abs)}"`;
      } catch {
        return full;
      }
    },
  );
  return out;
}

function keepName(name) {
  return (
    name === "CNAME" ||
    name === "robots.txt" ||
    name === ".nojekyll" ||
    name === "favicon.ico" ||
    name === "favicon.svg" ||
    name === "apple-touch-icon.png" ||
    name === "index.html"
  );
}

export function sweepPlaintextAssets(dir) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    const st = statSync(abs);
    if (st.isDirectory()) {
      rmSync(abs, { recursive: true, force: true });
      continue;
    }
    if (!keepName(name)) rmSync(abs, { force: true });
  }
}

export function encryptHtmlFile({
  plainPath,
  outDir,
  sitePassword,
  templatePath,
}) {
  const staged = join(outDir, "_plain");
  mkdirSync(staged, { recursive: true });
  copyFileSync(plainPath, join(staged, "index.html"));
  const args = [
    join(repo, "node_modules/staticrypt/cli/index.js"),
    join(staged, "index.html"),
    "-p",
    sitePassword,
    "-d",
    outDir,
    "-t",
    templatePath,
    "--short",
    "--remember",
    "14",
    "--template-title",
    "Garden",
    "--template-instructions",
    "Password",
    "--template-placeholder",
    "Password",
    "--template-button",
    "Enter",
    "--template-error",
    "Wrong password.",
    "--template-remember",
    "Remember",
    "--template-color-primary",
    "#0a0a0a",
    "--template-color-secondary",
    "#f7f7f7",
  ];
  const r = spawnSync(process.execPath, args, {
    stdio: "inherit",
    cwd: repo,
    env: { ...process.env, STATICRYPT_PASSWORD: sitePassword },
  });
  rmSync(staged, { recursive: true, force: true });
  if (r.status !== 0) {
    throw new Error("staticrypt failed");
  }
}

function runBuild() {
  const r = spawnSync(
    process.execPath,
    [
      join(repo, "node_modules/vite/bin/vite.js"),
      "build",
      "--config",
      join(root, "vite.config.js"),
    ],
    { stdio: "inherit", cwd: repo, env: process.env },
  );
  if (r.status !== 0) {
    throw new Error("vite garden build failed");
  }
}

export function preparePublicArtifact({
  distDir = dist,
  publicDir = publicDist,
  doEncrypt = encrypt,
  sitePassword = password,
} = {}) {
  const htmlPath = join(distDir, "index.html");
  if (!existsSync(htmlPath)) {
    throw new Error(`missing ${htmlPath}; run the garden Vite build first`);
  }
  rmSync(publicDir, { recursive: true, force: true });
  mkdirSync(publicDir, { recursive: true });
  cpSync(distDir, publicDir, { recursive: true });
  const pubHtml = join(publicDir, "index.html");
  const bundled = inlineHtml(readFileSync(pubHtml, "utf8"), pubHtml);
  writeFileSync(join(publicDir, "index.plain.html"), bundled);
  writeFileSync(join(publicDir, ".nojekyll"), "");
  if (!doEncrypt) {
    writeFileSync(pubHtml, bundled);
    console.log("Wrote unencrypted inlined dist-garden-public/index.html");
    return { encrypted: false, distDir, publicDir };
  }
  encryptHtmlFile({
    plainPath: join(publicDir, "index.plain.html"),
    outDir: publicDir,
    sitePassword,
    templatePath: template,
  });
  rmSync(join(publicDir, "index.plain.html"), { force: true });
  sweepPlaintextAssets(publicDir);
  console.log("Wrote encrypted dist-garden-public/index.html");
  return { encrypted: true, distDir, publicDir };
}

function main() {
  runBuild();
  preparePublicArtifact();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}
