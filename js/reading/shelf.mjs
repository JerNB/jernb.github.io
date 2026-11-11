// 书房: how the books are spread over the tiers of the bookcase.

/**
 * Split book widths into tiers no wider than `width`, keeping the books in order and the tiers
 * as even as possible (no long first row with a stub of a last one). A book wider than the
 * shelf gets a tier of its own. Returns the tiers as arrays of book indices.
 * @param {number[]} ws  book widths
 */
export function packShelf(ws, width) {
  if (!ws.length) return [];
  const total = ws.reduce((a, b) => a + b, 0);
  for (let t = Math.max(1, Math.ceil(total / width)); t <= ws.length; t++) {
    const tiers = [];
    let i = 0, left = total;
    for (let k = 0; k < t && i < ws.length; k++) {
      const target = left / (t - k), tier = [i];
      let w = ws[i++];
      while (i < ws.length && w + ws[i] <= width && (k === t - 1 || Math.abs(w + ws[i] - target) <= Math.abs(w - target))) { w += ws[i]; tier.push(i++); }
      tiers.push(tier); left -= w;
    }
    if (i === ws.length) return tiers;
  }
  return ws.map((_, i) => [i]);
}
