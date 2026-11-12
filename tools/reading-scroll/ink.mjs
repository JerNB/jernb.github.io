// Ink-painting primitives for the reading scroll (ported from the approved
// 江湖 mockup). Painters call these in region-local coordinates: render.mjs
// translates the context to each region's rect before painting.

export const KRAFT = '#b3a994';
export const INK = [30, 27, 23];
export const GLOW = '#e6dcc4';
export const PAPER_RGB = [184, 175, 155];   // mean paper tone, used for mist
const OCC_RGB = [182, 173, 153];            // paper occlusion behind ridges

/**
 * `fg`, when given, is a separate sheet that day paintings are drawn onto (in the same coordinates),
 * so the code-drawn scene underneath can be pushed back into the distance without touching them.
 */
export function makeInk(ctx, seed = 20261108, props = new Map(), fg = null) {
  /* ---------- seeded randomness & noise ---------- */
  let S = seed % 2147483647 || 1;
  const rng = () => { S = (S * 16807) % 2147483647; return (S - 1) / 2147483646; };
  const rr = (a, b) => a + (b - a) * rng();
  const P = Array.from({ length: 512 }, rng);
  const G = Array.from({ length: 4096 }, rng);
  const sm = t => t * t * (3 - 2 * t);
  const n1 = x => { const i = Math.floor(x), f = x - i; return P[i & 511] * (1 - sm(f)) + P[(i + 1) & 511] * sm(f); };
  const fbm = (x, o = 4) => { let v = 0, a = .5, f = 1; for (let k = 0; k < o; k++) { v += a * n1(x * f + k * 37.1); a *= .5; f *= 2.07; } return v; };
  const h2 = (i, j) => G[((i * 73856093) ^ (j * 19349663)) & 4095];
  const n2 = (x, y) => {
    const i = Math.floor(x), j = Math.floor(y), fx = sm(x - i), fy = sm(y - j);
    return (h2(i, j) * (1 - fx) + h2(i + 1, j) * fx) * (1 - fy) + (h2(i, j + 1) * (1 - fx) + h2(i + 1, j + 1) * fx) * fy;
  };
  const fbm2 = (x, y, o = 4) => { let v = 0, a = .5, f = 1; for (let k = 0; k < o; k++) { v += a * n2(x * f + k * 5.3, y * f + k * 9.1); a *= .5; f *= 2.03; } return v; };
  const ink = a => `rgba(${INK[0]},${INK[1]},${INK[2]},${a})`;
  const paperA = a => `rgba(${PAPER_RGB[0]},${PAPER_RGB[1]},${PAPER_RGB[2]},${a})`;

  /** Low-res noise field upscaled smoothly: cloud-like ink without banding. */
  function field(x0, y0, w, h, scale, fn) {
    const c = document.createElement('canvas');
    const cw = Math.max(1, Math.ceil(w / scale)), ch = Math.max(1, Math.ceil(h / scale));
    c.width = cw; c.height = ch;
    const g = c.getContext('2d'), im = g.createImageData(cw, ch);
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
      const [r, gg, b, a] = fn(x0 + i * scale, y0 + j * scale), k = (j * cw + i) * 4;
      im.data[k] = r; im.data[k + 1] = gg; im.data[k + 2] = b; im.data[k + 3] = a;
    }
    g.putImageData(im, 0, 0);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(c, x0, y0, w, h);
  }

  const fadeStrip = (() => {
    const c = document.createElement('canvas'); c.width = 1; c.height = 256;
    const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, ink(1)); gr.addColorStop(.18, ink(.62)); gr.addColorStop(.5, ink(.22)); gr.addColorStop(1, ink(0));
    g.fillStyle = gr; g.fillRect(0, 0, 1, 256); return c;
  })();

  /* ---------- paper ---------- */
  function paper(x, y, w, h) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#bcb29d'); g.addColorStop(1, '#aca28c');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    field(x, y, w, h, 6, (px, py) => { const v = fbm2(px * .006, py * .006); return v > .5 ? [250, 244, 228, (v - .5) * 70] : [60, 50, 35, (.5 - v) * 55]; });
    for (let i = 0; i < w * h / 32; i++) {
      const px = x + rr(0, w), py = y + rr(0, h), l = rr(2, 9), a = rr(0, Math.PI);
      ctx.strokeStyle = rng() < .55 ? `rgba(240,232,212,${rr(.05, .16)})` : `rgba(70,58,40,${rr(.04, .12)})`;
      ctx.lineWidth = rr(.3, .8); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); ctx.stroke();
    }
  }

  /* ---------- mountains: ridge + 晕染 wash + 皴 strokes ---------- */
  function mountain({ x0, x1, base, amp, freq = .008, seed: s = 1, tone = 1, peaks = [], depth = 150, cun = 1, edge = 1, occlude = true }) {
    const top = [];
    for (let x = x0; x <= x1; x += 2) {
      const t = (x - x0) / (x1 - x0), env = Math.pow(Math.sin(Math.PI * t), .7);
      let h = amp * env * (.35 + .9 * fbm(x * freq + s)) + amp * .08 * (fbm(x * freq * 9 + s * 3, 3) - .5);
      for (const p of peaks) { const u = Math.abs(x - p.x) / p.w; if (u < 1) h += p.h * Math.pow(1 - u, 1.6) * (.85 + .3 * fbm(x * .08 + s, 3)); }
      top.push([x, base - h]);
    }
    if (occlude) {
      const occ = ctx.createLinearGradient(0, base - amp * 1.6 - Math.max(0, ...peaks.map(p => p.h)), 0, base + 30);
      occ.addColorStop(0, `rgba(${OCC_RGB},1)`); occ.addColorStop(.75, `rgba(${OCC_RGB},.96)`); occ.addColorStop(1, `rgba(${OCC_RGB},0)`);
      ctx.fillStyle = occ; ctx.beginPath(); ctx.moveTo(x0, base + 30); top.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(x1, base + 30); ctx.closePath(); ctx.fill();
    }
    for (const [x, y] of top) {
      const taper = Math.min(1, (x - x0) / 120, (x1 - x) / 120);
      ctx.globalAlpha = Math.max(0, Math.min(1, tone * (.6 + .8 * fbm2(x * .006, s, 3)) * .78 * taper));
      ctx.drawImage(fadeStrip, x - 1, y - 1, 4, depth * (.75 + .5 * fbm(x * .0035 + s, 2)));
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < (x1 - x0) * .35 * cun; i++) {
      const idx = Math.floor(rr(1, top.length - 1)), [x, y] = top[idx];
      const slope = (top[idx + 1][1] - top[idx - 1][1]) / 4, d = rr(4, depth * .7);
      const px = x + rr(-6, 6), py = y + d * Math.pow(rng(), 1.3);
      const ang = Math.atan(slope) + rr(-.25, .25) + Math.PI / 2 * .15, l = rr(4, 14) * (1 - d / depth + .3);
      ctx.strokeStyle = ink(Math.min(1, tone) * rr(.12, .35) * (1 - d / depth)); ctx.lineWidth = rr(.4, 1.2);
      ctx.beginPath(); ctx.moveTo(px, py); ctx.quadraticCurveTo(px + l * .5, py + rr(-2, 2) + l * .3 * Math.sin(ang), px + l * Math.cos(ang), py + l * Math.sin(ang)); ctx.stroke();
    }
    if (edge) for (let i = 1; i < top.length; i++) {
      const [xa, ya] = top[i - 1], [xb, yb] = top[i];
      ctx.strokeStyle = ink(Math.min(1, tone * 1.1)); ctx.lineWidth = edge * (.5 + 1.4 * n1(xa * .03 + s));
      ctx.beginPath(); ctx.moveTo(xa, ya); ctx.lineTo(xb, yb); ctx.stroke();
    }
    return top;
  }

  function mist(x, y, w, h, a = .9) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, paperA(0)); g.addColorStop(.5, paperA(a)); g.addColorStop(1, paperA(0));
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  }
  function hmist(x, y, w, h, a = .85) {
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, paperA(0)); g.addColorStop(.5, paperA(a)); g.addColorStop(1, paperA(0));
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  }

  /* ---------- 界画 buildings: oblique parallel projection ---------- */
  const OB = { dx: .62, dy: -.42 };
  function house(x, y, w, h, d, { shop = false, flag = null, lit = false, storeys = 1, wall = '#c3b9a3' } = {}) {
    const ox = d * OB.dx, oy = d * OB.dy;
    ctx.lineJoin = 'round';
    for (let s = 0; s < storeys; s++) {
      const yy = y - s * h;
      ctx.fillStyle = '#a69b84'; ctx.beginPath(); ctx.moveTo(x + w, yy); ctx.lineTo(x + w + ox, yy + oy); ctx.lineTo(x + w + ox, yy - h + oy); ctx.lineTo(x + w, yy - h); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = ink(.85); ctx.lineWidth = .7; ctx.stroke();
      ctx.fillStyle = lit ? '#cdbf98' : wall; ctx.fillRect(x, yy - h, w, h); ctx.strokeRect(x, yy - h, w, h);
      const bays = Math.max(2, Math.round(w / 14));
      for (let b = 1; b < bays; b++) { ctx.beginPath(); ctx.moveTo(x + b * w / bays, yy); ctx.lineTo(x + b * w / bays, yy - h); ctx.stroke(); }
      if (s === 0) {
        if (shop) {
          ctx.fillStyle = lit ? 'rgba(120,80,30,.55)' : ink(.55); ctx.fillRect(x + w / bays * .6, yy - h * .72, w - w / bays * 1.2, h * .72);
          ctx.fillStyle = ink(.5); ctx.beginPath(); ctx.moveTo(x - 3, yy - h * .78); ctx.lineTo(x + w + 3, yy - h * .78); ctx.lineTo(x + w - 2, yy - h * .9); ctx.lineTo(x + 2, yy - h * .9); ctx.closePath(); ctx.fill();
        } else { ctx.fillStyle = ink(.6); ctx.fillRect(x + w / 2 - 3, yy - h * .6, 6, h * .6); }
      } else for (let b = 0; b < bays; b++) { ctx.fillStyle = lit ? 'rgba(236,210,150,.85)' : ink(.35); ctx.fillRect(x + b * w / bays + 2, yy - h * .7, w / bays - 4, h * .35); }
      const eave = 6, rh = h * .62, fx0 = x - eave, fx1 = x + w + eave, fy = yy - h;
      ctx.fillStyle = ink(.82);
      ctx.beginPath(); ctx.moveTo(fx0 - 2, fy - 3); ctx.quadraticCurveTo(x + w / 2, fy + 2, fx1 + 2, fy - 3);
      ctx.lineTo(fx1 + ox * .55, fy - rh + oy * .55); ctx.lineTo(fx0 + ox * .55, fy - rh + oy * .55); ctx.closePath(); ctx.fill();
      ctx.fillStyle = ink(.6); ctx.beginPath(); ctx.moveTo(fx0 + ox * .55, fy - rh + oy * .55); ctx.lineTo(fx1 + ox * .55, fy - rh + oy * .55);
      ctx.lineTo(fx1 + ox, fy + oy - rh * .4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(196,187,167,.35)'; ctx.lineWidth = .5;
      for (let t = fx0 + 3; t < fx1; t += 3.2) { ctx.beginPath(); ctx.moveTo(t, fy - 1); ctx.lineTo(t + ox * .55, fy - rh + oy * .55 + 1); ctx.stroke(); }
      ctx.strokeStyle = ink(1); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(fx0 + ox * .55 - 3, fy - rh + oy * .55); ctx.lineTo(fx1 + ox * .55 + 3, fy - rh + oy * .55); ctx.stroke();
    }
    if (flag) {
      const px = x + w + ox + 6, py = y - h * storeys - 6;
      ctx.strokeStyle = ink(.9); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px, y + oy); ctx.lineTo(px, py - 34); ctx.stroke();
      ctx.fillStyle = '#d9cfb8'; ctx.beginPath(); ctx.moveTo(px, py - 32); ctx.lineTo(px + 15, py - 31); ctx.lineTo(px + 14, py - 6); ctx.lineTo(px + 7, py - 2); ctx.lineTo(px, py - 6); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = ink(.7); ctx.lineWidth = .6; ctx.stroke();
      ctx.fillStyle = ink(.95); ctx.font = "13px 'Ma Shan Zheng', 'Noto Serif SC', serif"; ctx.textAlign = 'center'; ctx.fillText(flag, px + 7.5, py - 13);
    }
    if (lit) glow(x + w / 2, y - h * .4, 70, .45);
  }
  function glow(x, y, r, a = .5, rgb = '236,205,140') {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  }

  /* ---------- people, carts, trees, boats, bridges, walls ---------- */
  function person(x, y, s = 1, kind = 0, light = false) {
    const c = light ? 'rgba(236,228,208,.9)' : ink(.92); ctx.fillStyle = c; ctx.strokeStyle = c; ctx.lineWidth = .8 * s;
    const h = 11 * s;
    ctx.beginPath(); ctx.arc(x, y - h, 1.7 * s, 0, 7); ctx.fill();
    if (kind === 1) { ctx.beginPath(); ctx.ellipse(x, y - h - 1.4 * s, 4 * s, 1.1 * s, 0, 0, 7); ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(x - 1.5 * s, y - h + 2 * s); ctx.lineTo(x + 1.5 * s, y - h + 2 * s); ctx.lineTo(x + 2.6 * s, y); ctx.lineTo(x - 2.6 * s, y); ctx.closePath(); ctx.fill();
    if (kind === 2) {
      ctx.beginPath(); ctx.moveTo(x - 7 * s, y - h + 3 * s); ctx.lineTo(x + 7 * s, y - h + 2 * s); ctx.stroke();
      ctx.fillRect(x - 8 * s, y - h + 5 * s, 3 * s, 3 * s); ctx.fillRect(x + 5.5 * s, y - h + 4.5 * s, 3 * s, 3 * s);
    }
    if (kind === 3) { ctx.beginPath(); ctx.moveTo(x + 2 * s, y - h + 3 * s); ctx.lineTo(x + 6 * s, y - 1 * s); ctx.stroke(); }
    if (kind === 4) { ctx.beginPath(); ctx.arc(x, y - h - 1 * s, 5 * s, Math.PI, 0); ctx.fill(); ctx.beginPath(); ctx.moveTo(x, y - h - 1 * s); ctx.lineTo(x, y - h + 4 * s); ctx.stroke(); }
  }
  function cart(x, y) {
    ctx.strokeStyle = ink(.85); ctx.fillStyle = ink(.75); ctx.lineWidth = .9;
    ctx.fillRect(x, y - 9, 18, 6); ctx.beginPath(); ctx.arc(x + 5, y - 2, 3.2, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 18, y - 6); ctx.lineTo(x + 28, y - 4); ctx.stroke();
    ox(x + 33, y);
  }
  function ox(x, y, s = 1) {
    ctx.fillStyle = ink(.8);
    ctx.beginPath(); ctx.ellipse(x, y - 7 * s, 6 * s, 3.5 * s, 0, 0, 7); ctx.fill();
    ctx.fillRect(x - 4 * s, y - 4 * s, 1.2 * s, 4 * s); ctx.fillRect(x + 3 * s, y - 4 * s, 1.2 * s, 4 * s);
    ctx.beginPath(); ctx.arc(x + 7 * s, y - 8 * s, 2 * s, 0, 7); ctx.fill();
    ctx.strokeStyle = ink(.8); ctx.lineWidth = .7 * s; ctx.beginPath(); ctx.moveTo(x + 7 * s, y - 10 * s); ctx.lineTo(x + 9 * s, y - 12 * s); ctx.stroke();
  }
  function willow(x, y, h = 60, a = .8) {
    ctx.strokeStyle = ink(a); ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - 4, y - h * .5, x + 3, y - h); ctx.stroke();
    for (let i = 0; i < 46; i++) {
      const bx = x + rr(-h * .35, h * .4), by = y - h + rr(-8, h * .25), l = rr(h * .3, h * .75);
      ctx.lineWidth = rr(.3, .8); ctx.strokeStyle = ink(a * rr(.3, .7));
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + rr(-4, 4), by + l * .5, bx + rr(-3, 3), by + l); ctx.stroke();
    }
  }
  function pine(x, y, h = 50, a = .9) {
    ctx.strokeStyle = ink(a); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 6, y - h * .6, x - 2, y - h); ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const yy = y - h * (.35 + i * .14), w = rr(10, 18) * (1 - i * .12); ctx.fillStyle = ink(a * .75);
      ctx.beginPath(); ctx.ellipse(x + rr(-4, 6), yy, w, 3.2, rr(-.15, .15), 0, 7); ctx.fill();
    }
  }
  function boat(x, y, w = 46, onDark = false, lamp = false) {
    const c = onDark ? 'rgba(8,7,6,.95)' : ink(.88); ctx.fillStyle = c; ctx.strokeStyle = c;
    if (lamp) glow(x + w * .5, y - 10, 34, .6);
    ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.quadraticCurveTo(x + w / 2, y + 4, x + w, y - 8); ctx.lineTo(x + w - 6, y - 4); ctx.quadraticCurveTo(x + w / 2, y + 1, x + 5, y - 3); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = .75; ctx.beginPath(); ctx.moveTo(x + w * .3, y - 4); ctx.quadraticCurveTo(x + w * .5, y - 16, x + w * .72, y - 5); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(x + w * .85, y - 6); ctx.lineTo(x + w + 12, y + 6); ctx.stroke();
    if (onDark) { ctx.strokeStyle = 'rgba(236,228,208,.5)'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.quadraticCurveTo(x + w / 2, y + 4, x + w, y - 8); ctx.stroke(); }
    if (lamp) { ctx.fillStyle = 'rgba(240,214,150,.95)'; ctx.beginPath(); ctx.arc(x + w * .5, y - 10, 2, 0, 7); ctx.fill(); }
    ctx.strokeStyle = onDark ? 'rgba(236,228,208,.25)' : ink(.25); ctx.lineWidth = .6;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x - 8 - i * 6, y + 3 + i * 3); ctx.lineTo(x + w + 8 + i * 6, y + 3 + i * 3); ctx.stroke(); }
  }
  /** Arch bridge whose deck lands at (x0,y0) and (x1,y1). */
  function bridge(x0, y0, x1, y1, rise = 46) {
    const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - rise * 2;
    const q = (t, a, b, c) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
    for (let k = 0; k < 5; k++) { ctx.strokeStyle = ink(.9); ctx.lineWidth = 2.4 - k * .3; ctx.beginPath(); ctx.moveTo(x0 + 18 + k * 2, y0 + 6 + k * 3); ctx.quadraticCurveTo(mx, my + 10 + k * 5, x1 - 18 - k * 2, y1 + 6 + k * 3); ctx.stroke(); }
    ctx.strokeStyle = ink(.95); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, x1, y1); ctx.stroke();
    for (let t = 0; t <= 1.0001; t += .06) { const bx = q(t, x0, mx, x1), by = q(t, y0, my, y1); ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by - 7); ctx.stroke(); }
    ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(x0, y0 - 7); ctx.quadraticCurveTo(mx, my - 7, x1, y1 - 7); ctx.stroke();
    for (let t = .14; t < .88; t += rr(.07, .14)) person(q(t, x0, mx, x1), q(t, y0, my, y1) - 1, .85, Math.floor(rr(0, 5)));
  }
  function cityWall(x, y, w, h) {
    ctx.fillStyle = '#b0a58e'; ctx.fillRect(x, y - h, w, h); ctx.strokeStyle = ink(.85); ctx.lineWidth = .8; ctx.strokeRect(x, y - h, w, h);
    for (let i = 0; i < w; i += 7) { ctx.fillStyle = ink(.85); ctx.fillRect(x + i, y - h - 4, 4, 4); }
    for (let r = 1; r < 5; r++) { ctx.strokeStyle = ink(.18); ctx.beginPath(); ctx.moveTo(x, y - h + r * h / 5); ctx.lineTo(x + w, y - h + r * h / 5); ctx.stroke(); }
    const gx = x + w / 2 - 9; ctx.fillStyle = ink(.85); ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y - 14); ctx.arc(gx + 9, y - 14, 9, Math.PI, 0); ctx.lineTo(gx + 18, y); ctx.fill();
    house(x + w / 2 - 24, y - h - 4, 48, 14, 18);
  }
  /** Water band: tinted wash plus brushed ripples between y0 and y1. */
  function water(x, y0, w, y1, { density = 1, dark = false, fadeIn = 0, fadeOut = 0 } = {}) {
    const rgb = dark ? '10,9,8' : '150,142,125', a = dark ? .25 : .22;
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, `rgba(${rgb},${fadeIn ? 0 : a})`); g.addColorStop(Math.min(.49, fadeIn / w), `rgba(${rgb},${a})`);
    g.addColorStop(Math.max(.51, 1 - fadeOut / w), `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},${fadeOut ? 0 : a})`);
    ctx.fillStyle = g; ctx.fillRect(x, y0, w, y1 - y0);
    for (let i = 0; i < w * (y1 - y0) / 140 * density; i++) {
      const px = x + rr(0, w), py = rr(y0 + 4, y1 - 4), l = rr(8, 26);
      if (fadeIn && px - x < fadeIn && rng() > (px - x) / fadeIn) continue;
      if (fadeOut && x + w - px < fadeOut && rng() > (x + w - px) / fadeOut) continue;
      ctx.strokeStyle = dark ? `rgba(236,228,208,${rr(.04, .14)})` : ink(rr(.08, .22)); ctx.lineWidth = rr(.4, .8);
      ctx.beginPath(); ctx.moveTo(px, py); ctx.quadraticCurveTo(px + l / 2, py - 1.5, px + l, py); ctx.stroke();
    }
  }
  /** Dark ink-wash night sky over a rect (alpha 0..1 ramp from `fadeIn` px). */
  function night(x, y, w, h, { fadeIn = 0, fadeOut = 0, strength = .86 } = {}) {
    field(x, y, w, h, 4, (px, py) => {
      const lx = px - x;
      let k = 1;
      if (fadeIn) k = Math.min(k, sm(Math.min(1, Math.max(0, lx / fadeIn))));
      if (fadeOut) k = Math.min(k, sm(Math.min(1, Math.max(0, (w - lx) / fadeOut))));
      const n = .7 + .6 * fbm2(px * .004, py * .009);
      return [INK[0], INK[1], INK[2], 255 * Math.min(.95, strength * k * n * (.8 + .2 * (1 - (py - y) / h)))];
    });
  }
  function moon(x, y, r = 34, name = 'moon-night') {             // a painted moon when there is one: its disc is ~30% of the canvas
    const p = props.get(name);
    if (p) { const s = r * 2 / .3; paint(p, x - s / 2, y - s / 2, s, s); return; }
    glow(x, y, r * 4, .22, '236,228,208');
    ctx.fillStyle = '#e6dcc4'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
  /** Vertical brush-ish inscription drawn into the painting (e.g. 乡土中国). */
  function inscription(text, x, y, size = 16, alpha = .45) {
    ctx.fillStyle = ink(alpha); ctx.font = `${size}px 'Noto Serif SC', serif`; ctx.textAlign = 'center';
    [...text].forEach((ch, i) => ctx.fillText(ch, x, y + i * size * 1.25));
  }
  /** AI-painted prop if supplied in images/reading/props/, else the procedural stand-in. */
  function prop(name, x, y, w, h, fallback) {
    const p = props.get(name);
    if (!p) return fallback();
    paint(p, x, y, w, h);
  }
  function paint(p, x, y, w, h, back = false) {                       // night paintings need the dark under them; day ones go on top
    const c = !p.night && fg && !back ? fg : ctx;
    c.save(); if (c !== ctx) c.setTransform(ctx.getTransform());
    c.globalCompositeOperation = p.night ? 'screen' : 'source-over';
    c.drawImage(p.img, x, y, w, h); c.restore();
  }
  /**
   * Stand a painting on the ground: drawn `w` wide (its whole canvas, margins included), with the
   * bottom centre of its subject at (cx, gy). Returns the subject's box on the scroll, or the
   * fallback's result (`used: false`) when the painting is not there.
   */
  function propAt(name, cx, gy, w, fallback) {
    const p = props.get(name);
    if (!p) return { used: false, out: fallback() };
    const h = w * p.img.height / p.img.width, b = p.box;
    const x = cx - w * (b.x0 + b.x1) / 2, y = gy - h * b.y1;
    paint(p, x, y, w, h);
    return { used: true, x, y, k: w / p.img.width, left: x + w * b.x0, right: x + w * b.x1, top: y + h * b.y0, bottom: gy };
  }

  /**
   * Lay a painted band (far hills, cloud sea) behind the region from x0 to x1: copies of its subject
   * side by side, each `h` tall with the subject's foot on `gy`, behind everything the painter draws
   * next. Copies step by most of the subject's width, so their faded ends overlap into one range.
   */
  function band(name, x0, x1, gy, h, { step = .82, jitter = 10 } = {}) {
    const p = props.get(name); if (!p) return false;
    const w = h * p.img.width / p.img.height, b = p.box, sw = w * (b.x1 - b.x0);
    for (let cx = x0; cx < x1 + sw * .5; cx += sw * step) {               // noise, not rng: the rest of the painting stays as it was
      const y = gy + jitter * (2 * fbm(cx * .013 + gy) - 1) - h * b.y1;
      paint(p, cx - w * (b.x0 + b.x1) / 2, y, w, h, true);
    }
    return true;
  }
  /** A foreground painting standing on the scroll's lower edge (only its bottom edge may be inked). */
  function foreground(name, cx, bottom, h) {
    const p = props.get(name); if (!p) return false;
    const w = h * p.img.width / p.img.height;
    paint(p, cx - w / 2, bottom - h, w, h);
    return true;
  }

  return { ctx, rng, rr, n1, fbm, fbm2, sm, ink, field, paper, mountain, mist, hmist, house, glow, person, cart, ox, willow, pine,
    boat, bridge, cityWall, water, night, moon, inscription, prop, propAt, paint, band, foreground, has: name => props.has(name) };
}

