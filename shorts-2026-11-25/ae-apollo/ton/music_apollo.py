# Eigene Musik fuer den Apollo-13-Short (25.11.2026), Fassung 2: LEICHT und HELL (Fassung 1 klang laut earshot "sad/melancholic",
# liegt als ton/music_apollo_v1.wav daneben). Ohne Schlagzeug.
# D-Dur, 100 bpm, nur reine Dur-Dreiklaenge (keine Moll-Akkorde, keine Vorhalte/sus):
#   D - G - A - D | D - G - D - A
# Instrumente:
#   - Marimba: Achtel-Arpeggio
#   - Pizzicato: Grundton auf 1 und 3, leichte Nachschlaege
#   - Glockenspiel: froehliches Pentatonik-Motiv oben
#   - sehr leises, helles Dur-Pad als Luft
# Raum: kurzer heller Hall, dekorreliert -> etwas Weite.
# EQ-Senke 1,9 kHz (-5 dB, Q 0.8) fuer die Stimme.
# Dramaturgie nach data/timeline.json:
#   hook .. weg:            alles, Motiv
#   explosion .. houston:   Arpeggio leiser, nur Viertel, kein Glockenspiel (Spannung, aber weiter Dur)
#   folge .. bauplan:       Arpeggio + Pizzicato, Motiv leise (die Crew bastelt)
#   funk .. landung:        voll, Motiv 2 (steigt hoeher)
#   frage .. outro:         voll, Schluss D-Dur-Aufloesung auf "folgen"
# KUERZBAR: --laenge S (Zonen werden proportional gestaucht, Schluss-Akkord bei "folgen" bzw. spaetestens 2,6 s vor dem Ende).
# Aufruf: python3 ton/music_apollo.py [--laenge S] [-o datei] -> ton/music_apollo.wav (Stereo 48 kHz, Spitze -1 dBFS; mix_apollo.py setzt den Pegel)
import argparse, json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
sys.dont_write_bytecode = True
from dsp import SR, ns, tt, rng, pan, place, modal, fades, make_ir, convolve_st, hp, lp, peq, shelf, widen, write_wav
import instruments as I
ap = argparse.ArgumentParser(); ap.add_argument('--laenge', type=float, default=None); ap.add_argument('-o', default=os.path.join(HERE, 'music_apollo.wav'))
A = ap.parse_args()
TL = json.load(open(os.path.join(HERE, '..', 'data', 'timeline.json')))
SC = {s['id']: s for s in TL['scenes']}
DUR0 = TL['end']; DUR = A.laenge or DUR0; SK = DUR / DUR0
N = ns(DUR)
Q = 60 / 100; E8 = Q / 2; BAR = 4 * Q; F = I.m2f; R = rng(21)
T = lambda t: t * SK
T_PROB0, T_PROB1 = T(SC['explosion']['start']), T(SC['folge']['start'])
T_BAU1 = T(SC['funk']['start'])
T_HELL1 = T(SC['frage']['start'])
T_END = min(T(SC['outro']['k']['folgen']) + 0.1, DUR - 2.6)   # k = absolute Zeiten

def marimba(f, vel=0.6, r=None, dur=0.9):
    """Marimba: Holzstab 1 : 3.93 : 9.2, kurze Abklingzeiten, weicher Schlegel"""
    r = r or rng(0); t = tt(dur); k = (440.0 / f) ** 0.5
    y = modal(dur, [(f, 1.0, 0.45 * k), (f * 3.93, 0.28 * vel, 0.09 * k), (f * 9.2, 0.06 * vel, 0.025)], r)
    y = y + hp(r.standard_normal(len(t)), 2000) * np.exp(-t / 0.0012) * 0.08 * vel
    return fades(y * vel, 0.0008, 0.04)

music = np.zeros((2, N)); room = np.zeros((2, N))
def put(x, t, g=1.0, p=0.0, wet=0.25, final=False):
    if t >= DUR - 0.05 or (t >= T_END - 0.02 and not final): return
    if x.ndim == 1: x = pan(x, p)
    place(music, x, t, g); place(room, x, t, g * wet)
def zone(t):
    if T_PROB0 - 0.05 <= t < T_PROB1 - 0.05: return 'problem'
    if T_PROB1 - 0.05 <= t < T_BAU1 - 0.05: return 'basteln'
    if T_BAU1 - 0.05 <= t < T_HELL1 - 0.05: return 'hell'
    return 'grund'
