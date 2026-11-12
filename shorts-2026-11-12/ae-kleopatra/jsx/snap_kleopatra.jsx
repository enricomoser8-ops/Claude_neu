// Standbilder der Master-Comp -> out/png/ (halbe Aufloesung, ~1 je Sekunde + kurz vor jedem Schnitt). Lauf: node edit-tools\ae.mjs <diese Datei> 900000
var BASE = "C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-12/ae-kleopatra/"; var T = [0.4, 1.4, 2.4, 3.4, 3.83, 4.4, 5.4, 5.5, 6.4, 7.4, 8.4, 9.4, 9.83, 10.4, 11.4, 12.4, 13.4, 13.77, 14.4, 15.4, 15.9, 16.4, 17.4, 17.5, 18.4, 19.4, 20.4, 21.4, 21.5, 22.4, 23.1, 23.4, 24.4, 25.4, 26.4, 27.4, 27.77, 28.4, 29.27, 29.4, 30.4, 31.4, 32.4, 33.03, 33.4, 34.4, 35.4, 36.07, 36.4, 37.4, 38.4, 39.27, 39.4, 40.4, 41.4, 42.4, 43.4, 43.83, 44.4, 44.97, 45.4, 46.4, 47.4, 48.4, 49.4, 50.4, 50.87]; var NAME = "Short 12.11. Kleopatra (kleopatra) (9x16)";

var comp = null; for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof CompItem && it.name === NAME) comp = it; }
if (!comp) return "Comp fehlt: " + NAME;
new Folder(BASE + "out/png").create(); app.beginSuppressDialogs();
var res = comp.resolutionFactor; comp.resolutionFactor = [2, 2]; var out = [];
for (var k = 0; k < T.length; k++) { var f = new File(BASE + "out/png/kleo_" + ("0000" + Math.round(T[k] * 100)).slice(-5) + ".png");
  try { comp.saveFrameToPng(T[k], f); out.push(f.name); } catch (e) { out.push("FEHLER " + T[k] + ": " + e); } }
comp.resolutionFactor = res; app.endSuppressDialogs(false);
return out.length + " PNGs\n" + out.join("\n");
