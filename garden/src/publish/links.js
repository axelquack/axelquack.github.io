import { headingId, isImageTarget, slugify, stripCode } from "./util.js";

export const WIKI_RE =
  /(!)?\[\[([^\]|#\n]+)(?:#([^\]|\n]+))?(?:\|([^\]]+))?\]\]/g;

export function extractWikilinks(body) {
  const out = [];
  const re = new RegExp(WIKI_RE.source, "g");
  const source = stripCode(body);
  let match;
  while ((match = re.exec(source))) {
    out.push({
      raw: match[0],
      embed: Boolean(match[1]),
      target: match[2].trim(),
      heading: match[3] ? match[3].trim() : null,
      alias: match[4] ? match[4].trim() : null,
    });
  }
  return out;
}

export function noteKeys(note) {
  const keys = new Set();
  const add = (value) => {
    if (value == null) return;
    const s = String(value).trim().toLowerCase();
    if (s) keys.add(s);
  };
  add(note.slug);
  add(note.stem);
  add(note.title);
  add(note.path.replace(/\.md$/i, ""));
  add(note.filename?.replace(/\.md$/i, ""));
  const posix = String(note.path || "").replace(/\.md$/i, "");
  const slash = posix.lastIndexOf("/");
  if (slash >= 0) add(posix.slice(slash + 1));
  return keys;
}

export function buildCatalog(notes) {
  const byKey = new Map();
  for (const note of notes) {
    for (const key of noteKeys(note)) {
      if (!byKey.has(key)) byKey.set(key, note);
    }
  }
  return byKey;
}

export function resolveTarget(catalog, target) {
  if (!target) return null;
  const key = String(target).trim().toLowerCase();
  if (!key) return null;
  return catalog.get(key) || catalog.get(slugify(key)) || null;
}

export function headingAnchor(heading) {
  if (!heading) return "";
  return headingId(heading);
}

/**
 * Resolve wikilinks among published notes only.
 * Unpublished targets do not become pages, edges, or backlinks.
 */
export function resolveGraph(publishedNotes) {
  const catalog = buildCatalog(publishedNotes);
  const outgoing = new Map();
  const backlinks = new Map();
  const edgeSet = new Set();
  const edges = [];

  for (const note of publishedNotes) {
    outgoing.set(note.slug, []);
    backlinks.set(note.slug, []);
  }

  for (const note of publishedNotes) {
    const seen = new Set();
    const links = [];
    for (const wiki of extractWikilinks(note.body)) {
      if (isImageTarget(wiki.target)) continue;
      const target = resolveTarget(catalog, wiki.target);
      if (!target || target.slug === note.slug) continue;
      const rec = {
        slug: target.slug,
        title: target.title,
        alias: wiki.alias,
        heading: wiki.heading,
        embed: wiki.embed,
      };
      links.push(rec);
      if (seen.has(target.slug)) continue;
      seen.add(target.slug);
      const key = `${note.slug}\t${target.slug}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push({ source: note.slug, target: target.slug });
      }
      backlinks.get(target.slug).push({
        slug: note.slug,
        title: note.title,
      });
    }
    outgoing.set(note.slug, links);
  }

  const degree = new Map(publishedNotes.map((n) => [n.slug, 0]));
  for (const edge of edges) {
    degree.set(edge.source, (degree.get(edge.source) || 0) + 1);
    degree.set(edge.target, (degree.get(edge.target) || 0) + 1);
  }

  const graph = {
    nodes: publishedNotes.map((n) => ({
      slug: n.slug,
      title: n.title,
      degree: degree.get(n.slug) || 0,
    })),
    edges,
  };

  return { catalog, outgoing, backlinks, graph };
}
