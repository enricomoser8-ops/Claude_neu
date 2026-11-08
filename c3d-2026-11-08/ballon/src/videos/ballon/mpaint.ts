// Painted textures for the Mauer short (Canvas2D, cached via ctex): the Wall (graffiti west face as abstract colour
// shapes only, plain east face), raked sand, asphalt, pavement, patrol-road plates, East apartment blocks and West
// old buildings (colour + a matching night-window glow mask), press-room surfaces, barrier stripes, the calendar.
// No letters anywhere: the only writing in the film is the "10" on the calendar page.
import * as THREE from "three";
import { ctex, jit } from "./paint";

type G = CanvasRenderingContext2D;
type R = () => number;
const U = (r: R, a: number, b: number) => a + (b - a) * r();
const TAU = Math.PI * 2;
const pick = <T,>(r: R, a: T[]) => a[Math.floor(r() * a.length) % a.length];
const INK = "#241726";

const speckle = (g: G, r: R, W: number, H: number, n: number, cols: string[], s0 = 1, s1 = 3) => {
  for (let i = 0; i < n; i++) { g.fillStyle = pick(r, cols); const s = U(r, s0, s1); g.fillRect(U(r, 0, W), U(r, 0, H), s, s); }
};
const blot = (g: G, x: number, y: number, rad: number, col: string, a: number, sx = 1) => {
  g.save(); g.translate(x, y); g.scale(sx, 1);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, rad);
  const c = new THREE.Color(col);
  const rgb = `${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)}`;
  gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(-rad, -rad, rad * 2, rad * 2); g.restore();
};

// ---------------- the Wall ----------------
const CONCRETE = "#cfcbc2";
/** west face: 4096 x 640 px = 24 m x 3.75 m (170 px/m). Slab seams every 1.2 m; dense abstract graffiti low down
 *  (bubbles, stars, zig-zags, hearts, spirals, swooshes, dots, cartoon blob faces), sparse higher up. */
