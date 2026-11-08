// Static scenery of the balloon short, every set in its own group (only the current shot's set is shown):
//  bor   the inner-German border strip: double fence with concrete posts, raked control strip, plate patrol road,
//        strip lights, a square concrete watchtower (walkway, railing, cabin, searchlight), the barrier, signal
//        fence, forests on both sides (prop spruces near, a canopy field far), far towers
//  vil   the Thuringian village street (plaster + timber-frame houses, slate / tile roofs, the family's door),
//        gardens, church, fields, and the meadow behind the village (MEAD) ringed by forest
//  fog   forest clearing just before a fence line with strip lights (first attempt + the morning after)
//  sew / kit / shop   interiors: sewing room, 70s kitchen, three small fabric shops
//  bay   forest clearing in Bavaria with a hunting stand, hills of forest toward the sunrise
// No letters, numbers, flags or emblems anywhere. Moving parts (barrier, door, needle, searchlight) go to world.ts.
import * as THREE from "three";
import { Batch, boxGeo, quad, tri, lam, prop, setSight, vegCenter, V, Ray, Kit } from "./build";
import { ctex, rng, roofHD, planks, brick, rep } from "./paint";
import { lawnTex, woodTex, sandTex, plateTex, concreteTex, asphaltTex, pavementTex, boomTex } from "./mpaint";
import { wallpaperTex, panelTex, paintingTex, windowTex, plasterTex, tileTex, clockFaceTex } from "./kpaint";
import { plainTex, meshTex, canopyTex, floorTex, meadowTex, roadTex, vfacade, slateTex, wall70Tex, linoTex, boltsTex } from "./bpaint";
import {
  V3, SetKey, BOR, VIL, MEAD, FOG, SEW, KIT, SHOP, BAY, TOWER, TOWER_FLOOR, TOWER_ROOF, LAMP_Y, ROAD, BARRIER, HOUSE_DOOR,
  SEW_TABLE, NEEDLE, KIT_TABLE, SHOPS, BEAM_LEN,
} from "./story";

export type Lamp = { pos: V3; size: number; col: string; pool: number; when: "dusk" | "indoor" | "always" | "night"; set: SetKey };
export type SetParts = {
  lamps: Lamp[]; glowMats: { m: THREE.MeshLambertMaterial; k: number }[];
  groups: Record<SetKey, THREE.Group>;
  barrier: THREE.Group; door: THREE.Group; needle: THREE.Group; wheel: THREE.Group;
  lightYaw: THREE.Group; lightPitch: THREE.Group; beam: THREE.Mesh; beamMat: THREE.ShaderMaterial;
};

// ---------------- helpers ----------------
const col = (key: string, c: string) => lam("b_" + key, () => ({ color: c }));
const tex = (key: string, map: THREE.Texture, extra: THREE.MeshLambertMaterialParameters = {}) => lam("bt_" + key, () => ({ map, ...extra }));
type O = V3;
const Z0: O = [0, 0, 0];
const bx = (b: Batch, m: THREE.Material, o: O, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, tile = 0) =>
  b.add(boxGeo(V(o[0] + Math.min(x0, x1), o[1] + Math.min(y0, y1), o[2] + Math.min(z0, z1)), V(o[0] + Math.max(x0, x1), o[1] + Math.max(y0, y1), o[2] + Math.max(z0, z1)), tile), m);
const cyl = (b: Batch, m: THREE.Material, o: O, x: number, y: number, z: number, r0: number, r1: number, h: number, seg = 16) =>
  b.add(new THREE.CylinderGeometry(r1, r0, h, seg).translate(o[0] + x, o[1] + y + h / 2, o[2] + z), m);
const sph = (b: Batch, m: THREE.Material, o: O, x: number, y: number, z: number, rx: number, ry = rx, rz = rx, seg = 14) =>
  b.add(new THREE.SphereGeometry(1, seg, Math.max(6, seg >> 1)).scale(rx, ry, rz).translate(o[0] + x, o[1] + y, o[2] + z), m);
const P = (o: O, x: number, y: number, z: number) => V(o[0] + x, o[1] + y, o[2] + z);
const ground = (b: Batch, m: THREE.Material, o: O, x0: number, x1: number, z0: number, z1: number, tile: number, y = 0) =>
  b.add(quad(P(o, x0, y, z1), P(o, x1, y, z1), P(o, x1, y, z0), P(o, x0, y, z0), (x1 - x0) / tile, (z1 - z0) / tile), m);
const wallZ = (b: Batch, m: THREE.Material, o: O, x0: number, x1: number, y0: number, y1: number, z: number, face: 1 | -1, tw: number, th: number) =>
  b.add(face > 0 ? quad(P(o, x0, y0, z), P(o, x1, y0, z), P(o, x1, y1, z), P(o, x0, y1, z), (x1 - x0) / tw, (y1 - y0) / th)
    : quad(P(o, x1, y0, z), P(o, x0, y0, z), P(o, x0, y1, z), P(o, x1, y1, z), (x1 - x0) / tw, (y1 - y0) / th), m);
const wallX = (b: Batch, m: THREE.Material, o: O, z0: number, z1: number, y0: number, y1: number, x: number, face: 1 | -1, tw: number, th: number) =>
  b.add(face > 0 ? quad(P(o, x, y0, z1), P(o, x, y0, z0), P(o, x, y1, z0), P(o, x, y1, z1), (z1 - z0) / tw, (y1 - y0) / th)
    : quad(P(o, x, y0, z0), P(o, x, y0, z1), P(o, x, y1, z1), P(o, x, y1, z0), (z1 - z0) / tw, (y1 - y0) / th), m);
const glowMat = (key: string, map: THREE.Texture, glow: THREE.Texture, out: SetParts["glowMats"], k = 1.4) => {
  const m = lam("bg_" + key, () => ({ map, emissiveMap: glow, emissive: new THREE.Color(1, 1, 1), emissiveIntensity: 0 })) as THREE.MeshLambertMaterial;
  if (!out.some((g) => g.m === m)) out.push({ m, k });
  return m;
};
const basics = new Map<string, THREE.MeshBasicMaterial>();
const bright = (key: string, p: THREE.MeshBasicMaterialParameters) => { let m = basics.get(key); if (!m) { m = new THREE.MeshBasicMaterial(p); basics.set(key, m); } return m; };
let CUR: SetKey = "bor";
const lamp = (parts: SetParts, l: Omit<Lamp, "set">) => parts.lamps.push({ ...l, set: CUR });
const tree = (b: Batch, x: number, z: number, h: number, kind = "spruce", seed = 0, y = 0, q?: number) => prop(b, {}, kind, x, y, z, h, seed, q);
const mtx = (x: number, y: number, z: number, yaw = 0) => new THREE.Matrix4().makeRotationY(yaw).setPosition(x, y, z);

// ---------------- forest field: canopy seen from above + dark trunk skirts at its edges ----------------
/** forest edge seen from the side: a crowd of spruce silhouettes with jagged tips (alpha cut-out), trunks below */
const skirtTex = () => ctex("bSkirt", 512, 256, (g, r) => {
  g.clearRect(0, 0, 512, 256);
  g.fillStyle = "#2a3a2a"; g.fillRect(0, 150, 512, 106);
  for (let i = 0; i < 40; i++) { const x = r() * 512; g.fillStyle = r() < 0.5 ? "#4a3428" : "#5a4030"; g.fillRect(x, 150, 4 + r() * 4, 106); }
  for (let layer = 0; layer < 2; layer++) for (let i = 0; i < 26; i++) {
    const x = (i / 26) * 512 + r() * 14, top = (layer ? 22 : 4) + r() * 26, w = 26 + r() * 16, c = layer ? ["#3a6e44", "#447a4c", "#356a40"][i % 3] : ["#2a5236", "#244a30", "#2f5a3a"][i % 3];
    for (const ox of [-512, 0, 512]) {
      g.fillStyle = c; g.beginPath(); g.moveTo(x + ox, top);
      for (let k = 1; k <= 5; k++) { const y = top + k * (190 - top) / 5, hw = w * (k / 5); g.lineTo(x + ox + hw, y); g.lineTo(x + ox + hw * 0.55, y); }
      for (let k = 5; k >= 1; k--) { const y = top + k * (190 - top) / 5, hw = w * (k / 5); g.lineTo(x + ox - hw * 0.55, y); g.lineTo(x + ox - hw, y); }
      g.closePath(); g.fill();
      g.strokeStyle = "rgba(30,20,40,0.6)"; g.lineWidth = 2; g.stroke();
    }
  }
});
const forestField = (b: Batch, cx: number, cz: number, half: number, cell: number, mask: (x: number, z: number) => boolean, hgt: (x: number, z: number) => number, key = "bCanopy") => {
  const n = Math.round((2 * half) / cell), x0 = cx - half, z0 = cz - half;
  const vx = (i: number) => x0 + i * cell, vz = (j: number) => z0 + j * cell;
  const inside = (i: number, j: number) => i >= 0 && j >= 0 && i < n && j < n && mask(vx(i) + cell / 2, vz(j) + cell / 2);
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) { const x = vx(i), z = vz(j); pos.push(x, hgt(x, z), z); uv.push(x / 40, -z / 40); }
  const sk: number[] = [], skuv: number[] = [];
  const skirt = (ax: number, az: number, bx2: number, bz: number) => { // vertical quad a->b, outward to the right of a->b seen from above
    const ya = hgt(ax, az) + 3, yb = hgt(bx2, bz) + 3, L = Math.hypot(bx2 - ax, bz - az) / 8, u0 = (ax + az) / 8;
    sk.push(ax, 0, az, bx2, 0, bz, bx2, yb, bz, ax, 0, az, bx2, yb, bz, ax, ya, az);
    skuv.push(u0, 0, u0 + L, 0, u0 + L, 1, u0, 0, u0 + L, 1, u0, 1);
  };
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    if (!inside(i, j)) continue;
    const a = j * (n + 1) + i, bq = a + 1, c = a + n + 2, d = a + n + 1;
    idx.push(a, d, c, a, c, bq);
    const X0 = vx(i), X1 = vx(i + 1), Z0q = vz(j), Z1 = vz(j + 1);
    if (!inside(i, j - 1)) skirt(X1, Z0q, X0, Z0q);
    if (!inside(i, j + 1)) skirt(X0, Z1, X1, Z1);
    if (!inside(i - 1, j)) skirt(X0, Z0q, X0, Z1);
    if (!inside(i + 1, j)) skirt(X1, Z1, X1, Z0q);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  g.computeVertexNormals();
  b.add(g, tex(key, canopyTex(key)));
  if (sk.length) {
    const s = new THREE.BufferGeometry();
    s.setAttribute("position", new THREE.Float32BufferAttribute(sk, 3)); s.setAttribute("uv", new THREE.Float32BufferAttribute(skuv, 2));
    s.computeVertexNormals();
    b.add(s, tex("skirt", skirtTex(), { side: THREE.DoubleSide, alphaTest: 0.5 }));
  }
};
const wave = (x: number, z: number) => 1.6 * Math.sin(x * 0.11 + 1.3) * Math.sin(z * 0.09) + 0.9 * Math.sin(x * 0.27 + z * 0.19) + 0.6 * Math.sin(z * 0.41 - x * 0.13);

