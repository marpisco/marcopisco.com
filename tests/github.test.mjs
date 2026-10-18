import { describe, expect, test } from 'bun:test';
import { avatarUrl, formatStars, repoUrl } from '../src/github.ts';

describe('formatStars', () => {
  test('marks loading and failed counts', () => {
    expect(formatStars(undefined)).toBe('…');
    expect(formatStars(null)).toBe('—');
  });

  test('keeps small counts and shortens thousands', () => {
    expect(formatStars(2)).toBe('2');
    expect(formatStars(999)).toBe('999');
    expect(formatStars(1000)).toBe('1k');
    expect(formatStars(58_234)).toBe('58.2k');
  });
});

describe('GitHub URLs', () => {
  test('builds the repo and owner avatar URLs', () => {
    expect(repoUrl('marpisco/ClassLink')).toBe('https://github.com/marpisco/ClassLink');
    expect(avatarUrl('marpisco/ClassLink')).toBe('https://github.com/marpisco.png?size=80');
  });
});
