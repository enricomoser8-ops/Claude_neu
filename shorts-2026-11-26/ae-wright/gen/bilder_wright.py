# Bilder fuer den Short 26.11.2026 "Der erste Flug dauerte zwoelf Sekunden" (key wright): nur echte Fotos, gemeinfrei:
# Library of Congress, Wright Brothers Negatives (Glasplatten, Rohdateien archiv/roh/loc-*.jpg = u.tif, Pegel auf 0,5..99,7 % gestreckt)
# und NASA (images.nasa.gov: as11-40-5903, PIA25881, PIA24438, PIA24498, as13-60-*). Dazu eine Vektor-Grafik Boeing 747 (Draufsicht, eigen).
# Bausteine aus bilder_lib.py (Abzug, Sticker-Freisteller, Duotone-Collage, Grundflaeche) wie in den Shorts zur Folge 42.
# Ausgang: archiv/p-*.jpg (Abzuege), archiv/f-*.png (Freisteller), archiv/g-*.png (Graustufen-Collage), archiv/b-schwarz|weiss.jpg,
#         archiv/t-grunge-hell|dunkel.jpg (Textur), data/bilder.json. (Bis 24.11.: Duotone-Farbfamilien s-*/b-<farbe>, ersetzt.)
# KI-Wunschbilder (data/ki_wunsch.json): liegt archiv/roh/ki-<name>.png da, wird es benutzt, sonst baut gen/gen_wright.py
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