D, G, AA = (38, [62, 66, 69]), (43, [62, 67, 71]), (45, [61, 64, 69])   # D-Dur, G-Dur, A-Dur (reine Dreiklaenge)
PROG = [D, G, AA, D, D, G, D, AA]
ARP = [0, 1, 2, 3, 2, 1, 2, 3]          # 3 = Grundton eine Oktave hoeher
# Motive (D-Dur-Pentatonik, huepfend): (Achtel-Position im 2-Takt-Bogen, Laenge in Achteln, MIDI)
MOT = [(0, 1, 78), (1, 1, 81), (2, 2, 83), (4, 1, 81), (5, 1, 78), (6, 2, 76), (8, 1, 78), (9, 1, 81), (10, 1, 83), (11, 1, 86), (12, 4, 85)]
MOT2 = [(0, 1, 81), (1, 1, 83), (2, 2, 86), (4, 1, 83), (5, 1, 81), (6, 2, 78), (8, 1, 76), (9, 1, 78), (10, 2, 81), (12, 4, 81)]
nb = int(np.ceil(DUR / BAR)) + 1
for b in range(nb):
    t = b * BAR; z = zone(t); bass, ch = PROG[b % 8]
    tones = ch + [ch[0] + 12]
    for e in range(8):
        te = t + e * E8; ze = zone(te)
        if ze == 'problem' and e % 2: continue
        nt = tones[ARP[e]] + 12
        v = (0.34 if e % 2 == 0 else 0.26) * (0.6 if ze == 'problem' else 0.85 if ze == 'basteln' else 1.0)
        put(marimba(F(nt), v, R, dur=0.8), te, 1.0, p=-0.35 if e % 2 else 0.25, wet=0.25)
    for e in (0, 4):   # Pizzicato-Grundton auf 1 und 3
        put(I.pluck(F(bass + 12), 0.26, R, dur=0.5, bright=0.55, pos=0.2), t + e * E8, 0.5, p=0.0, wet=0.15)
    if z != 'problem':
        for e in (2, 6):   # leichte Pizzicato-Nachschlaege (Akkord, hoch)
            for i, m in enumerate(ch):
                put(I.pluck(F(m + 12), 0.14, R, dur=0.35, bright=0.75, pos=0.12), t + e * E8 + 0.006 * i, 0.55, p=0.4, wet=0.2)
    put(I.pad([F(m + 12) for m in ch], BAR - 0.02, 0.022, R, att=0.5, rel=0.6, warm=2600, detune=7), t, 1.0, wet=0.4)   # helle Luft
loop = 16 * E8
for (t0m, t1m, mel, g) in ((BAR, T_PROB0, MOT, 0.42), (T_PROB1 + BAR, T_BAU1, MOT, 0.30), (T_BAU1, T_HELL1, MOT2, 0.42), (T_HELL1, T_END, MOT, 0.40)):
    k = 0
    while t0m + k * loop < t1m - 0.3:
        for (e, d, m) in (mel if k % 2 == 0 else (MOT2 if mel is MOT else MOT)):
            tb = t0m + k * loop + e * E8
            if tb >= t1m - 0.3: break
            put(I.glock(F(m), 0.38, R, dur=min(1.6, d * E8 + 0.6)), tb, g * 1.15, p=0.15 if e % 2 else -0.15, wet=0.35)
        k += 1
for i, mm in enumerate((50, 54, 57, 62, 66, 69, 74)):   # D-Dur-Aufloesung
    put(marimba(F(mm + 12), 0.36, R, dur=1.4), T_END + 0.05 * i, 0.9, p=-0.3 + 0.1 * i, wet=0.4, final=True)
put(I.pluck(F(50), 0.3, R, dur=1.6, bright=0.5, pos=0.2), T_END, 0.8, wet=0.3, final=True)
put(I.glock(F(86), 0.4, R, dur=2.4), T_END + 0.35, 0.5, wet=0.5, final=True)
put(I.pad([F(62), F(66), F(69), F(74)], 2.2, 0.03, R, att=0.2, rel=1.2, warm=2600, detune=7), T_END, 1.0, wet=0.5, final=True)
ir = make_ir(1.6, 9, hf=1.0)
wet = convolve_st(room, ir)[:, :N]
wm = np.mean(wet, axis=0); ws = widen(wm, None, ms=13.0, amount=0.8)
wet = 0.6 * wet + 0.4 * ws
out = music + 0.55 * wet
out = lp(hp(out, 90), 15000)
out = shelf(out, 3000, 5.0, 'high')   # hell
out = peq(out, 1900, -5.0, 0.8)   # Senke fuer die Stimme
n0 = ns(DUR - 1.0); out[:, n0:] *= np.linspace(1, 0, N - n0)[None, :] ** 1.5
n1 = ns(0.3); out[:, :n1] *= np.linspace(0, 1, n1)[None, :]
out /= np.max(np.abs(out)) / 0.89
write_wav(A.o, out)
print(os.path.basename(A.o), round(DUR, 2), 's, Schluss-Akkord bei', round(T_END, 2), 's, 100 bpm')
