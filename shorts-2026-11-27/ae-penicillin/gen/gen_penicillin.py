# Baut jsx/build_penicillin.jsx (Short 27.11.2026 "Nobelpreis fuer ein unordentliches Labor", key penicillin) aus Daten:
# data/words.json (Wortzeiten: gen/words_penicillin.py, Platzhalter oder ASR), data/bilder.json (gen/bilder_penicillin.py), archiv/credits.json. 25 fps.
# Stil (enno 25.11., Runde 2 Apollo): Hintergrund nach Chris Moran TikTok 13 (Graustufen-Collage + Tint, Schwarz/Weiss im Wechsel je 2 Szenen,
# Grunge, Drift), davor echte Fotos MITTIG (ABZ_DX), >= 2 Vox-Geraete je Szene am echten Bildpunkt, Bildquelle senkrecht am linken Rand,
# UNTERTITEL VON UNS (Stil Beethoven 17.11.: ein Wort, Arial Bold 52 px, weiss, y 1370) direkt aus data/words.json (gesprochene Woerter).
# Szenenzeiten kommen NUR aus data/words.json (Szene beginnt 0,07 s vor ihrem ersten Wort) -> nach neuer Stimme nur words + gen neu laufen lassen.
# Anker-Woerter haben Alternativen (ASR schreibt Zahlen oft als Ziffern: "1903", "12", "3-mal"), Liste = erstes passendes Wort.
# Aufruf: python3 gen/gen_penicillin.py [--timeline] [--cloud]
import json, os, re, sys, random, math
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
KEY = 'penicillin'
PC_BASE = 'C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-27/ae-penicillin/'
FPS = 25
TEXT = open(os.path.join(ROOT, 'data', 'text_gesprochen.txt'), encoding='utf-8').read().strip()
WORDS = TEXT.split()
def norm(w): return re.sub(r'[^a-z0-9äöüß]', '', w.lower())
def _alts(word): return word if isinstance(word, (list, tuple)) else [word]
def find(word, after=0):
    for i in range(after, len(WORDS)):
        if norm(WORDS[i]) in [norm(w) for w in _alts(word)]: return i
    raise SystemExit('Wort nicht gefunden: %s ab %d' % (word, after))
def findC(word, after=0):   # Satzanfang: Gross-/Kleinschreibung zaehlt ("Die" ist nicht "die")
    for i in range(after, len(WORDS)):
        if re.sub(r'[.,!?:]+$', '', WORDS[i]) in _alts(word): return i
    for i in range(after, len(WORDS)):   # 26.11.: ASR schreibt Satzanfaenge manchmal klein ("gewinnt, doch") -> Rueckfall ohne Gross/Klein
        if norm(WORDS[i]) in [norm(w) for w in _alts(word)]: print('Hinweis: Anker %s nur klein gefunden (Wort %d)' % (word, i)); return i
    raise SystemExit('Wort nicht gefunden: %s ab %d' % (word, after))
