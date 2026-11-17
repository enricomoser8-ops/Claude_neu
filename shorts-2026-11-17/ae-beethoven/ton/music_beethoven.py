# Eigene Musik fuer den Beethoven-Short (17.11.2026): warm und klassisch, ohne Schlagzeug (Pizzicato-Zupfen, Streicher-Pad, Harfe).
# 76 bpm. d-Moll (i - VI - iv - V) bis zum Jubel, dann D-Dur. Dramaturgie "was Beethoven hoert":
#   - Hook (bis "Es ist Ludwig van Beethoven"): dumpf wie durch Watte (Tiefpass ~450 Hz)
#   - Jubel + Ruecken + Saengerin (er hoert den Saal nicht): wieder dumpf
#   - ab "Jetzt sieht er es": klar, D-Dur, hell, waechst
#   - Hymne ("Die Melodie kennst du"): kurzes, leises Zitat der ersten Phrase der Ode an die Freude (Harfe, hohe Lage, 8 Toene),
#     darunter nur Pad - ueberdeckt die Stimme nicht (Pocket 1,9 kHz in mix_beethoven.py, 14,5 LU unter der Stimme)
#   - Schluss: D-Dur-Kadenz auf "Folgen"
import json, os, sys
sys.dont_write_bytecode = True
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from dsp import SR, ns, rng, pan, place, make_ir, convolve_st, hp, lp, write_wav
import instruments as I
TL = json.load(open(os.path.join(HERE, '..', 'data', 'timeline.json')))
SC = {s['id']: s for s in TL['scenes']}
DUR = TL['end']; N = ns(DUR)
Q = 60 / 76; BAR = 4 * Q; F = I.m2f; R = rng(1824)
T_DUR = SC['huete']['start']                    # ab hier D-Dur, klar
T_HYM0, T_HYM1 = SC['hymne']['start'], SC['hymne']['end']
T_END = SC['outro']['k']['folgen'] + 0.25
music = np.zeros((2, N)); room = np.zeros((2, N))
def put(x, t, g=1.0, p=0.0, wet=0.3, final=False):
    if t >= DUR - 0.05 or (t >= T_END - 0.02 and not final): return
    if x.ndim == 1: x = pan(x, p)
    place(music, x, t, g); place(room, x, t, g * wet)
MOLL = [(38, [57, 62, 65]), (34, [58, 62, 65]), (43, [58, 62, 67]), (33, [57, 61, 64])]     # Dm Bb Gm A
DUR_ = [(38, [57, 62, 66]), (43, [59, 62, 67]), (33, [57, 61, 64]), (38, [57, 62, 66])]     # D G A D
nb = int(np.ceil(DUR / BAR))
for b in range(nb):
    t = b * BAR
    dur_ = t >= T_DUR - 0.3
    hym = T_HYM0 - 0.2 <= t < T_HYM1
    bass, ch = (DUR_ if dur_ else MOLL)[b % 4]
    if not hym:   # Pizzicato-Ostinato (Achtel im Dur-Teil, Viertel im Moll-Teil)
        steps = 8 if dur_ else 4
        for e in range(steps):
            m = ch[[0, 1, 2, 1, 0, 1, 2, 1][e % 8] if steps == 8 else [0, 1, 2, 1][e]] + (12 if (e % 4) == 2 else 0)
            put(I.pluck(F(m), 0.22 if e % 2 else 0.28, R, dur=0.45, bright=0.35, pos=0.18), t + e * BAR / steps, 0.9, p=0.25, wet=0.4)
    put(I.pluck(F(bass + 12), 0.34, R, dur=1.8, bright=0.25, pos=0.22), t, 0.9, p=-0.15, wet=0.35)
    put(I.pad([F(m) for m in ch] + [F(bass + 12)], BAR - 0.02, 0.10, R, att=0.9, rel=0.8, warm=650 if not dur_ else 900, detune=5), t, 1.0, wet=0.55)
# Ode an die Freude, erste Phrase (fis fis g a | a g fis e), leise Harfe zwei Oktaven ueber dem Bass, 0,40 s je Ton
ODE = [78, 78, 79, 81, 81, 79, 78, 76]
t0 = SC['hymne']['k']['melodie'] - 0.05
for i, m in enumerate(ODE):
    put(I.pluck(F(m), 0.30, R, dur=1.2, bright=0.5, pos=0.12), t0 + i * 0.40, 0.55, p=-0.2, wet=0.6)
# Schluss: D-Dur-Kadenz (A7 -> D) auf "Folgen"
for i, mm in enumerate((33, 45, 52, 55, 61, 67)):
    put(I.pluck(F(mm + 12), 0.30, R, dur=1.4, bright=0.4, pos=0.15), T_END - 1.0 + 0.04 * i, 0.8, wet=0.5, final=True)
for i, mm in enumerate((38, 45, 50, 54, 57, 62, 66)):
    put(I.pluck(F(mm + 12), 0.34, R, dur=2.2, bright=0.45, pos=0.15), T_END + 0.05 * i, 0.9, wet=0.6, final=True)
ir = make_ir(2.0, 9, hf=0.9)
out = music + 0.6 * convolve_st(room, ir)[:, :N]
out = lp(hp(out, 55), 7500)
# dumpf <-> klar: Ueberblendung mit einer tiefpassgefilterten Fassung (so hoert Beethoven es)
muff = lp(lp(out, 450, 2), 600, 2) * 1.25
tt = np.arange(N) / SR
def ramp(t, a, b): return np.clip((t - a) / (b - a), 0, 1)
m = 1 - ramp(tt, SC['name']['start'] - 0.15, SC['name']['start'] + 0.35)                       # Hook dumpf -> klar
m = np.maximum(m, ramp(tt, SC['jubel']['k']['aufhoert'] - 0.2, SC['jubel']['k']['jubelt']) * (1 - ramp(tt, T_DUR - 0.1, T_DUR + 0.4)))
out = out * (1 - m)[None, :] + muff * m[None, :]
n0 = ns(DUR - 1.0); out[:, n0:] *= np.linspace(1, 0, N - n0)[None, :] ** 1.5
out /= np.max(np.abs(out)) / 0.9
write_wav(os.path.join(HERE, 'music.wav'), out)
print('music.wav', round(DUR, 2), 's | dumpf 0-%.2f s und %.2f-%.2f s | Ode-Zitat ab %.2f s' % (SC['name']['start'], SC['jubel']['k']['aufhoert'], T_DUR, t0))
