// ===================== Szenen: Short 16.11.2026 "Die Freiheitsstatue war nicht immer gruen" (Hintergrund-Vox, Runde 2) =====================
// Runde 2 (enno nach dem Render: "zugepflastert mit Bildern, zu wenig Vox"): Das Hintergrundfoto ist DAS Bild der Szene.
// Vordergrund-Abzuege sind raus bis auf das Portraet von Gustave Eiffel (echter Mensch) und EINEN KI-Freisteller (Kupfermuenze,
// "wie eine neue Kupfermuenze"). Zeitungsausschnitte (echte Zeitung 1906) zaehlen als Vox, nicht als Foto.
// Stattdessen wirken Vox-Geraete auf das Foto (grund_lib.jsx): Kontrast-Callout, Farbsweep (Kupfer/Gruen im Mischmodus Farbe ueber der
// echten Statue), Bleistiftkreise und Pfeile auf echte Dinge, Lupe, Fokus-Unschaerfe, Messlinie, Parallax-Split, Seite umblaettern,
// Brand-Uebergang, Textmarker auf der Zeitungsseite, Punch-Cut. Typografie: Tippen mit Cursor, Zaehler/Odometer, Chips, roter
// Quellenbalken ("LAUT ..."), sauberer roter Strich durch ein getipptes Wort. Keine roten Stempel mehr (enno).
// Kein Hauptgeraet zweimal hintereinander (VOX-Pruefung im Probelauf). k = Zeiten der Schluesselwoerter relativ zum Szenenanfang.
// Koordinaten der Ziele im Foto: Bildschirm-px zur Zeit tr (die Geraete rechnen sie in Quellpixel um und kleben am Foto).
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
// Hand-Label ohne Pfeil (steht sofort oder tippt sich)
function labelF(c, s, x, y, size, t0, color, to, still) {
  var l = txt(c, s, F_SERIF_BI, size || 60, color || CREAM, [x, y]); l.name = "Label " + s; schatten(l);
  if (!still) typeOn(l, t0, 32);
  l.inPoint = t0;
  return l;
}
// Kamera der Szene: nur noch langsame Drift (der Punch auf dem Schnitt ist punchCut und wirkt auf Foto + Grafik gleich)
function kamera(c, s1) { return camRig(c, CX, FCY, { punchIn: false, punchOut: false, s0: 100, s1: s1 || 102 }); }

