# Szenen-Geraeusche fuer den Freiheitsstatue-Short (13.11.2026): 20 Ereignisse, jedes auf einem sichtbaren Ereignis,
# frame-genau auf die Keyframes der JSX (gleiche Zeiten: ../data/timeline.json + dieselben Versaetze wie in jsx/scenes_freiheit.jsx).
# Quellen: earshot-Renderings (ton/earshot/*.wav, Befehle unten), ennos eigene Sounds (click_real, pop_real), eigene Synthese (sfx_gen/dsp).
#   earshot sfx render whoosh_big/swell -o dive.wav --dur 2.3 --apex 1.55 --peak -3     (Globus -> Hafen)
#   earshot sfx render swipe/paper -o karte.wav --dur 0.45 --peak -3                    (Satellit -> Papierkarte)
#   earshot sfx render pro_pop_in/knock -o nadel.wav --peak -3                          (Nadel steckt)
#   earshot sfx render pro_shimmer/m2 -o patina.wav --dur 1.7 --peak -3                 (Statue wird gruen)
#   earshot sfx render drip/drop -o regen.wav --peak -3                                 ("Regen")
#   earshot sfx render logo_sting/soft_bloom -o logo.wav --peak -3                      (grosses Logo)
#   earshot sfx render whoosh_fast/sleeve -o schwenk.wav --dur 0.7 --apex 0.32 --peak -3 (Kartenschwenk Atlantik)
#   earshot sfx render swipe/paper -o zeitung.wav --dur 0.6 --seed 7 --peak -3          (Zeitung 1906)
#   earshot sfx render pro_pop_in/deep -o eimer.wav --peak -3                           (Farbeimer)
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from dsp import SR, ns, tt, rng, pan, place, fades, lp, hp, bp, modal, phase, colored, write_wav, read_wav, smooth_noise
TL = json.load(open(os.path.join(HERE, '..', 'data', 'timeline.json')))
FPS = TL['fps']; f = lambda n: n / FPS
SC = {s['id']: s for s in TL['scenes']}
ST = lambda sid: SC[sid]['start']
K = lambda sid, key: ST(sid) + SC[sid]['k'][key]
DUR = TL['end']; N = ns(DUR + 1); R = rng(1906)
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
own = lambda name: load(ENNO + name + '.wav')
es = lambda name: load(os.path.join(HERE, 'earshot', name + '.wav'))
def put(x, t, g=1.0, p=0.0, what=''):
    place(out, pan(x, p) if x.ndim == 1 else x, max(0, t), g); EV.append((round(t, 3), round(t * FPS), what))
def thump(r, f0=90, dur=0.4):
    t = tt(dur)
    y = np.exp(-t / 0.05) * np.sin(phase(f0 * (1 + 0.5 * np.exp(-t / 0.01)))) + bp(r.standard_normal(len(t)), 400, 3000, 1) * np.exp(-t / 0.02) * 0.5
    return fades(y, 0.0, 0.05)
def paper_slide(r, dur=0.7):
    n = ns(dur); t = np.arange(n) / SR
    y = bp(colored(n, r, 0.3), 900, 7000, 1) * (np.clip(t / 0.08, 0, 1) * np.exp(-np.maximum(0, t - 0.25) / 0.18))
    cr = bp(r.standard_normal(n), 2000, 9000, 1) * (smooth_noise(n, r, 40) > 0.55) * 0.3 * np.exp(-t / 0.3)
    return fades(y * 0.6 + cr, 0.005, 0.05)
def drop_land(r, dur):           # Abzug faellt ein: Papier rutscht, kleiner Aufsetzer beim Landen (nach dur)
    y = paper_slide(r, dur + 0.25) * 0.8; th = thump(r, 120, 0.25) * 0.45; i = ns(dur)
    y[i:i + len(th)] += th[:len(y) - i]; return y
def stamp(r):
    y = thump(r, 70, 0.5) * 1.2; p = paper_slide(r, 0.25) * 0.5; y[:len(p)] += p[:len(y)]; return y
def scribble(r, dur=0.5, strokes=5):
    n = ns(dur); y = np.zeros(n); t = np.arange(n) / SR
    for k in range(strokes):
        a, b = k * dur / strokes, (k + 0.85) * dur / strokes
        m = (t >= a) & (t < b)
        y[m] += bp(r.standard_normal(m.sum()), 1500, 7000, 1) * np.sin(np.pi * (t[m] - a) / (b - a)) ** 0.7
    return fades(y * 0.6, 0.003, 0.03)
