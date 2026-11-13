// Einfacher After-Effects-Mock (Kopie aus Short 41 / Kleopatra 12.11.; ergaenzt: Transform-Props kennen ihre Ebene fuer checkAnims)
// Freiheitsstatue 13.11. (Karten-Vox, 25 fps): CC Sphere mit Parameter-Namen und Wertebereichen wie AE 2023 (Gruppen Rotation/Light/Shading),
//   KONSTGROESSE-Ausdruck (Beschriftung behaelt Bildschirmgroesse unter der Welt-Kamera) wird nachgerechnet,
//   PLANRAND: jede sichtbare Kartenflaeche ('Karte Meer ...') und die Satelliten-Platte decken das ganze Bild (keine Kante sichtbar),
//   FPS: jede Comp muss 25 fps haben.
// fuer Trockenlaeufe: node aemock.js <build.jsx> [--dump <szene> <sekunde>]
// Prueft: Laufzeitfehler, NaN/undefined-Werte, unbekannte Effekt-Parameter (Namen wie in AE 2023, Englisch).
// Runde 2 (Review 1 in AE): echtes Keyframe-Modell (Sortierung, Ease mit Einfluss, Hold), Eltern-Ketten, Ankerpunkte,
// Bildgroessen + Alpha-Rahmen der Freisteller (PIL), geschaetzte Textbreiten (Schriftgroesse x Zeichen). Damit pro Szene und Frame:
//   RAND      wichtiges Element ragt (teilweise sichtbar) ueber x 60..1020 hinaus (nach Kamera, Eltern, Master-Gate-Weave 102 %)
//   LEER      >= 0,3 s nichts Lesbares (kein Text >= 28 px Glyphenhoehe, < 6 % Bildflaeche aus Bildern/Zeichnungen)
//   LOGO      Element im Logo-Bereich oben links (bis y 262)
//   UT        Bild / Flaeche in der Untertitelzone (y 1325..1405, x 300..780), ausser eine weiche Abdunklung 'FIX UT-Abdunklung' liegt dahinter
//   KOLLISION Text liegt auf einem Bild (Freisteller/Abzug)
//   Referenzen wie in AE: addProperty auf einer Gruppe (auch 2. Effekt / 2. Maske auf derselben Ebene) macht vorher geholte
//             Referenzen auf deren Kinder ungueltig -> Zugriff wirft "Object is invalid" (Idee aus ae-weltkrieg/gen/aemock.js)
//   UNSCHAERFE Weichzeichner (Fast Box Blur, Gaussian, Compound) wirkt > 0,3 s am Stueck
//   HOCHSKALIERT Archivfoto ueber 125 % seiner echten Pixel (inkl. Precomp, Kamera, Gate Weave)
//   Wertebereiche wie in AE (Runde 3): Trim Start/End/Opacity 0..100, Ease-Einfluss 0.1..100 -> sonst Fehler wie in AE
//             ("Value 101,72 out of range 0 to 100"); Keys naeher als 1/2 Frame -> KEYS ZU NAH
//   KLEIN     >= 0,5 s ist das groesste Bild/Grafik-Element (Text nur ab 100 px Hoehe, ohne duenne Linien) kleiner als 60.000 px2 (z. B. 300 x 200)
//             UND alles zusammen deckt < 15 % des Bildes = Grafik zu klein / zu viel leeres Papier (Review 2: 18-28 s)
//   UTNAH     Bildtext liegt in/direkt ueber der Untertitelzone (y 1285..1405, x 300..780)
//   BLASS     Label mit Randblende (EDGEFADE) steht ruhig im Bild, ist aber nur 5..90 % sichtbar (= halb angeschnitten)
//   SCHWENK   Reissschwenk (Zeitstrahl-Linie > 30 px/Frame): zaehlt fuer LEER/KLEIN nicht (Bewegungsunschaerfe fuellt das Bild),
//             darf aber hoechstens 0,7 s dauern, sonst SCHWENK-Problem
// Uebergaenge: erste 3 und letzte 7 Frames je Szene sowie schnell bewegte Elemente (> 10 px/Frame) zaehlen nicht (Bewegung im Standbild ist ok).
// Ebenen mit Opacity-Ausdruck "EDGEFADE" blenden sich vor dem Rand selbst aus und gelten als sicher.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const src = fs.readFileSync(process.argv[2], 'utf8');
const ROOT = path.join(__dirname, '..');
const problems = [];
const FXP = {
  'ADBE Posterize Time': ['Frame Rate'], 'ADBE Exposure2': ['Channels', 'Exposure', 'Offset', 'Gamma Correction'],
  'ADBE Geometry2': ['Anchor Point', 'Position', 'Uniform Scale', 'Scale Height', 'Scale Width', 'Skew', 'Skew Axis', 'Rotation', 'Opacity'],
  'VISINF Grain Implant': ['Viewing Mode', 'Preset', { g: 'Tweaking', p: ['Channel Intensities', 'Intensity', 'Size', 'Softness', 'Aspect Ratio'] }],
  'ADBE Noise': ['Amount of Noise', 'Noise Type', 'Clipping'],
  'ADBE Roughen Edges': ['Edge Type', 'Edge Color', 'Border', 'Edge Sharpness', 'Fractal Influence', 'Scale', 'Stretch Width or Height', 'Offset (Turbulence)', 'Complexity', 'Evolution', { g: 'Evolution Options', p: ['Cycle Evolution', 'Cycle (in Revolutions)', 'Random Seed'] }],
  'ADBE Turbulent Displace': ['Displacement', 'Amount', 'Size', 'Offset (Turbulence)', 'Complexity', 'Evolution'],
  'ADBE Box Blur2': ['Blur Radius', 'Iterations', 'Blur Dimensions', 'Repeat Edge Pixels'],
  'ADBE Compound Blur': ['Blur Layer', 'Maximum Blur', 'If Layer Sizes Differ', 'Invert Blur'],
  'ADBE Ramp': ['Start of Ramp', 'Start Color', 'End of Ramp', 'End Color', 'Ramp Shape', 'Ramp Scatter', 'Blend With Original'],
  'ADBE Linear Wipe': ['Transition Completion', 'Wipe Angle', 'Feather'],
  'CC Page Turn': ['Controls', 'Fold Position', 'Fold Direction', 'Fold Radius', 'Light Direction', 'Render', 'Back Page', 'Back Opacity', 'Paper Color'],
  'CC Burn Film': ['Burn', 'Center', 'Random Seed'], 'CC Ball Action': ['Scatter', 'Rotation Axis', 'Rotation', 'Twist Property', 'Twist Angle', 'Grid Spacing', 'Ball Size', 'Instability State'],
  'ADBE Tint': ['Map Black To', 'Map White To', 'Amount to Tint'], 'ADBE Black&White': ['Reds', 'Yellows'],
  'ADBE Brightness & Contrast 2': ['Brightness', 'Contrast', 'Use Legacy'],
  'CC Sphere': [{ g: 'Rotation', p: ['Rotation X', 'Rotation Y', 'Rotation Z'] }, 'Radius', 'Offset', 'Render',
    { g: 'Light', p: ['Light Intensity', 'Light Color', 'Light Height', 'Light Direction'] },
    { g: 'Shading', p: ['Ambient', 'Diffuse', 'Specular', 'Roughness', 'Metal', 'Reflective', 'Reflection Map', 'Internal Shadows', 'Transparency Falloff'] }], 'ADBE Drop Shadow': ['Shadow Color', 'Opacity', 'Direction', 'Distance', 'Softness', 'Shadow Only'],
};
// Hinweis: In AE heisst "Stretch Map to Fit" beim Compound Blur "If Layer Sizes Differ" (Checkbox "Stretch Map to Fit")
FXP['ADBE Compound Blur'].push('Stretch Map to Fit');

