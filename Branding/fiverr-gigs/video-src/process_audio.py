import sys, os, json, subprocess
here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(here, 'pylib'))
import numpy as np
import soundfile as sf

FF = os.path.join(here, 'tools', 'imageio_ffmpeg', 'binaries', 'ffmpeg-win-x86_64-v7.1.exe')
SPEED = float(sys.argv[1]) if len(sys.argv) > 1 else 1.08

y, sr = sf.read(os.path.join(here, 'voice', 'clean.wav'))
hop = int(sr * 0.02)
rms = np.array([np.sqrt(np.mean(y[i:i + hop] ** 2)) for i in range(0, len(y) - hop, hop)])

def quietest(a, b):
    i0, i1 = int(a / 0.02), int(b / 0.02)
    # smooth over 5 hops so we pick the centre of the longest quiet stretch
    k = np.convolve(rms[i0:i1], np.ones(5) / 5, mode='same')
    return (i0 + int(np.argmin(k))) * 0.02

# scene boundaries come from the transcript (line ends / starts) snapped to the quietest point between them
cuts = [0.0, quietest(11.2, 12.0 + 0.4), quietest(28.2, 28.9), quietest(43.8, 44.75), quietest(60.6, 61.25), quietest(69.65, 70.25), len(y) / sr]
print('cuts', [round(c, 2) for c in cuts])
os.makedirs(os.path.join(here, 'voice', 'scenes'), exist_ok=True)
info = []
for i in range(6):
    a, b = cuts[i], cuts[i + 1]
    raw_path = os.path.join(here, 'voice', 'scenes', f's{i+1}_raw.wav')
    out_path = os.path.join(here, 'voice', 'scenes', f's{i+1}.wav')
    sf.write(raw_path, y[int(a * sr):int(b * sr)], sr)
    # trim edge silence, shorten internal pauses to 0.16s, light EQ + compression, speed, level
    af = (
        'highpass=f=75,'
        'silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.04:'
        'stop_periods=-1:stop_threshold=-42dB:stop_duration=0.28:stop_silence=0.16,'
        'areverse,silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.04,areverse,'
        'acompressor=threshold=-20dB:ratio=2.5:attack=8:release=90,'
        f'atempo={SPEED},'
        'loudnorm=I=-16:TP=-1.5:LRA=7'
    )
    subprocess.run([FF, '-y', '-v', 'error', '-i', raw_path, '-af', af, '-ar', '44100', '-ac', '1', out_path], check=True)
    data, s2 = sf.read(out_path)
    info.append({'id': f's{i+1}', 'dur': round(len(data) / s2, 3)})
print(json.dumps(info))
json.dump(info, open(os.path.join(here, 'voice', 'durations.json'), 'w'))
print('speech total', round(sum(x['dur'] for x in info), 2))
