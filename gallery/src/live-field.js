/** Flat 2D motion: looping video texture on the plane (same pace, 24 fps). */

export function registerLiveField() {
  const AFRAME = window.AFRAME;
  if (AFRAME.components["live-video"]) return;
  AFRAME.registerComponent("live-video", {
    schema: { src: { type: "string" } },
    init() {
      this.quiet =
        typeof matchMedia === "function" &&
        matchMedia("(prefers-reduced-motion: reduce)").matches;
      const video = document.createElement("video");
      video.src = this.data.src;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.preload = "auto";
      video.crossOrigin = "anonymous";
      this.video = video;
      this.el.addEventListener("loaded", () => this._bind());
      if (!this.quiet) {
        video.addEventListener("canplay", () => video.play().catch(() => {}));
        const kick = () => video.play().catch(() => {});
        window.addEventListener("pointerdown", kick, { once: true });
      }
    },
    _bind() {
      const mesh = this.el.getObject3D("mesh");
      if (!mesh || !this.video) return;
      const THREE = window.AFRAME.THREE;
      const tex = new THREE.VideoTexture(this.video);
      if ("SRGBColorSpace" in THREE) tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      mesh.material.map = tex;
      mesh.material.needsUpdate = true;
      this.texture = tex;
      if (!this.quiet) this.video.play().catch(() => {});
    },
    remove() {
      if (this.video) {
        this.video.pause();
        this.video.src = "";
      }
      if (this.texture) this.texture.dispose();
    },
  });
}
