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
