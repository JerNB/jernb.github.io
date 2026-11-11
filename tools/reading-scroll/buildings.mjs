// Architecture and planting that belong to one place only. The Song-style 界画 house in ink.mjs
// is for the 江湖 town; every other country on the road builds differently, so each gets its
// own drawer here. All take the ink api `a` first and draw in the same oblique projection.

const OB = { dx: .62, dy: -.42 };
const poly = (c, pts) => { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); };
const line = (c, x0, y0, x1, y1) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); };

/** A plain block: front wall, right side, optional flat top. Returns the depth offset. */
function box(a, x, y, w, h, d, { wall = '#c3b9a3', side = '#a69b84', top = null, ink = .85 } = {}) {
  const c = a.ctx, ox = d * OB.dx, oy = d * OB.dy;
  c.lineJoin = 'round'; c.strokeStyle = a.ink(ink); c.lineWidth = .7;
  c.fillStyle = side; poly(c, [[x + w, y], [x + w + ox, y + oy], [x + w + ox, y - h + oy], [x + w, y - h]]); c.fill(); c.stroke();
  if (top) { c.fillStyle = top; poly(c, [[x, y - h], [x + w, y - h], [x + w + ox, y - h + oy], [x + ox, y - h + oy]]); c.fill(); c.stroke(); }
  c.fillStyle = wall; c.fillRect(x, y - h, w, h); c.strokeRect(x, y - h, w, h);
  return { ox, oy };
}

/* ---------- trees ---------- */
export function bareTree(a, x, y, h, tone = .8, light = false) {
  const c = a.ctx, col = al => light ? `rgba(236,228,208,${al})` : a.ink(al);
  const grow = (px, py, len, ang, wd, depth) => {
    const ex = px + Math.cos(ang) * len, ey = py + Math.sin(ang) * len;
    c.strokeStyle = col(tone * (.55 + .45 * wd / 3)); c.lineWidth = wd;
    c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo(px + Math.cos(ang) * len * .5 + a.rr(-3, 3), py + Math.sin(ang) * len * .5, ex, ey); c.stroke();
    if (depth > 0) for (let i = 0, n = depth > 2 ? 2 : 3; i < n; i++) grow(ex, ey, len * a.rr(.55, .75), ang + a.rr(-.75, .75), Math.max(.4, wd * .6), depth - 1);
    return [ex, ey];
  };
  grow(x, y, h * .42, -Math.PI / 2 + a.rr(-.12, .12), 3, 4);
}
/** 梅: a gnarled bare tree in flower; blossoms are specks of light. */
export function plum(a, x, y, h, light = true) {
  bareTree(a, x, y, h, .9, light);
  const c = a.ctx;
  for (let i = 0; i < h * .9; i++) {
    const px = x + a.rr(-h * .5, h * .5), py = y - a.rr(h * .3, h * 1.05);
    c.fillStyle = `rgba(240,232,214,${a.rr(.5, .95)})`; c.beginPath(); c.arc(px, py, a.rr(.8, 1.7), 0, 7); c.fill();
  }
}
export function palm(a, x, y, h, lean = 0, tone = .85) {
  const c = a.ctx, tx = x + lean, ty = y - h;
  c.strokeStyle = a.ink(tone); c.lineCap = 'round';
  for (let i = 0; i <= 10; i++) {                                  // trunk, ringed, tapering
    const t = i / 10, t2 = (i + 1) / 10, q = u => [x + lean * u * u, y - h * u];
    c.lineWidth = 3.4 - 1.6 * t; line(c, ...q(t), ...q(Math.min(1, t2)));
  }
  for (let i = 0; i < 9; i++) {
    const ang = -Math.PI * (.04 + i / 8 * .92) + a.rr(-.1, .1), len = h * a.rr(.38, .55);
    const ex = tx + Math.cos(ang) * len, ey = ty + Math.sin(ang) * len * .55 + len * .34;
    const mx = tx + Math.cos(ang) * len * .55, my = ty + Math.sin(ang) * len * .7 - 4;
    c.strokeStyle = a.ink(tone * .9); c.lineWidth = 1.2; c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(mx, my, ex, ey); c.stroke();
    c.lineWidth = .55; c.strokeStyle = a.ink(tone * .6);
    for (let u = .2; u < 1; u += .09) {                             // leaflets hang off the rib
      const bx = (1 - u) * (1 - u) * tx + 2 * (1 - u) * u * mx + u * u * ex, by = (1 - u) * (1 - u) * ty + 2 * (1 - u) * u * my + u * u * ey;
      line(c, bx, by, bx + a.rr(-2, 2), by + 5 + 7 * (1 - u));
    }
  }
  c.fillStyle = a.ink(tone); c.beginPath(); c.arc(tx - 2, ty + 3, 2.2, 0, 7); c.arc(tx + 3, ty + 4, 2, 0, 7); c.fill();
  c.lineCap = 'butt';
}
/** Broad banana leaves fanning from the ground. */
export function bananaPlant(a, x, y, h, tone = .7) {
  const c = a.ctx;
  for (let i = 0; i < 6; i++) {
    const ang = -Math.PI / 2 + (i - 2.5) * .34 + a.rr(-.08, .08), len = h * a.rr(.7, 1);
    c.save(); c.translate(x, y); c.rotate(ang);
    c.fillStyle = a.ink(tone * a.rr(.4, .75)); c.beginPath(); c.moveTo(len * .15, 0); c.quadraticCurveTo(len * .55, -len * .16, len, 0); c.quadraticCurveTo(len * .55, len * .16, len * .15, 0); c.fill();
    c.strokeStyle = 'rgba(205,196,174,.5)'; c.lineWidth = .6; line(c, 0, 0, len, 0);
    c.restore();
  }
}

