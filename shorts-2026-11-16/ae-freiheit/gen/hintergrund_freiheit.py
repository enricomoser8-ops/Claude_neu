# Hintergrund-Vox (16.11.2026): vollflaechige Hintergrundbilder je Szene mit langsamer Fahrt (Ken Burns), dunkel + warm (Sepia) gegradet.
# Aufruf: python3 hintergrund_freiheit.py <dl-ordner>
#   <dl-ordner>: Downloads der Library of Congress (Dateinamen = LOC-Nummer, siehe QUELLEN; alle "No known restrictions" bzw.
#   Carol M. Highsmith Archive = gemeinfrei). Ergebnis: ../archiv/bg-*.jpg (Grading eingebacken, max ~2200 px lange Seite),
#   ../data/grund.json (Ebenen + Fahrt-Keys je Szene, liest gen_freiheit.py), Bildnachweise in ../archiv/credits.json (Eintraege bg-*).
# Fahrt-Modell (wie AE): Bildpunkt Q (Quellpixel) liegt auf Bildschirmpunkt P, Massstab z (Bildschirm-px je Quell-px).
#   In AE: Anker = (Q - o) * r, Position = P, Skalierung = z / r * 100 (o = Ausschnitt-Ursprung, r = Verkleinerung der JPG).
#   Alle drei Eigenschaften haben dieselben Key-Zeiten und dasselbe Ease -> dieselbe Fortschrittskurve u(t), Ebenen derselben
#   Quelle (Einstiegs-Sturzflug: weit -> nah) liegen dadurch exakt aufeinander. Das Skript prueft fuer jedes Frame, dass das Bild
#   die ganzen 1080 x 1920 deckt, und schneidet jede JPG nur so gross wie noetig.
import json, math, os, sys
import numpy as np
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..'); OUT = os.path.join(ROOT, 'archiv')
DL = sys.argv[1]
W, H, FPS, GW = 1080, 1920, 25, 1.02
MAXLONG = 2200          # Hoechstmass der Hintergrund-JPG (lange Seite), Leistung PC
MAXUP = 1.20            # hoechstens 120 % der echten Pixel (inkl. Gate Weave 102 %)

