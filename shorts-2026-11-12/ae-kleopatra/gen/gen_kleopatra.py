# Baut jsx/build_kleopatra.jsx (Short 1 vom 12.11.2026, "Kleopatra lebte naeher an der Mondlandung ...") aus Daten:
# data/words.json (Wortzeiten, von words_kleopatra.py), data/karte.json (karte_kleopatra.py), archiv/credits.json.
# Aufruf: python3 gen_kleopatra.py [--cloud]   (--cloud: BASE = Cloud-Ordner, nur fuer den Trockenlauf)
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
KEY = 'kleopatra'
PC_BASE = 'C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-12/ae-kleopatra/'
FPS = 30
SCRIPT = open(os.path.join(ROOT, '..', 'skripte.md'), encoding='utf-8').read()
TEXT = re.search(r'## Short 1 .*?```\n\[snappy, fast pace\] (.*?)\n```', SCRIPT, re.S).group(1)
WORDS = TEXT.split()
def norm(w): return re.sub(r'[^a-z0-9äöüß]', '', w.lower())
NUM = {'viertausendfünfhundert': '4.500', 'zweitausendfünfhundert': '2.500', 'neunzehnhundertneunundsechzig': '1969', 'zweitausend': '2.000', 'zweihundert': '200'}
def find(word, after=0):
    for i in range(after, len(WORDS)):
        if norm(WORDS[i]) == norm(word): return i
    raise SystemExit('Wort nicht gefunden: %s ab %d' % (word, after))
S = []
def sc(id, start, **k): S.append((id, start, k))
i_klingt = find('Klingt'); i_die = find('Die'); i_k2 = find('Kleopatra', i_die); i_da = find('Da'); i_folge = find('Folge')
i_und = find('Und'); i_nur = find('Nur'); i_fuer = find('Für'); i_doch = find('Doch'); i_die2 = find('Die', i_doch)
i_ihr = find('Ihr'); i_am = find('Am', i_ihr); i_k5 = find('Kleopatra', i_am); i_hat = find('Hättest'); i_du = find('Du', find('gewusst') + 1)
sc('hook', 0, mond=find('Mondlandung'), bau=find('Bau'), pyramide=find('Pyramide'))
sc('rechnen', i_klingt, verrueckt=find('verrückt'), rechnen=find('Rechnen'))
sc('pyramide', i_die, cheops=find('Cheops-Pyramide'), aegypten=find('Ägypten'), zahl=find('viertausendfünfhundert'), gebaut=find('gebaut'))
sc('kleo', i_k2, zahl=find('zweitausendfünfhundert'), jahre=find('Jahre', i_k2), welt=find('Welt'))
sc('uralt', i_da, pyramide=find('Pyramide', i_da), laengst=find('längst'), uralt=find('uralt'))
sc('folge', i_folge, schlauer=find('schlauer'))
sc('mond', i_und, kleopatra=find('Kleopatra', i_und), mond=find('Mondlandung', i_und), zahl=find('neunzehnhundertneunundsechzig'))
sc('zweitausend', i_nur, zahl=find('zweitausend', i_nur), jahre=find('Jahre', i_nur))
sc('balken', i_fuer, kleo1=find('Kleopatra', i_fuer), pyramide=find('Pyramide', i_fuer), aelter=find('älter'), kleo2=find('Kleopatra', find('älter')), heute=find('heute'))
sc('seltsam', i_doch, seltsamer=find('seltsamer'))
sc('griechen', i_die2, koenigin=find('Königin'), aegyptens=find('Ägyptens'), familie=find('Familie'), griechen=find('Griechen'))
sc('alexander', i_ihr, vorfahre=find('Vorfahre'), general=find('General'), alexander=find('Alexander'), grossen=find('Großen', i_ihr))
sc('hof', i_am, griechisch=find('Griechisch'), zahl=find('zweihundert'), jahre=find('Jahre', i_am))
sc('aegyptisch', i_k5, soll=find('soll'), erste=find('Erste'), familie=find('Familie', i_k5), aeg=find('Ägyptisch'), lernte=find('lernte'))
sc('gewusst', i_hat, gewusst=find('gewusst'))
sc('outro', i_du, allgemeinwissen=find('Allgemeinwissen'), bio=find('Bio'), folgen=find('Folgen'))

T = json.load(open(os.path.join(ROOT, 'data', 'words.json'), encoding='utf-8'))
assert len(T) == len(WORDS), 'words.json passt nicht zum Skript (%d vs %d)' % (len(T), len(WORDS))
END = round(T[-1]['e'] + 1.6, 3)
def snap(x): return round(round(x * FPS) / FPS, 4)
END = snap(END)
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
cred = json.load(open(os.path.join(ROOT, 'archiv', 'credits.json'), encoding='utf-8'))
TITLE = 'Short 12.11. Kleopatra (kleopatra)'
D = {'title': TITLE, 'key': KEY, 'end': END, 'scenes': scenes, 'words': words,
     'karte': json.load(open(os.path.join(ROOT, 'data', 'karte.json'))),
     'credits': {k: v['kurz'] for k, v in cred.items()}, 'audio': ['audio/kleopatra_mix.wav']}
