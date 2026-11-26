// ===================== Szenen: Short 27.11.2026 "Nobelpreis fuer ein unordentliches Labor" (penicillin) =====================
// Stil wie Apollo 13 Runde 2 (enno 25.11.): Tint-Collage-Hintergrund Schwarz/Weiss im Wechsel (schichten), davor echte Fotos MITTIG
// (Szenen-x 470 + ABZ_DX 70 = 540), Bildquelle senkrecht links (credits), Untertitel von uns im Master (main_penicillin.jsx).
// Je Szene >= 2 verschiedene Vox-Geraete nacheinander, jedes als Kind des Bildes an einem echten Bildpunkt (data/bilder.json, Bildpixel),
// genau 1 Hauptgeraet, nie dasselbe Hauptgeraet zweimal hintereinander. NUR EIN FOKUS zur Zeit (Kreis/Lupe endet, bevor der naechste kommt).
// Chips nur mit NEUER Info (Datum, Zahl, Name), nie das, was gerade gesprochen wird. Querformat-Abzuege 740 breit (rechte Rotzone ab x 930 frei).
// k = Zeiten der Schluesselwoerter ab Szenenanfang.
var B = {};
// spaetester Start, damit eine Animation (dauer) noch >= 9 Frames vor dem Schnitt fertig steht
function bis(c, t, dauer) { return Math.max(0.04, Math.min(t, c.duration - (dauer || 0) - f2s(9))); }
function px(A, fx, fy) { return [fx * A.iw, fy * A.ih]; }
function ende(l, t) { if (l && t > l.inPoint + f2s(MIN_STAND + 10)) l.outPoint = t; else if (l && typeof global !== "undefined") (global.ENDE_KNAPP = global.ENDE_KNAPP || []).push(CURSCENE + ": " + l.name + " @" + l.inPoint.toFixed(2) + " s");   // nur im Mock: Geraet endet NICHT (zwei Fokusse) -> aemock meldet FOKUS
  return l; }   // ein Fokus zur Zeit: Geraet endet vor dem naechsten

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

