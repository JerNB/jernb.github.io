// Region rectangles for the reading scroll, shared by the generator and the page.
// Each region gets a fixed slot per book plus one slack slot, so adding a book
// only widens its own region and never shifts the others' contents.
export const DIRECTION = 'ltr';      // the scroll unrolls left → right (journey heads west)
export const LANDSCAPE_H = 560;
export const PORTRAIT_W = 400;
export const SLOT = 150;
const PORTRAIT_SLOT = 170;

export function layoutScroll(regions, counts, orient) {
  const rects = [];
  let cursor = 0;
  for (const r of regions) {
    const n = (counts[r.id] ?? 0) + 1;
    if (orient === 'portrait') {
      const h = Math.max(Math.round(r.minWidth * 0.8), n * PORTRAIT_SLOT);
      rects.push({ regionId: r.id, x: 0, y: cursor, w: PORTRAIT_W, h });
      cursor += h;
    } else {
      const w = Math.max(r.minWidth, n * SLOT);
      rects.push({ regionId: r.id, x: cursor, y: 0, w, h: LANDSCAPE_H });
      cursor += w;
    }
  }
  return orient === 'portrait'
    ? { width: PORTRAIT_W, height: cursor, rects }
    : { width: cursor, height: LANDSCAPE_H, rects };
}
