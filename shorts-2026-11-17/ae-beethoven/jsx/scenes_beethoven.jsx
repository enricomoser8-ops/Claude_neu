// ===================== Szenen: Short 17.11.2026 "Beethoven dirigiert die Neunte" (beethoven), Hintergrund-Vox wie ae-jessop =====================
// Regeln (enno): EIN vollflaechiges Archivbild je Szene ist DAS Bild (warm/Sepia, langsame Fahrt, hoechstens 110 % der echten Pixel).
// Gemaelde/Drucke gemeinfrei (LOC, Internet Archive). Drei Bilder gibt es nur auf Wikimedia Commons: sie werden auf dem PC nach
// archiv/commons_liste.json unter archiv/commons/ abgelegt; fehlt eine Datei, steht im Ergebnis "FEHLER DATEI FEHLT" (zaehlt als Fehler).
// Keine KI-Bilder in diesem Short (siehe README). Wenig Text: <= 2 Textebenen je Szene, <= 3 Woerter. Die Untertitel tragen die Worte.
// Kein Hauptgeraet zweimal hintereinander. k = Zeiten der Schluesselwoerter relativ zum Szenenanfang.
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

// ---------- Commons-Datei (nur PC): laut fehlen + Groessenpruefung (Positionen sind Anteile, eine andere Groesse ist nur ein Hinweis) ----------
function commonsImp(rel, w, h) {
  var f = new File(BASE + rel);
  if (!f.exists) { log.push("FEHLER DATEI FEHLT (Commons, siehe archiv/commons_liste.json): " + rel); return null; }
  var it = imp(rel); if (!it) return null;
  if (Math.abs(it.width - w) > 2 || Math.abs(it.height - h) > 2) log.push("HINWEIS " + rel + ": " + it.width + " x " + it.height + " statt " + w + " x " + h + " (Positionen sind Anteile, Snap pruefen)");
  return it;
}
// Ausschnitt-Element aus einer Commons-Datei (zeitung(): Papier-Tint, Riss, Schatten, rutscht stufig herein); null, wenn die Datei fehlt
function commonsZeitung(c, rel, w0, h0, x, y, w, rot, t0, name) {
  if (!commonsImp(rel, w0, h0)) return null;
  return zeitung(c, rel, x, y, w, rot, t0, name);
}
function zPt(z, fx, fy) { var it = z.source; return [fx * it.width, fy * it.height]; }   // Anteil -> Bildpunkt der Datei
// Bleistift-Pfeil auf dem Ausschnitt (Anteile), zeichnet sich
function zPfeil(c, z, name, a, b, t0, color, w) {
  var A = zPt(z, a[0], a[1]), Bp = zPt(z, b[0], b[1]), s = z.scale.value[0] / 100;
  var mx = (A[0] + Bp[0]) / 2, my = Math.min(A[1], Bp[1]) - 40 / s;
  var p = { v: [A, Bp], i: [[0, 0], [mx - Bp[0], my - Bp[1]]], o: [[mx - A[0], my - A[1]], [0, 0]], c: false };
  var ang = Math.atan2(Bp[1] - my, Bp[0] - mx), L = 30 / s;
  var head = line2([[Bp[0] - L * Math.cos(ang - 0.5), Bp[1] - L * Math.sin(ang - 0.5)], Bp, [Bp[0] - L * Math.cos(ang + 0.5), Bp[1] - L * Math.sin(ang + 0.5)]]);
  var l = pencil(c, "Pfeil " + name, [p, head], color || CREAM, (w || 7) / s, t0, f2s(8));
  zKind(z, l); l.inPoint = t0; l.moveBefore(z);
  return voxTag(l, "pfeil");
}
function zKreisF(c, z, name, f, rf, t0, color, haupt) {   // Kreis auf dem Ausschnitt in Anteilen (Mitte f, Radien rf)
  var it = z.source, l = zKreis(c, z, name, f[0] * it.width, f[1] * it.height, rf[0] * it.width, rf[1] * it.height, t0, color, 8);
  return voxTag(l, "kreis", haupt);
}
// Stern (5 Zacken, eine Spitze nach oben) als Formebene
function stern(c, name, x, y, r, color) {
  var l = shape(c, name), g = grp(l, "Stern"), P = [];
  for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.382 : r; P.push([rr * Math.cos(a), rr * Math.sin(a)]); }
  addPath(g, line2(P, true)); fill(g, color);
  l.position.setValue([x, y]);
  return l;
}

