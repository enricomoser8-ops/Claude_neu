// ===================== Szenen: Short 16.11.2026 "Die Freiheitsstatue war nicht immer gruen" (Hintergrund-Vox) =====================
// Jede Szene: vollflaechiges Archivfoto (LOC) als Hintergrund mit langsamer Fahrt, dunkel + warm gegradet (grund()).
// Darueber Vox-Vordergrund: Abzuege (weisser Rand, Schatten), Linien, Pfeile, Zahlen, Etiketten, Stempel, Textmarker, Bleistiftkreise,
// Zeitungsausschnitt, Freisteller. Echte Menschen nur als echte Fotos (Gustave Eiffel). KI-Bilder nur fuer Gegenstaende
// (Muenze, Farbeimer, Patina) und die als "KI-REKONSTRUKTION" beschriftete Kupfer-Statue (Leiste liegt immer obenauf).
// k = Zeiten der Schluesselwoerter relativ zum Szenenanfang (gen_freiheit.py). Jede Animation endet >= 8 Frames vor dem Schnitt.
var B = {};
var ST_REL = "archiv/ki-statue-kupfer-frei.png", GR_REL = "archiv/statue-gruen-heute.jpg";
var PH = { x: 680, y: 610, w: 500, h: 640, ecke: [446, 916] };      // Abzug "Statue heute" oben rechts, Ecke unten links fuer den Faden

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
// Hand-Label (kursive Serif, hell + Schatten) mit schnellem Pfeil (zeichnet sich in 8 Frames, startet 0,08 s nach dem Text); still = steht sofort
function labelF(c, s, x, y, size, t0, color, to, still) {
  var l = txt(c, s, F_SERIF_BI, size || 60, color || CREAM, [x, y]); l.name = "Label " + s;
  schatten(l);
  if (!still) typeOn(l, t0, 32);
  l.inPoint = t0;
  if (to) {
    var sx = x + (to[0] > x ? 30 : -30), sy = to[1] < y ? y - (size || 60) * 0.95 : y + 16;
    var mx = (sx + to[0]) / 2, my = Math.min(sy, to[1]) - 40;
    var p = { v: [[sx, sy], to], i: [[0, 0], [mx - to[0], my - to[1]]], o: [[mx - sx, my - sy], [0, 0]], c: false };
    var ang = Math.atan2(to[1] - my, to[0] - mx), L = 26;
    var head = line2([[to[0] - L * Math.cos(ang - 0.5), to[1] - L * Math.sin(ang - 0.5)], to, [to[0] - L * Math.cos(ang + 0.5), to[1] - L * Math.sin(ang + 0.5)]]);
    var a = pencil(c, "Pfeil " + s, [p, head], color || CREAM, 5, still ? null : t0 + 0.08, f2s(8));
    a.inPoint = t0;
  }
  return l;
}
function hellTxt(c, s, font, size, color, pos, name) {   // Text direkt auf dem Foto: hell + Schatten
  var l = txt(c, s, font, size, color || CREAM, pos); l.name = name || ("Text " + s); schatten(l); return l;
}
function ellP(cx, cy, rx, ry) {
  var kx = 0.5523 * rx, ky = 0.5523 * ry;
  return { v: [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]], i: [[-kx, 0], [0, -ky], [kx, 0], [0, ky]], o: [[kx, 0], [0, ky], [-kx, 0], [0, -ky]], c: true };
}
// Freisteller der Kupfer-Statue (KI-Rekonstruktion), mit Leiste ueber der Schnittkante
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
  var W0 = it.width, H0 = it.height;
  var a = mkShape(line2([[-30, H0 + 40], [W0 + 30, H0 + 40], [W0 + 30, H0 + 40], [-30, H0 + 40]], true));
  var b = mkShape(line2([[-30, -60], [W0 + 30, -60], [W0 + 30, H0 + 40], [-30, H0 + 40]], true));
  var m = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  m.property("ADBE Mask Feather").setValue([0, 70]);
  keys(m.property("ADBE Mask Shape"), [t0, t1], [a, b], [[20, 20], [60, 60]]);
  return l;
}