// ---------- 1 Hook: Flug ueber den Hafen, Callout + LUPE auf die echte Statue, Etikett IMMER GRUEN wird durchgestrichen ----------
B.hook = function (c, k) {
  grund(c, "hook", { dunkel: 4 });
  var ny = tippen(c, "New York", 250, 330, F_SANS_B, 120, "#FFFFFF", 0.04, 26, "Ort New York"); ny.outPoint = k.statue;
  spot(c, "hook", "Statue", { ell: [312, 930, 175, 330] }, 2.4, k.statue, null, 52);
  gLupe(c, "hook", k.statue + 0.10, true);
  tippen(c, "Liberty Island", 120, 1240, F_SERIF_I, 44, CREAM, k.statue + 0.50, 30, "Ort Liberty Island");
  var ch = chip(c, "IMMER GRÜN", 760, 900, VERD, "#FFFFFF", 48, k.und);
  durchstreichen(c, ch, "Etikett Flaeche IMMER GRÜN", k.nicht, LRED, 10, k.und + 0.5);
  var q2 = txt(c, "?", F_SERIF_BI, 200, LRED, [930, 1130]); q2.name = "Fragezeichen"; schatten(q2); slam(q2, k.gruen - 0.04);
  credits(c, ["bg-hafen-heute"]);
  kamera(c, 102);
  voxSauce(c, "grafik");
};
// ---------- 2 Am Anfang braun: FARBSWEEP kupferbraun ueber die echte Statue (Stich 1886), Glanz, eine Kupfermuenze (KI) ----------
var BRAUN_POLY = [[60, 40], [230, 30], [330, 280], [470, 230], [640, 250], [820, 360], [960, 600], [1010, 880], [940, 1300], [930, 1940], [180, 1940], [150, 1300], [110, 820], [160, 460], [130, 300]];
B.braun = function (c, k) {
  grund(c, "braun");
  var y = odometer(c, "1886", F_NUM, 150, CREAM, [790, 330], k.anfang, f2s(14)); y.name = "Jahr 1886"; schatten(y);
  farbSweep(c, "braun", "Kupfer Statue", COPPER, { poly: BRAUN_POLY, feder: 30 }, 1.8, k.glaenzt - 0.06, { art: "rein-oben", t0: k.glaenzt - 0.06, t1: k.glaenzt + 0.50 }, 74, true);
  // "glaenzt": heller Glanzstreifen laeuft diagonal ueber die Statue (Add, nur in der Statuen-Maske)
  var gl = gFlaeche(c, "braun", "Farbe Glanz", "#FFE2B8"); gl.blendingMode = BlendingMode.ADD; gl.opacity.setValue(26);
  maskeQ(gl, gPoly("braun", BRAUN_POLY, 1.8), 30 / gZust("braun", 1.8).z, false);
  var mg = gl.property("ADBE Mask Parade").addProperty("ADBE Mask Atom"); try { mg.maskMode = MaskMode.INTERSECT; } catch (e) {}
  mg.property("ADBE Mask Feather").setValue([90, 90]);
  var band = function (dx) { return mkShape(gPoly("braun", [[-500 + dx, 0], [-300 + dx, 0], [-700 + dx, 1920], [-900 + dx, 1920]], 1.8)); };
  keys(mg.property("ADBE Mask Shape"), [k.glaenzt + 0.10, k.glaenzt + 0.80], [band(0), band(2100)], [[30, 30], [60, 60]]);
  noteAnim(null, k.glaenzt + 0.80, gl);
  gl.inPoint = k.glaenzt + 0.10; gl.outPoint = k.glaenzt + 0.80 + f2s(9); voxTag(gl, "glanz");
  chip(c, "KUPFERBRAUN", 760, 1120, COPPER, "#FFFFFF", 40, k.braun);
  var m = farbFrei(c, "archiv/ki-kupfermuenze-frei.png", 800, 760, 260, "Kupfermuenze (KI-Bild)");
  popIn(m, k.muenze - 0.06, 12);
  tippen(c, "neue Münze", 690, 950, F_SERIF_I, 44, LCOPPER, k.muenze + 0.12, 30, "Label neue Muenze");
  credits(c, ["bg-bedloe-1886", "ki-kupfermuenze"]);
  punchCut(c, 1.12);
  kamera(c, 103);
  voxSauce(c, "grafik");
};
// ---------- 3 Geschenk von Frankreich: Kupfer-Kachel, Zoom auf den Kopf (Paris 1878), BLEISTIFTKREIS + Pfeil, FRANKREICH -> USA ----------
B.geschenk = function (c, k) {
  grund(c, "geschenk");
  tippen(c, "Paris, 1878", 300, 330, F_SERIF_BI, 64, CREAM, 0.04, 30, "Ort Paris 1878");
  var t0 = k.geschenk - 0.08;
  var kc = elementKachel(c, CX, 700, 360, k.kupfer - 0.04);
  keys(kc.scale, [t0, t0 + f2s(5)], [[100, 100], [0, 0]], [[60, 10], [10, 60]]); kc.outPoint = t0 + f2s(14);
  gKreis(c, "geschenk", "Kopf", [520, 820, 270, 340], 1.9, k.geschenk + 0.30, CREAM, 8, f2s(10), true);
  gLabel(c, "geschenk", "aus Kupfer", 830, 470, 56, [690, 610], 1.9, k.geschenk + 0.46, LCOPPER);
  chip(c, "FRANKREICH", 290, 1230, NAVY, "#FFFFFF", 40, k.frankreich - 0.04);
  routePfeil(c, [470, 1200], [650, 1200], 0.30, k.frankreich + 0.18, k.usa - 0.20, LRED);
  chip(c, "USA", 800, 1230, NAVY, "#FFFFFF", 40, k.usa - 0.22);
  credits(c, ["bg-paris-kopf-1878"]);
  kamera(c, 102);
  voxSauce(c, "archiv");
};
// ---------- 4 Kupferhaut so duenn wie zwei Muenzen: Werkstatt Paris, Callout auf das Kupferblech, MESSLINIE "~ 2,4 mm" ----------
B.haut = function (c, k) {
  grund(c, "haut");
  spot(c, "haut", "Kupferblech", { ell: [500, 860, 380, 270] }, 1.2, k.kupferhaut, null, 44);
  gLabel(c, "haut", "Kupferhaut", 300, 470, 64, [430, 790], 1.2, k.kupferhaut + 0.06, LCOPPER);
  gMass(c, "haut", [560, 930], [760, 930], 1.2, k.dick - 0.10, YEL, true);
  tippen(c, "≈ 2,4 mm", 520, 1080, F_NUM, 96, YEL, k.dick, 30, "Mass 2,4 mm");
  chip(c, "= 2 MÜNZEN", 680, 1210, COPPER, "#FFFFFF", 40, k.zwei - 0.08);
  credits(c, ["bg-werkstatt-paris"]);
  punchCut(c, 1.10);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 5 Eisengeruest von Gustave Eiffel: FOKUS faehrt am Geruest hoch, Linien zeichnen das Eisen nach, Portraet (einziger Mensch) ----------
B.eiffel = function (c, k) {
  grund(c, "eiffel");
  gFokus(c, k.geruest, k.gustave + 0.10, [540, 1350], [540, 820], 360, 440, true);
  gLabel(c, "eiffel", "Eisen", 200, 470, 70, [330, 640], 2.8, k.eisen, CREAM);
  var pt = printPhoto(c, "archiv/eiffel-portraet.jpg", 770, 600, 320, 360, 3, null);
  dropIn(pt, k.gustave - 0.04, 160, 0.34);
  sourceBar(c, "Gustave Eiffel", "Ingenieur, Paris", k.gustave + 0.50, 1480);
  tippen(c, "Eiffelturm, 1889", 600, 900, F_SERIF_I, 46, CREAM, k.turm - 0.10, 30, "Label Eiffelturm");
  // "gibt ihr Halt": das eiserne Geruest wird mit gelben Linien nachgezeichnet (Linien kaufen Zeit)
  gStrich(c, "eiffel", "Geruest", [[[252, 1240], [258, 960]], [[832, 1240], [826, 960]], [[252, 1240], [832, 1240]], [[255, 1100], [829, 1100]], [[258, 960], [826, 960]]], 4.0, k.gibt - 0.20, YEL, 7, f2s(10));
  credits(c, ["bg-geruest-paris", "eiffel-portraet"]);
  kamera(c, 102);
  voxSauce(c, "archiv");
};
// ---------- 6 Mitte-Aufruf: Statue um 1890, PARALLAX-Split (Statue loest sich und kommt naeher), Folgen-Knopf ----------
B.folge = function (c, k) {
  grund(c, "folge", { dunkel: 12 });
  gParallax(c, "folge", [[452, 26], [505, 26], [522, 200], [600, 236], [690, 420], [650, 560], [660, 820], [712, 832], [740, 1410], [362, 1410], [392, 832], [436, 820], [418, 500], [436, 300], [468, 200]], 0.76, [550, 1410], 1.07, true);
  followBtn(c, CX, 1140, 0.06, k.schlauer + 0.30, 1.4);
  credits(c, ["bg-insel-1890"]);
  kamera(c, 102);
  voxSauce(c, "grafik");
};
// ---------- 7 Kupfer reagiert mit Luft und Regen: CALLOUT auf die Statue (um 1910), KUPFER, Luft-Pfeil, Regen-Striche ----------
B.regen = function (c, k) {
  grund(c, "regen");
  spot(c, "regen", "Statue", { ell: [512, 790, 175, 450] }, 1.2, k.kupfer, null, 58, true);
  chip(c, "KUPFER", 800, 700, COPPER, "#FFFFFF", 40, k.kupfer + 0.04);
  gPfeil(c, "regen", "Kupfer", [700, 690], [590, 640], 1.2, k.kupfer + 0.14, LCOPPER);
  gLabel(c, "regen", "Luft", 250, 360, 72, [320, 500], 1.2, k.luft - 0.04, LBLAU);
  var rg = labelF(c, "Regen", 820, 330, 72, k.regen - 0.08, LBLAU, null, true); slam(rg, k.regen - 0.08);
  // Regen: gestrichelte Schraegstriche ueber dem Himmel, Marching Ants (Strich-Offset laeuft), stehen sofort
  var rn = shape(c, "Strich Regen"), gr = grp(rn, "Regen");
  for (var i = 0; i < 8; i++) { var x = 640 + i * 40 + (i % 2) * 14, y = 380 + (i % 3) * 40; addPath(gr, line2([[x, y], [x - 70, y + 260]])); }
  var st = stroke(gr, LBLAU, 4, 22, 18); try { st.property("ADBE Vector Stroke Dashes").property("ADBE Vector Stroke Offset").expression = "time*-160"; } catch (e) {}
  rn.inPoint = k.regen - 0.08; rn.opacity.setValue(80);
  credits(c, ["bg-wolken-1910"]);
  kamera(c, 103);
  voxSauce(c, "grafik");
};
// ---------- 8 Langsam die gruene Schicht: FARBSWEEP Kupfer -> Patina auf dem echten Gewand (Jahre 1886 -> 1906), Patina-Pfeil ----------
B.patina = function (c, k) {
  grund(c, "patina", { dunkel: 11 });
  farbSweep(c, "patina", "Kupfer weicht", COPPER, null, 1.4, 0, { art: "weg-oben", t0: 0.10, t1: 1.70 }, 78, true);
  var n = counter(c, 1886, 1906, 0.10, 1.70, F_NUM, 150, CREAM, [780, 330]); n.name = "Jahre 1886-1906"; schatten(n);
  chip(c, "GRÜN", 760, 1120, VERD, "#FFFFFF", 48, k.gruene);
  gLabel(c, "patina", "Patina", 260, 560, 76, [420, 900], 2.2, k.patina - 0.04, LVERD);
  credits(c, ["bg-gewand-heute"]);
  kamera(c, 103);
  voxSauce(c, "grafik");
};
// ---------- 9 1906 so gruen, dass viele an Rost denken: Callout + Kreis auf der Statue, ZEITUNG 1906 rutscht ein ("Rusted" eingekreist) ----------
var ZW = "archiv/zeitung-1906-wilmington.jpg";
B.rost = function (c, k) {
  grund(c, "rost", { dunkel: 14 });
  var y = odometer(c, "1906", F_NUM, 130, CREAM, [CX, 300], 0.04, f2s(14)); y.name = "Jahr 1906"; schatten(y);
  spot(c, "rost", "Statue", { ell: [488, 1010, 170, 440] }, 2.3, 0.40, k.viele, 56);
  gKreis(c, "rost", "Statue", [488, 860, 140, 300], 2.3, k.statue + 0.08, LVERD, 8).outPoint = k.viele - 0.04;
  chip(c, "SO GRÜN", 790, 860, VERD, "#FFFFFF", 44, k.gruen - 0.04);
  var z = zeitung(c, ZW, CX, 720, 840, -2, k.viele - 0.10, "Evening Journal 1906"); voxTag(z, "zeitung", true);
  // "Rusted" im Kopf der Seite: Bildpunkte x 370..780, y 300..410
  zKreis(c, z, "Rusted", 575, 358, 250, 84, k.rost - 0.08, LRED, 8);
  tippen(c, "verrostet?", 640, 1140, F_SERIF_BI, 64, CREAM, k.rost + 0.10, 40, "Label verrostet");
  sourceBar(c, "Evening Journal 1906", null, k.viele + 0.10, 1480);
  credits(c, ["zeitung-1906-wilmington", "bg-photochrom-1905"]);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 10 Kongress gibt Geld frei: CALLOUT auf die Kuppel (Kapitol 1902), echter Ausschnitt "$62,800" mit Textmarker ----------
var ZK = "archiv/zeitung-1906-kongress.jpg";
B.kongress = function (c, k) {
  grund(c, "kongress");
  spot(c, "kongress", "Kuppel", { ell: [500, 600, 200, 300] }, 1.5, k.kongress, null, 58, true);
  chip(c, "US-KONGRESS", 790, 330, NAVY, "#FFFFFF", 40, k.kongress + 0.06);
  gPfeil(c, "kongress", "Kongress", [700, 370], [600, 470], 1.5, k.kongress + 0.20, CREAM);
  // Ausschnitt 684 x 190 (ALTO-OCR): "Congress," x 339..483 y 80, "$62,800" x 556..650 y 111
  var z = zeitung(c, ZK, CX, 1030, 780, -1.5, k.geld - 0.16, "Kongress 1906");
  zMarker(c, z, "Congress", 336, 486, 80, 30, k.geld + 0.12);
  zMarker(c, z, "62800", 553, 653, 111, 30, k.geld + 0.40);
  tippen(c, "NEU ANSTREICHEN", 120, 1250, F_SANS_B, 52, "#FFFFFF", k.streichen - 0.04, 40, "Tipp NEU ANSTREICHEN");
  credits(c, ["zeitung-1906-kongress", "bg-kapitol-1902"]);
  punchCut(c, 1.10);
  kamera(c, 103);
  voxSauce(c, "grafik");
};
// ---------- 11 Aber die Menschen protestieren: BRAND-Uebergang in die Zeitungsseite 1906, TEXTMARKER direkt auf der Seite, LAUT ... ----------
B.protest = function (c, k) {
  grund(c, "protest", { dunkel: 8 });
  // Zeilen (Seite 5224 px, ALTO-OCR): "overwhelmed with letters." x 3158..3582 y 4405; "statue was to be painted." x 2924..3307 y 4497
  gMarker(c, "protest", "overwhelmed with letters", 3150, 3590, 4405, 30, 0.26, YEL, true);
  gMarker(c, "protest", "statue was to be painted", 2918, 3312, 4497, 30, 0.58);
  sourceBar(c, "Laut Evening Journal", null, 0.08, 350);
  chip(c, "BRIEFE ÜBER BRIEFE", CX, 1180, LRED, "#FFFFFF", 42, k.protest - 0.12);
  gBrand(c, "kongress", 0, 0.36);
  credits(c, ["bg-zeitung-seite"]);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 12 Fachleute pruefen die gruene Schicht: Fokus-Ruck, LUPE auf der echten Statue (Highsmith), GRUENE SCHICHT ----------
B.pruefen = function (c, k) {
  grund(c, "pruefen", { dunkel: 12 });
  focusHunt(c, 0.02, true);
  gLupe(c, "pruefen", k.fachleute + 0.30, true);
  tippen(c, "Fachleute prüfen", 140, 380, F_SERIF_BI, 62, CREAM, k.fachleute, 34, "Tipp Fachleute");
  chip(c, "GRÜNE SCHICHT", 540, 1210, VERD, "#FFFFFF", 42, k.gruene - 0.04);
  credits(c, ["bg-statue-nah"]);
  punchCut(c, 1.10);
  kamera(c, 102);
  voxSauce(c, "grafik");
};
// ---------- 13 Ergebnis: Patina schuetzt das Kupfer darunter: Kreis auf die gruene Haut, die Haut SCHAELT sich ab -> Kupfer darunter ----------
var SCHALE = [90, 1080, 400, 1290];   // Bildschirm zur Zeit 2.0: Stueck Wange/Auge
B.ergebnis = function (c, k) {
  grund(c, "ergebnis", { dunkel: 11 });
  tippen(c, "Ergebnis:", 520, 330, F_SERIF_B, 84, CREAM, k.ergebnis, 30, "Tipp Ergebnis");
  gKreis(c, "ergebnis", "Patina", [275, 1185, 190, 150], 2.0, k.patina, LVERD, 8);
  gLabel(c, "ergebnis", "Patina", 700, 640, 70, [420, 1060], 2.0, k.patina + 0.10, LVERD);
  chip(c, "SCHÜTZT", 700, 860, VERD, "#FFFFFF", 44, k.schuetzt - 0.04);
  // Kupfer darunter: Kupferfarbe liegt unter einem Stueck Haut, das sich abschaelt
  farbSweep(c, "ergebnis", "Kupfer darunter", COPPER, { ell: [(SCHALE[0] + SCHALE[2]) / 2, (SCHALE[1] + SCHALE[3]) / 2, (SCHALE[2] - SCHALE[0]) / 2 - 12, (SCHALE[3] - SCHALE[1]) / 2 - 12], feder: 26 }, 2.0, k.kupfer - 0.30, null, 85);
  gSchaelen(c, "ergebnis", SCHALE, 2.0, k.kupfer - 0.30, 0.50, true);
  gLabel(c, "ergebnis", "Kupfer", 700, 1100, 70, [400, 1200], 2.0, k.kupfer, LCOPPER);
  credits(c, ["bg-gewand-heute"]);
  kamera(c, 103);
  voxSauce(c, "grafik");
};
// ---------- 14 Nichts gestrichen, bleibt bis heute gruen: getipptes STREICHEN, sauberer roter Strich, Callout + Kreis auf die Statue heute ----------
B.bleibt = function (c, k) {
  grund(c, "bleibt", { dunkel: 4 });
  var w = tippen(c, "STREICHEN", 170, 420, F_BLACK, 110, CREAM, 0.06, 28, "Wort STREICHEN");
  var sw = durchstreichen(c, w, "Wort STREICHEN", k.nichts, LRED, 14, k.nichts);
  w.outPoint = k.und + 0.10; sw.outPoint = k.und + 0.10; voxTag(sw, "strich", true);
  spot(c, "bleibt", "Statue", { ell: [305, 930, 160, 320] }, 2.4, k.statue, null, 52);
  gKreis(c, "bleibt", "heute", [305, 900, 150, 270], 2.4, k.bleibt, LVERD, 9, f2s(9), false);
  chip(c, "BIS HEUTE: GRÜN", 700, 640, VERD, "#FFFFFF", 42, k.heute - 0.04);
  gPfeil(c, "bleibt", "heute", [620, 690], [400, 800], 2.4, k.heute - 0.04, LVERD);
  credits(c, ["bg-hafen-heute"]);
  punchCut(c, 1.10);
  kamera(c, 103);
  voxSauce(c, "grafik");
};
// ---------- 15 Welche Farbe findest du schoener? FARB-SPLIT der echten Statue (um 1905): links kupferbraun, rechts gruen ----------
var FRAGE_POLY = [[446, 586], [474, 586], [486, 700], [566, 720], [616, 800], [644, 900], [624, 1100], [684, 1110], [704, 1500], [396, 1500], [416, 1110], [458, 1100], [450, 900], [454, 750]];
B.frage = function (c, k) {
  grund(c, "frage", { dunkel: 12 });
  var q = txt(c, "?", F_SERIF_BI, 170, LRED, [CX, 400]); q.name = "Fragezeichen"; schatten(q); slam(q, k.farbe - 0.04);
  gStrich(c, "frage", "Trennlinie", [[[541, 520], [538, 1000], [542, 1540]]], 1.5, 0.08, CREAM, 6, f2s(10));
  farbSweep(c, "frage", "Statue braun", COPPER, { poly: FRAGE_POLY, feder: 10, halb: { x: 540, seite: "links" } }, 1.5, k.braun - 0.04, null, 80, true);
  chip(c, "BRAUN", 290, 1180, COPPER, "#FFFFFF", 46, k.braun - 0.04);
  farbSweep(c, "frage", "Statue gruen", "#3FA584", { poly: FRAGE_POLY, feder: 10, halb: { x: 540, seite: "rechts" } }, 1.5, k.gruen - 0.04, null, 80);
  var g = chip(c, "GRÜN", 790, 1180, VERD, "#FFFFFF", 46, null); setIn(g, k.gruen - 0.04);   // steht sofort (8-Frames-Regel)
  credits(c, ["bg-wolken-1905"]);
  kamera(c, 102);
  voxSauce(c, "grafik");
};
// ---------- 16 Schluss: Brand-Uebergang ins Luftbild, grosses Logo (360 px im Kreis), "In der Bio" getippt, Folgen-Knopf ----------
B.outro = function (c, k) {
  grund(c, "outro", { dunkel: 20 });
  gBrand(c, "frage", 0, 0.50, true);
  pencil(c, "Kreis Logo", [ellP(CX, 640, 262, 262)], CREAM, 7, 0.10, f2s(14));
  var lg = imp("archiv/logo.png");
  if (lg) { var lo = addItem(c, lg, CX, 640, 360 / lg.width * 100); lo.name = "Logo gross"; popIn(lo, 0.12); }
  tippen(c, "In der Bio", 320, 1010, F_SERIF_BI, 84, CREAM, k.bio - f2s(4), 30, "Text In der Bio");
  pencil(c, "Unterstrich Bio", [line2([[320, 1034], [530, 1040], [740, 1032]])], LRED, 7, k.bio + 0.45, f2s(10));
  followBtn(c, CX, 1160, k.bio + 0.6, k.folgen + f2s(3));
  credits(c, ["bg-insel-luft"]);
  camRig(c, CX, 900, { punchIn: false, s0: 100, s1: 103, punchOut: false });
  voxSauce(c, "grafik");
};
