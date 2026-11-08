// The cast of the balloon short as lit flat cards in the 3D world (template machinery from the Eiffel/Köpenick shorts:
// canvas pool, cardShade actors, multiply contact blobs, blinks). Our own 1979 cast: two families (fathers, mothers,
// four kids), border soldiers in plain grey-green without insignia, men in grey coats and hats, shop keepers, a
// neighbour. No real persons' likenesses, no emblems.
import * as THREE from "three";
import { Pen, bodyFront, bodySide, fxContact, fxShadow, fxPuff, fxSteam, fxSparkle,
  Outfit, Expr, FrontOpts, SideOpts, Item, INK, SKINS } from "./toon";
import {
  FPS, V3, SHOTS, Light, BOR, VIL, FOG, SEW, KIT, SHOP, BAY, at, clamp01, smooth, TOWER, TOWER_FLOOR, BARRIER, HOUSE_DOOR, SHOPS, CREW, CREW1,
  b1At, b2At, SOLDIER, SLAM, GLANCE, DOOR0, DOOR1, RIESIG, WET0, SINK0, FIND, SEARCH, NOD1, NOD2, BUMP, HAND, INFL0, INFL1, ROAR, LIFT, TOUCH, STANDUP, HUG,
} from "./story";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";


// ---------------- canvas pool ----------------
type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

// ---------------- sprite meshes ----------------
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
export const SU = 0.00216; // metres per design unit: 1000 units = 2.16 m
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);

export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false;
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false;
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  use(soft: boolean) { this.mesh.material = soft ? this.soft : this.mat; }
  bind() {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    } else { this.mat.map = t; this.soft.map = t; this.mesh.renderOrder = 0; }
  }
}

// ---------------- placements ----------------
export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; roll?: number; size?: [number, number, number];
};
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean; order?: number };
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; up: THREE.Vector3; sun: THREE.Vector3; quat: THREE.Quaternion };
export type Stage = { places: Place[]; fx: FxPlace[] };

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const q = (v: number, n = 120) => Math.round(v * n) / n;
const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
const tmp = new THREE.Vector3();
let SUN = new THREE.Vector3(0.5, 0.75, -0.4).normalize();
let LNAME: Light = "day";
const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = SUN.dot(cam.right) * (mirror ? -1 : 1), sy = -SUN.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};

// ---------------- life: blinks ----------------
const LEAD = 2 / FPS;
const LID = [0.5, 1, 1, 0.5];
const lidAt = (t: number, i: number, swaps: number[] = []) => {
  const f = Math.round(t * FPS);
  for (const ts of swaps) { const k = f - Math.round((ts - LEAD) * FPS) + 1; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hh(i * 31 + n, 13));
  }
  return 0;
};
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));
const ramp = (f: number, f0: number, n = 4) => clamp01((f - f0 + 1) / n);

type Who = { i: number; o: Outfit; okey: string };
type Pose = { x: number; y: number; z: number; face: number; scale?: number }; // face = yaw the person looks along (0 = +z)
const xyz = (p: V3) => ({ x: p[0], y: p[1], z: p[2] });

/** one character card: front or back view (from where the lens is relative to where they face) */
const person = (cam: CamInfo, who: Who, at2: Pose, fo: FrontOpts): Place => {
  const sc = at2.scale ?? 1;
  const d = cam.pos.distanceTo(tmp.set(at2.x, at2.y + 1.2 * sc, at2.z)) / sc;
  const [w, h, k] = tier(d);
  const tx = cam.pos.x - at2.x, tz = cam.pos.z - at2.z, tl = Math.hypot(tx, tz) || 1;
  const back = (Math.sin(at2.face) * tx + Math.cos(at2.face) * tz) / tl < -0.2;
  const light = light2D(cam, false), seed = (who.i % 7) + 1;
  const f2: FrontOpts = { ...fo, light, seed, back, ...(back ? { expr: "neutral" as Expr, blink: 0 } : {}) };
  return { key: `F|${who.okey}|${fkey(f2)}`, x: at2.x, y: at2.y, z: at2.z, scale: sc, size: [w, h, k], draw: (p) => bodyFront(p, who.o, f2) };
};
/** a walker in side view */
export const walkerSide = (cam: CamInfo, who: Who, at2: Pose, so: SideOpts, mirror: boolean): Place => {
  const sc = at2.scale ?? 1, d = cam.pos.distanceTo(tmp.set(at2.x, at2.y + 1.2, at2.z)) / sc, [w, h, k] = tier(d);
  const s2: SideOpts = { ...so, light: light2D(cam, mirror), seed: (who.i % 7) + 1 };
  return { key: `S|${who.okey}|${fkey(s2)}`, x: at2.x, y: at2.y, z: at2.z, scale: sc, mirror, size: [w, h, k], draw: (p) => bodySide(p, who.o, s2) };
};

