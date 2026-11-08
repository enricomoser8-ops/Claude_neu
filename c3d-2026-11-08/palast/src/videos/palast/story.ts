// Timeline of "Der Briefträger, der einen Palast baute" (Hauterives, France, 1879-1912): 14 internal shots timed to the
// German voice (/home/claude/shorts/src/daily/palast-cues.json, frame = round(t * 30)). One world, sets at different
// origins: PAL (the palace garden by the village road), PATH (the postman's round: a country path, fields, a village,
// hills), CEM (the village cemetery). The palace grows with a progress value (palaceP) from the first low wall at night
// to the finished building. Camera grammar of the skill: cuts only at place / time changes, smootherstep glides of
// 18-40 f elsewhere, every hold creeps, flip-sign impact kicks.
export const FPS = 30;
export const TOTAL = 1395;
export const D0 = 0;
export type V3 = [number, number, number];

// ---------------- set origins ----------------
export const PAL: V3 = [0, 0, 0];      // the palace (body x -13..13, z -6..6), garden in front (z 6.5..15.4), hedge z 16, road z 19
export const PATH: V3 = [300, 0, 0];   // the country path along x (z -1.6..1.6), village north of it, hills all round
export const CEM: V3 = [-300, 0, 0];   // the village cemetery
export const at = (o: V3, x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];

// ---------------- layout ----------------
export const ROAD_Z = 19, HEDGE_Z = 16, HEDGE_H = 2.5;
export const PALACE = { x0: -13, x1: 13, z0: -6, z1: 6, top: 6.5 };
export const FENCE_X = -19;                       // garden fence on the west side (villagers outside)
export const W0 = { x0: -11.6, x1: -8.4, z: 4.75, d: 0.5 }; // the first low wall (night)
export const LAMP: V3 = [-9.3, 0.95, 4.1];        // oil lamp on two stacked crates behind the wall, beside him
export const MAILBOX: V3 = at(PATH, 1.42, 0, -1.05);
export const STONE1: V3 = at(PATH, 40.0, 0, 0.18);   // the strange stone (shot 3)
export const HOOK_STONE: V3 = [-1.02, 0, 19.05];
export const PLAQUE: V3 = [6.9, 0, 13.7];          // the monument plaque on a low stone post
export const TOMB: V3 = at(CEM, 0, 0, -3.2);

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 3;

// ---------------- story mechanics (frames: every visual reaction 0-3 f before its word) ----------------
export const TRIP = 23;                  // "stolpert" 24: the foot catches the stone
export const REVEAL = 93;                // "Palast" 96: the palace fully in view
export const DROP = 224;                 // "Tag" 226: the letter goes into the mailbox
export const STOP_C = 316;               // "seltsam" 317: he stops at the stone
export const BEND = 331;                 // "geformter" 334: he bends down
export const PICK = 364;                 // "steckt" 367: stone in the hand
export const POCKET = 377;               // "ein" 379: into the pocket
export const FIND = 407;                 // "findet" 410: he smiles at the stones
export const MORE = 427;                 // "mehr" 430: arms open, delighted
export const POCKETS = 495;              // "trägt" 497: pockets full
export const BARROW = 547;               // cut to the wheelbarrow ("dann" 547, "Schubkarre" 559)
export const TROWEL = 592;               // "baut" 595: the trowel scrapes mortar
export const LAMP_F = 621;               // "Öllampe" 624: lamp flame flickers up
export const WHISPER = 681;              // "Leute im Dorf" 684: whisper
export const TAP = 707;                  // "verrückt" 710: one taps his forehead
export const SHRUG = 740;                // "gedacht" 744: he shrugs into the lens
export const GROW0 = 776, GROW1 = 832;   // time-lapse: the palace grows ("weiter" 780 .. 835)
export const TIERE = 935, TEMPEL = 952, FIGUREN = 969;
export const LOVE = 995;                 // the old man looks at his palace
export const VERBOT = 1041;              // "verboten" 1044: the official wags his finger
export const TOMB0 = 1072;               // "baut" 1075: building the tomb
export const PLAQUE_F = 1226;            // "Denkmalschutz" 1229

