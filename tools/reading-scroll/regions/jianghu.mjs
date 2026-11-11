// 江湖: 金庸's mountains and rivers → a 清明上河图-style market town → 古龙's night.
import { namedHouse, huafang, plum } from '../buildings.mjs';
import { road, ROAD_Y, ROAD_X, spread } from '../ink.mjs';

const tone = region => .75 + .5 * region.density;
const byPlace = places => Object.fromEntries(places.map(p => [p.place, p.key]));

/* ---------- landmark drawers (shared by both orientations) ---------- */
function huashan(a, x, base, t) {
  a.mountain({ x0: x - 140, x1: x + 150, base, amp: 60, seed: 11, tone: t, depth: 170,
    peaks: [{ x: x - 10, h: 200, w: 40 }, { x: x + 34, h: 130, w: 28 }], cun: 1.4, edge: 1.3 });
  for (let i = 0; i < 6; i++) a.pine(x + a.rr(-70, 90), base - a.rr(0, 30), a.rr(18, 30), .8);
  return [x - 10, base - 200];
}
function snowPeak(a, x, base, t) { // 天山 / 玉笔峰: pale, highlighted
  const top = a.mountain({ x0: x - 220, x1: x + 220, base, amp: 60, seed: 17, tone: t * .55, depth: 110,
    peaks: [{ x, h: 140, w: 70 }], cun: .6, edge: .9 });
  a.ctx.strokeStyle = 'rgba(236,228,208,.75)'; a.ctx.lineWidth = 2;
  a.ctx.beginPath(); top.filter(([px]) => Math.abs(px - x) < 40).forEach(([px, py], i) => i ? a.ctx.lineTo(px, py + 4) : a.ctx.moveTo(px, py + 4)); a.ctx.stroke();
  return [x, base - 150];
}
function sharpPeak(a, x, base, t) {
  a.mountain({ x0: x - 170, x1: x + 170, base, amp: 55, seed: 23, tone: t, depth: 120, peaks: [{ x, h: 130, w: 30 }, { x: x + 46, h: 70, w: 26 }], cun: 1.6, edge: 1.4 });
  return [x, base - 130];
}
function pass(a, x, y) { // 雁门关: a wall across a saddle
  a.cityWall(x - 60, y, 120, 26);
  return [x, y - 52];
}
function city(a, x, y, w = 180) { a.cityWall(x - w / 2, y, w, 34); for (let i = 0; i < 8; i++) a.person(x + a.rr(-w / 2 - 30, w / 2 + 30), y + a.rr(8, 18), .8, Math.floor(a.rr(0, 5))); return [x, y - 60]; }
function manor(a, x, y) { a.house(x - 40, y, 46, 22, 26, { storeys: 2 }); a.house(x + 14, y + 6, 40, 18, 22); a.ctx.strokeStyle = a.ink(.7); a.ctx.lineWidth = .8; a.ctx.strokeRect(x - 60, y - 6, 140, 10); return [x, y - 70]; }
function cave(a, x, y) { a.mountain({ x0: x - 80, x1: x + 80, base: y + 20, amp: 70, seed: 29, tone: 1, depth: 90, cun: 1.4, edge: 1.2 });
  a.ctx.fillStyle = a.ink(.95); a.ctx.beginPath(); a.ctx.ellipse(x, y, 12, 16, 0, Math.PI, 0); a.ctx.lineTo(x + 12, y + 8); a.ctx.lineTo(x - 12, y + 8); a.ctx.fill();
  a.ctx.strokeStyle = 'rgba(200,180,120,.6)'; a.ctx.lineWidth = .8; a.ctx.beginPath(); a.ctx.moveTo(x - 6, y + 2); a.ctx.quadraticCurveTo(x, y - 6, x + 5, y + 3); a.ctx.stroke(); // golden snake glint
  return [x, y - 40]; }
