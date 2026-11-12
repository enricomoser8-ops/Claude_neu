// ===================== Vox-Bausteine (After Effects 2023, ES3) =====================
// Werte aus podcast/stil-referenzen/vox-chrismoran/00-vox-handbuch.md (Chris Moran) + createdaley-Playlist.
// Erwartet: D (Daten), BASE (Ordner mit tex/, archiv/, audio/), FPS, W, H.

var log = [];
var FX_MISSING = {};
function plog(m) {
  try { var f = new File(BASE + "out/build-log.txt"); f.encoding = "UTF-8"; f.open("a"); f.writeln(new Date().toTimeString().substr(0, 8) + " " + m); f.close(); } catch (e) {}
}
function rgb(h) { return [parseInt(h.substr(1, 2), 16) / 255, parseInt(h.substr(3, 2), 16) / 255, parseInt(h.substr(5, 2), 16) / 255]; }
var INK = "#1D1B18", PAPER = "#FDFAF3", RED = "#C8102E", YEL = "#FFD23F", GREY = "#8A8273", DARK = "#151412";
var F_SERIF = "Georgia", F_SERIF_I = "Georgia-Italic", F_SERIF_B = "Georgia-Bold", F_SERIF_BI = "Georgia-BoldItalic";
var F_NUM = "TimesNewRomanPS-BoldMT"; // Zahlen mit Versalziffern (Georgia hat Mediaevalziffern, die 4 haengt nach unten)
var F_SANS_B = "Arial-BoldMT", F_BLACK = "Arial-Black", F_MONO = "CourierNewPS-BoldMT";

// ---------- Effekte sicher anlegen und Parameter per Name finden (Englisch + Deutsch) ----------
function addFx(layer, match, label) {
  try { var e = layer.property("ADBE Effect Parade").addProperty(match); if (label) e.name = label; return e; }
  catch (err) { FX_MISSING[match] = true; return null; }
}
// Effekt einer Ebene per Name/matchName FRISCH holen. In AE macht jedes weitere addProperty auf der Effekt-Liste
// alle vorher gemerkten Effekt-Referenzen ungueltig ("Object is invalid") -> nach dem Anlegen immer so neu holen.
function fxGet(layer, name) {
  try { var fx = layer.property("ADBE Effect Parade"); return fx ? fx.property(name) : null; } catch (e) { return null; }
}
function findP(group, names) {
  if (!group) return null;
  for (var i = 1; i <= group.numProperties; i++) {
    var p = group.property(i);
    for (var n = 0; n < names.length; n++) if (p.name === names[n] || p.matchName === names[n]) return p;
    if (p.propertyType === PropertyType.INDEXED_GROUP || p.propertyType === PropertyType.NAMED_GROUP) {
      var q = findP(p, names); if (q) return q;
    }
  }
  return null;
}
function setP(e, names, v) {
  var p = findP(e, names);
  if (!p) { if (e) log.push("PARAM FEHLT: " + e.matchName + " / " + names[0]); return null; }
  try { p.setValue(v); } catch (err) { log.push("PARAM WERT: " + e.matchName + " / " + names[0] + ": " + err.toString()); }
  return p;
}
function exprP(e, names, x) {
  var p = findP(e, names);
  if (!p) { if (e) log.push("PARAM FEHLT: " + e.matchName + " / " + names[0]); return null; }
  try { p.expression = x; } catch (err) { log.push("EXPR: " + names[0] + ": " + err.toString()); }
  return p;
}
// Quick Chromatic Aberration 3 (Plugin Everything): matchName unbekannt -> per Anzeigename suchen
var QCA = null;
(function () {
  for (var i = 0; i < app.effects.length; i++) {
    var dn = app.effects[i].displayName;
    if (/quick\s*chromatic/i.test(dn)) { QCA = app.effects[i].matchName; break; }
  }
  if (!QCA) for (var j = 0; j < app.effects.length; j++) if (/chromatic\s*aberration/i.test(app.effects[j].displayName)) { QCA = app.effects[j].matchName; break; }
})();
function chroma(layer, amt) {
  if (!QCA) { FX_MISSING["Quick Chromatic Aberration 3"] = true; return null; }
  var e = addFx(layer, QCA, "CA " + amt);
  if (!e) return null;
  var p = findP(e, ["Position", "Amount", "Offset", "Strength", "Aberration", "Shift", "Displacement"]);
  if (p) { try { p.setValue(amt); } catch (err) { try { p.setValue([amt, 0]); } catch (e2) { log.push("CA Wert nicht gesetzt: " + p.name); } } }
  else { var names = []; for (var k = 1; k <= e.numProperties; k++) names.push(e.property(k).name); log.push("CA-Parameter unbekannt: " + names.join(", ")); }
  return e;
}

