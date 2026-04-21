let audioCtx;

const beep = (frequency = 440, duration = 120, type = 'sine', gainValue = 0.04) => {
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = gainValue;

  oscillator.connect(gain);
  gain.connect(audioCtx.destination);

  oscillator.start();
  setTimeout(() => oscillator.stop(), duration);
};

export const playSuccess = () => {
  beep(620, 90, 'triangle');
  setTimeout(() => beep(880, 110, 'triangle'), 80);
};

export const playFail = () => {
  beep(220, 150, 'sawtooth');
};