function island(a, x, y) { a.ctx.fillStyle = a.ink(.5); a.ctx.beginPath(); a.ctx.ellipse(x, y, 62, 11, 0, 0, 7); a.ctx.fill();
  a.mountain({ x0: x - 50, x1: x + 50, base: y, amp: 34, freq: .05, seed: 41, tone: .9, depth: 30, cun: 2, edge: 1, occlude: false });
  for (let i = 0; i < 40; i++) { a.ctx.fillStyle = `rgba(155,58,42,${a.rr(.25, .55)})`; a.ctx.beginPath(); a.ctx.arc(x + a.rr(-40, 40), y - a.rr(4, 26), a.rr(.8, 1.6), 0, 7); a.ctx.fill(); }
  return [x, y - 40]; }
function rockIsle(a, x, y) { a.ctx.fillStyle = a.ink(.65); a.ctx.beginPath(); a.ctx.ellipse(x, y, 40, 8, 0, 0, 7); a.ctx.fill();
  a.mountain({ x0: x - 34, x1: x + 34, base: y, amp: 50, freq: .06, seed: 47, tone: 1, depth: 40, cun: 2, edge: 1.2, occlude: false }); return [x, y - 54]; }
function dunes(a, x, y, w) { for (let k = 0; k < 4; k++) { a.ctx.strokeStyle = a.ink(.25 - k * .04); a.ctx.lineWidth = .8; a.ctx.beginPath();
  for (let px = x - w / 2; px < x + w / 2; px += 4) { const py = y + k * 9 + Math.sin(px * .03 + k) * 3; px === x - w / 2 ? a.ctx.moveTo(px, py) : a.ctx.lineTo(px, py); } a.ctx.stroke(); } return [x, y - 16]; }
function creek(a, x0, y0, x1, y1) { a.ctx.strokeStyle = 'rgba(150,142,125,.5)'; a.ctx.lineWidth = 10; a.ctx.lineCap = 'round';
  a.ctx.beginPath(); a.ctx.moveTo(x0, y0); a.ctx.bezierCurveTo((x0 + x1) / 2 + 30, y0 + 20, (x0 + x1) / 2 - 30, y1 - 20, x1, y1); a.ctx.stroke();
  a.ctx.strokeStyle = a.ink(.25); a.ctx.lineWidth = .7; a.ctx.stroke(); a.ctx.lineCap = 'butt';
  a.person(x1 - 10, y1 - 4, .9, 4); return [(x0 + x1) / 2, Math.min(y0, y1) - 20]; }
function convoy(a, x, y) { a.cart(x - 30, y); a.person(x - 40, y, .9, 3); a.person(x + 30, y, .9, 1); // 镖车 with a banner
  a.ctx.strokeStyle = a.ink(.9); a.ctx.lineWidth = 1; a.ctx.beginPath(); a.ctx.moveTo(x - 22, y - 9); a.ctx.lineTo(x - 22, y - 34); a.ctx.stroke();
  a.ctx.fillStyle = '#d9cfb8'; a.ctx.fillRect(x - 22, y - 34, 12, 10); return [x, y - 50]; }
function harbor(a, x, y) { for (let i = 0; i < 4; i++) a.house(x - 90 + i * 46, y - (i % 2) * 6, 38, 18, 20, { shop: i % 2 === 0 }); return [x, y - 60]; }

const SHANHE = { // place → [drawer, landscape x fraction, landscape ground y]
  若耶溪: ['creek', .05, 430], 华山: ['huashan', .14, 330], 金蛇洞: ['cave', .23, 400], 商家堡: ['manor', .31, 440],
  光明顶: ['far', .38, 0], 荆州城: ['city', .45, 420], 雁门关: ['pass', .52, 330], 天山: ['snow', .59, 250],
  镖路: ['convoy', .64, 466], 玉笔峰: ['sharp', .69, 330], 大漠: ['dunes', .76, 268], 襄阳城: ['city', .82, 400],
  扬州: ['harbor', .89, 460], 桃花岛: ['island', .95, 520], 侠客岛: ['rock', .985, 545],
};

