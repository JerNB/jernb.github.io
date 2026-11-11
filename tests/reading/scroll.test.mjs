import test from 'node:test';
import assert from 'node:assert/strict';
import { glide, flingTarget, keyIntent, wheelIntent } from '../../js/reading/scroll.mjs';

const run = (state, target, dt, frames, tau) => { const seen = []; for (let i = 0; i < frames && !state.done; i++) { state = glide(state, target, dt, tau); seen.push(state.pos); } return { state, seen }; };

test('glide does nothing without elapsed time', () => {
  assert.deepEqual(glide({ pos: 10, vel: 0 }, 100, 0), { pos: 10, vel: 0, done: false });
});

test('glide eases in from rest: the second frame travels further than the first', () => {
  const { seen } = run({ pos: 0, vel: 0 }, 1000, 16, 2);
  assert.ok(seen[0] > 0);
  assert.ok(seen[1] - seen[0] > seen[0], `${seen[0]} then ${seen[1] - seen[0]}`);
});

test('glide never overshoots or moves backwards, and lands exactly on the target', () => {
  const { state, seen } = run({ pos: 0, vel: 0 }, 1000.4, 16, 400);
  for (let i = 1; i < seen.length; i++) assert.ok(seen[i] >= seen[i - 1] && seen[i] <= 1000.4);
  assert.deepEqual(state, { pos: 1000.4, vel: 0, done: true });
  assert.ok(seen.length < 90, `took ${seen.length} frames`);        // under 1.5 s at 60 Hz
});

test('glide is frame-rate independent', () => {
  const at60 = run({ pos: 0, vel: 0 }, 1000, 16, 15).state.pos;      // 240 ms
  const at120 = run({ pos: 0, vel: 0 }, 1000, 8, 30).state.pos;
  assert.ok(Math.abs(at60 - at120) < 0.01, `${at60} vs ${at120}`);
});

test('glide carries velocity through a retarget (no stop-start between wheel notches)', () => {
  let s = run({ pos: 0, vel: 0 }, 300, 16, 6).state;
  const before = s.vel;
  s = glide(s, 600, 16);
  assert.ok(before > 0 && s.vel > before * 0.9);
});

test('a fling coasts from the release velocity and stops where flingTarget says', () => {
  const target = flingTarget(500, 2, 325);
  assert.equal(target, 1150);
  const { state, seen } = run({ pos: 500, vel: 2 }, target, 16, 600, 325);
  assert.ok(Math.abs(seen[0] - 500 - 2 * 16) < 2, `first frame moved ${seen[0] - 500}`);
  for (let i = 1; i < seen.length; i++) assert.ok(seen[i] >= seen[i - 1] && seen[i] <= target);
  assert.equal(state.pos, target);
});

test('arrow and paging keys move the target, clamped to the scroll', () => {
  assert.equal(keyIntent('ArrowRight', 500, 2000, 1000), 620);
  assert.equal(keyIntent('ArrowLeft', 50, 2000, 1000), 0);
  assert.equal(keyIntent('PageDown', 500, 2000, 1000), 1350);
  assert.equal(keyIntent('PageUp', 500, 2000, 1000), 0);
  assert.equal(keyIntent('End', 500, 2000, 1000), 2000);
  assert.equal(keyIntent('Home', 500, 2000, 1000), 0);
  assert.equal(keyIntent('a', 500, 2000, 1000), null);
});

test('wheel gain scales the distance, not the capture rule', () => {
  assert.deepEqual(wheelIntent({ deltaX: 0, deltaY: 100, deltaMode: 0 }, 500, 500, 2000, 'landscape', 1.5), { capture: true, target: 650 });
});

test('wheel captured mid-scroll', () => {
  assert.deepEqual(wheelIntent({ deltaX: 0, deltaY: 100, deltaMode: 0 }, 500, 500, 2000, 'landscape'), { capture: true, target: 600 });
});

test('wheel accumulates onto the pending target', () => {
  assert.deepEqual(wheelIntent({ deltaX: 0, deltaY: 100, deltaMode: 0 }, 500, 650, 2000, 'landscape'), { capture: true, target: 750 });
});

test('wheel released at the ends so the page can scroll on', () => {
  assert.equal(wheelIntent({ deltaX: 0, deltaY: 100, deltaMode: 0 }, 2000, 2000, 2000, 'landscape').capture, false);
  assert.equal(wheelIntent({ deltaX: 0, deltaY: -100, deltaMode: 0 }, 0, 0, 2000, 'landscape').capture, false);
});

test('target is clamped to the scroll range', () => {
  assert.deepEqual(wheelIntent({ deltaX: 0, deltaY: 300, deltaMode: 0 }, 1900, 1900, 2000, 'landscape'), { capture: true, target: 2000 });
});

test('horizontal trackpad passes through natively', () => {
  assert.equal(wheelIntent({ deltaX: 40, deltaY: 5, deltaMode: 0 }, 500, 500, 2000, 'landscape').capture, false);
});

test('portrait never captures', () => {
  assert.equal(wheelIntent({ deltaX: 0, deltaY: 100, deltaMode: 0 }, 500, 500, 2000, 'portrait').capture, false);
});

test('deltaMode 1 (lines) scales by 16', () => {
  assert.deepEqual(wheelIntent({ deltaX: 0, deltaY: 3, deltaMode: 1 }, 500, 500, 2000, 'landscape'), { capture: true, target: 548 });
});

test('wheel released within a pixel of the end', () => {
  assert.equal(wheelIntent({ deltaX: 0, deltaY: 100, deltaMode: 0 }, 1999.2, 1999.2, 2000, 'landscape').capture, false);
  assert.equal(wheelIntent({ deltaX: 0, deltaY: -100, deltaMode: 0 }, 0.8, 0.8, 2000, 'landscape').capture, false);
});

test('ctrl+wheel (zoom, pinch) is never captured', () => {
  assert.equal(wheelIntent({ deltaX: 0, deltaY: 100, deltaMode: 0, ctrlKey: true }, 500, 500, 2000, 'landscape').capture, false);
});
