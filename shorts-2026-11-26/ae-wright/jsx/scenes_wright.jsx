// ===================== Szenen: Short 26.11.2026 "Der erste Flug dauerte zwoelf Sekunden" (wright) =====================
// Stil wie Apollo 13 Runde 2 (enno 25.11.): Tint-Collage-Hintergrund Schwarz/Weiss im Wechsel (schichten), davor echte Fotos MITTIG
// (Szenen-x 470 + ABZ_DX 70 = 540), Bildquelle senkrecht links (credits), Untertitel von uns im Master (main_wright.jsx).
// Je Szene >= 2 verschiedene Vox-Geraete nacheinander, jedes als Kind des Bildes an einem echten Bildpunkt (data/bilder.json, Bildpixel),
// genau 1 Hauptgeraet, nie dasselbe Hauptgeraet zweimal hintereinander. NUR EIN FOKUS zur Zeit (Kreis/Lupe endet, bevor der naechste kommt).
// Chips nur mit NEUER Info (Datum, Zahl, Name), nie das, was gerade gesprochen wird. Querformat-Abzuege 740 breit (rechte Rotzone ab x 930 frei).
// k = Zeiten der Schluesselwoerter ab Szenenanfang.
var B = {};
// spaetester Start, damit eine Animation (dauer) noch >= 9 Frames vor dem Schnitt fertig steht
function bis(c, t, dauer) { return Math.max(0.04, Math.min(t, c.duration - (dauer || 0) - f2s(9))); }
function px(A, fx, fy) { return [fx * A.iw, fy * A.ih]; }
function ende(l, t) { if (l && t > l.inPoint + f2s(MIN_STAND + 10)) l.outPoint = t; return l; }   // ein Fokus zur Zeit: Geraet endet vor dem naechsten

// Muenze (Vox-Form): goldene Scheibe wirbelt hoch und dreht sich (Skalierung x), Kind des Abzugs am Bildpunkt p
function aMuenze(c, A, p, t0, t1, haupt) {
  var k = 1 / A.s, l = shape(c, "Muenze");
  var g = grp(l, "Scheibe"); ellipseG(g, 120 * k, 120 * k, 0, 0); fill(g, "#C9A227"); stroke(g, "#7A5A12", 6 * k);
  var g2 = grp(l, "Rand innen"); ellipseG(g2, 84 * k, 84 * k, 0, 0); stroke(g2, "#F1D77A", 5 * k);
  anAbz(A, l); l.position.setValue(p);
  var T = [], V = [], n = Math.max(3, Math.round((t1 - t0) / 0.12));
  for (var i = 0; i <= n; i++) { T.push(t0 + i * (t1 - t0) / n); V.push([i === n ? 100 : (i % 2 ? 12 : 100), 100]); }
  keys(l.scale, T, V, 30);
  keys(l.position, [t0, (t0 + t1) / 2, t1], [[p[0], p[1] + 40 * k], [p[0], p[1] - 140 * k], [p[0], p[1]]], [[30, 30], [60, 60], [80, 80]]);
  var ds = addFx(l, "ADBE Drop Shadow", "Muenze Schatten"); if (ds) { setP(ds, ["Opacity"], 140); setP(ds, ["Distance"], 8); setP(ds, ["Softness"], 16); }
  l.inPoint = t0;
  return voxTag(l, "muenze", haupt);
}
// Kamera-Blitz auf dem Foto: weisse Flaeche in Bildgroesse (Kind des Abzugs), 2 Frames hoch, 5 Frames runter
function aBlitz(c, A, t0, haupt) {
  var l = solid(c, "Blitz " + A.file, "#FFFFFF", A.iw, A.ih); zKind(A.l, l); l.moveBefore(A.l);
  keys(l.opacity, [t0, t0 + f2s(2), t0 + f2s(7)], [0, 85, 0], 40);
  l.inPoint = t0; l.outPoint = t0 + f2s(8 + MIN_STAND + 1);
  return voxTag(l, "blitz", haupt);
}
// Windstoss: drei Bleistift-Wellen von links ueber das Foto + das Foto wackelt (Rotation der Fahrt-Null)
function aWind(c, A, t0, haupt) {
  var W0 = A.iw, H0 = A.ih, out = [];
  for (var i = 0; i < 3; i++) {
    var y = H0 * (0.20 + 0.09 * i), x0 = W0 * 0.04, x1 = W0 * (0.48 + 0.08 * i);
    var P = []; for (var j = 0; j <= 8; j++) { var x = x0 + (x1 - x0) * j / 8; P.push([x, y + Math.sin(j * 1.4 + i) * 18 / A.s]); }
    var l = pencil(c, "Strich Wind " + (i + 1), [line2(P)], LINIE, 8 / A.s, t0 + i * 0.08, f2s(7));
    anAbz(A, l); l.inPoint = t0 + i * 0.08; boilSkal(l, 1 / A.s); voxTag(l, "wind", haupt && i === 0); out.push(l);
  }
  if (A.n) keys(A.n.rotation, [t0 + 0.10, t0 + 0.22, t0 + 0.36, t0 + 0.52], [0, -3.5, 2, 0], 50);
  return out;
}

