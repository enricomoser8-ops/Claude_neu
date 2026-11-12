# Mittelmeer-Karte (Natural Earth 1:50m ueber world-atlas@2.0.2, gemeinfrei) -> Pfade fuer AE-Formebenen.
# Ausgabe: ../data/karte.json {w,h, land:[rings], egypt:[rings], greece:[rings], orte:{name:[x,y]}}
# Aufruf: python3 karte_kleopatra.py <ordner mit land-50m.json + countries-50m.json>
import json, math, sys, os
SRC = sys.argv[1] if len(sys.argv) > 1 else '.'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')
LON0, LON1, LAT0, LAT1 = 12.0, 38.0, 25.5, 46.0
K = math.cos(math.radians(36)); PX = 68.0   # Pixel je Breitengrad
W = round((LON1 - LON0) * K * PX); H = round((LAT1 - LAT0) * PX)
def prj(lon, lat): return ((lon - LON0) * K * PX, (LAT1 - lat) * PX)
def topo(t):
    sc, tr = t['transform']['scale'], t['transform']['translate']; arcs = []
    for a in t['arcs']:
        x = y = 0; pts = []
        for dx, dy in a: x += dx; y += dy; pts.append((x * sc[0] + tr[0], y * sc[1] + tr[1]))
        arcs.append(pts)
    return arcs
def rdp(pts, eps):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]; dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1e-9
    dmax, idx = 0, 0
    for i in range(1, len(pts) - 1):
        d = abs(dy * pts[i][0] - dx * pts[i][1] + b[0] * a[1] - b[1] * a[0]) / L
        if d > dmax: dmax, idx = d, i
    if dmax > eps: return rdp(pts[:idx + 1], eps)[:-1] + rdp(pts[idx:], eps)
    return [a, b]
def clip(poly, x0, y0, x1, y1):   # Sutherland-Hodgman am Rechteck
    def cut(pts, inside, inter):
        out = []
        for i in range(len(pts)):
            p, q = pts[i - 1], pts[i]
            if inside(q):
                if not inside(p): out.append(inter(p, q))
                out.append(q)
            elif inside(p): out.append(inter(p, q))
        return out
    ix = lambda p, q, x: (x, p[1] + (q[1] - p[1]) * (x - p[0]) / ((q[0] - p[0]) or 1e-9))
    iy = lambda p, q, y: (p[0] + (q[0] - p[0]) * (y - p[1]) / ((q[1] - p[1]) or 1e-9), y)
    for ins, it in ((lambda p: p[0] >= x0, lambda p, q: ix(p, q, x0)), (lambda p: p[0] <= x1, lambda p, q: ix(p, q, x1)),
                    (lambda p: p[1] >= y0, lambda p, q: iy(p, q, y0)), (lambda p: p[1] <= y1, lambda p, q: iy(p, q, y1))):
        poly = cut(poly, ins, it)
        if not poly: return []
    return poly
def rings_of(t, arcs, geoms):
    def arc(i): return arcs[i] if i >= 0 else arcs[~i][::-1]
    out = []
    for g in geoms:
        polys = [g['arcs']] if g['type'] == 'Polygon' else g['arcs']
        for p in polys:
            r = []
            for i in p[0]: a = arc(i); r.extend(a if not r else a[1:])
            pr = [prj(lon, lat) for lon, lat in r]
            pr = clip(pr, -40, -40, W + 40, H + 40)
            if len(pr) < 3: continue
            area = abs(sum(pr[i][0] * pr[i - 1][1] - pr[i - 1][0] * pr[i][1] for i in range(len(pr)))) / 2
            if area < 60: continue
            far = max(range(len(pr)), key=lambda i: (pr[i][0] - pr[0][0]) ** 2 + (pr[i][1] - pr[0][1]) ** 2)
            pr = rdp(pr[:far + 1], 1.1)[:-1] + rdp(pr[far:] + [pr[0]], 1.1)[:-1]
            if len(pr) >= 3: out.append([[round(x, 1), round(y, 1)] for x, y in pr])
    return out
land = json.load(open(os.path.join(SRC, 'land-50m.json'))); la = topo(land)
cty = json.load(open(os.path.join(SRC, 'countries-50m.json'))); ca = topo(cty)
L = rings_of(land, la, land['objects']['land']['geometries'])
eg = [g for g in cty['objects']['countries']['geometries'] if g.get('properties', {}).get('name') == 'Egypt']
E = rings_of(cty, ca, eg)
orte = {'Pella': prj(22.52, 40.76), 'Alexandria': prj(29.92, 31.20)}
json.dump({'w': W, 'h': H, 'land': L, 'egypt': E, 'orte': {k: [round(v[0], 1), round(v[1], 1)] for k, v in orte.items()}},
          open(os.path.join(OUT, 'karte.json'), 'w'), separators=(',', ':'))
print('Karte %dx%d' % (W, H), len(L), 'Landringe', sum(len(r) for r in L), 'Punkte | Aegypten', len(E), orte)
