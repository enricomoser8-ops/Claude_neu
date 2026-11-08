// The cast of the Palast short as lit flat cards in the 3D world (template machinery from the Eiffel short: canvas
// pool, cardShade actors, multiply contact blobs, blinks). Our own cast, no real persons' likenesses:
//  the postman (kepi, dark moustache, blue jacket, leather mail bag; later a grey beard), villagers of 1880 (smocks,
//  flat caps, a bonnet), the official in a dark suit and top hat, visitors of today (bright clothes, cameras).
// Walk rule: side-view walking legs only while the figure really travels at the speed its steps imply
// (phase = distance / (1.6 * stride)); anyone who stays in place stands.
import * as THREE from "three";
import { Pen, bodyFront, bodySide, fxContact, fxShadow, fxPuff, fxSparkle, Outfit, Expr, FrontOpts, SideOpts, INK, SKINS } from "./toon";
import {
  FPS, V3, SHOTS, Light, PAL, PATH, CEM, at, clamp01, smooth, ROAD_Z, TRIP, DROP, STOP_C, BEND, PICK, POCKET, FIND, MORE, BARROW, TROWEL,
  WHISPER, TAP, SHRUG, LOVE, VERBOT, TOMB0, PLAQUE_F, STRIDE, hookX, HOOK_X0, p2X, P2_X0, P2_Z, p3X, P3_X1, p4X, p6X, p7X, MAILBOX, STONE1,
  HOOK_STONE, palaceP, ageAt,
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
/** wide side card (design x -200..800): room for a bent-over body or arms reaching far ahead */
export const WIDE = (() => { const g = new THREE.PlaneGeometry(1000 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
export const BODY_GEO = BODY;

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
  scale?: number; mirror?: boolean; yaw?: number; roll?: number; size?: [number, number, number]; wide?: boolean;
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
/** side view; mirrored when the figure faces screen-left (dir = the way it faces, in world xz) */
const side = (cam: CamInfo, who: Who, at2: Pose, so: SideOpts): Place => {
  const sc = at2.scale ?? 1, d = cam.pos.distanceTo(tmp.set(at2.x, at2.y + 1.2, at2.z)) / sc, [w, h, k] = tier(d);
  const mirror = Math.sin(at2.face) * cam.right.x + Math.cos(at2.face) * cam.right.z < 0;
  const s2: SideOpts = { ...so, light: light2D(cam, mirror), seed: (who.i % 7) + 1 };
  const wide = so.mode !== "march" || !!so.reach;
  if (!wide) return { key: `S|${who.okey}|${fkey(s2)}`, x: at2.x, y: at2.y, z: at2.z, scale: sc, mirror, size: [w, h, k], draw: (p) => bodySide(p, who.o, s2) };
  return { key: `W|${who.okey}|${fkey(s2)}`, x: at2.x, y: at2.y, z: at2.z, scale: sc, mirror, wide, size: [Math.round((w * 5) / 3), h, k], draw: (p) => { p.g.translate(200, 0); bodySide(p, who.o, s2); } };
};

// ---------------- contact shadows ----------------
const CONTACT: Record<Light, [number, number, number]> = {
  day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33], night: [0.22, 0.24, 0.42], indoor: [0.3, 0.24, 0.3], dusk: [0.24, 0.2, 0.36], morning: [0.28, 0.26, 0.34],
};
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1, tail = true) => {
  const hl = Math.hypot(SUN.x, SUN.z) || 1, ox = -SUN.x / hl, oz = -SUN.z / hl, rot = Math.atan2(-ox, -oz);
  if ((LNAME === "day" || LNAME === "golden") && tail) {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, SUN.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h;
    const tc = hexOf(TAIL, k * (LNAME === "golden" ? 0.7 : 1));
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
const sideP = (out: Stage, cam: CamInfo, who: Who, p: Pose, so: SideOpts, k = 1) => {
  out.places.push(side(cam, who, p, so));
  blob(out, p.x, p.y, p.z, p.scale ?? 1, k);
};
/** walking in side view: the phase follows the distance actually travelled */
const walk = (out: Stage, cam: CamInfo, who: Who, p: Pose, dist: number, so: SideOpts = {}, stride = STRIDE) =>
  sideP(out, cam, who, p, { mode: "march", phase: q((((dist / (1.6 * stride)) % 1) + 1) % 1, 30), stride, ...so });
const faceTo = (x: number, z: number, tx: number, tz: number) => Math.atan2(tx - x, tz - z);
const puff = (out: Stage, f: number, f0: number, x: number, y: number, z: number, s = 1, rgb?: string, life = 9) => {
  const u = (f - f0) / life;
  if (u < 0 || u >= 1) return;
  out.fx.push({ key: `puff${q(u, 30)}${rgb ?? ""}`, cw: 300, ch: 300, draw: (p) => fxPuff(p, q(u, 30), rgb), x, y, z, w: 1.1 * s, h: 1.1 * s, soft: true });
};
const sparkle = (out: Stage, f: number, f0: number, x: number, y: number, z: number, s = 1) => {
  const u = (f - f0) / 26;
  if (u < 0 || u >= 1) return;
  out.fx.push({ key: `spark${q(u, 30)}`, cw: 500, ch: 500, draw: (p) => fxSparkle(p, q(u, 30)), x, y, z, w: 1.3 * s, h: 1.3 * s });
};

// ---------------- outfits ----------------
const POST_Y: Outfit = { jacket: "#2f4f8f", pants: "#28324e", boots: "#5a3a26", hat: "kepi", cap: "#24305a", band: "#b8323a", moustache: "#3a2a20", mst: "big",
  hair: "#3a2a20", bag: "#8a5a32", buttons: "#e0bc5a", skin: SKINS[1] };
const POST_M: Outfit = { ...POST_Y, moustache: "#6a5e58", beard: "#7a706a", hair: "#6a5e58" };
const POST_O: Outfit = { ...POST_Y, jacket: "#3d5a8f", moustache: "#dedad2", beard: "#e8e4dc", hair: "#dedad2", bag: undefined };
const PI = 1;
/** the postman at age a (0 young .. 1 old), pockets 0..1, with or without the bag */
const post = (a = 0, pockets = 0, bag = true): Who => {
  const base = a < 0.34 ? POST_Y : a < 0.67 ? POST_M : POST_O, b = a < 0.67 ? bag : false;
  const o: Outfit = { ...base, pockets: pockets || undefined, bag: b ? POST_Y.bag : undefined };
  return { i: PI, o, okey: `post${a < 0.34 ? 0 : a < 0.67 ? 1 : 2}p${q(pockets, 10)}b${b ? 1 : 0}` };
};
const OFFICIAL: Who = { i: 9, okey: "official", o: { jacket: "#2a2a34", pants: "#24242c", boots: INK, hat: "tophat", cap: "#1e1e26", shirt: "#f4f1ea", tie: "#5a1e2a",
  moustache: "#3a3036", mst: "thin", build: "stout", skin: SKINS[0] } };
const VILL: Outfit[] = [
  { jacket: "#c25a7a", pants: "#3b3f52", boots: "#4a3426", hat: "bonnet", dress: "#8a4a5a", hair: "#6a3a2a", skin: SKINS[0] },
  { jacket: "#4a6aa8", pants: "#4a4034", boots: "#3a2a22", hat: "flatcap", cap: "#3a3438", moustache: "#4a3426", mst: "big", build: "stout", skin: SKINS[1] },
  { jacket: "#6b5a44", pants: "#3a3f3a", boots: "#2a2630", hat: "flatcap", cap: "#5a5048", beard: "#6a5a4a", skin: SKINS[2] },
  { jacket: "#d9a441", pants: "#4a4034", boots: "#4a3426", hat: "bonnet", dress: "#5a8fc2", hair: "#3a2a20", skin: SKINS[3] },
  { jacket: "#7a4a3a", pants: "#4a3c33", boots: "#3a2a22", hat: "flatcap", cap: "#2f3a52", moustache: "#2a201a", skin: SKINS[1] },
];
const vill = (k: number): Who => ({ i: 20 + k, o: VILL[k % VILL.length], okey: "vill" + (k % VILL.length) });
const TODAY: Outfit[] = [
  { jacket: "#e8734a", pants: "#3a5a8a", boots: "#f2f2f2", hat: "cap", cap: "#2a6ad8", skin: SKINS[0] },
  { jacket: "#5ab0a0", pants: "#2f3440", boots: "#f2f2f2", hat: "longhair", hair: "#6a3a2a", skin: SKINS[2] },
  { jacket: "#f2d24a", pants: "#4a4a5a", boots: "#3a3a44", hat: "hair", hair: "#3a2a20", glasses: "#2c2a33", skin: SKINS[3] },
  { jacket: "#a85ac8", pants: "#2a2a3a", boots: "#f2f2f2", hat: "longhair", hair: "#c9a04a", skin: SKINS[1] },
  { jacket: "#4a8ad8", pants: "#c8b48a", boots: "#5a4a3a", hat: "cap", cap: "#e84a4a", build: "stout", skin: SKINS[1] },
  { jacket: "#f08aa8", pants: "#3a4a6a", boots: "#f2f2f2", hat: "hair", hair: "#2a2028", build: "kid", skin: SKINS[0] },
  { jacket: "#6ab04a", pants: "#3a3a44", boots: "#3a3a44", hat: "hair", hair: "#8a6a4a", moustache: "#6a4a3a", skin: SKINS[2] },
  { jacket: "#e85a5a", pants: "#2f3a52", boots: "#f2f2f2", hat: "longhair", hair: "#2a2028", skin: SKINS[3] },
];
const tourist = (k: number): Who => ({ i: 40 + k, o: TODAY[k % TODAY.length], okey: "tour" + (k % TODAY.length) });
const GY = 0.016; // soles on the dirt / gravel layers (top at 0.015)
/** canvas point (design units of a side card at x0) of a world point at horizontal distance dx ahead and height y */
const cv = (dx: number, y: number): [number, number] => [300 + dx / SU, 975 - (y - GY) / SU];
const lerpC = (a: [number, number], b: [number, number], k: number): [number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const REST: [number, number] = cv(0.04, 0.78);

// =====================================================================================================
// shot 1: walking along the village road, trips over the stone, catches himself, looks back; then turns to the palace
const hook = (cam: CamInfo, t: number, f: number, out: Stage) => {
  const x = hookX(f), z = ROAD_Z, P = post(0);
  if (f < TRIP) walk(out, cam, P, { x, y: GY, z, face: Math.PI / 2 }, x - HOOK_X0, { expr: "smile", blink: lidAt(t, PI) });
  else if (f < TRIP + 20) {
    const k = smooth((f - TRIP + 1) / 4) * (1 - smooth((f - TRIP - 11) / 9));
    sideP(out, cam, P, { x, y: GY, z, face: Math.PI / 2 }, { mode: "stumble", pose: k, expr: "shock", blink: 0 });
  } else if (f < 66) {
    stand(out, cam, P, { x, y: GY, z, face: Math.PI / 2 + 0.9 }, { expr: f < 52 ? "dazed" : "curious", facing: -1, look: -1, headTilt: -6, arms: f >= 48 ? "headhand" : undefined, k: ramp(f, 48, 5), hand: 1, blink: lidAt(t, PI, [52 / FPS]) });
  } else stand(out, cam, P, { x, y: GY, z, face: Math.PI }, { expr: "neutral", blink: 0 });
  puff(out, f, TRIP, HOOK_STONE[0] + 0.05, 0.18, HOOK_STONE[2] + 0.1, 0.55, "214,196,160", 11);
};

// shot 2: the round: he walks the path, stops at the mailbox, posts the letter, walks on out of frame
const round = (cam: CamInfo, t: number, f: number, out: Stage) => {
  const x = p2X(f), z = PATH[2] + P2_Z, P = post(0), moving = (f >= 115 && f < 206) || f >= 236;
  const dist = x - (PATH[0] + P2_X0);
  if (moving) walk(out, cam, P, { x, y: GY, z, face: Math.PI / 2 }, dist, { expr: f < 206 ? "smile" : "proud", blink: lidAt(t, PI) });
  else {
    const slot = cv(MAILBOX[0] - 0.2 - x, 1.27), k = smooth((f - (DROP - 12)) / 9) * (1 - smooth((f - DROP - 3) / 8));
    sideP(out, cam, P, { x, y: GY, z, face: Math.PI / 2 }, { mode: "stand", reach: lerpC(REST, slot, k), item: f < DROP ? "letter" : undefined, expr: f >= DROP - 1 ? "grin" : "smile", blink: lidAt(t, PI, [DROP / FPS]) });
  }
  // a few villagers far off on the village square, a farmer in the field
  for (const [k, vx, vz, face] of [[0, 24, -22.5, 0.4], [1, 27.5, -21.8, -0.6], [2, 21, -27, 1.2], [4, -18, 14, 2.4]] as const)
    stand(out, cam, vill(k), { ...xyzP(at(PATH, vx, GY, vz)), face }, { expr: "smile", blink: lidAt(t, 20 + k) });
};
const xyzP = (p: V3) => ({ x: p[0], y: p[1], z: p[2] });

// shot 3: the feet walk in and stop at the stone; he bends, picks it up, straightens, pockets it
const stone = (cam: CamInfo, t: number, f: number, out: Stage) => {
  const x = p3X(f), z = PATH[2], P = post(0, f >= POCKET + 3 ? 0.2 : 0);
  if (f < STOP_C) { walk(out, cam, P, { x, y: GY, z, face: Math.PI / 2 }, x - (PATH[0] + P3_X1 - 40), { expr: "neutral", blink: lidAt(t, PI) }); return; }
  const gnd = cv(STONE1[0] - x - 0.02, 0.1), pocket = cv(0.1, 0.62);
  let bend = 0, reach: [number, number] | undefined, item: "stone" | undefined;
  if (f < PICK) { bend = smooth((f - BEND + 2) / 12); reach = lerpC(REST, gnd, smooth((f - BEND - 4) / 10)); }
  else if (f < POCKET - 2) { bend = 1 - smooth((f - PICK) / 11); reach = lerpC(gnd, cv(0.3, 1.05), smooth((f - PICK) / 11)); item = "stone"; }
  else if (f < POCKET + 3) { reach = lerpC(cv(0.3, 1.05), pocket, smooth((f - POCKET + 3) / 4)); item = "stone"; }
  else reach = lerpC(pocket, REST, smooth((f - POCKET - 4) / 8));
  const expr: Expr = f < BEND ? "curious" : f < PICK ? "curious" : f < POCKET + 2 ? "eager" : "smile";
  sideP(out, cam, P, { x, y: GY, z, face: Math.PI / 2 }, { mode: "stand", bend, reach, item, expr, blink: lidAt(t, PI, [STOP_C / FPS, PICK / FPS]) });
  sparkle(out, f, PICK, STONE1[0], 0.95, z + 0.1, 0.6);
};

// shot 4: next morning: he stands by more odd stones, smiles, opens his arms
const more = (cam: CamInfo, t: number, f: number, out: Stage) => {
  const p = { x: p4X(441), y: GY, z: PATH[2], face: Math.PI / 2 + 0.25 };
  const open = f >= MORE - 2;
  stand(out, cam, post(0, 0.2), p, { arms: open ? "spread" : undefined, k: ramp(f, MORE - 2, 5), expr: f < FIND - 2 ? "curious" : open ? "grin" : "smile",
    facing: open ? 0 : 1, look: open ? 0 : 1, headTilt: open ? 0 : 6, blink: lidAt(t, PI, [FIND / FPS, MORE / FPS]) });
  sparkle(out, f, FIND - 2, at(PATH, -37.2, 0, 0)[0], 0.5, 0.6, 0.9);
};

// shot 5: rooftops: villagers on the square far below
const roofs = (cam: CamInfo, t: number, _f: number, out: Stage) => {
  for (const [k, vx, vz, face] of [[0, 24, -22.5, 0.4], [1, 27.5, -21.8, -0.6], [2, 21, -27, 1.2], [3, 33, -28, -2.0], [4, 29.5, -29.5, 2.8]] as const)
    stand(out, cam, vill(k), { ...xyzP(at(PATH, vx, 0.02, vz)), face }, { expr: "smile", blink: lidAt(t, 20 + k) });
};

// shot 6: walking on, pockets bulging with stones
const pockets = (cam: CamInfo, t: number, f: number, out: Stage) => {
  const x = p6X(f);
  walk(out, cam, post(0, 1), { x, y: GY, z: PATH[2], face: Math.PI / 2 }, x - p6X(470), { expr: "proud", blink: lidAt(t, PI) });
};

// shot 7: pushing the barrow full of stones (the barrow itself is posed in world.ts from barrowAt)
export const BARROW_HAND = { dx: 0.3, y: 0.76 }; // his hands on the grips: ahead of his centre, height
export const BARROW_Z = -0.27;                    // the barrow runs beside his card plane: the near grip is in it
const barrow = (cam: CamInfo, t: number, f: number, out: Stage) => {
  const x = p7X(f), hnd = cv(BARROW_HAND.dx, BARROW_HAND.y);
  walk(out, cam, post(0, 0.6), { x, y: GY, z: PATH[2], face: Math.PI / 2 }, x - p7X(530), { reach: hnd, reach2: [hnd[0] - 4, hnd[1] - 6], lean: 10, expr: "grin", blink: lidAt(t, PI) }, STRIDE * (1.1 / 1.25));
};

// shot 8: night, building the first low wall by the lamp; shot 9 shares his place
const BUILD_P = at(PAL, -10.3, GY, 4.05);
const night = (cam: CamInfo, t: number, f: number, out: Stage) => {
  const top = 0.82 * clamp01(palaceP(f) / 0.03);
  const to = cv(0.42, top + 0.08); // canvas: the hand at the wall top, to his screen-left
  stand(out, cam, post(0), { ...xyzP(BUILD_P), face: 0 }, { arms: "trowel", hand: -1, to: [600 - to[0], to[1]], item: "stone", wave: q((f * 0.07) % 1, 20),
    expr: f >= TROWEL - 2 ? "smile_closed" : "neutral", facing: -1, look: -1, headTilt: -5, blink: lidAt(t, PI, [TROWEL / FPS]) }, 0.8);
};

// shot 9: villagers at the fence whisper, one taps his forehead; the postman shrugs into the lens
const fence = (cam: CamInfo, t: number, f: number, out: Stage) => {
  const wh = f >= WHISPER - 3, tap = f >= TAP - 3;
  stand(out, cam, vill(0), { ...xyzP(at(PAL, -20.35, GY, 5.75)), face: Math.PI / 2 - 0.2 }, { arms: wh ? "whisper" : undefined, headTilt: wh ? -8 : 0, k: ramp(f, WHISPER - 3, 4), hand: -1, expr: wh ? "sly" : "curious",
    facing: wh ? -1 : 1, look: wh ? -1 : 1, blink: lidAt(t, 20) });
  stand(out, cam, vill(1), { ...xyzP(at(PAL, -20.55, GY, 6.7)), face: Math.PI / 2 }, { arms: tap ? "tap" : undefined, k: ramp(f, TAP - 3, 4), hand: 1, wave: q((f * 0.18) % 1, 20),
    expr: tap ? "grin" : wh ? "curious" : "neutral", facing: tap ? 0 : 1, look: tap ? 0 : 1, headTilt: tap ? 8 : 0, blink: lidAt(t, 21, [TAP / FPS]) });
  stand(out, cam, vill(2), { ...xyzP(at(PAL, -20.3, GY, 7.75)), face: Math.PI / 2 + 0.3 }, { expr: tap ? "laugh" : "unsure", facing: -1, look: -1, arms: tap ? "belly" : undefined, blink: lidAt(t, 22) });
  stand(out, cam, vill(3), { ...xyzP(at(PAL, -21.6, GY, 4.6)), face: Math.PI / 2 + 0.4 }, { expr: "curious", facing: 1, look: 1, blink: lidAt(t, 23) });
  // the postman among his first walls: looks over at them, then into the lens and shrugs
  const sp = at(PAL, -9.3, GY, 7.5), shrug = f >= SHRUG - 3;
  stand(out, cam, post(0), { ...xyzP(sp), face: faceTo(sp[0], sp[2], -7.4, 11.9) }, { arms: shrug ? "shrug" : "lap", k: ramp(f, SHRUG - 3, 5), expr: shrug ? "smile" : f >= 728 ? "unsure" : "neutral",
    facing: shrug ? 0 : -1, look: shrug ? 0 : -1, headTilt: shrug ? 9 : 0, chest: shrug ? 0.5 : 0, blink: lidAt(t, PI, [SHRUG / FPS]) });
};

// shot 10: time-lapse: he works at the growing palace, a new spot every few frames, greying
const SPOTS: [number, number][] = [[-3.6, 7.2], [0.6, 7.4], [-5.8, 7.1], [2.4, 7.3], [-1.2, 7.2], [-4.6, 7.4], [1.5, 7.0], [-2.4, 7.3], [0.0, 7.1]];
const lapse = (cam: CamInfo, t: number, f: number, out: Stage) => {
  const i = Math.floor((f - 761) / 8) % SPOTS.length, [sx, sz] = SPOTS[i];
  stand(out, cam, post(ageAt(f)), { x: sx, y: GY, z: sz, face: 0.5 }, { arms: "trowel", hand: i % 2 ? 1 : -1, item: "stone", wave: q((f * 0.1) % 1, 20), expr: "smile_closed", blink: 0 });
};

// shot 11: the old postman looks lovingly at the palace; the official wags his finger
const OLD_P = at(PAL, 8.4, GY, 10.9), OFF_P = at(PAL, 7.0, GY, 12.4);
const palace = (cam: CamInfo, t: number, f: number, out: Stage) => {
  const O = post(1);
  if (f < 1030) {
    const chest = cv(0.16, 1.02);
    sideP(out, cam, O, { ...xyzP(OLD_P), face: Math.PI }, { mode: "stand", reach: chest, reach2: [chest[0] - 6, chest[1] + 4], expr: f >= LOVE - 2 ? "smile_closed" : "smile", blink: lidAt(t, PI) });
    sparkle(out, f, LOVE - 2, OLD_P[0] - 0.1, 1.95, OLD_P[2] - 0.25, 0.7);
    return;
  }
  const v = f >= VERBOT - 3;
  stand(out, cam, O, { ...xyzP(OLD_P), face: faceTo(OLD_P[0], OLD_P[2], 6.0, 15.2) - 0.3 }, { expr: v ? "pained" : "unsure", facing: -1, look: -1, arms: v ? undefined : "clasp", blink: lidAt(t, PI, [VERBOT / FPS]) });
  const shake = v && f < VERBOT + 22 ? (Math.floor((f - VERBOT) / 4) % 2 ? 1 : -1) : 0;
  stand(out, cam, OFFICIAL, { ...xyzP(OFF_P), face: faceTo(OFF_P[0], OFF_P[2], 6.0, 15.2) }, { arms: v ? "wag" : "akimbo", hand: 1, k: ramp(f, VERBOT - 3, 3), wave: q((f * 0.14) % 1, 20),
    expr: "stern", facing: (shake || 1) as -1 | 0 | 1, look: shake ? shake : 1, blink: lidAt(t, 9) });
};

// shot 12: the old man builds his tomb in the cemetery
const TOMB_P = at(CEM, 2.05, GY, -1.25);
const tomb = (cam: CamInfo, t: number, f: number, out: Stage) => {
  stand(out, cam, post(1), { ...xyzP(TOMB_P), face: faceTo(TOMB_P[0], TOMB_P[2], CEM[0] + 4.4, CEM[2] + 5.2) }, { arms: "trowel", hand: -1, item: "stone", wave: f >= TOMB0 - 2 ? q((f * 0.08) % 1, 20) : 0,
    to: [178, 640], expr: f >= TOMB0 - 2 ? "smile_closed" : "neutral", facing: -1, look: -1, headTilt: -4, blink: lidAt(t, PI, [TOMB0 / FPS]) });
};

// shot 13: today: visitors with cameras; two strollers cross; flashes
const VIS: [number, number, number, "camera" | "point" | undefined, number][] = [
  [-6.2, 11.6, 0, "camera", 1], [-3.0, 12.4, 1, "point", -1], [-0.4, 10.8, 2, "camera", -1], [2.4, 12.0, 3, undefined, 1], [-9.2, 12.8, 4, "camera", 1], [0.9, 13.4, 5, undefined, -1], [4.4, 11.0, 6, "camera", -1],
];
const today = (cam: CamInfo, t: number, f: number, out: Stage, outro = false) => {
  VIS.forEach(([x, z, k, arms, hs], n) => {
    if (outro && n > 3) return;
    stand(out, cam, tourist(k), { x, y: GY, z, face: faceTo(x, z, 3.0, 4.0) + 0.9 * hs }, { arms: outro ? undefined : arms, hand: hs as 1 | -1, k: 1, expr: (["smile", "grin", "curious", "smile_closed"] as Expr[])[n % 4],
      facing: hs as 1 | -1, look: hs, blink: lidAt(t, 40 + k) });
  });
  if (outro) return;
  for (const [k, x0, z, v] of [[7, -14, 14.2, 1.0], [1, 12, 9.6, -0.9]] as const) {
    const ff = f - 1181, x = x0 + (v * ff) / FPS;
    walk(out, cam, tourist(k + 10), { x, y: GY, z, face: v > 0 ? Math.PI / 2 : -Math.PI / 2 }, Math.abs((v * ff) / FPS), { expr: "smile", blink: lidAt(t, 60 + k) }, 0.62 * Math.abs(v) / 1.0);
  }
  for (const [n, f0] of [[0, 1192], [2, 1203], [4, 1219], [6, 1234]] as const) {
    const [x, z] = VIS[n];
    sparkle(out, f, f0, x + 0.3 * VIS[n][4], 1.42, z + 0.25, 0.5);
  }
  void PLAQUE_F;
};

/** everything with a face in shot `id` at time t */
export const stage = (id: number, t: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1], f = Math.round(t * FPS);
  LNAME = s.light; SUN = cam.sun.clone().normalize();
  if (id === 1) hook(cam, t, f, out);
  if (id === 2) round(cam, t, f, out);
  if (id === 3) stone(cam, t, f, out);
  if (id === 4) more(cam, t, f, out);
  if (id === 5) roofs(cam, t, f, out);
  if (id === 6) pockets(cam, t, f, out);
  if (id === 7) barrow(cam, t, f, out);
  if (id === 8) night(cam, t, f, out);
  if (id === 9) fence(cam, t, f, out);
  if (id === 10) lapse(cam, t, f, out);
  if (id === 11) palace(cam, t, f, out);
  if (id === 12) tomb(cam, t, f, out);
  if (id === 13) today(cam, t, f, out);
  if (id === 14) today(cam, t, f, out, true);
  return out;
};
export { FPS };
export type { V3 };
