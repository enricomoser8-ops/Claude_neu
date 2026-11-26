# Bilder fuer den Short 27.11.2026 "Nobelpreis fuer ein unordentliches Labor" (key penicillin): nur echte Fotos, keine KI-Bilder:
# Library of Congress (Prints & Photographs, online nur als r.jpg/v.jpg, 640-1024 px; Pressefotos der 1940er, Rechte von LOC "not evaluated" bzw.
# Harris & Ewing "no known restrictions"), Wellcome Collection (CC BY 4.0 bzw. Public Domain Mark, IIIF 1800 px).
# Rohdateien archiv/roh/loc-*.jpg, archiv/roh/wel-*.jpg. Ausgang: archiv/p-*.jpg (Abzuege), archiv/f-*.png (Freisteller),
# archiv/g-*.png (Graustufen-Collage), archiv/b-schwarz|weiss.jpg, archiv/t-grunge-hell|dunkel.jpg, data/bilder.json.
# Punkte (pts) stehen als Bruchteile des GANZEN Rohbilds (mit Raster notiert) und werden auf den Ausschnitt umgerechnet.
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
from scipy import ndimage
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bilder_lib as L
R = lambda f: os.path.join(L.ROH, f)

def ab(name, src, crop, w, pts=None, **kw):
    """Abzug mit Punkten in Bruchteilen des ganzen Rohbilds"""
    c = crop or (0, 0, 1, 1); P = {}
    for k, (fx, fy) in (pts or {}).items(): P[k] = ((fx - c[0]) / (c[2] - c[0]), (fy - c[1]) / (c[3] - c[1]))
    return L.abzug(name, src, crop=crop, w=w, pts=P, **kw)

def frei_scheibe(name, src, h, schwelle=24, pts=None, rand=10):
    """Mond/Erde vor schwarzem All: hellste zusammenhaengende Flaeche, Kreis drumherum (Erde ist nur teils beleuchtet)"""
    im = Image.open(src).convert('RGB'); a = np.asarray(im).astype(np.float32); g = a.mean(axis=2)
    m = ndimage.binary_closing(g > schwelle, iterations=6); lab, n = ndimage.label(m)
    big = 1 + int(np.argmax(ndimage.sum(m, lab, range(1, n + 1)))); ys, xs = np.nonzero(lab == big)
    cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2; r = max(xs.max() - xs.min(), ys.max() - ys.min()) / 2 + 3
    mk = Image.new('L', im.size, 0); ImageDraw.Draw(mk).ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
    o = im.convert('RGBA'); o.putalpha(mk.filter(ImageFilter.GaussianBlur(1.5)))
    o = o.crop((int(cx - r), int(cy - r), int(cx + r), int(cy + r)))
    o = ImageEnhance.Brightness(o).enhance(1.08)
    s = h / o.height; o = o.resize((round(o.width * s), h), Image.LANCZOS)
    stk, pad = L.sticker(o, rand); stk.save(os.path.join(L.OUT, name + '.png'))
    P = {'mitte': [stk.width / 2, stk.height / 2]}
    for k, (fx, fy) in (pts or {}).items(): P[k] = [round(pad + fx * o.width, 1), round(pad + fy * o.height, 1)]
    L.META[name + '.png'] = {'size': list(stk.size), 'pts': P, 'r': round(o.width / 2, 1), 'alpha': list(stk.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox())}

def frei_kreis(name, src, cx, cy, r, h, pts=None):
    """runder Freisteller (Missions-Abzeichen): Kreis in Bruchteilen (r relativ zur Breite)"""
    im = Image.open(src).convert('RGB'); W0, H0 = im.size; X, Y, RR = cx * W0, cy * H0, r * W0
    mk = Image.new('L', im.size, 0); ImageDraw.Draw(mk).ellipse([X - RR, Y - RR, X + RR, Y + RR], fill=255)
    o = im.convert('RGBA'); o.putalpha(mk.filter(ImageFilter.GaussianBlur(1.5))); o = o.crop((int(X - RR), int(Y - RR), int(X + RR), int(Y + RR)))
    s = h / o.height; o = o.resize((round(o.width * s), h), Image.LANCZOS)
    stk, pad = L.sticker(o, 12); stk.save(os.path.join(L.OUT, name + '.png'))
    P = {'mitte': [stk.width / 2, stk.height / 2]}
    for k, (fx, fy) in (pts or {}).items():   # Bruchteile des ganzen Rohbilds -> Freisteller-Pixel
        P[k] = [round(pad + (fx * W0 - (X - RR)) * s, 1), round(pad + (fy * H0 - (Y - RR)) * s, 1)]
    L.META[name + '.png'] = {'size': list(stk.size), 'pts': P, 'alpha': list(stk.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox())}

