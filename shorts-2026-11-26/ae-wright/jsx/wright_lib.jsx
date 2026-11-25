// ===================== Bausteine Apollo-13-Short (25.11.2026), zusaetzlich zu bitcoin_lib.jsx =====================
// Regeln (Auftrag 25.11.): jedes Vox-Geraet haengt an einem ECHTEN Bildpunkt (Kind des Abzugs/Freistellers, Koordinaten in Bildpixeln)
// und bewegt sich mit dem Bild; Pfeilspitzen sitzen genau am Pfeilende, gedreht entlang der End-Tangente (spitze());
// Sicherheitszone 1080x1920: alles in x 45-1031 / y 114-1543, oben Mitte (x 313-763) frei bis y 216, unter y 956 nur bis x 887,
// Band y 1290-1460 frei (Untertitel macht enno in CapCut). Bildquellen deshalb unten LINKS (x 60, y ~1515).
var GRUEN = "#2E9E5B";
ABZ_DY = 45;
var ABZ_DX = 70;   // enno 25.11.: Abzuege/Bilder mittig (vorher nach links gerueckt)

// Bildquellen senkrecht am linken Rand (enno 25.11.: wie im TikTok-Beispiel, um 90 Grad gedreht, liest sich von oben nach unten), Monospace, dezent
function credits(c, ks) {
  ks = ks.concat(SCH_REL);
  var seen = {}, L = [];
  for (var i = 0; i < ks.length; i++) { var s = D.credits[ks[i]]; if (s === undefined) { log.push("FEHLER Bildnachweis fehlt: " + ks[i]); continue; } if (s && !seen[s]) { seen[s] = 1; L.push(s); } }
  if (!L.length) return;
  var S = D.schicht && CURSCENE ? D.schicht[CURSCENE] : null, dunkel = !S || S.mode !== "weiss";
  var l = txt(c, "Quelle: " + L.join("  /  "), "CourierNewPSMT", 28, dunkel ? "#D8D8D8" : "#2A2A2A", [0, 0], ParagraphJustification.CENTER_JUSTIFY, 0);
  l.name = "FIX Bildquelle";
  var rc = l.sourceRectAtTime(0, false);
  l.anchorPoint.setValue([rc.left + rc.width / 2, rc.top + rc.height / 2]);
  l.position.setValue([30, 960]); l.rotation.setValue(90); l.opacity.setValue(80);
  if (rc.width > 1500) l.scale.setValue([150000 / rc.width, 150000 / rc.width]);
  if (!dunkel) { var w = solid(c, "FIX UT-Abdunklung", "#000000"); var mk = w.property("ADBE Mask Parade").addProperty("ADBE Mask Atom"); mk.property("ADBE Mask Shape").setValue(mkShape(ellP(540, 1362, 330, 92))); mk.property("ADBE Mask Feather").setValue([150, 150]); w.opacity.setValue(28); }   /* PC: weisse Untertitel auf hellen Szenen lesbar */
  l.moveToBeginning();
}// Bildschirmpunkt -> Bildpixel eines Abzugs (ohne Fahrt), Gegenstueck zu A.S
function aQ(A, s) { var dx = s[0] + ABZ_DX - A.x, dy = s[1] - A.y, r = -A.rot * Math.PI / 180; return [A.iw / 2 + (dx * Math.cos(r) - dy * Math.sin(r)) / A.s, A.ih / 2 + (dx * Math.sin(r) + dy * Math.cos(r)) / A.s]; }
// Bild als Kind eines Abzugs (z. B. Mond am Erd-Freisteller): Mitte am Bildschirmpunkt s, Breite w (Bildschirm)
function kindBild(c, A, file, s, w, rot) {
  var it = imp("archiv/" + file); if (!it) return null;
  var l = c.layers.add(it); l.name = (file.indexOf("f-") === 0 ? "Freisteller " : "Abzug ") + file;
  attach(l, A.l); l.moveBefore(A.l);
  var q = aQ(A, s), sc = w / it.width / A.s;
  l.anchorPoint.setValue([it.width / 2, it.height / 2]); l.position.setValue(q); l.scale.setValue([sc * 100, sc * 100]); l.rotation.setValue((rot || 0) - A.rot);
  var ds = addFx(l, "ADBE Drop Shadow", "Abzug Schatten"); if (ds) { setP(ds, ["Opacity"], 140); setP(ds, ["Distance"], 12); setP(ds, ["Softness"], 30); setP(ds, ["Direction"], 160); }
  var B = { l: l, s: A.s * sc, iw: it.width, ih: it.height, file: file, x: s[0], y: s[1], rot: rot || 0 };
  B.P = function (n) { var b = D.bilder[file]; return (b && b.pts && b.pts[n]) || [it.width / 2, it.height / 2]; };
  B.S = function (p) { var dx = (p[0] - B.iw / 2) * B.s, dy = (p[1] - B.ih / 2) * B.s, r = B.rot * Math.PI / 180; return [B.x + dx * Math.cos(r) - dy * Math.sin(r), B.y + dx * Math.sin(r) + dy * Math.cos(r)]; };
  return B;
}

