// ===================== Bausteine Short zur Folge 42 (23.11.2026): geschichtete Farb-Hintergruende + Abzuege mit angehefteten Vox-Geraeten =====================
// enno 23.11.: Shorts im LEBENDIGEN Vox-Stil nach Chris Moran. Hintergrund nach TikTok 13: Collage aus 2-3 Themenbildern, schraeg, getoent
// (Duotone in einer Farbfamilie, in die PNG eingebacken = leicht fuer die Grafikkarte), Papierstruktur + Raster in der Grundflaeche,
// JEDE Ebene driftet anders (Parallax), nicht zu dunkel. Davor: der Abzug/Freisteller der Szene (natuerliche Farben) mit Vox-Geraeten,
// die als Kinder am Abzug haengen (Bildpixel) und sich mit ihm bewegen (Regel 17.11.: jedes Geraet interagiert mit dem Bild).
// Erwartet vox_lib.jsx, vox_plus.jsx, grund_lib.jsx davor und D.schicht / D.bilder (gen/gen_bitcoin.py, gen/bilder_bitcoin.py).

// helle Schrift direkt auf dem Hintergrund
function hellTxt(c, s, font, size, color, pos, name) { var l = txt(c, s, font, size, color || CREAM, pos); l.name = name || ("Text " + s); schatten(l); return l; }
function ellP(cx, cy, rx, ry) {
  var kx = 0.5523 * rx, ky = 0.5523 * ry;
  return { v: [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]], i: [[-kx, 0], [0, -ky], [kx, 0], [0, ky]], o: [[kx, 0], [0, ky], [-kx, 0], [0, -ky]], c: true };
}
// Bildquellen unten rechts, eine Zeile je Quelle, FIX: haengt nicht an der Kamera
var SCH_REL = [];   // Quellen der Collage-Ebenen der aktuellen Szene (schichten), kommen automatisch in die Bildnachweise
function credits(c, ks) {
  ks = ks.concat(SCH_REL);
  var y = 1884, seen = {}, L = [];
  for (var i = 0; i < ks.length; i++) { var s = D.credits[ks[i]]; if (!s) { log.push("FEHLER Bildnachweis fehlt: " + ks[i]); continue; } if (!seen[s]) { seen[s] = 1; L.push(s); } }
  for (var j = L.length - 1; j >= 0; j--) {
    var l = txt(c, L[j], "ArialMT", 20, "#FFFFFF", [1040, y], ParagraphJustification.RIGHT_JUSTIFY, 10); l.name = "FIX Bildquelle";
    var rc = l.sourceRectAtTime(0, false);
    var pl = shape(c, "FIX Bildquelle Schild"), g = grp(pl); rectG(g, rc.width + 20, rc.height + 10, 0, 0, 4); fill(g, "#141210");
    pl.position.setValue([1040 + rc.left + rc.width / 2, y + rc.top + rc.height / 2]); pl.opacity.setValue(60); pl.moveAfter(l);
    y -= 30;
  }
}