// ---------- Bildgroessen + Alpha-Rahmen (sichtbarer Bereich der Freisteller) ----------
let IMG = {};
try {
  const py = "import json,glob,os,sys\nfrom PIL import Image\nr={}\nfor f in glob.glob(os.path.join(sys.argv[1],'archiv','*'))+glob.glob(os.path.join(sys.argv[1],'tex','*')):\n  try:\n    im=Image.open(f); b=None\n    if im.mode in ('RGBA','LA'): b=im.getchannel('A').point(lambda v:255 if v>40 else 0).getbbox()\n    r[os.path.basename(f)]=[im.size[0],im.size[1],b]\n  except Exception: pass\nprint(json.dumps(r))";
  IMG = JSON.parse(cp.execFileSync('python3', ['-c', py, ROOT], { encoding: 'utf8' }));
} catch (e) { console.log('Hinweis: Bildgroessen nicht lesbar (python3/PIL), Rand-Pruefung ungenauer'); }

function chk(v, where) {
  const bad = (x) => x === undefined || (typeof x === 'number' && !isFinite(x));
  if (bad(v) || (Array.isArray(v) && v.some(x => bad(x) || (Array.isArray(x) && x.some(bad))))) problems.push('UNGUELTIGER WERT bei ' + where + ': ' + JSON.stringify(v));
}
// ---------- Keyframes wie in AE: sortiert, gleiche Zeit = gleicher Key, Ease ueber Einfluss (Geschwindigkeit 0), Hold ----------
function bez(a, b, c, d, s) { const m = 1 - s; return m * m * m * a + 3 * m * m * s * b + 3 * m * s * s * c + s * s * s * d; }
function easeProg(u, outInf, inInf) {
  const x1 = outInf, x2 = 1 - inInf; let lo = 0, hi = 1;
  for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2; if (bez(0, x1, x2, 1, mid) < u) lo = mid; else hi = mid; }
  return bez(0, 0, 1, 1, (lo + hi) / 2);
}
function lerpV(a, b, p) {
  if (Array.isArray(a)) return a.map((x, i) => (typeof x === 'number' && Array.isArray(b) && typeof b[i] === 'number') ? x + (b[i] - x) * p : x);
  if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * p;
  return p < 1 ? a : b;
}
// ---------- Griffe mit AE-artiger Ungueltigkeit ----------
let CLOCK = 0;
function handle(n) {
  const stamp = ++CLOCK;
  return new Proxy(n, {
    get(t, k) { if (k === '__node') return t; if (stamp <= t._inv) throw new Error('Object is invalid (Mock: Referenz auf "' + t.name + '" nach addProperty auf "' + t._invBy + '" benutzt)'); return t[k]; },
    set(t, k, v) { if (stamp <= t._inv) throw new Error('Object is invalid (Mock: Referenz auf "' + t.name + '" nach addProperty auf "' + t._invBy + '" gesetzt)'); t[k] = v; return true; },
  });
}
function invalidateBelow(n0, by) {
  const st = ++CLOCK;
  (function rec(n) {
    const ch = [].concat(n.added || [], n._list || [], Object.values(n.kids || {}));
    for (const c of ch) { c._inv = st; c._invBy = by; rec(c); }
  })(n0);
}
const RANGE = { 'Ambient': [0, 100], 'Diffuse': [0, 100], 'Specular': [0, 100], 'Roughness': [0, 100], 'Metal': [0, 100], 'Reflective': [0, 100],
  'Light Intensity': [0, 400], 'Light Height': [-100, 100], 'Radius': [0, 32000], 'Amount to Tint': [0, 100], 'Transition Completion': [0, 100],
  'ADBE Vector Trim End': [0, 100], 'ADBE Vector Trim Start': [0, 100], 'ADBE Opacity': [0, 100], 'ADBE Vector Fill Opacity': [0, 100], 'ADBE Vector Group Opacity': [0, 100], 'ADBE Mask Opacity': [0, 100] };
