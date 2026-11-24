# ASR fuer den Apollo-13-Short (key apollo, 25.11.2026): Stimme -> data/words_whisper.json [{w, s, e, p}] (Zeiten in s, bezogen auf die ORIGINAL-Datei)
# faster-whisper, Modell small, language de, word_timestamps=True.
# Hinweis: faster-whisper mit Dateipfad scheitert hier an der av-Version -> Audio per ffmpeg zu 16 kHz mono float32 dekodieren und als numpy-Array uebergeben.
# Aufruf: python3 gen/asr_apollo.py [stimme.mp3|wav] [ausgabe.json]   (Standard: ../audio-apollo/voice.mp3 -> data/words_whisper.json)
# Danach: python3 gen/words_apollo.py --asr [gleiche Datei]  ->  python3 gen/gen_apollo.py  ->  Ton-Kette + mix (README)
import json, os, subprocess, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..'))
SRC = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.normpath(os.path.join(ROOT, '..', 'audio-apollo', 'voice.mp3'))
OUT = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 else os.path.join(ROOT, 'data', 'words_whisper.json')   # 2. Argument nur fuer Tests

def decode16k(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-i', path, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

if __name__ == '__main__':
    if not os.path.exists(SRC): sys.exit('Stimme fehlt: ' + SRC)
    from faster_whisper import WhisperModel
    audio = decode16k(SRC)
    model = WhisperModel('small', device='cpu', compute_type='int8')
    segs, info = model.transcribe(audio, language='de', word_timestamps=True, beam_size=5, condition_on_previous_text=False)
    words = []
    for sg in segs:
        for w in (sg.words or []):
            t = w.word.strip()
            if t: words.append({'w': t, 's': round(w.start, 3), 'e': round(w.end, 3), 'p': round(w.probability, 3)})
    json.dump(words, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print('%s: %d Woerter, %.2f s Audio, Sprache %s -> %s' % (os.path.basename(SRC), len(words), len(audio) / 16000, info.language, OUT))
    print(' '.join(w['w'] for w in words[:25]) + (' ...' if len(words) > 25 else ''))
