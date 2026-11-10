// 黄土与田野: 王小波's Yunnan fields and Beijing, 史铁生 / 路遥's loess plateau, 余华's paddy.
// 乡土中国 is written into the slope as a faint inscription rather than drawn as a place.
import { thatchHut, siheyuan, factory, pigsty } from '../buildings.mjs';
import { road, spread } from '../ink.mjs';

const MARKS = { // place → [drawer, landscape x fraction, ground y]
  黄金时代: ['fields', .09, 430], 胡同: ['hutong', .21, 420], 广场: ['crowd', .31, 440], 猪栏: ['pigpen', .4, 430],
  豆腐厂: ['factory', .5, 420], 清平湾: ['caves', .62, 400], 双水村: ['village', .74, 410], 福贵的田: ['paddy', .87, 440], 乡土: ['inscription', .965, 120],
};

export const loess = {
  paint(a, { w, h }, region, places, orient) {
    const P = orient === 'portrait', t = .75 + .5 * region.density;
    const key = Object.fromEntries(places.map(p => [p.place, p.key])), anchors = {};
    if (!P) {
      a.mountain({ x0: -40, x1: w * .45, base: 290, amp: 80, freq: .006, seed: 71, tone: t * .45, depth: 100, cun: .5, edge: .6 }); // Yunnan hills
      a.mist(0, 250, w * .5, 60, .6);
      terraces(a, w * .52, w * 1.02, 380, t);                                             // loess plateau
      a.mist(w * .5, 330, w * .5, 40, .4);
    }
    const names = Object.keys(MARKS);
    names.forEach((name, i) => {
      const [kind, fx, gy] = MARKS[name];
      let x = fx * w, y = gy;
      if (P) { y = h / (names.length + 1) * (i + 1) + 60; x = i % 2 ? 280 : 120;
        if (i % 3 === 0 && kind !== 'caves') { a.mountain({ x0: -30, x1: w + 30, base: y - 40, amp: 70, freq: .012, seed: 80 + i, tone: t * .45, depth: 90, cun: .4, edge: .5 }); a.mist(0, y - 70, w, 50, .6); }
        if (kind === 'caves' || kind === 'village') terraces(a, -20, w + 20, y - 10, t * .8, 3); }
      const pt = DRAW[kind](a, x, y, t, name);
      if (key[name]) anchors[key[name]] = pt;
    });
    if (!P) a.mountain({ x0: -40, x1: w + 40, base: 615, amp: 110, freq: .006, seed: 77, tone: t * .8, depth: 110, cun: .9, edge: 1.1 });
    const r = road(w, h, orient, tt => (P ? 50 : 10) * Math.sin(tt * 8));
    for (const p of places) if (!anchors[p.key]) Object.assign(anchors, spread(r, [p.key], orient));
    return { road: r, anchors };
  },
};

function terraces(a, x0, x1, base, t, steps = 5) {
  // flat-topped loess tableland: stacked bands, each a long straight top with eroded gullies
  for (let k = steps - 1; k >= 0; k--) {
    const y = base - k * 26, inset = k * 40 + a.rr(-15, 25);
    const xa = x0 + inset + a.rr(0, 30), xb = x1 - inset * .6;
    const c = a.ctx;
    const topY = x => y - 10 * a.fbm(x * .012 + k, 3) + 18 * Math.pow(1 - Math.min(1, (x - xa) / 50, (xb - x) / 70), 2);
    c.fillStyle = 'rgba(182,173,153,1)'; c.beginPath(); c.moveTo(xa, y + 30);
    for (let x = xa; x <= xb; x += 6) c.lineTo(x, topY(x));
    c.lineTo(xb, y + 30); c.closePath(); c.fill();
    c.globalAlpha = .55 * t;
    for (let x = xa; x <= xb; x += 2) c.drawImage(stripFor(a), x, topY(x) - 1, 2.2, 34 * (.6 + .6 * a.fbm(x * .01 + k, 2)));
    c.globalAlpha = 1;
    c.strokeStyle = a.ink(.8 * t); c.lineWidth = 1.2; c.beginPath();
    for (let x = xa; x <= xb; x += 6) { const yy = topY(x); x === xa ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke();
    for (let i = 0; i < (xb - xa) / 14; i++) { const gx = a.rr(xa, xb); c.strokeStyle = a.ink(a.rr(.15, .35)); c.lineWidth = a.rr(.4, 1);
      c.beginPath(); c.moveTo(gx, topY(gx)); c.lineTo(gx + a.rr(-3, 3), topY(gx) + a.rr(8, 24)); c.stroke(); }  // gullies
  }
}
let _strip;
function stripFor(a) {
  if (_strip) return _strip;
  const s = document.createElement('canvas'); s.width = 1; s.height = 64; const g = s.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 64);
  gr.addColorStop(0, 'rgba(90,72,48,.9)'); gr.addColorStop(.4, 'rgba(90,72,48,.3)'); gr.addColorStop(1, 'rgba(90,72,48,0)'); g.fillStyle = gr; g.fillRect(0, 0, 1, 64);
  return (_strip = s);
}

