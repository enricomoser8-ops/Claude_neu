// Static scenery of the Palast short (Hauterives, Drôme, 1879-1912), all sets in one world (origins in story.ts):
//  terrain  vertex-coloured hills (fields, lavender, wheat, vineyards, garrigue) that rise outside the flat set zones,
//           tree-covered slopes, hill villages with terracotta roofs
//  PAL      the palace garden: gravel and lawn, flower beds, potted lemon trees, a stone heap, a parked barrow, the
//           tall hedge along the village road, the picket fence on the west (villagers' lane), the road with plane
//           trees and village houses opposite, his own house behind; the palace itself is a Growth (palace.ts)
//  PATH     the postman's round: a dirt path between dry-stone walls, fields, cypresses, a mailbox on a post, the
//           village north of the path (houses, a square with a fountain, a bell tower), the strange stones
//  CEM      the village cemetery: walls with coping, cypresses, rows of plain headstones, gravel, the tomb (Growth)
// No letters, numbers, flags or emblems anywhere (the plaque shows only a star).
import * as THREE from "three";
import { Batch, boxGeo, quad, lam, prop, inTheWay, setSight, V, Ray, Kit, house, addVeg, VegKind, hedgeGeo, vegRad } from "./build";
import { rng as rng0, stoneHD, grassHD, roofHD, ctex } from "./paint";
const rng = (seed: number) => rng0(Math.abs(Math.round(seed * 13)) + 11);
import { dirtTex, gravelTex, rowsTex, plaqueTex, pebbleTex } from "./ptex";
import { buildPalace, buildTomb, Growth, oddStone, lumpGeo, sphW, fbm } from "./palace";
import { V3, PAL, PATH, CEM, at, ROAD_Z, HEDGE_Z, HEDGE_H, FENCE_X, LAMP, MAILBOX, STONE1, HOOK_STONE, PLAQUE, TOMB } from "./story";

export type Lamp = { pos: V3; size: number; col: string; pool: number; when: "dusk" | "indoor" | "always" | "night" };
export type SetParts = {
  lamps: Lamp[]; glowMats: { m: THREE.MeshLambertMaterial; k: number }[];
  palace: Growth; tomb: Growth;
  hookStone: THREE.Mesh; pathStone: THREE.Mesh;
  nightProps: THREE.Group; todayProps: THREE.Group; oldProps: THREE.Group; snow: THREE.Mesh; flame: THREE.Mesh;
  /** the wheelbarrow he pushes (shot 7): pivot = wheel axle, local +x = forward; the wheel spins about local z */
  barrow: THREE.Group; wheel: THREE.Group;
};

// ---------------- helpers ----------------
const col = (key: string, c: string) => lam("p_" + key, () => ({ color: c }));
const tex = (key: string, map: THREE.Texture, extra: THREE.MeshLambertMaterialParameters = {}) => lam("pt_" + key, () => ({ map, ...extra }));
type O = V3;
const Z0: O = [0, 0, 0];
const bx = (b: Batch, m: THREE.Material, o: O, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, tile = 0) =>
  b.add(boxGeo(V(o[0] + Math.min(x0, x1), o[1] + Math.min(y0, y1), o[2] + Math.min(z0, z1)), V(o[0] + Math.max(x0, x1), o[1] + Math.max(y0, y1), o[2] + Math.max(z0, z1)), tile), m);
const cyl = (b: Batch, m: THREE.Material, o: O, x: number, y: number, z: number, r0: number, r1: number, h: number, seg = 16) =>
  b.add(new THREE.CylinderGeometry(r1, r0, h, seg).translate(o[0] + x, o[1] + y + h / 2, o[2] + z), m);
const sph = (b: Batch, m: THREE.Material, o: O, x: number, y: number, z: number, rx: number, ry = rx, rz = rx, seg = 14) =>
  b.add(new THREE.SphereGeometry(1, seg, Math.max(6, seg >> 1)).scale(rx, ry, rz).translate(o[0] + x, o[1] + y, o[2] + z), m);
const P = (o: O, x: number, y: number, z: number) => V(o[0] + x, o[1] + y, o[2] + z);
/** horizontal quad at height y, uv in metres / tile */
const ground = (b: Batch, m: THREE.Material, o: O, x0: number, x1: number, z0: number, z1: number, tile: number, y = 0) =>
  b.add(quad(P(o, x0, y, z1), P(o, x1, y, z1), P(o, x1, y, z0), P(o, x0, y, z0), (x1 - x0) / tile, (z1 - z0) / tile), m);
const basics = new Map<string, THREE.MeshBasicMaterial>();
const bright = (key: string, p: THREE.MeshBasicMaterialParameters) => { let m = basics.get(key); if (!m) { m = new THREE.MeshBasicMaterial(p); basics.set(key, m); } return m; };
/** cartoon plant with detail by distance from the nearest set */
const veg = (b: Batch, k: VegKind, x: number, y: number, z: number, h: number, seed: number, near = true, test = true) => {
  const r = vegRad(k, h);
  if (test && inTheWay(x - r, x + r, y, y + h, z - r, z + r, true)) return;
  addVeg(b, k, x, y, z, h, seed, near ? 0 : 2);
};
const stoneM = () => lam("p_wallStone", () => ({ map: stoneHD("wallHD") }));
const copeM = () => lam("p_cope", () => ({ map: stoneHD("copeHD") }));