export const shanhe = {
  paint(a, { w, h }, region, places, orient) {
    const t = tone(region), key = byPlace(places), anchors = {};
    const put = (name, pt) => { if (key[name]) anchors[key[name]] = pt; };
    if (orient === 'portrait') return shanhePortrait(a, w, h, t, put, anchors, places);

    // far range (光明顶 lives here) and mist
    const far = a.mountain({ x0: 0, x1: w, base: 250, amp: 120, freq: .004, seed: 3, tone: t * .45, depth: 120, cun: .4, edge: .6 });
    const gmx = SHANHE.光明顶[1] * w; put('光明顶', far.reduce((b, p) => Math.abs(p[0] - gmx) < Math.abs(b[0] - gmx) ? p : b));
    a.mist(0, 210, w, 80, .7);
    a.mountain({ x0: -40, x1: w * .62, base: 340, amp: 90, freq: .006, seed: 7, tone: t * .7, depth: 150, cun: .8 });
    a.mist(0, 300, w, 70, .6);
    // river begins in the last fifth and flows on into the market town
    a.water(w * .74, 480, w * .26, h, { density: .9, fadeIn: 160 });

    // draw landmarks back-to-front; a heavy midground range slots in between
    const order = Object.entries(SHANHE).filter(([, [k]]) => k !== 'far').sort((p, q) => p[1][2] - q[1][2]);
    let midDone = false;
    for (const [name, [kind, fx, gy]] of order) {
      if (!midDone && gy >= 400) {
        midDone = true;
        a.mountain({ x0: -40, x1: w * .58, base: 420, amp: 80, freq: .007, seed: 13, tone: t * .95, depth: 130, cun: 1.1, edge: 1.2 });
        a.mountain({ x0: w * .5, x1: w * .8, base: 410, amp: 60, freq: .008, seed: 19, tone: t * .8, depth: 110, cun: .9, edge: 1 });
        a.mist(0, 395, w * .8, 50, .45);
      }
      const x = fx * w;
      const pt = { huashan: () => huashan(a, x, gy, t), cave: () => cave(a, x, gy), manor: () => manor(a, x, gy), city: () => city(a, x, gy),
        pass: () => pass(a, x, gy), snow: () => snowPeak(a, x, gy, t), convoy: () => convoy(a, x, gy), sharp: () => sharpPeak(a, x, gy, t),
        dunes: () => dunes(a, x, gy, 220), harbor: () => harbor(a, x, gy), island: () => island(a, x, gy), rock: () => rockIsle(a, x, gy),
        creek: () => creek(a, x - 50, 380, x + 40, 470) }[kind]();
      put(name, pt);
    }
    // foreground ridges, darkest ink, below the road
    a.mountain({ x0: -60, x1: w * .42, base: 610, amp: 110, freq: .009, seed: 31, tone: t * 1.1, depth: 120, cun: 1.4, edge: 1.6 });
    a.mountain({ x0: w * .36, x1: w * .76, base: 620, amp: 90, freq: .011, seed: 37, tone: t, depth: 110, cun: 1.3, edge: 1.4 });
    const r = road(w, h, orient, tt => (tt > .78 ? -10 : 8) * Math.sin(tt * 9));
    for (const p of places) if (!anchors[p.key]) Object.assign(anchors, spread(r, [p.key], orient));
    return { road: r, anchors };
  },
};

function shanhePortrait(a, w, h, t, put, anchors, places) {
  const names = Object.keys(SHANHE);
  const step = h / (names.length + 1);
  names.forEach((name, i) => {
    const y = step * (i + 1) + 40, x = i % 2 ? 300 : 110;
    if (i % 3 === 0) { a.mountain({ x0: -20, x1: w + 20, base: y - 30, amp: 70, freq: .012, seed: 50 + i, tone: t * .45, depth: 90, cun: .4, edge: .5 }); a.mist(0, y - 60, w, 50, .6); }
    const kind = SHANHE[name][0];
    const pt = { huashan: () => huashan(a, x, y, t), cave: () => cave(a, x, y), manor: () => manor(a, x, y), city: () => city(a, x, y, 120),
      pass: () => pass(a, x, y), snow: () => snowPeak(a, x, y, t), convoy: () => convoy(a, ROAD_X, y), sharp: () => sharpPeak(a, x, y, t),
      dunes: () => dunes(a, x, y, 160), harbor: () => harbor(a, x, y), island: () => island(a, x, y), rock: () => rockIsle(a, x, y),
      far: () => snowPeak(a, x, y, t * .7), creek: () => creek(a, x - 40, y - 60, x + 30, y) }[kind]();
    put(name, pt);
  });
  a.water(0, h - 140, w, h, { density: .8 });
  const r = road(w, h, 'portrait', tt => 60 * Math.sin(tt * 14));
  for (const p of places) if (!anchors[p.key]) Object.assign(anchors, spread(r, [p.key], 'portrait'));
  return { road: r, anchors };
}