def _ki_unbenutzt(name, w, pts, crop=None):
    """KI-Wunschbild nur benutzen, wenn enno es in archiv/roh/ abgelegt hat (Prompt in data/ki_wunsch.json)"""
    p = R(name + '.png')
    if not os.path.exists(p): p = R(name + '.jpg')
    if not os.path.exists(p): return False
    L.abzug(name, p, crop=crop, w=w, pts=pts, hell=1.03); return True

def grau_schicht(name, src, crop=None, w=1500, seed=1):
    """Collage-Ebene fuer den Tint-Hintergrund: Graustufen, Kontrast auf 1..99 % gestreckt, heller Papierrand mit Riss"""
    im = Image.open(src).convert('L')
    if crop: W0, H0 = im.size; im = im.crop((int(crop[0] * W0), int(crop[1] * H0), int(crop[2] * W0), int(crop[3] * H0)))
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32); lo, hi = np.percentile(a, 1), np.percentile(a, 99)
    a = np.clip((a - lo) / max(1, hi - lo), 0, 1) * 255
    t = Image.fromarray(a.astype(np.uint8)).convert('RGBA')
    pad = 14; big = Image.new('RGBA', (t.width + 2 * pad, t.height + 2 * pad), (225, 225, 225, 255)); big.paste(t, (pad, pad)); t = big
    t.putalpha(L.riss(t.width, t.height, 9, seed))
    fn = 'g-%s.png' % name; t.save(os.path.join(L.OUT, fn)); L.META[fn] = {'size': list(t.size)}

def platten_und_grunge(w=1300, h=2300):
    """Grundplatten b-schwarz.jpg (#111 mit feiner Papierfaser) / b-weiss.jpg (#F4F1EA mit Faser) und Grunge-Texturen aus dem
    echten Kreidetafel-Scan tex/lensfx216.jpg: t-grunge-hell.jpg (helle Kratzer auf Schwarz, Blend Screen) und t-grunge-dunkel.jpg (invertiert, Multiply)"""
    pap = Image.open(os.path.join(L.ROOT, 'tex', 'paper338.jpg')).convert('L').rotate(90, expand=True).resize((w, h), Image.LANCZOS)
    f = np.asarray(pap).astype(np.float32) / 255; f = f - ndimage.gaussian_filter(f, 40); f = f / max(1e-6, np.abs(f).max())
    for nm, base, amp in (('schwarz', (17, 17, 17), 7.0), ('weiss', (244, 241, 234), 6.0)):
        a = np.array(base, np.float32)[None, None, :] + amp * f[..., None]
        fn = 'b-%s.jpg' % nm; Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(L.OUT, fn), quality=92); L.META[fn] = {'size': [w, h]}
    g = Image.open(os.path.join(L.ROOT, 'tex', 'lensfx216.jpg')).convert('L')   # hochkant-Streifen rechts (ohne den grossen Wischfleck links)
    sw = round(g.height * 1080 / 1920); x0 = g.width - sw - 40; g = g.crop((x0, 0, x0 + sw, g.height)).resize((1080, 1920), Image.LANCZOS)
    a = np.asarray(g).astype(np.float32); lo, hi = np.percentile(a, 35), np.percentile(a, 99.7)
    a = np.clip((a - lo) / max(1, hi - lo), 0, 1) ** 1.2 * 255   # Grund schwarz, Kratzer/Wischer hell
    for nm, arr in (('hell', a), ('dunkel', 255 - a)):
        fn = 't-grunge-%s.jpg' % nm; Image.fromarray(arr.astype(np.uint8)).convert('RGB').save(os.path.join(L.OUT, fn), quality=90); L.META[fn] = {'size': [1080, 1920]}

