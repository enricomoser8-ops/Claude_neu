# Wortzeiten fuer das Short 26.11. Erster Flug (key wright, 25.11.2026) -> data/words.json [{w, s, e}] + data/text_gesprochen.txt
# Zwei Wege:
#   python3 gen/words_wright.py            PLATZHALTER (noch keine Stimme): Zeiten aus dem Sprechblock in ../skripte.md,
#                                          ~2,6 Woerter/s (laengere Woerter dauern laenger), [short pause] = 0,35 s, [pause] = 0,7 s,
#                                          Satzende (. ? !) + 0,15 s.
#   python3 gen/words_wright.py --asr [stimme]  ECHTE STIMME ("Audio da"): ../audio-wright/voice.mp3 (oder [stimme]) + data/words_whisper.json
#                                          (vorher python3 gen/asr_wright.py [stimme]: faster-whisper small, Wortzeiten) -> audio/wright_voice.wav (Stille vorn/hinten weg)
#                                          und Abgleich Whisper <-> Skript (difflib), Luecken interpoliert.
# Danach immer: python3 gen/gen_wright.py (Szenenzeiten kommen NUR aus data/words.json).
import json, os, re, sys, difflib, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..'))
SKRIPT = os.path.join(ROOT, '..', 'skripte.md')
WPS, P_KURZ, P_LANG, SATZ = 2.6, 0.35, 0.7, 0.15

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
    # Laengen-Gewicht: Silben grob ueber Vokalgruppen, mindestens 1; Mittel ergibt genau 2,6 Woerter/s
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
    src = os.path.abspath(sys.argv[i + 1]) if len(sys.argv) > i + 1 else os.path.join(ROOT, '..', 'audio-wright', 'voice.mp3')   # gleiche Datei wie bei asr_wright.py
    W = [t[1] for t in tokens(sprechblock()) if t[0] == 'W']
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ar', str(SR), '-ac', '2', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).reshape(-1, 2).copy(); mono = x.mean(1); fr = SR // 100
    db = np.array([20 * np.log10(np.sqrt(np.mean(mono[i:i + fr] ** 2)) + 1e-9) for i in range(0, len(mono) - fr, fr)])
    v = np.where(db > -45)[0]
    a = max(0, int((v[0] / 100 - 0.02) * SR)); b = min(len(x), int((v[-1] / 100 + 0.26) * SR)); OFF = a / SR
    out = x[a:b].copy(); n = int(0.01 * SR); out[-n:] *= np.linspace(1, 0, n)[:, None]
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le',
                    os.path.join(ROOT, 'audio', 'wright_voice.wav')], input=out.astype(np.float32).tobytes(), check=True)
    dur = len(out) / SR
    wj = os.path.join(ROOT, 'data', 'words_whisper.json')   # von gen/asr_wright.py
    if not os.path.exists(wj): wj = os.path.join(ROOT, '..', 'audio-wright', 'words_whisper.json')
    ASR = json.load(open(wj, encoding='utf-8'))
    # enno 25.11.: der GESPROCHENE Text zaehlt (er hat den Text leicht veraendert) -> Woerter + Zeiten direkt aus der ASR,
    # nur Ziffern-Splitter zusammengefuegt ("300 .000" -> "300.000"). Abweichungen zum Skript nur als Bericht (data/text_abweichungen.json).
    W2 = []
    for w in ASR:
        t = w['w'].strip()
        if not t: continue
        if W2 and re.match(r'^[.,]\d', t) and re.search(r'\d$', W2[-1]['w']):
            W2[-1]['w'] += t; W2[-1]['e'] = w['e']; continue
        W2.append({'w': t, 's': w['s'], 'e': w['e']})
    words = [{'w': w['w'], 's': round(max(0, w['s'] - OFF), 3), 'e': round(max(w['e'] - OFF, w['s'] - OFF + 0.05), 3)} for w in W2]
    SP = [w['w'] for w in words]
    A = [norm(w) for w in W]; B = [norm(w) for w in SP]
    diff = []
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, A, B, autojunk=False).get_opcodes():
        if tag != 'equal': diff.append({'art': tag, 'skript': ' '.join(W[i1:i2]), 'gesprochen': ' '.join(SP[j1:j2]), 'zeit': words[min(j1, len(words) - 1)]['s']})
    json.dump(diff, open(os.path.join(ROOT, 'data', 'text_abweichungen.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('Abweichungen Skript -> gesprochen:'); [print('  %-8s %6.2f s  "%s" -> "%s"' % (d['art'], d['zeit'], d['skript'], d['gesprochen'])) for d in diff]
    W = SP
    return W, words, dur

if __name__ == '__main__':
    W, words, ende = asr() if '--asr' in sys.argv else platzhalter()
    open(os.path.join(ROOT, 'data', 'text_gesprochen.txt'), 'w', encoding='utf-8').write(' '.join(W) + '\n')
    json.dump(words, open(os.path.join(ROOT, 'data', 'words.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    json.dump({'ende': round(ende, 2), 'quelle': 'ASR (Stimme)' if '--asr' in sys.argv else 'PLATZHALTER %.1f Woerter/s' % WPS},
              open(os.path.join(ROOT, 'data', 'laenge.json'), 'w'), indent=1)
    print('%s: %d Woerter, Ende %.2f s' % ('ASR' if '--asr' in sys.argv else 'Platzhalter', len(W), ende))
