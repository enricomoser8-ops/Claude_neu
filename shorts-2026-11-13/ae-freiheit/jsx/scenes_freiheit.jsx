// ===================== Szenen: Short 13.11.2026 "Die Freiheitsstatue war nicht immer gruen" (Karten-Vox) =====================
// Rueckgrat: Papierkarte (Natural Earth / US Census) als Hintergrund aller Szenen; Einstieg vom Satelliten-Globus (CC Sphere,
// NASA Blue Marble) ueber eine Satelliten-Platte nahtlos auf die Papierkarte des Hafens. Archivfotos als Abzuege mit Faden an ihrem Ort,
// KI-Bilder nur fuer Gegenstaende (Muenze, Farbeimer, Patina) und die als "KI-Rekonstruktion" beschriftete Kupfer-Statue.
// k = Zeiten der Schluesselwoerter relativ zum Szenenanfang (gen_freiheit.py). Jede Animation endet >= 8 Frames vor dem Schnitt.
var B = {};
var DV = D.dive, NDV = DV.t.length;
var CAMH = [DV.ax[NDV - 1], DV.ay[NDV - 1]], SH = D.diveEnd.s;       // Hafen-Ansicht am Ende des Einstiegsflugs (15 px/km)
var LIB = D.diveEnd.lib;                                              // Liberty Island auf dem Bildschirm (330 / 1120)
var NYP = KA.ny.pts, ATP = KA.atl.pts;
var ST_REL = "archiv/ki-statue-kupfer-frei.png", GR_REL = "archiv/statue-gruen-heute.jpg";
var PH = { x: 680, y: 610, w: 500, h: 640, ecke: [446, 916] };      // Abzug "Statue heute" oben rechts, Ecke unten links fuer den Faden

