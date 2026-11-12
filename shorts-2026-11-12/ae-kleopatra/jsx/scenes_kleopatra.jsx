// ===================== Szenen: Short 12.11.2026 "Kleopatra lebte naeher an der Mondlandung ..." =====================
// Rueckgrat: ein Zeitstrahl auf Papier (Welt-Einheiten = Jahre), durch den eine Parallax-Kamera faehrt (Szenen 2-8).
// k = Zeiten der Schluesselwoerter relativ zum Szenenanfang (aus gen_kleopatra.py). Jede Animation endet >= 8 Frames vor dem Schnitt.
var B = {};
var CHALK = "#F1ECE0";

// ---------- gemeinsamer Zeitstrahl-Zustand ----------
// st: welche Elemente schon stehen (true) bzw. hier animiert werden (Zahl = Startzeit). Ebenen: Raster, Marker, Linie, Nadeln, Texte, Bilder.
function timeline(c, R, st) {
  var P = R.p[1], o = {};
  o.grid = tlGrid(c, R.p[0.55]);
  if (st.mark1 !== undefined) o.mark1 = tlMark(c, P, "Pyramide-Kleopatra", X_PYR, X_KLEO, st.mark1 === true ? null : st.mark1[0], st.mark1 === true ? null : st.mark1[1], YEL, st.mark1.infl);
  if (st.mark2 !== undefined) o.mark2 = tlMark(c, P, "Kleopatra-Mond", X_KLEO, X_MOND, st.mark2 === true ? null : st.mark2[0], st.mark2 === true ? null : st.mark2[1], "#FFC94A");
  o.line = tlBase(c, P, st.draw ? st.draw[0] : null, st.draw ? st.draw[1] : null);
  if (st.pyr !== undefined) {
    o.pinP = tlPin(c, P, "Pyramide", X_PYR, st.pyr === true ? null : st.pyr);
    o.labP = wtxt(c, P, "ca. 2600 v. Chr.", F_NUM, 72, INK, [X_PYR, -170]); o.labP.name = "Jahr Pyramide";
    if (st.pyrLab !== undefined && st.pyrLab !== true) typeOn(o.labP, st.pyrLab, 28);
    o.cardP = wPrint(c, P, "archiv/cheops-pyramide.jpg", X_PYR, -500, 600, 420, -3, true);
    if (st.pyrCard !== undefined && st.pyrCard !== true) dropIn(o.cardP, st.pyrCard, 160, 0.4);
  }
  if (st.kleo !== undefined) {
    o.pinK = tlPin(c, P, "Kleopatra", X_KLEO, st.kleo === true ? null : st.kleo);
    o.labK = wtxt(c, P, "69 v. Chr.", F_NUM, 72, INK, [X_KLEO, -170]); o.labK.name = "Jahr Kleopatra";
    if (st.kleoLab !== undefined && st.kleoLab !== true) typeOn(o.labK, st.kleoLab, 28);
    o.cardK = cutout(c, "archiv/kleopatra-buste-frei.png", 0, 0, 500, "Kleopatra Bueste");
    place(o.cardK, P, [X_KLEO + 20, -500], o.cardK.scale.value[0], 0);
    if (st.kleoCard !== undefined && st.kleoCard !== true) popIn(o.cardK, st.kleoCard, -6);
  }
  if (st.mond !== undefined) {
    o.pinM = tlPin(c, P, "Mond", X_MOND, st.mond === true ? null : st.mond, "#2B5C8A");
    if (st.mondLab === true) { o.labM = wtxt(c, P, "1969", F_NUM, 90, INK, [X_MOND, -170]); o.labM.name = "Jahr Mondlandung"; }
    else if (st.mondLab !== undefined) { o.labM = odometer(c, "1969", F_NUM, 90, INK, [X_MOND, -170], st.mondLab, f2s(16)); place(o.labM, P, [X_MOND, -170]); o.labM.name = "Jahr Mondlandung"; }
    o.cardM = wPrint(c, P, "archiv/apollo11-aldrin.jpg", X_MOND, -520, 440, 440, 2.5, false);
    if (st.mondCard !== undefined && st.mondCard !== true) {
      keys(o.cardM.position, [st.mondCard, st.mondCard + 0.4], [[X_MOND + 900, -580], [X_MOND, -520]], [[5, 5], [95, 95]]);
      keys(o.cardM.rotation, [st.mondCard, st.mondCard + 0.4], [12, 2.5], [[5, 5], [90, 90]]);
      setIn(o.cardM, st.mondCard);
    }
  }
  return o;
}
// Mond im Hintergrund (Tiefe 0.55): steht bei Kamera auf 1969 (s 0.95) oben rechts
function moonBg(c, R, t) {
  var m = cutout(c, "archiv/mond-frei.png", 0, 0, 330, "Mond (Hintergrund)", true);
  place(m, R.p[0.55], [2839, -784], m.scale.value[0], 0);
  if (t !== undefined && t !== null) popIn(m, t, 8);
  return m;
}