// ---------- Keyframes ----------
function ease(prop, k, inf, outf) {
  for (var d = 1; d <= 3; d++) {
    try {
      var a = [], b = [];
      for (var j = 0; j < d; j++) { a.push(new KeyframeEase(0, inf)); b.push(new KeyframeEase(0, outf)); }
      prop.setTemporalEaseAtKey(k, a, b); return;
    } catch (e) {}
  }
}
// keys(prop, [t...], [v...], infl)  infl: Zahl (alle) oder [[in,out],...]
// ---------- Pruefung: jede Animation ist vor dem Schnitt fertig (ennos Regel) ----------
// keys/typeOn/counter/pathKeys melden ihr Ende; checkAnims vergleicht mit Szenenende bzw. Ebenen-Ende.
var ANIM = [], CURSCENE = null, MIN_STAND = 8, NOANIM = false;   // NOANIM: Kamera-Grundbewegung (Punch-Out ueber den Schnitt ist gewollt)   // fertiger Zustand steht mindestens 8 Frames
function animLayer(prop) { try { return prop.propertyGroup(prop.propertyDepth); } catch (e) { return null; } }
function noteAnim(prop, tEnd, layer) {
  if (!CURSCENE || NOANIM) return;
  var Ly = layer || animLayer(prop);
  ANIM.push({ s: CURSCENE, l: Ly, n: Ly ? Ly.name : ((prop && prop.name) || "?"), t: tEnd });
}
function checkAnims(sid, dur) {
  var out = [];
  for (var i = 0; i < ANIM.length; i++) {
    var a = ANIM[i]; if (a.s !== sid) continue;
    if (/^(Kamera|Vox Sauce|Lichtleck|Vignette|FIX Focus|FIX Fokus|FIX gradient)/.test(a.n)) continue;
    var lim = dur, why = "Szenenende";
    try { if (a.l && a.l.outPoint < dur - 0.001 && a.l.outPoint > a.l.inPoint) { lim = a.l.outPoint; why = "Ebenen-Ende"; } } catch (e) {}
    var rest = Math.round((lim - a.t) * FPS);
    if (rest < 3) out.push("ABGESCHNITTEN " + sid + ": '" + a.n + "' endet " + (-rest) + " Frames nach " + why);
    else if (rest < MIN_STAND) out.push("KNAPP " + sid + ": '" + a.n + "' steht nur " + rest + " Frames vor " + why);
  }
  return out;
}
function keys(prop, times, vals, infl) {
  if (String(vals[0]) !== String(vals[vals.length - 1]) || vals.length > 2) noteAnim(prop, times[times.length - 1]);
  var idx = [];
  for (var k = 0; k < times.length; k++) idx.push(prop.addKey(times[k]));
  for (var k2 = 0; k2 < times.length; k2++) prop.setValueAtKey(idx[k2], vals[k2]);
  for (var k3 = 0; k3 < times.length; k3++) {
    var i = prop.nearestKeyIndex(times[k3]);
    if (infl instanceof Array) ease(prop, i, infl[k3][0], infl[k3][1]);
    else ease(prop, i, infl || 80, infl || 80);
  }
}
function hold(prop, t, v) { var k = prop.addKey(t); prop.setValueAtKey(k, v); prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD); }
function f2s(f) { return f / FPS; }
// "Spitze links": schneller Start, langes weiches Auslaufen (1-2 s)
function swoop(prop, t0, t1, v0, v1) { keys(prop, [t0, t1], [v0, v1], [[10, 10], [92, 92]]); }

// ---------- Projekt/Import ----------
var proj = app.project;
var cache = {};
function imp(rel, seq) {
  if (cache[rel]) return cache[rel];
  var f = new File(BASE + rel);
  if (!f.exists) { log.push("DATEI FEHLT: " + rel); return null; }
  var io = new ImportOptions(f);
  if (seq) io.sequence = true;
  var it = proj.importFile(io);
  it.parentFolder = fAssets;
  cache[rel] = it; return it;
}
function mkComp(name, w, h, dur, folder) {
  var c = proj.items.addComp(name, w || W, h || H, 1, dur, FPS);
  c.resolutionFactor = [4, 4];          // Viertel-Aufloesung (ennos Regel)
  c.parentFolder = folder || fScenes;
  c.motionBlur = false;
  return c;
}
function addItem(comp, it, x, y, sc) {
  var l = comp.layers.add(it);
  if (x !== undefined) l.position.setValue([x, y]);
  if (sc !== undefined) l.scale.setValue([sc, sc]);
  return l;
}
function cover(comp, it, extra) {
  var s = Math.max(comp.width / it.width, comp.height / it.height) * 100 * (extra || 1);
  return addItem(comp, it, comp.width / 2, comp.height / 2, s);
}
function solid(comp, name, color, w, h) { var l = comp.layers.addSolid(rgb(color), name, w || comp.width, h || comp.height, 1); return l; }
function adj(comp, name) { var a = comp.layers.addSolid([1, 1, 1], name, comp.width, comp.height, 1); a.adjustmentLayer = true; return a; }

