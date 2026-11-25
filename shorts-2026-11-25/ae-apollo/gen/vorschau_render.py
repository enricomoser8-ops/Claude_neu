# PIL-Vorschau aus dem Probelauf (Runde 2): rendert die Anzeigeliste von "node aemock.js <build> --render <json> <zeiten>" naeherungsweise.
# Bilder (mit Transformation, Masken + Federung, Tint, Schlagschatten, gerissenem Rand), Formen (Pfade, Ellipsen, Rechtecke, Trim, Striche),
# Text (getippt/Zaehler ueber die echten Ausdruecke), Volltonflaechen (Abdunklung, Vignette, UT-Verlauf), Einstellungsebenen
# (Fast Box Blur mit Maske, Transform-Punch), Mischmodi Normal/Multiplizieren/Addieren/Negativ multiplizieren/Farbe, CC Burn Film,
# CC Page Turn (vereinfacht). Nicht nachgebildet: Edge Boil, Flackern, Korn, Chromatische Aberration, Posterize.
# Aufruf: python3 vorschau_render.py <anzeige.json> <ausgabe-ordner> [skala=0.5]
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
J = json.load(open(sys.argv[1])); OUT = sys.argv[2]; SK = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
os.makedirs(OUT, exist_ok=True)
W, H = round(1080 * SK), round(1920 * SK)
LIB = '/usr/share/fonts/truetype/liberation/'; DJ = '/usr/share/fonts/truetype/dejavu/'
FONTS = {'Georgia': (DJ + 'DejaVuSerif.ttf', 0.92), 'Georgia-Bold': (DJ + 'DejaVuSerif-Bold.ttf', 0.92), 'Georgia-Italic': (LIB + 'LiberationSerif-Italic.ttf', 1.05),
         'Georgia-BoldItalic': (LIB + 'LiberationSerif-BoldItalic.ttf', 1.05), 'TimesNewRomanPS-BoldMT': (LIB + 'LiberationSerif-Bold.ttf', 1.0),
         'Arial-BoldMT': (LIB + 'LiberationSans-Bold.ttf', 1.0), 'ArialMT': (LIB + 'LiberationSans-Regular.ttf', 1.0), 'Arial-Black': (DJ + 'DejaVuSans-Bold.ttf', 1.0),
         'CourierNewPS-BoldMT': (LIB + 'LiberationMono-Bold.ttf', 1.0)}
IMC = {}
def img(name):
    if name not in IMC:
        for d in ('archiv', 'tex'):
            p = os.path.join(ROOT, d, name)
            if os.path.exists(p): IMC[name] = Image.open(p).convert('RGBA'); break
        else: IMC[name] = None
    return IMC[name]
def mul(P, M):   # P nach M (wie aemock mat): x' = M0 x + M2 y + M4
    return [P[0] * M[0] + P[2] * M[1], P[1] * M[0] + P[3] * M[1], P[0] * M[2] + P[2] * M[3], P[1] * M[2] + P[3] * M[3], P[0] * M[4] + P[2] * M[5] + P[4], P[1] * M[4] + P[3] * M[5] + P[5]]
def inv(M):
    a, b, c, d, e, f = M; det = a * d - b * c
    if abs(det) < 1e-12: return None
    ia, ib, ic, id_ = d / det, -b / det, -c / det, a / det
    return [ia, ib, ic, id_, -(ia * e + ic * f), -(ib * e + id_ * f)]
def xf(M, p): return (M[0] * p[0] + M[2] * p[1] + M[4], M[1] * p[0] + M[3] * p[1] + M[5])
def scl(M): return math.sqrt(abs(M[0] * M[3] - M[1] * M[2]))
def warp(im, M, size):   # Bild (lokale Pixel) mit M in die Comp
    I = inv(M)
    if I is None: return None
    return im.transform(size, Image.AFFINE, (I[0], I[2], I[4], I[1], I[3], I[5]), Image.BILINEAR)
