# Eigene Musik fuer den Short 27.11.2026 "Ein Forscher raeumt sein Labor nicht auf" (penicillin): warm, neugierig, DUR.
# Neue Melodie und neue Besetzung (wright: F-Dur 96 bpm Vibraphon/Zupf; apollo: D-Dur 100 bpm Marimba/Glockenspiel):
#   G-Dur, 92 bpm, nur reine Dur-Dreiklaenge:  G - C - G - D | G - C - D - G   (I - IV - I - V | I - IV - V - I)
# Instrumente:
#   - Gitarre: Wechselbass Grundton-Quinte auf jedem Viertel, dazu federndes Ukulele-Schlagmuster (ab, ab, auf, auf, ab, auf)
#   - leiser Shaker auf allen Achteln
#   - Floete (Melodie): Fragen-Motiv, das aufsteigt und auf Terz/Quinte landet
#   - ganz leiser Besen-Wisch auf 2 und 4, Glockenspiel-Funken nur an zwei Stellen, Pad standardmaessig aus (PADG)
# earshot 26.11.: Fassung 1 (Fingerpicking + Pad + viel Hall, 88 bpm) las sich 'sad and melancholic' z 2,8 -> verworfen.
#   Endfassung (Standardwerte BPM=92 RW=0.25 PADG=0 GB=0.3 FLG=0.6 GLK=0.5): alle 9-s-Fenster 'celebratory and joyful' / 'uplifting and hopeful',
#   'sad' in keinem Fenster unter den Stimmungs-Treffern; ueber die ganze Datei 'sad' nur schwach (z 2,4, Rang 9) hinter 'uplifting' (Rang 6).
#   Stellschrauben per Umgebung: BPM, RW (Hall), PADG, GB (Helligkeit Gitarre), FLG (Floete), GLK (Glockenspiel), STRUM=0, SHAK=0
# Dramaturgie nach data/timeline.json:
#   hook .. schale:        Gitarre + Floete Motiv 1
#   neugierig .. folge:    + Glockenspiel-Funken (Fleming wird neugierig)
#   kaum .. oxford:        leise: nur Gitarre (leiser, ohne Shaker), keine Floete (niemand interessiert sich)
#   krieg .. nobel:        voll, Floete Motiv 2 hoeher, Besen, Funken beim Nobelpreis
#   frage:                 duenn: nur Gitarre
#   outro:                 Gitarre + Floete, Schluss G-Dur auf "folgen"
# KUERZBAR: --laenge S (Zonen proportional gestaucht, Schluss-Akkord bei "folgen" bzw. spaetestens 2,6 s vor dem Ende).
# EQ-Senke 1,9 kHz (-5 dB, Q 0.8) fuer die Stimme.
# Aufruf: python3 ton/music_penicillin.py [--laenge S] [-o datei] -> ton/music_penicillin.wav (Stereo 48 kHz, Spitze -1 dBFS; mix_penicillin.py setzt den Pegel)
import argparse, json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
sys.dont_write_bytecode = True
from dsp import SR, ns, tt, rng, pan, place, modal, fades, make_ir, convolve_st, hp, lp, peq, shelf, widen, write_wav
import instruments as I
ap = argparse.ArgumentParser(); ap.add_argument('--laenge', type=float, default=None); ap.add_argument('-o', default=os.path.join(HERE, 'music_penicillin.wav'))
A = ap.parse_args()
TL = json.load(open(os.path.join(HERE, '..', 'data', 'timeline.json')))
SC = {s['id']: s for s in TL['scenes']}
DUR0 = TL['end']; DUR = A.laenge or DUR0; SK = DUR / DUR0
N = ns(DUR)
BPM = float(os.environ.get('BPM', '92')); PADG = float(os.environ.get('PADG', '0')); RW = float(os.environ.get('RW', '0.25')); GB = float(os.environ.get('GB', '0.3'))
Q = 60 / BPM; E8 = Q / 2; BAR = 4 * Q; F = I.m2f; R = rng(27)
T = lambda t: t * SK
Z = [(T(SC['neugierig']['start']), 'funken'), (T(SC['kaum']['start']), 'leise'), (T(SC['krieg']['start']), 'voll'),
     (T(SC['frage']['start']), 'duenn'), (T(SC['outro']['start']), 'grund')]
T_NOB = T(SC['nobel']['k']['nobel'])
T_END = min(T(SC['outro']['k']['folgen']) + 0.1, DUR - 2.6)
music = np.zeros((2, N)); room = np.zeros((2, N))
def put(x, t, g=1.0, p=0.0, wet=0.25, final=False):
    if t >= DUR - 0.05 or (t >= T_END - 0.02 and not final): return
    if x.ndim == 1: x = pan(x, p)
    place(music, x, t, g); place(room, x, t, g * wet)
def zone(t):
    z = 'grund'
    for (t0, n) in Z:
        if t >= t0 - 0.05: z = n
    return z
G, Cc, D = (43, [59, 62, 67]), (48, [60, 64, 67]), (38, [57, 62, 66])   # G-Dur, C-Dur, D-Dur (eng gelegt)
PROG = [G, Cc, G, D, G, Cc, D, G]
def gtr(m, v, dur=1.1, b=0.38):   # weiche Gitarre: gezupft nahe Mitte
    return I.pluck(F(m), v, R, dur=dur, bright=min(0.9, b + GB), pos=0.28)
