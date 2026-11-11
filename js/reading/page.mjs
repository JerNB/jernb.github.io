// Boots reading.html: lays the pre-rendered tiles, the places and their 题跋, the walking
// traveler, the 书房 spine wall and the 卷尾跋 colophon onto the scroll.
import { pointOnAxis, inRanges, orderAlong } from './path.mjs';
import { createScrollController } from './scroll.mjs';
import { toChineseNumeral } from './numerals.mjs';
import { clipQuote, placeSlip } from './jian.mjs';
import { packShelf } from './shelf.mjs';

const section = document.querySelector('.scroll');
const track = section.querySelector('.scroll-track');
const hint = document.querySelector('.scroll-hint');
const stage = document.querySelector('.reading-stage');
const roll = stage.querySelector('.roll');
const mqPortrait = matchMedia('(max-width: 767px)');
const mqReduced = matchMedia('(prefers-reduced-motion: reduce)');

const [reading, scene] = await Promise.all(['data/reading.json', 'data/reading-scene.json']
  .map(u => fetch(u, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(u); return r.json(); })));

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const DIGITS = '〇一二三四五六七八九';
const chineseDate = iso => { const [y, m] = iso.split('-'); return `${[...y].map(d => DIGITS[d]).join('')}年${toChineseNumeral(Number(m))}月`; };
const spineW = s => s.wordCount ? Math.min(46, Math.max(17, s.wordCount / 12000)) : 22;
const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

let update = () => {};
let rolled = true;
let closeSlip = () => {};
let currentOrient = null;
const controllers = {};

