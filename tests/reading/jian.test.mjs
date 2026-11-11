import test from 'node:test';
import assert from 'node:assert/strict';
import { clipQuote, placeSlip } from '../../js/reading/jian.mjs';

test('a short quote is kept whole, its line breaks folded away', () => {
  assert.equal(clipQuote('每过完一天，\n要努力比早上醒来时\n更聪明一点点。', 140), '每过完一天，要努力比早上醒来时更聪明一点点。');
  assert.equal(clipQuote('read\nmore books', 140), 'read more books');
});

test('a long quote is cut at the last sentence end inside the limit', () => {
  const q = '甲'.repeat(30) + '。' + '乙'.repeat(30) + '。' + '丙'.repeat(60) + '。';
  assert.equal(clipQuote(q, 80), '甲'.repeat(30) + '。' + '乙'.repeat(30) + '。……');
});

test('a long quote with no sentence end nearby is cut at the limit', () => {
  const q = '甲'.repeat(5) + '。' + '乙'.repeat(200);
  const out = clipQuote(q, 50);
  assert.equal(out.length, 52);
  assert.ok(out.endsWith('乙……'));
});

test('empty or missing quotes clip to an empty string', () => {
  assert.equal(clipQuote(null, 100), '');
  assert.equal(clipQuote('  \n ', 100), '');
});

const view = { left: 1000, right: 2200, top: 12, bottom: 548 };

test('landscape: the slip sits to the left of the label, level with its top', () => {
  assert.deepEqual(placeSlip({ left: 1600, right: 1640, top: 200, bottom: 300 }, { w: 220, h: 260 }, view, 'landscape'),
    { left: 1600 - 14 - 220, top: 200, side: 'left' });
});

test('landscape: no room on the left of the viewport, so it flips to the right', () => {
  assert.deepEqual(placeSlip({ left: 1100, right: 1140, top: 200, bottom: 300 }, { w: 220, h: 260 }, view, 'landscape'),
    { left: 1140 + 14, top: 200, side: 'right' });
});

test('landscape: the slip never leaves the strip vertically', () => {
  assert.equal(placeSlip({ left: 1600, right: 1640, top: 400, bottom: 480 }, { w: 220, h: 260 }, view, 'landscape').top, 548 - 260);
  assert.equal(placeSlip({ left: 1600, right: 1640, top: -30, bottom: 60 }, { w: 220, h: 260 }, view, 'landscape').top, 12);
});

test('landscape: too wide for either side, it stays inside the viewport', () => {
  const p = placeSlip({ left: 1100, right: 1140, top: 200, bottom: 300 }, { w: 1150, h: 260 }, view, 'landscape');
  assert.equal(p.left, 1000);
});

const page = { left: 8, right: 352, top: 3000, bottom: 3700 };

test('portrait: the slip goes above the label, centred and kept inside the scroll', () => {
  assert.deepEqual(placeSlip({ left: 280, right: 320, top: 3400, bottom: 3480 }, { w: 200, h: 220 }, page, 'portrait'),
    { left: 352 - 200, top: 3400 - 14 - 220, side: 'above' });
});

test('portrait: no room above in the viewport, so it drops below the label', () => {
  assert.deepEqual(placeSlip({ left: 100, right: 140, top: 3100, bottom: 3180 }, { w: 200, h: 220 }, page, 'portrait'),
    { left: 20, top: 3180 + 14, side: 'below' });
});
