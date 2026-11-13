# Archivbilder + KI-Bilder fuer den Freiheitsstatue-Short aufbereiten -> ../archiv/*.jpg|png + ../archiv/credits.json
# Downloads (LOC, alle "No known restrictions" bzw. gemeinfrei) liegen in <dl>, KI-Bilder in ../../ki-bilder/.
# Aufruf: python3 archiv_freiheit.py <dl-ordner>
#   dl: assem.tif (LOC 2020634761, cph 3a53314), frame.tif (LOC 2010649598), eiffel.tif (LOC 2014712901), tower.tif (LOC 92519630),
#       big_highsm_13900_13921.jpg (LOC 2011632115, 50 %), np1_50.jpg (Chronicling America, The Rising Son 6.9.1906 S. 7, 50 %),
#       np2_50.jpg (Evening Journal Wilmington 17.10.1906 S. 3, 50 %)
import json, os, sys
import numpy as np
from PIL import Image, ImageOps, ImageFilter
Image.MAX_IMAGE_PIXELS = None
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..'); OUT = os.path.join(ROOT, 'archiv')
DL = sys.argv[1]; KI = os.path.join(ROOT, '..', 'ki-bilder')
def crop(src, box, maxlong, out, gray=False, q=90, autocontrast=0):
    im = Image.open(os.path.join(DL, src)); W, H = im.size
    im = im.convert('L' if gray else 'RGB').crop((int(box[0] * W), int(box[1] * H), int(box[2] * W), int(box[3] * H)))
    if autocontrast: im = ImageOps.autocontrast(im, cutoff=autocontrast)
    s = min(1.0, maxlong / max(im.size)); im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    im.save(os.path.join(OUT, out), quality=q); print(out, im.size); return im.size
crop('assem.tif', (0.09, 0.02, 0.85, 0.97), 2000, 'paris-bau-1883.jpg', True, autocontrast=0.5)
crop('frame.tif', (0.0, 0.03, 0.78, 0.84), 2000, 'eiffel-geruest-1881.jpg')
crop('eiffel.tif', (0.10, 0.07, 0.92, 0.70), 1700, 'eiffel-portraet.jpg', True, autocontrast=0.5)
crop('tower.tif', (0.04, 0.07, 0.955, 0.905), 1700, 'eiffelturm-1889.jpg', True, autocontrast=0.5)
crop('big_highsm_13900_13921.jpg', (0.0, 0.0, 1.0, 1.0), 1900, 'statue-gruen-heute.jpg')
crop('np2_50.jpg', (0.015, 0.008, 0.615, 0.367), 2000, 'zeitung-1906-wilmington.jpg', True, autocontrast=1)   # Schlagzeile + Statue
crop('assem.tif', (0.09, 0.59, 0.56, 0.97), 1600, 'paris-bau-1883-detail.jpg', True, autocontrast=0.5)   # Kopf + Fackelhand am Boden
# ---------- KI-Bilder: Freisteller (rembg isnet-general-use) bzw. Vollbild ----------
from rembg import remove, new_session
ses = new_session('isnet-general-use')
from scipy import ndimage
def farbkey(im):
    # Statue auf fast einfarbigem Hellgrund: rembg macht das Gewand halbtransparent -> Farbabstand zum Randton als Alpha
    a = np.asarray(im).astype(np.float32); bd = np.concatenate([a[:8].reshape(-1, 3), a[:, :8].reshape(-1, 3), a[:, -8:].reshape(-1, 3)])
    bg = np.median(bd, 0); d = np.sqrt(((a - bg) ** 2).sum(-1))
    al = np.clip((d - 14) / 22, 0, 1); lab, n = ndimage.label(al > 0.5)
    if n > 1:
        sz = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1)); keep = np.isin(lab, 1 + np.where(sz > 0.002 * lab.size)[0])
        al = al * ndimage.binary_dilation(keep, iterations=3)
    m = al > 0.5; holes, nh = ndimage.label(ndimage.binary_fill_holes(m) & ~m)   # Glanzlichter im Kupfer (fast Hintergrundfarbe) schliessen
    if nh:
        hs = ndimage.sum(np.ones_like(holes), holes, range(1, nh + 1)); hd = ndimage.mean(d, holes, range(1, nh + 1))
        small = np.isin(holes, 1 + np.where((hs < 2500) & (hd > 6))[0])   # echte Luecken (= Hintergrundton) bleiben frei
        al = np.maximum(al, ndimage.binary_dilation(small, iterations=2).astype(np.float32))
    al = ndimage.gaussian_filter(al, 0.6)
    return Image.fromarray(np.dstack([a, al * 255]).clip(0, 255).astype('uint8'), 'RGBA')
