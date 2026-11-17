# Quellbilder fuer den Beethoven-Short holen und vorbereiten (alle gemeinfrei): Library of Congress (Prints & Photographs: Lithografien,
# Chromolithografie, Harper's-Weekly-Stiche, Foto der Buste), Internet Archive (Erstausgabe Schott 1826: Titelblatt Boston Public Library,
# Partitur SMU Bywaters Special Collections). Ergebnis: <dl>/src/<name>.jpg (Rand/Bibliotheksstempel/Bildunterschrift ab).
# Commons-Bilder (Konversationsheft, Druck "Premiere der Neunten", Caroline Unger) laedt NICHT dieses Skript: siehe archiv/commons_liste.json (PC).
# Aufruf: python3 quellen_beethoven.py <dl-ordner>   (laedt nur, was noch fehlt)
import os, sys, subprocess, time
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
DL = sys.argv[1]; RAW = os.path.join(DL, 'raw'); SRC = os.path.join(DL, 'src')
os.makedirs(RAW, exist_ok=True); os.makedirs(SRC, exist_ok=True)
M = 'https://tile.loc.gov/storage-services/master/pnp/%s.tif'
IA = 'https://archive.org/download/%s/page/n%d.jpg'
# name: (url, Ausschnitt in Anteilen x0,y0,x1,y1 der Rohdatei, Graustufen)
Q = {
 'stieler':  (M % 'pga/11900/11986u', (0.03, 0.03, 0.97, 0.965), False),       # Chromolithografie um 1870 nach Stieler
 'litho':    (M % 'pga/10500/10512u', (0.02, 0.03, 0.97, 0.97), True),          # Lithografie, Paris, Schlesinger (mit Signatur)
 'wien':     (M % 'pga/04200/04256u', (0.20, 0.17, 0.81, 0.80), False),         # Wien von Jakob Alt, nur die Bildflaeche
 'buste':    (M % 'cph/3g00000/3g09000/3g09500/3g09589u', (0.19, 0.09, 0.83, 0.90), True),   # Foto der Buste, ohne Farbkarte/Passepartout
 'titel':    (IA % ('sinfoniemitschlu00beet', 28), (0.02, 0.02, 0.655, 0.98), True),          # Titelblatt 1826, Bibliotheksstempel rechts oben abgeschnitten
 'partitur1': (IA % ('VaultM1001B415Op1251826', 8), (0.02, 0.02, 0.95, 0.97), True),          # erste Partiturseite (S. 1)
 'partitur103': (IA % ('VaultM1001B415Op1251826', 110), (0.02, 0.02, 0.95, 0.97), True),      # S. 103 (Hintergrund Szene takt)
 'partitur113': (IA % ('VaultM1001B415Op1251826', 120), (0.02, 0.02, 0.95, 0.97), True),      # S. 113: "Freude, schoener Goetterfunken"
 'grant':    (M % 'cph/3c20000/3c28000/3c28300/3c28383u', (0.04, 0.105, 0.95, 0.955), True), # Harper's Weekly 1865: Ovation im Saal (Huete/Tuecher)
 'brooklyn': (M % 'cph/3c30000/3c35000/3c35200/3c35277u', (0.09, 0.10, 0.92, 0.89), True),   # Harper's Weekly 1861: Konzertsaal, Dirigent im Graben
}
def bx(name): return Q[name][1]
def frac(name, x, y):   # Anteil der Rohdatei (Blatt) -> Anteil des Ausschnitts (src)
    b = bx(name); return ((x - b[0]) / (b[2] - b[0]), (y - b[1]) / (b[3] - b[1]))
if __name__ == '__main__':
    for name, (url, box, grau) in Q.items():
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
        W, H = im.size
        im = im.crop((int(box[0] * W), int(box[1] * H), int(box[2] * W), int(box[3] * H)))
        im.save(out, quality=94)
        print(name, im.size)
