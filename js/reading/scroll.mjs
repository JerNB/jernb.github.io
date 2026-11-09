// Smooth, inertial scrolling for the reading scroll. On desktop a vertical wheel moves the
// scroll sideways with gentle damping; at either end the wheel is released so the page
// keeps scrolling. Trackpad sideways swipes, drag and keyboard stay native.

/** Exponential approach toward `target` with the given half-life; snaps within half a pixel. */
export function stepToward(cur, target, dtMs, halfLifeMs = 120) {
  if (dtMs <= 0) return cur;
  let next = target + (cur - target) * Math.pow(0.5, dtMs / halfLifeMs);
  // browsers round scroll positions to device pixels: always move at least 1px, or stall short of target
  if (Math.abs(next - cur) < 1) next = cur + Math.sign(target - cur) * Math.min(1, Math.abs(target - cur));
  return Math.abs(target - next) < 1 ? target : next;
}

/** Decide whether a wheel event drives the scroll, and where the pending target moves. */
export function wheelIntent({ deltaX, deltaY, deltaMode, ctrlKey }, pos, target, max, orient) {
  if (orient === 'portrait' || ctrlKey) return { capture: false, target };   // ctrl+wheel = page zoom / pinch
  if (Math.abs(deltaX) > Math.abs(deltaY)) return { capture: false, target };
  const d = deltaY * (deltaMode === 1 ? 16 : deltaMode === 2 ? 400 : 1);
  if ((d > 0 && pos >= max - 1) || (d < 0 && pos <= 1)) return { capture: false, target };
  return { capture: true, target: Math.min(max, Math.max(0, target + d)) };
}

/**
 * @param {HTMLElement} viewport  the horizontally scrolling element
 * @param {{orient:'landscape'|'portrait', reducedMotion:boolean, onFrame:(pos:number)=>void}} opts
 */
export function createScrollController(viewport, { orient, reducedMotion, onFrame }) {
  const axis = orient === 'portrait' ? 'scrollTop' : 'scrollLeft';
  const max = () => orient === 'portrait'
    ? document.documentElement.scrollHeight - innerHeight
    : viewport.scrollWidth - viewport.clientWidth;
  let target = viewport[axis], raf = 0, last = 0, driving = false;

  const frame = now => {
    const dt = last ? Math.min(64, now - last) : 16; last = now;
    const cur = viewport[axis], next = stepToward(cur, target, dt);
    driving = true; viewport[axis] = next; driving = false;
    const stuck = viewport[axis] === cur && next !== cur;          // clamped by the browser: give up
    if (next !== target && !stuck) raf = requestAnimationFrame(frame); else { raf = 0; last = 0; target = viewport[axis]; }
  };
  const onWheel = e => {
    const it = wheelIntent(e, viewport[axis], raf ? target : viewport[axis], max(), orient);
    if (!it.capture) return;
    e.preventDefault();
    target = it.target;
    if (reducedMotion) { viewport[axis] = target; return; }
    if (!raf) raf = requestAnimationFrame(frame);
  };
  const onScroll = () => {
    if (!driving && !raf) target = viewport[axis];   // native scrolling (trackpad, keys, focus) wins
    onFrame(viewport[axis]);
  };
  if (orient === 'landscape') viewport.addEventListener('wheel', onWheel, { passive: false });
  (orient === 'portrait' ? window : viewport).addEventListener('scroll', orient === 'portrait'
    ? () => onFrame(scrollY) : onScroll, { passive: true });

  // drag to pan with a mouse (touch already pans natively)
  let drag = null;
  viewport.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && orient === 'landscape' && !e.target.closest('button')) drag = { x: e.clientX, s: viewport.scrollLeft }; });
  addEventListener('pointermove', e => { if (drag) { viewport.scrollLeft = drag.s - (e.clientX - drag.x); target = viewport.scrollLeft; } });
  addEventListener('pointerup', () => { drag = null; });

  return {
    get position() { return orient === 'portrait' ? scrollY : viewport[axis]; },
    max,
  };
}