// ---------------- contact shadows ----------------
const CONTACT: Record<Light, [number, number, number]> = {
  day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33], night: [0.22, 0.24, 0.42], indoor: [0.3, 0.24, 0.3], dusk: [0.24, 0.2, 0.36], morning: [0.28, 0.26, 0.34], fog: [0.3, 0.32, 0.46],
};
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1, tail = true) => {
  const hl = Math.hypot(SUN.x, SUN.z) || 1, ox = -SUN.x / hl, oz = -SUN.z / hl, rot = Math.atan2(-ox, -oz);
  if ((LNAME === "day" || LNAME === "dusk") && tail) {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, SUN.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h;
    const tc = hexOf(TAIL, k * (LNAME === "dusk" ? 0.7 : 1));
    out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c, w: 0.72 * sc, h, flat: true, rot });
  }
  const cc = hexOf(CONTACT[LNAME], k);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc,
    w: 0.52 * sc, h: 0.4 * sc, flat: true, rot });
};
const stand = (out: Stage, cam: CamInfo, who: Who, p: Pose, fo: FrontOpts, k = 1) => {
  out.places.push(person(cam, who, p, { mode: "stand", ...fo }));
  blob(out, p.x, p.y, p.z, p.scale ?? 1, k);
};
const faceTo = (x: number, z: number, tx: number, tz: number) => Math.atan2(tx - x, tz - z);
const puff = (out: Stage, f: number, f0: number, x: number, y: number, z: number, s = 1, rgb?: string) => {
  const u = (f - f0) / 9;
  if (u < 0 || u >= 1) return;
  out.fx.push({ key: `puff${q(u, 30)}${rgb ?? ""}`, cw: 300, ch: 300, draw: (p) => fxPuff(p, q(u, 30), rgb), x, y, z, w: 1.1 * s, h: 1.1 * s, soft: true });
};
const sparkle = (out: Stage, f: number, f0: number, x: number, y: number, z: number, s = 1) => {
  const u = (f - f0) / 26;
  if (u < 0 || u >= 1) return;
  out.fx.push({ key: `spark${q(u, 30)}`, cw: 500, ch: 500, draw: (p) => fxSparkle(p, q(u, 30)), x, y, z, w: 1.3 * s, h: 1.3 * s });
};


