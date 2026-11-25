# Bilder fuer das Apollo-13-Short (key apollo, 25.11.2026): nur echte NASA-Fotos (images.nasa.gov, gemeinfrei), Rohdateien in archiv/roh/<NASA-ID>.jpg.
# Bausteine aus bilder_lib.py (Abzug, Sticker-Freisteller, Duotone-Collage, Grundflaeche) wie in den Shorts zur Folge 42.
# Ausgang: archiv/p-*.jpg (Abzuege), archiv/f-*.png (Freisteller), archiv/g-*.png (Graustufen-Collage), archiv/b-schwarz|weiss.jpg,
#         archiv/t-grunge-hell|dunkel.jpg (Textur), data/bilder.json. (Bis 24.11.: Duotone-Farbfamilien s-*/b-<farbe>, ersetzt.)
# KI-Wunschbilder (data/ki_wunsch.json): liegt archiv/roh/ki-<name>.png da, wird es benutzt, sonst baut gen/gen_apollo.py
# einen Platzhalter (echter NASA-Ausschnitt oder Hilfsebene "KI Platzhalter ..."). Nichts davon wird hier erzeugt.
# Punkte (pts) stehen als Bruchteile des GANZEN Rohbilds (wie beim Ansehen mit Raster notiert) und werden auf den Ausschnitt umgerechnet.
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

def rot_lovell():   # as13-59-8484 liegt auf der Seite: 90 Grad im Uhrzeigersinn drehen
    p = os.path.join(L.ROH, '_as13-59-8484-gedreht.jpg')
    Image.open(R('as13-59-8484.jpg')).rotate(-90, expand=True).save(p, quality=94)
    return p

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

def ki(name, w, pts, crop=None):
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

