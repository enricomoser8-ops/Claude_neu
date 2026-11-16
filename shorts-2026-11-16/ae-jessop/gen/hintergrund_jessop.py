# Hintergrund-Vox (Jessop-Short 16.11.2026): vollflaechiges Archivfoto je Szene mit langsamer Fahrt (Ken Burns),
# warm/Sepia gegradet (hell genug, Richtung Kleopatra-Short). Vorlage: ae-freiheit/gen/hintergrund_freiheit.py (Runde 2).
# Aufruf: python3 hintergrund_jessop.py <dl-ordner>   (<dl>/src/*.jpg aus quellen_jessop.py)
# Ergebnis: ../archiv/bg-*.jpg (Grading eingebacken, max 2200 px lange Seite), ../archiv/lupe-baby.jpg, Zeitungsausschnitt
# ../archiv/zeitung-1911-hawke.jpg, ../data/grund.json (Fahrt-Keys, Punkte, Groesse je Szene), Bildnachweise in ../archiv/credits.json.
# Fahrt-Modell wie in AE: Bildpunkt Q (Quellpixel) liegt auf Bildschirmpunkt P, Massstab z. Alle Keys gleiche Zeiten/Ease.
import json, math, os, sys
import numpy as np
from PIL import Image, ImageOps
Image.MAX_IMAGE_PIXELS = None
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..'); OUT = os.path.join(ROOT, 'archiv')
DL = sys.argv[1]
W, H, FPS, GW = 1080, 1920, 25, 1.02
MAXLONG = 2200; MAXUP = 1.20
LOC = 'https://www.loc.gov/item/%s/'
LIZ_LOC = 'gemeinfrei (No known restrictions on publication, LOC)'
LIZ_IA = 'gemeinfrei (1911/1912 veroeffentlicht; Internet Archive, Public Domain Mark)'
LIZ_CA = 'gemeinfrei (Zeitung vor 1929, Chronicling America / LOC)'
QUELLEN = {
 'deck': dict(titel='Scene on the upper deck of the "Titanic", showing life boats (Buch "Sinking of the Titanic", J. H. Mowbray, 1912, Tafel)', autor='unbekannt (1912)',
              quelle='https://archive.org/details/sinkingoftitanic00mowb/page/n56', kurz='Foto: 1912, Internet Archive', liz=LIZ_IA, farbe=0.0),
 'stapel': dict(titel='The "Titanic" and "Olympic" on the stocks (The Shipbuilder, Sondernummer 1911, Fig. 34)', autor='Frank & Sons, South Shields (1910)',
                quelle='https://archive.org/details/the_shipbuilder_special_numbers_images_201909/page/n227', kurz='Foto: Frank & Sons 1910, The Shipbuilder', liz=LIZ_IA, farbe=0.0),
 'saal': dict(titel='The First-class Dining Saloon of the White Star Liner "Olympic" (The Shipbuilder 1911, Plate II)', autor='The Shipbuilder (1911)',
              quelle='https://archive.org/details/the_shipbuilder_special_numbers_images_201909/page/n266', kurz='Foto: The Shipbuilder 1911', liz=LIZ_IA, farbe=0.0),
 'olympic-schlepper': dict(titel='White Star S.S. Olympic, guided in by tugboats (1911)', autor='Detroit Publishing Co. (1911)', quelle=LOC % '2016797108',
                           kurz='Foto: Detroit Publishing Co., LOC', liz=LIZ_LOC, farbe=0.0),
 'olympic-see': dict(titel='OLYMPIC (Bain News Service)', autor='Bain News Service (um 1911-1915)', quelle=LOC % '2014710983', kurz='Foto: Bain News Service, LOC', liz=LIZ_LOC, farbe=0.0),
 'zeitung-1912': dict(titel='Newark Evening Star, 15. April 1912, S. 1 ("Titanic, biggest liner, doomed")', autor='Newark Evening Star', kurz='Newark Evening Star 1912, LOC',
                      quelle='https://www.loc.gov/resource/sn91064011/1912-04-15/ed-1/?sp=1', liz=LIZ_CA, farbe=0.0),
 'boote': dict(titel='TITANIC life boats on way to CARPATHIA (1912)', autor='Bain News Service (1912)', quelle=LOC % '2014691299', kurz='Foto: Bain News Service 1912, LOC', liz=LIZ_LOC, farbe=0.0),
 'postkarte': dict(titel='White Star Line, triple screw steamer "Olympic" (Photochrom-Postkarte)', autor='Detroit Publishing Co. (um 1910)', quelle=LOC % '2008680520',
                   kurz='Detroit Publishing Co., LOC', liz=LIZ_LOC, farbe=0.62, warm=(1.04, 1.0, 0.94)),
 'rotkreuz': dict(titel='The huge "Britannic" used as a hospital ship (American National Red Cross, Karte No. 666)', autor='American National Red Cross (1917)',
                  quelle=LOC % '2017676684', kurz='Foto: American Red Cross, LOC', liz=LIZ_LOC, farbe=0.0),
 'zeitung-1916': dict(titel='The Evening World (New York), 22. Nov. 1916, S. 1 ("Liner Britannic ...")', autor='The Evening World', kurz='The Evening World 1916, LOC',
                      quelle='https://www.loc.gov/resource/sn83030193/1916-11-22/ed-1/?sp=1', liz=LIZ_CA, farbe=0.0),
 'schrauben': dict(titel='TITANIC, to be launched (Schrauben im Dock, 31. Mai 1911)', autor='unbekannt (1911), LOC', quelle=LOC % '2001704329', kurz='Foto: 1911, LOC', liz=LIZ_LOC, farbe=0.0),
 'ueberlebende': dict(titel='TITANIC survivors on way to rescue-ship CARPATHIA (1912)', autor='Bain News Service (1912)', quelle=LOC % '2014690331', kurz='Foto: Bain News Service 1912, LOC', liz=LIZ_LOC, farbe=0.0),
 'olympic-pier': dict(titel='S.S. Olympic (1911)', autor='Detroit Publishing Co. (1911)', quelle=LOC % '2016817999', kurz='Foto: Detroit Publishing Co., LOC', liz=LIZ_LOC, farbe=0.0),
 'plate': dict(titel='The White Star Triple-screw Steamship "Olympic" (The Shipbuilder 1911, Plate I, Farbtafel)', autor='The Shipbuilder (1911)',
               quelle='https://archive.org/details/the_shipbuilder_special_numbers_images_201909/page/n189', kurz='Farbtafel: The Shipbuilder 1911', liz=LIZ_IA, farbe=0.62, warm=(1.04, 1.0, 0.94)),
 'olympic-hafen': dict(titel='White Star Line S.S. Olympic entering New York Harbor on first trip (1911)', autor='Detroit Publishing Co. (1911)', quelle=LOC % '2016800142',
                       kurz='Foto: Detroit Publishing Co., LOC', liz=LIZ_LOC, farbe=0.0),
}
TL = json.load(open(os.path.join(ROOT, 'data', 'timeline.json')))
SC = {s['id']: s for s in TL['scenes']}
def k(sid, name): return SC[sid]['k'][name] - SC[sid]['start']
C = (540, 960)
# keys: (t, Q als Anteil der Quelle, P, sichtbarer Anteil der Quellhoehe); pts: benannte Punkte (Anteile) fuer die Vox-Geraete
G = {
 'hook': dict(q='deck', keys=[(0.0, (0.55, 0.50), C, 0.97), ('E', (0.60, 0.46), C, 0.86)], gam=0.85, hell=0.78, pts={'schlot': (0.80, 0.22), 'boot': (0.22, 0.62)}),
 'einzig': dict(q='stapel', keys=[(0.0, (0.34, 0.50), C, 0.97), ('E', (0.55, 0.50), C, 0.94)], gam=0.62, hell=0.80, pts={'titanic': (0.27, 0.47), 'olympic': (0.69, 0.48)}),
 'gaeste': dict(q='saal', keys=[(0.0, (0.40, 0.53), C, 0.93), ('E', (0.52, 0.56), C, 0.86)], gam=0.62, hell=0.82, pts={'tisch1': (0.33, 0.60), 'tisch2': (0.52, 0.74)}),
 'olympic': dict(q='olympic-schlepper', keys=[(0.0, (0.42, 0.50), C, 0.97), ('E', (0.53, 0.52), C, 0.90)], gam=0.9, hell=0.76, pts={'schiff': (0.48, 0.50), 'bug': (0.80, 0.58)}),
 'hawke': dict(q='olympic-see', keys=[(0.0, (0.24, 0.52), C, 0.97), ('E', (0.27, 0.53), C, 0.90)], gam=0.8, hell=0.76, pts={'heck': (0.165, 0.535), 'see': (0.07, 0.86), 'schiff': (0.30, 0.48)}),
 'titanic': dict(q='zeitung-1912', keys=[(0.0, (0.33, 0.30), C, 0.60), ('eis-', (0.35, 0.30), C, 0.58), ('eis+', (0.70, 0.27), C, 0.50), ('E', (0.71, 0.27), C, 0.49)],
                 infl=[[40, 40], [40, 40], [80, 40], [40, 40]], hell=0.84),
 'baby': dict(q='boote', keys=[(0.0, (0.54, 0.51), C, 0.97), ('E', (0.66, 0.53), C, 0.88)], hell=0.80, pts={'bootA': (0.27, 0.41), 'bootB': (0.66, 0.58), 'leute': (0.65, 0.48)}),
 'folge': dict(q='postkarte', keys=[(0.0, (0.48, 0.50), C, 0.97), ('E', (0.48, 0.50), C, 0.94)], gam=0.8, hell=0.84),
 'britannic': dict(q='rotkreuz', keys=[(0.0, (0.40, 0.50), C, 0.97), ('E', (0.50, 0.50), C, 0.93)], gam=0.9, hell=0.82, pts={'kreuz': (0.4755, 0.505), 'rumpf': (0.43, 0.46)}),
 'mine': dict(q='zeitung-1916', keys=[(0.0, (0.38, 0.32), C, 0.62), ('E', (0.39, 0.30), C, 0.56)], hell=0.84),
 'schrauben': dict(q='schrauben', keys=[(0.0, (0.42, 0.50), C, 0.97), ('E', (0.43, 0.46), C, 0.86)], hell=0.80, pts={'nabe': (0.425, 0.345), 'leute': (0.48, 0.74)}),
 'springt': dict(q='ueberlebende', keys=[(0.0, (0.40, 0.50), C, 0.97), ('E', (0.42, 0.53), C, 0.90)], hell=0.78, pts={'wasser': (0.47, 0.40), 'boot': (0.40, 0.84)}),
 'twist': dict(q='olympic-pier', keys=[(0.0, (0.71, 0.50), C, 0.97), ('E', (0.76, 0.50), C, 0.91)], gam=0.9, hell=0.78, pts={'a': (0.565, 0.60), 'b': (0.93, 0.55)}),
 'frage': dict(q='plate', keys=[(0.0, (0.55, 0.50), C, 0.97), ('E', (0.56, 0.52), C, 0.91)], hell=0.84, pts={'schiff': (0.58, 0.55)}),
 'outro': dict(q='olympic-hafen', keys=[(0.0, (0.45, 0.50), C, 0.97), ('E', (0.47, 0.50), C, 0.93)], hell=0.76),
}
# Lupe (echte Aufloesung) in Szene baby: Punkt (Anteil), Zeit, Vergroesserung, Radius
LUPE = {'baby': ('leute', 'baby', 1.9, 205)}
ZEIT = {'eis-': lambda: k('titanic', 'eisberg') - 0.40, 'eis+': lambda: k('titanic', 'eisberg') + 0.12}
# ---------- AE-Ease nachrechnen ----------
def bez(a, b, c, d, s): m = 1 - s; return m * m * m * a + 3 * m * m * s * b + 3 * m * s * s * c + s * s * s * d
def ease_prog(u, oi, ii):
    lo, hi = 0.0, 1.0
    for _ in range(40):
        mid = (lo + hi) / 2
        if bez(0, oi, 1 - ii, 1, mid) < u: lo = mid
        else: hi = mid
    return bez(0, 0, 1, 1, (lo + hi) / 2)
