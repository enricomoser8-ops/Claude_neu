# Szenen-Geraeusche fuer den Kleopatra-Short (12.11.2026): pro Szene 1-3 wichtigste sichtbare Ereignisse
# (Chris Moran: Hierarchie, taktile Sounds, tiefe Whooshes, J-Cut), frame-genau auf die Keyframes der JSX
# (gleiche Zeiten: ../data/timeline.json + dieselben Versaetze wie in jsx/scenes_kleopatra.jsx). ennos eigene Sounds fuer Klick, Pop, Tippen.
# Funktionen aus sfx_short41.py uebernommen, neu: chalk, odo_ride, thump, focus_pull.
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
DUR = TL['end']; N = ns(DUR + 1); R = rng(69)
out = np.zeros((2, N)); EV = []
ENNO = '/mnt/project-files/podcast/shorts-wissen/sfx/'
def own(name):
    x, sr = read_wav(ENNO + name + '.wav')
    x = np.vstack([x[0], x[0]]) if x.shape[0] == 1 else x
    if sr != SR:
        from scipy.signal import resample_poly
        from math import gcd
        g = gcd(SR, sr); x = resample_poly(x, SR // g, sr // g, axis=1)
    return x
def put(x, t, g=1.0, p=0.0, what=''):
    place(out, pan(x, p) if x.ndim == 1 else x, max(0, t), g); EV.append((round(t, 3), what))

def glass_clink(r, f0=2600):
    y = modal(0.9, [(f0, 1.0, 0.35), (f0 * 2.32, 0.5, 0.18), (f0 * 4.1, 0.25, 0.07), (f0 * 0.51, 0.2, 0.25)], r)
    t = tt(0.9); y += hp(r.standard_normal(len(t)), 3000) * np.exp(-t / 0.001) * 0.4
    return fades(y, 0.0, 0.1)
def low_whoosh(r, dur=0.7, peak=0.32):
    return G.whoosh(dur, r, peak=peak, f_lo=90, f_hi=700, width=0.9, tail=0.22, air=0.05)
def paper_slide(r, dur=0.7):
    n = ns(dur); t = np.arange(n) / SR
    y = bp(colored(n, r, 0.3), 900, 7000, 1) * (np.clip(t / 0.08, 0, 1) * np.exp(-np.maximum(0, t - 0.25) / 0.18))
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
def snip(r):
    t = tt(0.18)
    y = modal(0.18, [(3800, 1.0, 0.012), (6100, 0.6, 0.006)], r) + bp(r.standard_normal(len(t)), 2500, 9000, 1) * np.exp(-t / 0.004) * 0.8
    return fades(y, 0.0, 0.03)
def page_flip(r, dur=0.6):
    n = ns(dur); t = np.arange(n) / SR
    y = bp(colored(n, r, 0.2), 600, 6000, 1) * np.exp(-((t - 0.22) / 0.13) ** 2)
    y += lp(r.standard_normal(n), 300) * np.exp(-((t - 0.3) / 0.05) ** 2) * 0.8
    return fades(y, 0.005, 0.05)
def crackle(r, dur=1.1):
    n = ns(dur); t = np.arange(n) / SR; y = lp(r.standard_normal(n), 1800) * 0.15
    for k in range(int(dur * 45)):
        i = r.integers(0, n - 400); y[i:i + 400] += hp(r.standard_normal(400), 2000) * np.exp(-np.arange(400) / 60) * r.uniform(0.2, 0.8)
    env = np.clip(t / 0.05, 0, 1) * np.clip((dur - t) / 0.4, 0, 1)
    return fades(y * env, 0.003, 0.05)
def breaker(r):
    # "Circuit breaker" auf dem harten Callout-Schnitt (Chris)
    t = tt(0.35)
    y = modal(0.35, [(160, 1.0, 0.05), (480, 0.6, 0.03), (1450, 0.4, 0.012)], r) * 1.2
    y += bp(r.standard_normal(len(t)), 900, 6000, 1) * np.exp(-t / 0.004) * 0.9
    return fades(y, 0.0, 0.05)
def cardboard(r):
    t = tt(0.5)
    y = np.exp(-t / 0.06) * np.sin(phase(110 * (1 + 0.4 * np.exp(-t / 0.01)))) * 1.2 + bp(r.standard_normal(len(t)), 300, 2500, 1) * np.exp(-t / 0.03) * 0.6
    return fades(y, 0.0, 0.05)
def engine(r, dur):
    n = ns(dur); t = np.arange(n) / SR
    f0 = 38 + 6 * np.clip(t / 1.2, 0, 1)
    y = np.sin(phase(f0)) * 0.6 + np.sin(phase(f0 * 2)) * 0.3 + lp(r.standard_normal(n), 220) * 0.6
    y *= 0.8 + 0.2 * np.sin(phase(f0 / 4))
    env = np.clip(t / 0.4, 0, 1) * np.clip((dur - t) / 0.6, 0, 1)
    return fades(lp(y, 900) * env, 0.01, 0.1)
def trunk(r):
    t = tt(0.6)
    y = np.exp(-t / 0.07) * np.sin(phase(75 * (1 + 0.3 * np.exp(-t / 0.012)))) * 1.3 + modal(0.6, [(620, 0.3, 0.05), (1500, 0.15, 0.02)], r)
    return fades(y, 0.0, 0.08)
def ping(r):
    return fades(modal(1.0, [(1320, 1.0, 0.5), (2640, 0.25, 0.2)], r) * 0.6, 0.002, 0.2)
def odo(r, dur, n=10):
    y = np.zeros(ns(dur))
    for k in range(n):
        c = modal(0.05, [(r.uniform(2400, 3000), 0.5, 0.006), (r.uniform(700, 900), 0.4, 0.01)], r); i = ns(dur * k / n)
        y[i:i + len(c)] += c[:max(0, len(y) - i)] * (1 - 0.6 * k / n)
    return y
def creak_clack(r):
    cr = G.creak(0.7, r, 120, 70, rough=0.12, noise=0.03) * 0.6
    y = np.zeros(ns(1.2)); y[:len(cr)] += cr
    c = modal(0.3, [(900, 1.0, 0.04), (2300, 0.5, 0.015)], r); i = ns(0.55); y[i:i + len(c)] += c[:len(y) - i] * 0.8
    return fades(y, 0.003, 0.08)


def chalk(r, dur=0.55, strokes=4):
    y = scribble(r, dur, strokes); return lp(y, 3500) * 1.3
def thump(r, f0=90, dur=0.4):
    t = tt(dur)
    y = np.exp(-t / 0.05) * np.sin(phase(f0 * (1 + 0.5 * np.exp(-t / 0.01)))) + bp(r.standard_normal(len(t)), 400, 3000, 1) * np.exp(-t / 0.02) * 0.5
    return fades(y, 0.0, 0.05)
def stamp(r):
    y = thump(r, 70, 0.5) * 1.2; p = paper_slide(r, 0.25) * 0.5; y[:len(p)] += p[:len(y)]; return y
def focus_pull(r):
    t = tt(0.5); w = G.whoosh(0.5, r, peak=0.4, f_lo=600, f_hi=4000, width=0.6, tail=0.1, air=0.2)
    c = modal(0.12, [(3200, 0.6, 0.01), (5200, 0.3, 0.006)], r); y = np.array(w, dtype=float); y[ns(0.38):ns(0.38) + len(c)] += c[:len(y) - ns(0.38)] * 0.8
    return y
def ride(r, dur):
    w = G.whoosh(dur, r, peak=0.45, f_lo=80, f_hi=600, width=1.0, tail=0.25, air=0.04)
    tk = odo(r, dur * 0.95, 14); y = np.array(w, dtype=float) * 0.9; y[:len(tk)] += tk * 0.6
    m = marker(r, min(dur, 1.6)) * 0.35; y[:len(m)] += m
    return y
def pitch(x, f):   # Tonhoehe/Tempo variieren (Whooshes/Pops nie zweimal identisch)
    from scipy.signal import resample
    if x.ndim == 1: return resample(x, int(len(x) / f))
    return np.vstack([resample(c, int(x.shape[1] / f)) for c in x])
POP, CLICK, TYP = own('pop_real'), own('click_real'), own('typing')
def typing(nchar, cps): return TYP[:, :ns(nchar / cps)]

# --- Ereignisse (Zeit = sichtbares Ereignis, wie in der JSX; J-Cut: Whooshes 2 Frames vorher) ---
put(pitch(POP, 0.9), K('hook', 'mond') - f(4), 0.45, 0.25, 'Mond ploppt')
put(low_whoosh(R, 0.9, 0.3), K('hook', 'bau') - f(8), 0.75, 0, 'Zoom raus zur Pyramide')
st = paper_slide(R, 0.7) * 0.8; sc_ = scribble(R, 0.6, 1) * 0.5; st[:len(sc_)] += sc_
put(st, ST('rechnen') + 0.03, 0.7, -0.1, 'Zeitstrahl zeichnet sich')
pd = paper_slide(R, 0.45); th = thump(R, 110, 0.3) * 0.5; pd[ns(0.3):ns(0.3) + len(th)] += th[:len(pd) - ns(0.3)]
put(pd, ST('pyramide') + 0.12, 0.7, 0.1, 'Abzug faellt ein')
put(typing(16, 28), K('pyramide', 'zahl'), 0.55, 0, 'Jahreszahl tippt')
put(ride(R, 1.8), ST('kleo') + 0.1 - f(2), 0.75, 0, 'Fahrt + Textmarker + Zaehler')
put(pitch(POP, 1.05), ST('kleo') + 2.4, 0.45, 0.1, 'Bueste ploppt')
put(chalk(R, 0.55, 4), ST('uralt') + 0.03, 0.55, -0.1, 'Kreide zeichnet')
put(crackle(R, 0.6), K('uralt', 'uralt') - f(2), 0.5, 0, 'Risse + alter Film')
put(CLICK, ST('folge') + 0.95, 0.7, 0.1, 'Folgen-Klick (Mitte)')
put(G.whoosh(0.45, R, peak=0.22, f_lo=250, f_hi=1500, tail=0.15), K('mond', 'mond') - f(4), 0.5, 0.25, 'Apollo-Foto schiesst rein')
put(odo(R, f(16), 10), K('mond', 'zahl') - f(2), 0.45, 0.1, 'Jahreszahl 1969 rollt')
put(marker(R, 0.52), ST('zweitausend') + 0.08, 0.55, 0.1, 'Textmarker 2')
put(odo(R, f(14), 9), K('zweitausend', 'zahl') - f(4), 0.45, -0.1, 'Ziffern 2.000 rollen')
put(page_flip(R, 0.5), ST('balken') + 1.5, 0.55, 0.15, 'Balken klappt')
put(scribble(R, f(13), 3), K('balken', 'aelter') + f(2), 0.45, -0.1, 'roter Kreis')
put(page_flip(R, 0.7), ST('seltsam') + 0.05, 0.85, 0, 'Seite umblaettern')
put(pitch(POP, 0.95), K('griechen', 'koenigin') - f(4), 0.45, 0.2, 'Punkt + Bueste Alexandria')
put(crackle(R, 1.0) * 0.8, K('griechen', 'aegyptens') - 0.15, 0.4, 0, 'Aegypten brennt frei')
put(scribble(R, 0.6, 3), K('griechen', 'familie') - f(3), 0.45, -0.15, 'Route zeichnet sich')
put(thump(R, 95, 0.35), K('alexander', 'vorfahre') - f(2), 0.5, -0.1, 'Ptolemaios ploppt')
put(breaker(R), K('alexander', 'alexander'), 0.55, 0, 'Callout harter Schnitt')
put(G.whoosh(0.6, R, peak=0.3, f_lo=500, f_hi=2600, tail=0.2, air=0.12), ST('hof') + 0.35 - f(2), 0.35, -0.2, 'Lupe faehrt')
put(stamp(R), K('hof', 'zahl') - f(2), 0.6, 0, '200 knallt rein')
put(chalk(R, 0.6, 5), ST('aegyptisch') + 0.05, 0.5, 0.1, 'Kreide-Koepfe')
put(focus_pull(R), K('aegyptisch', 'aeg') - f(1) - 0.38, 0.45, 0, 'Hieroglyphen werden scharf')
put(pitch(POP, 1.1), ST('gewusst') + 0.25, 0.4, 0.2, 'Fragezeichen')
put(pitch(POP, 0.85), K('outro', 'allgemeinwissen') - f(4), 0.55, 0, 'Logo')
put(typing(15, 30), K('outro', 'bio') - f(4), 0.55, 0, 'Bio tippt')
put(CLICK, K('outro', 'folgen') + f(3), 0.7, 0.1, 'Folgen-Klick')

out = hp(out, 35)[:, :ns(DUR)]
out /= np.max(np.abs(out)) / 0.9
write_wav(os.path.join(HERE, 'sfx.wav'), out)
json.dump(EV, open(os.path.join(HERE, 'sfx_events.json'), 'w'), indent=0, ensure_ascii=False)
ts = sorted(t for t, _ in EV); gaps = [round(b - a, 3) for a, b in zip(ts, ts[1:])]
print('sfx.wav', len(EV), 'Ereignisse, kleinster Abstand %.3f s' % min(gaps))
