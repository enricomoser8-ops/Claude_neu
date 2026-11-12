// ===================== Zusatz-Bausteine fuer den Kleopatra-Short (12.11.2026) =====================
// Neu gegenueber vox_lib.jsx: Parallax-Weltkamera (Zoom-Null + Pan-Nulls), Zeitstrahl, Stecknadel, Zaehler mit Tausenderpunkt,
// freigestellte Bueste, Pop-in, Folgen-Knopf mit Klick, Lupe mit Vergroesserung, Kreide-Koepfe.
var CX = 540, SCY = 960;

// Ebene an Eltern haengen OHNE Ausgleich (sonst rechnet AE Position/Skalierung um), danach Transform explizit setzen
function attach(l, par) {
  if (!par) return l;
  try { if (l.setParentWithJump) { l.setParentWithJump(par); return l; } } catch (e) {}
  l.parent = par; return l;
}
function place(l, par, pos, sc, rot) {
  attach(l, par);
  if (pos) l.position.setValue(pos);
  var s = sc === undefined ? 100 : sc;
  l.scale.setValue([s, s]); l.rotation.setValue(rot || 0);
  return l;
}
function wtxt(c, par, s, font, size, color, pos, just, tracking) {
  var l = txt(c, s, font, size, color, pos, just, tracking);
  return place(l, par, pos);
}
// gerade Bewegungspfade (keine Auto-Bezier-Boegen zwischen 3+ Keys)
function linPath(prop) {
  for (var i = 1; i <= prop.numKeys; i++) {
    try { prop.setSpatialTangentsAtKey(i, [0, 0, 0], [0, 0, 0]); } catch (e) { try { prop.setSpatialTangentsAtKey(i, [0, 0], [0, 0]); } catch (e2) {} }
  }
}

// ---------- Weltkamera fuer den Zeitstrahl ----------
// Zoom-Null skaliert um die Bildmitte, darunter Pan-Nulls je Tiefe (f = 1 Zeitstrahl, f < 1 Hintergrund wandert langsamer = Parallaxe).
// Weltpunkt w erscheint bei  C + (w*f - cam*f) * s  ->  Pan-Position = C - cam*f.
function worldRig(c, depths) {
  var z = c.layers.addNull(c.duration); z.name = "Kamera Zoom";
  z.anchorPoint.setValue([CX, SCY]); z.position.setValue([CX, SCY]);
  var R = { z: z, p: {}, f: {} };
  for (var i = 0; i < depths.length; i++) {
    var n = c.layers.addNull(c.duration); n.name = "Kamera Pan " + depths[i];
    attach(n, z); n.anchorPoint.setValue([0, 0]); n.position.setValue([CX, SCY]); n.scale.setValue([100, 100]);
    R.p[depths[i]] = n; R.f[depths[i]] = depths[i];
  }
  return R;
}
// cams: [[x, y], ...] Weltpunkte in der Bildmitte; gilt fuer alle Tiefen
function rigPan(R, times, cams, infl) {
  for (var d in R.p) {
    var f = R.f[d], v = [];
    for (var i = 0; i < cams.length; i++) v.push([CX - cams[i][0] * f, SCY - cams[i][1] * f]);
    if (times.length === 1) R.p[d].position.setValue(v[0]);
    else { keys(R.p[d].position, times, v, infl); linPath(R.p[d].position); }
  }
}
function rigZoom(R, times, ss, infl) {
  var v = []; for (var i = 0; i < ss.length; i++) v.push([ss[i] * 100, ss[i] * 100]);
  if (times.length === 1) R.z.scale.setValue(v[0]); else keys(R.z.scale, times, v, infl);
}

