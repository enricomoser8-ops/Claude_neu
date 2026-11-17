# Quellbilder fuer den Roosevelt-Short (17.11.2026) holen und vorbereiten (alle gemeinfrei bzw. "No known restrictions", LOC):
# Library of Congress (Bain News Service, Keystone View Co., Detroit Publishing, Fotografen 1912, Zeichnungen Berryman 1902 / W. A. Rogers 1912),
# Chronicling America (Lake County Times und Daily Missoulian, 15.10.1912), Buch "The attempted assassination of ex-President
# Theodore Roosevelt" (Milwaukee 1912, Internet Archive, gemeinfrei): Tafeln Manuskriptseite mit Einschuss und blutiges Hemd.
# Ergebnis: <dl>/src/<name>.jpg (Rand ab, Raster/Korn leicht entfernt, Graustufen). Wikimedia Commons wird nicht gebraucht.
# Aufruf: python3 quellen_roosevelt.py <dl-ordner>   (laedt nur, was noch fehlt; LOC drosselt -> curl mit Pausen, HTTP/1.1)
import os, sys, subprocess, time
from PIL import Image, ImageFilter
Image.MAX_IMAGE_PIXELS = None
DL = sys.argv[1]; RAW = os.path.join(DL, 'raw'); SRC = os.path.join(DL, 'src')
os.makedirs(RAW, exist_ok=True); os.makedirs(SRC, exist_ok=True)
M = 'https://tile.loc.gov/storage-services/master/pnp/'
IIIF = 'https://tile.loc.gov/image-services/iiif/%s/full/pct:100/0/default.jpg'
IA = 'https://archive.org/download/attemptedassas00remerich/page/n%d.jpg'   # Buch 1912 (Remey/Cochems/Bloodgood), Tafeln
# name: (url, drehen, Ausschnitt in Anteilen x0,y0,x1,y1 (nach dem Drehen), Raster weg (Gauss-Radius), Graustufen)
Q = {
 'portrait-rede': (M + 'ppmsca/36600/36659u.tif', 0, (0.0, 0.0, 1.0, 1.0), 0, True),
 'portrait-oval': (M + 'ppmsca/35600/35643u.tif', 0, (0.0, 0.0, 1.0, 1.0), 0, True),
 'teddy':         (M + 'cph/3a30000/3a34000/3a34700/3a34770u.tif', 0, (0.0, 0.0, 1.0, 1.0), 0, True),
 'menge':         (M + 'ggbain/10500/10567u.tif', 0, (0.0, 0.0, 1.0, 1.0), 0, True),
 'auto':          (M + 'ggbain/10800/10870u.tif', 0, (0.0, 0.0, 1.0, 1.0), 0, True),
 'yonkers':       (M + 'ppmsca/36600/36634u.tif', 0, (0.0, 0.0, 1.0, 1.0), 0, True),
 'sitzend':       (M + 'ppmsca/35600/35673u.tif', 0, (0.0, 0.0, 1.0, 1.0), 0, True),
 'halle':         (M + 'ds/02700/02708u.tif', 0, (0.0, 0.0, 1.0, 1.0), 0, False),
 'buehne':        (M + 'ppmsca/36600/36645u.tif', 0, (0.0, 0.0, 1.0, 1.0), 0, True),
 'martin':        (M + 'ggbain/10800/10879u.tif', 0, (0.0, 0.0, 1.0, 1.0), 0, True),
 'grit':          (M + 'cai/2a14000/2a14400/2a14471u.tif', 0, (0.0, 0.0, 1.0, 1.0), 0, True),
 'xray':          (M + 'ggbain/10800/10871u.tif', 0, (0.0, 0.0, 1.0, 1.0), 0, True),
 'profil':        (M + 'ppmsca/36600/36611u.tif', 0, (0.0, 0.0, 1.0, 1.0), 0, True),
 'konvent':       (M + 'ggbain/11200/11285u.tif', 0, (0.0, 0.0, 1.0, 1.0), 0, True),
 'manuskript':    (IA % 33, 0, (0.0, 0.0, 1.0, 1.0), 1.4, True),
 'hemd':          (IA % 27, 0, (0.0, 0.0, 1.0, 1.0), 1.4, True),
 'zeitung-lct':   (IIIF % 'service:ndnp:in:batch_in_chucktaylor_ver02:data:sn86058242:00271745941:1912101501:0454', 0, (0.0, 0.0, 1.0, 1.0), 0, True),
 'zeitung-mis':   (IIIF % 'service:ndnp:mthi:batch_mthi_indianpaintbrush_ver01:data:sn83025316:00212476754:1912101501:0527', 0, (0.0, 0.0, 1.0, 1.0), 0, True),
}
BOX = {   # Rand/Karton/Beschriftung weg (nach dem Ansehen gesetzt)
 'portrait-rede': (0.06, 0.05, 0.94, 0.93), 'portrait-oval': (0.27, 0.16, 0.73, 0.75), 'menge': (0.025, 0.04, 0.90, 0.94),
 'auto': (0.035, 0.10, 0.975, 0.965), 'yonkers': (0.04, 0.13, 0.95, 0.93), 'sitzend': (0.05, 0.03, 0.95, 0.86), 'halle': (0.02, 0.12, 0.98, 0.82),
 'buehne': (0.03, 0.06, 0.97, 0.95), 'martin': (0.05, 0.10, 0.89, 0.80), 'grit': (0.04, 0.03, 0.96, 0.92), 'xray': (0.02, 0.04, 0.955, 0.93),
 'profil': (0.04, 0.15, 0.95, 0.93), 'manuskript': (0.135, 0.195, 0.925, 0.775), 'hemd': (0.135, 0.48, 0.925, 0.83), 'konvent': (0.035, 0.045, 0.945, 0.93),
}
if __name__ == '__main__':
    for name, (url, rot, box, blur, grau) in Q.items():
        box = BOX.get(name, box)
        out = os.path.join(SRC, name + '.jpg')
        if os.path.exists(out): continue
        raw = os.path.join(RAW, name + ('.tif' if url.endswith('.tif') else '.jpg'))
        if not os.path.exists(raw):
            for i in range(6):
                r = subprocess.run(['curl', '--http1.1', '-sS', '-f', '-L', '--max-time', '900', '-o', raw + '.part', url])
                if r.returncode == 0: os.rename(raw + '.part', raw); break
                time.sleep(15 + 15 * i)
            time.sleep(4)
        im = Image.open(raw)
        if im.mode in ('I;16', 'I;16B', 'I'): im = im.point(lambda v: v / 256).convert('L')
        im = im.convert('L' if grau else 'RGB')
        if rot: im = im.rotate(rot, expand=True)
        W, H = im.size
        im = im.crop((int(box[0] * W), int(box[1] * H), int(box[2] * W), int(box[3] * H)))
        if blur: im = im.filter(ImageFilter.GaussianBlur(blur))
        im.save(out, quality=94)
        print(name, im.size, flush=True)
