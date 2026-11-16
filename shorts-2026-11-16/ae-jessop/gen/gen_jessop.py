# Baut jsx/build_jessop.jsx (Short 16.11.2026, "Die Frau, die drei Schiffsungluecke ueberlebte", Hintergrund-Vox-Stil, Vorlage ae-freiheit Runde 2) aus Daten:
# data/words.json (Wortzeiten, words_jessop.py), data/grund.json (hintergrund_jessop.py), archiv/credits.json. 25 fps.
# Dazu snap/render (+ render in zwei Haelften) und die HAND_*-Versionen.
# Aufruf: python3 gen_jessop.py [--timeline] [--cloud]   (--cloud: BASE = Cloud-Ordner, nur fuer den Trockenlauf)
import json, os, re, sys
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
KEY = 'jessop'
PC_BASE = 'C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-16/ae-jessop/'
FPS = 25
# gesprochener Text (= Skript, ASR ohne Abweichung)
TEXT = open(os.path.join(ROOT, 'data', 'text_gesprochen.txt'), encoding='utf-8').read().strip()
WORDS = TEXT.split()
def norm(w): return re.sub(r'[^a-z0-9äöüß]', '', w.lower())
NUM = {'neunzehnhundertelf': '1911'}
def find(word, after=0):
    for i in range(after, len(WORDS)):
        if norm(WORDS[i]) == norm(word): return i
    raise SystemExit('Wort nicht gefunden: %s ab %d' % (word, after))
def findC(word, after=0):   # Satzanfaenge: Gross-/Kleinschreibung beachten ("Die" != "die")
    for i in range(after, len(WORDS)):
        if re.sub(r'[.,!?:]+$', '', WORDS[i]) == word: return i
    raise SystemExit('Wort nicht gefunden: %s ab %d' % (word, after))
S = []
def sc(id, start, **k): S.append((id, start, k))
i_und = findC('Und'); i_sie = findC('Sie'); i_1911 = findC('Neunzehnhundertelf'); i_kurz = findC('Kurz'); i_sieben = findC('Sieben')
i_ein = findC('Ein'); i_folge = findC('Folge'); i_doch = findC('Doch'); i_eine = findC('Eine'); i_ihr = findC('Ihr'); i_sie2 = findC('Sie', i_ihr)
i_aber = findC('Aber'); i_haett = findC('Hättest'); i_du = findC('Du', i_haett)
sc('hook', 0, frau=find('Frau'), titanic=find('Titanic'), sank=find('sank'))
sc('einzig', i_und, nicht=find('nicht', i_und), einziges=find('einziges'), unglueck=find('Schiffsunglück'))
sc('gaeste', i_sie, stewardess=find('Stewardess'), bord=find('Bord'), gaeste=find('Gäste'))
sc('olympic', i_1911, jahr=i_1911, olympic=find('Olympic', i_1911), schwester=find('Schwesterschiff', i_1911), titanic=find('Titanic', i_1911))
sc('hawke', i_kurz, ablegen=find('Ablegen'), kracht=find('kracht'), kriegsschiff=find('Kriegsschiff'), seite=find('Seite'), olympic=find('Olympic', i_kurz), oben=find('oben'))
sc('titanic', i_sieben, monate=find('Monate'), titanic=find('Titanic', i_sieben), eisberg=find('Eisberg'))
sc('baby', i_ein, offizier=find('Offizier'), baby=find('Baby'), arm=find('Arm'), schickt=find('schickt'), boot=find('Rettungsboot', i_ein))
sc('folge', i_folge, schlauer=find('schlauer'))
sc('britannic', i_doch, pech=find('Pech'), weltkrieg=find('Weltkrieg'), schwester=find('Krankenschwester'), britannic=find('Britannic'), dritten=find('dritten'))
sc('mine', i_eine, mine=find('Mine'), reisst=find('reißt'))
sc('schrauben', i_ihr, boot=find('Rettungsboot', i_ihr), treibt=find('treibt'), drehenden=find('drehenden'), schrauben=find('Schiffsschrauben'))
sc('springt', i_sie2, springt=find('springt'), wasser=find('Wasser'), schwimmen=find('schwimmen'), ueberlebt=find('überlebt'))
sc('twist', i_aber, verrueckt=find('Verrückteste'), danach=find('Danach'), jahre=find('Jahre'), see=find('See'))
sc('frage', i_haett, getraut=find('getraut'))
sc('outro', i_du, allgemeinwissen=find('Allgemeinwissen'), bio=find('Bio'), folgen=find('Folgen', find('Bio')))

