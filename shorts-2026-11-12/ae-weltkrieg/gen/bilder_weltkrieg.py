# Archivbilder vorbereiten: zuschneiden (Wasserzeichen/Karton weg), auf max. 1600 px, nach archiv/ + archiv/credits.json + data/bilder.json
# Quelle der Rohdateien: Ordner als Argument (Downloads per curl, User-Agent AllgemeinwissenBot/1.0 (research)).
# Nur gemeinfreie / CC0-Bilder. Fehlt ein Bild (Commons-Ratenlimit), greift eine Ersatzbelegung (siehe unten).
import json, os, sys
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..'); A = os.path.join(ROOT, 'archiv')
SRC = sys.argv[1]
C = {
 'ff-sophie-einsteigen': dict(src='ff-sophie-einsteigen.jpg', crop=None,
    kurz='Foto: 28. Juni 1914, Imperial War Museum (Q 91848) / gemeinfrei',
    url='https://commons.wikimedia.org/wiki/File:Archduke_Franz_Ferdinand_in_Sarajevo,_June_1914_Q91848.jpg', lizenz='Public domain (IWM, Fotograf unbekannt, 1914)'),
 'ff-sophie-treppe': dict(src='ff-sophie-treppe.jpg', crop=(0, 0, 1280, 700),
    kurz='Foto: 28. Juni 1914, Sarajevo / gemeinfrei (CC0)',
    url='https://commons.wikimedia.org/wiki/File:Franz_Ferdinand_%26_Sophie_Leave_Sarajevo_Guildhall.jpg', lizenz='CC0 (Fotograf unbekannt, 1914); LIFE-Schriftzug unten rechts abgeschnitten'),
 'ff-auto-rathaus': dict(src='ff-auto-rathaus.jpg', crop=None,
    kurz='Foto: Walter Tausch, Sarajevo 1914 / gemeinfrei',
    url='https://commons.wikimedia.org/wiki/File:Franz_Ferdinand_%26_Sophie_Leave_Sarajevo_Guildhall_in_a_Car.jpg', lizenz='Public domain (Walter Tausch, 1914)'),
 'lateinerbruecke-keystone': dict(src='stereo.tif', crop=(590, 680, 2915, 2626),
    kurz='Foto: Keystone View Company, um 1923 / Library of Congress',
    url='https://www.loc.gov/pictures/item/2015651859/', lizenz='No known restrictions on publication (LOC, Stereofoto 1914-1918, veroeffentlicht 1923); linkes Halbbild'),
 'graef-stift-hgm': dict(src='graef-stift-hgm.jpg', crop=None,
    kurz='Foto: Pappenheim, Heeresgeschichtliches Museum Wien / gemeinfrei',
    url='https://commons.wikimedia.org/wiki/File:HGM_Sarajevo_Wagen.jpg', lizenz='Public domain (vom Urheber Pappenheim freigegeben, 2009)'),
 'ff-sophie-bahnhof': dict(src='ff-sophie-bahnhof.jpg', crop=None,
    kurz='Foto: 28. Juni 1914, Sarajevo / gemeinfrei (CC0)',
    url='https://commons.wikimedia.org/wiki/File:Franz_Ferdinand_%26_Sophie_at_Sarajevo_Station.jpg', lizenz='CC0 (Fotograf unbekannt, 1914)'),
}
have = {}
for k, v in C.items():
    p = os.path.join(SRC, v['src'])
    try: im = Image.open(p); im.load()
    except Exception: print('fehlt:', k); continue
    im = im.convert('RGB')
    if v['crop']: im = im.crop(v['crop'])
    if im.width > 1600: im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
    im.save(os.path.join(A, k + '.jpg'), quality=92); have[k] = im.size
    print('ok', k, im.size)
cred = {k: {kk: C[k][kk] for kk in ('kurz', 'url', 'lizenz')} for k in have}
json.dump(cred, open(os.path.join(A, 'credits.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
def disp(k, cx, cy, mw, mh, rel):
    w, h = have[k]; s = min(mw / w, mh / h); W, H = w * s, h * s
    return [round(cx - W / 2 + rel[0] * W), round(cy - H / 2 + rel[1] * H)]
# Belegung der Szenen (kein Bild zweimal direkt hintereinander)
wagen = 'graef-stift-hgm' if 'graef-stift-hgm' in have else 'ff-auto-rathaus'
kh = 'ff-auto-rathaus' if wagen != 'ff-auto-rathaus' else ('ff-sophie-bahnhof' if 'ff-sophie-bahnhof' in have else 'ff-sophie-treppe')
tod = 'ff-sophie-bahnhof' if ('ff-sophie-bahnhof' in have and kh != 'ff-sophie-bahnhof') else 'ff-sophie-treppe'
IMG = {'hookKey': 'ff-sophie-einsteigen', 'thronKey': 'ff-sophie-treppe', 'wagenKey': wagen, 'khKey': kh, 'eckeKey': 'lateinerbruecke-keystone', 'todKey': tod,
       'thronY': 800, 'eckeY': 830}
for s in ('hook', 'thron', 'wagen', 'kh', 'ecke', 'tod'): IMG[s] = 'archiv/' + IMG[s + 'Key'] + '.jpg'
IMG['thronFF'] = disp('ff-sophie-treppe', 540, IMG['thronY'], 980, 900, (936 / 1280, 176 / 700))
IMG['eckeXY'] = disp('lateinerbruecke-keystone', 540, IMG['eckeY'], 980, 820, (0.8125, 0.701))
# Callout auf den Wagen (Bildschirm: Mitte x/y, Radien)
if wagen == 'graef-stift-hgm': IMG['wagenC'] = disp(wagen, 540, 800, 980, 760, (0.5, 0.58)) + [400, 230]
else: IMG['wagenC'] = disp(wagen, 540, 800, 980, 760, (0.62, 0.62)) + [330, 220]
json.dump(IMG, open(os.path.join(ROOT, 'data', 'bilder.json'), 'w'), indent=1)
print(json.dumps(IMG, indent=0))