// ---------- 1 Geschichteter Hintergrund (TikTok 13) ----------
// Grundflaeche b-<familie>.jpg (1300 x 2300, Verlauf + Papier + Raster) driftet langsam; darueber 3 getoente Collage-Ebenen mit eigener Drift.
function schichten(c, sid, opt) {
  opt = opt || {};
  var S = D.schicht[sid], d = c.duration, out = [];
  SCH_REL = [];
  if (!S) { log.push("FEHLER Schicht fehlt: " + sid); return out; }
  NOANIM = true;   // die Drift laeuft bewusst bis zum Schnitt
  var it = imp(S.grund);
  if (it) {
    var g = c.layers.add(it); g.name = "Grund Foto " + S.fam;
    keys(g.position, [0, d], [[540, 960], [540 - 26, 960 - 34]], 30);
    keys(g.scale, [0, d], [[100, 100], [103, 103]], 30);
    out.push(g);
  }
  for (var i = 0; i < S.ebenen.length; i++) {
    var e = S.ebenen[i], im = imp(e.rel); if (!im) continue;
    var l = c.layers.add(im); l.name = "Grund Schicht " + e.rel.replace(/.*\//, ""); SCH_REL.push(e.rel.replace(/.*\//, ""));
    var s = e.w / im.width * 100;
    keys(l.scale, [0, d], [[s, s], [s * 1.035, s * 1.035]], 30);
    keys(l.position, [0, d], [[e.x, e.y], [e.x + e.dx, e.y + e.dy]], 30);
    keys(l.rotation, [0, d], [e.rot, e.rot + e.drot], 30);
    l.opacity.setValue(e.op);
    var ds = addFx(l, "ADBE Drop Shadow", "Schicht Schatten");
    if (ds) { setP(ds, ["Opacity"], 90); setP(ds, ["Distance"], 10); setP(ds, ["Softness"], 30); }
    out.push(l);
  }
  NOANIM = false;
  var ht = imp("tex/halftone.jpg");
  if (ht) { var h = cover(c, ht, 0.9); h.name = "Grund Halftone"; h.blendingMode = BlendingMode.OVERLAY; h.opacity.setValue(opt.ht || 10); }
  subShade(c, opt.ut || 42);
  return out;
}

// ---------- 2 Abzug / Freisteller der Szene ----------
// Abzug = p-*.jpg mit eingebackenem weissem Rand (Bildpixel = Koordinaten fuer Kinder), Schatten, Mini-Kontrast.
// fahrt: eigene Null "Abzug Fahrt ..." mit langsamer Fahrt (Skalierung 100 -> 104 %), damit Eintritt + Fahrt sich nicht beissen.
// Rueckgabe A: { l: Ebene, s: Faktor, iw/ih: Bildgroesse, x/y/rot: Lage, P(name): Bildpunkt, S(p): Bildschirmpunkt (ohne Fahrt) }
var ABZ = {};
var ABZ_DY = 0;   // Apollo 25.11.: alle Abzuege ein Stueck tiefer (Inhalt mittig zwischen Logo und freiem Untertitel-Band)
function abz(c, file, x, y, w, rot, t0, mode, opt) {
  opt = opt || {}; y += ABZ_DY;
  var rel = "archiv/" + file, it = imp(rel); if (!it) return null;
  var l = c.layers.add(it); l.name = (file.indexOf("f-") === 0 ? "Freisteller " : "Abzug ") + file;
  var s = w / it.width;
  l.scale.setValue([s * 100, s * 100]); l.position.setValue([x, y]); l.rotation.setValue(rot || 0);
  var bc = addFx(l, "ADBE Brightness & Contrast 2", "Angleichen"); if (bc) { setP(bc, ["Contrast"], 6); setP(bc, ["Brightness"], 2); }
  var ds = addFx(l, "ADBE Drop Shadow", "Abzug Schatten");
  if (ds) { setP(ds, ["Opacity"], 150); setP(ds, ["Distance"], 16); setP(ds, ["Softness"], 38); setP(ds, ["Direction"], 160); }
  var A = { l: l, s: s, iw: it.width, ih: it.height, x: x, y: y, rot: rot || 0, file: file };
  A.P = function (n) { var b = D.bilder[file]; if (!b || !b.pts || !b.pts[n]) { log.push("FEHLER Bildpunkt fehlt: " + file + " / " + n); return [it.width / 2, it.height / 2]; } return b.pts[n]; };
  A.S = function (p) { var dx = (p[0] - A.iw / 2) * A.s, dy = (p[1] - A.ih / 2) * A.s, r = A.rot * Math.PI / 180; return [A.x + dx * Math.cos(r) - dy * Math.sin(r), A.y + dx * Math.sin(r) + dy * Math.cos(r)]; };
  // Fahrt-Null ZUERST anhaengen, dann die Eintrittsanimation (sonst setValue auf Keyframes: AE-Fehler, PC-Build 23.11.)
  if (opt.fahrt !== false) {
    var n = c.layers.addNull(c.duration); n.name = "Abzug Fahrt " + file;
    n.anchorPoint.setValue([x, y]); n.position.setValue([x, y]);
    NOANIM = true; keys(n.scale, [0, c.duration], [[100, 100], [opt.fahrt || 104, opt.fahrt || 104]], 30); NOANIM = false;
    attach(l, n); l.position.setValue([x, y]);
    A.n = n;
  }
  if (t0 !== undefined && t0 !== null) {
    if (mode === "drop") dropIn(l, t0, opt.dy || 170, opt.dur || 0.32);
    else if (mode === "slide") stopSlide(l, t0, opt.von || "unten");
    else if (mode === "pop") popIn(l, t0, opt.prot === undefined ? -5 : opt.prot);
    else if (mode === "slam") slam(l, t0);
    else setIn(l, t0);
  }
  ABZ[file] = A;
  return A;
}
// Stop-Motion-Rutschen (wie die Zeitung): Hold-Keys, 2 Frames je Stufe, rastet leicht gedreht ein
function stopSlide(l, t0, von) {
  var p = l.position.value, r = l.rotation.value, st, i;
  if (von === "rechts") st = [[p[0] + 900, p[1]], [p[0] + 260, p[1]], [p[0] + 60, p[1]], [p[0] - 14, p[1]], [p[0], p[1]]];
  else if (von === "links") st = [[p[0] - 900, p[1]], [p[0] - 260, p[1]], [p[0] - 60, p[1]], [p[0] + 14, p[1]], [p[0], p[1]]];
  else st = [[p[0], p[1] + 900], [p[0], p[1] + 260], [p[0], p[1] + 60], [p[0], p[1] - 14], [p[0], p[1]]];
  for (i = 0; i < st.length; i++) hold(l.position, t0 + i * f2s(2), st[i]);
  noteAnim(l.position, t0 + (st.length - 1) * f2s(2), l);
  hold(l.rotation, t0, r + 6); hold(l.rotation, t0 + f2s(4), r - 1.5); hold(l.rotation, t0 + f2s(8), r);
  noteAnim(l.rotation, t0 + f2s(8), l);
  setIn(l, t0);
  return l;
}

// ---------- 3 Geraete am Abzug (Kinder in Bildpixeln) ----------
function anAbz(A, l) { zKind(A.l, l); l.moveBefore(A.l); return l; }
function aKreis(c, A, name, p, rx, ry, t0, color, w, haupt) {
  var l = pencil(c, "Kreis " + name, [ellP(p[0], p[1], rx, ry)], color || LRED, (w || 8) / A.s, t0, f2s(9));
  anAbz(A, l); l.inPoint = t0; boilSkal(l, 1 / A.s);
  return voxTag(l, "kreis", haupt);
}
function aMarker(c, A, name, x0, x1, y, h, t0, color, haupt) {
  var l = zMarker(c, A.l, name, x0, x1, y, h, t0, color);
  return voxTag(l, "marker", haupt);
}
function aStrich(c, A, name, pts, t0, color, w, dur, haupt) {   // Bleistiftstrich/-pfeil in Bildpixeln (letzter Punkt = Spitze, wenn spitze)
  var l = pencil(c, "Strich " + name, [line2(pts)], color || LRED, (w || 9) / A.s, t0, dur || f2s(8));
  anAbz(A, l); l.inPoint = t0; boilSkal(l, 1 / A.s);
  return voxTag(l, "strich", haupt);
}
// Kontrast-Callout NUR auf dem Abzug: helle Wolke ueber dem Abzug, Loch (weich gefedert) um das Ziel, harter Schnitt (Saeule 4)
function aCallout(c, A, name, p, rx, ry, t0, t1, op, haupt) {
  var l = solid(c, "FIX Callout " + name, "#F4EFE4", A.iw, A.ih);
  zKind(A.l, l); l.moveBefore(A.l);
  var m = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  m.property("ADBE Mask Shape").setValue(mkShape(ellP(p[0], p[1], rx, ry))); m.inverted = true;
  m.property("ADBE Mask Feather").setValue([70 / A.s, 70 / A.s]);
  l.opacity.setValue(op || 55);
  l.inPoint = t0; if (t1) l.outPoint = t1;
  return voxTag(l, "callout", haupt);
}
// ein Ring, der sich vom Punkt ausbreitet (Einschlag/Fund), kurz (dur), Kind des Abzugs
function aRing(c, A, p, t0, color, maxR, dur) {
  var l = shape(c, "Ring " + A.file), g = grp(l, "Ring"); ellipseG(g, 10, 10, p[0], p[1]); stroke(g, color || CREAM, 6 / A.s);
  var root = l.property("ADBE Root Vectors Group"), C = root.property(1).property("ADBE Vectors Group");
  dur = dur || 0.5;
  keys(C.property("ADBE Vector Shape - Ellipse").property("ADBE Vector Ellipse Size"), [t0, t0 + dur], [[10, 10], [(maxR || 300) / A.s, (maxR || 300) / A.s]], [[5, 5], [80, 80]]);
  keys(l.opacity, [t0, t0 + dur], [100, 0], 40);
  anAbz(A, l); l.inPoint = t0; l.outPoint = t0 + dur + f2s(MIN_STAND + 1);
  return voxTag(l, "ringe");
}
// Lupe auf dem Abzug: Kopie des Bildes (x m) unter einem runden Loch; Mitte faehrt von a nach b (Bildpixel), R = Radius in Bildpixeln
function aLupe(c, A, a, b, R, m, t0, t1, haupt) {
  var it = imp("archiv/" + A.file); if (!it) return null;
  var l = c.layers.add(it); l.name = "Lupe Bild " + A.file;
  attach(l, A.l); l.moveBefore(A.l);
  l.rotation.setValue(0); l.scale.setValue([m * 100, m * 100]);
  keys(l.anchorPoint, [t0, t1], [a, b], [[30, 30], [80, 80]]);
  keys(l.position, [t0, t1], [a, b], [[30, 30], [80, 80]]);
  var mk = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  keys(mk.property("ADBE Mask Shape"), [t0, t1], [mkShape(ellP(a[0], a[1], R / m, R / m)), mkShape(ellP(b[0], b[1], R / m, R / m))], [[30, 30], [80, 80]]);
  mk.property("ADBE Mask Feather").setValue([1.5, 1.5]);
  l.inPoint = t0;
  var rg = shape(c, "Lupe Rand"), g1 = grp(rg, "Schatten"); ellipseG(g1, 2 * R + 12, 2 * R + 12, 0, 0); stroke(g1, "#000000", 16);
  var g2 = grp(rg, "Rand"); ellipseG(g2, 2 * R, 2 * R, 0, 0); stroke(g2, CREAM, 9);
  var g3 = grp(rg, "Griff"); addPath(g3, line2([[R * 0.72, R * 0.72], [R * 1.22, R * 1.22]])); stroke(g3, CREAM, 20);
  attach(rg, A.l); rg.moveBefore(l); rg.anchorPoint.setValue([0, 0]); rg.scale.setValue([100, 100]); rg.rotation.setValue(0);
  keys(rg.position, [t0, t1], [a, b], [[30, 30], [80, 80]]);
  rg.inPoint = t0;
  voxTag(l, "lupe", haupt);
  return { lupe: l, rand: rg };
}
// Stecknadel auf einem Bildpunkt (Kind des Abzugs), springt auf + kleiner Einschlag
function aNadel(c, A, name, p, t0, color) {
  var k = 1 / A.s;
  var n = shape(c, "Nadel " + name);
  var gn = grp(n, "Nadel"); addPath(gn, line2([[0, 0], [6 * k, -46 * k]])); stroke(gn, "#D9D2C4", 6 * k);   // Review 23.11.: kurze Nadel, Spitze sitzt sichtbar auf der Stadt
  var gh = grp(n, "Kopf"); ellipseG(gh, 36 * k, 36 * k, 7 * k, -58 * k); fill(gh, color || RED); stroke(gh, CREAM, 3 * k);
  var gg = grp(n, "Glanz"); ellipseG(gg, 10 * k, 10 * k, 1 * k, -64 * k); fill(gg, "#FFFFFF", 85);
  attach(n, A.l); n.moveBefore(A.l); n.anchorPoint.setValue([0, 0]); n.rotation.setValue(-A.rot); n.position.setValue(p);
  var ds = addFx(n, "ADBE Drop Shadow", "Nadel Schatten"); if (ds) { setP(ds, ["Opacity"], 150); setP(ds, ["Distance"], 6); setP(ds, ["Softness"], 10); }
  keys(n.scale, [t0, t0 + f2s(4), t0 + f2s(8)], [[0, 0], [112, 112], [100, 100]], [[10, 10], [60, 60], [80, 80]]);
  n.inPoint = t0;
  return voxTag(n, "nadel");
}
// Flaeche (Polygon in Bildpixeln) farbig auf dem Abzug, brennt sich ein (CC Burn Film 100 -> 0, Seed 180; Saeule 8 Karten-Reveal)
function aFlaeche(c, A, name, pts, color, op, t0, dur, haupt) {
  var l = shape(c, "Flaeche " + name), g = grp(l, name);
  addPath(g, line2(pts, true)); fill(g, color || LRED); stroke(g, "#FFFFFF", 4 / A.s);
  anAbz(A, l); l.opacity.setValue(op || 70); l.blendingMode = BlendingMode.MULTIPLY;
  var e = addFx(l, "CC Burn Film", "Brand-Reveal");
  if (e) { setP(e, ["Random Seed"], 180); var b = findP(e, ["Burn"]); if (b) keys(b, [t0, t0 + (dur || 0.5)], [100, 0], [[30, 30], [70, 70]]); }
  l.inPoint = t0;
  return voxTag(l, "karte", haupt);
}
// Ebene (z. B. Freisteller) brennt weg: CC Burn Film 0 -> 100
function brennWeg(l, t0, dur, haupt) {
  var e = addFx(l, "CC Burn Film", "Brand-Weg");
  if (e) { setP(e, ["Random Seed"], 180); var b = findP(e, ["Burn"]); if (b) keys(b, [t0, t0 + (dur || 0.55)], [0, 100], [[30, 30], [60, 60]]); }
  l.outPoint = t0 + (dur || 0.55) + f2s(MIN_STAND + 1);
  return voxTag(l, "brand", haupt);
}
// Papier-Zettel (Nachbau: Formularfeld, Urteilskopf, Diagramm-Karte): Flaeche + Rand + Schatten, Kinder liegen relativ zur Mitte
function zettel(c, name, x, y, w, h, rot, t0, mode, farbe) {
  var l = shape(c, "Zettel " + name), g = grp(l, "Papier");
  rectG(g, w, h, 0, 0, 10); fill(g, farbe || "#F7F2E8"); stroke(g, "#D8CFBE", 3);
  l.position.setValue([x, y]); l.rotation.setValue(rot || 0);
  var ds = addFx(l, "ADBE Drop Shadow", "Zettel Schatten"); if (ds) { setP(ds, ["Opacity"], 140); setP(ds, ["Distance"], 14); setP(ds, ["Softness"], 34); }
  if (t0 !== undefined && t0 !== null) { if (mode === "slide") stopSlide(l, t0, "unten"); else if (mode === "rechts") stopSlide(l, t0, "rechts"); else popIn(l, t0, -4); }
  return l;
}
function zText(c, Z, s, font, size, color, pos, just) {   // Text auf dem Zettel (pos relativ zur Zettel-Mitte)
  var t = txt(c, s, font, size, color || INK, [0, 0], just); t.name = "Zettel Text " + s;
  attach(t, Z); t.position.setValue(pos); t.rotation.setValue(0); t.moveBefore(Z);
  t.inPoint = Z.inPoint;
  return t;
}
// Kamera der Szene (nur Fahrt), Punch auf dem Schnitt per punchCut
function kamera(c, s1) { return camRig(c, CX, FCY, { punchIn: false, punchOut: false, s0: 100, s1: s1 || 102 }); }