/* ---------- 市井: the river town ---------- */
export const shijing = {
  paint(a, { w, h }, region, places, orient) {
    if (orient === 'portrait') return shijingPortrait(a, w, h, places);
    a.mountain({ x0: -60, x1: w + 60, base: 250, amp: 70, freq: .009, seed: 61, tone: .35, depth: 90, cun: .3, edge: .5 });
    a.mist(0, 220, w, 60, .6);
    const bx0 = w * .52, bx1 = w * .68;          // bridge over a creek that crosses the street
    creekBand(a, bx0, bx1, h);
    const key = byPlace(places), anchors = {};
    const named = Object.entries(TOWN).map(([name, [f, flag]]) => ({ name, flag, x: f * w }));
    const rows = [[300, .5, .38], [326, .62, .5], [352, .75, .66], [382, .86, .8], [414, .93, .9], [452, 1, 1]];
    for (const [ry, sc, al] of rows) {
      a.ctx.save(); a.ctx.globalAlpha = al;
      let x = a.rr(-20, 10);
      while (x < w + 20) {
        { const f = (ry - 280) / 220, cl = bx0 - 80 + f * 70, cr = bx0 - 30 + f * (bx1 - bx0 + 30); if (x + 56 * sc > cl && x < cr + 10) { x = cr + 14; continue; } }   // keep the creek open
        if (sc > .85) { const hit = named.find(n => x + 60 * sc > n.x - 26 && x < n.x + 104); if (hit) { x = hit.x + 108; continue; } }   // room for the houses that carry a name
        const g = a.rng();
        if (g < .16) { a.ctx.save(); a.ctx.translate(x, ry); a.ctx.scale(sc, sc); a.willow(0, 0, a.rr(40, 60), .75); a.ctx.restore(); x += a.rr(18, 30) * sc; continue; }
        if (g < .24) { a.ctx.strokeStyle = a.ink(.7); a.ctx.lineWidth = .8; const ww = a.rr(40, 70) * sc; a.ctx.strokeRect(x, ry - 7 * sc, ww, 7 * sc); x += ww + 6; continue; }
        const bw = a.rr(28, 56);
        a.ctx.save(); a.ctx.translate(x, ry); a.ctx.scale(sc, sc);
        a.house(0, 0, bw, a.rr(15, 22), a.rr(16, 28), { shop: a.rng() < .5, storeys: a.rng() < .14 ? 2 : 1, flag: sc === 1 && a.rng() < .16 ? (a.rng() < .6 ? '酒' : '茶') : null });
        a.ctx.restore();
        if (sc > .7) for (let p = 0; p < 3; p++) a.person(x + a.rr(-6, bw * sc + 6), ry + a.rr(3, 12) * sc, .85 * sc, Math.floor(a.rr(0, 5)));
        x += (bw + a.rr(14, 30)) * sc;
      }
      a.ctx.restore();
      a.mist(0, ry - 36 * sc, w, 26 * sc, .35 * (1 - sc) + .06);
    }
    for (const n of named) { const pt = namedHouse(a, n.x, 452, 66, n.name, { flag: n.flag }); if (key[n.name]) anchors[key[n.name]] = pt; }
    // the street, crowded
    for (let i = 0; i < 40; i++) { const x = a.rr(0, w); if (x > bx0 - 10 && x < bx1 + 10) continue; a.person(x, a.rr(462, 476), 1, Math.floor(a.rr(0, 5))); }
    a.cart(w * .2, 474); a.cart(w * .8, 476);
    // river along the bottom with boats; bank line
    a.water(0, 492, w, h, { density: 1 });
    a.ctx.strokeStyle = a.ink(.75); for (let x = 0; x < w; x += 3) { a.ctx.lineWidth = .6 + 1.6 * a.fbm(x * .02, 2); a.ctx.beginPath(); a.ctx.moveTo(x, 490); a.ctx.lineTo(x + 3, 490); a.ctx.stroke(); }
    [[.1, 528, 60], [.36, 512, 52], [.8, 536, 70]].forEach(([f, y, bw]) => a.boat(f * w, y, bw));
    a.bridge(bx0 - 20, ROAD_Y, bx1 + 20, ROAD_Y, 26);
    // road: along the street and over the bridge arch
    const r = road(w, h, orient).map(([x, y]) => {
      if (x < bx0 - 20 || x > bx1 + 20) return [x, y];
      const t = (x - (bx0 - 20)) / (bx1 - bx0 + 40); return [x, ROAD_Y - 4 * 26 * t * (1 - t)];
    });
    for (const p of places) if (!anchors[p.key]) Object.assign(anchors, spread(r, [p.key], orient));
    return { road: r, anchors };
  },
};
const TOWN = { 松鹤楼: [.13, '酒'], 回雁楼: [.36, '酒'], 扬州茶馆: [.8, '茶'] };
function creekBand(a, x0, x1, h) {
  // a canal running from the back of the town down into the river, under the bridge
  const L = [[x0 - 70, 280], [x0 - 20, 420], [x0 + 6, 500]], R = [[x0 - 40, 280], [x1 - 40, 420], [x1 - 6, 500]];
  a.ctx.fillStyle = 'rgba(120,112,96,.38)'; a.ctx.beginPath(); a.ctx.moveTo(...L[0]);
  a.ctx.quadraticCurveTo(...L[1], ...L[2]); a.ctx.lineTo(...R[2]); a.ctx.quadraticCurveTo(...R[1], ...R[0]); a.ctx.closePath(); a.ctx.fill();
  a.ctx.strokeStyle = a.ink(.6); a.ctx.lineWidth = 1;
  a.ctx.beginPath(); a.ctx.moveTo(...L[0]); a.ctx.quadraticCurveTo(...L[1], ...L[2]); a.ctx.stroke();
  a.ctx.beginPath(); a.ctx.moveTo(...R[0]); a.ctx.quadraticCurveTo(...R[1], ...R[2]); a.ctx.stroke();
  for (let i = 0; i < 70; i++) { const t = a.rng(), y = 290 + t * 200, xl = (x0 - 70) + t * 76, xr = (x0 - 40) + t * (x1 - x0 + 34);
    const xm = a.rr(xl + 4, xr - 4); a.ctx.strokeStyle = a.ink(.22); a.ctx.lineWidth = .6; a.ctx.beginPath(); a.ctx.moveTo(xm - 6, y); a.ctx.lineTo(xm + 6, y); a.ctx.stroke(); }
}
function shijingPortrait(a, w, h, places) {
  a.water(0, 0, 90, h, { density: .8 });                       // river runs down the left side
  for (let i = 0; i < 4; i++) a.boat(10, 120 + i * 210, 50);
  let y = 60;
  while (y < h - 40) {
    let x = 110;
    while (x < w - 30) { const bw = a.rr(30, 50); a.house(x, y, bw, a.rr(15, 20), a.rr(14, 22), { shop: a.rng() < .5, flag: a.rng() < .1 ? '酒' : null }); x += bw + a.rr(18, 34); }
    for (let p = 0; p < 6; p++) a.person(a.rr(110, w - 20), y + a.rr(6, 16), .85, Math.floor(a.rr(0, 5)));
    if (a.rng() < .5) a.willow(a.rr(120, w - 40), y + 2, 44, .7);
    y += a.rr(80, 110);
  }
  const key = byPlace(places), anchors = {}, r = road(w, h, 'portrait', t => 30 * Math.sin(t * 9));
  Object.entries(TOWN).forEach(([name, [, flag]], i, all) => {
    const x = i % 2 ? 150 : 250, y = h * (i + 1) / (all.length + 1) + 50;
    a.ctx.fillStyle = 'rgba(179,169,148,.94)'; a.ctx.fillRect(x - 30, y - 96, 150, 108);           // clear a plot in the crowd of roofs
    const pt = namedHouse(a, x, y, 62, name, { flag });
    if (key[name]) anchors[key[name]] = pt;
  });
  for (const p of places) if (!anchors[p.key]) Object.assign(anchors, spread(r, [p.key], 'portrait'));
  return { road: r, anchors };
}