// ---------------- shared props ----------------
/** concrete-post strip light with an arm toward +z */
const stripLight = (b: Batch, parts: SetParts, x: number, z: number, arm = 1.3, h = 6.5) => {
  const c = col("lampPost", "#9c9a94");
  bx(b, c, Z0, x - 0.08, x + 0.08, 0, h, z - 0.08, z + 0.08);
  bx(b, c, Z0, x - 0.05, x + 0.05, h - 0.1, h, z, z + arm);
  bx(b, col("lampHead", "#4a4e58"), Z0, x - 0.18, x + 0.18, h - 0.28, h - 0.04, z + arm - 0.3, z + arm + 0.12);
  b.add(new THREE.BoxGeometry(0.3, 0.04, 0.36).translate(x, h - 0.3, z + arm - 0.09), bright("lampLens", { color: new THREE.Color(1.3, 1.15, 0.85) }));
  lamp(parts, { pos: [x, h - 0.35, z + arm - 0.09], size: 2.6, col: "#ffd9a0", pool: 6, when: "night" });
};
/** expanded-metal fence line along x at z (alpha cut-out mesh both sides), concrete posts every 3 m (within ±px) */
const fenceX = (b: Batch, o: O, x0: number, x1: number, z: number, h: number, px = 150) => {
  const m = tex("fenceMesh", meshTex(), { alphaTest: 0.45, side: THREE.DoubleSide, color: "#c4c8cc" });
  b.add(quad(P(o, x0, 0.05, z), P(o, x1, 0.05, z), P(o, x1, h, z), P(o, x0, h, z), (x1 - x0) / 0.5, (h - 0.05) / 0.5), m);
  const pc = col("fencePost", "#c9c4b8"), wire = col("wire", "#7a8088");
  for (let x = Math.max(x0, -px); x <= Math.min(x1, px); x += 3) {
    bx(b, pc, o, x - 0.07, x + 0.07, 0, h + 0.15, z - 0.07, z + 0.07);
    bx(b, pc, o, x - 0.05, x + 0.05, h + 0.05, h + 0.55, z - 0.05, z + 0.32);  // bent-over top
  }
  for (const y of [h + 0.25, h + 0.45]) bx(b, wire, o, x0, x1, y - 0.012, y + 0.012, z + 0.15 + (y - h) * 0.3, z + 0.17 + (y - h) * 0.3);
  bx(b, wire, o, x0, x1, h - 0.03, h + 0.01, z - 0.02, z + 0.02);
};
/** square concrete watchtower: shaft, walkway slab with railing, glazed cabin (lit at night), roof, ladder */
const watchtower = (b: Batch, parts: SetParts, t: V3, withLight: boolean) => {
  const con = tex("towerCon", concreteTex("bTowerCon", "#cfccc2")), dark = col("towerDark", "#3c4048"), rail = col("rail", "#5a6068");
  bx(b, con, t, -1.1, 1.1, 0, 8.8, -1.1, 1.1, 1.5);
  for (let k = 1; k < 4; k++) bx(b, col("towerJoint", "#a8a49a"), t, -1.12, 1.12, k * 2.2 - 0.03, k * 2.2 + 0.03, -1.12, 1.12);
  bx(b, dark, t, -0.4, 0.4, 0, 1.95, 1.1, 1.13);                                   // steel door
  for (const y of [3.6, 6.2]) bx(b, dark, t, -0.12, 0.12, y, y + 0.6, 1.1, 1.12);  // slits
  bx(b, con, t, -2.6, 2.6, 8.8, TOWER_FLOOR, -2.6, 2.6, 1.5);                       // walkway slab
  bx(b, con, t, -1.5, 1.5, TOWER_FLOOR, 9.85, -1.5, 1.5, 1.5);                      // cabin parapet
  const glass = glowMat("towerGlass", ctex("bTowerGlass", 128, 64, (g) => { g.fillStyle = "#33405e"; g.fillRect(0, 0, 128, 64); g.fillStyle = "rgba(180,210,240,0.3)"; g.fillRect(10, 6, 30, 52); }),
    ctex("bTowerGlassG", 128, 64, (g) => { g.fillStyle = "#c88a40"; g.fillRect(0, 0, 128, 64); g.fillStyle = "#ffe0a0"; g.fillRect(20, 10, 88, 44); }), parts.glowMats, 1.3);
  for (const [face, s] of [["z", 1], ["z", -1], ["x", 1], ["x", -1]] as const) {
    if (face === "z") wallZ(b, glass, t, -1.45, 1.45, 9.85, 10.95, s * 1.46, s as 1 | -1, 2.9, 1.1);
    else wallX(b, glass, t, -1.45, 1.45, 9.85, 10.95, s * 1.46, s as 1 | -1, 2.9, 1.1);
  }
  for (const [x, z] of [[-1.5, -1.5], [1.4, -1.5], [-1.5, 1.4], [1.4, 1.4]]) bx(b, con, t, x, x + 0.1, 9.85, TOWER_ROOF, z, z + 0.1);
  for (const x of [-0.5, 0.45]) { bx(b, dark, t, x, x + 0.05, 9.85, 10.95, 1.46, 1.5); bx(b, dark, t, x, x + 0.05, 9.85, 10.95, -1.5, -1.46); bx(b, dark, t, 1.46, 1.5, 9.85, 10.95, x, x + 0.05); bx(b, dark, t, -1.5, -1.46, 9.85, 10.95, x, x + 0.05); }
  bx(b, con, t, -1.75, 1.75, TOWER_ROOF, TOWER_ROOF + 0.2, -1.75, 1.75, 1.5);      // roof
  // railing: posts + two rails round the walkway
  for (let k = -2.5; k <= 2.51; k += 1.25) for (const [x, z] of [[k, 2.5], [k, -2.5], [2.5, k], [-2.5, k]]) bx(b, rail, t, x - 0.03, x + 0.03, TOWER_FLOOR, TOWER_FLOOR + 1.05, z - 0.03, z + 0.03);
  for (const y of [0.55, 1.05]) {
    const yy = TOWER_FLOOR + y;
    bx(b, rail, t, -2.53, 2.53, yy - 0.03, yy, 2.47, 2.53); bx(b, rail, t, -2.53, 2.53, yy - 0.03, yy, -2.53, -2.47);
    bx(b, rail, t, 2.47, 2.53, yy - 0.03, yy, -2.53, 2.53); bx(b, rail, t, -2.53, -2.47, yy - 0.03, yy, -2.53, 2.53);
  }
  // ladder up the back of the shaft
  for (const x of [-0.25, 0.25]) bx(b, rail, t, x - 0.02, x + 0.02, 0, 8.8, -1.18, -1.14);
  for (let y = 0.3; y < 8.8; y += 0.32) bx(b, rail, t, -0.25, 0.25, y - 0.015, y + 0.015, -1.17, -1.15);
  if (!withLight) bx(b, dark, t, -0.25, 0.25, TOWER_ROOF + 0.2, TOWER_ROOF + 0.6, -0.25, 0.25);
};

