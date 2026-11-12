# Wortzeiten fuer die (schon geschnittene) Stimme weltkrieg.wav -> data/words.json
# Quelle: Parakeet-ASR (weltkrieg-asr.json, nur Wortanfaenge), abgeglichen mit dem Skripttext (Schreibweise, Zahlen als Wort).
# Wortende = naechster Wortanfang (hoechstens Anfang + Laenge-Schaetzung), am Satzende = Segmentende.
# Danach Feinkorrektur der Anfaenge am Pegel (Wortanfang nie in Stille, nie mitten im Wort).
import json, os, re, difflib, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
DAY = os.path.join(ROOT, '..')
TEXT = re.search(r'Short 2 .*?```\n\[snappy, fast pace\] (.*?)\n```', open(os.path.join(DAY, 'skripte.md'), encoding='utf-8').read(), re.S).group(1)
WORDS = TEXT.split()
ASR = json.load(open(os.path.join(DAY, 'audio', 'weltkrieg-asr.json'), encoding='utf-8'))
def norm(w): return re.sub(r'[^a-z0-9äöüß]', '', w.lower())
W = []
for seg in ASR:
    for k, w in enumerate(seg['words']):
        W.append({'w': w['w'], 's': w['t'], 'segend': seg['e'] if k == len(seg['words']) - 1 else None})
NUMW = {'1914': 'neunzehnhundertvierzehn', '19jährigen': 'neunzehnjährigen'}
a = [norm(w) for w in WORDS]; b = [NUMW.get(norm(w['w']), norm(w['w'])) for w in W]
sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
T = [None] * len(WORDS); SE = [None] * len(WORDS)
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag == 'equal' or (tag == 'replace' and i2 - i1 == j2 - j1):
        for k in range(i2 - i1): T[i1 + k] = W[j1 + k]['s']; SE[i1 + k] = W[j1 + k]['segend']
    elif tag == 'replace':
        s0 = W[j1]['s']; s1 = W[j2]['s'] if j2 < len(W) else s0 + 0.4 * (i2 - i1)
        for k in range(i2 - i1): T[i1 + k] = s0 + (s1 - s0) * k / (i2 - i1)
        SE[i2 - 1] = W[j2 - 1]['segend']
    print(tag, WORDS[i1:i2], [w['w'] for w in W[j1:j2]]) if tag != 'equal' else None
for i in range(len(T)):
    if T[i] is None:
        p = T[i - 1] if i else 0.0; q = next((T[j] for j in range(i + 1, len(T)) if T[j] is not None), p + 0.5)
        T[i] = (p + q) / 2; print('ohne Zeit:', WORDS[i])
# Pegel fuer Feinkorrektur
wf = wave.open(os.path.join(DAY, 'audio', 'weltkrieg.wav')); sr = wf.getframerate(); n = wf.getnframes()
x = np.frombuffer(wf.readframes(n), dtype=np.int16 if wf.getsampwidth() == 2 else np.int32).reshape(-1, wf.getnchannels()).mean(axis=1)
x = x / np.max(np.abs(x)); fr = int(0.01 * sr)
lev = np.array([20 * np.log10(np.sqrt(np.mean(x[i:i + fr] ** 2)) + 1e-9) for i in range(0, len(x) - fr, fr)])
DUR = n / sr
def first_sound(t0, t1):
    # erster 10-ms-Block ueber -38 dB im Fenster
    for i in range(max(0, int(t0 * 100)), min(len(lev), int(t1 * 100))):
        if lev[i] > -38: return i / 100
    return None
def onset(t):
    # Satzanfaenge: nach echter Stille (< -60 dB) liegt der hoerbare Anfang oft 0-0,12 s nach der ASR-Zeit
    i0, i1 = max(0, int((t - 0.08) * 100)), min(len(lev), int((t + 0.2) * 100))
    sil = [i for i in range(i0, i1) if lev[i] < -60]
    if not sil: return t, False
    for i in range(sil[-1], i1):
        if lev[i] > -40: return i / 100, True
    return t, False
moved = []
for i in range(len(T)):
    if i > 0 and WORDS[i - 1][-1] not in '.?!,': continue   # nur Satz-/Phrasenanfaenge (davor echte Pause)
    nt, ok = onset(T[i])
    ok = ok and -0.06 <= nt - T[i] <= 0.15 and (i + 1 >= len(T) or nt <= T[i + 1] - 0.06)
    if ok and abs(nt - T[i]) > 0.015: moved.append((WORDS[i], round(nt - T[i], 2))); T[i] = nt
print('Anfaenge am Pegel korrigiert:', len(moved), moved[:40])
out = []
for i, w in enumerate(WORDS):
    s = T[i]
    nxt = T[i + 1] if i + 1 < len(WORDS) else DUR
    if SE[i] is not None: e = min(SE[i], nxt)
    else: e = nxt
    e = min(e, s + 0.12 + 0.075 * len(norm(w)))
    out.append({'w': w, 's': round(s, 3), 'e': round(max(e, s + 0.08), 3)})
json.dump(out, open(os.path.join(ROOT, 'data', 'words.json'), 'w'), ensure_ascii=False, indent=0)
print(len(WORDS), 'Woerter, Stimme %.2f s, letztes Wort endet %.2f' % (DUR, out[-1]['e']))
# Pegel-Check: Satzanfaenge (nach Stille) - wo beginnt hoerbar der Laut?
for i, w in enumerate(out):
    if i == 0 or WORDS[i - 1][-1] in '.?!,':
        fs = first_sound(w['s'] - 0.25, w['s'] + 0.3)
        print('  %-14s ASR %.2f  Pegel %.2f' % (w['w'], w['s'], fs if fs is not None else -1))
