# Baut jsx/build_weltkrieg.jsx (+ snap/render/HAND-Versionen) fuer Short 2 vom 12.11.2026:
# "Der Erste Weltkrieg beginnt mit einem Auto, das falsch abbiegt" (Sarajevo 1914), Vox-Stil, After Effects 2023.
# Zeiten: data/words.json (gen/words_weltkrieg.py). Daten: shapes_weltkrieg.py, data/europa.json, data/bilder.json, archiv/credits.json.
# Aufruf: python3 gen_weltkrieg.py [--cloud]   (--cloud: BASE = dieser Ordner, fuer den Trockenlauf mit aemock.js)
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
sys.path.insert(0, HERE)
import shapes_weltkrieg
KEY = 'weltkrieg'
PC_BASE = 'C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-12/ae-weltkrieg/'
TITLE = 'WK Weltkrieg-Short 12.11.'                  # oberster AE-Ordner (nur dieser wird ersetzt)
MASTER = TITLE + ' (9x16)'
FPS = 30
TEXT = re.search(r'Short 2 .*?```\n\[snappy, fast pace\] (.*?)\n```', open(os.path.join(ROOT, '..', 'skripte.md'), encoding='utf-8').read(), re.S).group(1)
WORDS = TEXT.split()
def norm(w): return re.sub(r'[^a-z0-9äöüß]', '', w.lower())
NUM = {'neunzehnhundertvierzehn': '1914', 'neunzehnjährigen': '19-Jährigen'}
def find(word, after=0):
    for i in range(after, len(WORDS)):
        if norm(WORDS[i]) == norm(word): return i
    raise SystemExit('Wort nicht gefunden: %s ab %d' % (word, after))
S = []
def sc(id, start, **k): S.append((id, start, k))
sc('hook', 0, weltkrieg=find('Weltkrieg'), auto=find('Auto'), falsch=find('falsch'))
sc('sarajevo', find('Sarajevo'), sarajevo=find('Sarajevo'), jahr=find('neunzehnhundertvierzehn'))
sc('thron', find('Franz'), franz=find('Franz'), kaiser=find('Kaiser'), oesterreich=find('Österreich-Ungarn'))
sc('wagen', find('fährt'), offenen=find('offenen'), wagen=find('Wagen'), stadt=find('Stadt'))
sc('bombe', find('Ein'), mann=find('Mann'), wirft=find('wirft'), bombe=find('Bombe'))
sc('abprall', find('Sie'), prallt=find('prallt'), ab=find('ab', find('Auto', 30)), menschen=find('Menschen'), dahinter=find('dahinter'))
sc('gescheitert', find('Der', 40), anschlag=find('Anschlag'), gescheitert=find('gescheitert'))
sc('cta', find('Folge'), folge=find('Folge'), schlauer=find('schlauer'), werden=find('werden', 50))
sc('krankenhaus', find('Danach'), franz=find('Franz', 50), verletzten=find('Verletzten'), krankenhaus=find('Krankenhaus'))
sc('route', find('Also'), route=find('Route'), geaendert=find('geändert'))
sc('fahrer', find('Doch'), doch=find('Doch'), fahrer=find('Fahrer'), nicht=find('nicht', 60))
sc('abbiegen', find('Der', 70), biegt=find('biegt'), falsch=find('falsch', 70), haelt=find('hält'), zurueck=find('zurücksetzen'))
sc('sekunden', find('Ein', 80), sekunden=find('Sekunden'), still=find('still'))
sc('ecke', find('Genau'), vor=find('vor', 90), neunzehn=find('Neunzehnjährigen'), attentaeter=find('Attentätern'))
sc('schuss', find('Er', 100), schiesst=find('schießt'), zweimal=find('zweimal'))
sc('tod', find('Franz', 104), frau=find('Frau'), sterben=find('sterben'))
sc('krieg', find('Einen'), monat=find('Monat'), spaeter=find('später'), krieg=find('Krieg', 110))
sc('waswaere', find('Was'), passiert=find('passiert'), richtig=find('richtig', 115), abgebogen=find('abgebogen'))
sc('outro', find('Du'), allgemeinwissen=find('Allgemeinwissen'), bio=find('Bio'), folgen=find('Folgen'))

