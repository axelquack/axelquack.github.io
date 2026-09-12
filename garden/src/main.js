import garden from "virtual:garden-data";
import { overviewTiles } from "./publish/build.js";
import { searchNotes } from "./publish/search.js";
import { createField } from "./field.js";
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
let boardEl;
let shellEl;
let landingEl;

let showSource = false;
let fullGraph = null;
let localGraph = null;
let currentSlug = null;
let fieldApi = null;

function parseHash() {
  const raw = (location.hash || "").replace(/^#/, "");
  const [path, anchor] = raw.split("#");
  const slug = decodeURIComponent((path || "").replace(/^\//, "")).trim();
  if (!slug) return { slug: "", anchor: "", view: "landing" };
  if (slug === "gallery") return { slug: "gallery", anchor: "", view: "gallery" };
  return { slug, anchor: anchor || "", view: "read" };
}

function setMode(mode) {
  document.body.classList.toggle("is-landing", mode === "landing");
  document.body.classList.toggle("is-gallery", mode === "gallery");
  document.body.classList.toggle("is-read", mode === "read");
  document.body.classList.add("scene-dark");
  if (landingEl) landingEl.hidden = mode !== "landing";
  if (boardEl) boardEl.hidden = mode !== "gallery";
  if (shellEl) shellEl.hidden = mode !== "read";
  fieldApi?.setLook({ mode });
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
  setMode("read");
  articleEl.className = "article missing";
  articleEl.innerHTML = `<p class="kicker">Garden</p><h1>Not published</h1><p>No published note at <code>${esc(slug)}</code>.</p>`;
  metaEl.innerHTML = "";
  document.title = "Not published — Garden";
}

function renderLanding() {
  currentSlug = "";
  setMode("landing");
  document.title = "Garden";
}

function renderGallery() {
  currentSlug = "gallery";
  setMode("gallery");
  const tiles = overviewTiles(garden)
    .map((t, i) => {
      const lede = t.description
        ? `<p class="frame-lede">${esc(t.description)}</p>`
        : "";
      const num = String(i + 1).padStart(2, "0");
      return `<a class="frame" href="#/${esc(t.slug)}" data-slug="${esc(t.slug)}">
        <span class="frame-type" aria-hidden="true">${esc(t.title)}</span>
        <span class="frame-caption">
          <p class="kicker">${num}  ·  ${esc(t.type || "note")}</p>
          <h2 class="frame-title">${esc(t.title)}</h2>
          ${lede}
        </span>
      </a>`;
    })
    .join("");
  boardEl.innerHTML = tiles || `<p class="meta-empty">No published notes.</p>`;
  document.title = "Gallery — Garden";
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
  `;
  if (localGraph) {
    localGraph.destroy();
    localGraph = null;
  }
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
  setMode("read");
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

function clearSearch() {
  if (!searchEl) return;
  if (searchEl.value) searchEl.value = "";
  renderSearch("");
}

function go(href) {
  const next = href.startsWith("#") ? href : `#/${String(href).replace(/^\//, "")}`;
  hidePreview();
  clearSearch();
  if (location.hash !== next) location.hash = next;
  route();
}

function route() {
  hidePreview();
  const { slug, anchor, view } = parseHash();
  if (view === "landing") {
    renderLanding();
    return;
  }
  if (view === "gallery") {
    renderGallery();
    return;
  }
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
      go(`#/${slug}`);
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
  boardEl = document.getElementById("board");
  shellEl = document.getElementById("shell");
  landingEl = document.getElementById("landing");
}

function bootField() {
  const canvas = document.getElementById("bg");
  if (!canvas) return;
  fieldApi = createField(canvas);
  window.addEventListener(
    "pointermove",
    (e) => {
      if (!fieldApi) return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      fieldApi.setPointer(x, y);
    },
    { passive: true },
  );
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
    if (e.target.tagName === "INPUT") return;
    if (e.key === "Enter" && document.body.classList.contains("is-landing")) {
      e.preventDefault();
      go("#/gallery");
      return;
    }
    if (e.key === "/" && document.activeElement !== searchEl) {
      e.preventDefault();
      if (!document.body.classList.contains("is-landing")) searchEl.focus();
    }
    if (e.key === "Escape") {
      closeGraph();
      hidePreview();
      if (document.body.classList.contains("is-read")) go("#/gallery");
      else if (document.body.classList.contains("is-gallery")) go("#/");
    }
  });

  landingEl.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    go("#/gallery");
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

  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = e.target.closest('a[href^="#/"]');
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href) return;
    e.preventDefault();
    go(href);
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
  if (!articleEl || !searchEl || !boardEl || !landingEl) {
    throw new Error("garden chrome missing from the document");
  }
  bindEvents();
  bootField();
  route();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
