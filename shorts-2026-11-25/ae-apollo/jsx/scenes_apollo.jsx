// ===================== Szenen: Short 25.11.2026 "Apollo 13: Gerettet mit Klebeband" (apollo) =====================
// Stil wie die Shorts zur Folge 42: lebendiger Vox nach Chris Moran, jede Szene mit GESCHICHTETEM, BEWEGTEM, FARBIGEM Hintergrund
// (schichten, eine Farbfamilie je Szene, 3 getoente NASA-Bilder), davor ein echter NASA-Abzug / Freisteller in echten Farben.
// Je Szene >= 2 verschiedene Vox-Geraete nacheinander, jedes als Kind des Bildes an einem echten Bildpunkt (Bildpixel), genau 1 Hauptgeraet,
// nie dasselbe Hauptgeraet zweimal hintereinander. Nichts Gezeichnetes (keine Raketen/Menschen): nur Fotos, Freisteller, Linien, Pfeile,
// Kreise, Zahlen, Formen. KEINE Untertitel (CapCut) -> Band y 1290-1460 bleibt frei. k = Zeiten der Schluesselwoerter ab Szenenanfang.
var B = {};
// spaetester Start, damit eine Animation (dauer) noch >= 9 Frames vor dem Schnitt fertig steht
function bis(c, t, dauer) { return Math.max(0.04, Math.min(t, c.duration - (dauer || 0) - f2s(9))); }
// Farb-Sweep auf dem Abzug (Mischmodus Farbe), wischt von unten nach oben ueber die Flaeche poly (Bildpixel)
function aFarbe(c, A, name, color, poly, t0, t1, op, haupt) {
  var l = solid(c, "Farbe " + name, color, A.iw, A.ih); zKind(A.l, l); l.moveBefore(A.l);
  l.blendingMode = BlendingMode.COLOR; l.opacity.setValue(op || 70);
  var m = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  m.property("ADBE Mask Shape").setValue(mkShape(line2(poly, true))); m.property("ADBE Mask Feather").setValue([30 / A.s, 30 / A.s]);
  var mw = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  try { mw.maskMode = MaskMode.INTERSECT; } catch (e) {}
  mw.property("ADBE Mask Feather").setValue([0, 120 / A.s]);
  var W0 = A.iw, H0 = A.ih;
  keys(mw.property("ADBE Mask Shape"), [t0, t1], [mkShape(line2([[-50, H0 + 60], [W0 + 50, H0 + 60], [W0 + 50, H0 + 80], [-50, H0 + 80]], true)), mkShape(line2([[-50, -80], [W0 + 50, -80], [W0 + 50, H0 + 80], [-50, H0 + 80]], true))], [[20, 20], [70, 70]]);
  l.inPoint = t0;
  return voxTag(l, "farbsweep", haupt);
}
function px(A, fx, fy) { return [fx * A.iw, fy * A.ih]; }

