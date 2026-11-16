# Eigene Musik fuer den Freiheitsstatue-Short (13.11.2026): heller, neugieriger Doku-Puls ohne Schlagzeug.
# E-Moll / G-Dur, 104 bpm: Zupf-Ostinato (Achtel), weiches Pad, Vibraphon-Motiv hoch (nicht im Sprachbereich).
# Kongress/Protest: dunkler und luftiger (nur Viertel, Pad waermer). Twist ab "Ihr Ergebnis" (Szene ergebnis): klares G-Dur,
# Ostinato wieder voll, Motiv eine Terz hoeher. Schluss: G-Dur-Aufloesung auf "folgen".
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from dsp import SR, ns, rng, pan, place, make_ir, convolve_st, hp, lp, write_wav
import instruments as I
TL = json.load(open(os.path.join(HERE, '..', 'data', 'timeline.json')))
SC = {s['id']: s for s in TL['scenes']}
DUR = TL['end']; N = ns(DUR)
Q = 60 / 104; E8 = Q / 2; BAR = 4 * Q; F = I.m2f; R = rng(1886)
T_TWIST = SC['ergebnis']['start']
T_DARK0, T_DARK1 = SC['kongress']['start'], SC['pruefen']['end']
T_END = SC['outro']['k']['folgen'] + 0.3
music = np.zeros((2, N)); room = np.zeros((2, N))
def put(x, t, g=1.0, p=0.0, wet=0.3, final=False):
    if t >= DUR - 0.05 or (t >= T_END - 0.02 and not final): return
    if x.ndim == 1: x = pan(x, p)
    place(music, x, t, g); place(room, x, t, g * wet)
A1 = [(40, [55, 59, 64]), (36, [55, 60, 64]), (43, [55, 59, 62]), (38, [54, 57, 62])]        # Em C G D
A2 = [(43, [59, 62, 67]), (38, [57, 62, 66]), (40, [59, 64, 67]), (36, [60, 64, 67])]        # G D Em C (Dur-Farbe)
MEL1 = [(0, 1, 76), (1, 0.5, 79), (1.5, 0.5, 78), (2, 2, 76), (4, 1, 74), (5, 1, 76), (6, 2, 71), (8, 1, 72), (9, 1, 74), (10, 1, 76), (11, 1, 79), (12, 3, 78)]
MEL2 = [(0, 1, 79), (1, 1, 81), (2, 2, 83), (4, 1, 81), (5, 1, 79), (6, 2, 78), (8, 1, 76), (9, 1, 78), (10, 2, 79), (12, 3, 83)]
nb = int(np.ceil(DUR / BAR))
for b in range(nb):
    t = b * BAR
    twist = t >= T_TWIST - 0.25
    dark = T_DARK0 - 0.2 <= t < T_DARK1 - 0.2 and not twist
    bass, ch = (A2 if twist else A1)[b % 4]
    for e in range(8):
        if dark and e % 2: continue
        m = ch[[0, 1, 2, 1][e % 4]] + (12 if e % 4 == 2 else 0) + 12
        put(I.pluck(F(m), 0.2 if e % 2 else 0.28, R, dur=0.30, bright=0.6 if not dark else 0.4, pos=0.13), t + e * E8, 1.0, p=0.3, wet=0.3)
    put(I.pluck(F(bass + 12), 0.34, R, dur=1.1, bright=0.35, pos=0.2), t, 0.9, p=-0.15, wet=0.25)
    if not dark: put(I.pluck(F(bass + 12), 0.22, R, dur=0.6, bright=0.35, pos=0.2), t + 2 * Q + E8, 0.7, p=-0.15, wet=0.25)
    put(I.pad([F(m) for m in ch], BAR - 0.02, 0.08 if not dark else 0.10, R, att=0.6, rel=0.5, warm=520 if dark else 800, detune=6), t, 1.0, wet=0.45)
loop = 16 * Q; k = 0
while k * loop < DUR:
    for (e, d, m) in MEL1:
        tb = k * loop + e * Q
        if tb >= T_TWIST - 0.1: break
        if T_DARK0 - 0.1 <= tb < T_DARK1: m -= 12
        put(I.vibes(F(m), 0.4, R, dur=min(2.2, d * Q + 0.8)), tb, 0.5, p=-0.2, wet=0.5)
    k += 1
k = 0
while T_TWIST + k * loop < T_END:
    for (e, d, m) in MEL2:
        tb = T_TWIST + 0.1 + k * loop + e * Q
        put(I.vibes(F(m), 0.38, R, dur=min(2.2, d * Q + 0.8)), tb, 0.5, p=-0.2, wet=0.55)
    k += 1
for i, mm in enumerate((43, 50, 55, 59, 62, 67)):   # G-Dur zum Schluss
    put(I.pluck(F(mm + 12), 0.36, R, dur=1.8, bright=0.55, pos=0.15), T_END + 0.05 * i, 0.9, wet=0.5, final=True)
put(I.vibes(F(83), 0.38, R, dur=2.2), T_END + 0.3, 0.55, wet=0.6, final=True)
ir = make_ir(1.6, 5, hf=1.1)
out = music + 0.55 * convolve_st(room, ir)[:, :N]
out = lp(hp(out, 70), 9000)
n0 = ns(DUR - 0.9); out[:, n0:] *= np.linspace(1, 0, N - n0)[None, :] ** 1.5
out /= np.max(np.abs(out)) / 0.9
write_wav(os.path.join(HERE, 'music.wav'), out)
print('music.wav', round(DUR, 2), 's')