// ---------- Pfeil / Bahn mit Spitze genau am Ende (PFEIL-Pruefung im Mock: Spitze < 3 px, Winkel < 5 Grad) ----------
// Pfeilspitze: Spitze genau am Pfeilende, Fluegel symmetrisch entlang der Endtangente ((ax, ay) = Ende + letzter Bezier-Anfasser)
function spitze(tx, ty, ax, ay, len, ang) {
  var dx = tx - ax, dy = ty - ay, d = Math.sqrt(dx * dx + dy * dy) || 1, a = (ang || 28) * Math.PI / 180;
  dx /= d; dy /= d; len = len || 36;
  var w1 = [tx - len * (dx * Math.cos(a) - dy * Math.sin(a)), ty - len * (dy * Math.cos(a) + dx * Math.sin(a))];
  var w2 = [tx - len * (dx * Math.cos(a) + dy * Math.sin(a)), ty - len * (dy * Math.cos(a) - dx * Math.sin(a))];
  return line2([w1, [tx, ty], w2]);
}
// Bogen a -> b in Bildpixeln von A, bend = Auswoelbung (Anteil der Laenge). Erster Pfad = Schaft, letzter Pfad = Spitze (3 Punkte).
function bogen(a, b, bend) {
  var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
  var px = mx + dy * bend, py = my - dx * bend;
  return { v: [a, b], i: [[0, 0], [(px - b[0]) * 0.66, (py - b[1]) * 0.66]], o: [[(px - a[0]) * 0.66, (py - a[1]) * 0.66], [0, 0]], c: false };
}
function pfeilEbene(c, A, name, schaft, t0, t1, color, w, dash, haupt, art) {
  var k = 1 / A.s, n = schaft.v.length - 1, e = schaft.v[n], it = schaft.i[n];
  var ax = e[0] + it[0], ay = e[1] + it[1];
  if (Math.abs(it[0]) + Math.abs(it[1]) < 0.01) { ax = schaft.v[n - 1][0]; ay = schaft.v[n - 1][1]; }
  var l = shape(c, name), g = grp(l, "Schaft");
  addPath(g, schaft); stroke(g, color || CREAM, w * k, dash ? dash * k : null, dash ? dash * 0.7 * k : null);
  trimOn(g, t0, t1);
  var gs = grp(l, "Spitze"); addPath(gs, spitze(e[0], e[1], ax, ay, 34 * k, 28)); stroke(gs, color || CREAM, w * k);
  keys(gs.addProperty("ADBE Vector Filter - Trim").property("ADBE Vector Trim End"), [t1 - f2s(2), t1 + f2s(2)], [0, 100], [[30, 30], [60, 60]]);
  edgeBoil(l, w); anAbz(A, l); l.inPoint = t0; boilSkal(l, k);
  return voxTag(l, art || "pfeil", haupt);
}
function aPfeil(c, A, name, a, b, bend, t0, dur, color, w, haupt) { return pfeilEbene(c, A, "Pfeil " + name, bogen(a, b, bend), t0, t0 + (dur || f2s(9)), color, w || 9, null, haupt, "pfeil"); }
function aBahn(c, A, name, a, b, bend, t0, t1, color, w, haupt) { return pfeilEbene(c, A, "Bahn " + name, bogen(a, b, bend), t0, t1, color, w || 8, 20, haupt, "bahn"); }

