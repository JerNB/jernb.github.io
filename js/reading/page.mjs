// Boots reading.html: lays the pre-rendered tiles, the places and their 题跋, the walking
// traveler, the 书房 spine wall and the 卷尾跋 colophon onto the scroll.
import { pointOnAxis, inRanges, orderAlong } from './path.mjs';
import { createScrollController } from './scroll.mjs';
import { toChineseNumeral } from './numerals.mjs';

const section = document.querySelector('.scroll');
const track = section.querySelector('.scroll-track');
const hint = document.querySelector('.scroll-hint');
const mqPortrait = matchMedia('(max-width: 767px)');
const mqReduced = matchMedia('(prefers-reduced-motion: reduce)');

const [reading, scene] = await Promise.all(['data/reading.json', 'data/reading-scene.json']
  .map(u => fetch(u).then(r => { if (!r.ok) throw new Error(u); return r.json(); })));

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const DIGITS = '〇一二三四五六七八九';
const chineseDate = iso => { const [y, m] = iso.split('-'); return `${[...y].map(d => DIGITS[d]).join('')}年${toChineseNumeral(Number(m))}月`; };
const spineW = s => s.wordCount ? Math.min(46, Math.max(17, s.wordCount / 12000)) : 22;
const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

let update = () => {};
let currentOrient = null;
const controllers = {};