for n in ('ki-kupfermuenze', 'ki-farbeimer', 'ki-statue-kupfer'):
    im = Image.open(os.path.join(KI, n + '.png')).convert('RGB'); o = farbkey(im) if n == 'ki-statue-kupfer' else remove(im, session=ses)
    a = np.asarray(o.getchannel('A')); bb = Image.fromarray(((a > 40) * 255).astype('uint8')).getbbox()
    o = o.crop((max(0, bb[0] - 6), max(0, bb[1] - 6), min(o.width, bb[2] + 6), min(o.height, bb[3] + (0 if n == 'ki-statue-kupfer' else 6))))
    o.save(os.path.join(OUT, n + '-frei.png')); print(n + '-frei.png', o.size)
Image.open(os.path.join(KI, 'ki-patina-makro.png')).convert('RGB').save(os.path.join(OUT, 'ki-patina-makro.jpg'), quality=92)
LOC = 'Library of Congress, Prints and Photographs Division'
C = {
 'paris-bau-1883': {'datei': 'paris-bau-1883.jpg', 'titel': 'Assemblage of the Statue of Liberty in Paris (bottom half under scaffolding)', 'autor': 'Albert Fernique (1883)',
   'quelle': 'https://www.loc.gov/item/2020634761/', 'lizenz': 'gemeinfrei (No known restrictions, LOC)', 'kurz': 'Foto: A. Fernique 1883, LOC'},
 'paris-bau-1883-detail': {'datei': 'paris-bau-1883-detail.jpg', 'titel': 'Assemblage of the Statue of Liberty in Paris (Ausschnitt: Kopf und Fackelhand)', 'autor': 'Albert Fernique (1883)',
   'quelle': 'https://www.loc.gov/item/2020634761/', 'lizenz': 'gemeinfrei (No known restrictions, LOC)', 'kurz': 'Foto: A. Fernique 1883, LOC'},
 'eiffel-geruest-1881': {'datei': 'eiffel-geruest-1881.jpg', 'titel': 'Statue de la Liberte - Pile interieure (Framework. Elevations)', 'autor': 'Gustave Eiffel (Buero Eiffel), 1881',
   'quelle': 'https://www.loc.gov/item/2010649598/', 'lizenz': 'gemeinfrei (LOC)', 'kurz': 'Plan: G. Eiffel 1881, LOC'},
 'eiffel-portraet': {'datei': 'eiffel-portraet.jpg', 'titel': 'A. Gustave Eiffel', 'autor': 'Bain News Service (vor 1921)',
   'quelle': 'https://www.loc.gov/item/2014712901/', 'lizenz': 'gemeinfrei (No known restrictions, Bain Collection, LOC)', 'kurz': 'Foto: Bain News Service, LOC'},
 'eiffelturm-1889': {'datei': 'eiffelturm-1889.jpg', 'titel': 'Eiffel Tower, looking toward Trocadero Palace, Paris Exposition, 1889', 'autor': 'unbekannt (1889)',
   'quelle': 'https://www.loc.gov/item/92519630/', 'lizenz': 'gemeinfrei (LOC)', 'kurz': 'Foto 1889, LOC'},
 'statue-gruen-heute': {'datei': 'statue-gruen-heute.jpg', 'titel': 'Statue of Liberty, New York', 'autor': 'Carol M. Highsmith (1980)',
   'quelle': 'https://www.loc.gov/item/2011632115/', 'lizenz': 'gemeinfrei (Carol M. Highsmith Archive, der Oeffentlichkeit gewidmet, LOC)', 'kurz': 'Foto: Carol M. Highsmith, LOC'},
 'zeitung-1906-wilmington': {'datei': 'zeitung-1906-wilmington.jpg', 'titel': "Evening Journal (Wilmington, Del.), 17. Okt. 1906, S. 3: \"America's Rusted Goddess\"", 'autor': 'Evening Journal',
   'quelle': 'https://www.loc.gov/resource/sn85042354/1906-10-17/ed-1/?sp=3', 'lizenz': 'gemeinfrei (US-Zeitung 1906, Chronicling America, LOC)', 'kurz': 'Evening Journal 1906, LOC'},
 'ki-kupfermuenze': {'datei': 'ki-kupfermuenze-frei.png', 'titel': 'Kupfermuenze (KI-Bild, Gegenstand)', 'autor': 'KI-Bild (ElevenLabs Bildmodell), erzeugt fuer den Kanal', 'quelle': 'ki-bilder/ki-kupfermuenze.png', 'lizenz': 'eigenes KI-Bild', 'kurz': 'KI-Bild'},
 'ki-farbeimer': {'datei': 'ki-farbeimer-frei.png', 'titel': 'Farbeimer mit Pinsel (KI-Bild, Gegenstand)', 'autor': 'KI-Bild (ElevenLabs Bildmodell)', 'quelle': 'ki-bilder/ki-farbeimer.png', 'lizenz': 'eigenes KI-Bild', 'kurz': 'KI-Bild'},
 'ki-statue-kupfer': {'datei': 'ki-statue-kupfer-frei.png', 'titel': 'Freiheitsstatue in frischem Kupferbraun (KI-Rekonstruktion)', 'autor': 'KI-Bild (ElevenLabs Bildmodell)', 'quelle': 'ki-bilder/ki-statue-kupfer.png', 'lizenz': 'eigenes KI-Bild, im Video als "Rekonstruktion" beschriftet', 'kurz': 'KI-Rekonstruktion'},
 'ki-patina-makro': {'datei': 'ki-patina-makro.jpg', 'titel': 'Gruene Patina auf Kupfer, Makro (KI-Bild)', 'autor': 'KI-Bild (ElevenLabs Bildmodell)', 'quelle': 'ki-bilder/ki-patina-makro.png', 'lizenz': 'eigenes KI-Bild', 'kurz': 'KI-Bild'},
 'karte': {'datei': '(Formebenen)', 'titel': 'Karten New York / Atlantik', 'autor': 'Natural Earth 1:10m/1:50m (world-atlas@2.0.2), US Census Cartographic Boundary 1:500k + TIGER/Line 2023 AREAWATER',
   'quelle': 'https://www.naturalearthdata.com/ ; https://www.census.gov/geographies/mapping-files.html', 'lizenz': 'gemeinfrei', 'kurz': 'Karte: Natural Earth, US Census'},
 'globus': {'datei': 'tex/globus_ny.jpg, tex/satellit_ny.jpg', 'titel': 'Blue Marble Next Generation, Dezember 2004 (topo + bathy)', 'autor': 'NASA Earth Observatory (Reto Stoeckli)',
   'quelle': 'https://visibleearth.nasa.gov/images/73909/december-blue-marble-next-generation-w-topography-and-bathymetry', 'lizenz': 'gemeinfrei (NASA)', 'kurz': 'Globus: NASA Blue Marble'},
}
json.dump(C, open(os.path.join(OUT, 'credits.json'), 'w'), ensure_ascii=False, indent=1)
print('credits.json:', len(C), 'Eintraege')
