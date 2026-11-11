// ===================== Szenen: Short zur Folge 41 "Der Arzt, der Einsteins Gehirn behielt" =====================
// Jede Szene: eigene Comp 1080x1920, Papiergrund, Inhalt, Kamera-Null (Punch-Cut), Vox-Sauce passend zum Material.
// k = Zeiten der Schluesselwoerter relativ zum Szenenanfang (aus gen_short41.py).
var SH = D.shapes, US = D.usa;
var B = {};
var CX = 540;

function brainDraw(c, name, br, x, y, s, t0, color, width, gyriOnly) {
  var out = pencil(c, name + " Umriss", [br.outline], color || INK, width || 6, t0, f2s(18), x, y, s);
  var gy = pencil(c, name + " Windungen", br.gyri, color || INK, (width || 6) * 0.6, t0 === null ? null : t0 + f2s(6), f2s(20), x, y, s);
  var ce = pencil(c, name + " Kleinhirn", [br.cereb].concat(br.stem), color || INK, width || 6, t0 === null ? null : t0 + f2s(10), f2s(14), x, y, s);
  return [out, gy, ce];
}
function jarDraw(c, name, j, x, y, s, t0, color) {
  var body = shape(c, name), g = grp(body, "Glas");
  addPath(g, j.body, x, y, s); addPath(g, j.lid, x, y, s);
  stroke(g, color || INK, 6);
  if (t0 !== null && t0 !== undefined) trimOn(g, t0, t0 + f2s(20));
  var g2 = grp(body, "Glanz"); addPath(g2, j.shine, x, y, s); stroke(g2, color || INK, 3);
  var gl = grp(body, "Fluessigkeit"); addPath(gl, line2([[j.body.v[0][0] + 6, j.body.v[0][1] + 60], [j.body.v[5][0] - 6, j.body.v[5][1] + 60], [j.body.v[4][0] - 4, j.body.v[4][1]], [j.body.v[3][0], j.body.v[3][1] - 4], [j.body.v[2][0], j.body.v[2][1] - 4], [j.body.v[1][0] + 4, j.body.v[1][1]]], true), x, y, s);
  fill(gl, "#CFE0D4", 45);
  edgeBoil(body, 6);
  return body;
}
// Kartenprecomp (einmal gebaut, zweimal benutzt)
var MAPC = null;
function mapComp() {
  if (MAPC) return MAPC;
  var c = mkComp("USA Karte (Census, gemeinfrei)", US.w + 100, US.h + 100, D.end, fPre);
  var off = 50;
  var land = shape(c, "Staaten"), g = grp(land, "Flaechen");
  for (var id in US.states) { if (id === "20") continue; var rr = US.states[id].rings; for (var r = 0; r < rr.length; r++) addPath(g, line2(rr[r], true), off, off); }
  fill(g, "#ECE2CB"); stroke(g, "#A89C84", 2.2, 8, 5);
  var ks = shape(c, "Kansas"), gk = grp(ks, "Kansas");
  for (var r2 = 0; r2 < US.states["20"].rings.length; r2++) addPath(gk, line2(US.states["20"].rings[r2], true), off, off);
  fill(gk, "#ECE2CB"); stroke(gk, "#A89C84", 2.2, 8, 5);
  var ol = shape(c, "Aussengrenze"), go = grp(ol);
  for (var a = 0; a < US.outer.length; a++) addPath(go, line2(US.outer[a], false), off, off);
  stroke(go, INK, 5);
  edgeBoil(ol, 5);
  return MAPC = c;
}
function mapPt(p, mx, my, ms) { return [(p[0] + 50 - (US.w + 100) / 2) * ms + mx, (p[1] + 50 - (US.h + 100) / 2) * ms + my]; }