// ---------------- village houses ----------------
type HS = { wall: string; roof: string; timber?: boolean; shutter?: string; frame?: string; slate?: boolean };
const HSTY: HS[] = [
  { wall: "#efe2c4", roof: "#a8503a" },
  { wall: "#e8d2a8", roof: "#4a5262", slate: true, shutter: "#3f6a4a" },
  { wall: "#f2ead8", roof: "#9a4a34", timber: true },
  { wall: "#dfc6a0", roof: "#5a5a66", slate: true },
  { wall: "#e6dccc", roof: "#b05a40", shutter: "#7a3a2a" },
  { wall: "#f0dcc0", roof: "#45505e", slate: true, timber: true },
];
const roofM = (s: HS) => (s.slate ? tex("slate" + s.roof, slateTex(s.roof, s.roof), { side: THREE.DoubleSide }) : lam("roofT" + s.roof, () => ({ map: roofHD(s.roof), side: THREE.DoubleSide })));
/** gabled village house: front (local +z) w wide, d deep, wall height h; ridge along local x */
const vhouse = (b: Batch, parts: SetParts, x: number, z: number, yaw: number, w: number, d: number, h: number, si: number, door = true, lit = 0.5) => {
  const s = HSTY[si % HSTY.length], m = mtx(x, 0, z, yaw), k = `${si % HSTY.length}_${w}_${d}_${h}`;
  const tf = vfacade("f" + k + (door ? "d" : ""), w, h, { ...s, door }, lit), ts = vfacade("s" + k, d, h, s, lit * 0.6), tb = vfacade("b" + k, w, h, s, lit * 0.7);
  const fm = glowMat("f" + k + door, tf.map, tf.glow, parts.glowMats), sm = glowMat("s" + k, ts.map, ts.glow, parts.glowMats), bm = glowMat("b" + k, tb.map, tb.glow, parts.glowMats);
  const hw = w / 2, hd = d / 2, rh = d * 0.5, ov = 0.4, wall = col("vwall" + s.wall, s.wall);
  b.add(quad(V(-hw, 0, hd), V(hw, 0, hd), V(hw, h, hd), V(-hw, h, hd)), fm, m);
  b.add(quad(V(hw, 0, -hd), V(-hw, 0, -hd), V(-hw, h, -hd), V(hw, h, -hd)), bm, m);
  b.add(quad(V(-hw, 0, -hd), V(-hw, 0, hd), V(-hw, h, hd), V(-hw, h, -hd)), sm, m);
  b.add(quad(V(hw, 0, hd), V(hw, 0, -hd), V(hw, h, -hd), V(hw, h, hd)), sm, m);
  b.add(tri(V(-hw, h, -hd), V(-hw, h, hd), V(-hw, h + rh, 0)), wall, m);
  b.add(tri(V(hw, h, hd), V(hw, h, -hd), V(hw, h + rh, 0)), wall, m);
  const rm = roofM(s), ru = (w + 2 * ov) / 3, rv = Math.hypot(hd + ov, rh) / 3;
  b.add(quad(V(-hw - ov, h - 0.2, hd + ov), V(hw + ov, h - 0.2, hd + ov), V(hw + ov, h + rh, 0), V(-hw - ov, h + rh, 0), ru, rv), rm, m);
  b.add(quad(V(hw + ov, h - 0.2, -hd - ov), V(-hw - ov, h - 0.2, -hd - ov), V(-hw - ov, h + rh, 0), V(hw + ov, h + rh, 0), ru, rv), rm, m);
  b.add(boxGeo(V(-hw - ov, h + rh - 0.05, -0.12), V(hw + ov, h + rh + 0.12, 0.12)), col("ridge", "#6a4a3a"), m);
  b.add(boxGeo(V(-hw - 0.06, -0.05, -hd - 0.06), V(hw + 0.06, 0.4, hd + 0.06), 2), col("plinth", "#9a9488"), m);
  const cx = hw * 0.4 * (si % 2 ? 1 : -1);
  b.add(boxGeo(V(cx - 0.32, h + rh * 0.4, -0.9), V(cx + 0.32, h + rh + 0.9, -0.3), 1.5), lam("chimB", () => ({ map: rep(brick(), 1, 1) })), m);
  b.add(boxGeo(V(cx - 0.4, h + rh + 0.9, -0.98), V(cx + 0.4, h + rh + 1.02, -0.22)), col("chimCap", "#6a6460"), m);
  // gutters along the eaves
  for (const zz of [hd + ov - 0.05, -hd - ov + 0.05]) b.add(new THREE.CylinderGeometry(0.06, 0.06, w + 2 * ov, 8).rotateZ(Math.PI / 2).translate(0, h - 0.25, zz), col("gutter", "#8a8e92"), m);
};
/** low picket fence along x from x0 to x1 at z (absolute) */
const picket = (b: Batch, x0: number, x1: number, z: number, h = 0.9, c = "#f0ece2") => {
  const m = col("picket" + c, c);
  for (let x = x0; x <= x1; x += 0.22) bx(b, m, Z0, x - 0.04, x + 0.04, 0, h, z - 0.02, z + 0.02);
  for (const y of [0.25, 0.65]) bx(b, m, Z0, x0, x1, y, y + 0.07, z - 0.04, z - 0.02);
};
const picketZ = (b: Batch, z0: number, z1: number, x: number, h = 0.9, c = "#f0ece2") => {
  const m = col("picket" + c, c);
  for (let z = z0; z <= z1; z += 0.22) bx(b, m, Z0, x - 0.02, x + 0.02, 0, h, z - 0.04, z + 0.04);
  for (const y of [0.25, 0.65]) bx(b, m, Z0, x - 0.04, x - 0.02, y, y + 0.07, z0, z1);
};
/** small 70s East-German style two-stroke car (generic, no badges), absolute coordinates */
const smallCar = (b: Batch, x: number, z: number, yaw: number, c: string) => {
  const m = mtx(x, 0, z, yaw), body = col("car" + c, c), blk = col("tyre", "#1e1e24"), glass = col("carGlass", "#3a466a"), chrome = col("chrome", "#c8c8cc");
  b.add(boxGeo(V(-1.75, 0.32, -0.75), V(1.75, 0.85, 0.75)), body, m);
  b.add(boxGeo(V(-1.1, 0.85, -0.68), V(0.6, 1.32, 0.68)), glass, m);
  b.add(boxGeo(V(-1.15, 1.3, -0.7), V(0.65, 1.38, 0.7)), body, m);
  for (const [px, pz] of [[-1.13, -0.7], [-1.13, 0.64], [0.57, -0.7], [0.57, 0.64]]) b.add(boxGeo(V(px, 0.85, pz), V(px + 0.07, 1.32, pz + 0.07)), body, m);
  b.add(boxGeo(V(1.74, 0.38, -0.7), V(1.8, 0.5, 0.7)), chrome, m); b.add(boxGeo(V(-1.8, 0.38, -0.7), V(-1.74, 0.5, 0.7)), chrome, m);
  for (const fx of [1.1, -1.15]) for (const s of [-1, 1]) {
    b.add(new THREE.CylinderGeometry(0.29, 0.29, 0.18, 14).rotateX(Math.PI / 2).translate(fx, 0.29, s * 0.7), blk, m);
    b.add(new THREE.CylinderGeometry(0.13, 0.13, 0.2, 10).rotateX(Math.PI / 2).translate(fx, 0.29, s * 0.71), chrome, m);
  }
  for (const s of [-1, 1]) b.add(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 10).rotateZ(Math.PI / 2).translate(1.78, 0.68, s * 0.5), bright("headl", { color: new THREE.Color(1, 0.95, 0.8) }), m);
};
const streetLamp = (b: Batch, parts: SetParts, x: number, z: number, armDir: number) => {
  const c = col("vlamp", "#3a4a44");
  cyl(b, c, Z0, x, 0, z, 0.08, 0.06, 4.6, 8);
  bx(b, c, Z0, x - 0.03, x + 0.03, 4.5, 4.56, Math.min(z, z + armDir), Math.max(z, z + armDir));
  b.add(new THREE.ConeGeometry(0.28, 0.22, 10, 1, true).translate(x, 4.45, z + armDir), c);
  sph(b, bright("vlampGlass", { color: new THREE.Color(1.3, 1.1, 0.75) }), Z0, x, 4.36, z + armDir, 0.11);
  lamp(parts, { pos: [x, 4.33, z + armDir], size: 1.6, col: "#ffcf8a", pool: 4, when: "dusk" });
};
const woodpile = (b: Batch, x: number, z: number, len: number, yaw = 0) => {
  const m = mtx(x, 0, z, yaw), w = col("logEnd", "#c89a64"), bark = col("logBark", "#6a4a32");
  for (let row = 0; row < 3; row++) for (let i = 0; i < 6 - row; i++) {
    const y = 0.14 + row * 0.24, zz = -0.6 + (i + row * 0.5) * 0.25;
    b.add(new THREE.CylinderGeometry(0.12, 0.12, len, 10).rotateZ(Math.PI / 2).translate(0, y, zz), bark, m);
    for (const s of [-1, 1]) b.add(new THREE.CircleGeometry(0.115, 10).rotateY((s * Math.PI) / 2).translate((s * len) / 2 + s * 0.002, y, zz), w, m);
  }
};
const shed = (b: Batch, x: number, z: number, yaw: number, w = 3, d = 2.4, h = 2.2) => {
  const m = mtx(x, 0, z, yaw), wd = tex("shedWood", planks(), { color: "#a07a58" }), rf = col("tarpaper", "#4a4a52");
  b.add(boxGeo(V(-w / 2, 0, -d / 2), V(w / 2, h, d / 2), 1.2), wd, m);
  b.add(quad(V(-w / 2 - 0.25, h - 0.05, d / 2 + 0.3), V(w / 2 + 0.25, h - 0.05, d / 2 + 0.3), V(w / 2 + 0.25, h + 0.45, -d / 2 - 0.3), V(-w / 2 - 0.25, h + 0.45, -d / 2 - 0.3)), rf, m);
  b.add(boxGeo(V(-0.4, 0, d / 2), V(0.4, 1.8, d / 2 + 0.03)), col("shedDoor", "#5a6a4a"), m);
};
const haybale = (b: Batch, x: number, z: number, yaw = 0) => {
  const m = mtx(x, 0, z, yaw);
  b.add(new THREE.CylinderGeometry(0.62, 0.62, 1.15, 18).rotateZ(Math.PI / 2).translate(0, 0.62, 0), col("hay", "#d8b862"), m);
  for (const s of [-1, 1]) b.add(new THREE.CircleGeometry(0.6, 18).rotateY((s * Math.PI) / 2).translate(s * 0.58, 0.62, 0), col("hayEnd", "#c8a24e"), m);
};
const rock = (b: Batch, x: number, z: number, s: number) => sph(b, col("rock", "#9a968c"), Z0, x, s * 0.25, z, s, s * 0.6, s * 0.8, 9);
const stump = (b: Batch, x: number, z: number, r = 0.25) => {
  cyl(b, col("stump", "#7a5634"), Z0, x, 0, z, r * 1.15, r, 0.35, 10);
  b.add(new THREE.CircleGeometry(r * 0.98, 12).rotateX(-Math.PI / 2).translate(x, 0.351, z), col("stumpTop", "#d8b07a"));
};
const fern = (b: Batch, x: number, z: number, s = 1) => {
  const m = col("fern", "#4f8a3e");
  for (let i = 0; i < 7; i++) { const a = (i / 7) * 6.28 + x; b.add(new THREE.SphereGeometry(1, 8, 5).scale(0.42 * s, 0.1 * s, 0.14 * s).rotateZ(0.5).rotateY(a).translate(x + Math.cos(a) * 0.3 * s, 0.22 * s, z - Math.sin(a) * 0.3 * s), m); }
};
const tuft = (b: Batch, x: number, z: number, s = 1, c = "#6a9a42") => {
  for (let i = 0; i < 5; i++) { const a = i * 1.3 + x * 3.1; b.add(new THREE.ConeGeometry(0.05 * s, 0.45 * s, 4).rotateZ(0.25 * Math.cos(a)).rotateX(0.25 * Math.sin(a)).translate(x + 0.06 * Math.cos(a), 0.2 * s, z + 0.06 * Math.sin(a)), col("tuft" + c, c)); }
};

// ---------------- room helpers ----------------
type RoomM = { floor: THREE.Material; wall: THREE.Material; ceil: THREE.Material; wain?: THREE.Material; floorTile: number; wallTile: number; wainH?: number };
const roomShell = (root: THREE.Object3D, o: O, x0: number, x1: number, z0: number, z1: number, H: number, M: RoomM, skip: ("back" | "front" | "left" | "right")[] = []) => {
  const s = new Batch();
  ground(s, M.floor, o, x0, x1, z0, z1, M.floorTile);
  s.add(quad(P(o, x0, H, z0), P(o, x1, H, z0), P(o, x1, H, z1), P(o, x0, H, z1), (x1 - x0) / 2, (z1 - z0) / 2), M.ceil);
  if (!skip.includes("back")) wallZ(s, M.wall, o, x0, x1, 0, H, z0, 1, M.wallTile, M.wallTile);
  if (!skip.includes("front")) wallZ(s, M.wall, o, x0, x1, 0, H, z1, -1, M.wallTile, M.wallTile);
  if (!skip.includes("left")) wallX(s, M.wall, o, z0, z1, 0, H, x0, 1, M.wallTile, M.wallTile);
  if (!skip.includes("right")) wallX(s, M.wall, o, z0, z1, 0, H, x1, -1, M.wallTile, M.wallTile);
  const wh = M.wainH ?? 1.0, e = 0.03, dark = col("skirtB", "#5a4030"), trim = col("cornice", "#efe8d8");
  if (M.wain) {
    if (!skip.includes("back")) wallZ(s, M.wain, o, x0, x1, 0, wh, z0 + e, 1, 2, wh);
    if (!skip.includes("left")) wallX(s, M.wain, o, z0, z1, 0, wh, x0 + e, 1, 2, wh);
    if (!skip.includes("right")) wallX(s, M.wain, o, z0, z1, 0, wh, x1 - e, -1, 2, wh);
  }
  bx(s, dark, o, x0, x1, 0, 0.09, z0, z0 + 0.03); bx(s, dark, o, x0, x0 + 0.03, 0, 0.09, z0, z1); bx(s, dark, o, x1 - 0.03, x1, 0, 0.09, z0, z1);
  bx(s, trim, o, x0, x1, H - 0.1, H, z0, z0 + 0.08); bx(s, trim, o, x0, x0 + 0.08, H - 0.1, H, z0, z1); bx(s, trim, o, x1 - 0.08, x1, H - 0.1, H, z0, z1);
  s.build(root, false);
};
const roomWindow = (b: Batch, o: O, wall: "left" | "right" | "back", c: number, w: number, y0: number, h: number, at: number, key: string, curtain?: string) => {
  const pane = bright("pane" + key, { map: windowTex(key, false) }), frame = col("winFrame", "#f2eee6"), e = 0.04;
  if (wall === "back") {
    const z = at + e;
    b.add(quad(P(o, c - w / 2, y0, z), P(o, c + w / 2, y0, z), P(o, c + w / 2, y0 + h, z), P(o, c - w / 2, y0 + h, z)), pane);
    bx(b, frame, o, c - w / 2 - 0.1, c + w / 2 + 0.1, y0 - 0.1, y0, at, at + 0.16);
    bx(b, frame, o, c - w / 2 - 0.1, c + w / 2 + 0.1, y0 + h, y0 + h + 0.1, at, at + 0.08);
    for (const xx of [c - w / 2 - 0.1, c - 0.04, c + w / 2]) bx(b, frame, o, xx, xx + (xx === c - 0.04 ? 0.08 : 0.1), y0, y0 + h, at, at + 0.08);
    if (curtain) {
      for (const xx of [c - w / 2 - 0.42, c + w / 2 + 0.06]) bx(b, col("curt" + curtain, curtain), o, xx, xx + 0.36, y0 - 0.25, y0 + h + 0.25, at + 0.08, at + 0.16);
      bx(b, col("rod", "#6a4a2a"), o, c - w / 2 - 0.5, c + w / 2 + 0.5, y0 + h + 0.25, y0 + h + 0.3, at + 0.08, at + 0.16);
    }
  } else {
    const s = wall === "left" ? 1 : -1, x = at + s * e;
    b.add(s > 0 ? quad(P(o, x, y0, c + w / 2), P(o, x, y0, c - w / 2), P(o, x, y0 + h, c - w / 2), P(o, x, y0 + h, c + w / 2)) : quad(P(o, x, y0, c - w / 2), P(o, x, y0, c + w / 2), P(o, x, y0 + h, c + w / 2), P(o, x, y0 + h, c - w / 2)), pane);
    bx(b, frame, o, at, at + s * 0.16, y0 - 0.1, y0, c - w / 2 - 0.1, c + w / 2 + 0.1);
    bx(b, frame, o, at, at + s * 0.08, y0 + h, y0 + h + 0.1, c - w / 2 - 0.1, c + w / 2 + 0.1);
    for (const zz of [c - w / 2 - 0.1, c + w / 2]) bx(b, frame, o, at, at + s * 0.08, y0, y0 + h, zz, zz + 0.1);
    if (curtain) for (const zz of [c - w / 2 - 0.42, c + w / 2 + 0.06]) bx(b, col("curt" + curtain, curtain), o, at + s * 0.08, at + s * 0.16, y0 - 0.25, y0 + h + 0.25, zz, zz + 0.36);
  }
};
const picture = (b: Batch, o: O, wall: "left" | "right" | "back", c: number, y: number, w: number, at: number, k: number) => {
  const m = tex("paint" + k, paintingTex(k)), h = w * 0.8, e = 0.035, fr = col("picFrame", "#6a4a2a");
  if (wall === "back") { b.add(quad(P(o, c - w / 2, y, at + e), P(o, c + w / 2, y, at + e), P(o, c + w / 2, y + h, at + e), P(o, c - w / 2, y + h, at + e)), m); bx(b, fr, o, c - w / 2 - 0.04, c + w / 2 + 0.04, y - 0.04, y + h + 0.04, at, at + e - 0.005); }
  else if (wall === "left") { b.add(quad(P(o, at + e, y, c + w / 2), P(o, at + e, y, c - w / 2), P(o, at + e, y + h, c - w / 2), P(o, at + e, y + h, c + w / 2)), m); bx(b, fr, o, at, at + e - 0.005, y - 0.04, y + h + 0.04, c - w / 2 - 0.04, c + w / 2 + 0.04); }
  else { b.add(quad(P(o, at - e, y, c - w / 2), P(o, at - e, y, c + w / 2), P(o, at - e, y + h, c + w / 2), P(o, at - e, y + h, c - w / 2)), m); bx(b, fr, o, at - e + 0.005, at, y - 0.04, y + h + 0.04, c - w / 2 - 0.04, c + w / 2 + 0.04); }
};
/** 70s pendant lamp: cord + wide orange or white shade, glowing bulb */
const pendant = (b: Batch, parts: SetParts, o: O, x: number, z: number, H: number, drop: number, shade = "#e07a2a") => {
  cyl(b, col("cord", "#2a2a30"), o, x, H - drop + 0.2, z, 0.008, 0.008, drop - 0.2, 5);
  b.add(new THREE.SphereGeometry(0.3, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2.2).scale(1, 0.6, 1).translate(o[0] + x, o[1] + H - drop + 0.05, o[2] + z), lam("shade" + shade, () => ({ color: shade, side: THREE.DoubleSide })));
  sph(b, bright("bulb", { color: new THREE.Color(1.4, 1.2, 0.85) }), o, x, H - drop + 0.02, z, 0.07);
  lamp(parts, { pos: [o[0] + x, o[1] + H - drop, o[2] + z], size: 0.9, col: "#ffd9a0", pool: 0, when: "indoor" });
};
const chair = (b: Batch, o: O, x: number, z: number, dir: number, seat: THREE.Material, frame: THREE.Material, back = 0.95) => {
  const zb = z - dir * 0.42;
  bx(b, seat, o, x - 0.23, x + 0.23, 0.4, 0.47, Math.min(z, zb), Math.max(z, zb));
  bx(b, seat, o, x - 0.21, x + 0.21, 0.6, back, Math.min(zb, zb - dir * 0.04), Math.max(zb, zb - dir * 0.04));
  for (const sx of [-0.2, 0.2]) { bx(b, frame, o, x + sx - 0.018, x + sx + 0.018, 0.47, back, Math.min(zb, zb - dir * 0.03), Math.max(zb, zb - dir * 0.03)); for (const zz of [z - dir * 0.03, zb]) bx(b, frame, o, x + sx - 0.018, x + sx + 0.018, 0, 0.4, zz - 0.018, zz + 0.018); }
};
const cup = (b: Batch, o: O, x: number, y: number, z: number, c = "#f4f0e6") => { cyl(b, col("cup" + c, c), o, x, y, z, 0.04, 0.045, 0.09, 12); cyl(b, col("coffee", "#4a2a1a"), o, x, y + 0.085, z, 0.04, 0.04, 0.006, 12); };
const plant = (b: Batch, kit: Kit, x: number, y: number, z: number, h: number, name = "pottedPlant") => prop(b, kit, name, x, y, z, h);

