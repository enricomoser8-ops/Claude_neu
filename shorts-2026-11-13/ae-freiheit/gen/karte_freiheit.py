# Vox-Papierkarten fuer den Freiheitsstatue-Short (13.11.2026) -> ../data/karte.json
# Quellen (alle gemeinfrei): Natural Earth 1:10m/1:50m ueber world-atlas@2.0.2 (land/countries), Natural Earth 10m Seen,
# US Census Cartographic Boundary 1:500k (cb_2018_us_state_500k, Hafen New York, US-Bundesbehoerde = public domain).
# Zwei orthographische Projektionen (wie ein Globus von oben, Einheit km, y nach unten):
#   ny : Mitte Liberty Island (40.6892 N, 74.0445 W) - Globus-Ende, Satellitenbild, Region Nordost-USA, Hafen
#   atl: Mitte (49 N, 36 W) zwischen New York und Paris - Atlantik, Route Frankreich -> USA, Paris
# Aufruf: python3 karte_freiheit.py <ordner mit land-10m.json countries-10m.json land-50m.json countries-50m.json ne_10m_lakes.geojson cb/>
import json, math, sys, os
import shapefile
from shapely.geometry import shape, Polygon, MultiPolygon, LineString, MultiLineString, box, mapping
from shapely.ops import unary_union, linemerge
SRC = sys.argv[1] if len(sys.argv) > 1 else '.'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'karte.json')
RE = 6371.0
def ortho(lat0, lon0):
    p0, l0 = math.radians(lat0), math.radians(lon0)
    def f(lon, lat):
        p, l = math.radians(lat), math.radians(lon)
        cosc = math.sin(p0) * math.sin(p) + math.cos(p0) * math.cos(p) * math.cos(l - l0)
        x = RE * math.cos(p) * math.sin(l - l0)
        y = RE * (math.cos(p0) * math.sin(p) - math.sin(p0) * math.cos(p) * math.cos(l - l0))
        return (x, -y, cosc)
    return f
def topo_arcs(t):
    sc, tr = t['transform']['scale'], t['transform']['translate']; arcs = []
    for a in t['arcs']:
        x = y = 0; pts = []
        for dx, dy in a: x += dx; y += dy; pts.append((x * sc[0] + tr[0], y * sc[1] + tr[1]))
        arcs.append(pts)
    return arcs
def topo_geoms(t, obj, names=None):
    arcs = topo_arcs(t)
    def arc(i): return arcs[i] if i >= 0 else arcs[~i][::-1]
    def ring(r):
        out = []
        for i in r: a = arc(i); out.extend(a if not out else a[1:])
        return out
    res = []
    for g in t['objects'][obj]['geometries']:
        nm = g.get('properties', {}).get('name')
        if names and nm not in names: continue
        polys = [g['arcs']] if g['type'] == 'Polygon' else (g['arcs'] if g['type'] == 'MultiPolygon' else [])
        res.append((nm, [[ring(r) for r in p] for p in polys]))
    return res, arcs
LLBOX = None   # lon/lat-Rechteck, das ganz auf der sichtbaren Halbkugel liegt (wird je Projektion gesetzt)
def ll_clip(polys):
    if LLBOX is None: return polys
    out = []
    def unwrap(r):   # Polygone ueber die Datumsgrenze (Eurasien/Tschukotka, Wrangel-Insel): westliche Laengen +360
        xs = [q[0] for q in r]
        return [(q[0] + 360 if q[0] < -100 else q[0], q[1]) for q in r] if max(xs) - min(xs) > 300 else r
    for p in polys:
        p = [unwrap(r) for r in p]
        try: g = Polygon(p[0], [h for h in p[1:] if len(h) > 3])
        except Exception: continue
        if not g.is_valid: g = g.buffer(0)
        g = g.intersection(LLBOX)
        for q in ([g] if isinstance(g, Polygon) else [x for x in getattr(g, 'geoms', []) if isinstance(x, Polygon)]):
            if q.is_empty: continue
            out.append([list(q.exterior.coords)] + [list(h.coords) for h in q.interiors])
    return out
