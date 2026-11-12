// After-Effects-Mock fuer Trockenlaeufe: node aemock.js <build.jsx>
// Runde 2 (12.11.): deutlich strenger, damit Fehler wie "Object is invalid" schon hier auffallen.
// Prueft:
//  - Laufzeitfehler, NaN/undefined-Werte, unbekannte Effekt-Parameter (Namen wie in AE 2023, Englisch)
//  - UNGUELTIGE REFERENZEN wie in AE: addProperty auf einer Gruppe macht alle vorher geholten Referenzen auf deren
//    Kinder (und tiefer) ungueltig -> jeder Zugriff wirft "Object is invalid" (so wie im echten AE, z. B. 2. Effekt auf derselben Ebene).
//  - RAND: sichtbare Ebenen (Text, Formen, Abzuege, auch in Precomps) muessen mit Skalierung, Ankerpunkt, Rotation,
//    Eltern-Kette und Kamera-Zoom zu jeder Zeit in x 60..1020 bleiben (Textbreite geschaetzt aus Schriftgroesse x Zeichen).
//  - UNSCHAERFE: ein Weichzeichner (Fast Box Blur, Compound Blur, Gaussian) darf hoechstens 0,3 s am Stueck wirken;
//    Compound Blur mit einer Karten-Ebene, deren Effekte AE ignoriert (Solid + Effekt statt Precomp), zaehlt als volle Unschaerfe.
//  - HOCHSKALIERT: Archivfotos nicht ueber 125 % ihrer echten Pixel (inkl. Precomp-Zoom und Kamera).
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
  'ADBE Compound Blur': ['Blur Layer', 'Maximum Blur', 'If Layer Sizes Differ', 'Invert Blur', 'Stretch Map to Fit'],
  'ADBE Ramp': ['Start of Ramp', 'Start Color', 'End of Ramp', 'End Color', 'Ramp Shape', 'Ramp Scatter', 'Blend With Original'],
  'ADBE Linear Wipe': ['Transition Completion', 'Wipe Angle', 'Feather'],
  'CC Page Turn': ['Controls', 'Fold Position', 'Fold Direction', 'Fold Radius', 'Light Direction', 'Render', 'Back Page', 'Back Opacity', 'Paper Color'],
  'CC Burn Film': ['Burn', 'Center', 'Random Seed'], 'CC Ball Action': ['Scatter', 'Rotation Axis', 'Rotation', 'Twist Property', 'Twist Angle', 'Grid Spacing', 'Ball Size', 'Instability State'],
  'ADBE Tint': ['Map Black To', 'Map White To', 'Amount to Tint'], 'ADBE Black&White': ['Reds', 'Yellows'],
  'ADBE Brightness & Contrast 2': ['Brightness', 'Contrast', 'Use Legacy'], 'ADBE Drop Shadow': ['Shadow Color', 'Opacity', 'Direction', 'Distance', 'Softness', 'Shadow Only'],
  'ADBE Gaussian Blur 2': ['Blurriness', 'Blur Dimensions', 'Repeat Edge Pixels'],
};
const BLUR = { 'ADBE Box Blur2': 'Blur Radius', 'ADBE Compound Blur': 'Maximum Blur', 'ADBE Gaussian Blur 2': 'Blurriness' };
function chk(v, where) {
  const bad = (x) => x === undefined || (typeof x === 'number' && !isFinite(x));
  if (bad(v) || (Array.isArray(v) && v.some(x => bad(x) || (Array.isArray(x) && x.some(bad))))) problems.push('UNGUELTIGER WERT bei ' + where + ': ' + JSON.stringify(v));
}

