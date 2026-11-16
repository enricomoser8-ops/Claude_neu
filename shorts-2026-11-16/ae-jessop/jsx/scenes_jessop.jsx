// ===================== Szenen: Short 16.11.2026 "Titanic-Stewardess" (jessop), Hintergrund-Vox Runde 2 =====================
// Regeln (enno): EIN vollflaechiges Archivfoto je Szene ist DAS Bild (warm/Sepia, langsame Fahrt, hell genug). Keine Vordergrund-Abzuege,
// keine selbst gezeichneten Objekte, keine KI-Bilder. Zeitungsausschnitt 1911 (echte Zeitung) zaehlt als Vox.
// Wenig Text: nur Jahre, Schiffsnamen, Zahlen/Zaehler und hoechstens ein kurzer Chip je Szene (TEXT-Pruefung im Probelauf: <= 2 Textebenen,
// kein Element mit mehr als 3 Woertern). Die Untertitel tragen die Worte.
// Animation statt Text: Kontrast-Callout, Bleistiftkreis, Fokus-Unschaerfe, Route/Anfahrt-Strich, Ringe, Textmarker auf der Zeitung,
// Lupe, Parallax, Farbsweep (rotes Kreuz), Brand-Uebergang, Messlinie, Wirbel-Pfeile um die echte Schraubennabe, Punch-Cut.
// Kein Hauptgeraet zweimal hintereinander. k = Zeiten der Schluesselwoerter relativ zum Szenenanfang.
// Name der Stewardess wird weder gezeigt noch gesagt.
var B = {};

// Bildquellen unten rechts, eine Zeile je Quelle (gleiche Zeilen nur einmal), FIX: haengt nicht an der Kamera
function credits(c, ks) {
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
function hellTxt(c, s, font, size, color, pos, name) {   // Text direkt auf dem Foto: hell + Schatten
  var l = txt(c, s, font, size, color || CREAM, pos); l.name = name || ("Text " + s); schatten(l); return l;
}
function ellP(cx, cy, rx, ry) {
  var kx = 0.5523 * rx, ky = 0.5523 * ry;
  return { v: [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]], i: [[-kx, 0], [0, -ky], [kx, 0], [0, ky]], o: [[kx, 0], [0, ky], [-kx, 0], [0, -ky]], c: true };
}
// Kamera der Szene: nur langsame Drift (Punch auf dem Schnitt = punchCut)
function kamera(c, s1) { return camRig(c, CX, FCY, { punchIn: false, punchOut: false, s0: 100, s1: s1 || 102 }); }
// Punkte im Foto: benannter Punkt (data/grund.json pts, Quellpixel) bzw. beliebiger Quellpunkt -> Bildschirm zur Zeit t
function pS(sid, n, t) { return gS(sid, D.grund[sid].pts[n], t); }
function qPoly(sid, q, t) { var o = []; for (var i = 0; i < q.length; i++) o.push(gS(sid, q[i], t)); return o; }
function fPoly(sid, f, t) { var s = D.grund[sid].size, o = []; for (var i = 0; i < f.length; i++) o.push(gS(sid, [f[i][0] * s[0], f[i][1] * s[1]], t)); return o; }
// Bleistiftkreis um einen Quellpunkt (Radien in Quellpixeln), gezeichnet zur Zeit t0
function qKreis(c, sid, name, q, rx, ry, t0, color, w, dur, haupt) {
  var S = gS(sid, q, t0), z = gZust(sid, t0).z;
  return gKreis(c, sid, name, [S[0], S[1], rx * z, ry * z], t0, t0, color, w, dur, haupt);
}
// Wirbel-Pfeile: zwei Bogenpfeile um einen Quellpunkt (echte Schraubennabe), zeichnen sich und drehen sich mit dem Foto (Ausdruck)
function wirbel(c, sid, q, R, t0, color) {
  var z = gZust(sid, t0).z, P = [];
  for (var a = 0; a < 2; a++) {
    var a0 = a * Math.PI - 0.4, a1 = a0 + Math.PI * 0.62, pts = [];
    for (var i = 0; i <= 14; i++) { var w = a0 + (a1 - a0) * i / 14; pts.push([q[0] + R * Math.cos(w), q[1] + R * Math.sin(w)]); }
    P.push(line2(pts));
    var e = pts[pts.length - 1], tx = -Math.sin(a1), ty = Math.cos(a1), L = 34 / z;   // Tangente in Drehrichtung
    var h1 = [e[0] - L * (tx * Math.cos(0.5) - ty * Math.sin(0.5)), e[1] - L * (ty * Math.cos(0.5) + tx * Math.sin(0.5))];
    var h2 = [e[0] - L * (tx * Math.cos(-0.5) - ty * Math.sin(-0.5)), e[1] - L * (ty * Math.cos(-0.5) + tx * Math.sin(-0.5))];
    P.push(line2([h1, e, h2]));
  }
  var l = pencil(c, "Strich Wirbel", P, color || LRED, 8 / z, t0, f2s(10));
  anHaengen(c, sid, l); l.anchorPoint.setValue(q); l.position.setValue(q); l.inPoint = t0;
  l.rotation.expression = "Math.max(0, time - " + t0 + ") * 150";   // dreht sich weiter (Ausdruck, keine Keys)
  return voxTag(l, "strich");
}

