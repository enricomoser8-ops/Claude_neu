// HAND-VERSION fuer After Effects: Datei > Skripte > Skriptdatei ausfuehren.
(function () {
var __r = (function () {
// Standbilder der Master-Comp -> out/png/ (halbe Aufloesung, alle 0,8 s, kurz nach jedem Schluesselwort, kurz vor jedem Schnitt).
// Lauf: node edit-tools\ae.mjs <diese Datei> 900000
var BASE = "C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-26/ae-wright/"; var T = [0.4, 0.55, 1.2, 1.61, 2.0, 2.51, 2.8, 2.95, 3.16, 3.6, 3.87, 4.33, 4.4, 5.07, 5.2, 5.59, 5.88, 6.0, 6.8, 6.91, 7.6, 8.4, 8.45, 9.2, 9.25, 9.52, 10.0, 10.45, 10.8, 11.13, 11.16, 11.49, 11.6, 12.31, 12.4, 13.01, 13.2, 13.31, 13.32, 14.0, 14.25, 14.8, 15.33, 15.6, 15.81, 16.4, 16.43, 16.72, 16.75, 17.2, 18.0, 18.01, 18.41, 18.8, 18.89, 19.6, 19.76, 19.85, 20.4, 21.13, 21.2, 21.56, 22.0, 22.41, 22.8, 23.23, 23.6, 24.27, 24.4, 25.15, 25.2, 26.0, 26.27, 26.68, 26.8, 27.6, 27.63, 28.04, 28.19, 28.4, 29.07, 29.2, 30.0, 30.8, 30.83, 30.92, 31.6, 32.15, 32.4, 33.2, 33.33, 34.0, 34.19, 34.28, 34.37, 34.8, 35.39, 35.6, 36.15, 36.4, 36.97, 37.2, 38.0, 38.48, 38.8, 38.85, 39.49, 39.6, 40.4, 41.2, 41.47, 41.48, 42.0, 42.57, 42.8, 43.6, 44.13, 44.4, 45.15, 45.2, 46.0, 46.52]; var NAME = "Short 26.11. Erster Flug (wright) (9x16)";
var comp = null; for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof CompItem && it.name === NAME) comp = it; }
if (!comp) return "Comp fehlt: " + NAME;

new Folder(BASE + "out/png").create(); app.beginSuppressDialogs();
try { app.purge(PurgeTarget.ALL_CACHES); } catch (e0) {}
var res = comp.resolutionFactor; comp.resolutionFactor = [2, 2]; var out = [];
for (var k = 0; k < T.length; k++) {
  if (k > 0 && k % 20 === 0) { try { app.purge(PurgeTarget.ALL_CACHES); } catch (e1) {} }
  var f = new File(BASE + "out/png/wr_" + ("0000" + Math.round(T[k] * 100)).slice(-5) + ".png");
  try { comp.saveFrameToPng(T[k], f); out.push(f.name); } catch (e) { out.push("FEHLER " + T[k] + ": " + e); } }
comp.resolutionFactor = res; try { app.purge(PurgeTarget.ALL_CACHES); } catch (e2) {}
app.endSuppressDialogs(false);
return out.length + " PNGs (werden asynchron geschrieben, ca. 1 Minute warten)\n" + out.join("\n");

})();
try { var __b = "C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-26/ae-wright/"; new Folder(__b + "out").create(); var __f = new File(__b + "out/ergebnis_snap_wright.txt"); __f.encoding = "UTF-8"; __f.open("w"); __f.write(String(__r)); __f.close(); } catch (e) {}
alert(String(__r).substr(0, 1500));
})();