// ---------------- Eigenschafts-Baum mit AE-artiger Ungueltigkeit ----------------
// Jeder Knoten haelt die Daten (Wert, Keys, Kinder); Skripte bekommen nur "Griffe" (Proxy). Ein Griff ist ungueltig,
// wenn nach seiner Erzeugung addProperty auf einer Gruppe ueber ihm aufgerufen wurde (wie in AE).
let CLOCK = 0;
const PT = { PROPERTY: 6212, NAMED_GROUP: 6213, INDEXED_GROUP: 6214 };
function handle(n) {
  const stamp = ++CLOCK;
  return new Proxy(n, {
    get(t, k) {
      if (k === '__node') return t;
      if (stamp <= t._inv) throw new Error('Object is invalid (Mock: Referenz auf "' + t.name + '" nach addProperty auf "' + t._invBy + '" benutzt)');
      return t[k];
    },
    set(t, k, v) {
      if (stamp <= t._inv) throw new Error('Object is invalid (Mock: Referenz auf "' + t.name + '" nach addProperty auf "' + t._invBy + '" gesetzt)');
      t[k] = v; return true;
    },
  });
}
function invalidateBelow(n0, by) {
  const st = ++CLOCK;
  (function rec(n) {
    for (const c of n.list) { c._inv = st; c._invBy = by; rec(c); }
    for (const k in n.named) { const c = n.named[k]; c._inv = st; c._invBy = by; rec(c); }
  })(n0);
}
function node(name, layer, opt) {
  opt = opt || {};
  const n = { name, matchName: name, propertyType: opt.type || PT.PROPERTY, _inv: 0, _invBy: '', _layer: layer, list: [], named: {},
    keys: [], v: opt.v !== undefined ? opt.v : 0, expression: '', enabled: true, propertyDepth: 1, inverted: false };
  Object.defineProperty(n, 'value', { get() { return n.v; }, configurable: true });
  Object.defineProperty(n, 'numKeys', { get() { return n.keys.length; } });
  Object.defineProperty(n, 'numProperties', { get() { return n.list.length; } });
  n.setValue = (v) => { chk(v, n.name); n.v = v; if (n.name === 'Blur Layer' || n.name === 'Back Page') n.refLayer = layer && layer.comp ? layer.comp.layers[v - 1] : null; };
  n.addKey = (t) => {
    chk(t, n.name + ' key');
    for (let i = 0; i < n.keys.length; i++) {
      if (Math.abs(n.keys[i].t - t) < 1e-6) return i + 1;
      if (n.keys[i].t > t) { n.keys.splice(i, 0, { t, v: valAt(n, t), hold: false }); return i + 1; }
    }
    n.keys.push({ t, v: valAt(n, t), hold: false }); return n.keys.length;
  };
  n.setValueAtKey = (i, v) => { chk(v, n.name + ' keyval'); if (!n.keys[i - 1]) throw new Error('Key ' + i + ' fehlt bei ' + n.name); n.keys[i - 1].v = v; };
  n.setValueAtTime = (t, v) => { chk(t, n.name); chk(v, n.name); n.setValueAtKey(n.addKey(t), v); };
  n.keyTime = (i) => n.keys[i - 1].t; n.keyValue = (i) => n.keys[i - 1].v;
  n.nearestKeyIndex = (t) => { let b = 1, d = 1e9; n.keys.forEach((k, i) => { if (Math.abs(k.t - t) < d) { d = Math.abs(k.t - t); b = i + 1; } }); return b; };
  n.setTemporalEaseAtKey = (i, a, b) => { if (a.length !== 1 && a.length !== 2 && a.length !== 3) throw new Error('ease dims'); };
  n.setInterpolationTypeAtKey = (i, a, b) => { if (n.keys[i - 1]) n.keys[i - 1].hold = (b === 1 || a === 1); };
  n.valueAtTime = (t) => valAt(n, t);
  n.propertyGroup = () => { if (!layer) throw new Error('kein Layer'); return layer; };
  n.addProperty = (m) => {
    if (m === undefined) throw new Error('addProperty(undefined)');
    invalidateBelow(n, n.name);
    const c = opt.makeChild ? opt.makeChild(m) : node(m, layer, { type: PT.NAMED_GROUP });
    c.parentNode = n; n.list.push(c); return handle(c);
  };
  n.property = (x) => {
    if (x === undefined) throw new Error('property(undefined)');
    if (typeof x === 'number') { const c = n.list[x - 1]; return c ? handle(c) : null; }
    for (const c of n.list) if (c.matchName === x || c.name === x) return handle(c);
    if (opt.strictNames) return null;
    if (!n.named[x]) { n.named[x] = node(String(x), layer, { type: /Group|Parade|Animators|Selectors|Properties|Dashes/.test(x) ? PT.NAMED_GROUP : PT.PROPERTY }); n.named[x].parentNode = n; }
    return handle(n.named[x]);
  };
  n.remove = () => {};
  return n;
}
function valAt(n, t) {
  const K = n.keys; if (!K.length) return n.v;
  if (t <= K[0].t) return K[0].v; if (t >= K[K.length - 1].t) return K[K.length - 1].v;
  for (let i = 1; i < K.length; i++) if (t < K[i].t) {
    const a = K[i - 1], b = K[i]; if (a.hold) return a.v;
    const u = (t - a.t) / (b.t - a.t);
    if (typeof a.v === 'number' && typeof b.v === 'number') return a.v + (b.v - a.v) * u;
    if (Array.isArray(a.v) && Array.isArray(b.v)) return a.v.map((x, j) => typeof x === 'number' ? x + ((b.v[j] === undefined ? x : b.v[j]) - x) * u : x);
    return a.v;
  }
  return K[K.length - 1].v;
}
function effectNode(match, L) {
  const e = node(match, L, { type: PT.NAMED_GROUP }); e.isEffect = true;
  const spec = FXP[match] || ['Amount', 'Position'];
  (function build(arr, into) {
    for (const it of arr) {
      if (typeof it === 'string') { const p = node(it, L); p.parentNode = into; into.list.push(p); }
      else { const g = node(it.g, L, { type: PT.NAMED_GROUP }); g.parentNode = into; into.list.push(g); build(it.p, g); }
    }
  })(spec, e);
  e.addProperty = () => { throw new Error('addProperty auf Effekt ' + match); };
  const byIdx = e.property;
  e.property = (x) => { if (typeof x === 'number') return byIdx(x); for (const c of e.list) if (c.name === x || c.matchName === x) return handle(c); return null; };
  return e;
}

