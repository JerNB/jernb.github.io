// Paints the whole reading scroll (or one region) from data/reading.json.
import { makeInk } from './ink.mjs';
import { layoutScroll } from '../../js/reading/layout.mjs';
import { painterFor } from './regions/index.mjs';
import { seatLabel } from './seat.mjs';

export const SEED = 20261108;
export const PROP_NAMES = ['compass', 'lamp', 'scale', 'bundle', 'winehouse', 'siheyuan', 'factory', 'cave-dwellings', 'old-ox',
  'snow-house', 'golden-pavilion', 'well', 'petersburg-quay', 'casbah', 'camel-dunes', 'macondo-house', 'butterflies',
  'inn-moon', 'plum-manor', 'pleasure-boat', 'high-window',
  // third batch: the missing landmarks, the sky and the ground, the joins, sun and moons, people on the road
  'pig-pen', 'village-shrine', 'shuangshui-village', 'sea-sun', 'kafka-library', 'tahiti-hut', 'algiers-beach', 'sahara-camp',
  'far-ridge-soft', 'far-ridge-steep', 'far-ridge-loess', 'cloud-sea', 'mist-band', 'geese-flock',
  'foreground-rocks', 'foreground-reeds', 'foreground-branch', 'dusk-mountain', 'dawn-mountain', 'night-clouds', 'snow-veil',
  'moon-night', 'sun-desert', 'moon-pale', 'river-boats', 'road-travellers', 'ox-cart'];
/** Painted on black and laid over the night with `screen`; everything else is ink on kraft. */
export const NIGHT_PROPS = new Set(['inn-moon', 'plum-manor', 'pleasure-boat', 'high-window', 'moon-night', 'night-clouds']);
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

  const scene = { width: lay.width, height: lay.height, rects: lay.rects, road: [], dark: [], water: [], places: {}, objects: {} };
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
    const fore = document.createElement('canvas'); fore.width = layer.width; fore.height = layer.height;
    const api = makeInk(lc, seed + region.order * 7919, props, fore.getContext('2d'));
    if (orient === 'landscape') backdrop(api, region.id, rect.w, rect.h);
    const out = painterFor(region.painter).paint(api, { w: rect.w, h: rect.h }, region, places, orient,
      { objects: reading.objects.filter(o => o.region === region.id), links: reading.links });
    if (orient === 'landscape') nearground(api, region.id, rect.w, rect.h);
    recede(lc, layer, scale, out.dark?.length ? HAZE_DARK : HAZE);
    lc.setTransform(1, 0, 0, 1, 0, 0); lc.globalCompositeOperation = 'source-over'; lc.drawImage(fore, 0, 0);
    seatAll(lc, layer, scale, out, orient === 'portrait' ? 1 : 0);
    feather(lc, rect, orient, scale, makeInk(lc, seed + region.order * 31).fbm, rect === lay.rects[0] || !!only, rect === lay.rects.at(-1) || !!only);
    ctx.drawImage(layer, rect.x, rect.y, rect.w, rect.h);
    scene.road.push(...out.road.map(([x, y]) => [round(x + rect.x), round(y + rect.y)]));
    for (const [k, [x, y]] of Object.entries(out.anchors ?? {})) scene.places[k] = [round(x + rect.x), round(y + rect.y)];
    for (const [k, [x, y]] of Object.entries(out.objects ?? {})) scene.objects[k] = [round(x + rect.x), round(y + rect.y)];
    for (const [a, b] of out.dark ?? []) scene.dark.push([round(a + rect[axis]), round(b + rect[axis])]);
    for (const [a, b] of out.water ?? []) scene.water.push([round(a + rect[axis]), round(b + rect[axis])]);
  }
  if (!only) dusk(makeInk(ctx, seed + 77, props), scene, orient, props);
  // underneath everything: the land that runs on between the countries, then the paper
  ctx.save(); ctx.globalCompositeOperation = 'destination-over';
  const under = document.createElement('canvas'); under.width = canvas.width; under.height = canvas.height;
  const uc = under.getContext('2d'); uc.scale(scale, scale); uc.translate(-origin.x, -origin.y);
  makeInk(uc, seed).paper(origin.x, origin.y, W, H);
  joinery(makeInk(uc, seed + 4242), scene, orient, rects);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(under, 0, 0);
  ctx.restore();
  return { canvas, scene };
}

/**
 * The painted sky and distance behind each landscape region, laid before its painter draws: a far
 * range on the horizon, a cloud sea in the mountains, geese, the clouds of the night. This is what
 * fills the upper half of the paper, which used to be bare.
 */
