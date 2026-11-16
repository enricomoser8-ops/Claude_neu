# Eigene Musik fuer den Titanic-Stewardess-Short (16.11.2026): ernst und warm, ohne Schlagzeug.
# D-Moll, 80 bpm: tiefes Zupf-Ostinato (Viertel), warmes Pad, sparsames Vibraphon-Motiv hoch (nicht im Sprachbereich).
# Britannic/Mine/Schrauben/Sprung (27,5-42,8 s): dunkler (nur halbe Noten, Pad waermer, Motiv eine Oktave tiefer).
# Twist ab "Aber das Verrueckteste" (Szene twist): F-Dur-Farbe, Ostinato wieder voll. Schluss: D-Dur-Aufloesung auf "Folgen".
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from dsp import SR, ns, rng, pan, place, make_ir, convolve_st, hp, lp, write_wav
import instruments as I
TL = json.load(open(os.path.join(HERE, '..', 'data', 'timeline.json')))
SC = {s['id']: s for s in TL['scenes']}
DUR = TL['end']; N = ns(DUR)
Q = 60 / 80; E8 = Q / 2; BAR = 4 * Q; F = I.m2f; R = rng(1911)
T_TWIST = SC['twist']['start']
T_DARK0, T_DARK1 = SC['britannic']['start'], SC['springt']['end']
T_END = SC['outro']['k']['folgen'] + 0.3
music = np.zeros((2, N)); room = np.zeros((2, N))
def put(x, t, g=1.0, p=0.0, wet=0.3, final=False):
    if t >= DUR - 0.05 or (t >= T_END - 0.02 and not final): return
    if x.ndim == 1: x = pan(x, p)
    place(music, x, t, g); place(room, x, t, g * wet)
A1 = [(38, [57, 62, 65]), (34, [58, 62, 65]), (41, [57, 60, 65]), (36, [55, 60, 64])]        # Dm Bb F C
A2 = [(41, [60, 65, 69]), (36, [60, 64, 67]), (38, [62, 65, 69]), (34, [62, 65, 70])]        # F C Dm Bb (Dur-Farbe)
MEL1 = [(0, 2, 74), (2, 1, 72), (3, 1, 69), (4, 3, 70), (8, 2, 69), (10, 1, 67), (11, 1, 65), (12, 3, 64)]
MEL2 = [(0, 2, 77), (2, 1, 76), (3, 1, 74), (4, 3, 72), (8, 2, 74), (10, 1, 76), (11, 1, 77), (12, 3, 79)]
nb = int(np.ceil(DUR / BAR))
for b in range(nb):
    t = b * BAR
    twist = t >= T_TWIST - 0.25
    dark = T_DARK0 - 0.2 <= t < T_DARK1 - 0.2 and not twist
    bass, ch = (A2 if twist else A1)[b % 4]
    for e in range(4):
        if dark and e % 2: continue
        m = ch[[0, 1, 2, 1][e]] + (12 if e == 2 else 0)
        put(I.pluck(F(m), 0.24 if e % 2 else 0.3, R, dur=0.55, bright=0.45 if not dark else 0.3, pos=0.15), t + e * Q, 1.0, p=0.3, wet=0.35)
    put(I.pluck(F(bass + 12), 0.36, R, dur=1.6, bright=0.3, pos=0.2), t, 0.9, p=-0.15, wet=0.3)
    put(I.pad([F(m) for m in ch], BAR - 0.02, 0.09 if not dark else 0.11, R, att=0.8, rel=0.6, warm=480 if dark else 720, detune=6), t, 1.0, wet=0.5)
loop = 16 * Q; k = 0
while k * loop < DUR:
    for (e, d, m) in MEL1:
        tb = k * loop + e * Q
        if tb >= T_TWIST - 0.1: break
        if T_DARK0 - 0.1 <= tb < T_DARK1: m -= 12
        put(I.vibes(F(m), 0.36, R, dur=min(2.4, d * Q + 0.9)), tb, 0.45, p=-0.2, wet=0.55)
    k += 1
k = 0
while T_TWIST + k * loop < T_END:
    for (e, d, m) in MEL2:
        tb = T_TWIST + 0.1 + k * loop + e * Q
        put(I.vibes(F(m), 0.36, R, dur=min(2.4, d * Q + 0.9)), tb, 0.45, p=-0.2, wet=0.6)
    k += 1
for i, mm in enumerate((38, 45, 50, 54, 57, 62)):   # D-Dur zum Schluss
    put(I.pluck(F(mm + 12), 0.34, R, dur=2.0, bright=0.5, pos=0.15), T_END + 0.05 * i, 0.9, wet=0.55, final=True)
put(I.vibes(F(78), 0.36, R, dur=2.4), T_END + 0.3, 0.5, wet=0.6, final=True)
ir = make_ir(1.8, 5, hf=1.0)
out = music + 0.55 * convolve_st(room, ir)[:, :N]
out = lp(hp(out, 60), 8000)
n0 = ns(DUR - 0.9); out[:, n0:] *= np.linspace(1, 0, N - n0)[None, :] ** 1.5
out /= np.max(np.abs(out)) / 0.9
write_wav(os.path.join(HERE, 'music.wav'), out)
print('music.wav', round(DUR, 2), 's')
