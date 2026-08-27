import { buildScene, hangWorks, setKindVisible, setMoveStick } from "./scene.js";

const caption = document.querySelector("#caption");
const captionTitle = document.querySelector("#caption-title");
const captionMeta = document.querySelector("#caption-meta");
const captionLink = document.querySelector("#caption-link");
const catalog = document.querySelector("#catalog");
const catalogList = document.querySelector("#catalog-list");

let works = [];
let filter = "all";
let openId = null;

function workById(id) {
  return works.find((item) => item.id === id) || null;
}

function showCaption(work) {
  if (!work) {
    caption.hidden = true;
    return;
  }
  caption.hidden = false;
  captionTitle.textContent = work.title;
  captionMeta.textContent = [work.year, work.medium, work.kind === "nft" ? "NFT" : "Other"]
    .filter(Boolean)
    .join("  ·  ");
  if (work.link) {
    captionLink.hidden = false;
    captionLink.href = work.link;
    captionLink.textContent = work.linkLabel || "View";
  } else {
    captionLink.hidden = true;
    captionLink.removeAttribute("href");
  }
}

function renderCatalog(kind) {
  const items = works.filter((work) => work.kind === kind);
  catalogList.replaceChildren();
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "catalog-empty";
    empty.textContent = kind === "nft" ? "No NFT works yet." : "No works in this view.";
    catalogList.append(empty);
    return;
  }

  const frag = document.createDocumentFragment();
  items.forEach((work, index) => {
    const figure = document.createElement("figure");
    figure.className = "catalog-item";
    figure.id = `catalog-${work.id}`;

    const img = document.createElement("img");
    img.src = work.image;
    img.alt = work.title;
    img.width = 1400;
    img.height = 875;
    img.decoding = "async";
    img.loading = index < 2 ? "eager" : "lazy";

    const cap = document.createElement("figcaption");
    const title = document.createElement("span");
    title.className = "catalog-title";
    title.textContent = work.title;
    const meta = document.createElement("span");
    meta.className = "catalog-meta";
    meta.textContent = work.year || "";
    cap.append(title, meta);
    if (work.link) {
      const link = document.createElement("a");
      link.className = "link";
      link.href = work.link;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = work.linkLabel || "View";
      cap.append(link);
    }

    figure.append(img, cap);
    frag.append(figure);
  });
  catalogList.append(frag);
}

function applyFilter(kind) {
  filter = kind;
  const catalogOn = kind === "nft" || kind === "other";
  document.body.classList.toggle("is-catalog", catalogOn);
  catalog.hidden = !catalogOn;

  if (catalogOn) {
    renderCatalog(kind);
    catalog.scrollTop = 0;
    document.exitPointerLock?.();
    catalog.focus({ preventScroll: true });
    return;
  }

  setKindVisible("all");
}

window.addEventListener("gallery-select", (event) => {
  const id = event.detail;
  const work = workById(id);
  if (!work) return;
  openId = id;
  showCaption(work);
  history.replaceState(null, "", `#${id}`);
});

function setFilterButtons(kind) {
  for (const btn of document.querySelectorAll("[data-filter]")) {
    const on = btn.dataset.filter === kind;
    btn.classList.toggle("is-active", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  }
}

catalog.addEventListener("pointerdown", (event) => {
  event.stopPropagation();
  document.exitPointerLock?.();
});
catalog.addEventListener("wheel", (event) => event.stopPropagation());

for (const btn of document.querySelectorAll("[data-filter]")) {
  btn.addEventListener("pointerdown", (event) => event.stopPropagation());
  btn.addEventListener("click", () => {
    setFilterButtons(btn.dataset.filter);
    applyFilter(btn.dataset.filter);
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || filter === "all") return;
  setFilterButtons("all");
  applyFilter("all");
});

function setupAudio(meta) {
  const toggle = document.querySelector("#audio-toggle");
  const titleEl = document.querySelector("#audio-title");
  if (!meta?.src) {
    toggle.hidden = true;
    if (titleEl) titleEl.hidden = true;
    return;
  }
  titleEl.textContent = meta.title || "Soundtrack";

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  const gain = ctx.createGain();
  gain.gain.value = 0.55;
  gain.connect(ctx.destination);

  let buffer = null;
  let source = null;
  let playing = false;
  let wantPlay = false;
  let startedAt = 0;
  let offset = 0;

  const loaded = fetch(meta.src)
    .then((res) => res.arrayBuffer())
    .then((data) => ctx.decodeAudioData(data.slice(0)))
    .then((decoded) => {
      buffer = decoded;
    });

  const sync = () => {
    toggle.classList.toggle("is-playing", playing);
    toggle.setAttribute("aria-pressed", playing ? "true" : "false");
    toggle.setAttribute("aria-label", playing ? "Pause soundtrack" : "Play soundtrack");
  };

  const stopSource = () => {
    if (!source) return;
    try {
      source.stop();
    } catch {
      /* already stopped */
    }
    source.disconnect();
    source = null;
  };

  const startSource = () => {
    if (!buffer) return;
    stopSource();
    source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    const dur = buffer.duration;
    const off = ((offset % dur) + dur) % dur;
    source.start(0, off);
    startedAt = ctx.currentTime;
    playing = true;
  };

  const play = () => {
    wantPlay = true;
    return loaded
      .then(async () => {
        if (!wantPlay) return;
        if (ctx.state === "suspended") await ctx.resume();
        if (!playing) startSource();
        sync();
      })
      .catch(sync);
  };

  const pause = () => {
    wantPlay = false;
    if (!playing) {
      sync();
      return;
    }
    if (buffer) offset = (offset + (ctx.currentTime - startedAt)) % buffer.duration;
    playing = false;
    stopSource();
    sync();
  };

  toggle.addEventListener("pointerdown", (event) => event.stopPropagation());
  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    if (playing) pause();
    else play();
  });
  sync();

  const unlock = () => {
    if (!playing) play();
    window.removeEventListener("pointerdown", unlock);
  };
  window.addEventListener("pointerdown", unlock, { once: true, capture: true });
}

function fullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}

function requestFullscreen(node) {
  const fn = node.requestFullscreen || node.webkitRequestFullscreen;
  return fn ? fn.call(node) : Promise.reject();
}

function exitFullscreen() {
  const fn = document.exitFullscreen || document.webkitExitFullscreen;
  return fn ? fn.call(document) : Promise.resolve();
}

function setupFullscreen() {
  const toggle = document.querySelector("#fullscreen-toggle");
  if (!toggle) return;

  const coarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const canEnter =
    document.documentElement.requestFullscreen ||
    document.documentElement.webkitRequestFullscreen;
  if (coarse || !canEnter) {
    toggle.hidden = true;
    return;
  }

  const sync = () => {
    const on = Boolean(fullscreenElement());
    toggle.classList.toggle("is-fullscreen", on);
    toggle.setAttribute("aria-pressed", on ? "true" : "false");
    toggle.setAttribute("aria-label", on ? "Exit fullscreen" : "Enter fullscreen");
  };

  toggle.addEventListener("pointerdown", (event) => event.stopPropagation());
  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    if (fullscreenElement()) exitFullscreen();
    else requestFullscreen(document.documentElement).catch(() => {});
  });
  document.addEventListener("fullscreenchange", sync);
  document.addEventListener("webkitfullscreenchange", sync);
  sync();
}

function setupMoveStick() {
  const root = document.querySelector("#move-stick");
  const knob = root?.querySelector(".stick-knob");
  if (!root || !knob) return;

  const coarse = window.matchMedia("(hover: none) and (pointer: coarse)");
  const syncHidden = () => {
    root.setAttribute("aria-hidden", coarse.matches ? "false" : "true");
  };
  syncHidden();
  coarse.addEventListener("change", () => {
    syncHidden();
    if (!coarse.matches) reset();
  });

  let pointerId = null;

  function radius() {
    return root.clientWidth * 0.32;
  }

  function apply(dx, dy) {
    const r = radius();
    const len = Math.hypot(dx, dy);
    if (len > r && len > 0) {
      dx = (dx / len) * r;
      dy = (dy / len) * r;
    }
    const nx = r ? dx / r : 0;
    const ny = r ? dy / r : 0;
    const mag = Math.hypot(nx, ny);
    const dead = 0.14;
    if (mag < dead) {
      setMoveStick(0, 0);
      knob.style.transform = "";
      return;
    }
    const scale = (mag - dead) / (1 - dead);
    setMoveStick((nx / mag) * scale, (ny / mag) * scale);
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  function reset() {
    pointerId = null;
    root.classList.remove("is-active");
    setMoveStick(0, 0);
    knob.style.transform = "";
  }

  root.addEventListener("pointerdown", (event) => {
    if (!coarse.matches || event.button) return;
    event.preventDefault();
    event.stopPropagation();
    pointerId = event.pointerId;
    root.setPointerCapture(event.pointerId);
    root.classList.add("is-active");
    const rect = root.getBoundingClientRect();
    apply(
      event.clientX - (rect.left + rect.width / 2),
      event.clientY - (rect.top + rect.height / 2),
    );
  });

  root.addEventListener("pointermove", (event) => {
    if (pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = root.getBoundingClientRect();
    apply(
      event.clientX - (rect.left + rect.width / 2),
      event.clientY - (rect.top + rect.height / 2),
    );
  });

  const onUp = (event) => {
    if (pointerId !== event.pointerId) return;
    event.stopPropagation();
    reset();
  };
  root.addEventListener("pointerup", onUp);
  root.addEventListener("pointercancel", onUp);
}

async function boot() {
  const [data, soundtrack] = await Promise.all([
    fetch("/works.json").then((res) => res.json()).catch(() => ({ works: [] })),
    fetch("/soundtrack.json").then((res) => res.json()).catch(() => null),
  ]);
  works = Array.isArray(data.works) ? data.works : [];
  setupAudio(soundtrack);
  setupFullscreen();
  setupMoveStick();

  const scene = buildScene();
  document.querySelector("#scene-root").append(scene);
  scene.addEventListener("loaded", () => {
    hangWorks(works);
    const hash = decodeURIComponent(location.hash.replace(/^#/, ""));
    const fromHash = workById(hash);
    if (fromHash) {
      openId = fromHash.id;
      showCaption(fromHash);
    }
  });
}

boot();