def project_polys(polys, P, maxc=0.05):
    """lon/lat-Polygone -> projizierte shapely-Polygone (nur sichtbare Halbkugel; vorher auf LLBOX geschnitten)"""
    out = []
    for p in ll_clip(polys):
        rings = []
        for r in p:
            q = [P(lon, lat) for lon, lat in r]
            if min(c for _, _, c in q) < maxc: q = None
            rings.append(q)
        if rings[0] is None: continue
        try:
            poly = Polygon([(x, y) for x, y, _ in rings[0]], [[(x, y) for x, y, _ in h] for h in rings[1:] if h and len(h) > 3])
            if not poly.is_valid: poly = poly.buffer(0)
            out.append(poly)
        except Exception: pass
    return out
def rings_out(geom, tol, nd=1, minarea=0.0):
    """shapely (Multi)Polygon -> [[x,y],...] Ringe (aussen + Loecher als eigene Ringe, gleiche Fuellregel 'gerade/ungerade' in AE: Loecher werden ausgestanzt)"""
    g = geom.simplify(tol, preserve_topology=True)
    polys = [g] if isinstance(g, Polygon) else (list(g.geoms) if hasattr(g, 'geoms') else [])
    out = []
    for p in polys:
        if not isinstance(p, Polygon) or p.area < minarea: continue
        for r in [p.exterior] + list(p.interiors):
            c = list(r.coords)[:-1]
            if len(c) >= 3: out.append([[round(x, nd), round(y, nd)] for x, y in c])
    return out
def lines_out(geom, tol, nd=1):
    g = geom.simplify(tol)
    ls = [g] if isinstance(g, LineString) else (list(g.geoms) if hasattr(g, 'geoms') else [])
    return [[[round(x, nd), round(y, nd)] for x, y in l.coords] for l in ls if isinstance(l, LineString) and len(l.coords) >= 2]
def count(r): return sum(len(x) for x in r)

land10 = json.load(open(os.path.join(SRC, 'land-10m.json')))
cty10 = json.load(open(os.path.join(SRC, 'countries-10m.json')))
land50 = json.load(open(os.path.join(SRC, 'land-50m.json')))
cty50 = json.load(open(os.path.join(SRC, 'countries-50m.json')))
lakes = json.load(open(os.path.join(SRC, 'ne_10m_lakes.geojson')))
BIG_LAKES = [f for f in lakes['features'] if (f['properties'].get('scalerank') or 9) <= 2]

def lake_polys(P, minarea):
    res = []
    for f in BIG_LAKES:
        g = shape(f['geometry']); ps = [g] if isinstance(g, Polygon) else list(g.geoms)
        for p in ps:
            pp = project_polys([[list(p.exterior.coords)]], P)
            for q in pp:
                if q.area > minarea: res.append(q)
    return unary_union(res) if res else None
def country_borders(t, P, clipbox, tol, nd=1):
    """innere Laendergrenzen = Boegen, die zu zwei Laendern gehoeren (topojson mesh a !== b)"""
    arcs = topo_arcs(t); use = {}
    for g in t['objects']['countries']['geometries']:
        polys = [g['arcs']] if g['type'] == 'Polygon' else (g['arcs'] if g['type'] == 'MultiPolygon' else [])
        for p in polys:
            for r in p:
                for i in r: k = i if i >= 0 else ~i; use[k] = use.get(k, 0) + 1
    ls = []
    for k, n in use.items():
        if n < 2: continue
        q = [P(lon, lat) for lon, lat in arcs[k]]
        if min(c for _, _, c in q) < 0.05: continue
        ls.append(LineString([(x, y) for x, y, _ in q]))
    m = linemerge(unary_union(ls)).intersection(clipbox)
    return lines_out(m, tol, nd)

