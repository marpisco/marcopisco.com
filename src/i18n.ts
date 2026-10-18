export const LANGUAGES = ['en', 'pt'] as const;

export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_STORAGE_KEY = 'marcopisco-language';

export function parseLanguage(value: string | null): Language | null {
  return LANGUAGES.find((language) => language === value) ?? null;
}

export function detectLanguage(languages: readonly string[]): Language {
  for (const tag of languages) {
    const language = parseLanguage(tag.toLowerCase().split('-')[0]);
    if (language) {
      return language;
    }
  }

  return 'en';
}

export function resolveLanguage(saved: string | null, languages: readonly string[]): Language {
  return parseLanguage(saved) ?? detectLanguage(languages);
}