S = []
def sc(id, start, **k): S.append((id, start, k))
f = find
C = findC
J1928 = ['neunzehnhundertachtundzwanzig', '1928', '1928.']; J1945 = ['Neunzehnhundertfünfundvierzig', 'neunzehnhundertfünfundvierzig', '1945']
i_london = C('London'); i_alex = C('Alexander'); i_auf = C('Auf'); i_auf2 = C('Auf', i_auf + 1); i_und = C('Und', i_auf2); i_fl = C('Fleming', i_und)
i_folge = C('Folge'); i_doch = C(['Doch', 'doch']); i_erst = C('Erst'); i_im = C('Im', i_erst); i_nob = C(J1945, i_im); i_frage = C('Hättest'); i_du = C('Du', i_frage)
sc('hook', 0, forscher=f('Forscher'), labor=f('Labor'), nobel=f('Nobelpreis'))
sc('london', i_london, sept=f('September'), jahr=f(J1928))
sc('labor', i_alex, fleming=f('Fleming', i_alex), urlaub=f('Urlaub'), zurueck=f('zurück'), tisch=f('Tisch'), schalen=f('Glasschalen'), bakterien=f('Bakterien'))
sc('schale', i_auf2, schale=f('Schale', i_auf2), pilz=f('Schimmelpilz'), rund=f('rund'), verschw=f('verschwunden'))
sc('neugierig', i_fl, neugierig=f('neugierig'), stoff=f('Stoff', i_fl), penicillin=f('Penicillin', i_fl))
sc('folge', i_folge, schlauer=f('schlauer'))
sc('kaum', i_doch, kaum=f('kaum'), interessiert=f('interessiert'), mengen=f('Mengen'), herstellen=f('herstellen'))
sc('oxford', i_erst, zwoelf=f(['zwölf', '12'], i_erst), jahre=f('Jahre', i_erst), forscher=f('Forscher', i_erst), oxford=f('Oxford', i_erst))
sc('krieg', i_im, weltkrieg=f('Weltkrieg'), rettet=f('rettet'), soldaten=f('Soldaten'))
sc('nobel', i_nob, fleming=f('Fleming', i_nob), nobel=f('Nobelpreis', i_nob), zusammen=f('zusammen', i_nob), oxford=f('Oxford', i_nob))
sc('frage', i_frage, schale=f('Schale', i_frage), weg=f('weggeworfen'))
sc('outro', i_du, allgemein=f('Allgemeinwissen'), bio=f('Bio'), folgen=f('Folgen', f('Bio')))
SIDS = [x[0] for x in S]

T = json.load(open(os.path.join(ROOT, 'data', 'words.json'), encoding='utf-8'))
assert len(T) == len(WORDS), 'words.json passt nicht zum Text (%d vs %d)' % (len(T), len(WORDS))
def snap(x): return round(round(x * FPS) / FPS, 4)
END = snap(T[-1]['e'] + 1.1)   # Schluss steht nach dem letzten Wort noch ~1 s
scenes = []
for n, (id, st, k) in enumerate(S):
    start = 0.0 if n == 0 else snap(T[st]['s'] - 0.07)
    end = END if n == len(S) - 1 else snap(T[S[n + 1][1]]['s'] - 0.07)
    kk = {name: round(T[i]['s'] - start, 3) for name, i in k.items()}
    scenes.append({'id': id, 'start': start, 'end': end, 'dur': round(end - start, 4), 'k': kk})
TLJ = {'end': END, 'fps': FPS, 'scenes': [{'id': s['id'], 'start': s['start'], 'end': s['end'], 'k': {n: round(s['start'] + v, 3) for n, v in s['k'].items()}} for s in scenes],
       'words': [[snap(w['s']), snap(w['e'])] for w in T]}
json.dump(TLJ, open(os.path.join(ROOT, 'data', 'timeline.json'), 'w'), indent=1)
if '--timeline' in sys.argv:
    for s in scenes: print('  %-10s %6.2f-%6.2f (%4.2f)  %s' % (s['id'], s['start'], s['end'], s['dur'], s['k']))
    sys.exit(0)

