// Alle sichtbaren Animations-Ereignisse des Beethoven-Shorts (17.11.2026) mit exaktem Frame -> ton/events_alle.json
// Quelle: Trockenlauf der jsx im AE-Mock (gen/aemock.js, unveraendert geladen), dann Keyframes/Ausdruecke/In-Punkte jeder Ebene.
// Sichtbarer Frame: Master hat Posterize Time 12 (wie ae-jessop). Nach dem Bau auf dem PC: Snaps ansehen, Abweichungen unten in PC_FIX eintragen.
// Aufruf: node ton/events_beethoven.js [jsx/build_beethoven.jsx]
const fs = require('fs'), path = require('path'), vm = require('vm'), Module = require('module');
const ROOT = path.join(__dirname, '..'), MOCK = path.join(ROOT, 'gen', 'aemock.js');
const JSX = process.argv[2] || path.join(ROOT, 'jsx', 'build_beethoven.jsx');
const FPS = 25, fr = (t) => Math.round(t * FPS), r3 = (t) => Math.round(t * 1000) / 1000;

// ---- Mock laufen lassen (Ausgaben stumm), Master-Comp holen ----
const argv = process.argv, log = console.log;
process.argv = [argv[0], MOCK, JSX]; console.log = () => {};
const run = vm.runInThisContext(Module.wrap(fs.readFileSync(MOCK, 'utf8') + '\n;global.__MASTER = master;'), { filename: MOCK });
run({}, require, { exports: {} }, MOCK, path.dirname(MOCK));
process.argv = argv; console.log = log; process.exitCode = 0;
const master = global.__MASTER;

// ---- Hilfen: alle Eigenschaften mit Keys (auch Text-Animatoren, Effekte, Masken, Formgruppen) ----
function keyed(L) {
  const out = [], seen = new Set();
  const walk = (p, name) => {
    if (!p || seen.has(p)) return; seen.add(p);
    if (p.keys && p.keys.length) out.push({ n: name + '/' + (p.matchName || p.name), k: p.keys });
    for (const c of (p.added || [])) walk(c, name);
    for (const k in (p.kids || {})) walk(p.kids[k], name);
    for (const c of (p._list || [])) walk(c, name);
  };
  for (const k of ['position', 'scale', 'rotation', 'opacity', 'anchorPoint']) walk(L[k], k);
  for (const e of L._fx) walk(e, 'fx');
  for (const m of L._masks) walk(m, 'mask');
  if (L._root) walk(L._root, 'shape');
  try { walk(L.property('ADBE Text Properties').property('ADBE Text Animators').__node || L.property('ADBE Text Properties').property('ADBE Text Animators'), 'textanim'); } catch (e) {}
  return out;
}
const kt = (P, re) => { const p = P.find(x => re.test(x.n)); return p ? p.k.map(k => k.t) : null; };
const EV = [];
function ev(t, typ, what, o) { EV.push(Object.assign({ f: fr(t), t: r3(t), typ, what }, o || {})); }

