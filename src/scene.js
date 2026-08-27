import * as THREE from "three";
import { sampleTextPoints } from "./ascii.js";
import { buildHelicoid, buildTorusKnot } from "./forms.js";

/**
 * name  — AQ density letterform (static lattice + pointer warp)
 * mono  — auto-rotating hyperbolic helicoid
 * talk  — auto-rotating torus knot (white on black)
 */

const letterVertex = /* glsl */ `
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

    vec2 d = p.xy - uMouse;
    float dist = length(d);
    float falloff = smoothstep(2.8, 0.05, dist);
    float influence = uRepel * falloff;
    if (dist > 1e-4) {
      vec2 dir = d / dist;
      p.xy += dir * influence * (0.55 + 0.45 * aDensity);
      p.x += dir.y * influence * 0.35;
      p.y -= dir.x * influence * 0.2;
    }
    p.z += influence * 0.5 * aDensity;

    float j = 0.006 * (1.0 - aDensity);
    p.x += sin(uTime * 0.7 + aSeed * 40.0) * j;
    p.y += cos(uTime * 0.55 + aSeed * 33.0) * j;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float sizeBoost = 0.65 + 0.9 * aDensity;
    float sz = uSize * sizeBoost * uPixelRatio * (4.0 / max(0.55, -mv.z));
    gl_PointSize = clamp(sz, 0.8, 10.0);
  }
`;

