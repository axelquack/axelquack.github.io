import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { after, describe, test } from "node:test";
import {
  buildGarden,
  evaluateDataview,
  extractWikilinks,
  findNote,
  isPublished,
  pageList,
  parseDataview,
  parseFrontmatter,
  scanVault,
  searchNotes,
  selectPublished,
} from "../src/publish/index.js";

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "fixtures");
const temps = [];

function tempVault(prefix = "garden-test-") {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  temps.push(dir);
  return dir;
}

after(() => {
  for (const dir of temps) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function slugs(garden) {
  return garden.notes.map((n) => n.slug).sort();
}

describe("frontmatter and published flag", () => {
  test("isPublished is true only for published: true", () => {
    assert.equal(isPublished({ published: true }), true);
    assert.equal(isPublished({ published: "true" }), true);
    assert.equal(isPublished({ published: false }), false);
    assert.equal(isPublished({}), false);
    assert.equal(isPublished({ published: "false" }), false);
  });

  test("parseFrontmatter reads YAML and leaves the markdown body", () => {
    const raw = readFileSync(join(FIXTURES, "published-alpha.md"), "utf8");
    const { data, body } = parseFrontmatter(raw);
    assert.equal(data.published, true);
    assert.equal(data.slug, "alpha");
    assert.match(body, /ALPHA_BODY_DISTINCTIVE/);
    assert.doesNotMatch(body, /^---/);
  });
});

describe("scan and select", () => {
  test("scanVault sees every fixture note; only published: true are selected", () => {
    const all = scanVault(FIXTURES);
    const names = all.map((n) => n.stem).sort();
    assert.deepEqual(names, [
      "callout-embed",
      "dataview-index",
      "no-flag",
      "published-alpha",
      "published-beta",
      "unpublished-secret",
    ]);
    const published = selectPublished(all);
    assert.deepEqual(published.map((n) => n.slug).sort(), [
      "alpha",
      "beta",
      "callouts",
      "catalog",
    ]);
    assert.equal(published.some((n) => n.slug === "unpublished-secret"), false);
    assert.equal(published.some((n) => n.slug === "no-flag"), false);
  });
});

describe("buildGarden", () => {
  const garden = buildGarden(FIXTURES);

  test("page list, search, and graph contain only published notes", () => {
    assert.deepEqual(slugs(garden), ["alpha", "beta", "callouts", "catalog"]);
    assert.deepEqual(pageList(garden).map((p) => p.slug).sort(), [
      "alpha",
      "beta",
      "callouts",
      "catalog",
    ]);
    assert.deepEqual(garden.graph.nodes.map((n) => n.slug).sort(), [
      "alpha",
      "beta",
      "callouts",
      "catalog",
    ]);
    const secretHits = searchNotes(garden.notes, "UNPUBLISHED_SECRET_BODY");
    assert.equal(secretHits.length, 0);
    const flagHits = searchNotes(garden.notes, "NO_FLAG_BODY");
    assert.equal(flagHits.length, 0);
    const alphaHits = searchNotes(garden.notes, "Alpha Essay");
    assert.equal(alphaHits.length, 1);
    assert.equal(alphaHits[0].slug, "alpha");
    const bodyHits = searchNotes(garden.notes, "ALPHA_BODY_DISTINCTIVE");
    assert.equal(bodyHits.length, 1);
  });

  test("unpublished bodies never appear in the garden index", () => {
    const blob = JSON.stringify(garden);
    assert.equal(blob.includes("UNPUBLISHED_SECRET_BODY"), false);
    assert.equal(blob.includes("NO_FLAG_BODY"), false);
    assert.equal(blob.includes("ALPHA_BODY_DISTINCTIVE"), true);
  });

  test("wikilinks resolve to the published slug, including alias and heading", () => {
    const alpha = findNote(garden, "alpha");
    assert.ok(alpha);
    const links = extractWikilinks(alpha.markdown);
    assert.equal(links.some((l) => l.target === "published-beta" && l.alias === "the beta note"), true);
    assert.equal(links.some((l) => l.target === "published-beta" && l.heading === "Section"), true);
    assert.match(alpha.html, /href="#\/beta"/);
    assert.match(alpha.html, />the beta note</);
    assert.match(alpha.html, /href="#\/beta#section"/);
    assert.doesNotMatch(alpha.html, /href="#\/unpublished-secret"/);
    assert.match(alpha.html, /wiki-missing[^>]*data-target="unpublished-secret"/);
    const outSlugs = alpha.outgoing.map((l) => l.slug);
    assert.ok(outSlugs.includes("beta"));
    assert.equal(outSlugs.includes("unpublished-secret"), false);
  });

  test("backlinks list the linking published note", () => {
    const beta = findNote(garden, "beta");
    const alpha = findNote(garden, "alpha");
    assert.ok(beta.backlinks.some((b) => b.slug === "alpha"));
    assert.ok(alpha.backlinks.some((b) => b.slug === "beta"));
    assert.equal(
      beta.backlinks.some((b) => b.slug === "unpublished-secret"),
      false,
    );
  });

  test("graph edges match published wikilinks", () => {
    const pairs = garden.graph.edges.map((e) => `${e.source}->${e.target}`).sort();
    assert.ok(pairs.includes("alpha->beta"));
    assert.ok(pairs.includes("beta->alpha"));
    assert.ok(pairs.includes("callouts->alpha"));
    assert.equal(pairs.some((p) => p.includes("unpublished")), false);
    const alphaNode = garden.graph.nodes.find((n) => n.slug === "alpha");
    assert.ok(alphaNode.degree >= 2);
  });

  test("callout HTML contains the callout type and body", () => {
    const note = findNote(garden, "callouts");
    assert.match(note.html, /data-callout="note"/);
    assert.match(note.html, /CALLOUT_BODY_TEXT/);
    assert.match(note.html, /data-callout="summary"/);
    assert.match(note.html, /data-callout="tip"/);
    assert.match(note.html, /data-callout="warning"/);
    assert.match(note.html, /data-callout="todo"/);
  });

  test("published embeds transclude the target body", () => {
    const note = findNote(garden, "callouts");
    assert.match(note.html, /data-embed-slug="alpha"/);
    assert.match(note.html, /ALPHA_BODY_DISTINCTIVE/);
    assert.match(note.html, /class="embed-image"/);
  });

  test("Dataview TABLE WHERE rows are exactly the matching published notes", () => {
    const catalog = findNote(garden, "catalog");
    const parsed = parseDataview(`TABLE title, type, status
FROM ""
WHERE type = "essay"`);
    const result = evaluateDataview(parsed, garden.notes);
    assert.equal(result.type, "table");
    assert.deepEqual(
      result.rows.map((r) => r.slug),
      ["alpha"],
    );
    assert.equal(
      result.rows.some((r) => r.slug === "unpublished-secret"),
      false,
    );
    assert.match(catalog.html, /data-dataview="table"/);
    assert.match(catalog.html, /data-slug="alpha"/);
    const essayRows = catalog.html.match(
      /data-dataview="table"[\s\S]*?<\/table>/,
    )[0];
    assert.match(essayRows, /data-slug="alpha"/);
    assert.doesNotMatch(essayRows, /data-slug="beta"/);
    assert.doesNotMatch(essayRows, /Secret Draft/);

    const list = evaluateDataview(
      `LIST
FROM ""
WHERE status = "active"`,
      garden.notes,
    );
    const listSlugs = list.rows.map((r) => r.slug).sort();
    assert.deepEqual(listSlugs, ["alpha", "beta", "callouts", "catalog"]);
    assert.match(catalog.html, /data-dataview="list"/);
  });
});

describe("published flag flip", () => {
  test("flipping a fixture note to published: true includes it; flipping off excludes it", () => {
    const dir = tempVault();
    const src = readFileSync(join(FIXTURES, "unpublished-secret.md"), "utf8");
    writeFileSync(join(dir, "unpublished-secret.md"), src);
    writeFileSync(
      join(dir, "published-alpha.md"),
      readFileSync(join(FIXTURES, "published-alpha.md"), "utf8"),
    );

    const off = buildGarden(dir);
    assert.deepEqual(slugs(off), ["alpha"]);
    assert.equal(JSON.stringify(off).includes("UNPUBLISHED_SECRET_BODY"), false);

    writeFileSync(join(dir, "unpublished-secret.md"), src.replace("published: false", "published: true"));
    const on = buildGarden(dir);
    assert.deepEqual(slugs(on), ["alpha", "unpublished-secret"]);
    const secret = findNote(on, "unpublished-secret");
    assert.match(secret.html, /UNPUBLISHED_SECRET_BODY/);
    assert.ok(searchNotes(on.notes, "UNPUBLISHED_SECRET_BODY").length === 1);
    assert.ok(on.graph.nodes.some((n) => n.slug === "unpublished-secret"));

    writeFileSync(join(dir, "unpublished-secret.md"), src.replace("published: false", "published: false"));
    const offAgain = buildGarden(dir);
    assert.deepEqual(slugs(offAgain), ["alpha"]);
    assert.equal(findNote(offAgain, "unpublished-secret"), null);
  });
});

describe("demo garden notes", () => {
  const notesDir = join(dirname(fileURLToPath(import.meta.url)), "../notes");
  const demo = buildGarden(notesDir);

  test("index wikilinks resolve to published slugs including presence", () => {
    const index = findNote(demo, "index");
    assert.ok(index);
    assert.match(index.html, /GARDEN_INDEX_BODY/);
    assert.match(index.html, /href="#\/presence"/);
    assert.match(index.html, /data-slug="presence"/);
    assert.match(index.html, /href="#\/how-this-garden-works"/);
    assert.match(index.html, /href="#\/graph"/);
    assert.equal(index.html.includes("UNPUBLISHED_SECRET_BODY"), false);
  });

  test("presence note HTML has body plus note/summary/warning/todo callouts", () => {
    const presence = findNote(demo, "presence");
    assert.ok(presence);
    assert.match(presence.html, /GARDEN_PRESENCE_BODY/);
    assert.match(presence.html, /data-callout="note"/);
    assert.match(presence.html, /data-callout="summary"/);
    assert.match(presence.html, /data-callout="warning"/);
    assert.match(presence.html, /data-callout="todo"/);
    assert.match(presence.html, /<h1[^>]*>Presence<\/h1>/);
  });
});
