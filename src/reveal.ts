const REVEAL_SELECTOR = '[data-reveal]';
const ROOT_MARGIN = '0px 0px -10% 0px';
const STAGGER_MS = 50;
const MAX_DELAY_MS = 250;

let observer: IntersectionObserver | null = null;

export function getRevealedFlags(): boolean[] {
  return Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR), (target) =>
    target.hasAttribute('data-visible'),
  );
}

function reveal(entries: IntersectionObserverEntry[], current: IntersectionObserver): void {
  let batchIndex = 0;
  for (const entry of entries) {
    if (!entry.isIntersecting) {
      continue;
    }

    const target = entry.target as HTMLElement;
    target.style.setProperty('--reveal-delay', `${Math.min(batchIndex * STAGGER_MS, MAX_DELAY_MS)}ms`);
    target.setAttribute('data-visible', '');
    current.unobserve(target);
    batchIndex += 1;
  }
}

// Targets flagged in `revealed` stay visible, so a re-render never hides content again.
export function setupScrollReveal(revealed: readonly boolean[] = []): void {
  observer?.disconnect();
  observer = null;

  if (!('IntersectionObserver' in window)) {
    return;
  }

  const current = new IntersectionObserver(reveal, { rootMargin: ROOT_MARGIN });
  observer = current;
  document.documentElement.classList.add('js-reveal');

  document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((target, index) => {
    if (revealed[index]) {
      target.setAttribute('data-visible', '');
    } else {
      current.observe(target);
    }
  });
}