// ---------- gemeinsame Kulissen ----------
function hafen(c, opt) {
  opt = opt || {};
  var cam = opt.cam || CAMH, s = opt.s || SH;
  var R = welt(c, cam, s);
  karte(c, R, KA.ny.haf, { name: " Hafen" });
  kartePapier(c);
  if (opt.dim) { var sl = solid(c, "Papier Schleier", "#F6F0E2"); sl.opacity.setValue(opt.dim); }
  weltFahrt(R, [0, c.duration], [cam, opt.cam2 || cam], [s, s * (opt.zoom || 1.025)], 30);
  return R;
}
function atlas(c, cam, s, opt) {
  opt = opt || {};
  var R = welt(c, cam, s);
  karte(c, R, KA.atl, { name: " Atlantik", coast: 2.2 });
  if (opt.fills) { flaecheFest(c, R, "Frankreich", KA.atl.fra, NAVY, 50); flaecheFest(c, R, "USA", KA.atl.usa, NAVY, 38); }
  kartePapier(c);
  if (opt.dim) { var sl = solid(c, "Papier Schleier", "#F6F0E2"); sl.opacity.setValue(opt.dim); }
  return R;
}
function flaecheFest(c, R, name, rings, color, op) {
  var l = shape(c, "Karte Flaeche " + name), g = grp(l, name);
  for (var i = 0; i < rings.length; i++) addPath(g, line2(rings[i], true));
  fill(g, color); strichfest(stroke(g, color, 3));
  place(l, R, [0, 0], 100, 0); l.blendingMode = BlendingMode.MULTIPLY; l.opacity.setValue(op);
  return l;
}
function region(c, cam, s) {
  var R = welt(c, cam, s);
  karte(c, R, KA.ny.reg, { name: " Region" });
  kartePapier(c);
  return R;
}
// Bildquellen unten rechts, eine Zeile je Quelle (FIX: haengt nicht an der Kamera)
function credits(c, ks) {
  var y = 1884;
  for (var i = ks.length - 1; i >= 0; i--) {
    var s = D.credits[ks[i]]; if (!s) continue;
    var l = txt(c, s, "ArialMT", 20, "#FFFFFF", [1040, y], ParagraphJustification.RIGHT_JUSTIFY, 10); l.name = "FIX Bildquelle";
    var rc = l.sourceRectAtTime(0, false);
    var pl = shape(c, "FIX Bildquelle Schild"), g = grp(pl); rectG(g, rc.width + 20, rc.height + 10, 0, 0, 4); fill(g, "#141210");
    pl.position.setValue([1040 + rc.left + rc.width / 2, y + rc.top + rc.height / 2]); pl.opacity.setValue(55); pl.moveAfter(l);
    y -= 30;
  }
}
// Hand-Label mit schnellem Pfeil (zeichnet sich in 8 Frames, startet 0,08 s nach dem Text); still = steht sofort
function labelF(c, s, x, y, size, t0, color, to, still) {
  var l = txt(c, s, F_SERIF_BI, size || 60, color || INK, [x, y]); l.name = "Label " + s;
  if (!still) typeOn(l, t0, 32);
  l.inPoint = t0;
  if (to) {
    var sx = x + (to[0] > x ? 30 : -30), sy = to[1] < y ? y - (size || 60) * 0.95 : y + 16;
    var mx = (sx + to[0]) / 2, my = Math.min(sy, to[1]) - 40;
    var p = { v: [[sx, sy], to], i: [[0, 0], [mx - to[0], my - to[1]]], o: [[mx - sx, my - sy], [0, 0]], c: false };
    var ang = Math.atan2(to[1] - my, to[0] - mx), L = 26;
    var head = line2([[to[0] - L * Math.cos(ang - 0.5), to[1] - L * Math.sin(ang - 0.5)], to, [to[0] - L * Math.cos(ang + 0.5), to[1] - L * Math.sin(ang + 0.5)]]);
    var a = pencil(c, "Pfeil " + s, [p, head], color || INK, 5, still ? null : t0 + 0.08, f2s(8));
    a.inPoint = t0;
  }
  return l;
}
function ellP(cx, cy, rx, ry) {
  var kx = 0.5523 * rx, ky = 0.5523 * ry;
  return { v: [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]], i: [[-kx, 0], [0, -ky], [kx, 0], [0, ky]], o: [[kx, 0], [0, ky], [-kx, 0], [0, -ky]], c: true };
}
// Freisteller der Kupfer-Statue (KI-Rekonstruktion) auf Liberty Island, mit Leiste ueber der Schnittkante
var STAT = { x: 362, y: 700, h: 800 };
function statue(c, t0, x, y, h) {
  x = x || STAT.x; y = y || STAT.y; h = h || STAT.h;
  var s = farbFrei(c, ST_REL, x, y, h, "Statue Kupfer (KI-Rekonstruktion)");
  var it = imp(ST_REL), w = it ? it.width * h / it.height : 470;
  var lb = rekoLeiste(c, x, y + h / 2 - 27, w + 10, null);
  if (t0 !== undefined && t0 !== null) { popIn(s, t0, -4); setIn(lb, t0 + f2s(4)); }
  return s;
}
// gruene Kopie der Statue: Tint + weiche Maske, die von unten nach oben waechst (t0 -> t1)
function statueGruen(c, t0, t1, x, y, h) {
  x = x || STAT.x; y = y || STAT.y; h = h || STAT.h;
  var it = imp(ST_REL); if (!it) return null;
  var l = c.layers.add(it); l.name = "Statue Patina (KI-Rekonstruktion)";
  var s = h / it.height * 100; l.position.setValue([x, y]); l.scale.setValue([s, s]);
  addFx(l, "ADBE Tint", "Patina Farbe");
  var tn = fxGet(l, "Patina Farbe");
  if (tn) { setP(tn, ["Map Black To"], rgb("#163A31")); setP(tn, ["Map White To"], rgb("#A9DDC6")); setP(tn, ["Amount to Tint"], 100); }
  chroma(l, 1.5);
  var W0 = it.width, H0 = it.height;
  var a = mkShape(line2([[-30, H0 + 40], [W0 + 30, H0 + 40], [W0 + 30, H0 + 40], [-30, H0 + 40]], true));
  var b = mkShape(line2([[-30, -60], [W0 + 30, -60], [W0 + 30, H0 + 40], [-30, H0 + 40]], true));
  var m = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  m.property("ADBE Mask Feather").setValue([0, 70]);
  keys(m.property("ADBE Mask Shape"), [t0, t1], [a, b], [[20, 20], [60, 60]]);
  return l;
}

