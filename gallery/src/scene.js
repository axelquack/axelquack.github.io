import "aframe";
import { registerLiveField } from "./live-field.js";

/**
 * Physical plan (metres, +X east, +Y up, −Z into the building).
 * After oncyber “showcase” museums such as thecryptomasks:
 *   lobby → long nave → east/west galleries → rear hall.
 * Open doorways, no doors. WASD + look; mobile also has a HUD stick.
 */
const PAPER = "#f7f7f7";
const WALL = "#f4f4f4";
const FLOOR = "#dedede";
const CEIL = "#fafafa";
const INK = "#0a0a0a";
const SLOT = "#e4e4e4";
const LIGHT = "#ffffff";

const WALL_H = 4.4;
const HALL_H = 5.4;
const THICK = 0.18;
const EYE = 1.6;

/** Walkable AABBs (player radius is applied in contain-player). */
export const WALK = [
  { minX: -3.6, maxX: 3.6, minZ: 0.2, maxZ: 7.4 }, // lobby
  { minX: -4.15, maxX: 4.15, minZ: -26.2, maxZ: 0.6 }, // nave
  { minX: -13.6, maxX: -3.7, minZ: -20.4, maxZ: -8.6 }, // west
  { minX: 3.7, maxX: 13.6, minZ: -20.4, maxZ: -8.6 }, // east
  { minX: -7.6, maxX: 7.6, minZ: -35.6, maxZ: -25.6 }, // rear
  { minX: -4.4, maxX: -3.5, minZ: -15.4, maxZ: -13.2 }, // west door
  { minX: 3.5, maxX: 4.4, minZ: -15.4, maxZ: -13.2 }, // east door
  { minX: -1.7, maxX: 1.7, minZ: -26.8, maxZ: -25.4 }, // rear door
  { minX: -1.5, maxX: 1.5, minZ: -0.2, maxZ: 0.8 }, // lobby → nave
];

/**
 * Hang slots: wall-local centres. rotY is degrees (0 = face +Z).
 * Order is fill order for works.json.
 */
export const SLOTS = [
  // nave west (face +X)
  { x: -4.02, z: -3.2, rotY: 90 },
  { x: -4.02, z: -6.6, rotY: 90 },
  { x: -4.02, z: -10.0, rotY: 90 },
  { x: -4.02, z: -18.0, rotY: 90 },
  { x: -4.02, z: -21.4, rotY: 90 },
  { x: -4.02, z: -24.6, rotY: 90 },
  // nave east (face −X)
  { x: 4.02, z: -3.2, rotY: -90 },
  { x: 4.02, z: -6.6, rotY: -90 },
  { x: 4.02, z: -10.0, rotY: -90 },
  { x: 4.02, z: -18.0, rotY: -90 },
  { x: 4.02, z: -21.4, rotY: -90 },
  { x: 4.02, z: -24.6, rotY: -90 },
  // west gallery
  { x: -13.42, z: -11.2, rotY: 90 },
  { x: -13.42, z: -14.4, rotY: 90 },
  { x: -13.42, z: -17.6, rotY: 90 },
  { x: -8.8, z: -8.78, rotY: 180 },
  { x: -8.8, z: -20.22, rotY: 0 },
  // east gallery
  { x: 13.42, z: -11.2, rotY: -90 },
  { x: 13.42, z: -14.4, rotY: -90 },
  { x: 13.42, z: -17.6, rotY: -90 },
  { x: 8.8, z: -8.78, rotY: 180 },
  { x: 8.8, z: -20.22, rotY: 0 },
  // rear hall
  { x: -5.2, z: -35.42, rotY: 0 },
  { x: 0, z: -35.42, rotY: 0 },
  { x: 5.2, z: -35.42, rotY: 0 },
  { x: -7.42, z: -30.6, rotY: 90 },
  { x: 7.42, z: -30.6, rotY: -90 },
];

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    node.setAttribute(key, String(value));
  }
  for (const child of children) node.append(child);
  return node;
}

function box(x, y, z, w, h, d, color, extra = {}) {
  return el("a-box", {
    position: `${x} ${y} ${z}`,
    width: w,
    height: h,
    depth: d,
    color,
    material: extra.emissive
      ? `shader: flat; color: ${color}; emissive: ${extra.emissive}`
      : `shader: flat; color: ${color}`,
    ...extra.attrs,
  });
}

function wallX(x, z0, z1, height = WALL_H, y = WALL_H / 2) {
  const z = (z0 + z1) / 2;
  return box(x, y, z, THICK, height, Math.abs(z1 - z0), WALL);
}

function wallZ(z, x0, x1, height = WALL_H, y = WALL_H / 2) {
  const x = (x0 + x1) / 2;
  return box(x, y, z, Math.abs(x1 - x0), height, THICK, WALL);
}

function slab(y, x0, x1, z0, z1, color) {
  const x = (x0 + x1) / 2;
  const z = (z0 + z1) / 2;
  return box(x, y, z, Math.abs(x1 - x0), 0.08, Math.abs(z1 - z0), color);
}

