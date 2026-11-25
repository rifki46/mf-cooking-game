// audio.js — a tiny WebAudio synth: every sound in the game is made here,
// no audio files. Sounds start lazily on the first user gesture.

let ctx = null;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, seconds, type = 'sine', gain = 0.12, when = 0) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + when;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + seconds);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + seconds + 0.02);
}

function noiseBurst(seconds, gain = 0.08, freq = 1800) {
  const a = ac();
  if (!a) return;
  const len = Math.max(1, Math.floor(a.sampleRate * seconds));
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = a.createBufferSource();
  src.buffer = buf;
  const filter = a.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  const g = a.createGain();
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(a.destination);
  src.start();
}

export const sfx = {
  pickup() { tone(520, 0.07, 'triangle', 0.1); },
  place() { tone(340, 0.07, 'triangle', 0.1); },
  chop() { noiseBurst(0.05, 0.16, 900); },
  sizzle() { noiseBurst(0.25, 0.05, 3200); },
  ding() { tone(880, 0.16, 'sine', 0.14); tone(1318, 0.22, 'sine', 0.12, 0.09); },
  coin() { tone(988, 0.08, 'square', 0.07); tone(1319, 0.14, 'square', 0.07, 0.07); },
  buzz() { tone(140, 0.22, 'sawtooth', 0.1); },
  pop() { tone(660, 0.05, 'sine', 0.1); },
  trash() { noiseBurst(0.12, 0.1, 500); },
};