// ---------------- shots ----------------
export type Light = "day" | "golden" | "night" | "indoor" | "dusk" | "morning";
export type ShotDef = { id: number; a: number; b: number; light: Light; set: V3; what: string };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 115, light: "day", set: PAL, what: "hook: a postman on the village road trips over a stone, the lens glides past him and rises behind him over the hedge: the fantastic stone palace in the sun" },
  { id: 2, a: 115, b: 283, light: "day", set: PATH, what: "1879: hills, fields, a village; the young postman walks his round on the path and drops a letter into a mailbox" },
  { id: 3, a: 283, b: 389, light: "day", set: PATH, what: "a strangely shaped stone (a little animal) on the path; he stops, bends down, picks it up and pockets it" },
  { id: 4, a: 389, b: 442, light: "day", set: PATH, what: "next morning: more odd stones along the path, he smiles and opens his arms" },
  { id: 5, a: 442, b: 490, light: "day", set: PATH, what: "calm glide over the village rooftops and fields (follow-button overlay, lower centre calm)" },
  { id: 6, a: 490, b: BARROW, light: "day", set: PATH, what: "pockets bulging with stones, he walks on along the path" },
  { id: 7, a: BARROW, b: 586, light: "day", set: PATH, what: "he pushes a wheelbarrow full of stones along the path (wheel turns)" },
  { id: 8, a: 586, b: 667, light: "night", set: PAL, what: "night: he builds the first low wall by the warm light of an oil lamp; pull back: alone in the dark garden" },
  { id: 9, a: 667, b: 761, light: "day", set: PAL, what: "villagers at the fence whisper, one taps his forehead; glide to the postman: he looks into the lens and shrugs" },
  { id: 10, a: 761, b: 835, light: "day", set: PAL, what: "time-lapse: walls and towers grow, seasons change, his beard turns grey" },
  { id: 11, a: 835, b: 1066, light: "day", set: PAL, what: "the finished palace: glide along the facade (animals, temple, giant figures); the old postman looks at it lovingly, an official wags his finger" },
  { id: 12, a: 1066, b: 1181, light: "day", set: CEM, what: "the old man builds a small tomb in the same style in the village cemetery" },
  { id: 13, a: 1181, b: 1255, light: "day", set: PAL, what: "today: visitors with cameras in front of the palace, the monument plaque with a star" },
  { id: 14, a: 1255, b: TOTAL, light: "golden", set: PAL, what: "outro: calm slow rise over the palace in the evening sun (logo overlay)" },
];
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => [{ id: shotAt(f).id, alpha: 1 }];

// ---------------- the palace progress (0 = nothing, 1 = finished) ----------------
export const palaceP = (f: number) => {
  if (f < 586) return 1;                                        // hook: the finished palace (shots on the path never see it)
  if (f < 667) return 0.012 + 0.016 * smooth((f - 592) / 60);  // night: the first low wall grows
  if (f < 761) return 0.06;                                     // day after: a few walls
  if (f < 835) return 0.06 + 0.94 * smooth((f - GROW0) / (GROW1 - GROW0));
  return 1;
};
/** season clock of the time-lapse: 0 summer .. 1 autumn .. 2 winter .. 3 spring (wraps), else summer */
export const seasonAt = (f: number) => (f >= 761 && f < 835 ? (((f - 768) / 22) % 4 + 4) % 4 : 0);
/** age of the postman 0 (young) .. 1 (old, grey beard) */
export const ageAt = (f: number) => (f < 761 ? 0 : f < 835 ? smooth((f - 790) / 40) : 1);