def bez(p, n=14):   # {v,i,o,c} -> Punktliste
    v, ii, oo = p['v'], p['i'], p['o']; pts = []; N = len(v); segs = N if p['c'] else N - 1
    if N == 1: return [tuple(v[0])]
    for k in range(segs):
        a, b = v[k], v[(k + 1) % N]; c1 = (a[0] + oo[k][0], a[1] + oo[k][1]); c2 = (b[0] + ii[(k + 1) % N][0], b[1] + ii[(k + 1) % N][1])
        lin = abs(oo[k][0]) + abs(oo[k][1]) + abs(ii[(k + 1) % N][0]) + abs(ii[(k + 1) % N][1]) < 1e-6
        for j in range(0 if k == 0 else 1, (2 if lin else n) + 1):
            u = j / (2 if lin else n); m = 1 - u
            pts.append((m ** 3 * a[0] + 3 * m * m * u * c1[0] + 3 * m * u * u * c2[0] + u ** 3 * b[0], m ** 3 * a[1] + 3 * m * m * u * c1[1] + 3 * m * u * u * c2[1] + u ** 3 * b[1]))
    return pts
def trimmed(pts, s, e):
    if s <= 0.01 and e >= 99.99: return pts
    L = [0.0]
    for k in range(1, len(pts)): L.append(L[-1] + math.dist(pts[k - 1], pts[k]))
    tot = L[-1]
    if tot <= 0 or e <= s: return []
    a, b = tot * s / 100, tot * e / 100; out = []
    for k in range(1, len(pts)):
        l0, l1 = L[k - 1], L[k]
        if l1 < a or l0 > b: continue
        def at(x): u = 0 if l1 == l0 else (x - l0) / (l1 - l0); return (pts[k - 1][0] + (pts[k][0] - pts[k - 1][0]) * u, pts[k - 1][1] + (pts[k][1] - pts[k - 1][1]) * u)
        if not out: out.append(at(max(a, l0)))
        out.append(at(min(b, l1)))
    return out
