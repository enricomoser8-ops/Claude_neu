# Eigene Musik fuer den Short 26.11.2026 "Der erste Flug dauerte zwoelf Sekunden" (wright): ruhig, warm, leicht neugierig, DUR, nur ein ganz leiser Besen als Puls.
# Neue Melodie (nicht die Apollo-Melodie): F-Dur, 96 bpm, nur reine Dur-Dreiklaenge:
#   F - C - Bb - F | F - Bb - C - F    (I - V - IV - I | I - IV - V - I)
# Instrumente (anders als Apollo: dort D-Dur 100 bpm Marimba/Glockenspiel):
#   - Vibraphon: Achtel-Arpeggio, kurz gedaempft (beweglich, neugierig)
#   - Zupf (Pizzicato): Viertel-Puls Grundton-Quinte-Oktave-Quinte, dazu leise Offbeat-Zupfer
#   - Melodie: Zupf + Vibraphon (MEL=pluck|vibes|mix|musicbox, Standard mix), aufsteigendes Fragen-Motiv, endet auf Dur-Terz/Quinte
#   - ganz leiser Besen auf 2 und 4 (BRUSH=0 schaltet ihn ab), hohes, sehr leises Dur-Pad
# earshot 25.11. (Fassung 4): Stimmungs-Hinweis nur "uplifting and hopeful" (z 2,2), "sad" z 1,9 (kein Treffer);
#   Fassung 1-3 (Spieluhr/Viertel-Arpeggio, tiefes Pad) lasen sich "sad and melancholic" z 2,3-2,7 und wurden verworfen.
# EQ-Senke 1,9 kHz (-5 dB, Q 0.8) fuer die Stimme.
# Dramaturgie nach data/timeline.json:
#   hook .. ort:            alles, Motiv 1
#   brueder .. absturz:     Arpeggio + Zupf, Motiv leise (Muenzwurf, Absturz)
#   folge .. letzter:       voll, Motiv 2 (steigt hoeher: der Flug klappt)
#   wind:                   nur Pad + Zupf (der Windstoss, kurz still)
#   mond .. outro:          voll + Glockenspiel-Funkeln (Mond, Mars), Schluss F-Dur auf "folgen"
# KUERZBAR: --laenge S (Zonen werden proportional gestaucht, Schluss-Akkord bei "folgen" bzw. spaetestens 2,6 s vor dem Ende).
# Aufruf: python3 ton/music_wright.py [--laenge S] [-o datei] -> ton/music_wright.wav (Stereo 48 kHz, Spitze -1 dBFS; mix_wright.py setzt den Pegel)
import argparse, json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
sys.dont_write_bytecode = True
from dsp import SR, ns, tt, rng, pan, place, modal, fades, make_ir, convolve_st, hp, lp, peq, shelf, widen, write_wav
import instruments as I
ap = argparse.ArgumentParser(); ap.add_argument('--laenge', type=float, default=None); ap.add_argument('-o', default=os.path.join(HERE, 'music_wright.wav'))
A = ap.parse_args()
TL = json.load(open(os.path.join(HERE, '..', 'data', 'timeline.json')))
SC = {s['id']: s for s in TL['scenes']}
DUR0 = TL['end']; DUR = A.laenge or DUR0; SK = DUR / DUR0
N = ns(DUR)
MEL = os.environ.get('MEL', 'mix'); BRUSH = os.environ.get('BRUSH', '1') == '1'
Q = 60 / 96; E8 = Q / 2; BAR = 4 * Q; F = I.m2f; R = rng(26)
T = lambda t: t * SK
T_LEISE0, T_LEISE1 = T(SC['brueder']['start']), T(SC['folge']['start'])
T_WIND0, T_WIND1 = T(SC['wind']['start']), T(SC['mond']['start'])
T_END = min(T(SC['outro']['k']['folgen']) + 0.1, DUR - 2.6)   # k = absolute Zeiten

music = np.zeros((2, N)); room = np.zeros((2, N))
def put(x, t, g=1.0, p=0.0, wet=0.25, final=False):
    if t >= DUR - 0.05 or (t >= T_END - 0.02 and not final): return
    if x.ndim == 1: x = pan(x, p)
    place(music, x, t, g); place(room, x, t, g * wet)
def zone(t):
    if T_LEISE0 - 0.05 <= t < T_LEISE1 - 0.05: return 'leise'
    if T_WIND0 - 0.05 <= t < T_WIND1 - 0.05: return 'wind'
    if t >= T_WIND1 - 0.05: return 'funkeln'
    return 'grund'
