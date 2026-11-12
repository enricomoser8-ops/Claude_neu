// ===================== Zusatz-Bausteine fuer den Weltkrieg-Short (Stadtplan, Kolonne, Europa 1914, Folgen-Knopf) =====================
// Erwartet vox_lib.jsx davor und D.shapes (gen/shapes_weltkrieg.py), D.europa (gen/europa_weltkrieg.py).
var SH = D.shapes, PL = SH.plan, EU = D.europa;
var CX = 540;

// ---------- Stadtplan Sarajevo (Precomp, einmal gebaut, mehrfach benutzt) ----------
var PLANC = null;
function planComp() {
  if (PLANC) return PLANC;
  var c = mkComp("Stadtplan Sarajevo 1914 (Skizze)", PL.w, PL.h, D.end, fPre);
  var bl = shape(c, "Haeuserbloecke"), gb = grp(bl, "Bloecke");
  for (var i = 0; i < PL.blocks.length; i++) addPath(gb, PL.blocks[i]);
  fill(gb, "#ECE4D2"); stroke(gb, "#B3A88F", 2.5);
  edgeBoil(bl, 2.5);
  var wa = shape(c, "Fluss"), gw = grp(wa, "Wasser"); addPath(gw, PL.water); fill(gw, "#D3E2E3");
  var gw2 = grp(wa, "Wellen");
  for (var x = 60; x < PL.w; x += 230) { var y = ry(x) + ((x / 230) % 2 ? -14 : 14); addPath(gw2, line2([[x, y], [x + 26, y - 7], [x + 52, y], [x + 78, y - 7]])); }
  stroke(gw2, "#9DB7BA", 3);
  var st = shape(c, "Strassen und Ufer"), gs = grp(st, "Linien");
  addPath(gs, PL.bank_n); addPath(gs, PL.bank_s); addPath(gs, PL.road_n); addPath(gs, PL.road_n2); addPath(gs, PL.road_s);
  for (var b = 0; b < PL.bridges.length; b++) addPath(gs, PL.bridges[b]);
  for (var s2 = 0; s2 < PL.side.length; s2++) addPath(gs, PL.side[s2]);
  stroke(gs, INK, 5);
  edgeBoil(st, 5);
  // Runde 2: Ortsnamen NICHT mehr im Plan (wurden mit dem Plan skaliert und an den Raendern abgeschnitten) -> planLabels() je Szene
  // Rathaus (Osten) und Krankenhaus-Gebaeude (Westen, das rote Kreuz kommt in der Szene)
  bldg(c, "Rathaus", SH.rathaus, PL.x_rathaus, ry(PL.x_rathaus) - 150, 1.0);
  return PLANC = c;
}
function ry(x) { var k = Math.max(0, Math.min(PL.w, Math.round(x / 10) * 10)); return PL.ry[String(k)]; }
function qy(x) { return ry(x) - 95; }                 // Kai-Mitte (Fahrlinie)
// Runde 2: um den eigenen Fusspunkt gezeichnet und per Position platziert (vorher absolute Koordinaten mit Anker 0/0:
// popIn skalierte das Krankenhaus aus der linken oberen Bildecke heraus)
function bldg(c, name, B, x, y, s) {
  var l = shape(c, name), g = grp(l, "Haus"); addPath(g, B.base, 0, 0, s); addPath(g, B.top, 0, 0, s); fill(g, "#F3EDE0"); stroke(g, INK, 4);
  var g2 = grp(l, "Fenster"); for (var i = 0; i < B.wins.length; i++) addPath(g2, B.wins[i], 0, 0, s); stroke(g2, INK, 3);
  l.position.setValue([x, y]);
  edgeBoil(l, 4);
  return l;
}
// Plan in eine Szene legen: Planpunkt (fx, fy) landet bei Bildschirm (sx, sy), Massstab s
function planAt(c, fx, fy, sx, sy, s) {
  var L = addItem(c, planComp(), sx - (fx - PL.w / 2) * s, sy - (fy - PL.h / 2) * s, s * 100);
  L.name = "Stadtplan";
  return { x: sx - (fx - PL.w / 2) * s, y: sy - (fy - PL.h / 2) * s, s: s, L: L };
}
// Ortsnamen je Szene (Runde 2): feste Bildschirmgroesse, in x so verschoben, dass sie auch mit Kamera-Zoom Z um ax
// in 60..1020 bleiben. Liegt der Ort selbst zu weit draussen (Lateinerbruecke), entfaellt das Schild.
// which: Liste der Namen (Standard beide). Muss VOR camRig kommen, damit die Kamera die Schilder mitnimmt.
var PLAN_LABELS = { "Appel-Kai": { p: [1500, -150], free: true }, "Lateinerbrücke": { p: [820, 108], free: false } };
// at (Runde 4): {Name: Bildschirm-x} erzwingt die Lage eines frei verschiebbaren Schilds (z. B. nicht unter der Silhouette)
function planLabels(c, P, ax, Z, which, size, at) {
  which = which || ["Appel-Kai", "Lateinerbrücke"]; Z = Z || 1.2; ax = ax === undefined ? CX : ax;
  var out = [];
  for (var i = 0; i < which.length; i++) {
    var D0 = PLAN_LABELS[which[i]], px = D0.p[0], py = ry(px) + D0.p[1], q = pp(P, [px, py]);
    var t = txt(c, which[i], F_SERIF_I, size || 40, "#6E675B", q); t.name = "Ort " + which[i];
    var r = t.sourceRectAtTime(0, false), hw = r.width / 2 + 6;
    var want = (at && at[which[i]] !== undefined && D0.free) ? at[which[i]] : q[0];
    var lo = ax - (ax - 72) / Z + hw, hi = ax + (1008 - ax) / Z - hw, x = Math.max(lo, Math.min(hi, want));
    if (lo > hi || (!D0.free && Math.abs(x - q[0]) > 40) || q[1] < 120 || q[1] > 1300) { t.remove(); continue; }
    t.position.setValue([x, q[1]]); out.push(t);
  }
  return out;
}
function pp(P, p) { return [(p[0] - PL.w / 2) * P.s + P.x, (p[1] - PL.h / 2) * P.s + P.y]; }
function ppl(P, pts) { var o = []; for (var i = 0; i < pts.length; i++) o.push(pp(P, pts[i])); return o; }
// Kai-Strecke von xa nach xb (Planpunkte)
function quay(xa, xb, step) {
  var o = [], n = Math.max(2, Math.ceil(Math.abs(xb - xa) / (step || 40)));
  for (var i = 0; i <= n; i++) { var x = xa + (xb - xa) * i / n; o.push([x, qy(x)]); }
  return o;
}
// Strecke in Bildschirmkoordinaten abtasten
function plen(pts) { var L = 0; for (var i = 1; i < pts.length; i++) L += Math.sqrt(Math.pow(pts[i][0] - pts[i - 1][0], 2) + Math.pow(pts[i][1] - pts[i - 1][1], 2)); return L; }
function pAt(pts, d) {
  if (d <= 0) return { p: pts[0], a: Math.atan2(pts[1][1] - pts[0][1], pts[1][0] - pts[0][0]) };
  for (var i = 1; i < pts.length; i++) {
    var dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1], l = Math.sqrt(dx * dx + dy * dy);
    if (d <= l || i === pts.length - 1) { var f = l > 0 ? Math.min(1, d / l) : 0; return { p: [pts[i - 1][0] + dx * f, pts[i - 1][1] + dy * f], a: Math.atan2(dy, dx) }; }
    d -= l;
  }
  return { p: pts[pts.length - 1], a: 0 };
}
// Wagen faehrt eine Strecke ab (Hold-Keys mit 12 fps wie pathKeys, Rotation folgt der Richtung).
// back: Abstand hinter der Spitze (Kolonne), mode: "inout" | "out" (schnell los, sanft halten) | "lin"
// d0: Startabstand der Spitze auf der Strecke (Kolonne steht schon irgendwo); ohne d0 starten alle am Anfang
function drive(layer, pts, t0, t1, back, mode, reverse, d0) {
  var L = plen(pts), n = Math.max(2, Math.round((t1 - t0) * 12));
  for (var i = 0; i <= n; i++) {
    var x = i / n, u = mode === "lin" ? x : (mode === "out" ? 1 - Math.pow(1 - x, 2.2) : x * x * (3 - 2 * x));
    var d = d0 === undefined ? Math.max(0, u * L - (back || 0)) : (d0 - (back || 0)) + u * (L - d0);
    var q = pAt(pts, d), t = t0 + (t1 - t0) * x;
    hold(layer.position, t, q.p);
    hold(layer.rotation, t, q.a * 180 / Math.PI + (reverse ? 180 : 0));
  }
  noteAnim(layer.position, t1, layer);
}
function place(layer, pts, back) { var q = pAt(pts, plen(pts) - (back || 0)); layer.position.setValue(q.p); layer.rotation.setValue(q.a * 180 / Math.PI); return q; }
// Wagen-Symbol von oben (Fahrtrichtung +x). main: Thronfolger-Wagen (gelb)
function carIcon(c, name, main, sc) {
  var C = SH.car, l = shape(c, name), g = grp(l, "Karosserie");
  addPath(g, C.body, 0, 0, sc || 1); fill(g, main ? YEL : "#F4EEE1"); stroke(g, INK, 4);
  var g2 = grp(l, "Linien"); addPath(g2, C.hood, 0, 0, sc || 1); addPath(g2, C.seats, 0, 0, sc || 1); stroke(g2, INK, 3);
  edgeBoil(l, 4);
  return l;
}
// gezeichneter Pfeil (Pencil) entlang einer Strecke, Spitze am Ende
function arrowPath(c, name, pts, color, w, t0, dur, smooth) {
  var a = pts[pts.length - 1], b = pts[pts.length - 2], ang = Math.atan2(a[1] - b[1], a[0] - b[0]), L = 34;
  var head = line2([[a[0] - L * Math.cos(ang - 0.5), a[1] - L * Math.sin(ang - 0.5)], [a[0], a[1]], [a[0] - L * Math.cos(ang + 0.5), a[1] - L * Math.sin(ang + 0.5)]]);
  var body = smooth ? crv(pts) : line2(pts);
  var l = pencil(c, name, [body], color, w || 8, t0, dur);
  var h = pencil(c, name + " Spitze", [head], color, w || 8, t0 === null ? null : t0 + (dur || f2s(24)) - f2s(4), f2s(4));
  if (t0 !== null && t0 !== undefined) h.inPoint = t0 + (dur || f2s(24)) - f2s(4);
  return [l, h];
}
// Catmull-Rom -> Bezier (wie cr() in Python)
function crv(pts, closed) {
  var n = pts.length, ii = [], oo = [];
  for (var k = 0; k < n; k++) {
    var p0 = closed ? pts[(k - 1 + n) % n] : pts[Math.max(0, k - 1)], p2 = closed ? pts[(k + 1) % n] : pts[Math.min(n - 1, k + 1)];
    var tx = (p2[0] - p0[0]) / 6, ty = (p2[1] - p0[1]) / 6;
    if (!closed && (k === 0 || k === n - 1)) { tx *= 0.5; ty *= 0.5; }
    ii.push([-tx, -ty]); oo.push([tx, ty]);
  }
  return { v: pts, i: ii, o: oo, c: !!closed };
}
// Pop-in: Scale 0 -> 108 -> 100 (Einschnappen mit Nachfedern)
function popIn(l, t, s) {
  s = s || 100; l.inPoint = Math.max(0, t - 0.01);
  keys(l.scale, [t, t + f2s(5), t + f2s(9)], [[0, 0], [s * 1.08, s * 1.08], [s, s]], [[10, 10], [70, 70], [60, 60]]);
}
// Kamera-Rucken (Erschuetterung) auf einer Ebene, als Hold-Keys gebacken
function shake(l, t, dur, amp) {
  var p0 = l.position.value, n = Math.round(dur * 24), r = 7;
  for (var i = 0; i <= n; i++) {
    r = (r * 9301 + 49297) % 233280; var rx = r / 233280 - 0.5; r = (r * 9301 + 49297) % 233280; var rz = r / 233280 - 0.5;
    var f = i === n ? 0 : amp * (1 - i / n);
    hold(l.position, t + i / 24, [p0[0] + rx * 2 * f, p0[1] + rz * 2 * f]);
  }
}
// Weissblitz (Exposure-Blitz): 2 Frames voll, 3 Frames weg
function whiteFlash(c, t, name) {
  var w = solid(c, "FIX " + (name || "Blitz"), "#FFFFFF"); w.inPoint = t; w.outPoint = t + f2s(15);
  keys(w.opacity, [t, t + f2s(2), t + f2s(5)], [100, 85, 0], 50);
  return w;
}
// rotes Kreuz (Sanitaet) als Symbol
function redCross(c, name, x, y, t, sc) {
  var l = shape(c, name), g = grp(l); addPath(g, SH.cross); fill(g, "#FFFFFF"); stroke(g, RED, 4);
  var g2 = grp(l); addPath(g2, SH.cross, 0, 0, 0.62); fill(g2, RED);
  l.position.setValue([x, y]); sc = sc || 1;
  if (t !== null && t !== undefined) popIn(l, t, sc * 100); else l.scale.setValue([sc * 100, sc * 100]);
  return l;
}
// Runde 3: weicher dunkler Schatten unter der Untertitel-Zone (y ~1310-1460), damit die weissen Untertitel auf hellen
// Plan-/Kartenflaechen lesbar sind. FIX: haengt nicht an der Kamera.
// Runde 4: kein Streifen mehr, sondern eine sanfte Vignette von unten (Verlauf weiss -> dunkel, Multiplizieren, keine Kanten)
function subShade(c, op) {
  var l = solid(c, "FIX UT-Schatten", "#FFFFFF");
  addFx(l, "ADBE Ramp", "UT Verlauf");
  var r = fxGet(l, "UT Verlauf");
  if (r) {
    setP(r, ["Ramp Shape"], 1);
    setP(r, ["Start of Ramp"], [c.width / 2, 1150]); setP(r, ["Start Color"], [1, 1, 1]);
    setP(r, ["End of Ramp"], [c.width / 2, 1760]); setP(r, ["End Color"], rgb("#4A443C"));
  }
  l.blendingMode = BlendingMode.MULTIPLY;
  l.opacity.setValue(op || 40);
  return l;
}
// Bombe (schwarze Kugel mit Lunte)
function bombIcon(c, name) {
  var l = shape(c, name), g = grp(l, "Kugel"); ellipseG(g, SH.bomb.r * 2, SH.bomb.r * 2, 0, 0); fill(g, INK);
  var g2 = grp(l, "Lunte"); addPath(g2, SH.bomb.fuse); stroke(g2, INK, 4);
  var g3 = grp(l, "Funke"); ellipseG(g3, 12, 12, SH.bomb.r * 1.4, -SH.bomb.r * 1.45); fill(g3, "#E8A93A");
  edgeBoil(l, 4);
  return l;
}
// gesichtslose Silhouette (nur Umriss, kein Gesicht)
function silhouetteIcon(c, name, x, y, sc, color) {
  var S = SH.sil, l = shape(c, name), g = grp(l, "Koerper"); addPath(g, S.body, 0, 0, sc); fill(g, color || "#2A2622");
  var g2 = grp(l, "Kopf"); ellipseG(g2, S.head * 2 * sc, S.head * 2 * sc, 0, S.headY * sc); fill(g2, color || "#2A2622");
  l.position.setValue([x, y]);
  edgeBoil(l, 3);
  return l;
}
// Folgen-Knopf mit Mauszeiger, der draufklickt ("+ Folgen" -> "Gefolgt"), Mitte- und Schluss-Aufruf
function followButton(c, x, y, tIn, tc) {
  var btn = shape(c, "Folgen-Knopf"), gb = grp(btn); rectG(gb, 330, 100, 0, 0, 50); var bfill = fill(gb, RED);
  btn.position.setValue([x, y]); popIn(btn, tIn);
  var ds = addFx(btn, "ADBE Drop Shadow"); if (ds) { setP(ds, ["Opacity"], 110); setP(ds, ["Distance"], 10); setP(ds, ["Softness"], 24); }
  var b1 = txt(c, "+ Folgen", F_SANS_B, 48, "#FFFFFF", [0, 0]); b1.parent = btn; b1.position.setValue([0, 17]); b1.inPoint = tIn; b1.outPoint = tc;
  var b2 = txt(c, "✓ Gefolgt", F_SANS_B, 48, "#FFFFFF", [0, 0]); b2.parent = btn; b2.position.setValue([0, 17]); b2.inPoint = tc;
  keys(bfill.property("ADBE Vector Fill Color"), [tc - f2s(1), tc], [rgb(RED), rgb("#6B655B")], 50);
  var cur = shape(c, "Mauszeiger"), gcu = grp(cur);
  addPath(gcu, line2([[0, 0], [0, 64], [16, 50], [28, 76], [40, 70], [28, 46], [50, 46]], true)); fill(gcu, "#FFFFFF"); stroke(gcu, INK, 4);
  cur.inPoint = tIn + f2s(3);
  keys(cur.position, [tIn + f2s(3), tc - f2s(2)], [[x + 330, y + 300], [x + 30, y + 8]], [[10, 10], [85, 85]]);
  keys(cur.scale, [tc - f2s(2), tc, tc + f2s(4)], [[100, 100], [82, 82], [100, 100]], 50);
  return btn;
}

