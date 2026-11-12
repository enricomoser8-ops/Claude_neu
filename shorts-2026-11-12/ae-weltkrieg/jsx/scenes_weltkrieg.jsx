// ===================== Szenen: Short 2 vom 12.11.2026 "Der Erste Weltkrieg beginnt mit einem Auto, das falsch abbiegt" =====================
// Jede Szene: eigene Comp 1080x1920, Papiergrund, Inhalt, Kamera-Null (Punch-Cut), Vox-Sauce passend zum Material.
// k = Zeiten der Schluesselwoerter relativ zum Szenenanfang (aus gen/gen_weltkrieg.py). Rueckgrat: Stadtplan-Skizze.
// Kein Gewaltbild: Schuesse nur als zwei Weissblitze + Entsaettigung, der Taeter nur als gesichtslose Silhouette, kein Name.
var B = {};
var IMG = D.img;
var SX = PL.side_x;                         // Seitenstrasse (falsch abgebogen)
var GAP = 128;                              // Abstand der Wagen in der Kolonne (Plan-Pixel)
var X_BOMB = PL.xc;                         // Bombe an der Cumurija-Bruecke
var CORNER = [SX, qy(SX) - 150];            // Ecke an der Lateinerbruecke, hier steht der Wagen still
var UP = [SX, qy(SX) - 360];                // so weit faehrt er in die Seitenstrasse

// Kolonne: Wagen i steht/faehrt i*GAP hinter der Spitze; Thronfolger-Wagen = Index 2
function convoy(c, P, n, main, ic) {
  var L = [];
  for (var i = 0; i < n; i++) L.push(carIcon(c, i === main ? "Wagen Thronfolger" : "Wagen " + (i + 1), i === main, P.s * (ic || 1)));
  return L;
}
function quayScreen(P, xa, xb) { return ppl(P, quay(xa, xb)); }
// Bogenwurf als Hold-Keys (12 fps) mit Drehung
function arcKeys(l, A, Bp, h, t0, t1, spin) {
  var n = Math.max(2, Math.round((t1 - t0) * 12));
  for (var i = 0; i <= n; i++) {
    var u = i / n, t = t0 + (t1 - t0) * u;
    hold(l.position, t, [A[0] + (Bp[0] - A[0]) * u, A[1] + (Bp[1] - A[1]) * u - 4 * h * u * (1 - u)]);
    if (spin) hold(l.rotation, t, spin * u);
  }
  noteAnim(l.position, t1, l);
}
function spitalIcon(c, P, t, big) {
  var at = pp(P, [PL.x_kh, ry(PL.x_kh) - 150]), z = P.s * 1.25 * (big || 1);
  var l = bldg(c, "Krankenhaus", SH.spital, at[0], at[1], z);
  if (t !== null && t !== undefined) popIn(l, t);
  redCross(c, "Krankenhaus Kreuz", at[0], at[1] - SH.spital.h * z - 46 * z, (t === null || t === undefined) ? null : t + f2s(6), big ? z / (P.s * 1.25) : 1);
  return l;
}