# ---------- Quellen (LOC) ----------
LOCI = 'https://www.loc.gov/item/%s/'
QUELLEN = {
 'hafen-heute': dict(datei='2017882052_hr.jpg', loc='2017882052', titel='The Statue of Liberty on Liberty Island (Luftbild, Manhattan im Hintergrund)', autor='Carol M. Highsmith (2017)', kurz='Foto: Carol M. Highsmith, LOC', gueltig=(0.0, 0.0, 1.0, 1.0), farbe=0.38),
 'bedloe-1886': dict(datei='99614141.jpg', loc='99614141', titel="Re-constructing the statue on Bedloe's Island (Druck, 1886)", autor='unbekannt (1886)', kurz='Druck 1886, LOC', gueltig=(0.02, 0.02, 0.97, 0.955), farbe=0.0),
 'paris-kopf-1878': dict(datei='97502744.jpg', loc='97502744', titel='Head of the Statue of Liberty on display at Champ-de-Mars, Paris 1878', autor='unbekannt (1878/1883)', kurz='Foto: Paris 1878, LOC', gueltig=(0.11, 0.11, 0.89, 0.90), farbe=0.0),
 'werkstatt-paris': dict(datei='97502750.jpg', loc='97502750', titel='Workmen constructing the Statue of Liberty, hammering copper (Gaget, Gauthier & Co., Paris)', autor='Pierre Petit (1881-1883)', kurz='Foto: Pierre Petit, LOC', gueltig=(0.01, 0.025, 0.99, 0.97), farbe=0.0),
 'geruest-paris': dict(datei='2020634761.jpg', loc='2020634761', titel='Assemblage of the Statue of Liberty in Paris (Geruest)', autor='Albert Fernique (1883)', kurz='Foto: A. Fernique 1883, LOC', gueltig=(0.03, 0.02, 0.97, 0.98), farbe=0.0),
 'insel-1890': dict(datei='2016801649.jpg', loc='2016801649', titel='Statue of Liberty, New York harbor', autor='Detroit Publishing Co. (um 1890)', kurz='Foto: Detroit Publishing Co., LOC', gueltig=(0.075, 0.045, 0.915, 0.945), farbe=0.0),
 'wolken-1910': dict(datei='2016814203.jpg', loc='2016814203', titel='Statue of Liberty, New York harbor (Wolken)', autor='Detroit Publishing Co. (um 1910)', kurz='Foto: Detroit Publishing Co., LOC', gueltig=(0.065, 0.125, 0.935, 0.875), farbe=0.0),
 'gewand-heute': dict(datei='2011630662_hr.jpg', loc='2011630662', titel='Statue of Liberty, New York (Nahaufnahme)', autor='Carol M. Highsmith (1980er)', kurz='Foto: Carol M. Highsmith, LOC', gueltig=(0.0, 0.0, 1.0, 1.0), farbe=0.30),
 'photochrom-1905': dict(datei='2008679689.jpg', loc='2008679689', titel='Statue of Liberty, New York Harbor (Photochrom)', autor='Detroit Photographic Co. (um 1905)', kurz='Photochrom um 1905, LOC', gueltig=(0.025, 0.035, 0.975, 0.965), farbe=0.30),
 'kapitol-1902': dict(datei='2025164878.jpg', loc='2025164878', titel='The Capitol, Washington', autor='Detroit Publishing Co. (1902)', kurz='Foto: Detroit Publishing Co. 1902, LOC', gueltig=(0.06, 0.075, 0.94, 0.925), farbe=0.0),
 'zeitung-seite': dict(datei='np_ej_1906_hr.jpg', loc=None, url='https://www.loc.gov/resource/sn85042354/1906-10-17/ed-1/?sp=3', titel='Evening Journal (Wilmington, Del.), 17. Okt. 1906, S. 3 (ganze Seite)', autor='Evening Journal', kurz='Evening Journal 1906, LOC', gueltig=(0.03, 0.02, 0.97, 0.97), farbe=0.0),
 'statue-nah': dict(datei='2017882051_hr.jpg', loc='2017882051', titel='The Statue of Liberty on Liberty Island (Luftbild nah)', autor='Carol M. Highsmith (2017)', kurz='Foto: Carol M. Highsmith, LOC', gueltig=(0.0, 0.0, 1.0, 1.0), farbe=0.32),
 'wolken-1905': dict(datei='2016799950.jpg', loc='2016799950', titel='Statue of Liberty, New York harbor (Wolken)', autor='Detroit Publishing Co. (um 1905)', kurz='Foto: Detroit Publishing Co., LOC', gueltig=(0.065, 0.095, 0.935, 0.905), farbe=0.0),
 'insel-luft': dict(datei='2011632948.jpg', loc='2011632948', titel='Statue of Liberty, New York (Luftbild)', autor='Carol M. Highsmith (1980er)', kurz='Foto: Carol M. Highsmith, LOC', gueltig=(0.0, 0.0, 1.0, 1.0), farbe=0.25),
}

