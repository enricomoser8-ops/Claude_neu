// Prueft, ob alle Effekte fuer den Vox-Stil in diesem After Effects vorhanden sind.
// Ergebnis: plugin_check.txt neben dieser Datei + Rueckgabewert.
(function () {
  var need = [
    ["ADBE Posterize Time", "Posterize Time"], ["ADBE Exposure2", "Exposure"], ["ADBE Geometry2", "Transform"],
    ["VISINF Grain Implant", "Add Grain"], ["ADBE Noise", "Noise"], ["ADBE Roughen Edges", "Roughen Edges"],
    ["ADBE Turbulent Displace", "Turbulent Displace"], ["ADBE Box Blur2", "Fast Box Blur"], ["ADBE Compound Blur", "Compound Blur"],
    ["ADBE CurvesCustom", "Curves"], ["ADBE Linear Wipe", "Linear Wipe"], ["ADBE Venetian Blinds", "Venetian Blinds"],
    ["ADBE Solid Composite", "Solid Composite"], ["CC Page Turn", "CC Page Turn"], ["CC Burn Film", "CC Burn Film"],
    ["CC Ball Action", "CC Ball Action"], ["ADBE Radio Waves", "Radio Waves"], ["ADBE Lumetri", "Lumetri Color"],
    ["ADBE Tint", "Tint"], ["ADBE Ramp", "Gradient Ramp"], ["ADBE Gaussian Blur 2", "Gaussian Blur"],
    ["ADBE Fractal Noise", "Fractal Noise"], ["ADBE Black&White", "Black & White"], ["ADBE Drop Shadow", "Drop Shadow"],
    ["ADBE Glo2", "Glow"], ["ADBE Displacement Map", "Displacement Map"], ["ADBE Optics Compensation", "Optics Compensation"],
    ["ADBE Simple Choker", "Simple Choker"], ["ADBE HUE SATURATION", "Hue/Saturation"]
  ];
  var have = {}, byName = [], i, e;
  for (i = 0; i < app.effects.length; i++) { e = app.effects[i]; have[e.matchName] = e.displayName; byName.push(e.displayName + " | " + e.matchName + " | " + e.category); }
  var out = ["AE " + app.version, "", "PFLICHT-EFFEKTE:"], miss = [];
  for (i = 0; i < need.length; i++) {
    var ok = have[need[i][0]] !== undefined;
    out.push((ok ? "OK    " : "FEHLT ") + need[i][1] + " (" + need[i][0] + ")");
    if (!ok) miss.push(need[i][1]);
  }
  out.push("", "SUCHE NACH ZUSATZ-PLUGINS (Chromatic, Boris, Deep Glow, Saber, Sapphire, Red Giant, FX Console, Motion):");
  var pat = /chromat|aberr|boris|bcc|deep glow|saber|sapphire|red giant|universe|trapcode|optical|glow|vhs|film|lens|halftone|grain|quick/i;
  for (i = 0; i < byName.length; i++) if (pat.test(byName[i])) out.push("  " + byName[i]);
  // Parameter-Namen der wichtigsten Effekte (fuer das Bau-Skript)
  out.push("", "PARAMETER:");
  try {
    var tc = app.project.items.addComp("_plugin_check_tmp", 100, 100, 1, 1, 30), sl = tc.layers.addSolid([1, 1, 1], "x", 100, 100, 1);
    var probe = ["ADBE Exposure2", "VISINF Grain Implant", "ADBE Geometry2", "ADBE Roughen Edges", "ADBE Turbulent Displace", "ADBE Compound Blur", "CC Page Turn", "CC Burn Film", "CC Ball Action", "ADBE Box Blur2", "ADBE Linear Wipe", "ADBE Ramp", "ADBE Tint"];
    for (i = 0; i < app.effects.length; i++) if (/chromatic/i.test(app.effects[i].displayName)) probe.push(app.effects[i].matchName);
    for (i = 0; i < probe.length; i++) {
      try { var ef = sl.property("ADBE Effect Parade").addProperty(probe[i]), nm = [];
        for (var q = 1; q <= ef.numProperties; q++) nm.push(ef.property(q).name);
        out.push("  " + probe[i] + ": " + nm.join(" | ")); } catch (e2) { out.push("  " + probe[i] + ": nicht anlegbar"); }
    }
    tc.remove();
  } catch (e3) { out.push("  (Parameter-Test fehlgeschlagen: " + e3 + ")"); }
  out.push("", "FEHLEND: " + (miss.length ? miss.join(", ") : "nichts"));
  out.push("", "ALLE EFFEKTE (" + byName.length + "):");
  byName.sort();
  out = out.concat(byName);
  var f = new File(File($.fileName).parent.fsName + "/plugin_check.txt");
  f.encoding = "UTF-8"; f.open("w"); f.write(out.join("\n")); f.close();
  return "Fehlend: " + (miss.length ? miss.join(", ") : "nichts") + " | Bericht: " + f.fsName;
})();