// ---------- Formebenen ----------
function shape(comp, name) { var l = comp.layers.addShape(); l.name = name; l.anchorPoint.setValue([0, 0]); l.position.setValue([0, 0]); return l; }
function grp(l, name) { var g = l.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group"); if (name) g.name = name; return g.property("ADBE Vectors Group"); }
function mkShape(p, dx, dy, s) {
  var sh = new Shape(); s = s || 1; dx = dx || 0; dy = dy || 0;
  var v = [], ii = [], oo = [];
  for (var k = 0; k < p.v.length; k++) {
    v.push([p.v[k][0] * s + dx, p.v[k][1] * s + dy]);
    ii.push([p.i[k][0] * s, p.i[k][1] * s]); oo.push([p.o[k][0] * s, p.o[k][1] * s]);
  }
  sh.vertices = v; sh.inTangents = ii; sh.outTangents = oo; sh.closed = !!p.c; return sh;
}
function line2(pts, closed) { return { v: pts, i: zeros(pts.length), o: zeros(pts.length), c: !!closed }; }
function zeros(n) { var a = []; for (var i = 0; i < n; i++) a.push([0, 0]); return a; }
function addPath(g, p, dx, dy, s) { var pp = g.addProperty("ADBE Vector Shape - Group"); pp.property("ADBE Vector Shape").setValue(mkShape(p, dx, dy, s)); return pp; }
function stroke(g, color, width, dash, gap) {
  var st = g.addProperty("ADBE Vector Graphic - Stroke");
  st.property("ADBE Vector Stroke Color").setValue(rgb(color));
  st.property("ADBE Vector Stroke Width").setValue(width);
  try { st.property("ADBE Vector Stroke Line Cap").setValue(2); st.property("ADBE Vector Stroke Line Join").setValue(2); } catch (e) {}
  if (dash) {
    var ds = st.property("ADBE Vector Stroke Dashes");
    ds.addProperty("ADBE Vector Stroke Dash 1").setValue(dash);
    ds.addProperty("ADBE Vector Stroke Gap 1").setValue(gap || dash);
  }
  return st;
}
function fill(g, color, op) {
  var f = g.addProperty("ADBE Vector Graphic - Fill");
  f.property("ADBE Vector Fill Color").setValue(rgb(color));
  if (op !== undefined) f.property("ADBE Vector Fill Opacity").setValue(op);
  return f;
}
function trimOn(g, t0, t1, from) {
  var tr = g.addProperty("ADBE Vector Filter - Trim");
  // nur leichtes Easing (Chris): Trim End 0 -> 100 in ca. 24 Frames
  keys(tr.property("ADBE Vector Trim End"), [t0, t1], [0, 100], [[30, 30], [55, 55]]);
  return tr;
}
function rectP(w, h, cx, cy) { var x0 = cx - w / 2, y0 = cy - h / 2; return line2([[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]], true); }
function ellipseG(g, w, h, cx, cy) { var e = g.addProperty("ADBE Vector Shape - Ellipse"); e.property("ADBE Vector Ellipse Size").setValue([w, h]); e.property("ADBE Vector Ellipse Position").setValue([cx || 0, cy || 0]); return e; }
function rectG(g, w, h, cx, cy, round) { var r = g.addProperty("ADBE Vector Shape - Rect"); r.property("ADBE Vector Rect Size").setValue([w, h]); r.property("ADBE Vector Rect Position").setValue([cx || 0, cy || 0]); if (round) r.property("ADBE Vector Rect Roundness").setValue(round); return r; }

// ---------- Saeule 3: Edge Boil (lebendige Linien) ----------
function edgeBoil(layer, strokeW) {
  var r = addFx(layer, "ADBE Roughen Edges", "Edge Boil");
  if (r) {
    setP(r, ["Border", "ADBE Roughen Edges-0002"], Math.max(1.2, (strokeW || 5) * 0.7));
    setP(r, ["Edge Sharpness"], 1); setP(r, ["Complexity"], 2); setP(r, ["Scale"], 60);
    exprP(r, ["Random Seed"], "Math.floor(time*4)");
  }
  var t1 = addFx(layer, "ADBE Turbulent Displace", "Bleistift fein");
  if (t1) { setP(t1, ["Amount"], 6); setP(t1, ["Size"], 2); exprP(t1, ["Evolution"], "posterizeTime(4); time*360"); }
  var t2 = addFx(layer, "ADBE Turbulent Displace", "Bleistift grob");
  if (t2) { setP(t2, ["Amount"], 4); setP(t2, ["Size"], 52); exprP(t2, ["Evolution"], "posterizeTime(4); time*200"); }
  return layer;
}
// Bleistift-/Tusche-Strich, zeichnet sich selbst (Trim End 0->100 in ~24 Frames)
function pencil(comp, name, paths, color, width, t0, dur, dx, dy, s) {
  var l = shape(comp, name), g = grp(l, name);
  for (var i = 0; i < paths.length; i++) addPath(g, paths[i], dx, dy, s);
  stroke(g, color || INK, width || 5);
  if (t0 !== undefined && t0 !== null) trimOn(g, t0, t0 + (dur || f2s(24)));
  edgeBoil(l, width || 5);
  return l;
}
// Textmarker: nur auf Fliesstext, Stroke 25, Multiply, Trim ohne starkes Easing
function highlighter(comp, x0, x1, y, t0, color) {
  var l = shape(comp, "Textmarker"), g = grp(l);
  addPath(g, line2([[x0, y], [x1, y + 2]]));
  stroke(g, color || YEL, 34);
  var tr = g.addProperty("ADBE Vector Filter - Trim");
  keys(tr.property("ADBE Vector Trim End"), [t0, t0 + Math.max(0.35, (x1 - x0) / 900)], [0, 100], 20);
  l.blendingMode = BlendingMode.MULTIPLY;
  var td = addFx(l, "ADBE Turbulent Displace"); if (td) { setP(td, ["Amount"], 30); setP(td, ["Size"], 2); }
  var td2 = addFx(l, "ADBE Turbulent Displace"); if (td2) { setP(td2, ["Amount"], 10); setP(td2, ["Size"], 60); }
  return l;
}

// ---------- Saeule 2: Papier ----------
function paperBase(comp, dark) {
  var bg = solid(comp, "Papier Grund", dark ? DARK : PAPER);
  var tex = imp(dark ? "tex/paper338.jpg" : "tex/paper300.jpg");
  if (tex) {
    var p = cover(comp, tex, 1.05); p.name = "Papier Textur";
    p.blendingMode = dark ? BlendingMode.SCREEN : BlendingMode.MULTIPLY; p.opacity.setValue(dark ? 10 : 55);
    var tn = addFx(p, "ADBE Tint"); if (tn) { setP(tn, ["Map White To"], rgb("#FFFBF2")); }
  }
  var ht = imp("tex/halftone.jpg");
  if (ht) { var h = cover(comp, ht, 0.9); h.name = "Halftone"; h.blendingMode = BlendingMode.OVERLAY; h.opacity.setValue(dark ? 8 : 14); }
  return bg;
}
function lensLeak(comp, op) {
  var lf = imp("tex/lensfx216.jpg"); if (!lf) return null;
  var l = cover(comp, lf, 1.1); l.name = "Lichtleck"; l.blendingMode = BlendingMode.ADD; l.opacity.setValue(op || 12);
  l.opacity.expression = "wiggle(2," + Math.round((op || 12) * 0.3) + ")";
  return l;
}
function vignette(comp, amount) {
  var v = solid(comp, "Vignette", "#000000");
  var m = v.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  var s = new Shape(), w = comp.width, h = comp.height, k = 0.5523, cx = w / 2, cy = h / 2, rx = w * 0.66, ry = h * 0.6;
  s.vertices = [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]];
  s.inTangents = [[-rx * k, 0], [0, -ry * k], [rx * k, 0], [0, ry * k]];
  s.outTangents = [[rx * k, 0], [0, ry * k], [-rx * k, 0], [0, -ry * k]];
  s.closed = true;
  m.property("ADBE Mask Shape").setValue(s); m.inverted = true;
  m.property("ADBE Mask Feather").setValue([420, 420]);
  v.opacity.setValue(amount || 28);
  return v;
}

