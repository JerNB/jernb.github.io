// 白夜之城, 深处, 舞台: three short regions on the way west.
import { facade, onionDome, needleSpire, lampPost, embankment, bareTree, thatchHut, palm } from '../buildings.mjs';
import { road, spread, marksAt } from '../ink.mjs';

const anchorAll = (r, places, anchors, orient) => { for (const p of places) if (!anchors[p.key]) Object.assign(anchors, spread(r, [p.key], orient)); };
const keyOf = places => Object.fromEntries(places.map(p => [p.place, p.key]));

/* 白夜之城: Petersburg on a white night — pale, never dark */
export const whitenight = {
  paint(a, { w, h }, region, places, orient) {
    const P = orient === 'portrait', key = keyOf(places), anchors = {};
    const g = a.ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(236,228,208,.35)'); g.addColorStop(.6, 'rgba(236,228,208,0)');
    a.ctx.fillStyle = g; a.ctx.fillRect(0, 0, w, h);
    const cy = P ? h * .5 : 420, cx = w / 2;
    skyline(a, 0, w, cy - 96);
    a.mist(0, cy - 110, w, 44, .5);
    // this bank: a palace front, a church of onion domes, bare lindens, the granite quay
    const qy = cy - 30;
    a.water(0, cy - 16, w, cy + 44, { density: .9 });
    const quay = a.propAt('petersburg-quay', cx, qy + 18, P ? 520 : 600, () => {
      const lw = P ? 150 : 190, lx = P ? 14 : cx - 60 - lw;
      bareTree(a, lx - 16, qy, 60, .55); bareTree(a, lx + lw + 26, qy, 70, .6);
      facade(a, lx, qy, lw, 62, 26, { floors: 3, pediment: true });
      const chx = P ? w - 150 : cx + 90;
      facade(a, chx, qy, 110, 40, 22, { floors: 2, wall: '#c9c0a8' });
      onionDome(a, chx + 56, qy - 42, 15); onionDome(a, chx + 22, qy - 42, 9); onionDome(a, chx + 92, qy - 42, 9);
      bareTree(a, chx + 150, qy, 64, .55);
      embankment(a, 0, w, qy, 14);
      for (let x = 36; x < w; x += P ? 110 : 128) lampPost(a, x, qy, 30);
      a.person(cx - 6, qy, 1.05, 0); a.person(cx + 8, qy, 1, 4);       // the dreamer and Nastenka at the railing
    });
    if (quay.used) { embankment(a, 0, quay.left + 6, qy + 4, 14); embankment(a, quay.right - 6, w, qy + 4, 14); }   // the quay runs on past the painting
    a.boat(P ? 60 : cx + 190, cy + 34, 44);
    if (key['涅瓦河畔']) anchors[key['涅瓦河畔']] = [cx, quay.used ? quay.top - 4 : qy - 44];
    const r = road(w, h, orient, tt => (P ? 30 : 6) * Math.sin(tt * 5));
    anchorAll(r, places, anchors, orient);
    return { road: r, anchors };
  },
};
function skyline(a, x0, x1, y) {
  // the far bank: a pale frieze of palaces, one gold needle, one great dome
  const c = a.ctx; c.save(); c.globalAlpha = .42;
  let x = x0;
  while (x < x1) { const bw = a.rr(46, 84); facade(a, x, y, Math.min(bw, x1 - x), a.rr(16, 24), 0, { floors: 2, tone: .55 }); x += bw + a.rr(0, 3); }
  needleSpire(a, x0 + (x1 - x0) * .5, y - 18, 96, .6);
  c.fillStyle = a.ink(.55); const dx = x0 + (x1 - x0) * .2; c.fillRect(dx - 12, y - 34, 24, 14); c.beginPath(); c.ellipse(dx, y - 34, 14, 18, 0, Math.PI, 0); c.fill(); c.fillRect(dx - .6, y - 60, 1.2, 9);
  c.restore();
}

