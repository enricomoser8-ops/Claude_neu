// Our own flat 2D cartoon cast (riflemen, officer, townsfolk, kid, parent) + 2D effects, drawn on a canvas.
// Construction v2 (characters.md, our own cast): superellipse heads (pointed crown 1.75 / full jaw 2.3, chin taper,
// seeded side bulge + tilt), bean torsos, single-stroke limbs with ink-dot hands, a thick-thin plum outline weighted
// away from the light, soft painted crescents, deadpan lidded eyes, no blush, no catchlights.
// Design space 600 x 1000 units (soles at y = 975); the canvas transform scales it.
export const INK = "#241726";
export const SKIN = "#ffe2c2";
const WHITE = "#ffffff";
const MOUTH = "#5a1e28";
const TONGUE = "#e86e78";
type C3 = [number, number, number];
const SH_SKIN: C3 = [0.96, 0.86, 0.84]; // measured shadow/lit ratio on skin heads
const SH_CLOTH: C3 = [0.64, 0.66, 0.74]; // torsos: lit side -> far side ~0.65
const SH_FELT: C3 = [0.62, 0.62, 0.7];

export type Build = "adult" | "stout" | "kid" | "slim";
export type Outfit = {
  jacket: string; pants: string; boots: string; hat?: string | null; belt?: string | null; buttons?: string; rifle?: boolean;
  sash?: string; sword?: boolean; moustache?: string; skin?: string; head?: number; cap?: string; hair?: string; dress?: string;
  build?: Build;
  /** Mauer short: glasses frame colour, shirt + tie (suits), scarf colour */
  glasses?: string; shirt?: string; tie?: string; scarf?: string;
  /** Köpenick 1906: cap band colour, coat collar colour, long greatcoat skirt, double row of buttons, epaulettes,
   *  big upturned moustache, apron, shawl, side-hair fringe colour for "bald" */
  band?: string; collar?: string; coat?: boolean; dbl?: boolean; epaulette?: string; mst?: "big" | "thin"; apron?: string; shawl?: string;
  /** Eiffel 1925: walking cane (pose "cane"), diagonal sash, police cape, buttonhole flower, beard */
  cane?: boolean; sashD?: string; cape?: string; flower?: string; beard?: string;
};
type P2 = [number, number];

const rad = (d: number) => (d * Math.PI) / 180;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export const mul = (c: string, m: C3) => {
  const n = parseInt(c.slice(1), 16);
  const ch = (v: number, k: number) => Math.min(255, Math.round(v * k)).toString(16).padStart(2, "0");
  return `#${ch((n >> 16) & 255, m[0])}${ch((n >> 8) & 255, m[1])}${ch(n & 255, m[2])}`;
};
export const shade = (c: string, k: number) => mul(c, [k, k, k]);
export const mix = (a: string, b: string, t: number) => {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t).toString(16).padStart(2, "0");
  return `#${ch(16)}${ch(8)}${ch(0)}`;
};
/** deterministic per-character random in [0, 1) */
const rnd = (seed: number, k: number) => { const x = Math.sin(seed * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const rotPts = (pts: P2[], a: number, cx: number, cy: number): P2[] =>
  pts.map(([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)]);
const rotAbout = (q: P2, a: number, c: P2): P2 => rotPts([q], a, c[0], c[1])[0];
const lerp2 = (a: P2, b: P2, t: number): P2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** smooth curve from a through (near) k to b, as a polyline */
const curve = (a: P2, k: P2, b: P2, n = 10): P2[] => {
  const c: P2 = [2 * k[0] - (a[0] + b[0]) / 2, 2 * k[1] - (a[1] + b[1]) / 2], out: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, s = 1 - t;
    out.push([s * s * a[0] + 2 * s * t * c[0] + t * t * b[0], s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]]);
  }
  return out;
};

export const RIFLEMAN: Outfit = { jacket: "#357650", pants: "#3d4440", boots: INK, hat: "shako", belt: "#f1efe6", buttons: "#d9dde0", rifle: true };
export const OFFICER: Outfit = { ...RIFLEMAN, hat: "shako_tall", buttons: "#e8c45a", sash: "#c0353a", sword: true, moustache: "#4a3020", rifle: false, belt: null, build: "stout" };
export const KID: Outfit = { jacket: "#f08a2c", pants: "#3b5b9a", boots: "#f4f1ea", hat: "cap", cap: "#e2453c", build: "kid" };
export const PARENT: Outfit = { jacket: "#7b5ac9", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a" };
export const SKINS = [SKIN, "#f5c9a0", "#ecd0b6", "#c99067"];

export const soldier = (v = 0, extra: Partial<Outfit> = {}): Outfit => {
  const o: Outfit = { ...RIFLEMAN, skin: SKINS[v % 4] };
  if (v % 4 === 1) o.moustache = "#4a3426";
  if (v % 4 === 3) o.moustache = "#2a201a";
  return { ...o, ...extra };
};

export const townsfolk = (v = 0): Outfit => {
  const coats = ["#3f6fb5", "#8c3b4a", "#5d7a3a", "#b5653f", "#2f5f6a", "#7b5ac9"];
  const o: Outfit = { jacket: coats[v % 6], pants: "#3b3f52", boots: "#4a3426", skin: SKINS[v % 4] };
  return v % 2 ? { ...o, hat: "bonnet", dress: ["#d9a441", "#c25a7a", "#5a8fc2"][v % 3] } : { ...o, hat: "tophat" };
};

export class Pen {
  g: CanvasRenderingContext2D;
  ol = 12;
  /** [angle, cx, cy] rotation about (cx, cy), optional post-translation [.., dx, dy] */
  rot: number[] | null = null;
  constructor(g: CanvasRenderingContext2D) { this.g = g; }
  P(x: number, y: number): P2 {
    if (!this.rot) return [x, y];
    const r = this.rot, a = r[0], cx = r[1], cy = r[2], dx = r.length > 3 ? r[3] : 0, dy = r.length > 4 ? r[4] : 0, c = Math.cos(a), s = Math.sin(a);
    return [cx + (x - cx) * c - (y - cy) * s + dx, cy + (x - cx) * s + (y - cy) * c + dy];
  }
  path(pts: P2[], close: boolean) {
    const g = this.g;
    g.beginPath();
    pts.forEach((p, i) => { const [x, y] = this.P(p[0], p[1]); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
    if (close) g.closePath();
  }
  /** filled shape with an ink outline; fill=null draws the outline only */
  poly(pts: P2[], fill: string | null, ol?: number) {
    const g = this.g, w = ol ?? this.ol;
    this.path(pts, true);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (w) { g.lineWidth = w; g.strokeStyle = INK; g.lineJoin = "round"; g.stroke(); }
  }
  ell(cx: number, cy: number, rx: number, ry: number, fill: string | null, ol?: number, a0 = 0, a1 = 360, rot = 0) {
    this.poly(ellPts(cx, cy, rx, ry, a0, a1, rot), fill, ol);
  }
  /** thick round-capped limb with an ink rim (effects, rope) */
  line(pts: P2[], fill: string, w: number, ink = true) {
    const g = this.g;
    g.lineCap = "round"; g.lineJoin = "round";
    if (ink) { this.path(pts, false); g.strokeStyle = INK; g.lineWidth = w + 2 * this.ol * 0.9; g.stroke(); }
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
  }
  stroke(pts: P2[], w: number, fill = INK) {
    const g = this.g;
    g.lineCap = "round"; g.lineJoin = "round";
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
  }
  arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, w: number, fill = INK) {
    const pts: P2[] = [];
    for (let i = 0; i <= 24; i++) pts.push([cx + rx * Math.cos(rad(a0 + ((a1 - a0) * i) / 24)), cy + ry * Math.sin(rad(a0 + ((a1 - a0) * i) / 24))]);
    this.stroke(pts, w, fill);
  }
  dot(cx: number, cy: number, r: number, fill = INK) {
    const [x, y] = this.P(cx, cy);
    this.g.beginPath(); this.g.arc(x, y, r, 0, Math.PI * 2); this.g.fillStyle = fill; this.g.fill();
  }
  /** draw with a closed shape as clip */
  clip(pts: P2[], fn: () => void) { const g = this.g; g.save(); this.path(pts, true); g.clip(); fn(); g.restore(); }
  /** flat fill + soft crescent on the side away from the light (light = canvas angle the light comes FROM).
   *  Radial ramp centred `shift` R toward the light: flat out to ~0.6 R on the far side, full shadow by ~0.8 R. */
  shadedFill(pts: P2[], base: string, shadow: string, light: number, R: number, shift = 0.45, r0 = 1.05, r1 = 1.25) {
    const g = this.g, n = pts.length;
    let cx = 0, cy = 0;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; }
    const [gx, gy] = this.P(cx + Math.cos(light) * shift * R, cy + Math.sin(light) * shift * R);
    const gr = g.createRadialGradient(gx, gy, 0, gx, gy, r1 * R);
    gr.addColorStop(0, base); gr.addColorStop(r0 / r1, base); gr.addColorStop(1, shadow);
    this.path(pts, true); g.fillStyle = gr; g.fill();
  }
  /** broad gradient across a shape along the light: lit edge = base, far edge = shadow (torsos, coats) */
  gradFill(pts: P2[], base: string, shadow: string, light: number, flat = 0.22) {
    const g = this.g, dx = Math.cos(light), dy = Math.sin(light), n = pts.length;
    let cx = 0, cy = 0, lo = Infinity, hi = -Infinity;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; const d = x * dx + y * dy; lo = Math.min(lo, d); hi = Math.max(hi, d); }
    const dc = cx * dx + cy * dy;
    const [ax, ay] = this.P(cx + dx * (hi - dc), cy + dy * (hi - dc)), [bx, by] = this.P(cx + dx * (lo - dc), cy + dy * (lo - dc));
    const gr = g.createLinearGradient(ax, ay, bx, by);
    gr.addColorStop(0, base); gr.addColorStop(flat, base); gr.addColorStop(1, shadow);
    this.path(pts, true); g.fillStyle = gr; g.fill();
  }
  /** thick-thin ink ring: w(θ) = w0 (1 + k cos(θ − thick)), θ from the contour centroid (canvas angles) */
  inkRing(pts: P2[], w0: number, thick: number, k = 0.45, col = INK) {
    const n = pts.length;
    let cx = 0, cy = 0;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; }
    const out: P2[] = [], inn: P2[] = [];
    pts.forEach((q, i) => {
      const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
      let nx = b[1] - a[1], ny = a[0] - b[0]; // outward normal for clockwise-on-screen contours
      const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      const h = 0.5 * w0 * (1 + k * Math.cos(Math.atan2(q[1] - cy, q[0] - cx) - thick));
      out.push([q[0] + nx * h, q[1] + ny * h]); inn.push([q[0] - nx * h, q[1] - ny * h]);
    });
    const g = this.g;
    const trace = (r: P2[]) => { r.forEach(([x0, y0], i) => { const [x, y] = this.P(x0, y0); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); };
    g.beginPath(); trace(out); trace(inn.reverse());
    g.fillStyle = col; g.fill("evenodd");
  }
  /** flat strap with a thin ink rim (cross belts, sash, rifle, handles) */
  band(pts: P2[], fill: string, w: number, rim: number, cap: CanvasLineCap = "butt") {
    const g = this.g; g.lineCap = cap; g.lineJoin = "round";
    this.path(pts, false); g.strokeStyle = INK; g.lineWidth = w + 2 * rim; g.stroke();
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
    g.lineCap = "round";
  }
}

const ellPts = (cx: number, cy: number, rx: number, ry: number, a0 = 0, a1 = 360, rot = 0, n = 48): P2[] => {
  const r = rad(rot), pts: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const a = rad(a0 + ((a1 - a0) * i) / n), x = rx * Math.cos(a), y = ry * Math.sin(a);
    pts.push([cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)]);
  }
  return pts;
};

const rrect = (x0: number, y0: number, x1: number, y1: number, r: number, n = 8): P2[] => {
  const pts: P2[] = [];
  for (const [cx, cy, a] of [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]])
    for (let i = 0; i <= n; i++) pts.push([cx + r * Math.cos(rad(a + (90 * i) / n)), cy + r * Math.sin(rad(a + (90 * i) / n))]);
  return pts;
};

/** tapered stroke, thick end at a: brows, moustache halves */
const taper = (p: Pen, a: P2, b: P2, wa: number, wb: number, col = INK) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  p.poly([[a[0] + nx * wa / 2, a[1] + ny * wa / 2], [b[0] + nx * wb / 2, b[1] + ny * wb / 2],
    [b[0] - nx * wb / 2, b[1] - ny * wb / 2], [a[0] - nx * wa / 2, a[1] - ny * wa / 2]], col, 0);
  p.dot(a[0], a[1], wa / 2, col); p.dot(b[0], b[1], wb / 2, col);
};

// ---------------- contours ----------------
export type Blob = { a: number; b: number; nTop: number; nBot: number; egg: number; asym: number; rot: number; noise: number; seed: number };

/** superellipse "bean": separate crown / jaw exponents, egg taper (neg = narrower chin), one-side bulge, soft noise.
 *  Points run right -> down -> left -> up (clockwise on screen). */
export const blobPts = (cx: number, cy: number, B: Blob, n = 72): P2[] => {
  const ph = [rnd(B.seed, 11), rnd(B.seed, 12), rnd(B.seed, 13)].map((v) => v * Math.PI * 2);
  const pts: P2[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t), e = 2 / (s < 0 ? B.nTop : B.nBot);
    let X = Math.sign(c) * Math.abs(c) ** e;
    const Y = Math.sign(s) * Math.abs(s) ** e;
    X *= (1 + B.egg * Y) * (1 + B.asym * Math.sign(X));
    const r = 1 + B.noise * (Math.cos(2 * t + ph[0]) + 0.7 * Math.cos(3 * t + ph[1]) + 0.5 * Math.cos(4 * t + ph[2]));
    const x = B.a * X * r, y = B.b * Y * r;
    pts.push([cx + x * Math.cos(B.rot) - y * Math.sin(B.rot), cy + x * Math.sin(B.rot) + y * Math.cos(B.rot)]);
  }
  return pts;
};

/** measured head: H/W 0.94, slightly pointed crown (1.75), fuller jaw (2.3), chin taper -0.12, 8 % bulge to the facing side */
export const headBlob = (seed: number, a = 118, facing = 0): Blob => ({
  a, b: a * (0.94 + 0.08 * (rnd(seed, 1) - 0.5)),
  nTop: 1.75 + 0.3 * (rnd(seed, 2) - 0.5), nBot: 2.3 + 0.3 * (rnd(seed, 3) - 0.5),
  egg: -0.12 + 0.06 * (rnd(seed, 4) - 0.5),
  asym: (0.06 + 0.04 * rnd(seed, 5)) * (facing || (rnd(seed, 6) < 0.5 ? -1 : 1)),
  rot: rad(8 * (rnd(seed, 7) - 0.5)), noise: 0.008, seed,
});

/** thickest outline direction: away from the light, pulled toward the ground (64 deg measured for upper-left light) */
export const thickAngle = (light: number) => Math.atan2(-Math.sin(light) + 0.8, -Math.cos(light));
const DEF_LIGHT = rad(-120);

// ---------------- faces ----------------
export type Expr = "neutral" | "stern" | "grin" | "laugh" | "whistle" | "nervous" | "shock" | "relief" | "relief_open" | "dazed" | "curious" | "unsure" | "read"
  | "pained" | "smile" | "smile_closed" | "lick" | "sly" | "proud" | "wink" | "eager" | "sigh" | "determined";
type EyeK = "dot" | "small" | "lid" | "slit" | "happy" | "dash" | "squeeze" | "shock" | "shockHalf" | "spiral";
type MouthK = "dash" | "frown" | "smirk" | "smile" | "smileWide" | "grin" | "laugh" | "o" | "O" | "wave" | "teeth" | "lick";
/** eyes [back, front], brows [inner, outer] offsets in u (+ = down), mouth kind */
const FACE: Record<Expr, { eye: [EyeK, EyeK]; brow: [number, number]; mouth: MouthK }> = {
  neutral: { eye: ["lid", "lid"], brow: [0, -1], mouth: "dash" },
  stern: { eye: ["lid", "lid"], brow: [3, -2], mouth: "frown" },
  grin: { eye: ["happy", "happy"], brow: [-3, -3], mouth: "grin" },
  laugh: { eye: ["squeeze", "squeeze"], brow: [-4, -4], mouth: "laugh" },
  whistle: { eye: ["dash", "dash"], brow: [-2, -4], mouth: "o" },
  nervous: { eye: ["small", "small"], brow: [-3, 2], mouth: "wave" },
  shock: { eye: ["shock", "shock"], brow: [-7, -6], mouth: "O" },
  relief: { eye: ["happy", "happy"], brow: [-2, 1], mouth: "smileWide" },
  relief_open: { eye: ["happy", "happy"], brow: [-2, 1], mouth: "grin" },
  dazed: { eye: ["spiral", "spiral"], brow: [-3, 2], mouth: "wave" },
  pained: { eye: ["squeeze", "lid"], brow: [-3, 2], mouth: "teeth" },
  smile: { eye: ["dot", "dot"], brow: [0, -1], mouth: "smirk" },
  smile_closed: { eye: ["happy", "happy"], brow: [0, -1], mouth: "smile" },
  lick: { eye: ["dot", "dot"], brow: [0, -1], mouth: "lick" },
  curious: { eye: ["dot", "dot"], brow: [-6, -3], mouth: "o" },
  unsure: { eye: ["small", "small"], brow: [-5, 3], mouth: "wave" },
  read: { eye: ["lid", "lid"], brow: [1, -1], mouth: "dash" },
  sly: { eye: ["lid", "lid"], brow: [4, -6], mouth: "smirk" },
  proud: { eye: ["happy", "happy"], brow: [-4, -3], mouth: "smile" },
  wink: { eye: ["dot", "happy"], brow: [-4, 2], mouth: "smirk" },
  eager: { eye: ["dot", "dot"], brow: [-8, -6], mouth: "grin" },
  sigh: { eye: ["slit", "slit"], brow: [-4, 4], mouth: "o" },
  determined: { eye: ["dot", "dot"], brow: [6, -3], mouth: "dash" },
};
const halfLid = (k: EyeK): EyeK => (k === "dot" || k === "small" ? "lid" : k === "lid" ? "slit" : k === "shock" ? "shockHalf" : k);
const eyeKind = (k: EyeK, lid: number): EyeK =>
  lid >= 1 && k !== "happy" && k !== "squeeze" && k !== "spiral" ? "dash" : lid > 0 ? halfLid(k) : k;
const lidOf = (b: boolean | number | undefined) => (b === true ? 1 : Number(b) || 0);

const eye = (p: Pen, kind: EyeK, x: number, ey: number, u: number, side: number, look: number, skin: string) => {
  const lx = x + look * 3 * u, lw = 3.8 * u;
  switch (kind) {
    case "dot": p.ell(lx, ey, 3.8 * u, 5.5 * u, INK, 0); break;
    case "small": p.ell(lx, ey, 3 * u, 4.4 * u, INK, 0); break;
    case "lid": p.ell(lx, ey - u, 7 * u, 6 * u, INK, 0, 0, 180); p.stroke([[x - 9 * u, ey - u], [x + 9 * u, ey - u]], lw); break;
    case "slit": p.ell(lx, ey, 7 * u, 2.6 * u, INK, 0, 0, 180); p.stroke([[x - 9 * u, ey], [x + 9 * u, ey]], lw); break;
    case "happy": p.arc(x, ey + 3 * u, 8 * u, 6 * u, 200, 340, lw); break;
    case "dash": p.stroke([[x - 8.5 * u, ey], [x + 8.5 * u, ey]], lw); break;
    case "squeeze": p.stroke([[x + 6 * u * side, ey - 5 * u], [x - 6 * u * side, ey], [x + 6 * u * side, ey + 5 * u]], lw); break;
    case "shock": case "shockHalf":
      p.ell(x, ey, 11 * u, 11 * u, WHITE, 2.6 * u); p.dot(lx - side * 1.5 * u, ey + 1.5 * u, 3 * u);
      if (kind === "shockHalf") { p.ell(x, ey, 11 * u, 11 * u, skin, 0, 180, 360); p.stroke([[x - 11 * u, ey], [x + 11 * u, ey]], 2.6 * u); }
      break;
    default: {
      const s: P2[] = [];
      for (let t = 1; t < 15; t++) s.push([x + Math.cos(t * 0.9) * t * 0.55 * u, ey + Math.sin(t * 0.9) * t * 0.55 * u]);
      p.stroke(s, 2.4 * u);
    }
  }
};