// ---------------- terrain ----------------
const FLAT: [number, number, number, number][] = [[-75, 75, -70, 85], [140, 470, -80, 60], [-345, -255, -45, 45]];
const flatDist = (x: number, z: number) => {
  let d = Infinity;
  for (const [x0, x1, z0, z1] of FLAT) d = Math.min(d, Math.hypot(Math.max(x0 - x, 0, x - x1), Math.max(z0 - z, 0, z - z1)));
  return d;
};
export const terrainH = (x: number, z: number) => {
  const d = flatDist(x, z), w = d <= 0 ? 0 : d >= 90 ? 1 : (d / 90) ** 2 * (3 - 2 * (d / 90));
  const hills = 22 + 46 * (fbm(x / 230, 0.5, z / 230) + 0.5) + 18 * (fbm(x / 90, 2.2, z / 90) + 0.5) + Math.max(0, -z - 120) * 0.08;
  return w * hills - 0.08;
};
const FIELD = ["#82bd4c", "#93c656", "#e2c46c", "#d6b25a", "#9b8acb", "#b88d5c", "#74a547", "#a3bd5a", "#c9d27a", "#8fb94e"];
const fieldCol = (x: number, z: number, h: number) => {
  const a = 0.35, u = x * Math.cos(a) + z * Math.sin(a), v = -x * Math.sin(a) + z * Math.cos(a);
  const cu = Math.floor(u / 46), cv = Math.floor(v / 34), hsh = Math.abs(Math.sin(cu * 12.9898 + cv * 78.233) * 43758.5453) % 1;
  let c = new THREE.Color(FIELD[Math.floor(hsh * FIELD.length) % FIELD.length]);
  const forest = THREE.MathUtils.smoothstep(h, 14, 40) * (0.55 + 0.45 * (fbm(x / 60, 7, z / 60) + 0.5));
  c = c.lerp(new THREE.Color(fbm(x / 30, 3, z / 30) > 0 ? "#4f8a3c" : "#5e9a46"), forest);
  const edge = Math.min(Math.abs(((u / 46) % 1 + 1) % 1 - 0.5), Math.abs(((v / 34) % 1 + 1) % 1 - 0.5));
  if (edge > 0.47) c.lerp(new THREE.Color("#4f8a3c"), 0.6 * (1 - forest)); // hedgerows between the fields
  return c;
};
const buildTerrain = (root: THREE.Object3D) => {
  const W = 2000, D = 1300, nx = 200, nz = 130, x0 = -850, z0 = -800;
  const g = new THREE.PlaneGeometry(W, D, nx, nz).rotateX(-Math.PI / 2).translate(x0 + W / 2, 0, z0 + D / 2);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) p.setY(i, terrainH(p.getX(i), p.getZ(i)));
  g.computeVertexNormals();
  // the patchwork as one painted map (2 m per pixel): crisp field edges, hedgerows, a little grain (row 0 = z0)
  const map = ctex("pTerrainMap", 2048, 1332, (cg, r) => {
    const cw = 2048, ch = 1332, img = cg.createImageData(cw, ch), d = img.data, c = new THREE.Color();
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
      const x = x0 + ((i + 0.5) * W) / cw, z = z0 + ((j + 0.5) * D) / ch;
      c.copy(fieldCol(x, z, terrainH(x, z))).convertLinearToSRGB();
      const n = 1 + (r() - 0.5) * 0.08, o = (j * cw + i) * 4;
      d[o] = Math.min(255, c.r * 255 * n); d[o + 1] = Math.min(255, c.g * 255 * n); d[o + 2] = Math.min(255, c.b * 255 * n); d[o + 3] = 255;
    }
    cg.putImageData(img, 0, 0);
  });
  map.wrapS = map.wrapT = THREE.ClampToEdgeWrapping;
  const m = lam("p_terrain", () => ({ map }));
  const mesh = new THREE.Mesh(g, m);
  mesh.receiveShadow = true; mesh.castShadow = false;
  root.add(mesh);
};
/** trees and hill villages over the slopes (low detail) */
const dressHills = (b: Batch) => {
  const r = rng(1879);
  for (let i = 0; i < 1400; i++) {
    const x = -700 + r() * 1700, z = -650 + r() * 1100, d = flatDist(x, z);
    if (d < 25 || d > 520) continue;
    const h = terrainH(x, z), forest = THREE.MathUtils.smoothstep(h, 12, 36);
    if (r() > 0.18 + 0.7 * forest) continue;
    const kind: VegKind = r() < 0.22 ? "tall" : r() < 0.5 ? "fat" : "round";
    addVeg(b, kind, x, h - 0.3, z, 7 + r() * 6, i * 17.3, 2);
  }
  // hill villages: clusters of houses on the slopes, terracotta roofs
  const villages: [number, number, number][] = [[110, -190, 7], [430, -215, 9], [-170, -170, 8], [620, -120, 6], [-60, 210, 6], [260, 160, 7]];
  villages.forEach(([cx, cz, n], vi) => {
    const rr = rng(vi * 31 + 7);
    for (let k = 0; k < n; k++) {
      const x = cx + (rr() - 0.5) * 46, z = cz + (rr() - 0.5) * 30, w = [7, 8.5, 10][k % 3], d = 7, hh = [5.6, 8.4][k % 2];
      let y = Infinity;
      for (const [dx, dz] of [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) y = Math.min(y, terrainH(x + dx, z + dz));
      house(b, x, z, Math.round(rr() * 4) * (Math.PI / 2) + (rr() - 0.5) * 0.3, w, d, hh, Math.floor(rr() * 8), y - 0.3);
    }
    // a bell tower in the bigger villages (plain, no symbols)
    if (n >= 7) {
      const y = terrainH(cx, cz);
      bx(b, col("towerCream", "#e8d6b0"), Z0, cx - 2, cx + 2, y - 1, y + 15, cz - 2, cz + 2);
      b.add(new THREE.ConeGeometry(3.1, 3.6, 4).rotateY(Math.PI / 4).translate(cx, y + 16.8, cz), lam("p_towerRoof", () => ({ map: roofHD("#c9775a") })));
    }
  });
};

// ---------------- props ----------------
/** dry-stone wall along x or z with a coping of rounded stones */
const dryWall = (b: Batch, x0: number, x1: number, z0: number, z1: number, h = 0.85) => {
  if (inTheWay(x0, x1, 0, h, z0, z1, true)) return;
  bx(b, stoneM(), Z0, x0, x1, 0, h, z0, z1, 1.6);
  bx(b, copeM(), Z0, x0 - 0.05, x1 + 0.05, h, h + 0.12, z0 - 0.05, z1 + 0.05, 1.6);
};
/** picket fence along z at x (posts every 2 m, two rails, pickets) */
const picketZ = (b: Batch, x: number, z0: number, z1: number, h = 1.15) => {
  const w = col("fenceWood", "#c9a878"), d = col("fenceDark", "#9a7a52");
  for (let z = z0; z <= z1 + 1e-6; z += 2) bx(b, d, Z0, x - 0.07, x + 0.07, 0, h + 0.1, z - 0.07, z + 0.07);
  for (const y of [0.35, h - 0.2]) bx(b, d, Z0, x - 0.04, x + 0.04, y, y + 0.09, z0, z1);
  for (let z = z0 + 0.15; z < z1; z += 0.24) {
    bx(b, w, Z0, x - 0.08, x - 0.04, 0.05, h, z - 0.05, z + 0.05);
    b.add(new THREE.ConeGeometry(0.07, 0.12, 4).rotateY(Math.PI / 4).translate(x - 0.06, h + 0.06, z), w);
  }
};
/** potted lemon tree / oleander in a terracotta pot */
const pot = (b: Batch, x: number, z: number, h = 1.6, flower = false) => {
  if (inTheWay(x - 0.5, x + 0.5, 0, h, z - 0.5, z + 0.5, true)) return;
  cyl(b, col("terracotta", "#c56a42"), Z0, x, 0, z, 0.28, 0.38, 0.55, 14);
  cyl(b, col("terracottaRim", "#d57a50"), Z0, x, 0.55, z, 0.4, 0.4, 0.08, 14);
  addVeg(b, "round", x, 0.5, z, h, x * 7 + z * 3, 0);
  if (flower) for (let k = 0; k < 7; k++) { const a = k * 2.3; sph(b, col("oleander", "#e8749a"), Z0, x + Math.cos(a) * 0.35, 0.5 + h * 0.62 + Math.sin(k) * 0.15, z + Math.sin(a) * 0.35, 0.09, 0.09, 0.09, 8); }
  else for (let k = 0; k < 6; k++) { const a = k * 2.1; sph(b, col("lemon", "#f2d24a"), Z0, x + Math.cos(a) * 0.36, 0.5 + h * 0.6 + Math.cos(k * 1.7) * 0.15, z + Math.sin(a) * 0.36, 0.07, 0.08, 0.07, 8); }
};
const flowerBed = (b: Batch, x: number, z: number, w: number, d: number, seed: number) => {
  if (inTheWay(x - w / 2, x + w / 2, 0, 0.6, z - d / 2, z + d / 2, true)) return;
  bx(b, col("bedSoil", "#7a5a40"), Z0, x - w / 2, x + w / 2, 0, 0.12, z - d / 2, z + d / 2);
  const r = rng(seed), C = ["#d8453a", "#f0c040", "#f2eee4", "#c25a7a", "#9a6ad0", "#f08a3a"];
  const n = Math.round(w * d * 5);
  for (let i = 0; i < n; i++) {
    const px = x + (r() - 0.5) * (w - 0.2), pz = z + (r() - 0.5) * (d - 0.2);
    sph(b, col("leafD", "#4f8a3a"), Z0, px, 0.22, pz, 0.15, 0.12, 0.15, 7);
    sph(b, col("flw" + (i % 6), C[i % 6]), Z0, px, 0.34, pz, 0.075, 0.075, 0.075, 7);
  }
};
const bench = (b: Batch, x: number, z: number, yaw: number) => {
  if (inTheWay(x - 1, x + 1, 0, 1, z - 1, z + 1, true)) return;
  const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, 0, z), s = copeM();
  b.add(boxGeo(V(-0.9, 0.38, -0.25), V(0.9, 0.48, 0.25)), s, m);
  for (const sx of [-0.65, 0.65]) b.add(boxGeo(V(sx - 0.12, 0, -0.2), V(sx + 0.12, 0.38, 0.2)), s, m);
};
/** wheelbarrow (3D, parked): wooden tub, one wheel, two handles, stones in it */
const barrow3D = (b: Batch, x: number, z: number, yaw: number, full = true) => {
  if (inTheWay(x - 1, x + 1, 0, 0.9, z - 1, z + 1, true)) return;
  const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, 0, z), w = col("barrowWood", "#a8743e"), dk = col("barrowDark", "#5a3a22");
  b.add(new THREE.CylinderGeometry(0.22, 0.22, 0.07, 18).rotateX(Math.PI / 2).translate(0.62, 0.22, 0), dk, m);
  b.add(boxGeo(V(-0.45, 0.32, -0.32), V(0.4, 0.62, 0.32)), w, m);
  for (const sz of [-1, 1]) {
    b.add(boxGeo(V(-1.2, 0.3, sz * 0.27 - 0.03), V(0.65, 0.36, sz * 0.27 + 0.03)), dk, m);
    b.add(boxGeo(V(-0.4, 0, sz * 0.24 - 0.03), V(-0.34, 0.34, sz * 0.24 + 0.03)), dk, m);
  }
  if (full) for (let k = 0; k < 7; k++) b.add(lumpGeo(sphW(-0.25 + (k % 4) * 0.17, 0.66 + (k > 3 ? 0.08 : 0), -0.15 + ((k * 7) % 3) * 0.15, 0.11, 0.09, 0.1, 10), 0.02, 4), lam("pal_stone", () => ({ map: pebbleTex() })), m);
};
const stoneHeap = (b: Batch, x: number, z: number, r0: number, n: number, seed: number) => {
  const r = rng(seed), m = lam("pal_stone", () => ({ map: pebbleTex() }));
  for (let i = 0; i < n; i++) {
    const a = r() * 6.28, d = Math.sqrt(r()) * r0, y = (1 - d / r0) * r0 * 0.55;
    b.add(lumpGeo(sphW(x + Math.cos(a) * d, y + 0.08, z + Math.sin(a) * d, 0.12 + r() * 0.12, 0.1 + r() * 0.08, 0.12 + r() * 0.1, 10), 0.03, 3), m);
  }
};
const well = (b: Batch, x: number, z: number) => {
  if (inTheWay(x - 1.2, x + 1.2, 0, 3, z - 1.2, z + 1.2, true)) return;
  b.add(new THREE.CylinderGeometry(0.95, 1.0, 0.9, 20, 1, true).translate(x, 0.45, z), stoneM());
  cyl(b, copeM(), Z0, x, 0.9, z, 1.05, 1.05, 0.12, 20);
  for (const sx of [-1, 1]) bx(b, col("wellWood", "#6a4a30"), Z0, x + sx * 0.85 - 0.06, x + sx * 0.85 + 0.06, 0.9, 2.4, z - 0.06, z + 0.06);
  bx(b, col("wellWood", "#6a4a30"), Z0, x - 0.95, x + 0.95, 2.3, 2.42, z - 0.05, z + 0.05);
  b.add(new THREE.ConeGeometry(1.25, 0.7, 4).rotateY(Math.PI / 4).translate(x, 2.75, z), lam("p_wellRoof", () => ({ map: roofHD("#c9775a") })));
};
const fountain = (b: Batch, x: number, z: number) => {
  cyl(b, copeM(), Z0, x, 0, z, 1.8, 1.8, 0.55, 24);
  cyl(b, bright("fountainWater", { color: new THREE.Color("#6fa7d8") }), Z0, x, 0.5, z, 1.6, 1.6, 0.03, 24);
  cyl(b, copeM(), Z0, x, 0.5, z, 0.25, 0.2, 1.4, 12);
  cyl(b, copeM(), Z0, x, 1.9, z, 0.55, 0.65, 0.2, 16);
};
const haystack = (b: Batch, x: number, z: number, s = 1) => {
  if (inTheWay(x - 1.5 * s, x + 1.5 * s, 0, 2.6 * s, z - 1.5 * s, z + 1.5 * s, true)) return;
  const m = col("hay", "#e6c46a");
  cyl(b, m, Z0, x, 0, z, 1.3 * s, 1.2 * s, 1.3 * s, 18);
  b.add(new THREE.SphereGeometry(1.2 * s, 18, 9, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 1.05, 1).translate(x, 1.3 * s, z), m);
};
const flowersK = (b: Batch, kit: Kit, x0: number, x1: number, z0: number, z1: number, n: number, seed: number, y = 0) => {
  const r = rng(seed), names = ["flower_redA", "flower_yellowA", "flower_purpleA", "flower_redB", "grass", "grass_large", "plant_flatTall"];
  for (let i = 0; i < n; i++) prop(b, kit, names[Math.floor(r() * names.length)], x0 + r() * (x1 - x0), y, z0 + r() * (z1 - z0), 0.25 + r() * 0.3, r() * 6);
};

