// Painted textures of the Palast short (Hauterives 1879-1912): the palace's pebble conglomerate (river stones, shells
// and tufa set in lime mortar), the dirt path, a neutral detail texture for the vertex-coloured hills, cemetery
// gravel, the plaque (a star, no letters). Canvas2D, cached by ctex.
import { ctex } from "./paint";

type G = CanvasRenderingContext2D;
type R = () => number;
const U = (r: R, a: number, b: number) => a + (b - a) * r();
const pick = <T,>(r: R, a: T[]) => a[Math.floor(r() * a.length) % a.length];
const TAU = Math.PI * 2;
const wrap2 = (W: number, H: number, x: number, y: number, rad: number, fn: (x: number, y: number) => void) => {
  for (const ox of [-W, 0, W]) for (const oy of [-H, 0, H]) {
    const xx = x + ox, yy = y + oy;
    if (xx + rad < 0 || xx - rad > W || yy + rad < 0 || yy - rad > H) continue;
    fn(xx, yy);
  }
};
const blot = (g: G, x: number, y: number, rad: number, rgb: string, a: number, sx = 1) => {
  const gr = g.createRadialGradient(x, y, 0, x, y, rad);
  gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.save(); g.translate(x, y); g.scale(sx, 1); g.translate(-x, -y);
  g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); g.restore();
};

/** the palace stone: warm beige lime mortar packed with rounded pebbles, a few shells and dark crevices; 1024 px = 2.4 m */
export const pebbleTex = (key = "pPebble", base = "#d9c59e", cols = ["#eadcbd", "#ccb48a", "#b99c72", "#dcc8a2", "#a9967a", "#f0e6d0", "#c7a878", "#b8a690"], hi = true) =>
  ctex(key, 1024, 1024, (g, r) => {
    const S = 1024;
    g.fillStyle = base; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 26; i++) { const x = U(r, 0, S), y = U(r, 0, S), rad = U(r, 80, 220), d = r() < 0.55; wrap2(S, S, x, y, rad, (xx, yy) => blot(g, xx, yy, rad, d ? "120,95,60" : "255,246,222", d ? 0.12 : 0.14, 1.3)); }
    for (let i = 0; i < 1500; i++) {
      const x = U(r, 0, S), y = U(r, 0, S), rx = U(r, 4, 15), ry = rx * U(r, 0.55, 0.95), a = U(r, 0, TAU), c = pick(r, cols);
      wrap2(S, S, x, y, rx + 4, (xx, yy) => {
        g.fillStyle = "rgba(92,70,46,0.32)"; g.beginPath(); g.ellipse(xx + 1.2, yy + 1.8, rx + 1.4, ry + 1.4, a, 0, TAU); g.fill();
        g.fillStyle = c; g.beginPath(); g.ellipse(xx, yy, rx, ry, a, 0, TAU); g.fill();
        g.fillStyle = hi ? "rgba(255,252,240,0.35)" : "rgba(255,240,220,0.06)"; g.beginPath(); g.ellipse(xx - rx * 0.25, yy - ry * 0.3, rx * 0.45, ry * 0.35, a, 0, TAU); g.fill();
      });
    }
    for (let i = 0; i < (hi ? 40 : 0); i++) { // shells: little fans with ribs
      const x = U(r, 0, S), y = U(r, 0, S), s = U(r, 9, 16), a = U(r, 0, TAU);
      wrap2(S, S, x, y, s * 2, (xx, yy) => {
        g.save(); g.translate(xx, yy); g.rotate(a);
        g.fillStyle = "#f3ead8"; g.beginPath(); g.moveTo(0, s * 0.6); g.arc(0, 0, s, Math.PI * 1.1, Math.PI * 1.9); g.closePath(); g.fill();
        g.strokeStyle = "rgba(120,95,70,0.55)"; g.lineWidth = 1.2;
        for (let k = 0; k < 5; k++) { const t = Math.PI * (1.15 + k * 0.17); g.beginPath(); g.moveTo(0, s * 0.6); g.lineTo(Math.cos(t) * s, Math.sin(t) * s); g.stroke(); }
        g.restore();
      });
    }
    g.lineCap = "round";
    for (let i = 0; i < 70; i++) { // dark crevices between the stones
      let x = U(r, 0, S), y = U(r, 0, S);
      g.strokeStyle = `rgba(82,60,40,${U(r, 0.18, 0.34)})`; g.lineWidth = U(r, 1.5, 3.5);
      g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 6; k++) { x += U(r, -22, 22); y += U(r, -14, 22); g.lineTo(x, y); }
      g.stroke();
    }
    for (let i = 0; i < 16; i++) { // drip streaks
      const x = U(r, 0, S), y = U(r, 0, S), h = U(r, 60, 200);
      const gr = g.createLinearGradient(0, y, 0, y + h);
      gr.addColorStop(0, "rgba(110,88,60,0.16)"); gr.addColorStop(1, "rgba(110,88,60,0)");
      g.fillStyle = gr; g.fillRect(x, y, U(r, 6, 16), h);
    }
  });

