import { describe, expect, test } from 'bun:test';
import { readGesture } from '../src/swipe.ts';

describe('readGesture', () => {
  test('treats a short move as a tap', () => {
    expect(readGesture(5, -8)).toBe('tap');
  });

  test('reads the dominant axis', () => {
    expect(readGesture(80, 20)).toBe('right');
    expect(readGesture(-80, 20)).toBe('left');
    expect(readGesture(10, 60)).toBe('down');
    expect(readGesture(10, -60)).toBe('up');
  });
});
