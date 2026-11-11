import test from 'node:test';
import assert from 'node:assert/strict';
import { packShelf } from '../../js/reading/shelf.mjs';

const sum = (ws, tier) => tier.reduce((a, i) => a + ws[i], 0);

test('books keep their order across tiers and none are lost', () => {
  const ws = [20, 30, 25, 40, 22, 18, 35, 28];
  const tiers = packShelf(ws, 100);
  assert.deepEqual(tiers.flat(), ws.map((_, i) => i));
});

test('no tier is wider than the shelf', () => {
  const ws = Array.from({ length: 50 }, (_, i) => 17 + (i * 7) % 29);
  for (const tier of packShelf(ws, 320)) assert.ok(sum(ws, tier) <= 320, sum(ws, tier));
});

test('tiers are balanced instead of leaving a short last row', () => {
  const ws = Array(10).fill(30);                       // 300 wide on a 200 shelf: two tiers of five, not 6 + 4
  const tiers = packShelf(ws, 200);
  assert.deepEqual(tiers.map(t => t.length), [5, 5]);
});

test('a book wider than the shelf still gets a tier of its own', () => {
  assert.deepEqual(packShelf([10, 500, 10], 100), [[0], [1], [2]]);
});

test('an empty shelf has no tiers', () => {
  assert.deepEqual(packShelf([], 100), []);
});