/* 深处: the prison's high window (dark), then 塔希提 opening beyond it */
export const depths = {
  paint(a, { w, h }, region, places, orient) {
    const P = orient === 'portrait', key = keyOf(places), anchors = {};
    if (!P) {
      a.night(0, 0, w * .62, h, { fadeOut: 160, strength: .9 });
      const wx = w * .26, wy = 150;
      const hw = a.propAt('high-window', wx, 505, 290, () => {
        a.ctx.fillStyle = 'rgba(214,206,186,.9)'; a.ctx.fillRect(wx - 26, wy, 52, 70);
        a.ctx.strokeStyle = 'rgba(8,7,6,.95)'; a.ctx.lineWidth = 3; for (let i = 1; i < 5; i++) { a.ctx.beginPath(); a.ctx.moveTo(wx - 26 + i * 10.4, wy); a.ctx.lineTo(wx - 26 + i * 10.4, wy + 70); a.ctx.stroke(); }
        a.ctx.fillStyle = 'rgba(236,228,208,.08)'; a.ctx.beginPath(); a.ctx.moveTo(wx - 26, wy + 70); a.ctx.lineTo(wx + 26, wy + 70); a.ctx.lineTo(wx + 110, 520); a.ctx.lineTo(wx - 70, 520); a.ctx.fill(); // shaft of light
        a.person(wx + 10, 500, 1.2, 0, true);
      });
      if (key['高窗']) anchors[key['高窗']] = hw.used ? [hw.left - 34, hw.top + 60] : [wx, wy - 20];
      tahiti(a, w * .82, 440, w);
      if (key['塔希提']) anchors[key['塔希提']] = [w * .82, 300];
      const r = road(w, h, orient);
      anchorAll(r, places, anchors, orient);
      return { road: r, anchors, dark: [[0, w * .5]] };
    }
    a.night(0, 0, w, h * .55, { strength: .9 });
    const hw = a.propAt('high-window', w / 2 - 20, h * .5, 220, () => {
      a.ctx.fillStyle = 'rgba(214,206,186,.9)'; a.ctx.fillRect(w / 2 - 24, 120, 48, 64);
      a.ctx.strokeStyle = 'rgba(8,7,6,.95)'; a.ctx.lineWidth = 3; for (let i = 1; i < 5; i++) { a.ctx.beginPath(); a.ctx.moveTo(w / 2 - 24 + i * 9.6, 120); a.ctx.lineTo(w / 2 - 24 + i * 9.6, 184); a.ctx.stroke(); }
    });
    if (key['高窗']) anchors[key['高窗']] = hw.used ? [hw.left - 40, hw.top + 50] : [w / 2, 100];
    tahiti(a, w / 2, h * .85, w, 120);
    if (key['塔希提']) anchors[key['塔希提']] = [w / 2 - 125, h * .85 - 40];
    const r = road(w, h, orient, tt => 30 * Math.sin(tt * 5));
    anchorAll(r, places, anchors, orient);
    return { road: r, anchors, dark: [[0, h * .5]] };
  },
};
function tahiti(a, x, y, w, moonUp = 230) {
  a.moon(x + 110, y - moonUp, 16);
  a.water(x - 160, y + 10, 320, y + 70, { density: .6, fadeIn: 80, fadeOut: 60 });
  for (let i = 0; i < 5; i++) palm(a, x - 110 + i * 50 + a.rr(-8, 8), y + 12, a.rr(70, 110), a.rr(-18, 18));
  thatchHut(a, x - 30, y + 10, 46, 14, 20, { stilts: 9 });
  a.person(x + 44, y + 12, 1, 0); a.boat(x + 70, y + 46, 40);
}
/* 舞台: a stage, curtains, footlights — a quiet nod to Jerry the performer */
export const stage = {
  paint(a, { w, h }, region, places, orient) {
    const P = orient === 'portrait', key = keyOf(places), anchors = {};
    const sx = P ? 20 : w * .12, sw = P ? w - 40 : w * .76, sy = P ? h * .62 : 440, sh = P ? 260 : 300;
    const c = a.ctx;
    c.fillStyle = a.ink(.85); c.fillRect(sx, sy, sw, 12);                                 // stage floor
    c.fillStyle = a.ink(.55); c.fillRect(sx, sy - sh, sw, 14);                            // proscenium
    for (const side of [0, 1]) {
      for (let f = 0; f < 7; f++) {                                                       // curtain folds
        const fx = side ? sx + sw - 10 - f * 9 : sx + 10 + f * 9;
        c.strokeStyle = a.ink(.5 + (f % 2) * .25); c.lineWidth = 6;
        c.beginPath(); c.moveTo(fx, sy - sh + 14); c.quadraticCurveTo(fx + (side ? -1 : 1) * (8 + f * 2), sy - sh * .4, fx + (side ? -1 : 1) * f * 4, sy); c.stroke();
      }
    }
    for (let i = 0; i < 7; i++) a.glow(sx + sw * (i + .5) / 7, sy - 2, 22, .4);              // footlights
    // 南区公寓: a window with the play's struggling plant
    const wx = sx + sw * .32, wy = sy - 120;
    c.fillStyle = '#c3b9a3'; c.fillRect(wx - 30, wy, 60, 50); c.strokeStyle = a.ink(.85); c.lineWidth = 1; c.strokeRect(wx - 30, wy, 60, 50);
    c.beginPath(); c.moveTo(wx, wy); c.lineTo(wx, wy + 50); c.moveTo(wx - 30, wy + 25); c.lineTo(wx + 30, wy + 25); c.stroke();
    c.fillStyle = a.ink(.8); c.fillRect(wx - 8, wy + 50, 16, 8); c.beginPath(); c.ellipse(wx, wy + 44, 10, 6, 0, 0, 7); c.fill();
    if (key['南区公寓']) anchors[key['南区公寓']] = [wx, wy - 30];
    a.person(sx + sw * .62, sy, 1.4, 0); a.person(sx + sw * .7, sy, 1.3, 0);              // two actors
    if (key['幕后']) anchors[key['幕后']] = [sx + sw * .78, sy - sh + 60];
    const r = road(w, h, orient, tt => (P ? 30 : 6) * Math.sin(tt * 5));
    anchorAll(r, places, anchors, orient);
    return { road: r, anchors };
  },
};
