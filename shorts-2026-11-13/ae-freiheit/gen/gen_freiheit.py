# Baut jsx/build_freiheit.jsx (Short 2 vom 13.11.2026, "Die Freiheitsstatue war nicht immer gruen", Karten-Vox-Stil) aus Daten:
# data/words.json (Wortzeiten, words_freiheit.py), data/karte.json (karte_freiheit.py), data/globus.json (globus_freiheit.py),
# archiv/credits.json (archiv_freiheit.py). 25 fps.
# Aufruf: python3 gen_freiheit.py [--cloud]   (--cloud: BASE = Cloud-Ordner, nur fuer den Trockenlauf)
import json, math, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
KEY = 'freiheit'
PC_BASE = 'C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-13/ae-freiheit/'
FPS = 25
# gesprochener Text (Satz 6 spricht die Stimme umgestellt: "Ein Geruest aus Eisen ... gibt ihr Halt.")
TEXT = open(os.path.join(ROOT, 'data', 'text_gesprochen.txt'), encoding='utf-8').read().strip()
WORDS = TEXT.split()
def norm(w): return re.sub(r'[^a-z0-9äöüß]', '', w.lower())
NUM = {'neunzehnhundertsechs': '1906'}
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
i_am = findC('Am'); i_denn = findC('Denn'); i_die = findC('Die', i_denn); i_ein = findC('Ein', i_die); i_folge = findC('Folge')
i_doch = findC('Doch'); i_lang = findC('Langsam'); i_1906 = findC('Neunzehnhundertsechs'); i_der = findC('Der'); i_aber = findC('Aber')
i_und = findC('Und', i_aber); i_ihr = findC('Ihr'); i_also = findC('Also'); i_welche = findC('Welche'); i_du = findC('Du', i_welche)
sc('hook', 0, hafen=find('Hafen'), newyork=find('New'), statue=find('Freiheitsstatue'), und=find('Und'), nicht=find('nicht'), gruen=find('grün'))
sc('braun', i_am, anfang=find('Anfang'), glaenzt=find('glänzt'), braun=find('braun'), muenze=find('Kupfermünze'))
sc('geschenk', i_denn, kupfer=find('Kupfer', i_denn), geschenk=find('Geschenk'), frankreich=find('Frankreich'), usa=find('USA'))
sc('haut', i_die, kupferhaut=find('Kupferhaut'), dick=find('dick'), zwei=find('zwei'), muenzen=find('Münzen'))
sc('eiffel', i_ein, geruest=find('Gerüst'), eisen=find('Eisen'), gustave=find('Gustave'), mann=find('Mann'), turm=find('Eiffelturm'), gibt=find('gibt'), halt=find('Halt'))
sc('folge', i_folge, schlauer=find('schlauer'))
sc('regen', i_doch, kupfer=find('Kupfer', i_doch), reagiert=find('reagiert'), luft=find('Luft'), regen=find('Regen'))
sc('patina', i_lang, gruene=find('grüne', i_lang), schicht=find('Schicht', i_lang), patina=find('Patina', i_lang))
sc('rost', i_1906, statue=find('Statue', i_1906), gruen=find('grün', i_1906), viele=find('viele'), rost=find('Rost'))
sc('kongress', i_der, kongress=find('Kongress'), geld=find('Geld'), streichen=find('anzustreichen'))
sc('protest', i_aber, menschen=find('Menschen'), protest=find('protestieren'))
sc('pruefen', i_und, fachleute=find('Fachleute'), pruefen=find('prüfen'), gruene=find('grüne', i_und), schicht=find('Schicht', i_und))
sc('ergebnis', i_ihr, ergebnis=find('Ergebnis'), patina=find('Patina', i_ihr), schuetzt=find('schützt'), kupfer=find('Kupfer', i_ihr), darunter=find('darunter'))
sc('bleibt', i_also, nichts=find('nichts'), gestrichen=find('gestrichen'), und=find('und', i_also), statue=find('Freiheitsstatue', i_also), bleibt=find('bleibt'), heute=find('heute'), gruen=find('grün', i_also))
sc('frage', i_welche, farbe=find('Farbe'), schoener=find('schöner'), braun=find('braun', i_welche), gruen=find('grün', i_welche))
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
cred = json.load(open(os.path.join(ROOT, 'archiv', 'credits.json'), encoding='utf-8'))
G = json.load(open(os.path.join(ROOT, 'data', 'globus.json')))
K = json.load(open(os.path.join(ROOT, 'data', 'karte.json')))