// ---------- 1 Hook: Deck der Titanic, Kontrast-Callout auf die echten Schornsteine, TITANIC, Punch auf "sank" ----------
B.hook = function (c, k) {
  grund(c, "hook", { dunkel: 4 });
  spot(c, "hook", "Schornsteine", { ell: [810, 420, 270, 420] }, 1.2, 0.04, null, 56, true);
  var y = odometer(c, "1912", F_NUM, 210, CREAM, [330, 1120], 0.06, f2s(14)); y.name = "Jahr 1912"; schatten(y);
  gLabel(c, "hook", "TITANIC", 330, 720, 86, [760, 560], 1.2, k.titanic - 0.02, CREAM);
  credits(c, [D.grund.hook.quelle]);
  var cam = kamera(c, 102);
  punchAt(cam, k.sank, 1.06);
  voxSauce(c, "archiv");
};
// ---------- 2 Nicht ihr einziges Unglueck: Helling in Belfast, Kreis um das echte Schild "OLYMPIC", Zaehler 1 -> 3x ----------
B.einzig = function (c, k) {
  grund(c, "einzig", { dunkel: 2 });
  spot(c, "einzig", "Schild", { ell: [700, 1230, 330, 230] }, 1.0, 0.04, null, 50);
  qKreis(c, "einzig", "Schild OLYMPIC", [2298, 2046], 290, 150, k.einziges - 0.08, LRED, 8, f2s(10), true);
  var n = counter(c, 1, 3, k.unglueck - 0.30, k.unglueck + 0.16, F_NUM, 260, CREAM, [800, 560], "×"); n.name = "Zaehler 3x"; schatten(n);
  credits(c, [D.grund.einzig.quelle]);
  punchCut(c, 1.10);
  kamera(c, 102);
  voxSauce(c, "archiv");
};
// ---------- 3 Stewardess an Bord: Speisesaal, FOKUS wandert ueber die gedeckten Tische ----------
B.gaeste = function (c, k) {
  grund(c, "gaeste", { dunkel: 2 });
  gFokus(c, k.stewardess - 0.04, k.gaeste + 0.10, [300, 1060], [700, 1240], 330, 300, true);
  spot(c, "gaeste", "Tisch", { ell: [640, 1250, 380, 270] }, 2.5, k.gaeste + 0.12, null, 46);
  chip(c, "1. KLASSE", 760, 520, NAVY, "#FFFFFF", 54, k.bord - 0.04);
  credits(c, [D.grund.gaeste.quelle]);
  kamera(c, 102);
  voxSauce(c, "archiv");
};
// ---------- 4 1911 auf der Olympic: Odometer 1911, Callout auf das echte Schiff, OLYMPIC ----------
B.olympic = function (c, k) {
  grund(c, "olympic", { dunkel: 3 });
  spot(c, "olympic", "Schiff", { ell: [560, 880, 520, 330] }, 1.5, 0.04, null, 52, true);
  var y = odometer(c, "1911", F_NUM, 150, CREAM, [800, 330], k.jahr, f2s(14)); y.name = "Jahr 1911"; schatten(y);
  gLabel(c, "olympic", "OLYMPIC", 790, 640, 76, pS("olympic", "schiff", 1.5), 1.5, k.olympic, CREAM);
  credits(c, [D.grund.olympic.quelle]);
  punchCut(c, 1.10);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 5 Kriegsschiff kracht in die Seite: Anfahrt-Strich aufs echte Heck, Ringe, echte Zeitung 1911 (HAWKE markiert), Kreis "bleibt oben" ----------
var ZH = "archiv/zeitung-1911-hawke.jpg";
B.hawke = function (c, k) {
  grund(c, "hawke", { dunkel: 3 });
  var tr = k.kracht - 0.34, h = pS("hawke", "heck", tr), s = [h[0] - 90, h[1] + 260], m = [h[0] - 50, h[1] + 130];
  var dx = h[0] - m[0], dy = h[1] - m[1], dl = Math.sqrt(dx * dx + dy * dy), ux = dx / dl, uy = dy / dl, L = 40;
  var h1 = [h[0] - L * (ux * Math.cos(0.5) - uy * Math.sin(0.5)), h[1] - L * (uy * Math.cos(0.5) + ux * Math.sin(0.5))];
  var h2 = [h[0] - L * (ux * Math.cos(0.5) + uy * Math.sin(0.5)), h[1] - L * (uy * Math.cos(0.5) - ux * Math.sin(0.5))];
  spot(c, "hawke", "Heck", { ell: [420, 950, 430, 210] }, 0.5, 0.04, k.kriegsschiff + 0.12, 50);
  gStrich(c, "hawke", "Anfahrt Hawke", [[s, m, h], [h1, h, h2]], tr, tr, LRED, 8, f2s(9), true);
  rings(c, h[0], h[1], k.kracht, 3, LRED, 300);
  chip(c, "HMS HAWKE", 780, 1170, LRED, "#FFFFFF", 42, k.kriegsschiff - 0.04);
  var z = zeitung(c, ZH, 610, 590, 640, -2, k.kriegsschiff + 0.10, "Evening World 1911"); voxTag(z, "zeitung");
  // Ausschnitt 1279 x 1175: "HAWKE" x 884..1197 y 338; "board Quarter." x 435..946 y 1125
  var m1 = zMarker(c, z, "HAWKE", 880, 1200, 338, 120, k.kriegsschiff + 0.50);
  var m2 = zMarker(c, z, "Quarter", 432, 950, 1122, 56, k.seite - 0.10);
  z.outPoint = k.olympic; m1.outPoint = k.olympic; m2.outPoint = k.olympic;
  qKreis(c, "hawke", "Olympic oben", D.grund.hawke.pts.schiff, 410, 150, k.olympic + 0.04, LVERD, 8, f2s(10));
  credits(c, [D.grund.hawke.quelle, "zeitung-1911-hawke"]);
  kamera(c, 102);
  voxSauce(c, "archiv");
};
// ---------- 6 Sieben Monate spaeter: echte Zeitung 15.4.1912, Zaehler 7 MONATE, Kreis um das Titanic-Foto, Reissschwenk -> ICEBERG markiert ----------
B.titanic = function (c, k) {
  grund(c, "titanic", { dunkel: 0 });
  spot(c, "titanic", "Titanic-Foto", { ell: [520, 1040, 340, 370] }, 0.5, 0.04, k.eisberg - 0.40, 46);
  // Zaehler 0 -> 7 MONATE auf einem roten Etikett (lesbar auf der Zeitungsseite); weg vor dem Reissschwenk
  var zc = chip(c, "7 MONATE", CX, 560, LRED, "#FFFFFF", 72, 0.02), zt = c.layer(zc.index - 1), tz1 = k.monate + 0.14;
  zt.property("ADBE Text Properties").property("ADBE Text Document").expression =
    "posterizeTime(12); String(Math.round(linear(time, 0.06, " + tz1 + ", 0, 7))) + ' MONATE';";
  noteAnim(null, tz1, zt);
  zc.outPoint = k.eisberg - 0.40; zt.outPoint = k.eisberg - 0.40;
  qKreis(c, "titanic", "Titanic-Foto", [1512, 2071], 330, 250, k.titanic - 0.06, LRED, 9, f2s(9));
  // Seite 5041 px: "ICEBERG;" x 3277..4285 y 1066
  gMarker(c, "titanic", "ICEBERG", 3270, 4292, 1066, 130, k.eisberg + 0.16, YEL, true);
  credits(c, [D.grund.titanic.quelle]);
  kamera(c, 102);
  voxSauce(c, "archiv");
};
// ---------- 7 Fremdes Baby, Rettungsboot: echte Rettungsboote 1912, LUPE auf die Menschen im Boot, Chip BOOT 16 ----------
B.baby = function (c, k) {
  grund(c, "baby", { dunkel: 3 });
  spot(c, "baby", "Boot", { ell: [800, 1000, 340, 280] }, 1.0, 0.04, null, 48);
  gLupe(c, "baby", k.baby - 0.04, true);
  chip(c, "BOOT 16", 300, 1130, NAVY, "#FFFFFF", 46, k.boot - 0.04);
  credits(c, [D.grund.baby.quelle]);
  punchCut(c, 1.10);
  kamera(c, 102);
  voxSauce(c, "archiv");
};
// ---------- 8 Mitte-Aufruf: Postkarte der Olympic (Farbe), PARALLAX (Schiff loest sich), Folgen-Knopf -> "Gefolgt" ----------
var FOLGE_POLY = [[0.07, 0.48], [0.30, 0.40], [0.42, 0.24], [0.72, 0.24], [0.74, 0.36], [0.85, 0.42], [0.88, 0.62], [0.80, 0.72], [0.12, 0.75], [0.08, 0.62]];
B.folge = function (c, k) {
  grund(c, "folge", { dunkel: 4 });
  gParallax(c, "folge", fPoly("folge", FOLGE_POLY, 0.76), 0.76, [CX, 1500], 1.07, true);
  followBtn(c, CX, 1140, 0.06, k.schlauer + 0.30, 1.4);
  credits(c, [D.grund.folge.quelle]);
  kamera(c, 102);
  voxSauce(c, "grafik");
};
// ---------- 9 Krankenschwester auf der Britannic: Lazarettschiff, Odometer 1916, rotes Kreuz wird rot (Farbsweep) + Kreis, BRITANNIC ----------
var KREUZ = [[3123, 1120], [3198, 1120], [3198, 1205], [3278, 1205], [3278, 1265], [3198, 1265], [3198, 1345], [3123, 1345], [3123, 1265], [3043, 1265], [3043, 1205], [3123, 1205]];
B.britannic = function (c, k) {
  grund(c, "britannic", { dunkel: 2 });
  var y = odometer(c, "1916", F_NUM, 150, CREAM, [CX, 400], k.weltkrieg - 0.10, f2s(14)); y.name = "Jahr 1916"; schatten(y);
  spot(c, "britannic", "Lazarettschiff", { ell: [700, 960, 420, 300] }, 2.0, 0.04, null, 46);
  var t1 = k.schwester - 0.10;
  var fr = farbSweep(c, "britannic", "Rotes Kreuz", "#D8261C", { poly: qPoly("britannic", KREUZ, t1), feder: 3 }, t1, t1, null, 92);
  fr.blendingMode = BlendingMode.SCREEN;   // das Kreuz ist im Foto dunkel: Screen macht es rot
  qKreis(c, "britannic", "Rotes Kreuz", [3160, 1232], 175, 165, k.schwester + 0.06, CREAM, 8, f2s(10), true);
  gLabel(c, "britannic", "BRITANNIC", 640, 650, 76, pS("britannic", "rumpf", k.britannic), k.britannic, k.britannic - 0.04, CREAM);
  credits(c, [D.grund.britannic.quelle]);
  punchCut(c, 1.08);
  kamera(c, 102);
  voxSauce(c, "archiv");
};
// ---------- 10 Eine Mine reisst es auf: BRAND-Uebergang in die echte Zeitung 22.11.1916, Textmarker auf BRITANNIC, Punch auf "reisst" ----------
B.mine = function (c, k) {
  grund(c, "mine", { dunkel: 0 });
  gBrand(c, "britannic", 0, 0.36, true);
  // Seite 5444 px: "BRITANNIC" x 1143..3049 y 1320
  gMarker(c, "mine", "BRITANNIC", 1180, 3000, 1320, 300, 0.40, YEL);
  credits(c, [D.grund.mine.quelle]);
  var cam = kamera(c, 102);
  punchAt(cam, k.reisst, 1.07);
  voxSauce(c, "archiv");
};
// ---------- 11 Boot treibt auf die drehenden Schrauben zu: echte Schrauben im Dock, FOKUS von den Arbeitern zur Nabe, Wirbel-Pfeile ----------
B.schrauben = function (c, k) {
  grund(c, "schrauben", { dunkel: 2 });
  gFokus(c, 0.08, 1.94, pS("schrauben", "leute", 0.08), pS("schrauben", "nabe", 1.0), 300, 300, true);
  routePfeil(c, [170, 1130], [400, 800], 0.25, k.treibt - 0.06, k.treibt + 0.50, LRED);
  wirbel(c, "schrauben", D.grund.schrauben.pts.nabe, 560, k.drehenden - 0.04, LRED);
  credits(c, [D.grund.schrauben.quelle]);
  punchCut(c, 1.10);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 12 Sie springt, kann nicht schwimmen, ueberlebt: echtes Rettungsboot 1912, Sprung-Pfeil, Ringe, Chip, Callout aufs Boot ----------
B.springt = function (c, k) {
  grund(c, "springt", { dunkel: 3 });
  spot(c, "springt", "Boot", { ell: [520, 1480, 430, 340] }, 3.1, k.ueberlebt - 0.06, null, 56, true);
  var w = pS("springt", "wasser", k.springt);
  gPfeil(c, "springt", "Sprung", [w[0] - 380, w[1] - 300], w, k.springt, k.springt - 0.02, CREAM, 7);
  rings(c, w[0], w[1], k.wasser, 3, LBLAU, 320);
  chip(c, "NICHTSCHWIMMERIN", CX, 420, LRED, "#FFFFFF", 48, k.schwimmen - 0.06);
  credits(c, [D.grund.springt.quelle]);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 13 Twist: Danach noch viele Jahre zur See: Olympic am Pier, Messlinie laengs des echten Rumpfs als Zeitleiste, Zaehler 1920 -> 1950 ----------
B.twist = function (c, k) {
  grund(c, "twist", { dunkel: 3 });
  spot(c, "twist", "Schiff", { ell: [560, 960, 560, 330] }, 1.0, 0.04, null, 46);
  gMass(c, "twist", [260, 1010], [960, 1010], k.danach, k.danach - 0.04, YEL, true);
  var n = counter(c, 1920, 1950, k.jahre - 0.30, k.jahre + 0.70, F_NUM, 150, CREAM, [CX, 930]); n.name = "Zaehler 1920-1950"; schatten(n);
  credits(c, [D.grund.twist.quelle]);
  punchCut(c, 1.10);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 14 Haettest du dich das getraut? Farbtafel der Olympic 1911, Callout aufs Schiff, Fragezeichen ----------
B.frage = function (c, k) {
  grund(c, "frage", { dunkel: 4 });
  spot(c, "frage", "Schiff", { ell: [600, 1040, 430, 520] }, 0.5, 0.04, null, 54, true);
  var q = txt(c, "?", F_SERIF_BI, 210, LRED, [880, 470]); q.name = "Fragezeichen"; schatten(q); slam(q, k.getraut - 0.04);
  credits(c, [D.grund.frage.quelle]);
  kamera(c, 102);
  voxSauce(c, "archiv");
};
// ---------- 15 Schluss: Brand-Uebergang in die Olympic im Hafen, grosses Logo (360 px im Kreis), "In der Bio", Folgen-Knopf ----------
B.outro = function (c, k) {
  grund(c, "outro", { dunkel: 10 });
  gBrand(c, "frage", 0, 0.50, true);
  pencil(c, "Kreis Logo", [ellP(CX, 640, 262, 262)], CREAM, 7, 0.10, f2s(14));
  var lg = imp("archiv/logo.png");
  if (lg) { var lo = addItem(c, lg, CX, 640, 360 / lg.width * 100); lo.name = "Logo gross"; popIn(lo, 0.12); }
  var bio = hellTxt(c, "In der Bio", F_SERIF_BI, 84, CREAM, [CX, 1010], "Text In der Bio"); popIn(bio, k.bio - f2s(4));
  pencil(c, "Unterstrich Bio", [line2([[330, 1034], [540, 1040], [750, 1032]])], LRED, 7, k.bio + 0.30, f2s(10));
  followBtn(c, CX, 1160, k.bio + 0.3, k.folgen + f2s(3));
  credits(c, [D.grund.outro.quelle]);
  camRig(c, CX, 900, { punchIn: false, s0: 100, s1: 103, punchOut: false });
  voxSauce(c, "grafik");
};
