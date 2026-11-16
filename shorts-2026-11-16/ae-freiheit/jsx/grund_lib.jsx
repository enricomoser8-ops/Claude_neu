// ===================== Hintergrund-Vox-Bausteine (neu ab 16.11.2026, ersetzt Karte/Globus vom 13.11.) =====================
// Erwartet vox_lib.jsx + vox_plus.jsx davor und D.grund (gen/hintergrund_freiheit.py -> data/grund.json).
// Jede Szene liegt auf einem vollflaechigen Hintergrundfoto (Archiv, LOC): langsame Fahrt (Ken Burns), Grading (dunkel, warm/Sepia)
// ist in die JPG eingebacken (keine Effekte auf dem Hintergrund = leicht fuer die Grafikkarte). Darueber: Regler-Abdunklung (Volltonebene),
// Untertitel-Verlauf (Gradient Ramp, multipliziert), Vignette (voxSauce). Vordergrund bleibt voller Vox-Stil.
var FCY = 960;
var COPPER = "#B8733A", VERD = "#4E9A84", NAVY = "#2E4C6D";
// helle Varianten fuer Schrift/Linien direkt auf dem dunklen Hintergrund
var CREAM = "#F4EBDD", LVERD = "#86D3B4", LCOPPER = "#E9A066", LBLAU = "#A9CBE6", LRED = "#E8473B";

