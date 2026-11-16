# Quellbilder fuer den Jessop-Short holen und vorbereiten (alle gemeinfrei): Library of Congress (Bain, Detroit Publishing,
# American National Red Cross), Chronicling America (Zeitungen 1911/1912/1916), Internet Archive (The Shipbuilder 1911,
# Public Domain Mark; Buch "Sinking of the Titanic" 1912). Ergebnis: <dl>/src/<name>.jpg (gedreht, Rand ab, Raster entfernt).
# Aufruf: python3 quellen_jessop.py <dl-ordner>   (laedt nur, was noch fehlt; LOC drosselt -> curl mit Pausen)
import os, sys, subprocess, time, json
from PIL import Image, ImageFilter
Image.MAX_IMAGE_PIXELS = None
DL = sys.argv[1]; RAW = os.path.join(DL, 'raw'); SRC = os.path.join(DL, 'src')
os.makedirs(RAW, exist_ok=True); os.makedirs(SRC, exist_ok=True)
SB = 'https://archive.org/download/the_shipbuilder_special_numbers_images_201909/page/n%d.jpg'
IIIF = 'https://tile.loc.gov/image-services/iiif/%s/full/pct:100/0/default.jpg'
# name: (url, drehen, Ausschnitt in Anteilen x0,y0,x1,y1 (nach dem Drehen), Raster weg (Gauss-Radius), Graustufen)
Q = {
 'deck':        ('https://archive.org/download/sinkingoftitanic00mowb/page/n56.jpg', 0, (0.088, 0.053, 0.877, 0.838), 1.6, True),
 'stapel':      (SB % 227, -90, (0.097, 0.102, 0.913, 0.898), 1.8, True),
 'saal':        (SB % 266, 0, (0.025, 0.035, 0.975, 0.925), 1.8, True),
 'plate':       (SB % 189, 0, (0.125, 0.085, 0.895, 0.915), 1.8, False),
 'olympic-schlepper': ('https://tile.loc.gov/storage-services/master/pnp/det/4a20000/4a27000/4a27400/4a27498u.tif', 0, (0.045, 0.075, 0.955, 0.925), 0, True),
 'olympic-see': ('https://tile.loc.gov/storage-services/master/pnp/ggbain/30800/30827u.tif', 0, (0.035, 0.12, 0.96, 0.93), 0, True),
 'boote':       ('https://tile.loc.gov/storage-services/master/pnp/ggbain/11200/11212u.tif', 0, (0.085, 0.075, 0.86, 0.92), 0, True),
 'ueberlebende': ('https://tile.loc.gov/storage-services/master/pnp/ggbain/10300/10348u.tif', 0, (0.06, 0.07, 0.955, 0.945), 0, True),
 'postkarte':   ('https://tile.loc.gov/storage-services/master/pnp/ppmsca/19000/19060u.tif', 0, (0.045, 0.03, 0.965, 0.875), 1.2, False),
 'rotkreuz':    ('https://tile.loc.gov/storage-services/master/pnp/anrc/10900/10937u.tif', 0, (0.045, 0.045, 0.955, 0.44), 0, True),
 'schrauben':   ('https://tile.loc.gov/storage-services/master/pnp/cph/3a30000/3a35000/3a35200/3a35267u.tif', 0, (0.0, 0.0, 1.0, 0.975), 0, True),
 'olympic-pier': ('https://tile.loc.gov/storage-services/master/pnp/det/4a20000/4a27000/4a27400/4a27499u.tif', 0, (0.045, 0.06, 0.965, 0.915), 0, True),
 'olympic-hafen': ('https://tile.loc.gov/storage-services/master/pnp/det/4a10000/4a16000/4a16100/4a16147u.tif', 0, (0.06, 0.13, 0.945, 0.86), 0, True),
 'zeitung-1911': (IIIF % 'service:ndnp:nn:batch_nn_hardin_ver01:data:sn83030193:00211100138:1911092001:0784', 0, (0.0, 0.0, 1.0, 1.0), 0, True),
 'zeitung-1912': (IIIF % 'service:ndnp:njr:batch_njr_carmela_ver01:data:sn91064011:00332896192:1912041501:0624', 0, (0.0, 0.0, 1.0, 1.0), 0, True),
 'zeitung-1916': (IIIF % 'service:ndnp:nn:batch_nn_keddy_ver01:data:sn83030193:00280766112:1916112201:0824', 0, (0.0, 0.0, 1.0, 1.0), 0, True),
}
if __name__ == '__main__':
    for name, (url, rot, box, blur, grau) in Q.items():
        out = os.path.join(SRC, name + '.jpg')
        if os.path.exists(out): continue
        raw = os.path.join(RAW, name + ('.tif' if url.endswith('.tif') else '.jpg'))
        if not os.path.exists(raw):
            for i in range(5):
                r = subprocess.run(['curl', '-sS', '-f', '-L', '--max-time', '600', '-o', raw, url])
                if r.returncode == 0: break
                time.sleep(10 + 10 * i)
        im = Image.open(raw)
        if im.mode in ('I;16', 'I;16B', 'I'): im = im.point(lambda v: v / 256).convert('L')
        im = im.convert('L' if grau else 'RGB')
        if rot: im = im.rotate(rot, expand=True)
        W, H = im.size
        im = im.crop((int(box[0] * W), int(box[1] * H), int(box[2] * W), int(box[3] * H)))
        if blur: im = im.filter(ImageFilter.GaussianBlur(blur))
        im.save(out, quality=94)
        print(name, im.size)