// =====================================================================================================
export const buildSets = (root: THREE.Object3D, rays: Ray[], kit: Kit): SetParts => {
  setSight(rays);
  const G = () => { const g = new THREE.Group(); root.add(g); return g; };
  const groups: Record<SetKey, THREE.Group> = { bor: G(), vil: G(), fog: G(), sew: G(), kit: G(), shop: G(), bay: G() };
  const beamMat = new THREE.ShaderMaterial({
    uniforms: { on: { value: 1 }, col: { value: new THREE.Color(1.6, 1.5, 1.2) }, len: { value: BEAM_LEN } },
    vertexShader: "uniform float len; varying float vZ; varying vec3 vN; varying vec3 vV; void main(){ vZ = position.z / len; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
    fragmentShader: "uniform float on; uniform vec3 col; varying float vZ; varying vec3 vN; varying vec3 vV; void main(){ float fade = pow(clamp(1.0 - vZ, 0.0, 1.0), 2.2); float core = pow(abs(dot(vN, vV)), 1.5); gl_FragColor = vec4(col * fade * core * on * 0.55, 1.0); }",
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.35, BEAM_LEN * 0.075, BEAM_LEN, 32, 1, true).translate(0, -BEAM_LEN / 2, 0).rotateX(-Math.PI / 2), beamMat);
  beam.renderOrder = 6; beam.frustumCulled = false;
  const parts: SetParts = { lamps: [], glowMats: [], groups, barrier: new THREE.Group(), door: new THREE.Group(), needle: new THREE.Group(), wheel: new THREE.Group(),
    lightYaw: new THREE.Group(), lightPitch: new THREE.Group(), beam, beamMat };
  CUR = "bor"; vegCenter(BOR[0], BOR[2] - 10); buildBorder(groups.bor, parts, kit);
  CUR = "vil"; vegCenter(VIL[0], VIL[2] + 5); buildVillage(groups.vil, parts, kit);
  CUR = "fog"; vegCenter(FOG[0], FOG[2]); buildFog(groups.fog, parts, kit);
  CUR = "sew"; buildSew(groups.sew, parts, kit);
  CUR = "kit"; buildKitchen(groups.kit, parts, kit);
  CUR = "shop"; buildShops(groups.shop, parts, kit);
  CUR = "bay"; vegCenter(BAY[0], BAY[2]); buildBay(groups.bay, parts, kit);
  vegCenter(0, 0);
  setSight([]);
  return parts;
};

// ---------------- BOR: the border strip ----------------
const buildBorder = (root: THREE.Group, parts: SetParts, kit: Kit) => {
  const o = BOR, b = new Batch();
  // ground bands (east = -z): hinterland meadow, patrol road, grass verge, raked control strip, fences, west meadow
  ground(b, tex("lawnB", lawnTex(), { color: "#b8c8a0" }), o, -1400, 1400, -1400, 1400, 10, -0.02);
  ground(b, tex("plates", plateTex()), o, -700, 700, ROAD.z0, ROAD.z1, 4, 0.01);
  ground(b, tex("sand", sandTex()), o, -700, 700, -7, -0.25, 6, 0.012);
  ground(b, tex("meadowB", meadowTex(), { color: "#c8d0b0" }), o, -700, 700, 0.3, 3.2, 8, 0.012);
  fenceX(b, o, -700, 700, 0, 3.2);
  fenceX(b, o, -700, 700, 3.5, 2.6);
  fenceX(b, o, -700, 700, -24, 2.0, 60);              // signal fence in the hinterland
  for (let x = -300; x <= 300; x += 25) stripLight(b, parts, o[0] + x, o[2] - 7.8);
  // the watchtower (searchlight on its roof is a moving part) + far towers
  watchtower(b, parts, TOWER, true);
  for (const x of [-235, 255]) watchtower(b, parts, [o[0] + x, 0, o[2] - 19], false);
  // two small villages with lit windows, one on each side (seen from the balloon)
  for (const [vx, vz, n] of [[70, 230, 9], [-150, -250, 8]] as const) {
    const rr = rng(vx * 3 + 11);
    for (let i = 0; i < n; i++) vhouse(b, parts, o[0] + vx + (i % 3) * 14 + rr() * 4, o[2] + vz + Math.floor(i / 3) * 16 + rr() * 4, rr() * 0.6, 8, 8, 5.4, i, false, 0.8);
    ground(b, tex("vroad", roadTex()), o, vx - 20, vx + 50, vz + 8, vz + 12, 8, 0.02);
  }
  const yaw = parts.lightYaw, pitch = parts.lightPitch;
  yaw.position.set(TOWER[0], LAMP_Y, TOWER[2]);
  const dark = col("towerDark", "#3c4048");
  const hb = new Batch();
  hb.add(new THREE.CylinderGeometry(0.32, 0.36, 0.55, 18).rotateX(Math.PI / 2), dark);
  hb.add(new THREE.CircleGeometry(0.3, 18).translate(0, 0, 0.28), bright("searchLens", { color: new THREE.Color(1.6, 1.5, 1.2) }));
  hb.build(pitch);
  yaw.add(pitch); pitch.add(parts.beam);
  const fork = new Batch();
  fork.add(new THREE.BoxGeometry(0.06, 0.5, 0.06).translate(-0.4, -0.15, 0), dark); fork.add(new THREE.BoxGeometry(0.06, 0.5, 0.06).translate(0.4, -0.15, 0), dark);
  fork.add(new THREE.CylinderGeometry(0.12, 0.2, 0.3, 10).translate(0, -0.42, 0), dark);
  fork.build(yaw);
  root.add(yaw);
  // the barrier across the patrol road: pivot post, boom (moving), rest post, counterweight
  const bc = col("barrierPost", "#e8e2d6");
  bx(b, bc, o, BARRIER.x - 0.18, BARRIER.x + 0.18, 0, BARRIER.h + 0.2, BARRIER.z - 0.18, BARRIER.z + 0.18);
  bx(b, col("barrierRed", "#c83a32"), o, BARRIER.x - 0.19, BARRIER.x + 0.19, 0.25, 0.55, BARRIER.z - 0.19, BARRIER.z + 0.19);
  bx(b, bc, o, BARRIER.x - 0.07, BARRIER.x + 0.07, 0, BARRIER.h - 0.05, BARRIER.z + BARRIER.len - 0.07, BARRIER.z + BARRIER.len + 0.07);
  bx(b, bc, o, BARRIER.x - 0.12, BARRIER.x + 0.12, BARRIER.h - 0.12, BARRIER.h - 0.05, BARRIER.z + BARRIER.len - 0.2, BARRIER.z + BARRIER.len + 0.2);
  const bb = new Batch(), boomM = tex("boom", boomTex());
  bb.add(new THREE.BoxGeometry(0.1, 0.12, BARRIER.len).translate(0, 0, BARRIER.len / 2 + 0.05), boomM);
  bb.add(new THREE.BoxGeometry(0.22, 0.26, 0.5).translate(0, 0, -0.4), col("weight", "#4a4e58"));
  bb.add(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 10).rotateZ(Math.PI / 2), col("weight", "#4a4e58"));
  bb.build(parts.barrier);
  parts.barrier.position.set(BARRIER.x, BARRIER.h + 0.1, BARRIER.z);
  root.add(parts.barrier);
  // a guard hut by the barrier, a field telephone post, dog-run wire, tyre tracks
  bx(b, tex("hutCon", concreteTex("bHut", "#d8d2c4")), o, 20, 23, 0, 2.5, -17.5, -15.0, 1.2);
  bx(b, col("hutRoof", "#5a5e66"), o, 19.8, 23.2, 2.5, 2.65, -17.7, -14.8);
  bx(b, col("hutWin", "#33405e"), o, 20.6, 22.4, 1.1, 1.9, -15.0, -14.98);
  bx(b, col("hutDoor", "#4a5a4a"), o, 19.98, 20, 0, 2.0, -16.8, -15.9);
  bx(b, col("phonePost", "#6a6e74"), o, 10, 10.12, 0, 1.4, -14.6, -14.48);
  bx(b, col("phoneBox", "#5a6a4a"), o, 9.92, 10.2, 1.1, 1.45, -14.48, -14.3);
  // forest edges: prop spruces near the lens, a canopy field beyond (both sides)
  const r = rng(1979);
  for (let x = -260; x <= 260; x += 3.6) {
    const far = Math.abs(x) > 90;
    if (far && r() < 0.35) continue;
    for (const [z0, dz] of [[15, 1], [-44, -1]] as const) for (let k = 0; k < (far ? 1 : 2); k++) {
      const z = z0 + dz * (k * 3.8 + r() * 1.6), h = 13 + r() * 6;
      tree(b, o[0] + x + r() * 1.5, o[2] + z, h, r() < 0.82 ? "spruce" : "tree_default", x * 7 + z, 0, far ? 2 : undefined);
    }
  }
  for (let x = -60; x <= 60; x += 7) if (Math.abs(x - 16) > 6) for (const z of [7.5 + r() * 3, -30 - r() * 6]) prop(b, kit, "plant_bushLarge", o[0] + x + r() * 3, 0, o[2] + z, 1.4 + r() * 0.8, x);
  vegCenter(9999, 9999);
  forestField(b, o[0], o[2], 1300, 10, (x, z) => (z > 21 || z < -49) && Math.hypot(x - 90, z - 245) > 48 && Math.hypot(x + 130, z + 265) > 48 && !(Math.hypot(x, z) > 140 && Math.sin(x * 0.013 + 1.1) * Math.sin(z * 0.017 + 0.4) > 0.55), (x, z) => 12 + wave(x, z));
  b.build(root);
  void kit;
};

