// 荒漠与大海 (加缪, 三毛) and 马孔多 (马尔克斯), the end of the road.
import { thatchHut, palm, bananaPlant, casbah, adobeCube, nomadTent } from '../buildings.mjs';
import { road, spread, marksAt } from '../ink.mjs';

const keyOf = places => Object.fromEntries(places.map(p => [p.place, p.key]));
const anchorAll = (r, places, anchors, orient) => { for (const p of places) if (!anchors[p.key]) Object.assign(anchors, spread(r, [p.key], orient)); };

const DESERT = { 提帕萨: ['ruins', .18, 440], 阿尔及尔海滩: ['beach', .42, 460], 撒哈拉: ['sahara', .78, 430] };

export const desert = {
  paint(a, { w, h }, region, places, orient) {
    const P = orient === 'portrait', key = keyOf(places), anchors = {};
    // strong Mediterranean light: the paper warms slightly, no new hue
    const g = a.ctx.createRadialGradient(w * .5, h * .25, 10, w * .5, h * .25, Math.min(w, h) * .5 + 120);
    g.addColorStop(0, 'rgba(236,214,170,.35)'); g.addColorStop(1, 'rgba(236,214,170,0)'); a.ctx.fillStyle = g; a.ctx.fillRect(0, 0, w, h);
    if (!P) {
      a.ctx.strokeStyle = a.ink(.4); a.ctx.lineWidth = 1; a.ctx.beginPath(); a.ctx.moveTo(0, 360); a.ctx.lineTo(w * .55, 360); a.ctx.stroke();
      a.water(0, 362, w * .6, 470, { density: .6, fadeOut: 160 });
      a.ctx.strokeStyle = a.ink(.55); for (let x = 0; x < w * .6 - 40; x += 3) { a.ctx.lineWidth = .5 + 1.4 * a.fbm(x * .02, 2); a.ctx.beginPath(); a.ctx.moveTo(x, 470); a.ctx.lineTo(x + 3, 470); a.ctx.stroke(); }
      fadedLayer(a, w, h, w * .5, 240, c => { for (let k = 0; k < 6; k++) dune(a, c, w * .5 + k * 60, w + 40, 300 + k * 30, .2 + k * .07); });
    } else {
      a.water(0, h * .1, w, h * .45, { density: .5 });
      for (let k = 0; k < 6; k++) dune(a, a.ctx, -20, w + 20, h * .62 + k * 40, .2 + k * .07);
    }
    for (const m of marksAt(w, h, orient, DESERT)) { const pt = DRAW[m.kind](a, m.x, m.y); if (key[m.name]) anchors[key[m.name]] = pt; }
    const r = road(w, h, orient, tt => (P ? 40 : 10) * Math.sin(tt * 6));
    anchorAll(r, places, anchors, orient);
    return { road: r, anchors };
  },
};
function dune(a, c, x0, x1, y, tone) {
  const H = y + 400;
  const top = x => { const ramp = a.sm(Math.min(1, (x - x0) / 160)); return y + 40 * (1 - ramp) - ramp * (30 * Math.sin((x - x0) / (x1 - x0) * Math.PI * 2.2 + tone * 9) * .5 + 10 * a.fbm(x * .01 + tone, 2)); };
  const g = c.createLinearGradient(0, y - 30, 0, y + 120); g.addColorStop(0, 'rgba(192,180,152,.95)'); g.addColorStop(1, 'rgba(192,180,152,.6)');
  c.fillStyle = g; c.beginPath(); c.moveTo(x0, H);
  for (let x = x0; x <= x1; x += 6) c.lineTo(x, top(x));
  c.lineTo(x1, H); c.closePath(); c.fill();
  c.strokeStyle = a.ink(tone); c.lineWidth = 1; c.beginPath();
  for (let x = x0 + 40; x <= x1; x += 6) { const yy = top(x); x === x0 + 40 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke();
}
/** Paint into an offscreen layer, fade its left edge from x0 over `fade` px, composite back. */
function fadedLayer(a, w, h, x0, fade, paint) {
  const k = a.ctx.getTransform().a, off = document.createElement('canvas');
  off.width = Math.ceil(w * k); off.height = Math.ceil(h * k);
  const c = off.getContext('2d'); c.scale(k, k);
  paint(c);
  const g = c.createLinearGradient(x0, 0, x0 + fade, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)');
  c.globalCompositeOperation = 'destination-in'; c.fillStyle = g; c.fillRect(0, 0, w, h);
  a.ctx.drawImage(off, 0, 0, w, h);
}
const DRAW = {
  ruins(a, x, y) {          // 提帕萨: Roman columns by the sea, wormwood
    const c = a.ctx;
    for (let i = 0; i < 5; i++) { const cx = x - 60 + i * 30, hh = [70, 54, 80, 30, 62][i]; c.fillStyle = '#c4b99f'; c.fillRect(cx - 6, y - hh, 12, hh); c.strokeStyle = a.ink(.8); c.lineWidth = .9; c.strokeRect(cx - 6, y - hh, 12, hh);
      c.fillStyle = a.ink(.7); c.fillRect(cx - 9, y - hh - 4, 18, 4); }
    c.fillStyle = a.ink(.6); c.fillRect(x - 80, y, 160, 4);
    return [x, y - 110];
  },
  beach(a, x, y) {          // 阿尔及尔海滩: glare, one figure, the sun, the white city above the bay
    casbah(a, x - 150, y - 100, 180, 96);
    a.glow(x + 30, y - 210, 50, .5, '240,226,190');
    a.ctx.fillStyle = 'rgba(240,230,205,.95)'; a.ctx.beginPath(); a.ctx.arc(x + 30, y - 210, 16, 0, 7); a.ctx.fill();
    a.person(x, y, 1.2, 0);
    a.ctx.strokeStyle = a.ink(.3); a.ctx.lineWidth = .8; a.ctx.beginPath(); a.ctx.moveTo(x + 3, y); a.ctx.lineTo(x + 30, y + 6); a.ctx.stroke(); // long shadow
    return [x, y - 80];
  },
  sahara(a, x, y) {         // 撒哈拉: a tent, a camel, a lantern
    a.prop('camel-dunes', x - 90, y - 90, 180, 100, () => {
      const c = a.ctx;
      palm(a, x - 100, y + 2, 74, -10, .75); palm(a, x - 82, y + 6, 54, 8, .7);
      nomadTent(a, x - 30, y + 2, 78);
      camel(a, x + 44, y);
      adobeCube(a, x + 100, y - 14, 34, 20, 14); adobeCube(a, x + 138, y - 8, 26, 16, 12, { dome: true });   // the little house in El Aaiún
    });
    a.glow(x - 30, y - 8, 20, .5);
    return [x, y - 90];
  },
};
function camel(a, x, y) {
  const c = a.ctx; c.fillStyle = a.ink(.85);
  c.beginPath(); c.ellipse(x, y - 22, 20, 9, 0, 0, 7); c.fill(); c.beginPath(); c.arc(x - 4, y - 30, 8, Math.PI, 0); c.fill();
  for (const lx of [-14, -6, 8, 14]) c.fillRect(x + lx, y - 16, 2, 16);
  c.lineWidth = 3; c.strokeStyle = a.ink(.85); c.beginPath(); c.moveTo(x + 18, y - 24); c.quadraticCurveTo(x + 30, y - 30, x + 28, y - 44); c.stroke();
  c.beginPath(); c.ellipse(x + 31, y - 45, 5, 3, 0, 0, 7); c.fill();
}

/* 马孔多: rainforest, the river, the Buendía house — and the yellow butterflies, the only color on the scroll */
export const macondo = {
  paint(a, { w, h }, region, places, orient) {
    const P = orient === 'portrait', key = keyOf(places), anchors = {};
    const cx = w / 2, gy = P ? h * .6 : 440;
    for (let i = 0; i < (P ? 16 : 26); i++) jungleTree(a, a.rr(0, w), gy + a.rr(-30, 60), a.rr(80, 170), a.rr(.5, .95));
    a.water(0, gy + 50, w, gy + 110, { density: .7 });
    const sx = P ? .62 : 1;
    for (const dx of [-250, -196, -112, 118, 196, 262]) palm(a, cx + dx * sx, gy + a.rr(0, 30), a.rr(96, 150), a.rr(-18, 18), .8);
    thatchHut(a, cx - 170 * sx, gy + 2, 42, 15, 20); thatchHut(a, cx + 86 * sx, gy - 4, 38, 14, 18);
    for (let i = 0; i < 8; i++) bananaPlant(a, a.rr(20, w - 20), gy + a.rr(16, 46), a.rr(24, 40));
    jungleTree(a, cx + 54, gy + 22, 128, .92);                       // the chestnut tree in the courtyard
    thatchHut(a, cx - 50, gy + 18, 80, 22, 34);                      // the Buendía house, the biggest in the village
    thatchHut(a, cx + 150 * sx, gy + 26, 46, 16, 22);
    for (let i = 0; i < 5; i++) a.person(cx + a.rr(-150, 190) * sx, gy + a.rr(28, 44), .95, Math.floor(a.rr(0, 3)));
    a.prop('butterflies', cx - 160, gy - 260, 320, 260, () => {
      for (let i = 0; i < 70; i++) butterfly(a, cx + a.rr(-180, 180), gy - a.rr(20, 300), a.rr(2.4, 5), a.rr(.7, .9));
    });
    if (key['马孔多']) anchors[key['马孔多']] = [cx - 10, gy - 66];
    const r = road(w, h, orient, tt => (P ? 30 : 8) * Math.sin(tt * 5));
    anchorAll(r, places, anchors, orient);
    return { road: r, anchors };
  },
};
function jungleTree(a, x, y, hgt, tone) {
  const c = a.ctx; c.strokeStyle = a.ink(tone); c.lineWidth = 2.2; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + a.rr(-10, 10), y - hgt * .5, x + a.rr(-6, 6), y - hgt); c.stroke();
  for (let i = 0; i < 9; i++) { const an = a.rr(0, Math.PI * 2), r = a.rr(10, 26); c.fillStyle = a.ink(tone * a.rr(.35, .7));
    c.beginPath(); c.ellipse(x + Math.cos(an) * r, y - hgt + Math.sin(an) * r * .6, a.rr(10, 22), a.rr(4, 8), an, 0, 7); c.fill(); }
}
function butterfly(a, x, y, s, alpha) {
  const c = a.ctx; c.fillStyle = `rgba(217,180,74,${alpha})`;
  c.beginPath(); c.ellipse(x - s * .6, y, s, s * .6, -.5, 0, 7); c.fill();
  c.beginPath(); c.ellipse(x + s * .6, y, s, s * .6, .5, 0, 7); c.fill();
}
