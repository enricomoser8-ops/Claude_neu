// ===================== Szenen: Short 17.11.2026 "Roosevelt angeschossen" (roosevelt), Hintergrund-Vox (Vorlage ae-jessop 16.11.) =====================
// Regeln (enno): EIN vollflaechiges Archivfoto je Szene ist DAS Bild (warm/Sepia, langsame Fahrt, hell genug, nie ueber 110 % der echten Pixel).
// Vox-Geraete wirken AUF das Foto (Kontrast-Callout, Bleistiftkreis, Farbsweep, Pfeil/Strich, Lupe, Fokus, Parallax, Textmarker auf der Zeitung,
// Brand-Uebergang, Zaehler). Kein Hauptgeraet zweimal hintereinander. Person zeigen: Roosevelts Gesicht in der ersten Sekunde.
// Wenig Text: nur Name, Jahre, Zahlen und hoechstens ein kurzer Chip je Szene (TEXT-Pruefung: <= 2 Textebenen, <= 3 Woerter).
// Ausschnitte (Zeitungs-Element, 1:1 Bildpunkte): Berryman-Karikatur 1902 (Teddy), Daily Missoulian 15.10.1912 (Schlagzeile),
// Buchtafel 1912 (blutiges Hemd). Ein KI-Bild (Brillenetui, als KI-Bild gekennzeichnet in credits.json / Bildquelle).
// Der Schuetze bleibt namenlos (kein Name, kein Foto). k = Zeiten der Schluesselwoerter relativ zum Szenenanfang.
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
// Punkte im Foto: benannter Punkt (data/grund.json pts, Quellpixel) -> Bildschirm zur Zeit t
function pS(sid, n, t) { return gS(sid, D.grund[sid].pts[n], t); }
function fPoly(sid, f, t) { var s = D.grund[sid].size, o = []; for (var i = 0; i < f.length; i++) o.push(gS(sid, [f[i][0] * s[0], f[i][1] * s[1]], t)); return o; }
// Bleistiftkreis um einen Quellpunkt (Radien in Quellpixeln), gezeichnet zur Zeit t0
function qKreis(c, sid, name, q, rx, ry, t0, color, w, dur, haupt) {
  var S = gS(sid, q, t0), z = gZust(sid, t0).z;
  return gKreis(c, sid, name, [S[0], S[1], rx * z, ry * z], t0, t0, color, w, dur, haupt);
}
// Pfeil als Bleistiftstrich (Bildschirm-Punkte zur Zeit tr), Spitze am letzten Punkt; klebt am Foto
function strichPfeil(c, sid, name, pts, tr, t0, color, w, dur, haupt) {
  var b = pts[pts.length - 1], a = pts[pts.length - 2], dx = b[0] - a[0], dy = b[1] - a[1], dl = Math.sqrt(dx * dx + dy * dy), ux = dx / dl, uy = dy / dl, L = 42;
  var h1 = [b[0] - L * (ux * Math.cos(0.5) - uy * Math.sin(0.5)), b[1] - L * (uy * Math.cos(0.5) + ux * Math.sin(0.5))];
  var h2 = [b[0] - L * (ux * Math.cos(0.5) + uy * Math.sin(0.5)), b[1] - L * (uy * Math.cos(0.5) - ux * Math.sin(0.5))];
  return gStrich(c, sid, name, [pts, [h1, b, h2]], tr, t0, color, w, dur, haupt);
}
// Textmarker auf dem Ausschnitt mit eigener Zieh-Dauer (zMarker rechnet bei breiten Ausschnitten zu lang)
function zMarker2(c, z, name, x0, x1, y, h, t0, dur, color) {
  var l = shape(c, "Textmarker " + name), g = grp(l);
  addPath(g, line2([[x0, y], [x1, y - 1]])); stroke(g, color || YEL, h);
  var tr = g.addProperty("ADBE Vector Filter - Trim");
  keys(tr.property("ADBE Vector Trim End"), [t0, t0 + dur], [0, 100], 20);
  l.blendingMode = BlendingMode.MULTIPLY; zKind(z, l); l.inPoint = t0; l.moveBefore(z);
  return voxTag(l, "marker");
}
// weiche dunkle Wolke hinter den Untertiteln (helle Zeitungs-/Papierseiten): Untertitel bleiben lesbar, Stil der Untertitel unveraendert
function utDunkel(c, op) {
  var l = solid(c, "FIX UT-Abdunklung", "#000000");
  var m = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  m.property("ADBE Mask Shape").setValue(mkShape(ellP(CX, 1362, 330, 92)));
  m.property("ADBE Mask Feather").setValue([110, 110]);
  l.opacity.setValue(op || 55);
  return l;
}
// weisser Muendungsblitz ueber dem ganzen Bild (3 Frames hoch, 4 Frames weg)
function blitz(c, t) {
  var l = solid(c, "FIX Blitz", "#FFF6E8");
  keys(l.opacity, [t, t + f2s(1), t + f2s(5)], [0, 80, 0], [[10, 10], [60, 60], [80, 80]]);
  l.inPoint = t; l.outPoint = t + f2s(14);
  return l;
}

