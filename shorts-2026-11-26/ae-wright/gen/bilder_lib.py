# Bilder fuer das Short zur Folge 42 (key bitcoin, 23.11.2026): Abzuege, Freisteller, geschichtete Hintergruende (Chris Moran TikTok 13).
# Eingang: archiv/roh/ (KI-Bilder ElevenLabs, Commons-Fotos) + ../../thumbnail/ (Muenze, Mining-Halle, Thumbnail C).
# Ausgang: archiv/p-*.jpg (Abzuege, natuerliche Farben, weisser Rand), archiv/f-*.png (Freisteller mit Sticker-Rand),
#          archiv/s-*.png (getoente Collage-Ebenen je Farbfamilie, gerissene Kante, Alpha), archiv/b-*.jpg (Grundflaeche je Familie),
#          data/bilder.json (Groessen, Ankerpunkte in Bildpixeln, Alpha-Rahmen).
# enno 23.11.: Hintergruende geschichtet, bewegt, FARBIG (nicht nur weiss/schwarz), NICHT zu dunkel.
import json, os, sys, random
import numpy as np
from PIL import Image, ImageFilter, ImageOps, ImageEnhance, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..'))
ROH = os.path.join(ROOT, 'archiv', 'roh'); OUT = os.path.join(ROOT, 'archiv'); TH = os.path.normpath(os.path.join(ROOT, '..', '..', 'thumbnail'))
random.seed(42)
META = {}

def hexrgb(h): return np.array([int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16)], np.float32)

# ---------- Abzug: natuerliche Farben, leichte Vereinheitlichung (Kontrast, warm), weisser Rand ----------
def abzug(name, src, crop=None, w=1000, rand=18, warm=1.0, hell=1.0, pts=None, gamma=1.0, blur=None):
    im = Image.open(src).convert('RGB')
    if crop: W0, H0 = im.size; im = im.crop((int(crop[0] * W0), int(crop[1] * H0), int(crop[2] * W0), int(crop[3] * H0)))
    s = w / im.width; im = im.resize((w, round(im.height * s)), Image.LANCZOS)
    for bx in (blur or []):   # Review 23.11.: Schriftzuege/Markennamen unkenntlich (Boxen als Bruchteile des gecroppten Bildes)
        b = tuple(int(v * (im.width if i % 2 == 0 else im.height)) for i, v in enumerate(bx)); im.paste(im.crop(b).filter(ImageFilter.GaussianBlur(14)), b[:2])
    if gamma != 1.0: im = Image.fromarray(np.clip(255.0 * (np.asarray(im).astype(np.float32) / 255.0) ** gamma, 0, 255).astype(np.uint8))   # Schatten anheben
    im = ImageEnhance.Contrast(im).enhance(1.06); im = ImageEnhance.Brightness(im).enhance(hell)
    a = np.asarray(im).astype(np.float32); a[..., 0] *= 1.0 + 0.03 * warm; a[..., 2] *= 1.0 - 0.04 * warm
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    big = Image.new('RGB', (im.width + 2 * rand, im.height + 2 * rand), (246, 243, 236)); big.paste(im, (rand, rand))
    big.save(os.path.join(OUT, 'p-%s.jpg' % name), quality=92)
    P = {}
    for k, (fx, fy) in (pts or {}).items():   # Punkte als Bruchteil des (gecroppten) Bildes -> Pixel im Abzug
        P[k] = [round(rand + fx * im.width, 1), round(rand + fy * im.height, 1)]
    META['p-%s.jpg' % name] = {'size': list(big.size), 'pts': P}
    return big

# ---------- Freisteller ----------
def sticker(c, border=12):
    pad = border * 2; big = Image.new('RGBA', (c.width + pad * 2, c.height + pad * 2), (0, 0, 0, 0))
    al = Image.new('L', big.size, 0); al.paste(c.split()[3], (pad, pad)); al = al.filter(ImageFilter.MaxFilter(border * 2 + 1)).filter(ImageFilter.GaussianBlur(1.2))
    wb = Image.new('RGBA', big.size, (250, 248, 242, 255)); wb.putalpha(al); big.alpha_composite(wb); big.alpha_composite(c, (pad, pad))
    return big, pad

