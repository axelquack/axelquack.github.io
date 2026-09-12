import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const gardenCss = readFileSync(join(here, "../src/style.css"), "utf8");
const tokensCss = readFileSync(join(here, "../../src/tokens.css"), "utf8");

test("garden stylesheet imports presence tokens", () => {
  assert.match(gardenCss, /@import\s+"\.\.\/\.\.\/src\/tokens\.css"/);
  assert.match(tokensCss, /--bg:\s*#f7f7f7/);
  assert.match(tokensCss, /--ink:\s*#0a0a0a/);
  assert.match(tokensCss, /--font-display:\s*"Instrument Serif"/);
  assert.match(tokensCss, /--font-ui:\s*"Inter"/);
  assert.match(tokensCss, /--font-mono:\s*"IBM Plex Mono"/);
  assert.match(gardenCss, /#bg\s*\{/);
  assert.match(gardenCss, /\.landing-title/);
  assert.match(gardenCss, /\.frame-type/);
  assert.match(gardenCss, /--text-display-xl/);
  assert.match(gardenCss, /--bg-inverse/);
});
