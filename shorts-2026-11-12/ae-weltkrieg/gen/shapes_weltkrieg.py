# Eigene Strichzeichnungen (keine Fotos, keine KI) als AE-Pfade {v, i, o, c}.
# Stadtplan Sarajevo 1914 als Skizze (schematisch, Norden oben): Fluss quer, Appel-Kai am Nordufer,
# Lateinerbruecke + Seitenstrasse nach Norden, Rathaus im Osten, Krankenhaus im Westen.
import math, random
def cr(pts, closed=False):
    n = len(pts); v = [[round(x, 1), round(y, 1)] for x, y in pts]; ii = []; oo = []
    for k in range(n):
        if closed: p0, p2 = pts[k - 1], pts[(k + 1) % n]
        else: p0, p2 = pts[max(0, k - 1)], pts[min(n - 1, k + 1)]
        tx, ty = (p2[0] - p0[0]) / 6, (p2[1] - p0[1]) / 6
        if not closed and (k == 0 or k == n - 1): tx, ty = tx * 0.5, ty * 0.5
        ii.append([round(-tx, 1), round(-ty, 1)]); oo.append([round(tx, 1), round(ty, 1)])
    return {'v': v, 'i': ii, 'o': oo, 'c': closed}
def poly(pts, closed=False):
    return {'v': [[round(x, 1), round(y, 1)] for x, y in pts], 'i': [[0, 0]] * len(pts), 'o': [[0, 0]] * len(pts), 'c': closed}
def wob(pts, a, seed):
    r = random.Random(seed); return [(x + r.uniform(-a, a), y + r.uniform(-a, a)) for x, y in pts]

MW, MH = 2400, 2200           # Stadtplan-Comp
def river_y(x): return 1240 + 26 * math.sin(x / 520.0) - 0.02 * (x - 1200)
XL, XC, XK = 820, 1240, 1640  # Lateinerbruecke, Cumurija-Bruecke (Bombe), Kaiserbruecke
X_RATHAUS, X_KH = 2150, 300
def stadtplan():
    xs = list(range(-40, MW + 41, 80))
    nb = [(x, river_y(x) - 46) for x in xs]; sb = [(x, river_y(x) + 46) for x in xs]
    water = poly(nb + sb[::-1], True)
    sx = XL + 70
    road_n = [(x, river_y(x) - 128) for x in xs if x < sx - 34] + [(sx - 34, river_y(sx - 34) - 128)]
    road_n2 = [(sx + 34, river_y(sx + 34) - 128)] + [(x, river_y(x) - 128) for x in xs if x > sx + 34]
    road_s = [(x, river_y(x) - 62) for x in xs]
    quay = [(x, river_y(x) - 95) for x in xs]          # Fahrlinie der Wagen (Mitte des Kais)
    bridges = []
    for bx in (XL, XC, XK):
        y0, y1 = river_y(bx) - 62, river_y(bx) + 50
        bridges.append(poly([(bx - 26, y0), (bx - 26, y1)])); bridges.append(poly([(bx + 26, y0), (bx + 26, y1)]))
    # Seitenstrasse (Franz-Joseph-Strasse) nach Norden, an der Lateinerbruecke
    side = [poly([(sx - 34, river_y(sx) - 128), (sx - 40, 150)]), poly([(sx + 34, river_y(sx) - 128), (sx + 28, 150)])]
    # Haeuserbloecke nord/sued (leicht schief, Skizze)
    r = random.Random(1914); blocks = []
    for x0 in range(-20, MW, 190):
        if abs(x0 + 80 - sx) < 150: continue
        for row in range(6):
            y1 = river_y(x0 + 80) - 150 - row * 170; w = r.uniform(120, 165); h = r.uniform(110, 145)
            blocks.append(poly(wob([(x0, y1 - h), (x0 + w, y1 - h), (x0 + w, y1), (x0, y1)], 5, r.random()), True))
        for row in range(5):
            y1 = river_y(x0 + 80) + 80 + row * 170; w = r.uniform(120, 165); h = r.uniform(110, 140)
            blocks.append(poly(wob([(x0, y1), (x0 + w, y1), (x0 + w, y1 + h), (x0, y1 + h)], 5, r.random()), True))
    return {'w': MW, 'h': MH, 'water': water, 'bank_n': cr(nb), 'bank_s': cr(sb), 'road_n': cr(road_n), 'road_n2': cr(road_n2), 'road_s': cr(road_s),
            'quay': [[round(x, 1), round(y, 1)] for x, y in quay], 'bridges': bridges, 'side': side, 'blocks': blocks,
            'side_x': sx, 'xl': XL, 'xc': XC, 'xk': XK, 'x_rathaus': X_RATHAUS, 'x_kh': X_KH,
            'ry': {str(x): round(river_y(x), 1) for x in range(0, MW + 1, 10)}}

