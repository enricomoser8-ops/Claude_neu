// ===================== Aufbau: Projekt, Szenen, Master, Untertitel, Logo, Ton =====================
// Baut in das offene (gespeicherte) Projekt und ersetzt NUR den eigenen obersten Ordner D.title
// (der Kleopatra-Short vom selben Tag hat einen eigenen Ordner und bleibt unberuehrt).
var PROJNAME = "Weltkrieg-Short.aep";
new Folder(BASE + "out").create();
app.beginSuppressDialogs();
plog("Start " + D.title);
var cur = app.project;
if (cur.file === null) {
  if (cur.numItems > 0) { app.endSuppressDialogs(false); return "ABGEBROCHEN: Ein ungespeichertes Projekt ist offen. Bitte das Shorts-Projekt oeffnen (oder ein leeres)."; }
  var pf = new File(BASE + PROJNAME);
  if (pf.exists) app.open(pf); else app.project.save(pf);
}
proj = app.project;
for (var i = proj.numItems; i >= 1; i--) { var fi = proj.item(i); if (fi instanceof FolderItem && fi.parentFolder === proj.rootFolder && fi.name === D.title) fi.remove(); }
app.beginUndoGroup(D.title);
var fRoot = proj.items.addFolder(D.title);
var fAssets = proj.items.addFolder("WK Assets"); fAssets.parentFolder = fRoot;
var fPre = proj.items.addFolder("WK Bausteine"); fPre.parentFolder = fRoot;
var fScenes = proj.items.addFolder("WK Szenen"); fScenes.parentFolder = fRoot;

var sceneComps = [];
for (var si = 0; si < D.scenes.length; si++) {
  (function (s) {
    step(s.id, function () {
      var c = mkComp("WK " + (si + 1 < 10 ? "0" : "") + (si + 1) + " " + s.id, W, H, s.dur);
      CURSCENE = s.id; B[s.id](c, s.k); CURSCENE = null;
      var ca = checkAnims(s.id, s.dur); for (var q = 0; q < ca.length; q++) log.push(ca[q]);
      sceneComps.push([s, c]);
    });
  })(D.scenes[si]);
}
// Untertitel (enno 12.11.): EIN Wort, weiss, halbfett (Arial Bold), ~52 px, keine Kontur, nur weicher Schatten, Mitte y ~1370
function subtitle(m, wd) {
  var t = txt(m, wd.w, F_SANS_B, 52, "#FFFFFF", [W / 2, 1388]);
  var ds = addFx(t, "ADBE Drop Shadow");
  if (ds) { setP(ds, ["Shadow Color"], [0, 0, 0]); setP(ds, ["Opacity"], 153); setP(ds, ["Direction"], 180); setP(ds, ["Distance"], 3); setP(ds, ["Softness"], 8); }
  var wr = t.sourceRectAtTime(wd.s, false); if (wr.width > 900) t.scale.setValue([90000 / wr.width, 90000 / wr.width]);
  t.name = "UT " + wd.w; t.inPoint = wd.s; t.outPoint = Math.min(D.end, wd.e2);
  return t;
}
var MAIN;
step("Master", function () {
  var m = MAIN = mkComp(D.master, W, H, D.end, fRoot);
  for (var i = 0; i < sceneComps.length; i++) {
    var s = sceneComps[i][0], L = m.layers.add(sceneComps[i][1]);
    L.startTime = s.start; L.inPoint = s.start; L.outPoint = Math.min(D.end, s.end);
  }
  masterSauce(m);
  for (var w = 0; w < D.words.length; w++) subtitle(m, D.words[w]);
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
var nErr = 0, nCut = 0, nTight = 0;
for (var e = 0; e < log.length; e++) { if (log[e].indexOf("FEHLER") === 0) nErr++; if (log[e].indexOf("ABGESCHNITTEN") === 0) nCut++; if (log[e].indexOf("KNAPP") === 0) nTight++; }
return nErr + " Fehler | " + nCut + " ABGESCHNITTEN | " + nTight + " KNAPP" + (miss.length ? " | FEHLENDE EFFEKTE: " + miss.join(", ") : " | alle Effekte da") + "\n" + log.join("\n");
