import { describe, expect, test } from 'bun:test';
import { createGame, placeFood, renderBoard, stepGame } from '../src/snake.ts';

const first = () => 0;

const game = (overrides) => ({ ...createGame(6, 4, first), ...overrides });

describe('snake', () => {
  test('starts centred, three cells long, heading right', () => {
    const state = createGame(6, 4, first);
    expect(state.snake).toEqual([{ x: 3, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 2 }]);
    expect(state.direction).toBe('right');
    expect(state.food).toEqual({ x: 0, y: 0 });
  });

  test('moves one cell and keeps its length', () => {
    const next = stepGame(game({ food: { x: 0, y: 0 } }), 'right', first);
    expect(next.snake).toEqual([{ x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 }]);
  });

  test('ignores a turn straight back', () => {
    const next = stepGame(game({ food: { x: 0, y: 0 } }), 'left', first);
    expect(next.direction).toBe('right');
    expect(next.snake[0]).toEqual({ x: 4, y: 2 });
  });

  test('grows and scores when eating', () => {
    const next = stepGame(game({ food: { x: 4, y: 2 } }), 'right', first);
    expect(next.snake.length).toBe(4);
    expect(next.score).toBe(1);
    expect(next.snake).not.toContainEqual(next.food);
  });

  test('dies on the wall', () => {
    const state = game({ snake: [{ x: 5, y: 0 }, { x: 4, y: 0 }], food: { x: 0, y: 3 } });
    expect(stepGame(state, 'right', first).over).toBe(true);
  });

  test('dies on its own body', () => {
    const snake = [{ x: 2, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 2 }];
    const state = game({ snake, direction: 'left', food: { x: 0, y: 0 } });
    expect(stepGame(state, 'down', first).over).toBe(true);
  });

  test('may move into the cell the tail is leaving', () => {
    const snake = [{ x: 2, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 2, y: 2 }];
    const state = game({ snake, direction: 'left', food: { x: 0, y: 0 } });
    expect(stepGame(state, 'down', first).over).toBe(false);
  });

  test('has no food cell left on a full board', () => {
    const snake = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
    expect(placeFood(snake, 2, 1, first)).toBeNull();
  });

  test('draws the board as ASCII', () => {
    const state = { ...createGame(3, 1, first), snake: [{ x: 1, y: 0 }, { x: 0, y: 0 }], food: { x: 2, y: 0 } };
    expect(renderBoard(state)).toBe(['+-------+', '| o @ * |', '+-------+'].join('\n'));
  });
});
