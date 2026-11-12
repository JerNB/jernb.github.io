import test from 'node:test';
import assert from 'node:assert/strict';
import { seatLabel } from '../../tools/reading-scroll/seat.mjs';

/** A sheet of paper with ink only inside the given boxes [x0, y0, x1, y1]. */
const sheet = (...boxes) => (x, y) => boxes.some(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1);

test('a label floating above a building comes down to sit just above its roof', () => {
  const ink = sheet([90, 300, 140, 360]);                 // a house whose roof is at y = 300
  assert.deepEqual(seatLabel([110, 200], ink), [110, 294]);
});

test('labels only ever come down: one already on ink is not lifted onto whatever lies behind it', () => {
  const ink = sheet([90, 300, 140, 360], [60, 240, 200, 250]);   // a house, and a row of far roofs above it
  assert.deepEqual(seatLabel([110, 320], ink), [110, 320]);
  assert.deepEqual(seatLabel([110, 270], ink), [110, 294]);
});

test('ink just beside the column still counts, so a label beside a thin tower finds it', () => {
  const ink = sheet([120, 250, 122, 400]);                // a one-pixel-wide mast 11 px to the right
  assert.deepEqual(seatLabel([110, 180], ink), [110, 244]);
});

test('a lone speck is not a building', () => {
  const ink = sheet([110, 260, 110, 260]);
  assert.deepEqual(seatLabel([110, 200], ink), [110, 200]);
});

test('a label with nothing under it within reach stays where the painter put it', () => {
  const ink = sheet([90, 500, 140, 560]);                 // too far below
  assert.deepEqual(seatLabel([110, 200], ink), [110, 200]);
});

test('a label sunk deep inside a mass of ink is left alone rather than flung up to a ridge', () => {
  const ink = sheet([0, 100, 400, 600]);                  // a mountain all around the anchor
  assert.deepEqual(seatLabel([110, 300], ink), [110, 300]);
});