function build() {
  const orient = mqPortrait.matches ? 'portrait' : 'landscape';
  const S = scene[orient], P = orient === 'portrait', ax = P ? 1 : 0;
  // landscape: the painting is scaled to fill the stage between the title and the bottom of the screen
  const k = P ? section.clientWidth / S.width || 1 : Math.min(1.5, Math.max(.8, stage.clientHeight / S.height));
  section.dataset.orient = orient;
  track.replaceChildren();
  hint.textContent = rolled ? '点开卷轴' : P ? '向下滑动，沿着路走下去' : '滚动鼠标，画卷向左展开';
  stage.dataset.orient = orient;

  /* painted strip: LQIP under the tiles */
  const W = S.width * k, H = S.height * k;
  track.style.backgroundImage = `url(${S.lqip})`;
  track.style.backgroundSize = `${W}px ${H}px`;
  const fade = el('div', 'strip-end');                     // paper flows on past the painting
  Object.assign(fade.style, P ? { left: 0, top: `${H - 160 * k}px`, width: `${W}px`, height: `${160 * k}px` }
                              : { left: `${W - 200}px`, top: 0, width: '200px', height: `${H}px` });
  fade.dataset.axis = P ? 'y' : 'x';
  const tiles = S.tiles.map(t => {
    const img = el('img', 'tile');
    Object.assign(img, { alt: '', decoding: 'async' });
    Object.assign(img.style, { left: `${t.x * k}px`, top: `${t.y * k}px`, width: `${t.w * k}px`, height: `${t.h * k}px` });
    track.append(img);
    return [img, t];
  });
  const fetchTile = ([img, t]) => { img.srcset = `${t.src1x} 1x, ${t.src2x} 2x`; img.src = t.src1x; };
  if (P) {                                                   // page scroll: the browser's lazy loading works
    for (const it of tiles) { it[0].loading = 'lazy'; it[0].addEventListener('load', () => it[0].classList.add('is-loaded'), { once: true }); fetchTile(it); }
  } else {
    // Lazy loading inside a sideways scroller only starts when a tile is already on screen, so
    // the paint pops in mid-glide. Fetch and decode the whole strip up front, nearest tiles first.
    const here = section.scrollLeft + section.clientWidth / 2;
    const queue = [...tiles].sort((a, b) => Math.abs(a[1].x + a[1].w / 2 - here) - Math.abs(b[1].x + b[1].w / 2 - here));
    const worker = async () => {
      for (let it; (it = queue.shift()) && it[0].isConnected;) {
        fetchTile(it);
        try { await it[0].decode(); } catch { /* a failed tile leaves the LQIP showing */ continue; }
        it[0].classList.add('is-loaded');
      }
    };
    worker(); worker();
  }
  track.append(fade);

  /* places */
  const isDark = pt => inRanges(S.dark, pt[ax]);
  /* 笺: one slip of paper for the whole scroll. It opens beside whichever place is under the
     pointer or focused, on its own opaque ground, so the copy never runs into the painting. */
  const jian = el('div', 'jian');
  jian.setAttribute('aria-hidden', 'true');
  let open = null;
  const position = () => {
    if (!open) return;
    const t = track.getBoundingClientRect(), r = open.getBoundingClientRect();
    const label = { left: r.left - t.left, right: r.right - t.left, top: r.top - t.top, bottom: r.bottom - t.top };
    let view;
    if (P) {
      view = { left: 8, right: W - 8, top: Math.max(8, 8 - t.top), bottom: Math.min(H, innerHeight - t.top) - 8 };
      for (const mh of [220, 300, 380]) { jian.style.maxHeight = `${mh}px`; if (jian.offsetWidth <= W - 16) break; }
    } else {
      view = { left: section.scrollLeft + 12, right: section.scrollLeft + section.clientWidth - 12, top: 10, bottom: H - 10 };
    }
    const at = placeSlip(label, { w: jian.offsetWidth, h: jian.offsetHeight }, view, orient);
    jian.style.transform = `translate(${Math.round(at.left)}px, ${Math.round(at.top)}px)`;
  };
  const hide = () => {
    if (!open) return;
    open.classList.remove('is-open'); open = null;
    track.classList.remove('has-open'); jian.classList.remove('is-on');
  };
  const show = (btn, slip) => {
    if (open === btn) return;
    hide();
    const head = el('p', 'jian-head', slip.title);
    if (slip.author) head.append(el('small', null, slip.author));
    jian.replaceChildren(head, ...slip.rows.map(r => {
      const p = el('p', r.cls);
      if (r.tag) p.append(el('span', 'tag', `「${r.tag}」`));
      p.append(r.text);
      return p;
    }));
    open = btn; btn.classList.add('is-open'); track.classList.add('has-open');
    position(); jian.classList.add('is-on');
  };
  closeSlip = hide;
  const CLIP = P ? 90 : 140;

  const placeBtn = (pt, name, book, slip, aria) => {
    const b = el('button', 'place');
    b.type = 'button';
    b.style.left = `${pt[0] * k}px`; b.style.top = `${pt[1] * k}px`;
    if (pt[1] * k < 120) b.classList.add('below');
    if (isDark(pt)) b.classList.add('light');
    b.append(el('span', 'name', name));
    if (book) b.append(el('span', 'book', book));
    b.append(el('span', 'seal', '读'));
    b.setAttribute('aria-label', aria);
    b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') show(b, slip); });
    b.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && document.activeElement !== b) hide(); });
    b.addEventListener('focus', () => {
      if (b.matches(':focus-visible')) b.scrollIntoView({ inline: 'center', block: 'nearest', behavior: mqReduced.matches ? 'auto' : 'smooth' });
      show(b, slip);
    });
    b.addEventListener('blur', hide);
    b.addEventListener('click', () => show(b, slip));
    track.append(b);
  };
  const byKey = Object.fromEntries(reading.places.map(p => [p.key, p]));
  const renderers = {}, anchorsAll = {}, slipFor = {};
  for (const p of reading.places) {
    if (p.objectId) continue;
    const pt = S.places[p.key]; if (!pt) continue;
    const t = p.tiba ? [p.tiba.quote, p.tiba.mine].filter(Boolean).join('。') : '';
    const rows = [];
    if (p.tiba?.quote) rows.push({ tag: '划线', text: clipQuote(p.tiba.quote, CLIP) });
    if (p.tiba?.mine) rows.push({ tag: '批注', text: clipQuote(p.tiba.mine, CLIP), cls: 'mine' });
    if (p.hours >= 1) rows.push({ tag: '读', text: `${toChineseNumeral(Math.round(p.hours))}小时`, cls: 'hours' });
    anchorsAll[p.key] = pt;
    slipFor[p.key] = { title: `《${p.label}》`, author: p.author, rows };
    renderers[p.key] = () => placeBtn(pt, p.place, p.place === p.label ? '' : `《${p.label}》`,
      slipFor[p.key],
      `${p.place}，《${p.label}》${p.author ? '，' + p.author : ''}${t ? '。' + t : ''}`);
  }
  for (const o of reading.objects) {
    const pt = S.objects[o.id]; if (!pt || !o.books.length) continue;
    anchorsAll[`object:${o.id}`] = pt;
    renderers[`object:${o.id}`] = () => placeBtn(pt, o.label, '',
      { title: o.label, author: '', rows: o.books.map(key => {
        const bk = byKey[key], line = clipQuote(bk.tiba?.mine || bk.tiba?.quote, 44);
        return { text: `《${bk.label}》${line ? '　' + line : ''}`, cls: bk.tiba?.mine ? 'mine' : '' };
      }) },
      `${o.label}：${o.books.map(kk => `《${byKey[kk].label}》`).join('、')}`);
  }
  for (const key of orderAlong(anchorsAll, ax)) renderers[key]();   // Tab order follows the road
  track.append(jian);

  /* threads Jerry drew between books (e.g. 加缪 → 三毛) */
  for (const l of reading.links) {
    const a = S.places[l.from], b = S.places[l.to]; if (!a || !b) continue;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('thread'); svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('aria-hidden', 'true');
    const [ax0, ay0, bx, by] = [a[0] * k, a[1] * k + 10, b[0] * k, b[1] * k + 10];
    const mx = (ax0 + bx) / 2, my = Math.max(ay0, by) + 60 * k;
    svg.innerHTML = `<path d="M${ax0},${ay0} Q${mx},${my} ${bx},${by}"/>`;
    track.append(svg);
    const note = el('span', 'thread-note', l.note);
    note.style.left = `${mx}px`; note.style.top = `${(ay0 + by) / 4 + my / 2 + 10}px`;
    track.append(note);
  }

  /* 书房: a bookcase of every book read, after the painted strip */
  const study = el('section', 'study');
  study.setAttribute('aria-label', '书房：读过的全部书');
  const plaque = el('div', 'plaque');
  plaque.append(el('h2', null, '书房'), el('small', null, `凡${toChineseNumeral(reading.study.length)}部`));
  const caseEl = el('div', 'bookcase');
  const ws = reading.study.map(s => Math.round(Math.max(19, spineW(s)) * k));
  const ORN = 46 * k;                                                 // room at a tier's end for a vase or a seal stone
  const tierW = P ? (S.width - 32) * k - ORN - 64 : Math.ceil(ws.reduce((x, y) => x + y + 2, 0) / 3 * 1.1);   // three tiers on a wide screen
  const tiers = packShelf(ws.map(w => w + 2), tierW);
  const tierH = (P ? 150 : 128) * k;
  const CLOTH = ['#3a332c', '#4a3f35', '#5a4c3d', '#3d4246', '#6b5a44', '#2e2a26', '#54493f', '#47413b'];
  tiers.forEach((idx, t) => {
    const row = el('ul', 'tier');
    row.style.height = `${tierH}px`;
    for (const i of idx) {
      const s = reading.study[i], h = hash(s.key), li = el('li', 'book');
      const bh = tierH * (.7 + (h % 23) / 100);
      Object.assign(li.style, { width: `${ws[i]}px`, height: `${bh}px` });
      li.style.setProperty('--cloth', CLOTH[h % CLOTH.length]);
      const label = el('span', 'label', s.label);
      const room = bh * .62 - 8, n = [...s.label].length;
      label.style.fontSize = `${Math.max(7.5, Math.min(ws[i] > 22 ? 11 : 9.5, room / (n * 1.04)))}px`;
      label.style.maxHeight = `${bh * .66}px`;
      li.append(label);
      li.setAttribute('aria-label', `《${s.label}》${s.author ? '，' + s.author : ''}`);
      const slip = slipFor[s.key] ?? { title: `《${s.label}》`, author: s.author, rows: [] };
      li.addEventListener('pointerenter', () => show(li, slip));
      li.addEventListener('pointerleave', hide);
      row.append(li);
    }
    if (t === 0 || t === tiers.length - 1) {                          // a plum branch in a vase up top, a seal stone below
      const o = el('li', `ornament ${t === 0 ? 'vase' : 'sealstone'}`);
      o.setAttribute('aria-hidden', 'true');
      o.innerHTML = t === 0
        ? '<svg viewBox="0 0 40 90"><path class="br" d="M20 52 C18 38 24 28 16 14 M19 34 C26 30 30 22 33 12 M17 22 C11 18 9 12 6 6"/><g class="pb"><circle cx="16" cy="14" r="2.2"/><circle cx="33" cy="12" r="2"/><circle cx="6" cy="6" r="1.8"/><circle cx="27" cy="24" r="1.7"/><circle cx="11" cy="17" r="1.6"/><circle cx="22" cy="40" r="1.5"/></g><path class="vs" d="M15 52 Q13 58 12 66 Q10 80 20 88 Q30 80 28 66 Q27 58 25 52 Z"/></svg>'
        : '<svg viewBox="0 0 40 60"><rect class="st" x="11" y="14" width="18" height="40" rx="2"/><path class="lion" d="M11 14 Q20 2 29 14 Z"/><rect class="face" x="11" y="51" width="18" height="5"/></svg>';
      o.style.width = `${ORN}px`;
      row.append(o);
    }
    caseEl.append(row);
  });
  study.append(plaque, caseEl);

  /* 卷尾跋 */
  const colo = el('section', 'colophon');
  colo.setAttribute('aria-label', '卷尾跋');
  const st = reading.stats;
  colo.append(
    el('p', null, `读书凡${toChineseNumeral(st.hours)}小时，${toChineseNumeral(st.readDays)}日。`),
    el('p', null, `书${toChineseNumeral(st.booksRead)}部，笔记${toChineseNumeral(st.notes)}条。`),
    el('p', 'date', `${chineseDate(reading.generatedAt)}，Jerry 记`),
    el('span', 'seal-big', '书卷'));
  track.append(study, colo);

  let trackW, trackH;
  if (P) {
    Object.assign(study.style, { left: `${16 * k}px`, top: `${H + 50}px`, width: `${(S.width - 32) * k}px` });
    const studyH = study.offsetHeight;
    Object.assign(colo.style, { left: '50%', transform: 'translateX(-50%)', top: `${H + 50 + studyH + 60}px` });
    trackW = W; trackH = H + 50 + studyH + 60 + colo.offsetHeight + 60;
  } else {
    Object.assign(study.style, { left: `${W + 60}px`, top: '0' });
    const sw = study.offsetWidth, sh = study.offsetHeight;
    study.style.top = `${Math.max(8, (H - sh) / 2)}px`;
    Object.assign(colo.style, { left: `${W + 60 + sw + 90}px`, top: `${Math.max(20, (H - colo.offsetHeight) / 2)}px` });
    trackW = W + 60 + sw + 90 + colo.offsetWidth + 120; trackH = H;
  }
  track.style.width = `${trackW}px`; track.style.height = `${trackH}px`;

  /* the traveler: a figure in an undyed robe with a red bundle on a staff, unlike any of the
     ink people painted into the scroll; where the road is afloat, the same figure poles a skiff */
  const tr = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  tr.classList.add('traveler'); tr.setAttribute('viewBox', '0 0 48 34'); tr.setAttribute('aria-hidden', 'true');
  tr.innerHTML = `
    <g class="walker">
      <ellipse class="shade" cx="24" cy="33" rx="7" ry="1.3"/>
      <g class="legs"><path class="ink-line" d="M22 27 L20.5 33"/><path class="ink-line" d="M26 27 L27.5 33"/></g>
      <path class="robe" d="M21.2 14.5 L26.8 14.5 L29.2 28.5 L18.8 28.5 Z"/>
      <path class="ink-line thin" d="M20.6 21 L27.4 21"/>
      <circle class="ink" cx="24" cy="12.2" r="2.3"/>
      <path class="ink" d="M15.5 10.6 Q24 3.2 32.5 10.6 Q24 9 15.5 10.6 Z"/>
      <path class="ink-line" d="M30.5 9 L27.2 33"/>
      <circle class="bundle" cx="31.2" cy="9.6" r="2.9"/>
    </g>
    <g class="skiff">
      <path class="wake" d="M2 30.5 Q10 29 18 30.5 M30 31.5 Q38 30 46 31.5"/>
      <path class="hull" d="M5 26 Q24 33 43 25 L40 29.5 Q24 34 8 29.5 Z"/>
      <path class="ink-line" d="M34 4 L29 33"/>
      <path class="robe" d="M21.5 13.5 L26.5 13.5 L28.4 26 L19.6 26 Z"/>
      <circle class="ink" cx="24" cy="11.2" r="2.2"/>
      <path class="ink" d="M16 9.8 Q24 2.8 32 9.8 Q24 8.3 16 9.8 Z"/>
      <circle class="bundle" cx="15.5" cy="24" r="2.6"/>
    </g>`;
  track.append(tr);
  let lastV = null, idle = 0;
  update = pos => {
    const v = P ? (scrollY + innerHeight * .55 - (section.getBoundingClientRect().top + scrollY)) / k
                : (pos + section.clientWidth * .38) / k;
    const [x, y] = pointOnAxis(S.road, ax, v);
    const afloat = inRanges(S.water ?? [], v);
    tr.style.transform = `translate(${x * k - 24}px, ${y * k - 33}px)`;
    tr.classList.toggle('light', isDark([x, y]));
    tr.classList.toggle('afloat', afloat);
    if (lastV !== null && Math.abs(v - lastV) > .5) {                // step while the scroll moves, face the way it goes
      if (!P) tr.classList.toggle('back', v < lastV);
      tr.classList.add('walking'); clearTimeout(idle); idle = setTimeout(() => tr.classList.remove('walking'), 180);
    }
    lastV = v;
    position();                                    // an open slip keeps to the visible part of the scroll
  };

  currentOrient = orient;
  controllers[orient] ??= createScrollController(section, { orient, reducedMotion: mqReduced.matches,
    onFrame: p => { if (currentOrient === orient) update(p); } });   // a stale orientation's listener stays silent
  section.dataset.state = 'ready';
  placeRoll(H, P);
  update(controllers[orient].position);
}

