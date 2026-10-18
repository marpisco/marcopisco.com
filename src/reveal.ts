const REVEAL_SELECTOR = '[data-reveal]';
const SKIP_SELECTOR = '[role="tooltip"], #typed-subtitle, #presence';
const ROOT_MARGIN = '0px 0px -10% 0px';
const CHARS_PER_SECOND = 900;
const UNIT_PAUSE_MS = 60;
const PENDING_CLASS = 'pending';
const STREAMED_ATTRIBUTE = 'data-streamed';

interface TextSlot {
  node: Text;
  full: string;
}

let observer: IntersectionObserver | null = null;
let queue: HTMLElement[] = [];
let streaming = false;
let frameId = 0;
let pauseId = 0;

// Visible prefix of each string once `budget` characters have arrived, filled in order.
export function visiblePrefixes(texts: readonly string[], budget: number): string[] {
  let left = Math.max(0, Math.floor(budget));
  return texts.map((text) => {
    const shown = text.slice(0, left);
    left -= shown.length;
    return shown;
  });
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
  if (streaming || queue.length === 0) {
    return;
  }

  queue.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  const unit = queue.shift() as HTMLElement;
  streaming = true;
  streamUnit(unit);
}

function enqueue(entries: IntersectionObserverEntry[], current: IntersectionObserver): void {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      current.unobserve(entry.target);
      queue.push(entry.target as HTMLElement);
    }
  }
  streamNext();
}

function reset(): void {
  observer?.disconnect();
  observer = null;
  cancelAnimationFrame(frameId);
  window.clearTimeout(pauseId);
  queue = [];
  streaming = false;
}

// Units flagged in `streamed` appear complete, so a re-render never hides content again.
export function setupScrollReveal(streamed: readonly boolean[] = []): void {
  reset();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    return;
  }

  const current = new IntersectionObserver(enqueue, { rootMargin: ROOT_MARGIN });
  observer = current;

  document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((target, index) => {
    if (streamed[index]) {
      target.setAttribute(STREAMED_ATTRIBUTE, '');
    } else {
      target.classList.add(PENDING_CLASS);
      current.observe(target);
    }
  });
}
