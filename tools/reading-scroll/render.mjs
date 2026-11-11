// Paints the whole reading scroll (or one region) from data/reading.json.
import { makeInk } from './ink.mjs';
import { layoutScroll } from '../../js/reading/layout.mjs';
import { painterFor } from './regions/index.mjs';

export const SEED = 20261108;
export const PROP_NAMES = ['compass', 'lamp', 'scale', 'bundle', 'winehouse', 'siheyuan', 'factory', 'cave-dwellings', 'old-ox',
  'snow-house', 'golden-pavilion', 'well', 'petersburg-quay', 'casbah', 'camel-dunes', 'macondo-house', 'butterflies',
  'inn-moon', 'plum-manor', 'pleasure-boat', 'high-window'];
/** Painted on black and laid over the night with `screen`; everything else is ink on kraft. */
export const NIGHT_PROPS = new Set(['inn-moon', 'plum-manor', 'pleasure-boat', 'high-window']);
const KRAFT = [179, 169, 148];

/**
 * A day painting sits on flat kraft. Drawn as it is, its paper would sit on the scroll as a visible
 * block; multiplied, it would darken the paper and could never show a colour lighter than kraft
 * (the ochre butterflies, snow). So each pixel is unmixed from the kraft: it becomes the most saturated
 * colour on the line from kraft through that pixel, with just enough alpha that, laid over kraft, it
 * reproduces the original exactly. Night paintings are light on black and go on with `screen`.
 * Also measures the subject's bounding box, so painters can stand a painting on the ground.
 */
function toLayer(name, bmp) {
  const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height;
  const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(bmp, 0, 0);
  const im = g.getImageData(0, 0, c.width, c.height), d = im.data, night = NIGHT_PROPS.has(name);
  let x0 = c.width, x1 = 0, y0 = c.height, y1 = 0;
  for (let i = 0; i < d.length; i += 4) {
    let mark;
    if (night) mark = Math.max(d[i], d[i + 1], d[i + 2]) > 14;
    else {
      const dv = [d[i] - KRAFT[0], d[i + 1] - KRAFT[1], d[i + 2] - KRAFT[2]];
      let t = Infinity;                                               // how far the ray from kraft can go before leaving the colour cube
      for (let k = 0; k < 3; k++) if (dv[k] > 0) t = Math.min(t, (255 - KRAFT[k]) / dv[k]); else if (dv[k] < 0) t = Math.min(t, -KRAFT[k] / dv[k]);
      if (!isFinite(t) || Math.max(Math.abs(dv[0]), Math.abs(dv[1]), Math.abs(dv[2])) < 3) { d[i + 3] = 0; mark = false; }
      else {
        for (let k = 0; k < 3; k++) d[i + k] = Math.round(KRAFT[k] + dv[k] * t);
        d[i + 3] = Math.round(255 / t); mark = 1 / t > .08;
      }
    }
    if (mark) { const p = i / 4, x = p % c.width, y = (p - x) / c.width; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  if (!night) g.putImageData(im, 0, 0);
  return { img: c, night, box: { x0: x0 / c.width, x1: (x1 + 1) / c.width, y0: y0 / c.height, y1: (y1 + 1) / c.height } };
}

export async function loadProps(base = '../../images/reading/props/') {
  const props = new Map();
  let available = [];
  try { available = await (await fetch(`${base}manifest.json`, { cache: 'no-store' })).json(); } catch { /* none */ }
  await Promise.all(PROP_NAMES.filter(n => available.includes(n)).map(async name => {
    try {
      const res = await fetch(`${base}${name}.webp`, { cache: 'no-store' });
      if (res.ok) props.set(name, toLayer(name, await createImageBitmap(await res.blob())));
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
    // each region is painted on its own sheet, then feathered into the scroll along the road:
    // where two countries meet, the ink of both thins out into bare paper, as it does on a handscroll
    const layer = document.createElement('canvas');
    layer.width = Math.round(rect.w * scale); layer.height = Math.round(rect.h * scale);
    const lc = layer.getContext('2d');
    lc.scale(scale, scale);
    lc.save(); lc.translate(-rect.x, -rect.y); makeInk(lc, seed).paper(rect.x, rect.y, rect.w, rect.h); lc.restore();
    const api = makeInk(lc, seed + region.order * 7919, props);
    const out = painterFor(region.painter).paint(api, { w: rect.w, h: rect.h }, region, places, orient,
      { objects: reading.objects.filter(o => o.region === region.id), links: reading.links });
    const len = orient === 'portrait' ? rect.h : rect.w, F = Math.min(FEATHER, len / 3);
    const first = rect === lay.rects[0], last = rect === lay.rects.at(-1);
    const fade = orient === 'portrait' ? lc.createLinearGradient(0, 0, 0, len) : lc.createLinearGradient(0, 0, len, 0);
    fade.addColorStop(0, `rgba(0,0,0,${first ? 1 : 0})`); fade.addColorStop(F / len, 'rgba(0,0,0,1)');
    fade.addColorStop(1 - F / len, 'rgba(0,0,0,1)'); fade.addColorStop(1, `rgba(0,0,0,${last ? 1 : 0})`);
    lc.setTransform(scale, 0, 0, scale, 0, 0); lc.globalAlpha = 1;
    lc.globalCompositeOperation = 'destination-in'; lc.fillStyle = fade; lc.fillRect(0, 0, rect.w, rect.h);
    ctx.drawImage(layer, rect.x, rect.y, rect.w, rect.h);
    scene.road.push(...out.road.map(([x, y]) => [round(x + rect.x), round(y + rect.y)]));
    for (const [k, [x, y]] of Object.entries(out.anchors ?? {})) scene.places[k] = [round(x + rect.x), round(y + rect.y)];
    for (const [k, [x, y]] of Object.entries(out.objects ?? {})) scene.objects[k] = [round(x + rect.x), round(y + rect.y)];
    for (const [a, b] of out.dark ?? []) scene.dark.push([round(a + rect[axis]), round(b + rect[axis])]);
  }
  return { canvas, scene };
}
const FEATHER = 110;
const round = v => Math.round(v * 10) / 10;
