# Hintergrund-Vox (Roosevelt-Short 17.11.2026): ein vollflaechiges Archivfoto je Szene mit langsamer Fahrt (Ken Burns),
# warm/Sepia gegradet (hell genug). Vorlage: ae-jessop/gen/hintergrund_jessop.py (16.11.).
# Aufruf: python3 hintergrund_roosevelt.py <dl-ordner>   (<dl>/src/*.jpg aus quellen_roosevelt.py, <dl>/src/etui.jpg = KI-Bild)
# Ergebnis: ../archiv/bg-*.jpg (Grading eingebacken), ../archiv/lupe-tasche.jpg, Ausschnitte ../archiv/zeitung-*.jpg,
# ../data/grund.json (Fahrt-Keys, Punkte, Groesse je Szene), Bildnachweise in ../archiv/credits.json.
# Fahrt-Modell wie in AE: Bildpunkt Q (Quellpixel) liegt auf Bildschirmpunkt P, Massstab z. Alle Keys gleiche Zeiten/Ease.
# Regel 17.11.: nie ueber 110 % der echten Pixel (inkl. Gate Weave 102 %).
import json, math, os, sys
import numpy as np
from PIL import Image, ImageOps
Image.MAX_IMAGE_PIXELS = None
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..'); OUT = os.path.join(ROOT, 'archiv')
DL = sys.argv[1]
W, H, FPS, GW = 1080, 1920, 25, 1.02
MAXLONG = 2400; MAXUP = 1.10
LOC = 'https://www.loc.gov/item/%s/'
LIZ_LOC = 'gemeinfrei (No known restrictions on publication, LOC)'
LIZ_CA = 'gemeinfrei (Zeitung von 1912, Chronicling America / LOC)'
LIZ_IA = 'gemeinfrei (Buch von 1912, Internet Archive: NOT_IN_COPYRIGHT)'
BUCH = 'https://archive.org/details/attemptedassas00remerich'
QUELLEN = {
 'portrait-rede': dict(titel='[Theodore Roosevelt, head-and-shoulders portrait, facing front, speaking] (1912)', autor='unbekannt (1912), LOC', quelle=LOC % '2009633786',
                       kurz='Foto: 1912, LOC', liz=LIZ_LOC, farbe=0.0),
 'portrait-oval': dict(titel='[Theodore Roosevelt : head up] (1912)', autor='Geo. Prince (1912)', quelle=LOC % '2013648186', kurz='Foto: Geo. Prince 1912, LOC', liz=LIZ_LOC, farbe=0.0),
 'menge': dict(titel='Crowd listening to T.R. speak, Chicago (1912)', autor='Bain News Service (1912)', quelle=LOC % '2014690550', kurz='Foto: Bain News Service 1912, LOC', liz=LIZ_LOC, farbe=0.0),
 'auto': dict(titel='Roosevelt (Bain, Glasnegativ beschriftet "10/14/12", kurz vor dem Attentat)', autor='Bain News Service (1912)', quelle=LOC % '2014690852',
              kurz='Foto: Bain News Service 1912, LOC', liz=LIZ_LOC, farbe=0.0),
 'yonkers': dict(titel='Roosevelt speaking, Yonkers, 10/17/12', autor='George Grantham Bain (1912)', quelle=LOC % '2009633788', kurz='Foto: G. G. Bain 1912, LOC', liz=LIZ_LOC, farbe=0.0),
 'sitzend': dict(titel='[Theodore Roosevelt, three-quarter length portrait, seated, facing right] (um 1912)', autor='American Press Association (um 1912)', quelle=LOC % '93511353',
                 kurz='Foto: American Press Association, LOC', liz=LIZ_LOC, farbe=0.0),
 'halle': dict(titel='The new auditorium, Milwaukee (Postkarte, um 1908)', autor='unbekannt (Postkarte, um 1908)', quelle=LOC % '2013646928', kurz='Postkarte um 1908, LOC',
               liz=LIZ_LOC, farbe=0.6, warm=(1.04, 1.0, 0.94)),
 'buehne': dict(titel='[Theodore Roosevelt, full-length portrait, standing, facing front, speaking at Carnegie Hall] (1912)', autor='unbekannt (1912), LOC', quelle=LOC % '90712592',
                kurz='Foto: 1912, LOC', liz=LIZ_LOC, farbe=0.0),
 'grit': dict(titel='We are against his politics but we like his grit (Zeichnung, 1912)', autor='W. A. Rogers (1912)', quelle=LOC % '2010717717', kurz='Zeichnung: W. A. Rogers 1912, LOC',
              liz=LIZ_LOC, farbe=0.0),
 'martin': dict(titel='Elbert Martin and bullet-pierced speech (1912)', autor='Bain News Service (1912)', quelle=LOC % '2014690861', kurz='Foto: Bain News Service 1912, LOC', liz=LIZ_LOC, farbe=0.0),
 'manuskript': dict(titel='Page from Ex-President Roosevelt\'s Manuscript of Speech Showing Bullet Holes (Tafel im Buch "The attempted assassination of ex-President Theodore Roosevelt", Milwaukee 1912)',
                    autor='O. E. Remey, H. F. Cochems, W. P. Bloodgood (Hg., 1912)', quelle=BUCH + '/page/n33', kurz='Buch 1912, Internet Archive', liz=LIZ_IA, farbe=0.0),
 'etui': dict(titel='KI-Bild: Brillenetui aus Stahl mit Einschussloch auf gefalteten Redeseiten (Nachstellung, kein Originalfoto)', autor='KI-generiert (ElevenLabs, gpt-image-2.5-sunburst, 17.11.2026)',
              quelle='ElevenLabs Flow UmpNtfvLKY9bf4cEBvvP, Generation XPubIaNwV3Rwb05fpf3U', kurz='KI-Bild (ElevenLabs)', liz='KI-generiert (eigene Generierung, 85 Credits)', farbe=0.0),
 'zeitung-lct': dict(titel='The Lake County Times (Hammond, Ind.), 15. Okt. 1912, S. 1 ("Assassin\'s bullet lodges in breast")', autor='The Lake County Times',
                     quelle='https://www.loc.gov/resource/sn86058242/1912-10-15/ed-1/?sp=1', kurz='Lake County Times 1912, LOC', liz=LIZ_CA, farbe=0.0),
 'xray': dict(titel='X-Ray of Roosevelt [shows bullet] (1912)', autor='Bain News Service (1912)', quelle=LOC % '2014690853', kurz='Foto: Bain News Service 1912, LOC', liz=LIZ_LOC, farbe=0.0),
 'profil': dict(titel='Roosevelt speaking (1912)', autor='unbekannt (1912), LOC', quelle=LOC % '2013651235', kurz='Foto: 1912, LOC', liz=LIZ_LOC, farbe=0.0),
 'konvent': dict(titel='Roosevelt speaking in convention hall, Chicago (1912)', autor='Bain News Service (1912)', quelle=LOC % '2014691372', kurz='Foto: Bain News Service 1912, LOC', liz=LIZ_LOC, farbe=0.0),
}
TL = json.load(open(os.path.join(ROOT, 'data', 'timeline.json')))
SC = {s['id']: s for s in TL['scenes']}
def k(sid, name): return SC[sid]['k'][name] - SC[sid]['start']
C = (540, 960)
# keys: (t, Q als Anteil der Quelle, P, sichtbarer Anteil der Quellhoehe); pts: benannte Punkte (Anteile) fuer die Vox-Geraete
G = {
 'hook': dict(q='portrait-rede', keys=[(0.0, (0.49, 0.48), C, 0.74), ('E', (0.48, 0.47), C, 0.66)], hell=0.70, gam=1.25,
              pts={'gesicht': (0.48, 0.34), 'brust': (0.38, 0.57)}),
 'name': dict(q='portrait-oval', keys=[(0.0, (0.52, 0.50), C, 0.80), ('E', (0.54, 0.47), C, 0.72)], hell=0.92, gam=0.75, pts={'gesicht': (0.55, 0.38)}),
 'wahl': dict(q='menge', keys=[(0.0, (0.55, 0.50), C, 0.97), ('E', (0.58, 0.53), C, 0.88)], hell=0.88, gam=0.75, pts={'menge': (0.58, 0.70)}),
 'auto': dict(q='auto', keys=[(0.0, (0.47, 0.50), C, 0.95), ('E', (0.47, 0.47), C, 0.82)], hell=0.86, gam=0.85, pts={'kopf': (0.473, 0.36), 'tr': (0.47, 0.55)}),
 'schuss': dict(q='yonkers', keys=[(0.0, (0.50, 0.50), C, 0.97), ('E', (0.52, 0.45), C, 0.82)], hell=0.72, gam=1.3, pts={'kopf': (0.52, 0.33), 'brust': (0.55, 0.55)}),
 'folge': dict(q='sitzend', keys=[(0.0, (0.55, 0.48), C, 0.92), ('E', (0.56, 0.48), C, 0.88)], hell=0.90, gam=0.68),
 'halle': dict(q='halle', keys=[(0.0, (0.36, 0.50), C, 0.97), ('E', (0.27, 0.50), C, 0.97)], hell=0.86, pts={'tuer': (0.252, 0.60), 'bau': (0.33, 0.48)}),
 'buehne': dict(q='buehne', keys=[(0.0, (0.48, 0.50), C, 0.97), ('E', (0.48, 0.46), C, 0.85)], hell=0.90, gam=0.72, pts={'tr': (0.48, 0.45), 'kopf': (0.48, 0.29)}),
 'hemd': dict(q='grit', keys=[(0.0, (0.47, 0.66), C, 0.68), ('E', (0.50, 0.66), C, 0.62)], hell=0.86, pts={'blut': (0.55, 0.72)}),
 'tasche': dict(q='martin', keys=[(0.0, (0.55, 0.50), C, 0.90), ('E', (0.62, 0.60), C, 0.72)], hell=0.84, gam=0.9, pts={'loch': (0.645, 0.645), 'papiere': (0.66, 0.72)}),
 'seiten': dict(q='manuskript', keys=[(0.0, (0.50, 0.50), C, 0.99), ('E', (0.51, 0.49), C, 0.95)], hell=0.90, pts={'loch1': (0.62, 0.115), 'loch2': (0.605, 0.835)}),
 'etui': dict(q='etui', keys=[(0.0, (0.50, 0.50), C, 0.98), ('E', (0.50, 0.49), C, 0.93)], hell=0.84, pts={'loch': (0.515, 0.478), 'etui': (0.495, 0.492), 'papierloch': (0.515, 0.607)}),
 'gerettet': dict(q='zeitung-lct', keys=[(0.0, (0.845, 0.30), C, 0.406), ('E', (0.845, 0.325), C, 0.40)], hell=0.86),
 'kugel': dict(q='xray', keys=[(0.0, (0.25, 0.50), C, 0.97), ('E', (0.22, 0.56), C, 0.82)], hell=0.80, pts={'kugel': (0.19, 0.605)}),
 'frage': dict(q='profil', keys=[(0.0, (0.52, 0.50), C, 0.97), ('E', (0.53, 0.47), C, 0.90)], hell=0.74, gam=1.25, pts={'gesicht': (0.52, 0.36)}),
 'outro': dict(q='konvent', keys=[(0.0, (0.42, 0.50), C, 0.97), ('E', (0.44, 0.50), C, 0.93)], hell=0.86, gam=0.8),
}
# Lupe (echte Aufloesung) in Szene tasche: Punkt, Zeit (Schluesselwort), Vergroesserung, Radius (Bildschirm-px)
LUPE = {'tasche': ('loch', 'seine', 1.7, 190)}
ZEIT = {}
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
# ---------- Grading: Tonwerte, warmer Sepia-Duoton ----------
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
    if b[4] * GW > MAXUP + 1e-6: print('FEHLER %s: %.0f %% der echten Pixel' % (q, b[4] * GW * 100)); err += 1
    ow, oh = int(round((x1 - x0) * r)), int(round((y1 - y0) * r)); r = ow / (x1 - x0)
    bilder[q] = dict(rel='archiv/bg-%s.jpg' % q, o=[x0, y0], r=r, size=[ow, oh], up=round(b[4] / r * GW, 3), echt=round(b[4] * GW, 3))
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
    print('%-30s %4d x %4d  r %.3f  max %3.0f %% echte Pixel (Datei %3.0f %%)  Helligkeit %.2f' % (bi['rel'], bi['size'][0], bi['size'][1], bi['r'], bi['echt'] * 100, bi['up'] * 100, np.asarray(gi).mean() / 255))
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
# ---------- Ausschnitte fuer das Zeitungs-Element (1:1 Bildpunkte, Graustufen, Autokontrast) ----------
AUS = {   # name: (Quelle, Anteile x0, y0, x1, y1)
 'zeitung-teddy': ('teddy', (0.06, 0.07, 0.97, 0.87)),
 'zeitung-missoulian': ('zeitung-mis', (0.025, 0.095, 0.625, 0.20)),
 'zeitung-hemd': ('hemd', (0.0, 0.0, 1.0, 1.0)),
}
AUSG = {}
for n, (q, bx) in AUS.items():
    im = Image.open(os.path.join(DL, 'src', q + '.jpg')).convert('L'); w0, h0 = im.size
    box = (int(bx[0] * w0), int(bx[1] * h0), int(bx[2] * w0), int(bx[3] * h0))
    zs = ImageOps.autocontrast(im.crop(box), cutoff=1); zs.save(os.path.join(OUT, n + '.jpg'), quality=90)
    AUSG[n] = dict(o=box[:2], size=zs.size); print('%s: %s %d x %d' % (n, q, zs.size[0], zs.size[1]))