K = {}
# ================= ny: Region Nordost-USA (Natural Earth 10m) + Hafen (Census 1:500k) =================
LAT0, LON0 = 40.6892, -74.0445
P = ortho(LAT0, LON0)
LLBOX = box(-115, 12, -30, 72)
REG = box(-1900, -3000, 1900, 3000)
landg, _ = topo_geoms(land10, 'land')
polys = []
for _, ps in landg: polys += project_polys(ps, P)
L = unary_union([p for p in polys if p.intersects(REG)]).intersection(REG)
lk = lake_polys(P, 400)
if lk is not None: L = L.difference(lk)
reg_land = rings_out(L, 2.0, 1, 30)
reg_bord = country_borders(cty10, P, REG, 2.0)
# US-Bundesstaaten (Census 500k) fuer Grenzen + Hafen
sf = shapefile.Reader(os.path.join(SRC, 'cb', 'cb_2018_us_state_500k'))
ST = {}
for sr in sf.shapeRecords():
    nm = sr.record['STUSPS']
    if nm not in ('NY', 'NJ', 'CT', 'PA', 'DE', 'MD', 'DC', 'VA', 'MA', 'RI', 'VT', 'NH', 'ME', 'WV', 'OH'): continue
    g = shape(sr.shape.__geo_interface__); ps = [g] if isinstance(g, Polygon) else list(g.geoms)
    ST[nm] = unary_union(project_polys([[list(p.exterior.coords)] + [list(h.coords) for h in p.interiors] for p in ps], P))
# Staatsgrenzen (innere): gemeinsame Kanten benachbarter Staaten
sb = []
names = list(ST)
for i in range(len(names)):
    for j in range(i + 1, len(names)):
        a, b = ST[names[i]], ST[names[j]]
        if a.distance(b) > 0.5: continue
        x = a.buffer(0.3).intersection(b.buffer(0.3))
        if x.is_empty: continue
        # Mittellinie grob: Rand von a innerhalb von b-Puffer
        e = a.boundary.intersection(b.buffer(0.6))
        if not e.is_empty: sb.append(e)
SB = linemerge(unary_union([g for g in sb if g.geom_type in ('LineString', 'MultiLineString')]))
reg_states = lines_out(SB.intersection(REG).intersection(L.buffer(-1.0)), 2.0)
HAF = box(-330, -560, 330, 560)
H = unary_union([g.intersection(HAF) for g in ST.values() if g.intersects(HAF)])
# Hudson, East River, Newark Bay usw.: US Census TIGER/Line 2023 AREAWATER der Hafen-Counties (public domain), Flaechen ab 0,15 km2
import glob
aw = []
for z in sorted(glob.glob(os.path.join(SRC, 'aw', '*.zip'))):
    for sr in shapefile.Reader(z).shapes():
        g = shape(sr.__geo_interface__); ps = [g] if isinstance(g, Polygon) else list(g.geoms)
        for q in project_polys([[list(p.exterior.coords)] + [list(h.coords) for h in p.interiors] for p in ps], P):
            # nur Fluesse/Buchten, die man sieht: gross oder breit genug (Flaeche/Umfang ~ halbe Breite); keine Teiche/Baeche
            if q.area > 6 or (q.area > 1.2 and q.area / q.length > 0.28): aw.append(q.buffer(0.02))
if aw: H = H.difference(unary_union(aw))
def tidy(G, minland, minhole):   # Kruemel-Inseln und kleine Loecher (Teiche) weg
    ps = [G] if isinstance(G, Polygon) else list(G.geoms)
    out = []
    for p in ps:
        if not isinstance(p, Polygon) or p.area < minland: continue
        out.append(Polygon(p.exterior, [h for h in p.interiors if Polygon(h).area >= minhole]))
    return unary_union(out)
