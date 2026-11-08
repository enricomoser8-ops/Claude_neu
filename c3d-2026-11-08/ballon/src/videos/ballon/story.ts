// Timeline of "Die Ballonflucht aus der DDR" (Thuringia -> Bavaria, 1979): 16 picture shots timed to the German voice
// (/home/claude/shorts/src/daily/ballon-cues.json, frame = round(t * 30)). Camera grammar of the skill: cuts only at
// place changes, smootherstep glides of 18-40 f elsewhere, every hold creeps, flip-sign impact kicks. All sets live in
// one world at different origins; only the current set's group is shown.
import { BAND_V } from "./bpaint";
export const FPS = 30;
export const TOTAL = 1475;
export const D0 = 0;
export type V3 = [number, number, number];

// ---------------- set origins ----------------
export const BOR: V3 = [0, 0, 0];          // the border strip (fences along x, z = 0 / 3.5; the East is -z)
export const VIL: V3 = [2000, 0, 0];       // the families' village street (house front at z = 4.5)
export const MEAD: V3 = [2000, 0, -170];   // the meadow behind the village (launch site)
export const FOG: V3 = [4000, 0, 0];       // forest clearing just before a fence line (first attempt, the Stasi morning)
export const SEW: V3 = [6000, 0, 0];       // sewing room
export const KIT: V3 = [6040, 0, 0];       // kitchen
export const SHOP: V3 = [6100, 0, 0];      // a row of small fabric shops
export const BAY: V3 = [8000, 0, 0];       // forest clearing in Bavaria (landing at dawn)
export const at = (o: V3, x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];
export type SetKey = "bor" | "vil" | "fog" | "sew" | "kit" | "shop" | "bay";

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 3;

// ---------------- set constants ----------------
export const TOWER: V3 = at(BOR, 0, 0, -19);       // watchtower axis; cabin floor (walkway) at 9 m, roof at 11.3 m
export const TOWER_FLOOR = 9, TOWER_ROOF = 11.3, LAMP_Y = 11.85;
export const ROAD = { z0: -13, z1: -9 };            // patrol road (concrete plates)
export const BARRIER = { x: 16, z: -13.6, h: 1.0, len: 5.0 }; // pivot post on the east side of the road; closed boom spans +z
export const HOUSE_DOOR: V3 = at(VIL, 0, 0, 4.5);   // the family's front door (house front faces +z)
export const SEW_TABLE = { z: -1.55, h: 0.76 };     // sewing table (machine head at x -0.17)
export const NEEDLE: V3 = at(SEW, -0.2, 0.76, -1.55);
export const KIT_TABLE = { x: 0, z: -1.0, w: 1.9, d: 0.9, h: 0.76 };
export const SHOPS = [0, 4.6, 9.2];                  // shop centres along x (local to SHOP)

// ---------------- balloons ----------------
/** envelope profile (height above the mouth, radius) of the big balloon; the first one is the same at 0.72 scale */
export const PROFILE: [number, number][] = [[0, 2.3], [1.5, 3.6], [3.5, 5.6], [6, 7.6], [9, 9.2], [12.5, 10.0], [16, 9.6], [19, 8.1], [21.5, 5.9], [23.3, 3.2], [24.2, 0]];
export const MOUTH_Y = 6.2;   // mouth height above the platform floor
export const ENV_H = 24.2;
export const B1_SCALE = 0.72;
export const PLAT = 0.72;     // half size of the platform (1.44 m square)
export const profR = (h: number) => {
  if (h <= 0) return PROFILE[0][1];
  for (let i = 1; i < PROFILE.length; i++) if (h <= PROFILE[i][0]) {
    const [h0, r0] = PROFILE[i - 1], [h1, r1] = PROFILE[i], u = (h - h0) / (h1 - h0);
    return r0 + (r1 - r0) * u;
  }
  return 0;
};
export type BState = { vis: boolean; pos: V3; mode: "up" | "lie" | "crumple" | "sag"; inflate: number; burner: number; glow: number; wet: number; crew: boolean };
const HIDE: BState = { vis: false, pos: [0, -500, 0], mode: "up", inflate: 1, burner: 0, glow: 0, wet: 0, crew: false };
/** burner flame 0..1 with flicker (bursts) */
const flick = (f: number, base: number) => base * (0.82 + 0.18 * Math.sin(f * 1.7) * Math.sin(f * 0.63 + 1));

