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

// Keeps only the last keys needed to match the sequence.
export function pushKey(recent: readonly string[], key: string): string[] {
  return [...recent, key.toLowerCase()].slice(-KONAMI_SEQUENCE.length);
}

export function isKonami(recent: readonly string[]): boolean {
  return (
    recent.length === KONAMI_SEQUENCE.length &&
    recent.every((key, index) => key === KONAMI_SEQUENCE[index])
  );
}
