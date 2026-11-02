import './styles.css';
import { CONTENT } from './content';
import { fetchOwnRepos, fetchStarredRepos, groupByLanguage, ownRepos } from './github';
import {
  listenForLanguageClicks,
  readSavedLanguage,
  resolveLanguage,
  saveLanguage,
  type Language,
} from './i18n';
import { renderAwesome, type AwesomeData } from './render';
import { getRevealedFlags, setupScrollReveal } from './reveal';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Missing #app container');
}

let language = resolveLanguage(readSavedLanguage(), navigator.languages ?? [navigator.language]);
// Fetched once per page load and reused across language switches.
let data: AwesomeData = { kind: 'loading' };

// Re-renders while keeping the units already streamed complete.
const redraw = (): void => {
  const content = CONTENT[language];
  const revealed = getRevealedFlags();
  app.innerHTML = renderAwesome(content, language, data);
  document.documentElement.lang = content.htmlLang;
  setupScrollReveal(revealed);
};

listenForLanguageClicks(app, (next: Language) => {
  if (next === language) {
    return;
  }

  language = next;
  saveLanguage(language);
  redraw();
  app.querySelector<HTMLElement>(`[data-language="${language}"]`)?.focus();
});

redraw();

Promise.all([fetchOwnRepos(), fetchStarredRepos()])
  .then(([own, starred]) => {
    data = { kind: 'ready', mine: ownRepos(own), starred: groupByLanguage(starred) };
  })
  .catch(() => {
    data = { kind: 'error' };
  })
  .finally(redraw);
