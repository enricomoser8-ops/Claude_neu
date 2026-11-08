// Painted textures of the balloon short (Canvas2D, cached via ctex): the patchwork envelope (umbrella silk, tent nylon,
// bed ticking, sheets: horizontal bands split into gores, stitched seams) + its burner-glow mask, the first plain
// envelope, the border fence mesh, forest canopy seen from above, forest floor, meadow, village facades with a night
// window glow mask, kitchen / shop surfaces. No letters, numbers or emblems anywhere.
import * as THREE from "three";
import { ctex } from "./paint";

type G = CanvasRenderingContext2D;
type R = () => number;
const U = (r: R, a: number, b: number) => a + (b - a) * r();
const pick = <T,>(r: R, a: T[]) => a[Math.floor(r() * a.length) % a.length];
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

// ---------------- the patchwork envelope ----------------
/** fabric fills (each paints the rect x, y, w, h) */
type Fab = (g: G, r: R, x: number, y: number, w: number, h: number) => void;
const plain = (c: string, weave = "rgba(0,0,0,0.06)"): Fab => (g, r, x, y, w, h) => {
  g.fillStyle = c; g.fillRect(x, y, w, h);
  g.fillStyle = weave; for (let yy = y; yy < y + h; yy += 6) g.fillRect(x, yy, w, 2);
  for (let i = 0; i < 6; i++) blot(g, U(r, x, x + w), U(r, y, y + h), U(r, 20, 60), "#ffffff", 0.06);
};
/** umbrella silk: navy with white dots and small four-petal flowers */
const umbrella: Fab = (g, r, x, y, w, h) => {
  g.fillStyle = "#24346a"; g.fillRect(x, y, w, h);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  const S = 34;
  for (let yy = y - S; yy < y + h + S; yy += S) for (let xx = x - S; xx < x + w + S; xx += S) {
    const ox = ((Math.round((yy - y) / S)) % 2) * S * 0.5;
    if ((Math.round(xx / S) + Math.round(yy / S)) % 3 === 0) {
      g.fillStyle = "#f2c94a"; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(xx + ox + 6 * Math.cos(k * 1.57), yy + 6 * Math.sin(k * 1.57), 4.5, 0, 6.3); g.fill(); }
      g.fillStyle = "#d8483a"; g.beginPath(); g.arc(xx + ox, yy, 3, 0, 6.3); g.fill();
    } else { g.fillStyle = "#f4f0e6"; g.beginPath(); g.arc(xx + ox, yy, 5, 0, 6.3); g.fill(); }
  }
  g.restore();
};
/** umbrella silk 2: black-red check (old gentleman's umbrella) */
const umbrella2: Fab = (g, _r, x, y, w, h) => {
  g.fillStyle = "#3a2a36"; g.fillRect(x, y, w, h);
  for (let xx = x; xx < x + w; xx += 40) { g.fillStyle = "rgba(200,60,60,0.55)"; g.fillRect(xx, y, 12, h); }
  for (let yy = y; yy < y + h; yy += 40) { g.fillStyle = "rgba(200,60,60,0.45)"; g.fillRect(x, yy, w, 12); }
};
/** tent nylon: olive-green ripstop grid */
const tent = (c: string): Fab => (g, r, x, y, w, h) => {
  g.fillStyle = c; g.fillRect(x, y, w, h);
  g.strokeStyle = "rgba(20,40,10,0.22)"; g.lineWidth = 2;
  for (let xx = x; xx < x + w; xx += 18) { g.beginPath(); g.moveTo(xx, y); g.lineTo(xx, y + h); g.stroke(); }
  for (let yy = y; yy < y + h; yy += 18) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.stroke(); }
  for (let i = 0; i < 5; i++) blot(g, U(r, x, x + w), U(r, y, y + h), U(r, 30, 70), "#ffffff", 0.07);
};
/** bed ticking: off-white with narrow blue stripes (along the gore) */
const ticking = (c: string): Fab => (g, _r, x, y, w, h) => {
  g.fillStyle = "#efe9dc"; g.fillRect(x, y, w, h);
  for (let xx = x + 6; xx < x + w; xx += 30) { g.fillStyle = c; g.fillRect(xx, y, 9, h); g.fillRect(xx + 14, y, 3, h); }
};
/** checked bed linen */
const check = (a: string, b: string): Fab => (g, _r, x, y, w, h) => {
  g.fillStyle = a; g.fillRect(x, y, w, h);
  g.fillStyle = b;
  for (let xx = x; xx < x + w; xx += 44) g.fillRect(xx, y, 22, h);
  g.fillStyle = "rgba(255,255,255,0.25)";
  for (let yy = y; yy < y + h; yy += 44) g.fillRect(x, yy, w, 22);
};
const RED = plain("#c8402e"), YEL = plain("#e8b42e"), ORA = plain("#de7a2a"), SKY = plain("#4f8ccf"), CREAM = plain("#efe6d0"), BROWN = plain("#8a5a3a");
const TENT = tent("#55803c"), TENTO = tent("#d9862f");
const TICK = ticking("#3f5f9a"), TICKR = ticking("#b84a3a");
/** bands from the mouth (v 0) to the crown (v 1): [v0, v1, main fabric, patch fabrics] */
export const BANDS: [number, number, Fab, Fab[]][] = [
  [0.0, 0.1, BROWN, [BROWN]],
  [0.1, 0.22, RED, [ORA, RED]],
  [0.22, 0.36, umbrella, [umbrella2, umbrella]],         // umbrella silk band
  [0.36, 0.47, TICK, [TICKR, TICK]],                      // bed ticking
  [0.47, 0.6, TENT, [TENTO, TENT]],                       // tent nylon band (green)
  [0.6, 0.72, YEL, [check("#e8b42e", "rgba(200,80,40,0.5)"), YEL]],
  [0.72, 0.84, SKY, [CREAM, SKY]],
  [0.84, 1.0, ORA, [RED]],
];
/** v (0 mouth .. 1 crown) of the umbrella / tent band centres, for the close-up camera */
export const BAND_V = { umbrella: 0.29, tent: 0.535 };
export const GORES = 16;
const patchDraw = (g: G, r: R, W: number, H: number) => {
  const gw = W / GORES;
  for (const [v0, v1, main, alt] of BANDS) {
    const y0 = (1 - v1) * H, y1 = (1 - v0) * H;
    for (let k = 0; k < GORES; k++) {
      const f = r() < 0.28 ? pick(r, alt) : main;
      f(g, r, k * gw, y0, gw + 1, y1 - y0 + 1);
      // a few small patches sewn over (darning, extra pieces)
      if (r() < 0.18) { const pw = U(r, 0.3, 0.6) * gw, ph = U(r, 0.25, 0.5) * (y1 - y0), px = k * gw + U(r, 0, gw - pw), py = y0 + U(r, 0, y1 - y0 - ph); pick(r, [RED, YEL, CREAM, TICK, TENT])(g, r, px, py, pw, ph);
        g.strokeStyle = "rgba(40,30,40,0.55)"; g.lineWidth = 3; g.setLineDash([7, 6]); g.strokeRect(px + 2, py + 2, pw - 4, ph - 4); g.setLineDash([]); }
    }
    // band seam: dark line + stitches
    g.fillStyle = "rgba(40,28,36,0.85)"; g.fillRect(0, y0 - 3, W, 6);
    g.fillStyle = "rgba(250,240,220,0.7)"; for (let x = 0; x < W; x += 18) g.fillRect(x, y0 + 6, 9, 2);
  }
  for (let k = 0; k <= GORES; k++) { // gore seams (load tapes)
    g.fillStyle = "rgba(40,28,36,0.85)"; g.fillRect(k * gw - 3, 0, 6, H);
    g.fillStyle = "rgba(250,240,220,0.55)"; for (let y = 0; y < H; y += 18) g.fillRect(k * gw + 5, y, 2, 9);
  }
  // soft fabric wrinkles
  for (let i = 0; i < 160; i++) { const x = U(r, 0, W), y = U(r, 0, H); g.strokeStyle = `rgba(${r() < 0.5 ? "255,255,255" : "30,20,40"},0.08)`; g.lineWidth = U(r, 3, 8); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + U(r, -30, 30), y + 40, x + U(r, -20, 20), y + U(r, 60, 140)); g.stroke(); }
};
export const patchTex = () => ctex("bPatch", 4096, 2048, (g, r) => patchDraw(g, r, 4096, 2048));
/** the same envelope seen lit from inside/below by the burner: strong near the mouth, fading toward the crown */
export const patchGlow = () => ctex("bPatchGlow", 1024, 1024, (g) => {
  g.drawImage(patchTex().image as HTMLCanvasElement, 0, 0, 1024, 1024);
  const gr = g.createLinearGradient(0, 1024, 0, 0);
  gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.25, "rgba(0,0,0,0.25)"); gr.addColorStop(0.6, "rgba(0,0,0,0.72)"); gr.addColorStop(1, "rgba(0,0,0,0.9)");
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
});
/** the first balloon: one plain mustard cotton, gore seams only */
export const plainTex = () => ctex("bPlain", 1024, 1024, (g, r) => {
  const W = 1024, H = 1024, gw = W / 12;
  plain("#e2b84e", "rgba(60,40,10,0.06)")(g, r, 0, 0, W, H);
  for (let i = 0; i < 40; i++) blot(g, U(r, 0, W), U(r, 0, H), U(r, 30, 90), pick(r, ["#b8903e", "#d8b264"]), 0.35);
  for (let k = 0; k <= 12; k++) { g.fillStyle = "rgba(60,40,30,0.7)"; g.fillRect(k * gw - 2, 0, 4, H); }
  for (let y = 0; y < H; y += 128) { g.fillStyle = "rgba(60,40,30,0.5)"; g.fillRect(0, y, W, 3); }
});

