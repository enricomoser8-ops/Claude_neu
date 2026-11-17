# Hintergrund-Vox (Beethoven-Short 17.11.2026): vollflaechiges Archivbild je Szene mit langsamer Fahrt (Ken Burns), warm/Sepia gegradet (hell genug).
# Vorlage: ae-jessop/gen/hintergrund_jessop.py (16.11.). Neu: hoechstens 110 % der echten Pixel (MAXUP), Commons-Nachweise aus archiv/commons_liste.json.
# Aufruf: python3 hintergrund_beethoven.py <dl-ordner>   (<dl>/src/*.jpg aus quellen_beethoven.py)
# Ergebnis: ../archiv/bg-*.jpg (Grading eingebacken, max 2200 px lange Seite), ../data/grund.json (Fahrt-Keys, Punkte, Groesse je Szene), ../archiv/credits.json.
# Fahrt-Modell wie in AE: Bildpunkt Q (Quellpixel) liegt auf Bildschirmpunkt P, Massstab z. Alle Keys gleiche Zeiten/Ease.
import json, math, os, sys
import numpy as np
from PIL import Image, ImageOps
Image.MAX_IMAGE_PIXELS = None
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..'); OUT = os.path.join(ROOT, 'archiv')
DL = sys.argv[1]
W, H, FPS, GW = 1080, 1920, 25, 1.02
MAXLONG = 2200; MAXUP = 1.10
LOC = 'https://www.loc.gov/item/%s/'
LIZ_LOC = 'gemeinfrei (No known restrictions on publication, LOC Prints & Photographs)'
LIZ_HW = "gemeinfrei (Harper's Weekly %s, US-Veroeffentlichung vor 1930; LOC: No known restrictions)"
LIZ_IA = 'gemeinfrei (Erstausgabe Schott 1826; Internet Archive, %s)'
QUELLEN = {
 'stieler': dict(titel='Ludwig van Beethoven (Chromolithografie nach dem Bildnis von J. K. Stieler)', autor='unbekannt, um 1870 (LOC)', quelle=LOC % '2003663902',
                 kurz='Chromolithografie um 1870, LOC', liz=LIZ_LOC, farbe=0.55, warm=(1.04, 1.0, 0.93)),
 'litho': dict(titel='H. V. Beethoven [L. v. Beethoven] (Lithografie, Paris, Maurice Schlesinger)', autor='Lithografie bei Maurice Schlesinger, Paris (19. Jh.)', quelle=LOC % '2003666857',
               kurz='Lithografie, Paris (Schlesinger), LOC', liz=LIZ_LOC, farbe=0.0),
 'wien': dict(titel='Nieder=Oesterreich: Wien (kolorierte Lithografie)', autor='Jakob Alt (gez.), zwischen 1825 und 1838', quelle=LOC % '2017646657',
              kurz='Jakob Alt, Wien um 1830, LOC', liz=LIZ_LOC, farbe=0.55, warm=(1.04, 1.0, 0.93)),
 'buste': dict(titel='Beethoven (Foto einer Buste)', autor='unbekannt, um 1892 (LOC)', quelle=LOC % '2001700485', kurz='Foto um 1892, LOC', liz=LIZ_LOC, farbe=0.0),
 'titel': dict(titel='Sinfonie mit Schluss-Chor ueber Schillers Ode "An die Freude", op. 125, Titelblatt der Erstausgabe (B. Schott\'s Soehne, Mainz 1826)',
               autor='Ludwig van Beethoven / B. Schott\'s Soehne (1826); Exemplar Boston Public Library', quelle='https://archive.org/details/sinfoniemitschlu00beet/page/n28',
               kurz='Erstausgabe 1826, Boston Public Library', liz=LIZ_IA % 'Boston Public Library', farbe=0.0),
 'partitur1': dict(titel='Sinfonie op. 125, Partitur der Erstausgabe (Schott 1826), S. 1', autor='Ludwig van Beethoven / B. Schott\'s Soehne (1826); Bywaters Special Collections, Hamon Arts Library, SMU',
                   quelle='https://archive.org/details/VaultM1001B415Op1251826/page/n8', kurz='Partitur 1826, SMU Bywaters Special Collections', liz=LIZ_IA % 'Public Domain Mark (SMU)', farbe=0.0),
 'partitur103': dict(titel='Sinfonie op. 125, Partitur der Erstausgabe (Schott 1826), S. 103', autor='Ludwig van Beethoven / B. Schott\'s Soehne (1826); Bywaters Special Collections, Hamon Arts Library, SMU',
                     quelle='https://archive.org/details/VaultM1001B415Op1251826/page/n110', kurz='Partitur 1826, SMU Bywaters Special Collections', liz=LIZ_IA % 'Public Domain Mark (SMU)', farbe=0.0),
 'partitur113': dict(titel='Sinfonie op. 125, Partitur der Erstausgabe (Schott 1826), S. 113 ("Freude, schoener Goetterfunken")', autor='Ludwig van Beethoven / B. Schott\'s Soehne (1826); Bywaters Special Collections, Hamon Arts Library, SMU',
                     quelle='https://archive.org/details/VaultM1001B415Op1251826/page/n120', kurz='Partitur 1826, SMU Bywaters Special Collections', liz=LIZ_IA % 'Public Domain Mark (SMU)', farbe=0.0),
 'grant': dict(titel='Ovation to Lieutenant General Grant at the Cooper Institute, New York, June 7 (Holzstich, Harper\'s Weekly 1865)', autor="Harper's Weekly (1865)", quelle=LOC % '2001695557',
               kurz="Holzstich, Harper's Weekly 1865, LOC", liz=LIZ_HW % '1865', farbe=0.0),
 'brooklyn': dict(titel='The Brooklyn Academy of Music - interior - opening concert, January 15, 1861 (Holzstich, Harper\'s Weekly 1861)', autor="Harper's Weekly (1861)", quelle=LOC % '2004682222',
                  kurz="Holzstich, Harper's Weekly 1861, LOC", liz=LIZ_HW % '1861', farbe=0.0),
}
TL = json.load(open(os.path.join(ROOT, 'data', 'timeline.json')))
SC = {s['id']: s for s in TL['scenes']}
def k(sid, name): return SC[sid]['k'][name] - SC[sid]['start']
C = (540, 960)
# keys: (t, Q als Anteil der Quelle (src = Ausschnitt aus quellen_beethoven.py), P, sichtbarer Anteil der Quellhoehe); pts: benannte Punkte (Anteile)
# Regel 17.11.: hoechstens 110 % der echten Pixel (MAXUP) -> sichtbare Quellhoehe >= 1920 / (1.10 / 1.02) = 1781 px
G = {
 'hook': dict(q='stieler', datei='stieler-hook', keys=[(0.0, (0.46, 0.44), C, 0.60), ('E', (0.45, 0.43), C, 0.50)], gam=0.85, hell=0.90, pts={'gesicht': (0.447, 0.417), 'ohr': (0.36, 0.41)}),
 'name': dict(q='litho', datei='litho-name', keys=[(0.0, (0.61, 0.75), (540, 1210), 0.66), ('E', (0.61, 0.74), (540, 1210), 0.60)], gam=0.85, hell=0.86),
 'taub': dict(q='litho', datei='litho-taub', keys=[(0.0, (0.474, 0.26), C, 0.40), ('E', (0.474, 0.25), C, 0.34)], gam=0.85, hell=0.86, pts={'gesicht': (0.474, 0.245), 'ohr': (0.395, 0.258)}),
 'heft': dict(q='partitur1', keys=[(0.0, (0.50, 0.45), C, 0.62), ('E', (0.52, 0.42), C, 0.56)], hell=0.82),
 'wien': dict(q='wien', keys=[(0.0, (0.37, 0.50), C, 0.95), ('E', (0.35, 0.48), C, 0.80)], gam=0.9, hell=0.84, pts={'turm': (0.349, 0.425)}),
 'sinfonie': dict(q='titel', keys=[(0.0, (0.60, 0.20), (540, 760), 0.50), ('E', (0.56, 0.25), (540, 760), 0.46)], hell=0.84),
 'folge': dict(q='buste', keys=[(0.0, (0.45, 0.46), C, 0.70), ('E', (0.46, 0.44), C, 0.64)], gam=0.72, hell=0.92),
 'takt': dict(q='partitur103', keys=[(0.0, (0.48, 0.50), C, 0.62), ('E', (0.52, 0.47), C, 0.55)], hell=0.80),
 'jubel': dict(q='grant', datei='grant-jubel', keys=[(0.0, (0.48, 0.52), C, 0.96), ('E', (0.48, 0.62), C, 0.80)], gam=0.72, hell=0.92, pts={'buehne': (0.484, 0.555), 'menge': (0.47, 0.80)}),
 'ruecken': dict(q='brooklyn', datei='brooklyn-ruecken', keys=[(0.0, (0.49, 0.55), C, 0.76), ('E', (0.484, 0.62), C, 0.64)], gam=0.72, hell=0.92, pts={'dirigent': (0.484, 0.687)}),
 'saengerin': dict(q='brooklyn', datei='brooklyn-saengerin', keys=[(0.0, (0.484, 0.62), C, 0.64), ('E', (0.49, 0.58), C, 0.56)], gam=0.72, hell=0.92, pts={'dirigent': (0.484, 0.687)}),
 'huete': dict(q='grant', datei='grant-huete', keys=[(0.0, (0.47, 0.74), C, 0.66), ('E', (0.57, 0.73), C, 0.645)], gam=0.72, hell=0.92,
               pts={'hutA': (0.4485, 0.709), 'hutB': (0.498, 0.765), 'hutC': (0.57, 0.747), 'menge': (0.51, 0.74)}),
 'hymne': dict(q='partitur113', keys=[(0.0, (0.68, 0.66), (540, 900), 0.54), ('E', (0.68, 0.64), (540, 900), 0.51)], hell=0.84),
 'frage': dict(q='stieler', datei='stieler-frage', keys=[(0.0, (0.47, 0.43), C, 0.48), ('E', (0.465, 0.42), C, 0.44)], gam=0.8, hell=0.94, pts={'augen': (0.47, 0.375)}),
 'outro': dict(q='wien', datei='wien-outro', keys=[(0.0, (0.66, 0.52), C, 0.97), ('E', (0.68, 0.52), C, 0.93)], gam=0.9, hell=0.80),
}
LUPE = {}
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
need = {}; QOF = {}
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
    dn = g.setdefault('datei', q); QOF[dn] = q
    b = need.setdefault(dn, [1e9, 1e9, -1e9, -1e9, 0])
    f = 0
    while f <= int(round(dur * FPS)):
        Q, P, z = state(g, f / FPS); m = 4 / z
        b[0] = min(b[0], Q[0] - P[0] / z - m); b[2] = max(b[2], Q[0] + (W - P[0]) / z + m)
        b[1] = min(b[1], Q[1] - P[1] / z - m); b[3] = max(b[3], Q[1] + (H - P[1]) / z + m); b[4] = max(b[4], z)
        f += 1
