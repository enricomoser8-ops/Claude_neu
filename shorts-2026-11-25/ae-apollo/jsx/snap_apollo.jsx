// Standbilder der Master-Comp -> out/png/ (halbe Aufloesung, alle 0,8 s, kurz nach jedem Schluesselwort, kurz vor jedem Schnitt).
// Lauf: node edit-tools\ae.mjs <diese Datei> 900000
var BASE = "C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-25/ae-apollo/"; var T = [0.4, 0.72, 1.2, 1.8, 2.0, 2.2, 2.8, 3.06, 3.38, 3.6, 4.4, 4.72, 5.04, 5.2, 5.68, 6.0, 6.76, 6.8, 7.42, 7.6, 8.4, 8.66, 9.2, 10.0, 10.46, 10.64, 10.8, 10.84, 11.54, 11.6, 12.2, 12.4, 12.68, 13.2, 13.34, 13.54, 14.0, 14.28, 14.8, 15.38, 15.48, 15.6, 16.4, 16.88, 17.2, 17.44, 18.0, 18.18, 18.42, 18.8, 19.4, 19.6, 19.64, 20.4, 21.14, 21.2, 21.42, 22.0, 22.1, 22.38, 22.72, 22.8, 23.6, 23.82, 24.0, 24.4, 24.86, 25.2, 25.64, 25.72, 26.0, 26.7, 26.8, 27.6, 27.68, 28.24, 28.4, 28.66, 29.2, 29.92, 30.0, 30.8, 30.82, 31.32, 31.4, 31.6, 32.16, 32.4, 32.88, 33.2, 33.8, 34.0, 34.44, 34.68, 34.8, 35.4, 35.6, 36.4, 37.2, 37.94, 38.0, 38.56, 38.8, 38.82, 39.48, 39.6, 39.64, 40.2, 40.4, 40.92, 41.2, 41.38, 42.0, 42.28, 42.4, 42.8, 43.6, 43.66, 43.98, 44.08, 44.4, 45.2, 45.22, 46.0, 46.8, 46.84, 47.6, 47.82, 48.4, 49.2]; var NAME = "Short 25.11. Apollo 13 (apollo) (9x16)";
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