// ---------- 1 Hook: Beethoven-Gesicht ab Bild 0 (Chromolithografie nach Stieler), Kontrast-Callout aufs Gesicht, Punch auf "hoeren" ----------
B.hook = function (c, k) {
  grund(c, "hook", { dunkel: 4 });
  var g = pS("hook", "gesicht", 1.0);
  spot(c, "hook", "Gesicht", { ell: [g[0], g[1] - 40, 330, 430] }, 1.0, 0.0, null, 52, true);
  credits(c, [D.grund.hook.quelle]);
  var cam = kamera(c, 102);
  punchAt(cam, k.hoeren, 1.06);
  voxSauce(c, "archiv");
};
// ---------- 2 Name: echte Signatur auf der Pariser Lithografie, Textmarker auf "Beethoven" ----------
var SIGNATUR = [0.39, 0.835, 0.75, 0.032];   // Anteile des Ausschnitts: x0, x1, y (Mitte), Hoehe
B.name = function (c, k) {
  grund(c, "name", { dunkel: 3 });
  var s = D.grund.name.size, sg = gS("name", [(SIGNATUR[0] + SIGNATUR[1]) / 2 * s[0], SIGNATUR[2] * s[1]], 0.5);
  spot(c, "name", "Signatur", { ell: [sg[0], sg[1], 520, 240] }, 0.5, 0.0, null, 28);
  gMarker(c, "name", "Signatur", SIGNATUR[0] * s[0], SIGNATUR[1] * s[0], SIGNATUR[2] * s[1], SIGNATUR[3] * s[1], k.beethoven - 0.06, YEL, true);
  credits(c, [D.grund.name.quelle]);
  punchCut(c, 1.08);
  kamera(c, 102);
  voxSauce(c, "archiv");
};
// ---------- 3 Taub: Gesicht derselben Lithografie, Odometer 50, Callout aufs Gesicht, Punch auf "taub" ----------
B.taub = function (c, k) {
  grund(c, "taub", { dunkel: 3 });
  var y = odometer(c, "50", F_NUM, 200, CREAM, [800, 1180], k.fuenfzig - 0.06, f2s(12)); y.name = "Zahl 50"; schatten(y);
  var g = pS("taub", "gesicht", 1.6);
  spot(c, "taub", "Gesicht", { ell: [g[0], g[1], 330, 420] }, 1.6, 0.0, null, 55, true);
  credits(c, [D.grund.taub.quelle]);
  var cam = kamera(c, 102);
  punchAt(cam, k.taub, 1.06);
  voxSauce(c, "archiv");
};
// ---------- 4 Heft: Partiturseite (dunkel), darueber eine echte Seite aus einem Konversationsheft (Commons), Textmarker ----------
var KONV = "archiv/commons/konversationsheft.jpg";
var KONV_ZEILE = [0.035, 0.255, 0.188, 0.07];   // erste Zeile "j'etois bien" (Anteile x0, x1, y, Hoehe) - auf dem PC im Snap pruefen
B.heft = function (c, k) {
  grund(c, "heft", { dunkel: 30 });
  spot(c, "heft", "Heft", { ell: [CX, 830, 560, 400] }, 1.0, 0.0, null, 40);
  var z = commonsZeitung(c, KONV, 2726, 1409, CX, 830, 900, -2, 0.08, "Konversationsheft");
  if (z) {
    voxTag(z, "zeitung", true);
    var it = z.source;
    zMarker(c, z, "Heft-Zeile", KONV_ZEILE[0] * it.width, KONV_ZEILE[1] * it.width, KONV_ZEILE[2] * it.height, KONV_ZEILE[3] * it.height, k.heft - 0.04);
  }
  credits(c, [D.grund.heft.quelle, "commons-konversationsheft"]);
  kamera(c, 102);
  voxSauce(c, "archiv");
};
// ---------- 5 Wien 1824: Ansicht von Jakob Alt, Odometer 1824, Bleistiftkreis um den Stephansdom ----------
B.wien = function (c, k) {
  grund(c, "wien", { dunkel: 3 });
  var y = odometer(c, "1824", F_NUM, 170, CREAM, [CX, 470], k.jahr - 0.06, f2s(14)); y.name = "Jahr 1824"; schatten(y);
  qKreis(c, "wien", "Stephansdom", D.grund.wien.pts.turm, 120, 190, k.wien + 0.06, LRED, 8, f2s(10), true);
  credits(c, [D.grund.wien.quelle]);
  punchCut(c, 1.10);
  kamera(c, 103);
  voxSauce(c, "archiv");
};
// ---------- 6 Sinfonie: Titelblatt der Erstausgabe 1826, Etikett NR. 9, Textmarker auf "Sinfonie" ----------
var SINFONIE = [0.441, 0.811, 0.193, 0.030];
B.sinfonie = function (c, k) {
  grund(c, "sinfonie", { dunkel: 2 });
  chip(c, "NR. 9", CX, 1180, LRED, "#FFFFFF", 64, k.neunte - 0.04);
  var s = D.grund.sinfonie.size;
  gMarker(c, "sinfonie", "Sinfonie", SINFONIE[0] * s[0], SINFONIE[1] * s[0], SINFONIE[2] * s[1], SINFONIE[3] * s[1], k.sinfonie - 0.04, YEL, true);
  credits(c, [D.grund.sinfonie.quelle]);
  var cam = kamera(c, 102);
  punchAt(cam, k.gespielt, 1.05);
  voxSauce(c, "archiv");
};
// ---------- 7 Mitte-Aufruf: Foto der Buste, PARALLAX (Buste loest sich), Folgen-Knopf -> "Gefolgt" (mittig, ohne Haken) ----------
var FOLGE_POLY = [[0.281, 0.099], [0.5625, 0.099], [0.703, 0.222], [0.672, 0.383], [0.766, 0.481], [0.781, 0.654], [0.734, 0.741], [0.797, 0.864], [0.359, 0.877], [0.391, 0.716], [0.172, 0.593], [0.047, 0.469], [0.078, 0.432], [0.234, 0.383], [0.234, 0.259]];
B.folge = function (c, k) {
  grund(c, "folge", { dunkel: 4 });
  gParallax(c, "folge", fPoly("folge", FOLGE_POLY, 0.76), 0.76, [CX, 1500], 1.07, true);
  followBtn(c, CX, 1140, 0.06, k.schlauer + 0.30, 1.4);
  credits(c, [D.grund.folge.quelle]);
  kamera(c, 102);
  voxSauce(c, "grafik");
};
// ---------- 8 Takt: Partiturseite (dunkel), darueber Offterdingers Druck der Urauffuehrung (Commons): Kreis um Beethoven, Pfeil zum Dirigenten ----------
var PREM = "archiv/commons/premiere-neunte.jpg";
var PREM_BEETHOVEN = [0.52, 0.42], PREM_BEETHOVEN_R = [0.16, 0.24];   // Kopf bis Brust (Anteile)
var PREM_DIRIGENT = [0.80, 0.45], PREM_DIRIGENT_R = [0.14, 0.18];
B.takt = function (c, k) {
  grund(c, "takt", { dunkel: 35 });
  spot(c, "takt", "Druck", { ell: [CX, 780, 470, 560] }, 1.0, 0.0, null, 40);
  var z = commonsZeitung(c, PREM, 741, 900, CX, 780, 720, 2, 0.06, "Urauffuehrung");
  if (z) {
    voxTag(z, "zeitung", true);
    var kb = zKreisF(c, z, "Beethoven", PREM_BEETHOVEN, PREM_BEETHOVEN_R, k.buehne - 0.04, LRED);
    zPfeil(c, z, "zum Dirigenten", [0.62, 0.27], [0.76, 0.32], k.dirigenten - 0.10, NAVY, 8);
    zKreisF(c, z, "Dirigent", PREM_DIRIGENT, PREM_DIRIGENT_R, k.dirigenten + 0.10, NAVY);
  }
  credits(c, [D.grund.takt.quelle, "commons-premiere"]);
  var cam = kamera(c, 102);
  punchAt(cam, k.takt, 1.04);
  voxSauce(c, "archiv");
};
// ---------- 9 Jubel: Saal im Jubel (Harper's Weekly), FOKUS wandert von der Buehne in die jubelnde Menge ----------
B.jubel = function (c, k) {
  grund(c, "jubel", { dunkel: 3 });
  var t1 = 0.10 + 1.94;
  gFokus(c, 0.10, t1, pS("jubel", "buehne", 0.10), pS("jubel", "menge", 1.1), 300, 280, true);
  var m = pS("jubel", "menge", t1);
  spot(c, "jubel", "Menge", { ell: [m[0], m[1], 460, 360] }, t1, t1, null, 45);
  credits(c, [D.grund.jubel.quelle]);
  var cam = kamera(c, 102);
  punchAt(cam, k.jubelt, 1.06);
  voxSauce(c, "archiv");
};
// ---------- 10 Ruecken: Konzertsaal von hinten, der Dirigent mit dem Ruecken zum Publikum (Kontrast-Callout), Punch auf "nichts" ----------
B.ruecken = function (c, k) {
  grund(c, "ruecken", { dunkel: 3 });
  var d = pS("ruecken", "dirigent", k.ruecken);
  spot(c, "ruecken", "Dirigent", { ell: [d[0], d[1] - 20, 190, 240] }, k.ruecken, 0.0, null, 58, true);
  credits(c, [D.grund.ruecken.quelle]);
  punchCut(c, 1.08);
  var cam = kamera(c, 102);
  punchAt(cam, k.nichts, 1.07);
  voxSauce(c, "archiv");
};
// ---------- 11 Saengerin: Kamera schwingt, Abzug der Saengerin Caroline Unger (Commons, ohne Namen), Dreh-Pfeile um den Dirigenten ----------
var UNGER = "archiv/commons/unger.jpg";
var MIT_UNGER = true;   // false = Abzug weglassen (Lizenz unklar): kein Fehler, dann sind die Dreh-Pfeile das Hauptmittel
B.saengerin = function (c, k) {
  grund(c, "saengerin", { dunkel: 3 });
  var fr = null;
  if (MIT_UNGER && commonsImp(UNGER, 1314, 1351)) {
    fr = printPhoto(c, UNGER, 740, 600, 340, 380, 4, k.saengerin - 0.06);
    if (fr) voxTag(fr, "abzug", true);
  }
  var w = wirbel(c, "saengerin", D.grund.saengerin.pts.dirigent, 150, k.dreht - 0.04, CREAM);
  if (!fr && w) {   // ohne Abzug: Spot auf den Dirigenten von Anfang an, Dreh-Pfeile sind HAUPT
    voxTag(w, "strich", true);
    var dg = pS("saengerin", "dirigent", 0.3);
    spot(c, "saengerin", "Dirigent", { ell: [dg[0], dg[1] - 20, 230, 280] }, 0.3, 0.0, null, 50);
  }
  credits(c, MIT_UNGER ? [D.grund.saengerin.quelle, "commons-unger"] : [D.grund.saengerin.quelle]);
  var cam = kamera(c, 102);
  NOANIM = true; keys(cam.rotation, [0, c.duration], [-1.2, 1.2], 40); NOANIM = false;
  voxSauce(c, "archiv");
};
// ---------- 12 Huete und Tuecher: BRAND-Uebergang in die jubelnde Menge (Harper's Weekly 1865), Bleistiftkreise um gehobene Huete ----------
B.huete = function (c, k) {
  grund(c, "huete", { dunkel: 3 });
  gBrand(c, "saengerin", 0, 0.40);
  var mg = pS("huete", "menge", 0.4);
  spot(c, "huete", "Menge", { ell: [mg[0], mg[1], 480, 380] }, 0.4, 0.36, k.huete, 45);
  var r = 110;
  var a = qKreis(c, "huete", "Hut A", D.grund.huete.pts.hutA, r, r * 1.2, k.huete - 0.04, LRED, 8, f2s(9), true);
  var b = qKreis(c, "huete", "Hut B", D.grund.huete.pts.hutB, r, r * 1.2, k.tuecher - 0.04, LRED, 8, f2s(9));
  var d = qKreis(c, "huete", "Hut C", D.grund.huete.pts.hutC, r, r * 1.2, k.luft - 0.04, LRED, 8, f2s(9));
  a.outPoint = k.luft; b.outPoint = k.sieht2; d.outPoint = c.duration;
  credits(c, [D.grund.huete.quelle]);
  var cam = kamera(c, 102);
  punchAt(cam, k.sieht2, 1.05);
  voxSauce(c, "archiv");
};
// ---------- 13 Hymne: Partitur S. 113 "Freude, schoener Goetterfunken" (Textmarker), FARBSWEEP Blau + 12 goldene Sterne (Europaflagge) ----------
var FREUDE = [0.527, 0.839, 0.676, 0.020];
B.hymne = function (c, k) {
  grund(c, "hymne", { dunkel: 2 });
  var s = D.grund.hymne.size;
  gMarker(c, "hymne", "Freude", FREUDE[0] * s[0], FREUDE[1] * s[0], FREUDE[2] * s[1], FREUDE[3] * s[1], k.melodie - 0.02, YEL);
  var t0 = k.hymne - 0.16;
  farbSweep(c, "hymne", "Europa-Blau", "#003399", null, 1.0, t0, { t0: t0, t1: t0 + 0.35, art: "rein-oben" }, 85, true);
  var R = 240, cy = 700;   // offizielle Geometrie: Sternkreis = 1/3 der Flaggenhoehe, Stern-Radius = 1/18 der Hoehe
  for (var i = 0; i < 12; i++) {
    var w = -Math.PI / 2 + i * Math.PI / 6;
    var st = stern(c, "Stern " + (i + 1), CX + R * Math.cos(w), cy + R * Math.sin(w), R * 3 / 18, "#FFCC00");
    popIn(st, t0 + 0.25 + i * f2s(1));
  }
  credits(c, [D.grund.hymne.quelle, "europaflagge"]);
  kamera(c, 102);
  voxSauce(c, "archiv");
};
// ---------- 14 Frage: Augen (Chromolithografie nach Stieler), Callout, Fragezeichen ----------
B.frage = function (c, k) {
  grund(c, "frage", { dunkel: 4 });
  var a = pS("frage", "augen", 0.5);
  spot(c, "frage", "Augen", { ell: [a[0], a[1], 430, 220] }, 0.5, 0.04, null, 54, true);
  var q = txt(c, "?", F_SERIF_BI, 210, LRED, [880, 1180]); q.name = "Fragezeichen"; schatten(q); slam(q, k.gefuehlt - 0.04);
  credits(c, [D.grund.frage.quelle]);
  kamera(c, 102);
  voxSauce(c, "archiv");
};
// ---------- 15 Schluss: Brand-Uebergang in Wien (Jakob Alt), grosses Logo (360 px im Kreis), "In der Bio", Folgen-Knopf ----------
B.outro = function (c, k) {
  grund(c, "outro", { dunkel: 14 });
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
