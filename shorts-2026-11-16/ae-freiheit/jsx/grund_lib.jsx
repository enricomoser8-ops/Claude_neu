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

// ===================== Runde 2 (16.11., enno: "zu viele Bilder, zu wenig Vox"): Vox-Geraete, die auf das Hintergrundfoto wirken =====================
// Das Hintergrundfoto ist DAS Bild der Szene. Alles, was auf einen Punkt im Foto zeigt (Kreise, Pfeile, Kontrast-Callout, Farbsweep,
// Textmarker auf der Zeitungsseite, Messlinie), haengt an der Null "Grund Anker": gleiche Keys/Ease wie die Fahrt des Fotos
// (Anker = Quellpunkt Q, Position = P, Skalierung = z * 100). Kinder liegen in QUELL-PIXELN und kleben exakt am Foto.
// Werte aus vox-chrismoran/00-vox-handbuch.md: Callout harter Schnitt ohne Blende, Maske weich gefedert; Highlighter Stroke 25-34,
// Multiply, Trim ohne starkes Easing, Zeilen gestaffelt; Focal Blur = Fast Box Blur 6 mit invertierter, weicher Ellipsenmaske
// (Saeule 6 "Randunschaerfe"); Focus Hunting Box Blur 0/4/2/0; Page Turn Fold Radius 50, Back Opacity 85, Posterize 8;
// Burn Film Random Seed 180; Punch-Cut 7 Frames vor / 21 Frames nach dem Schnitt, Speed-Spitze auf dem Schnitt.
// Jedes Geraet traegt im Ebenen-Kommentar "VOX:<art>" (Hauptgeraet der Szene zusaetzlich "|HAUPT"); der Probelauf prueft das (VOX).
function voxTag(l, art, haupt) { if (!l) return l; var alt = String(l.comment || "").replace(/;?VOX:[^;]*/g, ""); l.comment = (alt ? alt + ";" : "") + "VOX:" + art + (haupt ? "|HAUPT" : ""); return l; }
// Zustand der Fahrt zur Zeit t (wie AE: gleiche Key-Zeiten und Einfluesse fuer Anker, Position, Skalierung)
function gZust(sid, t) {
  var G = D.grund[sid], T = [], qx = [], qy = [], px = [], py = [], zz = [];
  for (var j = 0; j < G.keys.length; j++) { var K = G.keys[j]; T.push(K.t); qx.push(K.Q[0]); qy.push(K.Q[1]); px.push(K.P[0]); py.push(K.P[1]); zz.push(K.z); }
  if (T.length === 1) return { Q: [qx[0], qy[0]], P: [px[0], py[0]], z: zz[0] };
  var inf = G.infl;
  return { Q: [keyAt(T, qx, inf, t), keyAt(T, qy, inf, t)], P: [keyAt(T, px, inf, t), keyAt(T, py, inf, t)], z: keyAt(T, zz, inf, t) };
}
// Bildschirmpunkt (zur Zeit tr) -> Quellpixel, und zurueck
function gQ(sid, s, tr) { var Z = gZust(sid, tr); return [Z.Q[0] + (s[0] - Z.P[0]) / Z.z, Z.Q[1] + (s[1] - Z.P[1]) / Z.z]; }
function gS(sid, q, t) { var Z = gZust(sid, t); return [Z.P[0] + (q[0] - Z.Q[0]) * Z.z, Z.P[1] + (q[1] - Z.Q[1]) * Z.z]; }
function gQs(sid, pts, tr) { var o = []; for (var i = 0; i < pts.length; i++) o.push(gQ(sid, pts[i], tr)); return o; }
// Null, die sich wie das Hintergrundfoto bewegt (eine je Szene)
function gAnker(c, sid) {
  for (var i = 1; i <= c.numLayers; i++) if (c.layer(i).name === "Grund Anker") return c.layer(i);
  var G = D.grund[sid], n = c.layers.addNull(c.duration); n.name = "Grund Anker";
  var T = [], A = [], P = [], S = [];
  for (var j = 0; j < G.keys.length; j++) { var K = G.keys[j]; T.push(K.t); A.push([K.Q[0], K.Q[1]]); P.push([K.P[0], K.P[1]]); S.push([K.z * 100, K.z * 100]); }
  NOANIM = true;
  stellen(n.anchorPoint, T, A, G.infl); linPath(n.anchorPoint);
  stellen(n.position, T, P, G.infl); linPath(n.position);
  stellen(n.scale, T, S, G.infl);
  NOANIM = false;
  return n;
}
function anHaengen(c, sid, l) { attach(l, gAnker(c, sid)); l.position.setValue([0, 0]); l.anchorPoint.setValue([0, 0]); l.scale.setValue([100, 100]); l.rotation.setValue(0); return l; }
// Polygon / Ellipse (Bildschirm zur Zeit tr) als Pfad in Quellpixeln
function gPoly(sid, pts, tr) { return line2(gQs(sid, pts, tr), true); }
function gEll(sid, cx, cy, rx, ry, tr) { var q = gQ(sid, [cx, cy], tr), z = gZust(sid, tr).z; return ellP(q[0], q[1], rx / z, ry / z); }
// Flaeche in Quellpixeln (am Anker), Formebene (vektoriell = billig, keine Riesen-Solids), deckt das ganze Bild in jedem Key (+ Rand)
function gFlaeche(c, sid, name, color) {
  var G = D.grund[sid], x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (var j = 0; j < G.keys.length; j++) {
    var K = G.keys[j], m = 200 / K.z;
    x0 = Math.min(x0, K.Q[0] - K.P[0] / K.z - m); x1 = Math.max(x1, K.Q[0] + (W - K.P[0]) / K.z + m);
    y0 = Math.min(y0, K.Q[1] - K.P[1] / K.z - m); y1 = Math.max(y1, K.Q[1] + (H - K.P[1]) / K.z + m);
  }
  var l = shape(c, name), g = grp(l, "Flaeche"); addPath(g, line2([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], true)); fill(g, color);
  anHaengen(c, sid, l);
  l.gOff = [0, 0];
  return l;
}
function maskeQ(l, p, feather, inv, mode) {   // Maske in Quellpixeln auf einer gFlaeche
  var m = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  m.property("ADBE Mask Shape").setValue(mkShape(p, -l.gOff[0], -l.gOff[1]));
  if (feather) m.property("ADBE Mask Feather").setValue([feather, feather]);
  if (inv) m.inverted = true;
  if (mode) { try { m.maskMode = mode; } catch (e) {} }
  return m;
}
// 1 Kontrast-Callout: alles ausser dem Ziel wird dunkel (harter Schnitt, keine Blende), Maske klebt am Foto
//   ziel: {ell: [cx, cy, rx, ry]} oder {poly: [[x, y], ...]} in Bildschirm-px zur Zeit tr
function spot(c, sid, name, ziel, tr, t0, t1, op, haupt) {
  var z = gZust(sid, tr).z;
  var l = gFlaeche(c, sid, "FIX Callout " + name, "#000000");
  maskeQ(l, ziel.ell ? gEll(sid, ziel.ell[0], ziel.ell[1], ziel.ell[2], ziel.ell[3], tr) : gPoly(sid, ziel.poly, tr), (ziel.feder || 70) / z, true);
  l.opacity.setValue(op || 58);
  l.inPoint = t0; if (t1) l.outPoint = t1;
  return voxTag(l, "callout", haupt);
}
// 2 Farb-Sweep: Farbflaeche im Mischmodus "Farbe" ueber einem Teil des echten Fotos (z. B. Statue kupferbraun / gruen).
//   wisch: null (steht sofort) oder {t0, t1, von: "unten"|"oben"|"links", weg: true (Farbe zieht sich zurueck)}
function farbSweep(c, sid, name, color, ziel, tr, t0, wisch, op, haupt) {
  var z = gZust(sid, tr).z;
  var l = gFlaeche(c, sid, "Farbe " + name, color);
  l.blendingMode = BlendingMode.COLOR; l.opacity.setValue(op || 72);
  if (ziel) maskeQ(l, ziel.poly ? gPoly(sid, ziel.poly, tr) : gEll(sid, ziel.ell[0], ziel.ell[1], ziel.ell[2], ziel.ell[3], tr), (ziel.feder || 24) / z, false);
  if (ziel && ziel.halb) {   // nur eine Haelfte (x < oder > halb.x auf dem Bildschirm)
    var hx = ziel.halb.x, rp = ziel.halb.seite === "links" ? [[-400, -400], [hx, -400], [hx, 2400], [-400, 2400]] : [[hx, -400], [1500, -400], [1500, 2400], [hx, 2400]];
    maskeQ(l, gPoly(sid, rp, tr), 2 / z, false, MaskMode.INTERSECT);
  }
  if (wisch) {   // Wisch-Maske (Bildschirm zur Zeit tr, Kante weich): art "rein-oben" = Farbe waechst von oben, "weg-oben" = Farbe zieht sich nach oben zurueck
    var Y0 = -300, Y1 = 2200, voll = [[-400, Y0], [1500, Y0], [1500, Y1], [-400, Y1]], null0 = [[-400, Y0], [1500, Y0], [1500, Y0], [-400, Y0]];
    var a = wisch.art === "weg-oben" ? voll : null0, b = wisch.art === "weg-oben" ? null0 : voll;
    var mw = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
    try { mw.maskMode = MaskMode.INTERSECT; } catch (e) {}
    mw.property("ADBE Mask Feather").setValue([0, 160 / z]);
    keys(mw.property("ADBE Mask Shape"), [wisch.t0, wisch.t1], [mkShape(gPoly(sid, a, tr)), mkShape(gPoly(sid, b, tr))], [[20, 20], [70, 70]]);
    noteAnim(null, wisch.t1, l);
  }
  l.inPoint = t0;
  return voxTag(l, "farbsweep", haupt);
}
// 3 Bleistift am Foto: Kreis/Ellipse oder Linienzug, zeichnet sich (Trim 0 -> 100), Strich in Bildschirm-px
function gKreis(c, sid, name, ell, tr, t0, color, w, dur, haupt) {
  var z = gZust(sid, tr).z;
  var l = pencil(c, "Kreis " + name, [gEll(sid, ell[0], ell[1], ell[2], ell[3], tr)], color || LRED, (w || 8) / z, t0, dur || f2s(9));
  anHaengen(c, sid, l); l.inPoint = t0;
  return voxTag(l, "kreis", haupt);
}
function gStrich(c, sid, name, linien, tr, t0, color, w, dur, haupt) {
  var z = gZust(sid, tr).z, P = [];
  for (var i = 0; i < linien.length; i++) P.push(line2(gQs(sid, linien[i], tr)));
  var l = pencil(c, "Strich " + name, P, color || CREAM, (w || 6) / z, t0, dur || f2s(10));
  anHaengen(c, sid, l); l.inPoint = t0;
  return voxTag(l, "strich", haupt);
}
// Pfeil von einem Label (Bildschirm) auf einen Punkt im Foto; klebt am Foto
function gPfeil(c, sid, name, von, ziel, tr, t0, color, w) {
  var z = gZust(sid, tr).z, a = gQ(sid, von, tr), b = gQ(sid, ziel, tr);
  var mx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]) - 30 / z;
  var p = { v: [a, b], i: [[0, 0], [mx - b[0], my - b[1]]], o: [[mx - a[0], my - a[1]], [0, 0]], c: false };
  var ang = Math.atan2(b[1] - my, b[0] - mx), L = 26 / z;
  var head = line2([[b[0] - L * Math.cos(ang - 0.5), b[1] - L * Math.sin(ang - 0.5)], b, [b[0] - L * Math.cos(ang + 0.5), b[1] - L * Math.sin(ang + 0.5)]]);
  var l = pencil(c, "Pfeil " + name, [p, head], color || CREAM, (w || 5) / z, t0, f2s(8));
  anHaengen(c, sid, l); l.inPoint = t0;
  return voxTag(l, "pfeil");
}
// Label (kursive Serif, getippt) + Pfeil auf einen Punkt im Foto
function gLabel(c, sid, s, x, y, size, ziel, tr, t0, color) {
  var l = txt(c, s, F_SERIF_BI, size || 60, color || CREAM, [x, y]); l.name = "Label " + s; schatten(l);
  typeOn(l, t0, 32); l.inPoint = t0;
  if (ziel) {
    var sx = x + (ziel[0] > x ? 40 : -40), sy = ziel[1] < y ? y - (size || 60) * 0.95 : y + 18;
    gPfeil(c, sid, s, [sx, sy], ziel, tr, t0 + 0.08, color);
  }
  return l;
}
// 4 Lupe: echter Ausschnitt (archiv/lupe-<sid>.jpg, volle Aufloesung) waechst ueber dem Punkt im Foto auf und vergroessert ihn
function gLupe(c, sid, t0, haupt) {
  var L = D.grund[sid].lupe, it = imp(L.rel); if (!it) return null;
  var Z = gZust(sid, t0), S = gS(sid, L.D, t0), z = Z.z, m = L.m, R = L.R;
  var l = c.layers.add(it); l.name = "Grund Lupe " + sid;
  l.anchorPoint.setValue([L.D[0] - L.o[0], L.D[1] - L.o[1]]); l.position.setValue(S);
  keys(l.scale, [t0, t0 + f2s(9)], [[z * 100, z * 100], [z * m * 100, z * m * 100]], [[10, 10], [85, 85]]);
  var mk = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  mk.property("ADBE Mask Shape").setValue(mkShape(circPath(L.D[0] - L.o[0], L.D[1] - L.o[1], R / (z * m))));
  mk.property("ADBE Mask Feather").setValue([1.5, 1.5]);
  l.inPoint = t0;
  var rg = shape(c, "Lupe Rand"), g1 = grp(rg, "Schatten"); ellipseG(g1, 2 * R + 10, 2 * R + 10, 0, 0); stroke(g1, "#000000", 16);
  var g2 = grp(rg, "Rand"); ellipseG(g2, 2 * R, 2 * R, 0, 0); stroke(g2, CREAM, 8);
  var g3 = grp(rg, "Griff"); addPath(g3, line2([[R * 0.72, R * 0.72], [R * 1.18, R * 1.18]])); stroke(g3, CREAM, 18);
  rg.position.setValue(S);
  keys(rg.scale, [t0, t0 + f2s(9)], [[100 / m, 100 / m], [100, 100]], [[10, 10], [85, 85]]);
  rg.inPoint = t0;
  voxTag(l, "lupe", haupt);
  return { lupe: l, rand: rg, mitte: S, R: R };
}
// 5 Fokus: Fast Box Blur 6 (Iterationen 2) auf dem Rest, scharfe weiche Ellipse wandert A -> B (Saeule 4/6; kleiner Radius = billig)
function gFokus(c, t0, t1, a, b, rx, ry, haupt) {
  var ad = adj(c, "FIX Fokus-Unschaerfe");
  var bb = addFx(ad, "ADBE Box Blur2", "Fokus Blur");
  if (bb) {
    setP(bb, ["Iterations"], 2); setP(bb, ["Repeat Edge Pixels"], 1);
    var r = findP(bb, ["Blur Radius"]);
    if (r) keys(r, [t0, t0 + f2s(4), t1 - f2s(4), t1], [0, 6, 6, 0], 50);
  }
  var m = ad.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  m.inverted = true; m.property("ADBE Mask Feather").setValue([260, 260]);
  if (b) keys(m.property("ADBE Mask Shape"), [t0, Math.min(t1 - f2s(6), t0 + 1.0)], [mkShape(ellP(a[0], a[1], rx, ry)), mkShape(ellP(b[0], b[1], rx, ry))], [[15, 15], [95, 95]]);
  else m.property("ADBE Mask Shape").setValue(mkShape(ellP(a[0], a[1], rx, ry)));
  ad.inPoint = t0; ad.outPoint = t1 + f2s(1);
  return voxTag(ad, "fokus", haupt);
}
// 6 Kopie des Hintergrundfotos (gleiche Fahrt), z. B. fuer Parallax-Teil oder Seite umblaettern
function grundKopie(c, sid, name, idx) {
  var G = D.grund[sid], e = G.ebenen[idx === undefined ? G.ebenen.length - 1 : idx], it = imp(e.rel); if (!it) return null;
  var l = c.layers.add(it); l.name = "Grund " + name;
  var T = [], A = [], P = [], S = [];
  for (var j = 0; j < G.keys.length; j++) { var K = G.keys[j]; T.push(K.t); A.push([(K.Q[0] - e.o[0]) * e.r, (K.Q[1] - e.o[1]) * e.r]); P.push([K.P[0], K.P[1]]); S.push([K.z / e.r * 100, K.z / e.r * 100]); }
  NOANIM = true;
  stellen(l.anchorPoint, T, A, G.infl); linPath(l.anchorPoint); stellen(l.position, T, P, G.infl); linPath(l.position); stellen(l.scale, T, S, G.infl);
  NOANIM = false;
  l.gE = e;
  return l;
}
function maskeBild(l, pQ, feather, inv) {   // Maske in Quellpixeln auf einer Grund-Kopie (Ebenenpixel = (Q - o) * r)
  var e = l.gE, v = [], ii = [], oo = [];
  for (var k = 0; k < pQ.v.length; k++) { v.push([(pQ.v[k][0] - e.o[0]) * e.r, (pQ.v[k][1] - e.o[1]) * e.r]); ii.push([pQ.i[k][0] * e.r, pQ.i[k][1] * e.r]); oo.push([pQ.o[k][0] * e.r, pQ.o[k][1] * e.r]); }
  var m = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  m.property("ADBE Mask Shape").setValue(mkShape({ v: v, i: ii, o: oo, c: true }));
  if (feather) m.property("ADBE Mask Feather").setValue([feather, feather]);
  if (inv) m.inverted = true;
  return m;
}
// Parallax-Split: das Motiv (Maske) loest sich als eigene Ebene und waechst schneller als der Rest (Tiefe ohne 3D)
function gParallax(c, sid, poly, tr, pivot, s1, haupt) {
  var l = grundKopie(c, sid, "Parallax Motiv"); if (!l) return null;
  maskeBild(l, gPoly(sid, poly, tr), 3);
  var n = c.layers.addNull(c.duration); n.name = "Grund Parallax Null";
  n.anchorPoint.setValue(pivot); n.position.setValue(pivot);
  NOANIM = true; keys(n.scale, [0, c.duration], [[100, 100], [s1 * 100, s1 * 100]], [[30, 30], [60, 60]]); NOANIM = false;
  attach(l, n);
  addFx(l, "ADBE Drop Shadow", "Parallax Schatten");
  var ds = fxGet(l, "Parallax Schatten"); if (ds) { setP(ds, ["Opacity"], 120); setP(ds, ["Distance"], 10); setP(ds, ["Softness"], 30); }
  return voxTag(l, "parallax", haupt);
}
// Seite umblaettern: ein Stueck Foto (Rechteck) schaelt sich ab und gibt darunter etwas frei (CC Page Turn, Fold Radius 50, Back Opacity 85)
function gSchaelen(c, sid, rect, tr, t0, dur, haupt) {
  var l = grundKopie(c, sid, "Schale"); if (!l) return null;
  var q0 = gQ(sid, [rect[0], rect[1]], tr), q1 = gQ(sid, [rect[2], rect[3]], tr), e = l.gE;
  maskeBild(l, line2([q0, [q1[0], q0[1]], q1, [q0[0], q1[1]]], true), 0);
  var pt = addFx(l, "CC Page Turn", "Seite umblaettern");
  if (pt) {
    setP(pt, ["Fold Radius"], 50); setP(pt, ["Back Opacity"], 85);
    var bp = findP(pt, ["Back Page"]); if (bp) { try { bp.setValue(l.index); } catch (x) {} }
    var x1 = (q1[0] - e.o[0]) * e.r, y1 = (q1[1] - e.o[1]) * e.r, x0 = (q0[0] - e.o[0]) * e.r, y0 = (q0[1] - e.o[1]) * e.r;
    var fp = findP(pt, ["Fold Position"]);
    if (fp) keys(fp, [t0, t0 + dur], [[x1 + 10, y1 + 10], [x0 - (x1 - x0) * 0.9, y0 - (y1 - y0) * 0.9]], [[20, 20], [70, 70]]);
  }
  var pz = addFx(l, "ADBE Posterize Time", "Papier 8"); if (pz) setP(pz, ["Frame Rate"], 8);
  return voxTag(l, "seite", haupt);
}
// Brand-Uebergang: das Foto der vorigen Szene (Endbild) liegt obenauf und brennt weg (CC Burn Film 0 -> 100, Random Seed 180)
function gBrand(c, sidVor, t0, dur, haupt) {
  var G = D.grund[sidVor], e = G.ebenen[G.ebenen.length - 1], K = G.keys[G.keys.length - 1], it = imp(e.rel); if (!it) return null;
  var l = c.layers.add(it); l.name = "Grund Uebergang " + sidVor;
  l.anchorPoint.setValue([(K.Q[0] - e.o[0]) * e.r, (K.Q[1] - e.o[1]) * e.r]); l.position.setValue(K.P); l.scale.setValue([K.z / e.r * 100, K.z / e.r * 100]);
  var bf = addFx(l, "CC Burn Film", "Brand-Reveal");
  if (bf) { setP(bf, ["Random Seed"], 180); setP(bf, ["Center"], [CX, 700]); var b = findP(bf, ["Burn"]); if (b) keys(b, [t0, t0 + dur], [0, 100], [[30, 30], [60, 60]]); }
  l.outPoint = t0 + dur + f2s(1);
  return voxTag(l, "brand", haupt);
}
// Messlinie im Foto: Masslinie mit Endstrichen zwischen a und b, zeichnet sich (Bildschirm zur Zeit tr)
function gMass(c, sid, a, b, tr, t0, color, haupt) {
  var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy), nx = -dy / L * 26, ny = dx / L * 26;
  var linien = [[a, b], [[a[0] - nx, a[1] - ny], [a[0] + nx, a[1] + ny]], [[b[0] - nx, b[1] - ny], [b[0] + nx, b[1] + ny]]];
  var l = gStrich(c, sid, "Masslinie", linien, tr, t0, color || YEL, 6, f2s(8));
  return voxTag(l, "mass", haupt);
}
// Textmarker am Foto (z. B. Zeile auf der Zeitungsseite im Hintergrund): Quellpixel x0..x1, y; Stroke in Quellpixeln
function gMarker(c, sid, name, x0, x1, y, h, t0, color, haupt) {
  var l = shape(c, "Textmarker " + name), g = grp(l);
  addPath(g, line2([[x0, y], [x1, y - 1]])); stroke(g, color || YEL, h);
  var tr = g.addProperty("ADBE Vector Filter - Trim");
  keys(tr.property("ADBE Vector Trim End"), [t0, t0 + 0.30], [0, 100], 20);
  l.blendingMode = BlendingMode.MULTIPLY;
  var td = addFx(l, "ADBE Turbulent Displace"); if (td) { setP(td, ["Amount"], 30); setP(td, ["Size"], 2); }
  anHaengen(c, sid, l); l.inPoint = t0;
  return voxTag(l, "marker", haupt);
}
// Zeitungsausschnitt (echte Zeitung 1906): gealtertes Papier (Tint auf Graustufen-Scan), gerissene Kanten, Schatten,
// rutscht stufig (Hold-Keys, 2 Frames je Stufe = Stop-Motion) von unten ins Bild und rastet leicht gedreht ein
function zeitung(c, rel, x, y, w, rot, t0, name) {
  var it = imp(rel); if (!it) return null;
  var l = c.layers.add(it); l.name = "Zeitung " + (name || rel.replace(/.*\//, ""));
  var s = w / it.width * 100; l.scale.setValue([s, s]); l.position.setValue([x, y]); l.rotation.setValue(rot || 0);
  var tn = addFx(l, "ADBE Tint", "Papier alt"); if (tn) { setP(tn, ["Map Black To"], rgb("#1E1A16")); setP(tn, ["Map White To"], rgb("#EFE5D0")); setP(tn, ["Amount to Tint"], 100); }
  var rr = addFx(l, "ADBE Roughen Edges", "Papierriss");
  if (rr) { setP(rr, ["Border"], 10 / (s / 100)); setP(rr, ["Edge Sharpness"], 1.4); setP(rr, ["Scale"], 28); setP(rr, ["Complexity"], 4); }
  var ds = addFx(l, "ADBE Drop Shadow", "Papier Schatten"); if (ds) { setP(ds, ["Opacity"], 150); setP(ds, ["Distance"], 14); setP(ds, ["Softness"], 30); }
  if (t0 !== undefined && t0 !== null) {
    var y0 = y + 900, st = [y0, y + 260, y + 60, y - 14, y];
    for (var i = 0; i < st.length; i++) hold(l.position, t0 + i * f2s(2), [x, st[i]]);
    noteAnim(l.position, t0 + (st.length - 1) * f2s(2), l);
    hold(l.rotation, t0, (rot || 0) + 6); hold(l.rotation, t0 + f2s(4), (rot || 0) - 1.5); hold(l.rotation, t0 + f2s(8), rot || 0);
    noteAnim(l.rotation, t0 + f2s(8), l);
    l.inPoint = t0;
  }
  return l;
}
// Punkt auf dem Zeitungsausschnitt (Bildpunkte der JPG) -> lokale Ebenen-Koordinaten fuer Kinder (Anker = Bildmitte)
function zKind(z, l) { attach(l, z); l.position.setValue([0, 0]); l.anchorPoint.setValue([0, 0]); l.scale.setValue([100, 100]); l.rotation.setValue(0); return l; }
function zMarker(c, z, name, x0, x1, y, h, t0, color) {   // Textmarker auf dem Ausschnitt (Bildpunkte)
  var l = shape(c, "Textmarker " + name), g = grp(l);
  addPath(g, line2([[x0, y], [x1, y - 1]])); stroke(g, color || YEL, h);
  var tr = g.addProperty("ADBE Vector Filter - Trim");
  keys(tr.property("ADBE Vector Trim End"), [t0, t0 + Math.max(0.28, (x1 - x0) / 1600)], [0, 100], 20);
  l.blendingMode = BlendingMode.MULTIPLY; zKind(z, l); l.inPoint = t0; l.moveBefore(z);
  return l;
}
function zKreis(c, z, name, cx, cy, rx, ry, t0, color, w) {   // Bleistiftkreis auf dem Ausschnitt (Bildpunkte)
  var s = z.scale.value[0] / 100;
  var l = pencil(c, "Kreis " + name, [ellP(cx, cy, rx, ry)], color || LRED, (w || 8) / s, t0, f2s(9));
  zKind(c ? z : z, l); l.inPoint = t0; l.moveBefore(z);
  return l;
}
// Tippen mit Cursor (linksbuendig, Cursor "|" blinkt waehrend des Tippens und 0,4 s danach)
function tippen(c, s, x, y, font, size, color, t0, cps, name) {
  cps = cps || 30;
  var l = txt(c, s, font, size, color || CREAM, [x, y], ParagraphJustification.LEFT_JUSTIFY); l.name = name || ("Tipp " + s); schatten(l);
  var tEnd = t0 + s.length / cps;
  noteAnim(null, tEnd, l);
  l.property("ADBE Text Properties").property("ADBE Text Document").expression =
    "var s = value; var n = Math.max(0, Math.floor((time - " + t0 + ") * " + cps + ")); var t = n < s.length ? s.substr(0, n) : s;" +
    " (time < " + (tEnd + 0.4) + " && Math.floor(time * 6) % 2 == 0) ? t + '|' : t;";
  l.inPoint = t0;
  return l;
}
// Punch-Cut auf dem Schnitt fuer das ganze Bild (Foto + Grafik): Transform-Effekt auf einer Einstellungsebene,
// Skalierung 112 -> 100 % in 21 Frames ab dem Schnitt (Speed-Spitze auf dem Schnitt), optional 100 -> 107 % in den letzten 7 Frames
function punchCut(c, amt, aus) {
  var a = adj(c, "Kamera Punch (Transform)");
  var tf = addFx(a, "ADBE Geometry2", "Punch");
  if (tf) {
    var sp = findP(tf, ["Scale Height", "Scale", "ADBE Geometry2-0003"]);
    if (sp) {
      var T = [0, f2s(21)], V = [(amt || 1.12) * 100, 100], E = [[10, 5], [90, 40]];
      if (aus) { T.push(c.duration - f2s(7)); V.push(100); E.push([40, 40]); T.push(c.duration); V.push(107); E.push([5, 10]); }
      NOANIM = true; keys(sp, T, V, E); NOANIM = false;
    }
  }
  return a;
}