// ---------- Zeitstrahl (Welt-Einheiten: 1 px = 1 Jahr, Cheops-Pyramide bei x = 0) ----------
function WX(y) { return y + 2600; }
var X_PYR = WX(-2600), X_KLEO = WX(-69), X_MOND = WX(1969), X_HEUTE = WX(2026);
var CAMY = -220;   // Zeitstrahl liegt bei s = 1 auf y 1180
function tlGrid(c, par) {
  var l = shape(c, "Raster Hintergrund"); place(l, par, [0, 0]);
  var g = grp(l, "Raster");
  for (var x = -1600; x <= 7000; x += 160) addPath(g, line2([[x, -1700], [x, 1500]]));
  for (var y = -1700; y <= 1500; y += 160) addPath(g, line2([[-1600, y], [7000, y]]));
  stroke(g, "#D8CDB6", 2);
  l.opacity.setValue(60);
  var r = addFx(l, "ADBE Roughen Edges", "Raster rau"); if (r) { setP(r, ["Border"], 0.6); setP(r, ["Scale"], 60); }
  return l;
}
// Randblende (Runde 2): Text blendet sich aus, bevor er den sicheren Bereich verlaesst (Szene x 70..1010 = 60..1020 nach dem
// Gate Weave 102 % im Master). Kein harter Anschnitt mehr bei Kamerafahrten. Der Trockenlauf erkennt den Ausdruck am Wort EDGEFADE.
function edgeFade(l) {
  if (!l) return l;
  l.opacity.expression = "// EDGEFADE: vor dem Bildrand ausblenden\n" +
    "var r = sourceRectAtTime(time, false), y = r.top + r.height / 2;\n" +
    "var a = toComp([r.left, y])[0], b = toComp([r.left + r.width, y])[0];\n" +
    "var m = Math.min(Math.min(a, b) - 70, 1010 - Math.max(a, b));\n" +
    "value * Math.max(0, Math.min(1, m / 50));";
  return l;
}
// ruhiges Linien-Leben fuer duenne Linien, die stark verkleinert werden (Zeitstrahl): kein Roughen Edges, das fransen laesst
function lightBoil(layer) {
  var t1 = addFx(layer, "ADBE Turbulent Displace", "Linie leben");
  if (t1) { setP(t1, ["Amount"], 4); setP(t1, ["Size"], 40); exprP(t1, ["Evolution"], "posterizeTime(4); time*200"); }
  return layer;
}
// Wert eines (skalaren) Keyframe-Verlaufs wie in AE: Ease mit Geschwindigkeit 0 und Einfluss = kubische Bezier in der Zeit
function bz3(a, b, c2, d, s) { var m = 1 - s; return m * m * m * a + 3 * m * m * s * b + 3 * m * s * s * c2 + s * s * s * d; }
function keyAt(times, vals, infl, t) {
  if (t <= times[0]) return vals[0];
  var n = times.length; if (t >= times[n - 1]) return vals[n - 1];
  var i = 0; while (times[i + 1] < t) i++;
  var io = (infl instanceof Array) ? infl[i][1] : (infl || 80), ii = (infl instanceof Array) ? infl[i + 1][0] : (infl || 80);
  var u = (t - times[i]) / (times[i + 1] - times[i]), lo = 0, hi = 1;
  for (var k = 0; k < 30; k++) { var mid = (lo + hi) / 2; if (bz3(0, io / 100, 1 - ii / 100, 1, mid) < u) lo = mid; else hi = mid; }
  return vals[i] + (vals[i + 1] - vals[i]) * bz3(0, 0, 1, 1, (lo + hi) / 2);
}
// dr: Linie zeichnet sich von heute rueckwaerts (rechts -> links); dr = {t: [...], tip: [Weltpunkte der Zeichenspitze], infl} oder null (steht schon)
var TL_X0 = WX(-3100), TL_X1 = WX(2700);
function tlBase(c, par, dr) {
  var x0 = TL_X0, x1 = TL_X1;
  var ln = shape(c, "Zeitstrahl Linie"); place(ln, par, [0, 0]);
  var g = grp(ln, "Linie"); addPath(g, line2([[x1, -2], [WX(-400), 3], [x0, 0]])); stroke(g, INK, 12);
  var tk = shape(c, "Zeitstrahl Striche"); place(tk, par, [0, 0]);
  var gt = grp(tk, "Striche");
  for (var y = 2600; y >= -3000; y -= 100) { var big = (y % 500 === 0); addPath(gt, line2([[WX(y), big ? -30 : -15], [WX(y), big ? 30 : 15]])); }
  stroke(gt, INK, 7);
  if (dr) {
    var pv = [], i0;
    for (i0 = 0; i0 < dr.tip.length; i0++) pv.push((x1 - dr.tip[i0]) / (x1 - x0) * 100);
    var tr = g.addProperty("ADBE Vector Filter - Trim");
    keys(tr.property("ADBE Vector Trim End"), dr.t, pv, dr.infl);
    var tt = [], tr2 = gt.addProperty("ADBE Vector Filter - Trim");
    for (i0 = 0; i0 < dr.t.length; i0++) tt.push(dr.t[i0] + f2s(2));
    try { tr2.property("ADBE Vector Trim Type").setValue(2); } catch (eT) {}   // Einzeln: Striche nacheinander statt alle halb (das sah ausgefranst aus)
    keys(tr2.property("ADBE Vector Trim End"), tt, pv, dr.infl);
  }
  lightBoil(ln); lightBoil(tk);
  var lab = [[-2000, "2000 v. Chr."], [-1500, "1500 v. Chr."], [-1000, "1000 v. Chr."], [-500, "500 v. Chr."], [500, "500 n. Chr."], [1000, "1000 n. Chr."], [1500, "1500 n. Chr."]];
  for (var i = 0; i < lab.length; i++) {
    var tl = wtxt(c, par, lab[i][1], F_SERIF_I, 38, GREY, [WX(lab[i][0]), 84]);
    tl.name = "Jahr " + lab[i][1]; edgeFade(tl);
    if (dr) {   // erscheint, sobald die Zeichenspitze vorbei ist
      for (var f = 0; f < c.duration * FPS; f++) if (keyAt(dr.t, dr.tip, dr.infl, f / FPS) <= WX(lab[i][0]) + 60) { tl.inPoint = f / FPS + f2s(2); break; }
    }
  }
  return ln;
}
// Stecknadel: Spitze bei (wx, 0); faellt von oben ein und federt
function tlPin(c, par, name, wx, t0, color) {
  var p = shape(c, "Nadel " + name); place(p, par, [wx, 0]);
  var gn = grp(p, "Nadel"); addPath(gn, line2([[0, 0], [12, -92]])); stroke(gn, "#5E584E", 6);
  var gh = grp(p, "Kopf"); ellipseG(gh, 46, 46, 14, -108); fill(gh, color || RED); stroke(gh, INK, 3);
  var gl = grp(p, "Glanz"); ellipseG(gl, 12, 12, 6, -116); fill(gl, "#FFFFFF", 85);
  if (t0 !== null && t0 !== undefined) {
    p.inPoint = t0;
    keys(p.position, [t0, t0 + f2s(6)], [[wx, -420], [wx, 0]], [[10, 70], [5, 10]]);
    keys(p.scale, [t0 + f2s(6), t0 + f2s(9), t0 + f2s(14)], [[100, 100], [116, 86], [100, 100]], 50);
    var r = shape(c, "Einschlag " + name); place(r, par, [wx, 0]);
    var gr = grp(r); ellipseG(gr, 10, 10, 0, 0); stroke(gr, color || RED, 6);
    var root = r.property("ADBE Root Vectors Group").property(1);
    keys(root.property("ADBE Vectors Group").property("ADBE Vector Shape - Ellipse").property("ADBE Vector Ellipse Size"), [t0 + f2s(6), t0 + f2s(18)], [[10, 6], [190, 70]], [[5, 5], [80, 80]]);
    keys(r.opacity, [t0 + f2s(6), t0 + f2s(18)], [100, 0], 40);
    r.inPoint = t0 + f2s(6);
  }
  edgeBoil(p, 6);
  return p;
}
// Textmarker auf dem Zeitstrahl (Trim mit eigenen Zeiten, z. B. synchron zur Kamerafahrt)
function tlMark(c, par, name, x0, x1, t0, t1, color, infl) {
  var l = shape(c, "Textmarker " + name); place(l, par, [0, 0]);
  var g = grp(l); addPath(g, line2([[x0, 4], [x1, -2]])); stroke(g, color || YEL, 46);
  l.blendingMode = BlendingMode.MULTIPLY;
  if (t0 !== null && t0 !== undefined) {
    var tr = g.addProperty("ADBE Vector Filter - Trim");
    keys(tr.property("ADBE Vector Trim End"), [t0, t1], [0, 100], infl || 20);
  }
  var td = addFx(l, "ADBE Turbulent Displace"); if (td) { setP(td, ["Amount"], 30); setP(td, ["Size"], 2); }
  var td2 = addFx(l, "ADBE Turbulent Displace"); if (td2) { setP(td2, ["Amount"], 10); setP(td2, ["Size"], 60); }
  return l;
}