// story beats (frames; every visual reaction 0-3 f before its word)
export const GLANCE = 296;                 // "heimlich" 298: the fathers glance round at the door
export const DOOR0 = 312, DOOR1 = 322;     // the door swings open
export const RIESIG = 348;                 // "riesigen" 350: the lens rises with the pile
export const WET0 = 515, WET1 = 562;       // "saugt sich ... voll" 518-562: the fabric darkens
export const SINK0 = 556, LAND1 = 596;     // the first balloon sinks into the clearing
export const FIND = 724;                   // "findet" 727: the magnifier man bends down
export const SEARCH = 746;                 // "sucht die Erbauer" 749: heads turn, looking round
export const NOD1 = 804;                   // "versuchen" 806: the father nods, determined
export const NOD2 = 826;                   // "Familien" 828: everyone nods
export const BUMP = 841;                   // "schon" 845: the fathers' fist bump
export const HAND = [864, 894, 926];       // fabric handed over in each shop ("kaufen" 864, "Läden" 907, "auffällt" 943)
export const INFL0 = 962, INFL1 = 1022;    // the new envelope inflates on the meadow ("nähen ... größeren Ballon")
export const ROAR = 1030;                  // "steigen" 1034: the burner roars
export const LIFT = 1036;                  // lift-off
export const BEAM0 = 1146, BEAM1 = 1170;   // "leuchtet nach oben" 1152-1169: the searchlight swings up
export const TOUCH = 1296;                 // "landen" 1298: touchdown
export const STANDUP = 1302, HUG = 1312;   // they stand up and hug ("Bayern" 1320)

