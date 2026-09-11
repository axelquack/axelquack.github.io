import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";
import { parseFrontmatter } from "./frontmatter.js";
import { slugify, toPosix } from "./util.js";

const SKIP_DIRS = new Set([".git", ".obsidian", "node_modules", "dist", ".vite"]);

/** Canonical publish flag: YAML `published: true` (boolean or the string "true"). */
export function isPublished(data) {
  const value = data?.published;
  return value === true || value === "true";
}

export function noteSlug(data, relPath) {
  const fromFm = data?.slug != null && String(data.slug).trim();
  if (fromFm) return slugify(fromFm);
  const stem = basename(relPath, extname(relPath));
  return slugify(stem);
}

export function noteTitle(data, body, relPath) {
  if (data?.title != null && String(data.title).trim()) return String(data.title).trim();
  const heading = String(body || "").match(/^#\s+(.+)$/m);
  if (heading) return heading[1].trim();
  return basename(relPath, extname(relPath));
}

export function loadNote(root, absPath) {
  const raw = readFileSync(absPath, "utf8");
  const { data, body } = parseFrontmatter(raw);
  const path = toPosix(relative(root, absPath));
  const filename = basename(absPath);
  const stem = basename(filename, extname(filename));
  return {
    path,
    filename,
    stem,
    absPath,
    raw,
    data: data || {},
    body,
    published: isPublished(data),
    slug: noteSlug(data, path),
    title: noteTitle(data, body, path),
  };
}

function walkMarkdown(root, dir, out) {
  let entries = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (name.startsWith(".") || SKIP_DIRS.has(name)) continue;
    const abs = join(dir, name);
    let st;
    try {
      st = statSync(abs);
    } catch {
      continue;
    }
    if (st.isDirectory()) walkMarkdown(root, abs, out);
    else if (extname(name).toLowerCase() === ".md") out.push(abs);
  }
}

/** Walk a vault-style directory and return every markdown note (published and not). */
export function scanVault(root) {
  const files = [];
  walkMarkdown(root, root, files);
  files.sort((a, b) => a.localeCompare(b));
  return files.map((abs) => loadNote(root, abs));
}

export function selectPublished(notes) {
  return notes.filter((n) => n.published);
}
