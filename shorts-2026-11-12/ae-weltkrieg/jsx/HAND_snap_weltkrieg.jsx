// HAND-VERSION fuer After Effects: Datei > Skripte > Skriptdatei ausfuehren.
(function () {
var __r = (function () {
// Standbilder der Master-Comp -> out/png/ (halbe Aufloesung). Lauf: node edit-tools\ae.mjs <diese Datei> 900000
var BASE = "C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-12/ae-weltkrieg/"; var T = [0.5, 1.5, 2.5, 3.17, 3.5, 4.5, 5.3, 5.5, 6.5, 7.5, 8.5, 9.43, 9.5, 10.5, 11.47, 11.5, 12.5, 13.2, 13.5, 14.5, 15.5, 16.5, 17.5, 18.03, 18.5, 19.5, 19.83, 20.5, 21.5, 22.5, 23.17, 23.5, 24.5, 24.87, 25.5, 26.5, 27.0, 27.5, 28.5, 29.5, 30.3, 30.5, 31.5, 32.1, 32.5, 33.5, 34.5, 35.5, 35.87, 36.5, 37.23, 37.5, 38.5, 39.37, 39.5, 40.5, 41.1, 41.5, 42.5, 43.5, 44.17, 44.5, 45.5, 46.5, 47.5, 48.5, 49.5, 50.17]; var NAME = "WK Weltkrieg-Short 12.11. (9x16)";

var comp = null; for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof CompItem && it.name === NAME) comp = it; }
if (!comp) return "Comp fehlt: " + NAME;
new Folder(BASE + "out/png").create(); app.beginSuppressDialogs();
var res = comp.resolutionFactor; comp.resolutionFactor = [2, 2]; var out = [];
for (var k = 0; k < T.length; k++) { var f = new File(BASE + "out/png/wk_" + ("0000" + Math.round(T[k] * 100)).slice(-5) + ".png");
  try { comp.saveFrameToPng(T[k], f); out.push(f.name); } catch (e) { out.push("FEHLER " + T[k] + ": " + e); } }
comp.resolutionFactor = res; app.endSuppressDialogs(false);
return out.length + " PNGs\n" + out.join("\n");

})();
try { var __b = "C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-12/ae-weltkrieg/"; new Folder(__b + "out").create(); var __f = new File(__b + "out/ergebnis_snap_weltkrieg.txt"); __f.encoding = "UTF-8"; __f.open("w"); __f.write(String(__r)); __f.close(); } catch (e) {}
alert(String(__r).substr(0, 1500));
})();
