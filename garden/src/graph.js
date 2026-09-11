/**
 * Force-directed graph of published notes.
 * Nodes = notes, edges = wikilinks, radius follows degree.
 * Ink on paper, hairline edges, no colour accent.
 */

function cssVar(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name);
  return value.trim() || fallback;
}

export function createGraph(canvas, graph, options = {}) {
  const ctx = canvas.getContext("2d");
  const nodes = (graph.nodes || []).map((n, i) => ({
    ...n,
    x: Math.cos((i / Math.max(graph.nodes.length, 1)) * Math.PI * 2) * 80,
    y: Math.sin((i / Math.max(graph.nodes.length, 1)) * Math.PI * 2) * 80,
    vx: 0,
    vy: 0,
  }));
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
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function radius(node) {
    return 3.5 + Math.min(10, (node.degree || 0) * 1.4);
  }

  function step() {
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const n = nodes.length || 1;

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let dist = Math.hypot(dx, dy) || 0.01;
        const min = 36 + (160 / n) * 4;
        const force = (min - dist) / dist * 0.08;
        if (dist < min * 2.4) {
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
      const rest = 90;
      const k = (dist - rest) * 0.012;
      e.source.vx += dx * k;
      e.source.vy += dy * k;
      e.target.vx -= dx * k;
      e.target.vy -= dy * k;
    }

    for (const node of nodes) {
      node.vx += (0 - node.x) * 0.01;
      node.vy += (0 - node.y) * 0.01;
      node.vx *= 0.86;
      node.vy *= 0.86;
      node.x += node.vx;
      node.y += node.vy;
      node.sx = cx + node.x;
      node.sy = cy + node.y;
    }
  }

  function draw() {
    const rect = canvas.getBoundingClientRect();
    const ink = cssVar("--ink", "#0a0a0a");
    const line = cssVar("--line", "rgba(10,10,10,0.12)");
    const muted = cssVar("--muted", "#8a8a8a");
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