// ---------- Saeule 1: Vox Sauce ----------
// typ: "grafik" | "archiv" | "screen"
function voxSauce(comp, typ, opt) {
  opt = opt || {};
  vignette(comp, opt.vig || (typ === "archiv" ? 34 : 24));
  var a = adj(comp, "Vox Sauce (" + typ + ")");
  chroma(a, typ === "archiv" ? 2 : (typ === "screen" ? 1.2 : 0.8));
  var ex = addFx(a, "ADBE Exposure2", "Flackern");
  if (ex) exprP(ex, ["Exposure", "ADBE Exposure2-0003"], typ === "screen" ? "wiggle(24,.08)" : (typ === "archiv" ? "wiggle(24,.05)" : "wiggle(24,.03)"));
  var g = addFx(a, "VISINF Grain Implant", "Korn");
  if (g) {
    var vm = findP(g, ["Viewing Mode"]); if (vm) { try { vm.setValue(3); } catch (e) {} }
    setP(g, ["Intensity"], typ === "archiv" ? 1.0 : 0.3);
    setP(g, ["Size"], typ === "archiv" ? 1.4 : 1.0);
    setP(g, ["Softness"], 1);
  } else { var n = addFx(a, "ADBE Noise"); if (n) n.property(1).setValue(typ === "archiv" ? 4 : 2); }
  return a;
}
// Master-Sauce: Posterize Time 12 + Gate Weave (gilt fuer alles darunter; Untertitel liegen darueber)
function masterSauce(comp) {
  var a = adj(comp, "Master Sauce (Posterize 12 + Gate Weave)");
  var pt = addFx(a, "ADBE Posterize Time"); if (pt) setP(pt, ["Frame Rate", "ADBE Posterize Time-0001"], 12);
  var tf = addFx(a, "ADBE Geometry2", "Gate Weave");
  if (tf) {
    exprP(tf, ["Position", "ADBE Geometry2-0002"], "posterizeTime(24); wiggle(6,1)");
    setP(tf, ["Scale", "Scale Height", "ADBE Geometry2-0003"], 102);
  }
  return a;
}

// ---------- Kamera-Null pro Szene: Punch-Cut + langsame Fahrt ----------
// Punch: Keys 7 Frames vor und 21 Frames nach dem Schnitt, Speed-Spitze genau auf dem Schnitt
function camRig(comp, ax, ay, opt) {
  opt = opt || {};
  var n = comp.layers.addNull(comp.duration); n.name = "Kamera";
  n.anchorPoint.setValue([ax, ay]); n.position.setValue([ax, ay]);
  for (var i = comp.numLayers; i >= 1; i--) {
    var l = comp.layer(i);
    if (l === n || l.parent !== null || l.adjustmentLayer || l.name === "Vignette" || l.name.indexOf("FIX ") === 0 || l.name.indexOf("Papier") === 0 || l.name === "Halftone" || l.name === "Lichtleck") continue;
    l.parent = n;
  }
  var d = comp.duration, s0 = opt.s0 || 100, s1 = opt.s1 || 106, pin = opt.punchIn === false ? 0 : (opt.punchIn || 118);
  var T = [], V = [], E = [];
  if (pin) { T.push(0); V.push([pin, pin]); E.push([10, 5]); T.push(f2s(21)); V.push([s0 + 1, s0 + 1]); E.push([90, 40]); }
  else { T.push(0); V.push([s0, s0]); E.push([40, 40]); }
  if (opt.punchOut !== false && d > 1.2) { T.push(d - f2s(7)); V.push([s1, s1]); E.push([40, 40]); T.push(d); V.push([s1 * 1.07, s1 * 1.07]); E.push([5, 10]); }
  else { T.push(d); V.push([s1, s1]); E.push([60, 60]); }
  NOANIM = true;
  keys(n.scale, T, V, E);
  if (opt.dx || opt.dy) keys(n.position, [0, d], [[ax, ay], [ax + (opt.dx || 0), ay + (opt.dy || 0)]], 40);
  NOANIM = false;
  return n;
}
// zusaetzlicher Punch innerhalb einer Szene (Kamera-Null), z. B. auf ein Schluesselwort
function punchAt(cam, t, amt) {
  var p = cam.scale, v = p.valueAtTime(t, false)[0];
  keys(p, [t - f2s(3), t + f2s(14)], [[v, v], [v * (amt || 1.08), v * (amt || 1.08)]], [[60, 10], [90, 60]]);
}