// ---------- 1 Hook: Fleming mit der Petrischale, Kreis um die Schale, Name, Medaille ploppt auf "Nobelpreis" ----------
B.hook = function (c, k) {
  schichten(c, "hook");
  var A = abz(c, "p-fleming.jpg", 470, 680, 560, -2, 0.0, "drop", { dy: 120, dur: 0.28 });
  focusHunt(c, 0.02, true);
  aChip(c, A, "ALEXANDER FLEMING", px(A, 0.50, 0.06), bis(c, k.forscher + 0.10, f2s(9)), INK, "#FFFFFF", 40);
  ende(aKreis(c, A, "Schale", A.P("schale"), 190, 150, bis(c, k.labor - 0.04, f2s(9)), YEL, 9, true), k.nobel - 0.10);
  var M = kindBild(c, A, "f-medaille.png", [680, 640], 170, 8);
  if (M) popIn(M.l, bis(c, k.nobel - 0.06, f2s(9)), 10);
  credits(c, ["p-fleming.jpg"]);
  var cam = kamera(c, 103); punchAt(cam, k.nobel - 0.02, 1.05); voxTag(cam, "punch");
  voxSauce(c, "archiv");
};
// ---------- 2 London, September 1928: St Mary's Hospital, Nadel auf das Haus, genaues Datum (Punch) ----------
B.london = function (c, k) {
  schichten(c, "london");
  var A = abz(c, "p-hospital.jpg", 470, 700, 690, 2, 0.0, "slide", { von: "rechts" });
  aNadel(c, A, "St Marys", A.P("haus"), 0.12, LRED);
  // Chip "ST MARY'S HOSPITAL" gestrichen (enno 26.11.: ultra schnelle Stimme, Szene nur ~1,5 s)
  aChip(c, A, "03.09.1928", px(A, 0.66, 0.90), bis(c, k.jahr - 0.04, f2s(9)), "#7A1E16", "#FFFFFF", 46, null, null, true);
  credits(c, ["p-hospital.jpg"]);
  var cam = kamera(c, 103); punchAt(cam, k.jahr - 0.02, 1.04);
  voxSauce(c, "archiv");
};
// ---------- 3 Fleming kommt aus dem Urlaub zurueck, auf dem Tisch stehen noch Glasschalen: Kreis um Fleming, Pfeil "zurueck", Callout auf die Schalen, Bakterienname ----------
B.labor = function (c, k) {
  schichten(c, "labor", { ut: 52 });
  var A = abz(c, "p-labor.jpg", 470, 690, 660, -2, 0.0, "pop", { prot: 4 });
  ende(aKreis(c, A, "Fleming", A.P("fleming"), 110, 130, bis(c, Math.min(k.fleming - 0.04, 0.20), f2s(9)), MARK, 9, true), k.urlaub - 0.06);
  var tu = A.P("tuer"), fl = A.P("fleming");
  var pf = aPfeil(c, A, "zurueck", [tu[0] - 50, tu[1] + 150], [fl[0] - 42, fl[1] + 70], 0.30, bis(c, k.urlaub - 0.02, f2s(12)), f2s(12), YEL, 10);   // gelb: liegt auf dem Foto (dunkle Tuer), nicht auf dem weissen Grund
  ende(pf, k.tisch - 0.06);
  var t0 = bis(c, k.tisch - 0.04, 1.6), t1 = Math.min(k.schalen + 0.20, t0 + 1.6);
  aCalloutF(c, A, "Schalen", A.P("schalen"), 150, 110, t0, 58, "#0E0D0C");
  aChip(c, A, "STAPHYLOKOKKEN", px(A, 0.30, 0.90), bis(c, k.bakterien - 0.04, f2s(9)), INK, "#FFFFFF", 40);
  credits(c, ["p-labor.jpg"]);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 4 Auf einer Schale waechst Schimmel, rundherum sind die Bakterien weg: Kreis um die Schale, Callout auf den Schimmel, Ringe, Pfeil auf die leere Zone ----------
B.schale = function (c, k) {
  schichten(c, "schale", { ut: 52 });
  var A = abz(c, "p-schale.jpg", 470, 690, 580, 2, 0.0, "pop", { prot: -4 });
  var m = A.P("schimmel");
  ende(aKreis(c, A, "Schale", m, 300, 290, bis(c, Math.min(k.schale - 0.04, 0.14), f2s(9)), YEL, 9), k.pilz - 0.06);   // frueh, damit der Kreis vor dem Callout sauber steht und endet (ultra schnelle Stimme)
  aCalloutF(c, A, "Schimmel", m, 70, 70, bis(c, k.pilz - 0.06, 0), 58, "#0E0D0C", true);
  for (var i = 0; i < 2; i++) aRing(c, A, m, bis(c, k.rund - 0.04, 0.6) + i * 0.20, CREAM, 360, 0.55);   // hell: die Schale ist dunkel
  var b = A.P("bakterien"), z = A.P("zone");
  aPfeil(c, A, "weg", [b[0], b[1] + 120], [z[0] - 10, z[1] + 30], -0.35, bis(c, k.verschw - 0.10, f2s(14)), f2s(10), YEL, 10);   // gelb: auf der dunklen Schale
  credits(c, ["p-schale.jpg"]);
  var cam = kamera(c, 104); punchAt(cam, k.verschw - 0.02, 1.04);
  voxSauce(c, "archiv");
};
// ---------- 5 Fleming wird neugierig, nennt den Stoff Penicillin: der Schimmel gross, Fleming-Portrait ploppt, Fragezeichen, Jahr der Benennung ----------
B.neugierig = function (c, k) {
  schichten(c, "neugierig");
  var A = abz(c, "p-stern.jpg", 470, 760, 500, -2, 0.0, "slide", { von: "links" });
  var F = kindBild(c, A, "f-fleming.png", [270, 430], 260, -5);
  if (F) { popIn(F.l, 0.10, -6); ende(aChip(c, F, "?", [F.iw * 0.92, F.ih * 0.24], bis(c, Math.min(k.neugierig - 0.02, 0.16), f2s(5)), LRED, "#FFFFFF", 90, "slam", "slam", true), k.stoff - 0.06); }
  aCalloutF(c, A, "Stoff", A.P("mitte"), 130, 130, bis(c, k.stoff - 0.04, 0), 50, "#0E0D0C");
  aOdo(c, A, "1929", px(A, 0.70, 0.86), 72, bis(c, k.penicillin - 0.10, 0.45), 0.45, CREAM, "#151515");
  credits(c, ["p-stern.jpg", "f-fleming.png"]);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 6 Folge, um schlauer zu werden: Regale voller Kulturflaschen treiben (Parallax), Folgen-Knopf -> Gefolgt (mittig) ----------
B.folge = function (c, k) {
  schichten(c, "folge", { ut: 52 });
  var A = abz(c, "p-flaschen.jpg", 470, 640, 640, -3, null, null, { fahrt: 110 }); voxTag(A.l, "parallax", true);
  var kz = c.duration < 1.6; followBtn(c, 540, 1090, 0.0, Math.max(f2s(kz ? 13 : 17), Math.min(k.schlauer + 0.30, c.duration - f2s(kz ? 12 : 15))), 1.3, kz);   // kurze Szene (ultra schnelle Stimme): schnelle Federung
  credits(c, ["p-flaschen.jpg"]);
  kamera(c, 102);
  voxSauce(c, "grafik");
};
// ---------- 7 Kaum jemand interessiert sich, Fleming kann keine grossen Mengen herstellen: Fleming am Schreibtisch, Callout, Kulturflaschen ploppen, rotes Kreuz ----------
B.kaum = function (c, k) {
  schichten(c, "kaum");
  var A = abz(c, "p-portrait.jpg", 470, 720, 480, 2, 0.0, "pop", { prot: 4 });
  aCalloutF(c, A, "Fleming", A.P("gesicht"), 120, 140, bis(c, k.kaum - 0.06, 0), 58, "#0E0D0C", true);
  aChip(c, A, "AUFSATZ 1929", px(A, 0.50, 0.94), bis(c, k.interessiert + 0.10, f2s(9)), INK, "#FFFFFF", 40);
  var K = kindBild(c, A, "p-kultur.jpg", [620, 960], 250, 6);
  if (K) { popIn(K.l, bis(c, k.mengen - 0.30, f2s(9)), 8); aKreuz(c, K, "Mengen", [K.iw * 0.12, K.ih * 0.12, K.iw * 0.88, K.ih * 0.88], bis(c, k.herstellen - 0.02, f2s(9)), LRED); }
  credits(c, ["p-portrait.jpg", "p-kultur.jpg"]);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 8 Zwoelf Jahre spaeter (1940) schaffen es zwei Forscher in Oxford: Gruppenfoto, Kreis Florey -> Kreis Chain ----------
B.oxford = function (c, k) {
  schichten(c, "oxford", { ut: 52 });
  var A = abz(c, "p-oxford.jpg", 470, 700, 600, -2, 0.0, "slide", { von: "rechts" });
  var fl = A.P("florey"), ch = A.P("chain");
  ende(aKreis(c, A, "Florey", fl, 110, 130, bis(c, k.jahre - 0.04, f2s(9)), MARK, 9, true), k.oxford - 0.04);   // schon auf "Jahre", sonst bleibt bei schneller Stimme keine Zeit vor Chain
  aKreis(c, A, "Chain", ch, 110, 130, bis(c, k.oxford - 0.02, f2s(9)), MARK, 9);
  // Namens-Chips Florey/Chain gestrichen (Szene nur ~2,5 s, sonst 4 Geraete in 2,5 s)
  credits(c, ["p-oxford.jpg"]);
  var cam = kamera(c, 103); punchAt(cam, k.forscher - 0.02, 1.04); voxTag(cam, "punch");
  voxSauce(c, "archiv");
};
// ---------- 9 Im Zweiten Weltkrieg rettet Penicillin verwundete Soldaten: echtes Kriegsplakat, Jahr, Bogen-Pfeil vom Wort Penicillin zum Verwundeten, Kreis ----------
B.krieg = function (c, k) {
  schichten(c, "krieg");
  var A = abz(c, "p-plakat.jpg", 470, 700, 520, -2, 0.0, "drop", { dy: 110, dur: 0.28 });
  aChip(c, A, "1944", px(A, 0.86, 0.05), bis(c, k.weltkrieg - 0.04, f2s(9)), "#7A1E16", "#FFFFFF", 46);
  var pe = A.P("penicillin"), so = A.P("soldat");
  var pf = aPfeil(c, A, "rettet", [pe[0] - 120, pe[1] - 40], [so[0] + 40, so[1] + 70], 0.45, bis(c, k.rettet - 0.04, f2s(14)), f2s(14), INK, 10, true);
  var kr = aKreis(c, A, "Soldat", so, 150, 110, bis(c, k.soldaten - 0.04, f2s(9)), YEL, 9);
  if (pf && kr) ende(pf, Math.max(pf.inPoint + 0.9, kr.inPoint - 0.04));
  credits(c, ["p-plakat.jpg"]);
  var cam = kamera(c, 103); punchAt(cam, k.soldaten - 0.02, 1.04);
  voxSauce(c, "archiv");
};
// ---------- 10 1945 Nobelpreis fuer Fleming, zusammen mit den beiden aus Oxford: Fleming gross mit Kreis, dann Florey und Chain ploppen dazu, gruene Haken, Punch ----------
B.nobel = function (c, k) {
  schichten(c, "nobel", { ut: 52 });
  var F = abz(c, "f-fleming.png", 470, 640, 360, 0, 0.0, "pop", { prot: -4 });
  ende(aKreis(c, F, "Fleming", F.P("gesicht"), 300, 330, bis(c, Math.min(k.fleming - 0.04, 0.30), f2s(9)), MARK, 9, true), k.nobel - 0.06);
  // Chip "STOCKHOLM" und Ringe gestrichen (ultra schnelle Stimme: Nobelpreis und "zusammen" liegen nur 0,4 s auseinander)
  var Fl = kindBild(c, F, "f-florey.png", [230, 870], 200, -6), Ch = kindBild(c, F, "f-chain.png", [700, 870], 200, 6);
  var tz = bis(c, k.zusammen - 0.04, f2s(9));
  if (Fl) popIn(Fl.l, tz, -8); if (Ch) popIn(Ch.l, tz + 0.15, 8);
  var th = bis(c, k.oxford - 0.04, f2s(6) + 0.2);
  if (Fl) aHaken(c, Fl, "Florey", Fl.P("gesicht"), 1.0, th, GRUEN); if (Ch) aHaken(c, Ch, "Chain", Ch.P("gesicht"), 1.0, th + 0.2, GRUEN);
  credits(c, ["f-fleming.png", "f-florey.png"]);
  var cam = kamera(c, 103); punchAt(cam, k.nobel - 0.02, 1.04);
  voxSauce(c, "archiv");
};
// ---------- 11 Haettest du die Schale weggeworfen? Die Schale, Fragezeichen, gestrichelte Wurfbahn nach unten ----------
B.frage = function (c, k) {
  schichten(c, "frage");
  var A = abz(c, "p-schale.jpg", 470, 680, 560, -4, 0.0, "pop", { prot: 6 });
  ende(aChip(c, A, "?", px(A, 0.86, 0.12), bis(c, Math.min(k.schale - 0.10, 0.20), f2s(5)), LRED, "#FFFFFF", 100, "slam", "slam", true), k.weg - 0.06);
  var m = A.P("schimmel");
  var tw = bis(c, k.weg - 0.20, 0.7); aBahn(c, A, "Wurf", [m[0] + 60, m[1] - 40], [A.iw * 0.92, A.ih * 0.92], -0.35, tw, tw + 0.6, YEL, 9);   // gelb: startet auf der dunklen Schale
  credits(c, ["p-schale.jpg"]);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 12 Schluss: Logo gross im Bleistiftkreis (930, Abstand), Folgen-Knopf mittig, "In der Bio" mit Schatten ----------
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
