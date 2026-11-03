import { SCRAMBLE_GLYPHS, scrambleFrame, toAscii, toGray } from './ascii';

export const ARTEM_IMAGE = '/images/marco.webp';
export const ARTEM_COLS = 80;
// A monospace cell is about 0.6em wide and 1em tall, so a square photo needs 0.6 rows per column.
export const ARTEM_ROWS = 48;
// Keep in sync with the photo fade in styles.css.
const SCRAMBLE_MS = 700;
const PHOTO_CLASS = 'show-photo';

let ascii = '';
let loading: Promise<string> | null = null;

function loadAscii(): Promise<string> {
  loading ??= new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = ARTEM_COLS;
      canvas.height = ARTEM_ROWS;
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Canvas unavailable'));
        return;
      }
      context.drawImage(image, 0, 0, ARTEM_COLS, ARTEM_ROWS);
      ascii = toAscii(toGray(context.getImageData(0, 0, ARTEM_COLS, ARTEM_ROWS).data), ARTEM_COLS);
      resolve(ascii);
    };
    image.onerror = () => reject(new Error('Photo unavailable'));
    image.src = ARTEM_IMAGE;
  });
  return loading;
}

const randomGlyph = (): string => SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];

// Fills the `artem` ASCII art and wires the hover: the art scrambles away while the photo fades in.
// Call after every render, since a re-render replaces the elements.
export function setupArtem(): void {
  const root = document.querySelector<HTMLElement>('.artem');
  const art = root?.querySelector<HTMLElement>('.artem-ascii');
  if (!root || !art) {
    return;
  }

  let frameId = 0;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const stop = (): void => {
    cancelAnimationFrame(frameId);
    root.classList.remove(PHOTO_CLASS);
    art.textContent = ascii;
  };

  const play = (): void => {
    if (!ascii) {
      return;
    }
    root.classList.add(PHOTO_CLASS);
    if (reduceMotion.matches) {
      return;
    }

    const vanishAt = Array.from(ascii, () => Math.random() * SCRAMBLE_MS);
    let start: number | null = null;
    const step = (now: number): void => {
      start ??= now;
      const elapsed = now - start;
      art.textContent = scrambleFrame(ascii, vanishAt, elapsed, randomGlyph);
      if (elapsed < SCRAMBLE_MS) {
        frameId = requestAnimationFrame(step);
      }
    };
    frameId = requestAnimationFrame(step);
  };

  root.addEventListener('mouseenter', play);
  root.addEventListener('mouseleave', stop);

  if (ascii) {
    art.textContent = ascii;
  } else {
    loadAscii()
      .then((text) => {
        art.textContent = text;
      })
      .catch(() => {
        root.hidden = true;
      });
  }
}
