// Seats a place's label (榜题) on the thing it names: the label's bottom edge comes to rest a few
// pixels above the first solid ink under it, so every label on the scroll stands the same small
// distance above its roof, tree or boat instead of floating at whatever height the painter guessed.

/**
 * @param {[number, number]} anchor  bottom centre of the label, as the painter placed it
 * @param {(x: number, y: number) => boolean} isInk  whether the painted scroll is inked there
 * @returns {[number, number]} the seated anchor (unchanged when nothing solid is in reach, or when
 *   the anchor already stands on ink: a roof, or a mountain it is meant to sit on)
 */
export function seatLabel([x, y], isInk, { reach = 180, half = 14, gap = 6 } = {}) {
  const row = r => { let n = 0; for (let dx = -half; dx <= half; dx++) if (isInk(x + dx, r)) n++; return n; };
  const solid = r => row(r) > 0 && row(r) + row(r + 1) + row(r + 2) >= 3;   // one speck is not a roof
  // only ever downwards: a label already standing on ink stays, rather than climbing onto the far
  // roofs or hills behind its building
  const start = Math.round(y);
  if (solid(start)) return [x, y];
  for (let r = start + 1; r <= y + reach; r++) if (solid(r)) return [x, r - gap];
  return [x, y];
}