/* ---------- 马孔多 / 塔希提 / 云南: adobe and thatch ---------- */
export function thatchHut(a, x, y, w, h, d, { stilts = 0, wall = '#cdc2a6', door = true } = {}) {
  const c = a.ctx;
  if (stilts) {
    c.strokeStyle = a.ink(.85); c.lineWidth = 1.4;
    for (const px of [x + 3, x + w - 3, x + w + d * OB.dx - 2]) line(c, px, y, px, y - stilts);
    c.lineWidth = .8; line(c, x + w * .3, y, x + w * .42, y - stilts); line(c, x + w * .42, y, x + w * .54, y - stilts);
    for (let r = 1; r < 4; r++) line(c, x + w * .3 + r * 3, y - r * stilts / 4, x + w * .42 + r * 3, y - r * stilts / 4);
    y -= stilts;
  }
  const { ox, oy } = box(a, x, y, w, h, d, { wall, side: '#a99e86' });
  c.strokeStyle = a.ink(.22); c.lineWidth = .5;                      // the mud wall has cracked and been patched
  for (let i = 0; i < 7; i++) { const px = x + a.rr(3, w - 3), py = y - a.rr(2, h - 2); line(c, px, py, px + a.rr(-5, 5), py + a.rr(2, 6)); }
  if (door) { c.fillStyle = a.ink(.8); c.fillRect(x + w * .42, y - h * .78, w * .2, h * .78); c.fillRect(x + w * .1, y - h * .6, w * .14, h * .26); }
  const rh = h * 1.25, ex = 9, rx = x + w * .5 + ox * .5, ry = y - h - rh + oy * .5;
  c.fillStyle = a.ink(.5); poly(c, [[x + w + ex * .4, y - h + 3], [x + w + ox + ex, y - h + oy + 4], [rx + w * .16, ry], [rx, ry]]); c.fill();
  c.fillStyle = a.ink(.72); poly(c, [[x - ex, y - h + 4], [x + w + ex * .4, y - h + 4], [rx + w * .16, ry], [rx - w * .16, ry]]); c.fill();
  for (let i = 0; i < w * 2.2; i++) {                                // shaggy palm thatch, ragged at the eave
    const t = a.rng(), u = a.rng(), bx = (x - ex) + t * (w + ex * 1.4), top = rx - w * .16 + t * w * .32;
    const px = top + (bx - top) * u, py = ry + (y - h + 4 - ry) * u;
    c.strokeStyle = u > .82 ? a.ink(a.rr(.5, .9)) : `rgba(205,196,174,${a.rr(.12, .3)})`; c.lineWidth = a.rr(.4, .9);
    line(c, px, py, px + (bx - top) * .08 + a.rr(-1, 1), py + a.rr(5, 10));
  }
  c.strokeStyle = a.ink(1); c.lineWidth = 1.6; line(c, rx - w * .18, ry, rx + w * .18, ry);
  return [x + w / 2, ry];
}