json.dump(AUSG, open(os.path.join(ROOT, 'data', 'ausschnitte.json'), 'w'), indent=1)
# ---------- Bildnachweise ----------
cp = os.path.join(OUT, 'credits.json'); CR = json.load(open(cp, encoding='utf-8')) if os.path.exists(cp) else {}
for kk in [x for x in CR if x.startswith(('bg-', 'zeitung-', 'lupe-'))]: del CR[kk]
for q, v in QUELLEN.items():
    if q not in bilder: continue
    CR['bg-' + q] = {'datei': bilder[q]['rel'].split('/')[-1], 'titel': v['titel'], 'autor': v['autor'], 'quelle': v['quelle'], 'lizenz': v['liz'], 'kurz': v['kurz'],
                     'verwendung': 'Hintergrund (warm gegradet, Ausschnitt, langsame Fahrt)' + ('; Lupe archiv/lupe-tasche.jpg' if q == 'martin' else '')}
CR['zeitung-teddy'] = {'datei': 'zeitung-teddy.jpg', 'titel': 'Drawing the line in Mississippi (Karikatur, Washington Post, 16. Nov. 1902)', 'autor': 'Clifford K. Berryman (1902)',
                       'quelle': LOC % '2008678324', 'lizenz': LIZ_LOC, 'kurz': 'Karikatur: C. K. Berryman 1902, LOC', 'verwendung': 'Ausschnitt (Zeitungs-Element, 1:1)'}
