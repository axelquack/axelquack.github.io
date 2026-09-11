import { resolveGraph } from "./links.js";
import { extractOutline, previewText, renderNote } from "./render.js";
import { scanVault, selectPublished } from "./scan.js";
import { formatFmValue } from "./util.js";

const PUBLIC_FIELDS = [
  "title",
  "slug",
  "type",
  "tags",
  "status",
  "date",
  "description",
  "published",
];

function publicFrontmatter(data) {
  const out = {};
  for (const key of PUBLIC_FIELDS) {
    if (data[key] != null) out[key] = formatFmValue(data[key]);
  }
  return out;
}

function navSort(a, b) {
  const ap = a.path === "index.md" || a.slug === "index" ? 0 : 1;
  const bp = b.path === "index.md" || b.slug === "index" ? 0 : 1;
  if (ap !== bp) return ap - bp;
  return a.title.localeCompare(b.title);
}

/**
 * Scan a vault, keep `published: true` notes, resolve links, render HTML.
 * Unpublished bodies never enter the returned garden object.
 */
export function buildGarden(vaultDir, options = {}) {
  const all = scanVault(vaultDir);
  const published = selectPublished(all);
  const { catalog, outgoing, backlinks, graph } = resolveGraph(published);

  const notes = published.map((note) => {
    const html = renderNote(note, {
      catalog,
      published,
      vaultDir,
      outgoing,
      embedStack: new Set([note.slug]),
    });
    const fm = publicFrontmatter(note.data);
    const back = (backlinks.get(note.slug) || []).map((b) => ({
      slug: b.slug,
      title: b.title,
    }));
    const out = (outgoing.get(note.slug) || []).map((l) => ({
      slug: l.slug,
      title: l.title,
      alias: l.alias,
      heading: l.heading,
      embed: l.embed,
    }));
    return {
      slug: note.slug,
      title: note.title,
      path: note.path,
      frontmatter: fm,
      published: true,
      markdown: note.body,
      html,
      outline: extractOutline(note.body),
      backlinks: back,
      outgoing: out,
      preview: previewText(note.body),
      searchText: `${note.title}\n${note.body}`,
    };
  });

  const navigation = notes
    .map((n) => ({ slug: n.slug, title: n.title, path: n.path }))
    .sort(navSort);

  return {
    site: {
      title: options.siteTitle || "Garden",
      host: options.host || "garden.axelquack.de",
    },
    notes,
    navigation,
    graph,
    generatedAt: options.now || null,
  };
}

export function findNote(garden, slug) {
  if (!slug) return null;
  const key = String(slug).toLowerCase();
  return garden.notes.find((n) => n.slug === key) || null;
}

export function pageList(garden) {
  return garden.navigation;
}