export const graffitiTex = () => ctex("mGraffiti", 4096, 640, (g, r) => {
  const W = 4096, H = 640, PX = W / 24, seam = 1.2 * PX;
  g.fillStyle = CONCRETE; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 260; i++) blot(g, U(r, 0, W), U(r, 0, H), U(r, 20, 90), pick(r, ["#bdb8ae", "#dcd8cf", "#b5afa4"]), 0.35, U(r, 0.6, 1.6));
  speckle(g, r, W, H, 9000, ["rgba(90,80,70,0.25)", "rgba(255,255,255,0.35)"], 1, 3);
  const COLS = ["#e8443a", "#f6c443", "#3a8fd8", "#4cb86a", "#e86fb0", "#8a5cd0", "#f08a2c", "#39c0c4", "#f4f0e6", "#2f3fa0"];
  const yOf = (u: number) => H - u * PX; // u = metres above the ground
  const outline = (w: number) => { g.lineWidth = w; g.strokeStyle = INK; g.lineJoin = "round"; g.lineCap = "round"; g.stroke(); };
  const shapes = 300;
  for (let i = 0; i < shapes; i++) {
    const hm = Math.min(3.05, Math.abs(U(r, -0.2, 1) * U(r, 0.3, 1)) * 3.4 + 0.25); // mostly low
    const x = U(r, 0, W), y = yOf(hm), s = U(r, 0.25, 0.75) * PX * (hm > 2.3 ? 0.7 : 1);
    const c1 = pick(r, COLS), c2 = pick(r, COLS), k = Math.floor(r() * 9);
    for (const ox of [0, -W, W]) {
      const X = x + ox;
      if (X < -2 * s || X > W + 2 * s) continue;
      g.save(); g.translate(X, y); g.rotate(U(r, -0.4, 0.4));
      if (k === 0) { // bubble cluster
        for (let j = 0; j < 4; j++) { g.beginPath(); g.ellipse((j - 1.5) * s * 0.55, U(r, -0.15, 0.15) * s, s * 0.42, s * 0.5, 0, 0, TAU); g.fillStyle = j % 2 ? c1 : c2; g.fill(); outline(5); }
        g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(-s * 0.9, -s * 0.2, s * 0.08, s * 0.14, -0.4, 0, TAU); g.fill();
      } else if (k === 1) { // star
        g.beginPath(); for (let j = 0; j < 10; j++) { const a = (j * TAU) / 10 - Math.PI / 2, rr = j % 2 ? s * 0.28 : s * 0.62; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
        g.closePath(); g.fillStyle = c1; g.fill(); outline(6);
      } else if (k === 2) { // soft wave band (no sharp zig-zags: they read as letters)
        g.beginPath(); for (let j = 0; j <= 40; j++) g.lineTo(-s * 1.2 + j * s * 0.06, Math.sin(j * 0.31) * s * 0.28);
        g.lineWidth = s * 0.22 + 10; g.strokeStyle = INK; g.lineJoin = "round"; g.lineCap = "round"; g.stroke(); g.lineWidth = s * 0.22; g.strokeStyle = c1; g.stroke();
      } else if (k === 3) { // heart
        g.beginPath(); g.moveTo(0, s * 0.5); g.bezierCurveTo(-s * 0.9, -s * 0.1, -s * 0.4, -s * 0.75, 0, -s * 0.25);
        g.bezierCurveTo(s * 0.4, -s * 0.75, s * 0.9, -s * 0.1, 0, s * 0.5); g.fillStyle = c1; g.fill(); outline(6);
      } else if (k === 4) { // spiral
        g.beginPath(); for (let t = 0; t < 14; t += 0.2) g.lineTo(Math.cos(t) * t * s * 0.045, Math.sin(t) * t * s * 0.045);
        g.lineWidth = 14; g.strokeStyle = INK; g.stroke(); g.lineWidth = 8; g.strokeStyle = c1; g.stroke();
      } else if (k === 5) { // swoosh / arrow
        g.beginPath(); g.moveTo(-s, s * 0.2); g.quadraticCurveTo(0, -s * 0.7, s, s * 0.05); g.lineTo(s * 0.75, -s * 0.25); g.moveTo(s, s * 0.05); g.lineTo(s * 0.62, s * 0.22);
        g.lineWidth = s * 0.16 + 10; g.strokeStyle = INK; g.stroke(); g.lineWidth = s * 0.16; g.strokeStyle = c1; g.stroke();
      } else if (k === 6) { // blob face (cartoon, no letters)
        g.beginPath(); g.ellipse(0, 0, s * 0.55, s * 0.5, 0, 0, TAU); g.fillStyle = c1; g.fill(); outline(6);
        g.fillStyle = INK; for (const e of [-1, 1]) { g.beginPath(); g.ellipse(e * s * 0.18, -s * 0.08, s * 0.06, s * 0.09, 0, 0, TAU); g.fill(); }
        g.beginPath(); g.arc(0, s * 0.08, s * 0.22, 0.2, Math.PI - 0.2); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
      } else if (k === 7) { // dots
        for (let j = 0; j < 7; j++) { g.beginPath(); g.arc(U(r, -s, s), U(r, -s * 0.5, s * 0.5), s * U(r, 0.08, 0.16), 0, TAU); g.fillStyle = pick(r, COLS); g.fill(); outline(4); }
      } else { // flat colour patch with a drip
        g.beginPath(); g.ellipse(0, 0, s * 0.9, s * 0.38, 0, 0, TAU); g.fillStyle = c2; g.fill();
        g.fillRect(-s * 0.1, 0, s * 0.08, s * 0.7); g.beginPath(); g.arc(-s * 0.06, s * 0.7, s * 0.05, 0, TAU); g.fill();
        outline(4);
      }
      g.restore();
    }
  }
  // paint weathering + slab seams on top of the paint
  for (let i = 0; i < 140; i++) blot(g, U(r, 0, W), U(r, 0, H), U(r, 30, 120), "#cfcbc2", 0.28, U(r, 0.6, 1.4));
  for (let x = 0; x < W + 1; x += seam) { g.fillStyle = "rgba(60,50,45,0.55)"; g.fillRect(x - 2, 0, 4, H); g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(x + 2, 0, 2, H); }
  g.fillStyle = "rgba(60,50,45,0.25)"; g.fillRect(0, 0, W, 6);
});
/** east face (towards the death strip): plain, whitewashed concrete, 1.2 m slab per 256 px tile */
export const wallEastTex = () => ctex("mWallEast", 256, 800, (g, r) => {
  g.fillStyle = "#e3e0d8"; g.fillRect(0, 0, 256, 800);
  for (let i = 0; i < 18; i++) blot(g, U(r, 0, 256), U(r, 0, 800), U(r, 15, 60), pick(r, ["#cfcbc2", "#d8d4cb"]), 0.4);
  for (let i = 0; i < 6; i++) { const x = U(r, 10, 246); g.fillStyle = "rgba(120,110,100,0.12)"; g.fillRect(x, U(r, 400, 700), U(r, 3, 8), U(r, 60, 200)); }
  speckle(g, r, 256, 800, 600, ["rgba(90,80,70,0.2)", "rgba(255,255,255,0.4)"]);
  g.fillStyle = "rgba(60,50,45,0.5)"; g.fillRect(0, 0, 3, 800); g.fillRect(253, 0, 3, 800);
});
export const concreteTex = (key = "mConcrete", base = "#d4d0c6") => ctex(key, 512, 512, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 30; i++) blot(g, U(r, 0, 512), U(r, 0, 512), U(r, 20, 80), pick(r, ["#bdb8ae", "#e2ded6"]), 0.35);
  speckle(g, r, 512, 512, 1500, ["rgba(90,80,70,0.2)", "rgba(255,255,255,0.35)"]);
});