// ---------------- walking ----------------
export const WALK_V = 1.25;      // m/s
export const STRIDE = 0.68;      // card stride factor: one cycle = 1.6 * STRIDE m
/** distance walked since f0 at speed v with soft start / stop ramps of e frames, stopping at f1 */
export const walkDist = (f: number, f0: number, f1: number, v = WALK_V, e = 6) => {
  const vf = v / FPS, x = Math.max(0, Math.min(f, f1) - f0), L = f1 - f0;
  if (L <= 0) return 0;
  const a = Math.min(e, L / 2);
  if (x < a) return (vf * x * x) / (2 * a);
  if (x > L - a) { const y = L - x; return vf * (L - a) - (vf * y * y) / (2 * a); }
  return vf * (x - a / 2);
};
// hook: walks +x along the road, trips at TRIP, stumbles forward and stops
export const HOOK_X0 = -2.35;
export const hookX = (f: number) => {
  const xt = HOOK_X0 + (WALK_V / FPS) * TRIP;
  if (f <= TRIP) return HOOK_X0 + (WALK_V / FPS) * f;
  return xt + 0.35 * easeOut((f - TRIP) / 8);
};
// shot 2: walk to the mailbox, post the letter, walk on
export const P2_X0 = -2.87, P2_Z = -0.45;
export const p2X = (f: number) => PATH[0] + P2_X0 + walkDist(f, 115, 206) + walkDist(f, 236, 300);
// shot 3: walks in, stops before the stone
export const P3_X1 = 39.70;
export const p3X = (f: number) => PATH[0] + P3_X1 - walkDist(STOP_C, 283, STOP_C) + walkDist(f, 283, STOP_C);
// shot 4: walks in, stops by the stones
export const P4_X1 = -40.1;
export const p4X = (f: number) => PATH[0] + P4_X1 - walkDist(403, 389, 403) + walkDist(f, 389, 403);
// shots 6/7: walks on with full pockets, then with the barrow (never stops)
export const p6X = (f: number) => PATH[0] - 82 + walkDist(f, 470, 600, WALK_V, 1);
export const p7X = (f: number) => PATH[0] - 112 + walkDist(f, 530, 600, 1.1, 1);

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
const T = (f: number) => f / FPS;
/** push-in factor since f0: the subject grows ~rate per frame; `punch` raises it (8 f soft edges) for n frames from p0 */
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35, p0 = 0) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x - p0, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
const lerp3 = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
const bez = (a: V3, c: V3, b: V3, s: number): V3 => { const r = 1 - s; return [0, 1, 2].map((i) => r * r * a[i] + 2 * s * r * c[i] + s * s * b[i]) as V3; };
/** constant-speed travel with soft ends: 0..1 over [f0, f1], speed ramps over `e` frames at each end */
const travel = (f: number, f0: number, f1: number, e = 20) => {
  const L = f1 - f0, x = Math.max(0, Math.min(L, f - f0)), v = 1 / (L - e);
  return x < e ? (v * x * x) / (2 * e) : x > L - e ? 1 - (v * (L - x) ** 2) / (2 * e) : v * (x - e / 2);
};
const add = (a: V3, x: number, y: number, z: number): V3 => [a[0] + x, a[1] + y, a[2] + z];