# ---------- Szenen: Fahrt-Keys (t, Q in Anteilen der Quelle, P Bildschirm, vis = sichtbarer Anteil der Quellhoehe) + Ebenen ----------
# t: Sekunden ab Szenenanfang, 'E' = Szenenende. infl: [[in, out], ...] je Key (wie keys() in vox_lib).
TL = json.load(open(os.path.join(ROOT, 'data', 'timeline.json')))
SC = {s['id']: s for s in TL['scenes']}
def k(sid, name): return SC[sid]['k'][name] - SC[sid]['start']
LIB_Q = (0.7985, 0.50)             # Liberty-Statue (Sockel, Nadelspitze) im Highsmith-Luftbild
LIB_P = (300, 1200)                # ... auf dem Bildschirm am Ende des Einstiegs (links unten, Platz fuer den Abzug oben rechts)
TDIVE = 1.48
G = {
 # 1 Einstieg: Hafen weit (Manhattan, Insel), Sturzflug nach rechts auf die Statue; weit -> nah ueberblendet
 'hook': dict(keys=[(0.0, (0.50, 0.47), (540, 960), 0.99), (TDIVE, LIB_Q, LIB_P, 0.62), ('E', LIB_Q, LIB_P, 0.60)],
              infl=[[33, 72], [38, 60], [60, 33]], ebenen=[('hafen-heute', 'weit', 0.0, 0.80, 0.0), ('hafen-heute', 'mittel', 0.66, 1.12, 0.14), ('hafen-heute', 'nah', 0.98, 'E', 0.14)],
              pin={'Liberty Island': LIB_Q}),
 'braun': dict(keys=[(0.0, (0.47, 0.47), (560, 960), 0.91), ('E', (0.47, 0.45), (540, 960), 0.85)], ebenen=[('bedloe-1886', 'bild', 0, 'E', 0)]),
 # 3 Geschenk: schneller Zoom auf den Kopf (Paris 1878) zum Whoosh bei "Geschenk"
 'geschenk': dict(keys=[(0.0, (0.47, 0.50), (540, 960), 0.77), (k('geschenk', 'geschenk') - 0.08, (0.47, 0.49), (540, 960), 0.76),
                        (k('geschenk', 'geschenk') + 0.54, (0.45, 0.42), (540, 820), 0.60), ('E', (0.45, 0.42), (540, 820), 0.585)],
                  infl=[[40, 40], [20, 20], [85, 40], [40, 40]], ebenen=[('paris-kopf-1878', 'bild', 0, 'E', 0)]),
 'haut': dict(keys=[(0.0, (0.44, 0.55), (540, 960), 0.92), ('E', (0.48, 0.55), (540, 960), 0.86)], ebenen=[('werkstatt-paris', 'bild', 0, 'E', 0)]),
 # 5 Eiffel: langsam am eisernen Geruest hinauf
 'eiffel': dict(keys=[(0.0, (0.50, 0.55), (540, 960), 0.90), ('E', (0.52, 0.42), (540, 960), 0.78)], ebenen=[('geruest-paris', 'bild', 0, 'E', 0)]),
 'folge': dict(keys=[(0.0, (0.45, 0.48), (540, 960), 0.87), ('E', (0.45, 0.47), (540, 960), 0.84)], ebenen=[('insel-1890', 'bild', 0, 'E', 0)]),
 'regen': dict(keys=[(0.0, (0.47, 0.50), (540, 960), 0.73), ('E', (0.46, 0.48), (540, 960), 0.68)], ebenen=[('wolken-1910', 'bild', 0, 'E', 0)]),
 'patina': dict(keys=[(0.0, (0.66, 0.80), (540, 960), 0.36), ('E', (0.64, 0.78), (540, 960), 0.33)], ebenen=[('gewand-heute', 'gewand', 0, 'E', 0)]),
 'rost': dict(keys=[(0.0, (0.475, 0.52), (540, 960), 0.90), ('E', (0.475, 0.50), (540, 960), 0.83)], ebenen=[('photochrom-1905', 'bild', 0, 'E', 0)]),
 'kongress': dict(keys=[(0.0, (0.505, 0.37), (540, 640), 0.83), ('E', (0.505, 0.37), (540, 640), 0.75)], ebenen=[('kapitol-1902', 'bild', 0, 'E', 0)],
                  pin={'Kapitol': (0.505, 0.37)}),
 'protest': dict(keys=[(0.0, (0.29, 0.44), (540, 960), 0.44), ('E', (0.31, 0.44), (540, 960), 0.41)], ebenen=[('zeitung-seite', 'bild', 0, 'E', 0)]),
 'pruefen': dict(keys=[(0.0, (0.50, 0.52), (540, 960), 0.96), ('E', (0.505, 0.50), (540, 960), 0.90)], ebenen=[('statue-nah', 'bild', 0, 'E', 0)]),
 'ergebnis': dict(keys=[(0.0, (0.56, 0.60), (540, 960), 0.40), ('E', (0.56, 0.58), (540, 960), 0.37)], ebenen=[('gewand-heute', 'krone', 0, 'E', 0)]),
 # 14 bleibt: dieselbe Ansicht wie am Ende des Einstiegs (Statue links unten, Abzug "heute" oben rechts)
 'bleibt': dict(keys=[(0.0, LIB_Q, LIB_P, 0.62), ('E', LIB_Q, LIB_P, 0.59)], ebenen=[('hafen-heute', 'nah', 0, 'E', 0)], pin={'Liberty Island': LIB_Q}),
 'frage': dict(keys=[(0.0, (0.47, 0.50), (540, 960), 0.79), ('E', (0.47, 0.49), (540, 960), 0.75)], ebenen=[('wolken-1905', 'bild', 0, 'E', 0)]),
 'outro': dict(keys=[(0.0, (0.45, 0.50), (540, 960), 0.99), ('E', (0.45, 0.48), (540, 960), 0.93)], ebenen=[('insel-luft', 'bild', 0, 'E', 0)], hell=0.50),
}

