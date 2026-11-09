import test from 'node:test';
import assert from 'node:assert/strict';
import { stepToward, wheelIntent } from '../../js/reading/scroll.mjs';

test('stepToward converges with a half-life', () => {
  assert.equal(stepToward(0, 100, 120), 50);
  assert.equal(stepToward(0, 100, 0), 0);
  assert.equal(stepToward(99.7, 100, 16), 100);   // snaps when within half a pixel
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

test('loop settles when the browser rounds scroll positions to device pixels', () => {
  for (const dpr of [1, 1.25, 1.5, 2]) {
    const round = v => Math.round(v * dpr) / dpr;
    let pos = 0; const target = 1000.4;
    for (let i = 0; i < 400 && pos !== target; i++) { const next = stepToward(pos, target, 16); pos = next === target ? target : round(next); }
    assert.equal(pos, target, `dpr ${dpr}`);
  }
});

test('wheel released within a pixel of the end', () => {
  assert.equal(wheelIntent({ deltaX: 0, deltaY: 100, deltaMode: 0 }, 1999.2, 1999.2, 2000, 'landscape').capture, false);
  assert.equal(wheelIntent({ deltaX: 0, deltaY: -100, deltaMode: 0 }, 0.8, 0.8, 2000, 'landscape').capture, false);
});

test('ctrl+wheel (zoom, pinch) is never captured', () => {
  assert.equal(wheelIntent({ deltaX: 0, deltaY: 100, deltaMode: 0, ctrlKey: true }, 500, 500, 2000, 'landscape').capture, false);
});
