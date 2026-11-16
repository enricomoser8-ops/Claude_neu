# Stimme + Wortzeiten (Short 16.11.2026 "Die Frau, die drei Schiffsungluecke ueberlebte", key jessop).
# enno 16.11.: KEINE Luecken mehr schneiden. Die Aufnahme ../../audio/jessop.mp3 (ElevenLabs, 53,3 s) bleibt wie sie ist,
# nur Stille am Anfang (bis 0,02 s vor dem ersten Laut) und am Ende (0,25 s nach dem letzten Laut) wird abgeschnitten.
#   -> ../audio/jessop_voice.wav (48 kHz Stereo)
# ASR: faster-whisper "medium" (de, Wortzeiten) -> ../../audio/jessop-asr.json (Aufruf: gen/asr_whisper.py, siehe README).
# Abgleich mit dem Skript (../../skripte.md): Wortanfaenge, die in einer Pause liegen (Whisper haengt Pausen an das naechste
# Wort), werden an das Pausenende gezogen; Wortenden an den Pausenanfang. -> ../data/words.json, ../data/text_gesprochen.txt
import json, os, re, sys, subprocess, difflib
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..'); DAY = os.path.join(ROOT, '..')
sys.path.insert(0, os.path.join(ROOT, 'ton'))
from dsp import read_wav, write_wav
SR = 48000
TEXT = ('Diese Frau saß auf der Titanic, als sie sank. Und das war nicht mal ihr einziges Schiffsunglück. '
        'Sie ist Stewardess und kümmert sich an Bord um die Gäste. Neunzehnhundertelf arbeitet sie auf der Olympic, dem Schwesterschiff der Titanic. '
        'Kurz nach dem Ablegen kracht ein Kriegsschiff in die Seite. Die Olympic bleibt oben. Sieben Monate später: die Titanic. Eisberg. '
        'Ein Offizier drückt ihr ein fremdes Baby in den Arm und schickt sie ins Rettungsboot. Folge, um schlauer zu werden. '
        'Doch das Pech ist nicht vorbei. Im Ersten Weltkrieg ist sie Krankenschwester auf der Britannic, dem dritten Schwesterschiff. '
        'Eine Mine reißt es auf. Ihr Rettungsboot treibt auf die drehenden Schiffsschrauben zu. Sie springt ins Wasser, obwohl sie nicht schwimmen kann. '
        'Und überlebt. Aber das Verrückteste: Danach fährt sie noch viele Jahre weiter zur See. Hättest du dich das getraut? '
        'Du willst dein Allgemeinwissen verbessern? In der Bio findest du ganze Folgen von uns.')
WORDS = TEXT.split()
def norm(w): return re.sub(r'[^a-z0-9äöüß]', '', w.lower())
# ---------- Stimme: nur Anfang/Ende trimmen ----------
src = os.path.join(DAY, 'audio', 'jessop.mp3'); raw = '/tmp/jessop_raw48.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ar', str(SR), '-ac', '2', raw], check=True)
x, sr = read_wav(raw); assert sr == SR
mono = x.mean(axis=0); fr = SR // 100
db = np.array([20 * np.log10(np.sqrt(np.mean(mono[i:i + fr] ** 2)) + 1e-9) for i in range(0, len(mono) - fr, fr)])
v = np.where(db > -45)[0]
a = max(0, int((v[0] / 100 - 0.02) * SR)); b = min(x.shape[1], int((v[-1] / 100 + 0.01 + 0.25) * SR))
OFF = a / SR
out = x[:, a:b].copy(); n = int(0.01 * SR); out[:, -n:] *= np.linspace(1, 0, n)[None, :]
write_wav(os.path.join(ROOT, 'audio', 'jessop_voice.wav'), out)
dur = out.shape[1] / SR
print('Stimme: %.2f s -> %.2f s (Anfang -%.3f s, sonst unveraendert)' % (x.shape[1] / SR, dur, OFF))
# Pausen (< -45 dBFS, >= 0,12 s) in der getrimmten Aufnahme
m2 = out.mean(axis=0)
db2 = np.array([20 * np.log10(np.sqrt(np.mean(m2[i:i + fr] ** 2)) + 1e-9) for i in range(0, len(m2) - fr, fr)])
gaps, s = [], None
for i, q in enumerate(db2 < -45):
    if q and s is None: s = i
    if not q and s is not None:
        if i - s >= 12: gaps.append((s / 100, i / 100))
        s = None
# ---------- ASR-Abgleich ----------
ASR = json.load(open(os.path.join(DAY, 'audio', 'jessop-asr.json'), encoding='utf-8'))
NUMW = {'1911': 'neunzehnhundertelf', 'britannik': 'britannic'}
W = [[NUMW.get(norm(w['w']), norm(w['w'])), w['s'] - OFF, w['e'] - OFF, w['w']] for seg in ASR for w in seg['words']]
A = [norm(w) for w in WORDS]; Bw = [w[0] for w in W]
sm = difflib.SequenceMatcher(None, A, Bw, autojunk=False)
S = [None] * len(WORDS); E = [None] * len(WORDS); diff = []
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag == 'equal' or (tag == 'replace' and i2 - i1 == j2 - j1):
        for k in range(i2 - i1):
            S[i1 + k] = W[j1 + k][1]; E[i1 + k] = W[j1 + k][2]
            if tag == 'replace': diff.append((WORDS[i1 + k], W[j1 + k][3]))
    else: diff.append((tag, WORDS[i1:i2], [w[3] for w in W[j1:j2]]))
assert all(t is not None for t in S), 'Woerter ohne Zeit'
for i in range(len(WORDS)):
    for g0, g1 in gaps:
        if g0 - 0.02 <= S[i] < g1: S[i] = round(g1 - 0.02, 3)
        if g0 < E[i] <= g1 + 0.02: E[i] = round(g0 + 0.03, 3)
T = []
for i, w in enumerate(WORDS):
    e = max(E[i], S[i] + 0.08)
    if i + 1 < len(WORDS): e = min(e, S[i + 1])
    T.append({'w': w, 's': round(max(0, S[i]), 3), 'e': round(e, 3)})
json.dump(T, open(os.path.join(ROOT, 'data', 'words.json'), 'w'), ensure_ascii=False, indent=0)
open(os.path.join(ROOT, 'data', 'text_gesprochen.txt'), 'w', encoding='utf-8').write(TEXT + '\n')
print(len(WORDS), 'Woerter | ASR-Abweichungen zum Skript:', diff or 'keine', '| Pausen', len(gaps))