/** open "D" mouth with a white teeth band (+ tongue) */
const dmouth = (p: Pen, mx: number, y: number, rx: number, ry: number, u: number, tongue = false) => {
  p.ell(mx, y, rx, ry, MOUTH, 0, 0, 180);
  p.clip([[mx - rx, y], [mx + rx, y], [mx + rx, y + 3 * u], [mx - rx, y + 3 * u]], () => p.ell(mx, y, rx, ry, WHITE, 0, 0, 180));
  if (tongue) p.ell(mx + 2 * u, y + 0.62 * ry, 0.4 * rx, 0.28 * ry, TONGUE, 0);
  p.ell(mx, y, rx, ry, null, 3 * u, 0, 180);
};

const mouth = (p: Pen, kind: MouthK, mx: number, my: number, u: number, k = 1) => {
  const mw = 4 * u;
  switch (kind) {
    case "dash": p.stroke([[mx - 5.5 * u * k, my], [mx + 5.5 * u * k, my - 0.8 * u]], mw); break;
    case "frown": p.arc(mx, my + 3 * u, 6.5 * u * k, 3.5 * u, 200, 340, mw); break;
    case "smirk": p.arc(mx + u, my - 3 * u, 7 * u * k, 4 * u, 10, 150, mw); break;
    case "smile": p.arc(mx, my - 3 * u, 8 * u * k, 4.5 * u, 20, 160, mw); break;
    case "smileWide": p.arc(mx, my - 4 * u, 11 * u * k, 6 * u, 15, 165, mw); break;
    case "grin": dmouth(p, mx, my - u, 12 * u * k, 8 * u, u); break;
    case "laugh": dmouth(p, mx, my, 16 * u * k, 11 * u, u, true); break;
    case "o": p.ell(mx + 4 * u, my, 3.5 * u, 4 * u, MOUTH, 2.8 * u); break;
    case "O": p.ell(mx, my + 2 * u, 9 * u * k, 11 * u, MOUTH, 3.2 * u); break;
    case "wave": { const s: P2[] = []; for (let i = 0; i <= 12; i++) s.push([mx - 9 * u * k + i * 1.5 * u * k, my + 1.5 * u * Math.sin(i * 1.3)]); p.stroke(s, 3 * u); break; }
    case "teeth":
      p.poly([[mx - 12 * u * k, my - 4 * u], [mx + 12 * u * k, my - 4 * u], [mx + 11 * u * k, my + 4 * u], [mx - 11 * u * k, my + 4 * u]], WHITE, 3 * u);
      for (const j of [-1, 0, 1]) p.stroke([[mx + j * 6 * u * k, my - 4 * u], [mx + j * 6 * u * k, my + 4 * u]], 1.5 * u);
      break;
    case "lick": p.arc(mx, my - 3 * u, 8 * u * k, 4.5 * u, 20, 160, mw); p.ell(mx + 6 * u * k, my + 3 * u, 3.6 * u, 4.6 * u, TONGUE, 2.4 * u); break;
  }
};

/** face v2 (front / 3-4). u = 1 % of the head path width W. Eyes 26u apart on the centre line, brows 20u up, mouth 20u
 *  down, everything slid toward the facing side. No blush, no catchlights. */
const faceFront = (p: Pen, cx: number, cy: number, W: number, expr: Expr, facing: number, look: number, lid: number, brim: boolean,
  skin: string, moustache?: string, stout = false, glasses?: string, big = false, thin = false, beard?: string) => {
  const u = W / 100, F = FACE[expr], fx = cx + 7 * u * facing;
  const ex = (F.eye[0] === "shock" ? 12 : 13) * u, ey = cy;
  for (const side of [-1, 1]) {
    const x = fx + side * ex;
    const kind = eyeKind(F.eye[(facing ? side === facing : side > 0) ? 1 : 0], lid);
    eye(p, kind, x, ey, u, side, look, skin);
    const [dI, dO] = F.brow, by = ey - (brim ? 17 : 20) * u;
    if (kind === "shock" || kind === "shockHalf") p.arc(x, by - 6 * u, 9 * u, 3 * u, 200, 340, 4 * u);
    else taper(p, [x - side * 8.5 * u, by + dI * u], [x + side * 8.5 * u, by + dO * u], 5 * u, 2.5 * u);
  }
  const mx = cx + 8 * u * facing, my = cy + 20 * u;
  if (beard) { p.ell(cx + 6 * u * facing, cy + 36 * u, 31 * u, 15 * u, beard, 3 * u, 0, 180); p.ell(cx + 6 * u * facing, cy + 36.5 * u, 31 * u, 4 * u, beard, 0); }
  mouth(p, F.mouth, mx, my, u);
  if (moustache && big) for (const s of [-1, 1]) { // big upturned "Kaiserreich" moustache (ours, generic): thick, curled tips
    const a: P2 = [mx + s * 2 * u, cy + 12 * u], k: P2 = [mx + s * 17 * u, cy + 17 * u], b: P2 = [mx + s * 31 * u, cy + 4 * u];
    p.line(curve(a, k, b, 12), moustache, 8.5 * u);
    p.line(curve(b, [mx + s * 35 * u, cy - 1 * u], [mx + s * 32 * u, cy - 5 * u], 6), moustache, 4.5 * u);
  } else if (moustache && thin) for (const s of [-1, 1]) { // pencil moustache (ours): thin, slightly upturned tips
    p.stroke(curve([mx + s * 2.5 * u, cy + 12.5 * u], [mx + s * 11 * u, cy + 12 * u], [mx + s * 19 * u, cy + 8.5 * u], 8), 3.4 * u, moustache);
  } else if (moustache) for (const s of [-1, 1])
    taper(p, [mx + s * 1.5 * u, cy + 12.5 * u], [mx + s * (stout ? 19 : 15) * u, cy + (stout ? 10.5 : 15) * u], stout ? 5.5 * u : 4.5 * u, 1.6 * u, moustache);
  if (expr === "nervous") p.ell(cx + 40 * u * (facing || 1), cy - 22 * u, 3 * u, 5 * u, "#9fd4ff", 2 * u);
  if (glasses) { // 80s frames: two rounded rectangles around the eyes, a bridge, thin arms toward the ears
    for (const side of [-1, 1]) {
      const x = fx + side * ex, pts = ellPts(x, ey, 12 * u, 11 * u);
      p.g.save(); p.path(pts, true); p.g.fillStyle = "rgba(220,235,255,0.18)"; p.g.fill(); p.g.restore();
      p.poly(pts, null, 3.2 * u);
      p.g.strokeStyle = glasses; p.g.lineWidth = 1.6 * u; p.path(pts, true); p.g.stroke();
      p.stroke([[x + side * 12 * u, ey - 4 * u], [x + side * 26 * u, ey - 6 * u]], 2.6 * u);
    }
    p.stroke([[fx - ex + 12 * u, ey - 2 * u], [fx + ex - 12 * u, ey - 2 * u]], 2.8 * u);
  }
};

/** profile face (facing screen-right): one eye, brow, nose tick, mouth near the front edge; no skin bump nose, no ear */
const faceSide = (p: Pen, hx: number, hy: number, W: number, expr: Expr, lid: number, brim: boolean, skin: string, moustache?: string, stout = false, big = false, thin = false) => {
  const u = W / 100, F = FACE[expr], ex = hx + 27 * u, ey = hy;
  const kind = eyeKind(F.eye[1], lid);
  eye(p, kind, ex, ey, u, 1, 0.6, skin);
  const by = ey - (brim ? 17 : 20) * u, [dI, dO] = F.brow;
  if (kind === "shock" || kind === "shockHalf") p.arc(ex, by - 6 * u, 9 * u, 3 * u, 200, 340, 4 * u);
  else taper(p, [ex + 8 * u, by + dI * u], [ex - 7 * u, by - u + dO * u], 5 * u, 2.5 * u);
  p.stroke([[hx + 44 * u, hy + 4 * u], [hx + 47.5 * u, hy + 9 * u], [hx + 43 * u, hy + 10 * u]], 3 * u);
  mouth(p, F.mouth, hx + 33 * u, hy + 21 * u, u, 0.62);
  if (moustache && big) { p.line(curve([hx + 42 * u, hy + 13 * u], [hx + 30 * u, hy + 18 * u], [hx + 19 * u, hy + 6 * u], 10), moustache, 7.5 * u); }
  else if (moustache && thin) p.stroke(curve([hx + 41 * u, hy + 13 * u], [hx + 33 * u, hy + 12.5 * u], [hx + 26 * u, hy + 9.5 * u], 8), 3.2 * u, moustache);
  else if (moustache) taper(p, [hx + 41 * u, hy + 13.5 * u], [hx + 25 * u, hy + (stout ? 11.5 : 16) * u], stout ? 5.5 * u : 4.5 * u, 1.6 * u, moustache);
  if (expr === "nervous") p.ell(hx - 30 * u, hy - 24 * u, 3 * u, 5 * u, "#9fd4ff", 2 * u);
};

// ---------------- hats ----------------
const BONNET = "#e9cf8f", BONNET_BRIM = "#d6b46a";
/** parts of a hat that sit behind the head (bonnet) */
const hatBehind = (p: Pen, o: Outfit, H: Blob, cx: number, hc: number, light: number, thick: number, ow: number, side: boolean) => {
  if (o.hat === "longhair" || o.hat === "perm") {
    const perm = o.hat === "perm", col = o.hair ?? "#5a3b2a";
    const bb = blobPts(cx - (side ? 14 : 0) * (H.a / 50), hc + (perm ? 0.12 : 0.3) * H.b,
      { ...H, a: H.a * (perm ? 1.32 : 1.14), b: H.b * (perm ? 1.22 : 1.3), asym: 0, egg: perm ? 0.0 : 0.18, noise: perm ? 0.03 : 0.012, seed: H.seed + 5 });
    p.shadedFill(bb, col, mul(col, SH_FELT), light, H.a * 1.2);
    p.inkRing(bb, ow * 0.85, thick);
    return;
  }
  if (o.hat !== "bonnet") return;
  const bb = blobPts(cx - (side ? 12 : 0) * (H.a / 50), hc - 0.07 * 2 * H.b, { ...H, a: H.a * 1.17, b: H.b * 1.13, asym: 0, egg: 0.04, seed: H.seed + 3 });
  p.shadedFill(bb, BONNET, mul(BONNET, SH_CLOTH), light, H.a * 1.17);
  p.inkRing(bb, ow * 0.85, thick);
};