def jumbo(name='f-jumbo', pxm=12.0):
    """Boeing 747-400 in Draufsicht (Nase oben) als saubere Vektor-Grafik: Spannweite 64,4 m, Laenge 70,7 m, 4 Triebwerke.
    Punkte: tip_l / tip_r (Fluegelspitzen), nase, m37_l / m37_r (37 m mittig auf der Fluegelvorderkante, Strecke des ersten Flugs)"""
    ss = 3; k = pxm * ss; S, Lg = 64.4, 70.7; pad = 2.0
    Wd, Hd = int((S + 2 * pad) * k), int((Lg + 2 * pad) * k); cx = Wd / 2
    im = Image.new('RGBA', (Wd, Hd), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    P = lambda x, y: (cx + x * k, (y + pad) * k)
    rumpf = [(0, 0), (1.6, 1.2), (2.9, 4.5), (3.25, 10), (3.25, 60), (2.4, 66), (0.8, 70.7), (-0.8, 70.7), (-2.4, 66), (-3.25, 60), (-3.25, 10), (-2.9, 4.5), (-1.6, 1.2)]
    fl = lambda sg: [(sg * 3.0, 25.0), (sg * S / 2, 50.0), (sg * S / 2, 53.2), (sg * 3.0, 41.0)]
    hl = lambda sg: [(sg * 2.0, 58.5), (sg * 11.0, 66.5), (sg * 11.0, 69.0), (sg * 2.0, 65.5)]
    COL, RAND = (246, 243, 236, 255), (28, 27, 25, 255)
    for poly in (fl(1), fl(-1), hl(1), hl(-1), rumpf): d.polygon([P(*q) for q in poly], fill=COL, outline=RAND, width=int(0.35 * k))
    for x, y in ((11.5, 32.5), (21.5, 40.0), (-11.5, 32.5), (-21.5, 40.0)):
        d.rounded_rectangle([P(x - 1.3, y - 1.5), P(x + 1.3, y + 4.5)], radius=0.8 * k, fill=(200, 196, 188, 255), outline=RAND, width=int(0.3 * k))
    im = im.resize((Wd // ss, Hd // ss), Image.LANCZOS)
    stk, padpx = L.sticker(im, 10); stk.save(os.path.join(L.OUT, name + '.png'))
    Q = lambda x, y: [round(padpx + (cx + x * k) / ss, 1), round(padpx + (y + pad) * k / ss, 1)]
    # Vorderkante: x = 3 + (y - 25) * (S/2 - 3) / 25  ->  37 m mittig: x = +-18.5 m
    y37 = 25.0 + (18.5 - 3.0) * 25.0 / (S / 2 - 3.0)
    pts = {'tip_l': Q(-S / 2, 51.6), 'tip_r': Q(S / 2, 51.6), 'nase': Q(0, 0), 'mitte': Q(0, 40), 'm37_l': Q(-18.5, y37), 'm37_r': Q(18.5, y37),
           'v_l': Q(-S / 2, 50.0), 'v_r': Q(S / 2, 50.0)}
    L.META[name + '.png'] = {'size': list(stk.size), 'pts': pts, 'alpha': list(stk.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox()), 'pxm': pxm}

def alles():
    W = 1.0   # LOC-Glasplatten sind schwarzweiss: leicht warm wie ein alter Abzug
    # ---------- Abzuege (Punkte in Bruchteilen des GANZEN Rohbilds, nach Ansehen mit Raster notiert) ----------
    ab('flug', R('loc-erstflug.jpg'), (0.28, 0.22, 0.86, 0.58), 820, {'flyer': (0.565, 0.40), 'orville': (0.55, 0.43), 'tip_l': (0.335, 0.375), 'tip_r': (0.80, 0.335), 'boden': (0.56, 0.52)}, warm=W)
    ab('erstflug', R('loc-erstflug.jpg'), (0.03, 0.06, 0.97, 0.70), 820, {'flyer': (0.565, 0.40), 'orville': (0.55, 0.435), 'wilbur': (0.878, 0.47), 'schiene': (0.30, 0.56), 'bank': (0.535, 0.60), 'links': (0.06, 0.58)}, warm=W)
    ab('lager', R('loc-lager-retusche.jpg'), (0.18, 0.43, 0.83, 0.70), 1600, {'flyer': (0.33, 0.555), 'schuppen': (0.58, 0.51), 'huette': (0.77, 0.53), 'duene': (0.45, 0.66)}, warm=W)
    ab('werkstatt', R('loc-werkstatt.jpg'), (0.02, 0.03, 0.98, 0.97), 820, {'motor': (0.33, 0.50), 'kette': (0.48, 0.63), 'fluegel': (0.75, 0.78)}, warm=W, gamma=0.9)
    ab('schiene', R('loc-schiene.jpg'), (0.02, 0.12, 0.98, 0.80), 820, {'flyer': (0.47, 0.37), 'helfer': (0.74, 0.38), 'schiene': (0.33, 0.52), 'himmel': (0.30, 0.22)}, warm=W)
    ab('sand', R('loc-wilbur-sand.jpg'), (0.02, 0.14, 0.98, 0.80), 820, {'wilbur': (0.525, 0.45), 'ruder': (0.36, 0.41), 'sand': (0.42, 0.555), 'himmel': (0.25, 0.22)}, warm=W)
    ab('front', R('loc-front.jpg'), (0.04, 0.24, 0.90, 0.78), 820, {'mitte': (0.49, 0.62), 'prop_l': (0.34, 0.56), 'prop_r': (0.64, 0.56)}, warm=W)
    ab('dritter', R('loc-dritter.jpg'), (0.0, 0.15, 0.98, 0.80), 820, {'flyer': (0.36, 0.47), 'pilot': (0.33, 0.51), 'boden': (0.55, 0.72)}, warm=W)
    ab('weit', R('loc-weit.jpg'), (0.02, 0.28, 0.98, 0.78), 820, {'flugzeug': (0.30, 0.39), 'stuetze': (0.53, 0.43), 'schiene': (0.78, 0.42)}, warm=W, gamma=0.85)
    ab('schaden', R('loc-schaden.jpg'), (0.02, 0.12, 0.94, 0.70), 820, {'flyer': (0.55, 0.33), 'ruder': (0.69, 0.37), 'leute': (0.035, 0.35)}, warm=W)
    ab('mond', R('as11-40-5903.jpg'), (0.05, 0.0, 1.0, 0.92), 780, {'aldrin': (0.51, 0.30), 'visier': (0.51, 0.08), 'eagle': (0.95, 0.76), 'spur': (0.22, 0.90)})
    ab('mars', R('PIA25881.jpg'), (0.0, 0.0, 1.0, 1.0), 1500, {'panel': (0.49, 0.20), 'kabel': (0.485, 0.265), 'koerper': (0.48, 0.60)})
    ab('stoff', R('PIA24438.jpg'), (0.43, 0.34, 0.61, 0.58), 340, {'mitte': (0.52, 0.46)}, rand=12)
    # ---------- Freisteller ----------
    frei_oval('f-wilbur', R('loc-wilbur.jpg'), (0.235, 0.20, 0.81, 0.79), 560, {'gesicht': (0.52, 0.45)})
    frei_oval('f-orville', R('loc-orville.jpg'), (0.26, 0.18, 0.83, 0.77), 560, {'gesicht': (0.55, 0.46)})
    jumbo()
    lg = Image.open(os.path.join(L.OUT, 'logo.png')); L.META['logo.png'] = {'size': list(lg.size), 'pts': {'mitte': [lg.width / 2, lg.height / 2]}}
    # ---------- Hintergrund (Chris Moran TikTok 13): Graustufen-Collage + Tint im Build, Schwarz/Weiss je 2 Szenen ----------
    G = grau_schicht
    G('erstflug', R('loc-erstflug.jpg'), crop=(0.03, 0.06, 0.97, 0.70), seed=1)
    G('lager', R('loc-lager-retusche.jpg'), crop=(0.18, 0.43, 0.83, 0.70), seed=2)
    G('bau', R('loc-bau.jpg'), crop=(0.06, 0.50, 0.94, 0.90), seed=3)
    G('schiene', R('loc-schiene.jpg'), crop=(0.02, 0.12, 0.98, 0.80), seed=4)
    G('sand', R('loc-wilbur-sand.jpg'), crop=(0.02, 0.14, 0.98, 0.80), seed=5)
    G('front', R('loc-front.jpg'), crop=(0.04, 0.24, 0.90, 0.78), seed=6)
    G('dritter', R('loc-dritter.jpg'), crop=(0.0, 0.15, 0.98, 0.80), seed=7)
    G('weit', R('loc-weit.jpg'), crop=(0.02, 0.28, 0.98, 0.78), seed=8)
    G('schaden', R('loc-schaden.jpg'), crop=(0.02, 0.12, 0.94, 0.70), seed=9)
    G('werkstatt', R('loc-werkstatt.jpg'), crop=(0.02, 0.03, 0.98, 0.97), seed=10)
    G('wilbur', R('loc-wilbur.jpg'), crop=(0.20, 0.17, 0.85, 0.82), seed=11)
    G('orville', R('loc-orville.jpg'), crop=(0.22, 0.15, 0.87, 0.80), seed=12)
    G('mond', R('as13-60-8703.jpg'), seed=13)
    G('erde', R('as13-60-8588.jpg'), seed=14)
    G('aldrin', R('as11-40-5903.jpg'), crop=(0.05, 0.0, 1.0, 0.92), seed=15)
    G('heli', R('PIA24498.jpg'), seed=16)
    platten_und_grunge()
    json.dump(L.META, open(os.path.join(L.ROOT, 'data', 'bilder.json'), 'w'), indent=1)
    print(len(L.META), 'Bilder:', ', '.join(sorted(L.META)))

if __name__ == '__main__':
    alles()
