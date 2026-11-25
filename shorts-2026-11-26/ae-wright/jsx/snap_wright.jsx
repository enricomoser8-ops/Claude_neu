// Standbilder der Master-Comp -> out/png/ (halbe Aufloesung, alle 0,8 s, kurz nach jedem Schluesselwort, kurz vor jedem Schnitt).
// Lauf: node edit-tools\ae.mjs <diese Datei> 900000
var BASE = "C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-26/ae-wright/"; var T = [0.4, 0.87, 1.2, 2.0, 2.17, 2.8, 3.2, 3.5, 3.6, 4.4, 4.52, 5.2, 5.25, 6.0, 6.29, 6.8, 7.15, 7.6, 7.92, 8.4, 9.14, 9.2, 10.0, 10.58, 10.8, 11.6, 11.61, 11.84, 12.4, 13.2, 13.93, 14.0, 14.16, 14.5, 14.8, 15.53, 15.6, 16.26, 16.4, 16.7, 17.0, 17.2, 18.0, 18.23, 18.8, 19.6, 19.76, 20.4, 20.63, 21.2, 21.21, 21.6, 21.64, 22.0, 22.8, 23.43, 23.6, 23.72, 24.32, 24.4, 25.2, 25.49, 26.0, 26.8, 27.37, 27.6, 28.28, 28.4, 29.2, 30.0, 30.37, 30.8, 31.6, 31.69, 32.4, 33.15, 33.2, 34.0, 34.34, 34.8, 35.12, 35.6, 36.19, 36.4, 37.16, 37.2, 37.22, 38.0, 38.1, 38.8, 39.6, 40.17, 40.4, 40.6, 41.2, 42.0, 42.14, 42.8, 43.3, 43.6, 44.35, 44.4, 44.65, 45.2, 45.28, 46.0, 46.8, 46.97, 47.6, 48.0, 48.4, 48.73, 49.2, 50.0, 50.57, 50.72, 50.8, 51.6, 51.67, 52.4, 53.2, 53.51, 54.0, 54.8, 55.55, 55.6, 56.4, 57.2, 57.71, 58.0, 58.8, 59.18, 59.6, 60.4, 60.72]; var NAME = "Short 26.11. Erster Flug (wright) (9x16)";
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
