# Globus-Textur + Satelliten-Platte fuer den Einstieg (Short 13.11.2026 Freiheitsstatue).
# Quelle: NASA Blue Marble Next Generation, December 2004, world.topo.bathy.200412.3x21600x10800.jpg (NASA Earth Observatory /
# Reto Stoeckli, gemeinfrei). Download: assets.science.nasa.gov/.../bmng-topography-bathymetry/december/
# 1. tex/globus_ny.jpg (5400 x 2700, equirektangular): Erde so gedreht, dass Liberty Island in der BILDMITTE liegt und Norden oben ist.
#    CC Sphere zeigt bei Rotation 0/0/0 die Texturmitte vorn -> der Globus endet genau ueber New York, ohne Vorzeichen-Raten.
#    Naht und Pole der Textur liegen damit auf der Rueckseite bzw. am Rand (Punkt 90 Grad noerdlich/suedlich von New York).
# 2. tex/satellit_ny.jpg: orthografische Ansicht (gleiche Projektion wie die Papierkarte 'ny' und wie CC Sphere) aus der vollen
#    21600er-Textur fuer den Zoom von Kugelradius R0 bis R1 (Pixel auf dem Bildschirm), damit der Uebergang Globus -> Karte scharf bleibt.
# 3. data/globus.json: Radien, Platten-Masse, Testpunkte fuer die Ausrichtungs-Pruefung im Build (sampleImage).
# Aufruf: python3 globus_freiheit.py <world.topo.bathy.200412.3x21600x10800.jpg> [--vorschau]
import json, math, os, sys
import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates
Image.MAX_IMAGE_PIXELS = None
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
SRC = sys.argv[1]
LAT0, LON0 = 40.6892, -74.0445
TW, TH = 5400, 2700
RT = TW / (2 * math.pi)            # Kugelradius in Texturpixeln, bei dem die Mitte 1:1 abgebildet wird (= CC Sphere Radius)
R0, R1 = 800.0, 2600.0              # Platte: Bildschirm-Kugelradius am Anfang / Ende der Platten-Phase
FW, FH, FCY = 1080, 1920, 860       # Bild, Bildschirm-y der Mitte (New York)
print('lade Quelle ...'); big = np.asarray(Image.open(SRC).convert('RGB'))
H0, W0 = big.shape[:2]
def sample(img, lat, lon):
    """bilinear aus equirektangularer Textur, lat/lon in Grad (Arrays)"""
    h, w = img.shape[:2]
    x = (lon + 180.0) / 360.0 * w - 0.5; y = (90.0 - lat) / 180.0 * h - 0.5
    x = np.mod(x, w); y = np.clip(y, 0, h - 1)
    out = np.empty(lat.shape + (3,), np.float32)
    for c in range(3): out[..., c] = map_coordinates(img[..., c], [y, x], order=1, mode='wrap')
    return out
# Drehung: Welt-Vektor v -> gedreht v' = Ry(lat0) Rz(-lon0) v ; zurueck v = Rz(lon0) Ry(-lat0) v'
def rot_back(latp, lonp):
    p, l = np.radians(latp), np.radians(lonp)
    x, y, z = np.cos(p) * np.cos(l), np.cos(p) * np.sin(l), np.sin(p)
    a = math.radians(-LAT0)    # Ry(-lat0): x' = x cos a + z sin a ; z' = -x sin a + z cos a
    x2 = x * math.cos(a) + z * math.sin(a); z2 = -x * math.sin(a) + z * math.cos(a); y2 = y
    b = math.radians(LON0)     # Rz(lon0)
    x3 = x2 * math.cos(b) - y2 * math.sin(b); y3 = x2 * math.sin(b) + y2 * math.cos(b)
    return np.degrees(np.arcsin(np.clip(z2, -1, 1))), np.degrees(np.arctan2(y3, x3))
