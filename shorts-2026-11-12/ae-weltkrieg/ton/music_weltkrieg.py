# Eigene Musik fuer den Weltkrieg-Short (Sarajevo 1914): gespannter Doku-Puls, kein Schlagzeug.
# C-Moll, 96 bpm: tiefe Pizzicato-Achtel (Puls) + warmes Streicher-Pad + hohes Spieluhr/Vibraphon-Motiv (nicht im Sprachbereich).
# Ab dem Abbiegen wird der Puls langsamer (nur Viertel, dann halbe Noten), nach den Schuessen ~1,3 s Stille,
# beim Tod nur ein tiefes Pad, bei "Krieg" kommt der Puls dunkel zurueck, "Was waere passiert" hellt auf (As-Dur), Schluss in C-Dur.
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from dsp import SR, ns, rng, pan, place, make_ir, convolve_st, hp, lp, write_wav
import instruments as I
TL = json.load(open(os.path.join(HERE, '..', 'data', 'timeline.json')))
SC = {s['id']: s for s in TL['scenes']}
DUR = TL['end']; N = ns(DUR)
Q = 60 / 96; E8 = Q / 2; BAR = 4 * Q; F = I.m2f; R = rng(1914)
T_SLOW = SC['abbiegen']['start']                     # Puls wird langsamer
T_SLOWER = SC['sekunden']['start']                   # nur noch halbe Noten
T_SHOT = SC['schuss']['k']['schiesst']               # Stille ab den Schuessen ...
T_BACK = SC['tod']['start'] + 0.25                   # ... bis kurz nach dem Schnitt
T_WAR = SC['krieg']['k']['spaeter']                  # dunkler Puls zurueck
T_WHAT = SC['waswaere']['start']                     # Aufhellung
T_END = SC['outro']['k']['folgen'] + 0.35
music = np.zeros((2, N)); room = np.zeros((2, N))
def put(x, t, g=1.0, p=0.0, wet=0.3, final=False):
    if t >= DUR - 0.05: return
    if T_SHOT - 0.05 <= t < T_BACK: return
    if t >= T_END - 0.02 and not final: return
    if x.ndim == 1: x = pan(x, p)
    place(music, x, t, g); place(room, x, t, g * wet)
CM = [(36, [60, 63, 67]), (32, [60, 63, 68]), (34, [58, 62, 65]), (31, [59, 62, 67])]    # Cm Ab Bb G
LIGHT = [(32, [60, 63, 68]), (39, [58, 63, 67]), (34, [58, 62, 65]), (36, [60, 64, 67])]  # Ab Eb Bb C
nb = int(np.ceil(DUR / BAR)) + 1
for b in range(nb):
    t = b * BAR
    light = t >= T_WHAT - 0.3
    bass, ch = (LIGHT if light else CM)[b % 4]
    for e in range(8):
        te = t + e * E8
        if te < T_SLOW: on = True
        elif te < T_SLOWER: on = e % 2 == 0
        elif te < T_WAR: on = e % 4 == 0
        elif te < T_WHAT: on = e % 2 == 0
        else: on = True
        if not on: continue
        m = (bass + 12) if e % 2 == 0 else (bass + 19)
        put(I.pluck(F(m), 0.5 if e % 4 == 0 else 0.34, R, dur=0.45, bright=0.3, pos=0.2), te, 1.0, p=-0.25, wet=0.25)
    # Pad: dunkel waehrend Tod/Krieg
    dark = T_BACK - 0.3 <= t < T_WHAT - 0.3
    if True:
        put(I.pad([F(m - 12) for m in ch], BAR - 0.02, 0.11 if dark else 0.08, R, att=0.5, rel=0.6, warm=420 if dark else 650, detune=6), t, 1.0, wet=0.45)
# hohes Motiv (Spieluhr), alle 2 Takte, nicht waehrend Tod/Stille
MOT = [(0, 0.5, 79), (0.5, 0.5, 75), (1, 1, 72), (2, 0.5, 74), (2.5, 0.5, 75), (3, 1, 74), (4, 1.5, 72), (6, 2, 67)]
MOTL = [(0, 0.5, 80), (0.5, 0.5, 79), (1, 1, 75), (2, 0.5, 77), (2.5, 0.5, 79), (3, 1, 80), (4, 1.5, 84), (6, 2, 79)]
k = 0
while k * 2 * BAR < DUR:
    t0 = k * 2 * BAR
    if not (T_SHOT - 2 * BAR < t0 < T_WAR):
        for (e, d, m) in (MOTL if t0 >= T_WHAT - 0.3 else MOT):
            tb = t0 + e * Q
            put(I.musicbox(F(m), 0.32, R, dur=min(1.8, d * Q + 0.7)), tb, 0.5, p=0.25, wet=0.55)
    k += 1
# Schluss in C-Dur
for i, mm in enumerate((48, 55, 60, 64, 67, 72)):
    put(I.pluck(F(mm), 0.36, R, dur=1.9, bright=0.45, pos=0.15), T_END + 0.05 * i, 0.9, wet=0.5, final=True)
put(I.vibes(F(76), 0.38, R, dur=2.2), T_END + 0.3, 0.6, wet=0.6, final=True)
put(I.pad([F(48), F(55), F(64)], 1.2, 0.08, R, att=0.2, rel=0.8, warm=600), T_END, 1.0, wet=0.5, final=True)
ir = make_ir(1.7, 14, hf=1.1)
out = music + 0.55 * convolve_st(room, ir)[:, :N]
out = lp(hp(out, 55), 9000)
# Stille nach den Schuessen auch fuer Hall-Fahnen: weich ausblenden und einblenden
g = np.ones(N); a, b = ns(T_SHOT - 0.02), ns(T_BACK)
g[a:b] = 0; fa = ns(0.08); g[max(0, a - fa):a] = np.linspace(1, 0, min(fa, a)); fb = ns(0.25); g[b:b + fb] = np.linspace(0, 1, fb)
out *= g[None, :]
n0 = ns(DUR - 0.9); out[:, n0:] *= np.linspace(1, 0, N - n0)[None, :] ** 1.5
out /= np.max(np.abs(out)) / 0.9
write_wav(os.path.join(HERE, 'music.wav'), out)
print('music.wav', round(DUR, 2), 's | Stille %.2f-%.2f' % (T_SHOT, T_BACK))