// ---------------- Ebenen und Comps ----------------
// PC-Pfad (BASE der Abgabe-Version) auf diesen Ordner abbilden, damit auch der PC-Build mit echten Bildgroessen geprueft wird
const PC_BASE = 'C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-12/ae-weltkrieg/';
const LOCAL = require('path').resolve(__dirname, '..') + '/';
function loc(f) { return String(f).indexOf(PC_BASE) === 0 ? LOCAL + String(f).slice(PC_BASE.length) : f; }
function imgSize(f) {
  try {
    const b = fs.readFileSync(loc(f));
    if (b[0] === 0x89 && b[1] === 0x50) return [b.readUInt32BE(16), b.readUInt32BE(20)];
    if (b[0] === 0xFF && b[1] === 0xD8) {
      let i = 2;
      while (i < b.length - 8) {
        if (b[i] !== 0xFF) { i++; continue; }
        const m = b[i + 1], len = b.readUInt16BE(i + 2);
        if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
        i += 2 + len;
      }
    }
  } catch (e) {}
  return null;
}
const COMPS = [];
function textDoc(s) { return { text: s, font: 'ArialMT', fontSize: 50, justification: 'CENTER_JUSTIFY', tracking: 0 }; }
function layer(comp, name, kind, source) {
  const L = { name, kind, comp, parent: null, enabled: true, inPoint: 0, outPoint: comp.duration, startTime: 0, adjustmentLayer: false, guideLayer: false,
    collapseTransformation: false, blendingMode: 0, source: source || null, threeDLayer: false };
  const tr = node('ADBE Transform Group', L, { type: PT.NAMED_GROUP });
  const sw = source && source.width ? source.width : (kind === 'null' ? 100 : 0), sh = source && source.height ? source.height : (kind === 'null' ? 100 : 0);
  L.w = sw; L.h = sh;
  const T = { 'ADBE Anchor Point': [sw / 2, sh / 2], 'ADBE Position': [comp.width / 2, comp.height / 2], 'ADBE Scale': [100, 100], 'ADBE Rotate Z': 0, 'ADBE Opacity': 100 };
  for (const k in T) { tr.named[k] = node(k, L, { v: T[k] }); tr.named[k].parentNode = tr; }
  const alias = { anchorPoint: 'ADBE Anchor Point', position: 'ADBE Position', scale: 'ADBE Scale', rotation: 'ADBE Rotate Z', opacity: 'ADBE Opacity' };
  for (const k in alias) Object.defineProperty(L, k, { get() { return handle(tr.named[alias[k]]); } });
  L._tr = tr;
  L._fx = node('ADBE Effect Parade', L, { type: PT.INDEXED_GROUP, strictNames: true, makeChild: (m) => { if (/Quick/.test(m) && !global.QCA_OK) throw new Error('no fx'); return effectNode(m, L); } });
  L._masks = node('ADBE Mask Parade', L, { type: PT.INDEXED_GROUP, strictNames: true, makeChild: (m) => node(m, L, { type: PT.NAMED_GROUP }) });
  L._root = node('ADBE Root Vectors Group', L, { type: PT.INDEXED_GROUP, strictNames: true });
  if (kind === 'text') {
    L._text = node('ADBE Text Properties', L, { type: PT.NAMED_GROUP });
    const td = node('ADBE Text Document', L, { v: textDoc(name) }); td.parentNode = L._text; L._text.named['ADBE Text Document'] = td;
    td.setValue = (d) => { const o = {}; for (const k in d) if (typeof d[k] !== 'function') o[k] = d[k]; td.v = o; };
    Object.defineProperty(td, 'value', { get() { return Object.assign({}, td.v, { resetCharStyle() {} }); } });
    const an = node('ADBE Text Animators', L, { type: PT.INDEXED_GROUP, strictNames: true }); an.parentNode = L._text; L._text.named['ADBE Text Animators'] = an;
  }
  L.property = (n) => {
    if (n === 'ADBE Effect Parade' || n === 'Effects') return handle(L._fx);
    if (n === 'ADBE Mask Parade' || n === 'Masks') return handle(L._masks);
    if (n === 'ADBE Text Properties' || n === 'Text') { if (!L._text) throw new Error('keine Textebene: ' + L.name); return handle(L._text); }
    if (n === 'ADBE Root Vectors Group' || n === 'Contents') { if (kind !== 'shape') throw new Error('keine Formebene: ' + L.name); return handle(L._root); }
    if (n === 'ADBE Transform Group' || n === 'Transform') return handle(tr);
    if (tr.named[n]) return handle(tr.named[n]);
    if (n === 'Opacity') return L.opacity;
    throw new Error('Mock kennt Ebenen-Eigenschaft nicht: ' + n);
  };
  Object.defineProperty(L, 'index', { get() { return comp.layers.indexOf(L) + 1; } });
  L.moveAfter = (o) => { const a = comp.layers; a.splice(a.indexOf(L), 1); a.splice(a.indexOf(o) + 1, 0, L); };
  L.moveBefore = (o) => { const a = comp.layers; a.splice(a.indexOf(L), 1); a.splice(a.indexOf(o), 0, L); };
  L.moveToBeginning = () => { const a = comp.layers; a.splice(a.indexOf(L), 1); a.unshift(L); };
  L.moveToEnd = () => { const a = comp.layers; a.splice(a.indexOf(L), 1); a.push(L); };
  L.setTrackMatte = () => {};
  L.sourceRectAtTime = (t) => localRect(L, t || 0) || { left: 0, top: 0, width: 0, height: 0 };
  L.remove = () => { const a = comp.layers; a.splice(a.indexOf(L), 1); };
  return L;
}
function comp(name, w, h, par, dur, fps) {
  chk(dur, 'comp dur ' + name); if (dur <= 0) problems.push('Comp-Dauer <= 0: ' + name);
  const c = { name, width: w, height: h, duration: dur, frameRate: fps, layers: [], parentFolder: null, resolutionFactor: [1, 1], motionBlur: false, openInViewer() {}, saveFrameToPng() {}, isComp: true };
  Object.defineProperty(c, 'numLayers', { get() { return c.layers.length; } });
  const add = (n, k, s) => { const l = layer(c, n, k, s); c.layers.unshift(l); return l; };
  c.layers.add = (it) => { if (!it) throw new Error('layers.add(null)'); return add(it.name, it.isComp ? 'comp' : 'item', it); };
  c.layers.addSolid = (col, n, sw, sh) => { chk(col, 'solid color ' + n); return add(n, 'solid', { width: sw || w, height: sh || h, name: n }); };
  c.layers.addShape = () => add('Shape', 'shape');
  c.layers.addText = (s) => add(s, 'text'); c.layers.addNull = () => add('Null', 'null');
  c.layer = (i) => c.layers[i - 1];
  COMPS.push(c);
  return c;
}
global.app = { version: 'mock', effects: [{ displayName: 'Quick Chromatic Aberration 3', matchName: 'PE QuickCA3' }], beginSuppressDialogs() {}, endSuppressDialogs() {}, beginUndoGroup() {}, endUndoGroup() {}, open() {}, newProject() {},
  project: { file: null, numItems: 0, item() {}, rootFolder: {}, items: { addFolder(n) { return { name: n }; }, addComp: comp },
    importFile(io) {
      const img = /\.(jpe?g|png|tif)$/i.test(io.f.name), sz = img ? (imgSize(io.f.fsName) || [1200, 1500]) : [0, 0];
      return { name: io.f.name, width: sz[0], height: sz[1], file: io.f.fsName, isFootage: img };
    }, save() {}, close() {} } };