/** dark stone for eyes and niches */
export const darkStoneTex = () => pebbleTex("pPebbleDark", "#5e4c3a", ["#665240", "#5a4836", "#6a5644", "#584634"], false);

/** the dirt path: ochre earth, two wheel ruts, a grass strip in the middle, pebbles; 1024 px = 4 m, u along the path */
export const dirtTex = () => ctex("pDirt", 1024, 1024, (g, r) => {
  const S = 1024;
  g.fillStyle = "#d7b98a"; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 30; i++) { const x = U(r, 0, S), y = U(r, 0, S), rad = U(r, 60, 200), d = r() < 0.5; wrap2(S, S, x, y, rad, (xx, yy) => blot(g, xx, yy, rad, d ? "150,110,70" : "250,232,200", d ? 0.16 : 0.18, 2.4)); }
  for (const yc of [0.27, 0.73]) { // ruts along u (x)
    const gr = g.createLinearGradient(0, S * (yc - 0.07), 0, S * (yc + 0.07));
    gr.addColorStop(0, "rgba(140,100,60,0)"); gr.addColorStop(0.5, "rgba(140,100,60,0.22)"); gr.addColorStop(1, "rgba(140,100,60,0)");
    g.fillStyle = gr; g.fillRect(0, S * (yc - 0.07), S, S * 0.14);
  }
  g.lineWidth = 2; g.lineCap = "round";
  for (let i = 0; i < 260; i++) { // the grass strip between the ruts
    const x = U(r, 0, S), y = S * U(r, 0.42, 0.58), h = U(r, 6, 16);
    g.strokeStyle = r() < 0.5 ? "rgba(110,150,60,0.55)" : "rgba(150,180,80,0.5)";
    g.beginPath(); g.moveTo(x - 3, y - h); g.lineTo(x, y); g.lineTo(x + 3, y - h * 0.8); g.stroke();
  }
  for (let i = 0; i < 700; i++) {
    const x = U(r, 0, S), y = U(r, 0, S), s = U(r, 2, 7), c = pick(r, ["#efe2c8", "#b89c74", "#c9b08a", "#a8906c", "#e2d2b2"]);
    wrap2(S, S, x, y, s + 2, (xx, yy) => {
      g.fillStyle = "rgba(100,75,45,0.35)"; g.beginPath(); g.ellipse(xx + 1, yy + 1.5, s + 1, s * 0.75 + 1, 0, 0, TAU); g.fill();
      g.fillStyle = c; g.beginPath(); g.ellipse(xx, yy, s, s * 0.75, 0, 0, TAU); g.fill();
    });
  }
  for (const y of [0, S]) for (let i = 0; i < 160; i++) { // grassy verges at both edges
    const x = U(r, 0, S), yy = y + (y ? -1 : 1) * U(r, 0, 40), h = U(r, 8, 20);
    g.strokeStyle = r() < 0.5 ? "rgba(100,150,55,0.7)" : "rgba(140,180,70,0.65)";
    g.beginPath(); g.moveTo(x - 3, yy - h); g.lineTo(x, yy); g.lineTo(x + 3, yy - h * 0.8); g.stroke();
  }
});

/** neutral detail for the vertex-coloured hills (multiplied by the field colours): soft light / dark dabs and tufts */
export const hillDetailTex = () => ctex("pHillDetail", 512, 512, (g, r) => {
  const S = 512;
  g.fillStyle = "#e6e6e6"; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 40; i++) { const x = U(r, 0, S), y = U(r, 0, S), rad = U(r, 30, 110), d = r() < 0.5; wrap2(S, S, x, y, rad, (xx, yy) => blot(g, xx, yy, rad, d ? "140,140,140" : "255,255,255", 0.22)); }
  g.lineWidth = 1.6; g.lineCap = "round";
  for (let i = 0; i < 700; i++) {
    const x = U(r, 0, S), y = U(r, 0, S), h = U(r, 4, 9);
    g.strokeStyle = r() < 0.5 ? "rgba(255,255,255,0.35)" : "rgba(120,120,120,0.3)";
    g.beginPath(); g.moveTo(x - 2, y - h); g.lineTo(x, y); g.lineTo(x + 2, y - h); g.stroke();
  }
});

