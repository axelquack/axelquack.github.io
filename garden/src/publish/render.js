import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { marked } from "marked";
import { renderDataview } from "./dataview.js";
import { headingAnchor, resolveTarget, WIKI_RE } from "./links.js";
import {
  escapeAttr,
  escapeHtml,
  headingId,
  isImageTarget,
  mimeFromExt,
} from "./util.js";

marked.setOptions({
  gfm: true,
  breaks: false,
});

const CALLOUT_TYPES = new Set([
  "note",
  "summary",
  "abstract",
  "info",
  "tip",
  "hint",
  "warning",
  "caution",
  "todo",
  "bug",
  "example",
  "quote",
  "question",
  "success",
  "failure",
  "danger",
  "error",
]);

export function extractOutline(body) {
  const outline = [];
  const lines = String(body || "").split(/\r?\n/);
  let inFence = false;
  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = line.match(/^(#{1,6})\s+(.+)$/);
    if (!m) continue;
    const text = m[2].replace(/\s+#+\s*$/, "").trim();
    outline.push({
      level: m[1].length,
      text,
      id: headingId(text),
    });
  }
  return outline;
}

function slotter(prefix) {
  const blocks = [];
  const token = (i) => `${prefix}${i}${prefix}`;
  const re = new RegExp(`${prefix}(\\d+)${prefix}`, "g");
  return {
    push(html) {
      const i = blocks.length;
      blocks.push(html);
      return token(i);
    },
    restore(html) {
      return String(html).replace(re, (_, n) => blocks[Number(n)] ?? "");
    },
  };
}

function calloutLabel(type, title) {
  if (title) return title;
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function replaceCallouts(src, slots) {
  const lines = src.split(/\r?\n/);
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    const m = lines[i].match(/^>\s*\[!([A-Za-z][\w-]*)\]([+-]?)[ \t]*(.*)$/);
    if (!m) {
      out.push(lines[i]);
      continue;
    }
    const type = m[1].toLowerCase();
    const title = m[3].trim();
    const bodyLines = [];
    i += 1;
    while (i < lines.length) {
      const line = lines[i];
      if (line === ">") {
        bodyLines.push("");
        i += 1;
        continue;
      }
      const cont = line.match(/^>\s?(.*)$/);
      if (!cont) {
        i -= 1;
        break;
      }
      if (/^\[!/.test(cont[1])) {
        i -= 1;
        break;
      }
      bodyLines.push(cont[1]);
      i += 1;
    }
    const bodyMd = bodyLines.join("\n").trim();
    const bodyHtml = bodyMd ? marked.parse(bodyMd) : "";
    const known = CALLOUT_TYPES.has(type) ? type : "note";
    const html = `<aside class="callout callout-${escapeAttr(known)}" data-callout="${escapeAttr(type)}"><p class="callout-title">${escapeHtml(calloutLabel(type, title))}</p><div class="callout-body">${bodyHtml}</div></aside>`;
    out.push(slots.push(html));
  }
  return out.join("\n");
}

function replaceDataview(src, slots, published) {
  return src.replace(/```dataview[ \t]*\r?\n([\s\S]*?)```/gi, (_, query) => {
    return slots.push(renderDataview(query, published));
  });
}

function protectCode(src, slots) {
  let out = src.replace(/```[\s\S]*?```/g, (block) => slots.push(block));
  out = out.replace(/`[^`\n]+`/g, (block) => slots.push(block));
  return out;
}

function findImage(vaultDir, notePath, target) {
  if (!vaultDir || !target) return null;
  const clean = target.replace(/^\/+/, "");
  const candidates = [
    join(vaultDir, clean),
    join(vaultDir, dirname(notePath), clean),
    join(vaultDir, "media", clean),
  ];
  for (const abs of candidates) {
    if (existsSync(abs)) return abs;
  }
  return null;
}

function renderImage(abs, alt) {
  if (!abs || !existsSync(abs)) {
    return `<img class="embed-image" alt="${escapeAttr(alt)}" data-missing="true">`;
  }
  const buf = readFileSync(abs);
  const mime = mimeFromExt(extname(abs));
  return `<img class="embed-image" src="data:${mime};base64,${buf.toString("base64")}" alt="${escapeAttr(alt)}">`;
}

function replaceWikilinks(src, ctx, slots) {
  const re = new RegExp(WIKI_RE.source, "g");
  return src.replace(re, (raw, bang, targetRaw, headingRaw, aliasRaw) => {
    const target = String(targetRaw || "").trim();
    const heading = headingRaw ? String(headingRaw).trim() : null;
    const alias = aliasRaw ? String(aliasRaw).trim() : null;
    const label = alias || (heading ? `${target} › ${heading}` : target);

    if (isImageTarget(target)) {
      const abs = findImage(ctx.vaultDir, ctx.note.path, target);
      const img = renderImage(abs, alias || target);
      return bang ? slots.push(img) : img;
    }

    const resolved = resolveTarget(ctx.catalog, target);
    if (!resolved) {
      return `<span class="wiki-missing" data-target="${escapeAttr(target)}">${escapeHtml(label)}</span>`;
    }

    const anchor = heading ? headingAnchor(heading) : "";
    const href = anchor
      ? `#/${escapeAttr(resolved.slug)}#${escapeAttr(anchor)}`
      : `#/${escapeAttr(resolved.slug)}`;

    if (bang) {
      if (ctx.embedStack.has(resolved.slug)) {
        return `<a class="wiki link" href="${href}" data-slug="${escapeAttr(resolved.slug)}">${escapeHtml(resolved.title)}</a>`;
      }
      const nested = renderNote(resolved, {
        ...ctx,
        embedStack: new Set([...ctx.embedStack, resolved.slug]),
        skipDataview: true,
      });
      const html = `<div class="embed" data-embed-slug="${escapeAttr(resolved.slug)}"><p class="embed-title"><a class="wiki link" href="#/${escapeAttr(resolved.slug)}" data-slug="${escapeAttr(resolved.slug)}">${escapeHtml(resolved.title)}</a></p><div class="embed-body">${nested}</div></div>`;
      return slots.push(html);
    }

    return `<a class="wiki link" href="${href}" data-slug="${escapeAttr(resolved.slug)}" data-preview="1">${escapeHtml(label)}</a>`;
  });
}

function addHeadingIds(html) {
  return html.replace(/<h([1-6])>([\s\S]*?)<\/h\1>/g, (full, level, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    const id = headingId(text);
    return `<h${level} id="${escapeAttr(id)}">${inner}</h${level}>`;
  });
}

/**
 * Render a note body to HTML (callouts, Dataview, wikilinks, embeds, markdown).
 */
export function renderMarkdown(body, ctx) {
  const htmlSlots = slotter("GARDENHTML");
  const mdSlots = slotter("GARDENMD");
  let src = String(body || "");
  if (!ctx.skipDataview) {
    src = replaceDataview(src, htmlSlots, ctx.published || []);
  }
  src = replaceCallouts(src, htmlSlots);
  src = protectCode(src, mdSlots);
  src = replaceWikilinks(src, ctx, htmlSlots);
  src = mdSlots.restore(src);
  let html = marked.parse(src);
  html = html.replace(/<p>(GARDENHTML\d+GARDENHTML)<\/p>/g, "$1");
  html = htmlSlots.restore(html);
  html = addHeadingIds(html);
  return html.trim();
}

export function renderNote(note, ctx) {
  const embedStack = ctx.embedStack || new Set([note.slug]);
  return renderMarkdown(note.body, {
    ...ctx,
    note,
    embedStack,
  });
}

export function previewText(body, limit = 280) {
  const text = String(body || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, t, a) => a || t)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^>\s*\[!\w+\][+-]?\s*/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit).trim()}…`;
}