T = json.load(open(os.path.join(ROOT, 'data', 'words.json'), encoding='utf-8'))
assert len(T) == len(WORDS), 'words.json passt nicht zum Text (%d vs %d)' % (len(T), len(WORDS))
def snap(x): return round(round(x * FPS) / FPS, 4)
END = snap(T[-1]['e'] + 1.6)
scenes = []
for n, (id, st, k) in enumerate(S):
    start = 0.0 if n == 0 else snap(T[st]['s'] - 0.07)
    end = END if n == len(S) - 1 else snap(T[S[n + 1][1]]['s'] - 0.07)
    kk = {name: round(T[i]['s'] - start, 3) for name, i in k.items()}
    scenes.append({'id': id, 'start': start, 'end': end, 'dur': round(end - start, 4), 'k': kk})
words = []
for i, w in enumerate(WORDS):
    disp = NUM.get(norm(w), re.sub(r'[.,!?:]+$', '', w))
    nxt = T[i + 1]['s'] if i + 1 < len(WORDS) else END
    words.append({'w': disp, 's': snap(T[i]['s']), 'e2': snap(min(nxt, T[i]['e'] + 0.35))})
TLJ = {'end': END, 'fps': FPS, 'scenes': [{'id': s['id'], 'start': s['start'], 'end': s['end'], 'k': {n: round(s['start'] + v, 3) for n, v in s['k'].items()}} for s in scenes], 'words': [[w['s'], w['e2']] for w in words]}
json.dump(TLJ, open(os.path.join(ROOT, 'data', 'timeline.json'), 'w'), indent=1)
if '--timeline' in sys.argv:
    for s in scenes: print('  %-9s %6.2f-%6.2f (%4.2f)' % (s['id'], s['start'], s['end'], s['dur']))
    sys.exit(0)
cred = json.load(open(os.path.join(ROOT, 'archiv', 'credits.json'), encoding='utf-8'))
GR = json.load(open(os.path.join(ROOT, 'data', 'grund.json')))
assert set(GR) == set(x['id'] for x in scenes), 'grund.json passt nicht zu den Szenen'
for sid, g in GR.items():
    assert abs(g['keys'][-1]['t'] - next(x['dur'] for x in scenes if x['id'] == sid)) < 0.02, 'Fahrt-Ende passt nicht: ' + sid
# sichtbarer Bereich (Alpha) der Freisteller, fuer das Kreuz ueber das ganze Motiv
ALPHA = {}
for f in sorted(os.listdir(os.path.join(ROOT, 'archiv'))):
    if f.endswith('.png'):
        im = Image.open(os.path.join(ROOT, 'archiv', f))
        if im.mode == 'RGBA': ALPHA[f] = list(im.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox())

TITLE = 'Short 16.11. Titanic-Stewardess (jessop)'
D = {'title': TITLE, 'key': KEY, 'end': END, 'scenes': scenes, 'words': words, 'grund': GR, 'alpha': ALPHA,
     'credits': {k: v['kurz'] for k, v in cred.items()}, 'audio': ['audio/jessop_mix.wav']}
base = PC_BASE if '--cloud' not in sys.argv else os.path.abspath(ROOT).replace('\\', '/') + '/'
head = ('// Short "Titanic-Stewardess" (16.11.2026) im Hintergrund-Vox-Stil (After Effects 2023, 25 fps) - erzeugt von gen/gen_jessop.py, nicht von Hand aendern.\n'
        '// Lauf ueber die Bridge: node edit-tools\\ae.mjs <diese Datei> 900000\n'
        'var BASE = %s;\nvar FPS = %d, W = 1080, H = 1920;\nvar D = %s;\n') % (json.dumps(base), FPS, json.dumps(D, ensure_ascii=False, separators=(',', ':')))
