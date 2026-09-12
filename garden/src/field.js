import * as THREE from "three";
import { Reflector } from "three/addons/objects/Reflector.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
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
    float pulse = 1.0 + 0.028 * sin(t * 0.32 + aSeed * 6.2831);
    p *= pulse;

    vec2 d = p.xy - uMouse;
    float dist = length(d);
    float falloff = smoothstep(2.2, 0.08, dist);
    float influence = uRepel * falloff;
    if (dist > 1e-4) {
      vec2 dir = d / dist;
      p.xy += dir * influence * (0.5 + 0.4 * aDensity);
      p.z += influence * 0.45 * aDensity;
    }

    p.x += sin(t * 0.2 + p.z * 1.4 + aSeed) * 0.02;
    p.y += cos(t * 0.16 + p.x * 1.2) * 0.016;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float sz = uSize * (0.5 + 1.15 * aDensity) * uPixelRatio * (4.2 / max(0.5, -mv.z));
    gl_PointSize = clamp(sz, 0.8, 10.0);
  }
`;

const pointFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vDensity;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float box = max(abs(uv.x), abs(uv.y));
    if (box > 0.5) discard;
    float core = 1.0 - smoothstep(0.1, 0.28, box);
    float halo = (1.0 - smoothstep(0.18, 0.5, box)) * 0.42;
    float alpha = (core + halo) * uOpacity * (0.4 + 0.6 * vDensity);
    if (alpha < 0.025) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

function frameMolding(w, h, depth, thick) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0x0c0c0c,
    roughness: 0.38,
    metalness: 0.14,
  });
  const lip = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.55,
    metalness: 0.04,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.12,
  });
  const top = new THREE.Mesh(new THREE.BoxGeometry(w + thick * 2, thick, depth), mat);
  top.position.y = h / 2 + thick / 2;
  const bot = new THREE.Mesh(new THREE.BoxGeometry(w + thick * 2, thick, depth), mat);
  bot.position.y = -(h / 2 + thick / 2);
  const left = new THREE.Mesh(new THREE.BoxGeometry(thick, h, depth), mat);
  left.position.x = -(w / 2 + thick / 2);
  const right = new THREE.Mesh(new THREE.BoxGeometry(thick, h, depth), mat);
  right.position.x = w / 2 + thick / 2;
  const innerW = w - 0.08;
  const innerH = h - 0.08;
  const innerD = depth * 0.45;
  const lipTop = new THREE.Mesh(new THREE.BoxGeometry(innerW, 0.05, innerD), lip);
  lipTop.position.set(0, h / 2 - 0.04, depth * 0.18);
  const lipBot = new THREE.Mesh(new THREE.BoxGeometry(innerW, 0.05, innerD), lip);
  lipBot.position.set(0, -(h / 2 - 0.04), depth * 0.18);
  const lipL = new THREE.Mesh(new THREE.BoxGeometry(0.05, innerH, innerD), lip);
  lipL.position.set(-(w / 2 - 0.04), 0, depth * 0.18);
  const lipR = new THREE.Mesh(new THREE.BoxGeometry(0.05, innerH, innerD), lip);
  lipR.position.set(w / 2 - 0.04, 0, depth * 0.18);
  g.add(top, bot, left, right, lipTop, lipBot, lipL, lipR);
  return g;
}

function corona(w, h, opacity) {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    }),
  );
}

/**
 * 3/4 room → into the sculpture that sticks out of the frame.
 */
const RAIL = [
  {
    cam: new THREE.Vector3(6.4, 1.42, 12.6),
    look: new THREE.Vector3(-1.9, 2.85, -5.4),
  },
  {
    cam: new THREE.Vector3(3.05, 2.05, 5.1),
    look: new THREE.Vector3(-1.35, 3.15, -5.8),
  },
  {
    cam: new THREE.Vector3(0.35, 3.2, 0.35),
    look: new THREE.Vector3(-1.15, 3.35, -7.6),
  },
];

const PARK = {
  gallery: {
    cam: new THREE.Vector3(6.2, 1.45, 12.4),
    look: new THREE.Vector3(-1.9, 2.85, -5.4),
  },
  read: {
    cam: new THREE.Vector3(6.2, 1.45, 12.4),
    look: new THREE.Vector3(-1.9, 2.85, -5.4),
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
 * Physical screening room: dark walls, mirror floor, gyroid as a
 * sculpture coming out of a glowing frame. Pointer ignored off landing.
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
  renderer.setClearColor(0x050505, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x050505, 16, 40);
  scene.background = new THREE.Color(0x050505);

  const camera = new THREE.PerspectiveCamera(
    32,
    window.innerWidth / window.innerHeight,
    0.1,
    90,
  );
  const camPos = RAIL[0].cam.clone();
  const lookPos = RAIL[0].look.clone();
  const camGoal = RAIL[0].cam.clone();
  const lookGoal = RAIL[0].look.clone();
  camera.position.copy(camPos);
  camera.lookAt(lookPos);

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.88,
    metalness: 0.03,
  });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), wallMat);
  back.position.set(0, 5.1, -9.55);
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(24, 12), wallMat.clone());
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-11.2, 5.1, -0.4);
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(24, 12), wallMat.clone());
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(11.2, 5.1, -0.4);
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 24),
    new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 1, metalness: 0 }),
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 8.4;
  scene.add(back, leftWall, rightWall, ceiling);

  const skirtingMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    roughness: 0.55,
    metalness: 0.08,
  });
  const skirtingBack = new THREE.Mesh(new THREE.BoxGeometry(22.4, 0.12, 0.08), skirtingMat);
  skirtingBack.position.set(0, 0.06, -9.5);
  const skirtingLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 19), skirtingMat);
  skirtingLeft.position.set(-11.16, 0.06, -0.5);
  const skirtingRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 19), skirtingMat);
  skirtingRight.position.set(11.16, 0.06, -0.5);
  scene.add(skirtingBack, skirtingLeft, skirtingRight);

  const floorSize = 768 * Math.min(window.devicePixelRatio || 1, 2);
  const floor = new Reflector(new THREE.PlaneGeometry(34, 34), {
    clipBias: 0.003,
    textureWidth: floorSize,
    textureHeight: floorSize,
    color: 0x3a3a3a,
  });
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const frameX = -1.75;
  const screenW = 5.55;
  const screenH = 5.55;
  const screenZ = -8.05;
  const screenY = 3.35;

  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(screenW, screenH),
    new THREE.MeshBasicMaterial({ color: 0x0a0a0a }),
  );
  plate.position.set(frameX, screenY, screenZ);

  const molding = frameMolding(screenW, screenH, 0.48, 0.16);
  molding.position.set(frameX, screenY, screenZ + 0.18);

  const glowA = corona(screenW + 0.35, screenH + 0.35, 0.055);
  glowA.position.set(frameX, screenY, screenZ + 0.26);
  scene.add(plate, molding, glowA);

  const sample = buildGyroid(24000);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(sample.positions, 3));
  geo.setAttribute("aDensity", new THREE.BufferAttribute(sample.densities, 1));
  const seeds = new Float32Array(sample.count);
  for (let i = 0; i < sample.count; i += 1) seeds[i] = Math.random();
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

  const uniforms = {
    uSize: { value: 2.15 },
    uPixelRatio: { value: renderer.getPixelRatio() },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(99, 99) },
    uRepel: { value: 0.38 },
    uColor: { value: new THREE.Color("#f0f0f0") },
    uOpacity: { value: 0.9 },
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
  const gyroidHalf = 2.2;
  const scaleXY = 1.22;
  const scaleZ = 2.05;
  pts.scale.set(scaleXY, scaleXY, scaleZ);
  // Push the lattice forward of the plate so it reads as a relief / sculpture.
  pts.position.set(frameX, screenY, screenZ + gyroidHalf * scaleZ * 0.7);
  scene.add(pts);

  const area = new THREE.RectAreaLight(0xf4f4f4, 22, screenW, screenH);
  area.position.set(frameX, screenY, screenZ + 0.55);
  area.lookAt(frameX, screenY, 6);
  scene.add(area);

  const key = new THREE.PointLight(0xffffff, 32, 18, 1.6);
  key.position.set(frameX, screenY, screenZ + 2.6);
  scene.add(key);

  const inner = new THREE.PointLight(0xffffff, 12, 7, 2);
  inner.position.set(frameX, screenY, screenZ + 0.9);
  scene.add(inner);

  const rim = new THREE.PointLight(0xffffff, 16, 16, 1.8);
  rim.position.set(4.4, 5.8, -1.4);
  scene.add(rim);

  const bounce = new THREE.PointLight(0xffffff, 8, 12, 2);
  bounce.position.set(frameX, 0.6, 1.2);
  scene.add(bounce);

  const cove = new THREE.RectAreaLight(0xffffff, 3.2, 16, 1.2);
  cove.position.set(0, 8.15, -1);
  cove.lookAt(0, 0, -1);
  scene.add(cove);

  const spot = new THREE.SpotLight(0xffffff, 55, 22, Math.PI / 6.5, 0.62, 1.4);
  spot.position.set(1.4, 7.6, 3.2);
  const spotTarget = new THREE.Object3D();
  spotTarget.position.set(frameX, screenY, screenZ + 1.4);
  scene.add(spotTarget);
  spot.target = spotTarget;
  scene.add(spot);

  scene.add(new THREE.AmbientLight(0xffffff, 0.06));

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.46,
    0.58,
    0.38,
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
      const u = Math.sin((t / 24) * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5;
      railAt(u, railCam, railLook);
      camGoal.copy(railCam);
      lookGoal.copy(railLook);
      pts.rotation.y = Math.sin(t * 0.07) * 0.1;
      pts.rotation.x = Math.sin(t * 0.05) * 0.03;
      area.intensity = 20 + 3 * Math.sin(t * 0.4);
      bloom.strength = 0.44 + 0.05 * Math.sin(t * 0.4);
    } else {
      uniforms.uTime.value = holdTime;
    }
    camPos.lerp(camGoal, 0.042);
    lookPos.lerp(lookGoal, 0.042);
    const px = followPointer ? pointer.x * 0.2 : 0;
    const py = followPointer ? pointer.y * 0.07 : 0;
    camera.position.set(camPos.x + px, camPos.y + py, camPos.z);
    camera.lookAt(lookPos.x + px * 0.35, lookPos.y, lookPos.z);
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
      uniforms.uMouse.value.set(x * 1.2, y * 0.9);
    },
    setLook({ mode = "landing" } = {}) {
      railOn = mode === "landing";
      followPointer = mode === "landing";
      if (!followPointer) {
        pointer.x = 0;
        pointer.y = 0;
        uniforms.uMouse.value.set(99, 99);
      }
      uniforms.uOpacity.value = mode === "landing" ? 0.9 : 0.32;
      bloom.strength = mode === "landing" ? 0.46 : 0.1;
      key.intensity = mode === "landing" ? 32 : 10;
      area.intensity = mode === "landing" ? 22 : 6;
      inner.intensity = mode === "landing" ? 12 : 4;
      spot.intensity = mode === "landing" ? 55 : 12;
      glowA.material.opacity = mode === "landing" ? 0.055 : 0.02;
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