// ---------- Fokus-Unschaerfe nur auf dem Abzug (Einstellungsebene in Bildgroesse, Kind des Abzugs), scharfe Stelle wandert ----------
// P = Liste von Bildpunkten, T = Zeiten dazu (gleich lang); rx/ry in Bildpixeln. <= 6 px Unschaerfe, <= 2 s (Mock fokusOK)
function aFokus(c, A, P, T, rx, ry, t1, haupt) {
  var l = c.layers.addSolid([1, 1, 1], "FIX Fokus-Unschaerfe", A.iw, A.ih, 1); l.adjustmentLayer = true;
  zKind(A.l, l); l.moveBefore(A.l);
  var t0 = T[0], bb = addFx(l, "ADBE Box Blur2", "Fokus Blur");
  if (bb) { setP(bb, ["Iterations"], 2); setP(bb, ["Repeat Edge Pixels"], 1); var r = findP(bb, ["Blur Radius"]); if (r) keys(r, [t0, t0 + f2s(4), t1 - f2s(4), t1], [0, 6, 6, 0], 50); }
  var m = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  m.inverted = true; var fe = Math.min(180 / A.s, 0.45 * Math.min(rx, ry)); m.property("ADBE Mask Feather").setValue([fe, fe]); /* PC: Feder kleiner als der Radius, sonst bleibt nichts scharf */
  if (P.length > 1) { var V = []; for (var i = 0; i < P.length; i++) V.push(mkShape(ellP(P[i][0], P[i][1], rx, ry))); keys(m.property("ADBE Mask Shape"), T, V, 70); }
  else m.property("ADBE Mask Shape").setValue(mkShape(ellP(P[0][0], P[0][1], rx, ry)));
  l.inPoint = t0; l.outPoint = t1 + f2s(1);
  return voxTag(l, "fokus", haupt);
}

