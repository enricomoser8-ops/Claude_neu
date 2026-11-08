// The whole balloon short as one three.js world: sky (+ stars at night), light rig (camera-relative sun frozen per
// shot, two-tone shading), all sets (sets.ts, one group per set, only the current one shown), practicals (lamp
// glows, ground light pools, lit windows), the moving story parts (the two balloons, barrier, door, needle,
// searchlight) and the cast. update(id, f, camera) poses everything for shot `id` at frame f (pure function of id + f).
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { staticFile } from "remotion";
import { V, Kit, Ray } from "./build";
import { ctex, cloudHD } from "./paint";
import { LIGHTS, LOOK, LightPreset, LightName } from "./lights";
import { TONE, CHAR, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx, stage } from "./cast";
import { buildSets, SetParts } from "./sets";
import { FPS, SHOTS, camAt, ShotDef, V3, at, b1At, b2At, barrierAt, lightAt, doorAt, B1_SCALE } from "./story";
import { Balloon } from "./balloon";

const KENNEY = ["coatRackStanding", "pottedPlant"];
let kitP: Promise<Kit> | null = null;
export const loadKit = () => {
  if (!kitP) {
    const loader = new GLTFLoader();
    kitP = Promise.all(KENNEY.map((n) => loader.loadAsync(staticFile(`ballon/kenney/${n}.glb`)).then((g) => [n, g.scene] as const).catch(() => [n, null] as const)))
      .then((list) => Object.fromEntries(list.filter((e) => e[1]).map(([n, s]) => [n, s!])) as Kit);
  }
  return kitP;
};