// ---------- 1 Hook: der Flyer in der Luft, Kreis um das Flugzeug, Datum, Punch auf "zwoelf" ----------
B.hook = function (c, k) {
  schichten(c, "hook");
  var A = abz(c, "p-flug.jpg", 470, 690, 740, -2, 0.0, "drop", { dy: 120, dur: 0.28 });
  focusHunt(c, 0.02, true);
  ende(aKreis(c, A, "Flyer", A.P("flyer"), 330, 130, bis(c, k.erste - 0.02, f2s(9)), YEL, 9, true), k.zwoelf - 0.30);
  aChip(c, A, "17.12.1903", px(A, 0.50, 0.90), bis(c, k.zwoelf - 0.20, f2s(9)), INK, "#FFFFFF", 46);
  credits(c, ["p-flug.jpg"]);
  var cam = kamera(c, 103); punchAt(cam, k.zwoelf - 0.02, 1.05); voxTag(cam, "punch");
  voxSauce(c, "archiv");
};
// ---------- 2 Kuerzer als die Fluegel eines Jumbojets: Boeing 747 von oben, Textmarker 37 m auf dem Fluegel, Strich ueber die ganze Spannweite ----------
B.jumbo = function (c, k) {
  schichten(c, "jumbo");
  var J = abz(c, "f-jumbo.png", 470, 700, 620, 0, 0.0, "pop", { prot: -4 });
  var a = J.P("m37_l"), b = J.P("m37_r"), ta = bis(c, k.strecke - 0.04, 0.5);
  aMarker(c, J, "37 m", a[0], b[0], a[1] + 4, 46, ta, YEL, true);
  aChip(c, J, "37 m", [(a[0] + b[0]) / 2, a[1] + 150], bis(c, k.kuerzer - 0.04, f2s(9)), INK, "#FFFFFF", 46);
  var l = J.P("tip_l"), r = J.P("tip_r");
  aStrich(c, J, "Spannweite", [[l[0], l[1] + 80], [r[0], r[1] + 80]], bis(c, k.fluegel - 0.04, f2s(8)), LRED, 9, f2s(8));
  aChip(c, J, "64 m", [l[0] + 150, l[1] + 170], bis(c, k.jumbo - 0.04, f2s(9)), "#7A1E16", "#FFFFFF", 46);
  credits(c, ["f-jumbo.png"]);
  kamera(c, 102);
  voxSauce(c, "grafik");
};
// ---------- 3 Dezember 1903, Duenen von North Carolina: das Lager in Kill Devil Hills, Lupe faehrt Flyer -> Schuppen, Ortsname ----------
B.ort = function (c, k) {
  schichten(c, "ort", { ut: 52 });
  var A = abz(c, "p-lager.jpg", 470, 700, 740, 2, 0.0, "slide", { von: "rechts" });
  var t0 = bis(c, k.jahr - 0.10, 1.4), t1 = Math.min(k.duenen + 0.2, t0 + 1.4);
  var fl = A.P("flyer"), lu = aLupe(c, A, [fl[0] + 170, fl[1]], A.P("schuppen"), 240, 1.8, t0, t1, true);
  if (lu) { ende(lu.lupe, k.nc - 0.12); ende(lu.rand, k.nc - 0.12); }
  aChip(c, A, "KILL DEVIL HILLS", A.P("duene"), bis(c, k.nc - 0.10, f2s(9)), INK, "#FFFFFF", 40);
  credits(c, ["p-lager.jpg"]);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 4 Die Brueder Wilbur und Orville Wright: zwei Portraits, Kreis wandert Wilbur -> Orville, Punch auf "Wright" ----------
B.brueder = function (c, k) {
  schichten(c, "brueder", { ut: 52 });
  var Wl = abz(c, "f-wilbur.png", 300, 680, 320, -3, 0.0, "pop", { prot: -6 });
  var Or = abz(c, "f-orville.png", 640, 700, 320, 3, 0.10, "pop", { prot: 6 });
  ende(aKreis(c, Wl, "Wilbur", Wl.P("gesicht"), 170, 210, bis(c, k.wilbur - 0.04, f2s(9)), MARK, 9, true), k.orville - 0.06);
  aKreis(c, Or, "Orville", Or.P("gesicht"), 170, 210, bis(c, k.orville - 0.04, f2s(9)), MARK, 9);
  credits(c, ["f-wilbur.png", "f-orville.png"]);
  var cam = kamera(c, 103); punchAt(cam, Math.max(0.3, k.wright - 0.02), 1.04); voxTag(cam, "punch");
  voxSauce(c, "archiv");
};
// ---------- 5 ... haben ein Flugzeug mit Motor gebaut: der echte Motor in der Werkstatt, dunkler Callout, Pfeil Motor -> Kette ----------
B.gebaut = function (c, k) {
  schichten(c, "gebaut");
  var A = abz(c, "p-werkstatt.jpg", 470, 700, 700, -2, 0.0, "pop", { prot: 4 });
  aCalloutF(c, A, "Motor", A.P("motor"), 260, 200, bis(c, k.motor - 0.06, 0), 58, "#0E0D0C", true);
  var m = A.P("motor"), kt = A.P("kette");
  aPfeil(c, A, "Kette", [m[0] + 140, m[1] - 120], [kt[0] - 10, kt[1] - 50], -0.30, bis(c, k.gebaut - 0.10, f2s(9)), f2s(9), LINIE, 9);
  credits(c, ["p-werkstatt.jpg"]);
  punchCut(c, 1.06);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 6 Wer darf zuerst? Muenzwurf: Fragezeichen, Muenze wirbelt ueber dem Flyer, Wilbur-Portrait + gruener Haken ----------
B.muenze = function (c, k) {
  schichten(c, "muenze");
  var A = abz(c, "p-schiene.jpg", 470, 690, 740, 2, 0.0, "slide");
  ende(aChip(c, A, "?", A.P("himmel"), bis(c, k.zuerst - 0.04, f2s(5)), LRED, "#FFFFFF", 100, "slam", "slam"), k.werfen - 0.05);
  var f = A.P("flyer"), t0 = bis(c, k.werfen - 0.02, 1.0);
  ende(aMuenze(c, A, [f[0], f[1] - 150], t0, Math.min(k.muenze + 0.55, t0 + 1.1), true), k.wilbur - 0.04);
  var Wk = kindBild(c, A, "f-wilbur.png", [700, 600], 190, 4);
  if (Wk) { popIn(Wk.l, bis(c, k.wilbur - 0.06, f2s(9)), 6); aHaken(c, Wk, "gewinnt", Wk.P("gesicht"), 1.3, bis(c, k.gewinnt - 0.02, f2s(6)), GRUEN); }
  credits(c, ["p-schiene.jpg", "f-wilbur.png"]);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 7 Doch er zieht zu steil hoch und landet sofort im Sand: Bogen-Pfeil steil hoch und in den Sand, Datum, Kreis um Wilbur ----------
B.absturz = function (c, k) {
  schichten(c, "absturz", { ut: 52 });
  var A = abz(c, "p-sand.jpg", 470, 690, 700, -2, 0.0, "slide", { von: "links" });
  var s = A.P("sand");
  aPfeil(c, A, "steil hoch", [A.iw * 0.10, A.ih * 0.58], [s[0] - 30, s[1] - 20], -0.85, bis(c, k.steil - 0.10, f2s(14)), f2s(14), LINIE, 10, true);
  aChip(c, A, "14.12.1903", px(A, 0.80, 0.88), bis(c, k.landet - 0.04, f2s(9)), INK, "#FFFFFF", 44);
  aKreis(c, A, "Wilbur", A.P("wilbur"), 120, 90, bis(c, k.sand - 0.04, f2s(9)), MARK, 9);
  credits(c, ["p-sand.jpg"]);
  var cam = kamera(c, 103); punchAt(cam, k.landet - 0.02, 1.04);
  voxSauce(c, "archiv");
};
// ---------- 8 Folge, um schlauer zu werden: Flyer von vorn treibt (Parallax), Folgen-Knopf -> Gefolgt (mittig) ----------
B.folge = function (c, k) {
  schichten(c, "folge", { ut: 52 });
  var A = abz(c, "p-front.jpg", 470, 640, 740, -3, null, null, { fahrt: 110 }); voxTag(A.l, "parallax", true);
  followBtn(c, 540, 1090, 0.10, Math.min(k.schlauer + 0.30, c.duration - 0.7), 1.3);
  credits(c, ["p-front.jpg"]);
  kamera(c, 102);
  voxSauce(c, "grafik");
};
// ---------- 9 Drei Tage spaeter ist Orville dran. Ein Helfer macht ein Foto. Es wird weltberuehmt: das echte Foto, Kreis um Orville, Name des Helfers, Blitz, Abzuege stapeln sich ----------
B.foto = function (c, k) {
  schichten(c, "foto");
  var A = abz(c, "p-erstflug.jpg", 470, 680, 740, 2, 0.0, "pop", { prot: -4 });
  ende(aKreis(c, A, "Orville", A.P("orville"), 150, 90, bis(c, k.orville - 0.04, f2s(9)), YEL, 9), k.helfer - 0.06);
  aChip(c, A, "J. T. DANIELS", px(A, 0.24, 0.88), bis(c, k.helfer + 0.10, f2s(9)), INK, "#FFFFFF", 40);
  aBlitz(c, A, bis(c, k.foto - 0.02, f2s(8)), true);
  var t = bis(c, k.welt - 0.06, 0.6);
  aStapel(c, A, 3, [t, t + 0.18, t + 0.36], 22, -38);
  credits(c, ["p-erstflug.jpg"]);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 10 Danach fliegen sie noch dreimal: dritter Flug, Kreis um den Flyer, drei Punkte ploppen ----------
B.dreimal = function (c, k) {
  schichten(c, "dreimal");
  var A = abz(c, "p-dritter.jpg", 470, 690, 740, -2, 0.0, "drop", { dy: 110, dur: 0.28 });
  ende(aKreis(c, A, "Flyer", A.P("flyer"), 300, 140, bis(c, k.fliegen - 0.04, f2s(9)), YEL, 9), k.dreimal - 0.10);
  var t = bis(c, k.dreimal - 0.06, 0.24 + 0.4);
  aPunkte(c, A, "Flug", null, [px(A, 0.72, 0.80), px(A, 0.80, 0.80), px(A, 0.88, 0.80)], [t, t + 0.12, t + 0.24], 26, null, null, true);
  credits(c, ["p-dritter.jpg"]);
  punchCut(c, 1.06);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 11 Der letzte Flug dauert fast eine Minute: Blick vom Start, gestrichelte Bahn Schiene -> Flugzeug, Zaehler 59 s, 260 m ----------
B.letzter = function (c, k) {
  schichten(c, "letzter", { ut: 52 });
  var A = abz(c, "p-weit.jpg", 470, 690, 740, 2, 0.0, "slide", { von: "rechts" });
  var s = A.P("schiene"), z = A.P("flugzeug");
  aBahn(c, A, "letzter Flug", [s[0], s[1] - 30], [z[0] + 30, z[1] - 20], 0.22, bis(c, k.letzte - 0.04, 1.0), bis(c, k.letzte + 1.0, 0), LINIE, 8, true);
  var t0 = bis(c, k.minute - 0.40, 1.0);
  aZaehler(c, A, 0, 59, " s", px(A, 0.50, 0.80), 76, t0, t0 + 0.9, CREAM, "#151515");
  aChip(c, A, "260 m", px(A, 0.30, 0.22), bis(c, k.minute + 0.20, f2s(9)), INK, "#FFFFFF", 44);
  credits(c, ["p-weit.jpg"]);
  kamera(c, 102);
  voxSauce(c, "archiv");
};
// ---------- 12 Dann wirft ein Windstoss das Flugzeug um. Es fliegt nie wieder: Wind-Striche, Foto wackelt, rotes Kreuz ----------
B.wind = function (c, k) {
  schichten(c, "wind", { ut: 52 });
  var A = abz(c, "p-schaden.jpg", 470, 690, 740, -2, 0.0, "pop", { prot: 4 });
  aWind(c, A, bis(c, k.windstoss - 0.10, 0.6), true);
  var f = A.P("flyer");
  aKreuz(c, A, "nie wieder", [f[0] - 240, f[1] - 150, f[0] + 240, f[1] + 150], bis(c, k.nie - 0.04, f2s(9)), LRED);
  credits(c, ["p-schaden.jpg"]);
  var cam = kamera(c, 103); punchAt(cam, k.um - 0.02, 1.04);
  voxSauce(c, "archiv");
};
// ---------- 13 Ein Stueck Stoff fliegt 1969 mit zum Mond: Aldrin auf dem Mond, der echte Stoff ploppt, Pfeil zur Mondfaehre Eagle, Chip APOLLO 11 ----------
B.mond = function (c, k) {
  schichten(c, "mond");
  var A = abz(c, "p-mond.jpg", 470, 690, 560, 2, 0.0, "pop", { prot: -4 });
  var S = kindBild(c, A, "p-stoff.jpg", [270, 470], 170, -6);
  if (S) popIn(S.l, bis(c, k.stoff - 0.06, f2s(9)), -8);
  var e = A.P("eagle");
  aPfeil(c, A, "zur Faehre", aQ(A, [320, 570]), [e[0] - 70, e[1] - 60], 0.35, bis(c, k.fluegel + 0.10, f2s(12)), f2s(12), LINIE, 9, true);
  aChip(c, A, "APOLLO 11", px(A, 0.68, 0.07), bis(c, k.jahr + 0.30, f2s(9)), "#2E4C6D", "#FFFFFF", 44);
  credits(c, ["p-mond.jpg", "p-stoff.jpg"]);
  var cam = kamera(c, 103); punchAt(cam, k.mond - 0.02, 1.04);
  voxSauce(c, "archiv");
};
// ---------- 14 Und 2021 sogar zum Mars: Ingenuity, Lupe auf das Kabel unter dem Solarpanel (dort klebt der Stoff), Groesse 1,3 cm ----------
B.mars = function (c, k) {
  schichten(c, "mars");
  var A = abz(c, "p-mars.jpg", 470, 670, 680, -2, 0.0, "slide", { von: "rechts" });
  var t0 = bis(c, k.jahr - 0.05, 1.2), t1 = Math.min(k.mars + 0.2, t0 + 1.2);
  aLupe(c, A, A.P("koerper"), A.P("kabel"), 230, 2.0, t0, t1, true);
  aChip(c, A, "INGENUITY", px(A, 0.30, 0.90), 0.12, "#7A3A1E", "#FFFFFF", 42);
  aChip(c, A, "1,3 CM", [A.P("kabel")[0] + 520, A.P("kabel")[1] + 80], bis(c, k.mars + 0.10, f2s(9)), INK, "#FFFFFF", 42);
  credits(c, ["p-mars.jpg"]);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 15 Schluss: Logo gross im Bleistiftkreis (930, Abstand), Folgen-Knopf mittig, "In der Bio" mit Schatten ----------
B.outro = function (c, k) {
  schichten(c, "outro", { ut: 52 });
  var L = abz(c, "logo.png", 470, 600, 380, 0, 0.08, "pop", { fahrt: 103 }); voxTag(L.l, "logo", true);
  aKreis(c, L, "Logo", L.P("mitte"), 930, 930, 0.30, HELL ? INK : CREAM, 7);
  followBtn(c, 540, 1000, k.allgemein - 0.06, k.allgemein + 0.80, 1.2);
  var bio = txt(c, "In der Bio", F_SERIF_BI, 84, HELL ? INK : CREAM, [540, 1200]); bio.name = "Text In der Bio"; if (!HELL) schatten(bio); popIn(bio, k.bio - 0.06);
  credits(c, ["logo.png"]);
  camRig(c, 540, 900, { punchIn: false, s0: 100, s1: 102, punchOut: false });
  voxSauce(c, "grafik");
};
