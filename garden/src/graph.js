/**
 * Force-directed graph of published notes.
 * Nodes = notes, edges = wikilinks, radius follows degree.
 * Inverse ink on the dark stage, hairline edges, no colour accent.
 */

function cssVar(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name);
  return value.trim() || fallback;
}

function palette() {
  const inverse = document.body.classList.contains("scene-dark");
  if (inverse) {
    return {
      ink: cssVar("--ink-inverse", "#f2f2f2"),
      line: "rgba(255,255,255,0.18)",
      muted: cssVar("--muted-inverse", "rgba(255,255,255,0.5)"),
    };
  }
  return {
    ink: cssVar("--ink", "#0a0a0a"),
    line: cssVar("--line", "rgba(10,10,10,0.12)"),
    muted: cssVar("--muted", "#8a8a8a"),
  };
}

export function createGraph(canvas, graph, options = {}) {
  const ctx = canvas.getContext("2d");
  const count = Math.max((graph.nodes || []).length, 1);
  const nodes = (graph.nodes || []).map((n, i) => {
    const a = (i / count) * Math.PI * 2;
    return { ...n, x: Math.cos(a) * 160, y: Math.sin(a) * 160, vx: 0, vy: 0, sx: 0, sy: 0 };
  });
  const index = new Map(nodes.map((n) => [n.slug, n]));
  const edges = (graph.edges || [])
    .map((e) => ({ source: index.get(e.source), target: index.get(e.target) }))
    .filter((e) => e.source && e.target);

  let hover = null;
  let running = true;
  let focus = options.focus || null;
  const onClick = options.onClick || (() => {});

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor(rect.width * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function radius(node) {
    return 3.5 + Math.min(10, (node.degree || 0) * 1.4);
  }

  function step() {
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rest = Math.max(110, Math.min(rect.width, rect.height) * 0.22);
    const min = rest * 0.85;

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy) || 0.01;
        if (dist < min * 2) {
          const force = ((min - dist) / dist) * 0.012;
          a.vx += dx * force;
          a.vy += dy * force;
          b.vx -= dx * force;
          b.vy -= dy * force;
        }
      }
    }

    for (const e of edges) {
      const dx = e.target.x - e.source.x;
      const dy = e.target.y - e.source.y;
      const dist = Math.hypot(dx, dy) || 0.01;
      const k = (dist - rest) * 0.004;
      e.source.vx += dx * k;
      e.source.vy += dy * k;
      e.target.vx -= dx * k;
      e.target.vy -= dy * k;
    }

    const pad = 72;
    const hw = Math.max(40, rect.width / 2 - pad);
    const hh = Math.max(40, rect.height / 2 - pad);
    const cap = 6;
    for (const node of nodes) {
      node.vx += (0 - node.x) * 0.008;
      node.vy += (0 - node.y) * 0.008;
      node.vx *= 0.82;
      node.vy *= 0.82;
      node.vx = Math.max(-cap, Math.min(cap, node.vx));
      node.vy = Math.max(-cap, Math.min(cap, node.vy));
      node.x += node.vx;
      node.y += node.vy;
      node.x = Math.max(-hw, Math.min(hw, node.x));
      node.y = Math.max(-hh, Math.min(hh, node.y));
      if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) {
        node.x = 0;
        node.y = 0;
        node.vx = 0;
        node.vy = 0;
      }
      node.sx = cx + node.x;
      node.sy = cy + node.y;
    }
  }

  function draw() {
    const rect = canvas.getBoundingClientRect();
    const { ink, line, muted } = palette();
    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    for (const e of edges) {
      const hot =
        hover &&
        (e.source.slug === hover.slug || e.target.slug === hover.slug);
      const focused =
        focus &&
        (e.source.slug === focus || e.target.slug === focus);
      ctx.globalAlpha = hot || focused ? 1 : 0.7;
      ctx.beginPath();
      ctx.moveTo(e.source.sx, e.source.sy);
      ctx.lineTo(e.target.sx, e.target.sy);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    ctx.font = "11px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    for (const node of nodes) {
      const r = radius(node);
      const active = hover?.slug === node.slug || focus === node.slug;
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.arc(node.sx, node.sy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = active ? ink : muted;
      ctx.fillText(node.title, node.sx, node.sy + r + 4);
    }
  }

  function hit(x, y) {
    let best = null;
    let bestD = 18;
    for (const node of nodes) {
      const d = Math.hypot(node.sx - x, node.sy - y);
      if (d < bestD) {
        bestD = d;
        best = node;
      }
    }
    return best;
  }

  function loop() {
    if (!running) return;
    step();
    draw();
    requestAnimationFrame(loop);
  }

  function pointer(ev) {
    const rect = canvas.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    hover = hit(x, y);
    canvas.style.cursor = hover ? "pointer" : "crosshair";
  }

  canvas.addEventListener("pointermove", pointer);
  canvas.addEventListener("pointerleave", () => {
    hover = null;
  });
  canvas.addEventListener("click", (ev) => {
    const rect = canvas.getBoundingClientRect();
    const node = hit(ev.clientX - rect.left, ev.clientY - rect.top);
    if (node) onClick(node.slug);
  });

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas);
  resize();
  step();
  draw();
  requestAnimationFrame(loop);

  return {
    setFocus(slug) {
      focus = slug;
    },
    destroy() {
      running = false;
      ro.disconnect();
    },
  };
}
