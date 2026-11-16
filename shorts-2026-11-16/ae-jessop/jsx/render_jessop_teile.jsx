// Rendert die Master-Comp in voller Aufloesung als H.264 ("Match Render Settings - 40 Mbps", falls vorhanden), 25 fps.
// TEILE = false: ein Stueck -> out/jessop_vox.mp4 | TEILE = true: zwei Haelften 0-25 s und 25 s-Ende nacheinander
//   -> out/jessop_teil1.mp4 + out/jessop_teil2.mp4 (dazwischen werden alle Caches geleert; gegen "zu wenig Speicher").
// Lauf: node edit-tools\ae.mjs <diese Datei> 1800000
var BASE = "C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-16/ae-jessop/"; var NAME = "Short 16.11. Titanic-Stewardess (jessop) (9x16)"; var TEILE = true; var SPLIT = 25;
var comp = null; for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof CompItem && it.name === NAME) comp = it; }
if (!comp) return "Comp fehlt: " + NAME;

if (Math.abs(comp.frameRate - 25) > 0.01) return "Comp hat " + comp.frameRate + " fps statt 25 - bitte neu bauen";
new Folder(BASE + "out").create();
app.beginSuppressDialogs();
try { app.purge(PurgeTarget.ALL_CACHES); } catch (e0) {}
var rq = app.project.renderQueue;
for (var r = rq.numItems; r >= 1; r--) if (rq.item(r).status !== RQItemStatus.DONE && rq.item(r).comp === comp) rq.item(r).remove();
for (var r2 = 1; r2 <= rq.numItems; r2++) if (rq.item(r2).status === RQItemStatus.QUEUED) rq.item(r2).render = false;   // andere Auftraege nicht mitrendern
var teile = TEILE ? [[0, SPLIT, "jessop_teil1"], [SPLIT, comp.duration - SPLIT, "jessop_teil2"]] : [[0, comp.duration, "jessop_vox"]];
var log = [], t0 = new Date().getTime(), tpl = null;
for (var p = 0; p < teile.length; p++) {
  var item = rq.items.add(comp);
  try { item.applyTemplate("Best Settings"); } catch (e) {}
  item.timeSpanStart = teile[p][0]; item.timeSpanDuration = teile[p][1];
  var om = item.outputModule(1);
  if (!tpl) {
    for (var a = 0; a < om.templates.length && !tpl; a++) if (/H\.264/.test(om.templates[a]) && /Match Render/.test(om.templates[a]) && /40 Mbps/.test(om.templates[a])) tpl = om.templates[a];
    for (var b = 0; b < om.templates.length && !tpl; b++) if (/H\.264/.test(om.templates[b]) && /40 Mbps/.test(om.templates[b])) tpl = om.templates[b];
    if (!tpl) for (var c2 = 0; c2 < om.templates.length; c2++) if (/H\.264/.test(om.templates[c2])) { tpl = om.templates[c2]; break; }
  }
  if (tpl) om.applyTemplate(tpl);
  om.file = new File(BASE + "out/" + teile[p][2] + (tpl ? ".mp4" : ".mov"));
  var ts = new Date().getTime();
  rq.render();
  log.push(teile[p][2] + ": " + Math.round((new Date().getTime() - ts) / 1000) + " s -> " + om.file.fsName);
  try { app.purge(PurgeTarget.ALL_CACHES); } catch (e3) {}   // vor dem zweiten Teil Speicher freigeben
}
app.project.save();
app.endSuppressDialogs(false);
return "Fertig in " + Math.round((new Date().getTime() - t0) / 1000) + " s, Vorlage: " + (tpl || "Standard (kein H.264)") + "\n" + log.join("\n");
