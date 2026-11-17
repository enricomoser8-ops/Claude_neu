# Eigene Musik fuer den Roosevelt-Short (17.11.2026): ernst, aber packend, ohne Schlagzeug (nur weiche Pauke als Puls).
# C-Moll, 96 bpm: tiefes Zupf-Ostinato in Achteln (treibt), warmes Pad, leise Pauke auf der Eins, Vibraphon-Motiv hoch (ueber dem Sprachband).
# Schuss ("Da schiesst ein Mann auf ihn", Szene schuss): alles bricht ab, nur ein dunkles Pad mit langsamem Herzschlag-Puls,
#   bis "bleibt stehen" -> Ostinato setzt mit dem Folge-Aufruf wieder ein.
# Twist ab "Doch das Verrueckteste" (Szene tasche): Es-Dur-Farbe, Motiv eine Terz hoeher, Ostinato heller.
# Kugel/Frage (Szenen kugel, frage): nur Pad + halbe Noten (ruhiger). Schluss: C-Dur-Aufloesung auf "Folgen".
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
sys.dont_write_bytecode = True
from dsp import SR, ns, rng, pan, place, make_ir, convolve_st, hp, lp, write_wav
import instruments as I
TL = json.load(open(os.path.join(HERE, '..', 'data', 'timeline.json')))
SC = {s['id']: s for s in TL['scenes']}
DUR = TL['end']; N = ns(DUR)
Q = 60 / 96; E8 = Q / 2; BAR = 4 * Q; F = I.m2f; R = rng(1912)
T_SHOT = SC['schuss']['k']['schiesst'] - 0.04          # Musik bricht auf dem Schuss ab
T_BACK = SC['folge']['start'] - 0.10                     # Ostinato kommt mit dem Folge-Aufruf zurueck
T_TWIST = SC['tasche']['start']
T_CALM0, T_CALM1 = SC['kugel']['start'], SC['outro']['start']
T_END = SC['outro']['k']['folgen'] + 0.3
music = np.zeros((2, N)); room = np.zeros((2, N))
def put(x, t, g=1.0, p=0.0, wet=0.3, final=False):
    if t >= DUR - 0.05 or (t >= T_END - 0.02 and not final): return
    if x.ndim == 1: x = pan(x, p)
    place(music, x, t, g); place(room, x, t, g * wet)
def silent(t): return T_SHOT - 0.02 <= t < T_BACK
A1 = [(36, [55, 60, 63]), (32, [56, 60, 63]), (29, [56, 60, 65]), (31, [55, 59, 62])]        # Cm Ab Fm G
A2 = [(39, [58, 63, 67]), (36, [55, 60, 63]), (32, [56, 60, 63]), (34, [58, 62, 65])]        # Eb Cm Ab Bb (Dur-Farbe)
OST = [0, 12, 7, 12, 0, 12, 10, 12]                                                          # Achtel-Muster ueber dem Grundton
MEL1 = [(0, 1.5, 79), (1.5, 0.5, 77), (2, 2, 75), (4, 1, 74), (5, 1, 75), (6, 2, 72), (8, 3, 79), (11, 1, 80), (12, 4, 79)]
MEL2 = [(0, 1.5, 82), (1.5, 0.5, 80), (2, 2, 79), (4, 1, 77), (5, 1, 79), (6, 2, 75), (8, 3, 82), (11, 1, 84), (12, 4, 82)]
nb = int(np.ceil(DUR / BAR)) + 1
for b in range(nb):
    t = b * BAR
    twist = t >= T_TWIST - 0.2
    calm = T_CALM0 - 0.2 <= t < T_CALM1 - 0.2
    bass, ch = (A2 if twist else A1)[b % 4]
    for e in range(8):
        te = t + e * E8
        if silent(te) or (calm and e % 4): continue
        m = bass + 12 + OST[e]
        put(I.pluck(F(m), 0.30 if e % 2 else 0.38, R, dur=0.45 if not calm else 1.2, bright=0.5 if twist else 0.38, pos=0.14), te, 1.0, p=0.25 if e % 2 else -0.1, wet=0.3)
    if not silent(t):
        put(I.timpani(F(bass + 12), 0.30 if not calm else 0.2, R, dur=1.8), t, 0.55, p=0.0, wet=0.35)
    if not silent(t) or True:
        dark = silent(t + 0.5)
        put(I.pad([F(m - (12 if dark else 0)) for m in ch], BAR - 0.02, 0.10 if not dark else 0.12, R, att=0.7, rel=0.6, warm=420 if dark else 780, detune=6), t, 1.0, wet=0.5)
# Herzschlag-Puls in der Stille nach dem Schuss (tief, leise, zwei Schlaege je Takt-Haelfte)
t = T_SHOT + 0.45
while t < T_BACK - 0.3:
    put(I.timpani(F(36), 0.22, R, dur=0.9), t, 0.6, wet=0.2); put(I.timpani(F(36), 0.15, R, dur=0.7), t + 0.26, 0.5, wet=0.2)
    t += 1.05
loop = 16 * Q; k = 0
while k * loop < DUR:
    for (e, d, m) in MEL1:
        tb = k * loop + e * Q + 2 * BAR
        if tb >= T_TWIST - 0.1: break
        if silent(tb) or T_SHOT - 1.0 < tb < T_SHOT: continue
        put(I.vibes(F(m), 0.30, R, dur=min(2.2, d * Q + 0.8)), tb, 0.42, p=-0.25, wet=0.55)
    k += 1
k = 0
while T_TWIST + k * loop < T_CALM0:
    for (e, d, m) in MEL2:
        tb = T_TWIST + 0.1 + k * loop + e * Q
        if tb >= T_CALM0 - 0.2: break
        put(I.vibes(F(m), 0.32, R, dur=min(2.2, d * Q + 0.8)), tb, 0.45, p=-0.25, wet=0.6)
    k += 1
for i, mm in enumerate((36, 43, 48, 52, 55, 60)):   # C-Dur zum Schluss
    put(I.pluck(F(mm + 12), 0.34, R, dur=2.2, bright=0.5, pos=0.15), T_END + 0.05 * i, 0.9, wet=0.55, final=True)
put(I.vibes(F(79), 0.34, R, dur=2.4), T_END + 0.3, 0.5, wet=0.6, final=True)
ir = make_ir(1.8, 5, hf=1.0)
out = music + 0.55 * convolve_st(room, ir)[:, :N]
out = lp(hp(out, 55), 8000)
n0 = ns(DUR - 0.9); out[:, n0:] *= np.linspace(1, 0, N - n0)[None, :] ** 1.5
out /= np.max(np.abs(out)) / 0.9
write_wav(os.path.join(HERE, 'music.wav'), out)
print('music.wav', round(DUR, 2), 's')
