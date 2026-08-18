const clockEl = document.getElementById("clock");

function tickClock() {
  if (!clockEl) return;
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function wireUi() {
  tickClock();
  setInterval(tickClock, 15_000);

  document.querySelectorAll("[data-scroll]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const sel = el.getAttribute("data-scroll");
      const target = sel && document.querySelector(sel);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function wireScene() {
  const canvas = document.getElementById("bg");
  const stages = [...document.querySelectorAll("[data-scene]")];

  let sceneApi = null;
  let active = false;
  let darkMode = false;

  function measureStage(el) {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
    const amount = Math.max(0, Math.min(1, visible / vh));
    return {
      amount,
      mode: el.dataset.scene || "name",
      el,
    };
  }

  function updateScroll() {
    if (!stages.length) return;

    let best = { amount: 0, mode: "none", el: null };
    for (const el of stages) {
      const m = measureStage(el);
      el.classList.toggle("is-active", m.amount > 0.4);
      if (m.amount > best.amount) best = m;
    }

    active = best.amount > 0.18;
    darkMode = best.mode === "talk" && best.amount > 0.25;

    canvas?.classList.toggle("is-visible", active);
    canvas?.classList.toggle("is-dark", darkMode);
    document.body.classList.toggle("scene-dark", darkMode);

    sceneApi?.setSceneState({
      mode: active ? best.mode : "none",
      amount: best.amount,
    });
  }

  let ticking = false;
  function onScrollOrResize() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateScroll();
      ticking = false;
    });
  }

  let drag = false;
  let lastX = 0;
  let lastY = 0;

  function normPointer(e) {
    return {
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -((e.clientY / window.innerHeight) * 2 - 1),
    };
  }

  function onPointerMove(e) {
    if (!sceneApi || !active) return;
    const { x, y } = normPointer(e);
    if (drag) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      sceneApi.setDragging(true, dx, dy);
    } else {
      sceneApi.setPointer(x, y);
    }
  }

  function onPointerDown(e) {
    if (!active || e.button !== 0) return;
    if (e.target !== canvas) return;
    drag = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas?.classList.add("is-dragging");
    sceneApi?.setDragging(true, 0, 0);
  }

  function onPointerUp() {
    if (!drag) return;
    drag = false;
    canvas?.classList.remove("is-dragging");
    sceneApi?.setDragging(false);
  }

  if (!canvas) return;

  import("./scene.js")
    .then(({ createScene }) => {
      sceneApi = createScene(canvas);
      updateScroll();
      window.addEventListener("scroll", onScrollOrResize, { passive: true });
      window.addEventListener("resize", onScrollOrResize, { passive: true });
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      canvas.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
    })
    .catch(() => {
      /* static page still fine */
    });
}

document.documentElement.classList.add("is-unlocked");
wireUi();
wireScene();
