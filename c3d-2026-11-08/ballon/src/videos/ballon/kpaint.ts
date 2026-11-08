// Painted textures for the Köpenick short (Canvas2D, cached via ctex): the red-brick town hall with sandstone
// window surrounds, wallpapers (warm, office green, shabby peeling), wainscot panels, book spines, ledger pigeonholes,
// abstract paintings, posters (colour shapes only), stripes for awnings / carousel / booths, the stage curtain, the
// clock face (ticks only), bunting. NO letters or numbers anywhere.
import * as THREE from "three";
import { ctex, jit } from "./paint";

type G = CanvasRenderingContext2D;
type R = () => number;
const U = (r: R, a: number, b: number) => a + (b - a) * r();
const pick = <T,>(r: R, a: T[]) => a[Math.floor(r() * a.length) % a.length];
const TAU = Math.PI * 2;
const blot = (g: G, x: number, y: number, rad: number, col: string, a: number, sx = 1) => {
  g.save(); g.translate(x, y); g.scale(sx, 1);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, rad);
  const c = new THREE.Color(col);
  const rgb = `${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)}`;
  gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(-rad, -rad, rad * 2, rad * 2); g.restore();
};
const BRICKS = ["#b5553a", "#a94d36", "#bf6042", "#9e4632", "#c26a48"];
const bricks = (g: G, r: R, W: number, H: number, PX: number) => {
  g.fillStyle = "#e3cdb0"; g.fillRect(0, 0, W, H);
  const bw = 0.26 * PX, bh = 0.09 * PX;
  for (let y = 0, row = 0; y < H; y += bh, row++) for (let x = -(row % 2) * bw / 2; x < W; x += bw) {
    g.fillStyle = jit(r, pick(r, BRICKS), 0.07, 3, 0.1); g.fillRect(x + 1, y + 1, bw - 2, bh - 2);
  }
  for (let i = 0; i < (W * H) / (PX * PX * 6); i++) blot(g, U(r, 0, W), U(r, 0, H), U(r, 0.4, 1.4) * PX, "#5a3020", U(r, 0.05, 0.1), 1.4);
};
const SAND = "#ead9b6";
/** arched window with sandstone surround, blue glass, mullions (x0, y0 top-left of the opening) */
const archWin = (g: G, x0: number, y0: number, w: number, h: number, PX: number, curtain: string | null) => {
  const tr = 0.14 * PX, ar = w / 2;
  const path = (k: number) => { g.beginPath(); g.moveTo(x0 - k, y0 + h + k); g.lineTo(x0 - k, y0 + ar); g.arc(x0 + w / 2, y0 + ar, ar + k, Math.PI, 0); g.lineTo(x0 + w + k, y0 + h + k); g.closePath(); };
  path(tr); g.fillStyle = SAND; g.fill(); g.strokeStyle = "rgba(60,40,30,0.55)"; g.lineWidth = 2; g.stroke();
  // keystone
  g.fillStyle = "#f2e4c4"; g.fillRect(x0 + w / 2 - 0.1 * PX, y0 - tr - 0.06 * PX, 0.2 * PX, 0.3 * PX);
  g.strokeRect(x0 + w / 2 - 0.1 * PX, y0 - tr - 0.06 * PX, 0.2 * PX, 0.3 * PX);
  path(0); const gl = g.createLinearGradient(0, y0, 0, y0 + h); gl.addColorStop(0, "#9aa8de"); gl.addColorStop(1, "#5761a8"); g.fillStyle = gl; g.fill();
  g.save(); path(0); g.clip();
  if (curtain) { g.fillStyle = curtain; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + w * 0.4, y0); g.lineTo(x0, y0 + h * 0.8); g.fill(); g.beginPath(); g.moveTo(x0 + w, y0); g.lineTo(x0 + w * 0.6, y0); g.lineTo(x0 + w, y0 + h * 0.8); g.fill(); }
  g.fillStyle = "rgba(255,255,255,0.45)";
  g.save(); g.translate(x0 + w * 0.3, y0 + h * 0.5); g.rotate(Math.PI / 4); g.fillRect(-0.035 * PX, -h, 0.07 * PX, h * 2); g.restore();
  g.fillStyle = "#f4ecdc"; g.fillRect(x0 + w / 2 - 0.025 * PX, y0, 0.05 * PX, h); g.fillRect(x0, y0 + ar, w, 0.05 * PX); g.fillRect(x0, y0 + h * 0.66, w, 0.04 * PX);
  g.restore();
  path(0); g.strokeStyle = "rgba(50,35,30,0.7)"; g.lineWidth = 2; g.stroke();
  g.fillStyle = SAND; g.fillRect(x0 - tr - 0.08 * PX, y0 + h + tr - 0.02 * PX, w + 2 * tr + 0.16 * PX, 0.12 * PX); // sill
  g.fillStyle = "rgba(60,40,30,0.35)"; g.fillRect(x0 - tr - 0.08 * PX, y0 + h + tr + 0.1 * PX, w + 2 * tr + 0.16 * PX, 0.04 * PX);
};
/** town hall front: red brick, 3 floors of arched windows (bays every 2.6 m), sandstone string courses, plinth.
 *  wm x hm metres; `gap` = [x0, x1] metres left plain (behind the tower) */