// ---------------- border ----------------
/** expanded-metal fence mesh: alpha texture, 256 px = 0.5 m */
export const meshTex = () => ctex("bMesh", 256, 256, (g) => {
  g.clearRect(0, 0, 256, 256);
  g.strokeStyle = "#a7adb4"; g.lineWidth = 5;
  const S = 32;
  for (let k = -256; k < 512; k += S) {
    g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 256, 256); g.stroke();
    g.beginPath(); g.moveTo(k + 256, 0); g.lineTo(k, 256); g.stroke();
  }
});
/** forest seen from above (aerial shots): crowded crowns, 1024 px = 40 m */
export const canopyTex = (key = "bCanopy", base = "#2f5a3a", cols = ["#3a6e44", "#2f6040", "#44784a", "#355f3c", "#4a7e4e"]) => ctex(key, 1024, 1024, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 900; i++) {
    const x = U(r, 0, 1024), y = U(r, 0, 1024), rad = U(r, 14, 30), c = pick(r, cols);
    for (const [ox, oy] of [[0, 0], [1024, 0], [-1024, 0], [0, 1024], [0, -1024]]) {
      g.fillStyle = "rgba(15,30,20,0.45)"; g.beginPath(); g.arc(x + ox + 4, y + oy + 5, rad, 0, 6.3); g.fill();
      g.fillStyle = c; g.beginPath(); g.arc(x + ox, y + oy, rad, 0, 6.3); g.fill();
      g.fillStyle = "rgba(200,230,170,0.16)"; g.beginPath(); g.arc(x + ox - rad * 0.3, y + oy - rad * 0.3, rad * 0.5, 0, 6.3); g.fill();
    }
  }
});
/** forest floor: needles, moss and leaf litter (8 m tile) */
export const floorTex = () => ctex("bFloor", 1024, 1024, (g, r) => {
  g.fillStyle = "#6a6a3e"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 90; i++) blot(g, U(r, 0, 1024), U(r, 0, 1024), U(r, 40, 160), pick(r, ["#5a7a3e", "#7a6a42", "#8a7448", "#4f6a38"]), 0.45);
  speckle(g, r, 1024, 1024, 9000, ["rgba(60,40,20,0.4)", "rgba(200,190,130,0.3)", "rgba(40,70,30,0.35)"], 1, 4);
  for (let i = 0; i < 300; i++) { const x = U(r, 0, 1024), y = U(r, 0, 1024), a = U(r, 0, 3.14); g.strokeStyle = "rgba(120,80,40,0.45)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 14 * Math.cos(a), y + 14 * Math.sin(a)); g.stroke(); }
});
/** meadow: fresh grass with flowers dots (8 m tile) */
export const meadowTex = () => ctex("bMeadow", 1024, 1024, (g, r) => {
  g.fillStyle = "#79a64a"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 80; i++) blot(g, U(r, 0, 1024), U(r, 0, 1024), U(r, 40, 180), pick(r, ["#6a9a42", "#8ab456", "#9aae5a", "#5f8e3e"]), 0.4);
  speckle(g, r, 1024, 1024, 12000, ["rgba(40,70,30,0.35)", "rgba(210,230,150,0.3)"], 1, 3);
  for (let i = 0; i < 260; i++) { g.fillStyle = pick(r, ["#f4f0e0", "#f2d04a", "#e8e0f0"]); g.beginPath(); g.arc(U(r, 0, 1024), U(r, 0, 1024), U(r, 2, 4), 0, 6.3); g.fill(); }
});
/** dirt / gravel road (8 m tile) */
export const roadTex = () => ctex("bRoad", 1024, 1024, (g, r) => {
  g.fillStyle = "#a99a7e"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 70; i++) blot(g, U(r, 0, 1024), U(r, 0, 1024), U(r, 30, 140), pick(r, ["#988a6e", "#b8aa8c", "#8e8268"]), 0.45);
  speckle(g, r, 1024, 1024, 9000, ["rgba(70,60,50,0.4)", "rgba(240,230,210,0.35)"], 1, 3.5);
  for (const x of [300, 724]) { g.fillStyle = "rgba(90,78,60,0.25)"; g.fillRect(x - 60, 0, 120, 1024); }
});