// =====================================================================================================
export const buildSets = (root: THREE.Object3D, rays: Ray[], kit: Kit): SetParts => {
  setSight(rays);
  const parts: SetParts = {
    lamps: [], glowMats: [], palace: buildPalace(), tomb: buildTomb(TOMB[0], TOMB[2]),
    hookStone: new THREE.Mesh(), pathStone: new THREE.Mesh(),
    nightProps: new THREE.Group(), todayProps: new THREE.Group(), oldProps: new THREE.Group(), snow: new THREE.Mesh(), flame: new THREE.Mesh(),
    barrow: new THREE.Group(), wheel: new THREE.Group(),
  };
  movingBarrow(parts, root);
  root.add(parts.palace.group, parts.tomb.group);
  buildTerrain(root);
  const b = new Batch();
  dressHills(b);
  buildPal(b, parts, root, kit);
  buildPath(b, parts, root, kit);
  buildCem(b, kit);
  b.build(root);
  setSight([]);
  return parts;
};

// ---------------- PAL: the garden, the road, the neighbours ----------------
const buildPal = (b: Batch, parts: SetParts, root: THREE.Object3D, kit: Kit) => {
  const o = PAL, lawn = lam("p_lawn", () => ({ map: grassHD(), color: "#f4f0d8" })), grav = lam("p_gravel", () => ({ map: gravelTex() }));
  // garden: gravel court in front of the palace, lawn borders, walks
  ground(b, lawn, o, -75, 75, -70, 85, 4, 0.0);
  ground(b, grav, o, -16, 17.5, 6.0, 15.6, 4, 0.012);
  ground(b, grav, o, -18.8, 19, -12, 6.0, 4, 0.012);
  for (const [x0, x1, z0, z1, s] of [[-12.5, -9, 11.2, 14.6, 3], [-4.5, -0.5, 11.6, 14.6, 5], [9.5, 13.5, 11.0, 14.4, 7], [14.6, 17.6, 6.6, 12, 9]] as const) flowerBed(b, (x0 + x1) / 2, (z0 + z1) / 2, x1 - x0, z1 - z0, s);
  for (const [x, z, fl] of [[-14.6, 7.4, 0], [16.8, 13.8, 1], [0.9, 13.9, 0], [-14.2, 14.2, 1], [4.6, 7.6, 1]] as const) pot(b, x, z, 1.4, !!fl);
  bench(b, 13.2, 7.4, Math.PI);
  // the tall hedge along the road
  const hm = new THREE.Matrix4();
  for (let x = -40; x < 40; x += 3.1) {
    if (inTheWay(x - 1.7, x + 1.7, 0, HEDGE_H, HEDGE_Z - 0.6, HEDGE_Z + 0.6, true)) continue;
    hm.compose(V(x, -0.06, HEDGE_Z), new THREE.Quaternion(), V(3.3, HEDGE_H + 0.06, 1.15));
    b.add(hedgeGeo(), lam("leafHD1", () => ({ color: "#4c9a37" })), hm);
  }
  // the west fence (villagers' lane outside), a low dry-stone wall on the east
  picketZ(b, FENCE_X, -12, 15.4);
  dryWall(b, 19.5, 19.9, -12, 15.4, 1.0);
  ground(b, lam("p_dirt", () => ({ map: dirtTex() })), o, -26, FENCE_X - 0.2, -40, 15.5, 4, 0.014);
  // the village road with plane trees, the houses opposite, the neighbours on the west lane
  ground(b, lam("p_dirt", () => ({ map: dirtTex() })), o, -90, 90, ROAD_Z - 1.6, ROAD_Z + 1.6, 4, 0.015);
  for (let x = -60; x <= 60; x += 9.5) if (Math.abs(x + 3) > 7) veg(b, "fat", x + 3, 0, ROAD_Z + 3.2, 11 + ((x * 13) % 3), x * 3.3);
  for (const [x, w, si] of [[-31, 8.5, 1], [-20.5, 10, 0], [-9.5, 8.5, 4], [1.5, 10, 6], [13, 8.5, 2], [24.5, 10, 5], [36, 8.5, 0]] as const)
    house(b, x, 31 + (si % 2) * 1.5, Math.PI, w, 7, si % 3 === 0 ? 8.4 : 5.6, si);
  for (const [z, si] of [[-6, 3], [5, 6], [-18, 1]] as const) house(b, -31, z, Math.PI / 2, 8.5, 7, 5.6, si);
  house(b, -4, -19, 0, 10, 7, 5.6, 0); // his own house behind the palace
  well(b, -23.5, 9.0);
  for (const [x, z] of [[-24.5, -2], [-25, 13.5]] as const) veg(b, "round", x, 0, z, 6.5, x * z);
  flowersK(b, kit, -25.6, -20, -10, 15, 40, 3);
  // garden trees: a plane tree on each side, cypresses behind
  veg(b, "fat", 16.2, 0, 10.5, 11, 51); veg(b, "round", -16.4, 0, 12.0, 9, 52);
  for (const [x, z, h] of [[-16.5, -9, 11], [16.5, -9, 12], [-15, -14, 10], [15, -14, 10.5], [24, -4, 9], [-27, 2, 9]] as const) veg(b, "tall", x, 0, z, h, x * 5 + z);
  veg(b, "bush", -17.4, 0, 4.0, 1.6, 61); veg(b, "bush", 18.0, 0, 2.0, 1.4, 62); veg(b, "bush", 18.2, 0, -4.0, 1.7, 63);
  flowersK(b, kit, -18.4, 18.8, 15.0, 15.5, 30, 5, 0.01);
  stoneHeap(b, -15.6, 9.6, 1.0, 34, 11);
  barrow3D(b, -14.6, 11.6, 0.6, true);
  // night props: the upturned crate and the oil lamp (shots 8-9)
  const nb = new Batch();
  for (const [y0, y1, dx] of [[0, 0.46, 0], [0.46, LAMP[1] - 0.02, 0.03]] as const) {
    bx(nb, col("crate", "#a8743e"), Z0, LAMP[0] - 0.26 + dx, LAMP[0] + 0.26 + dx, y0, y1, LAMP[2] - 0.2, LAMP[2] + 0.2);
    for (const y of [y0 + 0.12, y1 - 0.1]) bx(nb, col("crateDark", "#6a4a2a"), Z0, LAMP[0] - 0.27 + dx, LAMP[0] + 0.27 + dx, y, y + 0.03, LAMP[2] - 0.21, LAMP[2] + 0.21);
  }
  const brass = col("brass", "#c9a24e");
  cyl(nb, brass, Z0, LAMP[0], LAMP[1] - 0.02, LAMP[2], 0.09, 0.08, 0.05, 14);
  cyl(nb, col("lampOil", "#8a5a30"), Z0, LAMP[0], LAMP[1] + 0.03, LAMP[2], 0.08, 0.06, 0.08, 14);
  nb.add(new THREE.SphereGeometry(0.075, 14, 10).scale(1, 1.4, 1).translate(LAMP[0], LAMP[1] + 0.2, LAMP[2]), bright("lampGlass", { color: new THREE.Color(1.6, 1.25, 0.75), transparent: true, opacity: 0.9 }));
  cyl(nb, brass, Z0, LAMP[0], LAMP[1] + 0.3, LAMP[2], 0.045, 0.035, 0.05, 10);
  nb.add(new THREE.TorusGeometry(0.06, 0.008, 6, 14, Math.PI).translate(LAMP[0], LAMP[1] + 0.36, LAMP[2]), brass);
  // mortar tub + trowel-ready stones at his feet
  cyl(nb, col("tub", "#8a8f96"), Z0, -11.9, 0, 3.7, 0.22, 0.26, 0.24, 14);
  cyl(nb, col("mortar", "#d8d2c4"), Z0, -11.9, 0.23, 3.7, 0.24, 0.24, 0.02, 14);
  stoneHeap(nb, -7.6, 3.6, 0.45, 12, 21);
  nb.build(parts.nightProps);
  // the flame: a small unlit teardrop (it flickers in world.ts)
  parts.flame = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8).scale(1, 2.2, 1).translate(0, 0.07, 0), bright("flame", { color: new THREE.Color(3.2, 2.2, 0.9) }));
  parts.flame.position.set(LAMP[0], LAMP[1] + 0.13, LAMP[2]);
  parts.nightProps.add(parts.flame);
  root.add(parts.nightProps);
  parts.lamps.push({ pos: [LAMP[0], LAMP[1] + 0.2, LAMP[2]], size: 0.55, col: "#ffc070", pool: 2.6, when: "night" });
  // today: the plaque on a low stone post, a rope barrier along the walk
  const tb = new Batch();
  bx(tb, copeM(), Z0, PLAQUE[0] - 0.3, PLAQUE[0] + 0.3, 0, 0.82, PLAQUE[2] - 0.2, PLAQUE[2] + 0.2);
  bx(tb, copeM(), Z0, PLAQUE[0] - 0.34, PLAQUE[0] + 0.34, 0.82, 0.9, PLAQUE[2] - 0.24, PLAQUE[2] + 0.24);
  tb.add(new THREE.CircleGeometry(1, 40).scale(0.34, 0.25, 1).rotateX(-0.35).translate(PLAQUE[0], 1.12, PLAQUE[2] + 0.08), lam("p_plaque", () => ({ map: plaqueTex() })));
  bx(tb, copeM(), Z0, PLAQUE[0] - 0.3, PLAQUE[0] + 0.3, 0.86, 1.0, PLAQUE[2] - 0.08, PLAQUE[2] + 0.02);
  tb.add(new THREE.BoxGeometry(0.66, 0.5, 0.06).rotateX(-0.35).translate(PLAQUE[0], 1.12, PLAQUE[2] + 0.03), copeM());
  for (let x = -12; x <= 12; x += 3) { cyl(tb, col("postBrass", "#b8963e"), Z0, x, 0, 8.0, 0.04, 0.04, 0.85, 8); sph(tb, col("postBrass", "#b8963e"), Z0, x, 0.88, 8.0, 0.06); }
  for (let x = -12; x < 12; x += 3) tb.add(new THREE.CylinderGeometry(0.018, 0.018, 3, 6).rotateZ(Math.PI / 2).translate(x + 1.5, 0.74, 8.0), col("ropeRed", "#a8323a"));
  tb.build(parts.todayProps);
  root.add(parts.todayProps);
  // 1879-1912 props that are gone today (the stone heap, the barrow): kept in the main batch (visible always)
  // the hook stone on the road
  parts.hookStone = new THREE.Mesh(new THREE.BufferGeometry(), lam("pal_stone", () => ({ map: pebbleTex() })));
  const hg = oddStone(3, HOOK_STONE[0], HOOK_STONE[2], 1.15, 0.4).map((g) => lumpGeo(g, 0.01, 6));
  parts.hookStone.geometry = mergeAll(hg); parts.hookStone.castShadow = true; parts.hookStone.receiveShadow = true;
  root.add(parts.hookStone);
  // snow for the time-lapse winters: a soft white sheet over the garden
  parts.snow = new THREE.Mesh(new THREE.PlaneGeometry(64, 52).rotateX(-Math.PI / 2).translate(0, 0.0145, 6), new THREE.MeshLambertMaterial({ color: "#f4f6ff", transparent: true, opacity: 0, depthWrite: false }));
  parts.snow.visible = false; parts.snow.renderOrder = 0.3;
  root.add(parts.snow);
};

