# Archivbilder aufbereiten (Downloads von Wikimedia Commons mit fetch.py, Lizenzen in archiv/credits.json).
# Freistellen mit rembg (u2net), Mond per Helligkeit, Rosette-Stein: griechischer Teil als "Druck" (invertiert, Kontrast).
# Aufruf: python3 archiv_kleopatra.py <download-ordner mit meta.json>
import json, os, sys
import numpy as np
from PIL import Image, ImageFilter, ImageOps
SRC = sys.argv[1]; OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'archiv')
meta = json.load(open(os.path.join(SRC, 'meta.json'), encoding='utf-8'))
def load(k): return Image.open(os.path.join(SRC, meta[k]['file'])).convert('RGB')
def fit(im, m=1600):
    im = im.copy(); im.thumbnail((m, m), Image.LANCZOS); return im
for k in ('cheops-pyramide', 'apollo11-aldrin', 'alexander-mosaik', 'hieroglyphen', 'kleopatra-buste'):
    fit(load(k)).save(os.path.join(OUT, k + '.jpg'), quality=92)
from rembg import remove, new_session
ses = new_session('u2net')
for k in ('kleopatra-buste', 'ptolemaios-i'):
    o = remove(fit(load(k), 1400), session=ses); o = o.crop(o.getbbox()); o.save(os.path.join(OUT, k + '-frei.png'))
# Mond: Scheibe aus dem schwarzen Grund
m = fit(load('mond'), 1000); a = np.asarray(m.convert('L')).astype(float)
al = np.clip((a - 14) * 12, 0, 255).astype(np.uint8)
al = Image.fromarray(al).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
mm = m.convert('RGBA'); mm.putalpha(al); mm = mm.crop(mm.getbbox()); mm.save(os.path.join(OUT, 'mond-frei.png'))
# Rosette-Stein: griechischer Abschnitt (unteres Drittel), als dunkle Schrift auf hell
r = load('rosetta'); W, H = r.size
g = r.crop((int(W * 0.10), int(H * 0.655), int(W * 0.83), int(H * 0.90))).convert('L')
f = np.asarray(g).astype(float); bl = np.asarray(g.filter(ImageFilter.GaussianBlur(14))).astype(float)
hp = f - bl; hp = np.clip(128 - hp * 6.0, 0, 255)          # helle Ritzung -> dunkle Schrift
img = Image.fromarray(hp.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
img = ImageOps.autocontrast(img, cutoff=1)
img = Image.fromarray(np.clip((np.asarray(img).astype(float) - 60) * 1.6 + 60, 0, 255).astype(np.uint8))
img.convert('RGB').save(os.path.join(OUT, 'griechisch-rosette.jpg'), quality=92)
C = {}
names = {'kleopatra-buste': 'Kleopatra VII., Altes Museum Berlin', 'cheops-pyramide': 'Cheops-Pyramide, Gizeh', 'apollo11-aldrin': 'Buzz Aldrin auf dem Mond (Apollo 11)',
         'mond': 'Vollmond', 'alexander-mosaik': 'Alexander der Große, Alexandermosaik (Pompeji)', 'ptolemaios-i': 'Ptolemaios I., Louvre',
         'rosetta': 'Stein von Rosette (griechischer Teil, bearbeitet)', 'hieroglyphen': 'Hieroglyphen, Medinet Habu'}
short = {'kleopatra-buste': 'Foto: Louis le Grand, gemeinfrei', 'cheops-pyramide': 'Foto: Nina Aldin Thune, CC BY 2.5', 'apollo11-aldrin': 'Foto: NASA / Neil Armstrong, gemeinfrei',
         'mond': 'Foto: Gregory H. Revera, CC BY-SA 3.0', 'alexander-mosaik': 'Alexandermosaik, gemeinfrei', 'ptolemaios-i': 'Foto: Marie-Lan Nguyen, gemeinfrei',
         'rosetta': 'Foto: Hans Hillewaert, CC BY-SA 4.0', 'hieroglyphen': 'Foto: Vyacheslav Argenberg, CC BY 4.0'}
files = {'kleopatra-buste': ['kleopatra-buste.jpg', 'kleopatra-buste-frei.png'], 'cheops-pyramide': ['cheops-pyramide.jpg'], 'apollo11-aldrin': ['apollo11-aldrin.jpg'],
         'mond': ['mond-frei.png'], 'alexander-mosaik': ['alexander-mosaik.jpg'], 'ptolemaios-i': ['ptolemaios-i-frei.png'], 'rosetta': ['griechisch-rosette.jpg'], 'hieroglyphen': ['hieroglyphen.jpg']}
for k, v in meta.items():
    C[k] = {'kurz': short[k], 'was': names[k], 'dateien': files[k], 'commons': v['title'], 'url': v['page'], 'autor': v['autor'], 'lizenz': v['lizenz'], 'quelle': v['credit']}
json.dump(C, open(os.path.join(OUT, 'credits.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('fertig', sorted(os.listdir(OUT)))
