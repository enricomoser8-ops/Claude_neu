// HAND-VERSION fuer After Effects: Datei > Skripte > Skriptdatei ausfuehren.
(function () {
var __r = (function () {
// Standbilder der Master-Comp -> out/png/ (halbe Aufloesung, ~1 je Sekunde, Einstieg dichter, kurz vor jedem Schnitt).
// Speicher: leert vorher alle Caches und danach alle 20 Bilder (app.purge); Comp nur waehrenddessen auf Halb, danach wieder wie vorher.
// Lauf: node edit-tools\ae.mjs <diese Datei> 900000
var BASE = "C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-16/ae-jessop/"; var T = [0.2, 0.4, 0.6, 0.9, 1.4, 2.0, 2.36, 2.4, 3.4, 4.4, 4.92, 5.4, 6.4, 7.4, 8.4, 8.44, 9.4, 10.4, 11.4, 12.4, 12.64, 13.4, 14.4, 15.4, 16.4, 17.4, 17.48, 18.4, 19.4, 20.4, 20.92, 21.4, 22.4, 23.4, 24.4, 25.4, 26.4, 27.4, 28.4, 29.4, 30.4, 31.4, 32.4, 33.4, 33.88, 34.4, 35.4, 36.4, 37.4, 38.4, 38.52, 39.4, 40.4, 41.4, 42.4, 42.68, 43.4, 44.4, 45.4, 46.4, 46.92, 47.4, 48.4, 48.68, 49.4, 50.4, 51.4, 52.4, 53.4, 54.4, 54.56]; var NAME = "Short 16.11. Titanic-Stewardess (jessop) (9x16)";
var comp = null; for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof CompItem && it.name === NAME) comp = it; }
if (!comp) return "Comp fehlt: " + NAME;

new Folder(BASE + "out/png").create(); app.beginSuppressDialogs();
try { app.purge(PurgeTarget.ALL_CACHES); } catch (e0) {}
var res = comp.resolutionFactor; comp.resolutionFactor = [2, 2]; var out = [];
for (var k = 0; k < T.length; k++) {
  if (k > 0 && k % 20 === 0) { try { app.purge(PurgeTarget.ALL_CACHES); } catch (e1) {} }
  var f = new File(BASE + "out/png/jess_" + ("0000" + Math.round(T[k] * 100)).slice(-5) + ".png");
  try { comp.saveFrameToPng(T[k], f); out.push(f.name); } catch (e) { out.push("FEHLER " + T[k] + ": " + e); } }
comp.resolutionFactor = res; try { app.purge(PurgeTarget.ALL_CACHES); } catch (e2) {}
app.endSuppressDialogs(false);
return out.length + " PNGs (werden asynchron geschrieben, ein paar Sekunden warten)\n" + out.join("\n");

})();
try { var __b = "C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-16/ae-jessop/"; new Folder(__b + "out").create(); var __f = new File(__b + "out/ergebnis_snap_jessop.txt"); __f.encoding = "UTF-8"; __f.open("w"); __f.write(String(__r)); __f.close(); } catch (e) {}
alert(String(__r).substr(0, 1500));
})();
