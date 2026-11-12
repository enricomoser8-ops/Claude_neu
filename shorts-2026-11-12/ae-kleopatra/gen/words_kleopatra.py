# Stimme (Luecken schon geschnitten, 48 kHz Stereo) + Wortzeiten aus der ASR (parakeet, nur Startzeiten) -> data/words.json.
# Jedes Skriptwort bekommt eine Zeit (Abgleich mit difflib; Zahlen sind im Skript ausgeschrieben, in der ASR Ziffern).
# Wortende = naechster Wortanfang (am Satzende: Segmentende der ASR), per Pegel auf echtes Ausklingen gekuerzt.
# Aufruf: python3 words_kleopatra.py
import json, os, re, shutil, difflib
import sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
sys.path.insert(0, os.path.join(ROOT, 'ton'))
from dsp import read_wav
DAY = os.path.join(ROOT, '..')
SRC = os.path.join(DAY, 'audio', 'kleopatra.wav')
ASR = json.load(open(os.path.join(DAY, 'audio', 'kleopatra-asr.json'), encoding='utf-8'))
SCRIPT = open(os.path.join(DAY, 'skripte.md'), encoding='utf-8').read()
TEXT = re.search(r'## Short 1 .*?```\n\[snappy, fast pace\] (.*?)\n```', SCRIPT, re.S).group(1)
WORDS = TEXT.split()
def norm(w): return re.sub(r'[^a-z0-9äöüß]', '', w.lower())
NUMW = {'4500': 'viertausendfünfhundert', '2500': 'zweitausendfünfhundert', '1969': 'neunzehnhundertneunundsechzig', '2000': 'zweitausend', '200': 'zweihundert',
        'äpten': 'ägypten', 'egyptisch': 'ägyptisch', 'vorfahrer': 'vorfahre', 'cheopspyramide': 'cheopspyramide'}
W = []; SEGEND = {}
for seg in ASR:
    for j, w in enumerate(seg['words']):
        W.append([NUMW.get(norm(w['w']), norm(w['w'])), w['t']])
        if j == len(seg['words']) - 1: SEGEND[len(W) - 1] = seg['e']
a = [norm(w) for w in WORDS]; b = [w[0] for w in W]
sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
S = [None] * len(WORDS); E = [None] * len(WORDS); bad = []
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag == 'equal' or (tag == 'replace' and i2 - i1 == j2 - j1):
        for k in range(i2 - i1):
            S[i1 + k] = W[j1 + k][1]; E[i1 + k] = SEGEND.get(j1 + k)
            if tag == 'replace': bad.append((WORDS[i1 + k], W[j1 + k][0]))
    else: bad.append((tag, WORDS[i1:i2], b[j1:j2]))
assert all(s is not None for s in S), [WORDS[i] for i, s in enumerate(S) if s is None]
x, sr = read_wav(SRC); assert sr == 48000
mono = x.mean(axis=0); fr = 480
db = np.array([20 * np.log10(np.sqrt(np.mean(mono[i:i + fr] ** 2)) + 1e-9) for i in range(0, len(mono) - fr, fr)])
def quiet_after(t0, t1):   # erstes stilles 10-ms-Fenster (< -45 dBFS) nach t0 + 0.12 s, sonst t1
    i0, i1 = int((t0 + 0.12) * 100), int(t1 * 100)
    for i in range(i0, min(i1, len(db))):
        if db[i] < -45: return round(i / 100 + 0.02, 3)
    return t1
T = []
for i, w in enumerate(WORDS):
    nxt = S[i + 1] if i + 1 < len(WORDS) else len(mono) / sr
    e = E[i] if E[i] is not None else nxt
    e = min(e, nxt) if i + 1 < len(WORDS) else e
    if w[-1] in '.?!:,': e = quiet_after(S[i], e)
    T.append({'w': w, 's': round(S[i], 3), 'e': round(max(e, S[i] + 0.08), 3)})
shutil.copy(SRC, os.path.join(ROOT, 'audio', 'kleopatra_voice.wav'))
json.dump(T, open(os.path.join(ROOT, 'data', 'words.json'), 'w'), ensure_ascii=False, indent=0)
print(len(WORDS), 'Woerter, Abweichungen:', bad, '| Stimme %.2f s' % (len(mono) / sr))
