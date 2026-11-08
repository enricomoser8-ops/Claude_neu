// Painted textures for the Eiffel short (Canvas2D, cached via ctex): the tower lattice (clean bronze and rusty),
// the first-floor gallery, zinc mansard roofs, Haussmann stone facades (colour + dusk window glow), the café shop
// front, the hotel facade, red damask, gilt, mirror glass, red carpet, gravel, type cases, the newspaper wall.
// NO letters or numbers anywhere.
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
const speckle = (g: G, r: R, W: number, H: number, n: number, cols: string[], s0 = 1, s1 = 3) => {
  for (let i = 0; i < n; i++) { g.fillStyle = pick(r, cols); const s = U(r, s0, s1); g.fillRect(U(r, 0, W), U(r, 0, H), s, s); }
};

// ---------------- the tower ----------------
export const TOWER_COL = "#9a6a4e";
/** one lattice panel (u across the face 0..1, v = 4 m): corner girders at both edges, an X brace, a tie at the top.
 *  The gaps are painted dark (the open lattice seen through), the iron warm bronze. rust: orange-brown patches. */
export const latticeTex = (rust: boolean) => ctex("eLattice" + (rust ? "R" : ""), 512, 512, (g, r) => {
  const iron = "#b8703c", dark = "#4a2a1a", hi = "#d89a64";
  g.fillStyle = dark; g.fillRect(0, 0, 512, 512);
  // see-through hint: a little sky-ish lift in the gaps
  for (let i = 0; i < 6; i++) blot(g, U(r, 80, 430), U(r, 60, 450), U(r, 50, 110), "#8a6650", 0.22);
  const bar = (x0: number, y0: number, x1: number, y1: number, w: number) => {
    g.lineCap = "butt"; g.strokeStyle = iron; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    g.strokeStyle = hi; g.lineWidth = w * 0.22; g.beginPath(); g.moveTo(x0 - w * 0.2, y0); g.lineTo(x1 - w * 0.2, y1); g.stroke();
  };
  // small secondary lattice inside the big X (reads as rivets and webbing)
  for (let k = -8; k < 16; k++) { bar(k * 64, 0, k * 64 + 512, 512, 7); bar(k * 64 + 512, 0, k * 64, 512, 7); }
  bar(0, 0, 512, 512, 30); bar(512, 0, 0, 512, 30);
  g.fillStyle = iron; g.fillRect(0, 0, 512, 40); g.fillRect(0, 0, 54, 512); g.fillRect(458, 0, 54, 512);
  g.fillStyle = hi; g.fillRect(6, 0, 10, 512); g.fillRect(464, 0, 10, 512); g.fillRect(0, 4, 512, 8);
  g.fillStyle = "rgba(40,25,20,0.5)"; g.fillRect(48, 0, 6, 512); g.fillRect(452, 0, 6, 512); g.fillRect(0, 40, 512, 5);
  for (let y = 20; y < 512; y += 40) for (const x of [27, 485]) { g.fillStyle = "#6a4634"; g.beginPath(); g.arc(x, y, 4, 0, TAU); g.fill(); }
  if (rust) {
    for (let i = 0; i < 18; i++) {
      const x = U(r, 0, 512), y = U(r, 0, 512), rr = U(r, 30, 95);
      blot(g, x, y, rr, pick(r, ["#a8501e", "#94461c", "#b86230"]), 0.7, U(r, 0.6, 1.4));
      for (let k = 0; k < 6; k++) { g.fillStyle = pick(r, ["#8a3a18", "#c0682e", "#6a2c14"]); g.beginPath(); g.ellipse(x + U(r, -rr, rr) * 0.6, y + U(r, -rr, rr) * 0.6, U(r, 6, 20), U(r, 4, 14), U(r, 0, 3), 0, TAU); g.fill(); }
      g.strokeStyle = "rgba(150,60,20,0.6)"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + U(r, -10, 10), y + U(r, 40, 120)); g.stroke(); // rust streak
    }
  }
});
/** the first-floor gallery band: arcaded openings between iron posts (4 m tile) */
export const galleryTex = () => ctex("eGallery", 512, 256, (g, r) => {
  g.fillStyle = "#b8703c"; g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 4; i++) {
    const x = i * 128 + 14, w = 100;
    g.fillStyle = "#4a2a1a"; g.beginPath(); g.moveTo(x, 210); g.lineTo(x, 90); g.arc(x + w / 2, 90, w / 2, Math.PI, 0); g.lineTo(x + w, 210); g.closePath(); g.fill();
    g.strokeStyle = "#d89a64"; g.lineWidth = 6; g.stroke();
    g.fillStyle = "#6a5a6a"; g.globalAlpha = 0.35; g.fillRect(x + 10, 70, w - 20, 120); g.globalAlpha = 1;
  }
  g.fillStyle = "#7a4e38"; g.fillRect(0, 0, 512, 26); g.fillRect(0, 222, 512, 34);
  g.fillStyle = "#d89a64"; g.fillRect(0, 26, 512, 6); g.fillRect(0, 222, 512, 5);
  for (let x = 8; x < 512; x += 24) { g.fillStyle = "#5a3a2a"; g.fillRect(x, 232, 10, 20); }
  void r;
});

