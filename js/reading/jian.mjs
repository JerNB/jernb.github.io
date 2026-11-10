// 笺 — the slip of paper that opens beside a place. Pure helpers: trimming the copy and
// deciding where the slip sits so it never covers its own label or leaves the scroll.

const ENDS = '。！？；';

/** One line of prose from a WeRead highlight: line breaks folded, cut at a sentence end. */
export function clipQuote(text, max = 140) {
  const s = String(text ?? '')
    .replace(/\s*\n\s*/g, (m, i, all) => /[A-Za-z]/.test(all[i - 1] ?? '') && /[A-Za-z]/.test(all[i + m.length] ?? '') ? ' ' : '')
    .trim();
  if (s.length <= max) return s;
  let cut = -1;
  for (let i = max - 1; i >= 0; i--) if (ENDS.includes(s[i])) { cut = i + 1; break; }
  return s.slice(0, cut >= max * 0.5 ? cut : max) + '……';
}

/**
 * Where the slip goes, in track coordinates.
 * Landscape: beside the label, left by preference, flipped right when the view has no room.
 * Portrait: centred on the label, above it, or below when there is no room above.
 * @param {{left:number,right:number,top:number,bottom:number}} label
 * @param {{w:number,h:number}} slip
 * @param {{left:number,right:number,top:number,bottom:number}} view  the visible part of the scroll
 */
export function placeSlip(label, slip, view, orient, gap = 14) {
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  if (orient === 'portrait') {
    const left = clamp((label.left + label.right) / 2 - slip.w / 2, view.left, Math.max(view.left, view.right - slip.w));
    const above = label.top - gap - slip.h;
    return above >= view.top ? { left, top: above, side: 'above' } : { left, top: label.bottom + gap, side: 'below' };
  }
  const fitsLeft = label.left - gap - slip.w >= view.left;
  const fitsRight = label.right + gap + slip.w <= view.right;
  const side = fitsLeft || !fitsRight ? 'left' : 'right';
  const left = side === 'left' ? Math.max(view.left, label.left - gap - slip.w) : label.right + gap;
  return { left, top: clamp(label.top, view.top, Math.max(view.top, view.bottom - slip.h)), side };
}