// ---------- Bilder ----------
function cutout(c, rel, x, y, h, name, bw) {
  var it = imp(rel); if (!it) return null;
  var l = c.layers.add(it); l.name = name || ("Bild " + rel.replace(/.*\//, ""));
  var s = h / it.height * 100; l.position.setValue([x, y]); l.scale.setValue([s, s]);
  if (bw !== false) { var b = addFx(l, "ADBE Black&White"); }
  var bc = addFx(l, "ADBE Brightness & Contrast 2"); if (bc) { setP(bc, ["Contrast"], 14); setP(bc, ["Brightness"], 4); }
  chroma(l, 1.5);
  var ex = addFx(l, "ADBE Exposure2"); if (ex) exprP(ex, ["Exposure"], "wiggle(24,.04)");
  var ds = addFx(l, "ADBE Drop Shadow"); if (ds) { setP(ds, ["Opacity"], 95); setP(ds, ["Distance"], 16); setP(ds, ["Softness"], 34); setP(ds, ["Direction"], 160); }
  return l;
}
// Pop-in: Skalierung 0 -> 108 -> 100 % in 9 Frames, leichte Drehung
// inPoint fuer eine Ebene UND ihre Kinder (Abzug = Rahmen + Foto als Kind)
function setIn(l, t) {
  l.inPoint = t;
  try { var c = l.containingComp; for (var i = 1; i <= c.numLayers; i++) { var x = c.layer(i); if (x.parent === l) x.inPoint = t; } } catch (e) {}
}
function sc0(l) { var v = l.scale.value; return (v && v.length && v[0] > 0) ? v[0] : 100; }
function popIn(l, t, rot) {
  var s = sc0(l);
  keys(l.scale, [t, t + f2s(5), t + f2s(9)], [[0, 0], [s * 1.08, s * 1.08], [s, s]], [[10, 10], [60, 60], [80, 80]]);
  if (rot) keys(l.rotation, [t, t + f2s(9)], [rot, 0], [[10, 10], [85, 85]]);
  setIn(l, t);
  return l;
}
// Abzug (printPhoto) in Weltkoordinaten an eine Eltern-Ebene haengen; torn = gerissener Papierrand
function wPrint(c, par, rel, wx, wy, maxW, maxH, rot, torn) {
  var fr = printPhoto(c, rel, 0, 0, maxW, maxH, 0);
  if (!fr) return null;
  place(fr, par, [wx, wy], 100, rot || 0);
  if (torn) {
    var r = addFx(fr, "ADBE Roughen Edges", "Papierriss");
    if (r) { setP(r, ["Border"], 16); setP(r, ["Edge Sharpness"], 1.4); setP(r, ["Scale"], 28); setP(r, ["Complexity"], 4); exprP(r, ["Random Seed"], "Math.floor(time*2)"); }
  }
  return fr;
}
// Drop-in eines Abzugs/Bilds: kommt von oben (versetzt), schnappt ein, Fokus-Atmen macht die Szene
function dropIn(l, t, dy, dur) {
  var p = l.position.value, s = sc0(l);
  keys(l.position, [t, t + (dur || 0.4)], [[p[0], p[1] - (dy || 160)], [p[0], p[1]]], [[10, 10], [90, 90]]);
  keys(l.scale, [t, t + (dur || 0.4)], [[s * 1.12, s * 1.12], [s, s]], [[10, 10], [85, 85]]);
  setIn(l, t);
  return l;
}
function creditKeys(c, ks, extra) {
  var a = [];
  for (var i = 0; i < ks.length; i++) if (D.credits[ks[i]]) a.push(D.credits[ks[i]]);
  if (extra) a.push(extra);
  return credit(c, a.join("  ·  "));
}

// ---------- Zahlen ----------
// Zaehler mit Tausenderpunkt und Praefix (z. B. "~2.500"), Ease wie die Kamera, 12 Bilder/s
function counterF(comp, from, to, t0, t1, font, size, color, pos, prefix) {
  var pre = prefix || "";
  var l = txt(comp, pre + fmtNum(to), font, size, color, pos);
  noteAnim(null, t1, l);
  l.property("ADBE Text Properties").property("ADBE Text Document").expression =
    "posterizeTime(12); var v = Math.round(ease(time, " + t0 + ", " + t1 + ", " + from + ", " + to + ") / 10) * 10; var s = String(v);" +
    " if (v >= 1000) s = s.substr(0, s.length - 3) + '.' + s.substr(s.length - 3); '" + pre + "' + s;";
  return l;
}
function fmtNum(n) { var s = String(n); return n >= 1000 ? s.substr(0, s.length - 3) + "." + s.substr(s.length - 3) : s; }
// Stop-Motion-Slam: 150 -> 92 -> 100 % als Hold-Keys (2 Frames je Stufe)
function slam(l, t) {
  var s = sc0(l);
  hold(l.scale, t, [s * 1.5, s * 1.5]); hold(l.scale, t + f2s(2), [s * 0.92, s * 0.92]); hold(l.scale, t + f2s(4), [s, s]);
  noteAnim(l.scale, t + f2s(4), l);
  l.inPoint = t;
  return l;
}

// ---------- Folgen-Knopf mit Mausklick (wie im Schluss von Short 41) ----------
function followBtn(c, x, y, tIn, tClick) {
  var btn = shape(c, "FIX Folgen-Knopf"), gb = grp(btn); rectG(gb, 320, 100, 0, 0, 50); var bfill = fill(gb, RED);
  btn.position.setValue([x, y]);
  keys(bfill.property("ADBE Vector Fill Color"), [tClick - f2s(1), tClick], [rgb(RED), rgb("#6B655B")], 50);   // vor addFx (Referenzen werden sonst ungueltig)
  var b1 = txt(c, "+ Folgen", F_SANS_B, 48, "#FFFFFF", [x, y + 17]); b1.name = "FIX Folgen 1";
  var b2 = txt(c, "✓ Gefolgt", F_SANS_B, 48, "#FFFFFF", [x, y + 17]); b2.name = "FIX Folgen 2";
  keys(btn.scale, [tIn, tIn + f2s(5), tIn + f2s(9)], [[0, 0], [110, 110], [100, 100]], [[10, 10], [60, 60], [80, 80]]);
  keys(b1.scale, [tIn, tIn + f2s(5), tIn + f2s(9)], [[0, 0], [110, 110], [100, 100]], [[10, 10], [60, 60], [80, 80]]);
  btn.inPoint = tIn; b1.inPoint = tIn; b1.outPoint = tClick; b2.inPoint = tClick;
  var ds = addFx(btn, "ADBE Drop Shadow"); if (ds) { setP(ds, ["Opacity"], 90); setP(ds, ["Distance"], 8); setP(ds, ["Softness"], 22); }
  var cur = shape(c, "FIX Mauszeiger"), gcu = grp(cur);
  addPath(gcu, line2([[0, 0], [0, 64], [16, 50], [28, 76], [40, 70], [28, 46], [50, 46]], true)); fill(gcu, "#FFFFFF"); stroke(gcu, INK, 4);
  cur.inPoint = tIn + f2s(3);
  keys(cur.position, [tIn + f2s(3), tClick - f2s(2)], [[x + 380, y + 330], [x + 30, y + 8]], [[10, 10], [85, 85]]);
  keys(cur.scale, [tClick - f2s(2), tClick, tClick + f2s(4)], [[100, 100], [82, 82], [100, 100]], 50);
  keys(btn.scale, [tClick - f2s(1), tClick + f2s(2), tClick + f2s(6)], [[100, 100], [93, 93], [100, 100]], 50);
  return btn;
}

// ---------- Kreide-/Bleistift-Kopf (Profil-Symbol: Kopf + Schultern) ----------
function circPath(cx, cy, r) {
  var k = 0.5523 * r;
  return { v: [[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy]], i: [[-k, 0], [0, -k], [k, 0], [0, k]], o: [[k, 0], [0, k], [-k, 0], [0, -k]], c: true };
}
function headPaths(cx, cy, r) {
  var sh = { v: [[cx - r * 1.9, cy + r * 3.0], [cx, cy + r * 1.35], [cx + r * 1.9, cy + r * 3.0]], i: [[0, 0], [-r * 1.2, 0], [0, -r * 0.9]], o: [[0, -r * 0.9], [r * 1.2, 0], [0, 0]], c: false };
  return [circPath(cx, cy, r), sh];
}
