// Rendert die Master-Comp in voller Aufloesung als H.264 nach out/freiheit_vox.mp4 (enno rendert selbst; nur falls gewuenscht). 25 fps.
// Lauf: node edit-tools\ae.mjs <diese Datei> 1800000
var BASE = "C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-13/ae-freiheit/"; var NAME = "Short 13.11. Freiheitsstatue (freiheit) (9x16)";

var comp = null; for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof CompItem && it.name === NAME) comp = it; }
if (!comp) return "Comp fehlt: " + NAME;
if (Math.abs(comp.frameRate - 25) > 0.01) return "Comp hat " + comp.frameRate + " fps statt 25 - bitte neu bauen";
app.beginSuppressDialogs();
var rq = app.project.renderQueue; for (var r = rq.numItems; r >= 1; r--) if (rq.item(r).status !== RQItemStatus.DONE && rq.item(r).comp === comp) rq.item(r).remove();
var item = rq.items.add(comp);
try { item.applyTemplate("Best Settings"); } catch (e) {}
var om = item.outputModule(1), tpl = null;
for (var t0i = 0; t0i < om.templates.length && !tpl; t0i++) if (/H\.264/.test(om.templates[t0i]) && /Match Render/.test(om.templates[t0i]) && /40 Mbps/.test(om.templates[t0i])) tpl = om.templates[t0i];
for (var t1i = 0; t1i < om.templates.length && !tpl; t1i++) if (/H\.264/.test(om.templates[t1i]) && /40 Mbps/.test(om.templates[t1i])) tpl = om.templates[t1i];
if (!tpl) for (var t2 = 0; t2 < om.templates.length; t2++) if (/H\.264/.test(om.templates[t2])) { tpl = om.templates[t2]; break; }
if (tpl) om.applyTemplate(tpl);
om.file = new File(BASE + "out/freiheit_vox" + (tpl ? ".mp4" : ".mov"));
var t0 = new Date().getTime(); rq.render(); app.project.save();
app.endSuppressDialogs(false);
return "Fertig in " + Math.round((new Date().getTime() - t0) / 1000) + " s, Vorlage: " + (tpl || "Standard (kein H.264)") + " -> " + om.file.fsName;