// ---------------- ground ----------------
/** raked sand of the death strip: 1024 px = 8 m, rake lines parallel to the wall (along u) */
export const sandTex = () => ctex("mSand", 1024, 1024, (g, r) => {
  g.fillStyle = "#dcc59a"; g.fillRect(0, 0, 1024, 1024);
  for (let y = 0; y < 1024; y += 16) {
    const wob = U(r, -1.5, 1.5);
    g.fillStyle = "rgba(150,115,70,0.32)"; g.fillRect(0, y + wob, 1024, 4);
    g.fillStyle = "rgba(255,245,215,0.35)"; g.fillRect(0, y + 5 + wob, 1024, 3);
  }
  for (let i = 0; i < 40; i++) blot(g, U(r, 0, 1024), U(r, 0, 1024), U(r, 40, 140), pick(r, ["#cdb489", "#e6d2aa"]), 0.4, 2);
  speckle(g, r, 1024, 1024, 2500, ["rgba(120,90,60,0.35)", "rgba(255,250,230,0.5)"], 1, 2.5);
});
export const asphaltTex = () => ctex("mAsphalt", 1024, 1024, (g, r) => {
  g.fillStyle = "#6c6f7c"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 40; i++) blot(g, U(r, 0, 1024), U(r, 0, 1024), U(r, 40, 160), pick(r, ["#5f6271", "#787b88"]), 0.45);
  speckle(g, r, 1024, 1024, 6000, ["rgba(40,40,50,0.35)", "rgba(200,200,210,0.3)"], 1, 2.5);
  for (let i = 0; i < 6; i++) { // tar crack lines
    g.strokeStyle = "rgba(35,35,45,0.5)"; g.lineWidth = 2.5; g.beginPath();
    let x = U(r, 0, 1024), y = U(r, 0, 1024); g.moveTo(x, y);
    for (let j = 0; j < 8; j++) { x += U(r, -40, 40); y += U(r, 10, 40); g.lineTo(x, y); }
    g.stroke();
  }
});
/** pavement: 0.5 m concrete slabs, 1024 px = 4 m */
export const pavementTex = () => ctex("mPavement", 1024, 1024, (g, r) => {
  g.fillStyle = "#8f877c"; g.fillRect(0, 0, 1024, 1024);
  const S = 128;
  for (let y = 0; y < 1024; y += S) for (let x = 0; x < 1024; x += S) {
    g.fillStyle = jit(r, "#c4bcaf", 0.06, 3, 0.1); g.fillRect(x + 3, y + 3, S - 6, S - 6);
    g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(x + 3, y + 3, S - 6, 4);
  }
  speckle(g, r, 1024, 1024, 2500, ["rgba(90,80,70,0.25)", "rgba(255,255,255,0.3)"]);
});
/** patrol road: 2 x 3 m concrete plates, 1024 px = 6 m */
export const plateTex = () => ctex("mPlates", 1024, 1024, (g, r) => {
  g.fillStyle = "#7d786f"; g.fillRect(0, 0, 1024, 1024);
  for (let y = 0; y < 1024; y += 512) for (let x = 0; x < 1024; x += 341.33) {
    g.fillStyle = jit(r, "#b9b3a7", 0.05, 3, 0.1); g.fillRect(x + 4, y + 4, 333, 504);
  }
  for (let i = 0; i < 30; i++) blot(g, U(r, 0, 1024), U(r, 0, 1024), U(r, 30, 100), "#9d978c", 0.35);
  speckle(g, r, 1024, 1024, 2000, ["rgba(90,80,70,0.25)", "rgba(255,255,255,0.3)"]);
});

