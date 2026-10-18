import './styles.css';
import { CONTENT } from './content';
import { readSavedLanguage, resolveLanguage } from './i18n';
import { renderNotFound } from './render';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Missing #app container');
}

const language = resolveLanguage(readSavedLanguage(), navigator.languages ?? [navigator.language]);
const content = CONTENT[language];

app.innerHTML = renderNotFound(content, location.pathname);
document.documentElement.lang = content.htmlLang;
