// ===================== Karten-Vox-Bausteine (neu ab Short 13.11.2026 "Freiheitsstatue") =====================
// Erwartet vox_lib.jsx + vox_plus.jsx davor und D.karte (gen/karte_freiheit.py), D.globus (gen/globus_freiheit.py), D.dive (gen_freiheit.py).
// Grundidee: Die Karte ist Vektor (Formebenen in km), haengt an einer Welt-Null "Kamera Welt" (Anker = Weltpunkt in der Bildmitte,
// Skalierung = Massstab s x 100 in px pro km). Striche halten per Ausdruck ihre Bildschirmbreite (STRICHFEST), Beschriftungen, Nadeln
// und Abzuege ihre Bildschirmgroesse (KONSTGROESSE) - so bleibt alles scharf, egal wie weit die Kamera hinein- oder herausfaehrt.
var KA = D.karte, GL = D.globus, FCY = GL.fcy;
var SEA = "#BCCBCB", LAND = "#EFE4C9", COAST = "#4A4136", BORD = "#8E8270", STATE = "#B7AA90";
var COPPER = "#B8733A", VERD = "#4E9A84", NAVY = "#2E4C6D", LABC = "#6E604C", WATC = "#557780";

function fxGet(layer, name) {   // Effekt nach dem Anlegen frisch holen (AE: aeltere Referenzen werden durch addProperty ungueltig)
  try { var fx = layer.property("ADBE Effect Parade"); return fx ? fx.property(name) : null; } catch (e) { return null; }
}
var EX_STRICH = "// STRICHFEST: Strich behaelt seine Bildschirmbreite trotz Welt-Zoom\nvalue / Math.max(0.0001, length(toComp([0, 0]), toComp([1, 0])));";
var EX_KONST = "// KONSTGROESSE: gleiche Bildschirmgroesse trotz Welt-Zoom\nvar k = Math.max(0.0001, length(parent.toComp([0, 0]), parent.toComp([1, 0])));\n[value[0] / k, value[1] / k];";
function konst(l) { l.scale.expression = EX_KONST; return l; }
function strichfest(st) {
  try { st.property("ADBE Vector Stroke Width").expression = EX_STRICH; } catch (e) { log.push("STRICHFEST: " + e); }
  try {   // Striche mit Strichelung: Strich- und Lueckenlaenge ebenfalls
    var ds = st.property("ADBE Vector Stroke Dashes");
    for (var i = 1; ds && i <= ds.numProperties; i++) ds.property(i).expression = EX_STRICH;
  } catch (e2) {}
  return st;
}

