export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Point {
  x: number;
  y: number;
}

export interface SnakeState {
  width: number;
  height: number;
  // Head first.
  snake: Point[];
  direction: Direction;
  food: Point | null;
  score: number;
  over: boolean;
}

const START_LENGTH = 3;

const DELTAS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITES: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

export const GLYPHS = { head: '@', body: 'o', food: '*', empty: '.' };

const samePoint = (a: Point, b: Point): boolean => a.x === b.x && a.y === b.y;

export function isOpposite(a: Direction, b: Direction): boolean {
  return OPPOSITES[a] === b;
}

// Random free cell, or null when the snake fills the board.
export function placeFood(
  snake: readonly Point[],
  width: number,
  height: number,
  random: () => number,
): Point | null {
  const free: Point[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!snake.some((part) => part.x === x && part.y === y)) {
        free.push({ x, y });
      }
    }
  }
  return free.length === 0 ? null : free[Math.floor(random() * free.length)];
}

export function createGame(width: number, height: number, random: () => number): SnakeState {
  const head = { x: Math.floor(width / 2), y: Math.floor(height / 2) };
  const snake = Array.from({ length: START_LENGTH }, (_, index) => ({ x: head.x - index, y: head.y }));
  return {
    width,
    height,
    snake,
    direction: 'right',
    food: placeFood(snake, width, height, random),
    score: 0,
    over: false,
  };
}

export function stepGame(state: SnakeState, turn: Direction, random: () => number): SnakeState {
  if (state.over) {
    return state;
  }

  const direction = isOpposite(turn, state.direction) ? state.direction : turn;
  const delta = DELTAS[direction];
  const head = { x: state.snake[0].x + delta.x, y: state.snake[0].y + delta.y };
  const eats = state.food !== null && samePoint(head, state.food);
  // The tail moves away this tick unless the snake grows, so its cell is safe.
  const body = eats ? state.snake : state.snake.slice(0, -1);
  const hitsWall = head.x < 0 || head.y < 0 || head.x >= state.width || head.y >= state.height;

  if (hitsWall || body.some((part) => samePoint(part, head))) {
    return { ...state, direction, over: true };
  }

  const snake = [head, ...body];
  if (!eats) {
    return { ...state, snake, direction };
  }

  const food = placeFood(snake, state.width, state.height, random);
  return { ...state, snake, direction, food, score: state.score + 1, over: food === null };
}

// ASCII board with a border. Each cell is two characters wide so cells look square.
export function renderBoard(state: SnakeState): string {
  const edge = `+${'-'.repeat(state.width * 2 + 1)}+`;
  const rows: string[] = [];
  for (let y = 0; y < state.height; y++) {
    let row = '|';
    for (let x = 0; x < state.width; x++) {
      const index = state.snake.findIndex((part) => part.x === x && part.y === y);
      let glyph = GLYPHS.empty;
      if (index === 0) {
        glyph = GLYPHS.head;
      } else if (index > 0) {
        glyph = GLYPHS.body;
      } else if (state.food && state.food.x === x && state.food.y === y) {
        glyph = GLYPHS.food;
      }
      row += ` ${glyph}`;
    }
    rows.push(`${row} |`);
  }
  return [edge, ...rows, edge].join('\n');
}
