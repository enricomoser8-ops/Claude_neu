# Szenen-Geraeusche fuer den Weltkrieg-Short: nur das wichtigste sichtbare Ereignis pro Moment (Chris Moran: Hierarchie,
# taktile Sounds, tiefe Whooshes, J-Cut), frame-genau auf die Keyframe-Zeiten der JSX (gleiche Formeln wie scenes_weltkrieg.jsx,
# Zeiten aus ../data/timeline.json). Mindestens 0,35 s Abstand (wird geprueft). ennos eigene Sounds (ton/enno/) fuer
# Tippen, Pop, Klick, Swipe. Schuesse: zwei trockene, leise, kurze Knalle, nicht reisserisch.
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from dsp import SR, ns, tt, rng, pan, place, fades, lp, hp, bp, modal, phase, colored, write_wav, read_wav, smooth_noise
import sfx_gen as G
TL = json.load(open(os.path.join(HERE, '..', 'data', 'timeline.json')))
FPS = TL['fps']; f = lambda n: n / FPS
SC = {s['id']: s for s in TL['scenes']}
K = lambda sid, key: SC[sid]['k'][key]
ST = lambda sid: SC[sid]['start']
DUR = TL['end']; N = ns(DUR + 1); R = rng(1914)
out = np.zeros((2, N)); EV = []
ENNO = os.path.join(HERE, 'enno')
def own(name):
    x, sr = read_wav(os.path.join(ENNO, name + '.wav'))
    x = np.vstack([x[0], x[0]]) if x.shape[0] == 1 else x
    if sr != SR:
        from scipy.signal import resample_poly
        from math import gcd
        g = gcd(SR, sr); x = resample_poly(x, SR // g, sr // g, axis=1)
    return x
def put(x, t, g=1.0, p=0.0, what=''):
    place(out, pan(x, p) if x.ndim == 1 else x, max(0, t), g); EV.append((round(t, 3), what))
def typing(n_chars, cps):
    ty = own('typing'); d = n_chars / cps
    y = ty[:, :ns(d)].copy(); fl = ns(0.03); y[:, -fl:] *= np.linspace(1, 0, fl)[None, :]
    return y

# --- Bausteine (Synthese) ---
def low_whoosh(r, dur=0.7, peak=0.32):
    return G.whoosh(dur, r, peak=peak, f_lo=90, f_hi=700, width=0.9, tail=0.22, air=0.05)
def paper_slide(r, dur=0.6):
    n = ns(dur); t = np.arange(n) / SR
    y = bp(colored(n, r, 0.3), 900, 7000, 1) * (np.clip(t / 0.06, 0, 1) * np.exp(-np.maximum(0, t - 0.2) / 0.15))
    cr = bp(r.standard_normal(n), 2000, 9000, 1) * (smooth_noise(n, r, 40) > 0.55) * 0.3 * np.exp(-t / 0.3)
    return fades(y * 0.6 + cr, 0.005, 0.05)
def marker(r, dur=0.45):
    n = ns(dur); t = np.arange(n) / SR
    sq = np.sin(phase(1900 + 300 * smooth_noise(n, r, 12))) * 0.15 + bp(r.standard_normal(n), 2500, 8000, 1) * 0.5
    env = np.clip(t / 0.02, 0, 1) * np.clip((dur - t) / 0.06, 0, 1)
    return fades(sq * env * (0.7 + 0.3 * smooth_noise(n, r, 25)), 0.003, 0.03)
def scribble(r, dur=0.5, strokes=5):
    n = ns(dur); y = np.zeros(n); t = np.arange(n) / SR
    for k in range(strokes):
        a, b = k * dur / strokes, (k + 0.85) * dur / strokes
        m = (t >= a) & (t < b)
        y[m] += bp(r.standard_normal(m.sum()), 1500, 7000, 1) * np.sin(np.pi * (t[m] - a) / (b - a)) ** 0.7
    return fades(y * 0.6, 0.003, 0.03)
def chalk(r, dur=0.4):
    n = ns(dur); t = np.arange(n) / SR
    y = bp(r.standard_normal(n), 900, 5000, 1) * (0.5 + 0.5 * (smooth_noise(n, r, 30) > 0.4)) * np.sin(np.pi * t / dur) ** 0.5
    return fades(y * 0.7, 0.003, 0.03)
def page_flip(r, dur=0.6):
    n = ns(dur); t = np.arange(n) / SR
    y = bp(colored(n, r, 0.2), 600, 6000, 1) * np.exp(-((t - 0.22) / 0.13) ** 2)
    y += lp(r.standard_normal(n), 300) * np.exp(-((t - 0.3) / 0.05) ** 2) * 0.8
    return fades(y, 0.005, 0.05)
def breaker(r):
    t = tt(0.35)
    y = modal(0.35, [(160, 1.0, 0.05), (480, 0.6, 0.03), (1450, 0.4, 0.012)], r) * 1.2
    y += bp(r.standard_normal(len(t)), 900, 6000, 1) * np.exp(-t / 0.004) * 0.9
    return fades(y, 0.0, 0.05)
def engine(r, dur, f0a=34, f0b=40):
    n = ns(dur); t = np.arange(n) / SR
    f0 = f0a + (f0b - f0a) * np.clip(t / max(0.3, dur * 0.6), 0, 1)
    y = np.sin(phase(f0)) * 0.6 + np.sin(phase(f0 * 2)) * 0.3 + lp(r.standard_normal(n), 220) * 0.6
    y *= 0.8 + 0.2 * np.sin(phase(f0 / 4))
    env = np.clip(t / 0.25, 0, 1) * np.clip((dur - t) / 0.4, 0, 1)
    return fades(lp(y, 900) * env, 0.01, 0.1)
def metal_tap(r, f0=900):
    t = tt(0.35)
    y = modal(0.35, [(f0, 1.0, 0.05), (f0 * 2.7, 0.5, 0.02), (f0 * 0.5, 0.6, 0.06)], r) + bp(r.standard_normal(len(t)), 1500, 8000, 1) * np.exp(-t / 0.003) * 0.6
    return fades(y, 0.0, 0.05)
def muffled_boom(r, dur=1.3):
    # gedaempfter Knall (aus der Ferne, tiefpassgefiltert, kein Splittern)
    n = ns(dur); t = np.arange(n) / SR
    body = lp(r.standard_normal(n), 160) * np.exp(-t / 0.22) * 2.2
    thump = np.sin(phase(55 * (1 + 1.2 * np.exp(-t / 0.03)))) * np.exp(-t / 0.18) * 1.2
    tail = lp(colored(n, r, 0.6), 500) * np.exp(-t / 0.5) * 0.35
    return fades(lp(body + thump + tail, 1200), 0.002, 0.2)
def shot(r):
    # trockener, kurzer Knall, leise, ohne Hall-Effekthascherei
    t = tt(0.5)
    y = bp(r.standard_normal(len(t)), 300, 4000, 1) * np.exp(-t / 0.012) * 1.4
    y += np.sin(phase(120 * (1 + np.exp(-t / 0.01)))) * np.exp(-t / 0.05) * 0.8
    y += lp(r.standard_normal(len(t)), 700) * np.exp(-t / 0.12) * 0.25
    return fades(lp(y, 3500), 0.0005, 0.08)
def gear_crunch(r):
    t = tt(0.55); n = len(t)
    gr = bp(r.standard_normal(n), 400, 3000, 1) * (np.abs(np.sin(phase(np.full(n, 38.0)))) ** 6) * np.exp(-t / 0.18) * 1.4
    clunk = modal(0.55, [(140, 1.0, 0.05), (420, 0.5, 0.03), (1100, 0.3, 0.012)], r)
    return fades(gr + clunk, 0.002, 0.06)
def brake(r):
    t = tt(0.45); n = len(t)
    sq = np.sin(phase(1300 + 120 * np.sin(phase(np.full(n, 9.0))))) * 0.08 * np.clip(t / 0.04, 0, 1) * np.clip((0.3 - t) / 0.1, 0, 1)
    th = modal(0.45, [(95, 1.0, 0.06), (260, 0.4, 0.03)], r) * np.exp(-np.maximum(0, t - 0.25) / 0.05) * (t > 0.25)
    rub = bp(r.standard_normal(n), 500, 2500, 1) * 0.25 * np.clip((0.3 - t) / 0.3, 0, 1)
    return fades(sq + th + rub, 0.003, 0.05)
def tick(r):
    t = tt(0.12)
    return fades(modal(0.12, [(3100, 0.8, 0.008), (1800, 0.5, 0.012), (760, 0.4, 0.02)], r), 0.0, 0.02)
def odo(r, dur, n=8):
    y = np.zeros(ns(dur))
    for k in range(n):
        c = modal(0.05, [(r.uniform(2400, 3000), 0.5, 0.006), (r.uniform(700, 900), 0.4, 0.01)], r); i = ns(dur * k / n)
        y[i:i + len(c)] += c[:max(0, len(y) - i)] * (1 - 0.6 * k / n)
    return y
def rewind(r, dur=0.55):
    n = ns(dur); t = np.arange(n) / SR
    f = 900 + 2600 * (t / dur) ** 1.4
    y = np.sin(phase(f)) * 0.12 + bp(r.standard_normal(n), 1200, 7000, 1) * 0.35 * (0.6 + 0.4 * np.sin(phase(np.full(n, 23.0))))
    env = np.clip(t / 0.05, 0, 1) * np.clip((dur - t) / 0.08, 0, 1)
    return fades(y * env, 0.003, 0.03)
def soft_thud(r):
    t = tt(0.4)
    return fades(np.sin(phase(70 * (1 + 0.5 * np.exp(-t / 0.02)))) * np.exp(-t / 0.09) + lp(r.standard_normal(len(t)), 400) * np.exp(-t / 0.03) * 0.4, 0.0, 0.05)

# --- Ereignisse (Zeit = sichtbares Ereignis, gleiche Formeln wie in scenes_weltkrieg.jsx; J-Cut bei Whooshes) ---
put(scribble(R, f(15), 4), K('hook', 'falsch') - f(5), 0.55, 0.15, 'Hook: roter Pfeil zeichnet sich')
put(low_whoosh(R, 0.8, 0.35), ST('sarajevo') - 0.3, 0.8, 0, 'Schnitt + Sturzflug auf Sarajevo (J-Cut)')
put(typing(8, 26), K('sarajevo', 'sarajevo') + f(4), 0.6, 0, 'SARAJEVO tippt')
# (Hierarchie: stumm) put(odo(R, f(16)), K('sarajevo', 'jahr') - f(4), 0.45, 0.1, '1914 rollt (Odometer)')
put(scribble(R, f(14), 4), K('thron', 'franz') + f(6), 0.5, 0.2, 'Kreis um Franz Ferdinand')
put(typing(15, 30), K('thron', 'franz') + f(26), 0.55, 0, 'Label Franz Ferdinand tippt')
# (Hierarchie: stumm) put(typing(11, 30), K('thron', 'kaiser') - f(3), 0.55, 0, 'Thronfolger tippt')
# (Hierarchie: stumm) put(paper_slide(R), ST('wagen') - f(2), 0.7, -0.1, 'Foto gleitet rein')
put(breaker(R), K('wagen', 'offenen'), 0.55, 0, 'Callout harter Schnitt')
put(engine(R, 1.25), ST('bombe'), 0.5, 0, 'Kolonne faehrt')
put(G.whoosh(0.45, R, peak=0.2, f_lo=400, f_hi=1800, tail=0.12), K('bombe', 'wirft'), 0.3, 0.2, 'Bombe fliegt')
# (Hierarchie: stumm) put(metal_tap(R, 820), K('bombe', 'bombe') - f(1), 0.45, 0, 'Bombe landet auf dem Wagen')
# (Hierarchie: stumm) put(metal_tap(R, 640), K('abprall', 'prallt') + f(3), 0.4, -0.1, 'Bombe prallt ab')
put(muffled_boom(R), K('abprall', 'ab'), 0.7, -0.15, 'Explosion (gedaempft) + Blitz')
put(own('pop_real'), K('abprall', 'menschen') - f(2), 0.4, -0.1, 'rote Kreuze (Verletzte)')
# (Hierarchie: stumm) put(engine(R, 0.9, 38, 46), ST('gescheitert') + f(2), 0.4, 0.2, 'Wagen faehrt weiter')
put(scribble(R, f(10), 3), K('gescheitert', 'gescheitert'), 0.45, 0.2, 'Kreis um den Wagen am Rathaus')
# (Hierarchie: stumm) put(own('pop_real'), K('cta', 'folge') - f(1), 0.45, 0, 'Folgen-Knopf (Mitte)')
put(own('click_real'), K('cta', 'schlauer') + f(8), 0.7, 0.1, 'Folgen-Klick (Mitte)')
put(page_flip(R), K('krankenhaus', 'verletzten') - f(4), 0.8, 0.1, 'Foto blaettert um')
# (Hierarchie: stumm) put(marker(R, f(14)), K('krankenhaus', 'krankenhaus') - f(3) + f(8), 0.45, -0.2, 'Weg zum Krankenhaus')
put(scribble(R, f(7), 2), K('route', 'route') - f(3), 0.55, 0.1, 'alte Route gestrichen')
# (Hierarchie: stumm) put(marker(R, f(12)), K('route', 'geaendert') - f(2), 0.45, -0.2, 'neue Route')
put(chalk(R, f(12)), K('fahrer', 'fahrer'), 0.55, -0.1, 'Kreide-Kreis um den Fahrer')
# (Hierarchie: stumm) put(own('swipe3'), K('fahrer', 'nicht') - f(2), 0.35, 0.15, 'Fragezeichen')
put(engine(R, 1.1), ST('abbiegen'), 0.5, 0.2, 'Wagen biegt ab')
put(brake(R), K('abbiegen', 'haelt') - 0.25, 0.55, 0, 'haelt an (Bremse)')
put(gear_crunch(R), K('abbiegen', 'zurueck') - f(3), 0.6, 0, 'Rueckwaertsgang')
# (Hierarchie: stumm) put(scribble(R, f(10), 3), ST('sekunden'), 0.35, 0, 'Stoppuhr zeichnet sich')
for i in range(3): put(tick(R), K('sekunden', 'sekunden') + 0.36 * i, 0.55, 0, 'Uhr tickt %d' % (i + 1))
put(scribble(R, f(12), 3), K('ecke', 'vor'), 0.5, 0.2, 'Kreis um die Ecke')
# (Hierarchie: stumm) put(odo(R, f(14), 4), K('ecke', 'neunzehn') - f(4), 0.45, 0, '19 rollt')
# (Hierarchie: stumm) put(typing(5, 30), K('ecke', 'neunzehn') + f(12), 0.5, 0.1, 'Jahre tippt')
put(soft_thud(R), K('ecke', 'attentaeter') - f(3), 0.45, 0, 'Silhouette erscheint')
put(shot(R), K('schuss', 'schiesst') + f(2), 0.45, 0.05, 'Schuss 1 (Blitz 1)')
put(shot(R), K('schuss', 'schiesst') + f(13), 0.4, 0.05, 'Schuss 2 (Blitz 2)')
put(page_flip(R, 0.5), K('krieg', 'monat') - f(6), 0.7, 0.1, 'Kalenderblatt')
put(low_whoosh(R, 1.0, 0.3), K('krieg', 'spaeter') - f(2), 0.7, 0, 'Europa faerbt sich')
put(rewind(R), K('waswaere', 'passiert') - f(2), 0.45, 0, 'Pfeil spult zurueck')
put(engine(R, 0.8, 40, 48), K('waswaere', 'richtig') - f(4), 0.45, -0.2, 'Wagen faehrt richtig')
put(own('pop_real'), K('outro', 'allgemeinwissen') - f(4), 0.5, -0.1, 'Logo')
# (Hierarchie: stumm) put(typing(15, 30), K('outro', 'bio') - f(4), 0.55, 0, 'Link in der Bio tippt')
put(own('click_real'), K('outro', 'folgen') + f(3), 0.7, 0.1, 'Folgen-Klick (Schluss)')

EV.sort()
gaps = [(EV[i][1], EV[i + 1][1], round(EV[i + 1][0] - EV[i][0], 3)) for i in range(len(EV) - 1) if EV[i + 1][0] - EV[i][0] < 0.35]
for g in gaps: print('ABSTAND < 0,35 s:', g)
out = hp(out, 35)[:, :ns(DUR)]
out /= np.max(np.abs(out)) / 0.9
write_wav(os.path.join(HERE, 'sfx.wav'), out)
json.dump(EV, open(os.path.join(HERE, 'sfx_events.json'), 'w'), indent=0, ensure_ascii=False)
print('sfx.wav', len(EV), 'Ereignisse,', len(gaps), 'zu dicht')