/** the big patchwork balloon */
export const b2At = (id: number, f: number): BState => {
  if (id === 1 || id === 2) return { vis: true, pos: at(BOR, 0, 140, -125 + 0.1 * f), mode: "up", inflate: 1, burner: flick(f, f >= 60 && f < 84 ? 1 : 0.55), glow: 1, wet: 0, crew: true };
  if (id === 12) { // lying on the meadow, cold-inflating
    const u = smooth((f - INFL0) / (INFL1 - INFL0 + 10));
    return { vis: true, pos: at(MEAD, 0, 0, 0), mode: "lie", inflate: 0.04 + 0.5 * u, burner: 0, glow: 0, wet: 0, crew: false };
  }
  if (id === 13) {
    const t = Math.max(0, f - LIFT) / FPS;
    const y = 0.5 * 1.3 * t * t;
    const roar = f >= ROAR - 2 ? 1 : 0.35;
    return { vis: true, pos: at(MEAD, 0, y, 0), mode: "up", inflate: 1, burner: flick(f, roar), glow: 0.6 + 0.6 * roar, wet: 0, crew: true };
  }
  if (id === 14) return { vis: true, pos: at(BOR, -30 + 0.06 * (f - 1128), 230, -60 + 0.12 * (f - 1128)), mode: "up", inflate: 1, burner: flick(f, 0.9), glow: 1.2, wet: 0, crew: true };
  if (id === 15) {
    const u = clamp01((f - 1258) / (TOUCH - 1258)), y = 26 * (1 - easeOut(u)) ** 1.2;
    return { vis: true, pos: at(BAY, 0, y, 0), mode: "up", inflate: 1, burner: f < 1286 ? flick(f, 0.3) : 0, glow: 0.2, wet: 0, crew: true };
  }
  if (id === 16) return { vis: true, pos: at(BAY, 0, 0, 0), mode: "lie", inflate: 0.05, burner: 0, glow: 0, wet: 0, crew: false };
  return HIDE;
};
/** the first, smaller, plain balloon */
export const b1At = (id: number, f: number): BState => {
  if (id === 7) {
    const z = 50 * (1 - smooth((f - 444) / (LAND1 - 444)) * 0.15 - (f - 444) / (LAND1 - 444) * 0.85);
    const y = 40 * (1 - smooth((f - SINK0) / (LAND1 - SINK0)));
    return { vis: true, pos: at(FOG, 0, y, z), mode: "up", inflate: 1, burner: f < SINK0 ? flick(f, 0.45) : 0, glow: f < SINK0 ? 0.5 : 0.1, wet: smooth((f - WET0) / (WET1 - WET0)), crew: true };
  }
  if (id === 8) return { vis: true, pos: at(FOG, 0, 0, 0), mode: "sag", inflate: 1 - 0.6 * smooth((f - 598) / 40), burner: 0, glow: 0, wet: 1, crew: false };
  if (id === 9) return { vis: true, pos: at(FOG, 0, 0, 0.6), mode: "crumple", inflate: 0.05, burner: 0, glow: 0, wet: 0, crew: false };
  return HIDE;
};
/** where people stand on the platform (local x, z; kids sit, adults crouch) */
export const CREW: { x: number; z: number; kid: boolean; who: number }[] = [
  { x: -0.42, z: -0.42, kid: false, who: 1 }, { x: 0.42, z: -0.42, kid: false, who: 2 }, { x: -0.44, z: 0.36, kid: false, who: 3 }, { x: 0.44, z: 0.36, kid: false, who: 4 },
  { x: -0.15, z: 0.52, kid: true, who: 5 }, { x: 0.16, z: 0.54, kid: true, who: 6 }, { x: -0.56, z: -0.02, kid: true, who: 7 }, { x: 0.56, z: 0.0, kid: true, who: 8 },
];
export const CREW1 = [0, 2, 4, 5]; // the first flight: one family (father, mother, two kids)

// ---------------- moving set parts ----------------
/** barrier boom angle above horizontal (rad): up, then slammed down for "dicht" 242 with a small bounce */
export const SLAM = 238;
export const barrierAt = (f: number) => {
  if (f < SLAM - 8) return Math.PI / 2 * 0.98;
  if (f < SLAM) { const u = (f - SLAM + 8) / 8; return (Math.PI / 2) * 0.98 * (1 - u * u); }
  const k = f - SLAM; return 0.09 * Math.exp(-k / 3.5) * Math.abs(Math.sin(k * 0.9));
};
/** searchlight aim: yaw (0 = +z), pitch above horizontal, on (0..1) */
export const lightAt = (id: number, f: number) => {
  if (id === 1 || id === 2) return { on: 1, yaw: 0.6 + 0.5 * Math.sin(f * 0.025), pitch: -0.32 };
  if (id === 14) {
    const u = smooth((f - BEAM0) / (BEAM1 - BEAM0)), aim = Math.atan2(-30, -41);
    return { on: 1, yaw: -1.1 + (aim + 1.1) * u + 0.04 * Math.sin(f * 0.05) * u, pitch: -0.25 + 1.5 * u };
  }
  return { on: 0, yaw: 0, pitch: 0 };
};
export const BEAM_LEN = 120;
/** the front door of the family's house: open angle (rad) */
export const doorAt = (id: number, f: number) => (id === 4 ? 1.35 * smooth((f - DOOR0) / (DOOR1 - DOOR0)) : 0);