// ---------- 1 Hook: Satelliten-Globus -> Satellitenbild -> Papierkarte, Sturzflug in den Hafen von New York ----------
B.hook = function (c, k) {
  var sk = [], i; for (i = 0; i < NDV; i++) sk.push(DV.R[i] / 6371);
  var tSw = DV.t[NDV - 1]; for (i = 0; i < NDV; i++) if (sk[i] >= 2.4) { tSw = DV.t[i]; break; }
  var R = welt(c, [0, 0], sk[0]);
  karte(c, R, KA.ny.reg, { name: " Region", tIn: 1.10, tOut: tSw });
  karte(c, R, KA.ny.haf, { name: " Hafen", tIn: tSw });
  kartePapier(c, 1.10, 90);
  var A = [], S = []; for (i = 0; i < NDV; i++) { A.push([DV.ax[i], DV.ay[i]]); S.push([sk[i] * 100, sk[i] * 100]); }
  dichteKeys(R.anchorPoint, DV.t, A); dichteKeys(R.scale, DV.t, S);
  // Satelliten-Platte (gleiche Projektion wie die Karte): liegt unter dem Globus und ueber der Karte
  var pl = imp(GL.plate);
  if (pl) {
    var P = c.layers.add(pl); P.name = "Satellit New York"; P.anchorPoint.setValue([GL.pcx, GL.pcy]); P.position.setValue([CX, FCY]);
    var PT = [], PV = []; for (i = 0; i < NDV; i++) if (DV.t[i] >= 0.56 && DV.t[i] <= 1.36) { PT.push(DV.t[i]); PV.push([DV.R[i] / GL.r1 * 100, DV.R[i] / GL.r1 * 100]); }
    dichteKeys(P.scale, PT, PV);
    keys(P.opacity, [1.16, 1.26], [100, 0], [[30, 30], [30, 30]]);
    P.inPoint = 0.72; P.outPoint = 1.72;
  }
  // Weltall + Globus (dreht von Afrika/Europa nach New York, waechst bis R 1000 px, blendet in die Platte)
  var sp = solid(c, "Grund Weltall", "#03060D");
  keys(sp.opacity, [0.76, 0.88], [100, 0], [[30, 30], [30, 30]]); sp.outPoint = 1.30;
  var gc = globusComp(0, 0.80);
  var G = c.layers.add(gc); G.name = "Globus"; G.position.setValue([CX, FCY]);
  var GT = [], GV = []; for (i = 0; i < NDV; i++) if (DV.t[i] <= 0.96) { GT.push(DV.t[i]); GV.push([DV.R[i] / GLOB.radius * 100, DV.R[i] / GLOB.radius * 100]); }
  dichteKeys(G.scale, GT, GV);
  keys(G.opacity, [0.76, 0.88], [100, 0], [[30, 30], [30, 30]]); G.outPoint = 1.30;
  // "New York" ueber dem Satellitenbild
  var ny = kLabel(c, R, "New York", NYP["New York"], 56, "#FFFFFF", F_SANS_B, 20, k.newyork + 0.02, "type", 70);
  addFx(ny, "ADBE Drop Shadow", "Schatten NY");
  var dsn = fxGet(ny, "Schatten NY"); if (dsn) { setP(dsn, ["Opacity"], 200); setP(dsn, ["Distance"], 3); setP(dsn, ["Softness"], 14); }
  ny.outPoint = 1.48;
  // Freiheitsstatue: Nadel auf Liberty Island, gruenes Foto (heute) schlaegt ein, Faden zur Nadel, Ortsname
  kPin(c, R, "Liberty Island", NYP["Liberty Island"], k.statue, VERD);
  var ph = printPhoto(c, GR_REL, PH.x, PH.y, PH.w, PH.h, 3, null);
  dropIn(ph, k.statue + 0.04, 180, 0.36);
  kFaden(c, R, wp(PH.ecke, CAMH, SH), wp([LIB[0] + 12, LIB[1] - 104], CAMH, SH), 2.30, INK);
  kLabel(c, R, "Liberty Island", NYP["Liberty Island"], 30, INK, F_SERIF_I, 0, 2.30, "type", -58);
  // "Und sie war nicht immer gruen": Etikett HEUTE: GRUEN, roter Strich durch, Fragezeichen
  chip(c, "HEUTE: GRÜN", PH.x, 1052, VERD, "#FFFFFF", 42, k.und);
  pencil(c, "Strich durch", [line2([[500, 1058], [680, 1050], [860, 1046]])], RED, 9, k.nicht, f2s(8));
  var q2 = txt(c, "?", F_SERIF_BI, 210, RED, [930, 1220]); q2.name = "Fragezeichen"; slam(q2, k.gruen - 0.04);
  subShade(c, 45, 1.10);
  credits(c, ["globus", "karte", "statue-gruen-heute"]);
  camRig(c, CX, FCY, { punchIn: false, s0: 100, s1: 103 });
  voxSauce(c, "grafik");
};
// ---------- 2 Am Anfang braun: Kupfer-Statue (KI-Rekonstruktion) auf Liberty Island, 1886, Kupfermuenze ----------
B.braun = function (c, k) {
  hafen(c, { dim: 18 });
  var y = odometer(c, "1886", F_NUM, 150, INK, [800, 380], k.anfang, f2s(14)); y.name = "Jahr 1886";
  statue(c, k.glaenzt - 0.04);
  chip(c, "KUPFERBRAUN", 775, 1056, COPPER, "#FFFFFF", 36, k.braun);
  var m = farbFrei(c, "archiv/ki-kupfermuenze-frei.png", 790, 720, 290, "Kupfermuenze (KI-Bild)");
  popIn(m, k.muenze - 0.06, 12);
  subShade(c, 45);
  credits(c, ["karte", "ki-statue-kupfer", "ki-kupfermuenze"]);
  var cam = camRig(c, CX, FCY, { punchIn: 108, s0: 100, s1: 103 });
  punchAt(cam, k.braun - f2s(2), 1.03);
  voxSauce(c, "grafik");
};
// ---------- 3 Geschenk von Frankreich: Atlantik-Karte, Kupfer-Kachel, Flug ueber den Atlantik, Abzug Paris 1883, Route ----------
var C1 = [150, 260], S1 = 0.135, C1E = [160, 255], S1E = 0.139;
B.geschenk = function (c, k) {
  var C0 = [ATP["New York"][0] + 300, ATP["New York"][1] - 120], S0 = 0.5;
  var R = atlas(c, C0, S0);
  var t0 = k.geschenk - 0.08, t1 = t0 + 0.62;
  weltFahrt(R, [t0, t1, c.duration], [C0, C1, C1E], [S0, S1, S1E], [[20, 20], [85, 85], [30, 30]]);
  var kc = elementKachel(c, CX, 680, 380, k.kupfer - 0.04);
  keys(kc.scale, [t0, t0 + f2s(5)], [[100, 100], [0, 0]], [[60, 10], [10, 60]]); kc.outPoint = t0 + f2s(14);
  var ph = printPhoto(c, "archiv/paris-bau-1883.jpg", 520, 540, 380, 560, -3, null);
  dropIn(ph, t0 + 0.30, 180, 0.36);
  karteFlaeche(c, R, "Frankreich", KA.atl.fra, NAVY, k.frankreich - 0.04, 50);
  kPin(c, R, "Paris", ATP.Paris, k.frankreich - 0.06, RED);
  kLabel(c, R, "FRANKREICH", wp([800, 905], C1, S1), 30, LABC, F_SERIF, 160, k.frankreich, "type", 0);
  kFaden(c, R, wp([700, 760], C1, S1), [ATP.Paris[0] + 12 / S1, ATP.Paris[1] - 100 / S1], t1 + 0.12, INK);
  kRoute(c, R, [ATP.Paris[0] - 60, ATP.Paris[1] + 40], [ATP["New York"][0] + 60, ATP["New York"][1] + 30], 0.16, k.frankreich + 0.18, k.usa - 0.20, RED);
  kPinOhneRing(c, R, "New York", ATP["New York"], k.usa - 0.28, NAVY);
  karteFlaeche(c, R, "USA", KA.atl.usa, NAVY, k.usa - 0.12, 38);
  kLabel(c, R, "USA", wp([215, 1010], C1, S1), 40, LABC, F_SERIF, 200, k.usa - 0.12, "type", 0);
  kLabel(c, R, "Atlantik", ATP.Atlantik, 40, WATC, F_SERIF_I, 40, null, null, 0);
  sourceBar(c, "Paris 1883", "Bau der Statue", t0 + 0.40, 1480);
  subShade(c, 45);
  credits(c, ["karte", "paris-bau-1883"]);
  camRig(c, CX, FCY, { punchIn: 108, s0: 100, s1: 102 });
  voxSauce(c, "grafik");
};
function kPinOhneRing(c, R, name, w, t0, color) {   // Nadel ohne Einschlag-Ring (kurz vor dem Schnitt)
  var p = kPin(c, R, name, w, null, color);
  keys(p.scale, [t0, t0 + f2s(4), t0 + f2s(8)], [[0, 0], [112, 112], [100, 100]], [[10, 10], [60, 60], [80, 80]]);
  p.inPoint = t0;
  return p;
}
// ---------- 4 Kupferhaut so dick wie zwei Muenzen: Abzug Kopf + Fackelhand (Paris 1883) ueber Frankreich, 2,4 mm ----------
B.haut = function (c, k) {
  var c0 = [ATP.Paris[0] - 120, ATP.Paris[1] + 60], c1 = [ATP.Paris[0] - 100, ATP.Paris[1] + 50];
  var R = atlas(c, c0, 1.0, { fills: true, dim: 24 });
  weltFahrt(R, [0, c.duration], [c0, c1], [1.0, 1.04], 30);
  kPin(c, R, "Paris", ATP.Paris, null, RED);
  var ph = printPhoto(c, "archiv/paris-bau-1883-detail.jpg", 540, 600, 600, 600, 2, null);
  dropIn(ph, 0.04, 160, 0.32);
  labelF(c, "Kupferhaut", 330, 1010, 60, k.kupferhaut, COPPER, [640, 690]);
  var mm = txt(c, "≈ 2,4 mm", F_NUM, 92, INK, [300, 1180]); mm.name = "Mass 2,4 mm"; typeOn(mm, k.dick, 30); mm.inPoint = k.dick;
  var m1 = farbFrei(c, "archiv/ki-kupfermuenze-frei.png", 680, 1130, 190, "Muenze 1 (KI-Bild)"); popIn(m1, k.zwei - 0.26, 10);
  var m2 = farbFrei(c, "archiv/ki-kupfermuenze-frei.png", 800, 1150, 190, "Muenze 2 (KI-Bild)"); popIn(m2, k.zwei - 0.06, -8);
  subShade(c, 45);
  credits(c, ["paris-bau-1883-detail", "ki-kupfermuenze", "karte"]);
  camRig(c, CX, FCY, { punchIn: 108, s0: 100, s1: 103 });
  voxSauce(c, "archiv");
};
// ---------- 5 Geruest aus Eisen von Gustave Eiffel: Plan 1881, Portraet, Eiffelturm 1889 ----------
B.eiffel = function (c, k) {
  var c0 = [ATP.Paris[0] - 100, ATP.Paris[1] + 50], c1 = [ATP.Paris[0] - 60, ATP.Paris[1] + 30];
  var R = atlas(c, c0, 1.04, { fills: true, dim: 30 });
  weltFahrt(R, [0, c.duration], [c0, c1], [1.04, 1.12], 30);
  var gp = printPhoto(c, "archiv/eiffel-geruest-1881.jpg", 370, 670, 480, 640, -2, null);
  dropIn(gp, k.geruest - 0.04, 180, 0.36);
  labelF(c, "Eisen", 330, 1110, 64, k.eisen, INK, [372, 960]);
  var pt = printPhoto(c, "archiv/eiffel-portraet.jpg", 770, 520, 320, 340, 3, null);
  dropIn(pt, k.gustave - 0.04, 160, 0.34);
  sourceBar(c, "Gustave Eiffel", "Ingenieur, Paris", k.gustave + 0.56, 1480);
  pencil(c, "Unterstrich Eiffel", [line2([[625, 728], [770, 732], [915, 726]])], RED, 8, k.mann, f2s(8));
  var tw = printPhoto(c, "archiv/eiffelturm-1889.jpg", 770, 950, 310, 360, -3, null);
  dropIn(tw, k.turm - 0.10, 160, 0.34);
  var tl = txt(c, "Eiffelturm, 1889", F_SERIF_I, 40, INK, [770, 1205]); tl.name = "Label Eiffelturm"; typeOn(tl, k.turm + 0.1, 30); tl.inPoint = k.turm + 0.1;
  pencil(c, "Kreis Halt", [ellP(370, 670, 150, 290)], RED, 8, k.gibt, f2s(9));
  subShade(c, 45);
  credits(c, ["eiffel-geruest-1881", "eiffel-portraet", "eiffelturm-1889"]);
  var cam = camRig(c, CX, FCY, { punchIn: 108, s0: 100, s1: 102 });
  punchAt(cam, k.turm - f2s(3), 1.03);
  voxSauce(c, "archiv");
};
// ---------- 6 Mitte-Aufruf: Atlantik-Uebersicht mit Route, Folgen-Knopf wird geklickt ----------
B.folge = function (c, k) {
  var R = atlas(c, C1E, S1E, { fills: true });
  weltFahrt(R, [0, c.duration], [C1E, C1E], [S1E, S1E * 1.015], 30);
  routeFest(c, R);
  kPin(c, R, "Paris", ATP.Paris, null, RED); kPin(c, R, "New York", ATP["New York"], null, NAVY);
  kLabel(c, R, "Atlantik", ATP.Atlantik, 40, WATC, F_SERIF_I, 40, null, null, 0);
  kLabel(c, R, "USA", wp([215, 1010], C1, S1), 40, LABC, F_SERIF, 200, null, null, 0);
  kLabel(c, R, "FRANKREICH", wp([800, 905], C1, S1), 30, LABC, F_SERIF, 160, null, null, 0);
  followBtn(c, CX, 700, 0.06, k.schlauer + 0.30);
  subShade(c, 45);
  credits(c, ["karte"]);
  camRig(c, CX, FCY, { punchIn: 106, s0: 100, s1: 102 });
  voxSauce(c, "grafik");
};
function routeFest(c, R) {   // stehende Route Paris -> New York (wie in Szene 3, ohne Zeichnen)
  var a = [ATP.Paris[0] - 60, ATP.Paris[1] + 40], b = [ATP["New York"][0] + 60, ATP["New York"][1] + 30], bend = 0.16;
  var l = shape(c, "Route stehend"), g = grp(l, "Route");
  var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], px = mx + dy * bend, py = my - dx * bend;
  addPath(g, { v: [a, b], i: [[0, 0], [(px - b[0]) * 0.66, (py - b[1]) * 0.66]], o: [[(px - a[0]) * 0.66, (py - a[1]) * 0.66], [0, 0]], c: false });
  strichfest(stroke(g, RED, 6, 16, 12));
  place(l, R, [0, 0], 100, 0);
  return l;
}
// ---------- 7 Kupfer reagiert mit Luft und Regen ----------
B.regen = function (c, k) {
  hafen(c, { dim: 18 });
  statue(c, null);
  chip(c, "KUPFER", 780, 1056, COPPER, "#FFFFFF", 40, k.kupfer);
  labelF(c, "Luft", 810, 470, 72, k.luft - 0.04, NAVY, [560, 520]);
  var rg = labelF(c, "Regen", 815, 800, 72, k.regen - 0.08, NAVY, [575, 820], true);
  slam(rg, k.regen - 0.08);
  subShade(c, 45);
  credits(c, ["karte", "ki-statue-kupfer"]);
  var cam = camRig(c, CX, FCY, { punchIn: 108, s0: 100, s1: 103 });
  punchAt(cam, k.reagiert - f2s(2), 1.04);
  voxSauce(c, "grafik");
};
// ---------- 8 Langsam die gruene Schicht, die Patina (Jahre laufen 1886 -> 1906) ----------
B.patina = function (c, k) {
  hafen(c, { dim: 18 });
  statue(c, null);
  statueGruen(c, 0.06, 1.70);
  var n = counter(c, 1886, 1906, 0.10, 1.70, F_NUM, 150, INK, [780, 380]); n.name = "Jahre 1886-1906";
  chip(c, "GRÜN", 780, 1056, VERD, "#FFFFFF", 44, k.gruene);
  var mk = printPhoto(c, "archiv/ki-patina-makro.jpg", 780, 760, 340, 200, 2, null);
  dropIn(mk, k.patina - 0.14, 140, 0.34);
  var pl = txt(c, "Patina", F_SERIF_BI, 60, VERD, [780, 962]); pl.name = "Label Patina"; typeOn(pl, k.patina, 30); pl.inPoint = k.patina;
  subShade(c, 45);
  credits(c, ["karte", "ki-statue-kupfer", "ki-patina-makro"]);
  camRig(c, CX, FCY, { punchIn: 108, s0: 100, s1: 103 });
  voxSauce(c, "grafik");
};
// ---------- 9 1906: so gruen, dass viele an Rost denken (Zeitung Wilmington 1906, Textmarker auf "Rusted") ----------
B.rost = function (c, k) {
  hafen(c, { dim: 30 });
  var y = odometer(c, "1906", F_NUM, 130, INK, [CX, 300], 0.04, f2s(14)); y.name = "Jahr 1906";
  var ph = printPhoto(c, "archiv/zeitung-1906-wilmington.jpg", CX, 740, 860, 680, -1.5, null);
  popIn(ph, k.statue - 0.20, -3);
  sourceBar(c, "Evening Journal", "Wilmington, 17.10.1906", k.statue + 0.30, 1480);
  chip(c, "SO GRÜN", CX, 1180, VERD, "#FFFFFF", 42, k.gruen - 0.04);
  // Textmarker auf "Rusted" (Bildpunkte x 196..520, y 355 in der Zeitung; Abzug-Massstab, Innen-Zoom ~1,10 bei 3 s; Drehung -1,5 Grad)
  var ms = abzugMass("archiv/zeitung-1906-wilmington.jpg", 860, 680), z = ms[2] * (1.04 + 0.08 * 3.0 / c.duration);
  var x0 = CX + (196 - 783.5) * z, x1 = CX + (520 - 783.5) * z, yy = 740 + (355 - 633) * z;
  var a0 = -1.5 * Math.PI / 180, ys0 = yy + (x0 - CX) * Math.sin(a0), ys1 = yy + (x1 - CX) * Math.sin(a0);
  var hl = highlighter(c, x0, x1, (ys0 + ys1) / 2, k.viele); hl.name = "Textmarker Rusted";
  stempel(c, "ROST?", 820, 1190, -5, k.rost - 0.06, 64);
  subShade(c, 40);
  credits(c, ["zeitung-1906-wilmington", "karte"]);
  camRig(c, CX, FCY, { punchIn: 108, s0: 100, s1: 103 });
  voxSauce(c, "archiv");
};
// ---------- 10 Der Kongress gibt Geld frei, um sie anzustreichen (Region New York - Washington) ----------
var CR0 = [-60, 40], SR0 = 1.6, CR1 = [-200, 150], SR1 = 1.9;
B.kongress = function (c, k) {
  var R = region(c, CR0, SR0);
  weltFahrt(R, [k.kongress - 0.04, k.kongress + 0.62, c.duration], [CR0, CR1, [-196, 146]], [SR0, SR1, SR1 * 1.02], [[20, 20], [85, 85], [30, 30]]);
  kLabel(c, R, "New York", NYP["New York"], 40, INK, F_SANS_B, 20, null, null, [-150, 46]);
  kPin(c, R, "New York", NYP["Liberty Island"], null, VERD);
  kPin(c, R, "Washington", NYP.Washington, k.kongress, NAVY);
  kLabel(c, R, "Washington", NYP.Washington, 40, INK, F_SANS_B, 20, k.kongress + 0.20, "type", -64);
  chip(c, "US-KONGRESS", 330, 1150, NAVY, "#FFFFFF", 40, k.kongress + 0.66);
  var dl = txt(c, "$", F_NUM, 230, "#2F6B4F", [380, 600]); dl.name = "Dollar"; slam(dl, k.geld - 0.04);
  var gf = txt(c, "Geld frei", F_SERIF_BI, 56, INK, [380, 720]); gf.name = "Label Geld frei"; typeOn(gf, k.geld + 0.12, 30); gf.inPoint = k.geld + 0.12;
  var bk = farbFrei(c, "archiv/ki-farbeimer-frei.png", 760, 1000, 340, "Farbeimer (KI-Bild)"); popIn(bk, k.streichen - 0.10, 8);
  subShade(c, 45);
  credits(c, ["karte", "ki-farbeimer"]);
  camRig(c, CX, FCY, { punchIn: 108, s0: 100, s1: 103 });
  voxSauce(c, "grafik");
};
// ---------- 11 Aber die Menschen protestieren: Stempel schlagen ein ----------
B.protest = function (c, k) {
  var R = region(c, [-196, 146], SR1 * 1.02);
  weltFahrt(R, [0, c.duration], [[-196, 146], [-160, 118]], [SR1 * 1.02, SR1 * 1.04], 30);
  kPin(c, R, "Washington", NYP.Washington, null, NAVY);
  kPin(c, R, "New York", NYP["Liberty Island"], null, VERD);
  farbFrei(c, "archiv/ki-farbeimer-frei.png", 760, 1000, 340, "Farbeimer (KI-Bild)");
  stempel(c, "NEIN!", 330, 520, -7, 0.06, 84);
  stempel(c, "PROTEST!", 640, 330, 5, k.menschen - 0.04, 70);
  stempel(c, "NICHT ANSTREICHEN!", 520, 1232, -2, k.protest - 0.04, 50);
  subShade(c, 45);
  credits(c, ["karte", "ki-farbeimer"]);
  camRig(c, CX, FCY, { punchIn: 110, s0: 100, s1: 103 });
  voxSauce(c, "grafik");
};
// ---------- 12 Fachleute pruefen die gruene Schicht: Patina-Makro (KI-Bild) + Lupen-Ausschnitt ----------
var MK = { rel: "archiv/ki-patina-makro.jpg", x: CX, y: 600, mw: 860, mh: 500 };
B.pruefen = function (c, k) {
  hafen(c, { dim: 40 });
  var ph = printPhoto(c, MK.rel, MK.x, MK.y, MK.mw, MK.mh, 0, null);
  dropIn(ph, k.fachleute - 0.10, 160, 0.34);
  chip(c, "GRÜNE SCHICHT", CX, 300, VERD, "#FFFFFF", 42, k.gruene - 0.04);
  // Lupe: kleiner Kreis auf dem Abzug, grosser Kreis darunter mit Ausschnitt (105 % der echten Bildpunkte)
  var ms = abzugMass(MK.rel, MK.mw, MK.mh), z = ms[2] * (1.04 + 0.08 * 0.9 / c.duration), it = imp(MK.rel);
  var sx = 760, sy = 520, bx = CX, by = 1085, br = 160, sc = 1.05;
  var ix = it.width / 2 + (sx - MK.x) / z, iy = it.height / 2 + (sy - MK.y) / z;
  var lp = c.layers.add(it); lp.name = "Lupe Patina";
  lp.anchorPoint.setValue([ix, iy]); lp.position.setValue([bx, by]); lp.scale.setValue([sc * 100, sc * 100]);
  var mm = lp.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  mm.property("ADBE Mask Shape").setValue(mkShape(circPath(ix, iy, br / sc)));
  popIn(lp, k.pruefen + 0.04, 0);
  var rg = shape(c, "Lupe Rand"), gr = grp(rg, "Rand"); ellipseG(gr, br * 2, br * 2, bx, by); stroke(gr, INK, 7);
  popIn(rg, k.pruefen + 0.04, 0); rg.anchorPoint.setValue([bx, by]); rg.position.setValue([bx, by]);
  pencil(c, "Lupe Fang", [circPath(sx, sy, 56), line2([[sx - 40, sy + 40], [bx - br * 0.72, by - br * 0.7]]), line2([[sx + 40, sy + 40], [bx + br * 0.72, by - br * 0.7]])], INK, 5, k.pruefen - 0.08, f2s(8));
  subShade(c, 45);
  credits(c, ["ki-patina-makro", "karte"]);
  camRig(c, CX, FCY, { punchIn: 106, s0: 100, s1: 102 });
  voxSauce(c, "grafik");
};
// ---------- 13 Ergebnis: Die Patina schuetzt das Kupfer darunter ----------
B.ergebnis = function (c, k) {
  hafen(c, { dim: 40 });
  printPhoto(c, MK.rel, MK.x, MK.y, MK.mw, MK.mh, 0, null);
  var e = txt(c, "Ergebnis:", F_SERIF_B, 84, INK, [CX, 286]); e.name = "Titel Ergebnis"; typeOn(e, k.ergebnis, 30); e.inPoint = k.ergebnis;
  labelF(c, "Patina", 260, 1010, 66, k.patina - 0.04, VERD, [330, 560]);
  pencil(c, "Schutzlinie", [line2([[120, 782], [540, 786], [960, 780]])], VERD, 12, k.schuetzt - 0.04, f2s(8));
  chip(c, "SCHÜTZT", CX, 1150, VERD, "#FFFFFF", 42, k.schuetzt);
  labelF(c, "Kupfer", 820, 1010, 66, k.kupfer - 0.16, COPPER, [760, 822]);
  var hl = shape(c, "Textmarker darunter"), gh = grp(hl); addPath(gh, line2([[130, 822], [950, 824]])); stroke(gh, YEL, 30);
  hl.blendingMode = BlendingMode.MULTIPLY; hl.opacity.setValue(70); hl.inPoint = k.darunter;   // steht sofort (8-Frames-Regel)
  subShade(c, 45);
  credits(c, ["ki-patina-makro", "karte"]);
  camRig(c, CX, FCY, { punchIn: 106, s0: 100, s1: 103 });
  voxSauce(c, "grafik");
};
// ---------- 14 Nichts gestrichen - sie bleibt bis heute gruen ----------
B.bleibt = function (c, k) {
  var R = hafen(c, {});
  var tc = k.und;   // harter Schnitt im Bild: Eimer weg, Statue (heute) kommt
  var bk = farbFrei(c, "archiv/ki-farbeimer-frei.png", CX, 760, 500, "Farbeimer (KI-Bild)"); bk.outPoint = tc;
  var x = pencil(c, "Kreuz Eimer", [line2([[330, 540], [750, 990]]), line2([[750, 540], [330, 990]])], RED, 16, k.nichts - 0.02, f2s(7)); x.outPoint = tc;
  var sp = stempel(c, "NICHTS GESTRICHEN", CX, 1150, -3, k.gestrichen - 0.04, 52); sp.outPoint = tc;
  for (var i = 1; i <= c.numLayers; i++) if (c.layer(i).name === "Stempel NICHTS GESTRICHEN") c.layer(i).outPoint = tc;
  kPin(c, R, "Liberty Island", NYP["Liberty Island"], tc + 0.02, VERD);
  var ph = printPhoto(c, GR_REL, PH.x, PH.y, PH.w, PH.h, 3, null);
  dropIn(ph, k.statue - 0.06, 180, 0.34);
  kFaden(c, R, wp(PH.ecke, CAMH, SH), wp([LIB[0] + 12, LIB[1] - 104], CAMH, SH), k.statue + 0.36, INK);
  pencil(c, "Kreis heute", [ellP(PH.x, PH.y, 290, 362)], VERD, 9, k.bleibt, f2s(9));
  chip(c, "BIS HEUTE: GRÜN", PH.x, 1052, VERD, "#FFFFFF", 40, k.heute - 0.04);
  subShade(c, 45);
  credits(c, ["karte", "statue-gruen-heute", "ki-farbeimer"]);
  camRig(c, CX, FCY, { punchIn: 108, s0: 100, s1: 103 });
  voxSauce(c, "grafik");
};
// ---------- 15 Welche Farbe findest du schoener? braun | gruen ----------
B.frage = function (c, k) {
  hafen(c, { dim: 30 });
  statue(c, 0.04, 300, 700, 680);
  var ph = printPhoto(c, GR_REL, 770, 690, 360, 640, 2, null);
  popIn(ph, 0.10, 4);
  var q = txt(c, "?", F_SERIF_BI, 160, RED, [545, 250]); q.name = "Fragezeichen"; slam(q, k.farbe - 0.04);
  pencil(c, "Trennlinie", [line2([[533, 430], [530, 760], [534, 1090]])], INK, 6, k.schoener - 0.04, f2s(8));
  chip(c, "BRAUN", 300, 1172, COPPER, "#FFFFFF", 46, k.braun - 0.04);
  var g = chip(c, "GRÜN", 770, 1172, VERD, "#FFFFFF", 46, null); setIn(g, k.gruen - 0.02);   // steht sofort (8-Frames-Regel)
  subShade(c, 45);
  credits(c, ["ki-statue-kupfer", "statue-gruen-heute"]);
  camRig(c, CX, FCY, { punchIn: 108, s0: 100, s1: 102 });
  voxSauce(c, "grafik");
};
// ---------- 16 Schluss: grosses Logo, "In der Bio", Folgen-Knopf ueber der gedimmten Hafenkarte ----------
B.outro = function (c, k) {
  hafen(c, { dim: 62 });
  pencil(c, "Kreis Logo", [ellP(CX, 640, 262, 262)], INK, 7, 0.04, f2s(14));
  var lg = imp("archiv/logo.png");
  if (lg) { var lo = addItem(c, lg, CX, 640, 420 / lg.width * 100); lo.name = "Logo gross"; popIn(lo, k.allgemeinwissen - f2s(4)); }
  var lk = txt(c, "In der Bio", F_SERIF_BI, 84, INK, [CX, 1010]); lk.name = "Text In der Bio"; typeOn(lk, k.bio - f2s(4), 30); lk.inPoint = k.bio - f2s(4);
  pencil(c, "Unterstrich Bio", [line2([[350, 1034], [540, 1040], [730, 1032]])], RED, 7, k.bio + 0.45, f2s(10));
  followBtn(c, CX, 1160, k.bio + 0.6, k.folgen + f2s(3));
  camRig(c, CX, 900, { punchIn: 112, s0: 100, s1: 103, punchOut: false });
  voxSauce(c, "grafik");
};