function openingLintels(root) {
  // Lobby → nave (gap x -1.5..1.5 at z=0)
  root.append(wallZ(0, -4.2, -1.5, WALL_H));
  root.append(wallZ(0, 1.5, 4.2, WALL_H));
  root.append(box(0, 3.5, 0, 3.2, 1.4, THICK, WALL));
  // West door in nave (z -15.4..-13.2, x=-4.15)
  root.append(wallX(-4.15, 0.2, -13.2, HALL_H, HALL_H / 2));
  root.append(wallX(-4.15, -15.4, -26.2, HALL_H, HALL_H / 2));
  root.append(box(-4.15, 3.55, -14.3, THICK, 1.7, 2.4, WALL));
  // East door
  root.append(wallX(4.15, 0.2, -13.2, HALL_H, HALL_H / 2));
  root.append(wallX(4.15, -15.4, -26.2, HALL_H, HALL_H / 2));
  root.append(box(4.15, 3.55, -14.3, THICK, 1.7, 2.4, WALL));
  // Rear door (z=-26.2, gap x -1.7..1.7)
  root.append(wallZ(-26.2, -4.24, -1.7, HALL_H, HALL_H / 2));
  root.append(wallZ(-26.2, 1.7, 4.24, HALL_H, HALL_H / 2));
  root.append(box(0, 3.7, -26.2, 3.6, 1.4, THICK, WALL));
}

function building() {
  const root = el("a-entity", { id: "building" });

  // Floors
  root.append(slab(0, -3.8, 3.8, 0.2, 7.6, FLOOR)); // lobby
  root.append(slab(0, -4.3, 4.3, -26.2, 0.3, FLOOR)); // nave
  root.append(slab(0, -13.8, -4.0, -20.6, -8.4, FLOOR)); // west
  root.append(slab(0, 4.0, 13.8, -20.6, -8.4, FLOOR)); // east
  root.append(slab(0, -7.8, 7.8, -35.8, -26.0, FLOOR)); // rear

  // Ceilings
  root.append(slab(WALL_H, -3.8, 3.8, 0.2, 7.6, CEIL));
  root.append(slab(HALL_H, -4.3, 4.3, -26.2, 0.3, CEIL));
  root.append(slab(WALL_H, -13.8, -4.0, -20.6, -8.4, CEIL));
  root.append(slab(WALL_H, 4.0, 13.8, -20.6, -8.4, CEIL));
  root.append(slab(WALL_H, -7.8, 7.8, -35.8, -26.0, CEIL));

  // Skylight strip down the nave
  root.append(
    box(0, HALL_H - 0.06, -13, 1.4, 0.04, 24, LIGHT, { emissive: "#f3f3f3" })
  );

  // Lobby envelope
  root.append(wallZ(7.5, -3.8, 3.8)); // entrance wall (open? closed back)
  root.append(wallX(-3.7, 0.2, 7.5));
  root.append(wallX(3.7, 0.2, 7.5));

  // Nave outer long walls are split around doors in openingLintels
  // Nave north/south already handled. Outer nave isn't needed (side rooms).
  // West gallery envelope
  root.append(wallX(-13.7, -20.6, -8.4));
  root.append(wallZ(-8.5, -13.7, -4.15));
  root.append(wallZ(-20.5, -13.7, -4.15));
  // East gallery
  root.append(wallX(13.7, -20.6, -8.4));
  root.append(wallZ(-8.5, 4.15, 13.7));
  root.append(wallZ(-20.5, 4.15, 13.7));
  // Rear
  root.append(wallZ(-35.7, -7.8, 7.8));
  root.append(wallX(-7.7, -35.8, -26.2));
  root.append(wallX(7.7, -35.8, -26.2));
  root.append(wallZ(-26.2, -7.8, -4.24));
  root.append(wallZ(-26.2, 4.24, 7.8));

  openingLintels(root);

  // Plinth line along nave
  root.append(box(-4.05, 0.04, -13, 0.12, 0.08, 26, INK, { attrs: { opacity: 0.12 } }));
  root.append(box(4.05, 0.04, -13, 0.12, 0.08, 26, INK, { attrs: { opacity: 0.12 } }));

  return root;
}