// Kontrast-Callout in Wunschfarbe (dunkel auf hellem Bordfoto): Flaeche ueber dem Abzug, weiches Loch um das Ziel, harter Schnitt
function aCalloutF(c, A, name, p, rx, ry, t0, op, color, haupt) {
  var l = solid(c, "FIX Callout " + name, color || "#111111", A.iw, A.ih);
  zKind(A.l, l); l.moveBefore(A.l);
  var m = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  m.property("ADBE Mask Shape").setValue(mkShape(ellP(p[0], p[1], rx, ry))); m.inverted = true;
  m.property("ADBE Mask Feather").setValue([70 / A.s, 70 / A.s]);
  l.opacity.setValue(op || 55); l.inPoint = t0;
  return voxTag(l, "callout", haupt);
}
// ---------- Etikett / Odometer / Zaehler auf einer Platte, angeheftet an einen Bildpunkt (bleibt aufrecht, gleiche Bildschirmgroesse) ----------
function anheften(A, l, p) { attach(l, A.l); l.position.setValue(p); l.scale.setValue([100 / A.s, 100 / A.s]); l.rotation.setValue(-A.rot); l.moveBefore(A.l); return l; }
function aChip(c, A, s, p, t0, bg, fg, size, mode, art, haupt) {
  var r = chip(c, s, 0, 0, bg || INK, fg || "#FFFFFF", size || 44, null);
  anheften(A, r, p);
  if (mode === "slam") slam(r, t0); else popIn(r, t0);
  setIn(r, r.inPoint);
  return voxTag(r, art || "chip", haupt);
}
function platte(c, A, t, s, p, size, bg, tEnd) {
  var rc = t.sourceRectAtTime(tEnd, false);
  var r = shape(c, "Etikett Flaeche " + s), g = grp(r, "Flaeche");
  rectG(g, rc.width + size * 0.9, size * 1.4, 0, 0, size * 0.3); fill(g, bg || "#151515");
  var ds = addFx(r, "ADBE Drop Shadow", "Etikett Schatten"); if (ds) { setP(ds, ["Opacity"], 120); setP(ds, ["Distance"], 6); setP(ds, ["Softness"], 16); }
  r.moveAfter(t);
  attach(t, r); t.position.setValue([-(rc.left + rc.width / 2), -(rc.top + rc.height / 2)]);
  anheften(A, r, p); t.moveBefore(r);
  return r;
}
function aOdo(c, A, s, p, size, t0, dur, fg, bg, haupt) {
  var t = odometer(c, s, F_NUM, size, fg || CREAM, [0, 0], t0, dur || 0.45); t.name = "Odometer " + s;
  var r = platte(c, A, t, s, p, size, bg, t0 + (dur || 0.45) + 0.1);
  popIn(r, t0 - 0.08);
  voxTag(t, "zaehler", haupt); return r;
}
function aZaehler(c, A, from, to, pre, p, size, t0, t1, fg, bg, haupt) {
  var t = counterF(c, from, to, t0, t1, F_NUM, size, fg || CREAM, [0, 0], ""); t.name = "Zaehler " + to;
  if (pre) t.property("ADBE Text Properties").property("ADBE Text Document").expression = t.property("ADBE Text Properties").property("ADBE Text Document").expression.replace("'' + s;", "s + '" + pre + "';");
  var r = platte(c, A, t, String(to), p, size, bg, t1 + 0.1);
  popIn(r, t0 - 0.08);
  voxTag(t, "zaehler", haupt); return r;
}

// ---------- Haken / Kreuz / Formen in Bildpixeln ----------
function aHaken(c, A, name, p, s, t0, color, haupt) {
  var k = s / A.s, x = p[0], y = p[1];
  var l = pencil(c, "Haken " + name, [line2([[x - 52 * k, y + 2 * k], [x - 14 * k, y + 42 * k], [x + 62 * k, y - 50 * k]])], color || GRUEN, 14 / A.s, t0, f2s(6));
  anAbz(A, l); l.inPoint = t0; boilSkal(l, 1 / A.s);
  return voxTag(l, "haken", haupt);
}
function aKreuz(c, A, name, b, t0, color, haupt) {
  var l = pencil(c, "Kreuz " + name, [line2([[b[0], b[1]], [b[2], b[3]]]), line2([[b[2], b[1]], [b[0], b[3]]])], color || LRED, 16 / A.s, t0, f2s(7));
  anAbz(A, l); l.inPoint = t0; boilSkal(l, 1 / A.s);
  return voxTag(l, "kreuz", haupt);
}
function aRechteck(c, A, name, b, t0, color, haupt) {   // Bleistift-Quadrat um eine Form (eckig)
  var l = pencil(c, "Kreis Form " + name, [line2([[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]]], true)], color || YEL, 9 / A.s, t0, f2s(9));
  anAbz(A, l); l.inPoint = t0; boilSkal(l, 1 / A.s);
  return voxTag(l, "formen", haupt);
}