STRUM = os.environ.get('STRUM', '1') == '1'; SHAK = os.environ.get('SHAK', '1') == '1'; STRUMS = [0, 2, 3, 5, 6, 7]
PICK = [None, 2, 1, 2, None, 2, 0, 2]   # Diskant-Achtel zwischen den Bassschlaegen
nb = int(np.ceil(DUR / BAR)) + 1
for b in range(nb):
    t = b * BAR; z = zone(t); bass, ch = PROG[b % 8]
    lv = 0.7 if z in ('leise', 'duenn') else 1.0
    for e, iv in ((0, 0), (2, 7), (4, 12), (6, 7)):   # Wechselbass Grundton-Quinte
        te = t + e * E8
        put(gtr(bass + 12 + iv, 0.34 * lv, dur=1.0, b=0.3), te, 0.7, p=-0.15, wet=0.18)
    if STRUM:   # Ukulele-artiges Schlagmuster (ab, ab, auf, auf, ab, auf), kurz und federnd
        for e in STRUMS:
            if z in ('leise', 'duenn') and e in (3, 5): continue
            te = t + e * E8; up = e % 2 == 1; tones = ch[::-1] if up else ch
            for j, m in enumerate(tones):
                put(gtr(m + 12, (0.15 if up else 0.2) * lv, dur=0.32, b=0.6), te + j * 0.012, 0.6, p=0.25 - 0.1 * j, wet=0.2)
    else:
        for e in range(8):
            if PICK[e] is None: continue
            te = t + e * E8
            put(gtr(ch[PICK[e]] + 12, (0.22 if e % 2 else 0.26) * lv, dur=0.9, b=0.45), te, 0.6, p=0.25, wet=0.25)
    if SHAK and z in ('grund', 'funken', 'voll'):   # leiser Shaker auf allen Achteln
        for e in range(8): put(I.brush(0.10 if e % 2 else 0.06, R, dur=0.12), t + e * E8, 0.3, p=0.3, wet=0.1)
    put(I.pad([F(m + 12) for m in ch], BAR - 0.02, PADG * (0.020 if z not in ('leise', 'duenn') else 0.032), R, att=0.7, rel=0.8, warm=1600, detune=5), t, 1.0, wet=0.45)
    if z in ('grund', 'funken', 'voll'):
        for e in (1, 3): put(I.brush(0.16, R, dur=0.32, swish=True), t + e * Q - 0.06, 0.30, p=0.2, wet=0.2)
    if z == 'funken' or (z == 'voll' and abs(t - T_NOB) < 2 * BAR):
        for e, iv in ((3, 2), (7, 1)): put(I.glock(F(ch[iv] + 24), 0.18, R, dur=1.4), t + e * E8, 0.45 * float(os.environ.get('GLK', '0.5')), p=0.35, wet=0.5)
# Floeten-Motive (G-Dur): (Achtel-Position im 2-Takt-Bogen, Laenge in Achteln, MIDI)
MOT = [(0, 2, 74), (2, 1, 76), (3, 1, 79), (4, 3, 83), (8, 2, 81), (10, 1, 79), (11, 1, 81), (12, 4, 83)]
MOT2 = [(0, 2, 79), (2, 1, 81), (3, 1, 83), (4, 3, 86), (8, 2, 88), (10, 1, 86), (11, 1, 83), (12, 4, 86)]
loop = 16 * E8
def melodie(t0m, t1m, mels, g):
    k = 0
    while t0m + k * loop < t1m - 0.3:
        for (e, d, m) in mels[k % len(mels)]:
            tb = t0m + k * loop + e * E8
            if tb >= t1m - 0.3: break
            put(I.fife(F(m), d * E8 * 0.92, 0.32, R), tb, g * float(os.environ.get('FLG', '0.6')), p=0.1 if e % 2 else -0.1, wet=0.4)
        k += 1
melodie(BAR, Z[1][0], [MOT, MOT, MOT2, MOT], 0.42)
melodie(Z[2][0], Z[3][0], [MOT2, MOT], 0.42)
melodie(Z[4][0], T_END, [MOT, MOT2], 0.38)
for i, mm in enumerate((43, 50, 55, 59, 62, 67, 71)):   # G-Dur-Aufloesung (gestrummt)
    put(gtr(mm + 12, 0.34, dur=2.4, b=0.4), T_END + 0.035 * i, 0.8, p=-0.3 + 0.1 * i, wet=0.35, final=True)
put(I.fife(F(83), 1.6, 0.30, R), T_END + 0.05, 0.40, wet=0.5, final=True)
put(I.glock(F(91), 0.22, R, dur=2.2), T_END + 0.4, 0.45, p=0.3, wet=0.5, final=True)
put(I.pad([F(67), F(71), F(74), F(79)], 2.2, 0.035, R, att=0.2, rel=1.2, warm=1600, detune=5), T_END, 1.0, wet=0.5, final=True)
ir = make_ir(1.5, 10, hf=1.0)
wet = convolve_st(room, ir)[:, :N]
wm = np.mean(wet, axis=0); ws = widen(wm, None, ms=13.0, amount=0.8)
wet = 0.6 * wet + 0.4 * ws
out = music + RW * wet
out = lp(hp(out, 80), 15000)
out = shelf(out, 3000, 3.5, 'high')   # hell, nicht duester
out = peq(out, 1900, -5.0, 0.8)   # Senke fuer die Stimme
n0 = ns(DUR - 1.0); out[:, n0:] *= np.linspace(1, 0, N - n0)[None, :] ** 1.5
n1 = ns(0.3); out[:, :n1] *= np.linspace(0, 1, n1)[None, :]
out /= np.max(np.abs(out)) / 0.89
write_wav(A.o, out)
print(os.path.basename(A.o), round(DUR, 2), 's, Schluss-Akkord bei', round(T_END, 2), 's,', BPM, 'bpm G-Dur')
