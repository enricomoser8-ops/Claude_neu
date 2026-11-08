// The "ideal palace" and the tomb, procedurally: an organic sandcastle-temple of pebble conglomerate. Every part is a
// lumpy mesh (smooth fbm displacement along smoothed normals, box-projected uv), built as a growable Piece so the
// time-lapse can raise the building layer by layer: a piece appears when the progress passes t0 and grows upward
// (scale y about its base) until t1. Parts: body in three sections x six courses, a front arcade with lumpy columns
// and arches carrying a gallery, three giant figures, the Barbary tower, a domed tower, a lantern, a stepped temple,
// pinnacles with birds, stone palms, a parapet, stairs; animals in the garden (elephant, bear, deer, pelican). The
// strange stones of the path (a little animal, a snail, a heart, ...) come from the same kit.
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { lam } from "./build";
import { pebbleTex, darkStoneTex } from "./ptex";
import { W0, PALACE } from "./story";

// ---------------- noise ----------------
const hash3 = (x: number, y: number, z: number) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
const sm = (t: number) => t * t * (3 - 2 * t);
const vnoise = (x: number, y: number, z: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = sm(x - xi), yf = sm(y - yi), zf = sm(z - zi);
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  const c = (dx: number, dy: number, dz: number) => hash3(xi + dx, yi + dy, zi + dz);
  return l(l(l(c(0, 0, 0), c(1, 0, 0), xf), l(c(0, 1, 0), c(1, 1, 0), xf), yf), l(l(c(0, 0, 1), c(1, 0, 1), xf), l(c(0, 1, 1), c(1, 1, 1), xf), yf), zf);
};
export const fbm = (x: number, y: number, z: number) => vnoise(x, y, z) * 0.62 + vnoise(x * 2.03 + 5.1, y * 2.03 + 1.7, z * 2.03 + 3.3) * 0.28 + vnoise(x * 4.1 + 9.2, y * 4.1, z * 4.1 + 2.2) * 0.1 - 0.5;

// ---------------- materials ----------------
export const stoneM = () => lam("pal_stone", () => ({ map: pebbleTex() }));
export const darkM = () => lam("pal_dark", () => ({ map: darkStoneTex() }));
const eyeM = () => lam("pal_eye", () => ({ color: "#3a2a22" }));
const tuskM = () => lam("pal_tusk", () => ({ color: "#f4ecd8" }));
const TILE = 2.4;

/** lumpy stone mesh from any geometry given in WORLD coordinates: merged vertices, displacement along the smoothed
 *  normal by fbm(world * freq) * amp, smooth normals, box-projected uv in metres / TILE */
export const lumpGeo = (geo: THREE.BufferGeometry, amp = 0.12, freq = 0.9, seed = 0) => {
  let g = geo.index ? geo.toNonIndexed() : geo.clone();
  g.deleteAttribute("normal"); g.deleteAttribute("uv");
  g = mergeVertices(g, 1e-3);
  g.computeVertexNormals();
  const p = g.attributes.position as THREE.BufferAttribute, n = g.attributes.normal as THREE.BufferAttribute;
  if (amp > 0) for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), d = fbm(x * freq + seed, y * freq, z * freq - seed) * amp * 2;
    p.setXYZ(i, x + n.getX(i) * d, y + n.getY(i) * d, z + n.getZ(i) * d);
  }
  g.computeVertexNormals();
  const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i)), x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const [u, v] = ax >= ay && ax >= az ? [z, y] : ay >= az ? [x, z] : [x, y];
    uv[i * 2] = u / TILE; uv[i * 2 + 1] = v / TILE;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
};
const seg = (L: number, s = 0.4) => Math.max(1, Math.round(L / s));
export const boxW = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, s = 0.4) =>
  new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0, seg(x1 - x0, s), seg(y1 - y0, s), seg(z1 - z0, s)).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
export const cylW = (x: number, y0: number, z: number, r0: number, r1: number, h: number, s = 0.35) =>
  new THREE.CylinderGeometry(r1, r0, h, Math.max(10, Math.round((2 * Math.PI * Math.max(r0, r1)) / s)), seg(h, s)).translate(x, y0 + h / 2, z);
export const sphW = (x: number, y: number, z: number, rx: number, ry = rx, rz = rx, n = 20) =>
  new THREE.SphereGeometry(1, n, Math.max(8, n >> 1)).scale(rx, ry, rz).translate(x, y, z);

