const REVEAL_SELECTOR = '[data-reveal]';
const SKIP_SELECTOR = '[role="tooltip"], #typed-subtitle, #presence';
const ROOT_MARGIN = '0px 0px -10% 0px';
const CHARS_PER_SECOND = 1800;
const UNIT_PAUSE_MS = 30;
const FAST_SCROLL_PX_PER_SECOND = 1500;
const FAST_SCROLL_HOLD_MS = 200;
const PENDING_CLASS = 'pending';
const STREAMED_ATTRIBUTE = 'data-streamed';
export const REVEAL_STORAGE_KEY = 'marcopisco-revealed';

interface TextSlot {
  node: Text;
  full: string;
}

let observer: IntersectionObserver | null = null;
let queue: HTMLElement[] = [];
let streaming = false;
let frameId = 0;
let pauseId = 0;
let current: { unit: HTMLElement; slots: TextSlot[] } | null = null;
let lastScroll = { y: 0, time: 0 };
let fastUntil = 0;

// Visible prefix of each string once `budget` characters have arrived, filled in order.
export function visiblePrefixes(texts: readonly string[], budget: number): string[] {
  let left = Math.max(0, Math.floor(budget));
  return texts.map((text) => {
    const shown = text.slice(0, left);
    left -= shown.length;
    return shown;
  });
}

// A scroll covering `distance` pixels in `elapsedMs` is fast enough to skip the streaming.
export function isFastScroll(distance: number, elapsedMs: number): boolean {
  return elapsedMs > 0 && (Math.abs(distance) / elapsedMs) * 1000 >= FAST_SCROLL_PX_PER_SECOND;
}

function readSeen(): boolean {
  try {
    return sessionStorage.getItem(REVEAL_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

function saveSeen(): void {
  try {
    sessionStorage.setItem(REVEAL_STORAGE_KEY, '1');
  } catch {
    // Storage blocked: the effect simply plays again on the next load.
  }
}

export function getRevealedFlags(): boolean[] {
  return Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR), (target) =>
    target.hasAttribute(STREAMED_ATTRIBUTE),
  );
}

function collectSlots(unit: HTMLElement): TextSlot[] {
  const slots: TextSlot[] = [];
  const walker = document.createTreeWalker(unit, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text;
    if (text.data.trim() !== '' && !text.parentElement?.closest(SKIP_SELECTOR)) {
      slots.push({ node: text, full: text.data });
    }
  }
  return slots;
}

function markStreamed(unit: HTMLElement): void {
  unit.classList.remove(PENDING_CLASS);
  unit.setAttribute(STREAMED_ATTRIBUTE, '');
}

function finishUnit(unit: HTMLElement): void {
  unit.style.minHeight = '';
  current = null;
  pauseId = window.setTimeout(() => {
    streaming = false;
    streamNext();
  }, UNIT_PAUSE_MS);
}

function streamUnit(unit: HTMLElement): void {
  const slots = collectSlots(unit);
  const total = slots.reduce((sum, slot) => sum + slot.full.length, 0);
  unit.style.minHeight = `${unit.offsetHeight}px`;
  slots.forEach((slot) => {
    slot.node.data = '';
  });
  markStreamed(unit);
  current = { unit, slots };

  let start: number | null = null;
  const step = (now: number): void => {
    start ??= now;
    const budget = ((now - start) / 1000) * CHARS_PER_SECOND;
    const shown = visiblePrefixes(slots.map((slot) => slot.full), budget);
    slots.forEach((slot, index) => {
      if (slot.node.data !== shown[index]) {
        slot.node.data = shown[index];
      }
    });

    if (budget < total) {
      frameId = requestAnimationFrame(step);
    } else {
      finishUnit(unit);
    }
  };
  frameId = requestAnimationFrame(step);
}

function streamNext(): void {
  if (streaming) {
    return;
  }
  if (queue.length === 0) {
    saveSeen();
    return;
  }

  queue.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  const unit = queue.shift() as HTMLElement;
  streaming = true;
  streamUnit(unit);
}

function enqueue(entries: IntersectionObserverEntry[], watcher: IntersectionObserver): void {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      watcher.unobserve(entry.target);
      queue.push(entry.target as HTMLElement);
    }
  }
  if (performance.now() < fastUntil) {
    showReached();
  } else {
    streamNext();
  }
}

// Completes the streaming unit, the queue and every pending unit already scrolled into or past.
function showReached(): void {
  cancelAnimationFrame(frameId);
  window.clearTimeout(pauseId);
  if (current) {
    current.slots.forEach((slot) => {
      slot.node.data = slot.full;
    });
    current.unit.style.minHeight = '';
    current = null;
  }

  document.querySelectorAll<HTMLElement>(`.${PENDING_CLASS}`).forEach((unit) => {
    if (unit.getBoundingClientRect().top < window.innerHeight) {
      observer?.unobserve(unit);
      markStreamed(unit);
    }
  });
  queue.forEach(markStreamed);
  queue = [];
  streaming = false;
  saveSeen();
}

function trackScroll(): void {
  const now = performance.now();
  if (isFastScroll(window.scrollY - lastScroll.y, now - lastScroll.time)) {
    fastUntil = now + FAST_SCROLL_HOLD_MS;
    showReached();
  }
  lastScroll = { y: window.scrollY, time: now };
}

function reset(): void {
  observer?.disconnect();
  observer = null;
  window.removeEventListener('scroll', trackScroll);
  cancelAnimationFrame(frameId);
  window.clearTimeout(pauseId);
  current = null;
  queue = [];
  streaming = false;
}

// Units flagged in `streamed` appear complete, so a re-render never hides content again.
// Once the effect has played in this tab, a reload shows everything at once.
export function setupScrollReveal(streamed: readonly boolean[] = []): void {
  reset();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window) || readSeen()) {
    return;
  }

  const watcher = new IntersectionObserver(enqueue, { rootMargin: ROOT_MARGIN });
  observer = watcher;
  lastScroll = { y: window.scrollY, time: performance.now() };
  window.addEventListener('scroll', trackScroll, { passive: true });

  document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((target, index) => {
    if (streamed[index]) {
      target.setAttribute(STREAMED_ATTRIBUTE, '');
    } else {
      target.classList.add(PENDING_CLASS);
      watcher.observe(target);
    }
  });
}