function fxGet(layer, name) {   // Effekt nach dem Anlegen frisch holen (AE: aeltere Referenzen werden durch addProperty ungueltig)
  try { var fx = layer.property("ADBE Effect Parade"); return fx ? fx.property(name) : null; } catch (e) { return null; }
}
// weicher dunkler Schatten unter heller Schrift auf dem Foto (billig: ein Drop Shadow)
function schatten(l, op) {
  addFx(l, "ADBE Drop Shadow", "Lesbarkeit");
  var d = fxGet(l, "Lesbarkeit");
  if (d) { setP(d, ["Shadow Color"], [0, 0, 0]); setP(d, ["Opacity"], op || 190); setP(d, ["Direction"], 135); setP(d, ["Distance"], 3); setP(d, ["Softness"], 16); }
  return l;
}
function stellen(prop, T, V, infl) {   // konstant -> setValue, sonst Keys mit gemeinsamem Ease
  var same = true; for (var i = 1; i < V.length; i++) if (String(V[i]) !== String(V[0])) same = false;
  if (same) { prop.setValue(V[0]); return; }
  keys(prop, T, V, infl);
}
// ---------- Hintergrund einer Szene ----------
// opt.dunkel: Deckkraft der Regler-Abdunklung (Standard 12 %), opt.ut: Untertitel-Verlauf (Standard 50 %)
function grund(c, sid, opt) {
  opt = opt || {};
  var G = D.grund[sid], out = [];
  if (!G) { log.push("FEHLER Hintergrund fehlt: " + sid); return out; }
  var T = [], i, j;
  for (j = 0; j < G.keys.length; j++) T.push(G.keys[j].t);
  NOANIM = true;   // die Fahrt laeuft bewusst bis zum Schnitt
  for (i = 0; i < G.ebenen.length; i++) {
    var e = G.ebenen[i], it = imp(e.rel); if (!it) continue;
    var l = c.layers.add(it); l.name = "Grund Foto " + e.rel.replace(/.*\//, "");
    var A = [], P = [], S = [];
    for (j = 0; j < G.keys.length; j++) {
      var K = G.keys[j];
      A.push([(K.Q[0] - e.o[0]) * e.r, (K.Q[1] - e.o[1]) * e.r]); P.push([K.P[0], K.P[1]]); S.push([K.z / e.r * 100, K.z / e.r * 100]);
    }
    stellen(l.anchorPoint, T, A, G.infl); linPath(l.anchorPoint);
    stellen(l.position, T, P, G.infl); linPath(l.position);
    stellen(l.scale, T, S, G.infl);
    if (e.tin > 0) {
      l.inPoint = e.tin;
      if (e.fade > 0) keys(l.opacity, [e.tin, e.tin + e.fade], [0, 100], 40);
    }
    if (e.tout !== null && e.tout !== undefined) l.outPoint = e.tout;
    out.push(l);
  }
  NOANIM = false;
  var dk = solid(c, "Grund Abdunklung (Regler)", "#000000"); dk.opacity.setValue(opt.dunkel === undefined ? 12 : opt.dunkel);
  subShade(c, opt.ut || 50);
  return out;
}
// Untertitel-Verlauf: von y 1120 (weiss = nichts) nach y 1720 dunkel, multipliziert (Gradient Ramp ist billig)
function subShade(c, op, tIn) {
  var l = solid(c, "FIX UT-Schatten", "#FFFFFF");
  addFx(l, "ADBE Ramp", "UT Verlauf");
  var r = fxGet(l, "UT Verlauf");
  if (r) {
    setP(r, ["Ramp Shape"], 1);
    setP(r, ["Start of Ramp"], [c.width / 2, 1120]); setP(r, ["Start Color"], [1, 1, 1]);
    setP(r, ["End of Ramp"], [c.width / 2, 1720]); setP(r, ["End Color"], rgb("#2A241E"));
  }
  l.blendingMode = BlendingMode.MULTIPLY; l.opacity.setValue(op || 50);
  if (tIn) l.inPoint = tIn;
  return l;
}
// Stecknadel auf einem Punkt des Hintergrunds (D.grund[sid].pin[name] = Bildschirmpunkt; dort steht das Foto still)
function gPin(c, sid, name, t0, color) {
  var w = D.grund[sid].pin[name];
  var p = shape(c, "Grund Nadel " + name);
  var gn = grp(p, "Nadel"); addPath(gn, line2([[0, 0], [10, -78]])); stroke(gn, "#D9D2C4", 6);
  var gh = grp(p, "Kopf"); ellipseG(gh, 42, 42, 12, -92); fill(gh, color || RED); stroke(gh, CREAM, 3);
  var gg = grp(p, "Glanz"); ellipseG(gg, 11, 11, 5, -99); fill(gg, "#FFFFFF", 85);
  p.position.setValue(w);
  addFx(p, "ADBE Drop Shadow", "Nadel Schatten");
  var ds = fxGet(p, "Nadel Schatten"); if (ds) { setP(ds, ["Opacity"], 150); setP(ds, ["Distance"], 6); setP(ds, ["Softness"], 10); }
  if (t0 !== null && t0 !== undefined) {
    keys(p.scale, [t0, t0 + f2s(4), t0 + f2s(8)], [[0, 0], [112, 112], [100, 100]], [[10, 10], [60, 60], [80, 80]]);
    p.inPoint = t0;
    var r = shape(c, "Grund Einschlag " + name), gr = grp(r); ellipseG(gr, 10, 10, 0, 0); stroke(gr, color || RED, 5);
    r.position.setValue(w);
    var el = r.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group").property("ADBE Vector Shape - Ellipse").property("ADBE Vector Ellipse Size");
    keys(el, [t0 + f2s(3), t0 + f2s(14)], [[10, 6], [150, 56]], [[5, 5], [80, 80]]);
    keys(r.opacity, [t0 + f2s(3), t0 + f2s(14)], [100, 0], 40);
    r.inPoint = t0 + f2s(3);
  }
  return p;
}
// Faden (gestrichelt) vom Abzug zu einem Bildschirmpunkt, zeichnet sich
function faden(c, a, b, t0, color) {
  var l = shape(c, "Strich Faden"), g = grp(l, "Faden");
  var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
  var cxp = mx - dy * 0.12, cyp = my + dx * 0.12;
  addPath(g, { v: [a, b], i: [[0, 0], [(cxp - b[0]) * 0.6, (cyp - b[1]) * 0.6]], o: [[(cxp - a[0]) * 0.6, (cyp - a[1]) * 0.6], [0, 0]], c: false });
  stroke(g, color || CREAM, 3.5, 9, 7);
  if (t0 !== undefined && t0 !== null) { trimOn(g, t0, t0 + f2s(8)); l.inPoint = t0; }
  return l;
}
// Route als Vox-Pfeil (Bildschirm): gestrichelter Bogen a -> b mit Spitze, zeichnet sich t0 -> t1
function routePfeil(c, a, b, bend, t0, t1, color) {
  var l = shape(c, "Route Pfeil"), g = grp(l, "Route");
  var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
  var px = mx + dy * bend, py = my - dx * bend;
  addPath(g, { v: [a, b], i: [[0, 0], [(px - b[0]) * 0.66, (py - b[1]) * 0.66]], o: [[(px - a[0]) * 0.66, (py - a[1]) * 0.66], [0, 0]], c: false });
  stroke(g, color || RED, 7, 18, 12);
  keys(g.addProperty("ADBE Vector Filter - Trim").property("ADBE Vector Trim End"), [t0, t1], [0, 100], [[30, 30], [70, 70]]);
  l.inPoint = t0;
  var ang = Math.atan2(b[1] - py, b[0] - px), hd = shape(c, "Route Spitze"), gh = grp(hd, "Spitze");
  addPath(gh, line2([[-28 * Math.cos(ang - 0.45), -28 * Math.sin(ang - 0.45)], [0, 0], [-28 * Math.cos(ang + 0.45), -28 * Math.sin(ang + 0.45)]]));
  stroke(gh, color || RED, 7);
  hd.position.setValue(b);
  keys(hd.scale, [t1 - f2s(2), t1 + f2s(3)], [[0, 0], [100, 100]], [[10, 10], [80, 80]]); hd.inPoint = t1 - f2s(2);
  return l;
}
// Groesse eines Abzugs wie printPhoto ihn legt (ohne Rahmen)
function abzugMass(rel, maxW, maxH) {
  var it = imp(rel); if (!it) return [maxW, maxH, 1];
  var s = Math.min(maxW / it.width, maxH / it.height); return [Math.round(it.width * s), Math.round(it.height * s), s];
}
// Bildschirm-Rahmen einer (noch nicht verelterten) Ebene zur Zeit t: [x0, y0, x1, y1]
function rahmen(l, t) {
  var r = l.sourceRectAtTime(t, false), p = l.position.valueAtTime(t, false), a = l.anchorPoint.valueAtTime(t, false), s = l.scale.valueAtTime(t, false);
  return [p[0] + (r.left - a[0]) * s[0] / 100, p[1] + (r.top - a[1]) * s[1] / 100, p[0] + (r.left + r.width - a[0]) * s[0] / 100, p[1] + (r.top + r.height - a[1]) * s[1] / 100];
}
// Freisteller: sichtbarer Bereich (Alpha-Rahmen aus gen, sonst ganzes Bild)
function bildRahmen(l, rel) {
  var it = imp(rel), b = (D.alpha && D.alpha[rel.replace(/.*\//, "")]) || [0, 0, it.width, it.height];
  var p = l.position.value, s = l.scale.value[0] / 100;
  return [p[0] + (b[0] - it.width / 2) * s, p[1] + (b[1] - it.height / 2) * s, p[0] + (b[2] - it.width / 2) * s, p[1] + (b[3] - it.height / 2) * s];
}
// roter Durchstreich-Strich: laeuft durch die vertikale Mitte des Ziels, von Kante zu Kante (+ Ueberstand), zeichnet sich
function durchstreichen(c, ziel, zielName, t0, color, width, tRef) {
  var b = rahmen(ziel, tRef), yc = (b[1] + b[3]) / 2, ov = 26;
  var l = pencil(c, "Strich durch " + zielName, [line2([[b[0] - ov, yc + 3], [(b[0] + b[2]) / 2, yc - 2], [b[2] + ov, yc - 3]])], color || LRED, width || 10, t0, f2s(8));
  l.comment = "ZIEL:" + zielName + "|strich";
  return l;
}
// rotes Kreuz ueber ein Ziel (Rahmen [x0,y0,x1,y1]), mit Ueberstand, zeichnet sich
function kreuz(c, b, zielName, t0, color, width) {
  var ox = (b[2] - b[0]) * 0.05, oy = (b[3] - b[1]) * 0.05;
  var l = pencil(c, "Kreuz " + zielName, [line2([[b[0] - ox, b[1] - oy], [b[2] + ox, b[3] + oy]]), line2([[b[2] + ox, b[1] - oy], [b[0] - ox, b[3] + oy]])], color || LRED, width || 16, t0, f2s(7));
  l.comment = "ZIEL:" + zielName + "|kreuz";
  return l;
}

// ---------- Etikett (Chip): runde Flaeche + Text, springt auf ----------
function chip(c, s, x, y, bg, fg, size, t0, font) {
  size = size || 44;
  var t = txt(c, s, font || F_SANS_B, size, fg || "#FFFFFF", [x, y], ParagraphJustification.CENTER_JUSTIFY, 40);
  t.name = "Etikett " + s;
  var rc = t.sourceRectAtTime(0, false);
  var r = shape(c, "Etikett Flaeche " + s), g = grp(r, "Flaeche");
  rectG(g, rc.width + size * 0.9, size * 1.45, 0, 0, size * 0.36); fill(g, bg || INK);
  r.position.setValue([x + rc.left + rc.width / 2, y + rc.top + rc.height / 2]);
  addFx(r, "ADBE Drop Shadow", "Etikett Schatten");
  var ds = fxGet(r, "Etikett Schatten"); if (ds) { setP(ds, ["Opacity"], 120); setP(ds, ["Distance"], 6); setP(ds, ["Softness"], 16); }
  r.moveAfter(t);
  attach(t, r); t.position.setValue([-(rc.left + rc.width / 2), -(rc.top + rc.height / 2)]);
  if (t0 !== undefined && t0 !== null) popIn(r, t0, -4);
  return r;
}
// Element-Kachel "29 Cu Kupfer" (Periodensystem-Stil, saubere Formen)
function elementKachel(c, x, y, size, t0) {
  var r = shape(c, "Kachel Kupfer"), g = grp(r, "Kachel");
  rectG(g, size, size, 0, 0, size * 0.08); fill(g, COPPER); stroke(g, CREAM, 5);
  r.position.setValue([x, y]);
  addFx(r, "ADBE Drop Shadow", "Kachel Schatten");
  var ds = fxGet(r, "Kachel Schatten"); if (ds) { setP(ds, ["Opacity"], 120); setP(ds, ["Distance"], 12); setP(ds, ["Softness"], 26); }
  var a = txt(c, "Cu", F_SERIF_B, size * 0.46, "#FFFFFF", [0, 0]); a.name = "Kachel Cu"; attach(a, r); a.position.setValue([0, size * 0.12]);
  var n = txt(c, "29", F_SANS_B, size * 0.13, "#FFF3E6", [0, 0], ParagraphJustification.LEFT_JUSTIFY); n.name = "Kachel 29"; attach(n, r); n.position.setValue([-size * 0.40, -size * 0.30]);
  var k = txt(c, "Kupfer", F_SERIF_I, size * 0.13, "#FFF3E6", [0, 0]); k.name = "Kachel Kupfer Name"; attach(k, r); k.position.setValue([0, size * 0.38]);
  if (t0 !== undefined && t0 !== null) popIn(r, t0, -6);
  return r;
}
// rotes Stempel-Wort auf hellem Papierzettel (liest sich auf dem dunklen Foto), Stop-Motion-Slam
function stempel(c, s, x, y, rot, t0, size) {
  size = size || 70;
  var t = txt(c, s, F_BLACK, size, RED, [0, 0], ParagraphJustification.CENTER_JUSTIFY, 30); t.name = "Stempel " + s;
  var rc = t.sourceRectAtTime(0, false);
  var r = shape(c, "Stempel Rahmen " + s);
  var gp = grp(r, "Papier"); rectG(gp, rc.width + 86, rc.height + 76, 0, 0, 6); fill(gp, "#EFE4D0");
  var g = grp(r, "Rahmen"); rectG(g, rc.width + 50, rc.height + 40, 0, 0, 10); stroke(g, RED, 7);
  r.position.setValue([x, y]); r.rotation.setValue(rot || 0);
  addFx(r, "ADBE Drop Shadow", "Zettel Schatten");
  var ds = fxGet(r, "Zettel Schatten"); if (ds) { setP(ds, ["Opacity"], 130); setP(ds, ["Distance"], 10); setP(ds, ["Softness"], 22); }
  attach(t, r); t.position.setValue([-(rc.left + rc.width / 2), -(rc.top + rc.height / 2)]); t.rotation.setValue(0);
  slam(r, t0); setIn(r, t0);
  return r;
}
// Freisteller mit Farbe (KI-Bild: Gegenstand) - wie cutout(), aber in Farbe und mit Schatten
function farbFrei(c, rel, x, y, h, name) { return cutout(c, rel, x, y, h, name, false); }
// "KI-Rekonstruktion"-Leiste: verdeckt die Schnittkante unten am Statuen-Freisteller und kennzeichnet das KI-Bild
function rekoLeiste(c, x, y, w, t0) {
  var r = shape(c, "Leiste Rekonstruktion"), g = grp(r, "Leiste"); rectG(g, w, 54, 0, 0, 4); fill(g, "#15110D"); stroke(g, "#B9A88F", 2);
  r.position.setValue([x, y]);
  var t = txt(c, "KI-REKONSTRUKTION", F_SANS_B, 26, "#F3E6D3", [0, 0], ParagraphJustification.CENTER_JUSTIFY, 120); t.name = "Leiste Text";
  attach(t, r); t.position.setValue([0, 9]);
  if (t0 !== undefined && t0 !== null) setIn(r, t0);
  return r;
}
// Leiste "KI-REKONSTRUKTION" ganz nach oben (ueber jede Statue; Fix 13.11.: gruene Statue lag darueber)
function leisteNachOben(c) {
  var L = [], T = [];
  for (var i = 1; i <= c.numLayers; i++) { var n = c.layer(i).name; if (n === "Leiste Rekonstruktion") L.push(c.layer(i)); if (n === "Leiste Text") T.push(c.layer(i)); }
  for (var a = 0; a < L.length; a++) L[a].moveToBeginning();
  for (var b = 0; b < T.length; b++) T[b].moveToBeginning();   // Text ueber seiner Leiste
}