// ---------------- growable pieces ----------------
export type Piece = { mesh: THREE.Mesh; t0: number; t1: number };
export class Growth {
  group = new THREE.Group();
  pieces: Piece[] = [];
  /** add a piece (geometry in world coordinates); base = the height it grows up from */
  add(geo: THREE.BufferGeometry, mat: THREE.Material, t0: number, t1: number, base: number, lump: [number, number] | null = [0.12, 0.9]) {
    const g = lump ? lumpGeo(geo, lump[0], lump[1]) : geo;
    g.translate(0, -base, 0);
    const m = new THREE.Mesh(g, mat);
    m.position.y = base; m.castShadow = true; m.receiveShadow = true;
    this.group.add(m);
    this.pieces.push({ mesh: m, t0, t1 });
    return m;
  }
  set(p: number) {
    for (const pc of this.pieces) {
      const k = (p - pc.t0) / Math.max(1e-4, pc.t1 - pc.t0);
      pc.mesh.visible = k > 0;
      pc.mesh.scale.y = Math.max(0.02, Math.min(1, k));
    }
  }
}

// ---------------- sculpted animals (stone) ----------------
const tube = (pts: THREE.Vector3[], r: number, n = 24) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n, r, 10, false);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
type Add = (geo: THREE.BufferGeometry, mat?: THREE.Material, lump?: [number, number] | null) => void;
/** elephant facing +x, feet at y0 */
const elephant = (add: Add, x: number, y0: number, z: number, s = 1) => {
  const S = (v: number) => v * s;
  for (const [dx, dz] of [[-0.75, -0.42], [-0.75, 0.42], [0.65, -0.42], [0.65, 0.42]]) add(cylW(x + S(dx), y0, z + S(dz), S(0.3), S(0.26), S(1.15)));
  add(sphW(x, y0 + S(1.72), z, S(1.3), S(0.88), S(0.82)));
  add(sphW(x + S(1.32), y0 + S(2.12), z, S(0.62), S(0.62), S(0.58)));
  for (const sz of [-1, 1]) add(sphW(x + S(1.12), y0 + S(2.2), z + sz * S(0.62), S(0.48), S(0.56), S(0.12)), undefined, [0.04, 1.5]);
  add(tube([V(x + S(1.8), y0 + S(2.0), z), V(x + S(2.1), y0 + S(1.45), z), V(x + S(2.05), y0 + S(0.75), z), V(x + S(2.35), y0 + S(0.52), z)].map((v) => v), S(0.17)), undefined, [0.03, 2]);
  for (const sz of [-1, 1]) add(new THREE.ConeGeometry(S(0.07), S(0.6), 8).rotateZ(-Math.PI / 2 - 0.5).translate(x + S(1.95), y0 + S(1.68), z + sz * S(0.22)), tuskM(), null);
  for (const sz of [-1, 1]) add(sphW(x + S(1.72), y0 + S(2.3), z + sz * S(0.33), S(0.07), S(0.07), S(0.07), 10), eyeM(), null);
  add(tube([V(x - S(1.25), y0 + S(1.9), z), V(x - S(1.5), y0 + S(1.4), z), V(x - S(1.45), y0 + S(1.05), z)], S(0.05), 10), undefined, null);
};
/** sitting bear facing +z */
const bear = (add: Add, x: number, y0: number, z: number, s = 1) => {
  const S = (v: number) => v * s;
  add(sphW(x, y0 + S(0.8), z, S(0.85), S(0.95), S(0.75)));
  add(sphW(x, y0 + S(2.0), z + S(0.1), S(0.52), S(0.5), S(0.48)));
  add(sphW(x, y0 + S(1.88), z + S(0.52), S(0.22), S(0.18), S(0.2)));
  add(sphW(x, y0 + S(1.95), z + S(0.72), S(0.07), S(0.06), S(0.05), 10), eyeM(), null);
  for (const sx of [-1, 1]) {
    add(sphW(x + sx * S(0.38), y0 + S(2.45), z, S(0.17), S(0.17), S(0.12), 12));
    add(sphW(x + sx * S(0.18), y0 + S(2.1), z + S(0.46), S(0.06), S(0.07), S(0.05), 10), eyeM(), null);
    add(tube([V(x + sx * S(0.7), y0 + S(1.45), z + S(0.1)), V(x + sx * S(0.75), y0 + S(1.0), z + S(0.55)), V(x + sx * S(0.35), y0 + S(0.9), z + S(0.8))], S(0.17), 12), undefined, [0.03, 2]);
    add(sphW(x + sx * S(0.45), y0 + S(0.2), z + S(0.6), S(0.25), S(0.2), S(0.38), 12));
  }
};
/** deer standing, facing +x, with antlers */
const deer = (add: Add, x: number, y0: number, z: number, s = 1) => {
  const S = (v: number) => v * s;
  for (const [dx, dz] of [[-0.5, -0.18], [-0.5, 0.18], [0.45, -0.18], [0.45, 0.18]]) add(cylW(x + S(dx), y0, z + S(dz), S(0.08), S(0.1), S(1.0), 0.2), undefined, [0.02, 2]);
  add(sphW(x, y0 + S(1.18), z, S(0.75), S(0.36), S(0.32)));
  add(tube([V(x + S(0.55), y0 + S(1.3), z), V(x + S(0.75), y0 + S(1.75), z), V(x + S(0.82), y0 + S(2.05), z)], S(0.15), 10), undefined, [0.02, 2]);
  add(sphW(x + S(0.98), y0 + S(2.08), z, S(0.3), S(0.2), S(0.18), 14));
  add(sphW(x + S(1.06), y0 + S(2.16), z + S(0.16), S(0.05), S(0.05), S(0.04), 8), eyeM(), null);
  for (const sz of [-1, 1]) {
    add(tube([V(x + S(0.86), y0 + S(2.22), z + sz * S(0.1)), V(x + S(0.78), y0 + S(2.6), z + sz * S(0.3)), V(x + S(0.6), y0 + S(2.95), z + sz * S(0.38))], S(0.045), 10), undefined, null);
    add(tube([V(x + S(0.78), y0 + S(2.6), z + sz * S(0.3)), V(x + S(0.98), y0 + S(2.82), z + sz * S(0.36))], S(0.035), 6), undefined, null);
    add(sphW(x + S(0.8), y0 + S(2.28), z + sz * S(0.2), S(0.1), S(0.05), S(0.06), 8), undefined, null);
  }
};
/** pelican on top of a column, facing +z */
const pelican = (add: Add, x: number, y0: number, z: number, s = 1) => {
  const S = (v: number) => v * s;
  add(sphW(x, y0 + S(0.5), z, S(0.42), S(0.55), S(0.4)));
  add(sphW(x, y0 + S(1.18), z + S(0.08), S(0.22), S(0.22), S(0.22), 14));
  add(new THREE.ConeGeometry(S(0.1), S(0.85), 10).rotateX(Math.PI / 2 + 0.25).translate(x, y0 + S(1.02), z + S(0.55)), undefined, null);
  add(sphW(x, y0 + S(0.9), z + S(0.42), S(0.12), S(0.14), S(0.3), 12), undefined, null);
  for (const sx of [-1, 1]) add(sphW(x + sx * S(0.12), y0 + S(1.26), z + S(0.24), S(0.04), S(0.04), S(0.03), 8), eyeM(), null);
};
/** small bird on a pinnacle */
const bird = (add: Add, x: number, y0: number, z: number, s = 1, yaw = 0) => {
  const S = (v: number) => v * s, c = Math.cos(yaw), si = Math.sin(yaw);
  add(sphW(x, y0 + S(0.16), z, S(0.2), S(0.16), S(0.14), 12), undefined, null);
  add(sphW(x + c * S(0.17), y0 + S(0.3), z - si * S(0.17), S(0.1), S(0.1), S(0.1), 10), undefined, null);
  add(new THREE.ConeGeometry(S(0.035), S(0.12), 6).rotateZ(-Math.PI / 2).rotateY(yaw).translate(x + c * S(0.3), y0 + S(0.3), z - si * S(0.3)), undefined, null);
};
/** a stone giant: tall figure with robe folds, arms, a head with eyes, nose, a cap; feet at y0, facing +z */
const giant = (add: Add, x: number, y0: number, z: number, h: number, cap: number) => {
  const r = h * 0.12;
  add(cylW(x, y0, z, r * 1.25, r * 0.95, h * 0.62), undefined, [0.09, 1.3]);           // robe
  add(sphW(x, y0 + h * 0.66, z, r * 1.05, r * 0.7, r * 0.95));                         // shoulders
  for (const sx of [-1, 1]) add(cylW(x + sx * r * 1.05, y0 + h * 0.3, z + r * 0.25, r * 0.32, r * 0.38, h * 0.38), undefined, [0.05, 1.6]); // arms
  add(sphW(x, y0 + h * 0.44, z + r * 0.75, r * 0.6, r * 0.3, r * 0.35, 14));             // hands folded
  const hy = y0 + h * 0.82, hr = r * 0.78;
  add(sphW(x, hy, z, hr * 0.92, hr * 1.12, hr * 0.92));                                // head
  add(sphW(x, hy - hr * 0.1, z + hr * 0.9, hr * 0.16, hr * 0.26, hr * 0.2, 12), undefined, null); // nose
  for (const sx of [-1, 1]) add(sphW(x + sx * hr * 0.38, hy + hr * 0.18, z + hr * 0.78, hr * 0.12, hr * 0.12, hr * 0.08, 10), eyeM(), null);
  add(sphW(x, hy - hr * 0.6, z + hr * 0.62, hr * 0.42, hr * 0.32, hr * 0.3, 12), undefined, null); // beard / chin
  if (cap === 0) add(cylW(x, hy + hr * 0.75, z, hr * 1.05, hr * 0.7, hr * 0.8), undefined, [0.04, 2]);     // round cap
  else if (cap === 1) add(sphW(x, hy + hr * 0.8, z, hr * 1.0, hr * 0.62, hr * 1.0, 18), undefined, [0.04, 2]); // helmet
  else { add(new THREE.ConeGeometry(hr * 0.9, hr * 1.4, 16).translate(x, hy + hr * 1.5, z), undefined, [0.03, 2]); }
};
/** pinnacle: lumpy spindle with a ball (and maybe a bird) */
const pinnacle = (add: Add, x: number, y0: number, z: number, h: number, withBird = false, yaw = 0) => {
  add(cylW(x, y0, z, 0.42, 0.18, h * 0.75), undefined, [0.05, 1.8]);
  add(sphW(x, y0 + h * 0.8, z, 0.24, 0.24, 0.24, 14), undefined, [0.03, 2]);
  add(new THREE.ConeGeometry(0.12, h * 0.3, 10).translate(x, y0 + h * 0.98, z), undefined, null);
  if (withBird) bird(add, x, y0 + h * 1.08, z, 1.1, yaw);
};
/** stone palm: ringed trunk and drooping fronds */
const palm = (add: Add, x: number, y0: number, z: number, h: number) => {
  for (let i = 0; i < 7; i++) add(cylW(x + 0.05 * Math.sin(i), y0 + (i * h) / 7, z, 0.32 - i * 0.015, 0.24 - i * 0.012, h / 7 + 0.02, 0.25), undefined, [0.02, 2]);
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    add(tube([V(x, y0 + h, z), V(x + c * 0.9, y0 + h + 0.45, z + s * 0.9), V(x + c * 1.7, y0 + h - 0.1, z + s * 1.7), V(x + c * 2.0, y0 + h - 0.6, z + s * 2.0)], 0.16, 12).scale(1, 0.55, 1).translate(0, (y0 + h) * 0.45, 0), undefined, [0.02, 2]);
  }
  add(sphW(x, y0 + h + 0.05, z, 0.42, 0.32, 0.42, 14));
};

