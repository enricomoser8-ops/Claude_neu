# Endmischung Roosevelt-Short 17.11.2026 (Vox-Ton nach Chris Moran, Vorlage: Mischung des Stewardess-Shorts 16.11.):
#   Stimme: audio/roosevelt_voice.wav unveraendert (nur Stille am Anfang/Ende gekuerzt, keine Luecke geschnitten).
#   Musik: eigene Komposition (ton/music.wav), "Frequency Pocket" = breite Peaking-Senke 1,9 kHz, Q 0,3, -8 dB, 14,5 LU unter der Stimme (neu 17.11., vorher 17),
#          -3 dB Ducking waehrend gesprochen wird.
#   SFX (ton/sfx.wav von sfx_roosevelt.py): Pegel gegen die Stimm-Spitzen gesetzt: die Hauptereignisse (db >= -4) liegen im Median
#          8 dB unter den Stimm-Spitzen (95. Perzentil der 50-ms-RMS beim Sprechen), keins darf naeher als 5 dB kommen; Texturen
#          liegen durch ihr db in sfx_roosevelt.py 6-10 dB tiefer.
#   SFX-Sprachband-Tasche: 1-4 kHz der SFX bis -6 dB, solange gesprochen wird.
#   Ende: -14 LUFS integriert, True Peak <= -1 dBTP (Limiter-Decke -1,3), 48 kHz Stereo 24 bit, exakt so lang wie die Master-Comp (data/timeline.json end).
# Aufruf: python3 ton/mix_roosevelt.py [music_LU=14.5] [sfx_unter_stimme_dB=8] [pocket_dB=-8]
import json, os, sys
sys.dont_write_bytecode = True
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from dsp import SR, read_wav, write_wav, integrated, peq, true_peak
from scipy.signal import resample_poly
from scipy.ndimage import minimum_filter1d
MU = float(sys.argv[1]) if len(sys.argv) > 1 else 14.5
SU = float(sys.argv[2]) if len(sys.argv) > 2 else 8.0
PK = float(sys.argv[3]) if len(sys.argv) > 3 else -8.0
ROOT = os.path.join(HERE, '..')
TL = json.load(open(os.path.join(ROOT, 'data', 'timeline.json')))
N = int(round(TL['end'] * SR))
st = lambda x: x if x.shape[0] == 2 else np.vstack([x[0], x[0]])
fit = lambda x: np.pad(x, ((0, 0), (0, max(0, N - x.shape[1]))))[:, :N]
voice, sr = read_wav(os.path.join(ROOT, 'audio', 'roosevelt_voice.wav')); assert sr == SR, sr
mus, _ = read_wav(os.path.join(HERE, 'music.wav')); sfx, _ = read_wav(os.path.join(HERE, 'sfx.wav'))
voice, mus, sfx = (fit(st(x)) for x in (voice, mus, sfx))

# --- Musik: Frequency Pocket + Pegel + Ducking ---
mus = np.vstack([peq(mus[0], 1900, PK, 0.3), peq(mus[1], 1900, PK, 0.3)])
ctrl = 1000; act = np.zeros(int(N / SR * ctrl) + 2)
for s, e in TL['words']: act[max(0, int((s - 0.08) * ctrl)): int((e + 0.1) * ctrl)] = 1
env = np.zeros_like(act); v = 0.0
for i, a in enumerate(act): v += (a - v) * (0.014 if a > v else 0.0022); env[i] = v
duck = 10 ** (-3.0 * np.interp(np.arange(N) / SR, np.arange(len(env)) / ctrl, env) / 20)
Lv = integrated(voice)
mus = mus * duck[None, :]
mus = mus * 10 ** ((Lv - MU - integrated(mus)) / 20)          # MU LU unter der Stimme, gemessen NACH dem Ducking

# --- SFX: Sprachband-Tasche beim Sprechen (wie der Pocket auf der Musik): 1-4 kHz der SFX gehen um bis zu 6 dB runter,
#     solange gesprochen wird; Anschlag, Tiefe und Glanz ueber 4 kHz bleiben (taktil hoerbar, Stimme bleibt vorne) ---
from dsp import bp as _bp
sb = np.vstack([_bp(sfx[0], 1000, 4000), _bp(sfx[1], 1000, 4000)])
sfx = (sfx - sb) + sb * (10 ** (-6.0 * np.interp(np.arange(N) / SR, np.arange(len(env)) / ctrl, env) / 20))[None, :]
# --- SFX gegen die Stimm-Spitzen ---
def rms50(x):
    m = np.mean(x, axis=0) ** 2; w = int(0.05 * SR)
    return np.sqrt(np.convolve(m, np.ones(w) / w, mode='same') + 1e-12)
