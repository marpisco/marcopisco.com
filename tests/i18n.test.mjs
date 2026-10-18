import { describe, expect, test } from 'bun:test';
import {
  detectLanguage,
  LANGUAGE_STORAGE_KEY,
  parseLanguage,
  resolveLanguage,
} from '../src/i18n.ts';

describe('language preference', () => {
  test('uses the expected storage key', () => {
    expect(LANGUAGE_STORAGE_KEY).toBe('marcopisco-language');
  });

  test('accepts supported values and rejects anything else', () => {
    expect(parseLanguage('en')).toBe('en');
    expect(parseLanguage('pt')).toBe('pt');
    expect(parseLanguage('pt-PT')).toBeNull();
    expect(parseLanguage('fr')).toBeNull();
    expect(parseLanguage(null)).toBeNull();
  });

  test('detects the first supported browser language in order', () => {
    expect(detectLanguage(['pt-PT', 'en-US'])).toBe('pt');
    expect(detectLanguage(['en-GB', 'pt-PT'])).toBe('en');
    expect(detectLanguage(['fr-FR', 'pt-BR', 'en'])).toBe('pt');
    expect(detectLanguage(['PT'])).toBe('pt');
  });

  test('falls back to English when nothing matches', () => {
    expect(detectLanguage([])).toBe('en');
    expect(detectLanguage(['fr-FR', 'de'])).toBe('en');
  });

  test('prefers a valid saved choice over the browser language', () => {
    expect(resolveLanguage('en', ['pt-PT'])).toBe('en');
    expect(resolveLanguage('pt', ['en-US'])).toBe('pt');
    expect(resolveLanguage('xx', ['pt-PT'])).toBe('pt');
    expect(resolveLanguage(null, ['fr'])).toBe('en');
  });
});