// ---------------- the palace ----------------
export const buildPalace = () => {
  const G = new Growth(), st = stoneM(), dk = darkM();
  const P = PALACE, FZ = 5.0; // body front face (the arcade stands in front of it, z 5 .. 6.6)
  // the first walls (night + the next day)
  G.add(boxW(W0.x0, W0.x1, 0, 0.82, W0.z - W0.d / 2, W0.z + W0.d / 2, 0.25), st, 0, 0.03, 0, [0.05, 2.2]);
  G.add(boxW(P.x0 + 0.2, W0.x0, 0, 0.95, W0.z - W0.d / 2, W0.z + W0.d / 2, 0.25), st, 0.03, 0.05, 0, [0.05, 2.2]);
  G.add(boxW(P.x0 + 0.2, P.x0 + 0.75, 0, 0.75, 1.0, W0.z - W0.d / 2, 0.25), st, 0.035, 0.055, 0, [0.05, 2.2]);
  G.add(sphW(-12.0, 1.1, 4.75, 0.38, 0.32, 0.3, 14), st, 0.045, 0.06, 0.8, [0.04, 2]); // the first ornament on the wall
  // body: three sections x six courses (world-space noise: the courses join seamlessly)
  const secs: [number, number, number][] = [[P.x0, -4.3, 0.06], [-4.3, 4.3, 0.14], [4.3, P.x1, 0.22]];
  const courses = 6, ch = P.top / courses;
  for (const [x0, x1, s0] of secs) for (let c = 0; c < courses; c++) {
    const t0 = s0 + c * 0.05, y0 = c * ch, y1 = (c + 1) * ch + (c === courses - 1 ? 0 : 0.02);
    G.add(boxW(x0, x1, y0, y1, P.z0, FZ, 0.45), st, t0, t0 + 0.06, y0, [0.14, 0.7]);
  }
  // a rolling crest on the terrace edge
  G.add(boxW(P.x0, P.x1, P.top - 0.1, P.top + 0.35, FZ - 0.5, FZ + 0.05, 0.3), st, 0.44, 0.48, P.top - 0.1, [0.08, 1.6]);
  // grotto mouths and niches in the front (dark), at the giants' side
  for (const x of [5.6, 8.4, 11.2]) G.add(sphW(x, 3.3, FZ + 0.02, 1.0, 2.2, 0.25, 18), dk, 0.3, 0.36, 1.0, [0.06, 1.5]);
  // the arcade (x -13 .. 4.2): columns, arches, the gallery band above, dark niches behind
  const cols = [-12.6, -8.4, -4.2, 0, 4.2], AZ0 = FZ, AZ1 = 6.6, AH = 3.4, BAND = 4.6;
  cols.forEach((x, i) => {
    G.add(cylW(x, 0, (AZ0 + AZ1) / 2, 0.5, 0.36, AH, 0.25), st, 0.3 + i * 0.02, 0.36 + i * 0.02, 0, [0.09, 1.4]);
    G.add(sphW(x, AH, (AZ0 + AZ1) / 2, 0.62, 0.36, 0.62, 16), st, 0.36 + i * 0.02, 0.38 + i * 0.02, AH - 0.4, [0.05, 2]);
  });
  for (let i = 0; i < cols.length - 1; i++) {
    const xa = cols[i], xb = cols[i + 1], xm = (xa + xb) / 2, R = (xb - xa) / 2 - 0.35;
    const sh = new THREE.Shape();
    sh.moveTo(xa, AH - 1.2); sh.lineTo(xb, AH - 1.2); sh.lineTo(xb, BAND); sh.lineTo(xa, BAND); sh.lineTo(xa, AH - 1.2);
    const hole = new THREE.Path(); hole.moveTo(xa + 0.35, AH - 1.2);
    for (let k = 0; k <= 24; k++) { const a = Math.PI - (k / 24) * Math.PI; hole.lineTo(xm + R * Math.cos(a), AH - 1.2 + R * 0.95 * Math.sin(a)); }
    hole.lineTo(xb - 0.35, AH - 1.2); sh.holes.push(hole);
    const eg = new THREE.ExtrudeGeometry(sh, { depth: AZ1 - AZ0, bevelEnabled: false, curveSegments: 24 }).translate(0, 0, AZ0);
    G.add(eg, st, 0.4 + i * 0.02, 0.46 + i * 0.02, AH - 1.2, [0.06, 1.2]);
    G.add(boxW(xa + 0.2, xb - 0.2, 0.0, AH + 0.6, FZ - 0.02, FZ + 0.06, 0.3), dk, 0.3, 0.32, 0, [0.03, 1.5]); // shaded back of the bay
    // reliefs in the bays: a snail, a shell fan, a fish, a rosette (lumpy medallions on the back wall)
    G.add(sphW(xm, 1.5 + (i % 2) * 0.4, FZ + 0.2, 0.5, 0.5, 0.18, 18), st, 0.42, 0.46, 1.0, [0.05, 2.5]);
    G.add(sphW(xm + 0.2, 1.6 + (i % 2) * 0.4, FZ + 0.32, 0.22, 0.22, 0.12, 12), st, 0.42, 0.46, 1.4, [0.03, 2.5]);
  }
  G.add(boxW(P.x0, 4.6, BAND - 0.15, BAND + 0.45, AZ0, AZ1 + 0.1, 0.3), st, 0.46, 0.5, BAND - 0.15, [0.08, 1.3]); // gallery floor
  for (let x = P.x0 + 0.4; x < 4.4; x += 0.9) G.add(cylW(x, BAND + 0.45, AZ1 - 0.05, 0.14, 0.11, 0.75, 0.15), st, 0.5, 0.54, BAND + 0.45, [0.03, 2]); // gallery balusters
  G.add(boxW(P.x0, 4.6, BAND + 1.18, BAND + 1.38, AZ1 - 0.2, AZ1 + 0.1, 0.3), st, 0.53, 0.56, BAND + 1.18, [0.04, 1.6]);
  // the three giants on their plinth (x 4.3 .. 13)
  G.add(boxW(4.4, P.x1, 0, 1.15, FZ, 6.9, 0.35), st, 0.42, 0.46, 0, [0.1, 1]);
  const GAD = (t0: number, t1: number, base: number): Add => (geo, mat, lump = [0.06, 1.4]) => { G.add(geo, mat ?? st, t0, t1, base, lump); };
  [[5.75, 0], [8.55, 1], [11.35, 2]].forEach(([x, cap], i) => giant(GAD(0.55 + i * 0.04, 0.68 + i * 0.04, 1.15), x, 1.15, 6.05, 7.1 - (i === 1 ? -0.4 : 0), cap));
  // the Barbary tower (left), a domed tower, the lantern tower behind the giants
  const TT = P.top;
  for (let k = 0; k < 6; k++) {
    const r0 = 1.75 - k * 0.16, h = 1.1;
    G.add(cylW(-10.6, TT + k * h, -1.6, r0, r0 - 0.14, h + 0.03, 0.3), st, 0.6 + k * 0.025, 0.63 + k * 0.025, TT + k * h, [0.1, 1.2]);
    G.add(sphW(-10.6, TT + k * h + h, -1.6, r0 + 0.08, 0.18, r0 + 0.08, 20), st, 0.62 + k * 0.025, 0.64 + k * 0.025, TT + k * h + h - 0.2, [0.05, 2]);
  }
  for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; pinnacle(GAD(0.76, 0.8, TT + 6.6), -10.6 + Math.cos(a) * 0.62, TT + 6.6, -1.6 + Math.sin(a) * 0.62, 1.3); }
  G.add(new THREE.ConeGeometry(0.42, 2.4, 14).translate(-10.6, TT + 6.6 + 1.2, -1.6), st, 0.78, 0.82, TT + 6.6, [0.04, 2]);
  G.add(cylW(-10.8, TT, 3.2, 1.05, 0.85, 2.6, 0.3), st, 0.62, 0.66, TT, [0.08, 1.4]);
  G.add(sphW(-10.8, TT + 3.3, 3.2, 1.05, 1.25, 1.05, 22).translate(0, 0, 0), st, 0.66, 0.7, TT + 2.4, [0.06, 1.6]);
  G.add(new THREE.ConeGeometry(0.22, 1.2, 10).translate(-10.8, TT + 5.0, 3.2), st, 0.7, 0.72, TT + 4.4, null);
  G.add(boxW(8.2, 10.8, TT, TT + 2.8, -3.6, -1.0, 0.3), st, 0.6, 0.65, TT, [0.08, 1.4]);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) G.add(cylW(9.5 + dx * 1.15, TT + 2.8, -2.3 + dz * 1.15, 0.2, 0.16, 1.2, 0.2), st, 0.65, 0.68, TT + 2.8, [0.03, 2]);
  G.add(sphW(9.5, TT + 4.2, -2.3, 1.45, 0.95, 1.45, 22), st, 0.67, 0.71, TT + 3.6, [0.06, 1.6]);
  G.add(new THREE.ConeGeometry(0.2, 1.1, 10).translate(9.5, TT + 5.6, -2.3), st, 0.71, 0.73, TT + 5.0, null);
  // the stepped temple on the terrace
  const tiers: [number, number][] = [[5.2, 1.2], [4.1, 1.0], [3.1, 0.95], [2.1, 0.85], [1.2, 0.7]];
  let ty = TT;
  tiers.forEach(([w, h], k) => {
    G.add(boxW(-1.5 - w / 2, -1.5 + w / 2, ty, ty + h, -1.0 - w / 2, -1.0 + w / 2, 0.28), st, 0.65 + k * 0.03, 0.68 + k * 0.03, ty, [0.07, 1.6]);
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) G.add(sphW(-1.5 + (dx * w) / 2, ty + h + 0.15, -1.0 + (dz * w) / 2, 0.24, 0.3, 0.24, 12), st, 0.68 + k * 0.03, 0.7 + k * 0.03, ty + h - 0.1, [0.02, 2]);
    if (k < 3) G.add(sphW(-1.5, ty + h * 0.5, -1.0 + w / 2 + 0.02, w * 0.12, h * 0.38, 0.12, 14), dk, 0.67 + k * 0.03, 0.69 + k * 0.03, ty, [0.02, 2]); // dark shrine niche
    ty += h;
  });
  G.add(sphW(-1.5, ty + 0.55, -1.0, 0.62, 0.75, 0.62, 18), st, 0.8, 0.83, ty, [0.04, 2]);
  G.add(new THREE.ConeGeometry(0.18, 1.1, 10).translate(-1.5, ty + 1.6, -1.0), st, 0.83, 0.85, ty + 1.1, null);
  // pinnacles with birds along the terrace edge, stone palms
  [[-12.4, 0], [-8.3, 1], [-5.6, 0], [2.4, 1], [12.5, 0]].forEach(([x, b], i) => pinnacle(GAD(0.8 + i * 0.015, 0.84 + i * 0.015, TT + 0.3), x, TT + 0.3, FZ - 0.3, 1.5, !!b, i * 1.3));
  palm(GAD(0.85, 0.92, TT), -6.4, TT, 1.4, 3.6);
  palm(GAD(0.87, 0.94, TT), 3.4, TT, 1.8, 3.2);
  // stairs up the east end to the terrace
  for (let k = 0; k < 13; k++) G.add(boxW(P.x1, P.x1 + 1.6, 0, (k + 1) * 0.5, 4.2 - k * 0.62, 4.2 - k * 0.62 + 0.64, 0.4), st, 0.5 + k * 0.006, 0.54 + k * 0.006, 0, [0.05, 1.4]);
  G.add(boxW(P.x1 + 1.5, P.x1 + 1.85, 0, 6.9, -4.0, 4.9, 0.4), st, 0.56, 0.6, 0, [0.07, 1.4]);
  // garden animals (on low pedestals)
  const ped = (x: number, z: number, w: number, d: number, t0: number) => G.add(boxW(x - w / 2, x + w / 2, 0, 0.42, z - d / 2, z + d / 2, 0.3), st, t0, t0 + 0.02, 0, [0.06, 1.6]);
  ped(-6.3, 9.4, 4.4, 2.0, 0.86); elephant(GAD(0.88, 0.94, 0.42), -6.6, 0.42, 9.4, 0.95);
  ped(-1.6, 9.0, 2.0, 1.9, 0.88); bear(GAD(0.9, 0.95, 0.42), -1.6, 0.42, 9.0, 0.95);
  ped(-10.9, 8.8, 2.6, 1.3, 0.9); deer(GAD(0.92, 0.97, 0.42), -11.2, 0.42, 8.8, 0.95);
  G.add(cylW(2.6, 0, 8.6, 0.45, 0.32, 1.7, 0.25), st, 0.9, 0.93, 0, [0.07, 1.6]);
  pelican(GAD(0.93, 0.97, 1.7), 2.6, 1.7, 8.6, 1.0);
  return G;
};