// ---------- Welt-Kamera ----------
function welt(c, cam, s) {
  var n = c.layers.addNull(c.duration); n.name = "Kamera Welt";
  n.anchorPoint.setValue(cam); n.position.setValue([CX, FCY]); n.scale.setValue([s * 100, s * 100]);
  return n;
}
// Fahrt: Weltpunkt in der Bildmitte (cams) und Massstab (ss) zu den Zeiten; infl wie keys()
function weltFahrt(n, times, cams, ss, infl) {
  var v = []; for (var i = 0; i < ss.length; i++) v.push([ss[i] * 100, ss[i] * 100]);
  keys(n.anchorPoint, times, cams, infl); linPath(n.anchorPoint);
  keys(n.scale, times, v, infl);
}
// lineare Stuetzpunkte (Einstiegsflug): exponentieller Zoom ohne Ease-Bremsen
function dichteKeys(prop, T, V) {
  for (var i = 0; i < T.length; i++) { var k = prop.addKey(T[i]); prop.setValueAtKey(k, V[i]); }
  for (var j = 1; j <= prop.numKeys; j++) prop.setInterpolationTypeAtKey(j, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
  noteAnim(prop, T[T.length - 1]);
}
// Bildschirmpunkt -> Weltpunkt bei Kamera (cam, s)
function wp(scr, cam, s) { return [cam[0] + (scr[0] - CX) / s, cam[1] + (scr[1] - FCY) / s]; }

// ---------- Papierkarte (Meer, Land, Grenzen) ----------
// M: KA.ny.reg | KA.ny.haf | KA.atl ; opt: {name, coast, states, borders, tIn, tOut}
function karte(c, R, M, opt) {
  opt = opt || {}; var nm = opt.name || "", o = {}, b = M.box, ex = 0.3;
  var bw = b[2] - b[0], bh = b[3] - b[1];
  o.meer = shape(c, "Karte Meer" + nm); var gm = grp(o.meer, "Meer");
  addPath(gm, line2([[b[0] - bw * ex, b[1] - bh * ex], [b[2] + bw * ex, b[1] - bh * ex], [b[2] + bw * ex, b[3] + bh * ex], [b[0] - bw * ex, b[3] + bh * ex]], true));
  fill(gm, SEA);
  o.land = shape(c, "Karte Land" + nm); var gl = grp(o.land, "Land");
  for (var i = 0; i < M.land.length; i++) addPath(gl, line2(M.land[i], true));
  fill(gl, LAND); strichfest(stroke(gl, COAST, opt.coast || 2.4));
  addFx(o.land, "ADBE Drop Shadow", "Kuestenschein");
  var ks = fxGet(o.land, "Kuestenschein");
  if (ks) { setP(ks, ["Shadow Color"], rgb("#58767E")); setP(ks, ["Opacity"], 120); setP(ks, ["Distance"], 0); setP(ks, ["Softness"], 16); }
  if (M.states && opt.states !== false) {
    o.states = shape(c, "Karte Staaten" + nm); var gs = grp(o.states, "Staatsgrenzen");
    for (var s2 = 0; s2 < M.states.length; s2++) addPath(gs, line2(M.states[s2], false));
    strichfest(stroke(gs, STATE, 1.5, 5, 4));
  }
  if (M.borders && opt.borders !== false) {
    o.borders = shape(c, "Karte Grenzen" + nm); var gb = grp(o.borders, "Landesgrenzen");
    for (var b2 = 0; b2 < M.borders.length; b2++) addPath(gb, line2(M.borders[b2], false));
    strichfest(stroke(gb, BORD, 2, 7, 5));
  }
  var all = [o.meer, o.land, o.states, o.borders];
  for (var a = 0; a < all.length; a++) if (all[a]) {
    place(all[a], R, [0, 0], 100, 0);
    if (opt.tIn !== undefined) all[a].inPoint = opt.tIn;
    if (opt.tOut !== undefined) all[a].outPoint = opt.tOut;
  }
  return o;
}
// Papier, Kartenleben (leichtes Atmen der Kuesten), Untertitel-Schatten: Bildschirm-fest ueber der Karte
function kartePapier(c, tIn, op) {
  var tex = imp("tex/papier_karte.jpg"), p = null;
  if (tex) {
    p = cover(c, tex, 1.0); p.name = "Papier Karte"; p.blendingMode = BlendingMode.MULTIPLY;
    if (tIn) { keys(p.opacity, [tIn, tIn + f2s(4)], [0, op || 90], 40); p.inPoint = tIn; } else p.opacity.setValue(op || 90);
  }
  var a = adj(c, "Karte Leben");
  addFx(a, "ADBE Turbulent Displace", "Kuesten atmen");
  var td = fxGet(a, "Kuesten atmen");
  if (td) { setP(td, ["Amount"], 2.2); setP(td, ["Size"], 16); exprP(td, ["Evolution"], "posterizeTime(8); time*120"); }
  if (tIn) a.inPoint = tIn;
  return p;
}
function subShade(c, op, tIn) {
  var l = solid(c, "FIX UT-Schatten", "#FFFFFF");
  addFx(l, "ADBE Ramp", "UT Verlauf");
  var r = fxGet(l, "UT Verlauf");
  if (r) {
    setP(r, ["Ramp Shape"], 1);
    setP(r, ["Start of Ramp"], [c.width / 2, 1120]); setP(r, ["Start Color"], [1, 1, 1]);
    setP(r, ["End of Ramp"], [c.width / 2, 1720]); setP(r, ["End Color"], rgb("#4A443C"));
  }
  l.blendingMode = BlendingMode.MULTIPLY; l.opacity.setValue(op || 45);
  if (tIn) l.inPoint = tIn;
  return l;
}
// Flaeche einfaerben (Frankreich, USA): eigene Ebene ueber dem Land, Multiplizieren, blendet ein
function karteFlaeche(c, R, name, rings, color, t, op) {
  var l = shape(c, "Karte Flaeche " + name), g = grp(l, name);
  for (var i = 0; i < rings.length; i++) addPath(g, line2(rings[i], true));
  fill(g, color); strichfest(stroke(g, color, 3));
  place(l, R, [0, 0], 100, 0); l.blendingMode = BlendingMode.MULTIPLY;
  keys(l.opacity, [t, t + f2s(5)], [0, op || 55], 40); l.inPoint = t;
  return l;
}
// Beschriftung auf der Karte: Weltpunkt, feste Bildschirmgroesse, blendet vor dem Rand aus; dy = Versatz in px nach oben
// off: Versatz in px (Zahl = nach oben, [dx, dy] = nach rechts / oben)
function kLabel(c, R, s, w, size, color, font, tracking, t0, mode, off) {
  var l = txt(c, s, font || F_SERIF, size || 36, color || LABC, [0, 0], ParagraphJustification.CENTER_JUSTIFY, tracking || 0);
  l.name = "Ort " + s;
  var dx = (off instanceof Array) ? off[0] : 0, dy = (off instanceof Array) ? off[1] : (off || 0);
  place(l, R, w, 100, 0); konst(l);
  l.anchorPoint.setValue([-dx, dy - size * 0.35]);
  edgeFade(l);
  if (t0 !== undefined && t0 !== null) { if (mode === "pop") popIn(l, t0); else { typeOn(l, t0, 26); l.inPoint = t0; } }
  return l;
}
// Stecknadel (Spitze auf dem Weltpunkt), springt aus der Spitze auf; Einschlag-Ring
function kPin(c, R, name, w, t0, color) {
  var p = shape(c, "Nadel " + name);
  var gn = grp(p, "Nadel"); addPath(gn, line2([[0, 0], [10, -78]])); stroke(gn, "#5E584E", 6);
  var gh = grp(p, "Kopf"); ellipseG(gh, 42, 42, 12, -92); fill(gh, color || RED); stroke(gh, INK, 3);
  var gg = grp(p, "Glanz"); ellipseG(gg, 11, 11, 5, -99); fill(gg, "#FFFFFF", 85);
  place(p, R, w, 100, 0); konst(p);
  if (t0 !== null && t0 !== undefined) {
    keys(p.scale, [t0, t0 + f2s(4), t0 + f2s(8)], [[0, 0], [112, 112], [100, 100]], [[10, 10], [60, 60], [80, 80]]);
    p.inPoint = t0;
    var r = shape(c, "Einschlag " + name), gr = grp(r); ellipseG(gr, 10, 10, 0, 0); stroke(gr, color || RED, 5);
    place(r, R, w, 100, 0); konst(r);
    var el = r.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group").property("ADBE Vector Shape - Ellipse").property("ADBE Vector Ellipse Size");
    keys(el, [t0 + f2s(3), t0 + f2s(14)], [[10, 6], [150, 56]], [[5, 5], [80, 80]]);
    keys(r.opacity, [t0 + f2s(3), t0 + f2s(14)], [100, 0], 40);
    r.inPoint = t0 + f2s(3);   // Ring blendet auf 0 aus (kein outPoint: sonst endet die Animation 'auf' der Ebenenkante)
  }
  return p;
}
// Faden vom Abzug zur Nadel (Weltkoordinaten, Strich bildschirmfest), zeichnet sich
function kFaden(c, R, a, b, t0, color) {
  var l = shape(c, "Strich Faden"), g = grp(l, "Faden");
  var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
  var cxp = mx - dy * 0.12, cyp = my + dx * 0.12;   // leichter Bogen
  addPath(g, { v: [a, b], i: [[0, 0], [(cxp - b[0]) * 0.6, (cyp - b[1]) * 0.6]], o: [[(cxp - a[0]) * 0.6, (cyp - a[1]) * 0.6], [0, 0]], c: false });
  strichfest(stroke(g, color || INK, 3.5, 9, 7));
  if (t0 !== undefined && t0 !== null) trimOn(g, t0, t0 + f2s(8));
  place(l, R, [0, 0], 100, 0);
  if (t0 !== undefined && t0 !== null) l.inPoint = t0;
  return l;
}
// Route (Atlantik): gestrichelter Bogen a -> b mit Pfeilspitze, zeichnet sich von t0 bis t1
function kRoute(c, R, a, b, bend, t0, t1, color) {
  var l = shape(c, "Route " + Math.round(a[0]) + "-" + Math.round(b[0])), g = grp(l, "Route");
  var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
  var px = mx + dy * bend, py = my - dx * bend;
  addPath(g, { v: [a, b], i: [[0, 0], [(px - b[0]) * 0.66, (py - b[1]) * 0.66]], o: [[(px - a[0]) * 0.66, (py - a[1]) * 0.66], [0, 0]], c: false });
  strichfest(stroke(g, color || RED, 6, 16, 12));
  keys(g.addProperty("ADBE Vector Filter - Trim").property("ADBE Vector Trim End"), [t0, t1], [0, 100], [[30, 30], [70, 70]]);
  place(l, R, [0, 0], 100, 0); l.inPoint = t0;
  // Pfeilspitze am Ziel (feste Groesse), erscheint mit dem Ende der Linie
  var ang = Math.atan2(b[1] - py, b[0] - px), hd = shape(c, "Route Spitze"), gh = grp(hd, "Spitze");
  addPath(gh, line2([[-26 * Math.cos(ang - 0.45), -26 * Math.sin(ang - 0.45)], [0, 0], [-26 * Math.cos(ang + 0.45), -26 * Math.sin(ang + 0.45)]]));
  stroke(gh, color || RED, 6);
  place(hd, R, b, 100, 0); konst(hd);
  keys(hd.scale, [t1 - f2s(2), t1 + f2s(3)], [[0, 0], [100, 100]], [[10, 10], [80, 80]]); hd.inPoint = t1 - f2s(2);
  return l;
}
// Abzug (printPhoto) an der Welt: Bildschirmlage scr bei Kamera (cam, s), feste Bildschirmgroesse
function kAbzug(c, R, rel, scr, cam, s, maxW, maxH, rot, t0) {
  var fr = printPhoto(c, rel, 0, 0, maxW, maxH, 0, t0);
  if (!fr) return null;
  place(fr, R, wp(scr, cam, s), 100, rot || 0); konst(fr);
  if (t0 !== undefined && t0 !== null) {   // printPhoto hat die Keys 112 -> 100 schon gesetzt; inPoint fuer Kinder
    setIn(fr, t0);
  }
  return fr;
}
// Groesse eines Abzugs wie printPhoto ihn legt (ohne Rahmen)
function abzugMass(rel, maxW, maxH) {
  var it = imp(rel); if (!it) return [maxW, maxH, 1];
  var s = Math.min(maxW / it.width, maxH / it.height); return [Math.round(it.width * s), Math.round(it.height * s), s];
}

// ---------- Etikett (Chip): runde Flaeche + Text, springt auf ----------
function chip(c, s, x, y, bg, fg, size, t0, font) {
  size = size || 44;
  var t = txt(c, s, font || F_SANS_B, size, fg || "#FFFFFF", [x, y], ParagraphJustification.CENTER_JUSTIFY, 40);
  t.name = "Etikett " + s;
  var rc = t.sourceRectAtTime(0, false);
  var r = shape(c, "Etikett Flaeche " + s), g = grp(r, "Flaeche");
  rectG(g, rc.width + size * 0.9, size * 1.45, 0, 0, size * 0.36); fill(g, bg || INK);
  r.position.setValue([x + rc.left + rc.width / 2, y + rc.top + rc.height / 2]);
  addFx(r, "ADBE Drop Shadow", "Etikett Schatten");
  var ds = fxGet(r, "Etikett Schatten"); if (ds) { setP(ds, ["Opacity"], 80); setP(ds, ["Distance"], 6); setP(ds, ["Softness"], 16); }
  r.moveAfter(t);
  attach(t, r); t.position.setValue([-(rc.left + rc.width / 2), -(rc.top + rc.height / 2)]);
  if (t0 !== undefined && t0 !== null) popIn(r, t0, -4);
  return r;
}
// Element-Kachel "29 Cu Kupfer" (Periodensystem-Stil, saubere Formen)
function elementKachel(c, x, y, size, t0) {
  var r = shape(c, "Kachel Kupfer"), g = grp(r, "Kachel");
  rectG(g, size, size, 0, 0, size * 0.08); fill(g, COPPER); stroke(g, INK, 5);
  r.position.setValue([x, y]);
  addFx(r, "ADBE Drop Shadow", "Kachel Schatten");
  var ds = fxGet(r, "Kachel Schatten"); if (ds) { setP(ds, ["Opacity"], 90); setP(ds, ["Distance"], 12); setP(ds, ["Softness"], 26); }
  var a = txt(c, "Cu", F_SERIF_B, size * 0.46, "#FFFFFF", [0, 0]); a.name = "Kachel Cu"; attach(a, r); a.position.setValue([0, size * 0.12]);
  var n = txt(c, "29", F_SANS_B, size * 0.13, "#FFF3E6", [0, 0], ParagraphJustification.LEFT_JUSTIFY); n.name = "Kachel 29"; attach(n, r); n.position.setValue([-size * 0.40, -size * 0.30]);
  var k = txt(c, "Kupfer", F_SERIF_I, size * 0.13, "#FFF3E6", [0, 0]); k.name = "Kachel Kupfer Name"; attach(k, r); k.position.setValue([0, size * 0.38]);
  if (t0 !== undefined && t0 !== null) popIn(r, t0, -6);
  return r;
}
// rotes Stempel-Wort (Protest): Rahmen + Versalien, Stop-Motion-Slam
function stempel(c, s, x, y, rot, t0, size) {
  size = size || 70;
  var t = txt(c, s, F_BLACK, size, RED, [0, 0], ParagraphJustification.CENTER_JUSTIFY, 30); t.name = "Stempel " + s;
  var rc = t.sourceRectAtTime(0, false);
  var r = shape(c, "Stempel Rahmen " + s), g = grp(r, "Rahmen");
  rectG(g, rc.width + 50, rc.height + 40, 0, 0, 10); stroke(g, RED, 7);
  r.position.setValue([x, y]); r.rotation.setValue(rot || 0);
  attach(t, r); t.position.setValue([-(rc.left + rc.width / 2), -(rc.top + rc.height / 2)]); t.rotation.setValue(0);
  edgeBoil(r, 7);
  slam(r, t0); setIn(r, t0);
  return r;
}
// Freisteller mit Farbe (KI-Bild: Gegenstand) - wie cutout(), aber in Farbe und mit Schatten
function farbFrei(c, rel, x, y, h, name) { return cutout(c, rel, x, y, h, name, false); }
// "KI-Rekonstruktion"-Leiste: verdeckt die Schnittkante unten am Statuen-Freisteller und kennzeichnet das KI-Bild
function rekoLeiste(c, x, y, w, t0) {
  var r = shape(c, "Leiste Rekonstruktion"), g = grp(r, "Leiste"); rectG(g, w, 54, 0, 0, 4); fill(g, INK);
  r.position.setValue([x, y]);
  var t = txt(c, "KI-REKONSTRUKTION", F_SANS_B, 26, "#F3E6D3", [0, 0], ParagraphJustification.CENTER_JUSTIFY, 120); t.name = "Leiste Text";
  attach(t, r); t.position.setValue([0, 9]);
  if (t0 !== undefined && t0 !== null) setIn(r, t0);
  return r;
}

// ---------- Globus (CC Sphere auf NASA Blue Marble) ----------
// Textur: New York liegt in der Bildmitte, Norden oben (gen/globus_freiheit.py). Bei Rotation 0 zeigt CC Sphere die Texturmitte.
// Ausrichtungs-Pruefung im Build: sampleImage an 4 Testpunkten (Land/Meer) entscheidet Spiegelung und Grunddrehung (0/180),
// ein fuenfter Punkt die Drehrichtung. Ergebnis steht im Build-Log ("Globus: ...").
var GLOBC = null, GLOB = { spiegel: false, base: 0, sign: 1, info: "Standard (Pruefung nicht gelaufen)", radius: GL.radius };
function landMeer(rgbS) { var p = rgbS.split(","); var r = +p[0], g = +p[1], b = +p[2]; if (!(r + g + b > 20)) return "leer"; return (r + g) > 2.3 * b ? "land" : "meer"; }
function globusComp(spin0, spin1) {
  if (GLOBC) return GLOBC;
  var gc = mkComp("Globus (CC Sphere, Blue Marble)", 1800, 1800, D.end, fPre);
  var at = solid(gc, "Atmosphaere", "#86B8E8");
  var m = at.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  m.property("ADBE Mask Shape").setValue(mkShape(circPath(900, 900, 905)));
  m.property("ADBE Mask Feather").setValue([60, 60]);
  at.opacity.setValue(75);
  var it = imp(GL.tex);
  var tx = addItem(gc, it, 900, 900, 100); tx.name = "Globus Textur";
  addFx(tx, "CC Sphere", "Kugel");
  var sp = fxGet(tx, "Kugel");
  if (!sp) { log.push("FEHLER Globus: CC Sphere fehlt"); return GLOBC = gc; }
  setP(sp, ["Radius"], GL.radius);
  setP(sp, ["Ambient"], 52); setP(sp, ["Diffuse"], 58); setP(sp, ["Specular"], 0); setP(sp, ["Light Height"], 55); setP(sp, ["Light Direction"], -40);
  try { var rr = findP(sp, ["Radius"]); if (rr) GLOB.radius = rr.value; } catch (eR) {}
  if (Math.abs(GLOB.radius - GL.radius) > 1) log.push("HINWEIS Globus: Radius " + GLOB.radius + " statt " + GL.radius + " (Szene gleicht die Groesse aus)");
  // ---- Ausrichtungs-Pruefung ----
  var pr = gc.layers.addText("?"); pr.name = "Pruefung Ausrichtung";
  var P = [], Rr = GL.radius, cx = GL.tw / 2, cy = GL.th / 2, q;
  for (q = 0; q < GL.tests.length; q++) P.push("[" + (cx + GL.tests[q].dx * Rr).toFixed(1) + "," + (cy + GL.tests[q].dy * Rr).toFixed(1) + "]");
  P.push("[" + cx + "," + cy + "]");
  pr.property("ADBE Text Properties").property("ADBE Text Document").expression =
    "var L = thisComp.layer(\"Globus Textur\"), P = [" + P.join(",") + "], o = [];\n" +
    "for (var i = 0; i < P.length; i++) { var c = L.sampleImage(P[i], [5, 5], true, time); o.push(Math.round(c[0]*255) + \",\" + Math.round(c[1]*255) + \",\" + Math.round(c[2]*255)); }\no.join(\";\");";
  var rot = findP(sp, ["Rotation Y"]);
  function lesen() { try { var v = String(pr.property("ADBE Text Properties").property("ADBE Text Document").valueAtTime(0, false).text); return v.split(";"); } catch (e) { return []; } }
  var found = false, tries = [];
  try {
    var alt = imp(GL.tex_spiegel);
    for (var mi = 0; mi < 2 && !found; mi++) {
      if (mi === 1) { if (!alt) break; tx.replaceSource(alt, false); }
      for (var bi = 0; bi < 2 && !found; bi++) {
        var base = bi * 180; if (rot) rot.setValue(base);
        var v = lesen(), ok = v.length === GL.tests.length + 1;
        for (q = 0; ok && q < GL.tests.length; q++) if (landMeer(v[q]) !== GL.tests[q].kind) ok = false;
        tries.push((mi ? "gespiegelt" : "normal") + "/" + base + ": " + v.join(" "));
        if (ok) { found = true; GLOB.spiegel = mi === 1; GLOB.base = base; }
      }
    }
    if (found && rot) {
      rot.setValue(GLOB.base + 60);
      var v2 = lesen(), c2 = v2.length ? landMeer(v2[v2.length - 1]) : "?";
      GLOB.sign = (c2 === GL.spin[0].kind) ? 1 : (c2 === GL.spin[1].kind ? -1 : 1);
      GLOB.info = "geprueft: " + (GLOB.spiegel ? "Textur gespiegelt" : "Textur normal") + ", Grunddrehung " + GLOB.base + ", Drehrichtung " + (GLOB.sign > 0 ? "+" : "-") + " (Mitte bei +60: " + c2 + ")";
    } else {
      if (GLOB.spiegel === false) { try { tx.replaceSource(it, false); } catch (eS) {} }
      GLOB.info = "Pruefung ohne Treffer, Standard benutzt (" + tries.join(" | ") + ")";
    }
  } catch (e) { GLOB.info = "Pruefung nicht moeglich: " + e; try { tx.replaceSource(it, false); } catch (eS2) {} }
  try { pr.remove(); } catch (eD) { pr.enabled = false; }
  log.push("HINWEIS Globus: " + GLOB.info);
  // Drehung: Europa/Afrika -> New York, endet bei spin1 genau ueber New York
  rot = findP(fxGet(tx, "Kugel"), ["Rotation Y"]);
  if (rot) keys(rot, [spin0, spin1], [GLOB.base + GLOB.sign * 60, GLOB.base], [[30, 30], [85, 85]]);
  setP(fxGet(tx, "Kugel"), ["Specular"], 12);
  return GLOBC = gc;
}