// ---------------- buildings ----------------
export type Tex2 = { map: THREE.CanvasTexture; glow: THREE.CanvasTexture };
const glowCols = ["#ffcf7a", "#ffd98f", "#ffe0a8", "#ffc26a", "#f7e3b8", "#bfe0ff"];
/** East Berlin "Plattenbau" (panel building): tile = 8 bays (3.6 m) x 6 floors (2.8 m) = 28.8 x 16.8 m at 60 px/m.
 *  Panel joints, ribbon of windows, coloured loggia panels; glow = the same windows, ~40 % lit warm at night. */
export const plattenTex = (pal: number): Tex2 => {
  const PX = 60, BW = 3.6 * PX, FH = 2.8 * PX, W = Math.round(8 * BW), H = Math.round(6 * FH);
  const P = [
    { wall: "#c9c1b0", panel: "#b3aa97", accent: "#d9a35a" },
    { wall: "#bfc0b8", panel: "#a9aba2", accent: "#6f9fb3" },
    { wall: "#d1c5ad", panel: "#bcae94", accent: "#c97b5a" },
  ][pal % 3];
  const lit: boolean[] = [];
  const map = ctex("mPlatten" + pal, W, H, (g, r) => {
    g.fillStyle = P.wall; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) blot(g, U(r, 0, W), U(r, 0, H), U(r, 30, 120), pick(r, [P.panel, "#ddd6c8"]), 0.3);
    for (let fl = 0; fl < 6; fl++) for (let b = 0; b < 8; b++) {
      const x = b * BW, y = fl * FH, loggia = b % 4 === 1 || b % 4 === 2;
      if (loggia) { g.fillStyle = jit(r, P.accent, 0.05, 2, 0.08); g.fillRect(x + 0.15 * PX, y + 1.55 * PX, BW - 0.3 * PX, 1.0 * PX); }
      const wx = x + 0.55 * PX, wy = y + 0.5 * PX, ww = BW - 1.1 * PX, wh = 1.35 * PX;
      g.fillStyle = "#5a6698"; g.fillRect(wx, wy, ww, wh);
      const gl = g.createLinearGradient(wx, wy, wx + ww, wy + wh); gl.addColorStop(0, "#8d9cd0"); gl.addColorStop(1, "#4f5a92");
      g.fillStyle = gl; g.fillRect(wx, wy, ww, wh);
      if (r() < 0.4) { g.fillStyle = pick(r, ["#f3e3c6", "#f5c4c8", "#e8eef0"]); g.fillRect(wx, wy, ww * 0.25, wh); g.fillRect(wx + ww * 0.75, wy, ww * 0.25, wh); }
      g.fillStyle = "#efeae0"; g.fillRect(wx + ww / 2 - 3, wy, 6, wh); g.fillRect(wx - 4, wy - 4, ww + 8, 4); g.fillRect(wx - 6, wy + wh, ww + 12, 7);
      g.strokeStyle = "rgba(50,45,55,0.5)"; g.lineWidth = 2; g.strokeRect(wx, wy, ww, wh);
      lit.push(r() < 0.42);
    }
    g.fillStyle = "rgba(70,62,58,0.45)"; // panel joints
    for (let fl = 0; fl <= 6; fl++) g.fillRect(0, fl * FH - 2, W, 4);
    for (let b = 0; b <= 8; b++) g.fillRect(b * BW - 2, 0, 4, H);
  });
  const glow = ctex("mPlattenG" + pal, W / 2, H / 2, (g, r) => {
    g.fillStyle = "#000"; g.fillRect(0, 0, W / 2, H / 2);
    const k = 0.5;
    let i = 0;
    for (let fl = 0; fl < 6; fl++) for (let b = 0; b < 8; b++, i++) {
      if (!lit[i]) continue;
      const wx = (b * BW + 0.55 * PX) * k, wy = (fl * FH + 0.5 * PX) * k, ww = (BW - 1.1 * PX) * k, wh = 1.35 * PX * k;
      g.fillStyle = pick(r, glowCols); g.fillRect(wx, wy, ww, wh);
      g.fillStyle = "rgba(0,0,0,0.5)"; g.fillRect(wx + ww / 2 - 2, wy, 4, wh);
    }
  });
  return { map, glow };
};
/** West Berlin "Altbau" (old tenement): tile = 4 bays (3.2 m) wide, full height 18 m (shop floor 4 m + 4 x 3.5 m),
 *  plaster colour, window surrounds, cornice band painted, a lit shop front. */