// ---------------- shots ----------------
export type Light = "day" | "golden" | "night" | "indoor" | "dusk" | "morning" | "fog";
export type ShotDef = { id: number; a: number; b: number; light: Light; set: V3; key: SetKey; what: string; brief: number };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 86, light: "night", set: BOR, key: "bor", brief: 1, what: "hook: starry night, the patchwork balloon with its burner glow glides over the border strip (fence + watchtower far below)" },
  { id: 2, a: 86, b: 175, light: "night", set: BOR, key: "bor", brief: 2, what: "close on the envelope: umbrella-silk band (f113), tent-nylon band (f149), slow pan up" },
  { id: 3, a: 175, b: 254, light: "day", set: BOR, key: "bor", brief: 3, what: "border by day: double fence, watchtower, soldier with binoculars; the barrier slams down on 'dicht'" },
  { id: 4, a: 254, b: 326, light: "day", set: VIL, key: "vil", brief: 4, what: "two fathers carry fabric rolls along the village street to their door, glance round, the door opens" },
  { id: 5, a: 326, b: 394, light: "indoor", set: SEW, key: "sew", brief: 4, what: "sewing room: needle running, mother at the machine, fabric piled to the ceiling" },
  { id: 6, a: 394, b: 444, light: "dusk", set: VIL, key: "vil", brief: 5, what: "calm glide over the sleepy village at dusk and the dark forest (follow button, lower centre calm)" },
  { id: 7, a: 444, b: 598, light: "fog", set: FOG, key: "fog", brief: 6, what: "first attempt in night fog: plain balloon, one family; the fabric soaks dark, it sinks into the trees" },
  { id: 8, a: 598, b: 638, light: "fog", set: FOG, key: "fog", brief: 6, what: "down in the clearing just before the fence line; the family sneaks off into the forest" },
  { id: 9, a: 638, b: 780, light: "morning", set: FOG, key: "fog", brief: 7, what: "morning: men in grey coats round the crumpled balloon, magnifying glass, notebook; they look round" },
  { id: 10, a: 780, b: 859, light: "indoor", set: KIT, key: "kit", brief: 8, what: "kitchen: a father looks into the lens and nods; both families nod, the fathers fist-bump" },
  { id: 11, a: 859, b: 962, light: "indoor", set: SHOP, key: "shop", brief: 10, what: "glide past small shop counters: each time one small roll of fabric is bought" },
  { id: 12, a: 962, b: 1022, light: "dusk", set: MEAD, key: "vil", brief: 10, what: "the new giant patchwork envelope lies on the meadow and inflates" },
  { id: 13, a: 1022, b: 1128, light: "night", set: MEAD, key: "vil", brief: 11, what: "night take-off: eight people crouch on the tiny platform, the burner roars, the balloon lifts off" },
  { id: 14, a: 1128, b: 1258, light: "night", set: BOR, key: "bor", brief: 12, what: "watchtower at night: the searchlight swings up, the beam fades far below the balloon" },
  { id: 15, a: 1258, b: 1334, light: "golden", set: BAY, key: "bay", brief: 13, what: "dawn: the balloon comes down softly in a forest clearing, the families stand up and hug" },
  { id: 16, a: 1334, b: TOTAL, light: "golden", set: BAY, key: "bay", brief: 14, what: "outro: slow rise over the forest and the deflated balloon at sunrise (logo + button overlay)" },
];
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => [{ id: shotAt(f).id, alpha: 1 }];

