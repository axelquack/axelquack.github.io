import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { inlineHtml, preparePublicArtifact } from "../scripts/encrypt.mjs";

const repo = join(dirname(fileURLToPath(import.meta.url)), "../..");
const dist = join(repo, "dist-garden");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
};

function serveDir(dir) {
  const server = createServer((req, res) => {
    const url = decodeURIComponent((req.url || "/").split("?")[0]);
    const rel = url === "/" ? "index.html" : url.replace(/^\/+/, "");
    const file = join(dir, rel);
    if (!file.startsWith(dir) || !existsSync(file)) {
      res.statusCode = 404;
      res.end("absent");
      return;
    }
    res.setHeader("content-type", MIME[extname(file)] || "application/octet-stream");
    res.end(readFileSync(file));
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function readTree(dir) {
  const chunks = [];
  function walk(current) {
    for (const name of readdirSync(current, { withFileTypes: true })) {
      const abs = join(current, name.name);
      if (name.isDirectory()) walk(abs);
      else chunks.push(readFileSync(abs, "utf8"));
    }
  }
  walk(dir);
  return chunks.join("\n");
}

test("vite garden build embeds published bodies; encrypted public artifact does not", async () => {
  const r = spawnSync("npm", ["run", "build:garden"], {
    cwd: repo,
    encoding: "utf8",
  });
  assert.equal(r.status, 0, r.stderr || r.stdout);
  const js = readFileSync(join(dist, "assets/garden.js"), "utf8");
  const css = readFileSync(join(dist, "assets/style.css"), "utf8");
  assert.match(js, /GARDEN_INDEX_BODY/);
  assert.match(js, /GARDEN_HOW_BODY/);
  assert.equal(js.includes("UNPUBLISHED_SECRET_BODY"), false);
  assert.equal(js.includes("NO_FLAG_BODY"), false);
  assert.match(css, /--bg:\s*#f7f7f7/i);
  assert.match(css, /--ink:\s*#0a0a0a/i);
  assert.match(css, /--font-display:\s*"Instrument Serif"/);
  assert.match(css, /--font-ui:\s*"Inter"/);
  assert.match(css, /--font-mono:\s*"IBM Plex Mono"/);
  assert.match(css, /\.landing-title/);
  assert.match(css, /\.frame-type/);
  assert.match(css, /#bg\s*\{/);
  assert.match(js, /#121212/);
  assert.match(js, /#f0f0f0/);
  assert.match(js, /data-slug/);

  const inlined = inlineHtml(
    readFileSync(join(dist, "index.html"), "utf8"),
    join(dist, "index.html"),
  );
  assert.match(inlined, /GARDEN_INDEX_BODY/);
  assert.match(inlined, /DOMContentLoaded/);
  assert.doesNotMatch(inlined, /type="module"/);
  assert.doesNotMatch(inlined, /src="\.\/assets\/garden\.js"/);

  const server = await serveDir(dist);
  try {
    const { port } = server.address();
    const jsRes = await fetch(`http://127.0.0.1:${port}/assets/garden.js`);
    assert.equal(jsRes.status, 200);
    const jsBody = await jsRes.text();
    assert.match(jsBody, /GARDEN_INDEX_BODY/);
    assert.equal(jsBody.includes("UNPUBLISHED_SECRET_BODY"), false);
    const missing = await fetch(`http://127.0.0.1:${port}/unpublished-secret`);
    assert.equal(missing.status, 404);
    const missingText = await missing.text();
    assert.equal(missingText.includes("UNPUBLISHED_SECRET_BODY"), false);
    assert.equal(missingText.includes("GARDEN_INDEX_BODY"), false);
  } finally {
    server.close();
  }

  const publicDir = mkdtempSync(join(tmpdir(), "garden-public-"));
  try {
    preparePublicArtifact({
      distDir: dist,
      publicDir,
      doEncrypt: true,
      sitePassword: "garden-test-pass",
    });
    const blob = readTree(publicDir);
    assert.equal(blob.includes("GARDEN_INDEX_BODY"), false);
    assert.equal(blob.includes("GARDEN_HOW_BODY"), false);
    assert.equal(blob.includes("GARDEN_PRESENCE_BODY"), false);
    assert.equal(blob.includes("GARDEN_GRAPH_BODY"), false);
    assert.equal(blob.includes("UNPUBLISHED_SECRET_BODY"), false);
    const html = readFileSync(join(publicDir, "index.html"), "utf8");
    assert.match(html, /staticrypt/i);
    assert.match(html, /noindex/);
    const names = readdirSync(publicDir);
    assert.ok(names.includes("index.html"));
    assert.ok(names.includes("CNAME"));
    assert.ok(names.includes("robots.txt"));
    assert.equal(names.includes("assets"), false);
  } finally {
    rmSync(publicDir, { recursive: true, force: true });
  }
});