T = json.load(open(os.path.join(ROOT, 'data', 'words.json'), encoding='utf-8'))
assert len(T) == len(WORDS), 'words.json passt nicht zum Skript (%d vs %d)' % (len(T), len(WORDS))
END = round(T[-1]['e'] + 1.6, 3)
def snap(x): return round(round(x * FPS) / FPS, 4)
scenes = []
for n, (id, st, k) in enumerate(S):
    start = 0.0 if n == 0 else snap(T[st]['s'] - 0.07)
    end = snap(END) if n == len(S) - 1 else snap(T[S[n + 1][1]]['s'] - 0.07)
    kk = {name: round(T[i]['s'] - start, 3) for name, i in k.items()}
    scenes.append({'id': id, 'start': start, 'end': end, 'dur': round(end - start, 4), 'k': kk})
words = []
for i, w in enumerate(WORDS):
    disp = NUM.get(norm(w), re.sub(r'[.,!?]+$', '', w))
    nxt = T[i + 1]['s'] if i + 1 < len(WORDS) else END
    words.append({'w': disp, 's': snap(T[i]['s']), 'e2': snap(min(nxt, T[i]['e'] + 0.5))})
cred = json.load(open(os.path.join(ROOT, 'archiv', 'credits.json'), encoding='utf-8'))
D = {'title': TITLE, 'master': MASTER, 'key': KEY, 'end': END, 'scenes': scenes, 'words': words,
     'shapes': shapes_weltkrieg.build(), 'europa': json.load(open(os.path.join(ROOT, 'data', 'europa.json'))),
     'img': json.load(open(os.path.join(ROOT, 'data', 'bilder.json'))),
     'credits': {k: v['kurz'] for k, v in cred.items()}, 'audio': ['audio/weltkrieg_mix.wav']}
base = PC_BASE if '--cloud' not in sys.argv else os.path.abspath(ROOT).replace('\\', '/') + '/'
head = ('// Short 2 vom 12.11.2026 (Sarajevo 1914) im Vox-Stil (After Effects 2023) - erzeugt von gen/gen_weltkrieg.py, nicht von Hand aendern.\n'
        '// Lauf ueber die Bridge: node edit-tools\\ae.mjs <diese Datei> 900000\n'
        'var BASE = %s;\nvar FPS = %d, W = 1080, H = 1920;\nvar D = %s;\n') % (json.dumps(base), FPS, json.dumps(D, ensure_ascii=False, separators=(',', ':')))
body = ''.join(open(os.path.join(ROOT, 'jsx', f), encoding='utf-8').read() + '\n' for f in ('vox_lib.jsx', 'lib_weltkrieg.jsx', 'scenes_weltkrieg.jsx', 'main_weltkrieg.jsx'))
out = os.path.join(ROOT, 'jsx', 'build_weltkrieg.jsx')
open(out, 'w', encoding='utf-8').write(head + body)
json.dump({'end': END, 'fps': FPS, 'scenes': [{'id': s['id'], 'start': s['start'], 'end': s['end'], 'k': {n: round(s['start'] + v, 3) for n, v in s['k'].items()}} for s in scenes],
           'words': [[w['s'], w['e2']] for w in words]}, open(os.path.join(ROOT, 'data', 'timeline.json'), 'w'), indent=1)