global.QCA_OK = true;
global.File = function (p) { this.fsName = p; this.name = String(p).split('/').pop(); this.exists = !/out\/|\.aep$/.test(p) && fs.existsSync(loc(p)); this.open = () => true; this.write = () => {}; this.writeln = () => {}; this.close = () => {}; this.parent = { fsName: '.' }; };
global.Folder = function (p) { this.create = () => true; };
global.ImportOptions = function (f) { this.f = f; };
global.Shape = function () {}; global.KeyframeEase = function (s, i) { if (!(i >= 0.1 && i <= 100)) problems.push('Ease-Influence ausserhalb 0.1-100: ' + i); };
global.FolderItem = function () {};
global.PropertyType = PT;
global.BlendingMode = new Proxy({}, { get: (t, k) => k }); global.ParagraphJustification = new Proxy({}, { get: (t, k) => k });
global.KeyframeInterpolationType = { HOLD: 1, LINEAR: 2, BEZIER: 3 }; global.CloseOptions = { SAVE_CHANGES: 1, DO_NOT_SAVE_CHANGES: 2 }; global.TrackMatteType = {};
global.$ = { fileName: 'x' };

// ---------------- Geometrie (RAND / HOCHSKALIERT) ----------------
function charW(ch, font) {
  if (/Courier/.test(font)) return 0.6;
  let w = /[A-ZÄÖÜ]/.test(ch) ? 0.70 : /[0-9]/.test(ch) ? 0.55 : ch === ' ' ? 0.28 : /[.,:;'!|ilfjrt]/.test(ch) ? 0.34 : /[mwMW]/.test(ch) ? 0.82 : 0.53;
  if (/Bold|Black/.test(font)) w *= 1.08;
  return w;
}
function textRect(d) {
  const s = String(d.text || ''), fz = d.fontSize || 50;
  let w = 0; for (const ch of s) w += charW(ch, d.font || '') * fz + (d.tracking || 0) / 1000 * fz;
  w *= 1.04;
  const j = String(d.justification || 'CENTER_JUSTIFY');
  const left = /LEFT/.test(j) ? 0 : /RIGHT/.test(j) ? -w : -w / 2;
  return { left, top: -0.74 * fz, width: w, height: 0.96 * fz };
}
function shapeRect(L, t) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, any = false;
  function addPt(x, y, pad) { x0 = Math.min(x0, x - pad); y0 = Math.min(y0, y - pad); x1 = Math.max(x1, x + pad); y1 = Math.max(y1, y + pad); any = true; }
  function walk(g, pad) {
    let sw = 0;
    for (const c of g.list) if (c.matchName === 'ADBE Vector Graphic - Stroke') { const wp = c.named['ADBE Vector Stroke Width']; sw = Math.max(sw, wp ? valAt(wp, t) : 2); }
    const p2 = Math.max(pad, sw / 2);
    for (const c of g.list) {
      if (c.matchName === 'ADBE Vector Shape - Group') { const sp = c.named['ADBE Vector Shape']; const S = sp && sp.v; if (S && S.vertices) S.vertices.forEach(v => addPt(v[0], v[1], p2)); }
      else if (c.matchName === 'ADBE Vector Shape - Ellipse' || c.matchName === 'ADBE Vector Shape - Rect') {
        const pre = c.matchName === 'ADBE Vector Shape - Ellipse' ? 'ADBE Vector Ellipse ' : 'ADBE Vector Rect ';
        const sz = c.named[pre + 'Size'] ? valAt(c.named[pre + 'Size'], t) : [0, 0], ps = c.named[pre + 'Position'] ? valAt(c.named[pre + 'Position'], t) : [0, 0];
        addPt(ps[0] - sz[0] / 2, ps[1] - sz[1] / 2, p2); addPt(ps[0] + sz[0] / 2, ps[1] + sz[1] / 2, p2);
      } else if (c.matchName === 'ADBE Vector Group') {
        const tg = c.named['ADBE Vector Transform Group'], op = tg && tg.named['ADBE Vector Group Opacity'];
        if (op && valAt(op, t) < 15) continue;
        const inner = c.named['ADBE Vectors Group']; if (inner) walk(inner, p2);
      }
    }
  }
  walk(L._root, 0);
  return any ? { left: x0, top: y0, width: x1 - x0, height: y1 - y0 } : null;
}
function localRect(L, t) {
  if (L.kind === 'text') return textRect(L._text.named['ADBE Text Document'].v);
  if (L.kind === 'shape') return shapeRect(L, t);
  if (L.w && L.h) return { left: 0, top: 0, width: L.w, height: L.h };
  return null;
}
function tv(L, k, t) { return valAt(L._tr.named[k], t); }
function toParent(L, p, t) {
  const a = tv(L, 'ADBE Anchor Point', t), s = tv(L, 'ADBE Scale', t), r = tv(L, 'ADBE Rotate Z', t) * Math.PI / 180, q = tv(L, 'ADBE Position', t);
  const x = (p[0] - a[0]) * s[0] / 100, y = (p[1] - a[1]) * s[1] / 100;
  return [q[0] + x * Math.cos(r) - y * Math.sin(r), q[1] + x * Math.sin(r) + y * Math.cos(r)];
}
function toComp(L, p, t) { let q = p, l = L, n = 0; while (l && n++ < 20) { q = toParent(l, q, t); l = l.parent; } return q; }
function opac(L, t) { let o = 1, l = L, n = 0; while (l && n++ < 20) { o *= tv(l, 'ADBE Opacity', t) / 100; l = l.parent; } return o; }
const SKIP = /^(Papier|Halftone|Vignette|Lichtleck|Kamera|Vox Sauce|Master Sauce|FIX gradient|FIX Fokus|FIX Focus|FIX Entsaettigen|FIX Blitz|FIX Callout|Stadtplan|Europa 1914|Land |Blatt|Kopf|Haeuserbloecke|Fluss|Strassen und Ufer|Grenzen 1914)/;
const rand = {}, upsc = {}, run = {}, ext = {};
function boundsCheck(sc) {
  function visit(c, outer, tOff, sceneT, depth, tag) {
    for (const L of c.layers) {
      if (!L.enabled || L.guideLayer || L.adjustmentLayer || L.kind === 'solid' || L.kind === 'null') continue;
      const t = sceneT - tOff;
      if (t < L.inPoint - 1e-6 || t >= L.outPoint - 1e-6) continue;
      if (opac(L, t) < 0.1) continue;
      { const sc0 = tv(L, 'ADBE Scale', t); if (Math.abs(sc0[0]) < 5) continue; }   // popIn-Start (Skalierung ~0)
      const map = (p) => outer(toComp(L, p, t));
      const S = L.source;
      if (L.kind === 'comp' && S && S.isComp) {
        const big = S.width >= 1080 || S.height >= 1920;
        if (big || /^Abzug/.test(S.name)) visit(S, map, tOff + L.startTime, sceneT, depth + 1, (tag ? tag + ' > ' : '') + L.name);
        if (big) continue;
      }
      if (L.kind === 'item' && S && S.isFootage) {
        const a = map([0, 0]), b = map([100, 0]); const f = Math.hypot(b[0] - a[0], b[1] - a[1]) / 100;
        const key = sc.name + ' | ' + S.name; if (!upsc[key] || upsc[key].f < f) upsc[key] = { f, t: sceneT };
        continue;   // die Kante eines Fotos ist der Abzug (Precomp) bzw. sein Rahmen
      }
      if (depth > 0 && !(L.kind === 'text' || /^Rahmen/.test(L.name))) continue;
      if (SKIP.test(L.name) || /^UT /.test(L.name)) continue;
      const r = localRect(L, t); if (!r) continue;
      const pts = [[r.left, r.top], [r.left + r.width, r.top], [r.left, r.top + r.height], [r.left + r.width, r.top + r.height]].map(map);
      const xs = pts.map(p => p[0]); const lo = Math.min(...xs), hi = Math.max(...xs);
      const key = sc.name + ' | ' + (tag ? tag + ' > ' : '') + L.name;
      if (process.env.AEMOCK_EXT) { const e = ext[key] = ext[key] || { lo: 1e9, hi: -1e9 }; if (hi >= 0 && lo <= 1080) { e.lo = Math.min(e.lo, lo); e.hi = Math.max(e.hi, hi); } }
      if (hi < 0 || lo > 1080) { run[key] = 0; continue; }          // ganz ausserhalb: nicht zu sehen (faehrt erst herein)
      if (lo < 60 - 0.5 || hi > 1020 + 0.5) {
        // Ebene bewegt sich selbst gerade (Wagen faehrt herein/hinaus): bis 12 Frames am Stueck erlaubt
        const p0 = tv(L, 'ADBE Position', t), p1 = tv(L, 'ADBE Position', t + 3 / 30);
        const moving = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) > 2;
        run[key] = moving ? (run[key] || 0) + 1 : 99;
        if (run[key] <= 12) continue;
        const over = Math.max(60 - lo, hi - 1020);
        if (!rand[key] || rand[key].over < over) rand[key] = { over, lo, hi, t: sceneT, moving };
      } else run[key] = 0;
    }
  }
  for (let f = 0; f < Math.round(sc.duration * 30); f++) visit(sc, (p) => p, 0, f / 30, 0, '');
}
function blurCheck(c) {
  for (const L of c.layers) {
    for (const e of L._fx.list) {
      const pn = BLUR[e.matchName]; if (!pn) continue;
      const p = e.list.find(x => x.name === pn); if (!p) continue;
      let full = false;
      if (e.matchName === 'ADBE Compound Blur') {
        const bl = e.list.find(x => x.name === 'Blur Layer'), m = bl && bl.refLayer;
        if (m && m.kind !== 'comp' && m._fx.list.length) { full = true; problems.push('KARTE OHNE WIRKUNG ' + c.name + ': Compound Blur auf "' + L.name + '" nimmt "' + m.name + '" als Karte; AE ignoriert deren Effekte -> alles voll unscharf'); }
      }
      let run = 0, worst = 0, at = 0;
      const t0 = Math.max(0, L.inPoint), t1 = Math.min(c.duration, L.outPoint);
      for (let t = t0; t < t1 - 1e-6; t += 1 / 30) {
        const v = valAt(p, t);
        if (v > 1.0 || (full && v > 0.5)) { run += 1 / 30; if (run > worst) { worst = run; at = t; } } else run = 0;
      }
      if (worst > 0.3 + 1e-6) problems.push('UNSCHAERFE ' + c.name + ': "' + L.name + '" / ' + (e.name || e.matchName) + ' wirkt ' + worst.toFixed(2) + ' s am Stueck (bis ' + at.toFixed(2) + ' s), erlaubt 0.30 s');
    }
  }
}