def car_top(L=74, B=36):
    # offener Wagen von oben, Fahrtrichtung +x
    body = cr([(L / 2, 0), (L / 2 - 6, -B / 2), (-L / 2 + 4, -B / 2), (-L / 2, 0), (-L / 2 + 4, B / 2), (L / 2 - 6, B / 2)], True)
    hood = poly([(L / 2 - 22, -B / 2 + 3), (L / 2 - 22, B / 2 - 3)])
    seats = poly([(-6, -B / 2 + 5), (-6, B / 2 - 5)])
    return {'body': body, 'hood': hood, 'seats': seats, 'L': L, 'B': B}
def bomb(r=20):
    fuse = cr([(r * 0.55, -r * 0.75), (r * 0.9, -r * 1.3), (r * 1.4, -r * 1.45)])
    return {'r': r, 'fuse': fuse}
def burst(n=10, r0=30, r1=80, seed=3):
    rr = random.Random(seed); out = []
    for k in range(n):
        a = math.tau * k / n + rr.uniform(-0.15, 0.15); a0 = r0 * rr.uniform(0.9, 1.1); a1 = r1 * rr.uniform(0.75, 1.15)
        out.append(poly([(math.cos(a) * a0, math.sin(a) * a0), (math.cos(a) * a1, math.sin(a) * a1)]))
    return out
def building(w, h, roof='flat'):
    # einfaches Gebaeude-Symbol, Mittelpunkt unten
    base = poly([(-w / 2, 0), (-w / 2, -h), (w / 2, -h), (w / 2, 0)], True)
    if roof == 'dome': top = cr([(-w * 0.3, -h), (-w * 0.22, -h - w * 0.22), (0, -h - w * 0.32), (w * 0.22, -h - w * 0.22), (w * 0.3, -h)])
    else: top = poly([(-w / 2 - 10, -h), (0, -h - h * 0.35), (w / 2 + 10, -h)])
    wins = [poly([(-w / 2 + x, -h * 0.25), (-w / 2 + x, -h * 0.7)]) for x in [w * f for f in (0.2, 0.4, 0.6, 0.8)]]
    return {'base': base, 'top': top, 'wins': wins, 'w': w, 'h': h}
def cross(s):
    a, b = s * 0.18, s * 0.5
    return poly([(-a, -b), (a, -b), (a, -a), (b, -a), (b, a), (a, a), (a, b), (-a, b), (-a, a), (-b, a), (-b, -a), (-a, -a)], True)
def stopwatch(R=210):
    ring = cr([(math.cos(math.tau * k / 36) * R, math.sin(math.tau * k / 36) * R) for k in range(36)], True)
    crown = poly([(-26, -R - 6), (-26, -R - 40), (26, -R - 40), (26, -R - 6)], True)
    knob = poly([(-40, -R - 40), (40, -R - 40)])
    ticks = []
    for k in range(12):
        a = math.tau * k / 12 - math.pi / 2; r0 = R * (0.78 if k % 3 == 0 else 0.86)
        ticks.append(poly([(math.cos(a) * r0, math.sin(a) * r0), (math.cos(a) * R * 0.94, math.sin(a) * R * 0.94)]))
    return {'R': R, 'ring': ring, 'crown': crown, 'knob': knob, 'ticks': ticks}
def silhouette(h=150):
    # gesichtslose Figur (Kopf + Mantel), Fusspunkt (0,0)
    head = h * 0.16
    body = cr([(-h * 0.2, 0), (-h * 0.22, -h * 0.45), (-h * 0.17, -h * 0.68), (0, -h * 0.74), (h * 0.17, -h * 0.68), (h * 0.22, -h * 0.45), (h * 0.2, 0)], True)
    return {'head': head, 'headY': -h * 0.84, 'body': body, 'h': h}
def calendar(w=520, h=600):
    page = poly([(-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2)], True)
    rings = [poly([(x, -h / 2 - 26), (x, -h / 2 + 22)]) for x in (-w * 0.3, -w * 0.1, w * 0.1, w * 0.3)]
    return {'w': w, 'h': h, 'page': page, 'rings': rings}
def arrow_head(tip, ang, L=30, spread=0.5):
    return poly([(tip[0] - L * math.cos(ang - spread), tip[1] - L * math.sin(ang - spread)), tip, (tip[0] - L * math.cos(ang + spread), tip[1] - L * math.sin(ang + spread))])

def build():
    return {'plan': stadtplan(), 'car': car_top(), 'bomb': bomb(), 'burst': burst(), 'rathaus': building(150, 90, 'dome'),
            'spital': building(130, 80), 'cross': cross(46), 'watch': stopwatch(), 'sil': silhouette(), 'cal': calendar()}
