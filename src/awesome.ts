import './styles.css';
import { CONTENT } from './content';
import { fetchStars, type StarCount } from './github';
import {
  listenForLanguageClicks,
  readSavedLanguage,
  resolveLanguage,
  saveLanguage,
  type Language,
} from './i18n';
import { renderAwesome, updateStars } from './render';
import { getRevealedFlags, setupScrollReveal } from './reveal';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Missing #app container');
}

let language = resolveLanguage(readSavedLanguage(), navigator.languages ?? [navigator.language]);
// Fetched once per page load and reused across language switches.
const stars = new Map<string, StarCount>();

const draw = (): void => {
  const content = CONTENT[language];
  app.innerHTML = renderAwesome(content, language, stars);
  document.documentElement.lang = content.htmlLang;
};

listenForLanguageClicks(app, (next: Language) => {
  if (next === language) {
    return;
  }

  language = next;
  saveLanguage(language);
  const revealed = getRevealedFlags();
  draw();
  setupScrollReveal(revealed);
  app.querySelector<HTMLElement>(`[data-language="${language}"]`)?.focus();
});

draw();
setupScrollReveal();

const repos = new Set(CONTENT[language].awesome.categories.flatMap(({ projects }) => projects.map(({ repo }) => repo)));
repos.forEach(async (repo) => {
  const count = await fetchStars(repo);
  stars.set(repo, count);
  updateStars(repo, count);
});
