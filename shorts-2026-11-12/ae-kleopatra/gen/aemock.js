// Einfacher After-Effects-Mock (Kopie aus Short 41; ergaenzt: Transform-Props kennen ihre Ebene fuer checkAnims)
// fuer Trockenlaeufe: node aemock.js <build.jsx>
// Prueft: Laufzeitfehler, NaN/undefined-Werte, unbekannte Effekt-Parameter (Namen wie in AE 2023, Englisch).
const fs = require('fs');
const src = fs.readFileSync(process.argv[2], 'utf8');
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
  'ADBE Brightness & Contrast 2': ['Brightness', 'Contrast', 'Use Legacy'], 'ADBE Drop Shadow': ['Shadow Color', 'Opacity', 'Direction', 'Distance', 'Softness', 'Shadow Only'],
};
// Hinweis: In AE heisst "Stretch Map to Fit" beim Compound Blur "If Layer Sizes Differ" (Checkbox "Stretch Map to Fit")
FXP['ADBE Compound Blur'].push('Stretch Map to Fit');
function chk(v, where) {
  const bad = (x) => x === undefined || (typeof x === 'number' && !isFinite(x));
  if (bad(v) || (Array.isArray(v) && v.some(x => bad(x) || (Array.isArray(x) && x.some(bad))))) problems.push('UNGUELTIGER WERT bei ' + where + ': ' + JSON.stringify(v));
}
function prop(name, matchName) {
  const p = { name, matchName: matchName || name, propertyType: 6212, keys: [], expression: '', numKeys: 0, _v: 0,
    setValue(v) { chk(v, this.name); this._v = v; }, get value() { return this._v; },
    addKey(t) { chk(t, this.name + ' key'); this.keys.push({ t }); this.numKeys = this.keys.length; return this.keys.length; },
    setValueAtKey(i, v) { chk(v, this.name + ' keyval'); }, setValueAtTime(t, v) { chk(t, this.name); chk(v, this.name); this.addKey(t); },
    nearestKeyIndex(t) { return 1; }, setTemporalEaseAtKey(i, a, b) { if (a.length !== 1 && a.length !== 2 && a.length !== 3) throw new Error('ease dims'); },
    setInterpolationTypeAtKey() {}, valueAtTime(t) { return Array.isArray(this._v) ? this._v : [100, 100]; },
    addProperty(n) { const c = mkGroup(n); return c; }, property(n) { return mkGroup(String(n)); }, numProperties: 0 };
  return p;
}
function mkGroup(n) {
  const g = prop(n, n); const kids = {};
  g.property = (x) => { if (x === undefined) throw new Error('property(undefined)'); return kids[x] = kids[x] || mkGroup(String(x)); };
  g.addProperty = (x) => mkGroup(x);
  g.parentProperty = { property: (x) => mkGroup(String(x)) };
  return g;
}
function effect(match) {
  const e = prop(match, match); e.propertyType = 6213; const list = [];
  const spec = FXP[match] || null;
  function build(arr, into) { for (const it of arr) { if (typeof it === 'string') into.push(prop(it)); else { const g = prop(it.g); g.propertyType = 6213; const sub = []; build(it.p, sub); g.numProperties = sub.length; g.property = (i) => sub[i - 1]; into.push(g); } } }
  if (spec) build(spec, list); else for (const n of ['Amount', 'Position']) list.push(prop(n));
  e.numProperties = list.length; e.property = (i) => typeof i === 'number' ? list[i - 1] : list.find(p => p.name === i);
  return e;
}
let compCount = 0;
function layer(comp, name, kind) {
  const L = { name, kind, parent: null, enabled: true, inPoint: 0, outPoint: comp.duration, startTime: 0, adjustmentLayer: false, guideLayer: false, collapseTransformation: false, blendingMode: 0,
    source: { width: 1000, height: 800 }, index: comp.layers.length + 1,
    position: prop('Position'), scale: prop('Scale'), rotation: prop('Rotation'), opacity: prop('Opacity'), anchorPoint: prop('Anchor Point'),
    effects: null,
    moveAfter() {}, moveBefore() {}, moveToBeginning() {}, moveToEnd() {}, setTrackMatte() {},
    sourceRectAtTime() { return { left: -200, top: -50, width: 400, height: 100 }; } };
  const fx = { addProperty(m) { if (/Quick/.test(m) && !global.QCA_OK) throw new Error('no fx'); return effect(m); } };
  const masks = { addProperty() { const m = mkGroup('Mask'); m.inverted = false; return m; } };
  const text = { property(n) { if (n === 'ADBE Text Document') { const p = prop('Source Text'); p._v = { resetCharStyle() {}, }; return p; } if (n === 'ADBE Text Animators') return { addProperty() { return mkGroup('Animator'); } }; return mkGroup(n); } };
  for (const k of ['position', 'scale', 'rotation', 'opacity', 'anchorPoint']) { L[k].propertyDepth = 2; L[k].propertyGroup = () => L; }
  L.property = (n) => n === 'ADBE Effect Parade' || n === 'Effects' ? fx : n === 'ADBE Mask Parade' ? masks : n === 'ADBE Text Properties' ? text : n === 'ADBE Root Vectors Group' || n === 'Contents' ? (L._root = L._root || mkGroup('root')) : n === 'ADBE Opacity' || n === 'Opacity' ? L.opacity : mkGroup(n);
  return L;
}
function comp(name, w, h, par, dur, fps) {
  chk(dur, 'comp dur ' + name); if (dur <= 0) problems.push('Comp-Dauer <= 0: ' + name);
  const c = { name, width: w, height: h, duration: dur, frameRate: fps, layers: [], parentFolder: null, resolutionFactor: [1, 1], motionBlur: false, numLayers: 0, openInViewer() {} };
  const add = (n, k) => { const l = layer(c, n, k); c.layers.unshift(l); c.numLayers = c.layers.length; c.layers.forEach((x, i) => x.index = i + 1); return l; };
  c.layers.add = (it) => { const l = add(it.name, 'item'); l.source = it; return l; };
  c.layers.addSolid = (col, n) => { chk(col, 'solid color ' + n); return add(n, 'solid'); };
  c.layers.addShape = () => add('Shape', 'shape'); c.layers.addText = (s) => add(s, 'text'); c.layers.addNull = () => add('Null', 'null');
  c.layer = (i) => c.layers[i - 1];
  compCount++; return c;
}
const items = [];
global.app = { version: 'mock', effects: [{ displayName: 'Quick Chromatic Aberration 3', matchName: 'PE QuickCA3' }], beginSuppressDialogs() {}, endSuppressDialogs() {}, beginUndoGroup() {}, endUndoGroup() {}, open() {}, newProject() {},
  project: { file: null, numItems: 0, item() {}, rootFolder: {}, items: { addFolder(n) { return { name: n }; }, addComp: comp }, importFile(io) { return { name: io.f.name, width: 1200, height: 1500 }; }, save() {}, close() {} } };