const hatOn = (p: Pen, o: Outfit, hp: P2[], H: Blob, cx: number, hc: number, light: number, seed: number, facing: number, side: boolean, back = false) => {
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100, crown = hc - H.b, ow = 0.85 * 5 * u;
  const a = H.rot + rad(4 * (rnd(seed, 20) - 0.5)); // tilt with the head, +-2 deg extra
  const R = (pts: P2[]) => rotPts(pts, a, cx, hc);
  const sag = (yb: number, wb: number): P2[] => {
    const base: P2[] = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; base.push([cx + wb * (2 * t - 1), yb + 3 * u * (1 - (2 * t - 1) ** 2)]); }
    return base;
  };
  if (o.hat === "trilby") { // pinched crown, dark band, brim dipping at the front
    const col = o.cap ?? "#2c2b34", deg = (a * 180) / Math.PI, yb = crown + 0.22 * HH, sx = side ? 4 * u : 0;
    const body = R([[cx + sx - 40 * u, yb], [cx + sx + 40 * u, yb], [cx + sx + 34 * u, yb - 0.4 * HH], [cx + sx + 12 * u, yb - 0.44 * HH], [cx + sx, yb - 0.36 * HH], [cx + sx - 12 * u, yb - 0.44 * HH], [cx + sx - 34 * u, yb - 0.4 * HH]]);
    p.shadedFill(body, col, mul(col, SH_FELT), light, 40 * u, 0.4);
    p.clip(body, () => p.band(R([[cx + sx - 46 * u, yb - 0.08 * HH], [cx + sx + 46 * u, yb - 0.08 * HH]]), o.band ?? "#16141a", 0.08 * HH, 0.8 * u));
    p.poly(body, null, ow);
    const brim: P2[] = [];
    for (let i = 0; i <= 24; i++) { const t = (i / 24) * Math.PI * 2; brim.push([cx + sx + 0.62 * W * Math.cos(t), yb + 0.055 * HH * Math.sin(t) + (Math.sin(t) > 0 ? 0.03 * HH * Math.sin(t) : 0)]); }
    p.poly(R(brim), mul(col, [1.08, 1.08, 1.1]), ow);
    return;
  }
  if (o.hat === "kepi") { // French-style kepi (ours, no badge): stiff crown leaning back, flat top, band, black visor
    const col = o.cap ?? "#232a48", deg = (a * 180) / Math.PI, yb = crown + 0.2 * HH, ht = 0.36 * HH;
    if (side) {
      const body = R([[cx - 34 * u, yb + 2 * u], [cx + 34 * u, yb + 2 * u], [cx + 30 * u, yb - ht * 0.8], [cx - 44 * u, yb - ht * 1.1]]);
      p.shadedFill(body, col, mul(col, SH_FELT), light, 40 * u, 0.4);
      p.clip(body, () => p.band(R([[cx - 60 * u, yb - 0.05 * HH], [cx + 60 * u, yb - 0.05 * HH]]), o.band ?? "#2a2430", 0.08 * HH, 0.8 * u));
      p.poly(body, null, ow);
      p.poly(R([[cx + 30 * u, yb], [cx + 62 * u, yb + 9 * u], [cx + 28 * u, yb + 7 * u]]), "#16171b", 2.5 * u);
      return;
    }
    const wb = 40 * u, wt = 36 * u;
    const body = R([[cx - wb, yb], [cx + wb, yb], [cx + wt, yb - ht], [cx - wt, yb - ht]]);
    p.shadedFill(body, col, mul(col, SH_FELT), light, wb, 0.4);
    p.clip(body, () => { p.band(R([[cx - wb - 4 * u, yb - 0.05 * HH], [cx + wb + 4 * u, yb - 0.05 * HH]]), o.band ?? "#2a2430", 0.08 * HH, 0.8 * u); p.stroke(R([[cx - wb, yb - 0.13 * HH], [cx + wb, yb - 0.13 * HH]]), 1.6 * u, "#c9a24e"); });
    p.poly(body, null, ow);
    const [tx, ty] = R([[cx, yb - ht]])[0]; p.ell(tx, ty, wt, 0.04 * HH, mul(col, [1.15, 1.15, 1.12]), ow * 0.8, 0, 360, deg);
    if (!back) { const [px, py] = R([[cx + 3 * u * facing, yb + 2 * u]])[0]; p.ell(px, py, 36 * u, 0.06 * HH, "#16171b", 2.5 * u, 0, 180, deg); }
    return;
  }
  if (o.hat === "cloche") { // 1920s cloche: bell over the crown down to the brows, ribbon, a small flower
    const col = o.cap ?? "#7a4a6a", cut = crown + 0.42 * HH, n = hp.length, keep = (_x: number, y: number) => y < cut;
    const startIdx = Math.max(0, hp.findIndex(([x, y], i) => keep(x, y) && !keep(hp[(i + n - 1) % n][0], hp[(i + n - 1) % n][1])));
    const arc = [...hp.slice(startIdx), ...hp.slice(0, startIdx)].filter(([x, y]) => keep(x, y)).map(([x, y]) => [cx + (x - cx) * 1.1, hc + (y - hc) * 1.1 - 0.02 * HH] as P2);
    if (arc.length < 3) return;
    p.shadedFill(arc, col, mul(col, SH_FELT), light, H.a, 0.35);
    p.clip(arc, () => p.band(R([[cx - 70 * u, cut - 0.1 * HH], [cx + 70 * u, cut - 0.1 * HH]]), o.band ?? "#2a2430", 0.06 * HH, 0.8 * u));
    p.poly(arc, null, ow);
    const deg = (a * 180) / Math.PI, [bx, by] = R([[cx, cut + 1 * u]])[0];
    p.ell(bx, by, 0.58 * W, 0.045 * HH, mul(col, [0.85, 0.85, 0.85]), ow * 0.8, 0, 180, deg);
    if (!back) { const [fx, fy] = R([[cx + (side ? -20 : 30) * u, cut - 0.12 * HH]])[0]; for (let i = 0; i < 5; i++) p.ell(fx + 6 * u * Math.cos(i * 1.256), fy + 6 * u * Math.sin(i * 1.256), 5 * u, 5 * u, "#f2eee4", 1.4 * u); p.dot(fx, fy, 3.5 * u, "#e8c04a"); }
    return;
  }
  if (o.hat === "officer" || o.hat === "guardcap") { // peaked service cap: wide flat crown, band, black visor (no badge)
    const col = o.cap ?? "#66735a", deg = (a * 180) / Math.PI, yb = crown + 0.2 * HH;
    const band = R([[cx - 47 * u, yb], [cx + 47 * u, yb], [cx + 49 * u, yb - 0.13 * HH], [cx - 49 * u, yb - 0.13 * HH]]);
    p.poly(band, o.band ?? "#2f3528", ow);
    const [tx, ty] = R([[cx, yb - 0.17 * HH]])[0];
    p.ell(tx, ty, 62 * u, 0.12 * HH, col, ow, 0, 360, deg);
    p.ell(tx, ty - 0.02 * HH, 50 * u, 0.06 * HH, mul(col, [1.12, 1.12, 1.1]), 0, 180, 360, deg);
    if (!side && !back) { const [px, py] = R([[cx + 3 * u * facing, yb + 2 * u]])[0]; p.ell(px, py, 36 * u, 0.06 * HH, "#16171b", 2.5 * u, 0, 180, deg); }
    if (side) p.poly(R([[cx + 38 * u, yb - 2 * u], [cx + 66 * u, yb + 7 * u], [cx + 36 * u, yb + 5 * u]]), "#16171b", 2.5 * u);
    return;
  }
  if (o.hat === "pickel") { // spiked helmet: black leather dome, brass spike and trim, black visor; no plate / emblem
    const cut = crown + 0.36 * HH, n = hp.length, keep = (_x: number, y: number) => y < cut;
    const startIdx = Math.max(0, hp.findIndex(([x, y], i) => keep(x, y) && !keep(hp[(i + n - 1) % n][0], hp[(i + n - 1) % n][1])));
    const arc = [...hp.slice(startIdx), ...hp.slice(0, startIdx)].filter(([x, y]) => keep(x, y)).map(([x, y]) => [cx + (x - cx) * 1.08, hc + (y - hc) * 1.1] as P2);
    if (arc.length < 3) return;
    const deg = (a * 180) / Math.PI, top = R([[cx + (side ? 4 * u : 0), crown - 0.1 * HH]])[0];
    // spike first (behind the dome's ink), then dome
    p.poly(R([[cx - 5 * u + (side ? 4 * u : 0), crown - 0.07 * HH], [cx + (side ? 4 * u : 0), crown - 0.34 * HH], [cx + 5 * u + (side ? 4 * u : 0), crown - 0.07 * HH]]), "#e0b64e", 2.6 * u);
    p.shadedFill(arc, "#2a2830", "#16151b", light, H.a, 0.35);
    p.clip(arc, () => p.ell(cx - 0.22 * W, crown + 0.12 * HH, 0.12 * W, 0.05 * HH, "rgba(255,255,255,0.28)", 0, 0, 360, -30));
    p.poly(arc, null, ow);
    p.ell(top[0], top[1], 10 * u, 5 * u, "#d6aa44", 2.4 * u, 0, 360, deg); // spike base
    p.band(R([[cx - 0.52 * W, cut - 0.015 * HH], [cx + 0.52 * W, cut - 0.015 * HH]]), "#c99a3c", 0.03 * HH, 1.2 * u);
    if (side) { p.poly(R([[cx + 34 * u, cut - 2 * u], [cx + 64 * u, cut + 8 * u], [cx + 34 * u, cut + 6 * u]]), "#16171b", 2.5 * u); p.poly(R([[cx - 40 * u, cut - 3 * u], [cx - 58 * u, cut + 4 * u], [cx - 38 * u, cut + 4 * u]]), "#16171b", 2.5 * u); }
    else if (!back) { const [px, py] = R([[cx + 3 * u * facing, cut + 1.5 * u]])[0]; p.ell(px, py, 38 * u, 0.06 * HH, "#16171b", 2.5 * u, 0, 180, deg); }
    return;
  }
  if (o.hat === "feldmutze") { // round visorless field cap: coloured band, flat crown (no cockade)
    const col = o.cap ?? "#2f3d66", deg = (a * 180) / Math.PI, yb = crown + 0.22 * HH;
    const band = R([[cx - 46 * u, yb], [cx + 46 * u, yb], [cx + 48 * u, yb - 0.12 * HH], [cx - 48 * u, yb - 0.12 * HH]]);
    p.poly(band, o.band ?? "#b8323a", ow);
    const [tx, ty] = R([[cx + (side ? 3 * u : 0), yb - 0.15 * HH]])[0];
    p.ell(tx, ty, 52 * u, 0.085 * HH, col, ow, 0, 360, deg);
    p.ell(tx, ty - 0.012 * HH, 42 * u, 0.04 * HH, mul(col, [1.18, 1.18, 1.15]), 0, 180, 360, deg);
    return;
  }
  if (o.hat === "bowler" || o.hat === "boater") {
    const boater = o.hat === "boater", col = o.cap ?? (boater ? "#e6cc86" : "#2c2830"), deg = (a * 180) / Math.PI, yb = crown + 0.2 * HH;
    if (boater) {
      const body = R([[cx - 40 * u, yb], [cx + 40 * u, yb], [cx + 40 * u, yb - 0.2 * HH], [cx - 40 * u, yb - 0.2 * HH]]);
      p.shadedFill(body, col, mul(col, SH_FELT), light, 40 * u, 0.4);
      p.clip(body, () => p.band(R([[cx - 46 * u, yb - 0.06 * HH], [cx + 46 * u, yb - 0.06 * HH]]), o.band ?? "#2f3d66", 0.07 * HH, 0.8 * u));
      p.poly(body, null, ow);
      const [tx, ty] = R([[cx, yb - 0.2 * HH]])[0]; p.ell(tx, ty, 40 * u, 0.035 * HH, mul(col, [1.08, 1.06, 1.0]), ow * 0.8, 0, 360, deg);
      const [bx, by] = R([[cx, yb + 1 * u]])[0]; p.ell(bx, by, 0.6 * W, 0.05 * HH, col, ow, 0, 360, deg);
    } else {
      const dome: P2[] = [];
      for (let i = 0; i <= 20; i++) { const t = Math.PI * (1 + i / 20); dome.push([cx + (side ? 3 * u : 0) + 44 * u * Math.cos(t), yb - 4 * u + 0.36 * HH * Math.sin(t)]); }
      const d2 = R(dome);
      p.shadedFill(d2, col, mul(col, SH_FELT), light, 44 * u, 0.4);
      p.clip(d2, () => p.band(R([[cx - 50 * u, yb - 0.08 * HH], [cx + 50 * u, yb - 0.08 * HH]]), o.band ?? "#18161c", 0.06 * HH, 0.8 * u));
      p.poly(d2, null, ow);
      const [bx, by] = R([[cx + (side ? 3 * u : 0), yb - 2 * u]])[0]; p.ell(bx, by, 0.5 * W, 0.045 * HH, col, ow, 0, 360, deg);
    }
    return;
  }
  if (o.hat === "ladyhat") { // wide brim, small crown, a flower
    const col = o.cap ?? "#7a4a6a", deg = (a * 180) / Math.PI, yb = crown + 0.16 * HH;
    const [cxx, cyy] = R([[cx, yb - 0.1 * HH]])[0];
    p.ell(cxx, cyy, 36 * u, 0.13 * HH, col, ow, 180, 360, deg);
    const [bx, by] = R([[cx, yb]])[0];
    p.ell(bx, by, 0.72 * W, 0.07 * HH, mul(col, [1.1, 1.08, 1.05]), ow, 0, 360, deg);
    const [fx, fy] = R([[cx + 26 * u, yb - 0.1 * HH]])[0];
    for (let i = 0; i < 5; i++) p.ell(fx + 9 * u * Math.cos(i * 1.256), fy + 9 * u * Math.sin(i * 1.256), 7 * u, 7 * u, o.band ?? "#f0c8d8", 1.6 * u);
    p.dot(fx, fy, 5 * u, "#e8c04a");
    return;
  }
  if (o.hat === "bald") { // shiny top, side fringe
    const col = o.hair ?? "#c9c4bc";
    for (const s2 of side ? [-1] : [-1, 1]) {
      const [fx, fy] = R([[cx + s2 * 0.86 * H.a, hc - 0.02 * H.b]])[0];
      p.ell(fx, fy, 0.2 * H.a, 0.36 * H.b, col, ow * 0.8, 0, 360, (a * 180) / Math.PI);
    }
    p.clip(hp, () => p.ell(cx - 0.3 * W, crown + 0.16 * HH, 0.12 * W, 0.05 * HH, "rgba(255,255,255,0.45)", 0, 0, 360, -25));
    return;
  }
  if (o.hat === "beanie" || o.hat === "flatcap") {
    const col = o.cap ?? "#b5453c", cut = crown + (o.hat === "beanie" ? 0.36 : 0.26) * HH;
    const n = hp.length, keep = (_x: number, y: number) => y < cut;
    const startIdx = Math.max(0, hp.findIndex(([x, y], i) => keep(x, y) && !keep(hp[(i + n - 1) % n][0], hp[(i + n - 1) % n][1])));
    const arc = [...hp.slice(startIdx), ...hp.slice(0, startIdx)].filter(([x, y]) => keep(x, y))
      .map(([x, y]) => [cx + (x - cx) * 1.05, hc + (y - hc) * (o.hat === "flatcap" ? 0.97 : 1.06)] as P2);
    if (arc.length < 3) return;
    p.shadedFill(arc, col, mul(col, SH_FELT), light, H.a, 0.35);
    p.poly(arc, null, ow);
    const deg = (a * 180) / Math.PI;
    if (o.hat === "beanie") {
      const [bx, by] = R([[cx, cut - 0.03 * HH]])[0];
      p.poly(R(rrect(cx - 0.53 * W, cut - 0.1 * HH, cx + 0.53 * W, cut + 0.02 * HH, 0.05 * HH)), shade(col, 0.86), ow * 0.8);
      for (let i = -3; i <= 3; i++) p.stroke(R([[cx + i * 0.14 * W, cut - 0.08 * HH], [cx + i * 0.14 * W, cut]]), 1.2 * u, "rgba(30,20,30,0.35)");
      const [qx, qy] = R([[cx, crown - 0.02 * HH]])[0];
      p.ell(qx, qy, 12 * u, 11 * u, mix(col, "#ffffff", 0.55), 2.4 * u);
      void bx; void by;
    } else if (!side && !back) {
      const s = facing || 1, [px, py] = R([[cx + s * 6 * u, cut + 1 * u]])[0];
      p.ell(px, py, 40 * u, 0.055 * HH, shade(col, 0.8), ow, 0, 180, deg);
    } else if (side) p.poly(R([[cx + 30 * u, cut - 2 * u], [cx + 64 * u, cut + 4 * u], [cx + 30 * u, cut + 6 * u]]), shade(col, 0.8), ow);
    return;
  }
  if (o.hat === "longhair" || o.hat === "perm") { o = { ...o, hat: "hair" }; }
  if (o.hat === "shako" || o.hat === "shako_tall") {
    const tall = o.hat === "shako_tall", yb = crown + 0.25 * HH, ht = (tall ? 0.66 : 0.56) * HH, wb = 46 * u, wt = 52 * u;
    const body = R([...sag(yb, wb).reverse(), [cx - wt, yb - ht], [cx + wt, yb - ht]]);
    p.shadedFill(body, "#3a3d47", "#24262d", light, wt, 0.4);
    if (tall) p.clip(body, () => p.band(R([[cx - wt - 5 * u, yb - ht + 0.07 * HH], [cx + wt + 5 * u, yb - ht + 0.07 * HH]]), "#e8c45a", 0.06 * HH, 1.5 * u));
    p.poly(body, null, ow);
    const deg = (a * 180) / Math.PI;
    if (side) {
      p.poly(R([[cx + 36 * u, yb - 1 * u], [cx + 60 * u, yb + 8 * u], [cx + 34 * u, yb + 6 * u]]), "#16171b", 2.5 * u);
      const [tx, ty] = R([[cx + 24 * u, yb - ht - 6 * u]])[0];
      p.ell(tx, ty, 7 * u, 7 * u, "#2b7a4b", 2.5 * u);
    } else {
      const [px, py] = R([[cx + 3 * u * facing, yb + 3 * u]])[0];
      p.ell(px, py, 34 * u, 0.045 * HH, "#16171b", 2.5 * u, 0, 180, deg); // peak
      const [bx, by] = R([[cx, yb - 0.45 * ht]])[0];
      p.ell(bx, by, 7 * u, 6 * u, tall ? "#e8c45a" : "#c9ccd2", 2 * u, 0, 360, deg); // badge plate
      p.arc(bx, by, 3.5 * u, 2.8 * u, 200, 500, 1.6 * u);
      const [tx, ty] = R([[cx, yb - ht - 6 * u]])[0];
      p.ell(tx, ty, 7 * u, 7 * u, "#2b7a4b", 2.5 * u); // green tuft
    }
  } else if (o.hat === "cap" || o.hat === "hair") {
    const cut = crown + (o.hat === "cap" ? 0.3 : 0.42) * HH;
    const keep = (x: number, y: number) => y < cut || (side && o.hat === "hair" && x < cx - 6 * u && y < hc + 0.42 * H.b);
    // start the arc at the first kept point after a dropped one, so the kept run is contiguous and the cut closes it
    const n = hp.length, startIdx = Math.max(0, hp.findIndex(([x, y], i) => keep(x, y) && !keep(hp[(i + n - 1) % n][0], hp[(i + n - 1) % n][1])));
    const arc = [...hp.slice(startIdx), ...hp.slice(0, startIdx)].filter(([x, y]) => keep(x, y))
      .map(([x, y]) => [cx + (x - cx) * 1.03, hc + (y - hc) * 1.03] as P2);
    if (arc.length < 3) return;
    if (o.hat === "hair") { // scalloped lower edge
      const [x0, y0] = arc[arc.length - 1], [x1, y1] = arc[0];
      for (let i = 1; i < 6; i++) arc.push([x0 + ((x1 - x0) * i) / 6, y0 + ((y1 - y0) * i) / 6 + (i % 2 ? 4 * u : 0)]);
    }
    const col = o.hat === "cap" ? o.cap! : o.hair!;
    p.shadedFill(arc, col, mul(col, SH_FELT), light, H.a, 0.35);
    p.poly(arc, null, ow);
    if (o.hat === "hair" && !back) {
      const s = side ? -1 : facing || 1;
      p.stroke([[cx + s * 10 * u, cut - 30 * u], [cx + s * 2 * u, cut - 12 * u]], 1.2 * u);
    }
    if (o.hat === "cap") {
      const deg = (a * 180) / Math.PI;
      if (side) p.poly(R([[cx + 40 * u, cut - 2 * u], [cx + 74 * u, cut + 4 * u], [cx + 40 * u, cut + 6 * u]]), shade(col, 0.8), ow);
      else if (!back) {
        const s = facing || (rnd(seed, 21) < 0.5 ? -1 : 1), [px, py] = R([[cx + s * 4 * u, cut + 1.5 * u]])[0];
        p.ell(px, py, 32 * u, 0.06 * HH, shade(col, 0.8), ow, 0, 180, deg);
      }
    }
  } else if (o.hat === "tophat") {
    const yb = crown + 0.22 * HH, ht = 0.8 * HH, wb = 0.31 * W, wt = 0.33 * W, col = o.cap ?? "#2e2a36";
    const body = R([...sag(yb, wb).reverse(), [cx - wt, yb - ht], [cx + wt, yb - ht]]);
    p.shadedFill(body, col, mul(col, SH_FELT), light, wt, 0.4);
    p.clip(body, () => p.band(R([[cx - wt - 4 * u, yb - 0.13 * HH], [cx + wt + 4 * u, yb - 0.13 * HH]]), shade(o.jacket, 0.9), 0.14 * HH, 0.8 * u));
    p.poly(body, null, ow);
    const [bx, by] = R([[cx, yb + 1 * u]])[0];
    p.ell(bx, by, 0.45 * W, 0.05 * HH, "#1d1b22", ow, 0, 360, (a * 180) / Math.PI);
  } else if (o.hat === "bonnet") {
    const [bx, by] = R([[cx + (side ? 6 * u : 0), crown + 0.16 * HH]])[0];
    p.arc(bx, by, 0.5 * W, 0.2 * HH, 200, 340, 7 * u, BONNET_BRIM);
    p.arc(bx, by, 0.5 * W + 3.5 * u, 0.2 * HH + 3.5 * u, 200, 340, 1.2 * u);
    const cy = hc + H.b * 0.98;
    p.stroke([[cx - 14 * u, cy - 4 * u], [cx, cy + 2 * u], [cx + 14 * u, cy - 4 * u]], 2 * u, BONNET_BRIM);
  }
};

// ---------------- bodies ----------------
export type Arms = [P2[], P2[]];
/** held prop; for the hammer the number is the strike 0 (raised) .. 1 (struck) */
export type Prop = null | "icecream" | "shako" | ["hammer", number];

const BUILD: Record<Build, { a: number; torso: number; legs: number; tw: number }> = {
  adult: { a: 118, torso: 1.1, legs: 1.4, tw: 0.8 },
  stout: { a: 118, torso: 1.15, legs: 1.32, tw: 0.92 },
  kid: { a: 112, torso: 0.85, legs: 1.0, tw: 0.72 },
  slim: { a: 116, torso: 1.12, legs: 1.46, tw: 0.66 },
};

export type ArmPose = "cheer" | "paper" | "pad" | "hand" | "shuffle" | "lap" | "wave2"
  | "halt" | "salute" | "akimbo" | "spread" | "give" | "hold" | "cup" | "news" | "clap" | "point" | "write" | "belly" | "bow"
  /** Eiffel 1925 */
  | "cane" | "shh" | "rub" | "whisper" | "reach" | "twist" | "cushion" | "wavecase" | "push" | "slam" | "hatfix" | "headhand" | "rope"
  /** Ballon 1979 */
  | "binocs" | "magnify" | "sew" | "fist" | "hug";