Fd, C, Bb = (41, [60, 65, 69]), (36, [60, 64, 67]), (46, [62, 65, 70])   # F-Dur, C-Dur, B-Dur (reine Dreiklaenge, eng gelegt)
PROG = [Fd, C, Bb, Fd, Fd, Bb, C, Fd]
ARP8 = [0, 1, 2, 1, 2, 1, 0, 2]                     # Achtel-Arpeggio (beweglich, neugierig)
# Motive (F-Dur, neugierig aufsteigend): (Achtel-Position im 2-Takt-Bogen, Laenge in Achteln, MIDI)
MOT = [(0, 2, 72), (2, 1, 74), (3, 1, 77), (4, 3, 81), (8, 2, 79), (10, 1, 77), (11, 1, 79), (12, 4, 81)]
MOT2 = [(0, 2, 77), (2, 1, 79), (3, 1, 81), (4, 3, 84), (8, 2, 86), (10, 1, 84), (11, 1, 81), (12, 4, 84)]
nb = int(np.ceil(DUR / BAR)) + 1
for b in range(nb):
    t = b * BAR; z = zone(t); bass, ch = PROG[b % 8]
    for e in range(8):
        te = t + e * E8; ze = zone(te)
        if ze == 'wind': continue
        nt = ch[ARP8[e]] + 12
        v = (0.36 if e % 2 == 0 else 0.24) * (0.75 if ze == 'leise' else 1.0)
        put(I.vibes(F(nt), v, R, dur=0.7, trem_depth=0.08), te, 0.85, p=-0.3 if e % 2 else 0.3, wet=0.25)
    for e, iv in enumerate((0, 7, 12, 7)):
        if z == 'wind' and e % 2: continue
        put(I.pluck(F(bass + 12 + iv), 0.26 if e == 0 else 0.2, R, dur=0.45, bright=0.55, pos=0.2), t + e * Q, 0.55, p=0.0 if e == 0 else 0.15, wet=0.15)
    if z in ('grund', 'funkeln'):   # Offbeat-Zupfer (hell, verspielt)
        for e in range(4): put(I.pluck(F(ch[(e + 1) % 3] + 12), 0.12, R, dur=0.25, bright=0.7, pos=0.15), t + e * Q + E8, 0.4, p=-0.35, wet=0.2)
    put(I.pad([F(m + 12) for m in ch], BAR - 0.02, 0.015 if z != 'wind' else 0.035, R, att=0.6, rel=0.7, warm=1800, detune=6), t, 1.0, wet=0.45)
    if z in ('grund', 'funkeln') and BRUSH:   # ganz leiser Besen auf 2 und 4 (Puls, kein Schlagzeug-Groove)
        for e in (1, 3): put(I.brush(0.22, R, dur=0.25), t + e * Q, 0.35, p=0.2, wet=0.2)
    if z == 'funkeln':
        put(I.glock(F(ch[2] + 24), 0.22, R, dur=1.4), t + 3 * E8, 0.5, p=0.35, wet=0.5)
loop = 16 * E8
for (t0m, t1m, mel, g) in ((BAR, T_LEISE0, MOT, 0.40), (T_LEISE0 + BAR, T_LEISE1, MOT, 0.26), (T_LEISE1, T_WIND0, MOT2, 0.40), (T_WIND1, T_END, MOT2, 0.40)):
    k = 0
    while t0m + k * loop < t1m - 0.3:
        for (e, d, m) in (mel if k % 2 == 0 else (MOT2 if mel is MOT else MOT)):
            tb = t0m + k * loop + e * E8
            if tb >= t1m - 0.3: break
            pp = 0.12 if e % 2 else -0.12
            if MEL in ('pluck', 'mix'): put(I.pluck(F(m), 0.5, R, dur=min(1.0, d * E8 + 0.35), bright=0.62, pos=0.18), tb, g * 1.0, p=pp, wet=0.3)
            if MEL in ('vibes', 'mix'): put(I.vibes(F(m), 0.45, R, dur=min(1.4, d * E8 + 0.5), trem_depth=0.12), tb, g * (0.55 if MEL == 'mix' else 1.0), p=-pp, wet=0.35)
            if MEL == 'musicbox': put(I.musicbox(F(m), 0.42, R, dur=min(1.2, d * E8 + 0.4)), tb, g * 0.8, p=pp, wet=0.35)
        k += 1
for i, mm in enumerate((53, 57, 60, 65, 69, 72, 77)):   # F-Dur-Aufloesung
    put(I.vibes(F(mm + 12), 0.36, R, dur=2.2), T_END + 0.05 * i, 0.85, p=-0.3 + 0.1 * i, wet=0.4, final=True)
put(I.pluck(F(41 + 12), 0.3, R, dur=1.6, bright=0.45, pos=0.2), T_END, 0.8, wet=0.3, final=True)
put(I.musicbox(F(84), 0.4, R, dur=2.4), T_END + 0.35, 0.5, wet=0.5, final=True)
put(I.pad([F(65), F(69), F(72), F(77)], 2.2, 0.035, R, att=0.2, rel=1.2, warm=1800, detune=6), T_END, 1.0, wet=0.5, final=True)
ir = make_ir(1.6, 9, hf=1.0)
wet = convolve_st(room, ir)[:, :N]
wm = np.mean(wet, axis=0); ws = widen(wm, None, ms=13.0, amount=0.8)
wet = 0.6 * wet + 0.4 * ws
out = music + 0.55 * wet
out = lp(hp(out, 90), 15000)
out = shelf(out, 3000, 4.5, 'high')   # hell, nicht duester
out = peq(out, 1900, -5.0, 0.8)   # Senke fuer die Stimme
n0 = ns(DUR - 1.0); out[:, n0:] *= np.linspace(1, 0, N - n0)[None, :] ** 1.5
n1 = ns(0.3); out[:, :n1] *= np.linspace(0, 1, n1)[None, :]
out /= np.max(np.abs(out)) / 0.89
write_wav(A.o, out)
print(os.path.basename(A.o), round(DUR, 2), 's, Schluss-Akkord bei', round(T_END, 2), 's, 96 bpm')