// [name, from, to (fractions of the region's width), foot y, band height]; from === to: one painting that wide
const BACKDROP = {
  'xingnang': [['far-ridge-soft', 0, 1, 205, 280]],
  'jianghu-shanhe': [['far-ridge-steep', 0, 1, 225, 320], ['cloud-sea', .1, .9, 312, 110], ['geese-flock', .58, .58, 120, 130]],
  'jianghu-shijing': [['far-ridge-soft', 0, 1, 250, 260], ['geese-flock', .3, .3, 140, 112]],
  'loess': [['far-ridge-loess', .35, 1, 292, 230], ['geese-flock', .22, .22, 150, 124]],
  'snow': [['far-ridge-steep', 0, 1, 240, 300], ['snow-veil', .05, .05, 560, 400]],   // snow begins to fall at the edge of the loess
  'sea': [['far-ridge-soft', .05, .45, 332, 170], ['geese-flock', .78, .78, 170, 112]],
  'jianghu-night': [['night-clouds', .1, .9, 200, 120]],
};
function backdrop(a, id, w, h) {
  for (const [name, f0, f1, gy, bh] of BACKDROP[id] ?? []) {
    if (f0 === f1) { a.propAt(name, w * f0, gy, bh, () => {}); continue; }       // a single painting, `bh` wide
    a.band(name, w * f0, w * f1, gy, bh);
  }
}
/** Rocks, reeds or an old pine standing on the scroll's lower edge, nearer than anything else. */
const NEAR = {
  'jianghu-shanhe': [['foreground-rocks', .3, 96], ['foreground-rocks', .86, 80]],
  'jianghu-shijing': [['foreground-reeds', .62, 100]],
  'loess': [['foreground-rocks', .55, 90]],
  'snow': [['foreground-branch', .08, 210]],
  'sea': [['foreground-reeds', .2, 104]],
};
/** People and boats about their business: on the road (y ≈ 470) and on the water. [name, x fraction, foot y, width] */
const STAFFAGE = {
  'jianghu-shanhe': [['road-travellers', .72, 482, 270]],
  'jianghu-shijing': [['river-boats', .3, 548, 280]],
  'loess': [['ox-cart', .145, 488, 120]],
  'sea': [['river-boats', .3, 404, 230]],
};
function nearground(a, id, w, h) {
  for (const [name, f, gy, pw] of STAFFAGE[id] ?? []) a.propAt(name, w * f, gy, pw, () => {});
  for (const [name, f, fh] of NEAR[id] ?? []) a.foreground(name, w * f, h, fh);
}

/** Inked enough to hold up a label: clearly darker than the paper (pale far hills do not count). */
const INK_LUM = 105;
/** Seat every label of a region on what it names (see seat.mjs); night labels keep their place. */
function seatAll(lc, layer, scale, out, ax) {
  const { data } = lc.getImageData(0, 0, layer.width, layer.height);
  const isInk = (x, y) => {
    const px = Math.round(x * scale), py = Math.round(y * scale);
    if (px < 0 || py < 0 || px >= layer.width || py >= layer.height) return false;
    const i = (py * layer.width + px) * 4;
    return data[i + 3] > 200 && .3 * data[i] + .59 * data[i + 1] + .11 * data[i + 2] < INK_LUM;
  };
  const night = pt => (out.dark ?? []).some(([a, b]) => pt[ax] >= a && pt[ax] <= b);
  for (const map of [out.anchors, out.objects]) for (const [k, pt] of Object.entries(map ?? {})) if (!night(pt)) map[k] = seatLabel(pt, isInk);
}

/**
 * Fade a region's sheet into nothing along both ends of the road. The fade starts at a ragged,
 * noise-driven line (never a straight vertical edge) and runs FEATHER px, so neighbouring
 * countries dissolve into the mist and land of `joinery` instead of meeting as panels.
 */
