// 行囊: the traveler's gear, a small 清供 still life. 罗盘 / 灯 / 秤 carry the functional books.
import { road } from '../ink.mjs';

export const xingnang = {
  paint(a, { w, h }, region, places, orient, { objects }) {
    const P = orient === 'portrait';
    const cx = P ? w / 2 : w * .5, ty = P ? h * .58 : 400;          // table top
    const tw = P ? 320 : 460;
    a.mountain({ x0: -40, x1: w + 40, base: P ? h * .3 : 230, amp: 70, freq: .008, seed: 5, tone: .4, depth: 90, cun: .3, edge: .5 });
    a.mist(0, P ? h * .3 - 50 : 180, w, 80, .7);
    a.pine(P ? 60 : w * .12, ty + 40, 120, .85);
    table(a, cx - tw / 2, ty, tw);
    const xs = [cx - tw * .32, cx, cx + tw * .32];
    const out = {};
    const draw = { compass: x => compass(a, x, ty), lamp: x => lamp(a, x, ty), scale: x => scale(a, x, ty) };
    ['compass', 'lamp', 'scale'].forEach((id, i) => {
      a.prop(id, xs[i] - 50, ty - 110, 100, 110, () => draw[id](xs[i]));
      out[id] = [xs[i], ty - 120];
    });
    bundle(a, cx + tw / 2 + 30, ty + 40);
    const anchors = {};
    for (const o of objects) o.books.forEach((k, i) => { const [x, y] = out[o.id]; anchors[k] = [x, y - 10 - i * 4]; });
    for (const p of places) anchors[p.key] ??= [cx, ty - 140];
    return { road: road(w, h, orient, t => (P ? 50 : 30) * Math.sin(t * 4)), anchors, objects: out };
  },
};

function table(a, x, y, w) {
  const c = a.ctx;
  c.fillStyle = a.ink(.82); c.beginPath(); c.moveTo(x - 10, y); c.lineTo(x + w + 10, y); c.lineTo(x + w + 26, y - 14); c.lineTo(x + 6, y - 14); c.closePath(); c.fill();
  c.fillStyle = a.ink(.9); c.fillRect(x - 10, y, w + 20, 6);
  c.strokeStyle = a.ink(.9); c.lineWidth = 3;
  for (const lx of [x + 4, x + w - 4]) { c.beginPath(); c.moveTo(lx, y + 6); c.quadraticCurveTo(lx + (lx < x + w / 2 ? -8 : 8), y + 40, lx, y + 64); c.stroke(); }
  c.lineWidth = 1.2; c.beginPath(); c.moveTo(x + 4, y + 50); c.lineTo(x + w - 4, y + 50); c.stroke();
}
function compass(a, x, y) {   // 罗盘: concentric rings on a square base, needle
  const c = a.ctx, r = 34, cy = y - 22;
  c.fillStyle = a.ink(.75); c.fillRect(x - r - 6, y - 16, 2 * r + 12, 6);
  c.fillStyle = '#c7bca5'; c.beginPath(); c.ellipse(x, cy, r, r * .42, 0, 0, 7); c.fill();
  c.strokeStyle = a.ink(.85); c.lineWidth = 1.1;
  for (const k of [1, .78, .56, .3]) { c.beginPath(); c.ellipse(x, cy, r * k, r * .42 * k, 0, 0, 7); c.stroke(); }
  for (let i = 0; i < 24; i++) { const an = i / 24 * Math.PI * 2; c.lineWidth = .5; c.beginPath(); c.moveTo(x + Math.cos(an) * r * .56, cy + Math.sin(an) * r * .42 * .56); c.lineTo(x + Math.cos(an) * r * .78, cy + Math.sin(an) * r * .42 * .78); c.stroke(); }
  c.strokeStyle = '#9b3a2a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x - r * .26, cy + 2); c.lineTo(x + r * .26, cy - 2); c.stroke();
}
function lamp(a, x, y) {      // 灯: an oil lamp on a tall stand, its glow
  const c = a.ctx;
  a.glow(x, y - 92, 70, .5);
  c.strokeStyle = a.ink(.9); c.lineWidth = 2.4; c.beginPath(); c.moveTo(x, y - 14); c.lineTo(x, y - 80); c.stroke();
  c.fillStyle = a.ink(.85); c.beginPath(); c.ellipse(x, y - 14, 16, 4, 0, 0, 7); c.fill();
  c.beginPath(); c.ellipse(x, y - 82, 14, 4, 0, 0, Math.PI); c.fill();
  c.fillStyle = 'rgba(240,214,150,.95)'; c.beginPath(); c.moveTo(x, y - 100); c.quadraticCurveTo(x + 5, y - 90, x, y - 84); c.quadraticCurveTo(x - 5, y - 90, x, y - 100); c.fill();
}
function scale(a, x, y) {     // 秤: a steelyard with hook, pan and sliding weight
  const c = a.ctx, top = y - 96;
  c.strokeStyle = a.ink(.9); c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(x - 6, y - 14); c.lineTo(x - 6, top); c.stroke();                    // stand
  c.fillStyle = a.ink(.8); c.fillRect(x - 18, y - 16, 24, 4);
  c.lineWidth = 2; c.beginPath(); c.moveTo(x - 40, top + 8); c.lineTo(x + 50, top - 4); c.stroke(); // beam
  c.lineWidth = .8; c.beginPath(); c.moveTo(x - 36, top + 8); c.lineTo(x - 44, top + 40); c.moveTo(x - 36, top + 8); c.lineTo(x - 28, top + 40); c.stroke();
  c.fillStyle = a.ink(.8); c.beginPath(); c.ellipse(x - 36, top + 41, 12, 3, 0, 0, 7); c.fill();  // pan
  c.beginPath(); c.moveTo(x + 32, top - 2); c.lineTo(x + 32, top + 16); c.stroke();
  c.beginPath(); c.moveTo(x + 27, top + 16); c.lineTo(x + 37, top + 16); c.lineTo(x + 35, top + 26); c.lineTo(x + 29, top + 26); c.closePath(); c.fill(); // weight
}
function bundle(a, x, y) {    // a cloth bundle and a walking staff leaning by the table
  const c = a.ctx;
  c.fillStyle = a.ink(.7); c.beginPath(); c.ellipse(x, y - 14, 22, 16, 0, 0, 7); c.fill();
  c.strokeStyle = a.ink(.9); c.lineWidth = 1; c.beginPath(); c.moveTo(x - 4, y - 30); c.quadraticCurveTo(x + 2, y - 40, x + 8, y - 30); c.stroke();
  c.lineWidth = 2.2; c.beginPath(); c.moveTo(x + 30, y + 4); c.lineTo(x + 6, y - 110); c.stroke();
  c.fillStyle = a.ink(.85); c.beginPath(); c.ellipse(x + 40, y - 2, 22, 5, 0, 0, 7); c.fill(); // straw hat
}
