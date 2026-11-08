// The two balloons as real geometry: a lathe envelope whose vertices are rewritten on the CPU each frame for its
// state (up = flying, lie = spread on the ground / cold-inflating, sag = collapsing, crumple = heaped after the
// landing), the tiny platform (1.44 m square floor, 4 posts with a washing-line railing, 4 gas bottles in the
// middle, burner frame overhead, ropes to the mouth ring) and the burner flame + glow (HDR, bloom).
import * as THREE from "three";
import { twoTone } from "./shade";
import { NOINK } from "./ink";
import { patchTex, patchGlow, plainTex } from "./bpaint";
import { ctex } from "./paint";
import { BState, PROFILE, MOUTH_Y, ENV_H, PLAT, profR } from "./story";

const NA = 64, NS = 40;
const POST_H = 1.0;   // the 4 railing posts
const LINE_Y = 0.6;   // washing-line railing height
const BURN_Y = 3.0;  // burner above the platform, on 4 rods from the post tops

const mat = (p: THREE.MeshLambertMaterialParameters) => twoTone(new THREE.MeshLambertMaterial(p));
const flameTex = () => ctex("bFlame", 64, 256, (g) => {
  const gr = g.createLinearGradient(0, 256, 0, 0);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,230,160,0.95)"); gr.addColorStop(0.6, "rgba(255,150,60,0.6)"); gr.addColorStop(1, "rgba(255,90,30,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
  const hz = g.createLinearGradient(0, 0, 64, 0);
  hz.addColorStop(0, "rgba(0,0,0,1)"); hz.addColorStop(0.3, "rgba(0,0,0,0)"); hz.addColorStop(0.7, "rgba(0,0,0,0)"); hz.addColorStop(1, "rgba(0,0,0,1)");
  g.globalCompositeOperation = "destination-out"; g.fillStyle = hz; g.fillRect(0, 0, 64, 256);
});
const glowTex = () => ctex("bBurnGlow", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.2, "rgba(255,255,255,0.6)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});

const hash = (a: number, b: number) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

export class Balloon {
  root = new THREE.Group();
  private env: THREE.Mesh; private geo: THREE.BufferGeometry; private emat: THREE.MeshLambertMaterial;
  private plat = new THREE.Group(); private ropes: THREE.Mesh[] = []; private ring: THREE.Mesh;
  private flame: THREE.Mesh; private flame2: THREE.Mesh; private glow: THREE.Sprite;
  constructor(private sc: number, private plain: boolean) {
    // ---- envelope ----
    const pos = new Float32Array((NA + 1) * (NS + 1) * 3), uv = new Float32Array((NA + 1) * (NS + 1) * 2), idx: number[] = [];
    for (let j = 0; j <= NS; j++) for (let i = 0; i <= NA; i++) {
      const k = j * (NA + 1) + i;
      uv[k * 2] = i / NA; uv[k * 2 + 1] = j / NS;
      if (i < NA && j < NS) { const a = k, b = k + 1, c = k + NA + 2, d = k + NA + 1; idx.push(a, b, c, a, c, d); }
    }
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    this.geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    this.geo.setIndex(idx);
    this.emat = mat(plain ? { map: plainTex(), side: THREE.DoubleSide } : { map: patchTex(), emissiveMap: patchGlow(), emissive: new THREE.Color("#ff9a4a"), emissiveIntensity: 0, side: THREE.DoubleSide });
    if (plain) { this.emat.emissiveMap = plainTex(); this.emat.emissive = new THREE.Color("#ff9a4a"); this.emat.emissiveIntensity = 0; }
    this.env = new THREE.Mesh(this.geo, this.emat);
    this.env.castShadow = true; this.env.receiveShadow = true; this.env.frustumCulled = false;
    this.root.add(this.env);
    // ---- platform ----
    const steel = mat({ color: "#8b939c" }), dark = mat({ color: "#4a4e58" }), floor = mat({ color: "#a8a49a" });
    const bottle = mat({ color: plain ? "#b8b4a8" : "#c8503a" }), line = mat({ color: "#efe8da" }), hose = mat({ color: "#2a2a30" });
    const B = (m: THREE.Material, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => {
      const me = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), m);
      me.castShadow = true; me.receiveShadow = true; this.plat.add(me); return me;
    };
    const C = (m: THREE.Material, a: THREE.Vector3, b: THREE.Vector3, r: number, seg = 6) => {
      const d = b.clone().sub(a), me = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), m);
      me.position.copy(a).addScaledVector(d, 0.5); me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
      me.castShadow = true; this.plat.add(me); return me;
    };
    const P = PLAT, V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    B(floor, -P, P, 0, 0.06, -P, P);
    B(dark, -P - 0.02, P + 0.02, 0, 0.04, -P - 0.02, P + 0.02);
    for (const [x, z] of [[-P, -P], [P, -P], [P, P], [-P, P]]) C(steel, V(x, 0.04, z), V(x, POST_H, z), 0.022);
    const cs = [[-P, -P], [P, -P], [P, P], [-P, P]];
    for (let i = 0; i < 4; i++) {
      const [x0, z0] = cs[i], [x1, z1] = cs[(i + 1) % 4];
      C(line, V(x0, LINE_Y, z0), V(x1, LINE_Y - 0.03, z1), 0.012, 5);         // washing line, slight sag
      C(steel, V(x0, POST_H, z0), V(0, BURN_Y, 0), 0.016);                      // rods up to the burner
    }
    // 4 gas bottles in the middle + hoses up to the burner
    for (const [x, z] of [[-0.14, -0.14], [0.14, -0.14], [0.14, 0.14], [-0.14, 0.14]]) {
      const g = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.58, 14).translate(x, 0.06 + 0.29, z), bottle);
      g.castShadow = true; this.plat.add(g);
      const top = new THREE.Mesh(new THREE.SphereGeometry(0.115, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).translate(x, 0.64, z), bottle); this.plat.add(top);
      const v = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8).translate(x, 0.78, z), dark); this.plat.add(v);
      C(hose, V(x, 0.8, z), V(x * 0.3, BURN_Y, z * 0.3), 0.012, 5);
    }
    // burner: coil + cup
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 8, 20).rotateX(Math.PI / 2).translate(0, BURN_Y + 0.12, 0), dark);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.2, 14).translate(0, BURN_Y + 0.1, 0), steel);
    this.plat.add(coil, cup);
    this.root.add(this.plat);
    // mouth ring + 4 ropes (up / sag modes)
    this.ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 6, 40).rotateX(Math.PI / 2), dark);
    this.root.add(this.ring);
    for (let i = 0; i < 4; i++) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1, 5), hose); this.ropes.push(r); this.root.add(r); }
    // ---- flame + glow ----
    const fm = () => new THREE.MeshBasicMaterial({ map: flameTex(), color: new THREE.Color(3.2, 1.7, 0.6), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide });
    this.flame = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0), fm());
    this.flame2 = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0), fm());
    this.flame2.rotation.y = Math.PI / 2;
    for (const f of [this.flame, this.flame2]) { f.layers.set(NOINK); f.renderOrder = 5; this.root.add(f); }
    this.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color(2.4, 1.3, 0.55), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
    this.glow.layers.set(NOINK); this.glow.renderOrder = 5;
    this.root.add(this.glow);
  }

  /** pose for state s at frame f */
  update(s: BState, f: number) {
    const R = this.root;
    R.visible = s.vis;
    if (!s.vis) return;
    R.position.set(...s.pos);
    const sc = this.sc, p = this.geo.attributes.position as THREE.BufferAttribute, a = p.array as Float32Array;
    const i0 = s.inflate, crumple = s.mode === "crumple";
    R.rotation.set(0, crumple ? -Math.PI / 2 + 0.35 : 0, 0);
    const up = s.mode === "up" || s.mode === "sag";
    const sag = s.mode === "sag" ? 1 - i0 : 0;
    for (let j = 0; j <= NS; j++) {
      const v = j / NS, h = v * ENV_H, r0 = profR(h) * sc;
      for (let i = 0; i <= NA; i++) {
        const th = (i / NA) * Math.PI * 2, k = (j * (NA + 1) + i) * 3;
        // load-tape scallops between the 16 gores
        const sca = 1 + 0.03 * Math.abs(Math.sin(th * 8)) * (j > 0 && j < NS ? 1 : 0);
        if (up) {
          const vs = 1 - 0.62 * sag, rs = 1 + 0.35 * sag * Math.sin(Math.PI * Math.min(1, v * 1.3));
          const wob = sag * 0.35 * Math.sin(th * 5 + v * 9) * Math.sin(Math.PI * v);
          const r = r0 * sca * rs + wob;
          const y = (MOUTH_Y * (1 - 0.45 * sag) + h * vs) * sc;
          a[k] = Math.cos(th) * r - sag * 3.5 * sc * v * v; a[k + 1] = y; a[k + 2] = Math.sin(th) * r;
        } else {
          // lying along -x from the mouth (1.4 m beside the platform); flat double layer widens to pi/2 r
          const c = Math.cos(th), sn = Math.sin(th), top = c > 0 ? 1 : 0;
          const n1 = hash(i * 0.37, j * 0.71), n2 = hash(j * 1.3, i * 0.21);
          const wr = crumple ? 0.3 + 0.15 * n1 : 0.08 * n1;
          let Y = r0 * i0 * (1 + c) + 0.03 + 0.07 * top + (1 - i0) * wr * top * Math.sin(Math.PI * v);
          let Z = r0 * sn * (i0 + (1 - i0) * (crumple ? 0.7 : 1.1));
          let X = -(1.5 * sc + h * sc * (crumple ? 0.45 : 0.98));
          if (crumple) { Z += (n2 - 0.5) * 0.25; X += Math.sin(v * 9 + sn * 2) * 0.3; Y += 0.18 * Math.abs(Math.sin(v * 5 + th * 1.5)) * Math.sin(Math.PI * v); }
          a[k] = X; a[k + 1] = Y; a[k + 2] = Z;
        }
      }
    }
    p.needsUpdate = true;
    this.geo.computeVertexNormals();
    this.geo.computeBoundingSphere();
    // wet fabric goes darker and heavier (first balloon)
    const w = s.wet;
    this.emat.color.setRGB(1 - 0.82 * w, 1 - 0.8 * w, 1 - 0.7 * w);
    this.emat.emissiveIntensity = up ? s.glow * (this.plain ? 0.25 : 0.4) * (1 - 0.8 * w) : 0;
    // ropes / ring only when the envelope stands above the platform
    const mouthY = (MOUTH_Y * (1 - 0.45 * sag)) * sc, mr = PROFILE[0][1] * sc;
    this.ring.visible = up; this.ring.position.set(-sag * 0, mouthY, 0); this.ring.scale.setScalar(mr);
    const cs = [[-PLAT, -PLAT], [PLAT, -PLAT], [PLAT, PLAT], [-PLAT, PLAT]];
    this.ropes.forEach((r, i) => {
      r.visible = up;
      if (!up) return;
      const [x, z] = cs[i], A = new THREE.Vector3(x, POST_H, z), Bv = new THREE.Vector3(x / PLAT * mr * 0.707, mouthY, z / PLAT * mr * 0.707);
      const d = Bv.clone().sub(A);
      r.position.copy(A).addScaledVector(d, 0.5); r.scale.set(1, d.length(), 1);
      r.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    });
    // flame (two crossed planes) + glow
    const b = s.burner, on = b > 0.02 && up;
    for (const fl of [this.flame, this.flame2]) {
      fl.visible = on;
      fl.position.set(0, BURN_Y + 0.18, 0);
      fl.scale.set(0.34 + 0.22 * b, 0.5 + 2.6 * b * (0.9 + 0.1 * Math.sin(f * 2.3)), 1);
    }
    this.glow.visible = on || (up && s.glow > 0.3);
    this.glow.position.set(0, BURN_Y + 0.5 + 0.6 * b, 0);
    this.glow.scale.setScalar(0.8 + 1.7 * Math.max(b, 0.25 * s.glow));
    (this.glow.material as THREE.SpriteMaterial).opacity = Math.min(1, 0.35 + 0.8 * b);
    this.plat.visible = true;
    // after the crash the platform lies tipped on its side
    if (crumple) { this.plat.rotation.set(0.18, 0, 0.22); this.plat.position.set(0.3, 0.12, 0); } else { this.plat.rotation.set(0, 0, 0); this.plat.position.set(0, 0, 0); }
  }
}