function feather(lc, rect, orient, scale, fbm, keepStart, keepEnd) {
  const P = orient === 'portrait', len = P ? rect.h : rect.w, across = P ? rect.w : rect.h;
  const F = Math.min(FEATHER, len / 5), J = F * .55;
  // the mask is drawn strip by strip on its own sheet (destination-in would clear everything
  // outside each strip), then applied to the region in one pass
  const m = document.createElement('canvas'); m.width = Math.round(rect.w * scale); m.height = Math.round(rect.h * scale);
  const mc = m.getContext('2d'); mc.scale(scale, scale);
  for (let v = 0; v < across; v += 3) {
    const a = keepStart ? 0 : J * fbm(v * .011 + 3.1), b = keepEnd ? 0 : J * fbm(v * .011 + 57.7);
    const g = P ? mc.createLinearGradient(0, 0, 0, len) : mc.createLinearGradient(0, 0, len, 0);
    const s0 = keepStart ? 1 : 0, s1 = keepEnd ? 1 : 0;
    g.addColorStop(0, `rgba(0,0,0,${s0})`); g.addColorStop(a / len, `rgba(0,0,0,${s0})`);
    g.addColorStop(Math.min(.5, (a + F) / len), 'rgba(0,0,0,1)'); g.addColorStop(Math.max(.5, 1 - (b + F) / len), 'rgba(0,0,0,1)');
    g.addColorStop(1 - b / len, `rgba(0,0,0,${s1})`); g.addColorStop(1, `rgba(0,0,0,${s1})`);
    mc.fillStyle = g;
    if (P) mc.fillRect(v, 0, 3, len); else mc.fillRect(0, v, len, 3);              // exact strips: overlaps would draw lines
  }
  lc.setTransform(1, 0, 0, 1, 0, 0); lc.globalAlpha = 1; lc.globalCompositeOperation = 'destination-in';
  lc.drawImage(m, 0, 0);
  lc.globalCompositeOperation = 'source-over';
}

/**
 * Night never starts at a wall: ink gathers over DUSK px before each dark stretch and thins out
 * over the same distance after it, laid over whatever is painted there (evening over the town,
 * dawn over the loess). Columns carry a little noise so the dusk is a wash, not a gradient.
 */
const DUSK = 520, INTO = 380;
/**
 * Draw a painted mountain whose one side is near-black ink, fading that side out over its last
 * `fade` of the width, so the mountain's dark melts into the night rather than ending on a line.
 */
