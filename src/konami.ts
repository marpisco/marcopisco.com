export const KONAMI_SEQUENCE: readonly string[] = [
  'arrowup',
  'arrowup',
  'arrowdown',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowright',
  'b',
  'a',
];

// On touch screens the arrows are swipes and B A are two taps.
const TOUCH_SEQUENCE: readonly string[] = [...KONAMI_SEQUENCE.slice(0, -2), 'tap', 'tap'];

// Keeps only the last keys needed to match the sequence.
export function pushKey(recent: readonly string[], key: string): string[] {
  return [...recent, key.toLowerCase()].slice(-KONAMI_SEQUENCE.length);
}

const matches = (recent: readonly string[], sequence: readonly string[]): boolean =>
  recent.length === sequence.length && recent.every((key, index) => key === sequence[index]);

export function isKonami(recent: readonly string[]): boolean {
  return matches(recent, KONAMI_SEQUENCE) || matches(recent, TOUCH_SEQUENCE);
}
