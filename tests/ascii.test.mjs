import { describe, expect, test } from 'bun:test';
import { scrambleFrame, toAscii, toGray } from '../src/ascii.ts';

describe('toAscii', () => {
  test('maps dark to blank and bright to dense, one line per row', () => {
    expect(toAscii([0, 255, 255, 0], 2)).toBe(' @\n@ ');
    expect(toAscii([128], 1)).toBe('+');
  });
});

describe('toGray', () => {
  test('turns RGBA pixels into luma stretched to the full range', () => {
    expect(toGray([255, 255, 255, 255, 0, 0, 0, 255]).map(Math.round)).toEqual([255, 0]);
    expect(toGray([100, 100, 100, 255, 150, 150, 150, 255, 200, 200, 200, 255]).map(Math.round)).toEqual([0, 128, 255]);
  });
});

describe('scrambleFrame', () => {
  const text = 'ab \ncd';

  test('scrambles every glyph and keeps blanks and line breaks', () => {
    expect(scrambleFrame(text, [100, 100, 100, 100, 100, 100], 0, () => 'x')).toBe('xx \nxx');
  });

  test('clears each glyph once its own vanish time has passed', () => {
    expect(scrambleFrame(text, [10, 50, 0, 0, 50, 10], 20, () => 'x')).toBe(' x \nx ');
  });
});