function hillInto(c, p, x, y, w, h, darkSide, fade = .4) {
  const k = c.getTransform().a, off = document.createElement('canvas');
  off.width = Math.ceil(w * k); off.height = Math.ceil(h * k);
  const o = off.getContext('2d'); o.drawImage(p.img, 0, 0, off.width, off.height);
  const g = o.createLinearGradient(0, 0, off.width, 0);
  if (darkSide === 'right') { g.addColorStop(0, '#000'); g.addColorStop(1 - fade, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)'); }
  else { g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(fade, '#000'); g.addColorStop(1, '#000'); }
  o.globalCompositeOperation = 'destination-in'; o.fillStyle = g; o.fillRect(0, 0, off.width, off.height);
  c.drawImage(off, x, y, w, h);
}
function dusk(a, scene, orient, props = new Map()) {
  const c = a.ctx, P = orient === 'portrait', len = P ? scene.height : scene.width, across = P ? scene.width : scene.height;
  const ramp = (from, to, dir) => {                                   // dir +1: darkening toward `to`; -1: lightening
    const g = P ? c.createLinearGradient(0, from, 0, to) : c.createLinearGradient(from, 0, to, 0);
    for (let i = 0; i <= 24; i++) {
      const u = i / 24, t = dir > 0 ? u : 1 - u;
      const peak = Math.min(1, (dir > 0 ? u * (DUSK + INTO) / DUSK : (1 - u) * (DUSK + INTO) / DUSK));   // full strength at the dark edge
      const fade = dir > 0 ? (u > DUSK / (DUSK + INTO) ? 1 - (u - DUSK / (DUSK + INTO)) / (INTO / (DUSK + INTO)) : peak) : (u < INTO / (DUSK + INTO) ? 1 - (INTO / (DUSK + INTO) - u) / (INTO / (DUSK + INTO)) : peak);
      const k = Math.max(0, Math.min(1, dir > 0 ? Math.min(peak, fade) : Math.min(peak, fade)));
      g.addColorStop(u, a.ink(.42 * k * k * (3 - 2 * k) * (.85 + .3 * a.fbm(t * 4 + from * .01))));
    }
    c.fillStyle = g;
    if (P) c.fillRect(0, from, across, to - from); else c.fillRect(from, 0, to - from, across);
  };
  // in landscape the day walks into a mountain whose far side is the night, and out of another;
  // the gradient stays only where there is no painting (portrait, or the paintings missing)
  const MH = across + 40, mw = name => a.has(name) ? MH * 1800 / 2100 : 0;
  scene.dark.forEach(([s, e], i) => {
    const hill = !P && i === 0;                                        // the 古龙 night; the prison in 深处 keeps its own dark
    // the dark side reaches well into the night (where the night is already full) and fades there
    if (s > 0) { if (hill && a.has('dusk-mountain')) hillInto(c, props.get('dusk-mountain'), s - mw('dusk-mountain') * .62, -20, mw('dusk-mountain'), MH, 'right'); else ramp(Math.max(0, s - DUSK), s + INTO, 1); }
    if (e < len) { if (hill && a.has('dawn-mountain')) hillInto(c, props.get('dawn-mountain'), e - mw('dawn-mountain') * .38, -20, mw('dawn-mountain'), MH, 'left'); else ramp(e - INTO, Math.min(len, e + DUSK), -1); }
  });
}

/**
 * What shows through where two regions fade out: one far ridge and one strip of ground running the
 * whole length of the scroll, the road as a worn path, and open water wherever the road is afloat
 * on both sides of a seam. Inside each region its own painting covers all of this.
 */
function joinery(a, scene, orient, rects) {
  const c = a.ctx, P = orient === 'portrait', W = scene.width, H = scene.height;
  const afloat = v => scene.water.some(([s, e]) => v >= s - 2 && v <= e + 2);
  if (!P) {
    a.mountain({ x0: -200, x1: W + 200, base: 300, amp: 46, freq: .0035, seed: 7, tone: .26, depth: 80, cun: .2, edge: .4 });
    a.mist(0, 250, W, 90, .55);
    const g = c.createLinearGradient(0, 470, 0, H); g.addColorStop(0, 'rgba(150,140,118,0)'); g.addColorStop(.35, 'rgba(150,140,118,.22)'); g.addColorStop(1, 'rgba(120,110,92,.32)');
    c.fillStyle = g; c.fillRect(0, 470, W, H - 470);
    for (let i = 0; i < W / 9; i++) {                                   // dry grass along the verge
      const x = a.rr(0, W), y = a.rr(482, 540), l = a.rr(4, 11);
      c.strokeStyle = a.ink(a.rr(.12, .3)); c.lineWidth = a.rr(.4, .9); c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + a.rr(-2, 2), y - l * .6, x + a.rr(-4, 4), y - l); c.stroke();
    }
  }
  for (const r of rects.slice(1)) {                                      // water across a seam the road sails over
    const v = P ? r.y : r.x;
    if (!afloat(v - 4) || !afloat(v + 4)) continue;
    if (P) a.water(0, v - 260, W, v + 260, { density: 1 });
    else a.water(v - 280, 430, 560, 510, { density: 1.1, fadeIn: 120, fadeOut: 120 });
  }
  c.lineCap = 'round';                                                   // the road itself, worn into the ground
  for (let i = 1; i < scene.road.length; i++) {
    const [x0, y0] = scene.road[i - 1], [x1, y1] = scene.road[i];
    if (afloat(P ? y0 : x0)) continue;
    for (let k = 0; k < 3; k++) {
      c.strokeStyle = a.ink(P ? a.rr(.04, .1) : a.rr(.08, .2)); c.lineWidth = a.rr(.8, P ? 1.6 : 2.2);
      const o = (k - 1) * 2.4;
      c.beginPath(); c.moveTo(x0 + (P ? o : 0), y0 + (P ? 0 : o) + 4); c.lineTo(x1 + (P ? o : 0), y1 + (P ? 0 : o) + 4); c.stroke();
    }
  }
  c.lineCap = 'butt';
}
const FEATHER = 150, HAZE = .2, HAZE_DARK = .06;
/**
 * 远淡近浓: the code-drawn scene is softened a touch and veiled toward the paper, so it sits
 * behind the ink paintings (drawn on their own sheet afterwards) instead of competing with them.
 */
function recede(lc, layer, scale, haze) {
  const tmp = document.createElement('canvas'); tmp.width = layer.width; tmp.height = layer.height;
  const tc = tmp.getContext('2d'); tc.filter = `blur(${(.55 * scale).toFixed(2)}px)`; tc.drawImage(layer, 0, 0);
  lc.save(); lc.setTransform(1, 0, 0, 1, 0, 0);
  lc.globalCompositeOperation = 'copy'; lc.drawImage(tmp, 0, 0);
  lc.globalCompositeOperation = 'source-atop'; lc.fillStyle = `rgba(179,169,148,${haze})`; lc.fillRect(0, 0, layer.width, layer.height);
  lc.restore();
}
const round = v => Math.round(v * 10) / 10;