def frei_hdd(h=760):
    im = Image.open(os.path.join(ROH, 'c-hdd-wd.jpg')).convert('RGB')
    a = np.asarray(im).astype(np.int16)
    mk = ((a.min(axis=2) < 236) | (np.ptp(a, axis=2) > 18)).astype(np.uint8) * 255
    import cv2
    mk = cv2.morphologyEx(mk, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    cs, _ = cv2.findContours(mk, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE); cc = max(cs, key=cv2.contourArea)
    full = np.zeros(mk.shape, np.uint8); cv2.drawContours(full, [cc], -1, 255, -1)
    full = cv2.erode(full, np.ones((3, 3), np.uint8))
    x, y, w0, h0 = cv2.boundingRect(cc)
    c = im.crop((x, y, x + w0, y + h0)); c.putalpha(Image.fromarray(full[y:y + h0, x:x + w0]).filter(ImageFilter.GaussianBlur(1.0)))
    s = h / c.height; c = c.resize((round(c.width * s), h), Image.LANCZOS)
    big, pad = sticker(c, 10)
    big.save(os.path.join(OUT, 'f-hdd.png'))
    # Punkte (Bruchteile des Freistellers ohne Rand): Etikett-Mitte, Mitte der Platte
    P = {'etikett': [pad + 0.58 * c.width, pad + 0.30 * c.height], 'mitte': [pad + 0.5 * c.width, pad + 0.5 * c.height]}
    META['f-hdd.png'] = {'size': list(big.size), 'pts': {k: [round(v[0], 1), round(v[1], 1)] for k, v in P.items()}, 'alpha': list(big.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox())}

def frei_coin(h=560):
    sys.path.insert(0, TH)
    import importlib.util
    spec = importlib.util.spec_from_file_location('m42c', os.path.join(TH, 'make42c.py'))
    src = open(os.path.join(TH, 'make42c.py'), encoding='utf-8').read()
    # nur die Funktion coin() ausfuehren (make42c.py rendert sonst beim Import)
    ns = {'np': np, 'Image': Image, 'ImageFilter': ImageFilter, 'P': os.path.join(TH, 'src') + '/'}
    start = src.index('def coin('); end = src.index('\ndef ', start + 5)
    exec(src[start:end], ns)
    c = ns['coin'](h)
    c.save(os.path.join(OUT, 'f-coin.png'))
    META['f-coin.png'] = {'size': list(c.size), 'pts': {'mitte': [c.width / 2, c.height * 0.47]}, 'alpha': list(c.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox())}

def frei_sack(h=430):   # schwarzer Muellsack aus dem KI-Bild (oben, vor Himmel) freistellen
    import cv2
    im = Image.open(os.path.join(ROH, 'ki-sack.png')).convert('RGB'); W0, H0 = im.size
    box = (int(0.25 * W0), int(0.0 * H0), int(0.75 * W0), int(0.36 * H0)); c = im.crop(box)
    a = np.asarray(c).astype(np.int16); mk = (a.max(axis=2) < 95).astype(np.uint8) * 255
    mk = cv2.morphologyEx(mk, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)); mk = cv2.morphologyEx(mk, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    cs, _ = cv2.findContours(mk, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE); cc = max(cs, key=cv2.contourArea)
    full = np.zeros(mk.shape, np.uint8); cv2.drawContours(full, [cc], -1, 255, -1)
    x, y, w0, h0 = cv2.boundingRect(cc)
    o = c.crop((x, y, x + w0, y + h0)).convert('RGBA'); o.putalpha(Image.fromarray(full[y:y + h0, x:x + w0]).filter(ImageFilter.GaussianBlur(1.0)))
    o = ImageEnhance.Brightness(o).enhance(1.25)
    s = h / o.height; o = o.resize((round(o.width * s), h), Image.LANCZOS)
    big, pad = sticker(o, 9); big.save(os.path.join(OUT, 'f-sack.png'))
    META['f-sack.png'] = {'size': list(big.size), 'pts': {'mitte': [big.width / 2, big.height / 2]}, 'alpha': list(big.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox())}

# ---------- Collage-Ebene (TikTok 13): Duotone in Familienfarben, gerissene Kante, weiche Kante innen ----------
FAM = {   # dunkel, hell, Grund oben, Grund unten  (Mittelwerte hell genug: Grund-Luminanz ~40-55 %)
    'teal':   ('#1E5650', '#D6F1E7', '#4A958A', '#2F6B63'),
    'orange': ('#7A3D10', '#FFE9C8', '#E0913E', '#B0631F'),
    'blau':   ('#1D4170', '#DDEBFA', '#5A8FC6', '#355F92'),
    'violett':('#3D2C6E', '#EEE6FF', '#8572C2', '#5A4896'),
    'ocker':  ('#5E3E1C', '#FFF1D8', '#CFA466', '#9A7340'),
    'papier': ('#7C6E58', '#FBF6EA', '#F0E7D4', '#E2D5BC'),
}
def duotone(im, fam, kontrast=1.1):
    d, l = hexrgb(FAM[fam][0]), hexrgb(FAM[fam][1])
    g = np.asarray(ImageOps.grayscale(im)).astype(np.float32) / 255.0
    g = np.clip((g - 0.5) * kontrast + 0.5, 0, 1)
    rgb = d[None, None, :] * (1 - g[..., None]) + l[None, None, :] * g[..., None]
    return Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))