# ---------- Einstiegsflug (Szene hook): Kugelradius R(t) in Bildpunkten, monoton-kubisch in log R ----------
# Globus (CC Sphere) bis 0,88 s, Satelliten-Platte 0,70-1,24 s, Papierkarte ab 1,0 s (Massstab s = R / 6371 px pro km).
# Zum Schluss schiebt die Kamera Liberty Island nach links unten (Platz fuer das Foto oben rechts).
CP = [(0.0, 430.0), (0.70, 800.0), (0.88, 1000.0), (1.24, 3100.0), (1.60, 14000.0), (2.00, 70000.0), (2.24, 95565.0)]
def pchip(xs, ys):
    n = len(xs); h = [xs[i + 1] - xs[i] for i in range(n - 1)]; d = [(ys[i + 1] - ys[i]) / h[i] for i in range(n - 1)]
    m = [0.0] * n; m[0] = d[0] * 0.6; m[-1] = 0.0
    for i in range(1, n - 1):
        if d[i - 1] * d[i] <= 0: m[i] = 0
        else: w1, w2 = 2 * h[i] + h[i - 1], h[i] + 2 * h[i - 1]; m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i])
    def f(x):
        if x <= xs[0]: return ys[0]
        if x >= xs[-1]: return ys[-1]
        i = max(j for j in range(n - 1) if xs[j] <= x); u = (x - xs[i]) / h[i]
        return (ys[i] * (2 * u ** 3 - 3 * u ** 2 + 1) + h[i] * m[i] * (u ** 3 - 2 * u ** 2 + u) + ys[i + 1] * (-2 * u ** 3 + 3 * u ** 2) + h[i] * m[i + 1] * (u ** 3 - u ** 2))
    return f
lr = pchip([c[0] for c in CP], [math.log(c[1]) for c in CP])
FCY = G['fcy']; LIB_END = [330.0, 1120.0]          # Liberty Island am Ende des Flugs (Bildschirm)
dive = {'t': [], 'R': [], 'ax': [], 'ay': []}
nf = int(round(CP[-1][0] * FPS))
for f in range(0, nf + 1, 2):
    t = f / FPS; R = math.exp(lr(t)); s = R / 6371.0
    u = min(1, max(0, (t - 1.70) / 0.54)); u = u * u * (3 - 2 * u)
    dx, dy = (LIB_END[0] - 540) * u, (LIB_END[1] - FCY) * u
    dive['t'].append(round(t, 4)); dive['R'].append(round(R, 2)); dive['ax'].append(round(-dx / s, 4)); dive['ay'].append(round(-dy / s, 4))
DIVE_END_S = CP[-1][1] / 6371.0
print('Flug: Endmassstab %.2f px/km, %d Stuetzpunkte' % (DIVE_END_S, len(dive['t'])))

TITLE = 'Short 13.11. Freiheitsstatue (freiheit)'
D = {'title': TITLE, 'key': KEY, 'end': END, 'scenes': scenes, 'words': words, 'karte': K, 'globus': G, 'dive': dive,
     'diveEnd': {'s': round(DIVE_END_S, 4), 'lib': LIB_END},
     'credits': {k: v['kurz'] for k, v in cred.items()}, 'audio': ['audio/freiheit_mix.wav']}
base = PC_BASE if '--cloud' not in sys.argv else os.path.abspath(ROOT).replace('\\', '/') + '/'
head = ('// Short "Freiheitsstatue" (13.11.2026) im Karten-Vox-Stil (After Effects 2023, 25 fps) - erzeugt von gen/gen_freiheit.py, nicht von Hand aendern.\n'
        '// Lauf ueber die Bridge: node edit-tools\\ae.mjs <diese Datei> 900000\n'
        'var BASE = %s;\nvar FPS = %d, W = 1080, H = 1920;\nvar D = %s;\n') % (json.dumps(base), FPS, json.dumps(D, ensure_ascii=False, separators=(',', ':')))
