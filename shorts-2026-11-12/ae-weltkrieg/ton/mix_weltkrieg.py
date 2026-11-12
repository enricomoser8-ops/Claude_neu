# Endmischung: geschnittene Stimme + Musik (19 dB unter der Stimme = 2 dB leiser als der erste F41-Mix (enno 10.11.), Sprach-Senke 1,9 kHz Q 0,3 -6 dB wie bei Chris,
# -3 dB Ducking waehrend gesprochen wird) + Szenen-Geraeusche (10 dB unter der Stimme). -14 LUFS, -1,5 dBTP.
# Aufruf: python3 mix_weltkrieg.py [music_LU=19] [sfx_LU=10]
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from dsp import SR, read_wav, write_wav, integrated, peq, true_peak
MU = float(sys.argv[1]) if len(sys.argv) > 1 else 19.0
SU = float(sys.argv[2]) if len(sys.argv) > 2 else 10.0
ROOT = os.path.join(HERE, '..')
voice, sr = read_wav(os.path.join(ROOT, 'audio', 'weltkrieg_voice.wav')); assert sr == SR, sr
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
# Pegel auf -14 LUFS, dann Look-ahead-Limiter (2 ms) auf -1,5 dBTP (4-fach ueberabgetastet gemessen); 4 Runden
from scipy.ndimage import maximum_filter1d, uniform_filter1d
def limit(x, ceil_db):
    c = 10 ** (ceil_db / 20); w = int(0.002 * SR)
    env = maximum_filter1d(np.max(np.abs(x), axis=0), size=2 * w + 1)
    g = np.minimum(1.0, c / np.maximum(env, 1e-9))
    g = uniform_filter1d(maximum_filter1d(-g, size=w) * -1, size=w)   # erst Minimum halten, dann glaetten
    return x * g[None, :]
for _ in range(4):
    mix *= 10 ** ((-14.0 - integrated(mix)) / 20)
    if true_peak(mix) > -1.6: mix = limit(mix, -1.9)
os.makedirs(os.path.join(ROOT, 'audio'), exist_ok=True)
write_wav(os.path.join(ROOT, 'audio', 'weltkrieg_mix.wav'), mix)
print(f"Stimme {Lv:.1f}  Musik {integrated(mus):.1f} ({MU} drunter)  SFX {integrated(sfx):.1f} ({SU} drunter)  Ende {integrated(mix):.1f} LUFS  True Peak {true_peak(mix):.2f} dBTP  Laenge {mix.shape[1]/SR:.2f} s")