// ---------- Punkte (Vox-Kreise fuer Personen, keine gezeichneten Menschen): fliegen von a[i] nach z[i] (Bildpixel) ----------
function aPunkte(c, A, name, a, z, T, r, color, endScale, haupt) {
  var out = [];
  for (var i = 0; i < z.length; i++) {
    var l = shape(c, "Punkt " + name + " " + (i + 1)), g = grp(l, "Punkt"); ellipseG(g, 2 * r / A.s, 2 * r / A.s, 0, 0); fill(g, (color && color[i]) || CREAM); stroke(g, INK, 4 / A.s);
    anAbz(A, l);
    if (a) { keys(l.position, [T[i], T[i] + 0.40], [a[i], z[i]], [[10, 10], [85, 85]]); if (endScale) keys(l.scale, [T[i] + 0.28, T[i] + 0.48], [[100, 100], [endScale, endScale]], 60); }
    else { l.position.setValue(z[i]); popIn(l, T[i]); }
    l.inPoint = T[i]; voxTag(l, "punkte", haupt && i === 0); out.push(l);
  }
  return out;
}
// Punkt wird rot (Fuellfarbe), z. B. "der dritte passt nicht rein"
function punktRot(l, t) { var f = l.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group").property("ADBE Vector Graphic - Fill"); keys(f.property("ADBE Vector Fill Color"), [t, t + f2s(3)], [rgb(CREAM), rgb(LRED)], 50); }

// ---------- Messbalken (CO2 steigt): Rahmen + Fuellung waechst von unten, Farbe gruen -> rot; Bildpixel ----------
function aBalken(c, A, name, x, yb, h, w, t0, t1, haupt) {
  var k = 1 / A.s, l = shape(c, "Balken " + name);
  var gf = grp(l, "Fuellung"), rf = rectG(gf, w * k, 2, x, yb - 1, 0); var ff = fill(gf, GRUEN);
  var gr = grp(l, "Rahmen"); rectG(gr, (w + 14) * k, (h + 14) * k, x, yb - h * k / 2, 6 * k); stroke(gr, CREAM, 6 * k); fill(gr, "#151515", 55);
  var root = l.property("ADBE Root Vectors Group"), G = root.property(1).property("ADBE Vectors Group");
  keys(G.property("ADBE Vector Shape - Rect").property("ADBE Vector Rect Size"), [t0, t1], [[w * k, 2], [w * k, h * k]], [[20, 20], [70, 70]]);
  keys(G.property("ADBE Vector Shape - Rect").property("ADBE Vector Rect Position"), [t0, t1], [[x, yb - 1], [x, yb - h * k / 2]], [[20, 20], [70, 70]]);
  keys(G.property("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Color"), [t0, t1], [rgb(GRUEN), rgb(LRED)], 50);
  anAbz(A, l); l.inPoint = t0 - f2s(4);
  return voxTag(l, "balken", haupt);
}

// ---------- Stapel: Kopien des Abzugs ploppen nacheinander dahinter auf (genug Filter) ----------
function aStapel(c, A, n, T, dx, dy, haupt) {
  var out = [];
  for (var i = 0; i < n; i++) {
    var it = imp("archiv/" + A.file); var l = c.layers.add(it); l.name = "Stapel " + A.file + " " + (i + 1);
    attach(l, A.l); l.anchorPoint.setValue([it.width / 2, it.height / 2]); l.position.setValue([it.width / 2 + dx * (i + 1), it.height / 2 + dy * (i + 1)]);
    l.scale.setValue([100, 100]); l.rotation.setValue((i % 2 ? 3 : -3)); l.moveAfter(A.l);
    for (var j = 0; j < out.length; j++) l.moveAfter(out[j]);
    var ds = addFx(l, "ADBE Drop Shadow", "Abzug Schatten"); if (ds) { setP(ds, ["Opacity"], 130); setP(ds, ["Distance"], 10); setP(ds, ["Softness"], 26); }
    popIn(l, T[i], (i % 2 ? -6 : 6)); voxTag(l, "stapel", haupt && i === 0); out.push(l);
  }
  return out;
}

// ---------- KI-Wunschbild: liefert enno es (archiv/roh/ki-*.png -> p-ki-*.jpg), kommt es als Abzug; sonst Hilfsebene (rendert nicht) ----------
function kiPlatz(c, name, x, y, w, h, rot, t0, mode) {
  if (D.ki && D.ki[name]) return abz(c, "p-" + name + ".jpg", x, y, w, rot, t0, mode);
  var l = solid(c, "KI Platzhalter " + name, "#FF2BD6", w, h || w); l.guideLayer = true; l.position.setValue([x, y]); l.rotation.setValue(rot || 0);
  l.comment = "KI-WUNSCH:" + name + " (Prompt in data/ki_wunsch.json; Bild nach archiv/roh/" + name + ".png, dann gen/bilder_wright.py + gen/gen_wright.py)";
  if (t0 !== undefined && t0 !== null) l.inPoint = t0;
  return null;
}

// ---------- Folgen-Knopf (wie vox_plus), Mauszeiger startet innerhalb der Sicherheitszone ----------
function followBtn(c, x, y, tIn, tClick, sz) {
  sz = sz || 1;
  var btn = shape(c, "FIX Folgen-Knopf"), gb = grp(btn); rectG(gb, 320 * sz, 100 * sz, 0, 0, 50 * sz); var bfill = fill(gb, RED);
  btn.position.setValue([x, y]);
  keys(bfill.property("ADBE Vector Fill Color"), [tClick - f2s(1), tClick], [rgb(RED), rgb("#6B655B")], 50);
  var b1 = txt(c, "+ Folgen", F_SANS_B, 48 * sz, "#FFFFFF", [x, y + 17 * sz]); b1.name = "FIX Folgen 1";
  var b2 = txt(c, "Gefolgt", F_SANS_B, 48 * sz, "#FFFFFF", [x, y + 17 * sz]); b2.name = "FIX Folgen 2";
  var zen = function (b) { var r = b.sourceRectAtTime(tIn, false); b.anchorPoint.setValue([r.left + r.width / 2, 0]); b.position.setValue([x, y + 17 * sz]); };
  zen(b1); zen(b2);
  keys(btn.scale, [tIn, tIn + f2s(5), tIn + f2s(9)], [[0, 0], [110, 110], [100, 100]], [[10, 10], [60, 60], [80, 80]]);
  keys(b1.scale, [tIn, tIn + f2s(5), tIn + f2s(9)], [[0, 0], [110, 110], [100, 100]], [[10, 10], [60, 60], [80, 80]]);
  btn.inPoint = tIn; b1.inPoint = tIn; b1.outPoint = tClick; b2.inPoint = tClick;
  var ds = addFx(btn, "ADBE Drop Shadow"); if (ds) { setP(ds, ["Opacity"], 90); setP(ds, ["Distance"], 8); setP(ds, ["Softness"], 22); }
  var cur = shape(c, "FIX Mauszeiger"), gcu = grp(cur);
  addPath(gcu, line2([[0, 0], [0, 64], [16, 50], [28, 76], [40, 70], [28, 46], [50, 46]], true)); fill(gcu, "#FFFFFF"); stroke(gcu, INK, 4);
  cur.inPoint = tIn + f2s(3);
  keys(cur.position, [tIn + f2s(3), tClick - f2s(2)], [[x + 250, y + 40], [x + 92 * sz, y + 20 * sz]], [[10, 10], [85, 85]]);
  keys(cur.scale, [tClick - f2s(2), tClick, tClick + f2s(4)], [[100, 100], [82, 82], [100, 100]], 50);
  keys(btn.scale, [tClick - f2s(1), tClick + f2s(2), tClick + f2s(6)], [[100, 100], [93, 93], [100, 100]], 50);
  voxTag(btn, "klick");
  return btn;
}

// ---------- Hintergrund 25.11. (enno: Chris Moran TikTok 13, ersetzt die Farbfamilien) ----------
// Grundplatte b-schwarz|weiss.jpg ('Grund Foto', deckt immer), darueber die Precomp 'BG <szene>' mit 2-3 Graustufen-Themenbildern
// (schraeg, angeschnitten, jedes driftet anders), auf der Precomp-Ebene Tint (Map Black/White To aus D.schicht[sid].tint, Bildkontrast ~30 %),
// darueber Grunge (Kratzer/Staub aus echtem Tafel-Scan) niedrig deckend: Screen auf Schwarz, Multiply auf Weiss. Platte + Collage driften/zoomen.
// HELL = weisse Szene: Linien, Pfeile, Ringe und Formen auf dem Hintergrund dunkel (LINIE / MARK), sonst hell/gelb.
var HELL = false, LINIE = CREAM, MARK = YEL;
function schichten(c, sid, opt) {
  opt = opt || {};
  var S = D.schicht[sid], d = c.duration, out = [];
  SCH_REL = [];
  if (!S) { log.push("FEHLER Schicht fehlt: " + sid); return out; }
  HELL = S.mode === "weiss"; LINIE = HELL ? "#1C1B19" : CREAM; MARK = HELL ? "#1C1B19" : YEL;
  NOANIM = true;   // die Drift laeuft bewusst bis zum Schnitt
  var it = imp(S.grund);
  if (it) {
    var g = c.layers.add(it); g.name = "Grund Foto " + S.mode;
    keys(g.position, [0, d], [[540, 960], [540 - 22, 960 - 30]], 30);
    keys(g.scale, [0, d], [[100, 100], [103, 103]], 30);
    out.push(g);
  }
  var PW = 1200, PH = 2100, ox = (PW - 1080) / 2, oy = (PH - 1920) / 2;
  var pc = mkComp("BG " + sid, PW, PH, d, fPre);
  for (var i = 0; i < S.ebenen.length; i++) {
    var e = S.ebenen[i], im = imp(e.rel); if (!im) continue;
    var l = pc.layers.add(im); l.name = "Grund Schicht " + e.rel.replace(/.*\//, ""); SCH_REL.push(e.rel.replace(/.*\//, ""));
    var s = e.w / im.width * 100;
    keys(l.scale, [0, d], [[s, s], [s * 1.04, s * 1.04]], 30);
    keys(l.position, [0, d], [[e.x + ox, e.y + oy], [e.x + ox + e.dx, e.y + oy + e.dy]], 30);
    keys(l.rotation, [0, d], [e.rot, e.rot + e.drot], 30);
    l.opacity.setValue(e.op);
    var ds = addFx(l, "ADBE Drop Shadow", "Schicht Schatten");
    if (ds) { setP(ds, ["Opacity"], 110); setP(ds, ["Distance"], 12); setP(ds, ["Softness"], 34); }
  }
  var bl = c.layers.add(pc); bl.name = "Grund Collage " + S.mode;
  keys(bl.position, [0, d], [[540, 960], [540 + 18, 960 - 24]], 30);
  keys(bl.scale, [0, d], [[100, 100], [104, 104]], 30);
  var tn = addFx(bl, "ADBE Tint", "BG Tint " + S.mode);
  if (tn) { setP(tn, ["Map Black To"], rgb(S.tint[0])); setP(tn, ["Map White To"], rgb(S.tint[1])); setP(tn, ["Amount to Tint"], 100); }
  out.push(bl);
  var gt = imp(S.grunge);
  if (gt) {
    var gl = cover(c, gt, 1.06); gl.name = "Grund Grunge " + S.mode;
    gl.blendingMode = HELL ? BlendingMode.MULTIPLY : BlendingMode.SCREEN; gl.opacity.setValue(HELL ? 16 : 20);
    keys(gl.position, [0, d], [[540, 960], [540 - 14, 960 + 20]], 30);
  }
  NOANIM = false;
  if (!HELL) subShade(c, opt.ut || 42);
  return out;
}