// ---------------- Paris ----------------
/** zinc mansard / roof sheet: blue-grey with standing seams (2 m tile) */
export const zincTex = () => ctex("eZinc", 512, 512, (g, r) => {
  g.fillStyle = "#7f8798"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 20; i++) blot(g, U(r, 0, 512), U(r, 0, 512), U(r, 40, 120), pick(r, ["#8d95a6", "#6f7686", "#9aa0ae"]), 0.4);
  for (let x = 0; x < 512; x += 64) { g.fillStyle = "rgba(40,40,60,0.45)"; g.fillRect(x, 0, 4, 512); g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(x + 4, 0, 3, 512); }
});
/** Haussmann stone facade (3 bays x 3.4 m wide, full 21 m): shop floor, entresol, 5 floors with tall French windows,
 *  continuous balconies on the 2nd and 5th floors painted as shadows (real rails are 3D), stone joints. */
export type Tex2 = { map: THREE.CanvasTexture; glow: THREE.CanvasTexture };
export const haussTex = (col: string, shop: string): Tex2 => {
  const PX = 48, BW = 3.4 * PX, W = Math.round(3 * BW), H = Math.round(21 * PX);
  const lit: boolean[] = [];
  const key = col + shop;
  const winY = (fl: number) => H - (5.0 + fl * 3.2) * PX - 2.6 * PX; // top of the window opening on floor fl (0 = 1st floor)
  const map = ctex("eHauss" + key, W, H, (g, r) => {
    g.fillStyle = col; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 26; i++) blot(g, U(r, 0, W), U(r, 0, H), U(r, 30, 120), pick(r, ["#ffffff", "#8a7a66"]), 0.1);
    g.strokeStyle = "rgba(120,100,80,0.22)"; g.lineWidth = 2;
    for (let y = H; y > 0; y -= 0.55 * PX) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    // shop floor (5 m): coloured wooden fronts with big glass
    const gy = H - 5 * PX;
    g.fillStyle = new THREE.Color(col).multiplyScalar(0.9).getStyle(); g.fillRect(0, gy, W, 5 * PX);
    for (let b = 0; b < 3; b++) {
      const x = b * BW + 0.25 * PX, w = BW - 0.5 * PX;
      g.fillStyle = shop; g.fillRect(x, gy + 0.5 * PX, w, 4.5 * PX);
      const gl = g.createLinearGradient(x, gy, x, gy + 4 * PX); gl.addColorStop(0, "#8696c8"); gl.addColorStop(1, "#4b5590");
      g.fillStyle = gl; g.fillRect(x + 0.2 * PX, gy + 1.1 * PX, w - 0.4 * PX, 3.2 * PX);
      g.fillStyle = "rgba(255,240,200,0.35)"; g.fillRect(x + 0.4 * PX, gy + 3.2 * PX, w - 0.8 * PX, 0.9 * PX);
      g.fillStyle = "#c9a24e"; g.fillRect(x, gy + 0.5 * PX, w, 0.12 * PX);
      g.strokeStyle = "rgba(30,20,20,0.55)"; g.lineWidth = 3; g.strokeRect(x + 0.2 * PX, gy + 1.1 * PX, w - 0.4 * PX, 3.2 * PX);
      lit.push(true);
    }
    // upper floors
    for (let fl = 0; fl < 5; fl++) for (let b = 0; b < 3; b++) {
      const x = b * BW + 0.95 * PX, w = BW - 1.9 * PX, wy = winY(fl), wh = 2.6 * PX;
      g.fillStyle = "rgba(255,250,235,0.55)"; g.fillRect(x - 12, wy - 12, w + 24, wh + 12);
      if (fl === 0 || fl === 3) { g.fillStyle = "rgba(255,250,235,0.7)"; g.fillRect(x - 24, wy - 30, w + 48, 16); } // pediment hood
      const gl = g.createLinearGradient(x, wy, x + w, wy + wh); gl.addColorStop(0, "#8d9cdb"); gl.addColorStop(1, "#4f5aa0");
      g.fillStyle = gl; g.fillRect(x, wy, w, wh);
      if (r() < 0.5) { g.fillStyle = pick(r, ["#f3e3c6", "#ffffff", "#e8d0c8"]); g.fillRect(x, wy, w * 0.22, wh); g.fillRect(x + w * 0.78, wy, w * 0.22, wh); }
      g.fillStyle = "#f7f2e8"; g.fillRect(x + w / 2 - 3, wy, 6, wh); g.fillRect(x, wy + wh * 0.32, w, 4);
      g.strokeStyle = "rgba(60,45,40,0.55)"; g.lineWidth = 2; g.strokeRect(x - 12, wy - 12, w + 24, wh + 12);
      // balcony shadow line (2nd and 5th floor: continuous; others: small window rail)
      g.fillStyle = "rgba(50,40,40,0.45)"; g.fillRect(fl === 1 || fl === 4 ? 0 : x - 6, wy + wh, fl === 1 || fl === 4 ? W : w + 12, 6);
      if (fl !== 1 && fl !== 4) { g.strokeStyle = "#2a2430"; g.lineWidth = 3; g.strokeRect(x - 4, wy + wh - 0.7 * PX, w + 8, 0.7 * PX); for (let k = 1; k < 6; k++) { g.beginPath(); g.moveTo(x - 4 + ((w + 8) * k) / 6, wy + wh - 0.7 * PX); g.lineTo(x - 4 + ((w + 8) * k) / 6, wy + wh); g.stroke(); } }
      lit.push(r() < 0.55);
    }
    g.fillStyle = "rgba(255,250,235,0.6)"; g.fillRect(0, gy - 0.3 * PX, W, 0.3 * PX); g.fillRect(0, 0, W, 0.6 * PX);
    g.fillStyle = "rgba(60,45,40,0.35)"; g.fillRect(0, gy, W, 4); g.fillRect(0, 0.6 * PX, W, 5);
  });
  const glow = ctex("eHaussG" + key, W / 2, H / 2, (g, r) => {
    g.fillStyle = "#000"; g.fillRect(0, 0, W / 2, H / 2);
    const k = 0.5, gy = H - 5 * PX;
    let i = 0;
    for (let b = 0; b < 3; b++) { const x = b * BW + 0.45 * PX, w = BW - 0.9 * PX; if (lit[i++]) { g.fillStyle = "#ffcf86"; g.fillRect(x * k, (gy + 1.1 * PX) * k, w * k, 3.2 * PX * k); } }
    for (let fl = 0; fl < 5; fl++) for (let b = 0; b < 3; b++) {
      const x = b * BW + 0.95 * PX, w = BW - 1.9 * PX, wy = winY(fl), wh = 2.6 * PX;
      if (lit[i++]) { g.fillStyle = pick(r, ["#ffd28a", "#ffc070", "#ffe0a8"]); g.fillRect(x * k, wy * k, w * k, wh * k); g.fillStyle = "rgba(0,0,0,0.6)"; g.fillRect((x + w / 2 - 3) * k, wy * k, 6 * k, wh * k); }
    }
  });
  return { map, glow };
};
/** café shop front (6.8 m x 4.6 m): dark green wood frame, gilt trim, big warm windows with shelves and bottles */
export const cafeFrontTex = () => ctex("eCafeFront", 1024, 690, (g, r) => {
  const PX = 150;
  g.fillStyle = "#2f5444"; g.fillRect(0, 0, 1024, 690);
  g.fillStyle = "#c9a24e"; g.fillRect(0, 0, 1024, 16); g.fillRect(0, 96, 1024, 8);
  g.fillStyle = "#24443a"; g.fillRect(0, 16, 1024, 80);
  for (let i = 0; i < 9; i++) { g.fillStyle = "#c9a24e"; g.beginPath(); g.arc(60 + i * 113, 56, 12, 0, TAU); g.fill(); }
  const pane = (x: number, w: number, door = false) => {
    const y = 130, h = door ? 560 : 430;
    const gl = g.createLinearGradient(0, y, 0, y + h); gl.addColorStop(0, "#f2c880"); gl.addColorStop(1, "#c8864a");
    g.fillStyle = gl; g.fillRect(x, y, w, h);
    if (!door) {
      for (const sy of [210, 300]) { g.fillStyle = "#5a3a22"; g.fillRect(x, sy, w, 10); for (let bx = x + 10; bx < x + w - 10; bx += 22) { g.fillStyle = pick(r, ["#2f5a3a", "#6a2a2a", "#c9a24e", "#3a3438", "#e8dcc0"]); g.fillRect(bx, sy - U(r, 40, 64), 14, 64); } }
      g.fillStyle = "rgba(90,55,40,0.6)"; g.fillRect(x, 400, w, 160);
      for (let k = 0; k < 3; k++) { g.fillStyle = "rgba(60,35,30,0.55)"; g.beginPath(); g.arc(x + 50 + k * (w - 100) / 2, 395, 26, 0, TAU); g.fill(); g.fillRect(x + 40 + k * (w - 100) / 2, 395, 20, 70); }
    }
    g.fillStyle = "rgba(255,255,255,0.22)"; g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.translate(x + w * 0.3, y + h * 0.4); g.rotate(0.5); g.fillRect(-12, -h, 24, h * 2); g.restore();
    g.strokeStyle = "#c9a24e"; g.lineWidth = 6; g.strokeRect(x, y, w, h);
    g.strokeStyle = "#24443a"; g.lineWidth = 10; g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + h); g.stroke();
  };
  pane(40, 360); pane(440, 150, true); pane(624, 360);
  g.fillStyle = "#24443a"; g.fillRect(0, 570, 1024, 120); g.fillRect(440, 690, 150, 0);
  for (let x = 40; x < 1000; x += 120) { g.strokeStyle = "#c9a24e"; g.lineWidth = 3; g.strokeRect(x + 6, 590, 100, 80); }
  void PX;
});
/** grand hotel facade (24 m x 24 m): warm stone, arched ground floor, tall windows with red awnings, gilt trim */
export const hotelTex = (): Tex2 => {
  const PX = 40, W = 24 * PX, H = 24 * PX, lit: boolean[] = [];
  const map = ctex("eHotel", W, H, (g, r) => {
    g.fillStyle = "#efdcb6"; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 30; i++) blot(g, U(r, 0, W), U(r, 0, H), U(r, 30, 120), pick(r, ["#ffffff", "#a08a6a"]), 0.1);
    g.strokeStyle = "rgba(120,100,80,0.22)"; g.lineWidth = 2; for (let y = H; y > 0; y -= 0.5 * PX) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    const gy = H - 6 * PX;
    g.fillStyle = "#e2cc9e"; g.fillRect(0, gy, W, 6 * PX);
    for (let y = gy; y < H; y += 0.6 * PX) { g.fillStyle = "rgba(90,70,50,0.25)"; g.fillRect(0, y, W, 3); }
    for (let i = 0; i < 6; i++) { // arches
      const x = i * 4 * PX + 0.6 * PX, w = 2.8 * PX, y = gy + 1.2 * PX, h = 4.8 * PX;
      g.fillStyle = "#3a3048"; g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w, y + h); g.closePath(); g.fill();
      const gl = g.createLinearGradient(0, y, 0, y + h); gl.addColorStop(0, "#f6d090"); gl.addColorStop(1, "#c88a4a");
      g.fillStyle = gl; g.beginPath(); g.moveTo(x + 8, y + h); g.lineTo(x + 8, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2 - 8, Math.PI, 0); g.lineTo(x + w - 8, y + h); g.closePath(); g.fill();
      g.strokeStyle = "#c9a24e"; g.lineWidth = 4; g.stroke();
      g.fillStyle = "#f7ecd0"; g.fillRect(x + w / 2 - 0.25 * PX, y - 0.2 * PX, 0.5 * PX, 0.6 * PX);
      lit.push(true);
    }
    for (let fl = 0; fl < 4; fl++) for (let i = 0; i < 6; i++) {
      const x = i * 4 * PX + 1.0 * PX, w = 2.0 * PX, wy = gy - (fl + 1) * 4.2 * PX + 0.7 * PX, wh = 3.0 * PX;
      g.fillStyle = "#f8eed6"; g.fillRect(x - 10, wy - 10, w + 20, wh + 10);
      g.fillStyle = "#c9a24e"; g.fillRect(x - 16, wy - 22, w + 32, 8);
      const gl = g.createLinearGradient(x, wy, x + w, wy + wh); gl.addColorStop(0, "#9aa8e0"); gl.addColorStop(1, "#5761a8");
      g.fillStyle = gl; g.fillRect(x, wy, w, wh);
      g.fillStyle = "#f2e6cc"; g.fillRect(x, wy, w * 0.2, wh); g.fillRect(x + w * 0.8, wy, w * 0.2, wh);
      g.fillStyle = "#f7f2e8"; g.fillRect(x + w / 2 - 3, wy, 6, wh);
      g.fillStyle = "#b8323a"; g.beginPath(); g.moveTo(x - 6, wy); g.lineTo(x + w + 6, wy); g.lineTo(x + w + 14, wy + 0.7 * PX); g.lineTo(x - 14, wy + 0.7 * PX); g.closePath(); g.fill(); // awning
      for (let k = 0; k < 6; k++) { g.fillStyle = "#f2e8d0"; g.fillRect(x - 10 + k * (w + 20) / 6, wy + 0.1 * PX, (w + 20) / 12, 0.55 * PX); }
      g.fillStyle = "rgba(40,30,40,0.6)"; g.fillRect(x - 14, wy + wh, w + 28, 5);
      lit.push(r() < 0.6);
    }
    g.fillStyle = "#c9a24e"; g.fillRect(0, gy - 0.25 * PX, W, 0.25 * PX); g.fillRect(0, 0, W, 0.5 * PX);
  });
  const glow = ctex("eHotelG", W / 2, H / 2, (g) => {
    g.fillStyle = "#000"; g.fillRect(0, 0, W / 2, H / 2);
    const gy = H - 6 * PX, k = 0.5; let n = 0;
    for (let i = 0; i < 6; i++) { const x = i * 4 * PX + 0.6 * PX, w = 2.8 * PX; if (lit[n++]) { g.fillStyle = "#ffcf86"; g.fillRect(x * k, (gy + 2.4 * PX) * k, w * k, 3.6 * PX * k); } }
    for (let fl = 0; fl < 4; fl++) for (let i = 0; i < 6; i++) { const x = i * 4 * PX + 1.0 * PX, w = 2.0 * PX, wy = gy - (fl + 1) * 4.2 * PX + 0.7 * PX; if (lit[n++]) { g.fillStyle = "#ffd28a"; g.fillRect(x * k, (wy + 0.7 * PX) * k, w * k, 2.3 * PX * k); } }
  });
  return { map, glow };
};
/** pale gravel of the Champ de Mars (6 m tile) */
export const gravelTex = () => ctex("eGravel", 1024, 1024, (g, r) => {
  g.fillStyle = "#d9c7a2"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 50; i++) blot(g, U(r, 0, 1024), U(r, 0, 1024), U(r, 40, 160), pick(r, ["#cdb994", "#e4d4b0", "#c8b08a"]), 0.5);
  speckle(g, r, 1024, 1024, 16000, ["rgba(120,95,70,0.35)", "rgba(255,248,230,0.4)", "rgba(150,130,100,0.3)"], 1, 3);
});
/** station platform: big stone slabs (4 m tile) */
export const slabTex = () => ctex("eSlab", 512, 512, (g, r) => {
  g.fillStyle = "#c9c0b0"; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 2; x++) { g.fillStyle = jit(r, "#c9c0b0", 0.05, 3, 0.08); g.fillRect(x * 256 + 3, y * 128 + 3, 250, 122); }
  speckle(g, r, 512, 512, 3000, ["rgba(90,80,70,0.25)", "rgba(255,255,255,0.25)"], 1, 2);
});