/** gravel (garden walks, cemetery) */
export const gravelTex = () => ctex("pGravel", 1024, 1024, (g, r) => {
  const S = 1024;
  g.fillStyle = "#e3d3b4"; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 18; i++) { const x = U(r, 0, S), y = U(r, 0, S), rad = U(r, 80, 220); wrap2(S, S, x, y, rad, (xx, yy) => blot(g, xx, yy, rad, r() < 0.5 ? "160,130,90" : "255,250,235", 0.12)); }
  for (let i = 0; i < 2600; i++) {
    const x = U(r, 0, S), y = U(r, 0, S), s = U(r, 1.5, 4.5);
    g.fillStyle = pick(r, ["rgba(150,125,95,0.55)", "rgba(250,244,230,0.7)", "rgba(185,160,125,0.6)", "rgba(120,100,80,0.45)"]);
    g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill();
  }
});

/** ploughed / crop rows for near fields: stripes along u */
export const rowsTex = (key: string, soil: string, crop: string, dots = false) => ctex("pRows" + key, 512, 512, (g, r) => {
  const S = 512;
  g.fillStyle = soil; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 20; i++) { const x = U(r, 0, S), y = U(r, 0, S), rad = U(r, 40, 120); wrap2(S, S, x, y, rad, (xx, yy) => blot(g, xx, yy, rad, r() < 0.5 ? "90,70,40" : "255,240,210", 0.12)); }
  for (let row = 0; row < 8; row++) {
    const y = (row + 0.5) * (S / 8);
    if (dots) for (let x = 8; x < S; x += 22) {
      const s = U(r, 7, 11);
      g.fillStyle = "rgba(40,50,20,0.35)"; g.beginPath(); g.arc(x + 2, y + 3, s, 0, TAU); g.fill();
      g.fillStyle = crop; g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill();
      g.fillStyle = "rgba(255,255,220,0.25)"; g.beginPath(); g.arc(x - 2, y - 3, s * 0.5, 0, TAU); g.fill();
    } else {
      g.fillStyle = crop; g.fillRect(0, y - 16, S, 32);
      g.fillStyle = "rgba(255,255,230,0.22)"; g.fillRect(0, y - 16, S, 7);
      g.fillStyle = "rgba(40,30,20,0.18)"; g.fillRect(0, y + 10, S, 6);
      for (let x = 0; x < S; x += 6) { g.fillStyle = `rgba(255,255,255,${U(r, 0, 0.12)})`; g.fillRect(x, y - 16 + U(r, 0, 26), 2, 6); }
    }
  }
});

/** the monument plaque: enamelled oval, a five-pointed star in a ring, an abstract wavy band below (no letters) */
export const plaqueTex = () => ctex("pPlaque", 512, 384, (g) => {
  g.fillStyle = "#2d4c8a"; g.beginPath(); g.ellipse(256, 192, 246, 182, 0, 0, TAU); g.fill();
  g.strokeStyle = "#e8c45a"; g.lineWidth = 14; g.beginPath(); g.ellipse(256, 192, 228, 166, 0, 0, TAU); g.stroke();
  g.strokeStyle = "#f4ead2"; g.lineWidth = 8; g.beginPath(); g.arc(256, 160, 82, 0, TAU); g.stroke();
  const star: [number, number][] = [];
  for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU - Math.PI / 2, rad = i % 2 ? 26 : 64; star.push([256 + rad * Math.cos(a), 160 + rad * Math.sin(a)]); }
  g.fillStyle = "#e8c45a"; g.beginPath(); star.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
  g.strokeStyle = "#f4ead2"; g.lineWidth = 7; g.lineCap = "round";
  g.beginPath(); for (let x = 150; x <= 362; x += 4) g.lineTo(x, 286 + 6 * Math.sin(x * 0.12)); g.stroke();
});

/** the night sky: a few soft stars (sprite texture) */
export const starTex = () => ctex("pStar", 64, 64, (g) => {
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,255,240,1)"); gr.addColorStop(0.2, "rgba(255,250,220,0.6)"); gr.addColorStop(1, "rgba(255,250,220,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
});
