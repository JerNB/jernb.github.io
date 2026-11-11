// Region painter registry. Each painter:
//   paint(api, {w,h}, region, places, orient, ctxInfo) -> { road, anchors, objects?, dark? }
// in region-local coordinates; `dark` holds [a0,a1] ranges along the scroll axis.
import { road, spread } from '../ink.mjs';

export const placeholder = {
  paint(api, { w, h }, region, places, orient) {
    const tone = .7 + .6 * region.density;
    if (orient === 'portrait') {
      api.mountain({ x0: 20, x1: w - 20, base: h * .35, amp: 90, seed: region.order + 3, tone });
    } else {
      api.mountain({ x0: 40, x1: w - 40, base: 330, amp: 120, seed: region.order + 3, tone });
    }
    const r = road(w, h, orient, t => Math.sin(t * 6) * 12);
    return { road: r, anchors: spread(r, places.map(p => p.key), orient) };
  },
};

export const painters = { placeholder };
export function registerPainters(mods) { Object.assign(painters, mods); }
export const painterFor = name => painters[name] ?? painters.placeholder;
