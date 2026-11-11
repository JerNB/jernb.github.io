import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutScroll, LANDSCAPE_H, PORTRAIT_W, DIRECTION } from '../../js/reading/layout.mjs';

const regions = [{ id: 'a', minWidth: 700 }, { id: 'b', minWidth: 300 }];
const pick = r => r.rects.map(({ regionId, x, y, w, h }) => ({ regionId, x, y, w, h }));

test('constants', () => {
  assert.equal(DIRECTION, 'ltr'); assert.equal(LANDSCAPE_H, 560); assert.equal(PORTRAIT_W, 400);
});

test('landscape packs in order', () => {
  const r = layoutScroll(regions, { a: 2, b: 4 }, 'landscape');
  assert.deepEqual(pick(r), [
    { regionId: 'a', x: 0, y: 0, w: 700, h: 560 },
    { regionId: 'b', x: 700, y: 0, w: 750, h: 560 },
  ]);
  assert.equal(r.width, 1450); assert.equal(r.height, 560);
});

test('portrait stacks', () => {
  const r = layoutScroll(regions, { a: 2, b: 4 }, 'portrait');
  assert.deepEqual(pick(r), [
    { regionId: 'a', x: 0, y: 0, w: 400, h: 560 },
    { regionId: 'b', x: 0, y: 560, w: 400, h: 850 },
  ]);
  assert.equal(r.width, 400); assert.equal(r.height, 1410);
});

test('adding a book only grows its own region', () => {
  const before = layoutScroll(regions, { a: 2, b: 4 }, 'landscape');
  const after = layoutScroll(regions, { a: 2, b: 5 }, 'landscape');
  assert.deepEqual(after.rects[0], before.rects[0]);
  assert.equal(after.rects[1].w, 900);
});