// ---------- Saeule 4: Blicklenkung ----------
// Contrast Callout: alles ausser dem Ziel wird blass (wie Curves-Schwarzpunkt 50 %), harter Schnitt, keine Blende
function contrastCallout(comp, t0, t1, cx, cy, rx, ry, dark) {
  var l = solid(comp, "FIX Callout Kontrast", dark ? "#000000" : "#F4EFE4");
  var m = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  var s = new Shape(), k = 0.5523;
  s.vertices = [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]];
  s.inTangents = [[-rx * k, 0], [0, -ry * k], [rx * k, 0], [0, ry * k]];
  s.outTangents = [[rx * k, 0], [0, ry * k], [-rx * k, 0], [0, -ry * k]];
  s.closed = true;
  m.property("ADBE Mask Shape").setValue(s); m.inverted = true; m.property("ADBE Mask Feather").setValue([90, 90]);
  l.opacity.setValue(dark ? 62 : 55);
  l.inPoint = t0; l.outPoint = t1;
  return l;
}
// Fokus-Unschaerfe (Compound Blur + versteckte radiale Gradient-Karte), Blickpunkt wandert A -> B
// Runde 2 (12.11.): (1) Die Karte liegt jetzt in einer eigenen Precomp. Compound Blur liest von einer Karten-Ebene nur die
// QUELLE, nicht deren Effekte -> ein weisses Solid mit Ramp-Effekt war fuer AE einfach weiss = ueberall volle Unschaerfe (Szene thron/ecke).
// (2) Die Unschaerfe wirkt nur noch kurz (max. 0,3 s, Schaerfe zieht auf den Blickpunkt), danach ist das Bild scharf und die Ebene endet.
function focalBlur(comp, t0, t1, a, b, maxBlur) {
  var te = t0 + Math.min(0.3, Math.max(f2s(5), t1 - t0));
  var mc = mkComp("FIX Fokus-Karte " + comp.name, comp.width, comp.height, comp.duration, fPre);
  var g = solid(mc, "Karte", "#FFFFFF");
  var r = addFx(g, "ADBE Ramp");
  if (r) {
    setP(r, ["Ramp Shape"], 2);
    setP(r, ["Start Color"], [0, 0, 0]); setP(r, ["End Color"], [1, 1, 1]);
    var sp = findP(r, ["Start of Ramp"]); if (sp) keys(sp, [t0, te], [a, b], [[15, 15], [95, 95]]);
    var ep = findP(r, ["End of Ramp"]); if (ep) keys(ep, [t0, te], [[a[0] + 760, a[1]], [b[0] + 760, b[1]]], [[15, 15], [95, 95]]);
  }
  var ml = addItem(comp, mc, comp.width / 2, comp.height / 2, 100); ml.name = "FIX gradient map";
  ml.enabled = false; ml.guideLayer = true;
  var ad = adj(comp, "FIX Fokus-Unschaerfe");
  addFx(ad, "ADBE Compound Blur", "Fokus");
  var cb = fxGet(ad, "Fokus");                         // nach dem Anlegen frisch holen (AE: "Object is invalid")
  if (cb) {
    var bl = findP(cb, ["Blur Layer"]); if (bl) { try { bl.setValue(ml.index); } catch (e) { log.push("Compound Blur Ebene: " + e); } }
    setP(cb, ["Stretch Map to Fit", "If Layer Sizes Differ"], 1);
    setP(cb, ["Invert Blur"], 0);
    var mb = findP(cb, ["Maximum Blur"]); if (mb) keys(mb, [t0, te], [maxBlur || 12, 0], [[20, 20], [80, 80]]);
  }
  ad.inPoint = Math.max(0, t0 - 0.01); ad.outPoint = Math.min(comp.duration, te + f2s(1));
  return ad;
}
// Focus Hunting: Fast Box Blur Iterations 8, Radius 0/8/14/4/0 bei Frame 0/3/5/7/9 (Runde 2: vorher 18 Frames, zu lang)
function focusHunt(comp, t, soft) {
  var a = adj(comp, "FIX Focus Hunting");
  var b = addFx(a, "ADBE Box Blur2");
  if (b) {
    setP(b, ["Iterations"], soft ? 3 : 8);
    var r = findP(b, ["Blur Radius"]);
    if (r) {
      // Runde 2: kuerzer (Unschaerfe max. ~0,3 s), danach endet die Ebene
      if (soft) keys(r, [t, t + f2s(3), t + f2s(5), t + f2s(8)], [0, 4, 6, 0], 50);
      else keys(r, [t, t + f2s(3), t + f2s(5), t + f2s(7), t + f2s(9)], [0, 8, 14, 4, 0], 50);
    }
  }
  a.inPoint = Math.max(0, t - 0.01); a.outPoint = Math.min(comp.duration, t + f2s(10));
  return a;
}
// Text Contrast: Text darunter 100 -> 20 %, Schluesselwort-Kopie darueber per Linear Wipe (270 deg, Feather 55)
function textContrast(comp, baseLayer, keyLayer, t) {
  keys(baseLayer.opacity, [t, t + f2s(8)], [100, 20], 60);
  var lw = addFx(keyLayer, "ADBE Linear Wipe");
  if (lw) {
    setP(lw, ["Wipe Angle"], 270); setP(lw, ["Feather"], 55);
    var c = findP(lw, ["Transition Completion"]); if (c) keys(c, [t + f2s(4), t + f2s(16)], [100, 0], 50);
  }
}
// Doppler-Ringe (Ausbreitung): eigene Kreise, die nach aussen laufen (Radio-Waves-Look, Sawtooth In)
function rings(comp, cx, cy, t0, n, color, maxR) {
  var l = shape(comp, "Ringe");
  for (var i = 0; i < (n || 3); i++) {
    var g = grp(l, "Ring " + (i + 1)); ellipseG(g, 10, 10, cx, cy); stroke(g, color || INK, 6);
  }
  // Referenzen erst NACH allen addProperty-Aufrufen holen (AE macht aeltere Referenzen ungueltig: "Object is invalid")
  var root = l.property("ADBE Root Vectors Group");
  for (var j = 0; j < (n || 3); j++) {
    var G = root.property(j + 1), C = G.property("ADBE Vectors Group"), t = t0 + j * 0.22;
    keys(C.property("ADBE Vector Shape - Ellipse").property("ADBE Vector Ellipse Size"), [t, t + 1.0], [[10, 10], [maxR || 520, maxR || 520]], [[5, 5], [80, 80]]);
    keys(C.property("ADBE Vector Graphic - Stroke").property("ADBE Vector Stroke Width"), [t, t + 1.0], [8, 0.5], 40);
    keys(G.property("ADBE Vector Transform Group").property("ADBE Vector Group Opacity"), [t, t + 1.0], [100, 0], 40);
  }
  edgeBoil(l, 6);
  return l;
}

