// 白夜之城, 深处, 舞台: three short regions on the way west.
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
    skyline(a, P ? 0 : 40, P ? w : w - 40, cy - 40);
    a.water(0, cy - 30, w, cy + 30, { density: .8 });
    a.prop('petersburg-bridge', cx - 140, cy - 80, 280, 110, () => {
      a.bridge(cx - 130, cy - 26, cx + 130, cy - 26, 18);
      for (const lx of [cx - 100, cx - 40, cx + 40, cx + 100]) { a.ctx.strokeStyle = a.ink(.9); a.ctx.lineWidth = 1; a.ctx.beginPath(); a.ctx.moveTo(lx, cy - 40); a.ctx.lineTo(lx, cy - 64); a.ctx.stroke(); a.glow(lx, cy - 66, 10, .5); }
    });
    a.person(cx - 20, cy - 34, 1, 0); a.person(cx - 8, cy - 34, 1, 4);   // two figures on the bridge
    if (key['涅瓦河畔']) anchors[key['涅瓦河畔']] = [cx, cy - 130];
    const r = road(w, h, orient, tt => (P ? 30 : 6) * Math.sin(tt * 5));
    anchorAll(r, places, anchors, orient);
    return { road: r, anchors };
  },
};
function skyline(a, x0, x1, y) {
  const c = a.ctx; let x = x0;
  while (x < x1) {
    const bw = a.rr(30, 60), bh = a.rr(30, 60);
    c.fillStyle = a.ink(.35); c.fillRect(x, y - bh, bw, bh);
    if (a.rng() < .25) { c.beginPath(); c.arc(x + bw / 2, y - bh - 8, 9, Math.PI, 0); c.fill(); c.beginPath(); c.moveTo(x + bw / 2 - 3, y - bh - 16); c.quadraticCurveTo(x + bw / 2, y - bh - 30, x + bw / 2 + 3, y - bh - 16); c.fill(); } // onion dome
    x += bw + a.rr(2, 10);
  }
}

/* 深处: the prison's high window (dark), then 塔希提 opening beyond it */
export const depths = {
  paint(a, { w, h }, region, places, orient) {
    const P = orient === 'portrait', key = keyOf(places), anchors = {};
    if (!P) {
      a.night(0, 0, w * .62, h, { fadeOut: 160, strength: .9 });
      const wx = w * .26, wy = 150;
      a.ctx.fillStyle = 'rgba(214,206,186,.9)'; a.ctx.fillRect(wx - 26, wy, 52, 70);
      a.ctx.strokeStyle = 'rgba(8,7,6,.95)'; a.ctx.lineWidth = 3; for (let i = 1; i < 5; i++) { a.ctx.beginPath(); a.ctx.moveTo(wx - 26 + i * 10.4, wy); a.ctx.lineTo(wx - 26 + i * 10.4, wy + 70); a.ctx.stroke(); }
      a.ctx.fillStyle = 'rgba(236,228,208,.08)'; a.ctx.beginPath(); a.ctx.moveTo(wx - 26, wy + 70); a.ctx.lineTo(wx + 26, wy + 70); a.ctx.lineTo(wx + 110, 520); a.ctx.lineTo(wx - 70, 520); a.ctx.fill(); // shaft of light
      a.person(wx + 10, 500, 1.2, 0, true);
      if (key['高窗']) anchors[key['高窗']] = [wx, wy - 20];
      tahiti(a, w * .82, 440, w);
      if (key['塔希提']) anchors[key['塔希提']] = [w * .82, 300];
      const r = road(w, h, orient);
      anchorAll(r, places, anchors, orient);
      return { road: r, anchors, dark: [[0, w * .5]] };
    }
    a.night(0, 0, w, h * .55, { strength: .9 });
    a.ctx.fillStyle = 'rgba(214,206,186,.9)'; a.ctx.fillRect(w / 2 - 24, 120, 48, 64);
    a.ctx.strokeStyle = 'rgba(8,7,6,.95)'; a.ctx.lineWidth = 3; for (let i = 1; i < 5; i++) { a.ctx.beginPath(); a.ctx.moveTo(w / 2 - 24 + i * 9.6, 120); a.ctx.lineTo(w / 2 - 24 + i * 9.6, 184); a.ctx.stroke(); }
    if (key['高窗']) anchors[key['高窗']] = [w / 2, 100];
    tahiti(a, w / 2, h * .85, w);
    if (key['塔希提']) anchors[key['塔希提']] = [w / 2, h * .85 - 140];
    const r = road(w, h, orient, tt => 30 * Math.sin(tt * 5));
    anchorAll(r, places, anchors, orient);
    return { road: r, anchors, dark: [[0, h * .5]] };
  },
};
function tahiti(a, x, y) {
  a.moon(x + 40, y - 230, 18);
  a.water(x - 160, y + 10, 320, y + 70, { density: .6, fadeIn: 80, fadeOut: 60 });
  for (let i = 0; i < 4; i++) palm(a, x - 80 + i * 46, y + 10, a.rr(70, 100));
  a.house(x - 20, y + 6, 40, 14, 20);
}
function palm(a, x, y, hgt) {
  const c = a.ctx; c.strokeStyle = a.ink(.8); c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 10, y - hgt * .6, x + 4, y - hgt); c.stroke();
  for (let i = 0; i < 7; i++) { const an = Math.PI + i / 6 * Math.PI; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x + 4, y - hgt); c.quadraticCurveTo(x + 4 + Math.cos(an) * 16, y - hgt - 10, x + 4 + Math.cos(an) * 30, y - hgt + Math.abs(Math.sin(an)) * 4 + 8); c.stroke(); }
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