def col(c): return tuple(int(max(0, min(1, x)) * 255) for x in c[:3])
def gblur(a, r):
    if r < 0.5: return a
    im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)); return np.asarray(im.filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255
def poly_alpha(polys, size, ss=2):
    im = Image.new('L', (size[0] * ss, size[1] * ss), 0); d = ImageDraw.Draw(im)
    for p in polys:
        if len(p) >= 3: d.polygon([(x * ss, y * ss) for x, y in p], fill=255)
    return np.asarray(im.resize(size, Image.BILINEAR)).astype(np.float32) / 255
def maskA(L, Mc, size):
    ms = L.get('masks') or []
    if not ms: return None
    acc = None
    for m in ms:
        if not m['s']: continue
        pts = [xf(Mc, p) for p in bez(m['s'], 16)]
        a = poly_alpha([pts], size)
        f = m['f']; f = f[0] if isinstance(f, list) else (f or 0)
        if f: a = gblur(a, f * scl(Mc) / 2.2)
        if m['inv']: a = 1 - a
        mode = m['mode']
        if acc is None: acc = a if mode != 'SUBTRACT' else 1 - a
        elif mode == 'INTERSECT': acc = np.minimum(acc, a)
        elif mode == 'SUBTRACT': acc = acc * (1 - a)
        else: acc = np.maximum(acc, a)
    return acc
def fx(L, m): return [e for e in L.get('fx', []) if e['m'] == m]
def noise(size, seed, sc):
    rng = np.random.default_rng(int(seed)); g = rng.random((max(2, size[1] // sc), max(2, size[0] // sc))).astype(np.float32)
    return np.asarray(Image.fromarray((g * 255).astype(np.uint8)).resize(size, Image.BICUBIC)).astype(np.float32) / 255
def draw_shape(L, Mc, size):
    ss = 2; im = Image.new('RGBA', (size[0] * ss, size[1] * ss), (0, 0, 0, 0)); s = scl(Mc)
    def walk(g, op):
        op = op * (g.get('op', 100) if g.get('op') is not None else 100) / 100
        prims = [bez(p, 18) for p in g['paths'] if p]
        closed = [p['c'] for p in g['paths'] if p]
        for e in g['ell']:
            (w, h), (cx, cy) = e['s'], e['p']; prims.append([(cx + w / 2 * math.cos(a), cy + h / 2 * math.sin(a)) for a in np.linspace(-math.pi / 2, 1.5 * math.pi, 73)]); closed.append(True)
        for r in g['rect']:
            (w, h), (cx, cy), rr = r['s'], r['p'], min(r['r'], r['s'][0] / 2, r['s'][1] / 2); pts = []
            for (qx, qy, a0) in ((cx + w / 2 - rr, cy - h / 2 + rr, -90), (cx + w / 2 - rr, cy + h / 2 - rr, 0), (cx - w / 2 + rr, cy + h / 2 - rr, 90), (cx - w / 2 + rr, cy - h / 2 + rr, 180)):
                for a in np.linspace(a0, a0 + 90, 7): pts.append((qx + rr * math.cos(math.radians(a)), qy + rr * math.sin(math.radians(a))))
            prims.append(pts); closed.append(True)
        tr = g.get('trim')
        d = ImageDraw.Draw(im)
        if g.get('fill') and not tr:
            c = col(g['fill']['c']); a = int(255 * op * g['fill']['op'] / 100)
            lay = Image.new('RGBA', im.size, (0, 0, 0, 0)); ld = ImageDraw.Draw(lay)
            for p, cl in zip(prims, closed): ld.polygon([(x * ss, y * ss) for x, y in (xf(Mc, q) for q in p)], fill=c + (a,))
            im.alpha_composite(lay)
        if g.get('stroke'):
            c = col(g['stroke']['c']); w = max(1, g['stroke']['w'] * s * ss)
            lay = Image.new('RGBA', im.size, (0, 0, 0, 0)); ld = ImageDraw.Draw(lay)
            for p, cl in zip(prims, closed):
                if cl: p = p + [p[0]]
                if tr: p = trimmed(p, tr['s'], tr['e'])
                if len(p) < 2: continue
                P = [(x * ss, y * ss) for x, y in (xf(Mc, q) for q in p)]
                dash = g['stroke'].get('dash')
                if dash and len(dash) >= 2:
                    on, off = dash[0] * s * ss, dash[1] * s * ss; acc = 0; seg = [P[0]]
                    for k in range(1, len(P)):
                        dl = math.dist(P[k - 1], P[k]); acc += dl
                        if (acc % (on + off)) < on: seg.append(P[k])
                        else:
                            if len(seg) > 1: ld.line(seg, fill=c + (255,), width=int(w), joint='curve')
                            seg = [P[k]]
                    if len(seg) > 1: ld.line(seg, fill=c + (255,), width=int(w), joint='curve')
                    continue
                ld.line(P, fill=c + (255,), width=int(round(w)), joint='curve')
                for q in (P[0], P[-1]): ld.ellipse((q[0] - w / 2, q[1] - w / 2, q[0] + w / 2, q[1] + w / 2), fill=c + (255,))
            if op < 1: lay.putalpha(lay.getchannel('A').point(lambda v: int(v * op)))
            im.alpha_composite(lay)
        for sub in g['groups']: walk(sub, op)
    if L.get('shape'):
        for g in L['shape']['groups']: walk(g, 1.0)
    return im.resize(size, Image.LANCZOS)
def draw_text(L, Mc, size):
    T = L['text']; s = T['s']
    if not s: return None
    fp, wf = FONTS.get(T['font'], (LIB + 'LiberationSans-Bold.ttf', 1.0)); sz = T['size'] or 40
    k = scl(Mc)
    if k < 1e-3: return None
    px = max(4, int(round(sz * k)))
    F = ImageFont.truetype(fp, px)
    tw = F.getlength(s) * wf
    pad = px; tmp = Image.new('RGBA', (int(tw + 2 * pad), int(px * 2 + pad)), (0, 0, 0, 0)); d = ImageDraw.Draw(tmp)
    base = px * 1.3
    d.text((pad, base), s, font=F, fill=col(T['color']) + (255,), anchor='ls')
    if wf != 1.0: tmp = tmp.resize((int(tmp.width * wf), tmp.height), Image.LANCZOS); pad *= wf
    x0 = 0 if 'LEFT' in T['just'] else (-tw if 'RIGHT' in T['just'] else -tw / 2)
    # lokale Pixel (Schriftpunkte) -> Comp: tmp-Pixel (u, v) entspricht lokal ((u - pad) / k + x0 / k ..)
    G = [1 / k, 0, 0, 1 / k, x0 / k - pad / k, -base / k]
    return warp(tmp, mul(Mc, G), size)
def shadow(im, L, Mc):
    for e in fx(L, 'ADBE Drop Shadow'):
        p = e['p']; op = (p.get('Opacity') or 127) / 255; dist = (p.get('Distance') or 5) * scl(Mc); soft = (p.get('Softness') or 0) * scl(Mc)
        d = math.radians(p.get('Direction') or 135); dx, dy = dist * math.sin(d), -dist * math.cos(d)
        a = im.getchannel('A'); sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); sh.putalpha(a.point(lambda v: int(v * op)))
        sh = sh.transform(im.size, Image.AFFINE, (1, 0, -dx, 0, 1, -dy)).filter(ImageFilter.GaussianBlur(max(0.1, soft / 2.5)))
        sh.alpha_composite(im); im = sh
    return im
def tint(im, L):
    for e in fx(L, 'ADBE Tint'):
        p = e['p']; amt = (p.get('Amount to Tint') if p.get('Amount to Tint') is not None else 100) / 100
        b, w = np.array(p.get('Map Black To') or [0, 0, 0])[:3], np.array(p.get('Map White To') or [1, 1, 1])[:3]
        a = np.asarray(im).astype(np.float32) / 255; Lm = (0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2])[..., None]
        t = b + (w - b) * Lm; a[..., :3] = a[..., :3] * (1 - amt) + t * amt
        im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8), 'RGBA')
    return im