CR['zeitung-missoulian'] = {'datei': 'zeitung-missoulian.jpg', 'titel': 'The Daily Missoulian, 15. Okt. 1912, S. 1 ("Despite a wound in the breast, he makes his talk")',
                            'autor': 'The Daily Missoulian', 'quelle': 'https://www.loc.gov/resource/sn83025316/1912-10-15/ed-1/?sp=1', 'lizenz': LIZ_CA,
                            'kurz': 'Daily Missoulian 1912, LOC', 'verwendung': 'Zeitungsausschnitt Schlagzeile (1:1)'}
CR['zeitung-hemd'] = {'datei': 'zeitung-hemd.jpg', 'titel': 'Shirts Worn by Ex-President Roosevelt Showing Extent of Bleeding (Tafel im Buch "The attempted assassination of ex-President Theodore Roosevelt", Milwaukee 1912)',
                      'autor': 'O. E. Remey, H. F. Cochems, W. P. Bloodgood (Hg., 1912)', 'quelle': BUCH + '/page/n27', 'lizenz': LIZ_IA, 'kurz': 'Buch 1912, Internet Archive',
                      'verwendung': 'Ausschnitt (untere Tafel, Zeitungs-Element, 1:1)'}
json.dump(CR, open(cp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('grund.json + credits.json geschrieben,', len(bilder), 'Hintergrundbilder')
