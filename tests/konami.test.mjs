import { describe, expect, test } from 'bun:test';
import { KONAMI_SEQUENCE, isKonami, pushKey } from '../src/konami.ts';

const KEYS = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

const type = (keys) => keys.reduce((recent, key) => pushKey(recent, key), []);

describe('konami code', () => {
  test('matches the full sequence', () => {
    expect(isKonami(type(KEYS))).toBe(true);
  });

  test('ignores letter case', () => {
    expect(isKonami(type([...KEYS.slice(0, 8), 'B', 'A']))).toBe(true);
  });

  test('matches after unrelated keys and an extra up', () => {
    expect(isKonami(type(['x', 'ArrowUp', ...KEYS]))).toBe(true);
  });

  test('matches swipes followed by two taps', () => {
    expect(isKonami(type([...KEYS.slice(0, 8), 'tap', 'tap']))).toBe(true);
  });

  test('rejects a wrong key in the middle', () => {
    const keys = [...KEYS];
    keys[4] = 'ArrowRight';
    expect(isKonami(type(keys))).toBe(false);
  });

  test('keeps only as many keys as the sequence', () => {
    expect(type([...KEYS, ...KEYS]).length).toBe(KONAMI_SEQUENCE.length);
  });
});
