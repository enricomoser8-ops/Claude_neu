# Stimme vorbereiten + Wortzeiten (Short 13.11.2026 "Die Freiheitsstatue war nicht immer gruen", key freiheit).
# 1. Luecken schneiden: ../../audio/freiheit.mp3 (ennos ElevenLabs-Take, roh 55,6 s) -> Stille (< -45 dBFS, 10-ms-Fenster) ab 0,15 s
#    wird auf 0,08 s gekuerzt (je 0,04 s Ausklang/Anlauf bleiben stehen, 4 ms Ueberblendung, Woerter werden nicht angeschnitten).
#    -> ../../audio/freiheit.wav und ../audio/freiheit_voice.wav (48 kHz Stereo)
# 2. ASR (parakeet-tdt-0.6b-v3 ueber ../../../tools/zeitmarken.py) -> ../../audio/freiheit-asr.json
# 3. Abgleich mit dem GESPROCHENEN Text (enno hat Satz 6 umgestellt: "Ein Geruest aus Eisen ... gibt ihr Halt.") -> ../data/words.json
#    Woerter, die die ASR verschluckt ("sogar Geld" -> "sog"), bekommen Zeiten anteilig nach Buchstaben zwischen den Nachbarn.
# Aufruf: python3 words_freiheit.py [asr-ordner, Standard /home/claude/asr]
import json, os, re, sys, subprocess, difflib
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..'); DAY = os.path.join(ROOT, '..')
sys.path.insert(0, os.path.join(ROOT, 'ton'))
from dsp import read_wav, write_wav
ASRDIR = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/asr'
SR = 48000
TEXT = ('Im Hafen von New York steht die Freiheitsstatue. Und sie war nicht immer grün. Am Anfang glänzt sie braun, wie eine neue Kupfermünze. '
        'Denn sie ist aus Kupfer, ein Geschenk von Frankreich an die USA. Die Kupferhaut ist nur so dick wie zwei Münzen. '
        'Ein Gerüst aus Eisen von Gustave Eiffel, dem Mann hinter dem Eiffelturm, gibt ihr Halt. Folge, um schlauer zu werden. '
        'Doch Kupfer reagiert mit Luft und Regen. Langsam bildet sich eine grüne Schicht, die Patina. '
        'Neunzehnhundertsechs ist die Statue schon so grün, dass viele an Rost denken. Der Kongress gibt sogar Geld frei, um sie neu anzustreichen. '
        'Aber die Menschen protestieren. Und Fachleute prüfen die grüne Schicht. Ihr Ergebnis: Die Patina schützt das Kupfer darunter. '
        'Also wird nichts gestrichen, und die Freiheitsstatue bleibt bis heute grün. Welche Farbe findest du schöner, braun oder grün? '
        'Du willst dein Allgemeinwissen verbessern? In der Bio findest du ganze Folgen von uns.')
WORDS = TEXT.split()
def norm(w): return re.sub(r'[^a-z0-9äöüß]', '', w.lower())

# ---------- 1. Luecken schneiden ----------
src = os.path.join(DAY, 'audio', 'freiheit.mp3'); raw = '/tmp/freiheit_raw48.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ar', str(SR), '-ac', '2', raw], check=True)
x, sr = read_wav(raw); assert sr == SR
mono = x.mean(axis=0); fr = SR // 100
db = np.array([20 * np.log10(np.sqrt(np.mean(mono[i:i + fr] ** 2)) + 1e-9) for i in range(0, len(mono) - fr, fr)])
TH, MINGAP, KEEP = -45.0, 0.15, 0.08
runs, s = [], None
for i, q in enumerate(db < TH):
    if q and s is None: s = i
    if not q and s is not None: runs.append((s, i)); s = None
if s is not None: runs.append((s, len(db)))
cuts = []   # [a, b) Samples, die wegfallen
for a, b in runs:
    if (b - a) / 100 < MINGAP: continue
    ta, tb = a / 100, b / 100
    if a == 0: cuts.append((0, int((tb - 0.04) * SR))); continue            # Anfang: 0,04 s Vorlauf
    if b >= len(db) - 1: cuts.append((int((ta + 0.15) * SR), x.shape[1])); continue   # Ende: 0,15 s Ausklang
    cuts.append((int((ta + KEEP / 2) * SR), int((tb - KEEP / 2) * SR)))
