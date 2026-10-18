import type { Direction } from './snake';

export type Gesture = Direction | 'tap';

const SWIPE_MIN_PX = 30;

// Shorter moves count as a tap; otherwise the dominant axis decides the direction.
export function readGesture(dx: number, dy: number): Gesture {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN_PX) {
    return 'tap';
  }
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  }
  return dy > 0 ? 'down' : 'up';
}

export function listenForGestures(
  target: EventTarget,
  onGesture: (gesture: Gesture, event: TouchEvent) => void,
): void {
  let start: { x: number; y: number } | null = null;

  target.addEventListener(
    'touchstart',
    (event) => {
      const { touches } = event as TouchEvent;
      start = touches.length === 1 ? { x: touches[0].clientX, y: touches[0].clientY } : null;
    },
    { passive: true },
  );

  target.addEventListener(
    'touchend',
    (event) => {
      const touch = (event as TouchEvent).changedTouches[0];
      if (start && touch) {
        onGesture(readGesture(touch.clientX - start.x, touch.clientY - start.y), event as TouchEvent);
      }
      start = null;
    },
    { passive: true },
  );
}