def state(g, t):
    K = g['_k']
    if t <= K[0][0]: a = b = K[0]; p = 0
    elif t >= K[-1][0]: a = b = K[-1]; p = 0
    else:
        i = max(j for j in range(len(K) - 1) if K[j][0] <= t); a, b = K[i], K[i + 1]
        inf = g['infl']; p = ease_prog((t - a[0]) / (b[0] - a[0]), inf[i][1] / 100, inf[i + 1][0] / 100)
    L = lambda x, y: x + (y - x) * p
    return [L(a[1][0], b[1][0]), L(a[1][1], b[1][1])], [L(a[2][0], b[2][0]), L(a[2][1], b[2][1])], L(a[3], b[3])
# ---------- Grading: Tonwerte, warmer Sepia-Duoton (heller als ae-freiheit: Kleopatra-Referenz) ----------
STOPS = [(0.0, (20, 14, 9)), (0.28, (66, 49, 33)), (0.55, (132, 103, 72)), (0.80, (196, 163, 120)), (1.0, (240, 220, 182))]
def sepia_map(L):
    out = np.zeros(L.shape + (3,), np.float32); xs = [s[0] for s in STOPS]
    for c in range(3): out[..., c] = np.interp(L, xs, [s[1][c] / 255.0 for s in STOPS])
    return out