export const altbauTex = (col: string): Tex2 => {
  const PX = 64, BW = 3.2 * PX, W = Math.round(4 * BW), H = Math.round(18 * PX);
  const lit: boolean[] = [];
  const trim = new THREE.Color(col).lerp(new THREE.Color("#fff8ec"), 0.55).getStyle();
  const map = ctex("mAltbau" + col, W, H, (g, r) => {
    g.fillStyle = col; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 30; i++) blot(g, U(r, 0, W), U(r, 0, H), U(r, 30, 140), pick(r, ["#ffffff", "#7a6a5a"]), 0.12);
    // ground floor: shop fronts
    const gy = H - 4 * PX;
    g.fillStyle = new THREE.Color(col).multiplyScalar(0.8).getStyle(); g.fillRect(0, gy, W, 4 * PX);
    for (let b = 0; b < 4; b++) {
      const x = b * BW + 0.3 * PX, w = BW - 0.6 * PX;
      if (b === 1) { g.fillStyle = "#5a3b2a"; g.fillRect(x + w * 0.25, gy + 1.0 * PX, w * 0.5, 3.0 * PX); g.fillStyle = "#3a2618"; g.fillRect(x + w * 0.25 + 6, gy + 1.0 * PX + 6, w * 0.5 - 12, 3.0 * PX - 6); continue; }
      const gl = g.createLinearGradient(x, gy, x, gy + 3 * PX); gl.addColorStop(0, "#7c8bc4"); gl.addColorStop(1, "#4b5590");
      g.fillStyle = gl; g.fillRect(x, gy + 0.7 * PX, w, 2.6 * PX);
      g.fillStyle = pick(r, ["#c8453a", "#2f7a5a", "#2f5f9a", "#d99a2a"]); g.fillRect(x - 6, gy + 0.35 * PX, w + 12, 0.35 * PX); // awning band (no lettering)
      g.strokeStyle = "rgba(40,30,30,0.55)"; g.lineWidth = 3; g.strokeRect(x, gy + 0.7 * PX, w, 2.6 * PX);
      lit.push(true);
    }
    // upper floors
    for (let fl = 0; fl < 4; fl++) for (let b = 0; b < 4; b++) {
      const y0 = gy - (fl + 1) * 3.5 * PX, x = b * BW + 0.9 * PX, w = BW - 1.8 * PX, wy = y0 + 0.9 * PX, wh = 2.0 * PX;
      g.fillStyle = trim; g.fillRect(x - 10, wy - 10, w + 20, wh + 20);
      g.fillRect(x - 16, wy - 26, w + 32, 12); // hood
      const gl = g.createLinearGradient(x, wy, x + w, wy + wh); gl.addColorStop(0, "#8d9cdb"); gl.addColorStop(1, "#5761a8");
      g.fillStyle = gl; g.fillRect(x, wy, w, wh);
      if (r() < 0.45) { g.fillStyle = pick(r, ["#f5c4c8", "#f3e3c6", "#d7e6cf", "#ffffff"]); g.beginPath(); g.moveTo(x, wy); g.lineTo(x + w * 0.4, wy); g.lineTo(x, wy + wh * 0.8); g.fill(); g.beginPath(); g.moveTo(x + w, wy); g.lineTo(x + w * 0.6, wy); g.lineTo(x + w, wy + wh * 0.8); g.fill(); }
      g.fillStyle = "#f7f2e8"; g.fillRect(x + w / 2 - 3, wy, 6, wh); g.fillRect(x, wy + wh * 0.38, w, 5);
      g.strokeStyle = "rgba(60,45,40,0.55)"; g.lineWidth = 2; g.strokeRect(x - 10, wy - 10, w + 20, wh + 20);
      g.fillStyle = "rgba(60,45,40,0.35)"; g.fillRect(x - 14, wy + wh + 10, w + 28, 6);
      lit.push(r() < 0.5);
    }
    // cornice band at the top and string courses
    g.fillStyle = trim; g.fillRect(0, 0, W, 0.5 * PX); g.fillRect(0, gy - 0.25 * PX, W, 0.25 * PX);
    g.fillStyle = "rgba(60,45,40,0.4)"; g.fillRect(0, 0.5 * PX, W, 5); g.fillRect(0, gy, W, 4);
  });
  const glow = ctex("mAltbauG" + col, W / 2, H / 2, (g, r) => {
    g.fillStyle = "#000"; g.fillRect(0, 0, W / 2, H / 2);
    const k = 0.5, gy = H - 4 * PX;
    let i = 0;
    for (let b = 0; b < 4; b++) {
      if (b === 1) continue;
      const x = b * BW + 0.3 * PX, w = BW - 0.6 * PX;
      if (lit[i++]) { g.fillStyle = "#ffd28a"; g.fillRect(x * k, (gy + 0.7 * PX) * k, w * k, 2.6 * PX * k); }
    }
    for (let fl = 0; fl < 4; fl++) for (let b = 0; b < 4; b++) {
      const y0 = gy - (fl + 1) * 3.5 * PX, x = b * BW + 0.9 * PX, w = BW - 1.8 * PX, wy = y0 + 0.9 * PX, wh = 2.0 * PX;
      if (lit[i++]) { g.fillStyle = pick(r, glowCols); g.fillRect(x * k, wy * k, w * k, wh * k); g.fillStyle = "rgba(0,0,0,0.6)"; g.fillRect((x + w / 2 - 3) * k, wy * k, 6 * k, wh * k); }
    }
  });
  return { map, glow };
};
export const roofTex = () => ctex("mRoof", 512, 512, (g, r) => {
  g.fillStyle = "#6f5f66"; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 32) { g.fillStyle = "rgba(30,20,30,0.3)"; g.fillRect(0, y, 512, 3); }
  for (let i = 0; i < 20; i++) blot(g, U(r, 0, 512), U(r, 0, 512), U(r, 30, 90), pick(r, ["#7d6d72", "#5f5258"]), 0.4);
});