global.QCA_OK = true;
global.File = function (p) { this.fsName = p; this.name = String(p).split('/').pop(); this.exists = !/out\/|\.aep$/.test(p); this.open = () => true; this.write = () => {}; this.writeln = () => {}; this.close = () => {}; this.parent = { fsName: '.' }; };
global.Folder = function (p) { this.create = () => true; };
global.ImportOptions = function (f) { this.f = f; };
global.Shape = function () {}; global.KeyframeEase = function (s, i) { if (!(i >= 0.1 && i <= 100)) problems.push('Ease-Influence ausserhalb 0.1-100: ' + i); };
global.FolderItem = function () {};
global.PropertyType = { INDEXED_GROUP: 6214, NAMED_GROUP: 6213, PROPERTY: 6212 };
global.BlendingMode = new Proxy({}, { get: (t, k) => k }); global.ParagraphJustification = new Proxy({}, { get: (t, k) => k });
global.KeyframeInterpolationType = { HOLD: 1 }; global.CloseOptions = { SAVE_CHANGES: 1, DO_NOT_SAVE_CHANGES: 2 }; global.TrackMatteType = {};
global.$ = { fileName: 'x' };
const res = (new Function(src))();
console.log(String(res).split('\n').slice(0, 60).join('\n'));
console.log('Comps:', compCount, '| Probleme:', problems.length); problems.slice(0, 30).forEach(p => console.log('  ' + p));