/** things held in the hands (Köpenick) */
export type Item = "coat" | "cap" | "sabre" | "doc" | "cup" | "box" | "tag" | "letters" | "letter" | "env" | "papers" | "rollR" | "rollB" | "rollG" | "rollY";
export type FrontOpts = {
  phase?: number; expr?: Expr; mode?: "march" | "stroll" | "stand" | "sit" | "fall" | "chair" | "ride" | "crouch"; look?: number; blink?: boolean | number; lift?: number;
  prop?: Prop; tilt?: number; headTilt?: number; wave?: number;
  /** canvas angle the key light comes FROM (painted crescent + thick outline side) */
  light?: number; facing?: -1 | 0 | 1; seed?: number;
  /** Mauer short: arm poses (wave = their animation phase 0..1), back view (no face) */
  arms?: ArmPose; back?: boolean;
  /** Köpenick: k = 0..1 ramp of the pose (hand up, arms spread, salute), item in the hands, side of the active arm,
   *  bow 0..1, chest 0..1 (puffed chest) */
  k?: number; item?: Item; hand?: -1 | 1; bow?: number; chest?: number;
};
const PALM = "#ffe2c2";
/** open hand (palm toward the viewer): mitten + thumb, big enough to read on a phone */
const palm = (p: Pen, x: number, y: number, u: number, ang: number, skin = PALM) => {
  const c = Math.cos(ang), s2 = Math.sin(ang), Q = (dx: number, dy: number): P2 => [x + dx * c - dy * s2, y + dx * s2 + dy * c];
  const pts: P2[] = [];
  for (let i = 0; i <= 24; i++) { const t = Math.PI * (0.9 + (1.2 * i) / 24); pts.push(Q(9 * u * Math.cos(t) * 1.0, -6 * u + 13 * u * Math.sin(t))); }
  pts.push(Q(9 * u, 4 * u), Q(6 * u, 9 * u), Q(-6 * u, 9 * u), Q(-9 * u, 4 * u));
  p.poly(pts, skin, 2.6 * u);
  p.poly([Q(8 * u, 2 * u), Q(16 * u, -4 * u), Q(18 * u, 0), Q(10 * u, 7 * u)], skin, 2.4 * u);
  for (const dx of [-3.5, 0.5, 4.5]) p.stroke([Q(dx * u, -14 * u), Q(dx * u, -7 * u)], 1.4 * u, "rgba(36,23,38,0.55)");
};
const ROLLC: Record<string, [string, string]> = { rollR: ["#c8402e", "#e8b42e"], rollB: ["#efe9dc", "#3f5f9a"], rollG: ["#55803c", "#2f4a24"], rollY: ["#e8b42e", "#c8402e"] };
/** a bolt of fabric lying across the hands: tube with stripes, rolled end showing a spiral */
export const drawRoll = (p: Pen, x: number, y: number, u: number, kind: string, half = 80, rad = 16) => {
  const [a, b] = ROLLC[kind] ?? ROLLC.rollR;
  const body = rrect(x - half, y - rad, x + half, y + rad, rad * 0.6);
  p.poly(body, a, 2.8 * u);
  p.clip(body, () => {
    for (let k = -half + 10 * u; k < half; k += 22 * u) p.band([[x + k, y - rad], [x + k, y + rad]], b, 4 * u, 0);
    p.band([[x - half, y + rad * 0.55], [x + half, y + rad * 0.55]], "rgba(0,0,0,0.18)", rad * 0.5, 0);
    p.band([[x - half, y - rad * 0.55], [x + half, y - rad * 0.55]], "rgba(255,255,255,0.22)", rad * 0.3, 0);
  });
  p.poly(body, null, 2.8 * u);
  p.ell(x + half - 4 * u, y, rad * 0.45, rad, a, 2.4 * u);
  p.arc(x + half - 4 * u, y, rad * 0.25, rad * 0.55, 0, 300, 1.6 * u);
};
/** a held item drawn at (x, y) (centre of the hands) */
export const drawItem = (p: Pen, kind: Item, x: number, y: number, u: number, HH: number) => {
  if (kind === "coat") { // folded greatcoat over the forearms
    p.poly(rrect(x - 26 * u, y - 0.42 * HH, x + 26 * u, y + 0.34 * HH, 8 * u), "#6f8199", 3 * u);
    p.poly(rrect(x - 26 * u, y - 0.42 * HH, x + 26 * u, y - 0.3 * HH, 5 * u), "#b8323a", 2.4 * u);
    for (let i = 0; i < 4; i++) for (const dx of [-8, 8]) p.dot(x + dx * u, y - 0.22 * HH + i * 0.14 * HH, 2.6 * u, "#e0bc5a");
    p.stroke([[x, y - 0.3 * HH], [x, y + 0.34 * HH]], 1.6 * u, "rgba(36,23,38,0.6)");
  } else if (kind === "cap") {
    p.ell(x, y - 0.06 * HH, 30 * u, 0.09 * HH, "#3b4560", 2.8 * u);
    p.poly(rrect(x - 24 * u, y - 0.05 * HH, x + 24 * u, y + 0.05 * HH, 3 * u), "#b8323a", 2.6 * u);
    p.ell(x + 3 * u, y + 0.055 * HH, 22 * u, 0.04 * HH, "#16171b", 2.4 * u, 0, 180);
  } else if (kind === "sabre") {
    p.band(curve([x - 34 * u, y + 0.5 * HH], [x, y], [x + 34 * u, y - 0.5 * HH]), "#a4acb6", 5 * u, 1.6 * u, "round");
    p.arc(x + 30 * u, y - 0.5 * HH, 9 * u, 9 * u, 180, 360, 3 * u, "#d8b04a");
    p.dot(x + 36 * u, y - 0.56 * HH, 4 * u, "#d8b04a");
  } else if (kind === "doc") { // pardon: sheet with abstract wavy lines + blank red wax seal
    p.poly([[x - 30 * u, y - 0.36 * HH], [x + 30 * u, y - 0.38 * HH], [x + 31 * u, y + 0.3 * HH], [x - 29 * u, y + 0.32 * HH]], "#f6efda", 2.6 * u);
    for (let i = 0; i < 5; i++) { const yy = y - 0.26 * HH + i * 0.09 * HH, pts: P2[] = []; for (let k = 0; k <= 10; k++) pts.push([x - 22 * u + k * 4.2 * u, yy + 1.2 * u * Math.sin(k * 1.9 + i)]); p.stroke(pts, 1.5 * u, "#8a8070"); }
    const sx = x + 14 * u, sy = y + 0.18 * HH, bl: P2[] = [];
    for (let i = 0; i < 16; i++) { const t = (i / 16) * Math.PI * 2, r = 10 * u * (1 + 0.12 * Math.sin(i * 2.7)); bl.push([sx + r * Math.cos(t), sy + r * Math.sin(t)]); }
    p.poly(bl, "#c42a2a", 2 * u); p.ell(sx, sy, 6 * u, 6 * u, "#a01e22", 0);
    p.band([[sx - 4 * u, sy + 8 * u], [sx - 10 * u, sy + 22 * u]], "#c42a2a", 3.5 * u, 1 * u);
  } else if (kind === "cup") {
    p.poly([[x - 11 * u, y - 10 * u], [x + 11 * u, y - 10 * u], [x + 9 * u, y + 9 * u], [x - 9 * u, y + 9 * u]], "#f4f1ea", 2.4 * u);
    p.band([[x - 11 * u, y - 7 * u], [x + 11 * u, y - 7 * u]], "#3f6fb5", 2.2 * u, 0);
    p.arc(x + 12 * u, y, 5 * u, 6 * u, -90, 90, 2.4 * u);
  } else if (kind === "tag") { // big price tag on a string: a red tick, no writing
    p.stroke([[x, y - 0.26 * HH], [x + 4 * u, y - 0.18 * HH]], 1.6 * u, "#8a7050");
    const t: P2[] = [[x - 24 * u, y - 0.16 * HH], [x + 30 * u, y - 0.2 * HH], [x + 34 * u, y + 0.2 * HH], [x - 20 * u, y + 0.24 * HH], [x - 32 * u, y + 0.04 * HH]];
    p.poly(t, "#f6ecd2", 3 * u); p.ell(x - 18 * u, y + 0.02 * HH, 3.5 * u, 3.5 * u, "#8a7050", 1.4 * u);
    p.stroke([[x - 6 * u, y + 0.02 * HH], [x + 4 * u, y + 0.12 * HH], [x + 24 * u, y - 0.1 * HH]], 7 * u, "#c8323a");
  } else if (kind === "letters" || kind === "letter" || kind === "env") { // envelopes (flap lines, a red seal, no writing)
    const n = kind === "letters" ? 3 : 1, fat = kind === "env";
    for (let i = n - 1; i >= 0; i--) {
      const ex = x + i * 5 * u, ey = y - i * 6 * u, w = fat ? 30 * u : 26 * u, h = fat ? 0.17 * HH : 0.13 * HH;
      if (fat) p.poly(rrect(ex - w, ey - h + 8 * u, ex + w, ey + h + 8 * u, 3 * u), "#d8c8a0", 2.4 * u);
      p.poly(rrect(ex - w, ey - h, ex + w, ey + h, 3 * u), "#f4ead2", 2.6 * u);
      p.stroke([[ex - w, ey - h], [ex, ey + 2 * u], [ex + w, ey - h]], 1.8 * u, "rgba(36,23,38,0.5)");
      p.ell(ex, ey + 2 * u, 5 * u, 5 * u, "#c42a2a", 1.4 * u);
    }
  } else if (kind === "papers") { // official papers: two sheets, scribble lines, a red seal
    for (const [dx, a] of [[-6, -0.08], [6, 0.06]] as const) sheet(p, x + dx * u, y, 44 * u, 0.42 * HH, a, u);
    p.ell(x + 16 * u, y + 0.12 * HH, 8 * u, 8 * u, "#c42a2a", 1.6 * u);
  } else if (kind === "rollR" || kind === "rollB" || kind === "rollG" || kind === "rollY") {
    drawRoll(p, x, y, u, kind, 78 * u, 16 * u);
  } else if (kind === "box") {
    p.poly(rrect(x - 28 * u, y - 0.16 * HH, x + 28 * u, y + 0.14 * HH, 3 * u), "#3f5a48", 2.8 * u);
    p.band([[x - 10 * u, y - 0.18 * HH], [x + 10 * u, y - 0.18 * HH]], "#d8b04a", 2.4 * u, 1 * u);
  }
};

const footStroke = (p: Pen, a: P2, b: P2, w: number, col: string) => {
  if (col !== INK) p.stroke([a, b], w + 3, INK);
  p.stroke([a, b], w, col);
};
/** chair seat height in design units (0.45 m) */
const SEAT_U = 0.45 / 0.00216;

/** a sheet of paper (scribbled lines, no letters) centred at (x, y), w x h, rotated a radians */
const sheet = (p: Pen, x: number, y: number, w: number, h: number, a: number, u: number, lines = true) => {
  const c = Math.cos(a), s = Math.sin(a), Q = (dx: number, dy: number): P2 => [x + dx * c - dy * s, y + dx * s + dy * c];
  p.poly([Q(-w / 2, -h / 2), Q(w / 2, -h / 2), Q(w / 2, h / 2), Q(-w / 2, h / 2)], "#fbf8f0", 2.4 * u);
  if (lines) for (let i = 0; i < 6; i++) {
    const yy = -h / 2 + h * (0.18 + i * 0.13), x1 = w * (i % 3 === 2 ? 0.1 : 0.32);
    p.stroke([Q(-w * 0.34, yy), Q(x1, yy)], 1.3 * u, "#8a8f9c");
  }
};

/** rubber stamp held at its knob (x, y = the hand): wooden knob + neck above, block + red pad below */
const drawStamp = (p: Pen, x: number, y: number, u: number) => {
  p.poly(rrect(x - 4 * u, y - 4 * u, x + 4 * u, y + 22 * u, 2 * u), "#8a5a34", 2.2 * u);
  p.ell(x, y - 6 * u, 10 * u, 8 * u, "#a8744a", 2.4 * u);
  p.poly(rrect(x - 20 * u, y + 20 * u, x + 20 * u, y + 32 * u, 2 * u), "#6a4028", 2.4 * u);
  p.poly(rrect(x - 18 * u, y + 32 * u, x + 18 * u, y + 37 * u, 1 * u), "#c42a2a", 1.8 * u);
};
/** bowler hat seen from the side at angle a (twisted in the hands) */
const drawBowler = (p: Pen, x: number, y: number, u: number, a: number, col: string) => {
  const R = (pts: P2[]) => rotPts(pts, a, x, y);
  const dome: P2[] = []; for (let i = 0; i <= 16; i++) { const t = Math.PI * (1 + i / 16); dome.push([x + 22 * u * Math.cos(t), y + 15 * u * Math.sin(t)]); }
  p.poly(R(dome), col, 2.6 * u);
  p.poly(R(rrect(x - 30 * u, y - 2 * u, x + 30 * u, y + 4 * u, 3 * u)), mul(col, [0.85, 0.85, 0.85]), 2.4 * u);
  p.poly(R(rrect(x - 22 * u, y - 7 * u, x + 22 * u, y - 3 * u, 1 * u)), "#18161c", 0);
};
/** suitcase held at its handle (x, y = the hand) */
const drawCase = (p: Pen, x: number, y: number, u: number, HH: number) => {
  p.arc(x, y + 4 * u, 9 * u, 7 * u, 180, 360, 3 * u);
  p.poly(rrect(x - 34 * u, y + 4 * u, x + 34 * u, y + 0.42 * HH, 4 * u), "#8a5a34", 3 * u);
  p.band([[x - 34 * u, y + 0.2 * HH], [x + 34 * u, y + 0.2 * HH]], "#5a3a22", 2.5 * u, 0.8 * u);
  for (const sx of [-1, 1]) p.poly(rrect(x + sx * 24 * u - 4 * u, y + 2 * u, x + sx * 24 * u + 4 * u, y + 12 * u, 1 * u), "#c9a24e", 1.4 * u);
};
/** paint brush held in the hand, bristles toward side s */
const drawBrush = (p: Pen, x: number, y: number, u: number, s: number) => {
  p.band([[x - s * 14 * u, y + 6 * u], [x + s * 10 * u, y - 4 * u]], "#a8744a", 3.6 * u, 1 * u, "round");
  p.poly([[x + s * 10 * u, y - 10 * u], [x + s * 22 * u, y - 13 * u], [x + s * 24 * u, y + 3 * u], [x + s * 12 * u, y + 2 * u]], "#8a5a40", 2 * u);
};