bilder = {}; err = 0
for q, b in need.items():
    sw, sh = srcsize[QOF[q]]
    if b[0] < -0.5 or b[1] < -0.5 or b[2] > sw + 0.5 or b[3] > sh + 0.5: print('FEHLER Ausschnitt %s' % q, b, sw, sh); err += 1
    x0, y0 = math.floor(max(0, b[0])), math.floor(max(0, b[1])); x1, y1 = math.ceil(min(sw, b[2])), math.ceil(min(sh, b[3]))
    r = min(1.0, b[4] * GW, MAXLONG / max(x1 - x0, y1 - y0))
    up = b[4] / r * GW
    if up > MAXUP + 1e-6: print('FEHLER %s: %.0f %% der echten Pixel' % (q, up * 100)); err += 1
    ow, oh = int(round((x1 - x0) * r)), int(round((y1 - y0) * r)); r = ow / (x1 - x0)
    bilder[q] = dict(rel='archiv/bg-%s.jpg' % q, o=[x0, y0], r=r, size=[ow, oh], up=round(b[4] / r * GW, 3))
if err: sys.exit('%d Fehler' % err)
TW = {q: tonwerte(Image.open(os.path.join(DL, 'src', q + '.jpg'))) for q in QUELLEN}
HELL = {g['datei']: g.get('hell', 0.78) for g in G.values()}
GAM = {g['datei']: g.get('gam', 1.0) for g in G.values()}
for dn, bi in bilder.items():
    q = QOF[dn]; v = QUELLEN[q]; im = Image.open(os.path.join(DL, 'src', q + '.jpg'))
    x0, y0 = bi['o']; sw = bi['size'][0] / bi['r']; sh = bi['size'][1] / bi['r']
    im = im.crop((x0, y0, int(round(x0 + sw)), int(round(y0 + sh)))).resize(tuple(bi['size']), Image.LANCZOS)
    gi = grade(im, v['farbe'], HELL[dn], *TW[q], warm=v.get('warm', (1.06, 1.0, 0.90)), gam=GAM[dn])
    gi.save(os.path.join(ROOT, bi['rel']), quality=87, optimize=True)
    print('%-30s %4d x %4d  r %.3f  max %3.0f %% echte Pixel  Helligkeit %.2f' % (bi['rel'], bi['size'][0], bi['size'][1], bi['r'], bi['up'] * 100, np.asarray(gi).mean() / 255))