body = ''.join(open(os.path.join(ROOT, 'jsx', f), encoding='utf-8').read() + '\n' for f in ('vox_lib.jsx', 'vox_plus.jsx', 'grund_lib.jsx', 'scenes_jessop.jsx', 'main_jessop.jsx'))
out = os.path.join(ROOT, 'jsx', 'build_jessop.jsx' if '--cloud' not in sys.argv else 'build_jessop_cloud.jsx')
open(out, 'w', encoding='utf-8').write(head + body)
print('geschrieben:', out, '| Laenge %.2f s' % END)
for s in scenes: print('  %-9s %6.2f-%6.2f (%4.2f)  %s' % (s['id'], s['start'], s['end'], s['dur'], s['k']))
if '--cloud' in sys.argv: sys.exit(0)
NAME = TITLE + ' (9x16)'
snaps = []
t = 0.4
while t < END - 0.1: snaps.append(round(t, 2)); t += 1.0
for s in scenes: snaps.append(round(s['end'] - 0.12, 2))
snaps += [0.2, 0.6, 0.9, 1.4, 2.0]   # Einstieg dichter
snaps = sorted(set(snaps))
FIND = ('var comp = null; for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof CompItem && it.name === NAME) comp = it; }\n'
        'if (!comp) return "Comp fehlt: " + NAME;\n')
SNAP_BODY = r'''
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
'''
snapjs = ('// Standbilder der Master-Comp -> out/png/ (halbe Aufloesung, ~1 je Sekunde, Einstieg dichter, kurz vor jedem Schnitt).\n'
          '// Speicher: leert vorher alle Caches und danach alle 20 Bilder (app.purge); Comp nur waehrenddessen auf Halb, danach wieder wie vorher.\n'
          '// Lauf: node edit-tools\\ae.mjs <diese Datei> 900000\n'
          'var BASE = %s; var T = %s; var NAME = %s;\n' % (json.dumps(base), json.dumps(snaps), json.dumps(NAME)) + FIND + SNAP_BODY)
open(os.path.join(ROOT, 'jsx', 'snap_jessop.jsx'), 'w', encoding='utf-8').write(snapjs)
RENDER_BODY = r'''
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
'''
def renderjs(teile):
    return ('// Rendert die Master-Comp in voller Aufloesung als H.264 ("Match Render Settings - 40 Mbps", falls vorhanden), 25 fps.\n'
            '// TEILE = false: ein Stueck -> out/jessop_vox.mp4 | TEILE = true: zwei Haelften 0-25 s und 25 s-Ende nacheinander\n'
            '//   -> out/jessop_teil1.mp4 + out/jessop_teil2.mp4 (dazwischen werden alle Caches geleert; gegen "zu wenig Speicher").\n'
            '// Lauf: node edit-tools\\ae.mjs <diese Datei> 1800000\n'
            'var BASE = %s; var NAME = %s; var TEILE = %s; var SPLIT = 25;\n' % (json.dumps(base), json.dumps(NAME), 'true' if teile else 'false') + FIND + RENDER_BODY)
open(os.path.join(ROOT, 'jsx', 'render_jessop.jsx'), 'w', encoding='utf-8').write(renderjs(False))
open(os.path.join(ROOT, 'jsx', 'render_jessop_teile.jsx'), 'w', encoding='utf-8').write(renderjs(True))
print('snap + render (+ render_teile) geschrieben,', len(snaps), 'Standbilder')
for nm in ('build_jessop', 'plugin_check', 'snap_jessop', 'render_jessop', 'render_jessop_teile'):
    src = open(os.path.join(ROOT, 'jsx', nm + '.jsx'), encoding='utf-8').read()
    wrap = ('// HAND-VERSION fuer After Effects: Datei > Skripte > Skriptdatei ausfuehren.\n(function () {\n'
            'var __r = (function () {\n' + src + '\n})();\n' + (
            'try { var __b = %s; new Folder(__b + "out").create(); var __f = new File(__b + "out/ergebnis_%s.txt"); __f.encoding = "UTF-8"; __f.open("w"); __f.write(String(__r)); __f.close(); } catch (e) {}\n'
            'alert(String(__r).substr(0, 1500));\n})();\n') % (json.dumps(base), nm))
    open(os.path.join(ROOT, 'jsx', 'HAND_' + nm + '.jsx'), 'w', encoding='utf-8').write(wrap)
print('Hand-Versionen geschrieben')