// ---------- 1 Hook: Hafen von New York (Luftbild), Sturzflug auf die Statue, Abzug "heute", HEUTE: GRUEN durchgestrichen ----------
B.hook = function (c, k) {
  grund(c, "hook", { dunkel: 6 });
  // grosser Ortstitel gleich zu Beginn (Flug ueber den Hafen), weicht dem Abzug "Statue heute"
  var ny = hellTxt(c, "New York", F_SANS_B, 120, "#FFFFFF", [CX, 330], "Ort New York"); typeOn(ny, 0.04, 30); ny.inPoint = 0.04; ny.outPoint = k.statue + 0.04;
  var pin = D.grund.hook.pin["Liberty Island"];
  gPin(c, "hook", "Liberty Island", k.statue, VERD);
  var ph = printPhoto(c, GR_REL, PH.x, PH.y, PH.w, PH.h, 3, null);
  dropIn(ph, k.statue + 0.04, 180, 0.36);
  faden(c, PH.ecke, [pin[0] + 12, pin[1] - 112], 2.30, CREAM);
  var li = hellTxt(c, "Liberty Island", F_SERIF_I, 36, CREAM, [228, pin[1] + 52], "Ort Liberty Island"); typeOn(li, 2.30, 26); li.inPoint = 2.30;
  // "Und sie war nicht immer gruen": Etikett HEUTE: GRUEN, roter Strich mittig durch (Fix 13.11.: lag unter dem Text), Fragezeichen
  var ch = chip(c, "HEUTE: GRÜN", PH.x, 1052, VERD, "#FFFFFF", 42, k.und);
  durchstreichen(c, ch, "Etikett Flaeche HEUTE: GRÜN", k.nicht, LRED, 10, k.und + 0.5);
  var q2 = txt(c, "?", F_SERIF_BI, 210, LRED, [930, 1220]); q2.name = "Fragezeichen"; schatten(q2); slam(q2, k.gruen - 0.04);
  credits(c, ["bg-hafen-heute", "statue-gruen-heute"]);
  camRig(c, CX, FCY, { punchIn: false, s0: 100, s1: 103 });
  voxSauce(c, "grafik");
};
// ---------- 2 Am Anfang braun: Kupfer-Statue (KI-Rekonstruktion) vor dem Aufbau 1886, Kupfermuenze ----------
B.braun = function (c, k) {
  grund(c, "braun");
  var y = odometer(c, "1886", F_NUM, 150, CREAM, [800, 380], k.anfang, f2s(14)); y.name = "Jahr 1886"; schatten(y);
  statue(c, k.glaenzt - 0.04);
  chip(c, "KUPFERBRAUN", 775, 1056, COPPER, "#FFFFFF", 36, k.braun);
  var m = farbFrei(c, "archiv/ki-kupfermuenze-frei.png", 790, 720, 290, "Kupfermuenze (KI-Bild)");
  popIn(m, k.muenze - 0.06, 12);
  leisteNachOben(c);
  credits(c, ["bg-bedloe-1886", "ki-statue-kupfer", "ki-kupfermuenze"]);
  var cam = camRig(c, CX, FCY, { punchIn: 108, s0: 100, s1: 103 });
  punchAt(cam, k.braun - f2s(2), 1.03);
  voxSauce(c, "grafik");
};
// ---------- 3 Geschenk von Frankreich: Kopf der Statue in Paris 1878 (schneller Zoom), Kupfer-Kachel, Abzug Paris 1883, Pfeil FRANKREICH -> USA ----------
B.geschenk = function (c, k) {
  grund(c, "geschenk");
  var pa = hellTxt(c, "Paris, 1878", F_SERIF_BI, 56, CREAM, [CX, 330], "Ort Paris 1878"); typeOn(pa, 0.04, 30); pa.inPoint = 0.04;
  var t0 = k.geschenk - 0.08; pa.outPoint = t0 + 0.30;   // Ortsangabe weicht dem Abzug
  var kc = elementKachel(c, CX, 680, 380, k.kupfer - 0.04);
  keys(kc.scale, [t0, t0 + f2s(5)], [[100, 100], [0, 0]], [[60, 10], [10, 60]]); kc.outPoint = t0 + f2s(14);
  var ph = printPhoto(c, "archiv/paris-bau-1883.jpg", 540, 560, 380, 560, -3, null);
  dropIn(ph, t0 + 0.30, 180, 0.36);
  chip(c, "FRANKREICH", 290, 1080, NAVY, "#FFFFFF", 40, k.frankreich - 0.04);
  routePfeil(c, [470, 1050], [650, 1050], 0.30, k.frankreich + 0.18, k.usa - 0.20, LRED);
  var at = hellTxt(c, "Atlantik", F_SERIF_I, 36, LBLAU, [560, 965], "Label Atlantik"); typeOn(at, k.frankreich + 0.30, 30); at.inPoint = k.frankreich + 0.30;
  chip(c, "USA", 800, 1080, NAVY, "#FFFFFF", 40, k.usa - 0.22);
  sourceBar(c, "Paris 1883", "Bau der Statue", t0 + 0.40, 1480);
  credits(c, ["bg-paris-kopf-1878", "paris-bau-1883"]);
  camRig(c, CX, FCY, { punchIn: 108, s0: 100, s1: 102 });
  voxSauce(c, "archiv");
};
// ---------- 4 Kupferhaut so dick wie zwei Muenzen: Werkstatt in Paris, Abzug Kopf + Fackelhand, 2,4 mm ----------
B.haut = function (c, k) {
  grund(c, "haut");
  var ph = printPhoto(c, "archiv/paris-bau-1883-detail.jpg", 540, 600, 600, 600, 2, null);
  dropIn(ph, 0.04, 160, 0.32);
  labelF(c, "Kupferhaut", 330, 1010, 60, k.kupferhaut, LCOPPER, [640, 690]);
  var mm = hellTxt(c, "≈ 2,4 mm", F_NUM, 92, CREAM, [300, 1180], "Mass 2,4 mm"); typeOn(mm, k.dick, 30); mm.inPoint = k.dick;
  var m1 = farbFrei(c, "archiv/ki-kupfermuenze-frei.png", 680, 1130, 190, "Muenze 1 (KI-Bild)"); popIn(m1, k.zwei - 0.26, 10);
  var m2 = farbFrei(c, "archiv/ki-kupfermuenze-frei.png", 800, 1150, 190, "Muenze 2 (KI-Bild)"); popIn(m2, k.zwei - 0.06, -8);
  credits(c, ["bg-werkstatt-paris", "paris-bau-1883-detail", "ki-kupfermuenze"]);
  camRig(c, CX, FCY, { punchIn: 108, s0: 100, s1: 103 });
  voxSauce(c, "archiv");
};
// ---------- 5 Geruest aus Eisen von Gustave Eiffel: Fahrt am Geruest hinauf, Plan 1881, Portraet, Eiffelturm 1889 ----------
B.eiffel = function (c, k) {
  grund(c, "eiffel");
  var gp = printPhoto(c, "archiv/eiffel-geruest-1881.jpg", 370, 670, 480, 640, -2, null);
  dropIn(gp, k.geruest - 0.04, 180, 0.36);
  labelF(c, "Eisen", 330, 1110, 64, k.eisen, CREAM, [372, 960]);
  var pt = printPhoto(c, "archiv/eiffel-portraet.jpg", 770, 520, 320, 340, 3, null);
  dropIn(pt, k.gustave - 0.04, 160, 0.34);
  sourceBar(c, "Gustave Eiffel", "Ingenieur, Paris", k.gustave + 0.56, 1480);
  pencil(c, "Unterstrich Eiffel", [line2([[625, 728], [770, 732], [915, 726]])], LRED, 8, k.mann, f2s(8));
  var tw = printPhoto(c, "archiv/eiffelturm-1889.jpg", 770, 950, 310, 360, -3, null);
  dropIn(tw, k.turm - 0.10, 160, 0.34);
  var tl = hellTxt(c, "Eiffelturm, 1889", F_SERIF_I, 40, CREAM, [770, 1205], "Label Eiffelturm"); typeOn(tl, k.turm + 0.1, 30); tl.inPoint = k.turm + 0.1;
  pencil(c, "Kreis Halt", [ellP(370, 670, 150, 290)], LRED, 8, k.gibt, f2s(9));
  credits(c, ["bg-geruest-paris", "eiffel-geruest-1881", "eiffel-portraet", "eiffelturm-1889"]);
  var cam = camRig(c, CX, FCY, { punchIn: 108, s0: 100, s1: 102 });
  punchAt(cam, k.turm - f2s(3), 1.03);
  voxSauce(c, "archiv");
};
// ---------- 6 Mitte-Aufruf: Statue im Hafen (um 1890), Folgen-Knopf wird geklickt ----------
B.folge = function (c, k) {
  grund(c, "folge", { dunkel: 18 });
  followBtn(c, CX, 700, 0.06, k.schlauer + 0.30, 1.4);
  credits(c, ["bg-insel-1890"]);
  camRig(c, CX, FCY, { punchIn: 106, s0: 100, s1: 102 });
  voxSauce(c, "grafik");
};
// ---------- 7 Kupfer reagiert mit Luft und Regen (Wolken ueber dem Hafen, um 1910) ----------
B.regen = function (c, k) {
  grund(c, "regen");
  statue(c, null);
  chip(c, "KUPFER", 780, 1056, COPPER, "#FFFFFF", 40, k.kupfer);
  labelF(c, "Luft", 810, 470, 72, k.luft - 0.04, LBLAU, [560, 520]);
  var rg = labelF(c, "Regen", 815, 800, 72, k.regen - 0.08, LBLAU, [575, 820], true);
  slam(rg, k.regen - 0.08);
  leisteNachOben(c);
  credits(c, ["bg-wolken-1910", "ki-statue-kupfer"]);
  camRig(c, CX, FCY, { punchIn: 108, s0: 100, s1: 103 });
  voxSauce(c, "grafik");
};
// ---------- 8 Langsam die gruene Schicht, die Patina (Jahre laufen 1886 -> 1906), Hintergrund: Kupfer-Gewand heute ----------
B.patina = function (c, k) {
  grund(c, "patina", { dunkel: 16 });
  statue(c, null);
  statueGruen(c, 0.06, 1.70);
  var n = counter(c, 1886, 1906, 0.10, 1.70, F_NUM, 150, CREAM, [780, 380]); n.name = "Jahre 1886-1906"; schatten(n);
  chip(c, "GRÜN", 780, 1056, VERD, "#FFFFFF", 44, k.gruene);
  var mk = printPhoto(c, "archiv/ki-patina-makro.jpg", 780, 760, 340, 200, 2, null);
  dropIn(mk, k.patina - 0.14, 140, 0.34);
  var pl = hellTxt(c, "Patina", F_SERIF_BI, 60, LVERD, [780, 962], "Label Patina"); typeOn(pl, k.patina, 30); pl.inPoint = k.patina;
  leisteNachOben(c);   // Fix 13.11.: die gruene Statue lag ueber "KI-REKONSTRUKTION"
  credits(c, ["bg-gewand-heute", "ki-statue-kupfer", "ki-patina-makro"]);
  camRig(c, CX, FCY, { punchIn: 108, s0: 100, s1: 103 });
  voxSauce(c, "grafik");
};
// ---------- 9 1906: so gruen, dass viele an Rost denken (Photochrom um 1905; Zeitung Wilmington 1906, Textmarker auf "Rusted") ----------
B.rost = function (c, k) {
  grund(c, "rost", { dunkel: 20 });
  var y = odometer(c, "1906", F_NUM, 130, CREAM, [CX, 300], 0.04, f2s(14)); y.name = "Jahr 1906"; schatten(y);
  var ph = printPhoto(c, "archiv/zeitung-1906-wilmington.jpg", CX, 740, 860, 680, -1.5, null);
  popIn(ph, 0.06, -3);
  sourceBar(c, "Evening Journal", "Wilmington, 17.10.1906", k.statue + 0.30, 1480);
  chip(c, "SO GRÜN", CX, 1180, VERD, "#FFFFFF", 42, k.gruen - 0.04);
  // Textmarker auf "Rusted" (Bildpunkte x 196..520, y 355 in der Zeitung; Abzug-Massstab, Innen-Zoom ~1,10 bei 3 s; Drehung -1,5 Grad)
  var ms = abzugMass("archiv/zeitung-1906-wilmington.jpg", 860, 680), z = ms[2] * (1.04 + 0.08 * 3.0 / c.duration);
  var x0 = CX + (196 - 783.5) * z, x1 = CX + (520 - 783.5) * z, yy = 740 + (355 - 633) * z;
  var a0 = -1.5 * Math.PI / 180, ys0 = yy + (x0 - CX) * Math.sin(a0), ys1 = yy + (x1 - CX) * Math.sin(a0);
  var hl = highlighter(c, x0, x1, (ys0 + ys1) / 2, k.viele); hl.name = "Textmarker Rusted";
  stempel(c, "ROST?", 820, 1190, -5, k.rost - 0.06, 64);
  credits(c, ["zeitung-1906-wilmington", "bg-photochrom-1905"]);
  camRig(c, CX, FCY, { punchIn: 108, s0: 100, s1: 103 });
  voxSauce(c, "archiv");
};
// ---------- 10 Der Kongress gibt Geld frei, um sie anzustreichen (Kapitol in Washington, 1902) ----------
var EIMER = { x: 760, y: 1000, h: 340 };
B.kongress = function (c, k) {
  grund(c, "kongress");
  var ZK = "archiv/zeitung-1906-kongress.jpg", zx = CX, zy = 460, zr = -2;
  var zp = printPhoto(c, ZK, zx, zy, 640, 300, zr, null); popIn(zp, 0.06, -4);
  // Textmarker: Bildpunkte im Ausschnitt (684 x 190, ALTO-OCR): "Congress," x 339..483 y 80, "$62,800" x 556..650 y 111
  var zm = abzugMass(ZK, 640, 300), zz = zm[2] * (1.04 + 0.08 * 1.2 / c.duration), za = zr * Math.PI / 180;
  function zpt(px, py) { var dx = (px - 342) * zz, dy = (py - 95) * zz; return [zx + dx * Math.cos(za) - dy * Math.sin(za), zy + dx * Math.sin(za) + dy * Math.cos(za)]; }
  var h0 = zpt(336, 80), h1 = zpt(486, 80); var hl = highlighter(c, h0[0], h1[0], (h0[1] + h1[1]) / 2, k.kongress); hl.name = "Textmarker Congress";
  var g0 = zpt(553, 111), g1 = zpt(653, 111); var hg = highlighter(c, g0[0], g1[0], (g0[1] + g1[1]) / 2, k.geld - 0.10); hg.name = "Textmarker 62800";
  gPin(c, "kongress", "Kapitol", k.kongress, NAVY);
  var wl = hellTxt(c, "Washington", F_SERIF_BI, 48, CREAM, [800, 655], "Ort Washington"); typeOn(wl, k.kongress + 0.20, 26); wl.inPoint = k.kongress + 0.20;
  chip(c, "US-KONGRESS", CX, 800, NAVY, "#FFFFFF", 40, k.kongress + 0.40);
  var dl = hellTxt(c, "$", F_NUM, 230, LVERD, [260, 1030], "Dollar"); slam(dl, k.geld - 0.04);
  var gf = hellTxt(c, "Geld frei", F_SERIF_BI, 56, CREAM, [270, 1140], "Label Geld frei"); typeOn(gf, k.geld + 0.12, 30); gf.inPoint = k.geld + 0.12;
  var bk = farbFrei(c, "archiv/ki-farbeimer-frei.png", EIMER.x, EIMER.y, EIMER.h, "Farbeimer (KI-Bild)"); popIn(bk, k.streichen - 0.10, 8);
  credits(c, ["zeitung-1906-kongress", "bg-kapitol-1902", "ki-farbeimer"]);
  camRig(c, CX, FCY, { punchIn: 108, s0: 100, s1: 103 });
  voxSauce(c, "grafik");
};
// ---------- 11 Aber die Menschen protestieren: Stempel schlagen ein (Hintergrund: Zeitungsseite 1906 ueber die Statue) ----------
B.protest = function (c, k) {
  grund(c, "protest", { dunkel: 18 });
  farbFrei(c, "archiv/ki-farbeimer-frei.png", EIMER.x, EIMER.y, EIMER.h, "Farbeimer (KI-Bild)");
  stempel(c, "NEIN!", 330, 520, -7, 0.06, 84);
  stempel(c, "PROTEST!", 640, 330, 5, k.menschen - 0.04, 70);
  stempel(c, "NICHT ANSTREICHEN!", 520, 1232, -2, k.protest - 0.04, 50);
  credits(c, ["bg-zeitung-seite", "ki-farbeimer"]);
  camRig(c, CX, FCY, { punchIn: 110, s0: 100, s1: 103 });
  voxSauce(c, "grafik");
};
// ---------- 12 Fachleute pruefen die gruene Schicht: Statue heute (Hintergrund), Patina-Makro (KI-Bild) + Lupen-Ausschnitt ----------
var MK = { rel: "archiv/ki-patina-makro.jpg", x: CX, y: 600, mw: 860, mh: 500 };
B.pruefen = function (c, k) {
  grund(c, "pruefen", { dunkel: 18 });
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
  var rg = shape(c, "Lupe Rand"), gr = grp(rg, "Rand"); ellipseG(gr, br * 2, br * 2, bx, by); stroke(gr, CREAM, 7);
  popIn(rg, k.pruefen + 0.04, 0); rg.anchorPoint.setValue([bx, by]); rg.position.setValue([bx, by]);
  pencil(c, "Lupe Fang", [circPath(sx, sy, 56), line2([[sx - 40, sy + 40], [bx - br * 0.72, by - br * 0.7]]), line2([[sx + 40, sy + 40], [bx + br * 0.72, by - br * 0.7]])], CREAM, 5, k.pruefen - 0.08, f2s(8));
  credits(c, ["ki-patina-makro", "bg-statue-nah"]);
  camRig(c, CX, FCY, { punchIn: 106, s0: 100, s1: 102 });
  voxSauce(c, "grafik");
};
// ---------- 13 Ergebnis: Die Patina schuetzt das Kupfer darunter (Hintergrund: Krone heute) ----------
B.ergebnis = function (c, k) {
  grund(c, "ergebnis", { dunkel: 16 });
  printPhoto(c, MK.rel, MK.x, MK.y, MK.mw, MK.mh, 0, null);
  var e = hellTxt(c, "Ergebnis:", F_SERIF_B, 84, CREAM, [CX, 286], "Titel Ergebnis"); typeOn(e, k.ergebnis, 30); e.inPoint = k.ergebnis;
  labelF(c, "Patina", 260, 1010, 66, k.patina - 0.04, LVERD, [330, 560]);
  pencil(c, "Schutzlinie", [line2([[120, 782], [540, 786], [960, 780]])], LVERD, 12, k.schuetzt - 0.04, f2s(8));
  chip(c, "SCHÜTZT", CX, 1150, VERD, "#FFFFFF", 42, k.schuetzt);
  labelF(c, "Kupfer", 820, 1010, 66, k.kupfer - 0.16, LCOPPER, [760, 822]);
  var hl = shape(c, "Textmarker darunter"), gh = grp(hl); addPath(gh, line2([[130, 822], [950, 824]])); stroke(gh, YEL, 30);
  hl.blendingMode = BlendingMode.MULTIPLY; hl.opacity.setValue(70); hl.inPoint = k.darunter;   // steht sofort (8-Frames-Regel)
  credits(c, ["ki-patina-makro", "bg-gewand-heute"]);
  camRig(c, CX, FCY, { punchIn: 106, s0: 100, s1: 103 });
  voxSauce(c, "grafik");
};
// ---------- 14 Nichts gestrichen - sie bleibt bis heute gruen (Hafen heute, gleiche Ansicht wie im Einstieg) ----------
B.bleibt = function (c, k) {
  grund(c, "bleibt", { dunkel: 6 });
  var tc = k.und;   // harter Schnitt im Bild: Eimer weg, Statue (heute) kommt
  var bk = farbFrei(c, "archiv/ki-farbeimer-frei.png", CX, 760, 500, "Farbeimer (KI-Bild)"); bk.outPoint = tc;
  var x = kreuz(c, bildRahmen(bk, "archiv/ki-farbeimer-frei.png"), "Farbeimer (KI-Bild)", k.nichts - 0.02, LRED, 16); x.outPoint = tc;
  var sp = stempel(c, "NICHTS GESTRICHEN", CX, 1150, -3, k.gestrichen - 0.04, 52); sp.outPoint = tc;
  for (var i = 1; i <= c.numLayers; i++) if (c.layer(i).name === "Stempel NICHTS GESTRICHEN") c.layer(i).outPoint = tc;
  var pin = D.grund.bleibt.pin["Liberty Island"];
  gPin(c, "bleibt", "Liberty Island", tc + 0.02, VERD);
  var ph = printPhoto(c, GR_REL, PH.x, PH.y, PH.w, PH.h, 3, null);
  dropIn(ph, k.statue - 0.06, 180, 0.34);
  faden(c, PH.ecke, [pin[0] + 12, pin[1] - 112], k.statue + 0.36, CREAM);
  pencil(c, "Kreis heute", [ellP(PH.x, PH.y, 290, 362)], LVERD, 9, k.bleibt, f2s(9));
  chip(c, "BIS HEUTE: GRÜN", PH.x, 1052, VERD, "#FFFFFF", 40, k.heute - 0.04);
  credits(c, ["bg-hafen-heute", "statue-gruen-heute", "ki-farbeimer"]);
  camRig(c, CX, FCY, { punchIn: 108, s0: 100, s1: 103 });
  voxSauce(c, "grafik");
};
// ---------- 15 Welche Farbe findest du schoener? braun | gruen (Wolken ueber dem Hafen, um 1905) ----------
B.frage = function (c, k) {
  grund(c, "frage", { dunkel: 16 });
  statue(c, 0.04, 300, 700, 680);
  var ph = printPhoto(c, GR_REL, 770, 690, 360, 640, 2, null);
  popIn(ph, 0.10, 4);
  var q = txt(c, "?", F_SERIF_BI, 160, LRED, [545, 250]); q.name = "Fragezeichen"; schatten(q); slam(q, k.farbe - 0.04);
  pencil(c, "Trennlinie", [line2([[533, 430], [530, 760], [534, 1090]])], CREAM, 6, k.schoener - 0.04, f2s(8));
  chip(c, "BRAUN", 300, 1172, COPPER, "#FFFFFF", 46, k.braun - 0.04);
  var g = chip(c, "GRÜN", 770, 1172, VERD, "#FFFFFF", 46, null); setIn(g, k.gruen - 0.02);   // steht sofort (8-Frames-Regel)
  leisteNachOben(c);
  credits(c, ["ki-statue-kupfer", "statue-gruen-heute", "bg-wolken-1905"]);
  camRig(c, CX, FCY, { punchIn: 108, s0: 100, s1: 102 });
  voxSauce(c, "grafik");
};
// ---------- 16 Schluss: grosses Logo, "In der Bio", Folgen-Knopf ueber dem stark abgedunkelten Luftbild ----------
B.outro = function (c, k) {
  grund(c, "outro", { dunkel: 30 });
  pencil(c, "Kreis Logo", [ellP(CX, 640, 262, 262)], CREAM, 7, 0.04, f2s(14));
  var lg = imp("archiv/logo.png");
  if (lg) { var lo = addItem(c, lg, CX, 640, 420 / lg.width * 100); lo.name = "Logo gross"; popIn(lo, 0.08); }
  var lk = hellTxt(c, "In der Bio", F_SERIF_BI, 84, CREAM, [CX, 1010], "Text In der Bio"); typeOn(lk, k.bio - f2s(4), 30); lk.inPoint = k.bio - f2s(4);
  pencil(c, "Unterstrich Bio", [line2([[350, 1034], [540, 1040], [730, 1032]])], LRED, 7, k.bio + 0.45, f2s(10));
  followBtn(c, CX, 1160, k.bio + 0.6, k.folgen + f2s(3));
  credits(c, ["bg-insel-luft"]);
  camRig(c, CX, 900, { punchIn: 112, s0: 100, s1: 103, punchOut: false });
  voxSauce(c, "grafik");
};