// ---------- 1 Hook: Foto + Glas mit Gehirn ----------
B.hook = function (c, k) {
  paperBase(c);
  printPhoto(c, "archiv/einstein-1947-turner.jpg", CX, 560, 700, 760, -2.5, 0);
  jarDraw(c, "Glas", SH.jar, CX + 40, 1135, 0.5, k.gehirn - f2s(4));
  brainDraw(c, "Gehirn", SH.brain, CX + 40, 1150, 0.4, k.gehirn);
  credit(c, D.credits["einstein-1947-turner"]);
  var cam = camRig(c, CX, 900, { punchIn: false, s0: 100, s1: 106 });
  punchAt(cam, k.gehirn, 1.06);
  lensLeak(c, 10);
  voxSauce(c, "archiv");
};
// ---------- 2 vierzig Jahre ----------
B.jahre = function (c, k) {
  paperBase(c);
  var n = odometer(c, "40", F_SERIF_B, 520, INK, [CX, 980], k.vierzig - f2s(6), f2s(18));
  yellowPop(n, k.vierzig + f2s(10));
  var j = txt(c, "JAHRE", F_SANS_B, 120, INK, [CX, 1150], ParagraphJustification.CENTER_JUSTIFY, 220);
  j.inPoint = k.jahre - f2s(2);
  var y = txt(c, "1955 – 1998", F_SERIF_I, 64, GREY, [CX, 1250]);
  typeOn(y, k.jahre + f2s(2), 30);
  pencil(c, "Unterstrich", [line2([[CX - 260, 1180], [CX - 80, 1186], [CX + 120, 1178], [CX + 270, 1184]])], RED, 7, k.jahre + f2s(4), f2s(12));
  focusHunt(c, 0);
  camRig(c, CX, 1000, { punchIn: 122, s0: 100, s1: 104 });
  voxSauce(c, "grafik");
};
// ---------- 3 Zeitung 1955 ----------
B.zeitung = function (c, k) {
  paperBase(c, true);
  var pc = mkComp("Zeitung 1955", 940, 1340, c.duration, fPre);
  var pg = solid(pc, "Papier Zeitung", "#F2EBDA");
  var tx = imp("tex/paper338.jpg"); if (tx) { var tl = cover(pc, tx, 1.0); tl.blendingMode = BlendingMode.MULTIPLY; tl.opacity.setValue(70); }
  txt(pc, "NACHRICHTEN", F_SERIF_B, 92, INK, [470, 120], ParagraphJustification.CENTER_JUSTIFY, 80);
  var r1 = shape(pc, "Linien"), gr = grp(r1); addPath(gr, line2([[40, 160], [900, 160]])); addPath(gr, line2([[40, 214], [900, 214]])); stroke(gr, INK, 3);
  txt(pc, "Dienstag, 19. April 1955", F_SERIF_I, 30, INK, [470, 198]);
  var head = txt(pc, "Albert Einstein\rist tot", F_SERIF_B, 104, INK, [470, 330]);
  var hd = head.property("ADBE Text Properties").property("ADBE Text Document"), hv = hd.value; hv.autoLeading = false; hv.leading = 110; hd.setValue(hv);
  var it = imp("archiv/einstein-1945-loc.jpg");
  if (it) { var ph = addItem(pc, it, 260, 760, 380 / it.width * 100); var bw = addFx(ph, "ADBE Black&White"); var hs = addFx(ph, "ADBE Brightness & Contrast 2"); if (hs) setP(hs, ["Contrast"], 25); ph.blendingMode = BlendingMode.MULTIPLY; }
  var body = ["Der berühmteste Forscher", "der Welt starb in der Nacht", "im Krankenhaus von", "Princeton. Er wurde", "76 Jahre alt.", "", "Sein Wunsch: Er wollte", "verbrannt werden, ohne", "Grab, damit niemand zu", "ihm pilgert."];
  for (var i = 0; i < body.length; i++) if (body[i]) txt(pc, body[i], F_SERIF, 30, "#2A2723", [480, 560 + i * 44], ParagraphJustification.LEFT_JUSTIFY);
  for (var b2 = 0; b2 < 9; b2++) { var bl = shape(pc, "Spalte " + b2), gb = grp(bl); rectG(gb, 860 - (b2 % 3) * 40, 14, 470, 1080 + b2 * 30); fill(gb, "#BDB4A2"); }
  var hl1 = highlighter(pc, 470, 900, 820 - 9, k.verbrannt - f2s(3));
  var hl2 = highlighter(pc, 470, 850, 864 - 9, k.verbrannt + f2s(9));
  voxSauce(pc, "archiv", { vig: 18 });
  var L = addItem(c, pc, CX, 860, 100);
  L.rotation.setValue(-2);
  keys(L.position, [0, 0.9], [[CX + 60, 1000], [CX, 860]], [[10, 10], [90, 90]]);
  sourceBar(c, "Princeton, USA", "18. April 1955", k.stirbt, 300);
  focusHunt(c, 0);
  var cam = camRig(c, CX, 860, { punchIn: 116, s0: 100, s1: 110, dy: -40 });
  punchAt(cam, k.verbrannt - f2s(4), 1.1);
  credit(c, D.credits["einstein-1945-loc"]);
  voxSauce(c, "grafik");
};
// ---------- 4 Gehirn heraus, ohne zu fragen (dunkel, Kreide) ----------
B.heraus = function (c, k) {
  paperBase(c, true);
  brainDraw(c, "Gehirn", SH.brain, CX, 820, 1.25, k.gehirn - f2s(6), "#F1ECE0", 7);
  rings(c, CX, 820, k.heraus, 3, "#F1ECE0", 1100);
  var q = txt(c, "Familie gefragt?", F_SERIF_BI, 76, "#F1ECE0", [CX - 60, 1260]);
  q.inPoint = k.familie - f2s(4); jitter(q, 1.2);
  var bx = shape(c, "Kaestchen"), gb = grp(bx); rectG(gb, 70, 70, CX + 330, 1236); stroke(gb, "#F1ECE0", 6);
  bx.inPoint = k.familie - f2s(4); edgeBoil(bx, 6);
  var circ = [];
  for (var a = 0; a <= 26; a++) { var an = -0.5 + a / 26 * Math.PI * 2.25; circ.push([CX + 330 + Math.cos(an) * (80 + a * 0.8), 1236 + Math.sin(an) * (70 + a * 0.6)]); }
  pencil(c, "Kreis rot", [line2(circ)], "#E2463A", 7, k.fragen - f2s(4), f2s(14));
  var cam = camRig(c, CX, 900, { punchIn: 120, s0: 100, s1: 104 });
  punchAt(cam, k.heraus, 1.07);
  voxSauce(c, "grafik");
};
// ---------- 5 Lupe: warum so schlau? ----------
B.lupe = function (c, k) {
  paperBase(c);
  brainDraw(c, "Gehirn", SH.brain, CX, 860, 1.2, null);
  var lp = shape(c, "Lupe"), g = grp(lp); ellipseG(g, 300, 300, 0, 0); stroke(g, INK, 12);
  var g2 = grp(lp); addPath(g2, line2([[106, 106], [230, 230]])); stroke(g2, INK, 26);
  var g3 = grp(lp); ellipseG(g3, 284, 284, 0, 0); fill(g3, "#FFFFFF", 22);
  lp.moveToBeginning(); lp.anchorPoint.setValue([0, 0]);
  keys(lp.position, [0, k.warum, k.schlau], [[CX - 380, 700], [CX + 120, 760], [CX - 120, 900]], [[10, 10], [80, 80], [90, 90]]);
  edgeBoil(lp, 12);
  focalBlur(c, 0, k.schlau, [CX - 380, 700], [CX - 120, 900], 22);
  var qm = txt(c, "?", F_SERIF_BI, 360, INK, [CX + 330, 560]);
  qm.inPoint = k.schlau - f2s(2); yellowPop(qm, k.schlau - f2s(2));
  camRig(c, CX, 860, { punchIn: 116, s0: 100, s1: 105, dx: 0, dy: 0 });
  voxSauce(c, "grafik");
};
// ---------- 6 240 Stuecke, Glaeser ----------
B.stuecke = function (c, k) {
  paperBase(c);
  var br = brainDraw(c, "Gehirn", SH.brain, CX, 880, 1.2, null);
  var cl = shape(c, "Schnitte"), g = grp(cl);
  for (var i = 0; i < SH.brain.cuts.length; i++) addPath(g, SH.brain.cuts[i], CX, 880, 1.2);
  stroke(g, RED, 5, 14, 10);
  var tr = g.addProperty("ADBE Vector Filter - Trim");
  try { tr.property("ADBE Vector Trim Type").setValue(1); } catch (e) {}
  keys(tr.property("ADBE Vector Trim End"), [k.schneidet, k.schneidet + 0.9], [0, 100], 30);
  edgeBoil(cl, 5);
  var n = counter(c, 0, 240, k.zahl - f2s(2), k.zahl + 1.0, F_SERIF_B, 220, RED, [CX, 450]);
  n.inPoint = k.zahl - f2s(2);
  var st = txt(c, "Stücke", F_SERIF_BI, 90, INK, [CX, 560]); typeOn(st, k.zahl + 0.4, 24);
  // harter Schnitt in der Szene: Glaeser
  var tg = k.glaeser - f2s(4);
  for (var b = 0; b < br.length; b++) br[b].outPoint = tg;
  cl.outPoint = tg; n.outPoint = tg; st.outPoint = tg;
  var j1 = jarDraw(c, "Glas 1", SH.jarS, CX - 200, 900, 1.0, tg);
  var j2 = jarDraw(c, "Glas 2", SH.jarS, CX + 200, 900, 1.0, tg + f2s(5));
  j1.inPoint = tg; j2.inPoint = tg;
  for (var q = 0; q < 14; q++) {
    var bb = shape(c, "Stueck " + q), gq = grp(bb), jx = (q < 7 ? CX - 200 : CX + 200) + ((q % 7) % 3 - 1) * 60, jy = 950 - Math.floor((q % 7) / 3) * 55;
    rectG(gq, 46, 34, jx, jy, 6); fill(gq, "#E9C9BE"); stroke(gq, INK, 3);
    bb.inPoint = tg + f2s(8 + q);
  }
  focusHunt(c, tg);
  var cam = camRig(c, CX, 880, { punchIn: 118, s0: 100, s1: 106 });
  punchAt(cam, tg, 1.08);
  voxSauce(c, "grafik");
};
// ---------- 7 Stelle verloren, Gehirn behalten ----------
B.stelle = function (c, k) {
  paperBase(c);
  var tp = k.gehirn - f2s(4);
  jarDraw(c, "Glas gross", SH.jar, CX, 880, 0.75, null);
  brainDraw(c, "Gehirn", SH.brain, CX, 900, 0.62, null);
  var lc = mkComp("Brief 1960", 820, 1100, c.duration, fPre);
  solid(lc, "Briefpapier", "#FBF7EE");
  var tx = imp("tex/paper300.jpg"); if (tx) { var tl = cover(lc, tx, 1.0); tl.blendingMode = BlendingMode.MULTIPLY; tl.opacity.setValue(60); }
  txt(lc, "KRANKENHAUS", F_SERIF_B, 54, INK, [410, 130], ParagraphJustification.CENTER_JUSTIFY, 120);
  txt(lc, "Princeton, 1960", F_SERIF_I, 34, INK, [410, 190]);
  var kt = txt(lc, "Kündigung", F_MONO, 84, INK, [410, 360]);
  for (var i = 0; i < 9; i++) { var bl = shape(lc, "Zeile " + i), gb = grp(bl); rectG(gb, 640 - (i % 4) * 70, 16, 410 - (i % 4) * 35, 470 + i * 52); fill(gb, "#BDB4A2"); }
  var nt = txt(lc, "nachgestellt", F_SERIF_I, 24, GREY, [700, 1060]);
  var L = addItem(c, lc, CX, 880, 100); L.rotation.setValue(1.5);
  keys(L.position, [0, 0.8], [[CX, 1200], [CX, 880]], [[10, 10], [90, 90]]);
  pageTurn(L, tp, 0.75, 820, 1100);
  var ds = addFx(L, "ADBE Drop Shadow"); if (ds) { setP(ds, ["Opacity"], 90); setP(ds, ["Distance"], 14); setP(ds, ["Softness"], 30); }
  var circ = [];
  for (var a = 0; a <= 26; a++) { var an = -0.4 + a / 26 * Math.PI * 2.2; circ.push([CX + Math.cos(an) * (360 + a), 880 + Math.sin(an) * (280 + a * 0.8)]); }
  pencil(c, "Kreis", [line2(circ)], RED, 8, k.behaelt - f2s(3), f2s(14));
  focusHunt(c, 0, true);
  var cam = camRig(c, CX, 880, { punchIn: 118, s0: 100, s1: 106 });
  punchAt(cam, k.behaelt - f2s(3), 1.08);
  voxSauce(c, "grafik");
};
// ---------- 8 Kansas 1978 ----------
B.kansas = function (c, k) {
  paperBase(c);
  var mc = mapComp(), ms = 0.5, mx = CX, my = 860;
  var M = addItem(c, mc, mx, my, ms * 100);
  burnReveal(M, 0);
  var kp = [];
  var kr = US.states["20"].rings[0];
  for (var i = 0; i < kr.length; i++) kp.push(mapPt(kr[i], mx, my, ms));
  var ko = shape(c, "Kansas Farbe"), gk = grp(ko); addPath(gk, line2(kp, true)); fill(gk, "#E8A93A"); stroke(gk, INK, 3);
  ko.blendingMode = BlendingMode.MULTIPLY; ko.inPoint = k.kansas - f2s(3);
  var kc = mapPt(US.centroids["20"], mx, my, ms), wi = mapPt(US.cities["Wichita"], mx, my, ms);
  var cc = contrastCallout(c, k.kansas - f2s(3), c.duration, kc[0], kc[1], 150, 110, false); cc.name = "Callout Kansas";
  var pin = shape(c, "Pin Wichita"), gp = grp(pin); ellipseG(gp, 22, 22, wi[0], wi[1]); fill(gp, RED); stroke(gp, "#FFFFFF", 4);
  pin.inPoint = k.kansas;
  var yr = odometer(c, "1978", F_SERIF_B, 170, INK, [CX, 520], k.dreiundzwanzig, f2s(16));
  sourceBar(c, "Wichita, Kansas", "1978", k.kansas, 300);
  var cam = camRig(c, kc[0], kc[1], { punchIn: 114, s0: 100, s1: 104 });
  keys(cam.scale, [k.kansas - f2s(3), k.kansas + 0.9], [[104, 104], [190, 190]], [[10, 10], [92, 92]]);
  voxSauce(c, "grafik");
};
// ---------- 9 Karton fuer Apfelwein ----------
B.karton = function (c, k) {
  paperBase(c);
  var bx = SH.box, x = CX, y = 940, s = 1.25;
  jarDraw(c, "Glas links", SH.jarS, x - 120, y - 250, 0.75, null);
  jarDraw(c, "Glas rechts", SH.jarS, x + 140, y - 240, 0.75, null);
  var flaps = shape(c, "Klappen"), gf = grp(flaps); addPath(gf, bx.flapL, x, y, s); addPath(gf, bx.flapR, x, y, s); fill(gf, "#C79C62"); stroke(gf, INK, 6);
  edgeBoil(flaps, 6);
  var body = shape(c, "Karton"), g = grp(body); addPath(g, bx.front, x, y, s); fill(g, "#D4AA70"); stroke(g, INK, 6);
  var g2 = grp(body); addPath(g2, bx.side, x, y, s); addPath(g2, bx.top, x, y, s); stroke(g2, INK, 6);
  var g3 = grp(body); addPath(g3, bx.tape, x, y, s); fill(g3, "#B98A52", 70);
  edgeBoil(body, 6);
  var lab = shape(c, "Etikett"), gl = grp(lab); rectG(gl, 470, 140, x, y + 90, 6); fill(gl, "#F3E8CF"); stroke(gl, INK, 4);
  lab.inPoint = k.apfelwein - f2s(4);
  var lt = txt(c, "APFELWEIN", F_BLACK, 82, "#3A2A1A", [x, y + 120], ParagraphJustification.CENTER_JUSTIFY, 60);
  typeOn(lt, k.apfelwein - f2s(2), 26);
  focusHunt(c, 0);
  var cam = camRig(c, x, y - 60, { punchIn: 120, s0: 100, s1: 107 });
  punchAt(cam, k.apfelwein - f2s(2), 1.07);
  voxSauce(c, "grafik");
};
// ---------- 10 Fahrt quer durch Amerika ----------
B.reise = function (c, k) {
  paperBase(c);
  var mc = mapComp(), ms = 0.5, mx = CX, my = 860;
  addItem(c, mc, mx, my, ms * 100);
  var A = mapPt(US.cities["Princeton"], mx, my, ms), Bp = mapPt(US.cities["Berkeley"], mx, my, ms);
  var C = [(A[0] + Bp[0]) / 2, Math.min(A[1], Bp[1]) - 210];
  var route = { v: [A, Bp], i: [[0, 0], [(C[0] - Bp[0]) * 2 / 3, (C[1] - Bp[1]) * 2 / 3]], o: [[(C[0] - A[0]) * 2 / 3, (C[1] - A[1]) * 2 / 3], [0, 0]], c: false };
  var rl = shape(c, "Route"), g = grp(rl); addPath(g, route); stroke(g, RED, 7, 18, 12);
  var t0 = k.faehrt, t1 = k.enkelin - f2s(4);
  var tr = g.addProperty("ADBE Vector Filter - Trim");
  tr.property("ADBE Vector Trim End").expression = "ease(time, " + t0 + ", " + t1 + ", 0, 100)";
  edgeBoil(rl, 7);
  var car = shape(c, "Auto"), gc = grp(car, "Karosserie"); addPath(gc, SH.car.body, 0, 0, 0.42); fill(gc, "#F7F2E6"); stroke(gc, INK, 5);
  var gw = grp(car, "Fenster"); addPath(gw, SH.car.win, 0, 0, 0.42); fill(gw, "#BFD3E0"); stroke(gw, INK, 3);
  var gt = grp(car, "Kofferraum"); addPath(gt, SH.car.trunk, 0, 0, 0.42); fill(gt, YEL); stroke(gt, INK, 3);
  for (var w = 0; w < 2; w++) { var gr = grp(car, "Rad " + w); ellipseG(gr, SH.car.r * 2 * 0.42, SH.car.r * 2 * 0.42, SH.car.wheels[w][0] * 0.42, SH.car.wheels[w][1] * 0.42); fill(gr, INK); }
  var trunkFill = car.property("ADBE Root Vectors Group").property("Kofferraum").property("ADBE Vectors Group").property("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Opacity");
  keys(trunkFill, [k.kofferraum - f2s(3), k.kofferraum + f2s(2)], [0, 100], 50);
  car.position.expression = "var u = ease(time, " + t0 + ", " + t1 + ", 0, 1); var A=[" + A + "], B=[" + Bp + "], C=[" + C + "];" +
    " var p = [(1-u)*(1-u)*A[0]+2*(1-u)*u*C[0]+u*u*B[0], (1-u)*(1-u)*A[1]+2*(1-u)*u*C[1]+u*u*B[1]]; posterizeTime(12); p + [0, -18 + Math.sin(time*20)*1.5]";
  edgeBoil(car, 5);
  var yr = odometer(c, "1997", F_SERIF_B, 170, INK, [CX, 520], 0.1, f2s(16));
  var pinA = shape(c, "Pin Princeton"), ga = grp(pinA); ellipseG(ga, 22, 22, A[0], A[1]); fill(ga, INK);
  var pinB = shape(c, "Pin Berkeley"), gbp = grp(pinB); ellipseG(gbp, 26, 26, Bp[0], Bp[1]); fill(gbp, RED); stroke(gbp, "#FFFFFF", 4);
  pinB.inPoint = k.enkelin - f2s(3);
  rings(c, Bp[0], Bp[1], k.enkelin - f2s(3), 2, RED, 260);
  var en = label(c, "Enkelin", Bp[0] + 170, Bp[1] + 190, 58, k.enkelin - f2s(2), INK, [Bp[0] + 18, Bp[1] + 22]);
  // "Sie will es nicht": Glas-Symbol neben Berkeley, wird durchgestrichen
  var jg = jarDraw(c, "Glas klein", SH.jarS, Bp[0] + 120, Bp[1] - 150, 0.36, k.enkelin + f2s(4));
  jg.inPoint = k.enkelin + f2s(4);
  var xx = Bp[0] + 120, yy = Bp[1] - 150;
  pencil(c, "Kreuz", [line2([[xx - 70, yy - 60], [xx + 70, yy + 60]]), line2([[xx + 70, yy - 60], [xx - 70, yy + 60]])], RED, 9, k.nicht - f2s(3), f2s(8));
  var cam = camRig(c, CX, 860, { punchIn: 114, s0: 100, s1: 104 });
  keys(cam.position, [k.enkelin - f2s(6), k.enkelin + 0.8], [[CX, 860], [CX + (CX - Bp[0]) * 0.5, 860 + (860 - Bp[1]) * 0.4]], [[10, 10], [90, 90]]);
  keys(cam.scale, [k.enkelin - f2s(6), k.enkelin + 0.8], [[103, 103], [150, 150]], [[10, 10], [90, 90]]);
  voxSauce(c, "grafik");
};
// ---------- 11 Waage: ganz normal, etwas leichter ----------
B.waage = function (c, k) {
  paperBase(c);
  var S = SH.scale, x = CX, y = 640, s = 1.15, half = 380 * s;
  pencil(c, "Staender", [S.stand, S.foot], INK, 8, null, null, x, y, s);
  var beam = shape(c, "Balken"), gb = grp(beam); addPath(gb, S.beam, 0, 0, s); stroke(gb, INK, 10);
  var gm = grp(beam); ellipseG(gm, 26, 26, 0, 0); fill(gm, INK);
  beam.position.setValue([x, y]); edgeBoil(beam, 10);
  var tilt = 9;
  keys(beam.rotation, [k.leichter - f2s(4), k.leichter + 1.6], [0, tilt], [[20, 20], [80, 80]]);
  beam.rotation.expression = "var t = time - " + (k.leichter - f2s(4)) + "; t > 0 ? value + Math.sin(t*7)*Math.exp(-t*2.2)*3 : value";
  var sides = [-1, 1], nm = ["Einstein", "Durchschnitt"], gw = ["1.230 g", "1.400 g"], seeds = [SH.brainS, SH.brainS2];
  for (var i = 0; i < 2; i++) {
    var pan = shape(c, "Schale " + nm[i]), gp = grp(pan); addPath(gp, S.ropes, 0, 0, s); stroke(gp, INK, 4);
    var gq = grp(pan); addPath(gq, S.pan, 0, 0, s); fill(gq, "#E4DACA"); stroke(gq, INK, 6);
    pan.position.expression = "var b = thisComp.layer('Balken'); var a = degreesToRadians(b.transform.rotation); b.transform.position + [" + (sides[i] * half) + "*Math.cos(a), " + (sides[i] * half) + "*Math.sin(a)]";
    edgeBoil(pan, 6);
    var bd = brainDraw(c, "Gehirn " + nm[i], seeds[i], 0, 0, 0.62, null, INK, 5);
    for (var b = 0; b < bd.length; b++) { bd[b].parent = pan; bd[b].position.setValue([0, 300 * s - 56]); }
    var t1 = txt(c, nm[i], F_SERIF_BI, 56, INK, [0, 0]); t1.parent = pan; t1.position.setValue([0, 440 * s]);
    var t2 = txt(c, gw[i], F_SANS_B, 66, i === 0 ? INK : GREY, [0, 0]); t2.parent = pan; t2.position.setValue([0, 440 * s + 80]);
    t1.inPoint = k.normal - f2s(2); t2.inPoint = k.leichter - f2s(2);
    if (i === 0) yellowPop(t2, k.leichter);
  }
  focusHunt(c, 0, true);
  var cam = camRig(c, CX, 900, { punchIn: 118, s0: 100, s1: 106 });
  punchAt(cam, k.normal - f2s(3), 1.06);
  voxSauce(c, "grafik");
};
// ---------- 12 Schluss: Verweis auf Folge 41 ----------
B.outro = function (c, k) {
  paperBase(c);
  var tf = k.folge - f2s(3);
  var ph = printPhoto(c, "archiv/einstein-1945-loc.jpg", CX, 820, 720, 880, 2, 0);
  var ql = txt(c, "Wie hat er\rwirklich gedacht?", F_SERIF_BI, 84, INK, [CX, 1360]);
  var qd = ql.property("ADBE Text Properties").property("ADBE Text Document"), qv = qd.value; qv.autoLeading = false; qv.leading = 92; qd.setValue(qv);
  typeOn(ql, 0.15, 30);
  ph.outPoint = tf; ql.outPoint = tf;
  for (var i = 1; i <= c.numLayers; i++) { var ly = c.layer(i); if (ly.name.indexOf("Abzug") === 0 || ly.name.indexOf("Rahmen") === 0) ly.outPoint = tf; }
  // Folgen-Cover, Logo, Folgen-Klick
  var cv = imp("archiv/B-16x9-1280x720-youtube.jpg");
  if (cv) {
    var card = addItem(c, cv, CX, 640, 960 / cv.width * 100);
    card.inPoint = tf; keys(card.scale, [tf, tf + 0.3], [[960 / cv.width * 112, 960 / cv.width * 112], [960 / cv.width * 100, 960 / cv.width * 100]], [[10, 10], [85, 85]]);
    var ds = addFx(card, "ADBE Drop Shadow"); if (ds) { setP(ds, ["Opacity"], 110); setP(ds, ["Distance"], 18); setP(ds, ["Softness"], 40); }
  }
  var f41 = txt(c, "Folge 41", F_SERIF_B, 110, INK, [CX, 1010]); f41.inPoint = tf; yellowPop(f41, tf + f2s(4));
  var lk = txt(c, "Link in der Bio", F_SERIF_I, 64, INK, [CX, 1090]); lk.inPoint = k.link - f2s(4); typeOn(lk, k.link - f2s(4), 30);
  var lg = imp("archiv/logo.png");
  if (lg) { var lo = addItem(c, lg, CX - 150, 1260, 170 / lg.width * 100); lo.inPoint = k.allgemeinwissen - f2s(4); keys(lo.scale, [lo.inPoint, lo.inPoint + 0.3], [[0, 0], [170 / lg.width * 100, 170 / lg.width * 100]], [[10, 10], [80, 80]]); }
  var btn = shape(c, "Folgen-Knopf"), gb = grp(btn); rectG(gb, 300, 96, CX + 120, 1260, 48); var bfill = fill(gb, RED);
  btn.inPoint = k.allgemeinwissen - f2s(2);
  var b1 = txt(c, "+ Folgen", F_SANS_B, 46, "#FFFFFF", [CX + 120, 1276]); b1.inPoint = btn.inPoint;
  var tc = k.link + f2s(6);
  b1.outPoint = tc;
  var b2 = txt(c, "✓ Gefolgt", F_SANS_B, 46, "#FFFFFF", [CX + 120, 1276]); b2.inPoint = tc;
  keys(bfill.property("ADBE Vector Fill Color"), [tc - f2s(1), tc], [rgb(RED), rgb("#6B655B")], 50);
  var cur = shape(c, "Mauszeiger"), gcu = grp(cur);
  addPath(gcu, line2([[0, 0], [0, 64], [16, 50], [28, 76], [40, 70], [28, 46], [50, 46]], true)); fill(gcu, "#FFFFFF"); stroke(gcu, INK, 4);
  cur.inPoint = k.link - f2s(8);
  keys(cur.position, [k.link - f2s(8), tc - f2s(2)], [[CX + 420, 1560], [CX + 140, 1268]], [[10, 10], [85, 85]]);
  keys(cur.scale, [tc - f2s(2), tc, tc + f2s(4)], [[100, 100], [82, 82], [100, 100]], 50);
  var cam = camRig(c, CX, 900, { punchIn: 116, s0: 100, s1: 104, punchOut: false });
  punchAt(cam, tf, 1.06);
  var cr = credit(c, D.credits["einstein-1945-loc"]);
  if (cr) for (var j = 1; j <= c.numLayers; j++) if (c.layer(j).name.indexOf("FIX Bildquelle") === 0) c.layer(j).outPoint = tf;
  voxSauce(c, "grafik");
};
