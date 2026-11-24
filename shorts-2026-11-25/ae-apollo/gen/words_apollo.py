# Wortzeiten fuer das Apollo-13-Short (key apollo, 25.11.2026) -> data/words.json [{w, s, e}] + data/text_gesprochen.txt
# Zwei Wege:
#   python3 gen/words_apollo.py            PLATZHALTER (noch keine Stimme): Zeiten aus dem Sprechblock in ../skripte.md,
#                                          ~2,3 Woerter/s (laengere Woerter dauern laenger), [short pause] = 0,35 s, [pause] = 0,7 s,
#                                          Satzende (. ? !) + 0,15 s.
#   python3 gen/words_apollo.py --asr [stimme]  ECHTE STIMME ("Audio da"): ../audio-apollo/voice.mp3 (oder [stimme]) + data/words_whisper.json
#                                          (vorher python3 gen/asr_apollo.py [stimme]: faster-whisper small, Wortzeiten) -> audio/apollo_voice.wav (Stille vorn/hinten weg)
#                                          und Abgleich Whisper <-> Skript (difflib), Luecken interpoliert.
# Danach immer: python3 gen/gen_apollo.py (Szenenzeiten kommen NUR aus data/words.json).
import json, os, re, sys, difflib, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..'))
SKRIPT = os.path.join(ROOT, '..', 'skripte.md')
WPS, P_KURZ, P_LANG, SATZ = 2.3, 0.35, 0.7, 0.15

def sprechblock():
    md = open(SKRIPT, encoding='utf-8').read()
    i = md.index('ElevenLabs-Block'); a = md.index('```', i) + 3; b = md.index('```', a)
    return md[a:b].strip()

def tokens(block):
    """Woerter mit Pausen-Markern: [short pause] / [pause]; Regie-Tags wie [calm, ...] fallen weg"""
    out = []
    for m in re.finditer(r'\[([^\]]+)\]|(\S+)', block):
        if m.group(1) is not None:
            tag = m.group(1).strip().lower()
            if tag == 'short pause': out.append(('P', P_KURZ))
            elif tag == 'pause': out.append(('P', P_LANG))
        else: out.append(('W', m.group(2)))
    return out

def norm(w): return re.sub(r'[^a-z0-9äöüß]', '', w.lower())

def platzhalter():
    T = tokens(sprechblock()); W = [t[1] for t in T if t[0] == 'W']
    # Laengen-Gewicht: Silben grob ueber Vokalgruppen, mindestens 1; Mittel ergibt genau 2,3 Woerter/s
    syl = [max(1, len(re.findall(r'[aeiouäöüy]+', norm(w)))) for w in W]
    g = [0.55 + 0.45 * s for s in syl]; k = (len(W) / WPS) / sum(g)
    t = 0.12; words = []; wi = 0
    for typ, v in T:
        if typ == 'P': t += v; continue
        d = g[wi] * k; s = t; e = t + d * 0.9
        words.append({'w': v, 's': round(s, 3), 'e': round(e, 3)}); t += d
        if re.search(r'[.?!]$', v): t += SATZ
        wi += 1
    return W, words, t + 0.3

def asr():
    import numpy as np
    SR = 48000; i = sys.argv.index('--asr')
    src = os.path.abspath(sys.argv[i + 1]) if len(sys.argv) > i + 1 else os.path.join(ROOT, '..', 'audio-apollo', 'voice.mp3')   # gleiche Datei wie bei asr_apollo.py
    W = [t[1] for t in tokens(sprechblock()) if t[0] == 'W']
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ar', str(SR), '-ac', '2', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).reshape(-1, 2).copy(); mono = x.mean(1); fr = SR // 100
    db = np.array([20 * np.log10(np.sqrt(np.mean(mono[i:i + fr] ** 2)) + 1e-9) for i in range(0, len(mono) - fr, fr)])
    v = np.where(db > -45)[0]
    a = max(0, int((v[0] / 100 - 0.02) * SR)); b = min(len(x), int((v[-1] / 100 + 0.26) * SR)); OFF = a / SR
    out = x[a:b].copy(); n = int(0.01 * SR); out[-n:] *= np.linspace(1, 0, n)[:, None]
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le',
                    os.path.join(ROOT, 'audio', 'apollo_voice.wav')], input=out.astype(np.float32).tobytes(), check=True)
    dur = len(out) / SR
    wj = os.path.join(ROOT, 'data', 'words_whisper.json')   # von gen/asr_apollo.py
    if not os.path.exists(wj): wj = os.path.join(ROOT, '..', 'audio-apollo', 'words_whisper.json')
    ASR = json.load(open(wj, encoding='utf-8'))
    # Whisper schreibt Zahlen oft als Ziffern: auf die Skriptwoerter abbilden
    MAP = {'1970': ['neunzehnhundertsiebzig'], '13': ['dreizehn'], '300000': ['dreihunderttausend'], '300': ['dreihunderttausend'], '2': ['zwei'], '3': ['drei']}
    W2 = []
    for w in ASR:
        t = norm(w['w'])
        if not t: continue
        W2.append([MAP.get(t, [t])[0], w['s'] - OFF, w['e'] - OFF, w['w']])
    A = [norm(w) for w in W]; B = [w[0] for w in W2]
    sm = difflib.SequenceMatcher(None, A, B, autojunk=False)
    S = [None] * len(W); E = [None] * len(W); diff = []
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'equal' or (tag == 'replace' and i2 - i1 == j2 - j1):
            for q in range(i2 - i1):
                S[i1 + q] = W2[j1 + q][1]; E[i1 + q] = W2[j1 + q][2]
                if tag == 'replace': diff.append((W[i1 + q], W2[j1 + q][3]))
        else: diff.append(('OP ' + tag, ' '.join(W[i1:i2]) + ' | ' + ' '.join(B[j1:j2])))
    for q in range(len(W)):   # Luecken (z. B. "dreihunderttausend" als zwei ASR-Woerter) interpolieren
        if S[q] is None:
            p = max([j for j in range(q) if E[j] is not None] or [0]); r = min([j for j in range(q + 1, len(W)) if S[j] is not None] or [len(W) - 1])
            S[q] = E[p] if E[p] is not None else 0; E[q] = S[r] if S[r] is not None else dur
    words = [{'w': W[q], 's': round(max(0, S[q]), 3), 'e': round(max(E[q], S[q] + 0.05), 3)} for q in range(len(W))]
    print('Abweichungen Whisper/Skript:', diff or 'keine')
    return W, words, dur

if __name__ == '__main__':
    W, words, ende = asr() if '--asr' in sys.argv else platzhalter()
    open(os.path.join(ROOT, 'data', 'text_gesprochen.txt'), 'w', encoding='utf-8').write(' '.join(W) + '\n')
    json.dump(words, open(os.path.join(ROOT, 'data', 'words.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    json.dump({'ende': round(ende, 2), 'quelle': 'ASR (Stimme)' if '--asr' in sys.argv else 'PLATZHALTER %.1f Woerter/s' % WPS},
              open(os.path.join(ROOT, 'data', 'laenge.json'), 'w'), indent=1)
    print('%s: %d Woerter, Ende %.2f s' % ('ASR' if '--asr' in sys.argv else 'Platzhalter', len(W), ende))
