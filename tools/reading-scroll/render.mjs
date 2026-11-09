// Paints the whole reading scroll (or one region) from data/reading.json.
import { makeInk } from './ink.mjs';
import { layoutScroll } from '../../js/reading/layout.mjs';
import { painterFor } from './regions/index.mjs';

export const SEED = 20261108;
export const PROP_NAMES = ['inn-moon', 'golden-pavilion', 'cave-dwellings', 'old-ox', 'well', 'petersburg-bridge',
  'high-window', 'camel-dunes', 'butterflies', 'compass', 'lamp', 'scale'];

export async function loadProps(base = '../../images/reading/props/') {
  const props = new Map();
  let available = [];
  try { available = await (await fetch(`${base}manifest.json`, { cache: 'no-store' })).json(); } catch { /* none */ }
  await Promise.all(PROP_NAMES.filter(n => available.includes(n)).map(async name => {
    try {
      const res = await fetch(`${base}${name}.webp`, { cache: 'no-store' });
      if (res.ok) props.set(name, await createImageBitmap(await res.blob()));
    } catch { /* stand-in will be drawn */ }
  }));
  return props;
}

export function regionCounts(reading) {
  const counts = {};
  for (const p of reading.places) counts[p.region] = (counts[p.region] ?? 0) + 1;
  return counts;
}

/**
 * @returns {{canvas: HTMLCanvasElement, scene: {width,height,rects,road,dark,places,objects}}}
 * `only` paints one region into a canvas of that region's size (preview).
 */
export async function paintScene(reading, orient, { seed = SEED, scale = 1, only = null, props = new Map() } = {}) {
  await Promise.all(["16px 'Noto Serif SC'", "13px 'Ma Shan Zheng'"].map(f => document.fonts.load(f, '书卷酒')));
  const lay = layoutScroll(reading.regions, regionCounts(reading), orient);
  const rects = only ? lay.rects.filter(r => r.regionId === only) : lay.rects;
  if (!rects.length) throw new Error(`unknown region ${only}`);
  const origin = only ? { x: rects[0].x, y: rects[0].y } : { x: 0, y: 0 };
  const W = only ? rects[0].w : lay.width, H = only ? rects[0].h : lay.height;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(W * scale); canvas.height = Math.round(H * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.translate(-origin.x, -origin.y);
  makeInk(ctx, seed).paper(origin.x, origin.y, W, H);

  const scene = { width: lay.width, height: lay.height, rects: lay.rects, road: [], dark: [], places: {}, objects: {} };
  const axis = orient === 'portrait' ? 'y' : 'x';
  for (const rect of rects) {
    const region = reading.regions.find(r => r.id === rect.regionId);
    const places = reading.places.filter(p => p.region === region.id);
    const api = makeInk(ctx, seed + region.order * 7919, props);
    ctx.save(); ctx.translate(rect.x, rect.y);
    const out = painterFor(region.painter).paint(api, { w: rect.w, h: rect.h }, region, places, orient,
      { objects: reading.objects.filter(o => o.region === region.id), links: reading.links });
    ctx.restore();
    scene.road.push(...out.road.map(([x, y]) => [round(x + rect.x), round(y + rect.y)]));
    for (const [k, [x, y]] of Object.entries(out.anchors ?? {})) scene.places[k] = [round(x + rect.x), round(y + rect.y)];
    for (const [k, [x, y]] of Object.entries(out.objects ?? {})) scene.objects[k] = [round(x + rect.x), round(y + rect.y)];
    for (const [a, b] of out.dark ?? []) scene.dark.push([round(a + rect[axis]), round(b + rect[axis])]);
  }
  // soften seams between neighbouring regions
  const seam = makeInk(ctx, seed);
  for (const rect of rects.slice(1)) {
    if (orient === 'portrait') seam.mist(0, rect.y - 50, rect.w, 100, .35);
    else seam.hmist(rect.x - 60, 0, 120, rect.h, .3);
  }
  return { canvas, scene };
}
const round = v => Math.round(v * 10) / 10;