export const SOUND: { f: number; what: string }[] = [
  { f: 0, what: "night wind high up, burner hiss" },
  { f: 60, what: "burner burst (roar, 0.8 s)" },
  { f: 86, what: "cut: close on the fabric (fabric flutter, rope creak)" },
  { f: 175, what: "cut: border by day (wind, distant birds; binoculars)" },
  { f: SLAM, what: "barrier boom slams down (metal clang + rattle)" },
  { f: 254, what: "cut: village street (birds, footsteps of two men until 300)" },
  { f: GLANCE, what: "the fathers glance round (hush)" },
  { f: DOOR0, what: "front door creaks open" },
  { f: 326, what: "cut: sewing room: sewing machine rattle (continuous to 394)" },
  { f: 394, what: "cut: village at dusk (evening birds, distant dog)" },
  { f: 444, what: "cut: night fog (muffled wind, burner hiss until 556)" },
  { f: WET0, what: "fabric goes heavy and dark (dripping)" },
  { f: SINK0, what: "balloon sinks (creak, branches rustle until 596)" },
  { f: LAND1, what: "platform bumps down in the clearing" },
  { f: 600, what: "family tiptoes away (soft footsteps until 638)" },
  { f: 638, what: "cut: morning forest (birds, crows)" },
  { f: FIND, what: "magnifying-glass man bends down (coat rustle)" },
  { f: SEARCH, what: "the men look round (tense sting)" },
  { f: 780, what: "cut: kitchen (clock tick)" },
  { f: NOD1, what: "father nods, determined" },
  { f: BUMP, what: "fist bump (soft thump)" },
  { f: 859, what: "cut: shops (door bell, till)" },
  { f: HAND[0], what: "roll of fabric handed over (paper rustle)" },
  { f: HAND[1], what: "roll handed over" },
  { f: HAND[2], what: "roll handed over" },
  { f: 962, what: "cut: meadow at dusk: the envelope fills with air (fabric whoosh until 1022)" },
  { f: 1022, what: "cut: night meadow" },
  { f: ROAR, what: "burner ROARS (long, to 1128)" },
  { f: LIFT, what: "lift-off (platform creak, ropes tighten)" },
  { f: 1128, what: "cut: watchtower at night" },
  { f: BEAM0, what: "searchlight clicks on / swings up (motor hum)" },
  { f: 1258, what: "cut: dawn clearing (birdsong), burner short burst until 1286" },
  { f: TOUCH, what: "soft touchdown (thud, grass)" },
  { f: HUG, what: "families hug (relieved laughter)" },
  { f: 1334, what: "cut: sunrise outro (music swell)" },
];

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
/** push-in factor since f0: the subject grows ~rate per frame; `punch` raises it (8 f soft edges) for n frames from p0 */
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35, p0 = 0) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x - p0, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const lerp3 = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
/** constant-speed travel with soft ends: 0..1 over [f0, f1], speed ramps over `e` frames at each end */
export const travel = (f: number, f0: number, f1: number, e = 20) => {
  const L = f1 - f0, x = Math.max(0, Math.min(L, f - f0)), v = 1 / (L - e);
  return x < e ? (v * x * x) / (2 * e) : x > L - e ? 1 - (v * (L - x) ** 2) / (2 * e) : v * (x - e / 2);
};