export const bodyFront = (p: Pen, o: Outfit, opts: FrontOpts) => {
  const { phase = 0, expr = "neutral", mode = "march", look = 0, blink = false, lift = 60, prop = null, tilt = 0, headTilt = 0, wave,
    light = DEF_LIGHT, facing = 0, seed = 1, arms: pose, back = false, k: kk = 1, item, hand: hs = 1, bow = 0, chest = 0 } = opts;
  const Bd = BUILD[o.build ?? "adult"], skin = o.skin ?? SKIN, two = Math.PI * 2, lid = lidOf(blink);
  const H = headBlob(seed, Bd.a, back ? 0 : facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const tall = (1 + Bd.torso + Bd.legs) * HH, sole = 975;
  // body bob 5 % (march) / 3 % (stroll) of the height, lowest at contact (phase 0 and 0.5)
  const bob = mode === "march" ? 0.025 * tall * Math.cos(2 * two * phase) : mode === "stroll" ? 0.015 * tall * Math.cos(2 * two * phase) : 0;
  const seatY = sole - SEAT_U / (Bd.a / 118);
  const torsoBot = mode === "sit" ? sole - 0.2 * HH : mode === "chair" ? seatY + 0.02 * HH : mode === "ride" ? sole - 0.62 * HH : mode === "crouch" ? sole - 0.55 * Bd.legs * HH : sole - Bd.legs * HH + bob;
  const chin = torsoBot - Bd.torso * HH, hc = chin - H.b, crown = hc - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u;
  const legCol = mix(o.pants, INK, 0.55), armCol = mix(o.jacket, INK, 0.5), footCol = o.boots;
  const legW = 5.8 * u, footW = 7.5 * u;
  // ---- legs + feet (not rotated) ----
  p.rot = null;
  if (mode === "crouch") { // squatting: knees wide and high, feet planted under them
    for (const side of [-1, 1]) {
      const h: P2 = [300 + side * 15 * u, hipY], k: P2 = [300 + side * 50 * u, hipY + 0.06 * HH], f: P2 = [300 + side * 32 * u, sole - 4 * u];
      p.stroke([h, k, f], legW, legCol);
      footStroke(p, [f[0] - side * 3 * u, f[1]], [f[0] + side * 13 * u, f[1] + 0.5 * u], footW, footCol);
    }
  } else if (mode === "sit") {
    for (const side of [-1, 1]) {
      const h: P2 = [300 + side * 15 * u, hipY], k: P2 = [300 + side * 36 * u, hipY + 0.2 * HH], f: P2 = [300 + side * 44 * u, sole - 8 * u];
      p.stroke(curve(h, k, f), legW, legCol);
      footStroke(p, [f[0] - side * 2 * u, f[1]], [f[0] + side * 12 * u, f[1] - 5 * u], footW, footCol);
    }
  } else if (mode === "chair") { // seated on a chair: thighs toward the lens (foreshortened), shins straight down
    for (const side of [-1, 1]) {
      const h: P2 = [300 + side * 15 * u, hipY + 0.06 * HH], k: P2 = [300 + side * 25 * u, seatY + 0.12 * HH], f: P2 = [300 + side * 23 * u, sole - 4 * u];
      p.stroke([h, k, f], legW, legCol);
      if (!back) footStroke(p, [f[0] - side * 3 * u, f[1]], [f[0] + side * 11 * u, f[1] + 2 * u], footW, footCol);
    }
  } else if (mode === "ride") { // on someone's shoulders: legs straddle down both sides of the carrier's head
    for (const side of [-1, 1]) {
      const h: P2 = [300 + side * 15 * u, hipY], k: P2 = [300 + side * 62 * u, hipY + 0.16 * HH], f: P2 = [300 + side * 66 * u, sole - 6 * u];
      p.stroke([h, k, f], legW, legCol);
      footStroke(p, f, [f[0] + side * 10 * u, f[1] + 4 * u], footW, footCol);
    }
  } else if (mode === "fall") {
    const legs: [P2, P2, P2][] = [
      [[300 - 15 * u, hipY], [300 - 46 * u, hipY + 0.5 * HH], [300 - 70 * u, hipY + 0.72 * HH]],
      [[300 + 15 * u, hipY], [300 + 50 * u, hipY + 0.45 * HH], [300 + 76 * u, hipY + 0.22 * HH]],
    ];
    legs.forEach(([h, k, f], i) => {
      p.stroke(curve(h, k, f), legW, legCol);
      footStroke(p, f, [f[0] + (i ? 14 : -14) * u, f[1] + (i ? -6 : 4) * u], footW, footCol);
    });
  } else if (o.dress) {
    for (const side of [-1, 1]) {
      const fx = 300 + side * 12 * u, fy = sole - 4 * u;
      p.stroke([[fx, sole - 0.4 * HH], [fx + side * u, fy]], legW, legCol);
      footStroke(p, [fx - side * 3 * u, fy], [fx + side * 12 * u, fy + u], footW, footCol);
    }
  } else {
    const L = mode === "march" ? lift * 1.25 : mode === "stroll" ? lift * 0.55 : 0;
    for (const [side, ph] of [[-1, 0], [1, 0.5]] as const) {
      const up = Math.max(0, Math.sin(two * (phase + ph))) * L;
      const hx = 300 + side * 15 * u, fx = 300 + side * 22 * u, fy = sole - 4 * u - up;
      const k: P2 = [(hx + fx) / 2 + side * (1.5 * u + up * 0.16), (hipY + fy) / 2 - up * 0.08];
      p.stroke(curve([hx, hipY], k, [fx, fy]), legW, legCol);
      footStroke(p, [fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u], footW, footCol);
    }
  }
  // ---- upper body: rotates about the hips (tilt + a small weight-shift sway on every step) ----
  const sway = mode === "march" ? 1.6 * Math.sin(two * phase) : mode === "stroll" ? 1.0 * Math.sin(two * phase) : 0;
  const A = tilt + sway;
  p.rot = A ? [rad(A), 300, hipY] : null;
  const dress = !!o.dress && mode !== "sit" && mode !== "fall" && mode !== "chair";
  const T: Blob = { a: (((Bd.tw / 2) * W) / 1.06) * (1 + 0.12 * chest), b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: o.build === "stout" ? 0.17 : 0.12,
    asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = 300 + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const sh = (side: number): P2 => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];
  const hang = (side: number, fwd: number): [P2, P2, P2] => {
    const S = sh(side), ex = tcx + side * (1.12 * T.a + 4 * u);
    const hx = ex + side * 3 * u - side * 6 * u * Math.max(0, fwd) + side * 4 * u * Math.max(0, -fwd);
    return [S, [ex, S[1] + 0.48 * HH], [hx, chin + 1.04 * HH - Math.abs(fwd) * 9 * u]];
  };
  const sw = mode === "march" || mode === "stroll" ? Math.sin(two * phase) : 0;
  const R0: P2 = [300 + 47 * u, torsoBot + 0.12 * HH], R1: P2 = [300 + 64 * u, crown - 0.32 * HH];
  const rifle = !!o.rifle && (mode === "march" || mode === "stand" || mode === "stroll");
  type Arm = { pts: [P2, P2, P2]; front: boolean; late?: boolean; pre?: () => void; post?: () => void };
  const late: (() => void)[] = []; // drawn after the head (hands at the face / hat)
  const arms: Arm[] = [];
  const wv = wave ?? 0;
  // where the hands hold things in front of the chest (paper / notepad)
  const holdY = Math.min(torsoBot - 0.18 * HH, chin + 0.55 * HH);
  if (mode === "sit") for (const side of [-1, 1]) arms.push({ pts: [sh(side), [tcx + side * (1.1 * T.a + 6 * u), sh(side)[1] + 0.4 * HH], [tcx + side * (1.2 * T.a + 10 * u), torsoBot + 0.04 * HH]], front: false });
  else if (mode === "fall") for (const side of [-1, 1]) arms.push({ pts: [sh(side), [tcx + side * (1.15 * T.a + 12 * u), sh(side)[1] - 0.25 * HH], [tcx + side * (1.3 * T.a + 24 * u), sh(side)[1] - 0.68 * HH]], front: false });
  else if (pose === "halt" || pose === "point") {
    arms.push({ pts: hang(-hs, 0), front: false });
    const S = sh(hs), k = clamp(kk, 0, 1);
    if (pose === "halt") {
      const E: P2 = lerp2([tcx + hs * (1.12 * T.a + 6 * u), S[1] + 0.42 * HH], [tcx + hs * (1.32 * T.a + 22 * u), S[1] - 0.38 * HH], k);
      const Hd: P2 = lerp2([tcx + hs * (1.1 * T.a + 4 * u), chin + 1.0 * HH], [tcx + hs * (1.3 * T.a + 42 * u), crown - 0.32 * HH], k);
      arms.push({ pts: [S, E, Hd], front: false });
    } else {
      const E: P2 = [tcx + hs * (1.2 * T.a + 22 * u * k), S[1] + 0.3 * HH * (1 - k) + 0.04 * HH];
      const Hd: P2 = [tcx + hs * (1.15 * T.a + 58 * u * k + 4 * u), S[1] + 0.85 * HH * (1 - k) - 0.02 * HH];
      arms.push({ pts: [S, E, Hd], front: false });
    }
  } else if (pose === "salute") {
    const k = clamp(kk, 0, 1), S = sh(-hs);
    const E: P2 = lerp2([tcx - hs * (1.12 * T.a + 6 * u), S[1] + 0.42 * HH], [tcx - hs * (1.3 * T.a + 20 * u), S[1] - 0.1 * HH], k);
    const Hd: P2 = lerp2([tcx - hs * (1.1 * T.a + 4 * u), chin + 1.0 * HH], [300 - hs * 0.3 * W, crown + 0.27 * HH], k);
    arms.unshift({ pts: rifle ? [sh(hs), [tcx + hs * (1.12 * T.a + 5 * u), sh(hs)[1] + 0.45 * HH], lerp2(R0, R1, 0.1)] : hang(hs, 0), front: false });
    arms.push({ pts: [S, E, Hd], front: k > 0.5 });
  } else if (pose === "akimbo" || pose === "belly") {
    for (const side of [-1, 1]) {
      const S = sh(side);
      if (pose === "akimbo") arms.push({ pts: [S, [tcx + side * (1.3 * T.a + 18 * u), S[1] + 0.3 * HH], [tcx + side * 0.92 * T.a, torsoBot - 0.24 * HH]], front: false });
      else arms.push({ pts: [S, [tcx + side * (1.2 * T.a + 8 * u), S[1] + 0.42 * HH], [tcx + side * 0.36 * T.a, torsoBot - 0.2 * HH]], front: true });
    }
  } else if (pose === "spread") {
    const k = clamp(kk, 0, 1);
    for (const side of [-1, 1]) {
      const S = sh(side);
      const E: P2 = [tcx + side * (1.15 * T.a + 6 * u + 30 * u * k), S[1] + 0.42 * HH * (1 - k) + 0.02 * HH];
      const Hd: P2 = [tcx + side * (1.12 * T.a + 4 * u + 66 * u * k), chin + 1.0 * HH * (1 - k) + 0.18 * HH * k];
      arms.push({ pts: [S, E, Hd], front: false });
    }
  } else if (pose === "cane" || pose === "shh" || pose === "rub" || pose === "whisper" || pose === "reach" || pose === "hatfix" || pose === "headhand" || pose === "slam") {
    // one active arm (side hs); the other hand rests on the cane (o.cane) or on the hip
    const S = sh(hs), k = clamp(kk, 0, 1), o2 = -hs;
    const canePts = (side: number): [P2, P2, P2] => { const S2 = sh(side); return [S2, [tcx + side * (1.25 * T.a + 12 * u), S2[1] + 0.45 * HH], [tcx + side * (1.12 * T.a + 16 * u), torsoBot + 0.06 * HH]]; };
    const caneArm = (side: number): Arm => {
      const pts = canePts(side), [hx, hy] = pts[2], fx2 = hx + side * 5 * u;
      return { pts, front: true, pre: () => { p.band([[hx + side * 1 * u, hy - 4 * u], [fx2, sole - 3 * u]], "#2a2228", 3.6 * u, 1.2 * u, "round"); p.dot(fx2, sole - 3 * u, 3 * u, "#d8d8dc"); },
        post: () => { p.ell(hx, hy - 7 * u, 6.5 * u, 4.5 * u, "#d8d8dc", 2.2 * u); } };
    };
    const rest = (side: number): Arm => (o.cane ? caneArm(side) : { pts: [sh(side), [tcx + side * (1.3 * T.a + 18 * u), sh(side)[1] + 0.3 * HH], [tcx + side * 0.92 * T.a, torsoBot - 0.24 * HH]], front: false });
    if (pose === "cane") { arms.push(rest(-hs)); if (o.cane) arms.push(caneArm(hs)); else arms.push(rest(hs)); }
    else {
      arms.push(rest(o2));
      const lo: P2 = [tcx + hs * (1.1 * T.a + 4 * u), chin + 1.0 * HH], loE: P2 = [tcx + hs * (1.12 * T.a + 6 * u), S[1] + 0.48 * HH];
      const mouthX = 300 + 8 * u * facing, mouthY = hc + 21 * u;
      if (pose === "shh") {
        const Hd = lerp2(lo, [mouthX + hs * 2 * u, mouthY + 4 * u], k), E = lerp2(loE, [tcx + hs * (1.0 * T.a + 16 * u), S[1] + 0.3 * HH], k);
        arms.push({ pts: [S, E, Hd], front: true, late: true });
        late.push(() => {
          p.ell(Hd[0], Hd[1], 9 * u, 8 * u, skin, 2.6 * u);
          if (k > 0.6) p.line([[Hd[0] - hs * 2 * u, Hd[1] - 4 * u], [Hd[0] - hs * 2 * u, Hd[1] - 24 * u]], skin, 5.5 * u);
        });
      } else if (pose === "rub") { // money gesture: big fist beside the chin, thumb rubbing over the fingertips
        const Hd = lerp2(lo, [tcx + hs * (1.0 * T.a + 34 * u), chin - 0.02 * HH], k), E = lerp2(loE, [tcx + hs * (1.45 * T.a + 26 * u), S[1] + 0.36 * HH], k);
        arms.push({ pts: [S, E, Hd], front: true, late: true });
        late.push(() => {
          const ph = Math.sin(2 * Math.PI * (wave ?? 0)), q2 = 1.5 * u;
          p.ell(Hd[0], Hd[1] + 4 * q2, 11 * q2, 10 * q2, skin, 2.6 * u);                          // fist
          for (const dx of [-6, 0, 6]) p.ell(Hd[0] + dx * q2 - hs * 2 * q2, Hd[1] - 6 * q2, 3.8 * q2, 5 * q2, skin, 2.2 * u); // fingertips
          p.ell(Hd[0] + (ph * 6 - hs * 2) * q2, Hd[1] - 9 * q2, 4.2 * q2, 3.6 * q2, skin, 2.2 * u);     // thumb tip rubbing
          if (k > 0.8) for (const sd of [-1, 1]) p.arc(Hd[0] + sd * 17 * q2, Hd[1] - 6 * q2, 5 * q2, 8 * q2, sd > 0 ? -60 : 120, sd > 0 ? 60 : 240, 2.2 * u);
        });
      } else if (pose === "whisper") { // hand cupped beside the mouth
        const Hd = lerp2(lo, [mouthX + hs * 30 * u, mouthY - 2 * u], k), E = lerp2(loE, [tcx + hs * (1.25 * T.a + 18 * u), S[1] + 0.34 * HH], k);
        arms.push({ pts: [S, E, Hd], front: true, late: true });
        late.push(() => { if (k > 0.5) palm(p, Hd[0], Hd[1], u * 1.15, -hs * 0.35, skin); else p.dot(Hd[0], Hd[1], 5.5 * u); });
      } else if (pose === "reach") { // reaching out to the side (hanging the tag on the rope)
        const Hd = lerp2(lo, [tcx + hs * (1.2 * T.a + 66 * u), chin + 0.62 * HH], k), E = lerp2(loE, [tcx + hs * (1.3 * T.a + 30 * u), S[1] + 0.26 * HH], k);
        arms.push({ pts: [S, E, Hd], front: true, post: item === "tag" ? () => drawItem(p, "tag", Hd[0], Hd[1] + 0.2 * HH, u, HH) : undefined });
      } else if (pose === "hatfix") { // fingers on the hat brim
        const Hd = lerp2(lo, [300 + hs * 0.36 * W, crown + 0.26 * HH], k), E = lerp2(loE, [tcx + hs * (1.35 * T.a + 22 * u), S[1] - 0.02 * HH], k);
        arms.push({ pts: [S, E, Hd], front: true, late: true });
        late.push(() => { p.ell(Hd[0], Hd[1], 9 * u, 6 * u, skin, 2.4 * u, 0, 360, hs * 20); });
      } else if (pose === "headhand") { // palm on the forehead (sigh)
        const Hd = lerp2(lo, [300 + hs * 0.2 * W, hc - 0.2 * HH], k), E = lerp2(loE, [tcx + hs * (1.3 * T.a + 20 * u), S[1] + 0.1 * HH], k);
        arms.push({ pts: [S, E, Hd], front: true, late: true });
        late.push(() => { p.ell(Hd[0], Hd[1], 14 * u, 9 * u, skin, 2.6 * u, 0, 360, -hs * 15); });
      } else { // slam: big rubber stamp, raised (k 0) .. slammed down (k 1)
        const Hd = lerp2([tcx + hs * (1.0 * T.a + 34 * u), crown - 0.02 * HH], [tcx + hs * (0.95 * T.a + 34 * u), torsoBot - 0.87 * HH], k);
        const E: P2 = [tcx + hs * (1.4 * T.a + 30 * u), lerp2([0, S[1] - 0.3 * HH], [0, S[1] + 0.2 * HH], k)[1]];
        arms.push({ pts: [S, E, Hd], front: true, pre: () => drawStamp(p, Hd[0], Hd[1], u), post: () => p.ell(Hd[0], Hd[1] - 2 * u, 8 * u, 7 * u, skin, 2.4 * u) });
      }
    }
  } else if (pose === "twist" || pose === "push" || pose === "wavecase" || pose === "cushion" || pose === "rope") {
    const k = clamp(kk, 0, 1);
    if (pose === "twist") { // turning a bowler hat in both hands on the lap
      const a = rad(28 * Math.sin(2 * Math.PI * (wave ?? 0))), hy = torsoBot - 0.06 * HH, hcx = tcx;
      const hands: P2[] = [[hcx - 26 * u * Math.cos(a), hy - 26 * u * Math.sin(a)], [hcx + 26 * u * Math.cos(a), hy + 26 * u * Math.sin(a)]];
      for (const side of [-1, 1]) { const S2 = sh(side), Hd = hands[side < 0 ? 0 : 1]; arms.push({ pts: [S2, [tcx + side * (1.15 * T.a + 6 * u), (S2[1] + Hd[1]) / 2 + 0.1 * HH], Hd], front: true, pre: side < 0 ? () => drawBowler(p, hcx, hy, u, a, o.cap ?? "#2c2830") : undefined }); }
    } else if (pose === "push") { // sliding something across the table (item drawn under the hand)
      const Hd = lerp2([tcx + hs * (0.7 * T.a + 12 * u), torsoBot - 0.73 * HH], [tcx + hs * (1.2 * T.a + 78 * u), torsoBot - 0.73 * HH], k);
      arms.push({ pts: [sh(-hs), [tcx - hs * (1.08 * T.a + 2 * u), sh(-hs)[1] + 0.36 * HH], [tcx - hs * 0.45 * T.a, torsoBot - 0.02 * HH]], front: true });
      arms.push({ pts: [sh(hs), [tcx + hs * (1.15 * T.a + 8 * u + 14 * u * k), (sh(hs)[1] + Hd[1]) / 2 + 0.14 * HH], Hd], front: true, pre: item ? () => drawItem(p, item, Hd[0] + hs * 6 * u, Hd[1] + 6 * u, u, HH) : undefined, post: () => p.ell(Hd[0], Hd[1], 9 * u, 6 * u, skin, 2.4 * u) });
    } else if (pose === "wavecase") { // waving from the train window, the suitcase held up in the other hand
      const S = sh(hs), w2 = Math.sin(2 * Math.PI * (wave ?? 0));
      arms.push({ pts: [S, [tcx + hs * (1.2 * T.a + 16 * u + 4 * u * w2), S[1] - 0.32 * HH], [tcx + hs * (1.3 * T.a + 26 * u + 14 * u * w2), S[1] - 0.82 * HH]], front: false,
        post: () => palm(p, tcx + hs * (1.3 * T.a + 26 * u + 14 * u * w2), S[1] - 0.86 * HH, u * 1.05, hs * 0.25 * w2, skin) });
      const S2 = sh(-hs), Hd: P2 = [tcx - hs * 0.55 * T.a, chin + 0.12 * HH];
      arms.push({ pts: [S2, [tcx - hs * (1.2 * T.a + 8 * u), S2[1] + 0.3 * HH], Hd], front: true, pre: () => drawCase(p, Hd[0], Hd[1], u, HH) });
    } else if (pose === "cushion") { // a cushion held over the face with both hands (drawn after the head)
      const cy2 = hc + 6 * u;
      for (const side of [-1, 1]) {
        const S2 = sh(side), Hd: P2 = lerp2([tcx + side * 0.5 * T.a, torsoBot - 0.05 * HH], [300 + side * 0.48 * W, cy2 + 8 * u], k);
        arms.push({ pts: [S2, [tcx + side * (1.3 * T.a + 16 * u), S2[1] + 0.25 * HH * (1 - k) + 0.05 * HH], Hd], front: true, late: true });
      }
      late.push(() => {
        const y = lerp2([0, torsoBot - 0.1 * HH], [0, cy2], k)[1], wC = 0.52 * W, hC = 0.4 * HH;
        const cp = rrect(300 - wC, y - hC, 300 + wC, y + hC, 0.16 * HH);
        p.gradFill(cp, "#5f9a8e", "#3f6a64", light); p.poly(cp, null, 4 * u);
        p.stroke(curve([300 - wC + 10 * u, y - hC + 12 * u], [300, y], [300 + wC - 10 * u, y + hC - 12 * u]), 2 * u, "rgba(36,23,38,0.4)");
        for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) p.ell(300 + sx * wC, y + sy * hC, 5 * u, 5 * u, "#e8c04a", 2 * u);
        for (const side of [-1, 1]) { const S2 = sh(side); void S2; p.ell(300 + side * 0.48 * W, y + 8 * u, 9 * u, 8 * u, skin, 2.4 * u); }
      });
    } else { // rope: painter in a bosun's chair, one hand on the rope, a brush in the other, the bucket on the seat
      const top: P2 = [300, crown - 0.3 * HH], seat = torsoBot + 0.02 * HH;
      arms.push({ pts: [sh(hs), [tcx + hs * (1.0 * T.a + 6 * u), sh(hs)[1] - 0.3 * HH], [300 + hs * 6 * u, crown - 0.36 * HH]], front: false,
        pre: () => { p.stroke([[300, 0], top], 4.2 * u, "#c8b08a"); for (const sd of [-1, 1]) p.stroke([top, [300 + sd * 0.62 * W, seat]], 3.2 * u, "#c8b08a"); } });
      const Hd: P2 = [tcx - hs * (1.15 * T.a + 34 * u + 8 * u * Math.sin(2 * Math.PI * (wave ?? 0))), chin + 0.32 * HH];
      arms.push({ pts: [sh(-hs), [tcx - hs * (1.2 * T.a + 14 * u), sh(-hs)[1] + 0.3 * HH], Hd], front: true, post: () => drawBrush(p, Hd[0], Hd[1], u, -hs) });
      late.push(() => {
        p.poly(rrect(300 - 0.66 * W, seat - 4 * u, 300 + 0.66 * W, seat + 6 * u, 3 * u), "#a8744a", 2.6 * u);
        const bx2 = 300 + hs * 0.5 * W, by = seat + 6 * u;
        p.poly([[bx2 - 15 * u, by + 6 * u], [bx2 + 15 * u, by + 6 * u], [bx2 + 12 * u, by + 34 * u], [bx2 - 12 * u, by + 34 * u]], "#8d949c", 2.4 * u);
        p.ell(bx2, by + 6 * u, 15 * u, 4 * u, "#9a6a4c", 2 * u);
        p.arc(bx2, by + 4 * u, 14 * u, 10 * u, 180, 360, 2 * u);
      });
    }
  } else if (pose === "give" || pose === "hold" || pose === "cup" || pose === "news" || pose === "clap" || pose === "write") {
    const fs = facing || 1;
    for (const side of [-1, 1]) {
      const S = sh(side);
      let Hd: P2;
      if (pose === "give") Hd = [tcx + fs * (1.0 * T.a + 18 * u) + side * 9 * u, holdY - 0.02 * HH];
      else if (pose === "hold") Hd = [tcx + side * 0.48 * T.a, chin + 0.42 * HH];
      else if (pose === "cup") Hd = [tcx + 2 * u * facing + side * 13 * u, chin + 0.1 * HH];
      else if (pose === "news") Hd = [tcx + side * (0.95 * T.a + 6 * u), chin + 0.12 * HH];
      else if (pose === "write") { if (side > 0) continue; Hd = [tcx - 0.5 * T.a, torsoBot - 0.05 * HH]; }
      else { const d = 4 * u + 14 * u * (0.5 + 0.5 * Math.cos(2 * Math.PI * (wave ?? 0))); Hd = [tcx + side * d, chin + 0.4 * HH]; }
      const E: P2 = [tcx + side * (1.2 * T.a + 10 * u), (S[1] + Hd[1]) / 2 + 0.16 * HH];
      arms.push({ pts: [S, E, Hd], front: true });
    }
  } else if (pose === "binocs" || pose === "magnify" || pose === "sew" || pose === "fist" || pose === "hug") {
    const k = clamp(kk, 0, 1);
    if (pose === "binocs") { // binoculars held up to the eyes with both hands (drawn over the face)
      const ey = hc - 1 * u, ex = 300 + 8 * u * facing;
      for (const side of [-1, 1]) {
        const S2 = sh(side), Hd: P2 = [ex + side * 40 * u, ey + 22 * u];
        arms.push({ pts: [S2, [tcx + side * (1.3 * T.a + 22 * u), S2[1] + 0.16 * HH], Hd], front: true, late: true });
      }
      late.push(() => {
        for (const side of [-1, 1]) {
          const bx2 = ex + side * 21 * u;
          p.poly(rrect(bx2 - 18 * u, ey - 18 * u, bx2 + 18 * u, ey + 24 * u, 7 * u), "#2c2e34", 3 * u);
          p.ell(bx2, ey - 2 * u, 13.5 * u, 13.5 * u, "#4a6488", 2.6 * u);
          p.ell(bx2 - 4 * u, ey - 6 * u, 4.5 * u, 4.5 * u, "rgba(255,255,255,0.75)", 0);
          p.poly(rrect(bx2 - 14 * u, ey + 14 * u, bx2 + 14 * u, ey + 22 * u, 3 * u), "#45484f", 0);
        }
        p.poly(rrect(ex - 6 * u, ey - 9 * u, ex + 6 * u, ey + 9 * u, 2 * u), "#2c2e34", 2.2 * u);
        for (const side of [-1, 1]) p.ell(ex + side * 40 * u, ey + 22 * u, 10 * u, 12 * u, skin, 2.6 * u);
      });
    } else if (pose === "magnify") { // bent over, a big magnifying glass held out low on side hs; the other fist on the hip
      const S = sh(hs), Hd: P2 = lerp2([tcx + hs * (1.1 * T.a + 4 * u), chin + 1.0 * HH], [tcx + hs * (1.15 * T.a + 34 * u), torsoBot - 0.06 * HH], k);
      arms.push({ pts: [sh(-hs), [tcx - hs * (1.3 * T.a + 18 * u), sh(-hs)[1] + 0.3 * HH], [tcx - hs * 0.92 * T.a, torsoBot - 0.24 * HH]], front: false });
      arms.push({ pts: [S, [tcx + hs * (1.3 * T.a + 20 * u), S[1] + 0.34 * HH], Hd], front: true, post: () => {
        const lx = Hd[0] + hs * 20 * u, ly = Hd[1] + 22 * u;
        p.band([[Hd[0] - hs * 4 * u, Hd[1] - 4 * u], [lx - hs * 12 * u, ly - 12 * u]], "#7a4a2a", 5 * u, 1.4 * u, "round");
        p.ell(lx, ly, 21 * u, 21 * u, "rgba(200,230,255,0.55)", 0);
        p.ell(lx, ly, 21 * u, 21 * u, null, 5 * u);
        p.ell(lx, ly, 19 * u, 19 * u, null, 2.6 * u, 0, 360, 0);
        p.arc(lx - 5 * u, ly - 5 * u, 9 * u, 9 * u, 200, 260, 3 * u, "rgba(255,255,255,0.9)");
        p.ell(Hd[0], Hd[1], 8.5 * u, 7.5 * u, skin, 2.4 * u);
      } });
    } else if (pose === "sew") { // seated at the machine: both hands forward, guiding the cloth
      for (const side of [-1, 1]) {
        const S2 = sh(side), w2 = Math.sin(2 * Math.PI * (wave ?? 0) + side), Hd: P2 = [tcx + side * (0.42 * T.a + 4 * u * w2), torsoBot - 0.5 * HH + 2 * u * w2];
        arms.push({ pts: [S2, [tcx + side * (1.15 * T.a + 6 * u), S2[1] + 0.36 * HH], Hd], front: true, post: () => p.ell(Hd[0], Hd[1], 8 * u, 6.5 * u, skin, 2.4 * u) });
      }
    } else if (pose === "fist") { // fist bump: arm straight out toward side hs at chest height
      arms.push(mode === "chair" ? { pts: [sh(-hs), [tcx - hs * (1.08 * T.a + 2 * u), sh(-hs)[1] + 0.36 * HH], [tcx - hs * 0.45 * T.a, torsoBot - 0.02 * HH]], front: true } : { pts: hang(-hs, 0), front: false });
      const S = sh(hs), Hd = lerp2([tcx + hs * (0.6 * T.a), torsoBot - 0.04 * HH], [tcx + hs * (1.25 * T.a + 74 * u), chin + 0.36 * HH], k);
      const E = lerp2([tcx + hs * (1.12 * T.a + 4 * u), S[1] + 0.4 * HH], [tcx + hs * (1.3 * T.a + 34 * u), chin + 0.42 * HH], k);
      arms.push({ pts: [S, E, Hd], front: true, post: () => {
        const q2 = 1.25 * u;
        p.ell(Hd[0] + hs * 3 * q2, Hd[1], 11 * q2, 10 * q2, skin, 2.6 * u);
        for (const dy of [-5, 0, 5]) p.stroke([[Hd[0] + hs * 10 * q2, Hd[1] + dy * q2], [Hd[0] + hs * 4 * q2, Hd[1] + dy * q2]], 1.4 * u, "rgba(36,23,38,0.6)");
      } });
    } else { // hug: both arms out round the neighbours' shoulders
      for (const side of [-1, 1]) {
        const S2 = sh(side);
        const E = lerp2([tcx + side * (1.12 * T.a + 6 * u), S2[1] + 0.42 * HH], [tcx + side * (1.2 * T.a + 34 * u), S2[1] + 0.02 * HH], k);
        const Hd = lerp2([tcx + side * (1.1 * T.a + 4 * u), chin + 1.0 * HH], [tcx + side * (1.25 * T.a + 70 * u), S2[1] + 0.12 * HH], k);
        arms.push({ pts: [S2, E, Hd], front: true, post: () => p.ell(Hd[0], Hd[1], 8 * u, 7 * u, skin, 2.4 * u) });
      }
    }
  } else if (pose === "bow") {
    arms.push({ pts: [sh(-1), [tcx - (1.3 * T.a + 30 * u), sh(-1)[1] + 0.05 * HH], [tcx - (1.45 * T.a + 60 * u), sh(-1)[1] - 0.12 * HH]], front: false });
    arms.push({ pts: [sh(1), [tcx + (1.15 * T.a + 6 * u), sh(1)[1] + 0.34 * HH], [tcx + 0.2 * T.a, chin + 0.42 * HH]], front: true });
  } else if (pose === "cheer" || pose === "wave2" || mode === "ride") {
    for (const side of [-1, 1]) {
      const S = sh(side), k = Math.sin(two * (wv + (side > 0 ? 0.25 : 0)));
      const up = pose === "wave2" ? (side > 0 ? 1 : 0.15) : 1;
      if (up < 0.5) { arms.push({ pts: hang(side, 0), front: false }); continue; }
      arms.push({ pts: [S, [tcx + side * (1.15 * T.a + 12 * u + 4 * u * k), S[1] - 0.3 * HH], [tcx + side * (1.25 * T.a + 22 * u + 10 * u * k), S[1] - 0.78 * HH]], front: false });
    }
  } else if (pose === "paper" || pose === "shuffle" || pose === "pad") {
    if (back) for (const side of [-1, 1]) arms.push({ pts: [sh(side), [tcx + side * (1.1 * T.a + 2 * u), sh(side)[1] + 0.3 * HH], [tcx + side * 0.75 * T.a, holdY]], front: false });
    else if (pose === "pad") {
      arms.push({ pts: [sh(-1), [tcx - (1.08 * T.a + 2 * u), sh(-1)[1] + 0.34 * HH], [tcx - 0.28 * T.a, holdY - 0.02 * HH]], front: true });
      const k = Math.sin(two * wv * 3) * 4 * u;
      arms.push({ pts: [sh(1), [tcx + (1.08 * T.a + 2 * u), sh(1)[1] + 0.36 * HH], [tcx + 0.3 * T.a + k, holdY - 0.06 * HH]], front: true });
    } else for (const side of [-1, 1]) arms.push({ pts: [sh(side), [tcx + side * (1.08 * T.a + 2 * u), sh(side)[1] + 0.36 * HH], [tcx + side * 0.5 * T.a, holdY]], front: true });
  } else if (pose === "hand") {
    arms.push({ pts: mode === "chair" ? [sh(-1), [tcx - (1.08 * T.a + 2 * u), sh(-1)[1] + 0.36 * HH], [tcx - 0.45 * T.a, torsoBot - 0.02 * HH]] : hang(-1, 0), front: mode === "chair" });
    const S = sh(1), k = clamp(wv, 0, 1);
    // raised well clear of the big head (cheer-arm geometry): the hand must read beside the head, not behind it
    const E: P2 = lerp2([tcx + 1.12 * T.a + 6 * u, S[1] + 0.4 * HH], [tcx + 1.35 * T.a + 22 * u, S[1] - 0.5 * HH], k);
    const Hd: P2 = lerp2([tcx + 0.6 * T.a, S[1] + 0.62 * HH], [tcx + 1.2 * T.a + 22 * u, crown - 0.2 * HH], k); // hand above the crown
    arms.push({ pts: [S, E, Hd], front: k < 0.4 && mode === "chair" });
  } else if (mode === "chair" || pose === "lap") {
    for (const side of [-1, 1]) arms.push({ pts: [sh(side), [tcx + side * (1.08 * T.a + 2 * u), sh(side)[1] + 0.36 * HH], [tcx + side * 0.45 * T.a, torsoBot - 0.02 * HH]], front: !back });
  } else {
    arms.push({ pts: prop === "shako" ? hang(-1, 0) : hang(-1, -sw), front: false });
    if (rifle) {
      const G = lerp2(R0, R1, 0.1);
      arms.push({ pts: [sh(1), [tcx + 1.12 * T.a + 5 * u, sh(1)[1] + 0.45 * HH], G], front: false });
    } else if (wave !== undefined) {
      const S = sh(1);
      arms.push({ pts: [S, [tcx + 1.1 * T.a + 10 * u + 3 * u * wave, S[1] - 0.22 * HH], [tcx + 1.18 * T.a + 16 * u + 12 * u * wave, S[1] - 0.6 * HH]], front: false });
    } else if (prop === "icecream") {
      const S = sh(1);
      arms.push({ pts: [S, [tcx + 1.05 * T.a + 4 * u, S[1] + 0.45 * HH], [tcx + 0.5 * T.a, S[1] + 0.4 * HH]], front: true });
    } else if (Array.isArray(prop)) {
      const S = sh(1), k = clamp(prop[1], 0, 1);
      const E = lerp2([tcx + 1.1 * T.a + 10 * u, S[1] - 0.15 * HH], [tcx + 1.2 * T.a + 10 * u, S[1] + 0.3 * HH], k);
      const Hd = lerp2([tcx + 1.15 * T.a + 14 * u, S[1] - 0.55 * HH], [tcx + 1.45 * T.a + 22 * u, S[1] + 0.35 * HH], k);
      arms.push({ pts: [S, E, Hd], front: true });
    } else arms.push({ pts: hang(1, sw), front: false });
  }
  const drawArm = (a: Arm) => { a.pre?.(); p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), 5.2 * u, armCol); p.dot(a.pts[2][0], a.pts[2][1], 5.5 * u); a.post?.(); };
  if (rifle) {
    p.band([R0, R1], "#7a4b2a", 5 * u, 1.5 * u, "round");
    p.band([lerp2(R0, R1, 0.6), R1], "#8d949c", 2.4 * u, 1.2 * u, "round");
  }
  for (const a of arms) if (!a.front && !a.late && !o.cape) drawArm(a);
  if ((o.coat || o.apron) && (mode === "stand" || mode === "march" || mode === "stroll")) { // greatcoat / apron skirt over the legs
    const col = o.coat ? o.jacket : o.apron!, yt = torsoBot - 0.2 * HH, yb2 = torsoBot + (o.coat ? 0.62 : 0.5) * HH;
    const wt = (o.coat ? 0.86 : 0.7) * T.a, wb = (o.coat ? 1.02 : 0.74) * T.a + (o.coat ? 4 * u : 0);
    const sk: P2[] = [[tcx - wt, yt], [tcx + wt, yt], [tcx + wb, yb2 - 3 * u], [tcx + wb - 4 * u, yb2], [tcx - wb + 4 * u, yb2], [tcx - wb, yb2 - 3 * u]];
    p.gradFill(sk, col, mul(col, SH_CLOTH), light);
    if (o.coat) p.stroke([[tcx + 2 * u * facing, yt + 0.1 * HH], [tcx + 2 * u * facing, yb2]], 2 * u, "rgba(36,23,38,0.55)");
    p.poly(sk, null, ow * 0.85);
  }
  // torso / dress: shaded fill -> clothing clipped to it -> thick-thin ink ring
  if (dress) {
    const D: Blob = { a: 0.5 * W * 0.98, b: 0.5 * ((sole - 0.35 * HH) - (chin - 0.2 * HH)), nTop: 2.0, nBot: 3.0, egg: 0.35, asym: 0.03 * facing, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(300, sole - 0.35 * HH - D.b, D);
    p.gradFill(dp, o.dress!, mul(o.dress!, SH_CLOTH), light);
    p.inkRing(dp, ow, thick);
    const Sw: Blob = { a: 0.37 * W, b: 0.3 * HH, nTop: 2.2, nBot: 2.4, egg: 0.1, asym: 0, rot: 0, noise: 0.006, seed: seed + 8 };
    const sp = blobPts(300, chin + 0.12 * HH, Sw);
    p.gradFill(sp, o.jacket, mul(o.jacket, SH_CLOTH), light);
    p.inkRing(sp, ow * 0.9, thick);
  } else {
    p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), light);
    p.clip(tp, () => {
      if (!back && o.shirt) { // open jacket: shirt V, tie, lapel lines
        const vb = chin + 0.52 * HH, xc = tcx + 2 * u * facing;
        p.poly([[xc - 0.36 * T.a, chin - 0.1 * HH], [xc + 0.36 * T.a, chin - 0.1 * HH], [xc, vb]], o.shirt, 0);
        if (o.tie) p.poly([[xc - 3.5 * u, chin + 0.02 * HH], [xc + 3.5 * u, chin + 0.02 * HH], [xc + 5 * u, vb - 0.08 * HH], [xc, vb + 0.02 * HH], [xc - 5 * u, vb - 0.08 * HH]], o.tie, 1.6 * u);
        for (const s2 of [-1, 1]) p.stroke([[xc + s2 * 0.36 * T.a, chin - 0.06 * HH], [xc, vb]], 2.4 * u, mul(o.jacket, [0.55, 0.55, 0.6]));
      }
      if (o.belt) {
        for (const s of [-1, 1]) p.band([[tcx - s * 0.75 * T.a, chin - 0.05 * HH], [tcx + s * 0.8 * T.a, torsoBot - 0.1 * HH]], o.belt!, 5.5 * u, 1.8 * u);
      }
      if (o.sash) p.band([[tcx - 1.3 * T.a, torsoBot - 0.32 * HH], [tcx + 1.3 * T.a, torsoBot - 0.32 * HH]], o.sash, 0.13 * HH, 1.8 * u);
      if (o.apron) p.poly(rrect(tcx - 0.62 * T.a, chin + 0.3 * HH, tcx + 0.62 * T.a, torsoBot + 0.2 * HH, 4 * u), o.apron, 2.2 * u);
      if (o.collar && !back) p.poly(rrect(tcx - 0.5 * T.a, chin - 0.12 * HH, tcx + 0.5 * T.a, chin + 0.07 * HH, 3 * u), o.collar, 2.2 * u);
      if (o.shawl) p.poly([[tcx - 1.2 * T.a, chin - 0.05 * HH], [tcx + 1.2 * T.a, chin - 0.05 * HH], [tcx, chin + 0.62 * HH]], o.shawl, 2.4 * u);
      if (!back && o.dbl) for (let i = 0; i < 4; i++) for (const dx of [-0.3, 0.3]) {
        const y = chin + 0.14 * HH + i * 0.19 * HH;
        p.dot(tcx + 2 * u * facing + dx * T.a, y, 3.2 * u, INK); p.dot(tcx + 2 * u * facing + dx * T.a, y, 2.3 * u, o.buttons ?? "#e0bc5a");
      }
      if (!back && !o.shirt && !o.dbl && !o.apron && !o.shawl) for (let i = 0; i < 4; i++) {
        const y = chin + 0.12 * HH + i * 0.2 * HH;
        if (o.sash && Math.abs(y - (torsoBot - 0.32 * HH)) < 0.08 * HH) continue;
        p.dot(tcx + 2 * u * facing, y, 2.2 * u + 0.8 * u, INK); p.dot(tcx + 2 * u * facing, y, 2.2 * u, o.buttons ?? shade(o.jacket, 0.7));
      }
      if (!back && o.shirt) for (let i = 0; i < 2; i++) { const y = chin + 0.62 * HH + i * 0.2 * HH; p.dot(tcx + 2 * u * facing, y, 3 * u, INK); p.dot(tcx + 2 * u * facing, y, 2.2 * u, o.buttons ?? shade(o.jacket, 0.7)); }
    });
    p.inkRing(tp, ow, thick);
    if (o.cape) { // police cape over shoulders and arms, down to the hips
      const cp: P2[] = [[tcx - 0.62 * T.a, chin - 0.06 * HH], [tcx + 0.62 * T.a, chin - 0.06 * HH], [tcx + 1.28 * T.a, torsoBot + 0.02 * HH], [tcx + 1.1 * T.a, torsoBot + 0.1 * HH],
        [tcx, torsoBot + 0.14 * HH], [tcx - 1.1 * T.a, torsoBot + 0.1 * HH], [tcx - 1.28 * T.a, torsoBot + 0.02 * HH]];
      p.gradFill(cp, o.cape, mul(o.cape, SH_CLOTH), light); p.poly(cp, null, ow * 0.9);
      p.poly(rrect(tcx - 0.55 * T.a, chin - 0.12 * HH, tcx + 0.55 * T.a, chin + 0.08 * HH, 3 * u), mul(o.cape, [0.8, 0.8, 0.85]), 2.2 * u);
    }
    if (o.flower && !back) { const fx2 = tcx - 0.42 * T.a + 2 * u * facing, fy = chin + 0.16 * HH; for (let i = 0; i < 6; i++) p.ell(fx2 + 5 * u * Math.cos(i * 1.05), fy + 5 * u * Math.sin(i * 1.05), 4.5 * u, 4.5 * u, o.flower, 1.6 * u); p.dot(fx2, fy, 2.6 * u, mul(o.flower, [0.7, 0.7, 0.7])); }
    if (o.sashD && !back) p.clip(tp, () => p.band([[tcx - 1.1 * T.a, chin - 0.02 * HH], [tcx + 1.0 * T.a, torsoBot + 0.02 * HH]], o.sashD!, 0.16 * HH, 1.8 * u));
    if (o.epaulette) for (const side of [-1, 1]) { const S = sh(side); p.ell(S[0] + side * 3 * u, S[1] - 2 * u, 15 * u, 7 * u, o.epaulette, 2.4 * u, 0, 360, side * -12); }
  }
  if (o.sword && mode !== "chair" && mode !== "sit") { // sabre in its scabbard on the left hip
    const a0: P2 = [tcx - 0.62 * T.a, torsoBot - 0.16 * HH], b0: P2 = [tcx - 0.98 * T.a - 8 * u, sole - 0.2 * HH];
    p.band(curve(a0, [tcx - 0.92 * T.a, (a0[1] + b0[1]) / 2], b0), "#9aa2ac", 4.6 * u, 1.6 * u, "round");
    p.arc(a0[0] + 4 * u, a0[1] - 6 * u, 8 * u, 10 * u, 160, 380, 2.6 * u, "#d8b04a");
    p.dot(a0[0], a0[1] - 10 * u, 4 * u, "#d8b04a");
  }
  if (o.scarf) { // knitted scarf round the neck with one hanging end
    const xc = tcx + 2 * u * facing, y = chin + 0.04 * HH;
    p.poly(rrect(xc - 0.6 * T.a, y - 0.07 * HH, xc + 0.6 * T.a, y + 0.1 * HH, 0.07 * HH), o.scarf, 3 * u);
    if (!back) {
      p.poly([[xc + 0.12 * T.a, y + 0.06 * HH], [xc + 0.38 * T.a, y + 0.06 * HH], [xc + 0.42 * T.a, y + 0.6 * HH], [xc + 0.18 * T.a, y + 0.62 * HH]], o.scarf, 3 * u);
      for (let i = 0; i < 3; i++) p.stroke([[xc + 0.2 * T.a, y + (0.46 + i * 0.05) * HH], [xc + 0.4 * T.a, y + (0.45 + i * 0.05) * HH]], 1.4 * u, "rgba(255,255,255,0.55)");
    }
  }
  // in front of the body: props held in the hands
  const paperW = 0.62 * T.a * 2, paperH = 0.44 * HH * 1.15;
  if (!back && pose === "paper") sheet(p, tcx + 2 * u, holdY - 0.12 * HH, paperW, paperH, rad(-3), u);
  if (!back && pose === "shuffle") {
    const k = wv * two;
    sheet(p, tcx - 10 * u + 6 * u * Math.sin(k), holdY - 0.1 * HH, paperW, paperH, rad(-14 + 10 * Math.sin(k)), u);
    sheet(p, tcx + 12 * u * Math.sin(k + 1.7), holdY - 0.16 * HH - 6 * u * Math.cos(k), paperW, paperH, rad(10 + 14 * Math.sin(k + 2)), u);
    sheet(p, tcx + 6 * u, holdY - 0.12 * HH, paperW, paperH, rad(-4 + 6 * Math.cos(k * 1.3)), u);
  }
  if (!back && pose === "pad") {
    const px = tcx - 0.1 * T.a, py = holdY - 0.14 * HH;
    p.poly(rrect(px - 0.3 * T.a, py - 0.2 * HH, px + 0.3 * T.a, py + 0.2 * HH, 2 * u), "#f4efd9", 2.4 * u);
    p.poly(rrect(px - 0.3 * T.a, py - 0.2 * HH, px + 0.3 * T.a, py - 0.15 * HH, 1 * u), "#c85a3a", 1.6 * u);
    for (let i = 0; i < 4; i++) p.stroke([[px - 0.2 * T.a, py - 0.08 * HH + i * 0.07 * HH], [px + (i % 2 ? 0.05 : 0.18) * T.a, py - 0.08 * HH + i * 0.07 * HH]], 1.2 * u, "#7d8494");
    const [hx, hy] = arms[1].pts[2];
    p.band([[hx - 4 * u, hy + 6 * u], [hx - 14 * u, hy - 10 * u]], "#2c4f9e", 2.6 * u, 1 * u, "round");
  }
  if (item && !back && pose !== "cup") {
    const hands = arms.filter((a) => a.front || pose === "give");
    if (hands.length) {
      const ix = hands.reduce((s2, a) => s2 + a.pts[2][0], 0) / hands.length, iy = hands.reduce((s2, a) => s2 + a.pts[2][1], 0) / hands.length;
      if (pose === "give" || pose === "hold") drawItem(p, item, ix, iy - (item === "doc" ? 0.02 * HH : 0), u, HH);
    }
  }
  if (pose === "news" && !back) { // newspaper spread in front of the chest: abstract columns, no letters
    const x0 = tcx - (0.95 * T.a + 8 * u), x1 = tcx + (0.95 * T.a + 8 * u), y0 = chin + 0.06 * HH, y1 = chin + 0.8 * HH;
    p.poly([[x0, y0], [x1, y0 - 3 * u], [x1 + 2 * u, y1], [x0 - 2 * u, y1 + 3 * u]], "#efe8d6", 2.6 * u);
    p.stroke([[(x0 + x1) / 2, y0 + 2 * u], [(x0 + x1) / 2, y1]], 1.6 * u, "rgba(36,23,38,0.4)");
    p.poly(rrect(x0 + 6 * u, y0 + 6 * u, x1 - 6 * u, y0 + 0.12 * HH, 1.5 * u), "#3a3438", 0);
    { // left column: a big ink sketch of the tower with orange rust blotches
      const cx2 = x0 + 6 * u, w2 = (x1 - x0) / 2 - 9 * u, Y0 = y0 + 0.16 * HH, Y1 = y0 + 0.66 * HH;
      p.poly(rrect(cx2, Y0, cx2 + w2, Y1, 1 * u), "#ddd5c4", 0);
      const bx2 = cx2 + w2 / 2, b0 = Y1 - 0.04 * HH, t0 = Y0 + 0.04 * HH, hw = 0.4 * w2, mid = b0 - 0.4 * (b0 - t0);
      for (const [rx, ry, rr] of [[-0.55, 0.82, 0.13], [0.5, 0.7, 0.11], [-0.2, 0.5, 0.09], [0.15, 0.3, 0.07]] as const)
        p.ell(bx2 + rx * hw, t0 + ry * (b0 - t0), rr * w2, rr * w2 * 0.8, "rgba(214,110,40,0.85)", 0);
      p.stroke([[bx2 - hw, b0], [bx2 - hw * 0.3, mid], [bx2, t0], [bx2 + hw * 0.3, mid], [bx2 + hw, b0]], 2 * u);
      p.stroke([[bx2 - hw * 0.55, b0 - 0.25 * (b0 - t0)], [bx2 + hw * 0.55, b0 - 0.25 * (b0 - t0)]], 1.8 * u);
      p.stroke([[bx2 - hw * 0.3, mid], [bx2 + hw * 0.3, mid]], 1.6 * u);
      p.arc(bx2, b0, hw * 0.42, 0.12 * (b0 - t0), 180, 360, 1.6 * u);
      for (let i = 0; i < 3; i++) p.stroke([[cx2, y0 + (0.72 + i * 0.075) * HH], [cx2 + (i % 2 ? 0.8 : 1) * w2, y0 + (0.72 + i * 0.075) * HH]], 1.4 * u, "#8a8478");
    }
    { // right column: a grey picture box and lines
      const cx2 = (x0 + x1) / 2 + 4 * u;
      p.poly(rrect(cx2, y0 + 0.18 * HH, cx2 + 0.38 * T.a, y0 + 0.36 * HH, 1 * u), "#b9b0a0", 0);
      for (let i = 0; i < 6; i++) p.stroke([[cx2, y0 + (0.42 + i * 0.075) * HH], [cx2 + (i % 2 ? 0.3 : 0.38) * T.a, y0 + (0.42 + i * 0.075) * HH]], 1.4 * u, "#8a8478");
    }
  }
  for (const a of arms) if (a.front && !a.late && !o.cape) {
    drawArm(a);
    const [hx, hy] = a.pts[2];
    if (prop === "icecream") {
      p.poly([[hx - 8 * u, hy - 12 * u], [hx + 8 * u, hy - 12 * u], [hx, hy + 7 * u]], "#e0a35a", 1.8 * u);
      p.ell(hx, hy - 19 * u, 11 * u, 10 * u, "#f7c6d9", 2.2 * u);
      p.dot(hx, hy, 5.5 * u);
    } else if (Array.isArray(prop)) {
      const ang = rad(-70 + 105 * clamp(prop[1], 0, 1));
      const Rh = (pts: P2[]) => rotPts(pts, ang, hx, hy);
      p.band(Rh([[hx, hy + 12 * u], [hx, hy - 44 * u]]), "#8a5a34", 5 * u, 1.5 * u, "round");
      p.poly(Rh([[hx - 12 * u, hy - 58 * u], [hx + 20 * u, hy - 58 * u], [hx + 20 * u, hy - 42 * u], [hx - 12 * u, hy - 42 * u]]), "#7d848c", 2.2 * u);
      p.dot(hx, hy, 5.5 * u);
    }
  }
  if ((pose === "halt" || pose === "spread") && kk > 0.5) for (const a of arms) {
    if (pose === "halt" && a !== arms[1]) continue;
    const [hx, hy] = a.pts[2], sd = hx > tcx ? 1 : -1;
    palm(p, hx + sd * 2 * u, hy - 4 * u, u * (pose === "halt" ? 2.0 : 1.1), pose === "halt" ? sd * 0.15 : sd * 1.35, o.skin ?? SKIN);
  }
  if (pose === "point") { const [hx, hy] = arms[1].pts[2]; p.stroke([[hx, hy], [hx + hs * 14 * u, hy - 1 * u]], 4 * u); }
  // ---- head: rotates with the body, plus its own tilt about the chin (bow: head drops forward, chest: lifts) ----
  const Ah = A + headTilt, [cpx, cpy] = rotAbout([300, chin], rad(A), [300, hipY]);
  const hdy = bow * 0.42 * HH - chest * 0.03 * HH;
  p.rot = Ah || hdy ? [rad(Ah), 300, chin, cpx - 300, cpy - chin + hdy] : null;
  hatBehind(p, o, H, 300, hc, light, thick, ow, false);
  const hp = blobPts(300, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  if (back) { // back of the head: hair over everything but the nape
    const hair = o.hair ?? "#4a3426";
    p.clip(hp, () => {
      const top = hc + (o.hat === "longhair" || o.hat === "perm" ? 1.2 : 0.62) * H.b;
      const pts: P2[] = [[300 - 2 * W, crown - HH], [300 + 2 * W, crown - HH], [300 + 2 * W, top], [300, top + 0.12 * H.b], [300 - 2 * W, top]];
      p.shadedFill(pts, hair, mul(hair, SH_FELT), light, H.a);
    });
  }
  p.inkRing(hp, ow, thick);
  if (!(back && o.hat === "hair")) hatOn(p, o, hp, H, 300, hc, light, seed, facing, false, back);
  if (!back) {
    const brim = !!o.hat && ["shako", "shako_tall", "tophat", "guardcap", "beanie", "flatcap", "officer", "pickel", "feldmutze", "bowler", "boater", "ladyhat", "kepi", "cloche", "trilby"].includes(o.hat);
    faceFront(p, 300, hc, W, expr, facing, look, lid, brim, skin, o.moustache, o.build === "stout", o.glasses, o.mst === "big", o.mst === "thin", o.beard);
  }
  p.rot = null;
  if (pose === "salute" && kk > 0.5 && !back) { // flat hand at the cap brim, drawn over the head
    const [hx, hy] = arms[arms.length - 1].pts[2];
    p.ell(hx, hy, 15 * u, 5.5 * u, skin, 2.4 * u, 0, 360, hs * 18);
  }
  if (!back) { for (const a of arms) if (a.late) drawArm(a); for (const fn of late) fn(); }
  if (pose === "cup" && !back) { // cup held in both hands under the moustache
    const cx2 = tcx + 2 * u * facing, cy2 = chin + 0.02 * HH;
    drawItem(p, "cup", cx2, cy2, u * 1.25, HH);
    for (const side of [-1, 1]) p.dot(cx2 + side * 15 * u, cy2 + 6 * u, 5.5 * u);
  }
};
export type SideOpts = {
  phase?: number; expr?: Expr; mode?: "march" | "stand" | "swing" | "push"; blink?: boolean | number; stomp?: number; pose?: number;
  /** step length as a multiple of 0.8 m (370 units): matches 1.6 m/s at 2 steps/s; scale by the view's foreshortening */
  stride?: number; light?: number; seed?: number;
  /** Ballon: a fabric roll carried under the near arm (item kind) */
  carry?: string;
  /** push mode: where the hands land at pose 1, in final canvas units (e.g. the swing kid's back) */
  hand?: [number, number];
};

