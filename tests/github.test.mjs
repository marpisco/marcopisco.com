import { describe, expect, test } from 'bun:test';
import { avatarUrl, formatStars, groupByLanguage, ownRepos, repoUrl, toRepo } from '../src/github.ts';

const repo = (name, stars, language = 'TypeScript', owner = 'someone', fork = false) => ({
  owner,
  name,
  description: null,
  language,
  stars,
  topics: [],
  fork,
});

describe('formatStars', () => {
  test('keeps small counts and shortens thousands', () => {
    expect(formatStars(2)).toBe('2');
    expect(formatStars(999)).toBe('999');
    expect(formatStars(1000)).toBe('1k');
    expect(formatStars(58_234)).toBe('58.2k');
  });
});

describe('toRepo', () => {
  test('keeps the used fields and at most five topics', () => {
    const result = toRepo({
      owner: { login: 'marpisco' },
      name: 'ClassLink',
      description: 'Room booking',
      language: 'PHP',
      stargazers_count: 3,
      topics: ['a', 'b', 'c', 'd', 'e', 'f'],
      fork: false,
    });
    expect(result).toEqual({
      owner: 'marpisco',
      name: 'ClassLink',
      description: 'Room booking',
      language: 'PHP',
      stars: 3,
      topics: ['a', 'b', 'c', 'd', 'e'],
      fork: false,
    });
  });
});

describe('GitHub URLs', () => {
  test('builds the repo and owner avatar URLs', () => {
    const classLink = repo('ClassLink', 1, 'PHP', 'marpisco');
    expect(repoUrl(classLink)).toBe('https://github.com/marpisco/ClassLink');
    expect(avatarUrl(classLink)).toBe('https://github.com/marpisco.png?size=80');
  });
});

describe('ownRepos', () => {
  test('drops forks and sorts by stars', () => {
    const result = ownRepos([repo('a', 1), repo('fork', 9, 'Go', 'marpisco', true), repo('b', 5)]);
    expect(result.map(({ name }) => name)).toEqual(['b', 'a']);
  });
});

describe('groupByLanguage', () => {
  test('biggest group first, most starred first, no language last, own repos left out', () => {
    const groups = groupByLanguage([
      repo('ts-small', 1),
      repo('none', 100, null),
      repo('py', 50, 'Python'),
      repo('ts-big', 10),
      repo('mine', 999, 'Go', 'marpisco'),
    ]);
    expect(groups.map(({ language, repos }) => [language, repos.map(({ name }) => name)])).toEqual([
      ['TypeScript', ['ts-big', 'ts-small']],
      ['Python', ['py']],
      [null, ['none']],
    ]);
  });
});
