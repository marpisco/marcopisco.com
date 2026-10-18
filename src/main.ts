import './styles.css';
import { CONTENT, type Content } from './content';
import {
  LANGUAGE_STORAGE_KEY,
  parseLanguage,
  readSavedLanguage,
  resolveLanguage,
  type Language,
} from './i18n';
import { isKonami, pushKey } from './konami';
import { getPresenceView, type PresenceState } from './lanyard';
import { startPresence } from './presence';
import { renderPage, updatePresence } from './render';
import { getRevealedFlags, setupScrollReveal } from './reveal';
import { listenForGestures } from './swipe';
import { isSnakeOpen, openSnake } from './snake-game';
import { INITIAL_TYPING_STATE, nextTypingState, type TypingState } from './typing';

const TYPING_DELAY = 48;
const DELETING_DELAY = 28;
const MESSAGE_HOLD = 1600;
const MESSAGE_GAP = 350;

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Missing #app container');
}

function saveLanguage(language: Language): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // The choice still applies to the current page when storage is unavailable.
  }
}

let language = resolveLanguage(readSavedLanguage(), navigator.languages ?? [navigator.language]);
let presenceState: PresenceState = { kind: 'connecting' };

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function createTypingLoop(getMessages: () => readonly string[]) {
  let state: TypingState = { ...INITIAL_TYPING_STATE };
  let timerId: number | undefined;

  const currentText = (): string => {
    const message = getMessages()[state.messageIndex];
    return reducedMotion.matches ? message : message.slice(0, state.visibleCharacters);
  };

  const render = (): void => {
    const subtitle = document.querySelector<HTMLElement>('#typed-subtitle');
    if (subtitle) {
      subtitle.textContent = currentText();
    }
  };

  const getDelay = (): number => {
    const message = getMessages()[state.messageIndex];
    if (state.direction === 'typing') {
      return state.visibleCharacters >= message.length ? MESSAGE_HOLD : TYPING_DELAY;
    }
    return state.visibleCharacters === 0 ? MESSAGE_GAP : DELETING_DELAY;
  };

  const schedule = (): void => {
    timerId = window.setTimeout(() => {
      state = nextTypingState(state, getMessages());
      render();
      schedule();
    }, getDelay());
  };

  return {
    restart(): void {
      window.clearTimeout(timerId);
      state = { ...INITIAL_TYPING_STATE };
      render();
      if (!reducedMotion.matches) {
        schedule();
      }
    },
  };
}

const content = (): Content => CONTENT[language];
const typing = createTypingLoop(() => content().heroMessages);

const draw = (): void => {
  app.innerHTML = renderPage(content(), {
    language,
    presence: getPresenceView(presenceState, language),
  });
  document.documentElement.lang = content().htmlLang;
};

const switchLanguage = (next: Language): void => {
  if (next === language) {
    return;
  }

  language = next;
  saveLanguage(language);
  const revealed = getRevealedFlags();
  draw();
  setupScrollReveal(revealed);
  typing.restart();
  app.querySelector<HTMLElement>(`[data-language="${language}"]`)?.focus();
};

app.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLElement>('[data-language]');
  const next = parseLanguage(button?.dataset.language ?? null);
  if (next) {
    switchLanguage(next);
  }
});

let recentKeys: string[] = [];
const trackKey = (key: string): void => {
  if (isSnakeOpen()) {
    return;
  }

  recentKeys = pushKey(recentKeys, key);
  if (isKonami(recentKeys)) {
    recentKeys = [];
    openSnake(content().snake);
  }
};

document.addEventListener('keydown', (event) => trackKey(event.key));
listenForGestures(document, (gesture) => trackKey(gesture === 'tap' ? 'tap' : `arrow${gesture}`));

draw();
setupScrollReveal();
typing.restart();
startPresence((state) => {
  presenceState = state;
  updatePresence(getPresenceView(state, language));
});
