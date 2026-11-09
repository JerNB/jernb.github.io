// Polyline helpers for the traveler walking along the scroll's road.

/** Point at fraction t (0..1, clamped) of the polyline's total arc length. */
export function pointAt(line, t) {
  if (!line.length) return [0, 0];
  const segs = [];
  let total = 0;
  for (let i = 1; i < line.length; i++) {
    const len = Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]);
    segs.push(len); total += len;
  }
  let d = Math.min(1, Math.max(0, t)) * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i] || i === segs.length - 1) {
      const f = segs[i] ? Math.min(1, d / segs[i]) : 0;
      const [a, b] = [line[i], line[i + 1]];
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    }
    d -= segs[i];
  }
  return [...line[line.length - 1]];
}

/** True when v lies inside any [a, b] range (inclusive). */
export const inRanges = (ranges, v) => ranges.some(([a, b]) => v >= a && v <= b);
