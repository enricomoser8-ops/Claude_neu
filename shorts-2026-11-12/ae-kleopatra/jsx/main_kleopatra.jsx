// ===================== Aufbau: Projekt, Szenen, Master, Untertitel, Logo, Ton =====================
// Baut in das offene Projekt (z. B. einishort.aep) und ersetzt NUR den eigenen Ordner D.title (der Weltkrieg-Short bleibt unberuehrt).
var PROJNAME = "Short-kleopatra-Vox.aep";
new Folder(BASE + "out").create();
app.beginSuppressDialogs();
plog("Start " + D.title);
var cur = app.project;
if (cur.file === null) {
  if (cur.numItems > 0) { app.endSuppressDialogs(false); return "ABGEBROCHEN: Ein ungespeichertes Projekt ist offen. Bitte das Zielprojekt (einishort.aep) oeffnen."; }
  var pf = new File(BASE + PROJNAME);
  if (pf.exists) app.open(pf); else app.project.save(pf);
}
proj = app.project;
for (var i = proj.numItems; i >= 1; i--) { var fi = proj.item(i); if (fi instanceof FolderItem && fi.parentFolder === proj.rootFolder && fi.name === D.title) fi.remove(); }
app.beginUndoGroup(D.title);
var fRoot = proj.items.addFolder(D.title);
var fAssets = proj.items.addFolder("Assets (kleopatra)"); fAssets.parentFolder = fRoot;
var fPre = proj.items.addFolder("Bausteine (kleopatra)"); fPre.parentFolder = fRoot;
var fScenes = proj.items.addFolder("Szenen (kleopatra)"); fScenes.parentFolder = fRoot;

var sceneComps = [];
for (var si = 0; si < D.scenes.length; si++) {
  (function (s) {
    step(s.id, function () {
      var c = mkComp((si + 1 < 10 ? "0" : "") + (si + 1) + " " + s.id, W, H, s.dur);
      CURSCENE = s.id; B[s.id](c, s.k); CURSCENE = null;
      var ca = checkAnims(s.id, s.dur); for (var q = 0; q < ca.length; q++) log.push(ca[q]);
      sceneComps.push([s, c]);
    });
  })(D.scenes[si]);
}
var MAIN;
step("Master", function () {
  KEYP = "";   // Master heisst genau D.title + " (9x16)" (snap/render suchen diesen Namen)
  var m = MAIN = mkComp(D.title + " (9x16)", W, H, D.end, fRoot);
  for (var i = 0; i < sceneComps.length; i++) {
    var s = sceneComps[i][0], L = m.layers.add(sceneComps[i][1]);
    L.startTime = s.start; L.inPoint = s.start; L.outPoint = Math.min(D.end, s.end);
  }
  masterSauce(m);
  // Untertitel NEU (enno 12.11.): ein Wort, weiss, Arial Bold 52 px, keine Kontur, weicher dunkler Schatten, Mitte y 1370
  for (var w = 0; w < D.words.length; w++) {
    var wd = D.words[w];
    var t = txt(m, wd.w, F_SANS_B, 52, "#FFFFFF", [W / 2, 1370]);
    // Runde 4 (Review 3: weiss auf hellem Papier zu schwach): Schatten wie Weltkrieg - kraeftiger weicher Schatten + zweiter weiter dunkler Schein, keine Kontur
    var sh = addFx(t, "ADBE Drop Shadow", "Schatten weich");
    if (sh) { setP(sh, ["Shadow Color"], [0, 0, 0]); setP(sh, ["Opacity"], 230); setP(sh, ["Direction"], 135); setP(sh, ["Distance"], 3); setP(sh, ["Softness"], 16); }
    var sh2 = addFx(t, "ADBE Drop Shadow", "Schein dunkel");
    if (sh2) { setP(sh2, ["Shadow Color"], [0, 0, 0]); setP(sh2, ["Opacity"], 90); setP(sh2, ["Distance"], 0); setP(sh2, ["Softness"], 40); }
    var wr = t.sourceRectAtTime(wd.s, false); if (wr.width > 960) t.scale.setValue([96000 / wr.width, 96000 / wr.width]);
    t.name = "UT " + wd.w; t.inPoint = wd.s; t.outPoint = Math.min(D.end, wd.e2);
  }
  // rundes Kanal-Logo oben links; weg, sobald im Schluss das grosse Logo kommt
  var so = D.scenes[D.scenes.length - 1];
  cornerLogo(m, "archiv/logo-ecke.png", 98, 196, 96, 0, so.start + so.k.allgemeinwissen - f2s(4));
  for (var a = 0; a < D.audio.length; a++) {
    var f = new File(BASE + D.audio[a]);
    if (!f.exists) { log.push("TON FEHLT: " + D.audio[a]); continue; }
    var au = m.layers.add(imp(D.audio[a])); au.name = "Ton: " + D.audio[a]; au.moveToEnd();
  }
  m.openInViewer();
});
app.endUndoGroup();
step("Speichern", function () { proj.save(); });
app.endSuppressDialogs(false);
plog("Ende");
var miss = []; for (var mk in FX_MISSING) miss.push(mk);
var nErr = 0, nCut = 0, nKnapp = 0;
for (var e = 0; e < log.length; e++) { if (log[e].indexOf("FEHLER") === 0) nErr++; if (log[e].indexOf("ABGESCHNITTEN") === 0) nCut++; if (log[e].indexOf("KNAPP") === 0) nKnapp++; }
return nErr + " Fehler | " + nCut + " ABGESCHNITTEN | " + nKnapp + " KNAPP" + (miss.length ? " | FEHLENDE EFFEKTE: " + miss.join(", ") : " | alle Effekte da") + "\n" + log.join("\n");