function build() {
  const orient = mqPortrait.matches ? 'portrait' : 'landscape';
  const S = scene[orient], P = orient === 'portrait', ax = P ? 1 : 0;
  const k = P ? section.clientWidth / S.width || 1 : 1;
  section.dataset.orient = orient;
  track.replaceChildren();
  hint.textContent = P ? '向下滑动，沿着路走下去' : '滚动鼠标，画卷向左展开';

  /* painted strip: LQIP under lazy tiles */
  const W = S.width * k, H = S.height * k;
  track.style.backgroundImage = `url(${S.lqip})`;
  track.style.backgroundSize = `${W}px ${H}px`;
  const fade = el('div', 'strip-end');                     // paper flows on past the painting
  Object.assign(fade.style, P ? { left: 0, top: `${H - 160 * k}px`, width: `${W}px`, height: `${160 * k}px` }
                              : { left: `${W - 200}px`, top: 0, width: '200px', height: `${H}px` });
  fade.dataset.axis = P ? 'y' : 'x';
  for (const t of S.tiles) {
    const img = el('img', 'tile');
    Object.assign(img, { alt: '', loading: 'lazy', decoding: 'async', src: t.src1x, srcset: `${t.src1x} 1x, ${t.src2x} 2x` });
    Object.assign(img.style, { left: `${t.x * k}px`, top: `${t.y * k}px`, width: `${t.w * k}px`, height: `${t.h * k}px` });
    img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
    track.append(img);
  }
  track.append(fade);

  /* places */
  const isDark = pt => inRanges(S.dark, pt[ax]);
  const placeBtn = (pt, name, book, tibaNode, aria) => {
    const b = el('button', 'place');
    b.type = 'button';
    b.style.left = `${pt[0] * k}px`; b.style.top = `${pt[1] * k}px`;
    if (pt[1] * k < 120) b.classList.add('below');
    else if (!P && pt[1] > 300) b.classList.add('low');          // keep long 题跋 inside the strip
    if (isDark(pt)) b.classList.add('light');
    if (!P && pt[0] < 300) b.classList.add('flip');
    if (P && pt[0] < S.width / 2) b.classList.add('flip');
    b.append(el('span', 'name', name));
    if (book) b.append(el('span', 'book', book));
    b.append(el('span', 'seal', '读'));
    if (tibaNode) b.append(tibaNode);
    b.setAttribute('aria-label', aria);
    b.addEventListener('focus', () => b.scrollIntoView({ inline: 'center', block: 'nearest', behavior: mqReduced.matches ? 'auto' : 'smooth' }));
    track.append(b);
  };
  const tibaFor = t => {
    if (!t) return null;
    const box = el('span', 'tiba');
    if (t.quote) box.append(el('span', 'quote', t.quote));
    if (t.mine) box.append(el('span', 'mine', t.mine));
    return box;
  };
  const byKey = Object.fromEntries(reading.places.map(p => [p.key, p]));
  const renderers = {}, anchorsAll = {};
  for (const p of reading.places) {
    if (p.objectId) continue;
    const pt = S.places[p.key]; if (!pt) continue;
    const t = p.tiba ? [p.tiba.quote, p.tiba.mine].filter(Boolean).join('。') : '';
    anchorsAll[p.key] = pt;
    renderers[p.key] = () => placeBtn(pt, p.place, p.place === p.label ? '' : `《${p.label}》`, tibaFor(p.tiba), `${p.place}，《${p.label}》${p.author ? '，' + p.author : ''}${t ? '。' + t : ''}`);
  }
  for (const o of reading.objects) {
    const pt = S.objects[o.id]; if (!pt || !o.books.length) continue;
    anchorsAll[`object:${o.id}`] = pt;
    renderers[`object:${o.id}`] = () => {
      const box = el('span', 'tiba');
      for (const key of o.books) box.append(el('span', 'quote', `《${byKey[key].label}》${byKey[key].tiba?.mine ? '　' + byKey[key].tiba.mine : ''}`));
      placeBtn(pt, o.label, '', box, `${o.label}：${o.books.map(kk => `《${byKey[kk].label}》`).join('、')}`);
    };
  }
  for (const key of orderAlong(anchorsAll, ax)) renderers[key]();   // Tab order follows the road

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

  /* 书房 and 卷尾跋 after the painted strip */
  const study = el('section', 'study');
  study.setAttribute('aria-label', '书房：读过的全部书');
  const shelf = el('ul', 'shelf');
  for (const s of reading.study) {
    const li = el('li', 'spine');
    const h = hash(s.key);
    const wpx = spineW(s);
    li.style.width = `${wpx * k}px`;
    li.style.height = `${(150 + h % 50) * k}px`;
    const tone = 30 + (h % 13) - 6;                    // ±6% around a warm ink
    li.style.background = `hsl(${32 + (h % 9)}, ${10 + (h % 7)}%, ${tone}%)`;
    li.append(el('span', null, s.label));
    if (s.author) li.append(el('span', 'who', s.author));
    shelf.append(li);
  }
  study.append(el('h2', 'study-title', '书房'), shelf);
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
    Object.assign(study.style, { left: `${20 * k}px`, top: `${H + 60}px`, width: `${(S.width - 40) * k}px`, paddingLeft: '28px' });
    study.querySelector('.study-title').style.left = '0';
    const studyH = study.offsetHeight;
    Object.assign(colo.style, { left: '50%', transform: 'translateX(-50%)', top: `${H + 60 + studyH + 60}px` });
    trackW = W; trackH = H + 60 + studyH + 60 + colo.offsetHeight + 60;
  } else {
    const studyW = reading.study.reduce((a, s) => a + spineW(s) + 3, 0) + 60;
    Object.assign(study.style, { left: `${W + 80}px`, top: '0', height: `${470}px`, width: `${studyW}px`, paddingLeft: '40px' });
    study.querySelector('.study-title').style.left = '0';
    Object.assign(colo.style, { left: `${W + 80 + studyW + 90}px`, top: '70px' });
    trackW = W + 80 + studyW + 90 + colo.offsetWidth + 120; trackH = H;
  }
  track.style.width = `${trackW}px`; track.style.height = `${trackH}px`;

  /* the traveler */
  const tr = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  tr.classList.add('traveler'); tr.setAttribute('viewBox', '0 0 12 18'); tr.setAttribute('aria-hidden', 'true');
  tr.innerHTML = '<ellipse cx="6" cy="2.4" rx="5.4" ry="1.4"/><circle cx="6" cy="4" r="2"/><path d="M4.2 6 L7.8 6 L9.6 18 L2.4 18Z"/>';
  track.append(tr);
  update = pos => {
    const v = P ? (scrollY + innerHeight * .55 - (section.getBoundingClientRect().top + scrollY)) / k
                : (pos + section.clientWidth * .38) / k;
    const [x, y] = pointOnAxis(S.road, ax, v);
    tr.style.transform = `translate(${x * k - 6}px, ${y * k - 18}px)`;
    tr.classList.toggle('light', isDark([x, y]));
  };

  currentOrient = orient;
  controllers[orient] ??= createScrollController(section, { orient, reducedMotion: mqReduced.matches,
    onFrame: p => { if (currentOrient === orient) update(p); } });   // a stale orientation's listener stays silent
  section.dataset.state = 'ready';
  update(controllers[orient].position);
}

build();
mqPortrait.addEventListener('change', build);
let lastW = section.clientWidth;
addEventListener('resize', () => { if (mqPortrait.matches && Math.abs(section.clientWidth - lastW) > 2) { lastW = section.clientWidth; build(); } });