// ---------- 1 Hook: Kleopatra, der Mond ganz nah, die Pyramide weit weg ----------
B.hook = function (c, k) {
  paperBase(c);
  cutout(c, "archiv/kleopatra-buste-frei.png", 400, 820, 640, "Kleopatra Bueste");
  var nm = txt(c, "Kleopatra", F_SERIF_BI, 66, INK, [400, 1200]); typeOn(nm, 0.25, 26);
  var mo = cutout(c, "archiv/mond-frei.png", 790, 420, 300, "Mond");
  popIn(mo, k.mond - f2s(4), 10);
  pencil(c, "Strich zum Mond", [line2([[590, 610], [636, 566], [676, 530]])], INK, 7, k.mond + f2s(4), f2s(12));
  printPhoto(c, "archiv/cheops-pyramide.jpg", 1200, 1480, 520, 360, 3, k.bau - f2s(2));
  var rl = shape(c, "Strich zur Pyramide"), g = grp(rl);
  addPath(g, { v: [[560, 1090], [1000, 1330]], i: [[0, 0], [-260, -20]], o: [[120, 160], [0, 0]], c: false });
  stroke(g, RED, 7, 18, 14); trimOn(g, k.bau + f2s(10), k.bau + f2s(24)); edgeBoil(rl, 7);
  creditKeys(c, ["kleopatra-buste", "mond", "cheops-pyramide"]);
  focusHunt(c, 0);
  var cam = camRig(c, 500, 760, { punchIn: 118, s0: 100, s1: 50, punchOut: false });
  keys(cam.scale, [k.bau - f2s(6), k.bau + 0.6], [[101, 101], [52, 52]], [[10, 10], [90, 90]]);
  lensLeak(c, 10);
  voxSauce(c, "archiv");
};
// ---------- 2 Klingt verrueckt? Rechnen wir nach: der Zeitstrahl zeichnet sich, Fahrt zum Anfang ----------
B.rechnen = function (c, k) {
  paperBase(c);
  var R = worldRig(c, [0.55, 1]);
  timeline(c, R, { draw: [0.03, 0.6] });
  rigPan(R, [0, 1.3], [[2700, CAMY], [250, CAMY]], [[40, 40], [92, 92]]);
  rigZoom(R, [0, 1.3], [0.42, 0.95], [[60, 60], [90, 90]]);
  var q = txt(c, "?", F_SERIF_BI, 300, RED, [870, 560]); q.name = "FIX Fragezeichen";
  q.inPoint = k.verrueckt - f2s(2); q.outPoint = k.rechnen; jitter(q, 2);
  camRig(c, CX, SCY, { punchIn: 112, s0: 100, s1: 102 });
  voxSauce(c, "grafik");
};
// ---------- 3 Cheops-Pyramide: Abzug mit gerissenem Rand faellt ein, Nadel, Jahreszahl tippt ----------
B.pyramide = function (c, k) {
  paperBase(c);
  var R = worldRig(c, [0.55, 1]);
  timeline(c, R, { pyr: k.aegypten - f2s(2), pyrLab: k.zahl, pyrCard: 0.12 });
  rigPan(R, [0, c.duration], [[0, CAMY], [90, CAMY]], 30);
  rigZoom(R, [0, c.duration], [0.98, 1.04], 30);
  var ul = pencil(c, "Unterstrich Jahr", [line2([[X_PYR - 250, -152], [X_PYR - 40, -146], [X_PYR + 250, -154]])], RED, 7, 3.15, f2s(12));
  place(ul, R.p[1], [0, 0]);
  sourceBar(c, "Cheops-Pyramide", "Ägypten", k.cheops, 300);
  focusHunt(c, 0.12);
  var cam = camRig(c, CX, SCY, { punchIn: 114, s0: 100, s1: 104 });
  punchAt(cam, k.zahl - f2s(2), 1.05);
  creditKeys(c, ["cheops-pyramide"]);
  voxSauce(c, "archiv");
};
// ---------- 4 Fahrt zu Kleopatra: Textmarker laeuft mit der Kamera, Zaehler bis ~2.500 ----------
B.kleo = function (c, k) {
  paperBase(c);
  var R = worldRig(c, [0.55, 1]);
  var P = [[20, 20], [85, 85]], t0 = 0.1, t1 = 1.9;
  var m1 = [t0, t1]; m1.infl = P;
  timeline(c, R, { mark1: m1, pyr: true, pyrLab: true, pyrCard: true, kleo: 1.85, kleoLab: k.jahre + f2s(2), kleoCard: 2.4 });
  rigPan(R, [t0, t1], [[90, CAMY], [X_KLEO, CAMY]], P);
  rigZoom(R, [t0, 1.0, t1], [1.04, 0.62, 0.92], [[20, 20], [50, 50], [85, 85]]);
  var n = counterF(c, 0, 2500, t0, t1, F_NUM, 150, INK, [CX, 380], "~"); n.name = "FIX Zaehler 2500";
  yellowPop(n, t1 + f2s(2));
  var j = txt(c, "Jahre", F_SERIF_I, 58, INK, [CX, 448]); j.name = "FIX Jahre"; j.inPoint = t0;
  var cam = camRig(c, CX, SCY, { punchIn: 116, s0: 100, s1: 104 });
  punchAt(cam, k.jahre - f2s(2), 1.04);
  creditKeys(c, ["cheops-pyramide", "kleopatra-buste"]);
  voxSauce(c, "grafik");
};
// ---------- 5 Die Pyramide ist laengst uralt: Kreide-Zeichnung auf dunklem Papier, Risse, alter Film ----------
B.uralt = function (c, k) {
  paperBase(c, true);
  var ap = [540, 400], bl = [120, 1080], br = [960, 1080], mid = [640, 1080];
  pencil(c, "Pyramide Umriss", [line2([bl, ap, br]), line2([[60, 1084], [1020, 1078]])], CHALK, 8, 0.03, f2s(16));
  var courses = [];
  for (var i = 1; i <= 7; i++) {
    var y = 400 + i * 85, f = (y - 400) / 680;
    courses.push(line2([[540 - 420 * f + 6, y], [540 + 420 * f - 6, y + 2]]));
  }
  pencil(c, "Pyramide Steinlagen", courses, CHALK, 4, 0.2, f2s(14));
  pencil(c, "Pyramide Kante", [line2([ap, mid])], CHALK, 5, 0.3, f2s(10));
  var lab = txt(c, "~2.500 Jahre alt", F_SERIF_BI, 72, CHALK, [CX, 1235]); typeOn(lab, k.laengst - f2s(1), 40);
  var cr = [line2([[470, 560], [500, 640], [470, 700], [505, 790]]), line2([[700, 760], [660, 840], [700, 900], [668, 990]]), line2([[330, 930], [380, 975], [360, 1040]])];
  pencil(c, "Risse", cr, "#E2463A", 6, k.uralt - f2s(2), f2s(9));
  // alter Film ab "uralt": starkes Flackern, Sepia, Kratzer
  var old = adj(c, "FIX alter Film");
  var ex = addFx(old, "ADBE Exposure2"); if (ex) exprP(ex, ["Exposure"], "wiggle(14,.2)");
  var tn = addFx(old, "ADBE Tint"); if (tn) { setP(tn, ["Map Black To"], rgb("#1E150C")); setP(tn, ["Map White To"], rgb("#F3E2C0")); setP(tn, ["Amount to Tint"], 70); }
  old.inPoint = k.uralt - f2s(2);
  var sc = shape(c, "FIX Kratzer"), gs = grp(sc);
  addPath(gs, line2([[300, 0], [304, 1920]])); addPath(gs, line2([[760, 0], [757, 1920]])); stroke(gs, CHALK, 2);
  sc.opacity.setValue(35); sc.inPoint = k.uralt - f2s(2);
  sc.position.expression = "posterizeTime(8); seedRandom(Math.floor(time*8), true); [random(-260, 260), 0]";
  var cam = camRig(c, CX, 800, { punchIn: 120, s0: 100, s1: 106 });
  punchAt(cam, k.uralt - f2s(1), 1.06);
  voxSauce(c, "archiv");
};
// ---------- 6 Mitte-Aufruf: ruhige Fahrt weiter, Folgen-Knopf wird geklickt ----------
B.folge = function (c, k) {
  paperBase(c);
  var R = worldRig(c, [0.55, 1]);
  timeline(c, R, { mark1: true, pyr: true, pyrLab: true, pyrCard: true, kleo: true, kleoLab: true, kleoCard: true });
  rigPan(R, [0, c.duration], [[X_KLEO, CAMY], [X_KLEO + 420, CAMY]], 40);
  rigZoom(R, [0, c.duration], [0.92, 0.78], 40);
  followBtn(c, CX, 330, 0.08, 0.95);
  camRig(c, CX, SCY, { punchIn: 108, s0: 100, s1: 102 });
  creditKeys(c, ["kleopatra-buste"]);
  voxSauce(c, "grafik");
};
// ---------- 7 bis zur Mondlandung 1969: Zoom raus, Fahrt, Zoom rein; Apollo-Foto schiesst rein, Jahreszahl rollt ----------
B.mond = function (c, k) {
  paperBase(c);
  var R = worldRig(c, [0.55, 1]);
  var mb = moonBg(c, R, k.mond - f2s(3));
  var o = timeline(c, R, { mark1: true, pyr: true, pyrLab: true, pyrCard: true, kleo: true, kleoLab: true, kleoCard: true,
                   mond: 2.05, mondLab: k.zahl - f2s(2), mondCard: k.mond - f2s(2) });
  mb.moveBefore(o.grid);   // Mond ueber dem Raster, unter dem Zeitstrahl
  rigPan(R, [0.2, 2.5], [[X_KLEO + 420, CAMY], [X_MOND, CAMY]], [[40, 40], [85, 85]]);
  rigZoom(R, [0.2, 1.25, 2.5], [0.78, 0.36, 0.95], [[40, 40], [60, 60], [85, 85]]);
  camRig(c, CX, SCY, { punchIn: 112, s0: 100, s1: 103 });
  creditKeys(c, ["apollo11-aldrin", "mond", "kleopatra-buste"]);
  voxSauce(c, "grafik");
};
// ---------- 8 Nur etwa 2.000 Jahre: zweiter Textmarker, Ziffern rollen ein ----------
B.zweitausend = function (c, k) {
  paperBase(c);
  var R = worldRig(c, [0.55, 1]);
  var mb = moonBg(c, R, null);
  var o = timeline(c, R, { mark1: true, mark2: [0.08, 0.6], pyr: true, pyrLab: true, pyrCard: true, kleo: true, kleoLab: true, kleoCard: true, mond: true, mondLab: true, mondCard: true });
  mb.moveBefore(o.grid);
  rigPan(R, [0], [[3570, CAMY]]);
  rigZoom(R, [0, c.duration], [0.43, 0.39], 40);
  var n = odometer(c, "~2.000", F_NUM, 150, INK, [CX, 380], k.zahl - f2s(4), f2s(14)); n.name = "FIX Zahl 2000";
  var j = txt(c, "Jahre", F_SERIF_I, 58, INK, [CX, 448]); j.name = "FIX Jahre"; j.inPoint = k.zahl;
  camRig(c, CX, SCY, { punchIn: 116, s0: 100, s1: 104 });
  creditKeys(c, ["kleopatra-buste", "apollo11-aldrin", "mond"]);
  voxSauce(c, "grafik");
};
// ---------- 9 Die Pyramide war fuer Kleopatra aelter als Kleopatra heute fuer uns: Balken klappen am Gelenk Kleopatra ----------
// Einheiten = Jahre; Gelenk (Kleopatra) bei 0. Balken A: Pyramide -> Kleopatra (2531), Balken B: Kleopatra -> heute (2095).
function ellPath(cx, cy, rx, ry) {
  var kx = 0.5523 * rx, ky = 0.5523 * ry;
  return { v: [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]], i: [[-kx, 0], [0, -ky], [kx, 0], [0, ky]], o: [[kx, 0], [0, ky], [-kx, 0], [0, -ky]], c: true };
}
function barsDiagram(c, k, anim) {
  var S0 = 0.2, S1 = 0.34, P0 = [583, 860], P1 = [950, 860];
  var d = c.layers.addNull(c.duration); d.name = "Diagramm"; d.anchorPoint.setValue([0, 0]);
  if (anim) { keys(d.scale, [k.f0, k.f1], [[S0 * 100, S0 * 100], [S1 * 100, S1 * 100]], [[40, 40], [85, 85]]); keys(d.position, [k.f0, k.f1], [P0, P1], [[40, 40], [85, 85]]); linPath(d.position); }
  else { d.scale.setValue([S1 * 100, S1 * 100]); d.position.setValue(P1); }
  var A = shape(c, "Balken Pyramide-Kleopatra"); place(A, d, [0, 0]);
  var ga = grp(A); addPath(ga, line2([[0, 0], [-2531, 0]])); var sa = stroke(ga, YEL, 150);
  try { sa.property("ADBE Vector Stroke Line Cap").setValue(1); } catch (e) {}
  if (anim) trimOn(ga, 0.08, 0.5);
  A.blendingMode = BlendingMode.MULTIPLY;
  var Bb = shape(c, "Balken Kleopatra-heute"); place(Bb, d, [0, 0]);
  var gb = grp(Bb); addPath(gb, line2([[0, 0], [2095, 0]])); var sb = stroke(gb, "#F2A65A", 150);
  try { sb.property("ADBE Vector Stroke Line Cap").setValue(1); } catch (e2) {}
  if (anim) { trimOn(gb, 0.25, 0.65); keys(Bb.scale, [k.f0, k.f1], [[100, 100], [-100, 100]], [[40, 40], [85, 85]]); keys(Bb.position, [k.f0, k.f1], [[0, 0], [0, 300]], [[40, 40], [85, 85]]); }
  else { Bb.scale.setValue([-100, 100]); Bb.position.setValue([0, 300]); }
  Bb.blendingMode = BlendingMode.MULTIPLY;
  edgeBoil(A, 8); edgeBoil(Bb, 8);
  var hinge = shape(c, "Gelenk"); place(hinge, d, [0, 0]); var gh = grp(hinge); ellipseG(gh, 70, 70, 0, 0); fill(gh, RED); stroke(gh, INK, 14);
  var tj = wtxt(c, d, "~2.500 Jahre", F_SERIF_BI, 150, INK, [-1265, -150]);
  if (anim) typeOn(tj, 0.6, 30);
  var kb = cutout(c, "archiv/kleopatra-buste-frei.png", 0, 0, 520, "Kleopatra klein");
  place(kb, d, [0, -340], kb.scale.value[0], 0);
  if (anim) popIn(kb, 0.2, -6);
  var pt = wPrint(c, d, "archiv/cheops-pyramide.jpg", -2350, -330, 480, 330, -3, true);
  if (anim) popIn(pt, k.pyramide - f2s(4), 5);
  var circ = pencil(c, "Kreis Ueberschuss", [ellPath(-2313, 40, 330, 240)], RED, 22, anim ? k.aelter + f2s(2) : null, f2s(13));
  place(circ, d, [0, 0]);
  var he = wtxt(c, d, "heute", F_SERIF_BI, 150, INK, [-2215, 350], ParagraphJustification.RIGHT_JUSTIFY);
  if (anim) typeOn(he, k.heute - f2s(3), 30);
  return d;
}
B.balken = function (c, k) {
  paperBase(c);
  k.f0 = 1.5; k.f1 = 2.15;
  barsDiagram(c, k, true);
  var cam = camRig(c, CX, 880, { punchIn: 114, s0: 100, s1: 104 });
  punchAt(cam, k.kleo2 - f2s(2), 1.04);
  creditKeys(c, ["cheops-pyramide", "kleopatra-buste"]);
  voxSauce(c, "grafik");
};
// ---------- Karte Mittelmeer (Natural Earth, gemeinfrei), einmal gebaut, zweimal benutzt ----------
var MAPK = null, MS = 0.76, MX = 540, MY = 830;
function mapComp() {
  if (MAPK) return MAPK;
  var K = D.karte, c = mkComp("Mittelmeer Karte (Natural Earth)", K.w, K.h, D.end, fPre);
  solid(c, "Meer", "#DCE5E1");
  var tx = imp("tex/paper300.jpg"); if (tx) { var tl = cover(c, tx, 1.0); tl.blendingMode = BlendingMode.MULTIPLY; tl.opacity.setValue(55); }
  var land = shape(c, "Land"), g = grp(land, "Flaechen");
  for (var r = 0; r < K.land.length; r++) addPath(g, line2(K.land[r], true));
  fill(g, "#EFE5CC");
  var cs = shape(c, "Kueste"), g2 = grp(cs, "Kueste");
  for (var r2 = 0; r2 < K.land.length; r2++) addPath(g2, line2(K.land[r2], true));
  stroke(g2, INK, 3.5);
  edgeBoil(cs, 4);
  return MAPK = c;
}
function mapPt(p) { var K = D.karte; return [(p[0] - K.w / 2) * MS + MX, (p[1] - K.h / 2) * MS + MY]; }
function mapLayer(c) {
  var L = addItem(c, mapComp(), MX, MY, MS * 100); L.name = "Karte Mittelmeer";
  var ds = addFx(L, "ADBE Drop Shadow"); if (ds) { setP(ds, ["Opacity"], 80); setP(ds, ["Distance"], 10); setP(ds, ["Softness"], 30); }
  return L;
}
// ---------- 10 Doch es wird noch seltsamer: die Balken-Seite blaettert um, darunter die Karte ----------
B.seltsam = function (c, k) {
  paperBase(c);
  mapLayer(c);
  var pc = mkComp("Balken Seite", W, H, c.duration, fPre);
  paperBase(pc); barsDiagram(pc, {}, false);
  var L = addItem(c, pc, CX, H / 2, 100); L.name = "Balken Seite";
  pageTurn(L, 0.05, 0.7, W, H);
  L.outPoint = 0.75 + f2s(9);
  var cam = camRig(c, MX, MY, { punchIn: false, s0: 100, s1: 104 });
  punchAt(cam, k.seltsamer, 1.06);
  creditKeys(c, [], "Karte: Natural Earth, gemeinfrei");
  voxSauce(c, "grafik");
};
// ---------- 11 Koenigin Aegyptens aus einer Familie von Griechen: Aegypten brennt frei, Route Makedonien -> Alexandria ----------
function dot(c, name, p, t, color) {
  var l = shape(c, name), g = grp(l); ellipseG(g, 30, 30, 0, 0); fill(g, color || RED); stroke(g, "#FFFFFF", 5);
  l.position.setValue(p); popIn(l, t); return l;
}
B.griechen = function (c, k) {
  paperBase(c);
  mapLayer(c);
  var eg = shape(c, "Aegypten"), ge = grp(eg);
  for (var r = 0; r < D.karte.egypt.length; r++) { var ring = [], src = D.karte.egypt[r]; for (var i = 0; i < src.length; i++) ring.push(mapPt(src[i])); addPath(ge, line2(ring, true)); }
  fill(ge, "#E8A93A"); stroke(ge, "#9A6A1E", 3); eg.blendingMode = BlendingMode.MULTIPLY; eg.opacity.setValue(85);
  eg.inPoint = k.aegyptens - 0.15; burnReveal(eg, k.aegyptens - 0.15);
  var A = mapPt(D.karte.orte["Alexandria"]), Pe = mapPt(D.karte.orte["Pella"]);
  dot(c, "Punkt Alexandria", A, k.koenigin - f2s(4));
  var kb = cutout(c, "archiv/kleopatra-buste-frei.png", A[0] + 10, A[1] - 175, 300, "Kleopatra auf der Karte");
  popIn(kb, k.koenigin - f2s(2), -8);
  var la = txt(c, "Alexandria", F_SERIF_BI, 54, INK, [A[0] - 40, A[1] + 70]); typeOn(la, k.koenigin + 0.2, 30);
  var rt = shape(c, "Route"), gr = grp(rt);
  addPath(gr, { v: [Pe, [A[0] - 8, A[1] - 14]], i: [[0, 0], [-40, -170]], o: [[170, 110], [0, 0]], c: false });
  stroke(gr, RED, 8, 20, 14);
  trimOn(gr, k.familie - f2s(3), k.familie + 0.5);
  try { rt.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group").property("ADBE Vector Graphic - Stroke").property("ADBE Vector Stroke Dashes").property("ADBE Vector Stroke Offset").expression = "time*-40"; } catch (e) {}
  edgeBoil(rt, 8);
  dot(c, "Punkt Pella", Pe, k.familie - f2s(6), INK);
  var lm = txt(c, "Makedonien", F_SERIF_BI, 54, INK, [Pe[0] + 10, Pe[1] - 34]); typeOn(lm, k.familie - f2s(3), 30);
  camRig(c, CX, 830, { punchIn: 112, s0: 100, s1: 106 });
  creditKeys(c, ["kleopatra-buste"], "Karte: Natural Earth");
  voxSauce(c, "grafik");
};
// ---------- 12 Vorfahre war General von Alexander dem Grossen: Mosaik, Bueste Ptolemaios, Contrast Callout aufs Gesicht ----------
B.alexander = function (c, k) {
  paperBase(c);
  var FACE = [410, 450];
  printPhoto(c, "archiv/alexander-mosaik.jpg", CX, 600, 1000, 640, -1.5, 0);
  var pt = cutout(c, "archiv/ptolemaios-i-frei.png", 290, 1030, 540, "Ptolemaios I.");
  popIn(pt, k.vorfahre - f2s(2), 6);
  label(c, "General Ptolemaios", 730, 1010, 54, k.general - f2s(2), INK);
  contrastCallout(c, k.alexander, c.duration, FACE[0], FACE[1], 150, 175, false);
  var nm = txt(c, "Alexander der Große", F_SERIF_BI, 52, INK, [730, 232]); typeOn(nm, k.alexander + f2s(3), 30);
  focusHunt(c, 0);
  var cam = camRig(c, FACE[0], FACE[1], { punchIn: 116, s0: 100, s1: 105 });
  punchAt(cam, k.alexander, 1.08);
  creditKeys(c, ["alexander-mosaik", "ptolemaios-i"]);
  voxSauce(c, "archiv");
};
// ---------- 13 Am Hof sprach man Griechisch, ueber 200 Jahre: griechische Inschrift, Lupe faehrt ueber die Zeilen ----------
B.hof = function (c, k) {
  paperBase(c);
  var gi = imp("archiv/griechisch-rosette.jpg");
  var sc = mkComp("Griechisch Scan", gi ? gi.width : 1401, gi ? gi.height : 550, c.duration, fPre);
  solid(sc, "Papier Scan", "#F4EEDF");
  if (gi) { var gl = addItem(sc, gi, sc.width / 2, sc.height / 2, 100); gl.blendingMode = BlendingMode.MULTIPLY; }
  var tx = imp("tex/paper338.jpg"); if (tx) { var tl = cover(sc, tx, 1.0); tl.blendingMode = BlendingMode.MULTIPLY; tl.opacity.setValue(50); }
  var SS = 0.74, SP = [CX, 700];
  var L = addItem(c, sc, SP[0], SP[1], SS * 100); L.name = "Griechische Inschrift";
  var re = addFx(L, "ADBE Roughen Edges", "Papierriss"); if (re) { setP(re, ["Border"], 14); setP(re, ["Scale"], 30); setP(re, ["Complexity"], 4); }
  var ds = addFx(L, "ADBE Drop Shadow"); if (ds) { setP(ds, ["Opacity"], 90); setP(ds, ["Distance"], 12); setP(ds, ["Softness"], 30); }
  // Lupe: Precomp mit doppelt vergroessertem Scan, Position gegenlaeufig zur Lupe (gleiche Keys, gleiches Easing)
  var M = 2.0, LR = 180, lc = mkComp("Lupe", LR * 2, LR * 2, c.duration, fPre);
  solid(lc, "Lupe Grund", "#F4EEDF");
  var inner = addItem(lc, sc, LR, LR, SS * M * 100); inner.name = "Scan vergroessert";
  var LT = [0.35, 1.0, 1.75], LP = [[300, 640], [620, 770], [800, 660]], IP = [], EI = [[20, 20], [60, 60], [85, 85]];
  for (var i = 0; i < LP.length; i++) IP.push([LR - (LP[i][0] - SP[0]) * M, LR - (LP[i][1] - SP[1]) * M]);
  keys(inner.position, LT, IP, EI); linPath(inner.position);
  var lu = addItem(c, lc, LP[0][0], LP[0][1], 100); lu.name = "Lupe";
  var mk = lu.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  mk.property("ADBE Mask Shape").setValue(mkShape(ellPath(LR, LR, LR - 8, LR - 8)));
  keys(lu.position, LT, LP, EI); linPath(lu.position);
  var ld = addFx(lu, "ADBE Drop Shadow"); if (ld) { setP(ld, ["Opacity"], 100); setP(ld, ["Distance"], 18); setP(ld, ["Softness"], 36); }
  lu.inPoint = 0.3;
  var ring = shape(c, "Lupe Ring"); place(ring, lu, [LR, LR]);
  var g1 = grp(ring, "Ring"); ellipseG(g1, LR * 2 - 10, LR * 2 - 10, 0, 0); stroke(g1, INK, 14);
  var g2 = grp(ring, "Griff"); addPath(g2, line2([[LR * 0.7, LR * 0.7], [LR * 1.45, LR * 1.45]])); stroke(g2, INK, 30);
  ring.inPoint = 0.3; edgeBoil(ring, 12);
  // ueber 200 Jahre
  var u = txt(c, "über", F_SERIF_I, 66, INK, [235, 1200]); u.inPoint = k.zahl - f2s(2);
  var z = txt(c, "200", F_NUM, 210, INK, [530, 1232]); slam(z, k.zahl - f2s(2)); yellowPop(z, k.zahl + f2s(1));
  var j = txt(c, "Jahre", F_SERIF_I, 66, INK, [830, 1200]); j.inPoint = k.jahre - f2s(2);
  focusHunt(c, 0, true);
  camRig(c, CX, 820, { punchIn: 116, s0: 100, s1: 105 });
  creditKeys(c, ["rosetta"]);
  voxSauce(c, "archiv");
};
// ---------- 14 Erste ihrer Familie, die Aegyptisch lernte: Kreide-Koepfe vor unscharfen Hieroglyphen, dann scharf ----------
B.aegyptisch = function (c, k) {
  solid(c, "Grund dunkel", DARK);
  var hi = imp("archiv/hieroglyphen.jpg"), ta = k.aeg - f2s(1);
  if (hi) {
    var h = addItem(c, hi, 137, 960, 1920 / hi.height * 100); h.name = "Hieroglyphen";
    var bb = addFx(h, "ADBE Box Blur2", "Fokus"); if (bb) { setP(bb, ["Iterations"], 3); var br = findP(bb, ["Blur Radius"]); if (br) keys(br, [ta, ta + f2s(4), ta + f2s(8), ta + f2s(13)], [26, 0, 8, 0], 50); }
    var bc = addFx(h, "ADBE Brightness & Contrast 2"); if (bc) { var bp = findP(bc, ["Brightness"]); if (bp) keys(bp, [ta, ta + f2s(9)], [-48, 0], 60); setP(bc, ["Contrast"], 10); }
    chroma(h, 2);
  }
  var heads = [];
  for (var i = 0; i < 6; i++) {
    var hd = pencil(c, "Kopf " + (i + 1), headPaths(140 + i * 144, 800, 44), CHALK, 6, 0.05 + i * f2s(4), f2s(12));
    heads.push(hd);
    if (i < 5) keys(hd.opacity, [k.familie, k.familie + f2s(8), ta - f2s(3), ta + f2s(5)], [100, 30, 30, 0], 60);
  }
  var circ = pencil(c, "Kreis Kleopatra", [ellPath(860, 840, 120, 140)], "#E2463A", 8, k.erste - f2s(2), f2s(12));
  var nm = txt(c, "Kleopatra", F_SERIF_BI, 56, CHALK, [860, 1040]); typeOn(nm, k.erste + f2s(3), 30);
  var last = [heads[5], circ, nm];
  for (var g = 0; g < last.length; g++) keys(last[g].opacity, [ta - f2s(3), ta + f2s(5)], [100, 0], 60);
  sourceBar(c, "Laut Plutarch", null, k.soll - f2s(3), 300);
  var cam = camRig(c, 700, 600, { punchIn: 112, s0: 100, s1: 106 });
  punchAt(cam, ta, 1.06);
  creditKeys(c, ["hieroglyphen"]);
  voxSauce(c, "archiv");
};
// ---------- 15 Haettest du das gewusst? Bueste ganz nah, langsamer Push-in ----------
B.gewusst = function (c, k) {
  paperBase(c);
  cutout(c, "archiv/kleopatra-buste-frei.png", 400, 1060, 1500, "Kleopatra nah");
  var q = txt(c, "?", F_SERIF_BI, 300, RED, [900, 560]); popIn(q, 0.25, 12);
  focusHunt(c, 0, true);
  camRig(c, 600, 900, { punchIn: 114, s0: 100, s1: 110, punchOut: false });
  creditKeys(c, ["kleopatra-buste"]);
  voxSauce(c, "archiv");
};
// ---------- 16 Schluss: grosses Logo, Bio-Hinweis, Folgen-Klick ----------
B.outro = function (c, k) {
  paperBase(c);
  pencil(c, "Kreis Logo", [ellPath(CX, 640, 260, 260)], INK, 7, 0.02, f2s(15));
  var lg = imp("archiv/logo.png");
  if (lg) { var lo = addItem(c, lg, CX, 640, 420 / lg.width * 100); lo.name = "Logo gross"; popIn(lo, k.allgemeinwissen - f2s(4)); }
  var lk = txt(c, "Link in der Bio", F_SERIF_BI, 76, INK, [CX, 1010]); typeOn(lk, k.bio - f2s(4), 30);
  pencil(c, "Unterstrich Bio", [line2([[700, 1032], [800, 1036], [880, 1030]])], RED, 7, k.bio + 0.45, f2s(10));
  followBtn(c, CX, 1160, k.bio + 0.6, k.folgen + f2s(3));
  camRig(c, CX, 900, { punchIn: 116, s0: 100, s1: 104, punchOut: false });
  voxSauce(c, "grafik");
};