// 1 hook: low on the road ahead of him, an arc past him while he trips, then a rise behind him over the hedge
const HOOK_C: V3 = [-0.55, 0, ROAD_Z];
const S1a = (f: number): Shot => {
  const u = travel(f, 0, 64, 18), x = hookX(Math.min(f, 60));
  const pos = bez(add(HOOK_C, -2.6, 0.6, 3.2), add(HOOK_C, -0.4, 0.7, 3.9), add(HOOK_C, 1.6, 1.45, 4.9), u);
  const look = lerp3([x + 0.15, 0.6, ROAD_Z], add(HOOK_C, -0.2, 1.05, -0.6), glide(u));
  return { pos, look, fov: 44, roll: 0.03 * (1 - u) - 0.02 * u };
};
const S1b = (f: number): Shot => {
  const a = S1a(64), u = travel(f, 64, 118, 14);
  return { pos: bez(a.pos, add(HOOK_C, 0.9, 4.0, 6.6), [0.4, 7.8, 26.5], u), look: lerp3(a.look, [0.3, 5.6, 0], glide(u)), fov: 44 + 6 * glide(u), roll: -0.02 * (1 - u) };
};
// 2 the round: a wide of the valley, down onto him walking, the mailbox, he walks on
const S2a = (f: number): Shot => {
  const u = travel(f, 115, 200, 26), x = p2X(f) - PATH[0];
  const look = lerp3(at(PATH, 6, 1.6, -8), at(PATH, x + 0.55, 1.05, -0.9), glide(u));
  return { pos: bez(at(PATH, -13, 7.2, 15.5), at(PATH, -5, 3.2, 9.5), at(PATH, x + 0.2, 1.42, 4.9), u), look, fov: 50 - 10 * glide(u), roll: 0.02 };
};
const S2b = (f: number): Shot => {
  const k = pushK(f, 200, 0.0018, 0.005, 24, 14); // fixed at the mailbox: he walks out of frame afterwards
  return dolly(at(PATH, 0.95, 1.42, 4.9), at(PATH, 1.35, 1.05, -0.9), k, { fov: 40, roll: 0.02 });
};
// 3 the stone: low close-up on the path, the feet walk in, a rise to the medium as he bends and pockets it
const S3a = (f: number) => dolly(at(PATH, 40.05, 0.34, 1.75), at(PATH, 39.85, 0.16, 0.0), pushK(f, 283, 0.0016), { fov: 40, roll: 0.025 });
const S3b = (f: number) => dolly(at(PATH, 40.05, 1.05, 4.1), at(PATH, 40.0, 0.74, 0.0), pushK(f, 330, 0.0022, 0.006, 22, 30), { fov: 40, roll: -0.02 });
// 4 next morning: the odd stones in the foreground, he walks up behind them and smiles
const S4a = (f: number) => dolly(at(PATH, -36.9, 1.35, 3.6), at(PATH, -39.3, 0.85, -0.1), pushK(f, 389, 0.0022, 0.0065, 24, 34), { fov: 42, roll: 0.02 });
// 5 rooftops: calm glide over the village and the fields
const S5a = (f: number): Shot => {
  const u = travel(f, 442, 492, 10);
  return { pos: lerp3(at(PATH, 14, 25, 13), at(PATH, 34, 23, 6), u), look: lerp3(at(PATH, 30, 0, -26), at(PATH, 50, 0, -34), u), fov: 50, roll: -0.015 + 0.01 * u };
};
// 6 pockets: side tracking with him at walking speed
// (the lens lags behind the walker, so he clearly travels across the frame and the ground)
const S6a = (f: number): Shot => { const x0 = p6X(490) - PATH[0], xc = x0 + 0.55 + 0.45 * (p6X(f) - PATH[0] - x0); return dolly(at(PATH, xc + 0.3, 1.0, 3.6), at(PATH, xc + 0.15, 0.82, 0), pushK(f, 490, 0.0018), { fov: 40, roll: 0.02 }); };
// 7 the barrow: side tracking
const S7a = (f: number): Shot => { const x0 = p7X(BARROW) - PATH[0], xc = x0 + 1.25 + 0.45 * (p7X(f) - PATH[0] - x0); return dolly(at(PATH, xc + 0.2, 1.2, 5.6), at(PATH, xc, 0.78, 0), pushK(f, BARROW, 0.0018), { fov: 40, roll: -0.02 }); };
// 8 night: close on the trowel and the lamp, then a pull back to the lonely wide
const S8a = (f: number) => dolly(at(PAL, -9.3, 1.5, 8.0), at(PAL, -9.95, 0.95, 4.3), pushK(f, 586, 0.0024, 0.006, 26, 6), { fov: 40, roll: 0.025 });
const S8b = (f: number): Shot => dolly(at(PAL, -3.4, 3.6, 17.4), at(PAL, -9.6, 0.9, 4.0), pushK(f, 662, 0.0016), { fov: 44, roll: -0.01 });
// 9 the villagers at the fence, a glide to the postman who shrugs into the lens
const S9a = (f: number) => dolly(at(PAL, -14.2, 1.75, 10.4), at(PAL, -20.4, 1.4, 6.6), pushK(f, 667, 0.0018, 0.006, 28, 38), { fov: 40, roll: -0.02 });
const S9b = (f: number) => dolly(at(PAL, -7.4, 1.55, 11.9), at(PAL, -9.3, 1.28, 7.5), pushK(f, 740, 0.0028, 0.007, 16, 0), { fov: 40, roll: 0.02 });
// 10 time-lapse: wide on the garden, slow push
const S10a = (f: number) => dolly(at(PAL, 4.0, 3.6, 15.0), at(PAL, -2.0, 3.8, 1.0), pushK(f, 761, 0.0022), { fov: 52, roll: 0 });
// 11 the finished palace: wide reveal, along the front past the animals, up to the temple, over to the giants,
//    down to the old postman in profile, then over to the official
const S11a = (f: number): Shot => { const u = travel(f, 835, 905, 16); return { pos: lerp3(at(PAL, 14.6, 6.4, 15.0), at(PAL, 12.4, 5.6, 15.1), u), look: lerp3(at(PAL, -2.0, 4.4, 1.0), at(PAL, -3.5, 4.0, 2.0), u), fov: 50, roll: -0.02 }; };
const S11b = (f: number) => dolly(at(PAL, -8.6, 1.85, 14.6), at(PAL, -4.8, 1.9, 7.6), pushK(f, 905, 0.0018), { fov: 44, roll: 0.02 });
const S11c = (f: number) => dolly(at(PAL, -3.2, 3.9, 14.4), at(PAL, -1.5, 8.2, -1.0), pushK(f, 935, 0.0016), { fov: 46, roll: -0.02 });
const S11d = (f: number) => dolly(at(PAL, 2.2, 2.6, 15.2), at(PAL, 8.4, 5.0, 6.4), pushK(f, 952, 0.0018), { fov: 46, roll: 0.02 });
const S11e = (f: number) => dolly(at(PAL, 3.6, 1.5, 15.0), at(PAL, 8.2, 2.2, 10.0), pushK(f, 975, 0.0016, 0.0045, 30, 20), { fov: 42, roll: -0.02 });
const S11f = (f: number) => dolly(at(PAL, 5.4, 1.65, 15.2), at(PAL, 7.75, 1.5, 11.6), pushK(f, 1028, 0.0018, 0.006, 22, 14), { fov: 40, roll: 0.02 });
// 12 the cemetery: from between the graves to the tomb, slow push
const S12a = (f: number) => dolly(at(CEM, 4.4, 1.7, 5.2), at(CEM, 0.9, 1.45, -2.4), pushK(f, 1066, 0.0024, 0.005, 30, 8), { fov: 44, roll: -0.02 });
// 13 today: visitors with cameras, a glide to the plaque
const S13a = (f: number) => dolly(at(PAL, 9.2, 2.3, 15.0), at(PAL, -1.0, 3.6, 3.0), pushK(f, 1181, 0.0016), { fov: 48, roll: 0.02 });
const S13b = (f: number) => dolly(at(PAL, 7.15, 1.3, 15.1), at(PAL, 6.9, 1.08, 13.6), pushK(f, 1214, 0.0024, 0.006, 20, 10), { fov: 40, roll: -0.02 });
// 14 outro: a calm slow rise over the palace in the evening sun
const S14a = (f: number): Shot => {
  const u = travel(f, 1255, TOTAL + 30, 26);
  return { pos: bez(at(PAL, 3.5, 3.4, 15.0), at(PAL, 5.0, 8.0, 21.0), at(PAL, 7.0, 15.0, 30.0), u), look: lerp3(at(PAL, -0.5, 7.8, -2), at(PAL, -1.0, 10.5, -14), u), fov: 50, roll: 0.01 };
};

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1a }, { f: 64, cut: true, s: S1b }],
  2: [{ f: 115, s: S2a }, { f: 200, dur: 20, s: S2b }],
  3: [{ f: 283, s: S3a }, { f: 318, dur: 30, s: S3b }],
  4: [{ f: 389, s: S4a }],
  5: [{ f: 442, s: S5a }],
  6: [{ f: 490, s: S6a }],
  7: [{ f: BARROW, s: S7a }],
  8: [{ f: 586, s: S8a }, { f: 642, dur: 24, s: S8b }],
  9: [{ f: 667, s: S9a }, { f: 720, dur: 22, s: S9b }],
  10: [{ f: 761, s: S10a }],
  11: [{ f: 835, s: S11a }, { f: 903, dur: 30, s: S11b }, { f: 940, dur: 18, s: S11c }, { f: 957, dur: 18, s: S11d }, { f: 968, dur: 22, s: S11e }, { f: 1030, dur: 20, s: S11f }],
  12: [{ f: 1066, s: S12a }],
  13: [{ f: 1181, s: S13a }, { f: 1210, dur: 26, s: S13b }],
  14: [{ f: 1255, s: S14a }],
};

