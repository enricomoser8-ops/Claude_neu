# Baut jsx/build_roosevelt.jsx (Short 17.11.2026, "Angeschossen und trotzdem weitergeredet", Hintergrund-Vox-Stil, Vorlage ae-jessop 16.11.) aus Daten:
# data/words.json (Wortzeiten, words_roosevelt.py), data/grund.json (hintergrund_roosevelt.py), archiv/credits.json. 25 fps.
# Dazu snap/render (+ render in zwei Haelften) und die HAND_*-Versionen.
# Aufruf: python3 gen_roosevelt.py [--timeline] [--cloud]   (--cloud: BASE = Cloud-Ordner, nur fuer den Trockenlauf)
import json, os, re, sys
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
KEY = 'roosevelt'
PC_BASE = 'C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-17/ae-roosevelt/'
FPS = 25
# gesprochener Text (= Skript; ASR ohne Abweichung ausser Schreibweise 1912/50)
TEXT = open(os.path.join(ROOT, 'data', 'text_gesprochen.txt'), encoding='utf-8').read().strip()
WORDS = TEXT.split()
def norm(w): return re.sub(r'[^a-z0-9äöüß]', '', w.lower())
NUM = {'neunzehnhundertzwölf': '1912', 'fünfzig': '50'}
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
i_es = findC('Es'); i_1912 = findC('Neunzehnhundertzwölf'); i_er = findC('Er'); i_da = findC('Da'); i_folge = findC('Folge')
i_er2 = findC('Er', i_folge); i_auf = findC('Auf'); i_dann = findC('Dann'); i_doch = findC('Doch'); i_fuenf = findC('Fünfzig')
i_dar = find('darunter'); i_seine = findC('Seine'); i_die = findC('Die', i_seine); i_haett = findC('Hättest'); i_du = findC('Du', i_haett)
sc('hook', 0, mann=find('Mann'), brust=find('Brust'), stunde=find('Stunde'), rede=find('Rede'))
sc('name', i_es, theodore=find('Theodore'), roosevelt=find('Roosevelt'), nach=find('nach'), teddy=find('Teddybär'), benannt=find('benannt'))
sc('wahl', i_1912, jahr=i_1912, praesident=find('Präsident'), usa=find('USA'))
sc('auto', i_er, steht=find('steht', i_er), auto=find('Auto'), winkt=find('winkt'), menge=find('Menge'))
sc('schuss', i_da, schiesst=find('schießt'), ihn=find('ihn', i_da), wankt=find('wankt'), bleibt=find('bleibt', i_da), stehen=find('stehen'))
sc('folge', i_folge, schlauer=find('schlauer'))
sc('halle', i_er2, blut=find('Blut'), krankenhaus=find('Krankenhaus'), sondern=find('sondern'), halle=find('Halle'))
sc('buehne', i_auf, buehne=find('Bühne'), sagt=find('sagt'), ich=find('Ich', i_auf), angeschossen=find('angeschossen'))
sc('hemd', i_dann, weste=find('Weste'), zeigt=find('zeigt'), blutiges=find('blutiges'), hemd=find('Hemd'))
sc('tasche', i_doch, verrueckt=find('Verrückteste'), brusttasche=find('Brusttasche'), seine=find('seine', i_doch), rede=find('Rede', i_doch))
sc('seiten', i_fuenf, seiten=find('Seiten'), gefaltet=find('gefaltet'))
sc('etui', i_dar, etui=find('Brillenetui'), stahl=find('Stahl'), beides=find('Beides'), kugel=find('Kugel', i_dar), gebremst=find('gebremst'))
sc('gerettet', i_seine, rede=find('Rede', i_seine), leben=find('Leben'), gerettet=find('gerettet'))
sc('kugel', i_die, kugel=find('Kugel', i_die), bleibt=find('bleibt', i_die), tod=find('Tod'), brust=find('Brust', i_die))
sc('frage', i_haett, weiter=find('weitergeredet'))
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

TITLE = 'Short 17.11. Roosevelt (roosevelt)'
D = {'title': TITLE, 'key': KEY, 'end': END, 'scenes': scenes, 'words': words, 'grund': GR, 'alpha': ALPHA,
     'credits': {k: v['kurz'] for k, v in cred.items()}, 'audio': ['audio/roosevelt_mix.wav']}
base = PC_BASE if '--cloud' not in sys.argv else os.path.abspath(ROOT).replace('\\', '/') + '/'
head = ('// Short "Roosevelt angeschossen" (17.11.2026) im Hintergrund-Vox-Stil (After Effects 2023, 25 fps) - erzeugt von gen/gen_roosevelt.py, nicht von Hand aendern.\n'
        '// Lauf ueber die Bridge: node edit-tools\\ae.mjs <diese Datei> 900000\n'
        'var BASE = %s;\nvar FPS = %d, W = 1080, H = 1920;\nvar D = %s;\n') % (json.dumps(base), FPS, json.dumps(D, ensure_ascii=False, separators=(',', ':')))