def frei_oval(name, src, box, h, pts=None):
    """ovaler Freisteller (Portrait im Oval der Glasplatte): box = Ellipsen-Rahmen in Bruchteilen des Rohbilds"""
    im = Image.open(src).convert('RGB'); W0, H0 = im.size
    x0, y0, x1, y1 = box[0] * W0, box[1] * H0, box[2] * W0, box[3] * H0
    mk = Image.new('L', im.size, 0); ImageDraw.Draw(mk).ellipse([x0, y0, x1, y1], fill=255)
    o = im.convert('RGBA'); o.putalpha(mk.filter(ImageFilter.GaussianBlur(2))); o = o.crop((int(x0), int(y0), int(x1), int(y1)))
    o = ImageEnhance.Contrast(o).enhance(1.05)
    s = h / o.height; o = o.resize((round(o.width * s), h), Image.LANCZOS)
    a = np.asarray(o).astype(np.float32); a[..., 0] *= 1.03; a[..., 2] *= 0.96; o = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')
    stk, pad = L.sticker(o, 12); stk.save(os.path.join(L.OUT, name + '.png'))
    P = {'mitte': [stk.width / 2, stk.height / 2]}
    for k, (fx, fy) in (pts or {}).items(): P[k] = [round(pad + (fx * W0 - x0) * s, 1), round(pad + (fy * H0 - y0) * s, 1)]
    L.META[name + '.png'] = {'size': list(stk.size), 'pts': P, 'alpha': list(stk.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox())}

