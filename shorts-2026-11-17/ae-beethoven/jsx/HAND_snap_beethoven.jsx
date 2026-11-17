// HAND-VERSION fuer After Effects: Datei > Skripte > Skriptdatei ausfuehren.
(function () {
var __r = (function () {
// Standbilder der Master-Comp -> out/png/ (halbe Aufloesung, ~1 je Sekunde, Einstieg dichter, kurz vor jedem Schnitt).
// Speicher: leert vorher alle Caches und danach alle 20 Bilder (app.purge); Comp nur waehrenddessen auf Halb, danach wieder wie vorher.
// Lauf: node edit-tools\ae.mjs <diese Datei> 900000
var BASE = "C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-17/ae-beethoven/"; var T = [0.2, 0.4, 0.6, 0.9, 1.4, 2.0, 2.4, 3.4, 4.28, 4.4, 5.4, 5.96, 6.4, 7.4, 8.4, 8.6, 9.4, 10.4, 11.4, 11.48, 12.4, 13.4, 13.76, 14.4, 15.4, 16.4, 16.76, 17.4, 18.4, 18.84, 19.4, 20.4, 21.4, 22.4, 23.4, 24.4, 25.4, 25.44, 26.4, 27.4, 28.4, 28.92, 29.4, 30.4, 31.4, 32.4, 32.44, 33.4, 34.4, 34.84, 35.4, 36.4, 37.4, 38.4, 39.4, 40.4, 40.56, 41.4, 42.4, 43.4, 44.16, 44.4, 45.4, 45.8, 46.4, 47.4, 48.4, 49.4, 50.4, 51.4, 51.64]; var NAME = "Short 17.11. Beethoven (beethoven) (9x16)";
var comp = null; for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof CompItem && it.name === NAME) comp = it; }
if (!comp) return "Comp fehlt: " + NAME;

new Folder(BASE + "out/png").create(); app.beginSuppressDialogs();
try { app.purge(PurgeTarget.ALL_CACHES); } catch (e0) {}
var res = comp.resolutionFactor; comp.resolutionFactor = [2, 2]; var out = [];
for (var k = 0; k < T.length; k++) {
  if (k > 0 && k % 20 === 0) { try { app.purge(PurgeTarget.ALL_CACHES); } catch (e1) {} }
  var f = new File(BASE + "out/png/beet_" + ("0000" + Math.round(T[k] * 100)).slice(-5) + ".png");
  try { comp.saveFrameToPng(T[k], f); out.push(f.name); } catch (e) { out.push("FEHLER " + T[k] + ": " + e); } }
comp.resolutionFactor = res; try { app.purge(PurgeTarget.ALL_CACHES); } catch (e2) {}
app.endSuppressDialogs(false);
return out.length + " PNGs (werden asynchron geschrieben, ein paar Sekunden warten)\n" + out.join("\n");

})();
try { var __b = "C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-17/ae-beethoven/"; new Folder(__b + "out").create(); var __f = new File(__b + "out/ergebnis_snap_beethoven.txt"); __f.encoding = "UTF-8"; __f.open("w"); __f.write(String(__r)); __f.close(); } catch (e) {}
alert(String(__r).substr(0, 1500));
})();