const glowTex = () => ctex("kGlow", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.12, "rgba(255,255,255,0.9)"); gr.addColorStop(0.35, "rgba(255,255,255,0.25)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
const poolTex = () => ctex("kPool", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.5, "rgba(255,255,255,0.45)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});

/** every lens position of the film looking at its subject: centre, sides and top of frame (props there are left out) */
const sightLines = (): Ray[] => {
  const out: Ray[] = [];
  for (const s of SHOTS) for (let f = s.a; f < s.b; f += 2) {
    const c = camAt(s.id, f), o = V(...c.pos), look = V(...c.look);
    const fw = look.clone().sub(o), len = fw.length();
    fw.normalize();
    const rt = fw.clone().cross(V(0, 1, 0)).normalize(), up = rt.clone().cross(fw);
    const ty = Math.tan((c.fov * Math.PI) / 360), tx = ty * (9 / 16);
    for (const [sx, sy] of [[0, 0], [-0.6, 0], [0.6, 0], [0, 0.6], [0, -0.4]])
      out.push({ o, d: fw.clone().addScaledVector(rt, sx * tx).addScaledVector(up, sy * ty), len, core: sx === 0 && sy === 0 });
  }
  return out;
};

const isIndoor = (l: LightName) => l === "indoor";

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sunCache = new Map<number, THREE.Vector3>();
  private cloudMaps: Record<LightName, THREE.Texture[]>;
  private clouds: THREE.Mesh[] = [];
  private parts: SetParts;
  private glows: THREE.Sprite[] = [];
  private pools: THREE.Mesh;
  private stars: THREE.Points;
  private big = new Balloon(1, false); private small = new Balloon(B1_SCALE, true);
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();

  constructor(kit: Kit) {
    const R = this.root;
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el));
          c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el));
          c = mix(c, c4, smoothstep(e.z, e.w, el));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    R.add(this.sky);
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    R.add(this.hemi, this.sun, this.sun.target);
    const cm = (n: LightName) => [0, 1, 2, 3].map((k) => cloudHD(k, LOOK[n].cloud));
    this.cloudMaps = { day: cm("day"), golden: cm("golden"), night: cm("night"), indoor: cm("day"), dusk: cm("dusk"), morning: cm("morning"), fog: cm("fog") };
    // stars: a fixed dome of points round the lens (night only)
    const sp: number[] = [], sc: number[] = [];
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let i = 0; i < 1400; i++) {
      const a = rnd() * Math.PI * 2, el = Math.asin(0.04 + 0.96 * rnd()), k = 0.6 + 0.9 * rnd() ** 3;
      sp.push(Math.cos(el) * Math.cos(a) * 1000, Math.sin(el) * 1000, Math.cos(el) * Math.sin(a) * 1000);
      sc.push(k, k * 0.97, k * (0.9 + 0.2 * rnd()));
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3)); sg.setAttribute("color", new THREE.Float32BufferAttribute(sc, 3));
    this.stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 2.6, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false, fog: false }));
    this.stars.layers.set(NOINK); this.stars.frustumCulled = false; this.stars.renderOrder = -0.5;
    R.add(this.stars);
    R.add(this.big.root, this.small.root);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.3, d = 640 + (i % 3) * 60;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      const w = 150 + (i % 4) * 30;
      m.position.set(Math.cos(a) * d, 110 + (i % 4) * 36, Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }
    this.parts = buildSets(R, sightLines(), kit);
    const gt = glowTex();
    for (const l of this.parts.lamps) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: gt, color: new THREE.Color(l.col).multiplyScalar(3.2), blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true }));
      s.position.set(...l.pos); s.scale.setScalar(l.size); s.layers.set(NOINK); s.visible = false;
      this.glows.push(s); R.add(s);
    }
    const pos: number[] = [], uv: number[] = [];
    for (const l of this.parts.lamps) {
      if (!l.pool) continue;
      const [x, , z] = l.pos, r = l.pool, y = 0.035;
      pos.push(x - r, y, z + r, x + r, y, z + r, x + r, y, z - r, x - r, y, z + r, x + r, y, z - r, x - r, y, z - r);
      uv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); pg.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    this.pools = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ map: poolTex(), color: new THREE.Color("#ffb766").multiplyScalar(0.3), blending: THREE.AdditiveBlending,
      transparent: true, depthWrite: false, fog: true, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
    this.pools.layers.set(NOINK); this.pools.frustumCulled = false; this.pools.renderOrder = 0.4;
    R.add(this.pools);
  }

  /** camera-relative sun, frozen per shot: the shot's mean view direction turned by az toward screen right, lifted by el */
  private shotSun(id: number, s: ShotDef, L: LightPreset) {
    let v = this.sunCache.get(id);
    if (v) return v;
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) {
      const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
      fx += x / n; fz += z / n;
    }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(SUN_SHOT[id]?.az ?? L.az), el = THREE.MathUtils.degToRad(SUN_SHOT[id]?.el ?? L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, s = SHOTS[id - 1], L = LIGHTS[s.light];
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    const inside = isIndoor(s.light);
    cam.fov = c.fov; cam.near = inside ? 0.05 : 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- light rig ----
    const K = LOOK[s.light], sunDir = this.shotSun(id, s, L);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = inside ? 8 : THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 70);
    const sfocus = inside ? V(...at(s.set, id === 11 ? 4.6 : 0, 1, -1.5)) : focus;
    this.sun.position.copy(sfocus).addScaledVector(sunDir, 220); this.sun.target.position.copy(sfocus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    // ---- sky, fog, clouds ----
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); const fk = FOGK[id] ?? 1; this.fog.near = L.fogNear * fk; this.fog.far = L.fogFar * fk;
    scene.fog = this.fog; scene.background = null;
    for (let i = 0; i < this.clouds.length; i++) {
      const m = this.clouds[i], mat = m.material as THREE.MeshBasicMaterial;
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
      mat.map = this.cloudMaps[s.light][i % 4];
      mat.opacity = s.light === "dusk" ? 0.8 : s.light === "night" ? 0.45 : s.light === "fog" ? 0 : 1;
      m.visible = !inside;
    }
    // ---- sets: only the current one is drawn ----
    for (const [k, g] of Object.entries(this.parts.groups)) g.visible = k === s.key;
    this.stars.visible = s.light === "night";
    this.stars.position.copy(cam.position);
    // ---- practicals: street lamps at dusk, strip lights + lit windows at night / in the fog, indoor lamps inside ----
    const dusk = s.light === "dusk", night = s.light === "night" || s.light === "fog";
    for (const g of this.parts.glowMats) g.m.emissiveIntensity = dusk || night ? g.k : 0;
    this.parts.lamps.forEach((l, i) => {
      this.glows[i].visible = l.set === s.key && (l.when === "always" || (l.when === "dusk" && (dusk || night)) || (l.when === "night" && night) || (l.when === "indoor" && inside));
    });
    this.pools.visible = dusk || night;
    // ---- story parts ----
    this.poseParts(id, f, t);
    // ---- cast + effects ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0), up = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 1);
    const st = stage(id, t, { pos: cam.position, right, up, sun: sunDir, quat: cam.quaternion });
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    let ai = 0;
    const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 2.2 * sc2))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), p.roll ?? 0);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      a.mesh.castShadow = L.actorShadow;
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    const fused: Fx[] = [];
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e2 = this.fx(fi++);
      e2.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e2.use(!!p.soft);
      e2.mesh.visible = true;
      e2.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e2.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { e2.mesh.quaternion.copy(cam.quaternion); e2.mesh.rotateZ(p.rot ?? 0); }
      e2.mesh.scale.set(p.w, p.h, 1);
      e2.mesh.renderOrder = p.order ?? e2.mesh.renderOrder;
      fused.push(e2);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const e3 of fused) e3.bind();
    return focus;
  }

  /** moving set parts: the balloons, the barrier boom, the front door, the sewing machine, the searchlight */
  private poseParts(id: number, f: number, _t: number) {
    const P = this.parts;
    this.big.update(b2At(id, f), f);
    this.small.update(b1At(id, f), f);
    P.barrier.rotation.set(-barrierAt(f), 0, 0);
    P.door.rotation.set(0, doorAt(id, f), 0);
    P.needle.position.y = id === 5 ? -0.028 * (0.5 + 0.5 * Math.sin(f * 1.9)) : 0;
    P.wheel.rotation.set(id === 5 ? -f * 0.95 : 0, 0, 0);
    const L = lightAt(id, f);
    P.lightYaw.rotation.set(0, L.yaw, 0);
    P.lightPitch.rotation.set(-L.pitch, 0, 0);
    P.beam.visible = L.on > 0;
    P.beamMat.uniforms.on.value = L.on;
  }
}

/** per-shot sun overrides */
const SUN_SHOT: Record<number, { az?: number; el?: number }> = { 15: { az: 140, el: 16 }, 16: { az: 150, el: 16 } };
/** per-shot fog distance factor (aerial shots see further) */
const FOGK: Record<number, number> = { 7: 1.8, 8: 1.4, 1: 1.7, 6: 2.6, 12: 1.4, 13: 1.4, 14: 1.6, 16: 2.2 };
export type { V3 };
