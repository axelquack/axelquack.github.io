import garden from "virtual:garden-data";
import { searchNotes } from "./publish/search.js";
import { createGraph } from "./graph.js";
import "./style.css";

const notesBySlug = new Map(garden.notes.map((n) => [n.slug, n]));

let navEl;
let articleEl;
let metaEl;
let searchEl;
let resultsEl;
let previewEl;
let overlayEl;
let btnGraph;
let btnGraphClose;
let btnSource;
let graphFull;

let showSource = false;
let fullGraph = null;
let localGraph = null;
let currentSlug = null;

function homeSlug() {
  if (notesBySlug.has("index")) return "index";
  return garden.navigation[0]?.slug || garden.notes[0]?.slug || "";
}

function parseHash() {
  const raw = (location.hash || "").replace(/^#/, "");
  const [path, anchor] = raw.split("#");
  const slug = decodeURIComponent((path || "").replace(/^\//, "")).trim();
  return { slug: slug || homeSlug(), anchor: anchor || "" };
}

function renderNav(active) {
  const items = garden.navigation
    .map((item) => {
      const current = item.slug === active ? ' aria-current="page" class="is-active"' : "";
      return `<li><a href="#/${item.slug}"${current}>${esc(item.title)}</a></li>`;
    })
    .join("");
  navEl.innerHTML = `<p class="kicker">Notes</p><ul>${items}</ul>`;
}

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderMissing(slug) {
  articleEl.className = "article missing";
  articleEl.innerHTML = `<p class="kicker">Garden</p><h1>Not published</h1><p>No published note at <code>${esc(slug)}</code>.</p>`;
  metaEl.innerHTML = "";
  document.title = "Not published — Garden";
}

function renderMeta(note) {
  const outline = (note.outline || [])
    .filter((h) => h.level > 1)
    .map(
      (h) =>
        `<li class="lvl-${h.level}"><a href="#/${note.slug}#${esc(h.id)}">${esc(h.text)}</a></li>`,
    )
    .join("");
  const backs = (note.backlinks || [])
    .map((b) => `<li><a href="#/${b.slug}">${esc(b.title)}</a></li>`)
    .join("");
  metaEl.innerHTML = `
    <div class="meta-block" id="outline">
      <p class="kicker">Outline</p>
      ${outline ? `<ul class="outline">${outline}</ul>` : `<p class="meta-empty">No headings</p>`}
    </div>
    <div class="meta-block" id="backlinks">
      <p class="kicker">Backlinks</p>
      ${backs ? `<ul class="backlinks">${backs}</ul>` : `<p class="meta-empty">No backlinks</p>`}
    </div>
    <div class="meta-block" id="local-graph">
      <p class="kicker">Local graph</p>
      <canvas id="graph-local" aria-label="Local graph"></canvas>
    </div>
  `;
  const localCanvas = document.getElementById("graph-local");
  if (localGraph) localGraph.destroy();
  const neighbour = new Set([note.slug]);
  for (const e of garden.graph.edges) {
    if (e.source === note.slug) neighbour.add(e.target);
    if (e.target === note.slug) neighbour.add(e.source);
  }
  const local = {
    nodes: garden.graph.nodes.filter((n) => neighbour.has(n.slug)),
    edges: garden.graph.edges.filter(
      (e) => neighbour.has(e.source) && neighbour.has(e.target),
    ),
  };
  localGraph = createGraph(localCanvas, local, {
    focus: note.slug,
    onClick: (slug) => {
      location.hash = `#/${slug}`;
    },
  });
}

function noteMetaLine(note) {
  const bits = [];
  if (note.frontmatter.type) bits.push(note.frontmatter.type);
  if (note.frontmatter.date) bits.push(String(note.frontmatter.date));
  if (Array.isArray(note.frontmatter.tags) && note.frontmatter.tags.length) {
    bits.push(note.frontmatter.tags.join(" · "));
  }
  return bits.join("  ·  ");
}

function renderNote(note, anchor) {
  currentSlug = note.slug;
  articleEl.className = "article";
  const meta = noteMetaLine(note);
  if (showSource) {
    articleEl.innerHTML = `<p class="kicker">Markdown</p><h1>${esc(note.title)}</h1>${meta ? `<p class="article-meta">${esc(meta)}</p>` : ""}<pre class="source">${esc(note.markdown)}</pre>`;
  } else {
    articleEl.innerHTML = `${meta ? `<p class="article-meta">${esc(meta)}</p>` : ""}${note.html}`;
  }
  renderMeta(note);
  renderNav(note.slug);
  document.title = `${note.title} — Garden`;
  if (anchor) {
    const el = document.getElementById(anchor);
    if (el) el.scrollIntoView({ block: "start" });
    else window.scrollTo(0, 0);
  } else {
    window.scrollTo(0, 0);
  }
}

function route() {
  const { slug, anchor } = parseHash();
  const note = notesBySlug.get(slug);
  if (!note) {
    currentSlug = slug;
    renderNav("");
    renderMissing(slug);
    return;
  }
  renderNote(note, anchor);
}

function renderSearch(query) {
  const q = query.trim();
  if (!q) {
    resultsEl.hidden = true;
    resultsEl.innerHTML = "";
    return;
  }
  const hits = searchNotes(garden.notes, q);
  if (!hits.length) {
    resultsEl.hidden = false;
    resultsEl.innerHTML = `<p class="kicker">Search</p><p>No published notes match “${esc(q)}”.</p>`;
    return;
  }
  const items = hits
    .map(
      (n) =>
        `<li><a href="#/${n.slug}"><strong>${esc(n.title)}</strong> — ${esc(n.preview || "")}</a></li>`,
    )
    .join("");
  resultsEl.hidden = false;
  resultsEl.innerHTML = `<p class="kicker">Search</p><ul>${items}</ul>`;
}

function hidePreview() {
  previewEl.hidden = true;
}

function showPreview(slug, x, y) {
  const note = notesBySlug.get(slug);
  if (!note) {
    hidePreview();
    return;
  }
  previewEl.innerHTML = `<h2>${esc(note.title)}</h2><p>${esc(note.preview || "")}</p>`;
  previewEl.hidden = false;
  const pad = 12;
  const w = previewEl.offsetWidth;
  const h = previewEl.offsetHeight;
  let left = x + 16;
  let top = y + 16;
  if (left + w > window.innerWidth - pad) left = x - w - 16;
  if (top + h > window.innerHeight - pad) top = y - h - 16;
  previewEl.style.left = `${Math.max(pad, left)}px`;
  previewEl.style.top = `${Math.max(pad, top)}px`;
}

function openGraph() {
  overlayEl.hidden = false;
  btnGraph.setAttribute("aria-expanded", "true");
  if (fullGraph) fullGraph.destroy();
  fullGraph = createGraph(graphFull, garden.graph, {
    focus: currentSlug,
    onClick: (slug) => {
      closeGraph();
      location.hash = `#/${slug}`;
    },
  });
}

function closeGraph() {
  overlayEl.hidden = true;
  btnGraph.setAttribute("aria-expanded", "false");
  if (fullGraph) {
    fullGraph.destroy();
    fullGraph = null;
  }
}

function bindChrome() {
  navEl = document.getElementById("nav");
  articleEl = document.getElementById("article");
  metaEl = document.getElementById("meta");
  searchEl = document.getElementById("search");
  resultsEl = document.getElementById("search-results");
  previewEl = document.getElementById("preview");
  overlayEl = document.getElementById("graph-overlay");
  btnGraph = document.getElementById("btn-graph");
  btnGraphClose = document.getElementById("btn-graph-close");
  btnSource = document.getElementById("btn-source");
  graphFull = document.getElementById("graph-full");
}

function bindEvents() {
searchEl.addEventListener("input", () => renderSearch(searchEl.value));
searchEl.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    searchEl.value = "";
    renderSearch("");
    searchEl.blur();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "/" && document.activeElement !== searchEl && e.target.tagName !== "INPUT") {
    e.preventDefault();
    searchEl.focus();
  }
  if (e.key === "Escape") {
    closeGraph();
    hidePreview();
  }
});

btnGraph.addEventListener("click", () => {
  if (overlayEl.hidden) openGraph();
  else closeGraph();
});
btnGraphClose.addEventListener("click", closeGraph);
btnSource.addEventListener("click", () => {
  showSource = !showSource;
  btnSource.textContent = showSource ? "Rendered" : "Markdown";
  route();
});

document.addEventListener("pointerover", (e) => {
  const link = e.target.closest("a.wiki[data-preview]");
  if (!link) return;
  showPreview(link.getAttribute("data-slug"), e.clientX, e.clientY);
});
document.addEventListener("pointerout", (e) => {
  if (e.target.closest("a.wiki[data-preview]")) hidePreview();
});
document.addEventListener("pointermove", (e) => {
  if (!previewEl.hidden) {
    const link = e.target.closest("a.wiki[data-preview]");
    if (link) showPreview(link.getAttribute("data-slug"), e.clientX, e.clientY);
  }
});

window.addEventListener("hashchange", route);
}

function boot() {
  bindChrome();
  if (!articleEl || !searchEl) {
    throw new Error("garden chrome missing from the document");
  }
  bindEvents();
  route();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
