// Tiny chiptune effects made with the Web Audio API, no audio files.
type Note = { from: number; to: number; seconds: number; wave: OscillatorType };

const VOLUME = 0.06;

const SOUNDS = {
  start: [
    { from: 440, to: 440, seconds: 0.06, wave: 'square' },
    { from: 660, to: 660, seconds: 0.06, wave: 'square' },
    { from: 880, to: 880, seconds: 0.09, wave: 'square' },
  ],
  eat: [{ from: 660, to: 1320, seconds: 0.08, wave: 'square' }],
  pause: [{ from: 520, to: 520, seconds: 0.05, wave: 'triangle' }],
  die: [{ from: 330, to: 55, seconds: 0.45, wave: 'sawtooth' }],
} satisfies Record<string, Note[]>;

export type Sound = keyof typeof SOUNDS;

let context: AudioContext | null = null;

export function playSound(sound: Sound): void {
  try {
    context ??= new AudioContext();
  } catch {
    return;
  }

  let at = context.currentTime;
  for (const note of SOUNDS[sound]) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = note.wave;
    oscillator.frequency.setValueAtTime(note.from, at);
    oscillator.frequency.exponentialRampToValueAtTime(note.to, at + note.seconds);
    // Fade out instead of cutting off, which would click.
    gain.gain.setValueAtTime(VOLUME, at);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + note.seconds);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(at);
    oscillator.stop(at + note.seconds);
    at += note.seconds;
  }
}
