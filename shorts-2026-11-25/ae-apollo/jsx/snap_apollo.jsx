// Standbilder der Master-Comp -> out/png/ (halbe Aufloesung, alle 0,8 s, kurz nach jedem Schluesselwort, kurz vor jedem Schnitt).
// Lauf: node edit-tools\ae.mjs <diese Datei> 900000
var BASE = "C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-25/ae-apollo/"; var T = [0.4, 0.9, 1.2, 2.0, 2.68, 2.8, 3.2, 3.34, 3.6, 4.4, 4.49, 4.97, 5.2, 6.0, 6.57, 6.8, 7.4, 7.6, 8.05, 8.4, 8.53, 9.12, 9.2, 9.76, 10.0, 10.8, 11.6, 11.68, 12.4, 13.2, 14.0, 14.06, 14.52, 14.54, 14.8, 15.5, 15.6, 16.4, 16.47, 16.96, 17.2, 17.93, 18.0, 18.26, 18.59, 18.8, 19.6, 20.22, 20.4, 20.92, 21.2, 22.0, 22.37, 22.8, 23.36, 23.6, 24.34, 24.4, 24.68, 25.2, 26.0, 26.64, 26.76, 26.8, 27.6, 28.4, 29.08, 29.2, 29.41, 30.0, 30.22, 30.55, 30.8, 31.36, 31.6, 32.4, 33.01, 33.2, 33.35, 34.0, 34.16, 34.8, 35.6, 35.61, 36.4, 37.2, 37.38, 38.0, 38.53, 38.8, 39.6, 40.34, 40.4, 40.88, 41.2, 42.0, 42.48, 42.8, 43.6, 43.93, 44.4, 44.89, 45.04, 45.2, 46.0, 46.01, 46.49, 46.8, 47.6, 47.72, 48.4, 48.71, 49.2, 50.0, 50.49, 50.68, 50.8, 51.6, 51.65, 52.4, 52.43, 53.2, 53.25, 54.0, 54.54, 54.8, 55.4, 55.6, 56.4, 57.17, 57.2, 57.65, 58.0, 58.16, 58.8, 59.6, 59.78, 60.4, 61.2, 62.0, 62.15, 62.8, 63.6, 63.78, 64.4, 65.2, 65.44]; var NAME = "Short 25.11. Apollo 13 (apollo) (9x16)";
var comp = null; for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof CompItem && it.name === NAME) comp = it; }
if (!comp) return "Comp fehlt: " + NAME;

new Folder(BASE + "out/png").create(); app.beginSuppressDialogs();
try { app.purge(PurgeTarget.ALL_CACHES); } catch (e0) {}
var res = comp.resolutionFactor; comp.resolutionFactor = [2, 2]; var out = [];
for (var k = 0; k < T.length; k++) {
  if (k > 0 && k % 20 === 0) { try { app.purge(PurgeTarget.ALL_CACHES); } catch (e1) {} }
  var f = new File(BASE + "out/png/ap_" + ("0000" + Math.round(T[k] * 100)).slice(-5) + ".png");
  try { comp.saveFrameToPng(T[k], f); out.push(f.name); } catch (e) { out.push("FEHLER " + T[k] + ": " + e); } }
comp.resolutionFactor = res; try { app.purge(PurgeTarget.ALL_CACHES); } catch (e2) {}
app.endSuppressDialogs(false);
return out.length + " PNGs (werden asynchron geschrieben, ca. 1 Minute warten)\n" + out.join("\n");