body = ''.join(open(os.path.join(ROOT, 'jsx', f), encoding='utf-8').read() + '\n' for f in ('vox_lib.jsx', 'vox_plus.jsx', 'grund_lib.jsx', 'scenes_roosevelt.jsx', 'main_roosevelt.jsx'))
out = os.path.join(ROOT, 'jsx', 'build_roosevelt.jsx' if '--cloud' not in sys.argv else 'build_roosevelt_cloud.jsx')
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
  var f = new File(BASE + "out/png/roos_" + ("0000" + Math.round(T[k] * 100)).slice(-5) + ".png");
  try { comp.saveFrameToPng(T[k], f); out.push(f.name); } catch (e) { out.push("FEHLER " + T[k] + ": " + e); } }
comp.resolutionFactor = res; try { app.purge(PurgeTarget.ALL_CACHES); } catch (e2) {}
app.endSuppressDialogs(false);
return out.length + " PNGs (werden asynchron geschrieben, ein paar Sekunden warten)\n" + out.join("\n");
'''
snapjs = ('// Standbilder der Master-Comp -> out/png/ (halbe Aufloesung, ~1 je Sekunde, Einstieg dichter, kurz vor jedem Schnitt).\n'
          '// Speicher: leert vorher alle Caches und danach alle 20 Bilder (app.purge); Comp nur waehrenddessen auf Halb, danach wieder wie vorher.\n'
          '// Lauf: node edit-tools\\ae.mjs <diese Datei> 900000\n'
          'var BASE = %s; var T = %s; var NAME = %s;\n' % (json.dumps(base), json.dumps(snaps), json.dumps(NAME)) + FIND + SNAP_BODY)
open(os.path.join(ROOT, 'jsx', 'snap_roosevelt.jsx'), 'w', encoding='utf-8').write(snapjs)
RENDER_BODY = r'''
if (Math.abs(comp.frameRate - 25) > 0.01) return "Comp hat " + comp.frameRate + " fps statt 25 - bitte neu bauen";
new Folder(BASE + "out").create();
app.beginSuppressDialogs();
try { app.purge(PurgeTarget.ALL_CACHES); } catch (e0) {}
var rq = app.project.renderQueue;
for (var r = rq.numItems; r >= 1; r--) if (rq.item(r).status !== RQItemStatus.DONE && rq.item(r).comp === comp) rq.item(r).remove();
for (var r2 = 1; r2 <= rq.numItems; r2++) if (rq.item(r2).status === RQItemStatus.QUEUED) rq.item(r2).render = false;   // andere Auftraege nicht mitrendern
var teile = TEILE ? [[0, SPLIT, "roosevelt_teil1"], [SPLIT, comp.duration - SPLIT, "roosevelt_teil2"]] : [[0, comp.duration, "roosevelt_vox"]];
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
            '// TEILE = false: ein Stueck -> out/roosevelt_vox.mp4 | TEILE = true: zwei Haelften 0-25 s und 25 s-Ende nacheinander\n'
            '//   -> out/roosevelt_teil1.mp4 + out/roosevelt_teil2.mp4 (dazwischen werden alle Caches geleert; gegen "zu wenig Speicher").\n'
            '// Lauf: node edit-tools\\ae.mjs <diese Datei> 1800000\n'
            'var BASE = %s; var NAME = %s; var TEILE = %s; var SPLIT = 25;\n' % (json.dumps(base), json.dumps(NAME), 'true' if teile else 'false') + FIND + RENDER_BODY)
open(os.path.join(ROOT, 'jsx', 'render_roosevelt.jsx'), 'w', encoding='utf-8').write(renderjs(False))
open(os.path.join(ROOT, 'jsx', 'render_roosevelt_teile.jsx'), 'w', encoding='utf-8').write(renderjs(True))
print('snap + render (+ render_teile) geschrieben,', len(snaps), 'Standbilder')
for nm in ('build_roosevelt', 'plugin_check', 'snap_roosevelt', 'render_roosevelt', 'render_roosevelt_teile'):
    src = open(os.path.join(ROOT, 'jsx', nm + '.jsx'), encoding='utf-8').read()
    wrap = ('// HAND-VERSION fuer After Effects: Datei > Skripte > Skriptdatei ausfuehren.\n(function () {\n'
            'var __r = (function () {\n' + src + '\n})();\n' + (
            'try { var __b = %s; new Folder(__b + "out").create(); var __f = new File(__b + "out/ergebnis_%s.txt"); __f.encoding = "UTF-8"; __f.open("w"); __f.write(String(__r)); __f.close(); } catch (e) {}\n'
            'alert(String(__r).substr(0, 1500));\n})();\n') % (json.dumps(base), nm))
    open(os.path.join(ROOT, 'jsx', 'HAND_' + nm + '.jsx'), 'w', encoding='utf-8').write(wrap)
print('Hand-Versionen geschrieben')