// ---------------- the tomb (same style, small) ----------------
export const buildTomb = (x: number, z: number) => {
  const G = new Growth(), st = stoneM(), dk = darkM();
  G.add(boxW(x - 1.7, x + 1.7, 0, 1.3, z - 1.3, z + 1.3, 0.3), st, 0, 0.3, 0, [0.08, 1.5]);
  G.add(boxW(x - 0.7, x + 0.7, 0.2, 1.15, z + 1.3, z + 1.36, 0.2), dk, 0.2, 0.3, 0.2, [0.03, 2]);
  for (const sx of [-1, 1]) G.add(cylW(x + sx * 1.0, 0, z + 1.45, 0.24, 0.18, 1.9, 0.2), st, 0.25, 0.4, 0, [0.05, 2]);
  const sh = new THREE.Shape(); sh.moveTo(x - 1.7, 1.3); sh.lineTo(x + 1.7, 1.3); sh.lineTo(x + 1.7, 2.1); sh.lineTo(x - 1.7, 2.1); sh.lineTo(x - 1.7, 1.3);
  const hole = new THREE.Path(); hole.moveTo(x - 0.75, 1.3); for (let k = 0; k <= 16; k++) { const a = Math.PI - (k / 16) * Math.PI; hole.lineTo(x + 0.75 * Math.cos(a), 1.3 + 0.62 * Math.sin(a)); } sh.holes.push(hole);
  G.add(new THREE.ExtrudeGeometry(sh, { depth: 2.6, bevelEnabled: false, curveSegments: 16 }).translate(0, 0, z - 1.3), st, 0.4, 0.55, 1.3, [0.05, 1.5]);
  G.add(boxW(x - 0.7, x + 0.7, 1.3, 2.0, z - 0.2, z + 0.9, 0.2), dk, 0.4, 0.5, 1.3, [0.02, 2]);
  G.add(boxW(x - 1.85, x + 1.85, 2.1, 2.4, z - 1.45, z + 1.45, 0.3), st, 0.55, 0.62, 2.1, [0.05, 1.8]);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const px = x + dx * 1.55, pz = z + dz * 1.15;
    G.add(cylW(px, 2.4, pz, 0.2, 0.1, 0.9, 0.15), st, 0.62 + 0.04 * (dx + 1), 0.7 + 0.04 * (dx + 1), 2.4, [0.03, 2]);
    G.add(sphW(px, 3.4, pz, 0.16, 0.16, 0.16, 10), st, 0.7 + 0.04 * (dx + 1), 0.74 + 0.04 * (dx + 1), 3.25, null);
  }
  G.add(sphW(x, 2.4, z, 1.1, 1.05, 0.95, 22), st, 0.72, 0.9, 2.4, [0.06, 1.8]);
  G.add(new THREE.ConeGeometry(0.16, 0.9, 10).translate(x, 3.8, z), st, 0.9, 0.95, 3.35, null);
  bird((geo, mat, lump) => { G.add(geo, mat ?? st, 0.95, 1, 4.2, lump ?? null); }, x, 4.2, z, 1.2, -0.6);
  return G;
};