/* ---------- 北非: flat roofs, white cubes, black tents ---------- */
export function adobeCube(a, x, y, w, h, d, { dome = false, wall = '#d6ccb2', arch = true } = {}) {
  const c = a.ctx, { ox, oy } = box(a, x, y, w, h, d, { wall, side: '#a89d85', top: '#c9bfa5' });
  c.fillStyle = a.ink(.82);
  for (let i = 0, n = Math.max(1, Math.round(w / 16)); i < n; i++) c.fillRect(x + (i + .5) * w / n - 1.5, y - h * .72, 3, 5);
  if (arch) { const ax = x + w * .5 - 4; c.beginPath(); c.moveTo(ax, y); c.lineTo(ax, y - 9); c.arc(ax + 4, y - 9, 4, Math.PI, 0); c.lineTo(ax + 8, y); c.fill(); }
  c.fillStyle = a.ink(.6); for (let bx = x + 4; bx < x + w - 2; bx += 6) c.fillRect(bx, y - h + 3, 1.6, 1.6);   // roof-beam ends
  c.fillStyle = wall; c.strokeStyle = a.ink(.85); c.lineWidth = .7;
  c.fillRect(x - 1, y - h - 3, 5, 3); c.strokeRect(x - 1, y - h - 3, 5, 3); c.fillRect(x + w - 4, y - h - 3, 5, 3); c.strokeRect(x + w - 4, y - h - 3, 5, 3);
  if (dome) { const cx = x + w / 2 + ox / 2, cy = y - h + oy / 2; c.fillStyle = '#d9d0b8'; c.beginPath(); c.ellipse(cx, cy, w * .28, w * .3, 0, Math.PI, 0); c.closePath(); c.fill(); c.stroke(); line(c, cx, cy - w * .3, cx, cy - w * .3 - 6); }
}
/** The white city climbing the hill above the bay: stacked cubes and one square minaret. */
export function casbah(a, x, y, w = 200, hgt = 130) {
  const c = a.ctx, cells = [];
  for (let r = 0; r < 6; r++) {
    const t = r / 5, span = w * (1 - t * .55), n = Math.round(7 - r * .9);
    for (let i = 0; i < n; i++) cells.push([x - span / 2 + (i + a.rr(.1, .5)) * span / n, y - t * hgt - a.rr(0, 8), a.rr(20, 34) * (1 - t * .3), a.rr(14, 24) * (1 - t * .25), t]);
  }
  cells.sort((p, q) => p[1] - q[1]);                                 // far rows first
  cells.forEach(([cx, cy, cw, ch, t], i) => { c.save(); c.globalAlpha = .55 + .45 * (1 - t); adobeCube(a, cx, cy, cw, ch, 10 * (1 - t * .4), { dome: i % 9 === 4, arch: t < .5 }); c.restore(); });
  const mx = x + w * .16, my = y - hgt * .78;                        // the minaret
  box(a, mx, my, 9, 46, 6, { wall: '#d6ccb2', side: '#a89d85', top: '#c9bfa5' });
  box(a, mx + 2, my - 46, 5, 10, 3, { wall: '#d6ccb2', side: '#a89d85' });
  c.fillStyle = a.ink(.8); c.fillRect(mx + 3, my - 36, 3, 6); c.beginPath(); c.arc(mx + 4.5, my - 58, 2.6, Math.PI, 0); c.fill();
  return [x, y - hgt - 30];
}
export function nomadTent(a, x, y, w = 70) {
  const c = a.ctx, hh = w * .36;
  c.fillStyle = a.ink(.82); poly(c, [[x - w / 2, y], [x - w * .3, y - hh * .7], [x - w * .08, y - hh], [x + w * .12, y - hh * .72], [x + w * .3, y - hh * .95], [x + w / 2, y]]); c.fill();
  c.strokeStyle = 'rgba(205,196,174,.4)'; c.lineWidth = .7; for (let i = -2; i <= 2; i++) line(c, x + i * w * .14, y - hh * .78, x + i * w * .19, y);
  c.fillStyle = 'rgba(205,196,174,.55)'; poly(c, [[x - 5, y], [x, y - hh * .5], [x + 7, y]]); c.fill();
  c.strokeStyle = a.ink(.6); c.lineWidth = .6; line(c, x - w * .3, y - hh * .7, x - w * .68, y + 2); line(c, x + w * .3, y - hh * .95, x + w * .7, y + 2);
}