db = lambda a: 20 * np.log10(max(a, 1e-9))
rv = rms50(voice); speak = np.zeros(N, bool)
for s, e in TL['words']: speak[int(s * SR):int(e * SR)] = True
V_REF = db(np.percentile(rv[speak], 95))
SE = json.load(open(os.path.join(HERE, 'sfx_events.json')))
rs = rms50(sfx)
def ev_peak(e):
    a, b = int(max(0, e['start'] - 0.01) * SR), int((e['t'] + 0.35) * SR)
    return db(rs[a:b].max())
mains = [e for e in SE['events'] if e['db'] >= -4]
pk = np.array([ev_peak(e) for e in mains])
g = V_REF - SU - np.median(pk)
g = min(g, V_REF - 5.0 - pk.max())          # kein Hauptereignis naeher als 5 dB an die Stimm-Spitzen
sfx = sfx * 10 ** (g / 20)
mix = voice + mus + sfx

# --- Lautheit -14 LUFS, True Peak: Look-ahead-Limiter (4x ueberabgetastet, 5 ms Vorlauf, 60 ms Release), iterativ ---
def limit(x, ceil_db=-1.3):
    ceil = 10 ** (ceil_db / 20)
    up = np.abs(resample_poly(x, 4, 1, axis=-1)).max(axis=0)
    env = up[:4 * x.shape[1]].reshape(-1, 4).max(axis=1)
    gg = np.minimum(1.0, ceil / np.maximum(env, 1e-9))
    gg = minimum_filter1d(gg, size=int(0.005 * SR) * 2 + 1)
    rel = np.exp(-1 / (0.06 * SR)); out = np.empty_like(gg); v = 1.0
    for i in range(len(gg)):
        v = gg[i] if gg[i] < v else gg[i] + (v - gg[i]) * rel
        out[i] = v
    k = int(0.002 * SR); sm = np.convolve(out, np.ones(k) / k, mode='same')
    return x * np.minimum(out, sm)[None, :]
for it in range(8):
    mix *= 10 ** ((-14.0 - integrated(mix)) / 20)
    mix = limit(mix)
    if abs(integrated(mix) + 14.0) < 0.1 and true_peak(mix) <= -1.05: break
assert mix.shape == (2, N)
write_wav(os.path.join(ROOT, 'audio', 'roosevelt_mix.wav'), mix)
# --- Messwerte (nach dem Endpegel, gleiche Verstaerkung auf alle Spuren) ---
G = np.sqrt(np.mean(mix ** 2)) / np.sqrt(np.mean((voice + mus + sfx) ** 2))
Lv2, Lm2, Ls2 = integrated(voice * G), integrated(mus * G), integrated(sfx * G)
pk2 = pk + g
rep = dict(lufs=round(integrated(mix), 2), true_peak_dbtp=round(true_peak(mix), 2), dauer_s=N / SR, sr=SR,
           stimme_lufs=round(Lv2, 1), musik_lufs=round(Lm2, 1), stimme_minus_musik_lu=round(Lv2 - Lm2, 1), sfx_lufs=round(Ls2, 1),
           stimme_spitzen_dbfs_50ms=round(V_REF, 1), sfx_haupt_median_unter_stimme_db=round(V_REF - np.median(pk2), 1),
           sfx_haupt_lautestes_unter_stimme_db=round(V_REF - pk2.max(), 1), sfx_haupt_leisestes_unter_stimme_db=round(V_REF - pk2.min(), 1),
           pocket=dict(f_hz=1900, q=0.3, gain_db=PK), musik_unter_stimme_lu_soll=MU)
# Sprachklarheit: in jedem 50-ms-Fenster beim Sprechen Abstand Stimme -> (Musik + SFX), auch nur im Sprachband 1-4 kHz
from dsp import bp
bed = mus + sfx; wv = rms50(voice)[speak]; wb = rms50(bed)[speak]
d = 20 * np.log10(wv / wb); vb = np.vstack([bp(voice[0], 1000, 4000), bp(voice[1], 1000, 4000)]); bb = np.vstack([bp(bed[0], 1000, 4000), bp(bed[1], 1000, 4000)])
d2 = 20 * np.log10(rms50(vb)[speak] / rms50(bb)[speak])
loud = wv > np.percentile(wv, 25)   # Pausen innerhalb der Woerter nicht mitzaehlen
rep['sprache_abstand_db'] = dict(median=round(float(np.median(d[loud])), 1), p5=round(float(np.percentile(d[loud], 5)), 1), anteil_unter_6db=round(float(np.mean(d[loud] < 6)), 3),
                                 band_1_4khz_median=round(float(np.median(d2[loud])), 1), band_1_4khz_p5=round(float(np.percentile(d2[loud], 5)), 1))
json.dump(rep, open(os.path.join(HERE, 'mix_messung.json'), 'w'), indent=1)
print(json.dumps(rep, ensure_ascii=False))