def alles():
    # ---------- Abzuege (echte NASA-Fotos) ----------
    ab('start', R('S70-34852.jpg'), (0.05, 0.25, 0.95, 0.84), 780, {'nase': (0.45, 0.385), 'rakete': (0.445, 0.60), 'himmel': (0.80, 0.30)})
    ab('crew', R('S70-36485.jpg'), (0.04, 0.20, 0.96, 0.80), 820, {'lovell': (0.267, 0.393), 'swigert': (0.537, 0.33), 'haise': (0.737, 0.476), 'globus': (0.48, 0.686)})
    ab('sm', R('7010516.jpg'), (0.22, 0.14, 0.96, 0.98), 820, {'schaden': (0.568, 0.628), 'oben': (0.55, 0.30)}, hell=1.12, gamma=0.85)
    ab('mcc', R('S70-35139.jpg'), (0.02, 0.10, 0.86, 0.98), 820, {'schirm': (0.592, 0.308), 'kranz': (0.596, 0.709)})
    ab('lm', R('AS13-59-8562.jpg'), (0.04, 0.06, 0.90, 0.86), 820, {'luke': (0.355, 0.495)}, hell=0.92, gamma=1.25)
    ab('sim', R('S70-34412.jpg'), (0.0, 0.10, 1.0, 0.70), 820, {'haise': (0.362, 0.342), 'liste': (0.49, 0.45)})
    ab('lovell', rot_lovell(), (0.05, 0.0, 0.95, 0.80), 800, {'gesicht': (0.47, 0.17), 'pult': (0.85, 0.45), 'kabine': (0.50, 0.62)}, hell=1.06)
    ab('filter', R('as13-62-8929.jpg'), (0.24, 0.235, 0.51, 0.555), 500, {'mitte': (0.375, 0.395)}, rand=14)
    ab('proto', R('S70-35013.jpg'), (0.25, 0.0, 0.97, 0.92), 820, {'kiste': (0.542, 0.384), 'schlauch': (0.62, 0.66), 'schlauch2': (0.75, 0.585)})
    ab('mailbox', R('as13-62-8929.jpg'), (0.08, 0.06, 0.86, 0.96), 820, {'schlauch': (0.436, 0.84), 'band': (0.446, 0.615), 'kasten': (0.375, 0.395), 'tuete': (0.462, 0.214)}, hell=1.03)
    ab('band', R('as13-62-8929.jpg'), (0.37, 0.53, 0.53, 0.70), 320, {'mitte': (0.446, 0.615)}, rand=12)   # Ersatz fuer die KI-Klebebandrolle: echtes Klebeband am Adapter
    ab('capcom', R('S70-34902.jpg'), (0.15, 0.10, 1.0, 1.0), 820, {'kopf': (0.642, 0.46), 'mikro': (0.667, 0.52), 'papiere': (0.875, 0.77)})
    ab('splash', R('S70-35638.jpg'), (0.0, 0.10, 1.0, 0.82), 800, {'schirm_l': (0.414, 0.315), 'schirm_r': (0.75, 0.292), 'schirme': (0.55, 0.30), 'kapsel': (0.50, 0.70)})
    ab('iwo', R('S70-35614.jpg'), (0.05, 0.0, 0.85, 1.0), 820, {'haise': (0.43, 0.25), 'lovell': (0.546, 0.45), 'swigert': (0.642, 0.37), 'tuer': (0.17, 0.30)})
    # ---------- Freisteller ----------
    frei_scheibe('f-mond', R('as13-60-8703.jpg'), 420)
    frei_scheibe('f-erde', R('as13-60-8588.jpg'), 460)
    frei_kreis('f-patch', R('S69-60662.jpg'), 0.497, 0.497, 0.452, 1100, {'xiii': (0.80, 0.25), 'erde': (0.46, 0.785), 'mond': (0.82, 0.85)})
    # Kanal-Logo (rund) fuer den Schluss
    lg = Image.open(os.path.join(L.OUT, 'logo.png')); L.META['logo.png'] = {'size': list(lg.size), 'pts': {'mitte': [lg.width / 2, lg.height / 2]}}
    # ---------- KI-Wunschbilder, nur wenn vorhanden ----------
    ki('ki-band', 520, {'mitte': (0.5, 0.5)})
    ki('ki-loch', 520, {'loch': (0.5, 0.5)})
    # ---------- Hintergrund-Stil 25.11. (enno, Chris Moran TikTok 13): Graustufen-Collage + Tint im Build, Schwarz/Weiss je Abschnitt ----------
    # g-*.png: Graustufen (Kontrast gestreckt), Papierrand + Riss; die Farbe (Map Black/White To) kommt erst im Build per Tint auf die Precomp.
    G = grau_schicht
    G('rakete', R('S70-32990.jpg'), crop=(0.1, 0.05, 0.95, 0.95), seed=1)
    G('sm', R('as13-59-8500.jpg'), crop=(0.0, 0.25, 1.0, 1.0), seed=2)
    G('mond', R('as13-60-8703.jpg'), seed=3)
    G('mcc', R('s70-34986.jpg'), seed=4)
    G('wolken', R('s70-35652.jpg'), seed=5)
    G('crew', R('7008011.jpg'), seed=6)
    G('erde', R('as13-60-8588.jpg'), seed=7)
    G('meer', R('s70-35644.jpg'), seed=8)
    G('capcom', R('S70-34904.jpg'), seed=9)
    G('mcc2', R('S70-35145.jpg'), seed=10)
    G('jubel', R('S70-35148.jpg'), seed=11)
    G('training', R('S70-24009.jpg'), seed=13)
    G('patch', R('S69-60662.jpg'), crop=(0.04, 0.04, 0.96, 0.96), seed=16)
    platten_und_grunge()
    json.dump(L.META, open(os.path.join(L.ROOT, 'data', 'bilder.json'), 'w'), indent=1)
    print(len(L.META), 'Bilder:', ', '.join(sorted(L.META)))

if __name__ == '__main__':
    alles()