// ---------------- outfits (our own 1979 cast; no real likenesses) ----------------
// family A: father with dark hair + moustache (brown jacket, light-blue shirt), mother with an auburn perm, two boys
// family B: father with sandy hair + glasses (blue-grey anorak), mother with long fair hair, two kids
const FA_O: Outfit = { jacket: "#8a5a36", pants: "#3f4f74", boots: "#3a2a22", hat: "hair", hair: "#7a5232", moustache: "#5a3a26", shirt: "#cfe0ee", skin: SKINS[0] };
const FB_O: Outfit = { jacket: "#4a6a8a", pants: "#3b3f52", boots: "#2a2630", hat: "hair", hair: "#a8743c", glasses: "#2c2a33", collar: "#e8e2d6", skin: SKINS[1] };
const MA_O: Outfit = { jacket: "#b84a3a", pants: "#3b3f52", boots: "#4a3426", hat: "perm", hair: "#7a3a24", dress: "#b84a3a", skin: SKINS[0] };
const MB_O: Outfit = { jacket: "#e8dcc0", pants: "#3b3f52", boots: "#4a3426", hat: "longhair", hair: "#d6a64e", dress: "#4f8a6a", skin: SKINS[2] };
const KIDS: Outfit[] = [
  { jacket: "#e07a2a", pants: "#3b5b9a", boots: "#4a3426", hat: "hair", hair: "#33241c", build: "kid", skin: SKINS[0] },
  { jacket: "#e8c04a", pants: "#5a4a3a", boots: "#4a3426", hat: "cap", cap: "#c8453a", build: "kid", skin: SKINS[0] },
  { jacket: "#3f8fa0", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#a8743c", build: "kid", skin: SKINS[1] },
  { jacket: "#c25a7a", pants: "#3b5b9a", boots: "#4a3426", hat: "beanie", cap: "#3f6fb5", build: "kid", skin: SKINS[1] },
];
const OUT: Record<number, Outfit> = { 1: FA_O, 2: FB_O, 3: MA_O, 4: MB_O, 5: KIDS[0], 6: KIDS[1], 7: KIDS[2], 8: KIDS[3] };
const fam = (n: number): Who => ({ i: n, o: OUT[n], okey: "fam" + n });
const STASI: Outfit[] = [
  { jacket: "#7c7f84", pants: "#4a4c52", boots: INK, hat: "trilby", cap: "#55585e", coat: true, skin: SKINS[0], moustache: "#3a3036" },
  { jacket: "#868a8c", pants: "#4a4c52", boots: INK, hat: "trilby", cap: "#4a4c54", coat: true, skin: SKINS[2], glasses: "#2c2a33" },
  { jacket: "#72767c", pants: "#44464c", boots: INK, hat: "trilby", cap: "#5e6066", coat: true, skin: SKINS[1] },
];
const stasi = (k: number): Who => ({ i: 40 + k, o: STASI[k], okey: "stasi" + k });
const SOLDIER_O: Outfit = { jacket: "#6b7358", pants: "#5e664e", boots: INK, hat: "officer", cap: "#6b7358", band: "#4e5642", buttons: "#4e5642", skin: SKINS[1] };
const soldier = (k: number): Who => ({ i: 50 + k, o: { ...SOLDIER_O, skin: SKINS[(k + 1) % 4] }, okey: "sold" + k });
const KEEPERS: Outfit[] = [
  { jacket: "#7a6a9a", pants: "#4a4050", boots: "#2a2630", apron: "#f4f0e6", hat: "bald", hair: "#d0c8c0", glasses: "#2c2a33", moustache: "#d0c8c0", skin: SKINS[0] },
  { jacket: "#c88a3a", pants: "#4a4050", boots: "#4a3426", hat: "perm", hair: "#5a3a2a", dress: "#c88a3a", skin: SKINS[1] },
  { jacket: "#5a6a7a", pants: "#3a3f4a", boots: "#2a2630", apron: "#e8e2d6", hat: "hair", hair: "#2a2028", moustache: "#2a2028", skin: SKINS[2] },
];
const keeper = (k: number): Who => ({ i: 60 + k, o: KEEPERS[k], okey: "keep" + k });
const NEIGHBOUR: Who = { i: 70, o: { jacket: "#8a7aa8", pants: "#4a4050", boots: "#4a3426", hat: "perm", hair: "#e0dcd8", dress: "#6a7a9a", glasses: "#2c2a33", skin: SKINS[0] }, okey: "neigh" };
const ROLLS: Item[] = ["rollR", "rollB", "rollG", "rollY"];

const nodK = (f: number, f0: number, n = 2) => { const x = f - f0; return x < 0 || x > 8 * n ? 0 : 0.16 * Math.sin((Math.PI * x) / 8) ** 2; };

// =====================================================================================================
/** people on a balloon platform: adults crouch at the corners, kids sit at the edges */
const crew = (out: Stage, cam: CamInfo, t: number, f: number, base: V3, idx: number[], fo: (who: number, kid: boolean) => FrontOpts, stood = 0) => {
  for (const ci of idx) {
    const c = CREW[ci], x = base[0] + c.x, z = base[2] + c.z, y = base[1] + 0.06;
    const o = fo(c.who, c.kid);
    const mode = stood > 0.5 ? "stand" : c.kid ? "sit" : "crouch";
    out.places.push(person(cam, fam(c.who), { x, y, z, face: 0, scale: 0.86 }, { mode, blink: lidAt(t, c.who), ...o }));
    blob(out, x, y, z, 0.7, 0.9, false);
  }
};

// shots 1, 2, 14: the big balloon in flight (crew tiny or out of frame)
const flight = (cam: CamInfo, t: number, f: number, out: Stage, id: number) => {
  const B = b2At(id, f);
  crew(out, cam, t, f, B.pos, CREW.map((_, i) => i), (w, kid) => ({ arms: "lap", expr: kid ? "curious" : w <= 2 ? "determined" : "nervous", look: 0 }));
  if (id === 14) stand(out, cam, soldier(1), { ...xyz(at(TOWER, -1.6, TOWER_FLOOR, 1.2)), face: 0.6 }, { arms: "lap", expr: "stern", blink: lidAt(t, 51), facing: 1, look: 1 });
};

// shot 3: the soldier on the tower with binoculars (standing still); a second one by the barrier
const border = (cam: CamInfo, t: number, f: number, out: Stage) => {
  stand(out, cam, soldier(0), { ...xyz(SOLDIER), face: 0.4 }, { arms: "binocs", expr: "stern", blink: 0, facing: 0, look: 0 });
  const p = at(BOR, BARRIER.x + 1.5, 0, BARRIER.z - 0.9);
  stand(out, cam, soldier(2), { ...xyz(p), face: 0.9 }, { arms: f >= SLAM - 10 && f < SLAM + 12 ? "point" : "lap", hand: -1, k: ramp(f, SLAM - 10, 5), expr: "stern", blink: lidAt(t, 52), facing: -1, look: -1 });
};

// shot 4: the two fathers carry rolls along the street, stop at the door and glance round
const STOP = 294;
const street = (cam: CamInfo, t: number, f: number, out: Stage) => {
  for (const [w, x1, roll] of [[1, -0.95, "rollR"], [2, -1.95, "rollB"]] as const) {
    const z = HOUSE_DOOR[2] + 1.0;
    if (f < STOP) {
      const v = 1.6, dist = (v * (f - 254)) / FPS, x = HOUSE_DOOR[0] + x1 - (v * (STOP - 254)) / FPS + dist;
      out.places.push(walkerSide(cam, fam(w), { x, y: 0.12, z, face: Math.PI / 2 }, { mode: "march", phase: q((dist / (1.6 * 0.72) + (w - 1) * 0.43) % 1, 30), stride: 0.72, expr: "nervous", carry: roll }, false));
      blob(out, x, 0.12, z, 1, 0.9);
    } else {
      const g = f - GLANCE, side: 1 | -1 | 0 = g < 0 ? 0 : g < 8 ? -1 : g < 16 ? 1 : f >= DOOR0 ? 1 : 0;
      stand(out, cam, fam(w), { x: HOUSE_DOOR[0] + x1, y: 0.12, z, face: 0 }, { arms: "hold", item: roll, expr: f >= DOOR1 ? "sly" : "nervous", facing: side, look: side, blink: lidAt(t, w, [GLANCE / FPS]) });
    }
  }
  // the neighbour at her gate (standing, watching)
  stand(out, cam, NEIGHBOUR, { ...xyz(at(VIL, 3.0, 0.12, 5.3)), face: -0.6 }, { arms: "lap", expr: f >= GLANCE ? "curious" : "smile", facing: -1, look: -1, blink: lidAt(t, 70) });
};

// shot 5: the sewing room
const sewing = (cam: CamInfo, t: number, f: number, out: Stage) => {
  out.places.push(person(cam, fam(3), { ...xyz(at(SEW, 0.42, 0, -2.0)), face: 0 }, { mode: "chair", arms: "sew", wave: q((t * 2.2) % 1, 30), expr: "determined", facing: -1, look: -1, blink: lidAt(t, 3) }));
  stand(out, cam, fam(4), { ...xyz(at(SEW, 0.95, 0, -1.3)), face: -0.5 }, { arms: "hold", item: "rollY", expr: "smile", facing: -1, look: -1, blink: lidAt(t, 4) });
  stand(out, cam, fam(1), { ...xyz(at(SEW, -1.0, 0, -2.0)), face: 0.5 }, { arms: "hold", item: "rollG", expr: f >= RIESIG ? "proud" : "smile", facing: 1, look: 1, blink: lidAt(t, 1) });
};

// shot 7: the first balloon in the fog: one family crouching, getting worried; shot 8: they sneak off
const fogFlight = (cam: CamInfo, t: number, f: number, out: Stage) => {
  const B = b1At(7, f), wet = f >= WET0 + 10, sink = f >= SINK0;
  crew(out, cam, t, f, B.pos, CREW1, (w, kid) => ({ arms: "lap", expr: sink ? (kid ? "shock" : "nervous") : wet ? (kid ? "unsure" : "nervous") : kid ? "curious" : "determined", look: wet ? (w % 2 ? 1 : -1) : 0, facing: wet ? (w % 2 ? 1 : -1) : 0 }));
  // drifting fog banks round the lens
  for (let k = 0; k < 7; k++) {
    const ph = (t * 0.08 + k / 7) % 1, x = B.pos[0] + 14 - 28 * ph + 2 * Math.sin(k * 3.1), y = B.pos[1] - 3 + 9 * hh(k, 2), z = B.pos[2] + 2 - 10 * hh(k, 5);
    void x; void y; void z; // (fog banks dropped: soft cards in front of inked geometry read as ghosts)
  }
};
const sneak = (cam: CamInfo, t: number, f: number, out: Stage) => {
  const team: [number, number, number, number][] = [[1, 0.2, 0.25, 0.72], [3, 0.9, -0.3, 0.68], [5, 1.4, 0.55, 0.5], [6, 1.9, 0.0, 0.5]];
  for (const [w, x0, dz, stride] of team) {
    const d0 = f - 600, v = 1.15 * stride / 0.72;
    const dist = Math.max(0, (v * d0) / FPS), x = FOG[0] + x0 - 1.4 - dist, z = FOG[2] + 2.2 + dz;
    if (d0 < 0) stand(out, cam, fam(w), { x, y: 0, z, face: -Math.PI / 2 }, { expr: "nervous", facing: -1, look: -1, blink: lidAt(t, w) });
    else out.places.push(walkerSide(cam, fam(w), { x, y: 0, z, face: -Math.PI / 2 }, { mode: "march", phase: q((dist / (1.6 * stride) + w * 0.31) % 1, 30), stride, expr: w > 4 ? "unsure" : "nervous" }, true));
    blob(out, x, 0, z, w > 4 ? 0.8 : 1, 0.9);
  }
  for (let k = 0; k < 5; k++) {
    const ph = (t * 0.05 + k / 5) % 1, x = FOG[0] + 9 - 20 * ph, y = 1.5 + 3 * hh(k, 2), z = FOG[2] - 4 - 6 * hh(k, 5);
    void x; void y; void z;
  }
};

// shot 9: the men in grey coats round the crumpled balloon
const stasiMorning = (cam: CamInfo, t: number, f: number, out: Stage) => {
  const look = f >= SEARCH - 2, lk = (k: number): -1 | 0 | 1 => (!look ? 0 : ((Math.floor((f - SEARCH + 2) / 12) + k) % 2 ? 1 : -1));
  // the magnifier man, bent over the fabric edge; bends lower on "findet"
  const bend = 0.12 + 0.1 * smooth((f - FIND + 3) / 6);
  stand(out, cam, stasi(0), { ...xyz(at(FOG, -1.95, 0, 1.6)), face: 0.45 }, { arms: "magnify", hand: 1, k: 1, bow: look ? 0.05 : bend, tilt: look ? 0 : -6, expr: look ? "stern" : f >= FIND - 3 ? "curious" : "sly", facing: look ? lk(0) : -1, look: look ? lk(0) : -1, blink: lidAt(t, 40, [FIND / FPS]) });
  stand(out, cam, stasi(1), { ...xyz(at(FOG, 1.95, 0, 2.55)), face: -0.6 }, { arms: "pad", wave: q((t * 0.8) % 1, 20), expr: look ? "stern" : "read", facing: look ? lk(1) : -1, look: look ? lk(1) : -1, blink: lidAt(t, 41) });
  stand(out, cam, stasi(2), { ...xyz(at(FOG, 0.1, 0, 3.7)), face: 0 }, { arms: look ? "akimbo" : "lap", expr: look ? "stern" : "neutral", facing: look ? lk(2) : 0, look: look ? lk(2) : 0, blink: lidAt(t, 42, [SEARCH / FPS]) });
  // morning mist low between the trees
  for (let k = 0; k < 4; k++) {
    const x = FOG[0] - 10 + 7 * k + 2 * Math.sin(t * 0.3 + k), z = FOG[2] - 9 - 3 * hh(k, 4);
    out.fx.push({ key: `mist${k % 2}`, cw: 300, ch: 300, draw: (p) => fxSteam(p, 0.22 + 0.06 * (k % 2), "236,240,244"), x, y: 1.0, z: z - 4, w: 9, h: 2.6, soft: true });
  }
};

// shot 10: the kitchen table
const KSEAT: [number, number, number][] = [[1, -0.32, -1.62], [2, 0.32, -1.62], [3, -0.92, -1.62], [4, 0.92, -1.62], [5, -1.38, -1.0], [7, 1.38, -1.0]];
const kitchen = (cam: CamInfo, t: number, f: number, out: Stage) => {
  for (const [w, x, z] of KSEAT) {
    const p = at(KIT, x, 0, z), bump = (w === 1 || w === 2) && f >= BUMP - 8 && f < 859;
    let expr: Expr = "neutral", bow = 0, facing: -1 | 0 | 1 = x < 0 ? 1 : -1;
    if (w === 1) { expr = f < NOD1 - 2 ? "curious" : f < BUMP - 8 ? "determined" : "grin"; bow = nodK(f, NOD1) + nodK(f, NOD2 + 2); facing = f < 823 ? 0 : 1; }
    else { expr = f < NOD2 - 2 ? "curious" : f < BUMP - 8 ? "determined" : w === 2 ? "grin" : "smile_closed"; bow = nodK(f, NOD2 + (w % 3)); }
    const sc = w > 4 ? 1 : 1;
    out.places.push(person(cam, fam(w), { ...xyz(p), face: 0, scale: sc }, {
      mode: "chair", arms: bump ? "fist" : "lap", hand: w === 1 ? 1 : -1, k: bump ? ramp(f, BUMP - 8, 8) : 1, expr, bow, facing, look: w === 1 && f < 823 ? 0 : facing,
      blink: w === 1 && f < 823 ? lidAt(t, 1, [NOD1 / FPS]) : lidAt(t, w, [NOD2 / FPS]) }));
  }
  for (const [w, x, z] of [[6, -0.62, -2.3], [8, 0.62, -2.3]] as const)
    stand(out, cam, fam(w), { ...xyz(at(KIT, x, 0, z)), face: 0 }, { arms: "lap", expr: f < NOD2 - 2 ? "curious" : "grin", bow: nodK(f, NOD2 + 1), facing: x < 0 ? 1 : -1, look: x < 0 ? 1 : -1, blink: lidAt(t, w) });
};

// shot 11: the shops: a keeper hands one small roll across the counter in each
const CUSTOMERS = [1, 4, 2];
const shops = (cam: CamInfo, t: number, f: number, out: Stage) => {
  SHOPS.forEach((sx, i) => {
    const got = f >= HAND[i], roll = ROLLS[i];
    stand(out, cam, keeper(i), { ...xyz(at(SHOP, sx - 0.45, 0, -2.0)), face: 0 }, got ? { arms: "lap", expr: "smile_closed", facing: 1, look: 1, blink: lidAt(t, 60 + i) }
      : { arms: "give", item: roll, expr: "smile", facing: 1, look: 1, blink: lidAt(t, 60 + i) }, 0.8);
    const w = CUSTOMERS[i];
    stand(out, cam, fam(w), { ...xyz(at(SHOP, sx + 0.8, 0, -0.3)), face: -0.6 }, got ? { arms: "hold", item: roll, expr: "sly", facing: -1, look: 0, blink: lidAt(t, w, [HAND[i] / FPS]) }
      : { arms: "lap", expr: "nervous", facing: -1, look: -1, blink: lidAt(t, w) });
  });
};

// shot 12: the meadow at dusk: the fathers hold the mouth open, the others watch it fill
const meadow = (cam: CamInfo, t: number, f: number, out: Stage) => {
  const B = b2At(12, f), mh = 2 * 2.3 * (0.04 + 0.5 * smooth((f - INFL0) / (INFL1 - INFL0 + 10))) * 0.9;
  for (const [w, z] of [[1, -2.0], [2, 2.0]] as const)
    stand(out, cam, fam(w), { ...xyz(at(B.pos, 0.55, 0, z)), face: 0 }, { arms: mh > 1.0 ? "cheer" : "lap", wave: 0.25, expr: "determined", facing: z < 0 ? 1 : -1, look: z < 0 ? 1 : -1, blink: lidAt(t, w) });
  const watch: [number, number, number][] = [[3, 4.6, -3.2], [4, 4.2, 3.6], [5, 5.6, -1.6], [6, 5.3, -0.4], [7, 5.0, 1.0], [8, 5.8, 2.2]];
  for (const [w, x, z] of watch)
    stand(out, cam, fam(w), { ...xyz(at(B.pos, x, 0, z)), face: -1.4 }, { arms: w === 6 ? "point" : "lap", hand: -1, k: 1, expr: f > 990 ? (w > 4 ? "eager" : "proud") : "curious", facing: -1, look: -1, blink: lidAt(t, w) });
};

// shot 13: night take-off: eight people crouching on the platform; the burner roars
const takeoff = (cam: CamInfo, t: number, f: number, out: Stage) => {
  const B = b2At(13, f), roar = f >= ROAR - 2, up = f >= LIFT + 6;
  crew(out, cam, t, f, B.pos, CREW.map((_, i) => i), (w, kid) => ({
    arms: w === 1 && roar ? "point" : "lap", hand: 1, k: 1,
    expr: !roar ? (kid ? "nervous" : "determined") : up ? (kid ? (w % 2 ? "shock" : "eager") : w <= 2 ? "proud" : "nervous") : kid ? "shock" : "determined",
    facing: 0, look: up && kid ? (w % 2 ? 1 : -1) : 0,
  }));
};

// shot 15: touchdown in Bavaria, they stand up and hug; shot 16: they stand by the flat envelope
const landing = (cam: CamInfo, t: number, f: number, out: Stage, id: number) => {
  if (id === 15) {
    const B = b2At(15, f), stood = f >= STANDUP ? 1 : 0, hugK = ramp(f, HUG, 8);
    crew(out, cam, t, f, B.pos, CREW.map((_, i) => i), (w, kid) => (stood
      ? { arms: f >= HUG ? "hug" : "lap", k: hugK, expr: f >= HUG ? (kid ? "laugh" : w % 2 ? "relief" : "laugh") : "relief_open", tilt: f >= HUG ? (w % 2 ? 5 : -5) * hugK : 0, facing: 0, look: 0 }
      : { arms: "lap", expr: f >= TOUCH - 2 ? (kid ? "eager" : "relief") : kid ? "curious" : "nervous", facing: 0, look: 0 }), stood);
  } else {
    const spots: [number, number, number][] = [[1, 2.4, 2.2], [3, 3.0, 2.8], [2, 4.6, 1.2], [4, 5.2, 2.0], [5, 3.6, 3.6], [6, 4.4, 3.4], [7, 5.8, 3.2], [8, 2.2, 3.4]];
    for (const [w, x, z] of spots) stand(out, cam, fam(w), { ...xyz(at(BAY, x, 0, z)), face: 0 }, { arms: "lap", expr: "smile_closed", blink: lidAt(t, w), facing: x < 4 ? 1 : -1, look: 0 });
  }
};

/** everything with a face in shot `id` at time t */
export const stage = (id: number, t: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1], f = Math.round(t * FPS);
  LNAME = s.light; SUN = cam.sun.clone().normalize();
  if (id === 1 || id === 2 || id === 14) flight(cam, t, f, out, id);
  if (id === 3) border(cam, t, f, out);
  if (id === 4) street(cam, t, f, out);
  if (id === 5) sewing(cam, t, f, out);
  if (id === 7) fogFlight(cam, t, f, out);
  if (id === 8) sneak(cam, t, f, out);
  if (id === 9) stasiMorning(cam, t, f, out);
  if (id === 10) kitchen(cam, t, f, out);
  if (id === 11) shops(cam, t, f, out);
  if (id === 12) meadow(cam, t, f, out);
  if (id === 13) takeoff(cam, t, f, out);
  if (id === 15 || id === 16) landing(cam, t, f, out, id);
  return out;
};
export { FPS };
export type { V3 };
