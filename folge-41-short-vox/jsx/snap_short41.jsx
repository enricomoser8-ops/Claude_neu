// Standbilder der Master-Comp -> out/png/ (halbe Aufloesung). Lauf: node edit-tools\ae.mjs <diese Datei> 900000
var BASE = "C:/Users/Enrico/Claude/Podcast-Shorts/Folge-41-Short-Vox/"; var T = [1.47, 2.55, 4.35, 5.61, 9.03, 11.61, 14.32, 16.31, 17.81, 18.81, 20.77, 22.15, 23.95, 25.21, 27.42, 29.01, 30.16, 30.88, 34.24, 36.78, 39.45, 41.41, 46.01, 49.55]; var NAME = "Short 41 Vox-Probe (9x16)";

var comp = null; for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof CompItem && it.name === NAME) comp = it; }
if (!comp) return "Comp fehlt: " + NAME;
new Folder(BASE + "out/png").create(); app.beginSuppressDialogs();
var res = comp.resolutionFactor; comp.resolutionFactor = [2, 2]; var out = [];
for (var k = 0; k < T.length; k++) { var f = new File(BASE + "out/png/s41_" + ("0000" + Math.round(T[k] * 100)).slice(-5) + ".png");
  try { comp.saveFrameToPng(T[k], f); out.push(f.name); } catch (e) { out.push("FEHLER " + T[k] + ": " + e); } }
comp.resolutionFactor = res; app.endSuppressDialogs(false);
return out.length + " PNGs\n" + out.join("\n");