const formVertex = /* glsl */ `
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uTime;
  uniform float uSpin;
  attribute float aDensity;
  attribute float aSeed;
  varying float vDensity;

  // Auto morph / breath on the surface
  void main() {
    vec3 p = position;
    vDensity = aDensity;

    float t = uTime;
    // gentle radial pulse + seed noise — form stays mathematical
    float pulse = 1.0 + 0.04 * sin(t * 0.55 + aSeed * 6.2831)
                      + 0.02 * sin(t * 1.1 + p.y * 2.0);
    p *= pulse;

    // slow travelling wave along the form
    p.x += sin(t * 0.35 + p.z * 1.4 + aSeed) * 0.04;
    p.y += cos(t * 0.28 + p.x * 1.2) * 0.035;
    p.z += sin(t * 0.4 + p.y * 1.1) * 0.03;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float sizeBoost = 0.55 + 0.95 * aDensity;
    float sz = uSize * sizeBoost * uPixelRatio * (3.8 / max(0.55, -mv.z));
    gl_PointSize = clamp(sz, 0.7, 9.0);
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
    float alpha = fill * uOpacity * (0.35 + 0.65 * vDensity);
    if (alpha < 0.03) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

function makePoints(sample, baseSize, kind /* 'letter' | 'form' */) {
  const { positions, densities, count } = sample;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute(
    "aDensity",
    new THREE.BufferAttribute(
      densities.length === count ? densities : new Float32Array(count).fill(0.8),
      1
    )
  );
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) seeds[i] = Math.random();
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

  const isForm = kind === "form";
  const uniforms = {
    uSize: { value: baseSize },
    uPixelRatio: { value: 1 },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#0a0a0a") },
    uOpacity: { value: 0 },
  };

  if (isForm) {
    uniforms.uSpin = { value: 0 };
  } else {
    uniforms.uMouse = { value: new THREE.Vector2(99, 99) };
    uniforms.uRepel = { value: 0.85 };
  }

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms,
    vertexShader: isForm ? formVertex : letterVertex,
    fragmentShader,
  });

  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  pts.userData.kind = kind;
  return pts;
}

export function createScene(canvas) {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    return {
      setSceneState() {},
      setPointer() {},
      setDragging() {},
      destroy() {},
    };
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    36,
    window.innerWidth / window.innerHeight,
    0.1,
    50
  );
  camera.position.z = 6.5;

  // Separate groups: letter stays flat; forms spin freely
  const letterGroup = new THREE.Group();
  const formGroup = new THREE.Group();
  scene.add(letterGroup);
  scene.add(formGroup);

  const nameSample = sampleTextPoints("AQ", {
    width: 1400,
    height: 1000,
    fontSize: 620,
    fontWeight: "700",
    fontFamily: "Georgia, 'Times New Roman', Times, serif",
    cell: 3,
    maxPoints: 32000,
    scaleX: 7.2,
    scaleY: 5.6,
    threshold: 205,
  });

  const nameCloud = makePoints(nameSample, 1.9, "letter");
  nameCloud.material.uniforms.uColor.value.set("#0a0a0a");
  letterGroup.add(nameCloud);

  // §3: auto-moving hyperbolic helicoid
  const helicoidCloud = makePoints(buildHelicoid(14000), 1.5, "form");
  helicoidCloud.material.uniforms.uColor.value.set("#121212");
  formGroup.add(helicoidCloud);

  // §5: auto-moving torus knot (white)
  const knotCloud = makePoints(buildTorusKnot(12000, 3, 2), 1.45, "form");
  knotCloud.material.uniforms.uColor.value.set("#f0f0f0");
  formGroup.add(knotCloud);

  const maxOpacity = { name: 0.78, mono: 0.58, talk: 0.55 };

  const clouds = {
    name: nameCloud,
    mono: helicoidCloud,
    talk: knotCloud,
  };

  let mode = "name";
  let targetMode = "name";
  let visibility = 0;
  let targetVisibility = 0;

  let pointerX = 0;
  let pointerY = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let dragYaw = 0;
  let dragPitch = 0;
  let targetDragYaw = 0;
  let targetDragPitch = 0;
  let dragging = false;

  // continuous auto spin for math forms
  let autoYaw = 0;
  let autoPitch = 0;

  let running = true;
  let raf = 0;
  let lastT = 0;
  const clock = new THREE.Clock();
  const mouseWorld = new THREE.Vector2(99, 99);

  const onResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    const pr = Math.min(window.devicePixelRatio || 1, 2);
    for (const c of Object.values(clouds)) {
      c.material.uniforms.uPixelRatio.value = pr;
    }
  };
  onResize();

  const onVis = () => {
    running = document.visibilityState === "visible";
    if (running) loop();
  };
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVis);

  function loop() {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    const t = clock.getElapsedTime();
    const dt = Math.min(Math.max(t - lastT, 0), 0.05);
    lastT = t;

    visibility += (targetVisibility - visibility) * 0.08;
    pointerX += (targetPointerX - pointerX) * 0.12;
    pointerY += (targetPointerY - pointerY) * 0.12;
    dragYaw += (targetDragYaw - dragYaw) * (dragging ? 0.25 : 0.06);
    dragPitch += (targetDragPitch - dragPitch) * (dragging ? 0.25 : 0.06);
    if (!dragging) {
      targetDragYaw *= 0.97;
      targetDragPitch *= 0.97;
    }

    mode = targetMode;
    mouseWorld.set(pointerX * 3.6, pointerY * 2.3);

    // Continuous auto motion for abstract forms
    const spinRate = mode === "talk" ? 0.28 : 0.35;
    autoYaw += dt * spinRate;
    autoPitch = Math.sin(t * 0.22) * 0.35 + Math.cos(t * 0.13) * 0.12;

    for (const [key, cloud] of Object.entries(clouds)) {
      const want = key === mode ? visibility * (maxOpacity[key] ?? 0.7) : 0;
      const cur = cloud.material.uniforms.uOpacity.value;
      const next = cur + (want - cur) * 0.1;
      cloud.material.uniforms.uOpacity.value = next;
      cloud.visible = next > 0.015;
      cloud.material.uniforms.uTime.value = t;

      if (cloud.userData.kind === "letter") {
        cloud.material.uniforms.uMouse.value.copy(mouseWorld);
        cloud.material.uniforms.uRepel.value = dragging ? 0.25 : 0.95;
      }
    }

    // Letter: subtle pointer tilt only
    letterGroup.rotation.y = dragYaw * 0.35 + pointerX * 0.04;
    letterGroup.rotation.x = dragPitch * 0.3 + pointerY * 0.03;
    letterGroup.visible = mode === "name";

    // Forms: primary auto rotation (+ light pointer influence)
    const formActive = mode === "mono" || mode === "talk";
    formGroup.visible = formActive;
    if (formActive) {
      formGroup.rotation.y = autoYaw + dragYaw * 0.5 + pointerX * 0.15;
      formGroup.rotation.x = autoPitch + dragPitch * 0.4 + pointerY * 0.1;
      formGroup.rotation.z = Math.sin(t * 0.17) * 0.12;
      helicoidCloud.visible =
        helicoidCloud.material.uniforms.uOpacity.value > 0.015;
      knotCloud.visible = knotCloud.material.uniforms.uOpacity.value > 0.015;
    }

    camera.position.x = pointerX * 0.1;
    camera.position.y = pointerY * 0.06;
    camera.position.z = mode === "talk" || mode === "mono" ? 6.8 : 6.5;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  loop();

  return {
    setSceneState({ mode: m, amount }) {
      if (m && m !== "none") targetMode = m;
      targetVisibility = m === "none" ? 0 : Math.max(0, Math.min(1, amount));
    },
    setPointer(nx, ny) {
      if (dragging) return;
      targetPointerX = nx;
      targetPointerY = ny;
    },
    setDragging(isDown, dx = 0, dy = 0) {
      dragging = isDown;
      if (isDown) {
        targetDragYaw += dx * 0.006;
        targetDragPitch += dy * 0.005;
      }
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      for (const c of Object.values(clouds)) {
        c.geometry.dispose();
        c.material.dispose();
      }
      renderer.dispose();
    },
  };
}
