import { SNAKE_COMMAND, type SnakeWording } from './content';
import { escapeHtml } from './render';
import { playSound } from './sfx';
import {
  GLYPHS,
  createGame,
  isOpposite,
  renderBoard,
  stepGame,
  type Direction,
  type SnakeState,
} from './snake';

const BOARD_WIDTH = 24;
const BOARD_HEIGHT = 14;
const START_TICK_MS = 130;
const MIN_TICK_MS = 60;
const TICK_STEP_MS = 3;
const MAX_QUEUED_TURNS = 2;

const KEY_DIRECTIONS: Record<string, Direction> = {
  arrowup: 'up',
  arrowdown: 'down',
  arrowleft: 'left',
  arrowright: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
};

type Phase = 'ready' | 'running' | 'paused' | 'over';

const GLYPH_CLASSES: Record<string, string> = {
  [GLYPHS.head]: 'snake-head',
  [GLYPHS.body]: 'snake-body',
  [GLYPHS.food]: 'snake-food',
};
const COLORED_GLYPHS = new RegExp(`[${Object.keys(GLYPH_CLASSES).join('')}]`, 'g');

// The board text only holds glyphs and border characters, so it needs no escaping.
const colorBoard = (text: string): string =>
  text.replace(COLORED_GLYPHS, (glyph) => `<span class="${GLYPH_CLASSES[glyph]}">${glyph}</span>`);

let close: (() => void) | null = null;

export const isSnakeOpen = (): boolean => close !== null;

export function openSnake(wording: SnakeWording): void {
  if (close) {
    return;
  }

  const previousFocus = document.activeElement as HTMLElement | null;
  const overlay = document.createElement('div');
  overlay.className = 'snake';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', wording.label);
  overlay.tabIndex = -1;
  overlay.innerHTML = `
    <div class="snake-window">
      <div><span class="prompt">$</span> ${SNAKE_COMMAND}</div>
      <pre class="snake-board"></pre>
      <div class="snake-status"><span class="date"></span><span class="muted"></span></div>
      <div class="muted">${escapeHtml(wording.controls)}</div>
    </div>`;

  const board = overlay.querySelector('.snake-board') as HTMLElement;
  const [score, status] = overlay.querySelectorAll<HTMLElement>('.snake-status span');

  let state: SnakeState = createGame(BOARD_WIDTH, BOARD_HEIGHT, Math.random);
  let phase: Phase = 'ready';
  let turns: Direction[] = [];
  let timerId: number | undefined;

  const statusText: Record<Phase, string> = {
    ready: wording.ready,
    running: '',
    paused: wording.paused,
    over: wording.gameOver,
  };

  const draw = (): void => {
    board.innerHTML = colorBoard(renderBoard(state));
    score.textContent = `${wording.score} ${state.score}`;
    status.textContent = statusText[phase];
  };

  const tick = (): void => {
    const before = state.score;
    state = stepGame(state, turns.shift() ?? state.direction, Math.random);
    if (state.over) {
      phase = 'over';
      playSound('die');
    } else {
      if (state.score > before) {
        playSound('eat');
      }
      schedule();
    }
    draw();
  };

  function schedule(): void {
    const delay = Math.max(MIN_TICK_MS, START_TICK_MS - state.score * TICK_STEP_MS);
    timerId = window.setTimeout(tick, delay);
  }

  const run = (): void => {
    phase = 'running';
    playSound('start');
    schedule();
    draw();
  };

  const queueTurn = (direction: Direction): void => {
    const last = turns.at(-1) ?? state.direction;
    if (turns.length < MAX_QUEUED_TURNS && direction !== last && !isOpposite(direction, last)) {
      turns.push(direction);
    }
  };

  const onSpace = (): void => {
    if (phase === 'running') {
      window.clearTimeout(timerId);
      phase = 'paused';
      playSound('pause');
      draw();
      return;
    }
    if (phase === 'over') {
      state = createGame(BOARD_WIDTH, BOARD_HEIGHT, Math.random);
      turns = [];
    }
    run();
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase();
    const direction = KEY_DIRECTIONS[key];

    if (key === 'escape') {
      close?.();
    } else if (key === ' ') {
      onSpace();
    } else if (direction) {
      queueTurn(direction);
      if (phase === 'ready') {
        run();
      }
    } else {
      return;
    }
    // Arrows and space would otherwise scroll the page behind the game.
    event.preventDefault();
  };

  close = (): void => {
    window.clearTimeout(timerId);
    document.removeEventListener('keydown', onKeyDown);
    overlay.remove();
    document.body.classList.remove('snake-open');
    previousFocus?.focus();
    close = null;
  };

  document.addEventListener('keydown', onKeyDown);
  document.body.append(overlay);
  document.body.classList.add('snake-open');
  overlay.focus();
  draw();
}