base = PC_BASE if '--cloud' not in sys.argv else os.path.abspath(ROOT).replace('\\', '/') + '/'
head = ('// Short "Kleopatra" (12.11.2026) im Vox-Stil (After Effects 2023) - erzeugt von gen/gen_kleopatra.py, nicht von Hand aendern.\n'
        '// Lauf ueber die Bridge: node edit-tools\\ae.mjs <diese Datei> 900000\n'
        'var BASE = %s;\nvar FPS = %d, W = 1080, H = 1920;\nvar D = %s;\n') % (json.dumps(base), FPS, json.dumps(D, ensure_ascii=False, separators=(',', ':')))
body = ''.join(open(os.path.join(ROOT, 'jsx', f), encoding='utf-8').read() + '\n' for f in ('vox_lib.jsx', 'vox_plus.jsx', 'scenes_kleopatra.jsx', 'main_kleopatra.jsx'))
out = os.path.join(ROOT, 'jsx', 'build_kleopatra.jsx' if '--cloud' not in sys.argv else 'build_kleopatra_cloud.jsx')
open(out, 'w', encoding='utf-8').write(head + body)
json.dump({'end': END, 'fps': FPS, 'scenes': [{'id': s['id'], 'start': s['start'], 'end': s['end'], 'k': {n: round(s['start'] + v, 3) for n, v in s['k'].items()}} for s in scenes],
           'words': [[w['s'], w['e2']] for w in words]}, open(os.path.join(ROOT, 'data', 'timeline.json'), 'w'), indent=1)
print('geschrieben:', out, '| Laenge %.2f s' % END)
for s in scenes: print('  %-11s %6.2f-%6.2f (%4.2f)  %s' % (s['id'], s['start'], s['end'], s['dur'], s['k']))
if '--cloud' in sys.argv: sys.exit(0)
NAME = TITLE + ' (9x16)'
snaps = []
t = 0.4
while t < END - 0.1: snaps.append(round(t, 2)); t += 1.0
for s in scenes: snaps.append(round(s['end'] - 0.1, 2))
snaps = sorted(set(snaps))
snapjs = ('// Standbilder der Master-Comp -> out/png/ (halbe Aufloesung, ~1 je Sekunde + kurz vor jedem Schnitt). Lauf: node edit-tools\\ae.mjs <diese Datei> 900000\n'
          'var BASE = %s; var T = %s; var NAME = %s;\n' % (json.dumps(base), json.dumps(snaps), json.dumps(NAME)) + r'''
var comp = null; for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof CompItem && it.name === NAME) comp = it; }
if (!comp) return "Comp fehlt: " + NAME;
new Folder(BASE + "out/png").create(); app.beginSuppressDialogs();
var res = comp.resolutionFactor; comp.resolutionFactor = [2, 2]; var out = [];
for (var k = 0; k < T.length; k++) { var f = new File(BASE + "out/png/kleo_" + ("0000" + Math.round(T[k] * 100)).slice(-5) + ".png");
  try { comp.saveFrameToPng(T[k], f); out.push(f.name); } catch (e) { out.push("FEHLER " + T[k] + ": " + e); } }
comp.resolutionFactor = res; app.endSuppressDialogs(false);
return out.length + " PNGs\n" + out.join("\n");
''')
open(os.path.join(ROOT, 'jsx', 'snap_kleopatra.jsx'), 'w', encoding='utf-8').write(snapjs)
render = ('// Rendert die Master-Comp in voller Aufloesung als H.264 nach out/kleopatra_vox.mp4 (enno rendert selbst; nur falls gewuenscht).\n'
          '// Lauf: node edit-tools\\ae.mjs <diese Datei> 1800000\n'
          'var BASE = %s; var NAME = %s;\n' % (json.dumps(base), json.dumps(NAME)) + r'''
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
''')
open(os.path.join(ROOT, 'jsx', 'render_kleopatra.jsx'), 'w', encoding='utf-8').write(render)
print('snap + render geschrieben,', len(snaps), 'Standbilder')
for nm in ('build_kleopatra', 'plugin_check', 'snap_kleopatra', 'render_kleopatra'):
    src = open(os.path.join(ROOT, 'jsx', nm + '.jsx'), encoding='utf-8').read()
    wrap = ('// HAND-VERSION fuer After Effects: Datei > Skripte > Skriptdatei ausfuehren.\n(function () {\n'
            'var __r = (function () {\n' + src + '\n})();\n' + (
            'try { var __b = %s; new Folder(__b + "out").create(); var __f = new File(__b + "out/ergebnis_%s.txt"); __f.encoding = "UTF-8"; __f.open("w"); __f.write(String(__r)); __f.close(); } catch (e) {}\n'
            'alert(String(__r).substr(0, 1500));\n})();\n') % (json.dumps(base), nm))
    open(os.path.join(ROOT, 'jsx', 'HAND_' + nm + '.jsx'), 'w', encoding='utf-8').write(wrap)
print('Hand-Versionen geschrieben')