// impact kicks: image offset flips sign every frame, decays over 7 f
const KICKS: [number, number][] = [[TRIP / FPS, 0.6], [VERBOT / FPS, 0.3], [TAP / FPS, 0.2]];
export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of KICKS) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const camAt = (sid: number, f: number): Cam => {
  const c = run(CAMS[sid], f), a = kickAt(T(f));
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
  { f: 0, cInf: 10, focus: (f) => [hookX(f), 0.7, ROAD_Z] },             // hook: on the walker
  { f: 64, dur: 30, cInf: 0 },                                              // the rise: sharp
  { f: 115, cInf: 0 },                                                      // valley: sharp
  { f: 178, dur: 24, cInf: 8, focus: (f) => [p2X(f), 1.3, PATH[2] + P2_Z] }, // on him at the mailbox
  { f: 283, cInf: 15, focus: () => at(STONE1, 0, 0.1, 0) },                // the stone close-up
  { f: 318, dur: 30, cInf: 12, focus: () => at(PATH, P3_X1, 0.9, 0) },    // on him
  { f: 389, cInf: 10, focus: () => at(PATH, -40, 1.2, 0) },                // next morning: on him
  { f: 442, cInf: 0 },                                                      // rooftops: sharp
  { f: 490, cInf: 11, focus: (f) => [p6X(f), 0.9, PATH[2]] },              // pockets
  { f: BARROW, cInf: 9, focus: (f) => [p7X(f) + 0.5, 0.8, PATH[2]] },      // barrow
  { f: 586, cInf: 12, focus: () => at(PAL, -9.8, 1.0, 4.4) },              // night close
  { f: 642, dur: 24, cInf: 0 },                                             // night wide: sharp
  { f: 667, cInf: 11, focus: () => at(PAL, -20.4, 1.5, 6.6) },             // villagers
  { f: 720, dur: 22, cInf: 11, focus: () => at(PAL, -9.3, 1.45, 7.6) },    // the shrug
  { f: 761, cInf: 0 },                                                      // time-lapse: sharp
  { f: 835, cInf: 0 },                                                      // palace wide: sharp
  { f: 903, dur: 30, cInf: 6, focus: () => at(PAL, -5.5, 1.6, 9.2) },      // animals
  { f: 940, dur: 18, cInf: 0 },                                             // temple: sharp
  { f: 968, dur: 22, cInf: 9, focus: () => at(PAL, 8.4, 1.6, 10.9) },      // the old postman
  { f: 1030, dur: 20, cInf: 9, focus: () => at(PAL, 7.6, 1.5, 11.7) },     // the official
  { f: 1066, cInf: 7, focus: () => at(CEM, 1.6, 1.3, -1.4) },              // cemetery
  { f: 1181, cInf: 0 },                                                     // visitors: sharp
  { f: 1210, dur: 26, cInf: 13, focus: () => at(PLAQUE, 0, 1.08, 0) },     // the plaque
  { f: 1255, cInf: 0 },                                                     // outro: sharp
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