# ---------- AE-Ease nachrechnen (Geschwindigkeit 0, Einfluss): wie gen/aemock.js ----------
def bez(a, b, c, d, s): m = 1 - s; return m * m * m * a + 3 * m * m * s * b + 3 * m * s * s * c + s * s * s * d
def ease_prog(u, oi, ii):
    lo, hi = 0.0, 1.0
    for _ in range(40):
        mid = (lo + hi) / 2
        if bez(0, oi, 1 - ii, 1, mid) < u: lo = mid
        else: hi = mid
    return bez(0, 0, 1, 1, (lo + hi) / 2)
def state(g, t, src):
    """Q (Quell-px), P, z zur Zeit t"""
    K = g['_k']
    if t <= K[0][0]: a = b = K[0]; p = 0
    elif t >= K[-1][0]: a = b = K[-1]; p = 0
    else:
        i = max(j for j in range(len(K) - 1) if K[j][0] <= t); a, b = K[i], K[i + 1]
        inf = g['infl']; p = ease_prog((t - a[0]) / (b[0] - a[0]), inf[i][1] / 100, inf[i + 1][0] / 100)
    L = lambda x, y: x + (y - x) * p
    return [L(a[1][0], b[1][0]), L(a[1][1], b[1][1])], [L(a[2][0], b[2][0]), L(a[2][1], b[2][1])], L(a[3], b[3])

# ---------- Grading (eingebacken): Tonwerte, abdunkeln, warmer Sepia-Duoton, etwas Originalfarbe ----------
STOPS = [(0.0, (14, 10, 7)), (0.28, (52, 38, 26)), (0.55, (112, 86, 60)), (0.80, (178, 146, 106)), (1.0, (232, 208, 168))]
def sepia_map(L):
    out = np.zeros(L.shape + (3,), np.float32)
    xs = [s[0] for s in STOPS]
    for c in range(3): out[..., c] = np.interp(L, xs, [s[1][c] / 255.0 for s in STOPS])
    return out
def grade(im, farbe, hell):
    a = np.asarray(im.convert('RGB')).astype(np.float32) / 255.0
    L = 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
    lo, hi = np.percentile(L, 1.0), np.percentile(L, 99.3)
    Ln = np.clip((L - lo) / max(0.05, hi - lo), 0, 1)
    Ld = np.clip(Ln ** 1.18 * hell, 0, 1)
    sep = sepia_map(Ld)
    if farbe > 0:   # Originalfarbe (gleich hell wie der Sepia-Wert), leicht angewaermt
        col = a / np.maximum(L[..., None], 1e-3) * Ld[..., None]
        col = col * np.array([1.06, 1.0, 0.90], np.float32)
        sep = sep * (1 - farbe) + np.clip(col, 0, 1) * farbe
    return Image.fromarray((np.clip(sep, 0, 1) * 255 + 0.5).astype(np.uint8))

