import { describe, expect, test } from 'bun:test';
import { visiblePrefixes } from '../src/reveal.ts';

describe('visiblePrefixes', () => {
  const texts = ['abc', 'de'];

  test('shows nothing without budget', () => {
    expect(visiblePrefixes(texts, 0)).toEqual(['', '']);
  });

  test('fills strings in order', () => {
    expect(visiblePrefixes(texts, 2)).toEqual(['ab', '']);
    expect(visiblePrefixes(texts, 4)).toEqual(['abc', 'd']);
  });

  test('caps at the full text', () => {
    expect(visiblePrefixes(texts, 99)).toEqual(['abc', 'de']);
  });

  test('ignores negative and fractional budgets', () => {
    expect(visiblePrefixes(texts, -3)).toEqual(['', '']);
    expect(visiblePrefixes(texts, 1.9)).toEqual(['a', '']);
  });
});