// ---------------- VIL: the village street + MEAD: the meadow behind it ----------------
const buildVillage = (root: THREE.Group, parts: SetParts, kit: Kit) => {
  const o = VIL, b = new Batch(), r = rng(7);
  // fields round the village, the street, pavements with kerbs
  ground(b, tex("fieldBase", lawnTex(), { color: "#c4cc98" }), o, -1400, 1400, -1400, 1400, 10, -0.02);
  for (let k = 0; k < 9; k++) { // ploughed / green field strips between the village and the forest
    const z0 = -40 - k * 10, c = ["#b89a6a", "#a8b866", "#c8b070", "#8aa85a"][k % 4];
    ground(b, tex("strip" + c, roadTex(), { color: c }), o, -125, 125, z0 - 10, z0, 9, -0.01 + k * 0.0005);
  }
  ground(b, tex("asphalt", asphaltTex()), o, -200, 200, 7.3, 13.5, 6, 0.0);
  const pv = tex("pave", pavementTex()), kerb = col("kerb", "#bdb6aa");
  for (const [z0, z1] of [[4.5, 7.3], [13.5, 15.6]] as const) { bx(b, pv, o, -200, 200, 0, 0.12, z0, z1, 2); bx(b, kerb, o, -200, 200, 0, 0.14, z0 === 4.5 ? 7.15 : 13.5, z0 === 4.5 ? 7.3 : 13.65); }
  ground(b, tex("gardenGrass", meadowTex()), o, -200, 200, -40, 4.5, 8, 0.004);
  ground(b, tex("gardenGrassN", meadowTex()), o, -200, 200, 15.6, 60, 8, 0.004);
  // south row (fronts at z 4.5, facing the street): the family's house at x 0
  vhouse(b, parts, o[0], o[2] + 0.5, 0, 7, 8, 5.4, 0, true, 0.6);
  const south: [number, number, number, number, number][] = [ // x, w, d, h, style
    [-46, 8, 9, 5.6, 2], [-35.5, 8, 8, 5.4, 1], [-25, 9, 8, 5.4, 4], [-14.5, 8, 9, 5.6, 5], [-6, 6, 8, 5.2, 3], [10.5, 7, 8, 5.4, 2], [21, 8, 9, 5.6, 1], [31.5, 8, 8, 5.4, 0], [42, 9, 9, 5.6, 5], [53, 8, 8, 5.4, 3],
  ];
  for (const [x, w, d, h, s] of south) vhouse(b, parts, o[0] + x, o[2] + (x === 10.5 ? 1.8 - d / 2 : 4.5 - d / 2), 0, w, d, h, s, true, 0.5);
  const north: [number, number, number, number, number][] = [[-44, 8, 8, 5.4, 4], [-32, 9, 9, 5.6, 0], [-20, 8, 8, 5.4, 3], [-8, 8, 9, 5.6, 2], [4, 9, 8, 5.4, 5], [16, 8, 8, 5.4, 1], [28, 8, 9, 5.6, 4], [40, 9, 8, 5.4, 2], [52, 8, 8, 5.4, 0]];
  for (const [x, w, d, h, s] of north) vhouse(b, parts, o[0] + x, o[2] + 15.6 + d / 2, Math.PI, w, d, h, s, true, 0.5);
  // the family's door: dark opening + door panel (hinged at its left edge, swings inward) + step + hood
  const D = HOUSE_DOOR;
  b.add(quad(V(D[0] - 0.52, 0.0, D[2] + 0.012), V(D[0] + 0.52, 0.0, D[2] + 0.012), V(D[0] + 0.52, 2.07, D[2] + 0.012), V(D[0] - 0.52, 2.07, D[2] + 0.012)), col("doorDark", "#2a1e1c"));
  bx(b, col("hallWarm", "#7a5a40"), Z0, D[0] - 0.5, D[0] + 0.5, 0, 0.02, D[2] - 1.2, D[2]);
  const dp = new Batch();
  dp.add(new THREE.BoxGeometry(1.0, 2.04, 0.05).translate(0.5, 1.02, 0), col("doorWood", "#6a3e26"));
  for (const [y0, y1] of [[0.25, 0.95], [1.15, 1.85]]) dp.add(new THREE.BoxGeometry(0.72, y1 - y0, 0.02).translate(0.5, (y0 + y1) / 2, 0.035), col("doorPanel", "#7a4a2e"));
  dp.add(new THREE.SphereGeometry(0.035, 8, 6).translate(0.86, 1.0, 0.06), col("knob", "#e0b84a"));
  dp.build(parts.door);
  parts.door.position.set(D[0] - 0.5, 0.0, D[2] + 0.04);
  root.add(parts.door);
  bx(b, col("doorStep", "#a8a294"), Z0, D[0] - 0.75, D[0] + 0.75, 0, 0.14, D[2], D[2] + 0.45);
  bx(b, col("doorHood", "#5a4a40"), Z0, D[0] - 0.8, D[0] + 0.8, 2.3, 2.38, D[2], D[2] + 0.6);
  bx(b, col("letterbox", "#c8a24e"), Z0, D[0] + 0.85, D[0] + 1.15, 1.0, 1.35, D[2], D[2] + 0.12);
  // the neighbour's front garden (house set back): picket fence with a gate gap at x 3.5-4.3
  picket(b, o[0] + 4.3, o[0] + 14.2, o[2] + 4.45);
  picketZ(b, o[2] + 1.9, o[2] + 4.45, o[0] + 14.2);
  for (const [x, z] of [[6.2, 3.3], [8.8, 3.6], [12.4, 3.2]]) prop(b, kit, "plant_bushLarge", o[0] + x, 0, o[2] + z, 1.1, x);
  for (let i = 0; i < 18; i++) { const x = o[0] + 5 + i * 0.5, z = o[2] + 2.6 + 0.3 * Math.sin(i); sph(b, col("rose" + (i % 3), ["#d8483a", "#f2c94a", "#e86a9a"][i % 3]), Z0, x, 0.55, z, 0.1); sph(b, col("roseLeaf", "#3f7a3a"), Z0, x, 0.35, z, 0.18, 0.25, 0.18, 8); }
  // flower boxes / pots, a bench, a bike by the family's house
  for (const x of [0.75, 2.6]) { bx(b, col("pot", "#b8684a"), Z0, o[0] + x, o[0] + x + 0.5, 0.12, 0.42, o[2] + 4.55, o[2] + 4.85); for (let k = 0; k < 4; k++) sph(b, col("flowR", "#d8483a"), Z0, o[0] + x + 0.07 + k * 0.12, 0.5, o[2] + 4.7, 0.07); }
  const wood = tex("benchW", woodTex(), { color: "#8a6a4a" });
  bx(b, wood, Z0, o[0] + 1.35, o[0] + 2.45, 0.45, 0.5, o[2] + 4.55, o[2] + 4.9); for (const x of [1.4, 2.35]) bx(b, wood, Z0, o[0] + x, o[0] + x + 0.06, 0.12, 0.45, o[2] + 4.57, o[2] + 4.87);
  // drainpipe, climbing rose by the door, a boot scraper
  cyl(b, col("drain", "#8a8e92"), Z0, o[0] + 3.35, 0, o[2] + 4.62, 0.05, 0.05, 5.2, 8);

  // parked cars, street lamps, trees, a phone box (no signs)
  smallCar(b, o[0] - 9, o[2] + 8.6, 0, "#a8c0c8");
  smallCar(b, o[0] + 19, o[2] + 12.2, Math.PI, "#e8d8a8");
  smallCar(b, o[0] - 31, o[2] + 12.2, Math.PI, "#7a8a5a");
  for (let x = -49; x <= 56; x += 14) streetLamp(b, parts, o[0] + x, o[2] + 14.0, -0.9);
  for (const x of [-40.5, -19.5, 15.8, 36.5, 47.5]) tree(b, o[0] + x, o[2] + 2.0 + r() * 2, 7 + r() * 2, "tree_default", x);
  for (const x of [-38, -14, 10, 34]) tree(b, o[0] + x + 2, o[2] + 19.5, 7 + r() * 2, "tree_oak", x);
  // back gardens: fruit trees, sheds, woodpiles, washing lines, fences between plots
  for (let x = -50; x <= 56; x += 10.5) {
    tree(b, o[0] + x + r() * 3, o[2] - 9 - r() * 6, 5 + r() * 2, r() < 0.5 ? "tree_fat" : "tree_default", x * 3);
    if (r() < 0.6) shed(b, o[0] + x + 3, o[2] - 16 - r() * 4, r() * 0.4 - 0.2);
    if (r() < 0.5) woodpile(b, o[0] + x - 2, o[2] - 6.5, 2.2);
    picketZ(b, o[2] - 26, o[2] - 4, o[0] + x + 5.2, 1.0, "#d8ccb0");
    tree(b, o[0] + x + r() * 4, o[2] + 26 + r() * 10, 6 + r() * 2, "tree_default", x * 5 + 1);
  }
  picket(b, o[0] - 55, o[0] + 60, o[2] - 26, 1.0, "#d8ccb0");
  // the church (no cross: a ball finial), behind the south row
  const cw = tex("churchWall", plasterTex("church", "#efe6d2"));
  bx(b, cw, o, -26, -14, 0, 7, -38, -30, 3);
  b.add(quad(P(o, -26.4, 6.8, -29.6), P(o, -13.6, 6.8, -29.6), P(o, -13.6, 11, -34), P(o, -26.4, 11, -34)), roofM(HSTY[1]));
  b.add(quad(P(o, -13.6, 6.8, -38.4), P(o, -26.4, 6.8, -38.4), P(o, -26.4, 11, -34), P(o, -13.6, 11, -34)), roofM(HSTY[1]));
  b.add(tri(P(o, -14, 7, -38), P(o, -14, 7, -30), P(o, -14, 11, -34)), cw);
  bx(b, cw, o, -12.5, -8.5, 0, 15, -36, -32, 3);
  for (const s of [-1, 1]) bx(b, col("belfry", "#33405e"), o, -11.2, -9.8, 11.5, 13.2, -34 + s * 2.01, -34 + s * 2.02);
  b.add(new THREE.ConeGeometry(2.9, 8, 4).rotateY(Math.PI / 4).translate(o[0] - 10.5, 19, o[2] - 34), roofM(HSTY[3]));
  sph(b, col("finial", "#c9a24e"), o, -10.5, 23.2, -34, 0.3);
  for (const z of [-37, -31]) for (const x of [-24, -20, -16]) bx(b, col("churchWin", "#4a5688"), o, x - 0.5, x + 0.5, 2.5, 5.2, z + (z < -34 ? -0.02 : 0.02), z + (z < -34 ? -0.01 : 0.01));
  // the meadow behind the village (launch site): grass, hay bales, a hut, a woodpile, edge bushes
  const m = MEAD;
  b.add(new THREE.CircleGeometry(52, 48).rotateX(-Math.PI / 2).translate(m[0], 0.006, m[2]), tex("meadow", rep(meadowTex(), 12, 12)));
  for (const [x, z, y] of [[14, -14, 0.4], [18, -9, 1.2], [-6, 18, 0.2], [20, 6, -0.4]] as const) haybale(b, m[0] + x, m[2] + z, y);
  shed(b, m[0] + 24, m[2] + 16, -0.8, 3.4, 2.6, 2.4);
  woodpile(b, m[0] + 21, m[2] + 19.5, 2.6, -0.8);
  for (let k = 0; k < 70; k++) { const a = r() * 6.28, d = 8 + r() * 30; const x = m[0] + Math.cos(a) * d, z = m[2] + Math.sin(a) * d; if (Math.abs(z - m[2]) < 6 && x < m[0] + 4 && x > m[0] - 26) continue; tuft(b, x, z, 1 + r()); }
  for (let k = 0; k < 64; k++) { // forest ring round the meadow (open toward the village fields to the north-east)
    const a = (k / 64) * 6.28, d = 40 + r() * 6, x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (z > 30 && x > -20) continue;
    tree(b, m[0] + x, m[2] + z, 14 + r() * 6, r() < 0.8 ? "spruce" : "tree_default", k * 13);
    if (r() < 0.6) tree(b, m[0] + x * 1.1 + 2, m[2] + z * 1.1, 13 + r() * 6, "spruce", k * 17);
  }
  for (let k = 0; k < 24; k++) { const a = r() * 6.28, d = 36 + r() * 3; if (Math.sin(a) * d > 28) continue; prop(b, kit, "plant_bushLarge", m[0] + Math.cos(a) * d, 0, m[2] + Math.sin(a) * d, 1.2 + r(), k); }
  vegCenter(9999, 9999);
  const mz = m[2] - o[2];
  forestField(b, o[0], o[2], 1300, 10, (x, z) => {
    const lx = x - o[0], lz = z - o[2], dm = Math.hypot(lx, lz - mz);
    if (dm < 47) return false;
    if (lz > -125 && lz < 70 && Math.abs(lx) < 135) return false;
    if (dm < 80 && lz > mz + 25 && lx > -20) return false;
    return true;
  }, (x, z) => 12 + wave(x, z));
  b.build(root);
};