def coin(r, f0=3150):            # Kupfermuenze: kurzer metallischer Klang
    y = modal(0.7, [(f0, 1.0, 0.22), (f0 * 2.76, 0.45, 0.09), (f0 * 5.4, 0.2, 0.04), (f0 * 0.5, 0.15, 0.12)], r)
    t = tt(0.7); y += hp(r.standard_normal(len(t)), 3000) * np.exp(-t / 0.0012) * 0.4
    return fades(y, 0.0, 0.1)
def odo(r, dur, n=10):
    y = np.zeros(ns(dur))
    for k in range(n):
        c = modal(0.05, [(r.uniform(2400, 3000), 0.5, 0.006), (r.uniform(700, 900), 0.4, 0.01)], r); i = ns(dur * k / n)
        y[i:i + len(c)] += c[:max(0, len(y) - i)] * (1 - 0.6 * k / n)
    return y
POP, CLICK = own('pop_real'), own('click_real')

# --- Ereignisse (Zeit = sichtbares Ereignis wie in der JSX; Whooshes mit Spitze auf dem schnellsten Moment) ---
put(es('dive'), 0.0, 0.85, 0, 'Globus dreht + Sturzflug (Spitze 1,55 s)')
put(es('karte'), 1.10, 0.55, -0.1, 'Satellitenbild wird Papierkarte')
put(es('nadel'), K('hook', 'statue') + f(3), 0.6, -0.2, 'Nadel Liberty Island')
put(drop_land(R, 0.36), K('hook', 'statue') + 0.04, 0.5, 0.2, 'Foto heute faellt ein')
put(thump(R, 95, 0.35), K('hook', 'gruen') - 0.04, 0.55, 0.25, 'rotes ? knallt')
put(odo(R, f(14), 9), K('braun', 'anfang'), 0.45, 0.15, 'Jahreszahl 1886 rollt')
put(coin(R), K('braun', 'muenze') - 0.06 + f(5), 0.4, 0.2, 'Kupfermuenze')
put(es('schwenk'), K('geschenk', 'geschenk') - 0.08 + 0.31 - 0.32, 0.6, 0, 'Kartenschwenk ueber den Atlantik')
put(pan(POP[0] if POP.ndim > 1 else POP, 0.2), K('haut', 'zwei') - 0.26, 0.4, 0, 'Muenze 1 ploppt')
put(drop_land(R, 0.36), K('eiffel', 'geruest') - 0.04, 0.5, -0.15, 'Foto Eisengeruest faellt ein')
put(CLICK, K('folge', 'schlauer') + 0.30, 0.7, 0.1, 'Folgen-Klick (Mitte)')
put(es('regen'), K('regen', 'regen') - 0.08, 0.55, 0.2, '"Regen" knallt')
put(es('patina'), ST('patina') + 0.0, 0.4, 0, 'Statue wird gruen (0,06-1,70 s)')
put(es('zeitung'), K('rost', 'statue') - 0.20, 0.7, -0.1, 'Zeitung 1906 ploppt rein')
put(stamp(R), K('rost', 'rost') - 0.06, 0.55, 0.15, 'Stempel ROST?')
put(es('eimer'), K('kongress', 'streichen') - 0.10, 0.6, 0.2, 'Farbeimer ploppt')
put(stamp(R), ST('protest') + 0.06, 0.5, -0.2, 'Stempel NEIN!')
put(stamp(R), K('protest', 'protest') - 0.04, 0.55, 0.0, 'Stempel NICHT ANSTREICHEN!')
put(scribble(R, f(7), 2), K('bleibt', 'nichts') - 0.02, 0.5, 0, 'rotes Kreuz ueber dem Eimer')
put(es('logo'), K('outro', 'allgemeinwissen') - f(4) - 0.14, 0.55, 0, 'grosses Logo')
put(CLICK, K('outro', 'folgen') + f(3), 0.7, 0.1, 'Folgen-Klick')

out = hp(out, 35)[:, :ns(DUR)]
out /= np.max(np.abs(out)) / 0.9
write_wav(os.path.join(HERE, 'sfx.wav'), out)
json.dump([{'t': t, 'f': fr, 'was': w} for t, fr, w in EV], open(os.path.join(HERE, 'sfx_events.json'), 'w'), indent=0, ensure_ascii=False)
ts = sorted(t for t, _, _ in EV); gaps = [round(b - a, 3) for a, b in zip(ts, ts[1:])]
print('sfx.wav', len(EV), 'Ereignisse, kleinster Abstand %.3f s' % min(gaps))