/* ---------- 古龙: the night ---------- */
export const night = {
  paint(a, { w, h }, region, places, orient) {
    const key = byPlace(places), anchors = {};
    if (orient === 'portrait') {
      a.night(0, 0, w, h, { strength: .88 });
      a.moon(w * .7, 110, 30);
      ridgeSilhouette(a, -20, w + 20, 320, 90, h);
      const yi = h * .36, ym = h * .55, yv = h * .77;               // inn, manor, valley, then the boat on the water below
      { const t = inn(a, 70, yi); if (key['小楼']) anchors[key['小楼']] = [102, t]; }
      { const t = plumManor(a, 250, ym); if (key['万梅山庄']) anchors[key['万梅山庄']] = [250, t]; }
      a.person(60, h * .63, 1.3, 3, true);
      valley(a, 150, yv); if (key['恶人谷']) anchors[key['恶人谷']] = [150, yv - 80];
      a.water(0, h - 104, w, h - 10, { dark: true });
      { const t = boatAt(a, 270, h - 38, 112); if (key['香帅的船']) anchors[key['香帅的船']] = [270, t]; }
      return { road: road(w, h, 'portrait', t => -40 * Math.sin(t * 5)), anchors, dark: [[0, h]] };
    }
    a.night(0, 0, w, h, { fadeIn: 300, fadeOut: 150 });
    a.moon(w * .6, 108, 34);
    ridgeSilhouette(a, 40, w - 10, 360, 130);
    { const t = inn(a, w * .27, 452); if (key['小楼']) anchors[key['小楼']] = [w * .27 + 32, t]; }
    { const t = plumManor(a, w * .46, 456); if (key['万梅山庄']) anchors[key['万梅山庄']] = [w * .46, t]; }
    valley(a, w * .68, 470); if (key['恶人谷']) anchors[key['恶人谷']] = [w * .68, 400];
    a.water(w * .7, 498, w * .3, h, { dark: true, fadeIn: 110 });
    { const t = boatAt(a, w * .8, 540, 116); if (key['香帅的船']) anchors[key['香帅的船']] = [w * .8, t]; }
    a.person(w * .37, 478, 1.3, 3, true); a.person(w * .34, 470, 1, 0, true);
    a.ctx.strokeStyle = 'rgba(236,228,208,.55)'; a.ctx.lineWidth = .8; a.ctx.beginPath(); a.ctx.moveTo(w * .37 + 14, 460); a.ctx.lineTo(w * .37 + 54, 452); a.ctx.stroke(); // one flash of the blade
    const r = road(w, h, orient);
    for (const p of places) if (!anchors[p.key]) Object.assign(anchors, spread(r, [p.key], orient));
    return { road: r, anchors, dark: [[200, w - 160]] };
  },
};
function ridgeSilhouette(a, x0, x1, base, amp, H = 560) {
  const pts = [];
  for (let x = x0; x <= x1; x += 2) {
    const t = (x - x0) / (x1 - x0), ends = a.sm(Math.min(1, t / .32, (1 - t) / .32));
    const y = base - amp * Math.pow(Math.sin(Math.PI * t), .8) * (.4 + .8 * a.fbm(x * .007 + 51)) - 14 * (a.fbm(x * .07, 3) - .5);
    pts.push([x, H - ends * (H - y)]);
  }
  a.ctx.fillStyle = 'rgba(12,10,9,.82)'; a.ctx.beginPath(); a.ctx.moveTo(x0, H); pts.forEach(([x, y]) => a.ctx.lineTo(x, y)); a.ctx.lineTo(x1, H); a.ctx.closePath(); a.ctx.fill();
  a.ctx.strokeStyle = 'rgba(236,228,208,.4)'; a.ctx.lineWidth = 1; a.ctx.beginPath(); pts.forEach(([x, y], i) => i ? a.ctx.lineTo(x, y) : a.ctx.moveTo(x, y)); a.ctx.stroke();
}
/** 万梅山庄: a walled garden of plum trees in flower, one lit hall behind the moon gate. */
function plumManor(a, x, y) {
  const r = a.propAt('plum-manor', x, y + 6, 250, () => plumManorDrawn(a, x, y));
  return r.used ? r.top - 6 : y - 90;
}
function plumManorDrawn(a, x, y) {
  const c = a.ctx;
  a.house(x - 24, y - 8, 52, 18, 24, { lit: true });
  c.fillStyle = 'rgba(24,21,18,.96)'; c.fillRect(x - 78, y - 16, 160, 18);
  c.strokeStyle = 'rgba(236,228,208,.5)'; c.lineWidth = .8; c.strokeRect(x - 78, y - 16, 160, 18);
  c.fillStyle = 'rgba(236,228,208,.35)'; c.fillRect(x - 80, y - 19, 164, 3);
  c.fillStyle = 'rgba(236,205,140,.75)'; c.beginPath(); c.arc(x + 2, y - 7, 7, 0, 7); c.fill();             // the moon gate
  plum(a, x - 58, y + 4, 62); plum(a, x + 60, y + 2, 74); plum(a, x + 96, y + 6, 44);
}
/** 香帅的船 on dark water; `cx` is the middle of the boat, `wy` the waterline. */
function boatAt(a, cx, wy, len) {
  const r = a.propAt('pleasure-boat', cx, wy + 8, 190, () => huafang(a, cx - len / 2, wy, len));
  return r.used ? r.top - 6 : wy - 80;
}
function inn(a, x, y) {
  const r = a.propAt('inn-moon', x + 32, y + 4, 190, () => {
    a.house(x, y, 64, 26, 32, { shop: true, lit: true, flag: '酒', storeys: 2 });
    a.ctx.fillStyle = 'rgba(240,214,150,.95)'; a.ctx.beginPath(); a.ctx.ellipse(x - 4, y - 34, 3, 4, 0, 0, 7); a.ctx.fill();
  });
  if (r.used) a.glow(x + 32, y - 30, 90, .25);
  return r.used ? r.top - 8 : y - 72;
}
function valley(a, x, y) {
  // two jagged cliffs with a narrow gap: 恶人谷
  for (const side of [-1, 1]) {
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const u = i / 60, px = x + side * (14 + u * 120);
      const prof = Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.15)), .45) * (side < 0 ? 120 : 150);
      pts.push([px, y - prof * (.7 + .5 * a.fbm(px * .05 + side * 9, 3)) - 28 * (a.fbm(px * .18, 3) - .5)]);
    }
    a.ctx.fillStyle = 'rgba(4,3,3,.92)'; a.ctx.beginPath(); a.ctx.moveTo(pts[0][0], y + 8); pts.forEach(p => a.ctx.lineTo(...p)); a.ctx.lineTo(pts.at(-1)[0], y + 8); a.ctx.closePath(); a.ctx.fill();
    a.ctx.strokeStyle = 'rgba(236,228,208,.28)'; a.ctx.lineWidth = .8; a.ctx.beginPath(); pts.slice(0, 40).forEach((p, i) => i ? a.ctx.lineTo(...p) : a.ctx.moveTo(...p)); a.ctx.stroke();
  }
  for (let i = 0; i < 6; i++) { a.ctx.fillStyle = `rgba(236,205,140,${a.rr(.4, .8)})`; a.ctx.beginPath(); a.ctx.arc(x + a.rr(-8, 8), y - a.rr(4, 50), 1.4, 0, 7); a.ctx.fill(); } // lamps deep in the valley
}
