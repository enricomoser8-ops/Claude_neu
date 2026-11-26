// SFX-Ereignisliste des Shorts 27.11.2026 Penicillin (penicillin, Kopie aus wright 26.11.) nach Chris Moran -> ton/events_alle.json
// Quelle: Trockenlauf der jsx im AE-Mock (gen/aemock.js), dann Keyframes/Ausdruecke/In-Punkte jeder Ebene mit Vox-Kennung (VOX:<art>|HAUPT).
// Regeln (im JSON je Ereignis vermerkt, sfx_penicillin.py setzt sie um):
//   - nur das WICHTIGSTE Ereignis je Szene bekommt einen Ton (das Hauptgeraet; ist es Dauerbewegung wie Parallax/Fokus, das naechste klare Ereignis)
//   - Textmarker/Callout/Farbsweep -> Filzstift, Kreise/Formen/Pfeile/Haken/Kreuz -> Bleistift, Zaehler/Odometer/Stapel -> Ticks auf jedem sichtbaren Wechsel
//   - Schnitt -> tiefer Whoosh als J-Cut (setzt 3 Frames vor dem Schnitt ein)
//   - jeder Ton bleibt in seiner Szene (Ende = Szenenende - 2 Frames)
//   - Ton sitzt auf dem SICHTBAREN Frame: Master hat Posterize Time 12 -> f_sicht
// Aufruf: node ton/events_penicillin.js [jsx/build_penicillin_cloud.jsx]
const fs = require('fs'), path = require('path'), vm = require('vm'), Module = require('module');
const ROOT = path.join(__dirname, '..'), MOCK = path.join(ROOT, 'gen', 'aemock.js');
const JSX = process.argv[2] || path.join(ROOT, 'jsx', 'build_penicillin_cloud.jsx');
const FPS = 25, fr = (t) => Math.round(t * FPS), r3 = (t) => Math.round(t * 1000) / 1000;
const argv = process.argv, log = console.log;
process.argv = [argv[0], MOCK, JSX]; console.log = () => {};
const run = vm.runInThisContext(Module.wrap(fs.readFileSync(MOCK, 'utf8') + '\n;global.__MASTER = master;'), { filename: MOCK });
run({}, require, { exports: {} }, MOCK, path.dirname(MOCK));
process.argv = argv; console.log = log; process.exitCode = 0;
const master = global.__MASTER;

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
  try { const a = L.property('ADBE Text Properties').property('ADBE Text Animators'); walk(a.__node || a, 'textanim'); } catch (e) {}
  return out;
}
const fSicht = (t) => Math.ceil(Math.ceil(t * 12 - 1e-6) * FPS / 12 - 1e-6);
const steps12 = (t0, t1) => { const o = []; for (let q = Math.ceil(t0 * 12 - 1e-6); q / 12 <= t1 + 1e-6; q++) o.push(r3(Math.ceil(q * FPS / 12 - 1e-6) / FPS)); return [...new Set(o)]; };
const ROLLE = { kreis: 'pencil', formen: 'pencil', pfeil: 'pencil', bahn: 'pencil', haken: 'pencil', kreuz: 'pencil', callout: 'marker', farbsweep: 'marker',
  zaehler: 'tick', stapel: 'tick', balken: 'tick', slam: 'impact', ringe: 'static', lupe: 'paper', punkte: 'tap', chip: 'tap', logo: 'tap', klick: 'click',
  parallax: null, fokus: null, punch: null,
  marker: 'marker', strich: 'pencil', muenze: 'coin', blitz: 'shutter', wind: 'wind' };   // 27.11. (wright): neue Geraete
const DAUER = new Set(['parallax', 'fokus', 'punch']);   // Dauerbewegung: kein eigener Ton