// ---------------- Lauf ----------------
const res = (new Function(src))();
console.log(String(res).split('\n').slice(0, 80).join('\n'));
const scenes = COMPS.filter(c => /^WK \d\d /.test(c.name));
for (const c of COMPS) blurCheck(c);
for (const sc of scenes) boundsCheck(sc);
for (const k in rand) { const r = rand[k]; problems.push('RAND ' + k + ': x ' + Math.round(r.lo) + '..' + Math.round(r.hi) + ' (' + Math.round(r.over) + ' px draussen, t=' + r.t.toFixed(2) + ' s' + (r.moving ? ', in Bewegung > 12 Frames' : '') + ')'); }
for (const k in upsc) if (upsc[k].f > 1.25) problems.push('HOCHSKALIERT ' + k + ': ' + Math.round(upsc[k].f * 100) + ' % der echten Pixel (t=' + upsc[k].t.toFixed(2) + ' s), max 125 %');
if (process.env.AEMOCK_EXT) { for (const k in ext) console.log('  EXT ' + k + ': x ' + Math.round(ext[k].lo) + '..' + Math.round(ext[k].hi)); for (const k in upsc) console.log('  SKAL ' + k + ': ' + Math.round(upsc[k].f * 100) + ' %'); }
const cnt = (re) => problems.filter(p => re.test(p)).length;
console.log('Comps:', COMPS.length, '| Probleme:', problems.length, '| RAND:', cnt(/^RAND/), '| UNSCHAERFE:', cnt(/^UNSCHAERFE|^KARTE/), '| HOCHSKALIERT:', cnt(/^HOCHSKALIERT/));
problems.forEach(p => console.log('  ' + p));