/** two-bone leg, knee bending forward (+x) */
const ik = (hip: P2, ank: P2, l1: number, l2: number): P2 => {
  const dx = ank[0] - hip[0], dy = ank[1] - hip[1], d = clamp(Math.hypot(dx, dy), 1, l1 + l2 - 0.01);
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), k = Math.atan2(dy, dx) - A;
  return [hip[0] + l1 * Math.cos(k), hip[1] + l1 * Math.sin(k)];
};

/** hip height of the seated kid in `swing` mode (design units); swingKid seats the torso bottom on the plank */
const SWING_HIP = 733;

/** side view facing screen-right; march footfalls land at phase 0 (near foot) and 0.5 (far foot), like the front view.
 *  The stance foot is planted: it slides back at exactly the walking speed while the hip rises and falls over it. */
export const bodySide = (p: Pen, o: Outfit, opts: SideOpts) => {
  const { phase = 0, expr = "neutral", mode = "march", blink = false, stomp = 1, pose = 0, stride = 1, light = DEF_LIGHT, seed = 1 } = opts;
  const Bd = BUILD[o.build ?? "adult"], skin = o.skin ?? SKIN, two = Math.PI * 2, lid = lidOf(blink);
  const H: Blob = { ...headBlob(seed, Bd.a, 1), asym: 0.12, rot: rad(3 + 3 * (rnd(seed, 7) - 0.5)) };
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100, sole = 975, ankY = sole - 4 * u;
  const thick = thickAngle(light), ow = 5 * u;
  const legLen = (Bd.legs + 0.12) * HH - 4 * u, l1 = legLen / 2, l2 = legLen / 2;
  const nearCol = mix(o.pants, INK, 0.55), farCol = mix(o.pants, INK, 0.75), footCol = o.boots;
  type LegS = { ank: P2; pitch: number; near: boolean };
  const legs: LegS[] = [];
  let hipY = ankY - legLen * 0.995, lean = 0, nearFwd = 0;
  if (mode === "march") {
    const S = 370 * stride, liftH = Math.max(22, 40 + 70 * (stomp - 1));
    const st = (ph: number) => {
      const c = (((phase + ph) % 1) + 1) % 1;
      if (c < 0.5) { const s = c / 0.5; return { x: S / 2 - S * s, h: 0, stance: true, s }; }
      const s = (c - 0.5) / 0.5; // swing: cycloid in world space, so the foot leaves and lands at zero ground speed
      return { x: -S / 2 + S * s - (S / Math.PI) * Math.sin(2 * Math.PI * s), h: liftH * Math.sin(Math.PI * s), stance: false, s };
    };
    const nL = st(0), fL = st(0.5), stance = nL.stance ? nL : fL;
    const Leff = legLen * (1 - 0.035 * Math.sin(Math.PI * stance.s));
    hipY = ankY - Math.sqrt(Math.max(1, Leff * Leff - stance.x * stance.x));
    for (const [L, near] of [[fL, false], [nL, true]] as const)
      legs.push({ ank: [300 + L.x, ankY - L.h], pitch: L.stance ? 0 : rad(35 * Math.sin(Math.PI * L.s) * (1 - 1.6 * L.s)), near });
    lean = 4 + 3 * Math.cos(2 * two * phase); // 7 deg at contact, 1 deg at passing
    nearFwd = nL.x / (S / 2);
  } else if (mode === "push") {
    hipY = ankY - 0.87 * legLen;
    legs.push({ ank: [300 - 0.5 * legLen, ankY], pitch: rad(-8), near: false }, { ank: [300 + 0.32 * legLen, ankY], pitch: 0, near: true });
    lean = 14 * pose;
  } else if (mode === "swing") {
    hipY = SWING_HIP;
    const a = rad(60 * pose);
    for (const [dx, near] of [[-6, false], [0, true]] as const) {
      const knee: P2 = [300 + l1 * 0.98 + dx * u, hipY + 6 * u];
      legs.push({ ank: [knee[0] + l2 * Math.sin(a), knee[1] + l2 * Math.cos(a)], pitch: -a * 0.5, near });
    }
  } else {
    legs.push({ ank: [300 - 4 * u, ankY], pitch: 0, near: false }, { ank: [300 + 4 * u, ankY], pitch: 0, near: true });
  }
  const torsoBot = hipY + 0.12 * HH, chin = torsoBot - Bd.torso * HH, hc = chin - H.b, crown = hc - H.b, hip: P2 = [300, hipY];
  p.rot = null;
  for (const L of legs) {
    const knee = mode === "swing" ? ([300 + l1 * 0.98 + (L.near ? 0 : -6 * u), hipY + 6 * u] as P2) : ik(hip, L.ank, l1, l2);
    const hp0: P2 = [300 + (L.near ? 0 : -5 * u), hipY];
    p.stroke([hp0, knee, L.ank], 5.8 * u, L.near ? nearCol : farCol);
    const c = Math.cos(L.pitch), s = Math.sin(L.pitch);
    footStroke(p, [L.ank[0] - 3 * u * c, L.ank[1] - 3 * u * s], [L.ank[0] + 13 * u * c, L.ank[1] + 13 * u * s + 0.5 * u],
      7.5 * u, L.near ? footCol : footCol === INK ? INK : shade(footCol, 0.82));
  }
  // ---- upper body leans about the hip ----
  p.rot = lean ? [rad(lean), 300, hipY] : null;
  const T: Blob = { a: (o.build === "stout" ? 0.36 : 0.31) * W, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.5, egg: 0.1, asym: 0.06,
    rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = 300 + 2 * u, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const armCol = mix(o.jacket, INK, 0.5), farArm = mix(o.jacket, INK, 0.68);
  const S: P2 = [tcx + 0.05 * T.a, chin + 0.14 * HH], aLen = 0.95 * HH;
  const swingArm = (ang: number): [P2, P2, P2] => {
    const e: P2 = [S[0] + Math.sin(ang) * aLen * 0.5, S[1] + Math.cos(ang) * aLen * 0.5], a2 = ang + rad(16) * Math.sign(ang || 1);
    return [S, e, [e[0] + Math.sin(a2) * aLen * 0.5, e[1] + Math.cos(a2) * aLen * 0.5]];
  };
  const rifle = !!o.rifle && (mode === "march" || mode === "stand");
  const B0: P2 = [tcx + 0.72 * T.a, chin + 0.58 * HH], B1: P2 = [tcx - 0.95 * T.a - 22 * u, crown - 0.4 * HH];
  let near: [P2, P2, P2], far: [P2, P2, P2] | null;
  if (mode === "swing") { near = [S, [S[0] + 12 * u, S[1] - 0.16 * HH], [300 + 6 * u, chin - 0.3 * HH]]; far = [S, [S[0] + 8 * u, S[1] - 0.18 * HH], [300 + 2 * u, chin - 0.36 * HH]]; }
  else if (mode === "push") {
    const reach = 0.55 * HH + 0.45 * HH * pose;
    let hN: P2 = [S[0] + reach, S[1] + 0.06 * HH];
    if (opts.hand) {
      // target is in final canvas units; the arm is drawn inside the lean rotation, so undo it
      const th = -rad(lean), dx = opts.hand[0] - 300, dy = opts.hand[1] - hipY;
      const tg: P2 = [300 + dx * Math.cos(th) - dy * Math.sin(th), hipY + dx * Math.sin(th) + dy * Math.cos(th)];
      hN = [hN[0] + (tg[0] - hN[0]) * pose, hN[1] + (tg[1] - hN[1]) * pose];
    }
    near = [S, [(S[0] + hN[0]) / 2, (S[1] + hN[1]) / 2 + 0.06 * HH], hN];
    far = [S, [(S[0] + hN[0]) / 2 - 4 * u, (S[1] + hN[1]) / 2 - 0.02 * HH], [hN[0] - 6 * u, hN[1] - 0.08 * HH]];
  } else if (rifle) { near = [S, [S[0] - 4 * u, S[1] + 0.42 * HH], B0]; far = mode === "march" ? swingArm(rad(30) * nearFwd) : swingArm(0); }
  else { near = swingArm(rad(-30) * nearFwd); far = mode === "march" ? swingArm(rad(30) * nearFwd) : null; }
  if (far && !o.cape) { p.stroke(curve(far[0], far[1], far[2]), 5.2 * u, farArm); p.dot(far[2][0], far[2][1], 5.5 * u); }
  p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), light);
  p.clip(tp, () => {
    if (o.belt) p.band([[tcx - 0.65 * T.a, chin - 0.05 * HH], [tcx + 0.75 * T.a, torsoBot - 0.1 * HH]], o.belt!, 5.5 * u, 1.8 * u);
    if (o.sash) p.band([[tcx - 1.3 * T.a, torsoBot - 0.32 * HH], [tcx + 1.3 * T.a, torsoBot - 0.32 * HH]], o.sash, 0.13 * HH, 1.8 * u);
    if (!o.dress) for (let i = 0; i < 3; i++) { const y = chin + 0.16 * HH + i * 0.24 * HH; p.dot(tcx + 0.8 * T.a, y, 3 * u, INK); p.dot(tcx + 0.8 * T.a, y, 2.2 * u, o.buttons ?? shade(o.jacket, 0.7)); }
  });
  p.inkRing(tp, ow, thick);
  if (rifle) {
    p.band([B0, B1], "#7a4b2a", 5 * u, 1.5 * u, "round");
    p.band([lerp2(B0, B1, 0.6), B1], "#8d949c", 2.4 * u, 1.2 * u, "round");
  }
  if (o.cape) { // cape over the shoulders, flaring back (hands behind the back, under it)
    const cp: P2[] = [[tcx + 0.55 * T.a, chin - 0.04 * HH], [tcx - 0.8 * T.a, chin - 0.06 * HH], [tcx - 1.45 * T.a, torsoBot + 0.12 * HH], [tcx - 0.2 * T.a, torsoBot + 0.18 * HH], [tcx + 1.05 * T.a, torsoBot + 0.08 * HH]];
    p.gradFill(cp, o.cape, mul(o.cape, SH_CLOTH), light); p.poly(cp, null, ow * 0.9);
  } else if (opts.carry) { // roll under the near arm, the hand round its front end
    const ry = torsoBot - 0.34 * HH, hn: P2 = [tcx + 48 * u, ry - 2 * u];
    drawRoll(p, tcx + 8 * u, ry, u, opts.carry, 92 * u, 15 * u);
    p.stroke(curve(S, [S[0] - 6 * u, (S[1] + hn[1]) / 2 + 0.06 * HH], hn), 5.2 * u, armCol); p.ell(hn[0], hn[1], 7.5 * u, 6.5 * u, skin, 2.2 * u);
  } else { p.stroke(curve(near[0], near[1], near[2]), 5.2 * u, armCol); p.dot(near[2][0], near[2][1], 5.5 * u); }
  // ---- head ----
  const hx = 300 + 4 * u;
  hatBehind(p, o, H, hx, hc, light, thick, ow, true);
  const hp = blobPts(hx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  hatOn(p, o, hp, H, hx, hc, light, seed, 1, true);
  const brim = !!o.hat && o.hat !== "hair" && o.hat !== "bonnet" && o.hat !== "cap" && o.hat !== "bald";
  faceSide(p, hx, hc, W, expr, lid, brim, skin, o.moustache, o.build === "stout", o.mst === "big", o.mst === "thin");
  p.rot = null;
};

