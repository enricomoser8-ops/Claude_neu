# Runde 3 (12.11., Review 2): Nacharbeit an den Archivbildern NACH bilder_weltkrieg.py
#  - ff-auto-rathaus-wagen.jpg: Ausschnitt des Tausch-Fotos ohne den bewegungsunscharfen Mann links und ohne das dunkle Rad unten
#  - princip-1914.jpg: Portraet des 19-jaehrigen Attentaeters (Haftfoto 2. Juli 1914, gemeinfrei) statt der Stadtansicht 1923
# Aufruf: python3 ausschnitte_weltkrieg.py <download-ordner mit princip.jpg>
#   princip.jpg = https://commons.wikimedia.org/wiki/Special:FilePath/Gavrilo_Princip,_cell,_headshot,_bw_(cropped).jpg?width=1600
#   (curl -A "AllgemeinwissenBot/1.0 (research)"; Commons liefert das Original 969x1211)
import json, os, sys
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..'); A = os.path.join(ROOT, 'archiv')
SRC = sys.argv[1] if len(sys.argv) > 1 else None
im = Image.open(os.path.join(A, 'ff-auto-rathaus.jpg')).convert('RGB')
im.crop((330, 40, 1506, 700)).save(os.path.join(A, 'ff-auto-rathaus-wagen.jpg'), quality=92)
if SRC:
    p = Image.open(os.path.join(SRC, 'princip.jpg')).convert('L')
    if p.width > 1600: p = p.resize((1600, round(p.height * 1600 / p.width)), Image.LANCZOS)
    p.save(os.path.join(A, 'princip-1914.jpg'), quality=92)
cred = json.load(open(os.path.join(A, 'credits.json'), encoding='utf-8'))
cred['ff-auto-rathaus-wagen'] = dict(cred['ff-auto-rathaus'], lizenz=cred['ff-auto-rathaus']['lizenz'] + '; Ausschnitt (links und unten beschnitten)')
cred['princip-1914'] = {'kurz': 'Foto: Haftfoto 2. Juli 1914, unbekannt / gemeinfrei',
    'url': 'https://commons.wikimedia.org/wiki/File:Gavrilo_Princip,_cell,_headshot,_bw_(cropped).jpg',
    'lizenz': 'Public domain (unbekannter Fotograf, 2. Juli 1914; Quelle AP/NPR laut Commons)'}
if 'lateinerbruecke-keystone' in cred and 'Runde 3' not in cred['lateinerbruecke-keystone']['lizenz']: cred['lateinerbruecke-keystone']['lizenz'] += ' (seit Runde 3 nicht mehr im Video)'
json.dump(cred, open(os.path.join(A, 'credits.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
B = json.load(open(os.path.join(ROOT, 'data', 'bilder.json')))
B.update({'wagenKey': 'ff-auto-rathaus-wagen', 'wagen': 'archiv/ff-auto-rathaus-wagen.jpg', 'wagenRel': [0.6, 0.47, 0.38, 0.4],
          'eckeKey': 'princip-1914', 'ecke': 'archiv/princip-1914.jpg', 'eckeFace': [0.47, 0.42]})
for k in ('wagenC', 'eckeXY'): B.pop(k, None)
json.dump(B, open(os.path.join(ROOT, 'data', 'bilder.json'), 'w'), indent=1)
print('ok', json.dumps(B))
