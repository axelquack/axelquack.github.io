import * as THREE from "three";
import { Reflector } from "three/addons/objects/Reflector.js";
import { buildGyroid } from "../../src/forms.js";

const vertexShader = /* glsl */ `
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uRepel;
  attribute float aDensity;
  attribute float aSeed;
  varying float vDensity;

  void main() {
    vec3 p = position;
    vDensity = aDensity;

    float t = uTime;
    float pulse = 1.0 + 0.028 * sin(t * 0.4 + aSeed * 6.2831);
    p *= pulse;

    vec2 d = p.xy - uMouse;
    float dist = length(d);
    float falloff = smoothstep(2.4, 0.08, dist);
    float influence = uRepel * falloff;
    if (dist > 1e-4) {
      vec2 dir = d / dist;
      p.xy += dir * influence * (0.55 + 0.35 * aDensity);
      p.z += influence * 0.25 * aDensity;
    }

    p.x += sin(t * 0.28 + p.z * 2.2 + aSeed) * 0.03;
    p.y += cos(t * 0.22 + p.x * 1.8) * 0.025;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float sz = uSize * (0.55 + 0.95 * aDensity) * uPixelRatio * (4.0 / max(0.55, -mv.z));
    gl_PointSize = clamp(sz, 0.6, 7.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vDensity;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float box = max(abs(uv.x), abs(uv.y));
    if (box > 0.48) discard;
    float hole = smoothstep(0.12, 0.22, 0.5 - vDensity);
    float fill = 1.0 - hole * (1.0 - step(0.55, vDensity));
    float alpha = fill * uOpacity * (0.4 + 0.6 * vDensity);
    if (alpha < 0.03) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

function panelTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#080808";
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  const step = 128;
  for (let i = 0; i <= 4; i += 1) {
    const p = i * step + 0.5;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(512, p);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

function makeFigure() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0x050505,
    roughness: 0.92,
    metalness: 0,
  });
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.62, 4, 8), mat);
  torso.position.y = 1.08;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 12, 12), mat);
  head.position.y = 1.58;
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.55, 4, 8), mat);
  legL.position.set(-0.09, 0.42, 0.02);
  const legR = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.55, 4, 8), mat);
  legR.position.set(0.09, 0.42, 0.02);
  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.48, 4, 8), mat);
  armL.position.set(-0.24, 1.05, 0.04);
  armL.rotation.z = 0.06;
  const armR = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.48, 4, 8), mat);
  armR.position.set(0.24, 1.05, 0.04);
  armR.rotation.z = -0.06;
  g.add(torso, head, legL, legR, armL, armR);
  g.position.set(-1.65, 0, -4.55);
  g.rotation.y = 0.18;
  g.scale.setScalar(1.32);
  return g;
}

const LOOKS = {
  landing: {
    cam: new THREE.Vector3(2.05, 1.62, 9.1),
    look: new THREE.Vector3(4.35, 1.48, -6.8),
    spin: 1,
    opacity: 0.95,
  },
  gallery: {
    cam: new THREE.Vector3(1.4, 1.6, 10),
    look: new THREE.Vector3(2.4, 2.0, -7.4),
    spin: 0.7,
    opacity: 0.55,
  },
  read: {
    cam: new THREE.Vector3(2.4, 1.55, 7.6),
    look: new THREE.Vector3(4.1, 1.55, -7.0),
    spin: 0.55,
    opacity: 0.62,
  },
};

/**
 * CineShader-like screening room (garden only).
 * Gyroid lives on the far wall as the picture. Hidden when prefers-reduced-motion.
 */
export function createField(canvas) {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced || !canvas) {
    return { setPointer() {}, setLook() {}, destroy() {} };
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearColor(0x000000, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.78;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 7, 26);
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(
    36,
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
  panels.repeat.set(6, 2);
  const wallMat = new THREE.MeshStandardMaterial({
    map: panels,
    color: 0x1a1a1a,
    roughness: 0.92,
    metalness: 0,
  });

  const back = new THREE.Mesh(new THREE.PlaneGeometry(28, 9), wallMat);
  back.position.set(0, 4.2, -9.05);
  const left = new THREE.Mesh(new THREE.PlaneGeometry(22, 9), wallMat.clone());
  left.rotation.y = Math.PI / 2;
  left.position.set(-10.4, 4.2, -1);
  const right = new THREE.Mesh(new THREE.PlaneGeometry(22, 9), wallMat.clone());
  right.rotation.y = -Math.PI / 2;
  right.position.set(10.4, 4.2, -1);
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(28, 22),
    new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1, metalness: 0 }),
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 7.2;
  scene.add(back, left, right, ceiling);

  const floorSize = 512 * Math.min(window.devicePixelRatio || 1, 2);
  const floor = new Reflector(new THREE.PlaneGeometry(32, 32), {
    clipBias: 0.003,
    textureWidth: floorSize,
    textureHeight: floorSize,
    color: 0x1a1a1a,
  });
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  scene.add(floor);

  const screenW = 9.4;
  const screenH = 5.3;
  const screenZ = -8.05;
  const screenY = 2.55;
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(screenW, screenH),
    new THREE.MeshBasicMaterial({ color: 0x9a9a9a }),
  );
  screen.position.set(0, screenY, screenZ);
  const frameMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const screenFrame = new THREE.Mesh(
    new THREE.BoxGeometry(screenW + 0.18, screenH + 0.18, 0.08),
    frameMat,
  );
  screenFrame.position.set(0, screenY, screenZ - 0.06);
  scene.add(screenFrame, screen);

  const sample = buildGyroid(22000);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(sample.positions, 3));
  geo.setAttribute("aDensity", new THREE.BufferAttribute(sample.densities, 1));
  const seeds = new Float32Array(sample.count);
  for (let i = 0; i < sample.count; i++) seeds[i] = Math.random();
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

  const uniforms = {
    uSize: { value: 2.05 },
    uPixelRatio: { value: renderer.getPixelRatio() },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(99, 99) },
    uRepel: { value: 0.55 },
    uColor: { value: new THREE.Color("#f0f0f0") },
    uOpacity: { value: 0.95 },
  };

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms,
    vertexShader,
    fragmentShader,
  });

  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  pts.scale.set(2.05, 1.14, 0.1);
  pts.position.set(0, screenY, screenZ + 0.12);
  scene.add(pts);

  scene.add(new THREE.AmbientLight(0xffffff, 0.07));
  const rim = new THREE.PointLight(0xf0f0f0, 28, 14, 1.8);
  rim.position.set(0, screenY, screenZ + 0.55);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 0.22);
  fill.position.set(4, 6, 6);
  scene.add(fill);

  const figure = makeFigure();
  scene.add(figure);

  const clock = new THREE.Clock();
  let raf = 0;
  let running = true;
  let spin = LOOKS.landing.spin;
  const pointer = { x: 0, y: 0 };

  function tick() {
    if (!running) return;
    const t = clock.getElapsedTime();
    uniforms.uTime.value = t;
    pts.rotation.z = Math.sin(t * 0.07) * 0.04;
    pts.rotation.y = t * 0.03 * spin;
    camPos.lerp(camGoal, 0.045);
    lookPos.lerp(lookGoal, 0.045);
    camera.position.set(
      camPos.x + pointer.x * 0.55,
      camPos.y + pointer.y * 0.18,
      camPos.z,
    );
    camera.lookAt(lookPos.x + pointer.x * 0.35, lookPos.y, lookPos.z);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }

  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    uniforms.uPixelRatio.value = renderer.getPixelRatio();
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
      uniforms.uMouse.value.set(x * 1.6, y * 1.1);
    },
    setLook({ mode = "landing" } = {}) {
      uniforms.uColor.value.set("#f0f0f0");
      const look = LOOKS[mode] || LOOKS.gallery;
      camGoal.copy(look.cam);
      lookGoal.copy(look.look);
      spin = look.spin;
      uniforms.uOpacity.value = look.opacity;
      figure.visible = mode !== "gallery";
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      geo.dispose();
      mat.dispose();
      panels.dispose();
      renderer.dispose();
    },
  };
}