/* ---------- 彼得堡: stone, windows in ranks, gold needles ---------- */
export function facade(a, x, y, w, h, d, { floors = 3, pediment = false, wall = '#cbc2ab', tone = .8 } = {}) {
  const c = a.ctx; box(a, x, y, w, h, d, { wall, side: '#aaa08a', ink: tone });
  const fh = h / floors, cols = Math.max(3, Math.round(w / 11));
  for (let f = 0; f < floors; f++) {
    const yy = y - f * fh;
    c.strokeStyle = a.ink(tone * .5); c.lineWidth = .6; line(c, x, yy - fh, x + w, yy - fh);
    if (f === 0) { c.strokeStyle = a.ink(tone * .22); for (let r = 1; r < 4; r++) line(c, x, yy - r * fh / 4, x + w, yy - r * fh / 4); }   // rusticated ground floor
    for (let i = 0; i < cols; i++) {
      const wx = x + (i + .5) * w / cols - 1.8;
      c.fillStyle = a.ink(tone * (f === 0 ? .75 : .6)); c.fillRect(wx, yy - fh * .78, 3.6, fh * .52);
      if (f === 1) { c.fillStyle = a.ink(tone * .5); c.fillRect(wx - 1, yy - fh * .86, 5.6, 1.2); }
    }
  }
  c.fillStyle = a.ink(tone * .9); c.fillRect(x - 2, y - h - 2.5, w + 4, 2.5);                              // cornice
  c.fillStyle = a.ink(tone * .6); poly(c, [[x, y - h - 2.5], [x + w, y - h - 2.5], [x + w - 5, y - h - 8], [x + 5, y - h - 8]]); c.fill();
  for (let i = 0; i < w / 26; i++) c.fillRect(x + a.rr(6, w - 8), y - h - 13, 3, 6);                        // chimneys
  if (pediment) {
    const px = x + w * .32, pw = w * .36;
    c.fillStyle = wall; c.strokeStyle = a.ink(tone); c.lineWidth = .8; poly(c, [[px - 3, y - h - 2], [px + pw + 3, y - h - 2], [px + pw / 2, y - h - 14]]); c.fill(); c.stroke();
    c.lineWidth = 1.6; c.strokeStyle = '#d8cfb9'; for (let i = 0; i <= 5; i++) line(c, px + i * pw / 5, y - 1, px + i * pw / 5, y - h + 1);
    c.lineWidth = .5; c.strokeStyle = a.ink(tone * .7); for (let i = 0; i <= 5; i++) { line(c, px + i * pw / 5 - 1, y, px + i * pw / 5 - 1, y - h); line(c, px + i * pw / 5 + 1, y, px + i * pw / 5 + 1, y - h); }
  }
}
export function onionDome(a, x, y, r, tone = .75) {
  const c = a.ctx;
  c.fillStyle = '#c6bda6'; c.strokeStyle = a.ink(tone); c.lineWidth = .8; c.fillRect(x - r * .55, y - r * 1.1, r * 1.1, r * 1.1); c.strokeRect(x - r * .55, y - r * 1.1, r * 1.1, r * 1.1);
  c.fillStyle = a.ink(tone * .7); for (let i = -1; i <= 1; i++) c.fillRect(x + i * r * .32 - 1, y - r * .9, 2, r * .6);
  const by = y - r * 1.1;
  c.fillStyle = a.ink(tone * .8); c.beginPath(); c.moveTo(x - r * .5, by);
  c.bezierCurveTo(x - r * 1.35, by - r * .7, x - r * .5, by - r * 1.6, x, by - r * 2.3);
  c.bezierCurveTo(x + r * .5, by - r * 1.6, x + r * 1.35, by - r * .7, x + r * .5, by); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(205,196,174,.35)'; c.lineWidth = .6;
  for (const k of [-.5, 0, .5]) { c.beginPath(); c.moveTo(x + k * r * .6, by); c.quadraticCurveTo(x + k * r * 1.5, by - r, x, by - r * 2.3); c.stroke(); }
  c.strokeStyle = a.ink(tone); c.lineWidth = .9; line(c, x, by - r * 2.3, x, by - r * 3); line(c, x - 2.5, by - r * 2.75, x + 2.5, by - r * 2.75);
}
export function needleSpire(a, x, y, h, tone = .7) {
  const c = a.ctx;
  box(a, x - 9, y, 18, h * .22, 8, { wall: '#cbc2ab', side: '#aaa08a', ink: tone });
  box(a, x - 5, y - h * .22, 10, h * .14, 5, { wall: '#cbc2ab', side: '#aaa08a', ink: tone });
  c.fillStyle = a.ink(tone); poly(c, [[x - 3.5, y - h * .36], [x + 3.5, y - h * .36], [x + .5, y - h], [x - .5, y - h]]); c.fill();
  c.beginPath(); c.arc(x, y - h * .5, 2, 0, 7); c.fill();
}
export function lampPost(a, x, y, h = 30, lit = true) {
  const c = a.ctx; c.strokeStyle = a.ink(.85); c.lineWidth = 1.1; line(c, x, y, x, y - h);
  c.lineWidth = .7; line(c, x - 3, y, x + 3, y);
  if (lit) a.glow(x, y - h - 3, 16, .5, '240,232,210');
  c.fillStyle = 'rgba(240,232,210,.95)'; c.strokeStyle = a.ink(.85); poly(c, [[x - 2.6, y - h], [x + 2.6, y - h], [x + 2, y - h - 6], [x - 2, y - h - 6]]); c.fill(); c.stroke();
}
/** Granite quay: coursed blocks, a cast-iron railing on top. */
export function embankment(a, x0, x1, y, h = 16) {
  const c = a.ctx; c.fillStyle = '#b7ad96'; c.fillRect(x0, y, x1 - x0, h);
  c.strokeStyle = a.ink(.6); c.lineWidth = .8; line(c, x0, y, x1, y); line(c, x0, y + h, x1, y + h);
  c.strokeStyle = a.ink(.2); c.lineWidth = .5; line(c, x0, y + h / 2, x1, y + h / 2);
  for (let x = x0, i = 0; x < x1; x += 13, i++) line(c, x + (i % 2) * 6, y + (i % 2 ? h / 2 : 0), x + (i % 2) * 6, y + (i % 2 ? h : h / 2));
  c.strokeStyle = a.ink(.7); c.lineWidth = .6; line(c, x0, y - 7, x1, y - 7);
  for (let x = x0; x < x1; x += 4) line(c, x, y, x, y - 7);
  c.lineWidth = 1.4; for (let x = x0; x < x1; x += 44) line(c, x, y, x, y - 9);
}