def layer_rgba(L, Mc, size, t):
    k = L['kind']
    if k == 'item':
        src = img(L['src'])
        if src is None: return None
        src = tint(src, L)
        if L['name'].startswith('Zeitung'):   # gerissener Rand (Roughen Edges, grob)
            a = np.asarray(src.getchannel('A')).astype(np.float32) / 255; h, w = a.shape
            yy, xx = np.mgrid[0:h, 0:w]; ed = np.minimum(np.minimum(xx, w - 1 - xx), np.minimum(yy, h - 1 - yy)).astype(np.float32)
            n = noise((w, h), 7, 6) * 26; a = a * (ed > n); src = src.copy(); src.putalpha(Image.fromarray((a * 255).astype(np.uint8)))
        return warp(src, Mc, size)
    if k == 'comp':
        sub = tint(render_comp(L['layers'], L['w'], L['h'], t), L)   # Tint auch auf Precomps (Hintergrund-Collage 25.11.)
        return warp(sub, mul(Mc, [1 / SK, 0, 0, 1 / SK, 0, 0]), size)
    if k == 'text': return draw_text(L, Mc, size)
    if k == 'shape': return draw_shape(L, Mc, size)
    if k == 'solid':
        rp = fx(L, 'ADBE Ramp')
        pts = [xf(Mc, q) for q in ((0, 0), (L['w'], 0), (L['w'], L['h']), (0, L['h']))]
        a = poly_alpha([pts], size)
        if rp:
            p = rp[0]['p']; s0, s1 = np.array(p['Start of Ramp']), np.array(p['End of Ramp']); c0, c1 = np.array(p['Start Color'][:3]), np.array(p['End Color'][:3])
            yy, xx = np.mgrid[0:size[1], 0:size[0]].astype(np.float32)
            S0, S1 = np.array(xf(Mc, s0)), np.array(xf(Mc, s1)); dv = S1 - S0
            u = np.clip(((xx - S0[0]) * dv[0] + (yy - S0[1]) * dv[1]) / max(1e-6, dv @ dv), 0, 1)[..., None]
            rgb = c0 + (c1 - c0) * u
        else: rgb = np.ones((size[1], size[0], 3), np.float32) * np.array(L['color'][:3], np.float32)
        out = np.concatenate([rgb, a[..., None]], 2)
        return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8), 'RGBA')
    return None