// ---------- Europa 1914 (Precomp; Gruppen einzeln, damit sie sich einfaerben lassen) ----------
var EUC = null, EU_COL = { AH: "#B4572E", DE: "#8E3B32", SRB: "#3F6E9E", RU: "#4F6F8F", FR: "#5B7FA6", BE: "#6E8DB2", UK: "#6A88A8", MNE: "#46729F" };
function europeComp() {
  if (EUC) return EUC;
  var c = mkComp("Europa 1914 (Skizze, Natural Earth)", EU.w, EU.h, D.end, fPre);
  var land = shape(c, "Land"), gl = grp(land, "Kueste");
  for (var i = 0; i < EU.coast.length; i++) addPath(gl, line2(EU.coast[i], true));
  fill(gl, "#ECE2CB"); stroke(gl, INK, 3.5);
  edgeBoil(land, 3.5);
  var bo = shape(c, "Grenzen 1914"), gbo = grp(bo, "Grenzen");
  for (var k in EU.groups) for (var r = 0; r < EU.groups[k].length; r++) addPath(gbo, line2(EU.groups[k][r], true));
  stroke(gbo, "#A89C84", 2.2, 8, 6);
  return EUC = c;
}
// Faerbung einer Gruppe als eigene Ebene in der Szene (ueber der Karte), gleiche Abbildung wie die Karte
// fade (Runde 4): weiche Maske, die die geraden Schnittkanten an Karten-Oberkante/-rechts ausblendet (Russland)
function euFill(c, k, E, t, color, fade) {
  var l = shape(c, "Land " + k), g = grp(l, k);
  for (var r = 0; r < EU.groups[k].length; r++) {
    var R = EU.groups[k][r], q = [];
    for (var i = 0; i < R.length; i++) q.push(eup(E, R[i]));
    addPath(g, line2(q, true));
  }
  fill(g, color || EU_COL[k]); stroke(g, INK, 2.5 * E.s);
  l.blendingMode = BlendingMode.MULTIPLY; l.inPoint = t;
  if (fade) {
    var a0 = eup(E, [0, 0]), a1 = eup(E, [EU.w, EU.h]);
    var mk = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
    mk.property("ADBE Mask Shape").setValue(mkShape(line2([[a0[0] - 600, a0[1] + 70], [a1[0] - 70, a0[1] + 70], [a1[0] - 70, a1[1] + 600], [a0[0] - 600, a1[1] + 600]], true)));
    mk.property("ADBE Mask Feather").setValue([140, 140]);
  }
  keys(l.opacity, [t, t + f2s(4)], [0, 88], 40);
  return l;
}
function euAt(c, fx, fy, sx, sy, s) {
  var L = addItem(c, europeComp(), sx - (fx - EU.w / 2) * s, sy - (fy - EU.h / 2) * s, s * 100); L.name = "Europa 1914";
  return { x: sx - (fx - EU.w / 2) * s, y: sy - (fy - EU.h / 2) * s, s: s, L: L };
}
function eup(E, p) { return [(p[0] - EU.w / 2) * E.s + E.x, (p[1] - EU.h / 2) * E.s + E.y]; }
// Bildschirmpunkt eines relativen Bildpunkts (rx, ry in 0..1) in einem Abzug wie printPhoto ihn legt (ohne Drehung)
function photoXY(rel, cx, cy, maxW, maxH, rx, ry0) {
  var it = imp(rel); if (!it) return [cx, cy, maxW, maxH];
  var s = Math.min(maxW / it.width, maxH / it.height), w = Math.round(it.width * s), h = Math.round(it.height * s);
  return [cx - w / 2 + rx * w, cy - h / 2 + ry0 * h, w, h];
}
// Seite (Vollbild-Precomp) mit Foto-Abzug, fuer Umblaettern
function photoPage(name, rel, cx, cy, maxW, maxH, rot, dur) {
  var pc = mkComp(name, W, H, dur, fPre);
  paperBase(pc);
  printPhoto(pc, rel, cx, cy, maxW, maxH, rot, 0);
  return pc;
}
