/** Looping video texture on hangings. Poster still until the clip is actually playing. */

const MAX_PLAYING = 4;
const PLAY_DIST = 16;

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
      this.unlocked = false;
      this.quiet =
        typeof matchMedia === "function" &&
        matchMedia("(prefers-reduced-motion: reduce)").matches;
      this._pos = new AFRAME.THREE.Vector3();
      this._cam = new AFRAME.THREE.Vector3();
      const unlock = () => {
        this.unlocked = true;
        this._rank();
      };
      // Capture: the walk stick stops bubbling, and iOS needs a gesture.
      window.addEventListener("pointerdown", unlock, { once: true, capture: true });
      window.addEventListener("touchend", unlock, { once: true, capture: true });
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
    schema: { src: { type: "string" } },
    init() {
      const system = this.el.sceneEl.systems["live-video"];
      this.quiet = system?.quiet;
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
      this.playing = false;
      const bind = () => this._bind();
      if (this.el.hasLoaded) bind();
      else this.el.addEventListener("loaded", bind);
      this.el.addEventListener("object3dset", (event) => {
        if (event.detail === "mesh") bind();
      });
      video.addEventListener("playing", () => this._showVideo());
      system?.register(this);
    },
    _bind() {
      const mesh = this.el.getObject3D("mesh");
      if (!mesh || !this.video || this.texture) return;
      const THREE = window.AFRAME.THREE;
      this.posterMap = mesh.material.map || null;
      const tex = new THREE.VideoTexture(this.video);
      if ("SRGBColorSpace" in THREE) tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      this.texture = tex;
    },
    _showVideo() {
      const mesh = this.el.getObject3D("mesh");
      if (!mesh || !this.texture) return;
      if (mesh.material.map !== this.texture) {
        mesh.material.map = this.texture;
        mesh.material.needsUpdate = true;
      }
    },
    _showPoster() {
      const mesh = this.el.getObject3D("mesh");
      if (!mesh || !this.posterMap) return;
      if (mesh.material.map !== this.posterMap) {
        mesh.material.map = this.posterMap;
        mesh.material.needsUpdate = true;
      }
    },
    wantPlay() {
      if (this.quiet || this.playing || !this.video) return;
      this.playing = true;
      const play = this.video.play();
      if (play) play.catch(() => { this.playing = false; });
    },
    wantPause() {
      if (!this.playing || !this.video) return;
      this.playing = false;
      this.video.pause();
    },
    remove() {
      this.el.sceneEl.systems["live-video"]?.unregister(this);
      if (this.video) {
        this.video.pause();
        this.video.removeAttribute("src");
        this.video.load();
        this.video.remove();
      }
      if (this.texture) this.texture.dispose();
    },
  });
}