// ---------- 1 Hook: Roosevelt spricht (1912), Kontrast-Callout aufs Gesicht ab Frame 1, Kreis auf die Brust, Zaehler 60+ MIN ----------
B.hook = function (c, k) {
  grund(c, "hook", { dunkel: 8, ut: 62 });
  var g = pS("hook", "gesicht", 0.04);
  spot(c, "hook", "Gesicht", { ell: [g[0], g[1], 400, 520] }, 0.04, 0.04, k.brust - 0.02, 56, true);
  qKreis(c, "hook", "Brust", D.grund.hook.pts.brust, 330, 290, k.brust - 0.04, LRED, 9, f2s(9));
  var n = counter(c, 0, 60, k.stunde - 0.30, k.stunde + 0.30, F_NUM, 150, CREAM, [CX, 1610], "+ MIN"); n.name = "Zaehler Minuten"; schatten(n);
  n.inPoint = k.stunde - 0.32;
  credits(c, [D.grund.hook.quelle]);
  var cam = kamera(c, 103);
  punchAt(cam, k.mann, 1.05);
  voxSauce(c, "archiv");
};
// ---------- 2 Name: Portraet (Geo. Prince 1912), Name tippt sich, Fokus aufs Gesicht, echte Teddy-Karikatur 1902 rutscht rein, Kreis um den Baeren ----------
var ZT = "archiv/zeitung-teddy.jpg";
B.name = function (c, k) {
  grund(c, "name", { dunkel: 4 });
  var nm = hellTxt(c, "THEODORE ROOSEVELT", F_SERIF_B, 58, CREAM, [CX, 410], "Name Roosevelt"); typeOn(nm, k.theodore, 30); nm.inPoint = k.theodore;
  var gs = pS("name", "gesicht", 0.5);
  spot(c, "name", "Gesicht", { ell: [gs[0], gs[1], 380, 480] }, 0.5, 0.04, k.teddy - 0.04, 50);
  var z = zeitung(c, ZT, CX, 1075, 660, -3, k.teddy - 0.06, "Berryman 1902"); voxTag(z, "zeitung", true);
  // Ausschnitt 1397 x 1038: Baer x 1029..1259, y 298..597
  zKreis(c, z, "Teddy", 1144, 448, 175, 200, k.teddy + 0.30, LRED, 9);
  chip(c, "TEDDY", 790, 815, LRED, "#FFFFFF", 50, k.benannt - 0.04);
  credits(c, [D.grund.name.quelle, "zeitung-teddy"]);
  kamera(c, 102);
  voxSauce(c, "archiv");
};
// ---------- 3 1912 will er wieder Praesident werden: Menge in Chicago 1912, 1912 tippt, FARBSWEEP ueber die Menge ----------
B.wahl = function (c, k) {
  grund(c, "wahl", { dunkel: 4 });
  tippen(c, "1912", 330, 560, F_NUM, 190, CREAM, k.jahr, 12, "Jahr 1912");
  var t1 = k.praesident - 0.12;
  farbSweep(c, "wahl", "Menge", "#5C86B4", { poly: [[-60, 820], [1140, 820], [1140, 1980], [-60, 1980]], feder: 140 }, t1, t1, { t0: t1, t1: t1 + 0.45, art: "rein-oben" }, 48, true);
  credits(c, [D.grund.wahl.quelle]);
  punchCut(c, 1.08);
  kamera(c, 102);
  voxSauce(c, "archiv");
};
// ---------- 4 Er steht am offenen Auto (Bain, 14.10.1912, kurz vor dem Attentat): Callout auf Roosevelt, KREIS um den Kopf ----------
B.auto = function (c, k) {
  grund(c, "auto", { dunkel: 4 });
  var tr = pS("auto", "tr", 0.04);
  spot(c, "auto", "Roosevelt", { ell: [tr[0], tr[1], 330, 600] }, 0.04, 0.04, null, 52);
  qKreis(c, "auto", "Kopf", D.grund.auto.pts.kopf, 380, 330, k.steht + 0.06, LRED, 9, f2s(9), true);
  credits(c, [D.grund.auto.quelle]);
  punchCut(c, 1.08);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 5 Der Schuss: BRAND-Uebergang, Muendungsblitz, Ringe auf der Brust, Focus Hunting + Wackler auf "wankt", Callout + Punch auf "stehen" ----------
B.schuss = function (c, k) {
  grund(c, "schuss", { dunkel: 10, ut: 60 });
  gBrand(c, "auto", 0, 0.30, true);
  blitz(c, k.schiesst);
  var b = pS("schuss", "brust", k.schiesst);
  rings(c, b[0], b[1], k.schiesst + 0.02, 3, LRED, 320);
  focusHunt(c, k.wankt, false);
  var kp = pS("schuss", "kopf", k.ihn);
  spot(c, "schuss", "Roosevelt", { ell: [kp[0] + 20, kp[1] + 260, 330, 560] }, k.ihn, 0.30, null, 54);
  credits(c, [D.grund.schuss.quelle]);
  var cam = kamera(c, 103);
  keys(cam.rotation, [k.wankt, k.wankt + f2s(4), k.wankt + f2s(9), k.wankt + f2s(14)], [0, -2.2, 1.2, 0], 50);
  punchAt(cam, k.stehen, 1.06);
  voxSauce(c, "archiv");
};
// ---------- 6 Mitte-Aufruf: Roosevelt sitzend (um 1912), PARALLAX (er loest sich vom Raum), Folgen-Knopf -> "Gefolgt" ----------
var FOLGE_POLY = [[0.47, 0.24], [0.70, 0.24], [0.72, 0.45], [0.83, 0.52], [0.92, 0.75], [0.86, 0.99], [0.12, 0.99], [0.16, 0.78], [0.30, 0.52], [0.47, 0.46]];
B.folge = function (c, k) {
  grund(c, "folge", { dunkel: 4 });
  gParallax(c, "folge", fPoly("folge", FOLGE_POLY, 0.76), 0.76, [CX, 1500], 1.07, true);
  followBtn(c, CX, 1140, 0.06, k.schlauer + 0.30, 1.4);
  credits(c, [D.grund.folge.quelle]);
  kamera(c, 102);
  voxSauce(c, "grafik");
};
// ---------- 7 Nicht ins Krankenhaus, sondern zur Halle: Auditorium Milwaukee (Postkarte, Farbe), Chip KRANKENHAUS durchgestrichen,
//            Pfeil (Bleistift) zur echten Eingangstuer ----------
B.halle = function (c, k) {
  grund(c, "halle", { dunkel: 3 });
  spot(c, "halle", "Halle", { ell: [CX, 860, 560, 420] }, 0.5, 0.04, null, 46);
  var kh = chip(c, "KRANKENHAUS", CX, 520, NAVY, "#FFFFFF", 54, k.krankenhaus - 0.04);
  durchstreichen(c, kh, kh.name, k.krankenhaus + 0.30, LRED, 11, k.krankenhaus + 0.30);
  var tu = pS("halle", "tuer", k.halle);
  strichPfeil(c, "halle", "Zur Halle", [[860, 640], [700, 760], [560, 900], [tu[0] + 24, tu[1] - 40]], k.halle, k.halle - 0.06, LRED, 9, f2s(10), true);
  credits(c, [D.grund.halle.quelle]);
  punchCut(c, 1.06);
  kamera(c, 102);
  voxSauce(c, "archiv");
};
// ---------- 8 Auf der Buehne: Roosevelt am Rednerpult 1912, Callout, echte Schlagzeile Daily Missoulian 15.10.1912 + Textmarker ----------
var ZM = "archiv/zeitung-missoulian.jpg";
B.buehne = function (c, k) {
  grund(c, "buehne", { dunkel: 4 });
  var tr = pS("buehne", "tr", 0.04);
  spot(c, "buehne", "Roosevelt", { ell: [tr[0], tr[1], 230, 640] }, 0.04, 0.04, null, 54);
  var z = zeitung(c, ZM, CX, 420, 870, -2, k.sagt - 0.04, "Daily Missoulian 1912"); voxTag(z, "zeitung", true);
  // Ausschnitt 3231 x 722: "DESPITE A WOUND IN THE BREAST," x 73..3156, y 454 (Zeilenhoehe ~150)
  zMarker2(c, z, "WOUND", 70, 3160, 456, 150, k.angeschossen - 0.10, 0.55);
  credits(c, [D.grund.buehne.quelle, "zeitung-missoulian"]);
  kamera(c, 102);
  voxSauce(c, "archiv");
};
// ---------- 9 Er zeigt sein blutiges Hemd: Zeichnung W. A. Rogers 1912 (Blutfleck wird rot), echte Buchtafel 1912 mit dem Hemd, KREIS um das Blut ----------
var ZH = "archiv/zeitung-hemd.jpg";
B.hemd = function (c, k) {
  grund(c, "hemd", { dunkel: 4, ut: 64 });
  spot(c, "hemd", "Roosevelt", { ell: [560, 760, 360, 620] }, 0.5, 0.04, k.blutiges - 0.10, 50);
  var bl = pS("hemd", "blut", k.weste);
  farbSweep(c, "hemd", "Blut", "#B3121B", { ell: [bl[0], bl[1], 190, 230], feder: 40 }, k.weste, k.weste, { t0: k.weste, t1: k.weste + 0.40, art: "rein-oben" }, 78);
  var z = zeitung(c, ZH, 545, 620, 790, 3, k.blutiges - 0.12, "Buchtafel 1912"); voxTag(z, "zeitung");
  // Ausschnitt 1767 x 1203: Blutfleck x 350..1025, y 480..1080
  var kr = zKreis(c, z, "Blut", 689, 782, 400, 350, k.hemd - 0.10, LRED, 9); voxTag(kr, "kreis", true);
  credits(c, [D.grund.hemd.quelle, "zeitung-hemd"]);
  kamera(c, 102);
  voxSauce(c, "archiv");
};
// ---------- 10 In der Brusttasche: Elbert Martin mit der durchschossenen Rede (Bain 1912), Punch, Callout auf die Papiere, LUPE aufs Einschussloch ----------
B.tasche = function (c, k) {
  grund(c, "tasche", { dunkel: 4 });
  var p = pS("tasche", "papiere", k.brusttasche);
  spot(c, "tasche", "Papiere", { ell: [p[0], p[1], 360, 300] }, k.brusttasche, 0.04, k.seine - 0.06, 54);
  gLupe(c, "tasche", k.seine - 0.04, true);
  credits(c, [D.grund.tasche.quelle]);
  var cam = kamera(c, 102);
  punchAt(cam, k.verrueckt, 1.05);
  voxSauce(c, "archiv");
};
// ---------- 11 Fuenfzig Seiten, gefaltet: echte Manuskriptseite mit zwei Einschussloechern (Buch 1912), ZAEHLER 0 -> 50 SEITEN, Kreise um die Loecher ----------
B.seiten = function (c, k) {
  grund(c, "seiten", { dunkel: 8, ut: 68 });
  utDunkel(c, 50);
  var zc = chip(c, "50 SEITEN", CX, 960, LRED, "#FFFFFF", 78, 0.02), zt = c.layer(zc.index - 1), tz1 = k.seiten + 0.12;
  zt.property("ADBE Text Properties").property("ADBE Text Document").expression =
    "posterizeTime(12); String(Math.round(linear(time, 0.06, " + tz1 + ", 0, 50))) + ' SEITEN';";
  noteAnim(null, tz1, zt);
  voxTag(zc, "zaehler", true);
  qKreis(c, "seiten", "Loch oben", D.grund.seiten.pts.loch1, 150, 130, 0.12, CREAM, 8, f2s(8));
  qKreis(c, "seiten", "Loch unten", D.grund.seiten.pts.loch2, 150, 130, k.gefaltet - 0.06, CREAM, 8, f2s(8));
  credits(c, [D.grund.seiten.quelle]);
  kamera(c, 102);
  voxSauce(c, "archiv");
};
// ---------- 12 Brillenetui aus Stahl (KI-Bild, gekennzeichnet): Kreis ums Etui, Chip STAHL, Bahn der Kugel als roter STRICH bis ins Loch, Ringe ----------
B.etui = function (c, k) {
  grund(c, "etui", { dunkel: 3 });
  spot(c, "etui", "Etui", { ell: [CX, 990, 470, 330] }, 0.5, 0.04, null, 46);
  qKreis(c, "etui", "Etui", D.grund.etui.pts.etui, 455, 280, k.etui - 0.04, CREAM, 8, f2s(10));
  chip(c, "STAHL", CX, 600, NAVY, "#FFFFFF", 56, k.stahl - 0.04);
  var lo = pS("etui", "loch", k.kugel);
  strichPfeil(c, "etui", "Kugelbahn", [[980, 300], [800, 560], [lo[0] + 10, lo[1] - 18]], k.kugel, k.kugel - 0.30, LRED, 10, f2s(8), true);
  credits(c, [D.grund.etui.quelle]);
  var cam = kamera(c, 101);
  punchAt(cam, k.gebremst, 1.04);
  voxSauce(c, "archiv");
};
// ---------- 13 Seine Rede hat ihm das Leben gerettet: echte Zeitung (Lake County Times 15.10.1912), TEXTMARKER auf "Manuscript ... Saved Roosevelt" ----------
B.gerettet = function (c, k) {
  grund(c, "gerettet", { dunkel: 10, ut: 72 });
  utDunkel(c, 62);
  // Seite 6148 x 7631: "script In Breast Pocket Saved Roose-" x 4467..5906, y 2663; "velt From Instant Death." x 4467..5472, y 2770
  gMarker(c, "gerettet", "Manuskript", 4460, 5912, 2663, 96, k.rede - 0.04, YEL, true);
  gMarker(c, "gerettet", "Instant Death", 4460, 5478, 2772, 96, k.leben - 0.08, YEL);
  credits(c, [D.grund.gerettet.quelle]);
  kamera(c, 102);
  voxSauce(c, "archiv");
};
// ---------- 14 Die Kugel bleibt bis zu seinem Tod: Roentgenbild 1912 (Bain), KREIS um die echte Kugel, Zaehler 1912 -> 1919 ----------
B.kugel = function (c, k) {
  grund(c, "kugel", { dunkel: 3 });
  qKreis(c, "kugel", "Kugel", D.grund.kugel.pts.kugel, 210, 190, k.kugel - 0.04, LRED, 9, f2s(9), true);
  var n = counter(c, 1912, 1919, k.tod - 0.30, k.tod + 0.40, F_NUM, 150, CREAM, [720, 640]); n.name = "Zaehler 1912-1919"; schatten(n);
  n.inPoint = k.tod - 0.32;
  credits(c, [D.grund.kugel.quelle]);
  punchCut(c, 1.08);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 15 Haettest du weitergeredet? Roosevelt nachdenklich (1912), Callout aufs Gesicht, Fragezeichen ----------
B.frage = function (c, k) {
  grund(c, "frage", { dunkel: 8 });
  var g = pS("frage", "gesicht", 0.04);
  spot(c, "frage", "Gesicht", { ell: [g[0], g[1] + 120, 300, 470] }, 0.04, 0.04, null, 54, true);
  var q = txt(c, "?", F_SERIF_BI, 210, LRED, [870, 470]); q.name = "Fragezeichen"; schatten(q); slam(q, k.weiter - 0.04);
  credits(c, [D.grund.frage.quelle]);
  kamera(c, 102);
  voxSauce(c, "archiv");
};
// ---------- 16 Schluss: Brand-Uebergang in den Parteitag Chicago 1912, grosses Logo (360 px im Kreis), "In der Bio", Folgen-Knopf ----------
B.outro = function (c, k) {
  grund(c, "outro", { dunkel: 12 });
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