// 1 hook: alongside and above the balloon, the border strip far below and ahead
const S1a = (f: number): Shot => {
  const B = b2At(1, f).pos, a = 0.18 + 0.0012 * f;
  return { pos: add(B, [64 * Math.sin(a), 20 - 0.03 * f, -64 * Math.cos(a)]), look: add(B, [-5, -20, 50]), fov: 58, roll: -0.03 };
};
// 2 close on the fabric: the lens hugs the envelope and pans up from the mouth (burner glow) over the bands
export const fabricCam = (f: number) => {
  const B = b2At(2, f).pos, hU = BAND_V.umbrella * ENV_H, hT = BAND_V.tent * ENV_H;
  const h = hU + ((hT - hU) * (f - 113)) / 36, hh = Math.max(1.2, h);
  const az = 0.95 + 0.0028 * (f - 86), r = profR(hh) + 9.5 + 1.2 * clamp01((2.5 - h) / 2);
  const c = Math.cos(az), s = Math.sin(az);
  const t = profR(hh) * 0.8;
  return { pos: add(B, [r * s, MOUTH_Y + hh - 0.8, -r * c]) as V3, look: add(B, [t * c, MOUTH_Y + hh + 0.9, t * s]) as V3, fov: 46, roll: 0.035 };
};
// 3 border by day: crane in toward the soldier on the tower, then glide to the barrier as it slams down
export const SOLDIER: V3 = at(TOWER, 1.45, TOWER_FLOOR, 1.85);
const S3a = (f: number) => dolly(at(BOR, 30, 2.4, -6.5), at(SOLDIER, -0.2, 1.25, 0), 0.6 - 0.26 * travel(f, 175, 222, 16), { fov: 34, roll: 0.02 });
const S3b = (f: number) => dolly(at(BOR, 31, 1.7, -17.5), at(BOR, 11, 2.6, -4.5), pushK(f, 214, 0.002, 0.007, 24, 22), { fov: 42, roll: -0.03 });
// 4 village street: the fathers enter from the left and stop at the door
const S4a = (f: number) => dolly(at(VIL, 0.6, 1.55, 13.2), at(VIL, -1.5, 1.25, 4.6), pushK(f, 254, 0.0018, 0.0055, 26, 40), { fov: 46, roll: -0.02 });
// 5 sewing room: close on the needle, then glide back and up to the fabric piled to the ceiling
const S5a = (f: number) => dolly(at(SEW, -0.5, 1.25, -0.2), at(SEW, 0.0, 0.95, -1.6), pushK(f, 326, 0.003), { fov: 46, roll: 0.03 });
const S5b = (f: number) => dolly(at(SEW, 0.15, 1.8, 3.4), at(SEW, 0.1, 1.5, -1.7), pushK(f, RIESIG, 0.0016), { fov: 52, roll: -0.02 });
// 6 dusk: slow glide over the village roofs toward the forest ridge
const S6a = (f: number): Shot => {
  const u = travel(f, 394, 444, 12);
  return { pos: at(VIL, -26 + 10 * u, 30 - 3 * u, 50 - 6 * u), look: at(VIL, 8 + 6 * u, 0, -75), fov: 46, roll: 0.02 };
};
// 7 fog: alongside the first balloon, then above the clearing as it sinks
const S7a = (f: number): Shot => {
  const B = b1At(7, f).pos, a = 0.9 + 0.0035 * (f - 444), k = pushK(f, 444, 0.0016), r = 12.1 * k;
  return { pos: add(B, [r * Math.sin(a), 2.2 + 1.5 * (1 - k), r * Math.cos(a)]), look: add(B, [0, 3.0, -0.5]), fov: 50, roll: 0.03 };
};
const S7b = (f: number): Shot => {
  const B = b1At(7, f).pos, k = travel(f, SINK0, 598, 14);
  return { pos: lerp3(at(FOG, 18, 31, 27), at(FOG, 15, 27, 23), k), look: lerp3(add(B, [0, 4, 0]), at(FOG, 0, 2, -6), 0.5 * k), fov: 52, roll: 0.02 };
};
// 8 the clearing: the sagging balloon, the family sneaks off to the left
const S8a = (f: number) => dolly(at(FOG, 5.0, 1.45, 8.6), at(FOG, -0.9, 1.3, -0.5), pushK(f, 598, 0.0022), { fov: 46, roll: -0.025 });
// 9 morning: the men round the crumpled balloon; in on the magnifier, then on the looking-round
const S9a = (f: number) => dolly(at(FOG, 5.2, 2.2, 9.4), at(FOG, 0.3, 1.1, 1.6), pushK(f, 638, 0.0018), { fov: 46, roll: 0.02 });
const S9b = (f: number) => dolly(at(FOG, -0.9, 1.35, 5.3), at(FOG, -1.75, 0.85, 1.75), pushK(f, 712, 0.0022, 0.006, 22, 12), { fov: 40, roll: -0.03 });
const S9c = (f: number) => dolly(at(FOG, 2.6, 1.9, 8.0), at(FOG, 0.3, 1.25, 2.2), pushK(f, SEARCH - 8, 0.0024, 0.006, 20, 6), { fov: 44, roll: 0.02 });
// 10 kitchen: the father in close-up, then the whole table
export const FA_KIT: V3 = at(KIT, -0.32, 0, -1.62), FB_KIT: V3 = at(KIT, 0.32, 0, -1.62);
const S10a = (f: number) => dolly(at(KIT, -0.24, 1.3, 0.35), at(FA_KIT, 0, 1.18, 0), pushK(f, 780, 0.0028, 0.008, 18, 24), { fov: 38, roll: -0.025 });
const S10b = (f: number) => dolly(at(KIT, 0.1, 1.5, 2.7), at(KIT, 0, 1.05, -1.35), pushK(f, 823, 0.0018, 0.006, 16, 16), { fov: 50, roll: 0.02 });
// 11 shops: glide along the row, easing at each counter
export const shopX = (f: number) => {
  const k = [859, 892, 924, 962], xs = [-0.2, 4.4, 9.0, 9.6];
  for (let i = 0; i < 3; i++) if (f < k[i + 1]) {
    const hold = k[i] + 22, base = xs[i] + 0.25 * travel(f, k[i], hold, 6);
    if (f < hold) return base;
    return base + (xs[i + 1] - xs[i] - 0.25) * glide((f - hold) / (k[i + 1] - hold + (i === 2 ? 30 : 0)));
  }
  return xs[3];
};
const S11a = (f: number): Shot => { const x = shopX(f); return { pos: at(SHOP, x + 0.45, 1.55, 3.6), look: at(SHOP, x + 0.35, 1.2, -1.3), fov: 48, roll: 0.02 }; };
// 12 the meadow at dusk: low along the envelope, rising and pulling back as it fills
const S12a = (f: number): Shot => {
  const u = travel(f, 962, 1040, 16);
  return { pos: lerp3(at(MEAD, 8, 6.5, 9), at(MEAD, 15, 12, 18), u), look: lerp3(at(MEAD, -8, 0.5, -1.5), at(MEAD, -11, 2, -1), u), fov: 50, roll: -0.02 * (1 - u) };
};
// 13 night take-off: on the crowded platform, then tilting up and pulling back as it rises
const S13a = (f: number) => dolly(at(MEAD, 3.4, 1.55, 5.0), at(MEAD, 0, 1.15, 0), pushK(f, 1022, 0.0022, 0.006, 22, 24), { fov: 46, roll: 0.02 });
const S13b = (f: number): Shot => {
  const B = b2At(13, f).pos, u = travel(f, 1062, 1150, 18);
  return { pos: lerp3(at(MEAD, 3.4, 1.55, 5.0), at(MEAD, 10, 1.0, 16), u), look: add(B, [0, 1.0 + 9 * u, 0]), fov: 46 + 10 * u, roll: 0.02 };
};
// 14 the watchtower at night from below: the beam swings up, fades far below the balloon
const S14a = (f: number) => dolly(at(TOWER, 22, 1.4, 16), at(TOWER, 0, 9.5, 0), pushK(f, 1128, 0.0015), { fov: 46, roll: -0.02 });
const S14b = (f: number): Shot => {
  const u = travel(f, 1150, 1206, 16);
  return { pos: at(TOWER, 22 + 4 * u, 1.4 - 0.2 * u, 16 + 1.5 * u), look: lerp3(at(TOWER, 0, 9.5, 0), at(TOWER, -8, 105, -14), glide(u)), fov: 46 + 20 * u, roll: -0.02 };
};
// 15 dawn: the balloon comes down in the clearing; in on the families
const S15a = (f: number): Shot => {
  const B = b2At(15, f).pos, u = travel(f, 1258, 1310, 16);
  return { pos: lerp3(at(BAY, 9, 4.5, 19), at(BAY, 3.6, 1.6, 5.4), u), look: lerp3(add(B, [0, 8, 0]), at(BAY, 0, 1.15, 0), glide(u)), fov: 48 - 6 * u, roll: 0.02 };
};
// 16 outro: calm rise over the forest and the flat envelope toward the sunrise
const S16a = (f: number): Shot => {
  const u = travel(f, 1334, TOTAL + 30, 24);
  return { pos: at(BAY, 16 - 6 * u, 3 + 26 * u, 22 + 10 * u), look: at(BAY, -14 - 20 * u, 2 + 6 * u, -30 - 40 * u), fov: 48, roll: 0 };
};

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1a }],
  2: [{ f: 86, s: (f) => fabricCam(f) }],
  3: [{ f: 175, s: S3a }, { f: 212, dur: 26, s: S3b }],
  4: [{ f: 254, s: S4a }],
  5: [{ f: 326, s: S5a }, { f: RIESIG - 6, dur: 30, s: S5b }],
  6: [{ f: 394, s: S6a }],
  7: [{ f: 444, s: S7a }, { f: SINK0, cut: true, s: S7b }],
  8: [{ f: 598, s: S8a }],
  9: [{ f: 638, s: S9a }, { f: FIND - 18, dur: 22, s: S9b }, { f: SEARCH - 8, dur: 22, s: S9c }],
  10: [{ f: 780, s: S10a }, { f: 823, dur: 24, s: S10b }],
  11: [{ f: 859, s: S11a }],
  12: [{ f: 962, s: S12a }],
  13: [{ f: 1022, s: S13a }, { f: 1062, cut: true, s: S13b }],
  14: [{ f: 1128, s: S14a }, { f: 1150, cut: true, s: S14b }],
  15: [{ f: 1258, s: S15a }],
  16: [{ f: 1334, s: S16a }],
};

