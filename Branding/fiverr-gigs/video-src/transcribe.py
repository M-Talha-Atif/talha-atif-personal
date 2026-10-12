import sys, json, os
here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(here, 'pylib'))
import numpy as np
import soundfile as sf
import noisereduce as nr

raw, sr = sf.read(os.path.join(here, 'voice', 'raw.wav'))
if raw.ndim > 1:
    raw = raw.mean(axis=1)
# stationary noise reduction, profile taken from the quietest 0.5s stretches
frame = int(sr * 0.5)
energies = [(np.sqrt(np.mean(raw[i:i + frame] ** 2)), i) for i in range(0, len(raw) - frame, frame // 2)]
energies.sort()
noise = np.concatenate([raw[i:i + frame] for _, i in energies[:4]])
clean = nr.reduce_noise(y=raw, sr=sr, y_noise=noise, stationary=True, prop_decrease=0.9)
sf.write(os.path.join(here, 'voice', 'clean.wav'), clean, sr)
print('denoised', len(clean) / sr)

from faster_whisper import WhisperModel
model = WhisperModel('base.en', device='cpu', compute_type='int8', download_root=os.path.join(here, 'models'))
from scipy.signal import resample_poly
audio16 = resample_poly(clean, 16000, sr).astype('float32')
segments, info = model.transcribe(audio16, word_timestamps=True, vad_filter=False, language='en')
out = []
for s in segments:
    out.append({'start': s.start, 'end': s.end, 'text': s.text, 'words': [{'w': w.word, 's': w.start, 'e': w.end} for w in s.words]})
json.dump(out, open(os.path.join(here, 'voice', 'transcript.json'), 'w'), indent=1)
for s in out:
    print('%.2f-%.2f %s' % (s['start'], s['end'], s['text']))
