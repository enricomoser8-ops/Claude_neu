# Endmischung Freiheitsstatue-Short: Stimme (Luecken schon geschnitten) + eigene Musik 17 LU unter der Stimme,
# Sprach-Senke 1,9 kHz Q 0,3 -6 dB, -3 dB Ducking waehrend gesprochen wird; SFX 10 LU unter der Stimme. -14 LUFS, -1,5 dBTP.
# Aufruf: python3 mix_freiheit.py [music_LU=17] [sfx_LU=10]
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from dsp import SR, read_wav, write_wav, integrated, peq
MU = float(sys.argv[1]) if len(sys.argv) > 1 else 17.0
SU = float(sys.argv[2]) if len(sys.argv) > 2 else 10.0
ROOT = os.path.join(HERE, '..')
voice, sr = read_wav(os.path.join(ROOT, 'audio', 'freiheit_voice.wav')); assert sr == SR, sr
mus, _ = read_wav(os.path.join(HERE, 'music.wav')); sfx, _ = read_wav(os.path.join(HERE, 'sfx.wav'))
st = lambda x: x if x.shape[0] == 2 else np.vstack([x[0], x[0]])
voice, mus, sfx = map(st, (voice, mus, sfx))
TL = json.load(open(os.path.join(ROOT, 'data', 'timeline.json')))
N = int(TL['end'] * SR)
fit = lambda x: np.pad(x, ((0, 0), (0, max(0, N - x.shape[1]))))[:, :N]
voice, mus, sfx = fit(voice), fit(mus), fit(sfx)
mus = np.vstack([peq(mus[0], 1900, -6, 0.3), peq(mus[1], 1900, -6, 0.3)])   # "Frequency Pocket"
ctrl = 1000; act = np.zeros(int(N / SR * ctrl) + 2)
for s, e in TL['words']: act[max(0, int((s - 0.08) * ctrl)): int((e + 0.1) * ctrl)] = 1
env = np.zeros_like(act); v = 0.0
for i, a in enumerate(act): v += (a - v) * (0.014 if a > v else 0.0022); env[i] = v
duck = 10 ** (-3.0 * np.interp(np.arange(N) / SR, np.arange(len(env)) / ctrl, env) / 20)
Lv = integrated(voice)
mus = mus * 10 ** ((Lv - MU - integrated(mus)) / 20) * duck[None, :]
sfx = sfx * 10 ** ((Lv - SU - integrated(sfx)) / 20)
mix = voice + mus + sfx
# Lautheit -14 LUFS und True Peak <= -1,5 dBTP: Look-ahead-Limiter (4x ueberabgetastete Spitzen, 5 ms Vorlauf, 60 ms Release), iterativ
from scipy.signal import resample_poly
from scipy.ndimage import minimum_filter1d
from dsp import true_peak
def limit(x, ceil_db=-1.6):
    ceil = 10 ** (ceil_db / 20)
    up = np.abs(resample_poly(x, 4, 1, axis=-1)).max(axis=0)
    env = up.reshape(-1, 4).max(axis=1)[:x.shape[1]] if len(up) >= 4 * x.shape[1] else np.pad(up[::4], (0, x.shape[1] - len(up[::4])))
    g = np.minimum(1.0, ceil / np.maximum(env, 1e-9))
    g = minimum_filter1d(g, size=int(0.005 * SR) * 2 + 1)          # Vorlauf: Absenkung beginnt 5 ms frueher
    rel = np.exp(-1 / (0.06 * SR)); out = np.empty_like(g); v = 1.0
    for i in range(len(g)):                                            # sofort runter, langsam zurueck
        v = g[i] if g[i] < v else g[i] + (v - g[i]) * rel
        out[i] = v
    sm = np.convolve(out, np.ones(int(0.002 * SR)) / int(0.002 * SR), mode='same')
    return x * np.minimum(out, sm)[None, :]
for it in range(6):
    mix *= 10 ** ((-14.0 - integrated(mix)) / 20)
    mix = limit(mix)
    if abs(integrated(mix) + 14.0) < 0.1 and true_peak(mix) <= -1.5: break
os.makedirs(os.path.join(ROOT, 'audio'), exist_ok=True)
write_wav(os.path.join(ROOT, 'audio', 'freiheit_mix.wav'), mix)
print(f'Stimme {Lv:.1f}  Musik {integrated(mus):.1f} ({MU} drunter)  SFX {integrated(sfx):.1f}  Ende {integrated(mix):.2f} LUFS, True Peak {true_peak(mix):.2f} dBTP')
