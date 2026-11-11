// 海边与深井: 村上's forest, the shore, the sun going down in the west, the library and its well.
import { minka, stoneLantern } from '../buildings.mjs';
import { road, spread, marksAt } from '../ink.mjs';

const MARKS = { 森林: ['forest', .14, 430], 海边: ['shore', .38, 450], 太阳以西: ['sunset', .6, 300], 甲村图书馆: ['library', .84, 430] };

export const sea = {
  paint(a, { w, h }, region, places, orient) {
    const P = orient === 'portrait', t = .7 + .5 * region.density, key = Object.fromEntries(places.map(p => [p.place, p.key])), anchors = {};
    if (!P) {
      const c = a.ctx; c.strokeStyle = a.ink(.45); c.lineWidth = 1; c.beginPath(); c.moveTo(0, 330); c.lineTo(w, 330); c.stroke(); // horizon
      a.water(0, 332, w, 412, { density: .7, fadeIn: 120 });
      a.mountain({ x0: -60, x1: w * .32, base: 470, amp: 80, freq: .01, seed: 103, tone: t * .8, depth: 100, cun: .8, edge: 1 });
    }
    for (const m of marksAt(w, h, orient, MARKS)) {
      if (P && (m.kind === 'shore' || m.kind === 'sunset')) { a.water(0, m.y - 40, w, m.y + 40, { density: .7 }); }
      const pt = DRAW[m.kind](a, m.x, m.y, t);
      if (key[m.name]) anchors[key[m.name]] = pt;
    }
    if (!P) a.mountain({ x0: -40, x1: w * .45, base: 620, amp: 110, freq: .01, seed: 101, tone: t, depth: 110, cun: 1.2, edge: 1.3 });
    const r = road(w, h, orient, tt => (P ? 40 : 8) * Math.sin(tt * 6));
    for (const p of places) if (!anchors[p.key]) Object.assign(anchors, spread(r, [p.key], orient));
    return { road: r, anchors };
  },
};

const DRAW = {
  forest(a, x, y) { for (let i = 0; i < 16; i++) a.pine(x + a.rr(-120, 120), y + a.rr(-20, 30), a.rr(50, 90), a.rr(.6, .95)); a.mist(x - 140, y - 40, 280, 40, .35); return [x, y - 120]; },
  shore(a, x, y) {
    const c = a.ctx; c.strokeStyle = a.ink(.6); c.lineWidth = 1.4; c.beginPath(); c.moveTo(x - 140, y - 20); c.quadraticCurveTo(x, y + 10, x + 140, y - 30); c.stroke();
    c.lineWidth = 2; c.beginPath(); c.moveTo(x + 30, y - 12); c.lineTo(x + 100, y - 70); c.stroke();      // a jetty
    a.person(x - 30, y - 6, 1.1, 0); a.person(x - 16, y - 4, 1, 0);
    return [x - 20, y - 70];
  },
  sunset(a, x, y) { a.glow(x, y, 60, .35, '236,214,170'); a.ctx.fillStyle = 'rgba(232,220,196,.95)'; a.ctx.beginPath(); a.ctx.arc(x, y + 20, 26, Math.PI, 0); a.ctx.fill(); return [x, y - 30]; },
  library(a, x, y) {
    minka(a, x - 66, y, 86, 22, 28);                       // 甲村图书馆: an old house turned library
    stoneLantern(a, x - 82, y + 8, .9);
    a.propAt('well', x + 60, y + 6, 72, () => {
      const c = a.ctx; c.fillStyle = a.ink(.8); c.beginPath(); c.ellipse(x + 60, y, 18, 6, 0, 0, 7); c.fill();
      c.fillStyle = '#b3a994'; c.fillRect(x + 42, y - 14, 36, 14); c.strokeStyle = a.ink(.85); c.lineWidth = .9; c.strokeRect(x + 42, y - 14, 36, 14);
      c.fillStyle = 'rgba(5,4,4,.95)'; c.beginPath(); c.ellipse(x + 60, y - 14, 18, 5, 0, 0, 7); c.fill();
    });
    return [x, y - 80];
  },
};