def medaille(name='f-medaille', h=420):
    """eigene Vektor-Grafik: goldene Medaille mit Band (Symbol Nobelpreis, keine echte Medaille nachgebildet)"""
    ss = 3; W, H = int(h * 0.72) * ss, h * ss; im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    cx, r = W / 2, W * 0.42; cy = H - r - 8 * ss
    d.polygon([(cx - r * 0.55, 0), (cx - r * 0.05, 0), (cx + r * 0.25, cy - r * 0.6), (cx - r * 0.25, cy - r * 0.6)], fill=(122, 30, 22, 255))
    d.polygon([(cx + r * 0.05, 0), (cx + r * 0.55, 0), (cx + r * 0.25, cy - r * 0.6), (cx - r * 0.15, cy - r * 0.6)], fill=(46, 76, 109, 255))
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(201, 162, 39, 255), outline=(122, 90, 18, 255), width=6 * ss)
    d.ellipse([cx - r * 0.74, cy - r * 0.74, cx + r * 0.74, cy + r * 0.74], outline=(241, 215, 122, 255), width=5 * ss)
    im = im.resize((W // ss, H // ss), Image.LANCZOS)
    stk, pad = L.sticker(im, 10); stk.save(os.path.join(L.OUT, name + '.png'))
    L.META[name + '.png'] = {'size': list(stk.size), 'pts': {'mitte': [round(pad + cx / ss, 1), round(pad + cy / ss, 1)], 'band': [round(pad + cx / ss, 1), round(pad + cy / ss * 0.35, 1)]},
                             'alpha': list(stk.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox())}

def alles():
    W = 1.0
    # ---------- Abzuege (Punkte in Bruchteilen des GANZEN Rohbilds, nach Ansehen mit Raster notiert) ----------
    ab('fleming', R('wel-L0000655.jpg'), (0.0, 0.0, 1.0, 0.92), 820, {'gesicht': (0.38, 0.22), 'schale': (0.27, 0.70), 'auge': (0.35, 0.21), 'fliege': (0.42, 0.42)}, warm=W)
    ab('labor', R('loc-fleming-schale.jpg'), (0.0, 0.0, 1.0, 1.0), 640, {'fleming': (0.30, 0.30), 'hand': (0.49, 0.64), 'schalen': (0.44, 0.47), 'schalen2': (0.62, 0.36), 'tisch': (0.68, 0.80), 'tuer': (0.10, 0.50)}, warm=W)
    ab('schale', R('loc-schale-ring.jpg'), (0.04, 0.0, 0.96, 1.0), 600, {'schimmel': (0.522, 0.475), 'zone': (0.37, 0.47), 'bakterien': (0.185, 0.48), 'rand': (0.08, 0.50), 'oben': (0.52, 0.10)}, warm=W)
    ab('stern', R('loc-stern.jpg'), (0.08, 0.0, 0.92, 1.0), 480, {'mitte': (0.48, 0.50), 'zacke': (0.70, 0.40)}, warm=W)
    ab('hospital', R('wel-V0013627.jpg'), (0.0, 0.08, 1.0, 0.80), 820, {'haus': (0.30, 0.58), 'turm': (0.58, 0.38), 'eingang': (0.27, 0.70), 'kutsche': (0.86, 0.78)})
    ab('portrait', R('loc-fleming-portrait.jpg'), (0.0, 0.0, 1.0, 1.0), 500, {'gesicht': (0.37, 0.20), 'hand': (0.40, 0.75), 'tisch': (0.80, 0.70)}, warm=W)
    ab('oxford', R('wel-L0012312.jpg'), (0.0, 0.0, 1.0, 0.92), 820, {'florey': (0.26, 0.17), 'chain': (0.63, 0.20), 'mitte': (0.45, 0.45)}, warm=W)
    ab('plakat', R('loc-plakat.jpg'), (0.12, 0.02, 0.88, 0.98), 700, {'soldat': (0.40, 0.42), 'helfer': (0.55, 0.30), 'penicillin': (0.53, 0.76), 'titel': (0.53, 0.12)})
    ab('flaschen', R('loc-forscher.jpg'), (0.02, 0.02, 0.98, 0.98), 820, {'links': (0.30, 0.40), 'rechts': (0.72, 0.40), 'reihe': (0.50, 0.82)}, warm=W)
    ab('kultur', R('loc-flaschen.jpg'), (0.0, 0.0, 1.0, 1.0), 600, {'mitte': (0.5, 0.5)}, warm=W)
    # ---------- Freisteller ----------
    frei_oval('f-fleming', R('wel-L0000655.jpg'), (0.04, 0.0, 0.70, 0.50), 520, {'gesicht': (0.38, 0.22)})
    frei_oval('f-florey', R('wel-L0012312.jpg'), (0.14, 0.06, 0.38, 0.33), 440, {'gesicht': (0.26, 0.17)})
    frei_oval('f-chain', R('wel-L0012312.jpg'), (0.52, 0.08, 0.74, 0.35), 440, {'gesicht': (0.63, 0.20)})
    medaille()
    lg = Image.open(os.path.join(L.OUT, 'logo.png')); L.META['logo.png'] = {'size': list(lg.size), 'pts': {'mitte': [lg.width / 2, lg.height / 2]}}
    # ---------- Hintergrund (Chris Moran TikTok 13): Graustufen-Collage + Tint im Build, Schwarz/Weiss je 2 Szenen ----------
    G = grau_schicht
    G('fleming', R('wel-L0000655.jpg'), crop=(0.0, 0.0, 1.0, 0.92), seed=1)
    G('labor', R('loc-fleming-schale.jpg'), w=1100, seed=2)
    G('schale', R('loc-schale-ring.jpg'), w=1100, seed=3)
    G('stern', R('loc-stern.jpg'), w=1100, seed=4)
    G('hospital', R('wel-V0013627.jpg'), crop=(0.0, 0.08, 1.0, 0.80), seed=5)
    G('oxford', R('wel-L0012312.jpg'), crop=(0.0, 0.0, 1.0, 0.92), seed=6)
    G('flaschen', R('loc-forscher.jpg'), seed=7)
    G('kultur', R('loc-flaschen.jpg'), w=1100, seed=8)
    G('pilz', R('wel-B0011300.jpg'), seed=9)
    G('portrait', R('loc-fleming-portrait.jpg'), w=1000, seed=10)
    G('gruppe', R('wel-V0027402.jpg'), crop=(0.0, 0.0, 1.0, 0.92), seed=11)
    G('plakat', R('loc-plakat.jpg'), crop=(0.12, 0.02, 0.88, 0.98), w=1100, seed=12)
    platten_und_grunge()
    json.dump(L.META, open(os.path.join(L.ROOT, 'data', 'bilder.json'), 'w'), indent=1)
    print(len(L.META), 'Bilder:', ', '.join(sorted(L.META)))

if __name__ == '__main__':
    alles()