// ---------------- village ----------------
export type Tex2 = { map: THREE.CanvasTexture; glow: THREE.CanvasTexture };
/** village house wall: plaster colour, white-framed windows with curtains, a door, optional timber frame.
 *  w x h metres at 64 px/m; glow = window panes, about half lit warm (night / dusk). */
export const vfacade = (key: string, w: number, h: number, o: { wall: string; frame?: string; door?: boolean; timber?: boolean; shutter?: string }, lit = 0.5): Tex2 => {
  const PX = 64, W = Math.round(w * PX), H = Math.round(h * PX);
  const wins: [number, number, number, number, boolean][] = [];
  const map = ctex("bVf" + key, W, H, (g, r) => {
    g.fillStyle = o.wall; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 30; i++) blot(g, U(r, 0, W), U(r, 0, H), U(r, 20, 90), pick(r, ["#ffffff", "#000000"]), 0.05);
    speckle(g, r, W, H, (W * H) / 60, ["rgba(80,70,60,0.18)", "rgba(255,255,255,0.25)"]);
    g.fillStyle = "rgba(60,50,45,0.18)"; g.fillRect(0, H - 0.5 * PX, W, 0.5 * PX); // splash zone
    if (o.timber) {
      g.fillStyle = "#5a3a26";
      for (let y of [0.05, h / 2, h - 0.15]) g.fillRect(0, H - y * PX - 10, W, 14);
      for (let x = 0; x <= w + 0.01; x += 1.4) g.fillRect(x * PX - 7, 0, 14, H);
      for (let x = 0; x < w - 1; x += 2.8) { g.save(); g.lineWidth = 12; g.strokeStyle = "#5a3a26"; g.beginPath(); g.moveTo(x * PX, H - (h / 2) * PX); g.lineTo((x + 1.4) * PX, 0.2 * PX); g.stroke(); g.restore(); }
    }
    const floors = Math.max(1, Math.floor(h / 2.6)), n = Math.max(1, Math.floor(w / 2.0));
    for (let fl = 0; fl < floors; fl++) for (let i = 0; i < n; i++) {
      const cx = ((i + 0.5) / n) * W, yb = H - (fl * 2.6 + 0.95) * PX;
      if (o.door && fl === 0 && i === Math.floor(n / 2)) { // door
        const dw = 1.0 * PX, dh = 2.05 * PX;
        g.fillStyle = "#e8e0cc"; g.fillRect(cx - dw / 2 - 8, H - dh - 8, dw + 16, dh + 8);
        g.fillStyle = "#6a3e26"; g.fillRect(cx - dw / 2, H - dh, dw, dh);
        g.fillStyle = "rgba(0,0,0,0.2)"; for (let k = 0; k < 3; k++) g.fillRect(cx - dw / 2 + 8 + k * (dw - 16) / 3, H - dh + 10, (dw - 16) / 3 - 8, dh * 0.4);
        g.fillStyle = "#e0b84a"; g.beginPath(); g.arc(cx + dw * 0.32, H - dh * 0.48, 4, 0, 6.3); g.fill();
        continue;
      }
      const ww = 0.95 * PX, wh = 1.25 * PX, x0 = cx - ww / 2, y0 = yb - wh;
      if (o.shutter) { g.fillStyle = o.shutter; g.fillRect(x0 - 0.42 * PX, y0, 0.36 * PX, wh); g.fillRect(x0 + ww + 0.06 * PX, y0, 0.36 * PX, wh); }
      g.fillStyle = o.frame ?? "#f2eee6"; g.fillRect(x0 - 7, y0 - 7, ww + 14, wh + 14);
      g.fillStyle = "#3a4a66"; g.fillRect(x0, y0, ww, wh);
      g.fillStyle = "rgba(190,215,240,0.35)"; g.beginPath(); g.moveTo(x0, y0 + wh * 0.6); g.lineTo(x0 + ww * 0.6, y0); g.lineTo(x0 + ww * 0.8, y0); g.lineTo(x0, y0 + wh * 0.85); g.fill();
      g.fillStyle = "#f4efe4"; g.fillRect(x0, y0, ww * 0.22, wh); g.fillRect(x0 + ww * 0.78, y0, ww * 0.22, wh); // net curtains
      g.fillStyle = o.frame ?? "#f2eee6"; g.fillRect(cx - 3, y0, 6, wh); g.fillRect(x0, y0 + wh * 0.35, ww, 6);
      g.fillStyle = "#cfc6b4"; g.fillRect(x0 - 10, yb + 4, ww + 20, 10); // sill
      if (r() < 0.25) for (let k = 0; k < 5; k++) { g.fillStyle = pick(r, ["#d8483a", "#f2c94a", "#e86a9a"]); g.beginPath(); g.arc(x0 + 8 + k * (ww - 16) / 4, yb - 2, 7, 0, 6.3); g.fill(); }
      wins.push([x0, y0, ww, wh, r() < lit]);
    }
  });
  const glow = ctex("bVg" + key, W, H, (g, r) => {
    g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
    void r;
    for (const [x0, y0, ww, wh, on] of wins) {
      if (!on) continue;
      const gr = g.createRadialGradient(x0 + ww / 2, y0 + wh / 2, 2, x0 + ww / 2, y0 + wh / 2, wh * 0.7);
      gr.addColorStop(0, "#ffe0a0"); gr.addColorStop(1, "#d88a3a");
      g.fillStyle = gr; g.fillRect(x0, y0, ww, wh);
      g.fillStyle = "rgba(255,240,200,0.6)"; g.fillRect(x0, y0, ww * 0.22, wh); g.fillRect(x0 + ww * 0.78, y0, ww * 0.22, wh);
      g.fillStyle = "#000"; g.fillRect(x0 + ww / 2 - 3, y0, 6, wh); g.fillRect(x0, y0 + wh * 0.35, ww, 6);
    }
  });
  return { map, glow };
};
/** slate roof (village): small dark blue-grey scales, 512 px = 3 m */
export const slateTex = (key: string, base: string) => ctex("bSlate" + key, 512, 512, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  const S = 32;
  for (let y = 0; y < 512 + S; y += S * 0.7) for (let x = -S; x < 512 + S; x += S) {
    const ox = (Math.round(y / (S * 0.7)) % 2) * S * 0.5, c = new THREE.Color(base).multiplyScalar(U(r, 0.85, 1.12));
    g.fillStyle = "#" + c.getHexString(); g.beginPath(); g.ellipse(x + ox, y, S * 0.48, S * 0.42, 0, 0, Math.PI); g.fill();
    g.strokeStyle = "rgba(20,20,30,0.35)"; g.lineWidth = 2; g.beginPath(); g.ellipse(x + ox, y, S * 0.48, S * 0.42, 0, 0, Math.PI); g.stroke();
  }
});