function hanging(slot, work) {
  const empty = !work;
  const w = work?.width || 1.28;
  const h = work?.height || 1.0;
  const group = el("a-entity", {
    class: empty ? "slot" : "work",
    position: `${slot.x} ${EYE} ${slot.z}`,
    rotation: `0 ${slot.rotY} 0`,
    "data-kind": work?.kind || "",
    "data-id": work?.id || "",
  });
  group.append(
    el("a-box", {
      width: w + 0.05,
      height: h + 0.05,
      depth: 0.04,
      color: INK,
      opacity: empty ? 0.14 : 0.88,
      position: "0 0 -0.03",
      material: "shader: flat",
    }),
    work?.live && work.video
      ? el("a-plane", {
          class: "work",
          width: w,
          height: h,
          color: "#f7f7f7",
          material: "shader: flat; side: double",
          "select-work": work.id,
          "live-video": `src: ${work.video}`,
        })
      : work?.image
      ? el("a-plane", {
          class: "work",
          width: w,
          height: h,
          src: work.image,
          material: "shader: flat; side: double",
          "select-work": work.id,
        })
      : el("a-plane", {
          class: empty ? "slot" : "work",
          width: w,
          height: h,
          color: SLOT,
          material: "shader: flat",
          "select-work": empty ? undefined : work.id,
        })
  );
  if (work?.title) {
    group.append(
      el("a-text", {
        value: work.title,
        align: "center",
        width: "1.45",
        color: "#8a8a8a",
        position: `0 ${-h / 2 - 0.16} 0.02`,
      })
    );
  }
  return group;
}

export function hangWorks(works) {
  const wall = document.querySelector("#hangings");
  if (!wall) return;
  wall.replaceChildren();
  SLOTS.forEach((slot, i) => {
    wall.append(hanging(slot, works[i] || null));
  });
}

export function setKindVisible(kind) {
  for (const node of document.querySelectorAll("#hangings [data-kind]")) {
    const match = kind === "all" || !node.dataset.kind || node.dataset.kind === kind;
    node.setAttribute("visible", match ? "true" : "false");
  }
}

/** Analog walk vector from the mobile HUD stick (x = strafe, y = screen-Y / −Z). */
export const moveStick = { x: 0, y: 0 };

export function setMoveStick(x, y) {
  moveStick.x = x;
  moveStick.y = y;
}

function register() {
  const AFRAME = window.AFRAME;
  const THREE = window.THREE;
  registerLiveField();
  if (!AFRAME.components["select-work"]) {
    AFRAME.registerComponent("select-work", {
      schema: { type: "string", default: "" },
      init() {
        this.el.classList.add("work");
        this.el.addEventListener("click", () => {
          const id = this.data || this.el.getAttribute("select-work");
          if (id) {
            window.dispatchEvent(new CustomEvent("gallery-select", { detail: id }));
          }
        });
      },
    });
  }
  if (!AFRAME.components["stick-move"]) {
    AFRAME.registerComponent("stick-move", {
      schema: { speed: { type: "number", default: 1.15 } },
      init() {
        this.dir = new THREE.Vector3();
        this.euler = new THREE.Euler(0, 0, 0, "YXZ");
      },
      tick(_t, dt) {
        const x = moveStick.x;
        const y = moveStick.y;
        if (x === 0 && y === 0) return;
        const yaw = this.el.getAttribute("rotation")?.y || 0;
        const delta = Math.min(dt, 50) / 1000;
        this.dir.set(x, 0, y);
        this.euler.set(0, THREE.MathUtils.degToRad(yaw), 0);
        this.dir.applyEuler(this.euler);
        this.dir.multiplyScalar(this.data.speed * delta);
        this.el.object3D.position.add(this.dir);
      },
    });
  }
  if (!AFRAME.components["contain-player"]) {
    AFRAME.registerComponent("contain-player", {
      schema: { radius: { type: "number", default: 0.35 } },
      tick() {
        const obj = this.el.object3D;
        const r = this.data.radius;
        const x = obj.position.x;
        const z = obj.position.z;
        const ok = WALK.some(
          (b) =>
            x >= b.minX + r &&
            x <= b.maxX - r &&
            z >= b.minZ + r &&
            z <= b.maxZ - r
        );
        if (!ok) {
          if (this._last) {
            obj.position.x = this._last.x;
            obj.position.z = this._last.z;
          }
          return;
        }
        this._last = { x, z };
      },
    });
  }
}

export function buildScene() {
  register();
  const scene = el("a-scene", {
    id: "gallery-scene",
    background: `color: ${PAPER}`,
    renderer: "colorManagement: true; alpha: false",
    "xr-mode-ui": "enabled: false",
    webxr: "optionalFeatures: local-floor, bounded-floor",
    cursor: "rayOrigin: mouse",
    raycaster: "objects: .work",
    fog: `type: linear; color: ${PAPER}; near: 18; far: 42`,
  });

  const hangings = el("a-entity", { id: "hangings" });
  const camera = el("a-camera", {
    position: `0 ${EYE} 5.2`,
    "look-controls": "pointerLockEnabled: true",
    "wasd-controls": "acceleration: 22",
    "stick-move": "speed: 1.15",
    "contain-player": "radius: 0.32",
  });

  scene.append(
    building(),
    hangings,
    camera,
    el("a-entity", {
      light: "type: ambient; color: #ffffff; intensity: 0.78",
    }),
    el("a-entity", {
      light: "type: directional; color: #ffffff; intensity: 0.22",
      position: "4 8 2",
    })
  );
  return scene;
}
