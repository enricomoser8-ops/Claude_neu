// HAND-VERSION fuer After Effects: Datei > Skripte > Skriptdatei ausfuehren.
(function () {
var __r = (function () {
// Standbilder der Master-Comp -> out/png/ (halbe Aufloesung, ~1 je Sekunde, Einstiegsflug dichter, kurz vor jedem Schnitt).
// Lauf: node edit-tools\ae.mjs <diese Datei> 900000
var BASE = "C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-13/ae-freiheit/"; var T = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.8, 2.4, 3.4, 3.88, 4.4, 5.4, 6.4, 6.92, 7.4, 8.4, 9.4, 10.04, 10.4, 11.4, 12.4, 12.52, 13.4, 14.4, 15.4, 16.4, 17.24, 17.4, 18.4, 18.76, 19.4, 20.4, 21.08, 21.4, 22.4, 23.4, 23.96, 24.4, 25.4, 26.4, 27.4, 27.88, 28.4, 29.4, 30.4, 30.84, 31.4, 32.2, 32.4, 33.4, 34.2, 34.4, 35.4, 36.4, 37.4, 37.48, 38.4, 39.4, 40.4, 41.4, 41.56, 42.4, 43.4, 44.12, 44.4, 45.4, 46.4, 47.4, 48.4, 49.4, 49.76]; var NAME = "Short 13.11. Freiheitsstatue (freiheit) (9x16)";

var comp = null; for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof CompItem && it.name === NAME) comp = it; }
if (!comp) return "Comp fehlt: " + NAME;
new Folder(BASE + "out/png").create(); app.beginSuppressDialogs();
var res = comp.resolutionFactor; comp.resolutionFactor = [2, 2]; var out = [];
for (var k = 0; k < T.length; k++) { var f = new File(BASE + "out/png/frei_" + ("0000" + Math.round(T[k] * 100)).slice(-5) + ".png");
  try { comp.saveFrameToPng(T[k], f); out.push(f.name); } catch (e) { out.push("FEHLER " + T[k] + ": " + e); } }
comp.resolutionFactor = res; app.endSuppressDialogs(false);
return out.length + " PNGs (werden asynchron geschrieben, ein paar Sekunden warten)\n" + out.join("\n");

})();
try { var __b = "C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-13/ae-freiheit/"; new Folder(__b + "out").create(); var __f = new File(__b + "out/ergebnis_snap_freiheit.txt"); __f.encoding = "UTF-8"; __f.open("w"); __f.write(String(__r)); __f.close(); } catch (e) {}
alert(String(__r).substr(0, 1500));
})();