def riss(w, h, amp=10, seed=1):   # Alpha-Maske mit gerissenen Kanten
    rnd = random.Random(seed); m = Image.new('L', (w, h), 0); dr = ImageDraw.Draw(m)
    pts = []
    for x in range(0, w + 1, 14): pts.append((x, amp + rnd.uniform(-amp, amp)))
    for y in range(0, h + 1, 14): pts.append((w - amp + rnd.uniform(-amp, amp), y))
    for x in range(w, -1, -14): pts.append((x, h - amp + rnd.uniform(-amp, amp)))
    for y in range(h, -1, -14): pts.append((amp + rnd.uniform(-amp, amp), y))
    dr.polygon(pts, fill=255)
    return m.filter(ImageFilter.GaussianBlur(1.2))

def schicht(name, src, fam, crop=None, w=1100, rand=True, seed=1, kontrast=1.1):
    im = Image.open(src).convert('RGB')
    if crop: W0, H0 = im.size; im = im.crop((int(crop[0] * W0), int(crop[1] * H0), int(crop[2] * W0), int(crop[3] * H0)))
    s = w / im.width; im = im.resize((w, round(im.height * s)), Image.LANCZOS)
    t = duotone(im, fam, kontrast).convert('RGBA')
    if rand:   # heller Papierrand (Abzug) mit Riss
        pad = 16; big = Image.new('RGBA', (t.width + 2 * pad, t.height + 2 * pad), tuple(int(v) for v in hexrgb(FAM[fam][1])) + (255,))
        big.paste(t, (pad, pad)); t = big
    t.putalpha(riss(t.width, t.height, 9, seed))
    fn = 's-%s-%s.png' % (fam, name); t.save(os.path.join(OUT, fn))
    META[fn] = {'size': list(t.size)}

def grundflaeche(fam, w=1300, h=2300):
    top, bot = hexrgb(FAM[fam][2]), hexrgb(FAM[fam][3])
    y = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
    a = top[None, None, :] * (1 - y) + bot[None, None, :] * y
    a = np.repeat(a, w, axis=1)
    # Papierfaser + Halbton-Textur leicht einbacken (Overlay), feines Raster (Grid, TikTok 14)
    tex = Image.open(os.path.join(ROOT, 'tex', 'paper338.jpg')).convert('L').resize((w, h))
    t = np.asarray(tex).astype(np.float32) / 255.0
    a = a * (0.86 + 0.28 * t[..., None])
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    dr = ImageDraw.Draw(im, 'RGBA'); lc = tuple(int(v) for v in hexrgb(FAM[fam][1])) + (26,)
    for x in range(0, w, 90): dr.line([(x, 0), (x, h)], fill=lc, width=2)
    for yy in range(0, h, 90): dr.line([(0, yy), (w, yy)], fill=lc, width=2)
    im = im.filter(ImageFilter.GaussianBlur(0.6))
    fn = 'b-%s.jpg' % fam; im.save(os.path.join(OUT, fn), quality=90)
    META[fn] = {'size': [w, h]}

