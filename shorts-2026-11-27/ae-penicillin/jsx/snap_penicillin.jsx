// Standbilder der Master-Comp -> out/png/ (halbe Aufloesung, alle 0,8 s, kurz nach jedem Schluesselwort, kurz vor jedem Schnitt).
// Lauf: node edit-tools\ae.mjs <diese Datei> 900000
var BASE = "C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-27/ae-penicillin/"; var T = [0.4, 0.78, 1.2, 1.48, 2.0, 2.8, 3.44, 3.6, 3.7, 4.38, 4.4, 4.77, 5.0, 5.2, 6.0, 6.1, 6.8, 7.02, 7.31, 7.6, 8.4, 8.73, 9.2, 9.73, 10.0, 10.08, 10.33, 10.8, 11.22, 11.6, 11.92, 12.4, 12.52, 13.2, 13.96, 14.0, 14.23, 14.8, 15.12, 15.6, 15.72, 16.4, 16.88, 17.04, 17.2, 18.0, 18.02, 18.08, 18.8, 18.93, 19.44, 19.6, 20.4, 21.2, 22.0, 22.24, 22.28, 22.54, 22.8, 23.14, 23.34, 23.6, 24.4, 24.64, 24.8, 25.14, 25.2, 25.94, 26.0, 26.24, 26.8, 27.6, 27.76, 28.0, 28.4, 29.2, 29.54, 30.0, 30.04, 30.43, 30.8, 31.4, 31.6, 31.73, 32.4, 32.74, 33.16, 33.2, 33.33, 34.0, 34.43, 34.8, 35.6, 35.8, 36.4, 36.81, 37.2, 38.0, 38.04]; var NAME = "Short 27.11. Penicillin (penicillin) (9x16)";
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