/** Default road: enters at the leading edge and leaves at the trailing edge at the shared height,
 * so regions chain. `bend(t)` (0..1 → px) adds a region-specific detour that is 0 at both ends. */
export const ROAD_Y = 470, ROAD_X = 200;
export function road(w, h, orient, bend = () => 0) {
  const pts = [];
  const n = Math.max(2, Math.round((orient === 'portrait' ? h : w) / 20));
  for (let i = 0; i <= n; i++) {
    const t = i / n, env = Math.sin(Math.PI * t);
    pts.push(orient === 'portrait' ? [ROAD_X + bend(t) * env, t * h] : [t * w, ROAD_Y + bend(t) * env]);
  }
  return pts;
}
/**
 * Landscape road that leaves the shore and runs on the water at height `y` between x0 and x1,
 * easing on and off over `ramp` px; the traveler takes a boat there (the painter reports [x0, x1]
 * as `water`). Pass x0 <= 0 or x1 >= w to stay afloat across the region's edge.
 */
export function sail(pts, x0, x1, y, ramp = 70) {
  return pts.map(([x, py]) => {
    const k = Math.min(1, Math.max(0, Math.min((x - (x0 - ramp)) / ramp, (x1 + ramp - x) / ramp)));
    return [x, py + (y - py) * k * k * (3 - 2 * k)];
  });
}
/** Evenly spread anchors along a road for `keys`, lifted `lift` px above it. */
export function spread(roadPts, keys, orient, lift = 120) {
  const out = {};
  keys.forEach((k, i) => {
    const p = roadPts[Math.round((i + 1) / (keys.length + 1) * (roadPts.length - 1))];
    out[k] = orient === 'portrait' ? [p[0] + (i % 2 ? 90 : -120), p[1]] : [p[0], p[1] - lift - (i % 2) * 70];
  });
  return out;
}

/** Landmark positions for both orientations: landscape uses [fx, groundY]; portrait stacks them. */
export function marksAt(w, h, orient, marks) {
  const names = Object.keys(marks);
  return names.map((name, i) => {
    const [kind, fx, gy] = marks[name];
    return orient === 'portrait'
      ? { name, kind, x: i % 2 ? 270 : 130, y: h / (names.length + 1) * (i + 1) + 70, i }
      : { name, kind, x: fx * w, y: gy, i };
  });
}