def blend(dst, src_rgb, a, mode):
    if mode in ('MULTIPLY',): B = dst * src_rgb
    elif mode in ('ADD', 'LINEAR_DODGE'): B = np.clip(dst + src_rgb, 0, 1)
    elif mode == 'SCREEN': B = 1 - (1 - dst) * (1 - src_rgb)
    elif mode == 'COLOR':
        Ld = (0.299 * dst[..., 0] + 0.587 * dst[..., 1] + 0.114 * dst[..., 2])[..., None]; Ls = (0.299 * src_rgb[..., 0] + 0.587 * src_rgb[..., 1] + 0.114 * src_rgb[..., 2])[..., None]
        B = np.clip(src_rgb + (Ld - Ls), 0, 1)
    else: B = src_rgb
    return dst * (1 - a[..., None]) + B * a[..., None]
def render_comp(layers, cw, ch, t, Mc_scale=None):
    k = SK if Mc_scale is None else Mc_scale
    size = (max(1, round(cw * k)), max(1, round(ch * k)))
    S = [k, 0, 0, k, 0, 0]
    dst = np.zeros((size[1], size[0], 3), np.float32); dA = np.zeros((size[1], size[0]), np.float32)
    for L in layers:
        Mc = mul(S, L['M']); op = (L['op'] if L['op'] is not None else 100) / 100
        if op <= 0.001: continue
        if L['adj']:
            ma = maskA(L, Mc, size); A = (ma if ma is not None else np.ones(dA.shape, np.float32)) * op
            res = dst.copy()
            for e in L['fx']:
                if e['m'] == 'ADBE Box Blur2' and (e['p'].get('Blur Radius') or 0) > 0.3:
                    r = e['p']['Blur Radius'] * k; im = Image.fromarray((res * 255).astype(np.uint8)).filter(ImageFilter.BoxBlur(r)).filter(ImageFilter.BoxBlur(r))
                    res = np.asarray(im).astype(np.float32) / 255
                if e['m'] == 'ADBE Geometry2':
                    sc = (e['p'].get('Scale Height') or 100) / 100
                    if abs(sc - 1) > 1e-3:
                        im = Image.fromarray((res * 255).astype(np.uint8)); c = (size[0] / 2, size[1] / 2)
                        res = np.asarray(im.transform(size, Image.AFFINE, (1 / sc, 0, c[0] - c[0] / sc, 0, 1 / sc, c[1] - c[1] / sc), Image.BILINEAR)).astype(np.float32) / 255
            dst = dst * (1 - A[..., None]) + res * A[..., None]
            continue
        im = layer_rgba(L, Mc, size, t)
        if im is None: continue
        if L['kind'] != 'solid' and not L['name'].startswith('Grund'): im = shadow(im, L, Mc)
        a = np.asarray(im).astype(np.float32) / 255; rgb, A = a[..., :3], a[..., 3]
        ma = maskA(L, Mc, size)
        if ma is not None: A = A * ma
        for e in fx(L, 'CC Burn Film'):
            b = (e['p'].get('Burn') or 0) / 100
            if b > 0:
                n = noise(size, e['p'].get('Random Seed') or 1, 40) * 0.7 + noise(size, 3, 8) * 0.3
                keep = n > b; edge = (n > b) & (n < b + 0.06)
                A = A * keep; rgb = rgb.copy(); rgb[edge] = rgb[edge] * 0.3 + np.array([0.9, 0.45, 0.1]) * 0.7
        for e in fx(L, 'CC Page Turn'):
            fp = e['p'].get('Fold Position')
            if fp:
                F = xf(Mc, fp); yy, xx = np.mgrid[0:size[1], 0:size[0]].astype(np.float32)
                A = A * (((xx - F[0]) + (yy - F[1])) < 0)
        A = A * op
        dst = blend(dst, rgb, A, L['blend']); dA = np.maximum(dA, A) if L['blend'] == 'NORMAL' else dA
    out = np.concatenate([dst, np.clip(dA, 0, 1)[..., None]], 2)
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8), 'RGBA')
paths = []
for fr in J['frames']:
    im = render_comp(fr['layers'], 1080, 1920, fr['t']).convert('RGB')
    p = os.path.join(OUT, 'v_%05d.jpg' % round(fr['t'] * 100)); im.save(p, quality=88); paths.append(p)
print('\n'.join(paths))
