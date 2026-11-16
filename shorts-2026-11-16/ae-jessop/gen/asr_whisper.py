import sys, json
from faster_whisper import WhisperModel
m = WhisperModel(sys.argv[3] if len(sys.argv)>3 else "small", device="cpu", compute_type="int8", cpu_threads=8)
segs, info = m.transcribe(__import__("faster_whisper").decode_audio(sys.argv[1]) if False else __import__("numpy").frombuffer(open(sys.argv[1],"rb").read()[44:],dtype="<i2").astype("float32")/32768, language="de", word_timestamps=True, beam_size=5, vad_filter=False)
out=[]
for s in segs:
    out.append({'s':s.start,'e':s.end,'text':s.text,'words':[{'w':w.word.strip(),'s':w.start,'e':w.end,'p':w.probability} for w in s.words]})
json.dump(out, open(sys.argv[2],'w'), ensure_ascii=False, indent=0)
print(' '.join(x['text'] for x in out))
