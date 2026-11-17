# ASR mit faster-whisper (Wortzeiten). Audio wird per ffmpeg zu float32 16 kHz mono dekodiert und als Array uebergeben
# (ein Pfad scheitert mit der installierten av-Version).
# Aufruf: python3 gen/asr_whisper.py <audio.mp3> <out.json> [modell=medium]
import sys, json, subprocess
import numpy as np
from faster_whisper import WhisperModel
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout
audio = np.frombuffer(raw, '<f4').copy()
m = WhisperModel(sys.argv[3] if len(sys.argv) > 3 else 'medium', device='cpu', compute_type='int8', cpu_threads=8)
segs, info = m.transcribe(audio, language='de', word_timestamps=True, beam_size=5, vad_filter=False)
out = []
for s in segs:
    out.append({'s': s.start, 'e': s.end, 'text': s.text, 'words': [{'w': w.word.strip(), 's': w.start, 'e': w.end, 'p': w.probability} for w in s.words]})
json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False, indent=0)
print(' '.join(x['text'] for x in out))