/* ---------- 日本: deep eaves, shoji, snow on the roof ---------- */
export function minka(a, x, y, w, h, d, { snow = false, storeys = 1, wall = '#d6cdb6' } = {}) {
  const c = a.ctx, ox = d * OB.dx, oy = d * OB.dy;
  c.strokeStyle = a.ink(.85); c.lineWidth = 1;                       // raised floor on short posts, an engawa running round
  for (let px = x + 2; px <= x + w; px += w / 5 - .5) line(c, px, y, px, y - 5);
  c.fillStyle = a.ink(.7); c.fillRect(x - 6, y - 7, w + 12, 2.5);
  let top = y - 7;
  for (let s = 0; s < storeys; s++) {
    const sw = w - s * w * .22, sx = x + s * w * .11, sh = s ? h * .7 : h;
    box(a, sx, top, sw, sh, d * (s ? .7 : 1), { wall, side: '#a99f88' });
    const bays = Math.max(3, Math.round(sw / 13));
    for (let b = 0; b < bays; b++) {                                  // shoji: paper panels in a fine grid between dark posts
      const bx = sx + b * sw / bays;
      c.strokeStyle = a.ink(.9); c.lineWidth = 1.1; line(c, bx, top, bx, top - sh);
      c.strokeStyle = a.ink(.28); c.lineWidth = .45;
      for (let g = 1; g < 3; g++) line(c, bx + g * sw / bays / 3, top - 1, bx + g * sw / bays / 3, top - sh * .78);
      for (let g = 1; g < 4; g++) line(c, bx, top - g * sh * .78 / 4, bx + sw / bays, top - g * sh * .78 / 4);
    }
    c.strokeStyle = a.ink(.9); c.lineWidth = 1.2; line(c, sx, top - sh * .78, sx + sw, top - sh * .78);
    // the roof: low, wide, eaves lifting a little at the corners
    const ev = 15, rh = sh * .7, fx0 = sx - ev, fx1 = sx + sw + ev, fy = top - sh + 2, k = .5;
    c.fillStyle = a.ink(.62); poly(c, [[fx1, fy], [fx1 + ox, fy + oy], [sx + sw * .8 + ox * k, fy - rh + oy * k], [sx + sw * .8 + ox * k - 4, fy - rh + oy * k]]); c.fill();
    c.fillStyle = a.ink(.84); c.beginPath(); c.moveTo(fx0 - 3, fy - 4); c.quadraticCurveTo(sx + sw / 2, fy + 3, fx1 + 3, fy - 4);
    c.lineTo(sx + sw * .8 + ox * k, fy - rh + oy * k); c.lineTo(sx + sw * .2 + ox * k, fy - rh + oy * k); c.closePath(); c.fill();
    if (snow) {
      c.fillStyle = 'rgba(232,226,210,.96)'; c.beginPath(); c.moveTo(sx + sw * .2 + ox * k - 2, fy - rh + oy * k - 2);
      c.lineTo(sx + sw * .8 + ox * k + 2, fy - rh + oy * k - 2);
      const n = 12; for (let i = n; i >= 0; i--) { const t = i / n; c.lineTo(fx0 + 6 + t * (fx1 - fx0 - 10), fy - 5 - (i % 2 ? 3.5 : 0) + 3 * Math.sin(t * Math.PI)); }
      c.closePath(); c.fill();
    } else {
      c.strokeStyle = 'rgba(196,187,167,.3)'; c.lineWidth = .5;
      for (let t = 0; t <= 1; t += .04) line(c, fx0 + t * (fx1 - fx0), fy - 2, sx + sw * (.2 + .6 * t) + ox * k, fy - rh + oy * k + 1);
    }
    c.strokeStyle = a.ink(1); c.lineWidth = 2; line(c, sx + sw * .2 + ox * k - 4, fy - rh + oy * k, sx + sw * .8 + ox * k + 4, fy - rh + oy * k);
    top = fy - rh * .45;
  }
  return [x + w / 2, top];
}
export function stoneLantern(a, x, y, s = 1, snow = false) {
  const c = a.ctx; c.fillStyle = a.ink(.75);
  c.fillRect(x - 4 * s, y - 2 * s, 8 * s, 2 * s); c.fillRect(x - 1.5 * s, y - 12 * s, 3 * s, 10 * s); c.fillRect(x - 4 * s, y - 18 * s, 8 * s, 6 * s);
  poly(c, [[x - 7 * s, y - 18 * s], [x + 7 * s, y - 18 * s], [x, y - 24 * s]]); c.fill();
  c.fillStyle = 'rgba(205,196,174,.9)'; c.fillRect(x - 1.5 * s, y - 16.5 * s, 3 * s, 3 * s);
  if (snow) { c.fillStyle = 'rgba(232,226,210,.96)'; poly(c, [[x - 6 * s, y - 19 * s], [x + 6 * s, y - 19 * s], [x, y - 25 * s]]); c.fill(); }
}