body = ''.join(open(os.path.join(ROOT, 'jsx', f), encoding='utf-8').read() + '\n' for f in ('vox_lib.jsx', 'vox_plus.jsx', 'karte_lib.jsx', 'scenes_freiheit.jsx', 'main_freiheit.jsx'))
out = os.path.join(ROOT, 'jsx', 'build_freiheit.jsx' if '--cloud' not in sys.argv else 'build_freiheit_cloud.jsx')
open(out, 'w', encoding='utf-8').write(head + body)
json.dump({'end': END, 'fps': FPS, 'scenes': [{'id': s['id'], 'start': s['start'], 'end': s['end'], 'k': {n: round(s['start'] + v, 3) for n, v in s['k'].items()}} for s in scenes],
           'words': [[w['s'], w['e2']] for w in words]}, open(os.path.join(ROOT, 'data', 'timeline.json'), 'w'), indent=1)
print('geschrieben:', out, '| Laenge %.2f s' % END)
for s in scenes: print('  %-9s %6.2f-%6.2f (%4.2f)  %s' % (s['id'], s['start'], s['end'], s['dur'], s['k']))
if '--cloud' in sys.argv: sys.exit(0)
NAME = TITLE + ' (9x16)'
snaps = []
t = 0.4
while t < END - 0.1: snaps.append(round(t, 2)); t += 1.0
for s in scenes: snaps.append(round(s['end'] - 0.12, 2))
snaps += [0.2, 0.6, 0.8, 1.0, 1.2, 1.4, 1.8]   # Einstiegsflug dichter (Globus -> Platte -> Karte)
snaps = sorted(set(snaps))
snapjs = ('// Standbilder der Master-Comp -> out/png/ (halbe Aufloesung, ~1 je Sekunde, Einstiegsflug dichter, kurz vor jedem Schnitt).\n'
          '// Lauf: node edit-tools\\ae.mjs <diese Datei> 900000\n'
          'var BASE = %s; var T = %s; var NAME = %s;\n' % (json.dumps(base), json.dumps(snaps), json.dumps(NAME)) + r'''
var comp = null; for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof CompItem && it.name === NAME) comp = it; }
if (!comp) return "Comp fehlt: " + NAME;
new Folder(BASE + "out/png").create(); app.beginSuppressDialogs();
var res = comp.resolutionFactor; comp.resolutionFactor = [2, 2]; var out = [];
for (var k = 0; k < T.length; k++) { var f = new File(BASE + "out/png/frei_" + ("0000" + Math.round(T[k] * 100)).slice(-5) + ".png");
  try { comp.saveFrameToPng(T[k], f); out.push(f.name); } catch (e) { out.push("FEHLER " + T[k] + ": " + e); } }
comp.resolutionFactor = res; app.endSuppressDialogs(false);
return out.length + " PNGs (werden asynchron geschrieben, ein paar Sekunden warten)\n" + out.join("\n");
''')
open(os.path.join(ROOT, 'jsx', 'snap_freiheit.jsx'), 'w', encoding='utf-8').write(snapjs)
render = ('// Rendert die Master-Comp in voller Aufloesung als H.264 nach out/freiheit_vox.mp4 (enno rendert selbst; nur falls gewuenscht). 25 fps.\n'
          '// Lauf: node edit-tools\\ae.mjs <diese Datei> 1800000\n'
          'var BASE = %s; var NAME = %s;\n' % (json.dumps(base), json.dumps(NAME)) + r'''
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
''')
open(os.path.join(ROOT, 'jsx', 'render_freiheit.jsx'), 'w', encoding='utf-8').write(render)
print('snap + render geschrieben,', len(snaps), 'Standbilder')
for nm in ('build_freiheit', 'plugin_check', 'snap_freiheit', 'render_freiheit'):
    src = open(os.path.join(ROOT, 'jsx', nm + '.jsx'), encoding='utf-8').read()
    wrap = ('// HAND-VERSION fuer After Effects: Datei > Skripte > Skriptdatei ausfuehren.\n(function () {\n'
            'var __r = (function () {\n' + src + '\n})();\n' + (
            'try { var __b = %s; new Folder(__b + "out").create(); var __f = new File(__b + "out/ergebnis_%s.txt"); __f.encoding = "UTF-8"; __f.open("w"); __f.write(String(__r)); __f.close(); } catch (e) {}\n'
            'alert(String(__r).substr(0, 1500));\n})();\n') % (json.dumps(base), nm))
    open(os.path.join(ROOT, 'jsx', 'HAND_' + nm + '.jsx'), 'w', encoding='utf-8').write(wrap)
print('Hand-Versionen geschrieben')