GR = {}
for sid, g in G.items():
    q = g['q']; sw, sh = srcsize[q]; bi = bilder[g['datei']]
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
# ---------- Bildnachweise ----------
cp = os.path.join(OUT, 'credits.json'); CR = {}
for q, v in QUELLEN.items():
    dns = sorted(d for d in bilder if QOF[d] == q)
    if not dns: continue
    CR['bg-' + q] = {'datei': ', '.join(bilder[d]['rel'].split('/')[-1] for d in dns), 'titel': v['titel'], 'autor': v['autor'], 'quelle': v['quelle'], 'lizenz': v['liz'], 'kurz': v['kurz'],
                     'verwendung': 'Hintergrund (warm gegradet, Ausschnitt, langsame Fahrt)'}
# Commons-Dateien (nur auf dem PC geladen, siehe archiv/commons_liste.json): Nachweis hier, Lizenz auf dem PC pruefen
for e in json.load(open(os.path.join(OUT, 'commons_liste.json'), encoding='utf-8'))['dateien']:
    if not e.get('verwendet'): continue
    CR[e['schluessel']] = {'datei': e['ziel'], 'titel': e['titel'], 'autor': e['autor'], 'quelle': e['seite'], 'lizenz': e['lizenz_zu_pruefen'] + ' (auf dem PC pruefen)',
                           'kurz': e['kurz'], 'verwendung': e['verwendung']}
CR['europaflagge'] = {'datei': '(in AE gezeichnet)', 'titel': 'Europaflagge nach offizieller Geometrie (12 goldene Sterne auf Blau), selbst gezeichnet', 'autor': 'eigene Grafik',
                      'quelle': 'https://european-union.europa.eu/principles-countries-history/symbols/european-flag_de', 'lizenz': 'Symbol, eigene Zeichnung', 'kurz': 'Grafik: Europaflagge', 'verwendung': 'Szene hymne'}
json.dump(CR, open(cp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('grund.json + credits.json geschrieben,', len(bilder), 'Hintergrundbilder')
