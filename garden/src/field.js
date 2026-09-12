import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { buildGyroid } from "../../src/forms.js";

const pointVert = /* glsl */ `
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

const pointFrag = /* glsl */ `
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

function hairlineBox(w, d, color = 0xffffff, opacity = 0.12) {
  const hw = w / 2;
  const hd = d / 2;
  const y = 0.002;
  const pts = new Float32Array([
    -hw, y, hd, hw, y, hd,
    hw, y, hd, hw, y, -hd,
    hw, y, -hd, -hw, y, -hd,
    -hw, y, -hd, -hw, y, hd,
  ]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
  return new THREE.LineSegments(
    geo,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
}

function hairlineFrame(w, h, color = 0xffffff, opacity = 0.22) {
  const hw = w / 2;
  const hh = h / 2;
  const pts = new Float32Array([
    -hw, -hh, 0, hw, -hh, 0,
    hw, -hh, 0, hw, hh, 0,
    hw, hh, 0, -hw, hh, 0,
    -hw, hh, 0, -hw, -hh, 0,
  ]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
  return new THREE.LineSegments(
    geo,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
}

/** Far room → inside the gyroid. Ping-pong on landing. */
const RAIL = [
  {
    cam: new THREE.Vector3(2.55, 1.5, 14.4),
    look: new THREE.Vector3(-0.15, 2.55, -8.0),
  },
  {
    cam: new THREE.Vector3(0.85, 2.15, 6.0),
    look: new THREE.Vector3(-0.1, 2.85, -8.2),
  },
  {
    cam: new THREE.Vector3(0.05, 3.05, -4.2),
    look: new THREE.Vector3(-0.05, 3.15, -10.0),
  },
];

const PARK = {
  gallery: {
    cam: new THREE.Vector3(2.4, 1.55, 14.4),
    look: new THREE.Vector3(-0.15, 2.55, -8.0),
  },
  read: {
    cam: new THREE.Vector3(2.4, 1.55, 14.4),
    look: new THREE.Vector3(-0.15, 2.55, -8.0),
  },
};

function railAt(u, camOut, lookOut) {
  const t = u * (RAIL.length - 1);
  const i = Math.min(Math.floor(t), RAIL.length - 2);
  const f = t - i;
  const s = f * f * (3 - 2 * f);
  camOut.lerpVectors(RAIL[i].cam, RAIL[i + 1].cam, s);
  lookOut.lerpVectors(RAIL[i].look, RAIL[i + 1].look, s);
}

/**
 * Abstract screening room: hairline floor + square, gyroid particles, railed camera.
 * Pointer is ignored off the landing so the gallery does not swim.
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
  scene.fog = new THREE.Fog(0x000000, 7, 28);
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(
    32,
    window.innerWidth / window.innerHeight,
    0.1,
    80,
  );
  const camPos = RAIL[0].cam.clone();
  const lookPos = RAIL[0].look.clone();
  const camGoal = RAIL[0].cam.clone();
  const lookGoal = RAIL[0].look.clone();
  camera.position.copy(camPos);
  camera.lookAt(lookPos);

  const screenW = 5.6;
  const screenH = 5.6;
  const screenZ = -8.15;
  const screenY = 3.2;

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(28, 28),
    new THREE.MeshBasicMaterial({ color: 0x050505 }),
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  const floorLines = hairlineBox(18, 18, 0xffffff, 0.1);
  scene.add(floorLines);

  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(screenW, screenH),
    new THREE.MeshBasicMaterial({ color: 0x1a1a1a }),
  );
  wall.position.set(-0.2, screenY, screenZ);
  const frame = hairlineFrame(screenW, screenH, 0xffffff, 0.28);
  frame.position.copy(wall.position);
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(screenW + 1.4, screenH + 1.4),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.03,
      depthWrite: false,
    }),
  );
  glow.position.set(-0.2, screenY, screenZ - 0.02);
  scene.add(glow, wall, frame);

  const sample = buildGyroid(18000);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(sample.positions, 3));
  geo.setAttribute("aDensity", new THREE.BufferAttribute(sample.densities, 1));
  const seeds = new Float32Array(sample.count);
  for (let i = 0; i < sample.count; i += 1) seeds[i] = Math.random();
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

  const uniforms = {
    uSize: { value: 1.7 },
    uPixelRatio: { value: renderer.getPixelRatio() },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(99, 99) },
    uRepel: { value: 0.45 },
    uColor: { value: new THREE.Color("#f0f0f0") },
    uOpacity: { value: 0.88 },
  };
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms,
    vertexShader: pointVert,
    fragmentShader: pointFrag,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  pts.scale.set(1.22, 1.22, 1.05);
  pts.position.set(-0.2, screenY, screenZ + 0.15);
  scene.add(pts);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.28,
    0.4,
    0.35,
  );
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const clock = new THREE.Clock();
  let raf = 0;
  let running = true;
  let railOn = true;
  let followPointer = true;
  let holdTime = 0;
  const pointer = { x: 0, y: 0 };
  const railCam = new THREE.Vector3();
  const railLook = new THREE.Vector3();

  function tick() {
    if (!running) return;
    const t = clock.getElapsedTime();
    if (railOn) {
      holdTime = t;
      uniforms.uTime.value = t;
      const u = Math.sin((t / 20) * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5;
      railAt(u, railCam, railLook);
      camGoal.copy(railCam);
      lookGoal.copy(railLook);
      pts.rotation.y = t * 0.04;
      pts.rotation.z = Math.sin(t * 0.07) * 0.04;
    } else {
      uniforms.uTime.value = holdTime;
    }
    camPos.lerp(camGoal, 0.045);
    lookPos.lerp(lookGoal, 0.045);
    const px = followPointer ? pointer.x * 0.28 : 0;
    const py = followPointer ? pointer.y * 0.1 : 0;
    camera.position.set(camPos.x + px, camPos.y + py, camPos.z);
    camera.lookAt(lookPos.x + px * 0.5, lookPos.y, lookPos.z);
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
      if (!followPointer) return;
      pointer.x = x;
      pointer.y = y;
      uniforms.uMouse.value.set(x * 1.4, y * 1.1);
    },
    setLook({ mode = "landing" } = {}) {
      railOn = mode === "landing";
      followPointer = mode === "landing";
      if (!followPointer) {
        pointer.x = 0;
        pointer.y = 0;
        uniforms.uMouse.value.set(99, 99);
      }
      uniforms.uOpacity.value = mode === "landing" ? 0.88 : 0.4;
      bloom.strength = mode === "landing" ? 0.28 : 0.08;
      if (mode !== "landing") {
        const park = PARK[mode] || PARK.gallery;
        camGoal.copy(park.cam);
        lookGoal.copy(park.look);
        pts.rotation.set(0, 0, 0);
      }
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      geo.dispose();
      mat.dispose();
      composer.dispose();
      renderer.dispose();
    },
  };
}
