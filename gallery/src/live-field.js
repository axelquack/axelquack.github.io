/**
 * Live hangings: MP4 VideoTexture on desktop; filmstrip canvas on iOS/touch.
 * WebKit will not update HTMLVideoElement as a WebGL texture (Safari + Brave).
 */

const MAX_PLAYING = 4;
const PLAY_DIST = 16;

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return true;
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) return true;
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

function videoHost() {
  let host = document.getElementById("live-videos");
  if (!host) {
    host = document.createElement("div");
    host.id = "live-videos";
    host.setAttribute("aria-hidden", "true");
    document.body.append(host);
  }
  return host;
}

export function registerLiveField() {
  const AFRAME = window.AFRAME;
  if (AFRAME.systems["live-video"]) return;

  AFRAME.registerSystem("live-video", {
    init() {
      this.comps = [];
      this.useSheet = isTouchDevice();
      this.quiet =
        typeof matchMedia === "function" &&
        matchMedia("(prefers-reduced-motion: reduce)").matches;
      this.unlocked = this.useSheet;
      this._pos = new AFRAME.THREE.Vector3();
      this._cam = new AFRAME.THREE.Vector3();
      if (!this.useSheet) {
        const unlock = () => {
          this.unlocked = true;
          this._rank();
        };
        window.addEventListener("pointerdown", unlock, { once: true, capture: true });
      }
    },
    register(comp) {
      this.comps.push(comp);
    },
    unregister(comp) {
      this.comps = this.comps.filter((item) => item !== comp);
    },
    tick() {
      if (this.quiet || !this.unlocked || !this.comps.length) return;
      this._rank();
    },
    _rank() {
      const cam = this.el.camera;
      if (!cam) return;
      cam.getWorldPosition(this._cam);
      const ranked = this.comps
        .map((comp) => {
          comp.el.object3D.getWorldPosition(this._pos);
          return { comp, d: this._pos.distanceTo(this._cam) };
        })
        .sort((a, b) => a.d - b.d);
      ranked.forEach((item, i) => {
        if (i < MAX_PLAYING && item.d < PLAY_DIST) item.comp.wantPlay();
        else item.comp.wantPause();
      });
    },
  });

  AFRAME.registerComponent("live-video", {
    schema: {
      src: { type: "string", default: "" },
      sheet: { type: "string", default: "" },
      cols: { type: "int", default: 6 },
      rows: { type: "int", default: 8 },
      fps: { type: "int", default: 24 },
    },
    init() {
      const system = this.el.sceneEl.systems["live-video"];
      this.quiet = system?.quiet;
      this.useSheet = Boolean(system?.useSheet && this.data.sheet);
      this.active = false;
      this.frame = -1;
      const bind = () => this._cacheMesh();
      if (this.el.hasLoaded) bind();
      else this.el.addEventListener("loaded", bind);
      this.el.addEventListener("object3dset", (event) => {
        if (event.detail === "mesh") bind();
      });
      if (!this.useSheet && this.data.src) this._initVideo();
      system?.register(this);
    },
    _cacheMesh() {
      const mesh = this.el.getObject3D("mesh");
      if (!mesh) return;
      this.mesh = mesh;
      if (!this.posterMap) this.posterMap = mesh.material.map || null;
    },
    _apply(map) {
      const mesh = this.mesh || this.el.getObject3D("mesh");
      if (!mesh || !map) return;
      this.mesh = mesh;
      mesh.material.map = map;
      mesh.material.needsUpdate = true;
    },
    _initVideo() {
      const video = document.createElement("video");
      video.className = "gallery-live";
      video.loop = true;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.preload = "auto";
      video.crossOrigin = "anonymous";
      video.setAttribute("muted", "");
      video.src = this.data.src;
      videoHost().append(video);
      this.video = video;
      video.addEventListener("playing", () => {
        if (!this.videoTex) this._makeVideoTex();
        this._apply(this.videoTex);
      });
    },
    _makeVideoTex() {
      if (this.videoTex || !this.video) return;
      const THREE = window.AFRAME.THREE;
      const tex = new THREE.VideoTexture(this.video);
      if ("SRGBColorSpace" in THREE) tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      this.videoTex = tex;
    },
    _ensureSheet() {
      if (this.sheetImg || !this.data.sheet) return;
      const img = new Image();
      img.decoding = "async";
      img.onload = () => this._makeSheetCanvas();
      img.src = this.data.sheet;
      this.sheetImg = img;
    },
    _makeSheetCanvas() {
      const img = this.sheetImg;
      if (!img || !img.naturalWidth) return;
      const fw = Math.round(img.naturalWidth / this.data.cols);
      const fh = Math.round(img.naturalHeight / this.data.rows);
      const canvas = document.createElement("canvas");
      canvas.width = fw;
      canvas.height = fh;
      this.ctx = canvas.getContext("2d", { alpha: false });
      this.canvas = canvas;
      const THREE = window.AFRAME.THREE;
      const tex = new THREE.CanvasTexture(canvas);
      if ("SRGBColorSpace" in THREE) tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      this.sheetTex = tex;
      this.frame = -1;
    },
    _paint(i) {
      if (!this.ctx || !this.sheetImg || !this.sheetTex) return;
      const fw = this.canvas.width;
      const fh = this.canvas.height;
      const col = i % this.data.cols;
      const row = Math.floor(i / this.data.cols);
      this.ctx.drawImage(
        this.sheetImg,
        col * fw,
        row * fh,
        fw,
        fh,
        0,
        0,
        fw,
        fh,
      );
      this.sheetTex.needsUpdate = true;
    },
    tick(t) {
      if (!this.useSheet || !this.active || this.quiet || !this.canvas) return;
      const frames = this.data.cols * this.data.rows;
      const i = Math.floor((t / 1000) * this.data.fps) % frames;
      if (i === this.frame) return;
      this.frame = i;
      this._paint(i);
      if (this.sheetTex) this._apply(this.sheetTex);
    },
    wantPlay() {
      if (this.quiet || this.active) return;
      this.active = true;
      if (this.useSheet) {
        this._ensureSheet();
        return;
      }
      if (!this.video) return;
      const play = this.video.play();
      if (play) play.catch(() => { this.active = false; });
    },
    wantPause() {
      if (!this.active) return;
      this.active = false;
      if (this.video) this.video.pause();
      if (this.posterMap) this._apply(this.posterMap);
    },
    remove() {
      this.el.sceneEl.systems["live-video"]?.unregister(this);
      if (this.video) {
        this.video.pause();
        this.video.removeAttribute("src");
        this.video.load();
        this.video.remove();
      }
      if (this.videoTex) this.videoTex.dispose();
      if (this.sheetTex) this.sheetTex.dispose();
      this.sheetImg = null;
    },
  });
}