// ---------------- FOG: clearing just before a fence line ----------------
const buildFog = (root: THREE.Group, parts: SetParts, kit: Kit) => {
  const o = FOG, b = new Batch(), r = rng(1978);
  ground(b, tex("forestFloor", floorTex()), o, -900, 900, -900, 900, 8, -0.01);
  b.add(new THREE.CircleGeometry(19, 40).rotateX(-Math.PI / 2).translate(o[0], 0.004, o[2]), tex("clearGrass", rep(meadowTex(), 4, 4), { color: "#c8d0a8" }));
  // the border ahead: cleared strip with a fence and strip lights at z -36
  ground(b, tex("sandF", sandTex(), { color: "#c8c0a8" }), o, -500, 500, -42, -30, 6, 0.006);
  fenceX(b, o, -500, 500, -36, 3.2, 80);
  for (let x = -100; x <= 100; x += 25) stripLight(b, parts, o[0] + x, o[2] - 41.5, 1.4);
  // spruce ring round the clearing (crowns from 12 m) and the forest between the clearing and the strip
  for (let k = 0; k < 90; k++) {
    const a = (k / 90) * 6.28 + r() * 0.05, d = 18.5 + r() * 2 + (k % 3) * 3.6, x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (z < -27) continue;
    tree(b, o[0] + x, o[2] + z, 15 + r() * 6, r() < 0.88 ? "spruce" : "tree_default", k * 11);
  }
  for (let x = -40; x <= 40; x += 3.4) for (const z of [-24 - r() * 2, -27.5 + r()]) tree(b, o[0] + x + r(), o[2] + z, 14 + r() * 5, "spruce", x * 3 + z);
  for (let k = 0; k < 40; k++) { const a = r() * 6.28, d = 10 + r() * 4; prop(b, kit, "plant_bushLarge", o[0] + Math.cos(a) * d, 0, o[2] + Math.sin(a) * d, 0.9 + r() * 0.8, k); }
  // clearing dressing kept out of the balloon (r < 2.5) and the family's path (x -6..1, z 1.5-3.2)
  for (const [x, z, s] of [[6.5, -3, 0.55], [-7.5, -4.5, 0.4], [8.5, 4.5, 0.35], [-3, 8.5, 0.3]] as const) rock(b, o[0] + x, o[2] + z, s);
  for (const [x, z] of [[5, 6.5], [-8.5, 1.2], [9.5, -1.0]] as const) stump(b, o[0] + x, o[2] + z);
  b.add(new THREE.CylinderGeometry(0.22, 0.26, 6.5, 10).rotateZ(Math.PI / 2).rotateY(0.6).translate(o[0] + 6.8, 0.24, o[2] - 7.5), col("log", "#6a4a32"));
  // a torn piece of the balloon cotton on the grass (the magnifier man studies it in the morning)
  b.add(new THREE.CircleGeometry(0.42, 7).scale(1.3, 1, 1).rotateX(-Math.PI / 2).rotateY(0.4).translate(o[0] - 1.25, 0.02, o[2] + 2.05), lam("bt_scrap", () => ({ map: rep(plainTex(), 0.3, 0.3), color: "#b8a888", side: THREE.DoubleSide })));
  for (let k = 0; k < 26; k++) { const x = (r() - 0.5) * 24, z = (r() - 0.5) * 24; if (Math.hypot(x, z) < 3.5 || (x > -7 && x < 2 && z > 1 && z < 3.6) || Math.hypot(x, z) > 12.5) continue; fern(b, o[0] + x, o[2] + z, 0.8 + r() * 0.6); }
  for (let k = 0; k < 90; k++) { const x = (r() - 0.5) * 26, z = (r() - 0.5) * 26; if (Math.hypot(x, z) < 3.2 || (x > -7 && x < 2 && z > 1 && z < 3.6) || Math.hypot(x, z) > 13) continue; tuft(b, o[0] + x, o[2] + z, 0.8 + r() * 0.6, "#5f8a44"); }
  vegCenter(9999, 9999);
  forestField(b, o[0], o[2], 900, 10, (x, z) => { const lx = x - o[0], lz = z - o[2]; return Math.hypot(lx, lz) > 29 && !(lz < -21 && lz > -48); }, (x, z) => 12.5 + wave(x, z), "bCanopyF");
  b.build(root);
};

