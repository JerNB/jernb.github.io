import test from 'node:test';
import assert from 'node:assert/strict';
import { pointAt, inRanges } from '../../js/reading/path.mjs';

test('pointAt walks by arc length and clamps', () => {
  const line = [[0, 0], [10, 0], [10, 10]];
  assert.deepEqual(pointAt(line, 0), [0, 0]);
  assert.deepEqual(pointAt(line, 0.5), [10, 0]);
  assert.deepEqual(pointAt(line, 0.75), [10, 5]);
  assert.deepEqual(pointAt(line, 2), [10, 10]);
  assert.deepEqual(pointAt(line, -1), [0, 0]);
});

test('inRanges is inclusive', () => {
  assert.equal(inRanges([[5, 9]], 9), true);
  assert.equal(inRanges([[5, 9]], 10), false);
  assert.equal(inRanges([], 1), false);
});

import { pointOnAxis } from '../../js/reading/path.mjs';
test('pointOnAxis interpolates the road at a given x (or y) and clamps to its ends', () => {
  const line = [[0, 10], [100, 30], [200, 30]];
  assert.deepEqual(pointOnAxis(line, 0, 50), [50, 20]);
  assert.deepEqual(pointOnAxis(line, 0, -5), [0, 10]);
  assert.deepEqual(pointOnAxis(line, 0, 999), [200, 30]);
  assert.deepEqual(pointOnAxis([[5, 0], [15, 100]], 1, 50), [10, 50]);
});

import { orderAlong } from '../../js/reading/path.mjs';
test('orderAlong sorts keyed anchors by the scroll axis', () => {
  assert.deepEqual(orderAlong({ a: [300, 0], b: [10, 50], c: [120, 9] }, 0), ['b', 'c', 'a']);
  assert.deepEqual(orderAlong({ a: [0, 30], b: [0, 10] }, 1), ['b', 'a']);
});