# ---------- Ausschnitte berechnen ----------
srcsize = {}
for q, v in QUELLEN.items(): srcsize[q] = Image.open(os.path.join(DL, v['datei'])).size
need = {}       # (quelle, name) -> [x0, y0, x1, y1, maxz]
for sid, g in G.items():
    dur = SC[sid]['end'] - SC[sid]['start']
    q0 = g['ebenen'][0][0]; sw, sh = srcsize[q0]
    gu = QUELLEN[q0]['gueltig']; g['_k'] = []
    for (t, Q, P, vis) in g['keys']:   # Q so verschieben, dass das Bild an diesem Key ganz im gueltigen Bereich liegt (P, z bleiben)
        z = H / (vis * sh); qx, qy = Q[0] * sw, Q[1] * sh; m = 8 / z
        lo_x, hi_x = gu[0] * sw + P[0] / z + m, gu[2] * sw - (W - P[0]) / z - m
        lo_y, hi_y = gu[1] * sh + P[1] / z + m, gu[3] * sh - (H - P[1]) / z - m
        if lo_x > hi_x or lo_y > hi_y: sys.exit('FEHLER %s: vis %.3f zu gross fuer den gueltigen Bereich' % (sid, vis))
        nx, ny = min(max(qx, lo_x), hi_x), min(max(qy, lo_y), hi_y)
        if abs(nx - qx) > 0.5 or abs(ny - qy) > 0.5: print('  %s: Key %s Q verschoben um %+.0f / %+.0f Quell-px' % (sid, t, nx - qx, ny - qy))
        g['_k'].append((dur if t == 'E' else t, (nx, ny), P, z))
    g.setdefault('infl', [[60, 60]] + [[60, 60]] * (len(g['keys']) - 1) if len(g['keys']) > 2 else [[30, 30], [30, 30]])
    for (q, name, tin, tout, fade) in g['ebenen']:
        assert q == q0, 'eine Quelle je Szene'
        t0 = tin; t1 = dur if tout == 'E' else tout
        key = (q, name); b = need.setdefault(key, [1e9, 1e9, -1e9, -1e9, 0])
        f = int(round(t0 * FPS))
        while f <= int(round(t1 * FPS)):
            Q, P, z = state(g, f / FPS, q)
            m = 4 / z
            x0, x1 = Q[0] - P[0] / z - m, Q[0] + (W - P[0]) / z + m
            y0, y1 = Q[1] - P[1] / z - m, Q[1] + (H - P[1]) / z + m
            b[0] = min(b[0], x0); b[1] = min(b[1], y0); b[2] = max(b[2], x1); b[3] = max(b[3], y1); b[4] = max(b[4], z)
            f += 1
bilder = {}
err = 0
for (q, name), b in need.items():
    sw, sh = srcsize[q]; gu = QUELLEN[q]['gueltig']
    gx0, gy0, gx1, gy1 = gu[0] * sw, gu[1] * sh, gu[2] * sw, gu[3] * sh
    if b[0] < gx0 - 0.5 or b[1] < gy0 - 0.5 or b[2] > gx1 + 0.5 or b[3] > gy1 + 0.5:
        print('FEHLER Ausschnitt %s/%s braucht x %.0f..%.0f y %.0f..%.0f, gueltig x %.0f..%.0f y %.0f..%.0f' % (q, name, b[0], b[2], b[1], b[3], gx0, gx1, gy0, gy1)); err += 1
    x0, y0 = math.floor(max(gx0, b[0])), math.floor(max(gy0, b[1])); x1, y1 = math.ceil(min(gx1, b[2])), math.ceil(min(gy1, b[3]))
    r = min(1.0, b[4] * GW / 1.0, MAXLONG / max(x1 - x0, y1 - y0))
    up = b[4] / r * GW
    if up > MAXUP + 1e-6: print('FEHLER %s/%s: %.0f %% der echten Pixel (Ausschnitt %.0f x %.0f, max z %.3f)' % (q, name, up * 100, x1 - x0, y1 - y0, b[4])); err += 1
    ow, oh = int(round((x1 - x0) * r)), int(round((y1 - y0) * r))
    r = ow / (x1 - x0)
    rel = 'archiv/bg-%s%s.jpg' % (q, '' if name == 'bild' else '-' + name)
    bilder[(q, name)] = dict(rel=rel, o=[x0, y0], r=r, size=[ow, oh], up=round(b[4] / r * GW, 3))
if err: sys.exit('%d Fehler' % err)