# ---------- Hintergrund 25.11. (enno, Chris Moran TikTok 13): Graustufen-Collage (2-3 Themenbilder, schraeg, angeschnitten) in einer Precomp,
# darueber Tint (Schwarz: Map Black #111111 / Map White #615E59, Weiss: Map Black #A9A6A0 / Map White #F4F1EA = Bildkontrast ~30 %),
# Grunge-Textur niedrig deckend, Grundplatte + Collage driften/zoomen langsam. KEINE Farbfamilien mehr: Schwarz/Weiss im Wechsel je 2 Szenen.
MODE = {}
for n, sid in enumerate(SIDS):
    MODE[sid] = 'schwarz' if (n // 2) % 2 == 0 else 'weiss'
MODE['outro'] = 'schwarz'   # Schluss wie bei Apollo dunkel (Logo-Kreis + "In der Bio" hell, Lehre Runde 2)
THEMEN = {'hook': ['labor', 'schale', 'portrait'], 'london': ['hospital', 'fleming'], 'labor': ['schale', 'stern', 'portrait'],
          'schale': ['pilz', 'stern', 'labor'], 'neugierig': ['schale', 'pilz', 'fleming'], 'folge': ['flaschen', 'kultur', 'schale'],
          'kaum': ['labor', 'stern', 'pilz'], 'oxford': ['gruppe', 'flaschen', 'kultur'], 'krieg': ['flaschen', 'kultur', 'oxford'],
          'nobel': ['fleming', 'oxford', 'portrait'], 'frage': ['labor', 'stern', 'pilz'], 'outro': ['schale', 'fleming', 'plakat']}
TINT = {'schwarz': ('#111111', '#615E59'), 'weiss': ('#A9A6A0', '#F4F1EA')}
LAGEN = [   # (x, y, Breite, Drehung) in Bildschirm-Koordinaten; bewusst ueber den Rand angeschnitten
    [(250, 330, 1050, -14), (840, 1080, 1000, 11), (330, 1700, 1100, -5)],
    [(820, 300, 1100, 9), (220, 980, 1000, -16), (700, 1680, 1150, 6)],
    [(380, 420, 1150, 6), (880, 1250, 950, -18), (120, 1650, 1000, 12)],
]
rnd = random.Random(27)
SCHICHT = {}
for n, s in enumerate(scenes):
    th = THEMEN[s['id']]; lage = LAGEN[n % 3]; eb = []
    for j, fn in enumerate(th):
        x, y, w, r = lage[j]; d = s['dur']; sp = 14 + 8 * j; ang = rnd.uniform(0, 6.283)
        pw = Image.open(os.path.join(ROOT, 'archiv', 'g-%s.png' % fn)).size[0]; w = min(w, int(pw * 0.94))   # Drift 104 % x Precomp 104 % x Kamera/Punch: unter 110 % der echten Pixel
        eb.append({'rel': 'archiv/g-%s.png' % fn, 'x': x, 'y': y, 'w': w, 'rot': r, 'dx': round(math.cos(ang) * sp * d, 1), 'dy': round(math.sin(ang) * sp * d, 1),
                   'drot': round(rnd.uniform(-1.2, 1.2), 2), 'op': [100, 94, 88][j]})
    m = MODE[s['id']]
    SCHICHT[s['id']] = {'mode': m, 'tint': TINT[m], 'grund': 'archiv/b-%s.jpg' % m, 'grunge': 'archiv/t-grunge-%s.jpg' % ('hell' if m == 'schwarz' else 'dunkel'), 'ebenen': eb}

cred = json.load(open(os.path.join(ROOT, 'archiv', 'credits.json'), encoding='utf-8'))
BILDER = json.load(open(os.path.join(ROOT, 'data', 'bilder.json')))
KI = {}   # keine KI-Bilder (nur echte Fotos)
TITLE = 'Short 27.11. Penicillin (penicillin)'
_WJ = json.load(open(os.path.join(ROOT, 'data', 'words.json'), encoding='utf-8'))
UTW = []   # PC 25.11. (enno): Untertitel wieder von uns, Stil wie Beethoven 17.11.: ein Wort, Zeitraum bis zum naechsten Wort
for _i, _w in enumerate(_WJ):
    _t = re.sub(r'^[\"„“‚‘(]+|[\"“”’).,;:!?…]+$', '', _w['w'].strip())
    if not _t: continue
    _nx = _WJ[_i + 1]['s'] if _i + 1 < len(_WJ) else END
    _e2 = _nx if _nx - _w['e'] < 0.45 else _w['e'] + 0.2
    UTW.append({'w': _t, 's': round(_w['s'], 3), 'e2': round(min(_e2, END), 3)})
D = {'title': TITLE, 'key': KEY, 'end': END, 'scenes': scenes, 'words': UTW,
     'schicht': SCHICHT, 'bilder': BILDER, 'alpha': {k: v['alpha'] for k, v in BILDER.items() if 'alpha' in v}, 'ki': KI,
     'credits': {k: v['kurz'] for k, v in cred.items()}, 'audio': ['audio/penicillin_mix.wav']}
base = PC_BASE if '--cloud' not in sys.argv else os.path.abspath(ROOT).replace('\\', '/') + '/'
head = ('// Short 27.11.2026 "Nobelpreis fuer ein unordentliches Labor" (key penicillin), lebendiger Vox, Tint-Collage-Hintergruende Schwarz/Weiss, Untertitel von uns (After Effects 2023, 25 fps)\n'
        '// erzeugt von gen/gen_penicillin.py, nicht von Hand aendern. Lauf ueber die Bridge: node edit-tools\\ae.mjs <diese Datei> 900000\n'
        'var BASE = %s;\nvar FPS = %d, W = 1080, H = 1920;\nvar D = %s;\n') % (json.dumps(base), FPS, json.dumps(D, ensure_ascii=False, separators=(',', ':')))
libs = ''.join(open(os.path.join(ROOT, 'jsx', f), encoding='utf-8').read() + '\n' for f in ('vox_lib.jsx', 'vox_plus.jsx', 'grund_lib.jsx', 'bitcoin_lib.jsx', 'penicillin_lib.jsx', 'scenes_penicillin.jsx', 'main_penicillin.jsx'))
libs = libs.replace('var KEYP = "roosevelt ";', 'var KEYP = "penicillin ";')
out = os.path.join(ROOT, 'jsx', 'build_penicillin.jsx' if '--cloud' not in sys.argv else 'build_penicillin_cloud.jsx')
open(out, 'w', encoding='utf-8').write(head + libs)
print('geschrieben:', out, '| Laenge %.2f s' % END)
for s in scenes: print('  %-10s %6.2f-%6.2f (%4.2f)  %s' % (s['id'], s['start'], s['end'], s['dur'], s['k']))
if '--cloud' in sys.argv: sys.exit(0)

NAME = TITLE + ' (9x16)'
snaps = []
t = 0.4
while t < END - 0.1: snaps.append(round(t, 2)); t += 0.8
for s in scenes:
    snaps.append(round(s['end'] - 0.12, 2))
    for nm, v in s['k'].items(): snaps.append(round(s['start'] + v + 0.45, 2))
snaps = sorted(set(x for x in snaps if x < END - 0.05))
FIND = ('var comp = null; for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof CompItem && it.name === NAME) comp = it; }\n'
        'if (!comp) return "Comp fehlt: " + NAME;\n')
SNAP_BODY = r'''
new Folder(BASE + "out/png").create(); app.beginSuppressDialogs();
try { app.purge(PurgeTarget.ALL_CACHES); } catch (e0) {}
var res = comp.resolutionFactor; comp.resolutionFactor = [2, 2]; var out = [];
for (var k = 0; k < T.length; k++) {
  if (k > 0 && k % 20 === 0) { try { app.purge(PurgeTarget.ALL_CACHES); } catch (e1) {} }
  var f = new File(BASE + "out/png/wr_" + ("0000" + Math.round(T[k] * 100)).slice(-5) + ".png");
  try { comp.saveFrameToPng(T[k], f); out.push(f.name); } catch (e) { out.push("FEHLER " + T[k] + ": " + e); } }
comp.resolutionFactor = res; try { app.purge(PurgeTarget.ALL_CACHES); } catch (e2) {}
app.endSuppressDialogs(false);
return out.length + " PNGs (werden asynchron geschrieben, ca. 1 Minute warten)\n" + out.join("\n");
'''
snapjs = ('// Standbilder der Master-Comp -> out/png/ (halbe Aufloesung, alle 0,8 s, kurz nach jedem Schluesselwort, kurz vor jedem Schnitt).\n'
          '// Lauf: node edit-tools\\ae.mjs <diese Datei> 900000\n'
          'var BASE = %s; var T = %s; var NAME = %s;\n' % (json.dumps(base), json.dumps(snaps), json.dumps(NAME)) + FIND + SNAP_BODY)
open(os.path.join(ROOT, 'jsx', 'snap_penicillin.jsx'), 'w', encoding='utf-8').write(snapjs)
RENDER_BODY = r'''
if (Math.abs(comp.frameRate - 25) > 0.01) return "Comp hat " + comp.frameRate + " fps statt 25 - bitte neu bauen";
new Folder(BASE + "out").create();
app.beginSuppressDialogs();
try { app.purge(PurgeTarget.ALL_CACHES); } catch (e0) {}
var rq = app.project.renderQueue;
for (var r = rq.numItems; r >= 1; r--) if (rq.item(r).status !== RQItemStatus.DONE && rq.item(r).comp === comp) rq.item(r).remove();
for (var r2 = 1; r2 <= rq.numItems; r2++) if (rq.item(r2).status === RQItemStatus.QUEUED) rq.item(r2).render = false;
var teile = TEILE ? [[0, SPLIT, "penicillin_teil1"], [SPLIT, comp.duration - SPLIT, "penicillin_teil2"]] : [[0, comp.duration, "penicillin_vox"]];
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
  try { app.purge(PurgeTarget.ALL_CACHES); } catch (e3) {}
}
app.project.save();
app.endSuppressDialogs(false);
return "Fertig in " + Math.round((new Date().getTime() - t0) / 1000) + " s, Vorlage: " + (tpl || "Standard (kein H.264)") + "\n" + log.join("\n");
'''
def renderjs(teile):
    return ('// Rendert die Master-Comp in voller Aufloesung als H.264 ("Match Render Settings - 40 Mbps"), 25 fps. NUR enno startet das (nach "Render frei").\n'
            '// TEILE = false: ein Stueck -> out/penicillin_vox.mp4 | TEILE = true: zwei Haelften -> out/penicillin_teil1.mp4 + out/penicillin_teil2.mp4\n'
            'var BASE = %s; var NAME = %s; var TEILE = %s; var SPLIT = 30;\n' % (json.dumps(base), json.dumps(NAME), 'true' if teile else 'false') + FIND + RENDER_BODY)
open(os.path.join(ROOT, 'jsx', 'render_penicillin.jsx'), 'w', encoding='utf-8').write(renderjs(False))
open(os.path.join(ROOT, 'jsx', 'render_penicillin_teile.jsx'), 'w', encoding='utf-8').write(renderjs(True))
print('snap + render geschrieben,', len(snaps), 'Standbilder')
for nm in ('build_penicillin', 'plugin_check', 'snap_penicillin', 'render_penicillin', 'render_penicillin_teile'):
    src = open(os.path.join(ROOT, 'jsx', nm + '.jsx'), encoding='utf-8').read()
    wrap = ('// HAND-VERSION fuer After Effects: Datei > Skripte > Skriptdatei ausfuehren.\n(function () {\n'
            'var __r = (function () {\n' + src + '\n})();\n' + (
            'try { var __b = %s; new Folder(__b + "out").create(); var __f = new File(__b + "out/ergebnis_%s.txt"); __f.encoding = "UTF-8"; __f.open("w"); __f.write(String(__r)); __f.close(); } catch (e) {}\n'
            'alert(String(__r).substr(0, 1500));\n})();\n') % (json.dumps(base), nm))
    open(os.path.join(ROOT, 'jsx', 'HAND_' + nm + '.jsx'), 'w', encoding='utf-8').write(wrap)
print('Hand-Versionen geschrieben')