// ---------- Saeule 6: Archivfoto vereinheitlichen ----------
function homogenize(layer, comp) {
  var bw = addFx(layer, "ADBE Black&White");
  // Runde 2: die "Randunschaerfe" (Fast Box Blur 6 x 3 auf dem GANZEN Foto, die Randmaske gab es nie) ist raus -
  // sie hat jedes Archivfoto weich gemacht (Review 12.11.: Hook, Wagen, Krankenhaus, Princip-Foto unscharf).
  var cba = addFx(layer, "CC Ball Action", "Pixelraster");
  if (cba) { setP(cba, ["Grid Spacing"], 0); setP(cba, ["Ball Size"], 100); }
  chroma(layer, 2);
  var ex = addFx(layer, "ADBE Exposure2"); if (ex) exprP(ex, ["Exposure"], "wiggle(24,.05)");
  var cv = addFx(layer, "ADBE Brightness & Contrast 2"); if (cv) { setP(cv, ["Contrast"], 12); setP(cv, ["Brightness"], -4); }
  return layer;
}
// Foto als Abzug auf Papier: weisser Rand, Schatten, leicht gedreht, langsamer Zoom 100 -> 109 -> 115 %
function printPhoto(comp, rel, cx, cy, maxW, maxH, rot, t0) {
  var it = imp(rel); if (!it) return null;
  var s = Math.min(maxW / it.width, maxH / it.height), w = Math.round(it.width * s), h = Math.round(it.height * s);
  var c = mkComp("Abzug " + rel.replace(/.*\//, ""), w, h, comp.duration, fPre);
  var ph = addItem(c, it, w / 2, h / 2, s * 100 * 1.04);
  homogenize(ph, c);
  NOANIM = true; keys(ph.scale, [0, comp.duration], [[s * 104, s * 104], [s * 112, s * 112]], 30); NOANIM = false;   // langsame Fahrt durch den Schnitt ist gewollt
  var fr = shape(comp, "Rahmen " + rel), g = grp(fr); rectG(g, w + 36, h + 36, 0, 0); fill(g, "#FBF8F1");
  fr.position.setValue([cx, cy]);
  var ds = addFx(fr, "ADBE Drop Shadow"); if (ds) { setP(ds, ["Opacity"], 110); setP(ds, ["Distance"], 16); setP(ds, ["Softness"], 34); }
  var L = addItem(comp, c, cx, cy, 100);
  L.parent = fr; L.position.setValue([0, 0]);
  fr.rotation.setValue(rot || 0);
  if (t0 !== undefined && t0 > 0) { keys(fr.scale, [t0, t0 + 0.32], [[112, 112], [100, 100]], [[10, 10], [85, 85]]); fr.inPoint = t0; L.inPoint = t0; }
  return fr;
}

// ---------- Saeule 8: Seite umblaettern / Brand-Reveal ----------
function pageTurn(layer, t0, dur, w, h) {
  var e = addFx(layer, "CC Page Turn", "Seite umblaettern");
  if (!e) return null;
  setP(e, ["Fold Radius"], 50); setP(e, ["Back Opacity"], 85);
  var bp = findP(e, ["Back Page"]); if (bp) { try { bp.setValue(layer.index); } catch (x) {} }
  var fp = findP(e, ["Fold Position"]);
  if (fp) keys(fp, [t0, t0 + (dur || 0.7)], [[w + 40, h + 40], [-w * 1.7, -h * 1.1]], [[20, 20], [70, 70]]);
  var pt = addFx(layer, "ADBE Posterize Time"); if (pt) setP(pt, ["Frame Rate"], 8);
  return e;
}
// Saubere Tusche-Blende (Runde 2, statt burnReveal auf Karten: CC Burn Film liess graue Flecken/Fetzen stehen)
function inkReveal(layer, t0, dur, angle) {
  var e = addFx(layer, "ADBE Linear Wipe", "Tusche-Blende");
  if (!e) return null;
  setP(e, ["Wipe Angle"], angle === undefined ? 200 : angle); setP(e, ["Feather"], 180);
  var c = findP(e, ["Transition Completion"]); if (c) keys(c, [t0, t0 + (dur || 0.35)], [100, 0], [[20, 20], [80, 80]]);
  return e;
}
function burnReveal(layer, t0) {
  var e = addFx(layer, "CC Burn Film", "Brand-Reveal");
  if (!e) return null;
  setP(e, ["Random Seed"], 180);
  var b = findP(e, ["Burn"]); if (b) keys(b, [t0, t0 + 0.5, t0 + 1.1], [100, 45, 0], 50);
  return e;
}

// ---------- Saeule 9: Typografie ----------
function txt(comp, s, font, size, color, pos, just, tracking) {
  var l = comp.layers.addText(s);
  var p = l.property("ADBE Text Properties").property("ADBE Text Document"), d = p.value;
  d.resetCharStyle(); d.font = font; d.fontSize = size; d.applyFill = true; d.fillColor = rgb(color); d.applyStroke = false;
  d.justification = just || ParagraphJustification.CENTER_JUSTIFY; d.tracking = tracking || 0;
  p.setValue(d); l.position.setValue(pos);
  return l;
}
function txtStroke(l, color, w) {
  var p = l.property("ADBE Text Properties").property("ADBE Text Document"), d = p.value;
  d.applyStroke = true; d.strokeColor = rgb(color); d.strokeWidth = w; d.strokeOverFill = false; p.setValue(d);
}
function typeOn(l, t, cps) {
  var n = 10; try { n = l.property("ADBE Text Properties").property("ADBE Text Document").value.text.length; } catch (e) {}
  noteAnim(null, t + n / (cps || 28), l);
  l.property("ADBE Text Properties").property("ADBE Text Document").expression =
    "var s = value; var n = Math.max(0, Math.floor((time - " + t + ") * " + (cps || 28) + ")); n < s.length ? s.substr(0, n) : s;";
}
// Odometer: Ziffern rollen ein (Range Selector Offset -100 -> 0 %, Position y)
function odometer(comp, s, font, size, color, pos, t0, dur) {
  var l = txt(comp, s, font, size, color, pos);
  var an = l.property("ADBE Text Properties").property("ADBE Text Animators").addProperty("ADBE Text Animator");
  an.name = "Odometer";
  var pp = an.property("ADBE Text Animator Properties").addProperty("ADBE Text Position 3D");
  pp.setValue([0, size * 1.2, 0]);
  var op = an.property("ADBE Text Animator Properties").addProperty("ADBE Text Opacity"); op.setValue(0);
  var sel = an.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
  var off = sel.property("ADBE Text Percent Offset");
  keys(off, [t0, t0 + (dur || 0.8)], [0, 100], [[10, 10], [85, 85]]);
  // Maske, damit die Ziffern aus einem "Fenster" rollen
  var m = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  var rc = l.sourceRectAtTime(t0 + (dur || 0.8) + 0.1, false);
  m.property("ADBE Mask Shape").setValue(mkShape(rectP(rc.width + 60, rc.height + 30, rc.left + rc.width / 2, rc.top + rc.height / 2)));
  return l;
}
// Zaehler (Zahl laeuft hoch)
function counter(comp, from, to, t0, t1, font, size, color, pos, suffix) {
  var l = txt(comp, String(to) + (suffix || ""), font, size, color, pos);
  noteAnim(null, t1, l);
  l.property("ADBE Text Properties").property("ADBE Text Document").expression =
    "var v = Math.round(linear(time, " + t0 + ", " + t1 + ", " + from + ", " + to + ")); posterizeTime(12); String(v) + '" + (suffix || "") + "';";
  return l;
}
// Gelb-Pop: Woerter werden kurz gelb und blenden zu Anthrazit zurueck
function yellowPop(l, t) {
  var an = l.property("ADBE Text Properties").property("ADBE Text Animators").addProperty("ADBE Text Animator");
  an.name = "Gelb-Pop";
  var fc = an.property("ADBE Text Animator Properties").addProperty("ADBE Text Fill Color");
  keys(fc, [t, t + f2s(3), t + 0.7], [rgb(INK), rgb("#E8B100"), rgb("#2E2B27")], 60);
  an.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
}
// Text-Jitter (Buchstaben zittern 12x pro Sekunde)
function jitter(l, amt) {
  var an = l.property("ADBE Text Properties").property("ADBE Text Animators").addProperty("ADBE Text Animator");
  an.name = "Jitter";
  var pp = an.property("ADBE Text Animator Properties").addProperty("ADBE Text Position 3D");
  pp.expression = "posterizeTime(12); seedRandom(textIndex+123+Math.floor(time*12),true); [random(-" + amt + "," + amt + "), random(-" + amt + "," + amt + "), 0]";
  an.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
}
// roter Quellenbalken unten links (enno 11.11. erlaubt): weisse Versalien auf rotem Balken, 2 Zeilen
function sourceBar(comp, l1, l2, t0, y) {
  y = y || 1420;
  var a = txt(comp, l1.toUpperCase(), F_SANS_B, 40, "#FFFFFF", [96, y], ParagraphJustification.LEFT_JUSTIFY, 60);
  a.name = "FIX Quelle 1";
  var rc = a.sourceRectAtTime(t0 + 1, false);
  var bar = shape(comp, "FIX Quellenbalken"), g = grp(bar); rectG(g, rc.width + 44, 64, 0, 0); fill(g, RED);
  bar.position.setValue([96 + rc.left + rc.width / 2, y - 14]); bar.moveAfter(a);
  keys(bar.scale, [t0, t0 + f2s(6)], [[0, 100], [100, 100]], [[10, 10], [85, 85]]);
  typeOn(a, t0 + f2s(3), 40);
  if (l2) {
    var b = txt(comp, l2.toUpperCase(), F_SANS_B, 30, "#FFFFFF", [96, y + 58], ParagraphJustification.LEFT_JUSTIFY, 60);
    b.name = "FIX Quelle 2";
    var rc2 = b.sourceRectAtTime(t0 + 1.5, false);
    var bar2 = shape(comp, "FIX Quellenbalken 2"), g2 = grp(bar2); rectG(g2, rc2.width + 36, 48, 0, 0); fill(g2, "#1D1B18");
    bar2.position.setValue([96 + rc2.left + rc2.width / 2, y + 47]); bar2.moveAfter(b);
    keys(bar2.scale, [t0 + f2s(5), t0 + f2s(11)], [[0, 100], [100, 100]], [[10, 10], [85, 85]]);
    typeOn(b, t0 + f2s(8), 40);
  }
  return a;
}
// kleine Quellenangabe (Bildrechte) unten rechts (Runde 2: rechte Kante bei 1008 statt 1040, Schild endet vor x 1020)
var CREDIT_X = 1008;
function credit(comp, s) {
  if (!s) return null;
  var l = txt(comp, s, "ArialMT", 20, "#FFFFFF", [CREDIT_X, 1880], ParagraphJustification.RIGHT_JUSTIFY, 10);
  l.name = "FIX Bildquelle";
  var rc = l.sourceRectAtTime(0, false);
  var pl = shape(comp, "FIX Bildquelle Schild"), g = grp(pl); rectG(g, rc.width + 20, rc.height + 12, 0, 0, 4); fill(g, "#141210");
  pl.position.setValue([CREDIT_X + rc.left + rc.width / 2, 1880 + rc.top + rc.height / 2]); pl.opacity.setValue(55); pl.moveAfter(l);
  return l;
}
// Hand-Label (kursive Serif) mit Pfeil, Pfeil zeichnet sich
function label(comp, s, x, y, size, t0, color, arrowTo) {
  var l = txt(comp, s, F_SERIF_BI, size || 64, color || INK, [x, y]);
  typeOn(l, t0, 30);
  if (arrowTo) {
    var a = arrowTo, sx = x + (a[0] > x ? 40 : -40), sy = a[1] < y ? y - (size || 64) * 0.95 : y + 20;
    var mx = (sx + a[0]) / 2, my = Math.min(sy, a[1]) - 60;
    var p = { v: [[sx, sy], [a[0], a[1]]], i: [[0, 0], [mx - a[0], my - a[1]]], o: [[mx - sx, my - sy], [0, 0]], c: false };
    var ang = Math.atan2(a[1] - my, a[0] - mx), L = 28;
    var head = line2([[a[0] - L * Math.cos(ang - 0.5), a[1] - L * Math.sin(ang - 0.5)], [a[0], a[1]], [a[0] - L * Math.cos(ang + 0.5), a[1] - L * Math.sin(ang + 0.5)]]);
    pencil(comp, "Pfeil " + s, [p, head], color || INK, 5, t0 + 0.25, f2s(14));
  }
  return l;
}
function step(name, fn) {
  plog("-> " + name);
  try { fn(); log.push("OK " + name); }
  catch (e) { log.push("FEHLER " + name + ": " + e.toString() + " (Zeile " + e.line + ")"); plog("FEHLER " + name + ": " + e.toString() + " (Zeile " + e.line + ")"); }
}

// Text auf Hoechstbreite skalieren (gemessen am Endzustand)
function fitWidth(l, maxW, t) {
  var r = l.sourceRectAtTime(t, false);
  if (r.width > maxW) { var f = maxW / r.width * 100; l.scale.setValue([f, f]); }
  return l;
}
// Bewegung entlang einer Bezier-Kurve als Keys (12 fps, Hold) statt Ausdruck; u mit weichem Start/Ende
function pathKeys(prop, t0, t1, A, C, Bp, bob) {
  var n = Math.max(2, Math.round((t1 - t0) * 12));
  for (var i = 0; i <= n; i++) {
    var x = i / n, u = x * x * (3 - 2 * x), t = t0 + (t1 - t0) * x;
    var p = [(1 - u) * (1 - u) * A[0] + 2 * (1 - u) * u * C[0] + u * u * Bp[0], (1 - u) * (1 - u) * A[1] + 2 * (1 - u) * u * C[1] + u * u * Bp[1] + (bob ? -18 + Math.sin(t * 20) * 1.5 : 0)];
    hold(prop, t, p);
  }
  noteAnim(prop, t1);
}

// Rundes Kanal-Logo in der Ecke (ennos Regel ab 11.11.2026, Folgen und Shorts): ganz oben, ohne Sauce, leichter Schatten.
// Shorts: oben links (Mitte 98/196, 96 px). Folgen 16:9: unten links (Mitte 88/996, 84 px).
function cornerLogo(comp, rel, cx, cy, size, tIn, tOut) {
  var it = imp(rel); if (!it) return null;
  var l = comp.layers.add(it); l.name = "FIX Logo Ecke";
  l.scale.setValue([size / it.width * 100, size / it.height * 100]); l.position.setValue([cx, cy]); l.opacity.setValue(95);
  var ds = addFx(l, "ADBE Drop Shadow"); if (ds) { setP(ds, ["Opacity"], 70); setP(ds, ["Distance"], 4); setP(ds, ["Softness"], 14); }
  l.inPoint = tIn || 0; if (tOut) l.outPoint = tOut;
  l.moveToBeginning();
  return l;
}