build();

/* the rolled scroll: it sits over the hidden painting until it is opened */
function placeRoll(H, P) {
  if (!rolled) return;
  roll.dataset.orient = P ? 'portrait' : 'landscape';
  const st = stage.getBoundingClientRect(), s = section.getBoundingClientRect();
  if (P) {
    roll.style.setProperty('--roll-len', `${s.width + 20}px`);
    roll.style.left = `${s.left - st.left - 10}px`; roll.style.top = '24px';
  } else {
    roll.style.setProperty('--roll-len', `${H}px`);
    roll.style.left = `${s.left - st.left + s.width / 2 - roll.offsetWidth / 2}px`;
    roll.style.top = `${s.top - st.top + H / 2 - roll.offsetHeight / 2}px`;
  }
  roll.removeAttribute('aria-busy');
}
const EASE = 'cubic-bezier(0.45, 0.05, 0.25, 1)';
async function unroll(e) {
  const byKey = e?.detail === 0;                                    // opened with Enter or Space: keyboard focus moves into the painting
  if (!rolled || section.dataset.state !== 'ready') return;
  rolled = false;
  const P = section.dataset.orient === 'portrait';
  const done = () => {
    section.classList.remove('is-rolled'); section.style.height = '';
    section.getAnimations().forEach(a => a.cancel());
    roll.hidden = true; section.tabIndex = 0;
    hint.textContent = P ? '向下滑动，沿着路走下去' : '滚动鼠标，画卷向左展开'; hint.style.visibility = '';
    if (byKey) section.focus({ preventScroll: true });
  };
  if (mqReduced.matches) { done(); return; }
  roll.classList.add('is-opening'); hint.style.visibility = 'hidden';                                  // the tie and the slip come off first
  const r = roll.getBoundingClientRect(), s = section.getBoundingClientRect();
  if (P) {
    const reach = Math.max(260, Math.min(section.querySelector('.scroll-track').offsetHeight, innerHeight - s.top - 16));
    section.style.height = '0px'; section.classList.remove('is-rolled');
    const D = 1500;
    roll.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${reach}px)` }], { duration: D, delay: 260, easing: EASE, fill: 'forwards' });
    roll.animate([{ opacity: 1 }, { opacity: 0 }], { duration: D * .14, delay: 260 + D * .86, fill: 'forwards' });
    await section.animate([{ height: '0px' }, { height: `${reach}px` }], { duration: D, delay: 260, easing: EASE, fill: 'forwards' }).finished;
    return done();
  }
  // landscape: the roll moves to the left end of the painting, then rolls away to the right,
  // the painting opening behind it
  const toEdge = s.left - (r.left + r.width / 2);
  await roll.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${toEdge}px)` }], { duration: 560, delay: 220, easing: EASE, fill: 'forwards' }).finished;
  const D = 1900;
  section.classList.remove('is-rolled');
  // the roll's centre rides exactly on the opening edge; it thins as the paper comes off it
  roll.animate([{ transform: `translateX(${toEdge}px) scaleX(1)` }, { transform: `translateX(${toEdge + s.width}px) scaleX(.7)` }], { duration: D, easing: EASE, fill: 'forwards' });
  roll.animate([{ opacity: 1 }, { opacity: 0 }], { duration: D * .14, delay: D * .86, fill: 'forwards' });
  await section.animate([{ clipPath: 'inset(-2px 100% -2px 0)' }, { clipPath: 'inset(-2px 0% -2px 0)' }], { duration: D, easing: EASE, fill: 'forwards' }).finished;
  done();
}
roll.addEventListener('click', unroll);
addEventListener('pointerdown', e => { if (!e.target.closest?.('.place')) closeSlip(); });
mqPortrait.addEventListener('change', build);
let lastW = section.clientWidth;
let lastH = stage.clientHeight, resizeT = 0;
addEventListener('resize', () => {
  clearTimeout(resizeT);
  resizeT = setTimeout(() => {
    if (mqPortrait.matches ? Math.abs(section.clientWidth - lastW) > 2 : Math.abs(stage.clientHeight - lastH) > 8) {
      lastW = section.clientWidth; lastH = stage.clientHeight; build();
    }
  }, 120);
});
