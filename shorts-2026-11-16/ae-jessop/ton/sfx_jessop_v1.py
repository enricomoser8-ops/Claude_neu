# Szenen-Geraeusche fuer den Titanic-Stewardess-Short (16.11.2026): 20 Ereignisse, jedes auf einem sichtbaren Ereignis,
# frame-genau auf die Keyframes der JSX (gleiche Zeiten: ../data/timeline.json + dieselben Versaetze wie in jsx/scenes_jessop.jsx).
# Quellen: earshot-Bank (ton/earshot/*.wav, Befehle unten, alle --peak -3) und ennos eigener Klick (click_real.wav). Keine Synthese.
#   earshot sfx render cut_hit/sub -o auftakt.wav            (Callout auf die Schornsteine, Start)
#   earshot sfx render cut_hit/punch -o punch.wav            (Punch auf "sank")
#   earshot sfx render swipe/paper -o kreis.wav --dur 0.45   (Kreis um das Schild OLYMPIC)
#   earshot sfx render knock/wood -o zaehler.wav             (Zaehler landet auf 3x)
#   earshot sfx render reverse_swell/breath -o fokus.wav     (Fokus ueber den Speisesaal)
#   earshot sfx render hover_tick/detent -o tick.wav         (Odometer 1911, 4 Ticks)
#   earshot sfx render pro_impact/deep -o aufprall.wav       (Hawke kracht ins Heck, Ringe)
#   earshot sfx render swipe/paper -o zeitung.wav --dur 0.6 --seed 7     (Zeitung 1911 rutscht ein)
#   earshot sfx render whoosh_fast/whip -o schwenk.wav --dur 0.8 --apex 0.38   (Reissschwenk zu ICEBERG)
#   earshot sfx render swipe/cloth -o marker.wav --dur 0.35  (Textmarker ICEBERG)
#   earshot sfx render pro_zip/up -o lupe.wav                (Lupe waechst auf)
#   earshot sfx render pro_shimmer/m3 -o kreuz.wav           (rotes Kreuz wird rot)
#   earshot sfx render impact/deep -o mine.wav --dur 2.2     (Brand-Uebergang + Mine)
#   earshot sfx render pro_whoosh_big/windy -o wirbel.wav    (Wirbel-Pfeile um die Schraubennabe)
#   earshot sfx render drip/bloop -o wasser.wav --pitch C4   (Ringe im Wasser)
#   earshot sfx render pro_zip/arc -o mass.wav               (Messlinie zeichnet sich)
#   earshot sfx render cut_hit/kick -o frage.wav             (rotes ? knallt)
#   earshot sfx render logo_sting/soft_bloom -o logo.wav     (grosses Logo)
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from dsp import SR, ns, pan, place, hp, write_wav, read_wav
TL = json.load(open(os.path.join(HERE, '..', 'data', 'timeline.json')))
FPS = TL['fps']; f = lambda n: n / FPS
SC = {s['id']: s for s in TL['scenes']}
ST = lambda sid: SC[sid]['start']
K = lambda sid, key: SC[sid]['k'][key]          # timeline.json: k absolut
DUR = TL['end']; N = ns(DUR + 1)
out = np.zeros((2, N)); EV = []
ENNO = '/mnt/project-files/podcast/shorts-wissen/sfx/'
def load(path):
    x, sr = read_wav(path)
    x = np.vstack([x[0], x[0]]) if x.shape[0] == 1 else x
    if sr != SR:
        from scipy.signal import resample_poly
        from math import gcd
        g = gcd(SR, sr); x = resample_poly(x, SR // g, sr // g, axis=1)
    return x
es = lambda name: load(os.path.join(HERE, 'earshot', name + '.wav'))
def put(x, t, g=1.0, p=0.0, what='', at=None):
    place(out, pan(x, p) if x.ndim == 1 else x, max(0, t), g); EV.append((round(at if at is not None else t, 3), round((at if at is not None else t) * FPS), what))
CLICK = load(ENNO + 'click_real.wav')

# --- Ereignisse (at = sichtbares Ereignis; t = Einsatz der Datei, bei Swells/Impacts um die Spitze vorgezogen) ---
put(es('auftakt'), ST('hook') + 0.04, 0.8, 0, 'Callout Schornsteine + 1912')
put(es('punch'), K('hook', 'sank') - 0.058, 1.0, 0, 'Punch auf "sank"', K('hook', 'sank'))
put(es('kreis'), K('einzig', 'einziges') - 0.08, 0.5, 0.15, 'Kreis um das Schild OLYMPIC')
put(es('zaehler'), K('einzig', 'unglueck') + 0.16, 0.6, 0.2, 'Zaehler landet auf 3x')
t = K('gaeste', 'stewardess') - 0.04 + 1.0
put(es('fokus'), t - 0.733, 0.45, 0, 'Fokus wandert ueber die Tische (Spitze, wenn er steht)', t)
for i in range(4): put(es('tick'), K('olympic', 'jahr') + i * 0.14, 0.45, 0.2, 'Odometer 1911' if i == 0 else None)
put(es('aufprall'), K('hawke', 'kracht') - 0.213, 0.75, -0.25, 'Hawke kracht ins Heck + Ringe', K('hawke', 'kracht'))
put(es('zeitung'), K('hawke', 'kriegsschiff') + 0.10, 0.6, 0.1, 'Zeitung 1911 rutscht ein')
t = K('titanic', 'eisberg') - 0.14
put(es('schwenk'), t - 0.38, 0.6, 0, 'Reissschwenk zu ICEBERG', t)
put(es('marker'), K('titanic', 'eisberg') + 0.16, 0.5, 0.15, 'Textmarker ICEBERG')
put(es('lupe'), K('baby', 'baby') - 0.04, 0.5, 0.2, 'Lupe waechst auf')
put(CLICK, K('folge', 'schlauer') + 0.30, 0.7, 0.1, 'Folgen-Klick (Mitte)')
t = K('britannic', 'schwester') - 0.10
put(es('kreuz'), t - 0.11, 0.45, 0.1, 'rotes Kreuz wird rot', t)
put(es('mine'), ST('mine') + 0.16, 0.8, 0, 'Brand-Uebergang, Mine (Boom auf "Mine")', ST('mine') + 0.24)
put(es('wirbel'), K('schrauben', 'drehenden') - 0.14, 0.55, 0, 'Wirbel-Pfeile um die Nabe', K('schrauben', 'drehenden') - 0.04)
put(es('wasser'), K('springt', 'wasser'), 0.6, -0.1, 'Ringe im Wasser')
put(es('mass'), K('twist', 'danach') - 0.04, 0.5, -0.1, 'Messlinie zeichnet sich')
put(es('frage'), K('frage', 'getraut') - 0.04, 0.55, 0.2, 'rotes ? knallt')
put(es('logo'), ST('outro') + 0.02, 0.55, 0, 'grosses Logo', ST('outro') + 0.12)
put(CLICK, K('outro', 'folgen') + f(3), 0.7, 0.1, 'Folgen-Klick')

EV = [e for e in EV if e[2]]
out = hp(out, 35)[:, :ns(DUR)]
out /= np.max(np.abs(out)) / 0.9
write_wav(os.path.join(HERE, 'sfx.wav'), out)
json.dump({'fps': FPS, 'events': [{'f': fr, 'kind': 'sfx', 'id': w, 't': t} for t, fr, w in EV]}, open(os.path.join(HERE, 'sfx_events.json'), 'w'), indent=0, ensure_ascii=False)
ts = sorted(t for t, _, _ in EV); gaps = [round(b - a, 3) for a, b in zip(ts, ts[1:])]
print('sfx.wav', len(EV), 'Ereignisse, kleinster Abstand %.3f s' % min(gaps))