# ---------- schreiben ----------
for (q, name), bi in bilder.items():
    v = QUELLEN[q]; im = Image.open(os.path.join(DL, v['datei']))
    x0, y0 = bi['o']; sw = bi['size'][0] / bi['r']; sh = bi['size'][1] / bi['r']
    im = im.crop((x0, y0, int(round(x0 + sw)), int(round(y0 + sh)))).resize(tuple(bi['size']), Image.LANCZOS)
    hell = 0.60
    for g in G.values():
        if any((e[0], e[1]) == (q, name) for e in g['ebenen']) and 'hell' in g: hell = g['hell']
    gi = grade(im, v['farbe'], hell)
    gi.save(os.path.join(ROOT, bi['rel']), quality=86, optimize=True)
    m = np.asarray(gi).mean() / 255
    print('%-34s %4d x %4d  r %.3f  max %3.0f %% echte Pixel  mittlere Helligkeit %.2f' % (bi['rel'], bi['size'][0], bi['size'][1], bi['r'], bi['up'] * 100, m))
GR = {}
for sid, g in G.items():
    q = g['ebenen'][0][0]
    ks = [{'t': round(t, 4), 'Q': [round(Q[0], 2), round(Q[1], 2)], 'P': list(P), 'z': round(z, 6)} for (t, Q, P, z) in g['_k']]
    eb = []
    for (q2, name, tin, tout, fade) in g['ebenen']:
        bi = bilder[(q2, name)]
        eb.append({'rel': bi['rel'], 'o': bi['o'], 'r': round(bi['r'], 6), 'tin': tin, 'tout': None if tout == 'E' else tout, 'fade': fade})
    pins = {}
    for n, qq in g.get('pin', {}).items():
        sw, sh = srcsize[q]; Qp = (qq[0] * sw, qq[1] * sh); last = g['_k'][-1]
        P = [last[2][0] + (Qp[0] - last[1][0]) * last[3], last[2][1] + (Qp[1] - last[1][1]) * last[3]]
        pins[n] = [round(P[0], 1), round(P[1], 1)]
    GR[sid] = {'keys': ks, 'infl': g['infl'], 'ebenen': eb, 'pin': pins, 'quelle': 'bg-' + q}
json.dump(GR, open(os.path.join(ROOT, 'data', 'grund.json'), 'w'), indent=1)
# Bildnachweise ergaenzen
cp = os.path.join(OUT, 'credits.json'); C = json.load(open(cp, encoding='utf-8'))
for alt in ('globus', 'karte'): C.pop(alt, None)   # Karten-/Globus-Stil (13.11.) entfaellt
for q, v in QUELLEN.items():
    C['bg-' + q] = {'datei': ', '.join(sorted(set(b['rel'].split('/')[-1] for (qq, n), b in bilder.items() if qq == q))), 'titel': v['titel'], 'autor': v['autor'],
                    'quelle': v.get('url') or LOCI % v['loc'], 'lizenz': 'gemeinfrei (No known restrictions, LOC)' if 'Highsmith' not in v['autor'] else 'gemeinfrei (Carol M. Highsmith Archive, der Oeffentlichkeit gewidmet, LOC)',
                    'kurz': v['kurz'], 'verwendung': 'Hintergrund (abgedunkelt, warm gegradet, Ausschnitt)'}
# Zeitungsausschnitt fuer Szene 10 (Kongress): echte Spalte derselben Seite, 1:1 Bildpunkte (Seite 5224 px breit)
#   "... wait Congress, at its last session, came to the rescue with $62,800 ..." (ALTO-OCR, Zeilen y 2180..2370)
from PIL import ImageOps
zs = Image.open(os.path.join(DL, 'np_ej_1906_hr.jpg')).convert('L').crop((1530, 2180, 2214, 2370))
zs = ImageOps.autocontrast(zs, cutoff=1); zs.save(os.path.join(OUT, 'zeitung-1906-kongress.jpg'), quality=90)
C['zeitung-1906-kongress'] = dict(C['zeitung-1906-wilmington'], datei='zeitung-1906-kongress.jpg', verwendung='Ausschnitt Spalte "Congress ... $62,800" (1:1)')
json.dump(C, open(cp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('grund.json + credits.json geschrieben,', len(bilder), 'Hintergrundbilder')