const scenes = master.layers.filter(l => l.kind === 'comp').sort((a, b) => a.startTime - b.startTime);
scenes.forEach((S, si) => {
  const c = S.source, off = S.startTime, sid = c.name.replace(/^beethoven \d+ /, ''), end = off + c.duration;
  const A = (t) => off + t;
  const burn = c.layers.find(L => /^Grund Uebergang/.test(L.name));
  if (si === 0) ev(off, 'photo_in', 'erstes Bild: Beethoven-Gesicht (Bild 0)', { scene: sid });
  if (si > 0) {
    if (burn) { const b = kt(keyed(burn), /Burn$/); ev(A(b[0]), 'burn', 'Brand-Uebergang in ' + sid, { t1: r3(A(b[1])), scene: sid }); }
    else ev(off, 'cut', 'Schnitt auf ' + sid, { scene: sid });
  }
  for (const L of c.layers.slice().reverse()) {
    if (!L.enabled || /^(Untertitel|UT |FIX Bildquelle|FIX UT|Vignette|Vox Sauce|Grund Abdunklung|FIX gradient)/.test(L.name)) continue;
    const P = keyed(L), n = L.name, tin = A(L.inPoint), tout = A(L.outPoint);
    const expr = L.kind === 'text' ? String(L._tdoc.expression || '') : '';
    let m;
    if (n === 'Kamera Punch (Transform)') { const k = kt(P, /Scale Height/); ev(A(k[0]), 'punch_cut', 'Punch-Cut 110->100 % (21 Frames)', { t1: r3(A(k[1])), scene: sid }); continue; }
    if (n === 'Kamera') {   // punchAt: zusaetzliche Keys mitten in der Szene (Push-in auf ein Wort)
      const k = kt(P, /ADBE Scale/) || [];
      for (const a of k) if (a > 0.05 && a < c.duration - 0.05 && k.some(b => Math.abs(b - a - 17 / FPS) < 0.01)) ev(A(a), 'push_in', 'Punch-in (Kamera) auf das Wort', { t1: r3(A(a + 17 / FPS)), peak: r3(A(a + 3 / FPS)), scene: sid });   // punchAt: Keys t-3f und t+14f
      continue;
    }
    if (/^Grund Foto/.test(n)) {   // Reissschwenk: kurzer Abschnitt der Fotofahrt
      const k = kt(P, /ADBE Anchor Point/) || [];
      for (let i = 0; i + 1 < k.length; i++) if (k[i + 1] - k[i] < 0.7) ev(A(k[i]), 'whip_pan', 'Reissschwenk ueber die Zeitungsseite', { t1: r3(A(k[i + 1])), scene: sid });
      continue;
    }
    if (/^Textmarker/.test(n)) { const k = kt(P, /Trim End/); ev(A(k[0]), 'marker', 'Textmarker ' + n.replace('Textmarker ', ''), { t1: r3(A(k[1])), scene: sid }); continue; }
    if (/^(Kreis|Pfeil|Strich|Route Pfeil|Unterstrich)/.test(n)) {
      const k = kt(P, /Trim End/); if (!k) continue;
      const typ = /^Kreis/.test(n) ? 'circle' : /^Pfeil|^Route/.test(n) ? 'arrow' : /Masslinie/.test(n) ? 'measure_line' : 'line';
      ev(A(k[0]), typ, n + ' zeichnet sich', { t1: r3(A(k[1])), scene: sid }); continue;
    }
    if (n === 'Route Spitze') { const k = kt(P, /ADBE Scale/); ev(A(k[0]), 'arrow_head', 'Spitze des Route-Pfeils springt auf', { t1: r3(A(k[1])), scene: sid }); continue; }
    if (L.kind === 'text' && (m = /\(time - ([\d.]+)\) \* (\d+)/.exec(expr)) && /substr/.test(expr)) {
      const t0 = A(+m[1]), cps = +m[2], s = String(L._doc().text);
      ev(t0, 'type_on', 'Tippen "' + s + '"', { t1: r3(t0 + s.length / cps), chars: s.length, cps, scene: sid }); continue;
    }
    if (L.kind === 'text' && (m = /linear\(time, ([\d.]+), ([\d.]+), (\d+), (\d+)\)/.exec(expr))) {
      const t0 = A(+m[1]), t1 = A(+m[2]), a = +m[3], b = +m[4], steps = [];
      let last = null;
      for (let t = Math.floor(t0 * 12) / 12; t <= t1 + 1 / 12; t += 1 / 12) {   // posterizeTime(12)
        const u = Math.min(1, Math.max(0, (t - t0) / (t1 - t0))), v = Math.round(a + (b - a) * u);
        if (v !== last) { if (last !== null) steps.push(r3(Math.ceil(t * FPS - 1e-6) / FPS)); last = v; }
      }
      ev(t0, 'counter', 'Zaehler ' + a + ' -> ' + b + ' (' + n + ')', { t1: r3(t1), steps, scene: sid }); continue;
    }
    if (/^(Jahr|Zahl) /.test(n)) { const k = kt(P, /Percent Offset/); if (k) ev(A(k[0]), 'odometer', 'Odometer ' + n.replace(/^(Jahr|Zahl) /, '') + ' rollt ein', { t1: r3(A(k[1])), scene: sid }); continue; }
    if (/^Rahmen /.test(n)) { const k = kt(P, /ADBE Scale/); if (k) ev(A(k[0]), 'photo_drop', 'Abzug faellt ins Bild (' + n.replace(/.*\//, '') + ')', { t1: r3(A(k[1])), scene: sid }); continue; }
    if (/^Stern 1$/.test(n)) { const k = kt(P, /ADBE Scale/); ev(A(k[0]), 'stars', '12 Sterne springen nacheinander auf (je 1 Frame)', { t1: r3(A(k[0] + 11 / FPS + 9 / FPS)), n: 12, scene: sid }); continue; }
    if (/^Stern /.test(n)) continue;
    if (/^Etikett Flaeche/.test(n)) { const k = kt(P, /ADBE Scale/); ev(A(k[0]), 'chip', 'Chip ' + n.replace('Etikett Flaeche ', '') + ' springt auf', { t1: r3(A(k[2])), scene: sid }); continue; }
    if (/^FIX Callout/.test(n)) {
      ev(tin, 'callout', 'Kontrast-Callout ' + n.replace('FIX Callout ', '') + ' an (harter Schnitt)', { scene: sid });
      if (tout < end - 0.05) ev(tout, 'callout_off', 'Kontrast-Callout ' + n.replace('FIX Callout ', '') + ' aus', { scene: sid });
      continue;
    }
    if (n === 'FIX Fokus-Unschaerfe') { const k = kt(P, /Mask Shape/), b = kt(P, /Blur Radius/); ev(A(b[0]), 'focus', 'Fokus-Unschaerfe an, Blickpunkt wandert', { t1: r3(A(k[1])), off: r3(A(b[3])), scene: sid }); continue; }
    if (/^Grund Lupe/.test(n)) { const k = kt(P, /ADBE Scale/); ev(A(k[0]), 'magnifier', 'Lupe waechst auf', { t1: r3(A(k[1])), scene: sid }); continue; }
    if (n === 'Ringe') { const k = P.filter(p => /Ellipse Size/.test(p.n)).map(p => p.k[0].t); if (k.length) ev(A(k[0]), 'rings', 'Ringe breiten sich aus (' + k.length + ')', { rings: k.map(x => r3(A(x))), scene: sid }); continue; }
    if (/^Zeitung /.test(n)) {
      const k = kt(P, /ADBE Position/), rk = kt(P, /Rotate Z/);
      ev(A(k[0]), 'newspaper_in', n + ' rutscht stufig ein und rastet ein', { t1: r3(A(rk[rk.length - 1])), scene: sid });
      if (tout < end - 0.05) ev(tout, 'newspaper_out', n + ' verschwindet (harter Schnitt)', { scene: sid });
      continue;
    }
    if (/^Farbe /.test(n)) { const k = kt(P, /Mask Shape/); ev(tin, 'color_sweep', n + ' wischt von oben ins Bild', { t1: r3(k ? A(k[1]) : tin + 0.35), scene: sid }); continue; }
    if (n === 'Fragezeichen') { const k = kt(P, /ADBE Scale/); ev(A(k[0]), 'slam', 'Fragezeichen knallt rein', { t1: r3(A(k[k.length - 1])), scene: sid }); continue; }
    if (n === 'Logo gross') { const k = kt(P, /ADBE Scale/); ev(A(k[0]), 'logo', 'grosses Logo springt auf', { t1: r3(A(k[k.length - 1])), scene: sid }); continue; }
    if (n === 'Text In der Bio') { const k = kt(P, /ADBE Scale/); ev(A(k[0]), 'pop_in', '"In der Bio" springt auf', { t1: r3(A(k[k.length - 1])), scene: sid }); continue; }
    if (n === 'FIX Folgen-Knopf') {
      const k = kt(P, /ADBE Scale/), cl = kt(P, /Fill Color/);
      ev(A(k[0]), 'button_in', 'Folgen-Knopf springt auf', { t1: r3(A(k[2])), scene: sid });
      ev(A(cl[1]), 'click', 'Klick: "+ Folgen" -> "Gefolgt"', { scene: sid }); continue;
    }
    if (n === 'FIX Mauszeiger') { const k = kt(P, /ADBE Position/); ev(A(k[0]), 'cursor', 'Mauszeiger faehrt zum Knopf', { t1: r3(A(k[1])), scene: sid }); continue; }
  }
});
// ---- PC_FIX: nach dem Bau auf dem PC gemessene sichtbare Frames (typ + scene -> [f_sicht, f1_sicht]); leer = Mock-Werte ----
const PC_FIX = {};
for (const e of EV) { const x = PC_FIX[e.typ + ':' + e.scene]; if (x) { e.f_sicht = x[0]; if (x[1] !== undefined) e.f1_sicht = x[1]; e.hinweis = 'sichtbare Frames vom PC'; } }
// Sichtbarer Frame (PC-Regel): Master hat Posterize Time 12 -> Ereignis zur Zeit t ist ab dem ersten 25-fps-Frame
// an/nach dem naechsten 1/12-s-Schritt sichtbar
const fSicht = (t) => Math.ceil(Math.ceil(t * 12 - 1e-6) * FPS / 12 - 1e-6);
for (const e of EV) {
  if (e.f_sicht === undefined) e.f_sicht = fSicht(e.t);
  if (e.t1 !== undefined && e.f1_sicht === undefined) e.f1_sicht = fSicht(e.t1);
  e.t_sicht = r3(e.f_sicht / FPS); if (e.f1_sicht !== undefined) e.t1_sicht = r3(e.f1_sicht / FPS);
  if (e.steps) e.steps_sicht = e.steps.slice();
  if (e.typ === 'counter' && e.steps && e.steps.length) { e.f_sicht = Math.round(e.steps[0] * FPS); e.t_sicht = r3(e.f_sicht / FPS); e.hinweis = 'erster sichtbarer Zahlenwechsel (vorher steht der Startwert)'; }   // steps sind schon auf dem 12-fps-Raster (posterizeTime(12) im Ausdruck)
  if (e.rings) e.rings_sicht = e.rings.map(x => r3(fSicht(x) / FPS));
}
EV.sort((a, b) => a.f_sicht - b.f_sicht || a.typ.localeCompare(b.typ));
const res = { fps: FPS, end: master.duration, quelle: 'node ton/events_beethoven.js (aemock-Trockenlauf von ' + path.relative(ROOT, JSX) + ')',
  hinweis: 'Untertitel, langsame Kamerafahrten und Parallax-Drift sind Dauerbewegung, keine Ereignisse. t/t1 in s (Comp-Zeit), f = Frame (25 fps); f_sicht/t_sicht = wann es im Master (Posterize 12) wirklich sichtbar wird, darauf sitzt der Ton.', events: EV };
fs.writeFileSync(path.join(__dirname, 'events_alle.json'), JSON.stringify(res, null, 1));
const cnt = {}; EV.forEach(e => cnt[e.typ] = (cnt[e.typ] || 0) + 1);
console.log('events_alle.json: ' + EV.length + ' Ereignisse | ' + Object.entries(cnt).map(([k, v]) => k + ' ' + v).join(', '));