print('geschrieben:', out, '| Laenge %.2f s' % END)
for s in scenes: print('  %-12s %6.2f-%6.2f (%.2f)  %s' % (s['id'], s['start'], s['end'], s['dur'], s['k']))
# Standbilder: etwa 1 pro Sekunde (Mitte jeder Sekunde) + je Szene kurz vor dem Schnitt
snaps = sorted(set([round(t + 0.5, 2) for t in range(int(END))] + [round(s['end'] - 0.1, 2) for s in scenes]))
snapjs = ('// Standbilder der Master-Comp -> out/png/ (halbe Aufloesung). Lauf: node edit-tools\\ae.mjs <diese Datei> 900000\n'
          'var BASE = %s; var T = %s; var NAME = %s;\n' % (json.dumps(base), json.dumps(snaps), json.dumps(MASTER)) + r'''
var comp = null; for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof CompItem && it.name === NAME) comp = it; }
if (!comp) return "Comp fehlt: " + NAME;
new Folder(BASE + "out/png").create(); app.beginSuppressDialogs();
var res = comp.resolutionFactor; comp.resolutionFactor = [2, 2]; var out = [];
for (var k = 0; k < T.length; k++) { var f = new File(BASE + "out/png/wk_" + ("0000" + Math.round(T[k] * 100)).slice(-5) + ".png");
  try { comp.saveFrameToPng(T[k], f); out.push(f.name); } catch (e) { out.push("FEHLER " + T[k] + ": " + e); } }
comp.resolutionFactor = res; app.endSuppressDialogs(false);
return out.length + " PNGs\n" + out.join("\n");
''')
open(os.path.join(ROOT, 'jsx', 'snap_weltkrieg.jsx'), 'w', encoding='utf-8').write(snapjs)
render = ('// Rendert die Master-Comp in voller Aufloesung als H.264 nach out/weltkrieg_vox.mp4 (nur wenn enno es will; normal rendert er selbst).\n'
          '// Lauf: node edit-tools\\ae.mjs <diese Datei> 1800000\n'
          'var BASE = %s; var NAME = %s;\n' % (json.dumps(base), json.dumps(MASTER)) + r'''
var comp = null; for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof CompItem && it.name === NAME) comp = it; }
if (!comp) return "Comp fehlt: " + NAME;
app.beginSuppressDialogs();
var rq = app.project.renderQueue; for (var r = rq.numItems; r >= 1; r--) if (rq.item(r).status !== RQItemStatus.DONE) rq.item(r).remove();
var item = rq.items.add(comp);
try { item.applyTemplate("Best Settings"); } catch (e) {}
var om = item.outputModule(1), tpl = null;
for (var t0i = 0; t0i < om.templates.length && !tpl; t0i++) if (/H\.264/.test(om.templates[t0i]) && /Match Render/.test(om.templates[t0i]) && /40 Mbps/.test(om.templates[t0i])) tpl = om.templates[t0i];
for (var t1i = 0; t1i < om.templates.length && !tpl; t1i++) if (/H\.264/.test(om.templates[t1i]) && /40 Mbps/.test(om.templates[t1i])) tpl = om.templates[t1i];
if (!tpl) for (var t2 = 0; t2 < om.templates.length; t2++) if (/H\.264/.test(om.templates[t2])) { tpl = om.templates[t2]; break; }
if (tpl) om.applyTemplate(tpl);
om.file = new File(BASE + "out/weltkrieg_vox" + (tpl ? ".mp4" : ".mov"));
var t0 = new Date().getTime(); rq.render(); app.project.save();
app.endSuppressDialogs(false);
return "Fertig in " + Math.round((new Date().getTime() - t0) / 1000) + " s, Vorlage: " + (tpl || "Standard (kein H.264)") + " -> " + om.file.fsName;
''')
open(os.path.join(ROOT, 'jsx', 'render_weltkrieg.jsx'), 'w', encoding='utf-8').write(render)
print('snap + render geschrieben,', len(snaps), 'Standbilder')
for nm in ('build_weltkrieg', 'plugin_check', 'snap_weltkrieg', 'render_weltkrieg'):
    src = open(os.path.join(ROOT, 'jsx', nm + '.jsx'), encoding='utf-8').read()
    wrap = ('// HAND-VERSION fuer After Effects: Datei > Skripte > Skriptdatei ausfuehren.\n(function () {\n'
            'var __r = (function () {\n' + src + '\n})();\n' + (
            'try { var __b = %s; new Folder(__b + "out").create(); var __f = new File(__b + "out/ergebnis_%s.txt"); __f.encoding = "UTF-8"; __f.open("w"); __f.write(String(__r)); __f.close(); } catch (e) {}\n'
            'alert(String(__r).substr(0, 1500));\n})();\n') % (json.dumps(base), nm))
    open(os.path.join(ROOT, 'jsx', 'HAND_' + nm + '.jsx'), 'w', encoding='utf-8').write(wrap)
print('Hand-Versionen geschrieben')
