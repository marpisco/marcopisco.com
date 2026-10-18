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

export function readSavedLanguage(): string | null {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveLanguage(language: Language): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // The choice still applies to the current page when storage is unavailable.
  }
}

// Calls `onSwitch` when one of the `[data-language]` buttons inside `root` is clicked.
export function listenForLanguageClicks(root: HTMLElement, onSwitch: (language: Language) => void): void {
  root.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLElement>('[data-language]');
    const next = parseLanguage(button?.dataset.language ?? null);
    if (next) {
      onSwitch(next);
    }
  });
}