/* ---------- 北京 and the factory: grey brick, a gate, a bicycle ---------- */
export function siheyuan(a, x, y, w = 190) {
  const c = a.ctx, wallH = 24;
  bareTree(a, x + w * .68, y - wallH + 4, 96, .7);                   // the old locust in the yard
  for (const [fx, fw, lift] of [[.04, .3, 18], [.4, .22, 22], [.66, .3, 17]]) {      // roofs of the rooms behind the wall
    const rx = x + fx * w, rw = fw * w, ry = y - wallH - 2;
    c.fillStyle = '#b3ac9c'; c.fillRect(rx + 3, ry - 6, rw - 6, 8);
    c.fillStyle = a.ink(.72); poly(c, [[rx - 3, ry - 5], [rx + rw + 3, ry - 5], [rx + rw - 5, ry - lift], [rx + 5, ry - lift]]); c.fill();
    c.strokeStyle = 'rgba(196,187,167,.3)'; c.lineWidth = .5; for (let t = rx; t < rx + rw; t += 3) line(c, t, ry - 5, t + (rx + rw / 2 - t) * .06, ry - lift + 1);
    c.strokeStyle = a.ink(1); c.lineWidth = 1.5; line(c, rx + 3, ry - lift, rx + rw - 3, ry - lift);
  }
  c.fillStyle = '#a9a292'; c.fillRect(x, y - wallH, w, wallH); c.strokeStyle = a.ink(.8); c.lineWidth = .7; c.strokeRect(x, y - wallH, w, wallH);
  c.strokeStyle = a.ink(.2); c.lineWidth = .45;                      // brick courses
  for (let r = 1; r < 6; r++) { line(c, x, y - r * 4, x + w, y - r * 4); for (let bx = x + (r % 2) * 5; bx < x + w; bx += 10) line(c, bx, y - r * 4, bx, y - r * 4 + 4); }
  c.fillStyle = a.ink(.7); c.fillRect(x - 2, y - wallH - 3, w + 4, 3);
  const gx = x + w * .24, gw = 26, gh = 30;                          // 门楼
  c.fillStyle = '#9d9687'; c.fillRect(gx - 4, y - gh, gw + 8, gh); c.strokeRect(gx - 4, y - gh, gw + 8, gh);
  c.fillStyle = a.ink(.82); c.fillRect(gx + 2, y - gh + 6, gw - 4, gh - 6);
  c.strokeStyle = 'rgba(205,196,174,.5)'; c.lineWidth = .6; line(c, gx + gw / 2, y, gx + gw / 2, y - gh + 6);
  c.fillStyle = 'rgba(205,196,174,.7)'; c.beginPath(); c.arc(gx + gw / 2 - 3, y - 12, 1, 0, 7); c.arc(gx + gw / 2 + 3, y - 12, 1, 0, 7); c.fill();
  c.fillStyle = a.ink(.85); poly(c, [[gx - 10, y - gh], [gx + gw + 10, y - gh], [gx + gw + 3, y - gh - 11], [gx - 3, y - gh - 11]]); c.fill();
  c.strokeStyle = a.ink(1); c.lineWidth = 1.6; line(c, gx - 5, y - gh - 11, gx + gw + 5, y - gh - 11);
  c.fillStyle = '#b8b1a1'; c.strokeStyle = a.ink(.8); c.lineWidth = .7;
  for (const sx of [gx - 3, gx + gw - 3]) { c.beginPath(); c.arc(sx + 3, y - 4, 4, 0, 7); c.fill(); c.stroke(); }     // 门墩
  c.fillRect(gx - 2, y, gw + 4, 3); c.strokeRect(gx - 2, y, gw + 4, 3);
  bicycle(a, x + w * .52, y + 2);
  return [gx + gw / 2, y - gh - 18];
}
export function bicycle(a, x, y, s = 1) {
  const c = a.ctx; c.strokeStyle = a.ink(.9); c.lineWidth = .8 * s;
  for (const cx of [x, x + 16 * s]) { c.beginPath(); c.arc(cx, y - 5 * s, 5 * s, 0, 7); c.stroke(); }
  c.beginPath(); c.moveTo(x, y - 5 * s); c.lineTo(x + 6 * s, y - 13 * s); c.lineTo(x + 13 * s, y - 13 * s); c.lineTo(x + 16 * s, y - 5 * s); c.moveTo(x + 6 * s, y - 13 * s); c.lineTo(x + 9 * s, y - 5 * s); c.lineTo(x, y - 5 * s);
  c.moveTo(x + 13 * s, y - 13 * s); c.lineTo(x + 12 * s, y - 17 * s); c.lineTo(x + 15 * s, y - 17 * s); c.moveTo(x + 4 * s, y - 15 * s); c.lineTo(x + 8 * s, y - 15 * s); c.stroke();
}
/** A brick workshop with a saw-tooth roof and one tall stack. */
export function factory(a, x, y, w = 130, h = 30) {
  const c = a.ctx, { ox, oy } = box(a, x, y, w, h, 26, { wall: '#b4ab97', side: '#978d79' });
  const teeth = 4, tw = w / teeth;
  for (let i = 0; i < teeth; i++) {
    const tx = x + i * tw;
    c.fillStyle = a.ink(.7); poly(c, [[tx, y - h], [tx + tw, y - h], [tx + tw, y - h - 14]]); c.fill();
    c.fillStyle = 'rgba(214,206,186,.9)'; poly(c, [[tx + tw, y - h], [tx + tw + ox * .4, y - h + oy * .4], [tx + tw + ox * .4, y - h - 14 + oy * .4], [tx + tw, y - h - 14]]); c.fill();
    c.strokeStyle = a.ink(.85); c.lineWidth = .7; poly(c, [[tx, y - h], [tx + tw, y - h], [tx + tw, y - h - 14]]); c.stroke();
  }
  for (let i = 0; i < 5; i++) {                                      // tall many-paned windows
    const wx = x + 8 + i * (w - 16) / 5, ww = (w - 16) / 5 - 6;
    c.fillStyle = a.ink(.55); c.fillRect(wx, y - h * .82, ww, h * .5);
    c.strokeStyle = 'rgba(205,196,174,.55)'; c.lineWidth = .5; line(c, wx + ww / 2, y - h * .82, wx + ww / 2, y - h * .32); line(c, wx, y - h * .57, wx + ww, y - h * .57);
  }
  c.fillStyle = a.ink(.8); c.fillRect(x + w * .44, y - h * .22 - 6, 12, h * .22 + 6);
  const sx = x + w + 18, sh = 96;                                    // the stack
  c.fillStyle = '#aba28e'; poly(c, [[sx - 5, y], [sx + 5, y], [sx + 3, y - sh], [sx - 3, y - sh]]); c.fill(); c.strokeStyle = a.ink(.85); c.lineWidth = .8; c.stroke();
  c.strokeStyle = a.ink(.5); c.lineWidth = .6; for (let b = 1; b < 6; b++) line(c, sx - 5 + b * .33, y - b * sh / 6, sx + 5 - b * .33, y - b * sh / 6);
  for (let i = 0; i < 26; i++) {                                     // smoke leaning with the wind
    const t = i / 26, px = sx + t * t * 150 + a.rr(-6, 6), py = y - sh - 8 - t * 46 + a.rr(-6, 6), r = 6 + t * 26;
    const g = c.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, a.ink(.16 * (1 - t) + .03)); g.addColorStop(1, a.ink(0)); c.fillStyle = g; c.fillRect(px - r, py - r, 2 * r, 2 * r);
  }
  return [x + w / 2, y - h - 30];
}
/** A pen of rough stakes with a lean-to at one end. */
export function pigsty(a, x, y, w = 90) {
  const c = a.ctx;
  c.fillStyle = '#b9af97'; c.fillRect(x, y - 18, 30, 18); c.strokeStyle = a.ink(.8); c.lineWidth = .7; c.strokeRect(x, y - 18, 30, 18);
  c.fillStyle = a.ink(.75); poly(c, [[x - 5, y - 16], [x + 36, y - 24], [x + 36, y - 28], [x - 5, y - 20]]); c.fill();
  c.fillStyle = a.ink(.8); c.fillRect(x + 9, y - 11, 11, 11);
  c.strokeStyle = a.ink(.8); c.lineWidth = 1;
  for (let px = x + 34; px <= x + w; px += 6) line(c, px, y + a.rr(-1, 1), px + a.rr(-1, 1), y - a.rr(11, 15));
  c.lineWidth = .7; line(c, x + 30, y - 5, x + w, y - 5); line(c, x + 30, y - 10, x + w, y - 10);
}