def alles():
    R = lambda f: os.path.join(ROH, f)
    # Abzuege (Punkte = Bruchteile des gecroppten Bildes)
    abzug('deponie', R('c-landfill-stoney.jpg'), crop=(0.20, 0.30, 0.95, 0.98), w=1000, pts={'halde': (0.55, 0.42), 'tal': (0.48, 0.70)})
    abzug('ki-sack', R('ki-sack.png'), crop=(0, 0.02, 1, 0.80), w=900, hell=1.04, pts={'sack': (0.50, 0.17), 'halde': (0.48, 0.70)})
    abzug('ki-buero', R('ki-buero.png'), crop=(0, 0.10, 1, 0.92), w=900, hell=1.06, pts={'platte': (0.507, 0.48), 'sack': (0.36, 0.78)})
    abzug('ki-tor', R('ki-tor.png'), crop=(0, 0.10, 1, 0.92), w=900, hell=1.06, pts={'schloss': (0.505, 0.555), 'kette': (0.50, 0.32)})
    abzug('ki-hammer', R('ki-hammer.png'), crop=(0, 0.10, 1, 0.88), w=900, hell=1.04, pts={'hammer': (0.66, 0.48), 'wappen': (0.72, 0.07)})
    abzug('bank', R('c-bank-natwest.jpg'), crop=(0.02, 0.18, 0.98, 0.95), w=1000, pts={'schalter': (0.42, 0.66)}, blur=[(0.40, 0.17, 0.60, 0.33), (0.80, 0.45, 0.91, 0.72)])
    abzug('schloss', R('c-padlock-gate.jpg'), crop=(0.12, 0.05, 0.88, 0.98), w=900, pts={'schloss': (0.50, 0.68)})
    abzug('mining', os.path.join(TH, 'src', 'mining-farm.jpg'), crop=(0.05, 0, 0.95, 1), w=1000, hell=1.3, gamma=0.7, pts={})
    abzug('folge42', os.path.join(TH, 'C-16x9-1920x1080.jpg'), w=960, rand=14, warm=0, pts={})
    if os.path.exists(R('c-newport-0128.jpg')):
        try: Image.open(R('c-newport-0128.jpg')).verify(); abzug('newport', R('c-newport-0128.jpg'), w=1000, pts={'stadt': (0.5, 0.55)})
        except Exception: pass
    abzug('ki-muell', R('ki-sack.png'), crop=(0, 0.50, 1, 1), w=1150, hell=1.05, pts={'mitte': (0.5, 0.45), 'loch': (0.40, 0.55)})
    frei_hdd(); frei_coin(); frei_sack(640)
    # Grundflaechen + Collage-Ebenen je Familie
    for f in FAM: grundflaeche(f)
    schicht('deponie', R('c-landfill-stoney.jpg'), 'teal', crop=(0.1, 0.25, 1, 1), w=1150, seed=3)
    schicht('sack', R('ki-sack.png'), 'teal', crop=(0, 0.35, 1, 1), w=1150, seed=4)
    schicht('tor', R('ki-tor.png'), 'teal', crop=(0.1, 0.15, 0.9, 0.8), w=920, seed=5)
    schicht('mining', os.path.join(TH, 'src', 'mining-farm.jpg'), 'orange', w=1150, seed=6)
    schicht('muenze', os.path.join(TH, 'src', 'bitcoin-muenze.jpg'), 'orange', crop=(0.12, 0.42, 0.88, 1.0), w=760, seed=7)
    schicht('hdd', R('c-hdd-wd.jpg'), 'ocker', crop=(0.08, 0, 0.92, 1), w=900, seed=8, kontrast=1.3)
    schicht('buero', R('ki-buero.png'), 'ocker', crop=(0, 0, 1, 0.55), w=1150, seed=9)
    schicht('schloss', R('c-padlock-gate.jpg'), 'violett', w=1100, seed=10)
    schicht('spinde', R('c-lock.jpg'), 'violett', w=900, seed=11)
    schicht('bank', R('c-bank-natwest.jpg'), 'violett', w=1000, seed=12)
    schicht('gericht', R('ki-hammer.png'), 'blau', crop=(0, 0, 1, 0.6), w=1150, seed=13)
    schicht('bank', R('c-bank-natwest.jpg'), 'blau', w=1000, seed=14)
    schicht('deponie', R('c-landfill-stoney.jpg'), 'blau', crop=(0.1, 0.25, 1, 1), w=1100, seed=15)
    schicht('tor', R('ki-tor.png'), 'blau', crop=(0.1, 0.15, 0.9, 0.8), w=920, seed=16)
    if 'p-newport.jpg' in META:
        schicht('newport', R('c-newport-0128.jpg'), 'blau', w=1150, seed=17)
        schicht('newport', R('c-newport-0128.jpg'), 'teal', w=1150, seed=18)
    schicht('muenze', os.path.join(TH, 'src', 'bitcoin-muenze.jpg'), 'papier', crop=(0.12, 0.42, 0.88, 1.0), w=1000, seed=19, kontrast=0.9)
    schicht('mining', os.path.join(TH, 'src', 'mining-farm.jpg'), 'papier', w=1100, seed=20, kontrast=0.9)
    karte()
    karte(1300, 1500, 2, (-4.35, -2.05, 51.05, 52.05), 'p-karte-sued.jpg', 4)
    json.dump(META, open(os.path.join(ROOT, 'data', 'bilder.json'), 'w'), indent=1)
    print(len(META), 'Bilder:', ', '.join(sorted(META)))