# ---------- 1. gedrehte Textur (2x2-Supersampling aus der halben Quelle) ----------
half = np.asarray(Image.fromarray(big).resize((W0 // 2, H0 // 2), Image.LANCZOS))
acc = np.zeros((TH, TW, 3), np.float32)
for oy in (0.25, 0.75):
    for ox in (0.25, 0.75):
        jj, ii = np.meshgrid(np.arange(TW) + ox, np.arange(TH) + oy)
        latp = 90.0 - ii / TH * 180.0; lonp = jj / TW * 360.0 - 180.0
        la, lo = rot_back(latp, lonp)
        acc += sample(half, la, lo)
tex = np.clip(acc / 4, 0, 255).astype(np.uint8)
os.makedirs(os.path.join(ROOT, 'tex'), exist_ok=True)
Image.fromarray(tex).save(os.path.join(ROOT, 'tex', 'globus_ny.jpg'), quality=90)
# Spiegel-Variante: falls CC Sphere die Textur gespiegelt aufzieht, nimmt der Build (Ausrichtungs-Pruefung) diese Datei
Image.fromarray(tex[:, ::-1]).save(os.path.join(ROOT, 'tex', 'globus_ny_spiegel.jpg'), quality=90)
print('globus_ny.jpg', TW, TH, 'Radius', round(RT, 1))
# ---------- 2. Satelliten-Platte (orthografisch um New York) ----------
# Platte ist auf R1 gerechnet und deckt das Bild bei R0 (Skalierung R0/R1) mit 4 % Rand.
k = R1 / R0
PW, PH = int(math.ceil(FW * k * 1.04 / 2) * 2), int(math.ceil(FH * k * 1.04 / 2) * 2)
PCX, PCY = PW / 2, PH / 2 + (FCY - FH / 2) * k   # New York in der Platte: so, dass es bei FCY auf dem Bildschirm liegt
acc = np.zeros((PH, PW, 3), np.float32)
for oy in (0.25, 0.75):
    for ox in (0.25, 0.75):
        jj, ii = np.meshgrid(np.arange(PW) + ox, np.arange(PH) + oy)
        X = (jj - PCX) / R1; Y = -(ii - PCY) / R1
        rr = np.clip(X * X + Y * Y, 0, 1); Z = np.sqrt(1 - rr)
        # Punkt auf der gedrehten Kugel: vorn = (1,0,0), rechts = +y (Osten), oben = +z (Norden)
        latp = np.degrees(np.arcsin(np.clip(Y, -1, 1))); lonp = np.degrees(np.arctan2(X, Z))
        la, lo = rot_back(latp, lonp)
        acc += sample(big, la, lo)
plate = np.clip(acc / 4, 0, 255).astype(np.uint8)
Image.fromarray(plate).save(os.path.join(ROOT, 'tex', 'satellit_ny.jpg'), quality=88)
print('satellit_ny.jpg', PW, PH, 'NY bei', PCX, PCY)
# ---------- 3. Testpunkte fuer die Ausrichtungs-Pruefung im Build ----------
# Bei Rotation 0: Punkte als Versatz vom Kugelmittelpunkt in Kugelradien; Land/Meer aus der Textur (Land: R+G > 1,15 B)
def kind(lat, lon):
    c = sample(half, np.array([lat]), np.array([lon]))[0]
    return 'land' if (c[0] + c[1]) > 2.3 * c[2] else 'meer', [int(v) for v in c]
tests = []
for nm, lat, lon in (('Pennsylvania', 40.9, -77.5), ('Atlantik', 37.5, -66.0), ('Ohio', 40.3, -82.8), ('Atlantik Sued', 33.0, -70.0)):
    # gedrehte Koordinaten
    p, l = math.radians(lat), math.radians(lon)
    v = np.array([math.cos(p) * math.cos(l), math.cos(p) * math.sin(l), math.sin(p)])
    b = math.radians(-LON0); v = np.array([v[0] * math.cos(b) - v[1] * math.sin(b), v[0] * math.sin(b) + v[1] * math.cos(b), v[2]])
    a = math.radians(LAT0); v = np.array([v[0] * math.cos(a) + v[2] * math.sin(a), v[1], -v[0] * math.sin(a) + v[2] * math.cos(a)])
    kd, col = kind(lat, lon)
    tests.append({'name': nm, 'dx': round(float(v[1]), 4), 'dy': round(float(-v[2]), 4), 'kind': kd, 'rgb': col})
# Drehrichtung: Punkte auf dem 'Aequator' der gedrehten Kugel (durch New York) 60 Grad oestlich / westlich
spin = []
for lonp in (60.0, -60.0):
    la, lo = rot_back(np.array([0.0]), np.array([lonp])); kd, col = kind(float(la[0]), float(lo[0]))
    spin.append({'lonp': lonp, 'lat': round(float(la[0]), 2), 'lon': round(float(lo[0]), 2), 'kind': kd, 'rgb': col})
print('Drehrichtung:', spin)
G = {'tex': 'tex/globus_ny.jpg', 'tex_spiegel': 'tex/globus_ny_spiegel.jpg', 'spin': spin, 'tw': TW, 'th': TH, 'radius': round(RT, 2), 'plate': 'tex/satellit_ny.jpg', 'pw': PW, 'ph': PH,
     'pcx': round(PCX, 2), 'pcy': round(PCY, 2), 'r0': R0, 'r1': R1, 'fcy': FCY, 'tests': tests,
     'quelle': 'NASA Blue Marble Next Generation (Dezember 2004), NASA Earth Observatory, gemeinfrei'}
json.dump(G, open(os.path.join(ROOT, 'data', 'globus.json'), 'w'), indent=1)
print('Testpunkte:', tests)
