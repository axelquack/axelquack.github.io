import * as THREE from "three";
import { buildGyroid, buildTorusKnot } from "../../src/forms.js";

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
    float pulse = 1.0 + 0.035 * sin(t * 0.4 + aSeed * 6.2831);
    p *= pulse;

    vec2 d = p.xy - uMouse;
    float dist = length(d);
    float falloff = smoothstep(3.2, 0.08, dist);
    float influence = uRepel * falloff;
    if (dist > 1e-4) {
      vec2 dir = d / dist;
      p.xy += dir * influence * (0.7 + 0.4 * aDensity);
      p.x += dir.y * influence * 0.45;
      p.z += influence * 0.6 * aDensity;
    }

    p.x += sin(t * 0.32 + p.z * 1.6 + aSeed) * 0.05;
    p.y += cos(t * 0.25 + p.x * 1.3) * 0.04;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float sz = uSize * (0.55 + 0.95 * aDensity) * uPixelRatio * (4.0 / max(0.55, -mv.z));
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

/**
 * Gyroid point field bound to a canvas element (slide-local sizing).
 */
export function createField(
  canvas,
  { count = 9000, color = "#121212", opacity = 0.58, form = "gyroid" } = {},
) {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    return { setPointer() {}, destroy() {} };
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.set(0.4, 0.15, 6.4);

  const sample =
    form === "knot" ? buildTorusKnot(count, 3, 2) : buildGyroid(count);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(sample.positions, 3));
  geo.setAttribute("aDensity", new THREE.BufferAttribute(sample.densities, 1));
  const seeds = new Float32Array(sample.count);
  for (let i = 0; i < sample.count; i++) seeds[i] = Math.random();
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

  const uniforms = {
    uSize: { value: 1.4 },
    uPixelRatio: { value: 1 },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(99, 99) },
    uRepel: { value: 1.05 },
    uColor: { value: new THREE.Color(color) },
    uOpacity: { value: opacity },
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
  scene.add(pts);

  const clock = new THREE.Clock();
  let raf = 0;

  function size() {
    const parent = canvas.parentElement || canvas;
    const w = Math.max(1, parent.clientWidth || 1280);
    const h = Math.max(1, parent.clientHeight || 720);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    uniforms.uPixelRatio.value = dpr;
  }

  function frame() {
    const t = clock.getElapsedTime();
    uniforms.uTime.value = t;
    pts.rotation.y = t * 0.045;
    pts.rotation.x = Math.sin(t * 0.07) * 0.12;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  const ro =
    typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => size())
      : null;
  if (ro) ro.observe(canvas.parentElement || canvas);
  else window.addEventListener("resize", size);

  size();
  raf = requestAnimationFrame(frame);

  return {
    setPointer(x, y) {
      uniforms.uMouse.value.set(x * 2.8, y * 2.2);
    },
    destroy() {
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", size);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    },
  };
}