def tonwerte(im):
    a = np.asarray(im.convert('L').resize((max(1, im.width // 4), max(1, im.height // 4)))).astype(np.float32) / 255.0
    return np.percentile(a, 1.0), np.percentile(a, 99.3)
def grade(im, farbe, hell, lo, hi, warm=(1.06, 1.0, 0.90), gam=1.0):
    a = np.asarray(im.convert('RGB')).astype(np.float32) / 255.0
    L = 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
    Ln = np.clip((L - lo) / max(0.05, hi - lo), 0, 1)
    Ld = np.clip(Ln ** (1.08 * gam) * hell + (1 - hell) * 0.10 * Ln, 0, 1)
    sep = sepia_map(Ld)
    if farbe > 0:
        col = a / np.maximum(L[..., None], 1e-3) * Ld[..., None] * np.array(warm, np.float32)
        sep = sep * (1 - farbe) + np.clip(col, 0, 1) * farbe
    return Image.fromarray((np.clip(sep, 0, 1) * 255 + 0.5).astype(np.uint8))
# ---------- Ausschnitte ----------
srcsize = {q: Image.open(os.path.join(DL, 'src', q + '.jpg')).size for q in QUELLEN}
need = {}
for sid, g in G.items():
    dur = SC[sid]['end'] - SC[sid]['start']; q = g['q']; sw, sh = srcsize[q]; g['_k'] = []
    for (t, Qf, P, vis) in g['keys']:
        tt = dur if t == 'E' else (ZEIT[t]() if isinstance(t, str) else t)
        z = H / (vis * sh); qx, qy = Qf[0] * sw, Qf[1] * sh; m = 8 / z
        lo_x, hi_x = P[0] / z + m, sw - (W - P[0]) / z - m
        lo_y, hi_y = P[1] / z + m, sh - (H - P[1]) / z - m
        if lo_x > hi_x or lo_y > hi_y: sys.exit('FEHLER %s: vis %.3f zu gross' % (sid, vis))
        nx, ny = min(max(qx, lo_x), hi_x), min(max(qy, lo_y), hi_y)
        if abs(nx - qx) > 0.5 or abs(ny - qy) > 0.5: print('  %s: Key %s Q verschoben um %+.0f / %+.0f Quell-px' % (sid, t, nx - qx, ny - qy))
        g['_k'].append((tt, (nx, ny), P, z))
    g.setdefault('infl', [[30, 30]] * len(g['keys']))
    b = need.setdefault(q, [1e9, 1e9, -1e9, -1e9, 0])
    f = 0
    while f <= int(round(dur * FPS)):
        Q, P, z = state(g, f / FPS); m = 4 / z
        b[0] = min(b[0], Q[0] - P[0] / z - m); b[2] = max(b[2], Q[0] + (W - P[0]) / z + m)
        b[1] = min(b[1], Q[1] - P[1] / z - m); b[3] = max(b[3], Q[1] + (H - P[1]) / z + m); b[4] = max(b[4], z)
        f += 1
bilder = {}; err = 0
for q, b in need.items():
    sw, sh = srcsize[q]
    if b[0] < -0.5 or b[1] < -0.5 or b[2] > sw + 0.5 or b[3] > sh + 0.5: print('FEHLER Ausschnitt %s' % q, b, sw, sh); err += 1
    x0, y0 = math.floor(max(0, b[0])), math.floor(max(0, b[1])); x1, y1 = math.ceil(min(sw, b[2])), math.ceil(min(sh, b[3]))
    r = min(1.0, b[4] * GW, MAXLONG / max(x1 - x0, y1 - y0))
    up = b[4] / r * GW
    if up > MAXUP + 1e-6: print('FEHLER %s: %.0f %% der echten Pixel' % (q, up * 100)); err += 1
    ow, oh = int(round((x1 - x0) * r)), int(round((y1 - y0) * r)); r = ow / (x1 - x0)
    bilder[q] = dict(rel='archiv/bg-%s.jpg' % q, o=[x0, y0], r=r, size=[ow, oh], up=round(b[4] / r * GW, 3))
if err: sys.exit('%d Fehler' % err)
TW = {q: tonwerte(Image.open(os.path.join(DL, 'src', q + '.jpg'))) for q in need}
HELL = {g['q']: g.get('hell', 0.78) for g in G.values()}
GAM = {g['q']: g.get('gam', 1.0) for g in G.values()}
for q, bi in bilder.items():
    v = QUELLEN[q]; im = Image.open(os.path.join(DL, 'src', q + '.jpg'))
    x0, y0 = bi['o']; sw = bi['size'][0] / bi['r']; sh = bi['size'][1] / bi['r']
    im = im.crop((x0, y0, int(round(x0 + sw)), int(round(y0 + sh)))).resize(tuple(bi['size']), Image.LANCZOS)
    gi = grade(im, v['farbe'], HELL[q], *TW[q], warm=v.get('warm', (1.06, 1.0, 0.90)), gam=GAM[q])
    gi.save(os.path.join(ROOT, bi['rel']), quality=87, optimize=True)
    print('%-30s %4d x %4d  r %.3f  max %3.0f %% echte Pixel  Helligkeit %.2f' % (bi['rel'], bi['size'][0], bi['size'][1], bi['r'], bi['up'] * 100, np.asarray(gi).mean() / 255))
GR = {}
for sid, g in G.items():
    q = g['q']; sw, sh = srcsize[q]; bi = bilder[q]
    ks = [{'t': round(t, 4), 'Q': [round(Q[0], 2), round(Q[1], 2)], 'P': list(P), 'z': round(z, 6)} for (t, Q, P, z) in g['_k']]
    GR[sid] = {'keys': ks, 'infl': g['infl'], 'ebenen': [{'rel': bi['rel'], 'o': bi['o'], 'r': round(bi['r'], 6), 'tin': 0, 'tout': None, 'fade': 0}],
               'pin': {}, 'quelle': 'bg-' + q, 'size': [sw, sh], 'pts': {n: [round(p[0] * sw, 1), round(p[1] * sh, 1)] for n, p in g.get('pts', {}).items()}}
# ---------- Lupe: Ausschnitt in echter Aufloesung um einen Bildpunkt (gleich gegradet) ----------
for sid, (pn, tname, m, Rr) in LUPE.items():
    g = G[sid]; q = g['q']; tref = k(sid, tname) if tname in SC[sid]['k'] else 1.0
    Q, P, z = state(g, tref); D = GR[sid]['pts'][pn]
    up = z * m * GW
    if up > MAXUP + 1e-6: sys.exit('FEHLER Lupe %s: %.0f %%' % (sid, up * 100))
    hw = int(math.ceil(Rr / (z * m) * 1.25 + 12))
    v = QUELLEN[q]; im = Image.open(os.path.join(DL, 'src', q + '.jpg'))
    x0, y0 = int(round(D[0])) - hw, int(round(D[1])) - hw
    gi = grade(im.crop((x0, y0, x0 + 2 * hw, y0 + 2 * hw)), v['farbe'], HELL[q], *TW[q], gam=GAM[q])
    rel = 'archiv/lupe-%s.jpg' % sid; gi.save(os.path.join(ROOT, rel), quality=90)
    GR[sid]['lupe'] = {'rel': rel, 'o': [x0, y0], 'D': D, 'm': m, 'R': Rr, 'tref': round(tref, 3)}
    print('Lupe %s: %s %d px, %.0f %% echte Pixel' % (sid, rel, 2 * hw, up * 100))
json.dump(GR, open(os.path.join(ROOT, 'data', 'grund.json'), 'w'), indent=1)
# ---------- Zeitungsausschnitt 1911 (Hawke) fuer das Zeitungs-Element: 1:1 Bildpunkte der Seite ----------
zs = Image.open(os.path.join(DL, 'src', 'zeitung-1911.jpg')).convert('L').crop((4034, 1425, 5313, 2600))
ImageOps.autocontrast(zs, cutoff=1).save(os.path.join(OUT, 'zeitung-1911-hawke.jpg'), quality=90)
# ---------- Bildnachweise ----------
cp = os.path.join(OUT, 'credits.json'); CR = json.load(open(cp, encoding='utf-8')) if os.path.exists(cp) else {}
for q, v in QUELLEN.items():
    if q not in bilder: continue
    CR['bg-' + q] = {'datei': bilder[q]['rel'].split('/')[-1], 'titel': v['titel'], 'autor': v['autor'], 'quelle': v['quelle'], 'lizenz': v['liz'], 'kurz': v['kurz'],
                     'verwendung': 'Hintergrund (warm gegradet, Ausschnitt, langsame Fahrt)'}
CR['zeitung-1911-hawke'] = {'datei': 'zeitung-1911-hawke.jpg', 'titel': 'The Evening World (New York), 20. Sept. 1911, S. 1 ("Panic on Olympic when cruiser Hawke crashes into liner")',
                            'autor': 'The Evening World', 'quelle': 'https://www.loc.gov/resource/sn83030193/1911-09-20/ed-1/?sp=1', 'lizenz': LIZ_CA,
                            'kurz': 'The Evening World 1911, LOC', 'verwendung': 'Zeitungsausschnitt (1:1)'}
json.dump(CR, open(cp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('grund.json + credits.json geschrieben,', len(bilder), 'Hintergrundbilder')