/* ---------- 江湖 town and night ---------- */
/** A wine house that carries a name: two storeys, a balcony, a hanging signboard. */
export function namedHouse(a, x, y, w, name, { flag = '酒', lit = false } = {}) {
  const c = a.ctx;
  const r = a.propAt('winehouse', x + w / 2, y + 2, 140, () => null);
  if (r.used) {                                                       // the painting's own signboard is left blank for the name
    const n = [...name].length, sx = r.x + 127 * r.k - 6, sy = r.y + 232 * r.k, sh = n * 12 + 6;
    c.fillStyle = '#ddd4bd'; c.fillRect(sx, sy, 12, sh); c.strokeStyle = a.ink(.85); c.lineWidth = .8; c.strokeRect(sx, sy, 12, sh);
    c.fillStyle = a.ink(.95); c.font = "10.5px 'Ma Shan Zheng', 'Noto Serif SC', serif"; c.textAlign = 'center';
    [...name].forEach((ch, i) => c.fillText(ch, sx + 6, sy + 13 + i * 12));
    return [x + w / 2, r.top - 10];
  }
  a.house(x, y, w, 24, 30, { shop: true, storeys: 2, flag, lit });
  c.strokeStyle = a.ink(.9); c.lineWidth = .8; line(c, x - 3, y - 24 - 9, x + w + 3, y - 24 - 9);        // balcony rail
  for (let bx = x - 3; bx <= x + w + 3; bx += 4) line(c, bx, y - 24 - 9, bx, y - 24 - 2);
  const sx = x - 15, sy = y - 62, n = [...name].length, sh = n * 13 + 6;                                 // 招牌
  c.lineWidth = 1.1; line(c, sx + 6, sy - 5, x + 2, sy - 5); line(c, sx + 6, sy - 5, sx + 6, sy);
  c.fillStyle = '#d9cfb8'; c.fillRect(sx, sy, 12, sh); c.strokeStyle = a.ink(.85); c.lineWidth = .8; c.strokeRect(sx, sy, 12, sh);
  c.fillStyle = a.ink(.95); c.font = "11px 'Ma Shan Zheng', 'Noto Serif SC', serif"; c.textAlign = 'center';
  [...name].forEach((ch, i) => c.fillText(ch, sx + 6, sy + 13 + i * 13));
  for (let i = 0; i < 3; i++) { const lx = x + w * (.2 + i * .3), ly = y - 24 + 4; c.fillStyle = lit ? 'rgba(240,214,150,.95)' : '#cfc4aa'; c.strokeStyle = a.ink(.8); c.lineWidth = .6; c.beginPath(); c.ellipse(lx, ly, 2.4, 3.2, 0, 0, 7); c.fill(); c.stroke(); }
  return [x + w / 2, y - 24 * 2 - 30];
}
/** 画舫: a pleasure boat with a lit cabin, for dark water. */
export function huafang(a, x, y, w = 110) {
  const c = a.ctx;
  a.glow(x + w * .5, y - 16, 70, .4);
  c.fillStyle = 'rgba(6,5,4,.96)'; c.beginPath(); c.moveTo(x, y - 10); c.quadraticCurveTo(x + w * .5, y + 8, x + w, y - 14); c.lineTo(x + w - 10, y - 4); c.quadraticCurveTo(x + w * .5, y + 4, x + 8, y - 3); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(236,228,208,.5)'; c.lineWidth = .8; c.beginPath(); c.moveTo(x, y - 10); c.quadraticCurveTo(x + w * .5, y + 8, x + w, y - 14); c.stroke();
  const cx = x + w * .3, cw = w * .42;
  c.fillStyle = 'rgba(14,12,10,.96)'; c.fillRect(cx, y - 24, cw, 22);
  c.fillStyle = 'rgba(240,214,150,.92)'; for (let i = 0; i < 4; i++) c.fillRect(cx + 3 + i * (cw - 4) / 4, y - 20, (cw - 4) / 4 - 3, 11);
  c.fillStyle = 'rgba(6,5,4,.96)'; c.beginPath(); c.moveTo(cx - 8, y - 23); c.quadraticCurveTo(cx + cw / 2, y - 27, cx + cw + 8, y - 23); c.lineTo(cx + cw + 2, y - 31); c.lineTo(cx - 2, y - 31); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(236,228,208,.45)'; c.lineWidth = .7; c.beginPath(); c.moveTo(cx - 8, y - 23); c.quadraticCurveTo(cx + cw / 2, y - 27, cx + cw + 8, y - 23); c.stroke();
  c.strokeStyle = 'rgba(236,228,208,.55)'; c.lineWidth = 1; line(c, x + w * .82, y - 8, x + w * .82, y - 70);
  c.fillStyle = 'rgba(214,206,186,.5)'; poly(c, [[x + w * .82, y - 68], [x + w * .82, y - 26], [x + w * .6, y - 30]]); c.fill();
  c.fillStyle = 'rgba(240,214,150,.95)'; c.beginPath(); c.arc(x + w * .16, y - 20, 2.2, 0, 7); c.fill(); c.strokeStyle = 'rgba(236,228,208,.5)'; c.lineWidth = .6; line(c, x + w * .16, y - 10, x + w * .16, y - 20);
  c.strokeStyle = 'rgba(240,214,150,.22)'; c.lineWidth = .8; for (let i = 0; i < 6; i++) line(c, x + w * .3 + a.rr(-8, 8), y + 8 + i * 5, x + w * .72 + a.rr(-8, 8), y + 8 + i * 5);
}