// ---------------- interiors ----------------
/** red damask wallpaper with a gilt rail pattern (1.6 m tile) */
export const damaskTex = (key: string, base: string, motif: string) => ctex("eDamask" + key, 512, 512, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 12; i++) blot(g, U(r, 0, 512), U(r, 0, 512), U(r, 60, 160), "#000000", 0.08);
  for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) {
    const cx = x * 256 + 128 + (y % 2) * 0, cy = y * 256 + 128;
    g.fillStyle = motif;
    g.beginPath(); g.ellipse(cx, cy, 34, 70, 0, 0, TAU); g.fill();
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * 40, cy + 10, 30, 14, s * 0.6, 0, TAU); g.fill(); g.beginPath(); g.ellipse(cx + s * 22, cy - 60, 14, 26, s * 0.4, 0, TAU); g.fill(); }
    g.beginPath(); g.arc(cx, cy + 92, 14, 0, TAU); g.fill();
  }
  g.fillStyle = "rgba(255,230,180,0.08)"; for (let x = 0; x < 512; x += 128) g.fillRect(x, 0, 6, 512);
});
/** a mirror pane: silvery blue gradient, soft reflections of a warm room, two diagonal glints */
export const mirrorTex = () => ctex("eMirror", 256, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 256, 512); gr.addColorStop(0, "#c8d4e4"); gr.addColorStop(0.5, "#9fb0c8"); gr.addColorStop(1, "#b8a890");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 512);
  g.fillStyle = "rgba(255,210,150,0.35)"; g.beginPath(); g.arc(128, 90, 60, 0, TAU); g.fill();
  g.fillStyle = "rgba(160,60,60,0.25)"; g.fillRect(0, 380, 256, 132);
  g.fillStyle = "rgba(255,255,255,0.45)";
  g.save(); g.translate(90, 260); g.rotate(0.55); g.fillRect(-10, -400, 20, 800); g.fillRect(26, -400, 8, 800); g.restore();
});
/** deep red carpet with a gold border pattern (4 m tile) */
export const redCarpetTex = () => ctex("eCarpet", 512, 512, (g, r) => {
  g.fillStyle = "#8e2430"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 30; i++) blot(g, U(r, 0, 512), U(r, 0, 512), U(r, 30, 90), pick(r, ["#7a1c28", "#a02e38"]), 0.4);
  g.strokeStyle = "rgba(224,176,64,0.55)"; g.lineWidth = 4;
  for (let y = 0; y < 512; y += 128) for (let x = 0; x < 512; x += 128) { g.beginPath(); g.moveTo(x + 64, y + 20); g.lineTo(x + 108, y + 64); g.lineTo(x + 64, y + 108); g.lineTo(x + 20, y + 64); g.closePath(); g.stroke(); g.fillStyle = "rgba(224,176,64,0.4)"; g.beginPath(); g.arc(x + 64, y + 64, 8, 0, TAU); g.fill(); }
  speckle(g, r, 512, 512, 4000, ["rgba(40,10,15,0.25)", "rgba(255,200,180,0.12)"], 1, 2);
});
/** type case: a grid of small compartments with lead type (abstract grey blocks) */
export const typeCaseTex = () => ctex("eTypeCase", 512, 256, (g, r) => {
  g.fillStyle = "#7a4e30"; g.fillRect(0, 0, 512, 256);
  for (let y = 0; y < 6; y++) for (let x = 0; x < 14; x++) {
    const cx = 8 + x * 36, cy = 8 + y * 41;
    g.fillStyle = "#3a2618"; g.fillRect(cx, cy, 30, 34);
    for (let k = 0; k < 6; k++) { g.fillStyle = pick(r, ["#8d949c", "#6a7078", "#a8b0b8"]); g.fillRect(cx + 3 + (k % 3) * 9, cy + 6 + Math.floor(k / 3) * 14, 6, 10); }
  }
});
/** a dark wall of pinned sheets drying (abstract grey bars, red seals) */
export const printsTex = () => ctex("ePrints", 512, 256, (g, r) => {
  g.clearRect(0, 0, 512, 256);
  for (let i = 0; i < 5; i++) {
    const x = 8 + i * 101, y = 20 + U(r, -6, 6);
    g.fillStyle = "#f6efdc"; g.fillRect(x, y, 88, 120);
    g.strokeStyle = "rgba(40,30,40,0.6)"; g.lineWidth = 3; g.strokeRect(x, y, 88, 120);
    for (let k = 0; k < 6; k++) { g.fillStyle = "#9a90a0"; g.fillRect(x + 10, y + 14 + k * 14, U(r, 40, 68), 4); }
    g.fillStyle = "#c42a2a"; g.beginPath(); g.arc(x + 64, y + 100, 11, 0, TAU); g.fill();
    g.fillStyle = "#3a3438"; g.fillRect(x + 38, y - 6, 12, 10);
  }
});