# ---------- Papierkarte Grossbritannien (Natural Earth 10m map units, gemeinfrei) fuer Wales/Newport ----------
def karte(W=1400, H=1800, ss=2, ext=(-8.6, 3.2, 49.7, 58.9), name='p-karte.jpg', linie=3):
    import math
    gj = json.load(open(os.path.join(ROH, 'ne_10m_map_units.geojson'), encoding='utf-8'))
    lon0, lon1, lat0, lat1 = ext
    k = math.cos(math.radians(54.3))
    sx = W / ((lon1 - lon0) * k); sy = H / (lat1 - lat0); s = min(sx, sy)
    ox = (W - (lon1 - lon0) * k * s) / 2; oy = (H - (lat1 - lat0) * s) / 2
    P = lambda lo, la: (ox + (lo - lon0) * k * s, oy + (lat1 - la) * s)
    img = Image.new('RGB', (W * ss, H * ss), (150, 184, 214)); dr = ImageDraw.Draw(img)
    wales = []
    for f in gj['features']:
        p = f['properties']
        if p.get('ADM0_A3') not in ('GBR', 'IRL', 'FRA', 'BEL', 'NLD', 'IMN') and p.get('NAME') not in ('Isle of Man',): continue
        g = f['geometry']; polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
        for poly in polys:
            ring = [P(lo, la) for lo, la in poly[0]]
            if max(x for x, y in ring) < -50 or min(x for x, y in ring) > W + 50: continue
            dr.polygon([(x * ss, y * ss) for x, y in ring], fill=(239, 230, 207), outline=(70, 66, 60), width=linie * ss)
            if p.get('NAME') == 'Wales' and len(ring) > 40: wales.append(ring)
    img = img.resize((W, H), Image.LANCZOS)
    tex = Image.open(os.path.join(ROOT, 'tex', 'paper300.jpg')).convert('L').resize((W, H))
    a = np.asarray(img).astype(np.float32) * (0.84 + 0.22 * (np.asarray(tex).astype(np.float32) / 255.0))[..., None]
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    rand = 18; big = Image.new('RGB', (W + 2 * rand, H + 2 * rand), (246, 243, 236)); big.paste(img, (rand, rand))
    big.save(os.path.join(OUT, name), quality=92)
    wales.sort(key=len, reverse=True); wr = wales[0] if wales else [(0, 0)]
    step = max(1, len(wr) // 90); wr = wr[::step]
    nx, ny = P(-2.9977, 51.5842)   # Newport (Stadtzentrum)
    META[name] = {'size': list(big.size), 'pts': {'newport': [round(nx + rand, 1), round(ny + rand, 1)],
        'wales_mitte': [round(sum(x for x, y in wr) / len(wr) + rand, 1), round(sum(y for x, y in wr) / len(wr) + rand, 1)]},
        'wales': [[round(x + rand, 1), round(y + rand, 1)] for x, y in wr], 'mpd': s}

if __name__ == '__main__':
    alles()
