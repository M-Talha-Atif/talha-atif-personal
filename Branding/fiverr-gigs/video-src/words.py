import sys, os, json
here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(here, 'pylib'))
import soundfile as sf
from scipy.signal import resample_poly
from faster_whisper import WhisperModel
m = WhisperModel('base.en', device='cpu', compute_type='int8', download_root=os.path.join(here, 'models'))
res = {}
for i in range(1, 7):
    y, sr = sf.read(os.path.join(here, 'voice', 'scenes', f's{i}.wav'))
    a = resample_poly(y, 16000, sr).astype('float32')
    segs, _ = m.transcribe(a, word_timestamps=True, language='en')
    ws = []
    for s in segs:
        for w in s.words:
            ws.append([w.word.strip().lower().strip('.,?!'), round(w.start, 2), round(w.end, 2)])
    res[f's{i}'] = ws
    print(f's{i}', ' '.join(f'{w}@{st}' for w, st, _ in ws))
json.dump(res, open(os.path.join(here, 'voice', 'words.json'), 'w'))
