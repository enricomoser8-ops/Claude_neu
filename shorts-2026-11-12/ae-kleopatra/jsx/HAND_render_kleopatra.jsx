// HAND-VERSION fuer After Effects: Datei > Skripte > Skriptdatei ausfuehren.
(function () {
var __r = (function () {
// Rendert die Master-Comp in voller Aufloesung als H.264 nach out/kleopatra_vox.mp4 (enno rendert selbst; nur falls gewuenscht).
// Lauf: node edit-tools\ae.mjs <diese Datei> 1800000
var BASE = "C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-12/ae-kleopatra/"; var NAME = "Short 12.11. Kleopatra (kleopatra) (9x16)";

var comp = null; for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof CompItem && it.name === NAME) comp = it; }
if (!comp) return "Comp fehlt: " + NAME;
app.beginSuppressDialogs();
var rq = app.project.renderQueue; for (var r = rq.numItems; r >= 1; r--) if (rq.item(r).status !== RQItemStatus.DONE && rq.item(r).comp === comp) rq.item(r).remove();
var item = rq.items.add(comp);
try { item.applyTemplate("Best Settings"); } catch (e) {}
var om = item.outputModule(1), tpl = null;
for (var t0i = 0; t0i < om.templates.length && !tpl; t0i++) if (/H\.264/.test(om.templates[t0i]) && /Match Render/.test(om.templates[t0i]) && /40 Mbps/.test(om.templates[t0i])) tpl = om.templates[t0i];
for (var t1i = 0; t1i < om.templates.length && !tpl; t1i++) if (/H\.264/.test(om.templates[t1i]) && /40 Mbps/.test(om.templates[t1i])) tpl = om.templates[t1i];
if (!tpl) for (var t2 = 0; t2 < om.templates.length; t2++) if (/H\.264/.test(om.templates[t2])) { tpl = om.templates[t2]; break; }
if (tpl) om.applyTemplate(tpl);
om.file = new File(BASE + "out/kleopatra_vox" + (tpl ? ".mp4" : ".mov"));
var t0 = new Date().getTime(); rq.render(); app.project.save();
app.endSuppressDialogs(false);
return "Fertig in " + Math.round((new Date().getTime() - t0) / 1000) + " s, Vorlage: " + (tpl || "Standard (kein H.264)") + " -> " + om.file.fsName;

})();
try { var __b = "C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-12/ae-kleopatra/"; new Folder(__b + "out").create(); var __f = new File(__b + "out/ergebnis_render_kleopatra.txt"); __f.encoding = "UTF-8"; __f.open("w"); __f.write(String(__r)); __f.close(); } catch (e) {}
alert(String(__r).substr(0, 1500));
})();
