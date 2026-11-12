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
function convoy(c, P, n, main) {
  var L = [];
  for (var i = 0; i < n; i++) L.push(carIcon(c, i === main ? "Wagen Thronfolger" : "Wagen " + (i + 1), i === main, P.s));
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
function spitalIcon(c, P, t) {
  var at = pp(P, [PL.x_kh, ry(PL.x_kh) - 150]);
  var l = bldg(c, "Krankenhaus", SH.spital, at[0], at[1], P.s * 1.25);
  if (t !== null && t !== undefined) popIn(l, t);
  redCross(c, "Krankenhaus Kreuz", at[0], at[1] - SH.spital.h * P.s * 1.25 - 46 * P.s * 1.25, (t === null || t === undefined) ? null : t + f2s(6));
  return l;
}

// ---------- 1 Hook: Archivfoto des offenen Wagens, roter Pfeil biegt ab ----------
B.hook = function (c, k) {
  paperBase(c);
  printPhoto(c, IMG.hook, CX, 740, 960, 900, -2, 0);
  arrowPath(c, "Pfeil falsch abbiegen", [[880, 1190], [560, 1196], [330, 1176], [210, 1090], [170, 980]], RED, 10, k.falsch - f2s(5), f2s(15), true);
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
  burnReveal(E.L, 0);
  var pin = shape(c, "Pin Sarajevo"), gp = grp(pin); ellipseG(gp, 18, 18, 0, 0); fill(gp, RED); stroke(gp, "#FFFFFF", 3);
  pin.position.setValue([CX, 940]); popIn(pin, k.sarajevo + f2s(2));
  var nm = txt(c, "SARAJEVO", F_MONO, 76, INK, [CX, 760], ParagraphJustification.CENTER_JUSTIFY, 80); nm.name = "FIX Ort";
  typeOn(nm, k.sarajevo + f2s(4), 26);
  var yr = odometer(c, "1914", F_NUM, 200, INK, [CX, 600], k.jahr - f2s(4), f2s(16)); yr.name = "FIX Jahr 1914";
  var cam = camRig(c, CX, 940, { punchIn: false, s0: 100, s1: 250, punchOut: false });
  keys(cam.scale, [0.12, k.jahr - f2s(2)], [[100, 100], [250, 250]], [[30, 30], [90, 90]]);
  voxSauce(c, "grafik");
};
// ---------- 3 Franz Ferdinand, Thronfolger (Foto vom 28. Juni 1914) ----------
B.thron = function (c, k) {
  paperBase(c);
  var F = IMG.thronFF;                                     // Bildschirmposition von Franz Ferdinand im Abzug
  printPhoto(c, IMG.thron, CX, IMG.thronY, 980, 900, 1.5, 0);
  sourceBar(c, "Sarajevo", "28. Juni 1914", 0.1, 300);
  var circ = [];
  for (var a = 0; a <= 26; a++) { var an = -1.9 + a / 26 * Math.PI * 2.15; circ.push([F[0] + Math.cos(an) * (88 + a * 0.6), F[1] + 30 + Math.sin(an) * (128 + a * 0.5)]); }
  pencil(c, "Kreis Franz Ferdinand", [line2(circ)], RED, 8, k.franz + f2s(6), f2s(14));
  label(c, "Franz Ferdinand", 470, 470, 62, k.franz + f2s(26), INK, [F[0] - 70, F[1] - 120]);
  var th = txt(c, "Thronfolger", F_SERIF_I, 52, GREY, [470, 540]); typeOn(th, k.kaiser - f2s(3), 30);
  yellowPop(th, k.oesterreich);
  focalBlur(c, 0, 1.0, [F[0] - 160, F[1]], F, 10);
  credit(c, D.credits[IMG.thronKey]);
  var cam = camRig(c, F[0], F[1], { punchIn: 116, s0: 100, s1: 106 });
  voxSauce(c, "archiv");
};
// ---------- 4 der offene Wagen ----------
B.wagen = function (c, k) {
  paperBase(c);
  var fr = printPhoto(c, IMG.wagen, CX, 800, 980, 760, -1.5, 0);
  keys(fr.position, [0, 0.5], [[CX + 260, 800], [CX, 800]], [[10, 10], [92, 92]]);
  var cc = contrastCallout(c, k.offenen, c.duration, IMG.wagenC[0], IMG.wagenC[1], IMG.wagenC[2], IMG.wagenC[3], true); cc.name = "Callout Wagen";
  credit(c, D.credits[IMG.wagenKey]);
  var cam = camRig(c, CX, 800, { punchIn: 120, s0: 100, s1: 105 });
  punchAt(cam, k.offenen, 1.05);
  voxSauce(c, "archiv");
};
// ---------- 5 ein junger Mann wirft eine Bombe (Stadtplan, Kolonne am Appel-Kai) ----------
B.bombe = function (c, k) {
  paperBase(c);
  var P = planAt(c, X_BOMB, qy(X_BOMB), CX, 860, 0.78);
  var path = quayScreen(P, 260, X_BOMB + 2 * GAP), cars = convoy(c, P, 5, 2), tEnd = k.bombe - f2s(1);
  for (var i = 0; i < cars.length; i++) drive(cars[i], path, 0, tEnd, i * GAP * P.s, "out");
  var sp = pp(P, [X_BOMB + 170, ry(X_BOMB + 170) - 52]);
  var sil = silhouetteIcon(c, "Silhouette", sp[0], sp[1], 0.5 * P.s * 1.3);
  popIn(sil, k.mann - f2s(3));
  var bm = bombIcon(c, "Bombe"); bm.scale.setValue([P.s * 100, P.s * 100]);
  var F = pp(P, [X_BOMB, qy(X_BOMB)]);
  bm.inPoint = k.wirft;
  arcKeys(bm, [sp[0], sp[1] - 70 * P.s], F, 120, k.wirft, tEnd, 540);
  var cam = camRig(c, CX, 860, { punchIn: 118, s0: 100, s1: 105 });
  punchAt(cam, k.wirft, 1.06);
  voxSauce(c, "grafik");
};
// ---------- 6 sie prallt ab, explodiert vor dem Wagen dahinter ----------
B.abprall = function (c, k) {
  paperBase(c);
  var P = planAt(c, X_BOMB - 60, qy(X_BOMB), CX, 820, 1.3);
  var path = quayScreen(P, 260, X_BOMB + 2 * GAP), cars = convoy(c, P, 5, 2);
  for (var i = 0; i < cars.length; i++) place(cars[i], path, i * GAP * P.s);
  var F = pp(P, [X_BOMB, qy(X_BOMB)]), G = pp(P, [X_BOMB - GAP * 0.55, qy(X_BOMB - GAP * 0.55) + 18]);
  var bm = bombIcon(c, "Bombe"); bm.scale.setValue([P.s * 100, P.s * 100]); bm.position.setValue(F);
  var tb = k.prallt + f2s(3), tx = k.ab;
  arcKeys(bm, F, G, 150, tb, tx - f2s(9), -400);           // liegt 9 Frames, dann Explosion
  bm.outPoint = tx;
  var bu = pencil(c, "Explosion", SH.burst, "#E8A93A", 9, tx, f2s(4), G[0], G[1], P.s);
  var trS = bu.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group").property("ADBE Vector Filter - Trim");
  keys(trS.property("ADBE Vector Trim Start"), [tx + f2s(6), tx + f2s(14)], [0, 100], 40);
  var soot = shape(c, "Russfleck"), gs = grp(soot); ellipseG(gs, 120 * P.s, 70 * P.s, G[0], G[1]); fill(gs, "#4A443C", 55);
  soot.inPoint = tx; edgeBoil(soot, 4);
  whiteFlash(c, tx, "Blitz Explosion");
  var back = pAt(path, plen(path) - 3 * GAP * P.s).p;
  redCross(c, "Verletzte 1", back[0] - 30, back[1] - 70, k.menschen - f2s(2));
  redCross(c, "Verletzte 2", back[0] + 34, back[1] - 82, k.menschen + f2s(6));
  var cam = camRig(c, CX, 820, { punchIn: 114, s0: 100, s1: 104 });
  shake(cam, tx, 0.5, 16);
  voxSauce(c, "grafik");
};
// ---------- 7 der Anschlag ist gescheitert: der Thronfolger faehrt weiter zum Rathaus ----------
B.gescheitert = function (c, k) {
  paperBase(c);
  var P = planAt(c, 1720, qy(1720) - 40, CX, 860, 0.62);
  var path0 = quayScreen(P, 260, X_BOMB + 2 * GAP), cars = convoy(c, P, 5, 2);
  var pathR = quayScreen(P, X_BOMB - 2 * GAP, PL.x_rathaus - 60);
  for (var i = 0; i < cars.length; i++) {
    if (i < 3) { place(cars[i], path0, i * GAP * P.s); drive(cars[i], pathR, f2s(2), k.gescheitert - f2s(2), i * GAP * P.s, "inout", false, 4 * GAP * P.s); }
    else place(cars[i], path0, i * GAP * P.s);
  }
  var back = pAt(path0, plen(path0) - 3 * GAP * P.s).p;
  redCross(c, "Verletzte", back[0], back[1] - 50, null);
  var soot = shape(c, "Russfleck"), gs = grp(soot); var G = pp(P, [X_BOMB - GAP * 0.55, qy(X_BOMB - GAP * 0.55) + 18]); ellipseG(gs, 120 * P.s, 70 * P.s, G[0], G[1]); fill(gs, "#4A443C", 55);
  var fin = pAt(pathR, plen(pathR) - 2 * GAP * P.s).p, circ = [];
  for (var a = 0; a <= 24; a++) { var an = -0.6 + a / 24 * Math.PI * 2.2; circ.push([fin[0] + Math.cos(an) * (70 + a * 0.8), fin[1] + Math.sin(an) * (52 + a * 0.5)]); }
  pencil(c, "Kreis Thronfolger", [line2(circ)], INK, 6, k.gescheitert, f2s(10));
  var cam = camRig(c, CX, 860, { punchIn: 118, s0: 100, s1: 104 });
  voxSauce(c, "grafik");
};
// ---------- 8 Mitte-Aufruf: Folgen-Klick ueber ruhiger Fahrt auf dem Stadtplan ----------
B.cta = function (c, k) {
  paperBase(c);
  var P = planAt(c, 1500, qy(1500) - 120, CX, 980, 0.6);
  var path = quayScreen(P, X_BOMB - 2 * GAP, PL.x_rathaus - 60), cars = convoy(c, P, 3, 2);
  for (var i = 0; i < cars.length; i++) place(cars[i], path, i * GAP * P.s);
  followButton(c, CX, 640, k.folge, k.schlauer + f2s(8));
  camRig(c, CX, 980, { punchIn: 112, s0: 100, s1: 104, dx: -40 });
  voxSauce(c, "grafik");
};
// ---------- 9 Krankenhaus: Foto blaettert um, darunter der Plan ----------
B.krankenhaus = function (c, k) {
  paperBase(c);
  var P = planAt(c, PL.w / 2, qy(1200) - 60, CX, 880, 0.43);
  var tk = k.krankenhaus - f2s(3);
  spitalIcon(c, P, tk);
  var dash = pencil(c, "Weg zum Krankenhaus", [line2(quayScreen(P, PL.x_rathaus - 60, PL.x_kh + 70))], INK, 6, tk + f2s(8), f2s(14));
  var st = dash.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group").property("ADBE Vector Graphic - Stroke");
  try { var ds = st.property("ADBE Vector Stroke Dashes"); ds.addProperty("ADBE Vector Stroke Dash 1").setValue(16); ds.addProperty("ADBE Vector Stroke Gap 1").setValue(12); } catch (e) {}
  var pg = photoPage("Seite Abfahrt Rathaus", IMG.kh, CX, 820, 960, 820, 1.2, c.duration);
  var L = addItem(c, pg, CX, H / 2, 100); L.name = "Seite Foto";
  var tp = k.verletzten - f2s(4);
  pageTurn(L, tp, 0.7, W, H);
  L.outPoint = tp + 0.7 + f2s(9);
  var crd = credit(c, D.credits[IMG.khKey]);
  if (crd) for (var j = 1; j <= c.numLayers; j++) if (c.layer(j).name.indexOf("FIX Bildquelle") === 0) c.layer(j).outPoint = tp;
  focusHunt(c, 0, true);
  var cam = camRig(c, CX, 880, { punchIn: 116, s0: 100, s1: 105 });
  voxSauce(c, "grafik");
};
// ---------- 10 die Route wird geaendert ----------
B.route = function (c, k) {
  paperBase(c);
  var P = planAt(c, 1000, qy(1000) - 170, CX, 900, 0.6);
  spitalIcon(c, P, null);
  var old = ppl(P, quay(1900, SX).concat([[SX, qy(SX) - 150], UP]));
  pencil(c, "alte Route", [line2(old)], RED, 7, null);
  var m = pp(P, [SX, qy(SX) - 260]);
  pencil(c, "alte Route gestrichen", [line2([[m[0] - 50, m[1] - 50], [m[0] + 50, m[1] + 50]]), line2([[m[0] + 50, m[1] - 50], [m[0] - 50, m[1] + 50]])], INK, 9, k.route - f2s(3), f2s(7));
  arrowPath(c, "neue Route", quayScreen(P, 1900, PL.x_kh + 90), "#2E6B4F", 8, k.geaendert - f2s(2), f2s(12));
  var cam = camRig(c, CX, 900, { punchIn: 116, s0: 100, s1: 104 });
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
  rings(c, 960, 380, k.doch, 3, "#F1ECE0", 720);
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
  var path = ppl(P, quay(1560, SX).concat([CORNER, UP]));
  var car = carIcon(c, "Wagen Thronfolger", true, P.s);
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
// ---------- 14 genau vor einem Neunzehnjaehrigen (Lateinerbruecke, Fokus auf die Ecke) ----------
B.ecke = function (c, k) {
  paperBase(c);
  var X = IMG.eckeXY;
  printPhoto(c, IMG.ecke, CX, IMG.eckeY, 980, 820, -1, 0);
  focalBlur(c, 0, k.vor, [CX - 300, IMG.eckeY - 120], X, 14);
  var circ = [];
  for (var a = 0; a <= 24; a++) { var an = -0.4 + a / 24 * Math.PI * 2.2; circ.push([X[0] + Math.cos(an) * (80 + a), X[1] + Math.sin(an) * (66 + a * 0.6)]); }
  pencil(c, "Kreis Ecke", [line2(circ)], RED, 8, k.vor, f2s(12));
  var n19 = odometer(c, "19", F_NUM, 230, INK, [CX - 40, 390], k.neunzehn - f2s(4), f2s(14)); n19.name = "FIX Alter 19";
  var jl = txt(c, "Jahre", F_SERIF_I, 56, GREY, [CX + 175, 390]); jl.name = "FIX Alter Jahre"; typeOn(jl, k.neunzehn + f2s(12), 30);
  var sil = silhouetteIcon(c, "Silhouette Ecke", X[0] + 4, X[1] + 40, 0.62);
  popIn(sil, k.attentaeter - f2s(3));
  credit(c, D.credits[IMG.eckeKey]);
  var cam = camRig(c, X[0], X[1], { punchIn: 116, s0: 100, s1: 108 });
  voxSauce(c, "archiv");
};
// ---------- 15 er schiesst zweimal: zwei Weissblitze, das Bild wird grau ----------
B.schuss = function (c, k) {
  paperBase(c);
  var P = planAt(c, SX + 30, qy(SX) - 160, CX, 860, 1.7);
  var car = carIcon(c, "Wagen Thronfolger", true, P.s); var cp = pp(P, CORNER); car.position.setValue(cp); car.rotation.setValue(-90);
  var sp = pp(P, [SX + 78, qy(SX) - 128]);
  silhouetteIcon(c, "Silhouette", sp[0], sp[1], 0.5 * P.s);
  var t1 = k.schiesst + f2s(2), t2 = t1 + f2s(11);
  whiteFlash(c, t1, "Blitz 1"); whiteFlash(c, t2, "Blitz 2");
  var g = adj(c, "FIX Entsaettigen"), tn = addFx(g, "ADBE Tint"), bc = addFx(g, "ADBE Brightness & Contrast 2");
  var am = findP(tn, ["Amount to Tint"]); if (am) keys(am, [t2 + f2s(2), t2 + f2s(10)], [0, 100], 40);
  var br = findP(bc, ["Brightness"]); if (br) keys(br, [t2 + f2s(2), t2 + f2s(10)], [0, -28], 40);
  var cam = camRig(c, CX, 860, { punchIn: false, s0: 100, s1: 103 });
  punchAt(cam, t1, 1.05);
  voxSauce(c, "grafik");
};
// ---------- 16 Franz Ferdinand und seine Frau sterben (dunkel, ruhig) ----------
B.tod = function (c, k) {
  paperBase(c, true);
  printPhoto(c, IMG.tod, CX, 760, 900, 640, 1, 0);
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
  for (var j = 0; j < order.length; j++) euFill(c, order[j][0], E, t0 + f2s(order[j][1]));
  var cam = camRig(c, CX, 1010, { punchIn: 114, s0: 100, s1: 104 });
  punchAt(cam, k.spaeter, 1.04);
  voxSauce(c, "grafik");
};
// ---------- 18 was waere passiert? Pfeil spult zurueck, Wagen faehrt richtig ----------
B.waswaere = function (c, k) {
  paperBase(c);
  var P = cornerPlan(c);
  var car = carIcon(c, "Wagen Thronfolger", true, P.s);
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
  var go = ppl(P, quay(1180, 520));
  drive(car, go, tg2, tg2 + 0.7, 0, "inout");
  arrowPath(c, "Pfeil richtig", ppl(P, quay(1100, 580)), "#2E6B4F", 9, tg2, f2s(16));
  var q = txt(c, "?", F_SERIF_BI, 260, INK, [CX + 300, 560]); popIn(q, k.abgebogen - f2s(4)); yellowPop(q, k.abgebogen - f2s(4));
  var cam = camRig(c, CX, 900, { punchIn: 116, s0: 100, s1: 105 });
  voxSauce(c, "grafik");
};
// ---------- 19 Schluss: grosses Logo, Bio-Hinweis, Folgen-Klick ----------
B.outro = function (c, k) {
  paperBase(c);
  var P = planAt(c, 1200, qy(1200) - 100, CX, 980, 0.55); P.L.opacity.setValue(30);
  var lg = imp("archiv/logo.png"), tl = k.allgemeinwissen - f2s(4);
  if (lg) { var lo = addItem(c, lg, CX, 700, 520 / lg.width * 100); lo.name = "Logo gross"; popIn(lo, tl, 520 / lg.width * 100);
    var ds = addFx(lo, "ADBE Drop Shadow"); if (ds) { setP(ds, ["Opacity"], 90); setP(ds, ["Distance"], 14); setP(ds, ["Softness"], 34); } }
  var lk = txt(c, "Link in der Bio", F_SERIF_I, 68, INK, [CX, 1060]); typeOn(lk, k.bio - f2s(4), 30);
  followButton(c, CX, 1190, k.bio + 0.45, k.folgen + f2s(3));
  var cam = camRig(c, CX, 900, { punchIn: 116, s0: 100, s1: 104, punchOut: false });
  punchAt(cam, tl, 1.05);
  voxSauce(c, "grafik");
};