// impact kicks: image offset flips sign every frame, decays over 7 f
const KICKS: [number, number][] = [[SLAM / FPS, 0.9], [BUMP / FPS, 0.35], [ROAR / FPS, 0.5], [TOUCH / FPS, 0.45], [LAND1 / FPS, 0.3]];
export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of KICKS) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const camAt = (sid: number, f: number): Cam => {
  const c = run(CAMS[sid], f), a = kickAt(f / FPS);
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};

// ---------------- lens ----------------
/** cInf = blur-disc radius in px at 1080x1920 for things at infinity; 0 = sharp. focus = world point (else look). */
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const DOF: Dof[] = [
  { f: 0, cInf: 0 },
  { f: 86, cInf: 4 },                                                          // fabric close-up
  { f: 175, cInf: 6, focus: () => at(SOLDIER, 0, 1.4, 0) },                    // the soldier
  { f: 212, dur: 26, cInf: 0 },                                                // barrier: sharp
  { f: 254, cInf: 0 },                                                         // street: sharp
  { f: 326, cInf: 8, focus: () => at(NEEDLE, 0, 0.1, 0) },                   // the needle
  { f: RIESIG - 6, dur: 30, cInf: 5, focus: () => at(SEW, 0.2, 1.3, -1.8) },  // the room
  { f: 394, cInf: 0 },                                                         // dusk glide: sharp
  { f: 444, cInf: 6 },                                                         // fog flight
  { f: SINK0, cInf: 0 },
  { f: 598, cInf: 7, focus: () => at(FOG, -0.9, 1.3, -0.3) },
  { f: 638, cInf: 0 },                                                         // morning wide
  { f: FIND - 18, dur: 22, cInf: 12, focus: () => at(FOG, -1.75, 0.95, 1.6) }, // magnifier
  { f: SEARCH - 8, dur: 22, cInf: 8, focus: () => at(FOG, 0.3, 1.4, 2.0) },
  { f: 780, cInf: 13, focus: () => at(FA_KIT, 0, 1.2, 0) },                    // father close-up
  { f: 823, dur: 24, cInf: 7, focus: () => at(KIT, 0, 1.1, -1.5) },            // the table
  { f: 859, cInf: 9, focus: (f) => at(SHOP, shopX(f) + 0.2, 1.3, -1.2) },     // shops
  { f: 962, cInf: 0 },                                                         // meadow
  { f: 1022, cInf: 9, focus: () => at(MEAD, 0, 1.0, 0) },                      // platform
  { f: 1062, dur: 30, cInf: 0 },
  { f: 1128, cInf: 0 },                                                        // tower
  { f: 1258, cInf: 0 },
  { f: 1300, dur: 20, cInf: 7, focus: () => at(BAY, 0, 1.2, 0) },              // the hug
  { f: 1334, cInf: 0 },                                                        // outro: sharp
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