/** rope + seat + seated kid on a 700 x 2300 canvas; the pivot is design (350, 20); kid drawn at 0.92 scale */
export const swingKid = (p: Pen, o: Outfit, kick: number, expr: Expr, light = DEF_LIGHT, blink: number = 0) => {
  const rope = 1830, k = 1.1, HH = 2 * headBlob(5, BUILD[o.build ?? "adult"].a, 1).b;
  // two ropes from the pivot to the ends of a wide plank, the kid framed between them: a single rope behind the kid
  // ended at the cap and read as a hanging. Far rope behind the kid, near rope drawn over (clear of the face).
  const seat = rope + 18, x0 = 150, x1 = 550;
  p.line([[350, 20], [x0 + 16, seat + 4]], "#a07a4c", 10);
  p.poly(rrect(x0, seat, x1, seat + 36, 10), "#b5653f", 9);
  const g = p.g;
  g.save();
  g.translate(350 - 300 * k, rope + 18 - (SWING_HIP + 0.12 * HH) * k);
  g.scale(k, k);
  bodySide(new Pen(g), o, { expr, mode: "swing", pose: kick, light, seed: 5, blink });
  g.restore();
  p.line([[350, 20], [x1 - 16, seat + 4]], "#a07a4c", 10);
};

// ---------------- effects ----------------
export const fxNote = (p: Pen, kind: number, col = "#1f2a44") => {
  p.ell(70, 200, 46, 34, col, 8, 0, 360, -20);
  p.stroke([[110, 190], [110, 40]], 14);
  if (kind === 0) p.poly([[110, 40], [170, 70], [170, 110], [110, 82]], col, 8);
  else {
    p.ell(150, 170, 40, 30, col, 8, 0, 360, -20);
    p.stroke([[186, 160], [186, 20]], 14);
    p.poly([[110, 40], [186, 20], [186, 50], [110, 70]], col, 8);
  }
};

