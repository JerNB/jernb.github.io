// Smooth, inertial scrolling for the reading scroll. On desktop a vertical wheel, the arrow
// and paging keys and a mouse drag all move the scroll sideways through one critically
// damped glide; at either end the wheel is released so the page keeps scrolling.
// Trackpad sideways swipes and touch stay native.

const WHEEL_TAU = 90;     // ms: glide time constant for wheel and keys (≈ 0.6 s to settle)
const FLING_TAU = 325;    // ms: friction after a drag is released
const WHEEL_GAIN = 1.5;   // the strip is ~14 000 px wide; a notch should cover some ground
const KEY_STEP = 120;

/**
 * One step of a critically damped spring toward `target` (exact solution, so it does not
 * depend on the frame rate). Velocity is continuous: it eases in from rest and carries
 * through a retarget. Never crosses the target; `done` once it has landed on it.
 * @param {{pos:number, vel:number}} state  px and px/ms
 */
export function glide({ pos, vel }, target, dtMs, tauMs = WHEEL_TAU) {
  if (dtMs <= 0) return { pos, vel, done: false };
  const w = 1 / tauMs, c1 = pos - target, c2 = vel + w * c1, e = Math.exp(-w * dtMs);
  let p = target + (c1 + c2 * dtMs) * e, v = (c2 - w * (c1 + c2 * dtMs)) * e;
  if ((c1 < 0 && p > target) || (c1 > 0 && p < target)) { p = target; v = 0; }
  if (Math.abs(target - p) < 0.5 && Math.abs(v) < 0.02) return { pos: target, vel: 0, done: true };
  return { pos: p, vel: v, done: false };
}

/** Where a drag released at `vel` px/ms coasts to: with this target the glide is pure friction. */
export const flingTarget = (pos, vel, tauMs = FLING_TAU) => pos + vel * tauMs;

/** New target for a navigation key, or null when the key is not ours. */
export function keyIntent(key, target, max, page) {
  const d = { ArrowRight: KEY_STEP, ArrowLeft: -KEY_STEP, PageDown: page * .85, PageUp: -page * .85, End: Infinity, Home: -Infinity }[key];
  return d === undefined ? null : Math.min(max, Math.max(0, target + d));
}

/** Decide whether a wheel event drives the scroll, and where the pending target moves. */
export function wheelIntent({ deltaX, deltaY, deltaMode, ctrlKey }, pos, target, max, orient, gain = 1) {
  if (orient === 'portrait' || ctrlKey) return { capture: false, target };   // ctrl+wheel = page zoom / pinch
  if (Math.abs(deltaX) > Math.abs(deltaY)) return { capture: false, target };
  const d = deltaY * (deltaMode === 1 ? 16 : deltaMode === 2 ? 400 : 1);
  if ((d > 0 && pos >= max - 1) || (d < 0 && pos <= 1)) return { capture: false, target };
  return { capture: true, target: Math.min(max, Math.max(0, target + d * gain)) };
}

/**
 * @param {HTMLElement} viewport  the horizontally scrolling element
 * @param {{orient:'landscape'|'portrait', reducedMotion:boolean, onFrame:(pos:number)=>void}} opts
 */
export function createScrollController(viewport, { orient, reducedMotion, onFrame }) {
  if (orient === 'portrait') {                       // the hanging scroll rides the page's own scrolling
    addEventListener('scroll', () => onFrame(scrollY), { passive: true });
    return { get position() { return scrollY; }, max: () => document.documentElement.scrollHeight - innerHeight };
  }

  const max = () => viewport.scrollWidth - viewport.clientWidth;
  // `s` is the glide's own sub-pixel position: integrating from the browser's rounded
  // scrollLeft is what made the old motion crawl and stutter at the end of each move.
  let s = { pos: viewport.scrollLeft, vel: 0 }, target = s.pos, tau = WHEEL_TAU, raf = 0, last = 0, wrote = s.pos;

  const stop = () => {
    cancelAnimationFrame(raf); raf = 0; last = 0;
    s = { pos: viewport.scrollLeft, vel: 0 }; target = s.pos;
    viewport.classList.remove('is-gliding');
  };
  const frame = now => {
    raf = 0;
    if (Math.abs(viewport.scrollLeft - wrote) > 2) return stop();     // something else moved it (touch, focus, trackpad)
    const dt = last ? Math.min(50, now - last) : 16; last = now;
    s = glide(s, target, dt, tau);
    viewport.scrollLeft = s.pos; wrote = viewport.scrollLeft;
    if (s.done) stop(); else raf = requestAnimationFrame(frame);
  };
  const go = (to, newTau = WHEEL_TAU) => {
    target = Math.min(max(), Math.max(0, to)); tau = newTau;
    if (reducedMotion) { viewport.scrollLeft = target; return stop(); }
    if (!raf) { wrote = viewport.scrollLeft; viewport.classList.add('is-gliding'); raf = requestAnimationFrame(frame); }
  };

  viewport.addEventListener('wheel', e => {
    const it = wheelIntent(e, viewport.scrollLeft, raf ? target : viewport.scrollLeft, max(), orient, WHEEL_GAIN);
    if (!it.capture) { if (raf && Math.abs(e.deltaX) > Math.abs(e.deltaY)) stop(); return; }
    e.preventDefault();
    go(it.target);
  }, { passive: false });

  viewport.addEventListener('keydown', e => {
    if (e.target !== viewport || e.ctrlKey || e.metaKey || e.altKey) return;
    const to = keyIntent(e.key, raf ? target : viewport.scrollLeft, max(), viewport.clientWidth);
    if (to === null) return;
    e.preventDefault();
    go(to);
  });

  viewport.addEventListener('scroll', () => {
    if (!raf) { s = { pos: viewport.scrollLeft, vel: 0 }; target = s.pos; }   // native scrolling wins
    onFrame(viewport.scrollLeft);
  }, { passive: true });

  // drag to pan with a mouse, coasting on release (touch already pans natively)
  let drag = null;
  viewport.addEventListener('mousedown', e => {      // no text selection while dragging; keep keyboard focus
    if (e.button === 0 && !e.target.closest('button')) { e.preventDefault(); viewport.focus({ preventScroll: true }); }
  });
  viewport.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('button')) return;
    stop();
    drag = { x: e.clientX, from: viewport.scrollLeft, trail: [[e.timeStamp, e.clientX]] };
  });
  addEventListener('pointermove', e => {
    if (!drag) return;
    viewport.scrollLeft = drag.from - (e.clientX - drag.x);
    viewport.classList.add('is-gliding');
    drag.trail.push([e.timeStamp, e.clientX]);
    while (drag.trail.length > 2 && e.timeStamp - drag.trail[0][0] > 90) drag.trail.shift();
  });
  const release = e => {
    if (!drag) return;
    const [t0, x0] = drag.trail[0], dt = e.timeStamp - t0;
    const vel = dt > 0 && dt < 200 ? -(e.clientX - x0) / dt : 0;       // px/ms, in scroll direction
    drag = null;
    if (reducedMotion || Math.abs(vel) < 0.1) return viewport.classList.remove('is-gliding');
    s = { pos: viewport.scrollLeft, vel };
    go(flingTarget(s.pos, vel), FLING_TAU);
  };
  addEventListener('pointerup', release);
  addEventListener('pointercancel', () => { drag = null; });

  return { get position() { return viewport.scrollLeft; }, max };
}