const mergeAll = (gs: THREE.BufferGeometry[]) => {
  const b = new Batch(), grp = new THREE.Group(), m = new THREE.MeshBasicMaterial();
  for (const g of gs) b.add(g, m);
  b.build(grp);
  return (grp.children[0] as THREE.Mesh).geometry;
};

// ---------------- PATH: the round, the village ----------------
const buildPath = (b: Batch, parts: SetParts, root: THREE.Object3D, kit: Kit) => {
  const o = PATH, lawn = lam("p_lawnP", () => ({ map: grassHD(), color: "#f6efcf" }));
  ground(b, lawn, o, -170, 170, -80, 60, 4, 0.0);
  ground(b, lam("p_dirt", () => ({ map: dirtTex() })), o, -170, 170, -1.7, 1.7, 3.4, 0.015);
  // fields along the path: lavender, wheat, vines, ploughed, meadow
  const F: [number, number, number, number, string, string, string, boolean][] = [
    [-160, -96, 3.5, 40, "lav", "#8e7a5a", "#9a86cc", false], [-92, -46, 3.5, 34, "wheat", "#c9a45a", "#e8c86a", false], [-44, 12, 3.5, 44, "vine", "#b98a5a", "#5f9a3a", true],
    [16, 70, 3.5, 30, "lav2", "#8e7a5a", "#a58fd2", false], [74, 160, 3.5, 40, "wheat2", "#c9a45a", "#e2c060", false],
    [-160, -100, -50, -4, "plough", "#a8784a", "#8a5e38", false], [-96, -50, -46, -4, "lav3", "#8e7a5a", "#9a86cc", false], [-46, -12, -40, -4, "vine2", "#b98a5a", "#6aa340", true],
  ];
  for (const [x0, x1, z0, z1, k, soil, crop, dots] of F) ground(b, lam("p_f" + k, () => ({ map: rowsTex(k, soil, crop, dots) })), o, x0, x1, z0, z1, dots ? 2.4 : 3.2, 0.01);
  // dry-stone walls along the north side (gap for the village lane), fences on the south
  dryWall(b, o[0] - 160, o[0] - 6, -3.1, -2.6, 0.8);
  dryWall(b, o[0] + 8, o[0] + 30, -3.1, -2.6, 0.8);
  dryWall(b, o[0] + 46, o[0] + 160, -3.1, -2.6, 0.8);
  for (let x = -150; x < 150; x += 2.5) if (Math.abs(x - 40) > 6 && Math.abs(x + 38) > 6 && (x < -8 || x > 10)) prop(b, kit, "fence_simple", o[0] + x, 0, 2.9, 0.9, 0);
  // verges: flowers, grass tufts, pebbles; cypresses and plane trees along the way; haystacks
  for (const [x0, x1] of [[-150, -60], [-60, 0], [0, 60], [60, 150]] as const) {
    flowersK(b, kit, o[0] + x0, o[0] + x1, -2.5, -1.75, 70, x0 + 101);
    flowersK(b, kit, o[0] + x0, o[0] + x1, 1.75, 2.6, 70, x0 + 202);
  }
  for (const x of [-142, -118, -71, -55, -20, 27, 58, 96, 131]) veg(b, "tall", o[0] + x, 0, -5.5 + (x % 3), 9 + (x % 4), x);
  for (const x of [-130, -86, -30, 12, 76, 118]) veg(b, "fat", o[0] + x, 0, 6.2, 9.5, x * 2.1);
  for (const [x, z] of [[-128, 18], [-72, 22], [92, 16], [118, 28], [-110, -22]] as const) haystack(b, o[0] + x, z, 0.9 + ((x * 7) % 3) * 0.1);
  // the mailbox on its post (slot toward -x, the approaching postman), next to a stone gate pillar
  const mx = MAILBOX[0], mz = MAILBOX[2], mb = col("mailbox", "#3f5f8c"), mbd = col("mailboxD", "#2a3f60");
  bx(b, col("postWood", "#8a6040"), Z0, mx - 0.06, mx + 0.06, 0, 1.0, mz - 0.06, mz + 0.06);
  bx(b, mb, Z0, mx - 0.2, mx + 0.2, 1.0, 1.42, mz - 0.17, mz + 0.17);
  b.add(new THREE.CylinderGeometry(0.17, 0.17, 0.4, 16, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateX(Math.PI / 2).rotateZ(Math.PI / 2).translate(mx, 1.42, mz), mb);
  bx(b, mbd, Z0, mx - 0.215, mx - 0.2, 1.24, 1.29, mz - 0.11, mz + 0.11); // the slot
  bx(b, mbd, Z0, mx + 0.2, mx + 0.21, 1.06, 1.2, mz - 0.04, mz + 0.04);
  bx(b, stoneM(), Z0, mx + 0.5, mx + 1.1, 0, 1.6, mz - 0.75, mz - 0.15, 1.6);
  sph(b, copeM(), Z0, mx + 0.8, 1.72, mz - 0.45, 0.25, 0.18, 0.25, 12);
  // the village north of the path: houses round a small square with a fountain, a lane, a bell tower
  const vh: [number, number, number, number, number, number][] = [
    [10.5, -11, 0, 8.5, 5.6, 3], [21, -10, 0, 10, 8.4, 1], [33, -12, 0, 8.5, 5.6, 6], [8, -24, Math.PI / 2, 8.5, 8.4, 0], [8, -36, Math.PI / 2, 10, 5.6, 4],
    [32, -38, -Math.PI / 2, 8.5, 8.4, 2], [45, -11, 0, 10, 5.6, 5], [57, -12, 0, 8.5, 8.4, 0], [69, -10.5, 0, 10, 5.6, 6], [45, -40, Math.PI, 10, 8.4, 1],
    [58, -42, Math.PI, 8.5, 5.6, 3], [70, -36, -Math.PI / 2, 8.5, 5.6, 4], [20, -52, 0, 10, 5.6, 2], [82, -16, 0, 8.5, 8.4, 5], [-12, -14, 0, 8.5, 5.6, 1], [-24, -16, 0, 7, 5.6, 6],
  ];
  for (const [x, z, yaw, w, h, si] of vh) house(b, o[0] + x, z, yaw, w, 7, h, si);
  ground(b, lam("p_square", () => ({ map: stoneHD("copeHD") })), o, 14, 42, -32, -18, 3, 0.02);
  fountain(b, o[0] + 26, -25);
  const tx = o[0] + 46, tz = -26;
  bx(b, col("towerCream", "#e8d6b0"), Z0, tx - 2, tx + 2, 0, 17, tz - 2, tz + 2);
  bx(b, col("towerDark", "#4a3a3a"), Z0, tx - 0.7, tx + 0.7, 13, 15.4, tz + 1.95, tz + 2.05);
  bx(b, copeM(), Z0, tx - 2.2, tx + 2.2, 16.6, 17.2, tz - 2.2, tz + 2.2);
  b.add(new THREE.ConeGeometry(3.1, 3.6, 4).rotateY(Math.PI / 4).translate(tx, 19, tz), lam("p_towerRoof", () => ({ map: roofHD("#c9775a") })));
  for (const [x, z] of [[18, -21], [36, -22], [16, -30], [40, -30], [62, -26], [-6, -24]] as const) veg(b, "fat", o[0] + x, 0, z, 10, x * z);
  for (const [x, z] of [[28, -17], [24, -33]] as const) pot(b, o[0] + x, z, 1.2, true);
  // the strange stone (shot 3) and the odd stones of the next morning (shot 4)
  const sm = lam("pal_stone", () => ({ map: pebbleTex() }));
  parts.pathStone = new THREE.Mesh(mergeAll(oddStone(0, STONE1[0], STONE1[2], 1.25, 0.15).map((g) => lumpGeo(g, 0.008, 8))), sm);
  parts.pathStone.castShadow = true; parts.pathStone.receiveShadow = true;
  root.add(parts.pathStone);
  const odd: [number, number, number, number, number][] = [[1, -38.4, 0.5, 1.3, 0.6], [2, -37.2, -0.9, 1.3, -0.3], [3, -36.6, 1.2, 1.2, 1.2], [4, -35.7, -0.2, 1.3, 0.2], [0, -38.9, -1.25, 1.1, 2.4], [1, -35.0, 1.0, 1.0, 2.0]];
  for (const [k, x, z, s, yaw] of odd) for (const g of oddStone(k, o[0] + x, z, s, yaw)) b.add(lumpGeo(g, 0.008, 8), sm);
};

// ---------------- CEM: the cemetery ----------------
const buildCem = (b: Batch, kit: Kit) => {
  const o = CEM, grav = lam("p_gravel", () => ({ map: gravelTex() })), lawn = lam("p_lawnC", () => ({ map: grassHD(), color: "#eef0cc" }));
  ground(b, lawn, o, -45, 45, -45, 45, 4, 0.0);
  ground(b, grav, o, -12, 12, -10, 12, 3, 0.012);
  // walls with coping (opening at the gate, +z)
  const wall = (x0: number, x1: number, z0: number, z1: number) => {
    if (inTheWay(o[0] + x0, o[0] + x1, 0, 2.0, o[2] + z0, o[2] + z1, true)) return;
    bx(b, lam("p_cemWall", () => ({ map: stoneHD("wallHD") })), o, x0, x1, 0, 1.8, z0, z1, 1.6);
    bx(b, copeM(), o, x0 - 0.08, x1 + 0.08, 1.8, 1.95, z0 - 0.08, z1 + 0.08, 1.6);
  };
  wall(-12.4, -12, -10.4, 12.4); wall(12, 12.4, -10.4, 12.4); wall(-12.4, 12.4, -10.4, -10); wall(-12.4, -1.8, 12, 12.4); wall(1.8, 12.4, 12, 12.4);
  for (const sx of [-1, 1]) { bx(b, copeM(), o, sx * 1.8 - 0.3, sx * 1.8 + 0.3, 0, 2.4, 11.9, 12.5); sph(b, copeM(), o, sx * 1.8, 2.55, 12.2, 0.25); }
  // cypresses along the walls
  for (const z of [-8, -3, 2, 7]) for (const sx of [-1, 1]) veg(b, "tall", o[0] + sx * 10.8, 0, o[2] + z, 9 + ((z + 9) % 3), z * sx + 300);
  // rows of plain headstones (rounded tops, no symbols) with small flowers, away from the tomb and the lens
  const r = rng(1912), SC = ["#d8d0c0", "#c8c0b0", "#e2dccc", "#b8b0a2", "#cfc6b4"];
  for (const z of [0.6, 3.6, 6.6, 9.4]) for (let x = -9.4; x <= 9.4; x += 2.35) {
    if (Math.abs(x) < 1.3) continue;
    if (x > 0.9 && x < 6.5 && z < 9) continue; // keep the lens corridor free
    const h = 0.7 + r() * 0.35, w = 0.5 + r() * 0.2, c = SC[Math.floor(r() * SC.length)], m = col("grave" + c, c), tilt = (r() - 0.5) * 0.08;
    const mm = new THREE.Matrix4().makeRotationZ(tilt).setPosition(o[0] + x, 0, o[2] + z);
    b.add(boxGeo(V(-w / 2, 0, -0.08), V(w / 2, h, 0.08)), m, mm);
    b.add(new THREE.CylinderGeometry(w / 2, w / 2, 0.16, 16, 1, false, -Math.PI / 2, Math.PI).rotateX(Math.PI / 2).translate(0, h, 0), m, mm);
    bx(b, col("graveBed", "#b9b2a4"), o, x - w / 2 - 0.1, x + w / 2 + 0.1, 0, 0.12, z + 0.1, z + 1.6);
    if (r() < 0.6) { sph(b, col("leafD", "#4f8a3a"), o, x, 0.22, z + 0.5, 0.14, 0.1, 0.14, 7); sph(b, col("flw" + Math.floor(r() * 6), ["#d8453a", "#f0c040", "#f2eee4", "#c25a7a", "#9a6ad0", "#f08a3a"][Math.floor(r() * 6)]), o, x, 0.33, z + 0.5, 0.07, 0.07, 0.07, 7); }
  }
  bench(b, o[0] - 6.5, o[2] - 7.6, 0);
  for (const sx of [-1, 1]) { cyl(b, copeM(), o, sx * 5.2, 0, -8.6, 0.22, 0.3, 0.7, 12); sph(b, col("leafD", "#4f8a3a"), o, sx * 5.2, 0.85, -8.6, 0.3, 0.25, 0.3, 10); }
  // around the walls: meadows, trees, a few houses of the village beyond
  for (const [x, z, k] of [[-20, -18, 0], [18, -22, 1], [-24, 14, 2], [22, 18, 3], [-6, -24, 4]] as const) veg(b, k % 2 ? "round" : "fat", o[0] + x, 0, o[2] + z, 10, x + z);
  for (const [x, z, si] of [[-14, -30, 2], [-2, -32, 5], [12, -30, 0], [26, -26, 4]] as const) house(b, o[0] + x, o[2] + z, 0, 8.5, 7, 5.6, si);
  flowersK(b, kit, o[0] - 11.5, o[0] + 11.5, o[2] - 9.5, o[2] - 7, 30, 77, 0.012);
};

/** the barrow he pushes: tub, handles, legs, a spoked wheel (so its turning reads), stones heaped in the tub */
const movingBarrow = (parts: SetParts, root: THREE.Object3D) => {
  const b = new Batch(), w = col("barrowWood", "#a8743e"), dk = col("barrowDark", "#5a3a22"), O: O = [-0.62, -0.22, 0];
  b.add(boxGeo(V(-0.45 - 0.62, 0.32 - 0.22, -0.32), V(0.4 - 0.62, 0.62 - 0.22, 0.32)), w);
  b.add(boxGeo(V(-0.5 - 0.62, 0.58 - 0.22, -0.34), V(0.45 - 0.62, 0.64 - 0.22, 0.34)), dk);
  for (const sz of [-1, 1]) {
    b.add(boxGeo(V(-1.2 - 0.62, 0.3 - 0.22, sz * 0.27 - 0.03), V(0.6 - 0.62, 0.36 - 0.22, sz * 0.27 + 0.03)), dk);
    b.add(boxGeo(V(-0.4 - 0.62, -0.02 - 0.22, sz * 0.24 - 0.03), V(-0.34 - 0.62, 0.34 - 0.22, sz * 0.24 + 0.03)), dk);
    b.add(new THREE.CylinderGeometry(0.035, 0.035, 0.2, 8).rotateZ(Math.PI / 2).translate(-1.12 - 0.62, 0.33 - 0.22, sz * 0.27), col("barrowGrip", "#3a2a1a"));
  }
  const sm = lam("pal_stone", () => ({ map: pebbleTex() }));
  for (let k = 0; k < 9; k++) b.add(lumpGeo(sphW(O[0] - 0.3 + (k % 4) * 0.17, O[1] + 0.66 + (k > 3 ? 0.09 : 0) + (k > 7 ? 0.08 : 0), -0.18 + ((k * 7) % 3) * 0.16, 0.11, 0.09, 0.1, 10), 0.02, 4), sm);
  b.build(parts.barrow);
  const wb = new Batch();
  wb.add(new THREE.TorusGeometry(0.2, 0.035, 8, 24), dk);
  wb.add(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 12).rotateX(Math.PI / 2), dk);
  for (let i = 0; i < 4; i++) wb.add(new THREE.BoxGeometry(0.4, 0.035, 0.03).rotateZ((i * Math.PI) / 4), w);
  wb.build(parts.wheel);
  parts.barrow.add(parts.wheel);
  parts.barrow.traverse((o) => { o.castShadow = true; o.receiveShadow = true; });
  parts.barrow.visible = false;
  root.add(parts.barrow);
};