// ---------- 1 Hook: Saturn V startet, Kreis um die Rakete, Pfeil zum Mond, Punch auf "Mond" ----------
B.hook = function (c, k) {
  schichten(c, "hook");
  var A = abz(c, "p-start.jpg", 430, 770, 600, -2, 0.0, "drop", { dy: 120, dur: 0.28 });
  var M = kindBild(c, A, "f-mond.png", [810, 450], 250, 0); popIn(M.l, 0.30, 8);
  focusHunt(c, 0.02, true);
  aKreis(c, A, "Rakete", A.P("rakete"), 125, 440, bis(c, k.astro - 0.02, f2s(9)), YEL, 9, true);
  aPfeil(c, A, "zum Mond", [A.P("nase")[0] + 40, A.P("nase")[1] - 60], aQ(A, [700, 520]), -0.22, bis(c, k.weg - 0.08, f2s(9)), f2s(9), CREAM, 9);
  credits(c, ["p-start.jpg", "f-mond.png"]);
  var cam = kamera(c, 103); punchAt(cam, k.mond - 0.02, 1.04); voxTag(cam, "punch");
  voxSauce(c, "archiv");
};
// ---------- 2 "... rettet sie ausgerechnet Klebeband": Crew-Portrait, Fokus wandert ueber die drei, echtes Klebeband knallt rein ----------
B.klebeband = function (c, k) {
  schichten(c, "klebeband");
  var A = abz(c, "p-crew.jpg", 466, 640, 720, 2, 0.0, "slide", { von: "rechts" });
  aFokus(c, A, [A.P("lovell"), A.P("swigert"), A.P("haise")], [0.30, 0.95, 1.60], 120, 150, Math.min(2.25, k.band - 0.1));
  var tb = bis(c, k.band - 0.06, f2s(6));
  var T = D.ki && D.ki["ki-band"] ? abz(c, "p-ki-band.jpg", 700, 1085, 250, 8, tb, "slam", { fahrt: false }) : abz(c, "p-band.jpg", 700, 1085, 230, 8, tb, "slam", { fahrt: false });
  if (!(D.ki && D.ki["ki-band"])) kiPlatz(c, "ki-band", 700, 1085, 250, 250, 8, tb);
  voxTag(T.l, "slam", true);
  credits(c, ["p-crew.jpg", T.file]);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 3 April 1970: Missions-Abzeichen ploppt, Odometer APRIL 1970, Lupe auf "XIII" ----------
B.april = function (c, k) {
  schichten(c, "april", { ut: 52 });
  var P = abz(c, "f-patch.png", 470, 660, 540, 0, 0.0, "pop", { prot: 8 });
  aOdo(c, P, "APRIL 1970", aQ(P, [470, 1095]), 96, k.april + 0.02, 0.42, CREAM, "#151515", true);
  var x = P.P("xiii"), t0 = bis(c, k.jahr + 0.05, 0.5);
  aLupe(c, P, [x[0] - 60, x[1] + 30], [x[0] + 10, x[1]], 190, 1.9, t0, t0 + 0.5);
  credits(c, ["f-patch.png"]);
  kamera(c, 103);
  voxSauce(c, "grafik");
};
// ---------- 4 330.000 km von der Erde: Erde + Mond (Freisteller), gestrichelte Bahn mit Spitze, Zaehler 330.000 km ----------
B.weg = function (c, k) {
  schichten(c, "weg");
  var E = abz(c, "f-erde.png", 300, 1000, 340, 0, 0.0, "pop", { prot: -6 });
  var M = kindBild(c, E, "f-mond.png", [770, 440], 230, 0); popIn(M.l, 0.20, 6);
  var r = D.bilder["f-erde.png"].r, m = E.P("mitte");
  aBahn(c, E, "Erde Mond", [m[0] + r * 0.62, m[1] - r * 0.80], aQ(E, [700, 540]), -0.18, bis(c, k.apollo + 0.15, 1.2), bis(c, k.km + 0.70, 0), CREAM, 8, true);
  var t0 = bis(c, k.km - 0.04, 1.0);
  aZaehler(c, E, 0, 330000, " km", aQ(E, [650, 905]), 76, t0, t0 + 0.95, CREAM, "#151515");
  credits(c, ["f-erde.png", "f-mond.png"]);
  var cam = kamera(c, 103); punchAt(cam, k.erde - 0.02, 1.04);
  voxSauce(c, "grafik");
};
// ---------- 5 Da explodiert ein Sauerstofftank: beschaedigtes Servicemodul, Ring + Focus Hunt, heller Callout auf die aufgerissene Seite ----------
B.explosion = function (c, k) {
  schichten(c, "explosion");
  var A = abz(c, "p-sm.jpg", 466, 700, 720, -2, 0.0, "pop", { prot: 4 });
  focusHunt(c, k.explodiert - 0.04, false);
  aRing(c, A, A.P("schaden"), k.explodiert, CREAM, 520, 0.45);
  aCalloutF(c, A, "Schaden", A.P("schaden"), 160, 120, bis(c, k.tank - 0.04, 0), 58, "#0E0D0C", true);
  aChip(c, A, "SAUERSTOFF", px(A, 0.80, 0.12), bis(c, k.tank + 0.04, f2s(9)), INK, "#FFFFFF", 40);
  credits(c, ["p-sm.jpg"]);
  var cam = kamera(c, 103); punchAt(cam, k.explodiert - 0.02, 1.05); voxTag(cam, "punch");
  voxSauce(c, "archiv");
};
// ---------- 6 Houston, wir haben ein Problem: Mission Control, Kreis um den Bildschirm, Funk-Ringe, Etikett HOUSTON ----------
B.houston = function (c, k) {
  schichten(c, "houston");
  var A = abz(c, "p-mcc.jpg", 468, 690, 700, 2, 0.0, "slide");
  var s = A.P("schirm");
  aKreis(c, A, "Schirm", s, 105, 82, bis(c, k.crew - 0.02, f2s(9)), YEL, 8);
  var t0 = bis(c, k.houston - 0.02, 0.9);
  for (var i = 0; i < 3; i++) { var rg = aRing(c, A, s, t0 + i * 0.18, CREAM, 380, 0.5); if (i === 0) voxTag(rg, "ringe", true); }
  aChip(c, A, "HOUSTON", px(A, 0.24, 0.84), bis(c, k.houston + 0.10, f2s(9)), "#2E4C6D", "#FFFFFF", 44);
  credits(c, ["p-mcc.jpg"]);
  var cam = kamera(c, 103); punchAt(cam, k.problem - 0.02, 1.04);
  voxSauce(c, "archiv");
};
// ---------- 7 Folge, um schlauer zu werden: Erde und Mond treiben (Parallax), Folgen-Knopf -> Gefolgt ----------
B.folge = function (c, k) {
  schichten(c, "folge");
  var E = abz(c, "f-erde.png", 400, 650, 430, -4, null, null, { fahrt: 112 }); voxTag(E.l, "parallax", true);
  var M = abz(c, "f-mond.png", 790, 420, 220, 6, null, null, { fahrt: 120 });
  followBtn(c, 470, 1125, 0.10, Math.min(k.schlauer + 0.30, c.duration - 0.7), 1.3);
  credits(c, ["f-erde.png", "f-mond.png"]);
  kamera(c, 102);
  voxSauce(c, "grafik");
};
// ---------- 8 Die drei retten sich in die Mondfaehre: drei Punkte fliegen in die Luke, Kreis um die Luke, Etikett AQUARIUS ----------
B.faehre = function (c, k) {
  schichten(c, "faehre");
  var A = abz(c, "p-lm.jpg", 470, 670, 700, -2, 0.0, "drop", { dy: 110, dur: 0.28 });
  var l = A.P("luke"), d = 34 / A.s;
  var t = bis(c, k.drei - 0.05, 0.9);
  aPunkte(c, A, "Crew", [[l[0] - 300, l[1] - 330], [l[0] - 160, l[1] - 380], [l[0] - 360, l[1] - 170]], [[l[0] - d, l[1]], [l[0], l[1] - d * 0.4], [l[0] + d, l[1]]],
    [t, t + 0.16, t + 0.32], 24, null, 45, true);
  aKreis(c, A, "Luke", l, 120, 120, bis(c, k.retten + 0.55, f2s(9)), YEL, 8);
  aChip(c, A, "AQUARIUS", px(A, 0.73, 0.86), bis(c, k.faehre - 0.10, f2s(9)), "#1E5650", "#FFFFFF", 44);
  credits(c, ["p-lm.jpg"]);
  punchCut(c, 1.07);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 9 Nur fuer zwei Menschen und zwei Tage: Haise im Mondfaehren-Simulator, drei Punkte (der dritte wird rot), zwei Odometer ----------
B.zwei = function (c, k) {
  schichten(c, "zwei");
  var A = abz(c, "p-sim.jpg", 470, 625, 680, 2, 0.0, "slide", { von: "links" });
  var P = aPunkte(c, A, "Platz", null, [px(A, 0.70, 0.12), px(A, 0.79, 0.12), px(A, 0.88, 0.12)], [0.30, 0.42, 0.54], 26, null, null, false);
  punktRot(P[2], bis(c, k.zwei + 0.10, f2s(3)));
  aOdo(c, A, "2 MENSCHEN", aQ(A, [470, 1040]), 72, bis(c, k.zwei - 0.05, 0.45), 0.45, CREAM, "#151515", true);
  aOdo(c, A, "2 TAGE", aQ(A, [470, 1152]), 72, bis(c, k.zwei2 - 0.05, 0.45), 0.45, CREAM, "#7A1E16");
  credits(c, ["p-sim.jpg"]);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 10 Bald wird die Luft schlecht: Lovell in der Faehre, CO2-Balken steigt, Kabine faerbt sich rot ----------
B.luft = function (c, k) {
  schichten(c, "luft");
  var A = abz(c, "p-lovell.jpg", 470, 660, 720, -2, 0.0, "pop", { prot: 4 });
  var x = A.iw * 0.90, yb = A.ih * 0.90;
  aBalken(c, A, "CO2", x, yb, 300, 46, 0.22, bis(c, 0.95, 0), false);
  aChip(c, A, "CO2", [x, yb - 300 / A.s - 70 / A.s], 0.14, "#151515", "#FFFFFF", 40);
  var t0 = bis(c, k.luft - 0.12, 0.45);
  aFarbe(c, A, "Luft rot", "#E03A2E", [[0, A.ih * 0.34], [A.iw, A.ih * 0.30], [A.iw, A.ih], [0, A.ih]], t0, t0 + 0.45, 62, true);
  credits(c, ["p-lovell.jpg"]);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 11 Neue Luftfilter haben sie genug: echter eckiger Filter, Kopien stapeln sich (Ticks), gruener Haken ----------
B.filter = function (c, k) {
  schichten(c, "filter");
  var A = abz(c, "p-filter.jpg", 390, 700, 400, -3, 0.0, "pop", { prot: 5 });
  var t = bis(c, k.filter + 0.05, 0.9);
  aStapel(c, A, 3, [t, t + 0.22, t + 0.44], 70, -50, true);
  aHaken(c, A, "genug", aQ(A, [745, 1010]), 1.3, bis(c, k.genug - 0.04, f2s(6)), GRUEN);
  credits(c, ["p-filter.jpg"]);
  punchCut(c, 1.06);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 12 Eckig, und das Loch ist rund: Filter links (Bleistift-Quadrat), rundes Loch rechts (Bleistift-Kreis), Pfeil, rotes Kreuz ----------
B.eckig = function (c, k) {
  schichten(c, "eckig", { ut: 52 });
  var F = abz(c, "p-filter.jpg", 285, 700, 340, -3, 0.0, "slide", { von: "links" });
  var H, hp, hr;
  if (D.ki && D.ki["ki-loch"]) { H = abz(c, "p-ki-loch.jpg", 720, 700, 330, 2, 0.15, "pop"); hp = H.P("loch"); hr = 120 / H.s; }
  else {   // Platzhalter: saubere Vox-Form (dunkle runde Oeffnung), angeheftet am Filter-Abzug; KI-Bild in data/ki_wunsch.json
    kiPlatz(c, "ki-loch", 720, 700, 330, 330, 2, 0.15);
    H = F; hp = aQ(F, [720, 700]); hr = 120 / F.s;
    var lo = shape(c, "Form Loch"), gl = grp(lo, "Loch"); ellipseG(gl, 2 * hr, 2 * hr, 0, 0); fill(gl, "#2A2622"); stroke(gl, "#B9B2A4", 14 / F.s);
    var gi = grp(lo, "Rand innen"); ellipseG(gi, 1.6 * hr, 1.6 * hr, 0, 0); stroke(gi, "#4A443C", 6 / F.s);
    anAbz(F, lo); lo.position.setValue(hp); popIn(lo, 0.15);
  }
  aRechteck(c, F, "eckig", [-6, -6, F.iw + 6, F.ih + 6], bis(c, k.eckig - 0.04, f2s(9)), YEL);
  var kr = aKreis(c, H, "rund", hp, hr * 1.18, hr * 1.18, bis(c, k.loch - 0.02, f2s(9)), YEL, 9); voxTag(kr, "formen");
  var a = aQ(F, [470, 840]), b = H === F ? aQ(F, [600, 840]) : aQ(H, [600, 840]);
  var pf = aPfeil(c, F, "passt", a, aQ(F, [598, 812]), -0.35, bis(c, k.loch + 0.45, f2s(9)), f2s(9), CREAM, 9);
  aKreuz(c, F, "passt nicht", [aQ(F, [455, 700])[0], aQ(F, [455, 700])[1], aQ(F, [625, 870])[0], aQ(F, [625, 870])[1]], bis(c, k.rund - 0.04, f2s(7)), LRED, true);
  credits(c, ["p-filter.jpg"].concat(H !== F ? [H.file] : []));
  kamera(c, 103);
  voxSauce(c, "grafik");
};
// ---------- 13 Ingenieure auf der Erde basteln einen Adapter: Mission Control mit dem Prototyp, Lupe faehrt Kiste -> Schlauch, Kreis ----------
B.adapter = function (c, k) {
  schichten(c, "adapter");
  var A = abz(c, "p-proto.jpg", 470, 680, 680, 2, 0.0, "slide", { von: "rechts" });
  var t0 = bis(c, k.ingenieure - 0.10, 1.9);
  aLupe(c, A, A.P("kiste"), A.P("schlauch"), 150, 1.25, t0, Math.min(k.erde + 0.30, t0 + 1.9), true);
  aKreis(c, A, "Kiste", A.P("kiste"), 95, 80, bis(c, k.adapter - 0.04, f2s(9)), YEL, 8);
  credits(c, ["p-proto.jpg"]);
  kamera(c, 102);
  voxSauce(c, "archiv");
};
// ---------- 14 Aus Schlaeuchen, Handbuch-Deckeln und Klebeband: der echte Adapter in der Faehre, Fokus wandert, Kreise nacheinander ----------
B.bauplan = function (c, k) {
  schichten(c, "bauplan");
  var A = abz(c, "p-mailbox.jpg", 450, 690, 590, -2, 0.0, "pop", { prot: -4 });
  aFokus(c, A, [A.P("kasten"), A.P("schlauch"), A.P("band")], [0.12, 0.45, 1.70], 150, 170, bis(c, 2.0, 0));
  aKreis(c, A, "Schlauch", A.P("schlauch"), 85, 130, bis(c, k.schlaeuche - 0.02, f2s(9)), YEL, 9);
  kiPlatz(c, "ki-handbuch", 790, 900, 190, 250, 6, bis(c, k.deckel - 0.04, 0.4), "pop");   // Handbuch-Deckel ist im Foto nicht sichtbar: nicht einkreisen
  aKreis(c, A, "Klebeband", A.P("band"), 95, 70, bis(c, k.band - 0.04, f2s(9)), YEL, 9, true);
  credits(c, ["p-mailbox.jpg"].concat(D.ki && D.ki["ki-handbuch"] ? ["p-ki-handbuch.jpg"] : []));
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 15 Per Funk erklaeren sie jeden Schritt: CAPCOM am Mikrofon, Funk-Ringe, drei Haken auf den Checklisten ----------
B.funk = function (c, k) {
  schichten(c, "funk");
  var A = abz(c, "p-capcom.jpg", 466, 680, 720, 2, 0.0, "slide");
  var m = A.P("mikro"), t0 = bis(c, k.funk - 0.02, 0.9);
  for (var i = 0; i < 3; i++) { var rg = aRing(c, A, m, t0 + i * 0.18, CREAM, 300, 0.5); if (i === 0) voxTag(rg, "ringe", true); }
  var p = A.P("papiere"), ts = bis(c, k.schritt - 0.5, 0.5 + f2s(6));
  aHaken(c, A, "Schritt 1", [p[0] - 70, p[1] - 70], 0.6, ts, GRUEN);
  aHaken(c, A, "Schritt 2", [p[0], p[1] - 10], 0.6, ts + 0.25, GRUEN);
  aHaken(c, A, "Schritt 3", [p[0] + 70, p[1] + 50], 0.6, ts + 0.5, GRUEN);
  credits(c, ["p-capcom.jpg"]);
  punchCut(c, 1.06);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 16 Es funktioniert, alle drei landen im Pazifik: Wasserung, gruener Haken, Kreis um die drei Schirme, Etikett PAZIFIK ----------
B.landung = function (c, k) {
  schichten(c, "landung");
  var A = abz(c, "p-splash.jpg", 460, 670, 620, -2, 0.0, "pop", { prot: 4 });
  aHaken(c, A, "funktioniert", px(A, 0.80, 0.60), 1.6, bis(c, k.funktioniert + 0.04, f2s(6)), GRUEN, true);
  aKreis(c, A, "Schirme", A.P("schirme"), 300, 120, bis(c, k.alle - 0.02, f2s(9)), YEL, 9);
  aChip(c, A, "PAZIFIK", px(A, 0.30, 0.88), bis(c, k.pazifik - 0.06, f2s(9)), "#1D4170", "#FFFFFF", 44);
  credits(c, ["p-splash.jpg"]);
  var cam = kamera(c, 103); punchAt(cam, k.landen - 0.02, 1.04);
  voxSauce(c, "archiv");
};
// ---------- 17 Haettest du so ruhig gebastelt? Crew auf der USS Iwo Jima, Fokus ueber die Gesichter, rotes Fragezeichen knallt ----------
B.frage = function (c, k) {
  schichten(c, "frage");
  var A = abz(c, "p-iwo.jpg", 466, 680, 720, 2, 0.0, "pop", { prot: -4 });
  aFokus(c, A, [A.P("haise"), A.P("lovell"), A.P("swigert")], [0.10, 0.65, 1.20], 110, 140, bis(c, 1.95, 0));
  aChip(c, A, "?", px(A, 0.88, 0.30), bis(c, k.gebastelt - 0.04, f2s(5)), LRED, "#FFFFFF", 110, "slam", "slam", true);
  credits(c, ["p-iwo.jpg"]);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 18 Schluss: Logo gross im Bleistiftkreis, Folgen-Knopf, "In der Bio" ----------
B.outro = function (c, k) {
  schichten(c, "outro", { ut: 52 });
  var L = abz(c, "logo.png", 470, 600, 380, 0, 0.08, "pop", { fahrt: 103 }); voxTag(L.l, "logo", true);
  aKreis(c, L, "Logo", L.P("mitte"), 760, 760, 0.30, INK, 7);
  followBtn(c, 470, 1000, k.allgemein - 0.06, k.allgemein + 0.80, 1.2);
  var bio = txt(c, "In der Bio", F_SERIF_BI, 84, INK, [470, 1200]); bio.name = "Text In der Bio"; popIn(bio, k.bio - 0.06);
  credits(c, ["logo.png"]);
  camRig(c, 470, 900, { punchIn: false, s0: 100, s1: 102, punchOut: false });
  voxSauce(c, "grafik");
};