// ---------------- press room ----------------
export const carpetTex = () => ctex("mCarpet", 512, 512, (g, r) => {
  g.fillStyle = "#8a5a44"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 30; i++) blot(g, U(r, 0, 512), U(r, 0, 512), U(r, 30, 90), pick(r, ["#7a4d3a", "#9a6650"]), 0.35);
  speckle(g, r, 512, 512, 6000, ["rgba(60,30,20,0.25)", "rgba(255,220,190,0.18)"], 1, 2);
  g.strokeStyle = "rgba(60,30,20,0.25)"; g.lineWidth = 3;
  for (let x = 0; x <= 512; x += 128) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); }
});
/** room wall: wood panelling up to 1.2 m, warm wallpaper with soft stripes above; 1024 px = 4 m wide x 4.4 m high */
export const roomWallTex = () => ctex("mRoomWall", 1024, 1126, (g, r) => {
  const PX = 256, H = 1126, pan = H - 1.2 * PX;
  g.fillStyle = "#e9d7b4"; g.fillRect(0, 0, 1024, pan);
  for (let x = 0; x < 1024; x += 64) { g.fillStyle = "rgba(190,150,100,0.18)"; g.fillRect(x, 0, 24, pan); }
  for (let i = 0; i < 16; i++) blot(g, U(r, 0, 1024), U(r, 0, pan), U(r, 60, 200), "#c9a87a", 0.12);
  g.fillStyle = "#9a6a42"; g.fillRect(0, pan, 1024, H - pan);
  for (let x = 0; x < 1024; x += 128) { g.fillStyle = "#a8774c"; g.fillRect(x + 10, pan + 22, 108, H - pan - 44); g.strokeStyle = "rgba(60,35,20,0.5)"; g.lineWidth = 3; g.strokeRect(x + 10, pan + 22, 108, H - pan - 44); }
  g.fillStyle = "#7a5032"; g.fillRect(0, pan - 10, 1024, 14);
  g.fillStyle = "#e8dcc4"; g.fillRect(0, 0, 1024, 18);
});
/** heavy curtain behind the officials: vertical folds */
export const curtainTex = () => ctex("mCurtain", 1024, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, "#2f7f8f"); gr.addColorStop(0.6, "#3a95a2"); gr.addColorStop(1, "#2a6c7a");
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
  for (let x = 0; x < 1024; x++) {
    const s = Math.sin((x / 1024) * TAU * 8);
    g.fillStyle = s > 0 ? `rgba(200,250,250,${0.2 * s})` : `rgba(5,30,45,${-0.3 * s})`; g.fillRect(x, 0, 1, 512);
  }
});
export const clothTex = () => ctex("mCloth", 1024, 256, (g) => {
  g.fillStyle = "#efe7d6"; g.fillRect(0, 0, 1024, 256);
  for (let x = 0; x < 1024; x++) {
    const s = Math.sin((x / 1024) * TAU * 14);
    g.fillStyle = s > 0 ? `rgba(255,255,255,${0.2 * s})` : `rgba(120,100,80,${-0.16 * s})`; g.fillRect(x, 30, 1, 226);
  }
  g.fillStyle = "#d9cdb4"; g.fillRect(0, 0, 1024, 30);
});
export const woodTex = () => ctex("mWood", 512, 512, (g, r) => {
  g.fillStyle = "#8a5a36"; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 6) { g.fillStyle = `rgba(${r() < 0.5 ? "60,35,20" : "200,150,100"},${U(r, 0.05, 0.18)})`; g.fillRect(0, y, 512, U(r, 2, 5)); }
});
/** barrier boom: red / white stripes (no lettering) along u */
export const boomTex = () => ctex("mBoom", 512, 32, (g) => {
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#f2eee6" : "#d23a32"; g.fillRect(i * 64, 0, 64, 32); }
});
/** the calendar page: red header band, a big "10" (the only writing in the film), faint ruled footer */
export const calendarPage = () => ctex("mCal10", 512, 640, (g) => {
  g.fillStyle = "#fbf7ee"; g.fillRect(0, 0, 512, 640);
  g.fillStyle = "#c8323a"; g.fillRect(0, 0, 512, 120);
  g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(0, 100, 512, 8);
  g.fillStyle = "#2a1f2e"; g.font = "bold 330px 'DejaVu Sans', Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText("10", 256, 390);
  g.fillStyle = "rgba(60,50,60,0.25)"; for (let i = 0; i < 3; i++) g.fillRect(90, 560 + i * 18, 332, 4);
  g.strokeStyle = "rgba(60,50,60,0.6)"; g.lineWidth = 6; g.strokeRect(3, 3, 506, 634);
});
/** back of a torn page: blank paper with a soft shade */
export const pageBack = () => ctex("mCalBack", 256, 320, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 320); gr.addColorStop(0, "#f2ece0"); gr.addColorStop(1, "#e6dece");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 320);
  g.strokeStyle = "rgba(60,50,60,0.6)"; g.lineWidth = 4; g.strokeRect(2, 2, 252, 316);
});
/** a sheet of typed paper (grey scribble lines, no letters) */
export const sheetTex = () => ctex("mSheet", 256, 360, (g, r) => {
  g.fillStyle = "#fbf8f0"; g.fillRect(0, 0, 256, 360);
  for (let i = 0; i < 14; i++) { const y = 40 + i * 21, w = i % 5 === 4 ? U(r, 60, 120) : U(r, 150, 190); g.fillStyle = "#9097a6"; g.fillRect(30, y, w, 5); }
  g.strokeStyle = "rgba(60,50,60,0.55)"; g.lineWidth = 4; g.strokeRect(2, 2, 252, 356);
});
/** muted lawn for the death strip (8 m tile): olive base, darker and drier patches, mown stripes */
export const lawnTex = () => ctex("mLawn", 1024, 1024, (g, r) => {
  g.fillStyle = "#7f9a58"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 70; i++) blot(g, U(r, 0, 1024), U(r, 0, 1024), U(r, 40, 180), pick(r, ["#6c8a4c", "#93a862", "#a4a86a", "#5f7d46"]), 0.4);
  for (let y = 0; y < 1024; y += 128) { g.fillStyle = "rgba(255,255,230,0.06)"; g.fillRect(0, y, 1024, 64); }
  speckle(g, r, 1024, 1024, 9000, ["rgba(40,60,30,0.35)", "rgba(210,220,160,0.3)"], 1, 3);
});