/** spark / impact star on a 500 x 500 canvas; t in 0..1 */
export const fxBurst = (p: Pen, t: number, col = "#fff3b0", rays = 10, r0 = 40, r1 = 230) => {
  const c = 250, e = 1 - (1 - t) ** 3;
  for (let i = 0; i < rays; i++) {
    const a = rad((i * 360) / rays + 7 * (i % 2)), ra = r0 + (r1 - r0) * e * (0.75 + 0.25 * (i % 2));
    p.poly([[c + r0 * 0.5 * Math.cos(a + 0.18), c + r0 * 0.5 * Math.sin(a + 0.18)], [c + ra * Math.cos(a), c + ra * Math.sin(a)],
      [c + r0 * 0.5 * Math.cos(a - 0.18), c + r0 * 0.5 * Math.sin(a - 0.18)]], col, Math.max(3, 8 * (1 - t)));
  }
  if (t < 0.5) p.ell(c, c, r0 * (1.4 - t), r0 * (1.4 - t), WHITE, 8);
};

/** water splash crown on an 800 x 800 canvas; t in 0..1 */
export const fxSplash = (p: Pen, t: number) => {
  const c = 400, size = 800, rise = Math.sin(Math.min(1, t * 1.3) * Math.PI);
  const blue = "#bfe8ff", deep = "#6cc0f0";
  if (rise > 0.02) {
    const pts: P2[] = [];
    for (let i = 0; i < 19; i++) {
      const h = (i % 2 ? 260 : 130) * rise * (0.7 + 0.3 * Math.sin(i * 1.7));
      pts.push([c - 330 + (660 * i) / 18, size - 120 - h]);
    }
    p.poly([...pts, [c + 330, size - 90], [c - 330, size - 90]], blue, 10);
    p.ell(c, size - 100, 360, 46, deep, 10);
  }
  for (let i = 0; i < 8; i++) {
    const a = rad(200 + i * 18), d = 120 + 380 * t, y = size - 160 + d * Math.sin(a) + 520 * t * t, r = 26 * (1 - t) + 6;
    if (t > 0.08 && y < size - 40) p.ell(c + d * Math.cos(a), y, r, r * 1.25, blue, 7);
  }
};

/** dust puff on a 300 x 300 canvas; t in 0..1 */
export const fxPuff = (p: Pen, t: number, rgb = "238,225,205") => {
  for (let i = 0; i < 5; i++) {
    const a = rad(160 + i * 55), d = 40 + 70 * t, r = (34 + 20 * (i % 2)) * (1 - 0.6 * t);
    p.ell(150 + d * Math.cos(a), 180 + d * 0.45 * Math.sin(a), r, r * 0.8, `rgba(${rgb},${(1 - t).toFixed(3)})`, 0);
  }
};

/** circling stars on a 420 x 210 canvas */
export const fxStars = (p: Pen, t: number) => {
  for (let i = 0; i < 4; i++) {
    const a = t * Math.PI * 2 + (i * Math.PI) / 2, x = 210 + 150 * Math.cos(a), y = 110 + 40 * Math.sin(a), pts: P2[] = [];
    for (let k = 0; k < 10; k++) { const r = k % 2 ? 14 : 34, b = rad(k * 36 - 90); pts.push([x + r * Math.cos(b), y + r * Math.sin(b)]); }
    p.poly(pts, "#ffd84a", 6);
  }
};

/** three jittering strain ticks on a 300 x 300 canvas */
export const fxCreak = (p: Pen, t: number) => {
  const j = 6 * Math.sin(t * 40);
  for (const a of [-30, 0, 30]) {
    const b = rad(a - 90);
    p.stroke([[150 + 70 * Math.cos(b) + j, 230 + 70 * Math.sin(b)], [150 + 100 * Math.cos(b) + 10 + j, 230 + 100 * Math.sin(b)],
      [150 + 130 * Math.cos(b) + j, 230 + 130 * Math.sin(b)]], 10);
  }
};

/** flat water ring (drawn top-down) on a 600 x 600 canvas; t in 0..1 */
export const fxRing = (p: Pen, t: number) => {
  // thin light water rings (white crest, pale blue trailing rings), thinning as they spread
  const g = p.g;
  for (let k = 0; k < 3; k++) {
    const u = t - k * 0.22;
    if (u <= 0 || u >= 1) continue;
    g.beginPath(); g.ellipse(300, 300, 60 + 230 * u, 60 + 230 * u, 0, 0, Math.PI * 2);
    g.strokeStyle = k === 0 ? "#f6fcff" : "#cfe8fa"; g.lineWidth = 9 * (1 - u) + 3; g.stroke();
  }
};

/** text-free sign on a 700 x 520 canvas: "no marching in step on the bridge". A bridge (deck + arch + piers), four
 *  identical pairs of marching legs in the same stride (in step), a bold red X over all of it. */
export const fxSign = (p: Pen) => {
  const g = p.g, RED = "#d42f2f";
  p.poly(rrect(14, 14, 686, 506, 40), "#f6ecd2", 0);
  p.poly(rrect(14, 14, 686, 506, 40), null, 14);
  // bridge: deck, stone arch underneath, two piers
  p.poly(rrect(70, 352, 630, 384, 8), "#8a5a3a", 9);
  g.beginPath(); g.moveTo(112, 470); g.quadraticCurveTo(350, 300, 588, 470);
  g.strokeStyle = INK; g.lineWidth = 16; g.lineCap = "round"; g.stroke();
  for (const x of [88, 612]) p.poly(rrect(x - 16, 384, x + 16, 470, 4), "#8a5a3a", 9);
  // four identical soldiers' legs mid-stride: same leg forward on every one = in step
  for (const x of [150, 278, 406, 534]) {
    p.poly(rrect(x - 30, 150, x + 30, 214, 14), "#357650", 9);                  // coat hem
    p.stroke([[x - 8, 210], [x + 34, 262], [x + 46, 338]], 15, INK);           // front leg
    p.stroke([[x + 6, 210], [x - 12, 274], [x - 36, 336]], 15, INK);           // back leg
    p.poly(rrect(x + 30, 330, x + 74, 350, 9), INK, 0);                          // boots point forward
    p.poly(rrect(x - 52, 328, x - 8, 348, 9), INK, 0);
  }
  // big red X
  for (const [a, b] of [[[96, 70], [604, 452]], [[604, 70], [96, 452]]] as [[number, number], [number, number]][]) {
    p.stroke([a, b], 58, "#ffffff");
    p.stroke([a, b], 42, RED);
  }
};

/** soft cartoon cloud on a 600 x 300 canvas */
export const fxCloud = (p: Pen, seed: number) => {
  const blobs: [number, number, number][] = [[150, 190, 80], [250, 150, 105], [360, 160, 95], [450, 195, 70], [300, 210, 90]];
  for (const [x, y, r] of blobs) p.ell(x + ((seed * 37) % 20) - 10, y, r, r * 0.8, "#ffffff", 0);
  p.ell(300, 235, 230, 40, "#ffffff", 0);
};

/** cast shadow on a 128 x 256 canvas: dark soft contact pool at the feet (y 205) and a softer tail that runs up the
 *  canvas = away from the sun, fading with distance; multiply colour (sRGB-encoded linear ratio), white = no change */
export const fxShadow = (p: Pen, col: string) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 256);
  g.save(); g.filter = "blur(9px)";
  const lg = g.createLinearGradient(0, 205, 0, 22);
  lg.addColorStop(0, mix(col, WHITE, 0.08)); lg.addColorStop(0.55, mix(col, WHITE, 0.3)); lg.addColorStop(1, mix(col, WHITE, 0.85));
  g.fillStyle = lg;
  g.beginPath(); g.moveTo(40, 205); g.bezierCurveTo(36, 120, 46, 50, 64, 30); g.bezierCurveTo(82, 50, 92, 120, 88, 205); g.closePath(); g.fill();
  g.fillStyle = col; g.beginPath(); g.ellipse(64, 205, 30, 17, 0, 0, Math.PI * 2); g.fill();
  g.restore();
};

/** tight contact shadow right under the feet on a 128 x 128 canvas: dark core, short fall-off (multiply colour) */
export const fxContact = (p: Pen, col: string) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 128);
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [r, k] of [[0, 0], [0.32, 0.02], [0.5, 0.22], [0.66, 0.58], [0.82, 0.88], [1, 1]] as const) gr.addColorStop(r, mix(col, WHITE, k));
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
};

/** floating wooden plank, side-on, on a 320 x 110 canvas */
export const fxPlank = (p: Pen) => {
  p.poly(rrect(14, 30, 306, 78, 10), "#a8744a", 9);
  p.line([[40, 46], [150, 44], [270, 50]], "#7d5234", 4);
  p.line([[60, 62], [200, 64], [284, 60]], "#7d5234", 4);
  p.dot(36, 54, 5, INK); p.dot(284, 54, 5, INK);
};

/** floating marching drum (no text) on a 260 x 240 canvas: white shell, red hoops, ink zig-zag cord */
export const fxDrum = (p: Pen) => {
  p.poly(rrect(40, 70, 220, 190, 16), "#f1ece0", 9);
  p.poly(rrect(32, 58, 228, 86, 12), "#c9373a", 8);
  p.poly(rrect(32, 176, 228, 204, 12), "#c9373a", 8);
  p.line([[52, 88], [82, 172], [112, 88], [142, 172], [172, 88], [202, 172]], INK, 6);
  p.ell(130, 58, 98, 18, "#f7f3ea", 8);
};

/** soft ground contact blob on a 128 x 128 canvas, multiply colour (sRGB-encoded linear ratio) in the centre */
export const fxBlob = (p: Pen, col: string) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 128);
  // soft contact shadow: flat core, then a long smooth (roughly gaussian) fall-off to white = no change
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [r, k] of [[0, 0], [0.5, 0.04], [0.64, 0.18], [0.76, 0.42], [0.87, 0.72], [0.95, 0.92], [1, 1]] as const) gr.addColorStop(r, mix(col, WHITE, k));
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
};

// ---------------- Köpenick extras ----------------
/** steam / smoke puff (soft round cloud) on a 300 x 300 canvas; t 0..1 grows and fades */
export const fxSteam = (p: Pen, t: number, rgb = "236,236,240") => {
  const a = 0.85 * (1 - t) ** 1.3;
  for (let i = 0; i < 6; i++) {
    const an = rad(i * 60 + 20), d = 38 + 30 * t, r = 52 + 14 * (i % 2);
    p.ell(150 + d * Math.cos(an), 150 + d * 0.8 * Math.sin(an), r, r * 0.86, `rgba(${rgb},${a.toFixed(3)})`, 0);
  }
  p.ell(150, 150, 70, 64, `rgba(${rgb},${a.toFixed(3)})`, 0);
};
/** twinkling four-point stars on a 500 x 500 canvas (the star moment) */
export const fxSparkle = (p: Pen, t: number) => {
  const pts: [number, number, number][] = [[120, 140, 1], [380, 110, 0.8], [420, 330, 1.1], [90, 360, 0.7], [250, 60, 0.6]];
  pts.forEach(([x, y, k], i) => {
    const s = k * Math.max(0, Math.sin(Math.PI * Math.min(1, t * 1.6 - i * 0.12))) * 70;
    if (s < 4) return;
    const st: P2[] = [];
    for (let j = 0; j < 8; j++) { const r = j % 2 ? s * 0.22 : s, a = rad(j * 45 - 90); st.push([x + r * Math.cos(a), y + r * Math.sin(a)]); }
    p.poly(st, "#fff3b0", 6);
  });
};
/** the receipt lying on the counter (512 x 700 canvas): abstract printed lines (no letters) + the signature scribble
 *  drawn up to u (0..1); the scribble is a loopy line that cannot read as letters */
export const scribblePt = (t: number): P2 => [90 + 330 * t + 26 * Math.sin(t * 34), 520 + 34 * Math.sin(t * 21) - 30 * Math.max(0, Math.sin(t * 34 + 1.2)) ** 3];
export const fxReceipt = (p: Pen, u: number) => {
  p.poly(rrect(10, 10, 502, 690, 8), "#f8f2e2", 6);
  p.poly(rrect(40, 40, 472, 110, 4), "#d9cfbb", 0);
  for (let i = 0; i < 6; i++) p.stroke([[60, 150 + i * 42], [i % 3 === 2 ? 300 : 450, 150 + i * 42]], 9, "#b3a993");
  p.stroke([[60, 600], [450, 600]], 4, "#8a8070");
  p.ell(400, 420, 42, 42, null, 5); // a blank stamp ring
  if (u > 0) {
    const pts: P2[] = [];
    for (let i = 0; i <= Math.round(120 * u); i++) pts.push(scribblePt(i / 120));
    p.stroke(pts, 9, "#1c1830");
    if (u >= 1) p.stroke(curve([110, 585], [270, 560], [440, 575], 12), 7, "#1c1830");
  }
};
/** the signing hand: coat sleeve from the top right down to an ink-dot hand holding a white quill whose tip is the
 *  bottom-left corner of the 400 x 800 canvas (60, 785) */
export const fxQuill = (p: Pen, sleeve: string, wob: number) => {
  p.band([[360, -20], [250, 400], [150, 640]], sleeve, 120, 10, "round");
  p.poly(rrect(105, 610, 210, 690, 30), mix(sleeve, "#b8323a", 0.0), 9);
  const tip: P2 = [60, 785], top: P2 = [10 + 16 * wob, 420];
  const ln = (k: number, side: number): P2 => { const x = tip[0] + (top[0] - tip[0]) * k, y = tip[1] + (top[1] - tip[1]) * k; return [x + side * 34 * Math.sin(Math.PI * Math.min(1, k * 1.25)), y]; };
  const fe: P2[] = [];
  for (let i = 0; i <= 12; i++) fe.push(ln(0.25 + (0.75 * i) / 12, -1));
  for (let i = 12; i >= 0; i--) fe.push(ln(0.25 + (0.75 * i) / 12, 0.55));
  p.poly(fe, "#fbfaf4", 8);
  p.stroke([tip, top], 7, "#cfc7b0");
  p.stroke([tip, ln(0.26, 0)], 9);
  p.dot(118, 668, 44);
};
/** the uniform alone on a tailor's dummy (design canvas 600 x 1000, base at y 975): tripod, pole, bust form, greatcoat
 *  with red collar and two rows of brass buttons, epaulettes, the peaked cap on the neck knob, the sabre at the hip */
export const dummyCard = (p: Pen, light = DEF_LIGHT) => {
  const COAT = "#6f8199", u = 2.36, thick = thickAngle(light);
  p.stroke([[300, 975], [300, 640]], 12, "#5a3b2a");
  for (const dx of [-90, 0, 90]) p.stroke([[300, 900], [300 + dx, 975]], 10, "#5a3b2a");
  p.ell(300, 975, 100, 10, "rgba(36,23,38,0.25)", 0);
  // coat skirt + bust
  const sk: P2[] = [[220, 560], [380, 560], [410, 790], [190, 790]];
  p.gradFill(sk, COAT, mul(COAT, SH_CLOTH), light); p.poly(sk, null, 10);
  p.stroke([[300, 600], [300, 790]], 4, "rgba(36,23,38,0.55)");
  const T: Blob = { a: 118, b: 170, nTop: 2.2, nBot: 2.6, egg: 0.12, asym: 0, rot: 0, noise: 0.006, seed: 7 };
  const tp = blobPts(300, 480, T);
  p.gradFill(tp, COAT, mul(COAT, SH_CLOTH), light);
  p.clip(tp, () => {
    p.poly(rrect(250, 300, 350, 345, 8), "#b8323a", 5);
    for (let i = 0; i < 5; i++) for (const dx of [-36, 36]) { p.dot(300 + dx, 370 + i * 52, 8, INK); p.dot(300 + dx, 370 + i * 52, 6, "#e0bc5a"); }
    p.band([[180, 560], [420, 560]], "#2c2830", 18, 4);
    p.poly(rrect(286, 550, 314, 570, 3), "#e0bc5a", 3);
  });
  p.inkRing(tp, 11, thick);
  for (const sd of [-1, 1]) p.ell(300 + sd * 98, 330, 34, 15, "#d8c08a", 5, 0, 360, sd * -12);
  // sleeves hanging
  for (const sd of [-1, 1]) p.band([[300 + sd * 112, 345], [300 + sd * 132, 520], [300 + sd * 126, 640]], COAT, 34, 9, "round");
  // sabre
  p.band(curve([226, 560], [212, 690], [196, 840]), "#9aa2ac", 13, 4, "round");
  p.arc(232, 548, 18, 22, 160, 380, 6, "#d8b04a");
  // neck knob + cap
  p.ell(300, 286, 20, 14, "#b08a5a", 5);
  p.ell(300, 268, 64, 14, "#16171b", 6, 0, 180);
  p.poly(rrect(244, 226, 356, 268, 6), "#b8323a", 8);
  p.ell(300, 222, 88, 30, "#3b4560", 8);
  p.ell(300, 216, 70, 14, mul("#3b4560", [1.15, 1.15, 1.12]), 0, 180, 360);
  void u;
};