const DRAW = {
  fields(a, x, y) {               // 黄金时代: Yunnan paddies on a slope, banana leaves, a hut
    const c = a.ctx;
    for (let k = 0; k < 6; k++) { c.strokeStyle = a.ink(.5 - k * .05); c.lineWidth = .9; c.beginPath();
      for (let px = x - 110; px < x + 110; px += 4) { const py = y - k * 14 + Math.sin(px * .03 + k) * 4; px === x - 110 ? c.moveTo(px, py) : c.lineTo(px, py); } c.stroke(); }
    for (let i = 0; i < 3; i++) banana(a, x - 90 + i * 26, y - 70);
    thatchHut(a, x + 36, y - 74, 34, 13, 16, { stilts: 7 });
    return [x, y - 110];
  },
  hutong(a, x, y) {               // 胡同: grey courtyard walls and a gate
    const pt = siheyuan(a, x - 96, y, 190);
    a.person(x + 70, y + 10, .9, 0); a.person(x - 70, y + 8, .9, 4);
    return pt;
  },
  crowd(a, x, y) {                // 广场 · 沉默的大多数: a silent crowd, all facing one way
    for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) a.person(x - 70 + i * 16 + r * 5, y - r * 9, .75 - r * .06, 0);
    return [x, y - 70];
  },
  pigpen(a, x, y) {               // 一只特立独行的猪: a pen, and one pig standing on the roof
    pigsty(a, x - 40, y, 130);
    pig(a, x - 24, y - 27);
    return [x + 30, y - 60];
  },
  factory(a, x, y) {              // 豆腐厂: a brick workshop under its stack
    return factory(a, x - 66, y, 120, 28);
  },
  caves(a, x, y) {                // 清平湾: cave dwellings cut into the loess, an ox
    a.prop('cave-dwellings', x - 90, y - 90, 180, 100, () => {
      const c = a.ctx;
      for (let i = 0; i < 4; i++) { const cx = x - 70 + i * 44; c.fillStyle = a.ink(.85); c.beginPath(); c.moveTo(cx - 12, y); c.lineTo(cx - 12, y - 16); c.arc(cx, y - 16, 12, Math.PI, 0); c.lineTo(cx + 12, y); c.fill();
        c.strokeStyle = 'rgba(230,222,204,.6)'; c.lineWidth = .6; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(cx - 8 + k * 8, y - 2); c.lineTo(cx - 8 + k * 8, y - 18); c.stroke(); } }
    });
    a.ox(x + 110, y + 20, 1.3);
    return [x, y - 70];
  },
  village(a, x, y) {              // 双水村: a village of caves and courtyards along a gully
    const c = a.ctx;
    for (let r = 0; r < 2; r++) for (let i = 0; i < 3; i++) { const cx = x - 60 + i * 50 + r * 20, cy = y - r * 34; c.fillStyle = a.ink(.8); c.beginPath(); c.moveTo(cx - 9, cy); c.lineTo(cx - 9, cy - 12); c.arc(cx, cy - 12, 9, Math.PI, 0); c.lineTo(cx + 9, cy); c.fill(); }
    for (let i = 0; i < 5; i++) a.person(x + a.rr(-80, 80), y + a.rr(6, 14), .85, a.rng() < .5 ? 2 : 0);
    return [x, y - 80];
  },
  paddy(a, x, y) {                // 福贵的田: flooded paddy, an old ox, an old man
    a.water(x - 130, y - 20, 260, y + 30, { density: .6 });
    const c = a.ctx; c.strokeStyle = a.ink(.6); c.lineWidth = 1.2; for (const yy of [y - 20, y + 4, y + 30]) { c.beginPath(); c.moveTo(x - 130, yy); c.lineTo(x + 130, yy); c.stroke(); }
    a.prop('old-ox', x - 40, y - 60, 120, 70, () => a.ox(x, y, 1.6));
    a.person(x + 40, y, 1.1, 1);
    return [x, y - 70];
  },
  inscription(a, x, y) { a.inscription('乡土中国', x, y, 18, .42); return [x - 40, y + 76]; },
};
function banana(a, x, y) { const c = a.ctx; c.strokeStyle = a.ink(.7); c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, y + 60); c.lineTo(x + 2, y); c.stroke();
  for (let i = 0; i < 5; i++) { const an = -Math.PI / 2 + (i - 2) * .55; c.fillStyle = a.ink(.45); c.beginPath(); c.ellipse(x + Math.cos(an) * 18, y + Math.sin(an) * 12, 20, 5, an, 0, 7); c.fill(); } }
function pig(a, x, y) { const c = a.ctx; c.fillStyle = a.ink(.9); c.beginPath(); c.ellipse(x, y, 11, 6.5, 0, 0, 7); c.fill();
  c.beginPath(); c.ellipse(x + 11, y - 2, 4.5, 4, 0, 0, 7); c.fill(); for (const lx of [-6, -1, 4, 8]) c.fillRect(x + lx, y + 4, 1.6, 5);
  c.strokeStyle = a.ink(.9); c.lineWidth = .8; c.beginPath(); c.arc(x - 12, y - 2, 2.5, 0, 5); c.stroke(); }