// ---------------- the strange stones of the path ----------------
/** kind 0 = little animal (body, head, two ears, a curled tail), 1 = snail spiral, 2 = heart, 3 = knobbly star, 4 = owl */
export const oddStone = (kind: number, x: number, z: number, s: number, yaw: number) => {
  const parts: THREE.BufferGeometry[] = [], add = (g: THREE.BufferGeometry) => parts.push(g);
  if (kind === 0) {
    add(sphW(0, 0.09, 0, 0.16, 0.1, 0.11, 16)); add(sphW(0.15, 0.15, 0, 0.08, 0.075, 0.075, 14));
    for (const sz of [-1, 1]) add(new THREE.ConeGeometry(0.03, 0.07, 8).translate(0.15, 0.24, sz * 0.04));
    add(tube([V(-0.15, 0.1, 0), V(-0.24, 0.17, 0), V(-0.2, 0.24, 0), V(-0.15, 0.2, 0)], 0.022, 12));
  } else if (kind === 1) {
    add(sphW(0, 0.1, 0, 0.13, 0.12, 0.08, 16));
    add(tube(Array.from({ length: 12 }, (_, i) => { const a = i * 0.6, r = 0.12 - i * 0.009; return V(Math.cos(a) * r, 0.11 + Math.sin(a) * r, 0.085); }), 0.02, 24));
    add(sphW(0.15, 0.04, 0, 0.1, 0.04, 0.06, 12));
  } else if (kind === 2) {
    add(sphW(-0.06, 0.15, 0, 0.09, 0.09, 0.07, 14)); add(sphW(0.06, 0.15, 0, 0.09, 0.09, 0.07, 14));
    add(new THREE.ConeGeometry(0.13, 0.17, 14).rotateZ(Math.PI).translate(0, 0.07, 0).scale(1, 1, 0.55));
  } else if (kind === 3) {
    add(sphW(0, 0.08, 0, 0.11, 0.08, 0.11, 14));
    for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; add(sphW(Math.cos(a) * 0.12, 0.06, Math.sin(a) * 0.12, 0.06, 0.05, 0.06, 10)); }
  } else {
    add(sphW(0, 0.13, 0, 0.11, 0.14, 0.1, 16));
    for (const sz of [-1, 1]) add(new THREE.ConeGeometry(0.03, 0.06, 8).translate(0, 0.28, sz * 0.05));
  }
  const m = new THREE.Matrix4().compose(V(x, 0, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), yaw), V(s, s, s));
  return parts.map((g) => g.applyMatrix4(m));
};