H = tidy(H, 0.4, 2.5)
print('Hafen: %d Wasserflaechen ausgestanzt' % len(aw))
haf_land = rings_out(H, 0.06, 2, 0.05)
haf_states = lines_out(SB.intersection(H.buffer(-0.15)), 0.06, 2)   # nur Grenzen an Land (nicht in der Flussmitte)
def pt(lon, lat): x, y, _ = P(lon, lat); return [round(x, 2), round(y, 2)]
K['ny'] = {'lat0': LAT0, 'lon0': LON0, 'proj': 'ortho', 'reg': {'land': reg_land, 'borders': reg_bord, 'states': reg_states, 'box': [-1900, -3000, 1900, 3000]},
           'haf': {'land': haf_land, 'states': haf_states, 'box': [-330, -560, 330, 560]},
           'pts': {'Liberty Island': pt(-74.0445, 40.6892), 'New York': pt(-73.9712, 40.7831), 'Manhattan': pt(-73.968, 40.785),
                   'Washington': pt(-77.0365, 38.8977), 'Brooklyn': pt(-73.95, 40.65), 'New Jersey': pt(-74.55, 40.45),
                   'Long Island': pt(-73.10, 40.82), 'Atlantik': pt(-72.2, 39.4), 'USA': pt(-78.6, 41.4), 'Kanada': pt(-76.5, 46.4),
                   'Atlantik weit': pt(-66.0, 37.5), 'Philadelphia': pt(-75.165, 39.953)}}
print('ny reg: Land %d Ringe / %d Punkte, Grenzen %d, Staaten %d | Hafen: %d Ringe / %d Punkte, Staaten %d' % (
    len(reg_land), count(reg_land), count(reg_bord), count(reg_states), len(haf_land), count(haf_land), count(haf_states)))

# ================= atl: Atlantik New York <-> Paris (Natural Earth 50m) =================
# Plattkarte (equirektangular, Breitenkreis 45 Grad laengentreu) wie eine Vox-Papierkarte; nur nach einem Schnitt benutzt,
# daher keine Globus-Projektion noetig (ortho zeigte im Hochformat schon den Horizont).
LAT0, LON0 = 47.0, -37.0
def P(lon, lat, _k=math.cos(math.radians(45)) * 111.32): return ((lon - LON0) * _k, -(lat - LAT0) * 111.32, 1.0)
LLBOX = box(-135, -40, 55, 84)
ATL = box(-7000, -4200, 7000, 9800)
landg, _ = topo_geoms(land50, 'land')
polys = []
for _, ps in landg: polys += project_polys(ps, P)
L = unary_union([p for p in polys if p.intersects(ATL)]).intersection(ATL)
lk = lake_polys(P, 2000)
if lk is not None: L = L.difference(lk)
atl_land = rings_out(L, 6.0, 1, 150)
atl_bord = country_borders(cty50, P, ATL, 6.0)
cg, _ = topo_geoms(cty50, 'countries', {'France', 'United States of America', 'Canada'})
CT = {}
for nm, ps in cg:
    g = unary_union(project_polys(ps, P)).intersection(ATL)
    if nm == 'France': g = g.intersection(box(1500, -2000, 4600, 1000))   # nur Europa (keine Ueberseegebiete)
    CT[nm] = rings_out(g, 6.0, 1, 300)
def pt(lon, lat): x, y, _ = P(lon, lat); return [round(x, 1), round(y, 1)]
K['atl'] = {'lat0': LAT0, 'lon0': LON0, 'proj': 'equirect45', 'land': atl_land, 'borders': atl_bord, 'box': [-7000, -4200, 7000, 9800],
            'usa': CT['United States of America'], 'fra': CT['France'],
            'pts': {'New York': pt(-74.0445, 40.6892), 'Paris': pt(2.3522, 48.8566), 'Rouen': pt(1.0993, 49.4431), 'Washington': pt(-77.0365, 38.8977),
                    'USA': pt(-80.0, 38.6), 'Frankreich': pt(2.4, 46.7), 'Kanada': pt(-70.0, 51.5), 'Atlantik': pt(-40.0, 40.0),
                    'Spanien': pt(-3.7, 40.2), 'Grossbritannien': pt(-1.8, 52.8)}}
print('atl: Land %d Ringe / %d Punkte, Grenzen %d, USA %d, F %d' % (len(atl_land), count(atl_land), count(atl_bord), count(CT['United States of America']), count(CT['France'])))
print('Punkte ny:', K['ny']['pts']); print('Punkte atl:', K['atl']['pts'])
json.dump(K, open(OUT, 'w'), separators=(',', ':'))
print('geschrieben', OUT, os.path.getsize(OUT) // 1024, 'KB')