XF = int(0.004 * SR); parts = []; pos = 0; tmap = []   # tmap: (alt_start, neu_start) je Stueck
newpos = 0
for a, b in cuts:
    parts.append(x[:, pos:a]); tmap.append((pos / SR, newpos / SR)); newpos += a - pos; pos = b
parts.append(x[:, pos:]); tmap.append((pos / SR, newpos / SR))
out = parts[0]
for p in parts[1:]:
    if p.shape[1] == 0: continue
    n = min(XF, out.shape[1], p.shape[1]); w = np.linspace(0, 1, n)[None, :]
    out = np.concatenate([out[:, :-n], out[:, -n:] * (1 - w) + p[:, :n] * w, p[:, n:]], axis=1)
write_wav(os.path.join(DAY, 'audio', 'freiheit.wav'), out)
write_wav(os.path.join(ROOT, 'audio', 'freiheit_voice.wav'), out)
print('Luecken: %d geschnitten, %.2f s -> %.2f s' % (len(cuts), x.shape[1] / SR, out.shape[1] / SR))

# ---------- 2. ASR ----------
asr_path = os.path.join(DAY, 'audio', 'freiheit-asr.json')
subprocess.run([sys.executable, os.path.join(DAY, '..', '..', 'tools', 'zeitmarken.py'), os.path.join(DAY, 'audio', 'freiheit.wav'), asr_path, ASRDIR],
               check=True, stdout=subprocess.DEVNULL)
ASR = json.load(open(asr_path, encoding='utf-8'))
NUMW = {'1906': 'neunzehnhundertsechs', 'eifelturm': 'eiffelturm', 'gustav': 'gustave', 'eifel': 'eiffel'}
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
    else:
        bad.append((tag, WORDS[i1:i2], b[j1:j2]))
        if tag == 'replace' and j2 > j1: S[i1] = W[j1][1]          # erstes Wort bekommt die ASR-Zeit, Rest wird verteilt
mono2 = out.mean(axis=0)
dur = len(mono2) / SR
# Luecken (verschluckte Woerter) anteilig nach Buchstaben zwischen den bekannten Nachbarn verteilen
i = 0
while i < len(WORDS):
    if S[i] is None:
        j = i
        while j < len(WORDS) and S[j] is None: j += 1
        t0 = S[i - 1]; t1 = S[j] if j < len(WORDS) else dur
        L = [len(norm(w)) for w in WORDS[i - 1:j]]; tot = sum(L)
        acc = 0
        for k in range(i, j):
            acc += L[k - i]; S[k] = round(t0 + (t1 - t0) * acc / tot, 3)
        bad.append(('interpoliert', WORDS[i:j], [S[k] for k in range(i, j)]))
        i = j
    else: i += 1
db2 = np.array([20 * np.log10(np.sqrt(np.mean(mono2[i:i + fr] ** 2)) + 1e-9) for i in range(0, len(mono2) - fr, fr)])
def quiet_after(t0, t1):
    i0, i1 = int((t0 + 0.12) * 100), int(t1 * 100)
    for i in range(i0, min(i1, len(db2))):
        if db2[i] < -45: return round(i / 100 + 0.02, 3)
    return t1
T = []
for i, w in enumerate(WORDS):
    nxt = S[i + 1] if i + 1 < len(WORDS) else dur
    e = E[i] if E[i] is not None else nxt
    e = min(e, nxt) if i + 1 < len(WORDS) else e
    if w[-1] in '.?!:,': e = quiet_after(S[i], e)
    T.append({'w': w, 's': round(S[i], 3), 'e': round(max(e, S[i] + 0.08), 3)})
json.dump(T, open(os.path.join(ROOT, 'data', 'words.json'), 'w'), ensure_ascii=False, indent=0)
open(os.path.join(ROOT, 'data', 'text_gesprochen.txt'), 'w', encoding='utf-8').write(TEXT + '\n')
print(len(WORDS), 'Woerter, Abweichungen:', bad, '| Stimme %.2f s' % dur)