const EV = [], SZ = [];
const scenes = master.layers.filter(l => l.kind === 'comp').sort((a, b) => a.startTime - b.startTime);
scenes.forEach((S, si) => {
  const c = S.source, off = S.startTime, sid = c.name.replace(/^penicillin \d+ /, ''), end = off + c.duration;
  if (si > 0) EV.push({ typ: 'cut', scene: sid, t: r3(off), what: 'Schnitt auf ' + sid });
  const dev = [];
  for (const L of c.layers) {
    const m = /(^|;)VOX:(\w+)(\|HAUPT)?/.exec(L.comment || ''); if (!m || !L.enabled) continue;
    const art = m[2], haupt = !!m[3], P = keyed(L), expr = L.kind === 'text' ? String(L._tdoc.expression || '') : '';
    let t0 = L.inPoint, t1 = L.inPoint, steps = null, mm;
    const ks = []; for (const p of P) for (const k of p.k) ks.push(k.t);
    if (ks.length) { t0 = Math.max(L.inPoint, Math.min(...ks)); t1 = Math.max(...ks); }
    if (L.kind === 'text' && (mm = /ease\(time, ([\d.]+), ([\d.]+), (\d+), (\d+)\)/.exec(expr))) {   // counterF: sichtbare Zahlenwechsel
      const a0 = +mm[1], a1 = +mm[2], A = +mm[3], B = +mm[4]; let last = null; steps = [];
      for (let q = Math.floor(a0 * 12); q / 12 <= a1 + 1 / 12; q++) { const u = Math.min(1, Math.max(0, (q / 12 - a0) / (a1 - a0))), v = Math.round((A + (B - A) * u * u * (3 - 2 * u)) / 10) * 10; if (v !== last) { if (last !== null) steps.push(r3(off + Math.ceil(q / 12 * FPS - 1e-6) / FPS)); last = v; } }
      t0 = a0; t1 = a1;
    } else if (art === 'zaehler') steps = steps12(off + t0, off + t1);   // Odometer: rollt 12 Bilder/s
    if (art === 'stapel' || art === 'punkte') steps = null;
    if (art === 'kreis' || art === 'formen' || art === 'pfeil' || art === 'bahn' || art === 'haken' || art === 'kreuz' || art === 'strich' || art === 'wind' || art === 'marker') {   // Strich: Trim-Keys
      const tk = P.filter(p => /Trim End/.test(p.n)).flatMap(p => p.k.map(k => k.t)); if (tk.length) { t0 = Math.min(...tk); t1 = Math.max(...tk); }
    }
    if (art === 'callout') { t0 = L.inPoint; t1 = L.inPoint + 0.2; }
    if (art === 'klick') { const cl = P.find(p => /Fill Color/.test(p.n)); if (cl) { t0 = cl.k[cl.k.length - 1].t; t1 = t0; } }
    dev.push({ art, haupt, name: L.name, t: r3(off + t0), t1: r3(off + t1), steps });
  }
  // gleiche Art mehrfach (Stapel-Kopien, Punkte, Ringe): zu einem Ereignis zusammenfassen, Anschlaege = Einsaetze
  const grp = {};
  for (const d of dev) { const k = d.art; if (!grp[k]) grp[k] = Object.assign({}, d, { hits: [d.t] }); else { grp[k].hits.push(d.t); grp[k].t = Math.min(grp[k].t, d.t); grp[k].t1 = Math.max(grp[k].t1, d.t1); grp[k].haupt = grp[k].haupt || d.haupt; } }
  const G = Object.values(grp).sort((a, b) => a.t - b.t);
  let main = G.find(d => d.haupt), grund = 'Hauptgeraet der Szene';
  if (!main || DAUER.has(main.art) || !ROLLE[main.art]) { const alt = G.find(d => !DAUER.has(d.art) && ROLLE[d.art]); grund = 'Hauptgeraet ' + (main ? main.art : '-') + ' ist Dauerbewegung, naechstes klares Ereignis'; main = alt; }
  for (const d of G) EV.push({ typ: 'geraet', scene: sid, art: d.art, haupt: d.haupt, ton: d === main, rolle: d === main ? ROLLE[d.art] : null, grund: d === main ? grund : 'nicht das wichtigste Ereignis der Szene: stumm',
    what: d.name, t: d.t, t1: d.t1, hits: d.hits.map(r3), steps: d.steps, scene_end: r3(end) });
  SZ.push({ id: sid, start: r3(off), end: r3(end), ton: main ? main.art : null });
});
for (const e of EV) {
  e.f = fr(e.t); e.f_sicht = fSicht(e.t); e.t_sicht = r3(e.f_sicht / FPS);
  if (e.t1 !== undefined) { e.f1_sicht = fSicht(e.t1); e.t1_sicht = r3(e.f1_sicht / FPS); }
  if (e.hits) e.hits_sicht = e.hits.map(t => r3(fSicht(t) / FPS));
  if (e.steps) e.steps_sicht = e.steps.map(t => r3(fSicht(t - 1e-4) / FPS));
  if (e.scene_end !== undefined) e.f_ende = fr(e.scene_end) - 2;
}
EV.sort((a, b) => a.f_sicht - b.f_sicht);
fs.writeFileSync(path.join(__dirname, 'events_alle.json'), JSON.stringify({ fps: FPS, end: master.duration, quelle: 'node ton/events_penicillin.js (aemock-Trockenlauf von ' + path.relative(ROOT, JSX) + ')',
  hinweis: 'ton=true: dieses Ereignis bekommt den einzigen Ton der Szene. f_sicht/t_sicht = erster sichtbarer Frame im Master (Posterize 12). f_ende = letzter Frame, den ein Ton der Szene erreichen darf.',
  szenen: SZ, events: EV }, null, 1));
console.log('events_alle.json: ' + EV.length + ' Ereignisse, ' + EV.filter(e => e.ton).length + ' mit Ton, ' + EV.filter(e => e.typ === 'cut').length + ' Schnitte');
for (const s of SZ) console.log('  ' + s.id.padEnd(10) + ' ' + String(s.start).padStart(6) + ' s  Ton: ' + (s.ton || '-'));