// ---------------- SEW: the sewing room ----------------
const buildSew = (root: THREE.Group, parts: SetParts, kit: Kit) => {
  const o = SEW, H = 2.6;
  roomShell(root, o, -2.7, 2.7, -3.2, 3.8, H, {
    floor: tex("sewFloor", planks(), { color: "#b08a64" }), wall: tex("sewWall", wallpaperTex("sew70", "#e8d8b0", "#dcc89a", "#c8784a")),
    ceil: tex("sewCeil", plasterTex("sewC", "#efe6d4")), floorTile: 1.4, wallTile: 1.2,
  });
  const b = new Batch(), wood = col("sewTable", "#8a5a3a"), T = SEW_TABLE;
  // sewing table + the machine (dark green, gold lining), handwheel + needle bar are moving parts
  bx(b, wood, o, -0.75, 0.75, T.h - 0.04, T.h, T.z - 0.32, T.z + 0.32);
  for (const [x, z] of [[-0.7, T.z - 0.27], [0.66, T.z - 0.27], [-0.7, T.z + 0.23], [0.66, T.z + 0.23]]) bx(b, wood, o, x, x + 0.05, 0, T.h - 0.04, z, z + 0.05);
  bx(b, col("treadle", "#2a2a30"), o, -0.35, 0.1, 0.06, 0.1, T.z - 0.15, T.z + 0.15);
  const mg = col("machine", "#2f4a3e"), gold = col("gold", "#d8b04a"), steel = col("steel", "#c8ccd0"), y0 = T.h;
  bx(b, mg, o, -0.34, 0.26, y0, y0 + 0.05, T.z - 0.12, T.z + 0.12);                         // bed
  bx(b, steel, o, -0.26, -0.14, y0 + 0.05, y0 + 0.053, T.z - 0.06, T.z + 0.06);              // throat plate
  bx(b, mg, o, 0.1, 0.24, y0 + 0.05, y0 + 0.27, T.z - 0.07, T.z + 0.07);                     // pillar
  b.add(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 16).rotateZ(Math.PI / 2).translate(o[0] - 0.03, y0 + 0.245, o[2] + T.z), mg); // rounded arm
  bx(b, mg, o, -0.3, -0.17, y0 + 0.12, y0 + 0.25, T.z - 0.065, T.z + 0.065);                 // head
  sph(b, mg, o, -0.235, y0 + 0.25, T.z, 0.068, 0.035, 0.065, 16);
  sph(b, col("lampBulbM", "#f4e8b0"), o, -0.3, y0 + 0.17, T.z, 0.018);
  bx(b, gold, o, -0.28, 0.22, y0 + 0.255, y0 + 0.262, T.z + 0.06, T.z + 0.062);              // gold lining
  bx(b, gold, o, 0.12, 0.22, y0 + 0.08, y0 + 0.086, T.z + 0.07, T.z + 0.072);
  cyl(b, col("spool", "#c8453a"), o, -0.05, y0 + 0.29, T.z, 0.022, 0.022, 0.05, 10);          // thread spool on the pin
  cyl(b, steel, o, -0.05, y0 + 0.29, T.z, 0.004, 0.004, 0.08, 5);
  cyl(b, col("spool2", "#3f6fb5"), o, 0.12, y0 + 0.29, T.z + 0.02, 0.02, 0.02, 0.045, 10);
  parts.wheel.position.set(o[0] + 0.27, y0 + 0.17, o[2] + T.z);
  const wb = new Batch();
  wb.add(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 18).rotateZ(Math.PI / 2), col("wheel", "#2a3a32"));
  wb.add(new THREE.BoxGeometry(0.032, 0.12, 0.012), gold); wb.add(new THREE.BoxGeometry(0.032, 0.012, 0.12), gold);
  wb.build(parts.wheel); root.add(parts.wheel);
  parts.needle.position.set(NEEDLE[0], 0, NEEDLE[2]);
  const nb = new Batch();
  nb.add(new THREE.CylinderGeometry(0.008, 0.008, 0.11, 6).translate(0, y0 + 0.17, 0), steel);
  nb.add(new THREE.CylinderGeometry(0.0025, 0.0015, 0.05, 5).translate(0, y0 + 0.09, 0), steel);
  nb.add(new THREE.BoxGeometry(0.05, 0.008, 0.035).translate(0, y0 + 0.065, 0.012), steel);  // presser foot (rides with it)
  nb.build(parts.needle); root.add(parts.needle);
  // fabric running through the machine and spilling off the table front
  const fab = tex("fabSew", ctex("bFabSew", 512, 256, (g) => { const cs = ["#c8402e", "#e8b42e", "#4f8ccf", "#55803c"]; for (let i = 0; i < 8; i++) { g.fillStyle = cs[i % 4]; g.fillRect(i * 64, 0, 64, 256); } g.fillStyle = "rgba(40,28,36,0.8)"; for (let i = 0; i < 8; i++) g.fillRect(i * 64 - 2, 0, 4, 256); }), { side: THREE.DoubleSide });
  b.add(quad(P(o, -0.7, y0 + 0.056, T.z - 0.25), P(o, -0.7, y0 + 0.056, T.z + 0.3), P(o, 0.05, y0 + 0.056, T.z + 0.3), P(o, 0.05, y0 + 0.056, T.z - 0.25)), fab);
  b.add(quad(P(o, -0.7, y0 + 0.004, T.z + 0.32), P(o, -0.7, 0.35, T.z + 0.52), P(o, 0.05, 0.35, T.z + 0.52), P(o, 0.05, y0 + 0.004, T.z + 0.32)), fab);
  b.add(quad(P(o, -0.7, 0.35, T.z + 0.52), P(o, -0.7, 0.01, T.z + 0.82), P(o, 0.05, 0.01, T.z + 0.82), P(o, 0.05, 0.35, T.z + 0.52)), fab);
  // the mother's chair
  chair(b, o, 0.42, -2.0, 1, col("chairSeat", "#c8784a"), col("chairFrame", "#5a3a26"));
  // fabric piled up to the ceiling: stacks of folded fabric (behind-left, behind-right), a floor heap front-left
  const cs = ["#c8402e", "#e8b42e", "#4f8ccf", "#55803c", "#efe6d0", "#de7a2a", "#3f5f9a", "#b84a3a", "#8a5a3a", "#d9862f"], rr = rng(55);
  const stack = (x0: number, x1: number, z0: number, z1: number, top: number) => {
    for (let y = 0; y < top; ) {
      const hh = 0.08 + rr() * 0.1, j = (rr() - 0.5) * 0.12, c = cs[Math.floor(rr() * cs.length)];
      bx(b, col("fold" + c, c), o, x0 + j, x1 + j * 0.5, y, y + hh, z0 + (rr() - 0.5) * 0.08, z1 + (rr() - 0.5) * 0.08);
      bx(b, col("foldD", "#3a2a30"), o, x0 + j - 0.003, x1 + j * 0.5 + 0.003, y + hh - 0.01, y + hh, z1 - 0.02, z1 + 0.06);
      y += hh;
    }
  };
  stack(-2.6, -1.95, -3.15, -2.6, 2.58); stack(-1.9, -1.35, -3.15, -2.55, 2.45); stack(-1.3, -0.8, -3.15, -2.6, 2.2);
  stack(0.9, 1.45, -3.15, -2.55, 2.3); stack(1.5, 2.05, -3.15, -2.6, 2.58); stack(2.1, 2.65, -3.15, -2.55, 2.5);
  stack(2.1, 2.65, -2.5, -1.95, 1.6);
  for (let k = 0; k < 9; k++) { // rolls on the floor heap (front-left) and leaning on the right wall
    const c = cs[k % cs.length];
    b.add(new THREE.CylinderGeometry(0.11, 0.11, 1.1, 14).rotateZ(Math.PI / 2).translate(o[0] - 2.0 + (k % 3) * 0.02, 0.11 + Math.floor(k / 3) * 0.2, o[2] - 0.9 + (k % 3) * 0.23 - Math.floor(k / 3) * 0.1), col("roll" + c, c));
  }
  for (let k = 0; k < 5; k++) { const c = cs[(k * 3) % cs.length]; b.add(new THREE.CylinderGeometry(0.09, 0.09, 1.4, 12).rotateX(0.18).translate(o[0] + 2.5, 0.7, o[2] - 0.6 + k * 0.22), col("roll" + c, c)); }
  // window (behind the machine), lamp, a shelf with thread spools, a picture, a pinned pattern
  roomWindow(b, o, "back", 0.05, 1.1, 1.05, 1.15, -3.2, "sew", "#7a8a5a");
  pendant(b, parts, o, -1.3, -0.4, H, 0.5, "#e8e0c8");
  bx(b, wood, o, -2.69, -2.45, 1.55, 1.58, 0.2, 1.6);
  for (let k = 0; k < 9; k++) cyl(b, col("spoolS" + (k % cs.length), cs[k % cs.length]), o, -2.58, 1.58, 0.3 + k * 0.15, 0.035, 0.035, 0.08, 10);
  picture(b, o, "left", 1.0, 1.4, 0.7, -2.7, 2);
  picture(b, o, "right", 0.8, 1.45, 0.6, 2.7, 3);
  b.add(quad(P(o, -2.67, 1.8, -0.4), P(o, -2.67, 1.8, -1.2), P(o, -2.67, 2.35, -1.2), P(o, -2.67, 2.35, -0.4)), tex("pattern", ctex("bPattern", 256, 192, (g) => { g.fillStyle = "#f2ead6"; g.fillRect(0, 0, 256, 192); g.strokeStyle = "#7a5a4a"; g.lineWidth = 3; g.setLineDash([8, 6]); g.beginPath(); g.ellipse(128, 80, 70, 60, 0, 0, 6.3); g.stroke(); g.beginPath(); g.moveTo(80, 130); g.lineTo(128, 180); g.lineTo(176, 130); g.stroke(); })));
  plant(b, kit, -2.3, 0, 2.2, 1.2);
  bx(b, col("dresser", "#7a5034"), o, 1.6, 2.65, 0, 0.85, 1.2, 1.7); bx(b, col("dresserTop", "#5a3a26"), o, 1.58, 2.67, 0.85, 0.89, 1.18, 1.72);
  sph(b, col("pincushion", "#c8453a"), o, 2.0, 0.93, 1.45, 0.07, 0.05, 0.07);
  b.build(root);
};

// ---------------- KIT: the 70s kitchen ----------------
const buildKitchen = (root: THREE.Group, parts: SetParts, kit: Kit) => {
  const o = KIT, H = 2.55;
  roomShell(root, o, -2.4, 2.4, -3.0, 3.2, H, {
    floor: tex("kitLino", linoTex("kit", "#c8b890", "#a89870")), wall: tex("kitWall", wall70Tex("kit", "#efe2c0", "#d8843a", "#8a5a3a")),
    ceil: tex("kitCeil", plasterTex("kitC", "#f2ead8")), floorTile: 1.2, wallTile: 1.3,
  });
  const b = new Batch(), T = KIT_TABLE;
  // the table with a checked oilcloth, cups, coffee pot, bread, a sketch of the balloon (no writing)
  const cloth = tex("oilcloth", ctex("bOil", 256, 256, (g) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? "#f4efe2" : "#c8503a"; g.fillRect(x * 32, y * 32, 32, 32); } }));
  bx(b, cloth, o, T.x - T.w / 2, T.x + T.w / 2, T.h - 0.04, T.h, T.z - T.d / 2, T.z + T.d / 2);
  b.add(quad(P(o, T.x - T.w / 2, T.h - 0.04, T.z + T.d / 2 + 0.002), P(o, T.x + T.w / 2, T.h - 0.04, T.z + T.d / 2 + 0.002), P(o, T.x + T.w / 2, T.h - 0.2, T.z + T.d / 2 + 0.002), P(o, T.x - T.w / 2, T.h - 0.2, T.z + T.d / 2 + 0.002), 6, 0.5), cloth);
  const leg = col("tableLeg", "#6a4a32");
  for (const [x, z] of [[-0.88, -1.38], [0.83, -1.38], [-0.88, -0.67], [0.83, -0.67]]) bx(b, leg, o, x, x + 0.05, 0, T.h - 0.04, z, z + 0.05);
  for (const [x, z, c] of [[-0.32, -1.25, "#f4f0e6"], [0.32, -1.25, "#e8b42e"], [-0.9 + 0.1, -1.22, "#4f8ccf"], [0.85, -1.2, "#f4f0e6"]] as const) cup(b, o, x, T.h, z, c);
  cyl(b, col("coffeePot", "#c8402e"), o, 0.05, T.h, -1.15, 0.08, 0.07, 0.2, 14); cyl(b, col("potLid", "#2a2a30"), o, 0.05, T.h + 0.2, -1.15, 0.05, 0.03, 0.03, 10);
  b.add(new THREE.CylinderGeometry(0.15, 0.12, 0.07, 14).translate(o[0] - 0.55, T.h + 0.035, o[2] - 0.8), col("basket", "#c89a5a"));
  sph(b, col("bread", "#d8a05a"), o, -0.55, T.h + 0.09, -0.8, 0.1, 0.05, 0.07);
  const sketch = tex("sketch", ctex("bSketch", 256, 192, (g) => { g.fillStyle = "#f4f0e2"; g.fillRect(0, 0, 256, 192); g.strokeStyle = "#3a3a5a"; g.lineWidth = 4; g.beginPath(); g.arc(128, 70, 50, Math.PI * 0.8, Math.PI * 2.2); g.lineTo(150, 140); g.lineTo(106, 140); g.closePath(); g.stroke(); g.strokeRect(112, 150, 32, 22); g.beginPath(); g.moveTo(108, 140); g.lineTo(112, 150); g.moveTo(148, 140); g.lineTo(144, 150); g.stroke(); }));
  b.add(quad(P(o, 0.25, T.h + 0.003, -0.62), P(o, 0.6, T.h + 0.003, -0.62), P(o, 0.6, T.h + 0.003, -0.88), P(o, 0.25, T.h + 0.003, -0.88)), sketch);
  // chairs (seat fronts at the sitters' spots, all facing +z toward the lens)
  const seat = col("kitSeat", "#d8843a"), frame = col("kitChairF", "#c8c8c0");
  for (const [x, z] of [[-0.32, -1.62], [0.32, -1.62], [-0.92, -1.62], [0.92, -1.62], [-1.38, -1.0], [1.38, -1.0]]) chair(b, o, x, z, 1, seat, frame, 0.92);
  // back wall: lower cupboards, worktop, sink, stove, upper cupboards, tiles, window with curtains
  const cb = col("cupboard", "#f2ead2"), cbd = col("cupboardEdge", "#c8843a"), z0 = -3.0;
  bx(b, cb, o, -2.4, 2.4, 0, 0.86, z0, z0 + 0.6); bx(b, col("worktop", "#b89a6a"), o, -2.4, 2.4, 0.86, 0.9, z0, z0 + 0.62);
  for (let x = -2.3; x < 2.3; x += 0.6) { bx(b, cbd, o, x, x + 0.56, 0.08, 0.8, z0 + 0.6, z0 + 0.61); bx(b, col("knobK", "#5a3a26"), o, x + 0.24, x + 0.32, 0.68, 0.71, z0 + 0.61, z0 + 0.63); }
  b.add(quad(P(o, -2.4, 0.9, z0 + 0.01), P(o, 2.4, 0.9, z0 + 0.01), P(o, 2.4, 1.45, z0 + 0.01), P(o, -2.4, 1.45, z0 + 0.01), 16, 2), tex("kitTile", tileTex("kit", "#f2e6c8", "#e8d4a8")));
  bx(b, col("sink", "#c8ccd0"), o, -1.5, -0.9, 0.86, 0.91, z0 + 0.08, z0 + 0.5); cyl(b, col("tap", "#c8ccd0"), o, -1.2, 0.91, z0 + 0.06, 0.015, 0.015, 0.25, 6);
  bx(b, col("stove", "#f4f0e6"), o, 1.2, 1.8, 0, 0.9, z0, z0 + 0.62); for (const [x, z] of [[1.35, -2.8], [1.65, -2.8], [1.35, -2.55], [1.65, -2.55]]) cyl(b, col("hob", "#2a2a30"), o, x, 0.9, z, 0.09, 0.09, 0.01, 12);
  cyl(b, col("kettle", "#3f6fb5"), o, 1.35, 0.91, -2.8, 0.1, 0.08, 0.18, 12);
  for (const [x0, x1] of [[-2.4, -0.75], [0.75, 2.4]] as const) { bx(b, cb, o, x0, x1, 1.55, 2.25, z0, z0 + 0.35); for (let x = x0 + 0.04; x < x1 - 0.1; x += 0.55) bx(b, cbd, o, x, x + 0.5, 1.6, 2.2, z0 + 0.35, z0 + 0.36); }
  roomWindow(b, o, "back", 0, 1.2, 1.15, 0.95, -3.0, "kit", "#e8b42e");
  for (let k = 0; k < 3; k++) cyl(b, col("jar" + k, ["#c8402e", "#e8e0c8", "#55803c"][k]), o, -0.45 + k * 0.16, 0.9, -2.85, 0.05, 0.05, 0.14, 10);
  // wall clock (ticks only), a calendar picture, a radio, a plant, the lamp over the table
  b.add(new THREE.CircleGeometry(0.17, 24).translate(o[0] - 1.9, 1.95, o[2] - 2.6), tex("clockK", clockFaceTex(), { alphaTest: 0.5 }));
  picture(b, o, "left", -1.0, 1.25, 0.6, -2.4, 4);
  picture(b, o, "right", -0.6, 1.3, 0.55, 2.4, 1);
  bx(b, col("radio", "#8a5a3a"), o, 0.8, 1.15, 0.9, 1.08, -2.85, -2.7); bx(b, col("radioGrill", "#e8d8b0"), o, 0.83, 0.98, 0.93, 1.05, -2.7, -2.69);
  plant(b, kit, 2.0, 0, -0.2, 1.15);
  bx(b, col("fridge", "#f4f0e6"), o, -2.4, -1.75, 0, 1.45, -1.6, -0.95); bx(b, col("fridgeH", "#c8ccd0"), o, -1.76, -1.74, 0.9, 1.25, -1.0, -0.97);
  pendant(b, parts, o, 0, -1.0, H, 0.8, "#e07a2a");
  b.build(root);
};