export const rathausTex = (key: string, wm: number, hm: number, gap?: [number, number]) => {
  const PX = Math.min(64, 2048 / Math.max(wm, hm)), W = Math.round(wm * PX), H = Math.round(hm * PX), m = (v: number) => v * PX;
  return ctex("rh" + key, W, H, (g, r) => {
    bricks(g, r, W, H, PX);
    const floors = [{ y: 0.9, h: 2.5, w: 1.25 }, { y: 4.6, h: 2.4, w: 1.2 }, { y: 8.2, h: 2.0, w: 1.05 }].filter((f) => f.y + f.h < hm - 0.6);
    for (const fl of [0.75, 4.25, 7.85]) if (fl < hm - 0.5) { g.fillStyle = SAND; g.fillRect(0, H - m(fl) - m(0.18), W, m(0.18)); g.fillStyle = "rgba(60,40,30,0.4)"; g.fillRect(0, H - m(fl), W, 2); }
    g.fillStyle = "#c9b48e"; g.fillRect(0, H - m(0.75), W, m(0.75)); // stone plinth
    g.fillStyle = "rgba(60,40,30,0.25)"; for (let x = 0; x < W; x += m(0.6)) g.fillRect(x, H - m(0.75), 2, m(0.75));
    g.fillStyle = SAND; g.fillRect(0, 0, W, m(0.5)); g.fillStyle = "rgba(60,40,30,0.45)"; g.fillRect(0, m(0.5), W, 3); // cornice band
    const n = Math.max(1, Math.round(wm / 2.6));
    for (const fl of floors) for (let i = 0; i < n; i++) {
      const cx = ((i + 0.5) * wm) / n;
      if (gap && cx > gap[0] - 0.9 && cx < gap[1] + 0.9) continue;
      archWin(g, m(cx - fl.w / 2), H - m(fl.y + fl.h), m(fl.w), m(fl.h), PX, r() < 0.4 ? pick(r, ["#f3e3c6", "#f5d4c8", "#e8eef0"]) : null);
    }
  });
};
/** clock tower shaft: brick with sandstone quoins and one tall arched window per face */
export const towerTex = (wm: number, hm: number, win = true) => {
  const PX = Math.min(48, 2048 / hm), W = Math.round(wm * PX), H = Math.round(hm * PX), m = (v: number) => v * PX;
  return ctex(`rhTower${wm}_${hm}_${win}`, W, H, (g, r) => {
    bricks(g, r, W, H, PX);
    for (let y = 0, k = 0; y < H; y += m(0.45), k++) { g.fillStyle = SAND; const w = m(k % 2 ? 0.45 : 0.7); g.fillRect(0, y, w, m(0.42)); g.fillRect(W - w, y, w, m(0.42)); }
    for (const fy of [0.75, 4.25, 7.85, 11.5]) if (fy < hm) { g.fillStyle = SAND; g.fillRect(0, H - m(fy) - m(0.18), W, m(0.18)); }
    if (win) for (const [y, h] of [[4.9, 2.2], [8.4, 2.2]] as const) if (y + h < hm - 1) archWin(g, W / 2 - m(0.55), H - m(y + h), m(1.1), m(h), PX, null);
  });
};
/** clock face: cream disc, dark ring, 12 tick marks, two hands (NO numerals) */
export const clockFaceTex = () => ctex("kClock", 512, 512, (g) => {
  g.fillStyle = "#f6efdc"; g.strokeStyle = "#2a2430"; g.lineWidth = 26;
  g.beginPath(); g.arc(256, 256, 226, 0, TAU); g.fill(); g.stroke();
  g.strokeStyle = "#c9a24e"; g.lineWidth = 8; g.beginPath(); g.arc(256, 256, 204, 0, TAU); g.stroke();
  g.strokeStyle = "#2a2430"; g.lineCap = "round";
  for (let i = 0; i < 60; i++) { const a = (i * TAU) / 60, big = i % 5 === 0; g.lineWidth = big ? 16 : 5; g.beginPath(); g.moveTo(256 + (big ? 150 : 172) * Math.cos(a), 256 + (big ? 150 : 172) * Math.sin(a)); g.lineTo(256 + 190 * Math.cos(a), 256 + 190 * Math.sin(a)); g.stroke(); }
  g.lineWidth = 20; g.beginPath(); g.moveTo(256, 256); g.lineTo(256 + 95 * Math.cos(-2.3), 256 + 95 * Math.sin(-2.3)); g.stroke();
  g.lineWidth = 12; g.beginPath(); g.moveTo(256, 256); g.lineTo(256 + 150 * Math.cos(-0.45), 256 + 150 * Math.sin(-0.45)); g.stroke();
  g.fillStyle = "#2a2430"; g.beginPath(); g.arc(256, 256, 18, 0, TAU); g.fill();
});
/** wallpaper with vertical stripes + small motifs (1.6 m tile); shabby = faded with stains and peeling corners */
export const wallpaperTex = (key: string, base: string, stripe: string, motif: string, shabby = false) => ctex("kWp" + key, 512, 512, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let x = 0; x < 512; x += 64) { g.fillStyle = stripe; g.fillRect(x + 22, 0, 20, 512); g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(x + 44, 0, 4, 512); }
  for (let y = 0; y < 512; y += 64) for (let x = 0; x < 512; x += 64) {
    const cx = x + 6 + ((y / 64) % 2) * 32 - 6 + 8, cy = y + 32;
    g.fillStyle = motif; g.beginPath();
    for (let k = 0; k < 4; k++) { const a = (k * TAU) / 4; g.ellipse(cx + 6 * Math.cos(a), cy + 6 * Math.sin(a), 5, 3, a, 0, TAU); }
    g.fill();
  }
  if (shabby) {
    for (let i = 0; i < 14; i++) blot(g, U(r, 0, 512), U(r, 0, 512), U(r, 30, 110), pick(r, ["#8a7050", "#a09070"]), U(r, 0.12, 0.25), 0.8);
    for (let i = 0; i < 4; i++) { // peeling patches showing grey plaster
      const x = U(r, 20, 440), y = U(r, 20, 440), w = U(r, 30, 70), h = U(r, 20, 50);
      g.fillStyle = "#cfc6b4"; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y + 6); g.lineTo(x + w - 8, y + h); g.lineTo(x + 4, y + h - 6); g.closePath(); g.fill();
      g.strokeStyle = "rgba(60,45,40,0.5)"; g.lineWidth = 2; g.stroke();
    }
  }
});
/** wainscot: framed wood panels (1.0 m high band, 2 m tile) */
export const panelTex = (key: string, wood: string) => ctex("kPanel" + key, 512, 256, (g, r) => {
  g.fillStyle = wood; g.fillRect(0, 0, 512, 256);
  for (let y = 0; y < 256; y += 5) { g.fillStyle = `rgba(${r() < 0.5 ? "50,30,15" : "230,190,140"},${U(r, 0.03, 0.09)})`; g.fillRect(0, y, 512, 2); }
  const light = new THREE.Color(wood).multiplyScalar(1.12).getStyle(), dark = new THREE.Color(wood).multiplyScalar(0.72).getStyle();
  for (let x = 0; x < 512; x += 128) {
    g.fillStyle = light; g.fillRect(x + 16, 40, 96, 180);
    g.strokeStyle = dark; g.lineWidth = 6; g.strokeRect(x + 16, 40, 96, 180);
    g.strokeStyle = "rgba(255,230,190,0.3)"; g.lineWidth = 2; g.strokeRect(x + 22, 46, 84, 168);
  }
  g.fillStyle = dark; g.fillRect(0, 0, 512, 14); g.fillRect(0, 240, 512, 16);
});
/** a row of book / ledger spines (one shelf, 1 m x 0.32 m): colour blocks with bands, no lettering */
export const spinesTex = (key: string, cols: string[]) => ctex("kSpines" + key, 512, 160, (g, r) => {
  g.fillStyle = "#3a2618"; g.fillRect(0, 0, 512, 160);
  let x = 4;
  while (x < 508) {
    const w = U(r, 16, 34), h = U(r, 104, 154), c = jit(r, pick(r, cols), 0.12, 6, 0.1);
    g.fillStyle = c; g.fillRect(x, 160 - h, w - 2, h);
    g.fillStyle = "rgba(255,230,160,0.55)"; g.fillRect(x + 2, 160 - h + 12, w - 6, 4); g.fillRect(x + 2, 160 - h + h * 0.6, w - 6, 3);
    g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(x + w - 5, 160 - h, 3, h);
    x += w;
    if (r() < 0.06) x += U(r, 10, 30);
  }
});
/** pigeonholes with paper rolls / files (cash office back wall), 1 m tile */
export const pigeonTex = () => ctex("kPigeon", 512, 512, (g, r) => {
  g.fillStyle = "#6e4a2e"; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
    const x0 = x * 128 + 10, y0 = y * 128 + 10;
    g.fillStyle = "#2a1c14"; g.fillRect(x0, y0, 108, 108);
    const n = Math.floor(U(r, 1, 5));
    for (let k = 0; k < n; k++) {
      if (r() < 0.5) { g.fillStyle = pick(r, ["#f2ead6", "#e6dcc0", "#d9cba8"]); g.beginPath(); g.ellipse(x0 + 20 + k * 22, y0 + 80, 10, 10, 0, 0, TAU); g.fill(); g.strokeStyle = "rgba(60,40,30,0.6)"; g.lineWidth = 2; g.stroke(); }
      else { g.fillStyle = pick(r, ["#a8423a", "#3f6a5a", "#c9a24e", "#5a6aa0"]); g.fillRect(x0 + 8 + k * 24, y0 + 30, 18, 76); }
    }
    g.fillStyle = "rgba(255,220,170,0.18)"; g.fillRect(x0 - 10, y0 - 10, 128, 6);
  }
});
/** an abstract painting in a gilt frame (landscape / still life), no writing */
export const paintingTex = (k: number) => ctex("kPaint" + k, 320, 256, (g, r) => {
  g.fillStyle = "#b8903e"; g.fillRect(0, 0, 320, 256);
  g.fillStyle = "#e0bc64"; g.fillRect(10, 10, 300, 236); g.fillStyle = "#8a6428"; g.fillRect(22, 22, 276, 212);
  const x0 = 28, y0 = 28, w = 264, h = 200;
  g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
  if (k % 3 === 0) { // landscape
    const sk = g.createLinearGradient(0, y0, 0, y0 + h); sk.addColorStop(0, "#8fb4e0"); sk.addColorStop(0.6, "#f2dcb0"); g.fillStyle = sk; g.fillRect(x0, y0, w, h);
    g.fillStyle = "#6a9a58"; g.beginPath(); g.moveTo(x0, y0 + h * 0.7); g.quadraticCurveTo(x0 + w * 0.4, y0 + h * 0.45, x0 + w, y0 + h * 0.65); g.lineTo(x0 + w, y0 + h); g.lineTo(x0, y0 + h); g.fill();
    g.fillStyle = "#3f6a3a"; g.beginPath(); g.arc(x0 + w * 0.7, y0 + h * 0.5, 30, 0, TAU); g.fill(); g.fillStyle = "#5a3b2a"; g.fillRect(x0 + w * 0.7 - 4, y0 + h * 0.5, 8, 40);
  } else if (k % 3 === 1) { // still life
    g.fillStyle = "#4a3a50"; g.fillRect(x0, y0, w, h); g.fillStyle = "#8a6a4a"; g.fillRect(x0, y0 + h * 0.7, w, h * 0.3);
    for (const [cx, cy, rr, c] of [[120, 150, 34, "#c8453a"], [170, 160, 28, "#e0b23a"], [200, 140, 22, "#7aa04a"]] as const) { g.fillStyle = c; g.beginPath(); g.arc(cx, cy, rr, 0, TAU); g.fill(); }
    g.fillStyle = "#d9d0c0"; g.fillRect(70, 90, 30, 80);
  } else { // seascape
    g.fillStyle = "#e8c890"; g.fillRect(x0, y0, w, h * 0.5); g.fillStyle = "#3f6fa0"; g.fillRect(x0, y0 + h * 0.5, w, h * 0.5);
    g.fillStyle = "#fff3d0"; g.beginPath(); g.arc(x0 + w * 0.3, y0 + h * 0.42, 22, 0, TAU); g.fill();
    g.fillStyle = "#f4efe6"; g.beginPath(); g.moveTo(x0 + 170, y0 + 140); g.lineTo(x0 + 200, y0 + 70); g.lineTo(x0 + 205, y0 + 140); g.fill();
  }
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(${r() < 0.5 ? "255,255,255" : "0,0,0"},0.06)`; g.fillRect(x0 + r() * w, y0 + r() * h, 3, 2); }
  g.restore();
  g.strokeStyle = "rgba(40,25,10,0.7)"; g.lineWidth = 4; g.strokeRect(2, 2, 316, 252);
});
/** an abstract poster (colour blocks, circles, stripes; never letters) */
export const posterTex = (k: number) => ctex("kPoster" + k, 256, 360, (g, r) => {
  const P = [["#e8d8b0", "#c8453a", "#2f5f6a"], ["#2f3d66", "#e0b23a", "#f2eee4"], ["#f2e2c4", "#3f8a5a", "#b5653f"], ["#c8453a", "#f2e2c4", "#2a2430"]][k % 4];
  g.fillStyle = P[0]; g.fillRect(0, 0, 256, 360);
  g.fillStyle = P[1]; g.fillRect(20, 20, 216, 70);
  g.fillStyle = P[2]; g.beginPath(); g.arc(128, 190, 62 + (k % 3) * 8, 0, TAU); g.fill();
  g.fillStyle = P[1]; for (let i = 0; i < 3; i++) g.fillRect(40, 280 + i * 18, 176 - i * 30, 8);
  g.strokeStyle = "rgba(40,30,40,0.6)"; g.lineWidth = 5; g.strokeRect(2, 2, 252, 356);
  void r;
});
/** stripes along u (awnings, booths, carousel canopy): n stripes of two colours */
export const stripeTex = (key: string, a: string, b: string, n = 8, scallop = false) => ctex("kStripe" + key, 512, 256, (g) => {
  for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect((i * 512) / n, 0, 512 / n + 1, 256); }
  for (let i = 0; i < n; i++) { g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect((i * 512) / n, 0, 6, 256); }
  if (scallop) { g.fillStyle = "rgba(40,25,30,0.25)"; g.fillRect(0, 230, 512, 26); }
});
/** stage curtain: warm deep red velvet in strong vertical folds, gold braid + fringe along the bottom */
export const stageCurtainTex = () => ctex("kStageCurtain2", 1024, 512, (g) => {
  g.fillStyle = "#8e1a24"; g.fillRect(0, 0, 1024, 512);
  const N = 11;
  for (let x = 0; x < 1024; x++) {
    const ph = (x / 1024) * N, s = Math.sin(ph * TAU), c = Math.cos(ph * TAU);
    const col = s > 0 ? `rgba(232,92,82,${(0.42 * s ** 1.5).toFixed(3)})` : `rgba(48,4,14,${(0.55 * (-s) ** 1.2).toFixed(3)})`;
    g.fillStyle = col; g.fillRect(x, 0, 1, 476);
    if (c > 0.97) { g.fillStyle = "rgba(255,170,150,0.35)"; g.fillRect(x, 0, 1, 476); }
  }
  const top = g.createLinearGradient(0, 0, 0, 120); top.addColorStop(0, "rgba(30,0,8,0.55)"); top.addColorStop(1, "rgba(30,0,8,0)");
  g.fillStyle = top; g.fillRect(0, 0, 1024, 120);
  g.fillStyle = "#e0b040"; g.fillRect(0, 460, 1024, 18);
  g.fillStyle = "#a87820"; g.fillRect(0, 474, 1024, 4);
  for (let x = 0; x < 1024; x += 10) { g.fillStyle = (x / 10) % 2 ? "#f0c850" : "#c0902a"; g.fillRect(x, 478, 7, 30); }
});
/** pelmet over the curtain: red velvet swags with gold braid and fringe (transparent between the swags) */
export const pelmetTex = () => ctex("kPelmet", 1024, 256, (g) => {
  g.fillStyle = "#7a1420"; g.fillRect(0, 0, 1024, 60);
  g.fillStyle = "#e0b040"; g.fillRect(0, 52, 1024, 12);
  const n = 5, w = 1024 / n;
  for (let i = 0; i < n; i++) {
    const x0 = i * w;
    g.beginPath(); g.moveTo(x0, 60); g.quadraticCurveTo(x0 + w / 2, 300, x0 + w, 60); g.closePath();
    const gr = g.createLinearGradient(0, 60, 0, 190); gr.addColorStop(0, "#a8202c"); gr.addColorStop(1, "#6a0e1a");
    g.fillStyle = gr; g.fill();
    g.strokeStyle = "#e0b040"; g.lineWidth = 12; g.beginPath(); g.moveTo(x0 + 4, 64); g.quadraticCurveTo(x0 + w / 2, 300, x0 + w - 4, 64); g.stroke();
    for (let k = 0; k <= 20; k++) { const t = k / 20, x = (1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * (x0 + w / 2) + t * t * (x0 + w), y = (1 - t) * (1 - t) * 64 + 2 * t * (1 - t) * 300 + t * t * 64; g.fillStyle = k % 2 ? "#f0c850" : "#c0902a"; g.fillRect(x - 3, y + 4, 6, 22); }
    g.fillStyle = "#e0b040"; g.beginPath(); g.arc(x0, 70, 14, 0, TAU); g.fill();
  }
});
/** interior window pane: bright sky gradient with a tree silhouette (emissive-ish), white frame + mullions */
export const windowTex = (key: string, morning = false) => ctex("kWin" + key, 256, 384, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 384);
  gr.addColorStop(0, morning ? "#dfe9f6" : "#cfe2f6"); gr.addColorStop(1, morning ? "#f6f0e2" : "#fff1d6");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 384);
  g.fillStyle = morning ? "rgba(160,170,190,0.55)" : "rgba(150,170,140,0.5)";
  g.fillRect(0, 250, 256, 134);
  for (const [x, y, r] of [[60, 230, 50], [180, 260, 44], [120, 210, 36]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  g.fillStyle = "#f4efe4"; g.fillRect(0, 0, 256, 14); g.fillRect(0, 370, 256, 14); g.fillRect(0, 0, 14, 384); g.fillRect(242, 0, 14, 384);
  g.fillRect(121, 0, 14, 384); g.fillRect(0, 150, 256, 12);
  g.strokeStyle = "rgba(40,30,40,0.6)"; g.lineWidth = 4; g.strokeRect(2, 2, 252, 380);
});
/** trampled fairground ground: dirt with grass patches */
export const fairGroundTex = () => ctex("kFairGround", 1024, 1024, (g, r) => {
  g.fillStyle = "#b39a6c"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 60; i++) blot(g, U(r, 0, 1024), U(r, 0, 1024), U(r, 60, 200), pick(r, ["#7f9a58", "#93a862", "#a08a5e", "#c2a878"]), 0.55);
  for (let i = 0; i < 9000; i++) { g.fillStyle = r() < 0.5 ? "rgba(60,45,30,0.3)" : "rgba(240,225,190,0.3)"; const s = U(r, 1, 3); g.fillRect(r() * 1024, r() * 1024, s, s); }
});
/** plaster for interior ceilings / shabby walls */
export const plasterTex = (key: string, base: string) => ctex("kPlaster" + key, 512, 512, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 24; i++) blot(g, U(r, 0, 512), U(r, 0, 512), U(r, 40, 140), pick(r, ["#ffffff", "#9a8a78"]), 0.1);
});
/** floor tiles (cash office): two-tone chequer with worn edges (1 m tile = 4 x 4 tiles) */
export const tileTex = (key: string, a: string, b: string) => ctex("kTile" + key, 512, 512, (g, r) => {
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = jit(r, (x + y) % 2 ? a : b, 0.05, 2, 0.06); g.fillRect(x * 128, y * 128, 128, 128); }
  g.strokeStyle = "rgba(60,45,40,0.3)"; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, 512); g.moveTo(0, i * 128); g.lineTo(512, i * 128); g.stroke(); }
});