// ---------------- interiors ----------------
/** 1970s wallpaper: big orange / brown circles on cream */
export const wall70Tex = (key: string, base: string, a: string, b: string) => ctex("bW70" + key, 512, 512, (g) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) {
    const cx = 85 + x * 171 + (y % 2) * 85, cy = 85 + y * 171;
    for (const [rr, c] of [[70, a], [52, base], [36, b], [18, base]] as const) { g.fillStyle = c; g.beginPath(); g.arc(cx % 512, cy, rr, 0, 6.3); g.fill(); }
  }
});
/** lino floor: muted check */
export const linoTex = (key: string, a: string, b: string) => ctex("bLino" + key, 512, 512, (g, r) => {
  const S = 64;
  for (let y = 0; y < 512; y += S) for (let x = 0; x < 512; x += S) { g.fillStyle = ((x + y) / S) % 2 ? a : b; g.fillRect(x, y, S, S); }
  speckle(g, r, 512, 512, 2500, ["rgba(60,50,40,0.18)", "rgba(255,255,255,0.18)"]);
});
/** shelf of fabric bolts seen end-on (a stack of rolls), for shop back walls: 512 x 256 = 2 m x 1 m */
export const boltsTex = (key: string, cols: string[]) => ctex("bBolts" + key, 512, 256, (g, r) => {
  g.fillStyle = "#4a3020"; g.fillRect(0, 0, 512, 256);
  for (let row = 0; row < 3; row++) for (let x = 0; x < 512; ) {
    const w = U(r, 40, 70), c = pick(r, cols), y = 10 + row * 82;
    g.fillStyle = c; g.fillRect(x + 2, y, w - 4, 74);
    g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(x + 2, y + 50, w - 4, 24);
    g.fillStyle = "rgba(255,255,255,0.2)"; g.fillRect(x + 6, y + 6, w - 12, 8);
    g.strokeStyle = "rgba(36,23,38,0.8)"; g.lineWidth = 3; g.strokeRect(x + 2, y, w - 4, 74);
    x += w;
  }
});
