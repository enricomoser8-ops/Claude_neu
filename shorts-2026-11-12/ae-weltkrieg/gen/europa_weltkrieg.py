# Europa 1914 als eigene Zeichnung -> data/europa.json
# Grundlage: Natural Earth 1:10m Admin-1 (Provinzen), gemeinfrei (naturalearthdata.com).
# Die Grenzen von 1914 werden aus heutigen Provinzen zusammengesetzt (Naeherung fuer eine Skizze):
# Oesterreich-Ungarn, Deutsches Reich, Russisches Reich, Serbien (mit Kosovo + Nordmazedonien) usw.
# Aufruf: python3 europa_weltkrieg.py <ne_10m_admin_1_states_provinces.geojson>
import json, os, sys, math
from shapely.geometry import shape, box, mapping
from shapely.ops import unary_union
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'data', 'europa.json')
SRC = sys.argv[1]
LON0, LON1, LAT0, LAT1 = -11.0, 41.0, 34.5, 61.5
K = 51.7; CL = math.cos(math.radians(48))
W = round((LON1 - LON0) * K * CL); H = round((LAT1 - LAT0) * K)
def P(lon, lat): return [round((lon - LON0) * K * CL, 1), round((LAT1 - lat) * K, 1)]
AH_POL = {'Lesser Poland', 'Subcarpathian'}
DE_POL = {'Greater Poland', 'Kuyavian-Pomeranian', 'Lower Silesian', 'Lubusz', 'Opole', 'Pomeranian', 'Silesian', 'Warmian-Masurian', 'West Pomeranian'}
AH_UKR = {"L'viv", "Ternopil'", "Ivano-Frankivs'k", 'Transcarpathia', 'Chernivtsi'}
AH_ROU = {'Alba', 'Arad', 'Bihor', 'Bistrita-Nasaud', 'Brasov', 'Caras-Severin', 'Cluj', 'Covasna', 'Harghita', 'Hunedoara', 'Maramures', 'Mures', 'Salaj', 'Satu Mare', 'Sibiu', 'Timis', 'Suceava'}
AH_SRB = {'Južno-Backi', 'Severno-Backi', 'Zapadno-Backi', 'Južno-Banatski', 'Severno-Banatski', 'Srednje-Banatski', 'Sremski'}
AH_ITA = {'Bozen', 'Trento', 'Trieste', 'Gorizia'}
DE_FRA = {'Bas-Rhin', 'Haut-Rhin', 'Moselle'}
GROUP0 = {'AUT': 'AH', 'HUN': 'AH', 'CZE': 'AH', 'SVK': 'AH', 'SVN': 'AH', 'HRV': 'AH', 'BIH': 'AH',
          'DEU': 'DE', 'RUS': 'RU', 'BLR': 'RU', 'UKR': 'RU', 'POL': 'RU', 'LTU': 'RU', 'LVA': 'RU', 'EST': 'RU', 'FIN': 'RU', 'MDA': 'RU',
          'SRB': 'SRB', 'KOS': 'SRB', 'MKD': 'SRB', 'FRA': 'FR', 'GBR': 'UK', 'IRL': 'UK', 'BEL': 'BE', 'MNE': 'MNE'}
def group(p):
    a, n = p['adm0_a3'], p.get('name') or ''
    if a == 'POL': return 'AH' if n in AH_POL else ('DE' if n in DE_POL else 'RU')
    if a == 'UKR': return 'AH' if n in AH_UKR else 'RU'
    if a == 'ROU': return 'AH' if n in AH_ROU else 'land'
    if a == 'SRB': return 'AH' if n in AH_SRB else 'SRB'
    if a == 'ITA': return 'AH' if n in AH_ITA else 'land'
    if a == 'FRA': return 'DE' if n in DE_FRA else 'FR'
    if a == 'RUS' and n == 'Kaliningrad': return 'DE'
    if a == 'LTU' and n == 'Klaipedos': return 'DE'
    return GROUP0.get(a, 'land')
d = json.load(open(SRC, encoding='utf-8'))
clip = box(LON0 - 1, LAT0 - 1, LON1 + 1, LAT1 + 1)
G = {}
for f in d['features']:
    g = shape(f['geometry'])
    if not g.intersects(clip): continue
    G.setdefault(group(f['properties']), []).append(g.buffer(0).intersection(clip))
def rings(geom, tol, minarea):
    out = []
    geom = geom.simplify(tol, preserve_topology=True)
    polys = [geom] if geom.geom_type == 'Polygon' else list(getattr(geom, 'geoms', []))
    for pg in polys:
        if pg.geom_type != 'Polygon' or pg.area < minarea: continue
        out.append([P(x, y) for x, y in list(pg.exterior.coords)[:-1]])
    return out
U = {k: unary_union(v).buffer(0.02).buffer(-0.02) for k, v in G.items()}
allland = unary_union(list(U.values()))
res = {'w': W, 'h': H, 'groups': {}, 'coast': rings(allland, 0.05, 0.08),
       'cities': {'Sarajevo': P(18.413, 43.856), 'Wien': P(16.37, 48.21), 'Belgrad': P(20.46, 44.82)}}
for k, g in U.items():
    if k == 'land': continue
    res['groups'][k] = rings(g, 0.05, 0.04)
n = sum(len(r) for rr in res['groups'].values() for r in rr) + sum(len(r) for r in res['coast'])
json.dump(res, open(OUT, 'w'), separators=(',', ':'))
print('europa.json', W, 'x', H, '| Punkte', n, '|', {k: len(v) for k, v in res['groups'].items()}, '| Kuestenringe', len(res['coast']))