function rng(p, v) {
  const r = RANGE[p.matchName]; if (!r || typeof v !== 'number') return;
  if (v < r[0] - 1e-9 || v > r[1] + 1e-9) throw new Error('After Effects error: Value ' + v.toFixed(2) + ' out of range ' + r[0] + ' to ' + r[1] + ' (' + p.matchName + ')');
}
function prop(name, matchName, dflt) {
  const p = { name, matchName: matchName || name, propertyType: 6212, keys: [], expression: '', numKeys: 0, _v: dflt === undefined ? 0 : dflt, _inv: 0, _invBy: '',
    added: [], kids: {},
    setValue(v) { chk(v, this.name); rng(this, v); this._v = v; }, get value() { return this._v; },
    addKey(t) {
      chk(t, this.name + ' key');
      for (let i = 0; i < this.keys.length; i++) {
        const d = Math.abs(this.keys[i].t - t); if (d < 1e-6) return i + 1;
        if (d < 0.5 / 25) problems.push('KEYS ZU NAH bei ' + this.name + ': ' + this.keys[i].t.toFixed(4) + ' / ' + t.toFixed(4) + ' s');
      }
      const k = { t, v: this._v, inInf: null, outInf: null, hold: false };
      let i = 0; while (i < this.keys.length && this.keys[i].t < t) i++;
      this.keys.splice(i, 0, k); this.numKeys = this.keys.length; return i + 1;
    },
    keyTime(i) { return this.keys[i - 1].t; }, keyValue(i) { return this.keys[i - 1].v; },
    setValueAtKey(i, v) { chk(v, this.name + ' keyval'); rng(this, v); if (this.keys[i - 1]) this.keys[i - 1].v = v; },
    setValueAtTime(t, v) { chk(t, this.name); chk(v, this.name); const i = this.addKey(t); this.keys[i - 1].v = v; },
    nearestKeyIndex(t) { let best = 1, bd = 1e9; this.keys.forEach((k, i) => { const d = Math.abs(k.t - t); if (d < bd) { bd = d; best = i + 1; } }); return best; },
    setTemporalEaseAtKey(i, a, b) {
      if (a.length !== 1 && a.length !== 2 && a.length !== 3) throw new Error('ease dims');
      const k = this.keys[i - 1]; if (k) { k.inInf = a[0].influence; k.outInf = b[0].influence; }
    },
    setInterpolationTypeAtKey(i, a, b) { const k = this.keys[i - 1]; if (k && a === 1) k.hold = true; },
    setSpatialTangentsAtKey() {},
    valueAtTime(t) {
      const K = this.keys;
      if (!K.length) return this._v;
      if (t <= K[0].t) return K[0].v;
      if (t >= K[K.length - 1].t) return K[K.length - 1].v;
      let i = 0; while (K[i + 1].t < t) i++;
      const a = K[i], b = K[i + 1];
      if (a.hold) return a.v;
      const u = (t - a.t) / (b.t - a.t);
      const pr = (a.outInf === null && b.inInf === null) ? u : easeProg(u, (a.outInf === null ? 16.67 : a.outInf) / 100, (b.inInf === null ? 16.67 : b.inInf) / 100);
      return lerpV(a.v, b.v, pr);
    },
    addProperty(n) { const self = this.__node || this; invalidateBelow(self, self.name); const c = mkGroup(n); self.added.push(c); self.numProperties = self.added.length; return handle(c); },
    property(n) {
      if (n === undefined) throw new Error('property(undefined)');
      const self = this.__node || this;
      if (typeof n === 'number') { if (self.added[n - 1]) return handle(self.added[n - 1]); }
      else { const f = self.added.find(c => c.matchName === n || c.name === n); if (f) return handle(f); }
      return handle(self.kids[n] = self.kids[n] || mkGroup(String(n)));
    },
    numProperties: 0 };
  return p;
}
function mkGroup(n) {
  const g = prop(n, n);
  g.parentProperty = { property: (x) => mkGroup(String(x)) };
  return g;
}
global.KeyframeEase = function (s, i) { if (!(i >= 0.1 && i <= 100)) throw new Error('After Effects error: Ease-Einfluss ' + i + ' ausserhalb 0.1..100'); if (!isFinite(s)) throw new Error('Ease-Geschwindigkeit ungueltig: ' + s); this.speed = s; this.influence = i; };
function effect(match) {
  const e = prop(match, match); e.propertyType = 6213; const list = [];
  const spec = FXP[match] || null;
  function build(arr, into) { for (const it of arr) { if (typeof it === 'string') into.push(prop(it)); else { const g = prop(it.g); g.propertyType = 6213; const sub = []; build(it.p, sub); g._list = sub; g.numProperties = sub.length; g.property = (i) => sub[i - 1] ? handle(sub[i - 1]) : null; into.push(g); } } }
  if (spec) build(spec, list); else for (const n of ['Amount', 'Position']) list.push(prop(n));
  e._list = list; e.numProperties = list.length;
  e.property = (i) => { const x = typeof i === 'number' ? list[i - 1] : list.find(p => p.name === i); return x ? handle(x) : null; };
  return e;
}
// ---------- Text: geschaetzte Breite (em-Anteile je Zeichen, eher grosszuegig) ----------
function charW(ch, font) {
  const sans = /Arial|Courier/.test(font), bold = /Bold|Black/.test(font);
  let w;
  if (/[0-9]/.test(ch)) w = 0.55;
  else if (ch === ' ') w = 0.27;
  else if (/[.,:;!'|]/.test(ch)) w = 0.28;
  else if (/[-()]/.test(ch)) w = 0.36;
  else if (/[A-ZÄÖÜ]/.test(ch)) w = /[MW]/.test(ch) ? 0.92 : 0.70;
  else if (/[a-zäöüß]/.test(ch)) w = /[mw]/.test(ch) ? 0.82 : (/[iljtf]/.test(ch) ? 0.32 : 0.53);
  else w = 0.6;
  if (bold) w *= 1.05;
  return w;
}
function textBox(doc, n) {
  const s = n === undefined ? String(doc.text) : String(doc.text).substr(0, n);
  const size = doc.fontSize || 40; let w = 0;
  for (const ch of s) w += charW(ch, doc.font || '') * size;
  w += Math.max(0, s.length - 1) * (doc.tracking || 0) / 1000 * size;
  let x0 = -w / 2; const j = String(doc.justification || '');
  if (/RIGHT/.test(j)) x0 = -w; else if (/LEFT/.test(j)) x0 = 0;
  return { left: x0, top: -0.74 * size, width: w, height: 0.96 * size };
}
let compCount = 0;
const COMPS = [];
function layer(comp, name, kind, src) {
  const sw = src ? src.width : (kind === 'null' ? 100 : 0), sh = src ? src.height : (kind === 'null' ? 100 : 0);
  const anc = (kind === 'text' || kind === 'shape') ? [0, 0] : [sw / 2, sh / 2];
  const L = { name, kind, parent: null, enabled: true, inPoint: 0, outPoint: comp.duration, startTime: 0, adjustmentLayer: false, guideLayer: false, collapseTransformation: false, blendingMode: 0,
    source: src || { width: sw, height: sh }, index: comp.layers.length + 1, containingComp: comp,
    position: prop('Position', 'ADBE Position', [comp.width / 2, comp.height / 2]), scale: prop('Scale', 'ADBE Scale', [100, 100]),
    rotation: prop('Rotation', 'ADBE Rotate Z', 0), opacity: prop('Opacity', 'ADBE Opacity', 100), anchorPoint: prop('Anchor Point', 'ADBE Anchor Point', anc),
    effects: null, _masks: [], _fx: [],
    moveAfter() {}, moveBefore() {}, moveToBeginning() {}, moveToEnd() {}, setTrackMatte() {}, replaceSource(it) { L.source = it; }, remove() { L.enabled = false; L.inPoint = 1e9; },
    sourceRectAtTime(t) {
      if (L.kind === 'text') return textBox(L._doc());
      if (L.kind === 'shape') { const b = shapeBox(L, t, true); return b ? { left: b[0], top: b[1], width: b[2] - b[0], height: b[3] - b[1] } : { left: 0, top: 0, width: 0, height: 0 }; }
      return { left: 0, top: 0, width: L.source.width, height: L.source.height };
    } };
  const fx = { get numProperties() { return L._fx.length; },
    property(n) { const e = typeof n === 'number' ? L._fx[n - 1] : L._fx.find(x => x.name === n || x.matchName === n); return e ? handle(e) : null; },
    addProperty(m) { if (/Quick/.test(m) && !global.QCA_OK) throw new Error('no fx'); invalidateBelow({ added: L._fx }, 'Effekte ' + L.name); const e = effect(m); L._fx.push(e); return handle(e); } };
  const masks = { addProperty() { invalidateBelow({ added: L._masks }, 'Masken ' + L.name); const m = mkGroup('Mask'); m.inverted = false; L._masks.push(m); return handle(m); } };
  const tdoc = prop('Source Text', 'ADBE Text Document', { text: name, resetCharStyle() {} });
  L._doc = () => tdoc._v;
  L._tdoc = tdoc;
  const anim = mkGroup('ADBE Text Animators');
  const text = { property(n) { if (n === 'ADBE Text Document') return tdoc; if (n === 'ADBE Text Animators') return anim; return mkGroup(n); } };
  for (const k of ['position', 'scale', 'rotation', 'opacity', 'anchorPoint']) { L[k].propertyDepth = 2; L[k].propertyGroup = () => L; }
  L.property = (n) => n === 'ADBE Effect Parade' || n === 'Effects' ? fx : n === 'ADBE Mask Parade' ? masks : n === 'ADBE Text Properties' ? text : n === 'ADBE Root Vectors Group' || n === 'Contents' ? handle(L._root = L._root || mkGroup('root')) : n === 'ADBE Opacity' || n === 'Opacity' ? L.opacity : mkGroup(n);
  return L;
}
function comp(name, w, h, par, dur, fps) {
  chk(dur, 'comp dur ' + name); if (dur <= 0) problems.push('Comp-Dauer <= 0: ' + name);
  const c = { name, width: w, height: h, duration: dur, frameRate: fps, layers: [], parentFolder: null, resolutionFactor: [1, 1], motionBlur: false, numLayers: 0, openInViewer() {} };
  const add = (n, k, s) => { const l = layer(c, n, k, s); c.layers.unshift(l); c.numLayers = c.layers.length; c.layers.forEach((x, i) => x.index = i + 1); return l; };
  c.layers.add = (it) => add(it.name, it.duration !== undefined && it.layers ? 'comp' : 'item', it);
  c.layers.addSolid = (col, n, sw, sh) => { chk(col, 'solid color ' + n); return add(n, 'solid', { width: sw || w, height: sh || h }); };
  c.layers.addShape = () => add('Shape', 'shape'); c.layers.addText = (s) => { const l = add(s, 'text'); l._tdoc._v = { text: s, resetCharStyle() {} }; return l; }; c.layers.addNull = () => add('Null', 'null');
  c.layer = (i) => c.layers[i - 1];
  compCount++; COMPS.push(c); return c;
}
global.app = { version: 'mock', effects: [{ displayName: 'Quick Chromatic Aberration 3', matchName: 'PE QuickCA3' }], beginSuppressDialogs() {}, endSuppressDialogs() {}, beginUndoGroup() {}, endUndoGroup() {}, open() {}, newProject() {},
  project: { file: null, numItems: 0, item() {}, rootFolder: {}, items: { addFolder(n) { return { name: n }; }, addComp: comp },
    importFile(io) { const nm = io.f.name, i = IMG[nm]; return { name: nm, width: i ? i[0] : 1200, height: i ? i[1] : 1500, _alpha: i ? i[2] : null }; }, save() {}, close() {} } };
global.QCA_OK = true;
global.File = function (p) { this.fsName = p; this.name = String(p).split('/').pop(); this.exists = !/out\/|\.aep$/.test(p); this.open = () => true; this.write = () => {}; this.writeln = () => {}; this.close = () => {}; this.parent = { fsName: '.' }; };
global.Folder = function (p) { this.create = () => true; };
global.ImportOptions = function (f) { this.f = f; };
global.Shape = function () {};
global.FolderItem = function () {};
global.PropertyType = { INDEXED_GROUP: 6214, NAMED_GROUP: 6213, PROPERTY: 6212 };
global.BlendingMode = new Proxy({}, { get: (t, k) => k }); global.ParagraphJustification = new Proxy({}, { get: (t, k) => k });
global.KeyframeInterpolationType = { HOLD: 1, LINEAR: 2, BEZIER: 3 }; global.CloseOptions = { SAVE_CHANGES: 1, DO_NOT_SAVE_CHANGES: 2 }; global.TrackMatteType = {};
global.$ = { fileName: 'x' };
let ALERT = null; global.alert = (m) => { ALERT = String(m); };   // HAND_*-Versionen melden per alert
const ret = (new Function(src))();
const res = ret === undefined && ALERT !== null ? ALERT : ret;
console.log(String(res).split('\n').slice(0, 60).join('\n'));
for (const ln of String(res).split('\n')) if (/^(PARAM|EXPR|DATEI FEHLT|TON FEHLT|CA-Parameter|STRICHFEST|Compound)/.test(ln)) problems.push('LOG ' + ln);
console.log('Comps:', compCount, '| Probleme:', problems.length); problems.slice(0, 30).forEach(p => console.log('  ' + p));

// =====================================================================================================
// Geometrie-Pruefung (Schaetzung: Textbreite aus Schriftgroesse x Zeichen, Effekte wie Schatten/Rauheit nicht mitgerechnet)
// =====================================================================================================
const V = (p, t) => p.valueAtTime(t);
function mat(L, t) {   // Ebene -> Comp: T(pos) R(rot) S(scale) T(-anchor), dann Eltern
  const p = V(L.position, t), a = V(L.anchorPoint, t), r = (V(L.rotation, t) || 0) * Math.PI / 180; let s = V(L.scale, t);
  if (L.parent && /KONSTGROESSE/.test(L.scale.expression || '')) { const P0 = mat(L.parent, t), k = Math.max(1e-4, Math.hypot(P0[0], P0[1])); s = [s[0] / k, s[1] / k]; }
  const sx = s[0] / 100, sy = s[1] / 100, c = Math.cos(r), n = Math.sin(r);
  const M = [c * sx, n * sx, -n * sy, c * sy, 0, 0];   // x' = M0 x + M2 y + M4, y' = M1 x + M3 y + M5
  M[4] = p[0] - (M[0] * a[0] + M[2] * a[1]); M[5] = p[1] - (M[1] * a[0] + M[3] * a[1]);
  if (!L.parent) return M;
  const P = mat(L.parent, t);
  return [P[0] * M[0] + P[2] * M[1], P[1] * M[0] + P[3] * M[1], P[0] * M[2] + P[2] * M[3], P[1] * M[2] + P[3] * M[3], P[0] * M[4] + P[2] * M[5] + P[4], P[1] * M[4] + P[3] * M[5] + P[5]];
}
function xf(M, x, y) { return [M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5]]; }
function trimEnd(node, t) {   // Trim-Pfad in dieser Gruppe: Ende in %
  for (const c of node.added) if (c.matchName === 'ADBE Vector Filter - Trim') { const e = c.property('ADBE Vector Trim End'); return e.keys.length ? V(e, t) : 100; }
  return 100;
}
const SBOX = new Map();
function shapeBox(L, t, ignoreTrim) {
  if (SBOX.has(L)) return SBOX.get(L);
  const r0 = shapeBox0(L, t, ignoreTrim);
  if (L._root && L._root.added.length && !hasKeys(L._root)) SBOX.set(L, r0);
  return r0;
}
function hasKeys(n) { if (n.keys && n.keys.length) return true; for (const c of [].concat(n.added || [], Object.values(n.kids || {}))) if (hasKeys(c)) return true; return false; }
function shapeBox0(L, t, ignoreTrim) {
  let b = null; const add = (x, y, r) => { if (!b) b = [x - r, y - r, x + r, y + r]; else { b[0] = Math.min(b[0], x - r); b[1] = Math.min(b[1], y - r); b[2] = Math.max(b[2], x + r); b[3] = Math.max(b[3], y + r); } };
  function walk(node) {
    if (!ignoreTrim && trimEnd(node, t) < 0.5) return;
    let sw = 0; for (const c of node.added) if (c.matchName === 'ADBE Vector Graphic - Stroke') sw = Math.max(sw, V(c.property('ADBE Vector Stroke Width'), t) || 0);
    const r = sw / 2;
    for (const c of node.added) {
      if (c.matchName === 'ADBE Vector Group') walk(c.property('ADBE Vectors Group'));
      else if (c.matchName === 'ADBE Vector Shape - Group') { const s = c.property('ADBE Vector Shape')._v; if (s && s.vertices) s.vertices.forEach((v, i) => { add(v[0], v[1], r); const ii = s.inTangents[i], oo = s.outTangents[i]; add(v[0] + ii[0] * 0.75, v[1] + ii[1] * 0.75, r); add(v[0] + oo[0] * 0.75, v[1] + oo[1] * 0.75, r); }); }
      else if (c.matchName === 'ADBE Vector Shape - Ellipse' || c.matchName === 'ADBE Vector Shape - Rect') {
        const R = c.matchName === 'ADBE Vector Shape - Rect';
        const sz = V(c.property(R ? 'ADBE Vector Rect Size' : 'ADBE Vector Ellipse Size'), t), ps = V(c.property(R ? 'ADBE Vector Rect Position' : 'ADBE Vector Ellipse Position'), t);
        if (Array.isArray(sz)) { const px = Array.isArray(ps) ? ps : [0, 0]; add(px[0] - sz[0] / 2, px[1] - sz[1] / 2, r); add(px[0] + sz[0] / 2, px[1] + sz[1] / 2, r); }
      }
    }
  }
  if (L._root) for (const g of L._root.added) if (g.matchName === 'ADBE Vector Group') walk(g.property('ADBE Vectors Group'));
  return b;
}
function typedChars(L, t) {
  const ex = L._tdoc.expression || ''; const m = /\(time - ([-\d.e]+)\) \* ([\d.]+)/.exec(ex);
  if (!m) return undefined; return Math.max(0, Math.floor((t - parseFloat(m[1])) * parseFloat(m[2])));
}
function localBox(L, t) {   // [x0,y0,x1,y1] in Ebenen-Koordinaten oder null (unsichtbar)
  if (L.kind === 'text') { const n = typedChars(L, t); if (n === 0) return null; const r = textBox(L._doc(), n); return [r.left, r.top, r.left + r.width, r.top + r.height]; }
  if (L.kind === 'shape') return shapeBox(L, t, false);
  if (L.kind === 'item') { const a = L.source._alpha; return a ? [a[0], a[1], a[2], a[3]] : [0, 0, L.source.width, L.source.height]; }
  if (L.kind === 'comp') return [0, 0, L.source.width, L.source.height];
  return null;
}
function maskClip(L, b) {
  for (const m of L._masks) {
    if (m.inverted) continue; const s = m.property('ADBE Mask Shape')._v; if (!s || !s.vertices) continue;
    const xs = s.vertices.map(v => v[0]), ys = s.vertices.map(v => v[1]);
    b = [Math.max(b[0], Math.min(...xs)), Math.max(b[1], Math.min(...ys)), Math.min(b[2], Math.max(...xs)), Math.min(b[3], Math.max(...ys))];
    if (b[2] <= b[0] || b[3] <= b[1]) return null;
  }
  return b;
}
function chainOpacity(L, t) { let o = 1, x = L; while (x) { if (x.kind !== 'null') o *= (V(x.opacity, t) || 0) / 100; x = x.parent; } return o; }
const GW = 1.02;   // Master: Gate Weave skaliert alles um 102 % um die Bildmitte
function screenBox(L, t) {
  let b = localBox(L, t); if (!b) return null; b = maskClip(L, b); if (!b) return null;
  const M = mat(L, t); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of [[b[0], b[1]], [b[2], b[1]], [b[0], b[3]], [b[2], b[3]]]) { const p = xf(M, x, y); x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  const g = (v, c) => c + (v - c) * GW;
  return { x0: g(x0, 540), x1: g(x1, 540), y0: g(y0, 960), y1: g(y1, 960), h: Math.abs((b[3] - b[1]) * Math.hypot(M[2], M[3])) * GW };
}
// BG: reiner Hintergrund/Effekt (kein Inhalt, keine Pruefung). BLEED: laeuft bewusst ueber den Rand (Inhalt, aber keine RAND-/LOGO-Pruefung).
// THIN: duenne Linien, zaehlen nicht als Flaeche. UTOK: dunkel genug fuer weisse Untertitel.
const BG = /^(Papier|Halftone|Vignette|Lichtleck|Raster|Kamera|Vox Sauce|FIX Bildquelle|FIX gradient|FIX Callout|FIX Abdunklung|FIX Focus|FIX alter Film|FIX Kratzer|FIX UT|Meer|Grund|Einschlag|Null|Karte Meer|Karte Leben)/;
const BLEED = /^(Zeitstrahl|Textmarker|Karte |Globus|Satellit|Route|Strich Faden|Balken Seite|Diagramm)/;
const THIN = /^(Zeitstrahl|Textmarker|Strich|Pfeil|Unterstrich|Route|Nadel|Karte Staaten|Karte Grenzen|Kreis|Kreuz|Trennlinie|Lupe Fang|Schutzlinie)/;
const UTOK = /^(Zeitstrahl|Textmarker|Karte |Globus|Satellit|Route|Strich Faden)/;
const IMGLIKE = (L) => (L.kind === 'item' && !BLEED.test(L.name)) || /^Rahmen /.test(L.name);
function visible(L, t) {
  if (!L.enabled || L.guideLayer || L.adjustmentLayer || L.kind === 'null' || L.kind === 'solid') return false;
  if (t < L.inPoint - 1e-6 || t >= L.outPoint - 1e-6) return false;
  if (chainOpacity(L, t) <= 0.08) return false;
  if (/EDGEFADE/.test(L.opacity.expression || '')) return 'fade';
  return true;
}
const master = COMPS.find(c => / \(9x16\)$/.test(c.name));
const scenes = master ? master.layers.filter(l => l.kind === 'comp').map(l => ({ c: l.source, start: l.startTime })).sort((a, b) => a.start - b.start) : [];
const W = 1080, Hh = 1920, F = 25, out = { PLANRAND: [], FPS: [], RAND: [], LEER: [], KLEIN: [], LOGO: [], UT: [], UTNAH: [], SCHWENK: [], BLASS: [], KOLLISION: [] };
function runs(map, kind, sc, minLen) {
  for (const key in map) {
    const fr = map[key].f.sort((a, b) => a - b); let s = fr[0], p = fr[0];
    const flush = () => { if (p - s + 1 >= (minLen || 3)) out[kind].push(kind + ' ' + sc.c.name.replace(/^freiheit /, '') + ": '" + key + "' " + map[key].why() + ' bei ' + (sc.start + s / F).toFixed(2) + '-' + (sc.start + (p + 1) / F).toFixed(2) + ' s'); };
    for (let i = 1; i < fr.length; i++) { if (fr[i] !== p + 1) { flush(); s = fr[i]; } p = fr[i]; }
    if (fr.length) flush();
  }
}
for (const sc of scenes) {
  const utn = {};
  const planr = {};
  const c = sc.c, nF = Math.round(c.duration * F), rand = {}, logo = {}, ut = {}, kol = {}, leer = [], klein = [], schwenk = [], blass = {}; let covSum = 0, mainMin = 1e9;
  for (let f = 0; f < nF; f++) {
    const t = f / F, tr = f < 3 || f >= nF - 7;
    let txtOK = false, area = 0; const boxes = [];
    let shade = false, whip = false;
    for (const L of c.layers) {
      if (/^(Karte Meer|Satellit)/.test(L.name) && visible(L, t) && chainOpacity(L, t) > 0.1) {   // PLANRAND: Kartenflaeche / Platte deckt das ganze Bild
        const pb = screenBox(L, t);
        if (pb && (pb.x0 > 0.5 || pb.x1 < W - 0.5 || pb.y0 > 0.5 || pb.y1 < Hh - 0.5)) (planr[L.name] = planr[L.name] || { f: [], why() { return 'deckt nur x ' + Math.round(this.b.x0) + '..' + Math.round(this.b.x1) + ', y ' + Math.round(this.b.y0) + '..' + Math.round(this.b.y1); } }).f.push(f), planr[L.name].b = pb;
      }
      if (/^FIX UT-(Schatten|Abdunklung)/.test(L.name) && t >= L.inPoint && t < L.outPoint) shade = true;
      if (L.name === 'Zeitstrahl Linie' && visible(L, t)) { const p = screenBox(L, t), q = screenBox(L, Math.min(c.duration, t + 1 / F)); if (p && q && Math.abs(q.x0 - p.x0) > 30 && Math.abs(q.x1 - p.x1) > 30) whip = true; }
      const vis = visible(L, t); if (!vis) continue;
      if (BG.test(L.name)) continue;
      const b = screenBox(L, t); if (!b) continue;
      if (!(b.x1 > 0 && b.x0 < W && b.y1 > 0 && b.y0 < Hh)) continue;
      const cw = Math.max(0, Math.min(W, b.x1) - Math.max(0, b.x0)), ch = Math.max(0, Math.min(Hh, b.y1) - Math.max(0, b.y0));
      if (vis !== 'fade') { if (L.kind === 'text') { if (b.h >= 28 && cw > 30) txtOK = true; } else if (!THIN.test(L.name) && (L.kind !== 'comp' || !/^freiheit Abzug /.test(L.source.name || ''))) area += cw * ch; }
      boxes.push({ L, b, vis });
    }
    if (whip) schwenk.push(f);
    if (!txtOK && area < 0.06 * W * Hh && !tr && !whip) leer.push(f);
    let cov = 0; for (const { L, b, vis } of boxes) if (vis !== 'fade' && !THIN.test(L.name) && !(L.kind === 'text' && b.h < 28) && !(L.kind === 'comp' && /^freiheit Abzug /.test(L.source.name || ''))) cov += Math.max(0, Math.min(W, b.x1) - Math.max(0, b.x0)) * Math.max(0, Math.min(Hh, b.y1) - Math.max(0, b.y0));
    cov /= W * Hh; covSum += cov;
    let main = 0; for (const { L, b, vis } of boxes) if (vis !== 'fade' && (L.kind !== 'text' || b.h >= 100) && !THIN.test(L.name) && !/^Kopf /.test(L.name) && !(L.kind === 'comp' && /^freiheit Abzug /.test(L.source.name || ''))) main = Math.max(main, Math.max(0, Math.min(W, b.x1) - Math.max(0, b.x0)) * Math.max(0, Math.min(Hh, b.y1) - Math.max(0, b.y0)));
    mainMin = Math.min(mainMin, tr ? 1e9 : main);
    if (main < 60000 && cov < 0.15 && !tr && !whip) klein.push(f);
    if (tr) continue;
    for (const { L, b, vis } of boxes) {
      const b2 = screenBox(L, Math.min(c.duration, t + 1 / F));
      if (vis === 'fade') {   // EDGEFADE-Text halb ausgeblendet und ruhig = sichtbar blasses / angeschnittenes Label
        const g = (Math.min(Math.min(b.x0, b.x1) - 70, 1010 - Math.max(b.x0, b.x1))) / 50, mv = b2 && (Math.abs(b2.x0 - b.x0) > 6 || Math.abs(b2.x1 - b.x1) > 6);
        if (g > 0.05 && g < 0.9 && !mv && b.y1 > 0 && b.y0 < Hh) { const r = blass[L.name] = blass[L.name] || { f: [], lo: 9, why() { return 'nur ' + Math.round(this.lo * 100) + ' % sichtbar'; } }; r.f.push(f); r.lo = Math.min(r.lo, g); }
        continue;
      }
      const fast = b2 && (Math.abs(b2.x0 - b.x0) > 10 || Math.abs(b2.x1 - b.x1) > 10), fastY = b2 && (Math.abs(b2.y0 - b.y0) > 10 || Math.abs(b2.y1 - b.y1) > 10);
      const bleed = BLEED.test(L.name);
      if (!bleed && (b.x0 < 60 || b.x1 > 1020) && !fast) { const r = rand[L.name] = rand[L.name] || { f: [], lo: 1e9, hi: -1e9, why() { return 'x ' + Math.round(this.lo) + '..' + Math.round(this.hi); } }; r.f.push(f); r.lo = Math.min(r.lo, b.x0); r.hi = Math.max(r.hi, b.x1); }
      if (!bleed && b.x0 < 162 && b.y0 < 262 && b.x1 > 34 && b.y1 > 132 && !fast && !fastY) (logo[L.name] = logo[L.name] || { f: [], why: () => 'im Logo-Bereich' }).f.push(f);
      if (!shade && !UTOK.test(L.name) && L.kind !== 'text' && !/^FIX /.test(L.name) && b.x0 < 780 && b.x1 > 300 && b.y0 < 1405 && b.y1 > 1325 && !fast && !fastY) (ut[L.name] = ut[L.name] || { f: [], why: () => 'in der Untertitelzone' }).f.push(f);
      if (L.kind === 'text' && !/^FIX (Bildquelle|Quelle)/.test(L.name) && b.x0 < 780 && b.x1 > 300 && b.y0 < 1405 && b.y1 > 1285 && !fast && !fastY) (utn[L.name] = utn[L.name] || { f: [], why: () => 'Text klebt an den Untertiteln' }).f.push(f);
    }
    // Text auf eigener Unterlage (Leiste, Etikett, Stempel) liegt bewusst ueber dem Bild
    const ONPLATE = (L) => L.parent && L.parent.kind === 'shape' && /^(Leiste|Etikett Flaeche|Stempel Rahmen)/.test(L.parent.name);
    for (const A of boxes) if (A.L.kind === 'text' && A.vis !== 'fade' && !ONPLATE(A.L)) for (const Bx of boxes) if (IMGLIKE(Bx.L) && Bx.L !== A.L) {
      const ox = Math.min(A.b.x1, Bx.b.x1) - Math.max(A.b.x0, Bx.b.x0), oy = Math.min(A.b.y1, Bx.b.y1) - Math.max(A.b.y0, Bx.b.y0);
      if (ox > 12 && oy > 12) { const k = A.L.name + "' auf '" + Bx.L.name; (kol[k] = kol[k] || { f: [], why: () => '' }).f.push(f); }
    }
  }
  runs(planr, 'PLANRAND', sc, 1); runs(rand, 'RAND', sc); runs(logo, 'LOGO', sc); runs(ut, 'UT', sc); runs(kol, 'KOLLISION', sc); runs(utn, 'UTNAH', sc);
  runs(klein.length ? { 'Hauptelement zu klein': { f: klein, why: () => '' } } : {}, 'KLEIN', sc, 15);
  if (process.argv.includes('--cov')) console.log('  Deckung ' + c.name.replace(/^freiheit /, '').padEnd(16) + (100 * covSum / nF).toFixed(1) + ' % im Mittel, kleinstes Hauptelement ' + Math.round(mainMin / 1000) + 'k px2');
  runs(blass, 'BLASS', sc, 9);
  runs(schwenk.length ? { 'Reissschwenk zu lang': { f: schwenk, why: () => '' } } : {}, 'SCHWENK', sc, 22);
  runs(leer.length ? { 'kaum Inhalt': { f: leer, why: () => '' } } : {}, 'LEER', sc, 9);
}
// ---------- UNSCHAERFE (> 0,3 s am Stueck) und HOCHSKALIERT (> 125 % der echten Pixel) ----------
const BLUR = { 'ADBE Box Blur2': 'Blur Radius', 'ADBE Gaussian Blur 2': 'Blurriness', 'ADBE Compound Blur': 'Maximum Blur' };
out.UNSCHAERFE = []; out.HOCHSKALIERT = [];
for (const c of COMPS) for (const L of c.layers) for (const e of L._fx) {
  const pn = BLUR[e.matchName]; if (!pn) continue; const p = e._list.find(x => x.name === pn); if (!p) continue;
  let run = 0, worst = 0, at = 0;
  for (let t = Math.max(0, L.inPoint); t < Math.min(c.duration, L.outPoint) - 1e-6; t += 1 / F) { if (V(p, t) > 1.0) { run += 1 / F; if (run > worst) { worst = run; at = t; } } else run = 0; }
  if (worst > 0.3 + 1e-6) out.UNSCHAERFE.push('UNSCHAERFE ' + c.name + ': "' + L.name + '" / ' + (e.name || e.matchName) + ' wirkt ' + worst.toFixed(2) + ' s am Stueck (bis ' + at.toFixed(2) + ' s)');
}
function mul(P, M) { return [P[0] * M[0] + P[2] * M[1], P[1] * M[0] + P[3] * M[1], P[0] * M[2] + P[2] * M[3], P[1] * M[2] + P[3] * M[3], P[0] * M[4] + P[2] * M[5] + P[4], P[1] * M[4] + P[3] * M[5] + P[5]]; }
const upsc = {};
function upVisit(c, outer, t, scName) {
  for (const L of c.layers) {
    if (!L.enabled || L.guideLayer || t < L.inPoint - 1e-6 || t >= L.outPoint - 1e-6) continue;
    if (L.kind !== 'item' && L.kind !== 'comp') continue;
    if (chainOpacity(L, t) < 0.1) continue;
    const M = mul(outer, mat(L, t));
    if (L.kind === 'comp') { upVisit(L.source, M, t, scName); continue; }
    if (!IMG[L.source.name]) continue;
    const f = Math.hypot(M[0], M[1]) * GW, k = scName + ' | ' + L.source.name + (L.name !== L.source.name ? ' (' + L.name + ')' : '');
    if (!upsc[k] || upsc[k].f < f) upsc[k] = { f, t };
  }
}
for (const sc of scenes) for (let f = 0; f < Math.round(sc.c.duration * F) - 7; f++) upVisit(sc.c, [1, 0, 0, 1, 0, 0], f / F, sc.c.name.replace(/^freiheit /, ''));
const UPMAX = 1.25;
for (const k in upsc) if (upsc[k].f > UPMAX + 1e-6) out.HOCHSKALIERT.push('HOCHSKALIERT ' + k + ': ' + Math.round(upsc[k].f * 100) + ' % der echten Pixel (bei ' + upsc[k].t.toFixed(2) + ' s in der Szene), max ' + Math.round(UPMAX * 100) + ' %');
if (process.argv.includes('--skal')) for (const k in upsc) console.log('  SKAL ' + k + ': ' + Math.round(upsc[k].f * 100) + ' %');
for (const c of COMPS) if (Math.abs(c.frameRate - 25) > 1e-6) out.FPS.push('FPS ' + c.name + ': ' + c.frameRate + ' statt 25');
const nGeo = out.PLANRAND.length + out.FPS.length + out.BLASS.length + out.SCHWENK.length + out.KLEIN.length + out.UTNAH.length + out.UNSCHAERFE.length + out.HOCHSKALIERT.length + out.RAND.length + out.LEER.length + out.LOGO.length + out.UT.length + out.KOLLISION.length;
console.log('Geometrie (' + scenes.length + ' Szenen): ' + out.PLANRAND.length + ' PLANRAND | ' + out.FPS.length + ' FPS | ' + out.RAND.length + ' RAND | ' + out.LEER.length + ' LEER | ' + out.KLEIN.length + ' KLEIN | ' + out.LOGO.length + ' LOGO | ' + out.UT.length + ' UT | ' + out.UTNAH.length + ' UTNAH | ' + out.SCHWENK.length + ' SCHWENK | ' + out.BLASS.length + ' BLASS | ' + out.KOLLISION.length + ' KOLLISION | ' + out.UNSCHAERFE.length + ' UNSCHAERFE | ' + out.HOCHSKALIERT.length + ' HOCHSKALIERT');
for (const k in out) out[k].forEach(s => console.log('  ' + s));
if (process.argv.includes('--dump')) {   // --dump <szene> <sekunde Master>: alle Ebenen-Rahmen zu dieser Zeit
  const i = process.argv.indexOf('--dump'), sid = process.argv[i + 1], tt = parseFloat(process.argv[i + 2]);
  const sc = scenes.find(s => s.c.name.indexOf(sid) >= 0);
  if (sc) for (const L of sc.c.layers) { const v = visible(L, tt - sc.start); const b = v && screenBox(L, tt - sc.start); if (b) console.log('   ' + L.name.padEnd(34) + ' x ' + Math.round(b.x0) + '..' + Math.round(b.x1) + '  y ' + Math.round(b.y0) + '..' + Math.round(b.y1) + (v === 'fade' ? ' (Randblende)' : '')); }
}
process.exitCode = problems.length || nGeo ? 1 : 0;
