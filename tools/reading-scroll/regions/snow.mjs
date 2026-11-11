// 雪国: 川端's tunnel and mountain road, 三岛's garden and the burning 金阁 (the scroll's one fire).
import { minka, stoneLantern } from '../buildings.mjs';
import { road, spread, marksAt } from '../ink.mjs';

const MARKS = { 隧道: ['tunnel', .14, 430], 天城山道: ['path', .38, 420], 松枝家: ['garden', .6, 430], 金阁: ['pavilion', .84, 440] };

export const snow = {
  paint(a, { w, h }, region, places, orient) {
    const P = orient === 'portrait', t = .7 + .5 * region.density, key = Object.fromEntries(places.map(p => [p.place, p.key])), anchors = {};
    if (!P) {
      snowRange(a, -40, w + 40, 260, 110, t * .5, 91);
      a.mist(0, 230, w, 70, .7);
      snowRange(a, -40, w * .55, 400, 120, t, 93);
    }
    for (const m of marksAt(w, h, orient, MARKS)) {
      if (P && m.i % 2 === 0) { snowRange(a, -30, w + 30, m.y - 30, 80, t * .6, 95 + m.i); a.mist(0, m.y - 60, w, 50, .5); }
      const pt = DRAW[m.kind](a, m.x, m.y, t);
      if (key[m.name]) anchors[key[m.name]] = pt;
    }
    snowfall(a, w, h);
    const r = road(w, h, orient, tt => (P ? 40 : 12) * Math.sin(tt * 7));
    for (const p of places) if (!anchors[p.key]) Object.assign(anchors, spread(r, [p.key], orient));
    return { road: r, anchors };
  },
};

function snowRange(a, x0, x1, base, amp, tone, seed) {
  const top = a.mountain({ x0, x1, base, amp, freq: .007, seed, tone: tone * .7, depth: 110, cun: .5, edge: .8 });
  const c = a.ctx; c.strokeStyle = 'rgba(236,228,208,.7)'; c.lineWidth = 2.2;   // snow caps catch the light
  c.beginPath(); top.forEach(([x, y], i) => (i ? c.lineTo(x, y + 3) : c.moveTo(x, y + 3))); c.stroke();
}
function snowfall(a, w, h) { for (let i = 0; i < w * h / 900; i++) { a.ctx.fillStyle = `rgba(240,234,220,${a.rr(.25, .7)})`; a.ctx.beginPath(); a.ctx.arc(a.rr(0, w), a.rr(0, h), a.rr(.6, 1.6), 0, 7); a.ctx.fill(); } }

const DRAW = {
  tunnel(a, x, y, t) {              // the long tunnel at the border, and the white land beyond
    a.mountain({ x0: x - 140, x1: x + 120, base: y + 20, amp: 110, seed: 97, tone: t * 1.1, depth: 120, cun: 1.2, edge: 1.3 });
    const c = a.ctx; c.fillStyle = 'rgba(8,7,6,.95)'; c.beginPath(); c.moveTo(x - 22, y + 20); c.lineTo(x - 22, y - 8); c.arc(x, y - 8, 22, Math.PI, 0); c.lineTo(x + 22, y + 20); c.fill();
    a.glow(x, y - 4, 18, .6);                                            // the train's lamp
    c.strokeStyle = a.ink(.7); c.lineWidth = .9; c.beginPath(); c.moveTo(x - 14, y + 20); c.lineTo(x - 60, y + 80); c.moveTo(x + 14, y + 20); c.lineTo(x + 40, y + 80); c.stroke();
    return [x, y - 100];
  },
  path(a, x, y) {                   // the Amagi mountain road, the dancer with her drum
    const c = a.ctx; c.strokeStyle = a.ink(.55); c.lineWidth = 1.2; c.beginPath(); c.moveTo(x - 110, y + 30);
    c.bezierCurveTo(x - 40, y - 40, x + 40, y + 40, x + 110, y - 50); c.stroke();
    for (let i = 0; i < 5; i++) a.pine(x + a.rr(-110, 110), y + a.rr(-30, 30), a.rr(30, 48), .75);
    a.person(x - 6, y + 2, 1.1, 1); a.person(x + 14, y - 6, 1, 4);
    return [x, y - 90];
  },
  garden(a, x, y) {                 // 松枝家: a mansion garden under snow
    const r = a.propAt('snow-house', x - 10, y + 12, 170, () => { minka(a, x - 74, y, 96, 22, 30, { snow: true, storeys: 2 }); stoneLantern(a, x + 44, y + 10, 1, true); });
    if (r.used) return [x - 10, r.top - 6];
    const c = a.ctx; c.fillStyle = 'rgba(150,142,125,.3)'; c.beginPath(); c.ellipse(x + 50, y + 18, 50, 9, 0, 0, 7); c.fill();
    a.pine(x + 70, y + 4, 56, .85);
    return [x, y - 100];
  },
  pavilion(a, x, y) {               // 金阁 over its pond, the one fire on the scroll
    const gp = a.propAt('golden-pavilion', x, y + 34, 210, () => {
      const c = a.ctx;
      a.glow(x, y - 60, 130, .55, '214,120,60');
      c.fillStyle = 'rgba(150,142,125,.35)'; c.beginPath(); c.ellipse(x, y + 16, 110, 14, 0, 0, 7); c.fill();
      for (let s = 0; s < 3; s++) {
        const bw = 70 - s * 14, by = y - s * 30;
        c.fillStyle = s === 2 ? '#c9a96a' : '#bba67a'; c.fillRect(x - bw / 2, by - 22, bw, 22);
        c.strokeStyle = a.ink(.9); c.lineWidth = .8; c.strokeRect(x - bw / 2, by - 22, bw, 22);
        c.fillStyle = a.ink(.85); c.beginPath(); c.moveTo(x - bw / 2 - 14, by - 20); c.quadraticCurveTo(x, by - 16, x + bw / 2 + 14, by - 20); c.lineTo(x + bw / 2 - 4, by - 32); c.lineTo(x - bw / 2 + 4, by - 32); c.closePath(); c.fill();
      }
      c.strokeStyle = a.ink(.9); c.lineWidth = 1; c.beginPath(); c.moveTo(x, y - 92); c.lineTo(x, y - 104); c.stroke();
      for (let i = 0; i < 26; i++) { c.fillStyle = `rgba(${a.rr(200, 230)},${a.rr(90, 140)},50,${a.rr(.3, .7)})`; c.beginPath(); c.arc(x + a.rr(-50, 50), y - a.rr(30, 120), a.rr(1, 3), 0, 7); c.fill(); } // embers
      c.globalAlpha = .3; c.fillStyle = '#c9a96a'; c.beginPath(); c.ellipse(x, y + 16, 32, 7, 0, 0, 7); c.fill(); c.globalAlpha = 1;   // reflection
    });
    if (gp.used) a.glow(x, y - 70, 120, .22, '214,120,60');
    return [x, gp.used ? gp.top - 8 : y - 140];
  },
};
