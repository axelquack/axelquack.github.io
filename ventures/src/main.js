function wireScene() {
  const canvas = document.getElementById("bg");
  if (!canvas) return;

  import("./scene.js")
    .then(({ createScene }) => {
      const api = createScene(canvas);

      function onMove(e) {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -((e.clientY / window.innerHeight) * 2 - 1);
        api.setPointer(x, y);
      }

      window.addEventListener("pointermove", onMove, { passive: true });
    })
    .catch(() => {
      /* type still reads */
    });
}

wireScene();