// ---------- 1 Hook: Archivfoto des offenen Wagens, roter Pfeil biegt ab ----------
// Runde 2: Das Foto gibt es nur mit 800 px (Commons-Original) -> kleiner gezeigt (max. ~120 % echte Pixel), Pfeil weiter innen.
B.hook = function (c, k) {
  paperBase(c);
  printPhoto(c, IMG.hook, CX, 760, 700, 600, -2, 0);
  arrowPath(c, "Pfeil falsch abbiegen", [[820, 1150], [580, 1162], [380, 1144], [262, 1072], [232, 990]], RED, 10, k.falsch - f2s(5), f2s(15), true);
  focusHunt(c, 0);
  credit(c, D.credits[IMG.hookKey]);
  var cam = camRig(c, CX, 820, { punchIn: false, s0: 100, s1: 106 });
  punchAt(cam, k.weltkrieg, 1.06);
  lensLeak(c, 10);
  voxSauce(c, "archiv");
};
// ---------- 2 Sarajevo 1914: Europa-Karte brennt frei, Kamera taucht auf Sarajevo ----------
B.sarajevo = function (c, k) {
  paperBase(c);
  var sj = EU.cities.Sarajevo, E = euAt(c, sj[0], sj[1], CX, 940, 0.62);
  inkReveal(E.L, 0, 0.35);                     // Runde 2: saubere Blende statt CC Burn Film (graue Flecken bei 3,5 s)
  var pin = shape(c, "Pin Sarajevo"), gp = grp(pin); ellipseG(gp, 18, 18, 0, 0); fill(gp, RED); stroke(gp, "#FFFFFF", 3);
  pin.position.setValue([CX, 940]); popIn(pin, k.sarajevo + f2s(2));
  var nm = txt(c, "SARAJEVO", F_MONO, 76, INK, [CX, 760], ParagraphJustification.CENTER_JUSTIFY, 80); nm.name = "FIX Ort";
  typeOn(nm, k.sarajevo + f2s(4), 26);
  var yr = odometer(c, "1914", F_NUM, 200, INK, [CX, 600], k.jahr - f2s(4), f2s(16), true); yr.name = "FIX Jahr 1914";   // Runde 3: snap (kein Splitter)
  var cam = camRig(c, CX, 940, { punchIn: false, s0: 100, s1: 250, punchOut: false });
  keys(cam.scale, [0.12, k.jahr - f2s(2)], [[100, 100], [250, 250]], [[30, 30], [90, 90]]);
  voxSauce(c, "grafik");
};
// ---------- 3 Franz Ferdinand, Thronfolger (Foto vom 28. Juni 1914) ----------
// Runde 2: Foto 740 px breit (passt mit Kamera-Zoom um Franz Ferdinand in 60..1020), Fokus-Unschaerfe nur noch 0,3 s.
B.thron = function (c, k) {
  paperBase(c);
  var PX = [CX + 15, 800, 740, 640], F = photoXY(IMG.thron, PX[0], PX[1], PX[2], PX[3], 936 / 1280, 176 / 700);   // Franz Ferdinand im Abzug
  printPhoto(c, IMG.thron, PX[0], PX[1], PX[2], PX[3], 1.5, 0);
  sourceBar(c, "Sarajevo", "28. Juni 1914", 0.1, 300);
  var circ = [];
  for (var a = 0; a <= 26; a++) { var an = -1.9 + a / 26 * Math.PI * 2.15; circ.push([F[0] + Math.cos(an) * (70 + a * 0.5), F[1] + 24 + Math.sin(an) * (100 + a * 0.4)]); }
  pencil(c, "Kreis Franz Ferdinand", [line2(circ)], RED, 8, k.franz + f2s(6), f2s(14));
  // Runde 3: Pfeil nicht mehr durch "Ferdinand": startet rechts neben dem Namen und laeuft aussen herum zum Kreis
  var tl0 = k.franz + f2s(26);
  label(c, "Franz Ferdinand", 470, 462, 62, tl0, INK);
  arrowPath(c, "Pfeil Franz Ferdinand", [[792, 428], [842, 470], [852, 540], [F[0] + 58, F[1] - 72]], INK, 5, tl0 + 0.25, f2s(14), true);
  var th = txt(c, "Thronfolger", F_SERIF_I, 52, GREY, [470, 530]); typeOn(th, k.kaiser - f2s(3), 30);
  yellowPop(th, k.oesterreich);
  focalBlur(c, 0, 0.3, [F[0] - 160, F[1]], [F[0], F[1]], 10);
  credit(c, D.credits[IMG.thronKey]);
  var cam = camRig(c, F[0], F[1], { punchIn: 116, s0: 100, s1: 106 });
  voxSauce(c, "archiv");
};
// ---------- 4 der offene Wagen ----------
// Runde 4 (Review 3): kein Kontrast-Callout mehr (die helle Wolke ausserhalb der Ellipse liess das Foto weich und die Mitte
// wie einen dunklen Fleck wirken). Foto kleiner als gerahmter Abzug (~53 % der echten Pixel), Label "offener Wagen" mit Pfeil,
// darunter faehrt das Wagen-Symbol der folgenden Stadtplan-Szenen durchs Bild (kein leeres Papier).
B.wagen = function (c, k) {
  paperBase(c);
  var PX = [CX, 690, 620, 400];
  var fr = printPhoto(c, IMG.wagen, PX[0], PX[1], PX[2], PX[3], -1.5, 0);
  keys(fr.position, [0, 0.4], [[CX, 790], [CX, 690]], [[10, 10], [92, 92]]);
  var lb = txt(c, "offener Wagen", F_SERIF_BI, 52, INK, [380, 1010]); lb.name = "Label offener Wagen"; typeOn(lb, k.offenen, 30);
  arrowPath(c, "Pfeil offener Wagen", [[566, 958], [572, 902], [578, 848], [586, 792]], RED, 6, k.offenen + 0.2, f2s(10), true);
  var car = carIcon(c, "Wagen Symbol", true, 2.3);
  drive(car, [[250, 1170], [520, 1168], [800, 1170]], k.wagen - f2s(3), k.stadt + f2s(2), 0, "out");
  credit(c, D.credits[IMG.wagenKey]);
  var cam = camRig(c, CX, 800, { punchIn: 120, s0: 100, s1: 105 });
  punchAt(cam, k.offenen, 1.05);
  voxSauce(c, "archiv");
};
// ---------- 5 ein junger Mann wirft eine Bombe (Stadtplan, Kolonne am Appel-Kai) ----------
// Runde 3: naeher ran (Plan 1,0 statt 0,78), Symbole 1,4x groesser, Schatten unter den Untertiteln.
B.bombe = function (c, k) {
  paperBase(c);
  var IC = 1.4, P = planAt(c, X_BOMB - 40, qy(X_BOMB) - 20, CX, 860, 1.0);
  planLabels(c, P, CX, 1.2, null, 44, { "Appel-Kai": 330 });     // Runde 4: links, nicht unter der Silhouette des Werfers
  var path = quayScreen(P, 260, X_BOMB + 2 * GAP), cars = convoy(c, P, 5, 2, IC), tEnd = k.bombe - f2s(1);
  for (var i = 0; i < cars.length; i++) drive(cars[i], path, 0, tEnd, i * GAP * P.s, "out");
  var sp = pp(P, [X_BOMB + 170, ry(X_BOMB + 170) - 52]);
  var sil = silhouetteIcon(c, "Silhouette", sp[0], sp[1], 0.5 * P.s * 1.3 * 1.25);
  popIn(sil, k.mann - f2s(3));
  var bm = bombIcon(c, "Bombe"); bm.scale.setValue([P.s * 100 * IC, P.s * 100 * IC]);
  var F = pp(P, [X_BOMB, qy(X_BOMB)]);
  bm.inPoint = k.wirft;
  arcKeys(bm, [sp[0], sp[1] - 90 * P.s], F, 120, k.wirft, tEnd, 540);
  var cam = camRig(c, CX, 860, { punchIn: 118, s0: 100, s1: 105 });
  punchAt(cam, k.wirft, 1.06);
  subShade(c);
  voxSauce(c, "grafik");
};
// ---------- 6 sie prallt ab, explodiert vor dem Wagen dahinter ----------
// Runde 3: Symbole 1,25x groesser (Wagen, Bombe, Explosion, Kreuze), Schatten unter den Untertiteln.
B.abprall = function (c, k) {
  paperBase(c);
  var IC = 1.25, P = planAt(c, X_BOMB + 20, qy(X_BOMB), CX, 820, 1.3);
  planLabels(c, P, CX, 1.16, null, 44);
  var path = quayScreen(P, 260, X_BOMB + 2 * GAP), cars = convoy(c, P, 5, 2, IC);
  for (var i = 0; i < cars.length; i++) place(cars[i], path, i * GAP * P.s);
  var F = pp(P, [X_BOMB, qy(X_BOMB)]), G = pp(P, [X_BOMB - GAP * 0.55, qy(X_BOMB - GAP * 0.55) + 18]);
  var bm = bombIcon(c, "Bombe"); bm.scale.setValue([P.s * 100 * IC, P.s * 100 * IC]); bm.position.setValue(F);
  var tb = k.prallt + f2s(3), tx = k.ab;
  arcKeys(bm, F, G, 150, tb, tx - f2s(9), -400);           // liegt 9 Frames, dann Explosion
  bm.outPoint = tx;
  var bu = pencil(c, "Explosion", SH.burst, "#E8A93A", 10, tx, f2s(4), G[0], G[1], P.s * IC);
  var trS = bu.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group").property("ADBE Vector Filter - Trim");
  keys(trS.property("ADBE Vector Trim Start"), [tx + f2s(6), tx + f2s(14)], [0, 100], 40);
  var soot = shape(c, "Russfleck"), gs = grp(soot); ellipseG(gs, 120 * P.s * IC, 70 * P.s * IC, G[0], G[1]); fill(gs, "#4A443C", 55);
  soot.inPoint = tx; edgeBoil(soot, 4);
  whiteFlash(c, tx, "Blitz Explosion");
  var back = pAt(path, plen(path) - 3 * GAP * P.s).p;
  redCross(c, "Verletzte 1", back[0] - 40, back[1] - 84, k.menschen - f2s(2), 1.35);
  redCross(c, "Verletzte 2", back[0] + 44, back[1] - 98, k.menschen + f2s(6), 1.35);
  var cam = camRig(c, CX, 820, { punchIn: 114, s0: 100, s1: 104 });
  shake(cam, tx, 0.5, 16);
  subShade(c);
  voxSauce(c, "grafik");
};
// ---------- 7 der Anschlag ist gescheitert: der Thronfolger faehrt weiter zum Rathaus ----------
// Runde 3: naeher ran (0,85 statt 0,62), nur die drei vorderen Wagen fahren weiter (die hinteren liegen ausserhalb),
// Symbole 1,4x, Schatten unter den Untertiteln.
B.gescheitert = function (c, k) {
  paperBase(c);
  var IC = 1.4, P = planAt(c, 1720, qy(1720) - 40, CX, 860, 0.85);
  planLabels(c, P, CX, 1.12, null, 44);
  var cars = convoy(c, P, 3, 2, IC);
  var pathR = quayScreen(P, X_BOMB - 2 * GAP, PL.x_rathaus - 60);
  for (var i = 0; i < cars.length; i++) drive(cars[i], pathR, f2s(2), k.gescheitert - f2s(2), i * GAP * P.s, "inout", false, 5 * GAP * P.s);
  var fin = pAt(pathR, plen(pathR) - 2 * GAP * P.s).p, circ = [];
  for (var a = 0; a <= 24; a++) { var an = -0.6 + a / 24 * Math.PI * 2.2; circ.push([fin[0] + Math.cos(an) * (84 + a * 0.8), fin[1] + Math.sin(an) * (62 + a * 0.5)]); }
  pencil(c, "Kreis Thronfolger", [line2(circ)], INK, 6, k.gescheitert, f2s(10));
  var cam = camRig(c, CX, 860, { punchIn: 110, s0: 100, s1: 104 });
  subShade(c);
  voxSauce(c, "grafik");
};
// ---------- 8 Mitte-Aufruf: Folgen-Klick ueber ruhiger Fahrt auf dem Stadtplan ----------
// Runde 3: naeher ran (0,9 statt 0,6) auf die Kolonne vor dem Rathaus, Symbole 1,4x, Schatten unter den Untertiteln.
B.cta = function (c, k) {
  paperBase(c);
  var P = planAt(c, 1780, qy(1780) - 120, CX, 980, 0.9);
  planLabels(c, P, CX, 1.18, null, 44);
  var path = quayScreen(P, X_BOMB - 2 * GAP, PL.x_rathaus - 60), cars = convoy(c, P, 3, 2, 1.4);
  for (var i = 0; i < cars.length; i++) place(cars[i], path, i * GAP * P.s);
  followButton(c, CX, 640, k.folge, k.schlauer + f2s(8));
  camRig(c, CX, 980, { punchIn: 112, s0: 100, s1: 104, dx: -40 });
  subShade(c);
  voxSauce(c, "grafik");
};
// ---------- 9 Krankenhaus: Foto blaettert um, darunter der Plan ----------
B.krankenhaus = function (c, k) {
  paperBase(c);
  var P = planAt(c, 900, qy(1200) - 60, CX, 880, 0.6);          // Runde 3/4: 0,6 statt 0,43 (Plan deckt die Breite, kein Planrand bei 22,5 s)
  planLabels(c, P, CX, 1.1, null, 40);                           // Runde 4: Strassennamen auch hier
  var tk = k.krankenhaus - f2s(3);
  spitalIcon(c, P, tk, 1.25);                                     // Runde 4: Krankenhaus groesser
  var dash = pencil(c, "Weg zum Krankenhaus", [line2(quayScreen(P, 1580, PL.x_kh + 70))], INK, 6, tk + f2s(8), f2s(14));
  var st = dash.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group").property("ADBE Vector Graphic - Stroke");
  try { var ds = st.property("ADBE Vector Stroke Dashes"); ds.addProperty("ADBE Vector Stroke Dash 1").setValue(16); ds.addProperty("ADBE Vector Stroke Gap 1").setValue(12); } catch (e) {}
  var pg = photoPage("Seite Abfahrt Rathaus", IMG.kh, CX, 820, 760, 700, 1.2, c.duration);   // Runde 2: 760 statt 960 px (Rand)
  var L = addItem(c, pg, CX, H / 2, 100); L.name = "Seite Foto";
  var tp = k.verletzten - f2s(4);
  pageTurn(L, tp, 0.7, W, H);
  L.outPoint = tp + 0.7 + f2s(9);
  var crd = credit(c, D.credits[IMG.khKey]);
  // Runde 3: Bildquelle bleibt, bis die Seite ganz weggeblaettert ist (Review 2: fehlte bei 21,5 s, Foto noch halb zu sehen)
  if (crd) for (var j = 1; j <= c.numLayers; j++) if (c.layer(j).name.indexOf("FIX Bildquelle") === 0) c.layer(j).outPoint = tp + 0.7 + f2s(9);
  focusHunt(c, 0, true);
  subShade(c);
  var cam = camRig(c, CX, 880, { punchIn: 108, s0: 100, s1: 103 });
  voxSauce(c, "grafik");
};
// ---------- 10 die Route wird geaendert ----------
B.route = function (c, k) {
  paperBase(c);
  var P = planAt(c, 900, qy(1000) - 170, CX, 900, 0.6);         // Runde 2/3: Krankenhaus + Routen in 60..1020, Planrand ausserhalb des Bildes
  spitalIcon(c, P, null);
  var old = ppl(P, quay(1520, SX).concat([[SX, qy(SX) - 150], UP]));
  pencil(c, "alte Route", [line2(old)], RED, 7, null);
  var m = pp(P, [SX, qy(SX) - 260]);
  pencil(c, "alte Route gestrichen", [line2([[m[0] - 50, m[1] - 50], [m[0] + 50, m[1] + 50]]), line2([[m[0] + 50, m[1] - 50], [m[0] - 50, m[1] + 50]])], INK, 9, k.route - f2s(3), f2s(7));
  arrowPath(c, "neue Route", quayScreen(P, 1520, PL.x_kh + 90), "#2E6B4F", 8, k.geaendert - f2s(2), f2s(12));
  var cam = camRig(c, CX, 900, { punchIn: 113, s0: 100, s1: 104 });
  focusHunt(c, 0, true);
  voxSauce(c, "grafik");
};
// ---------- 11 die Fahrer bekommen es nicht mit (dunkel, Kreide) ----------
B.fahrer = function (c, k) {
  paperBase(c, true);
  var car = carIcon(c, "Wagen gross", true, 5.2); car.position.setValue([CX, 860]); car.rotation.setValue(-90);
  var dv = shape(c, "Fahrer"), gd = grp(dv); ellipseG(gd, 64, 64, CX - 44, 872); fill(gd, "#3A3530"); stroke(gd, "#F1ECE0", 4);
  var gw = grp(dv); ellipseG(gw, 92, 92, CX - 44, 818); stroke(gw, "#F1ECE0", 5);
  edgeBoil(dv, 4);
  rings(c, 760, 420, k.doch, 3, "#F1ECE0", 420);              // Runde 2: vorher 960/380 mit 720 px -> oben rechts abgeschnitten
  var circ = [];
  for (var a = 0; a <= 24; a++) { var an = -0.5 + a / 24 * Math.PI * 2.2; circ.push([CX - 44 + Math.cos(an) * (88 + a), 850 + Math.sin(an) * (96 + a)]); }
  pencil(c, "Kreis Fahrer", [line2(circ)], "#F1ECE0", 7, k.fahrer, f2s(12));
  var q = txt(c, "?", F_SERIF_BI, 300, "#F1ECE0", [CX + 230, 760]); popIn(q, k.nicht - f2s(2)); jitter(q, 1.5);
  var cam = camRig(c, CX, 860, { punchIn: 120, s0: 100, s1: 106 });
  punchAt(cam, k.nicht - f2s(2), 1.05);
  voxSauce(c, "grafik");
};
// ---------- 12 falsch abgebogen, haelt an, setzt zurueck ----------
function cornerPlan(c) { return planAt(c, SX + 60, qy(SX) - 150, CX, 900, 1.05); }
B.abbiegen = function (c, k) {
  paperBase(c);
  var P = cornerPlan(c);
  planLabels(c, P, CX, 1.18);
  var path = ppl(P, quay(1560, SX).concat([CORNER, UP]));
  var car = carIcon(c, "Wagen Thronfolger", true, P.s * 1.3);   // Runde 4: Wagen 1,3x
  var t1 = k.falsch + 0.3;
  drive(car, path, 0, t1, 0, "out");
  arrowPath(c, "Pfeil falsch", ppl(P, quay(1300, SX + 10).concat([[SX, qy(SX) - 120], [SX, UP[1] - 70]])), RED, 9, k.biegt - f2s(4), t1 - k.biegt + f2s(2), true);
  var hk = k.haelt;
  keys(car.scale, [hk, hk + f2s(3), hk + f2s(8)], [[100, 100], [93, 93], [100, 100]], 50);
  var back = ppl(P, [UP, CORNER]), tr = k.zurueck - f2s(3);
  drive(car, back, tr, tr + 0.45, 0, "inout", true);
  var R = pp(P, [SX + 120, qy(SX) - 300]);
  arrowPath(c, "Rueckwaerts-Pfeil", [[R[0], R[1] - 90], [R[0] + 34, R[1] - 20], [R[0] + 34, R[1] + 60], [R[0] + 6, R[1] + 120]], INK, 7, tr - f2s(2), f2s(10), true);
  var cam = camRig(c, CX, 900, { punchIn: 116, s0: 100, s1: 105 });
  punchAt(cam, k.falsch, 1.05);
  voxSauce(c, "grafik");
};
// ---------- 13 ein paar Sekunden steht er still (Stoppuhr) ----------
B.sekunden = function (c, k) {
  paperBase(c);
  var Wt = SH.watch, x = CX, y = 720;
  pencil(c, "Stoppuhr", [Wt.ring], INK, 9, 0, f2s(10), x, y, 1);
  pencil(c, "Krone", [Wt.crown, Wt.knob], INK, 7, f2s(3), f2s(6), x, y, 1);
  pencil(c, "Striche", Wt.ticks, INK, 6, f2s(6), f2s(8), x, y, 1);
  var hd = shape(c, "Zeiger"), gh = grp(hd); addPath(gh, line2([[0, 20], [0, -Wt.R * 0.8]])); stroke(gh, RED, 9);
  var gc = grp(hd); ellipseG(gc, 22, 22, 0, 0); fill(gc, RED);
  hd.position.setValue([x, y]); edgeBoil(hd, 8);
  var ts = k.sekunden;
  hold(hd.rotation, 0, 0); hold(hd.rotation, ts, 30); hold(hd.rotation, ts + 0.36, 60); hold(hd.rotation, ts + 0.72, 90);   // 3 Ticks, je 0,36 s (Ton!)
  noteAnim(hd.rotation, ts + 0.72, hd);
  var car = carIcon(c, "Wagen steht", true, 2.4); car.position.setValue([x, 1130]); car.rotation.setValue(-90);
  car.position.expression = "posterizeTime(12); value + [random(-1.2,1.2), random(-1.2,1.2)]";
  focusHunt(c, 0);
  var cam = camRig(c, CX, 860, { punchIn: 118, s0: 100, s1: 104 });
  punchAt(cam, k.still - f2s(10), 1.05);
  voxSauce(c, "grafik");
};
// ---------- 14 genau vor einem Neunzehnjaehrigen ----------
// Runde 3 (Review 2): Portraet des 19-Jaehrigen (Haftfoto 2. Juli 1914, gemeinfrei) statt der Stadtansicht von 1923.
// Kein Name (das Skript nennt ihn nicht), nur "19 Jahre" und die Bildquelle. Schaerfe zieht in 0,3 s auf das Gesicht,
// roter Bleistift-Kreis um das Gesicht auf "vor" (Kritzel-SFX), Kamera-Punch auf "Attentaetern" (dumpfer SFX).
B.ecke = function (c, k) {
  paperBase(c);
  var PX = [CX, 890, 560, 660], X = photoXY(IMG.ecke, PX[0], PX[1], PX[2], PX[3], IMG.eckeFace[0], IMG.eckeFace[1]);
  printPhoto(c, IMG.ecke, PX[0], PX[1], PX[2], PX[3], -1, 0);
  focalBlur(c, 0, Math.min(0.3, k.vor), [CX - 260, PX[1] + 200], [X[0], X[1]], 12);
  var n19 = odometer(c, "19", F_NUM, 230, INK, [CX - 70, 400], k.neunzehn - f2s(4), f2s(14)); n19.name = "FIX Alter 19";
  var jl = txt(c, "Jahre", F_SERIF_I, 66, "#3A352E", [CX + 92, 400], ParagraphJustification.LEFT_JUSTIFY); jl.name = "FIX Alter Jahre"; typeOn(jl, k.neunzehn + f2s(12), 30);
  var circ = [], rx = X[2] * 0.25, ryy = X[3] * 0.25;
  for (var a = 0; a <= 26; a++) { var an = -1.0 + a / 26 * Math.PI * 2.15; circ.push([X[0] + Math.cos(an) * (rx + a * 0.6), X[1] + Math.sin(an) * (ryy + a * 0.5)]); }
  pencil(c, "Kreis Gesicht", [line2(circ)], RED, 8, k.vor, f2s(12));
  credit(c, D.credits[IMG.eckeKey]);
  var cam = camRig(c, X[0], X[1], { punchIn: 112, s0: 100, s1: 104 });
  punchAt(cam, k.attentaeter - f2s(3), 1.04);
  voxSauce(c, "archiv");
};
// ---------- 15 er schiesst zweimal: zwei Weissblitze, das Bild wird grau ----------
B.schuss = function (c, k) {
  paperBase(c);
  var P = planAt(c, SX + 30, qy(SX) - 160, CX, 860, 1.35);     // Runde 2: 1,35 statt 1,7 (Plan-Precomp sonst stark hochskaliert = weich)
  planLabels(c, P, CX, 1.12);
  var car = carIcon(c, "Wagen Thronfolger", true, P.s * 1.3); var cp = pp(P, CORNER); car.position.setValue(cp); car.rotation.setValue(-90);
  var sp = pp(P, [SX + 92, qy(SX) - 128]);                         // Runde 4: Wagen und Figur 1,3x
  silhouetteIcon(c, "Silhouette", sp[0], sp[1], 0.5 * P.s * 1.3);
  var t1 = k.schiesst + f2s(2), t2 = t1 + f2s(11);
  whiteFlash(c, t1, "Blitz 1"); whiteFlash(c, t2, "Blitz 2");
  // Runde 2 (Fehler in AE "Object is invalid", Szene schwarz): tn war nach dem 2. addFx auf derselben Ebene ungueltig.
  // Jetzt erst beide Effekte anlegen, dann jede Referenz per Name frisch holen.
  var g = adj(c, "FIX Entsaettigen");
  addFx(g, "ADBE Tint", "Entsaettigen Tint"); addFx(g, "ADBE Brightness & Contrast 2", "Entsaettigen Helligkeit");
  var am = findP(fxGet(g, "Entsaettigen Tint"), ["Amount to Tint"]); if (am) keys(am, [t2 + f2s(2), t2 + f2s(10)], [0, 100], 40);
  var br = findP(fxGet(g, "Entsaettigen Helligkeit"), ["Brightness"]); if (br) keys(br, [t2 + f2s(2), t2 + f2s(10)], [0, -28], 40);
  var cam = camRig(c, CX, 860, { punchIn: false, s0: 100, s1: 103 });
  punchAt(cam, t1, 1.05);
  voxSauce(c, "grafik");
};
// ---------- 16 Franz Ferdinand und seine Frau sterben (dunkel, ruhig) ----------
B.tod = function (c, k) {
  paperBase(c, true);
  printPhoto(c, IMG.tod, CX, 760, 760, 600, 1, 0);              // Runde 2: 760 statt 900 px (Rand)
  sourceBar(c, "Sarajevo", "28. Juni 1914", f2s(4), 1150);
  credit(c, D.credits[IMG.todKey]);
  var cam = camRig(c, CX, 760, { punchIn: 110, s0: 100, s1: 106 });
  voxSauce(c, "archiv", { vig: 40 });
};
// ---------- 17 einen Monat spaeter ist Krieg: Kalender 28. Juni -> 28. Juli, Europa faerbt sich ----------
B.krieg = function (c, k) {
  paperBase(c);
  var E = euAt(c, EU.w / 2, EU.h / 2 + 60, CX, 1010, 0.58);
  var Cw = SH.cal.w, Ch = SH.cal.h, cs = 0.62;
  var cc = mkComp("Kalender Juni Juli", Cw + 40, Ch + 80, c.duration, fPre);
  var pages = [["JULI", "Kalender Juli"], ["JUNI", "Kalender Juni"]];
  for (var i = 0; i < 2; i++) {
    var pgc = mkComp(pages[i][1], Cw + 40, Ch + 80, c.duration, fPre);
    var pa = shape(pgc, "Blatt"), gpa = grp(pa); addPath(gpa, SH.cal.page, (Cw + 40) / 2, (Ch + 80) / 2 + 20); fill(gpa, "#FBF7EE"); stroke(gpa, INK, 5);
    var hd = shape(pgc, "Kopf"), ghd = grp(hd); rectG(ghd, Cw, 110, (Cw + 40) / 2, 40 + 20 + 55); fill(ghd, RED);
    txt(pgc, pages[i][0] + " 1914", F_SANS_B, 58, "#FFFFFF", [(Cw + 40) / 2, 140], ParagraphJustification.CENTER_JUSTIFY, 60);
    txt(pgc, "28", F_NUM, 300, INK, [(Cw + 40) / 2, 470]);
    var rg = shape(pgc, "Ringe"), grg = grp(rg); for (var r = 0; r < SH.cal.rings.length; r++) addPath(grg, SH.cal.rings[r], (Cw + 40) / 2, (Ch + 80) / 2 + 20); stroke(grg, INK, 8);
    var pl = addItem(cc, pgc, (Cw + 40) / 2, (Ch + 80) / 2, 100); pl.name = pages[i][1];
    if (i === 1) { var tp = k.monat - f2s(6); pageTurn(pl, tp, 0.5, Cw + 40, Ch + 80); pl.outPoint = tp + 0.5 + f2s(9); }
  }
  var CL = addItem(c, cc, CX, 400, cs * 100); CL.name = "Kalender"; CL.rotation.setValue(-3);
  var ds = addFx(CL, "ADBE Drop Shadow"); if (ds) { setP(ds, ["Opacity"], 100); setP(ds, ["Distance"], 12); setP(ds, ["Softness"], 26); }
  var t0 = k.spaeter - f2s(2), order = [["AH", 0], ["SRB", 3], ["DE", 7], ["RU", 9], ["FR", 11], ["BE", 13], ["UK", 14]];
  for (var j = 0; j < order.length; j++) euFill(c, order[j][0], E, t0 + f2s(order[j][1]), null, order[j][0] === "RU");
  var cam = camRig(c, CX, 1010, { punchIn: 114, s0: 100, s1: 104 });
  punchAt(cam, k.spaeter, 1.04);
  subShade(c);                                     // Runde 3/4: Untertitel auf der Karte ruhiger (sanfte Vignette unten)
  voxSauce(c, "grafik");
};
// ---------- 18 was waere passiert? Pfeil spult zurueck, Wagen faehrt richtig ----------
B.waswaere = function (c, k) {
  paperBase(c);
  var P = cornerPlan(c);
  planLabels(c, P, CX, 1.16);
  var car = carIcon(c, "Wagen Thronfolger", true, P.s * 1.3);   // Runde 4: wie in abbiegen
  var cp = pp(P, CORNER); car.position.setValue(cp); car.rotation.setValue(-90);
  var wrong = arrowPath(c, "Pfeil falsch", ppl(P, quay(1300, SX + 10).concat([[SX, qy(SX) - 120], [SX, UP[1] - 70]])), RED, 9, null, null, true);
  var tr = k.passiert - f2s(2);
  for (var w = 0; w < 2; w++) {
    var tg = wrong[w].property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group").addProperty("ADBE Vector Filter - Trim");
    keys(tg.property("ADBE Vector Trim End"), w === 0 ? [tr + f2s(2), tr + 0.5] : [tr, tr + f2s(2)], [100, 0], 40);
  }
  var backPath = ppl(P, [CORNER, [SX, qy(SX)], [SX + 60, qy(SX + 60)]].concat(quay(SX + 120, 1180)));
  drive(car, backPath, tr, tr + 0.5, 0, "inout", true);
  var tg2 = k.richtig - f2s(4);
  var go = ppl(P, quay(1180, 760));                              // Runde 2: haelt im Bild (vorher am linken Rand)
  drive(car, go, tg2, tg2 + 0.7, 0, "inout");
  arrowPath(c, "Pfeil richtig", ppl(P, quay(1100, 690)), "#2E6B4F", 9, tg2, f2s(16));
  var q = txt(c, "?", F_SERIF_BI, 260, INK, [CX + 300, 560]); popIn(q, k.abgebogen - f2s(4)); yellowPop(q, k.abgebogen - f2s(4));
  var cam = camRig(c, CX, 900, { punchIn: 116, s0: 100, s1: 105 });
  subShade(c);
  voxSauce(c, "grafik");
};
// ---------- 19 Schluss: grosses Logo, Bio-Hinweis, Folgen-Klick ----------
// Runde 2: kein blasser Stadtplan mehr hinter "Link in der Bio" (Review: Restebene). OUTRO_LOGO_T steuert das Eck-Logo im Master.
var OUTRO_LOGO_T = null;
B.outro = function (c, k) {
  paperBase(c);
  var lg = imp("archiv/logo.png"), tl = k.allgemeinwissen - f2s(4);   // Zeitpunkt wie bisher (Logo-SFX liegt darauf)
  OUTRO_LOGO_T = tl;
  // Runde 3: gleich ab Szenenbeginn zeichnet sich ein roter Bleistift-Kreis, in den das Logo hineinpoppt (kein leeres Papier bei 44,5 s)
  var ring = [];
  for (var a = 0; a <= 30; a++) { var an = -1.2 + a / 30 * Math.PI * 2.12; ring.push([CX + Math.cos(an) * (300 + a * 0.6), 700 + Math.sin(an) * (296 + a * 0.4)]); }
  pencil(c, "Kreis Logo", [crv(ring)], RED, 9, f2s(1), Math.max(f2s(8), tl - f2s(2)));
  if (lg) { var lo = addItem(c, lg, CX, 700, 520 / lg.width * 100); lo.name = "Logo gross"; popIn(lo, tl, 520 / lg.width * 100);
    var ds = addFx(lo, "ADBE Drop Shadow"); if (ds) { setP(ds, ["Opacity"], 90); setP(ds, ["Distance"], 14); setP(ds, ["Softness"], 34); } }
  var lk = txt(c, "Link in der Bio", F_SERIF_I, 68, INK, [CX, 1060]); typeOn(lk, k.bio - f2s(4), 30);
  followButton(c, CX, 1190, k.bio + 0.45, k.folgen + f2s(3));
  var cam = camRig(c, CX, 900, { punchIn: 116, s0: 100, s1: 104, punchOut: false });
  punchAt(cam, tl, 1.05);
  voxSauce(c, "grafik");
};
