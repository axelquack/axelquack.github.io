import * as THREE from "three";
import { Reflector } from "three/addons/objects/Reflector.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";

const screenVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const screenFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;

  float gyroid(vec3 p) {
    return sin(p.x) * cos(p.y) + sin(p.y) * cos(p.z) + sin(p.z) * cos(p.x);
  }

  float map(vec3 p) {
    vec3 q = p;
    q.xy += 0.42 * vec2(
      gyroid(p * 1.15 + vec3(uTime * 0.09)),
      gyroid(p.yzx * 1.15 - vec3(uTime * 0.07))
    );
    q += 0.18 * gyroid(q * 2.05 + 1.7);
    return gyroid(q * 2.85);
  }

  void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    vec3 p = vec3(uv * 2.85, uTime * 0.14);
    p.xy += uMouse * 0.18;
    float h = map(p);
    float hx = map(p + vec3(0.02, 0.0, 0.0));
    float hy = map(p + vec3(0.0, 0.02, 0.0));
    vec3 n = normalize(vec3(h - hx, h - hy, 0.28));
    vec3 l = normalize(vec3(-0.4, 0.35, 1.0));
    float diff = pow(max(dot(n, l), 0.0), 0.7);
    float spec = pow(max(dot(n, normalize(l + vec3(0.0, 0.0, 1.0))), 0.0), 40.0);
    float base = 0.22 + 0.55 * (0.5 + 0.5 * h);
    float val = base * (0.45 + 0.7 * diff) + spec * 0.22;
    val = pow(clamp(val, 0.0, 1.0), 0.92);
    gl_FragColor = vec4(vec3(val), 1.0);
  }
`;

function panelTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#0c0c0c";
  ctx.fillRect(0, 0, 1024, 1024);
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 2;
  const cols = 4;
  const rows = 3;
  const pad = 18;
  const cw = (1024 - pad * (cols + 1)) / cols;
  const ch = (1024 - pad * (rows + 1)) / rows;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const px = pad + x * (cw + pad);
      const py = pad + y * (ch + pad);
      ctx.strokeRect(px + 0.5, py + 0.5, cw, ch);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

const LOOKS = {
  landing: {
    cam: new THREE.Vector3(2.45, 1.52, 13.8),
    look: new THREE.Vector3(3.05, 1.28, -6.0),
  },
  gallery: {
    cam: new THREE.Vector3(1.6, 1.7, 13.2),
    look: new THREE.Vector3(2.2, 2.0, -7.0),
  },
  read: {
    cam: new THREE.Vector3(2.5, 1.62, 11.4),
    look: new THREE.Vector3(3.1, 1.75, -6.4),
  },
};

/**
 * Screening room for the garden landing (CineShader structure, presence palette).
 * Hidden when prefers-reduced-motion.
 */
export function createField(canvas) {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced || !canvas) {
    return { setPointer() {}, setLook() {}, destroy() {} };
  }

  RectAreaLightUniformsLib.init();

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearColor(0x000000, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 8, 30);
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(
    32,
    window.innerWidth / window.innerHeight,
    0.1,
    80,
  );
  const camPos = LOOKS.landing.cam.clone();
  const lookPos = LOOKS.landing.look.clone();
  const camGoal = LOOKS.landing.cam.clone();
  const lookGoal = LOOKS.landing.look.clone();
  camera.position.copy(camPos);
  camera.lookAt(lookPos);

  const panels = panelTexture();
  panels.repeat.set(2, 1);
  const wallMat = new THREE.MeshStandardMaterial({
    map: panels,
    color: 0x151515,
    roughness: 0.88,
    metalness: 0.04,
  });

  const back = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), wallMat);
  back.position.set(0, 4.6, -9.2);
  const left = new THREE.Mesh(new THREE.PlaneGeometry(24, 10), wallMat.clone());
  left.rotation.y = Math.PI / 2;
  left.position.set(-11.2, 4.6, -1.2);
  const right = new THREE.Mesh(new THREE.PlaneGeometry(24, 10), wallMat.clone());
  right.rotation.y = -Math.PI / 2;
  right.position.set(11.2, 4.6, -1.2);
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 24),
    new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 1, metalness: 0 }),
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 7.6;
  scene.add(back, left, right, ceiling);

  const floorSize = 768 * Math.min(window.devicePixelRatio || 1, 2);
  const floor = new Reflector(new THREE.PlaneGeometry(36, 36), {
    clipBias: 0.003,
    textureWidth: floorSize,
    textureHeight: floorSize,
    color: 0x2a2a2a,
  });
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const screenW = 5.6;
  const screenH = 5.6;
  const screenZ = -8.15;
  const screenY = 3.35;
  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
  };
  const screenMat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: screenVert,
    fragmentShader: screenFrag,
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(screenW, screenH), screenMat);
  screen.position.set(-0.35, screenY, screenZ);
  const screenFrame = new THREE.Mesh(
    new THREE.BoxGeometry(screenW + 0.16, screenH + 0.16, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.6, metalness: 0.1 }),
  );
  screenFrame.position.set(-0.35, screenY, screenZ - 0.07);
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(screenW + 1.6, screenH + 1.6),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.025,
      depthWrite: false,
    }),
  );
  glow.position.set(-0.35, screenY, screenZ - 0.02);
  scene.add(screenFrame, glow, screen);

  const area = new THREE.RectAreaLight(0xf2f2f2, 6, screenW, screenH);
  area.position.set(-0.35, screenY, screenZ + 0.2);
  area.lookAt(-0.35, screenY, 0);
  scene.add(area);
  scene.add(new THREE.AmbientLight(0xffffff, 0.04));
  const fill = new THREE.DirectionalLight(0xffffff, 0.08);
  fill.position.set(6, 8, 4);
  scene.add(fill);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.22,
    0.45,
    0.42,
  );
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const clock = new THREE.Clock();
  let raf = 0;
  let running = true;
  const pointer = { x: 0, y: 0 };

  function tick() {
    if (!running) return;
    uniforms.uTime.value = clock.getElapsedTime();
    camPos.lerp(camGoal, 0.04);
    lookPos.lerp(lookGoal, 0.04);
    camera.position.set(
      camPos.x + pointer.x * 0.42,
      camPos.y + pointer.y * 0.14,
      camPos.z,
    );
    camera.lookAt(lookPos.x + pointer.x * 0.28, lookPos.y, lookPos.z);
    composer.render();
    raf = requestAnimationFrame(tick);
  }

  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function onVisibility() {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
      return;
    }
    if (!running) {
      running = true;
      clock.getElapsedTime();
      raf = requestAnimationFrame(tick);
    }
  }

  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibility);
  raf = requestAnimationFrame(tick);

  return {
    setPointer(x, y) {
      pointer.x = x;
      pointer.y = y;
      uniforms.uMouse.value.set(x, y);
    },
    setLook({ mode = "landing" } = {}) {
      const look = LOOKS[mode] || LOOKS.gallery;
      camGoal.copy(look.cam);
      lookGoal.copy(look.look);
      bloom.strength = mode === "landing" ? 0.22 : 0.08;
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      panels.dispose();
      screenMat.dispose();
      composer.dispose();
      renderer.dispose();
    },
  };
}