// ---------------- SHOP: three small fabric shops side by side (cut-away, open to the lens) ----------------
const buildShops = (root: THREE.Group, parts: SetParts, kit: Kit) => {
  const o = SHOP, H = 2.8, b = new Batch(), z0 = -3.0, zf = 0.6;
  ground(b, tex("shopLino", linoTex("shop", "#b8a888", "#a09070")), o, -2.4, 11.6, z0, 3.5, 1.2);
  ground(b, col("street", "#8a8478"), o, -6, 16, 3.5, 12, 4, -0.01);
  const papers = [wallpaperTex("shopA", "#d8c8a0", "#ccb890", "#8a6a4a"), wallpaperTex("shopB", "#b8c8b0", "#a8b8a0", "#5a7a5a"), wallpaperTex("shopC", "#e0c0b0", "#d4b0a0", "#9a5a4a")];
  const BOLT = [["#c8402e", "#e8b42e", "#4f8ccf", "#efe6d0", "#55803c"], ["#3f5f9a", "#de7a2a", "#c25a7a", "#e8e0c8", "#7a8a5a"], ["#b84a3a", "#d9862f", "#4a6a8a", "#f2ead6", "#8a5a3a"]];
  SHOPS.forEach((sx, i) => {
    const wm = tex("shopWall" + i, papers[i]);
    wallZ(b, wm, o, sx - 2.3, sx + 2.3, 0, H, z0, 1, 1.2, 1.2);
    b.add(quad(P(o, sx - 2.3, H, z0), P(o, sx + 2.3, H, z0), P(o, sx + 2.3, H, zf), P(o, sx - 2.3, H, zf), 2, 2), tex("shopCeil", plasterTex("shopC", "#efe6d4")));
    // shelves of fabric bolts behind the counter
    const bm = tex("bolts" + i, boltsTex("s" + i, BOLT[i]));
    for (const [y0, y1] of [[0.9, 1.6], [1.65, 2.35]] as const) {
      b.add(quad(P(o, sx - 2.1, y0, z0 + 0.36), P(o, sx + 1.6, y0, z0 + 0.36), P(o, sx + 1.6, y1, z0 + 0.36), P(o, sx - 2.1, y1, z0 + 0.36), 1.85, 1), bm);
      bx(b, col("shelfW", "#6a4a32"), o, sx - 2.15, sx + 1.65, y0 - 0.04, y0, z0, z0 + 0.4);
    }
    bx(b, col("shelfW", "#6a4a32"), o, sx - 2.15, sx + 1.65, 0, 0.86, z0, z0 + 0.4);
    // the counter (front panel in the shop's colour), till, rolls on display, scissors, a measuring stick
    const cc = ["#7a5a3a", "#5a6a5a", "#8a4a3a"][i];
    bx(b, col("counter" + i, cc), o, sx - 1.4, sx + 0.9, 0, 0.92, -1.5, -1.0);
    bx(b, col("counterTop", "#c8a87a"), o, sx - 1.45, sx + 0.95, 0.92, 0.96, -1.55, -0.96);
    bx(b, col("till", "#4a4e58"), o, sx - 1.3, sx - 0.95, 0.96, 1.18, -1.48, -1.18); bx(b, col("tillKeys", "#c8c8c0"), o, sx - 1.28, sx - 0.97, 1.0, 1.1, -1.18, -1.15);
    bx(b, col("stick", "#e8d090"), o, sx - 0.6, sx + 0.6, 0.96, 0.975, -1.42, -1.38);
    for (let k = 0; k < 3; k++) b.add(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 12).rotateZ(Math.PI / 2).translate(o[0] + sx + 0.45, 1.03 + k * 0.0, o[2] - 1.42 + k * 0.15), col("dispRoll" + BOLT[i][k + 1], BOLT[i][k + 1]));
    // a bin of standing rolls at the front corner, a mirror, a lamp
    cyl(b, col("bin", "#8a6a4a"), o, sx - 1.85, 0, -0.5, 0.28, 0.3, 0.55, 14);
    for (let k = 0; k < 5; k++) { const a = k * 1.25, c = BOLT[i][k % 5]; b.add(new THREE.CylinderGeometry(0.05, 0.05, 1.3, 10).rotateX(0.12 * Math.cos(a)).rotateZ(0.12 * Math.sin(a)).translate(o[0] + sx - 1.85 + 0.13 * Math.cos(a), 0.7, o[2] - 0.5 + 0.13 * Math.sin(a)), col("standRoll" + c, c)); }
    pendant(b, parts, o, sx - 0.3, -1.3, H, 0.7, ["#e8e0c8", "#e07a2a", "#55803c"][i]);
    picture(b, o, "back", sx + 1.95, 1.4, 0.45, z0, 5 + i);
  });
  // dividing walls between the shops (with pilasters at the front edge), end walls
  for (const x of [-2.3, 2.3, 6.9, 11.5]) {
    bx(b, tex("divWall", plasterTex("div", "#e8dcc4")), o, x - 0.1, x + 0.1, 0, H, z0, zf);
    bx(b, col("pilaster", "#8a6a4a"), o, x - 0.16, x + 0.16, 0, H, zf - 0.12, zf + 0.04);
  }
  bx(b, col("fascia", "#6a4a32"), o, -2.4, 11.6, H - 0.35, H, zf - 0.1, zf + 0.05);
  for (const x of [-1.6, 3.0, 7.6]) plant(b, kit, x + 4.0, 0, 0.1, 0.9);
  b.build(root);
};

// ---------------- BAY: the clearing in Bavaria ----------------
const buildBay = (root: THREE.Group, parts: SetParts, kit: Kit) => {
  const o = BAY, b = new Batch(), r = rng(2809);
  ground(b, tex("forestFloorB", floorTex()), o, -1200, 1200, -1200, 1200, 8, -0.01);
  b.add(new THREE.CircleGeometry(30, 48).rotateX(-Math.PI / 2).translate(o[0], 0.004, o[2]), tex("bayMeadow", rep(meadowTex(), 7, 7)));
  for (let k = 0; k < 110; k++) {
    const a = (k / 110) * 6.28 + r() * 0.04, d = 28 + r() * 3 + (k % 3) * 4, x = Math.cos(a) * d, z = Math.sin(a) * d;
    tree(b, o[0] + x, o[2] + z, 14 + r() * 7, r() < 0.7 ? "spruce" : r() < 0.5 ? "tree_default" : "tree_oak", k * 7);
  }
  for (let k = 0; k < 40; k++) { const a = r() * 6.28, d = 24 + r() * 4; prop(b, kit, "plant_bushLarge", o[0] + Math.cos(a) * d, 0, o[2] + Math.sin(a) * d, 1.0 + r() * 0.9, k); }
  for (let k = 0; k < 150; k++) { // deeper forest up to the canopy field (hides its edge)
    const a = (k / 150) * 6.28 + r() * 0.03, d = 42 + r() * 18, x = Math.cos(a) * d, z = Math.sin(a) * d;
    tree(b, o[0] + x, o[2] + z, 15 + r() * 6, r() < 0.8 ? "spruce" : "tree_default", k * 29 + 3, 0, 1);
  }
  // a wooden hunting stand at the edge, a log, stumps, flowers and tufts (kept clear of the balloon and the group)
  const wd = col("standWood", "#8a6a4a"), hx = o[0] + 14, hz = o[2] - 16;
  for (const [dx, dz] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) b.add(new THREE.CylinderGeometry(0.07, 0.09, 4.2, 8).translate(hx + dx, 2.1, hz + dz), wd);
  bx(b, wd, Z0, hx - 0.95, hx + 0.95, 3.6, 3.7, hz - 0.95, hz + 0.95);
  bx(b, wd, Z0, hx - 0.95, hx + 0.95, 3.7, 4.6, hz - 0.95, hz - 0.88); bx(b, wd, Z0, hx - 0.95, hx - 0.88, 3.7, 4.6, hz - 0.95, hz + 0.95); bx(b, wd, Z0, hx + 0.88, hx + 0.95, 3.7, 4.6, hz - 0.95, hz + 0.95);
  b.add(quad(V(hx - 1.1, 5.2, hz + 1.1), V(hx + 1.1, 5.2, hz + 1.1), V(hx + 1.1, 5.6, hz - 1.1), V(hx - 1.1, 5.6, hz - 1.1)), col("standRoof", "#5a4a3a"));
  for (const [dx, dz] of [[-0.88, -0.88], [0.88, -0.88], [-0.88, 0.88], [0.88, 0.88]]) bx(b, wd, Z0, hx + dx - 0.04, hx + dx + 0.04, 3.7, 5.3, hz + dz - 0.04, hz + dz + 0.04);
  for (let y = 0.4; y < 3.6; y += 0.4) bx(b, wd, Z0, hx - 0.3, hx + 0.3, y, y + 0.05, hz + 1.3 - y * 0.12, hz + 1.38 - y * 0.12);
  b.add(new THREE.CylinderGeometry(0.25, 0.3, 7, 10).rotateZ(Math.PI / 2).rotateY(-0.4).translate(o[0] + 10, 0.28, o[2] + 12), col("log", "#6a4a32"));
  for (const [x, z] of [[-12, 9], [11, -6], [-9, -14]] as const) stump(b, o[0] + x, o[2] + z, 0.28);
  for (let k = 0; k < 140; k++) {
    const x = (r() - 0.5) * 50, z = (r() - 0.5) * 50, d = Math.hypot(x, z);
    if (d > 23 || (x < 1.5 && x > -28 && Math.abs(z) < 9) || (x > -1.5 && x < 8 && z > -1.5 && z < 5.5) || Math.hypot(x, z) < 2.5) continue;
    if (k % 3) tuft(b, o[0] + x, o[2] + z, 0.9 + r() * 0.6);
    else { const c = ["#f4f0e0", "#f2d04a", "#c85aa0", "#5a7ad8"][k % 4]; sph(b, col("bflow" + c, c), Z0, o[0] + x, 0.32, o[2] + z, 0.07); cyl(b, col("stem", "#4f8a3e"), Z0, o[0] + x, 0, o[2] + z, 0.01, 0.01, 0.3, 4); }
  }
  vegCenter(9999, 9999);
  forestField(b, o[0], o[2], 1100, 10, (x, z) => Math.hypot(x - o[0], z - o[2]) > 60, (x, z) => {
    const d = Math.hypot(x - o[0], z - o[2]);
    return 12 + wave(x, z) + 60 * Math.max(0, Math.min(1, (d - 220) / 500)) * (0.6 + 0.4 * Math.sin(x * 0.006 + z * 0.004));
  }, "bCanopyB");
  b.build(root);
  void parts;
};
