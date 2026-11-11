import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReading } from '../../scripts/weread/build-reading.mjs';

const H = 3600;
function fixture() {
  const raw = {
    shelf: { books: [
      { bookId: 'b1', title: '黄金时代', author: '王小波', cover: 'c1', finishReading: 1, secret: 0 },
      { bookId: 'b2', title: '某本私密书', author: 'R', cover: 'c2', finishReading: 1, secret: 1 },
      { bookId: 'b3', title: '白夜', author: '陀思妥耶夫斯基', cover: 'c3', finishReading: 0, secret: 0 },
      { bookId: 'b4', title: '纳瓦尔宝典', author: 'N', cover: 'c4', finishReading: 0, secret: 0 },
      { bookId: 'v1', title: '古龙文集：绝代双骄1', author: '古龙', cover: 'cv', finishReading: 1, secret: 0 },
      { bookId: 'v2', title: '古龙文集：绝代双骄2', author: '古龙', cover: 'cv', finishReading: 1, secret: 0 },
      { bookId: 'b5', title: '我身上有个不可战胜的夏天', author: '加缪', cover: 'c5', finishReading: 1, secret: 0 },
      { bookId: 'b6', title: '没人策划的书', author: 'X', cover: 'c6', finishReading: 1, secret: 0 },
    ] },
    overall: { totalReadTime: 133.3 * H, readDays: 250, readLongest: [
      { book: { bookId: 'b1' }, readTime: 5 * H },
      { book: { bookId: 'b2' }, readTime: 6.2 * H },
      { book: { bookId: 'v1' }, readTime: 2 * H },
      { book: { bookId: 'v2' }, readTime: 1 * H },
    ] },
    notebooks: { totalNoteCount: 491, books: [
      { bookId: 'b2', reviewCount: 1, noteCount: 9, bookmarkCount: 0 },
      { bookId: 'b5', reviewCount: 7, noteCount: 106, bookmarkCount: 0 },
    ] },
    reviews: { b5: { reviews: [{ review: { reviewId: 'r1', content: '前已无通路，后不见归途', abstract: '绝望者没有故乡…' } }] } },
    bookmarks: { b5: { updated: [{ bookmarkId: 'm1', markText: '我总感觉自己生活在海上' }, { bookmarkId: 'm2', markText: '第二句' }] },
                 b1: { updated: [{ bookmarkId: 'm9', markText: '划线' }] } },
    search: { huozhe: { bookId: 's1', title: '活着', author: '余华', cover: 'c' }, gone: null },
    info: { b1: { wordCount: 100000 }, v1: { wordCount: 300000 }, v2: { wordCount: 300000 } },
  };
  const curation = {
    regions: [
      { id: 'xingnang', name: '行囊', order: 0, painter: 'xingnang', minWidth: 600 },
      { id: 'jianghu-night', name: '古龙夜', order: 1, painter: 'night', minWidth: 900 },
      { id: 'loess', name: '黄土与田野', order: 2, painter: 'loess', minWidth: 900 },
      { id: 'whitenight', name: '白夜之城', order: 3, painter: 'whitenight', minWidth: 600 },
      { id: 'desert', name: '荒漠与大海', order: 4, painter: 'desert', minWidth: 800 },
    ],
    objects: [{ id: 'scale', label: '秤', books: ['naval'] }],
    links: [{ from: 'summer', to: 'sahara', note: '想到了三毛' }, { from: 'summer', to: 'huozhe', note: 'x' }],
    books: [
      { key: 'golden-age', label: '黄金时代', region: 'loess', place: '黄金时代', match: ['黄金时代'] },
      { key: 'private-one', label: '某本私密书', region: 'loess', place: '?', match: ['某本私密书'], read: true },
      { key: 'white-nights', label: '白夜', region: 'whitenight', place: '白夜之城', match: ['白夜'], read: true },
      { key: 'naval', label: '纳瓦尔宝典', region: 'xingnang', place: '秤', match: ['纳瓦尔宝典'] },
      { key: 'twins', label: '绝代双骄', region: 'jianghu-night', place: '恶人谷', match: ['古龙文集：绝代双骄1', '古龙文集：绝代双骄2'] },
      { key: 'summer', label: '我身上有个不可战胜的夏天', region: 'desert', place: '海边', match: ['我身上有个不可战胜的夏天'] },
      { key: 'huozhe', label: '活着', region: 'loess', place: '福贵的田', search: '活着 余华', read: true },
      { key: 'gone', label: '不存在', region: 'loess', place: 'x', search: '不存在', read: true },
      { key: 'renamed', label: '改名了', region: 'loess', place: 'x', match: ['旧书名'], read: true },
    ],
  };
  return { raw, curation };
}
const build = (mut) => { const f = fixture(); mut && mut(f); return buildReading(f.raw, f.curation, { now: '2026-11-08' }); };
const place = (r, key) => r.places.find(p => p.key === key);

test('secret books never appear', () => {
  const r = build();
  const all = JSON.stringify([r.places, r.study, r.links, r.objects]);
  assert.ok(!all.includes('某本私密书'));
  assert.equal(place(r, 'private-one'), undefined);
  assert.equal(r.stats.hours, Math.floor((133.3 - 6.2) * H / H));
  assert.equal(r.stats.notes, 491 - 10);
});

test('read = finishReading or curation read:true', () => {
  const r = build();
  assert.ok(place(r, 'white-nights'), 'unfinished + read:true is placed');
  assert.equal(place(r, 'naval'), undefined, 'unfinished without flag is not placed');
  assert.ok(!r.study.some(s => s.key === 'naval'));
});

test('notebook markedStatus 1 also counts as finished', () => {
  const r = build(f => { f.raw.notebooks.books.push({ bookId: 'b4', reviewCount: 0, noteCount: 0, bookmarkCount: 0, markedStatus: 1 }); });
  assert.ok(place(r, 'naval'));
});

test('multi-volume match merges', () => {
  const p = place(build(), 'twins');
  assert.equal(p.hours, 3);
  assert.equal(p.wordCount, 600000);
});

test('manual books resolve via search', () => {
  const p = place(build(), 'huozhe');
  assert.equal(p.author, '余华');
  assert.equal(p.cover, 'c');
  assert.equal(p.hours, null);
});

test('missing match warns and skips', () => {
  const r = build();
  assert.equal(place(r, 'gone'), undefined);
  assert.equal(place(r, 'renamed'), undefined);
  assert.ok(r.warnings.some(w => w.includes('gone')));
  assert.ok(r.warnings.some(w => w.includes('renamed')));
});

test('thoughts are private by default', () => {
  assert.deepEqual(place(build(), 'summer').tiba, { quote: '我总感觉自己生活在海上', mine: null });
  const r = build(f => { f.curation.books.find(b => b.key === 'summer').tibaReviewIds = ['r1']; });
  assert.deepEqual(place(r, 'summer').tiba, { quote: '绝望者没有故乡…', mine: '前已无通路，后不见归途' });
});

test('highlights:false and no thoughts → tiba null; curated tiba text', () => {
  let r = build(f => { f.curation.books.find(b => b.key === 'golden-age').highlights = false; });
  assert.equal(place(r, 'golden-age').tiba, null);
  r = build(f => { f.curation.books.find(b => b.key === 'huozhe').tiba = '一句话'; });
  assert.deepEqual(place(r, 'huozhe').tiba, { quote: null, mine: '一句话' });
});

test('uncurated finished book goes to study only, with a warning', () => {
  const r = build();
  assert.ok(r.study.some(s => s.label === '没人策划的书'));
  assert.ok(!r.places.some(p => p.label === '没人策划的书'));
  assert.ok(r.warnings.some(w => w.includes('没人策划的书')));
});

test('region density', () => {
  const r = build();
  const d = Object.fromEntries(r.regions.map(g => [g.id, g.density]));
  assert.equal(d.loess, 1);            // 5h, the max
  assert.equal(d['jianghu-night'], 0.6); // 3h / 5h
  assert.equal(d.whitenight, 0.5);     // no hours known
});

test('stats', () => {
  const r = build();
  assert.equal(r.stats.booksRead, r.study.length);
  assert.equal(r.stats.readDays, 250);
  assert.equal(r.stats.hours, 127);
});

test('objects and links keep only placed books', () => {
  const r = build(f => { f.raw.shelf.books.find(b => b.bookId === 'b4').finishReading = 1; });
  assert.deepEqual(r.objects, [{ id: 'scale', label: '秤', region: 'xingnang', books: ['naval'] }]);
  assert.equal(place(r, 'naval').objectId, 'scale');
  assert.deepEqual(build().links.map(l => l.to), ['huozhe']); // sahara not placed
});

test('search-sourced books that are secret on the shelf stay private', () => {
  const r = build(f => {
    f.raw.search.huozhe = { bookId: 'b2', title: '活着', author: '余华', cover: 'c' };   // b2 is secret on the shelf
  });
  assert.equal(r.places.find(p => p.key === 'huozhe'), undefined);
});

test('studyOnly books stay on the spine wall but get no place on the map', () => {
  const r = build(f => { f.curation.books.find(b => b.key === 'huozhe').studyOnly = true; });
  assert.equal(place(r, 'huozhe'), undefined);
  assert.deepEqual(r.study.find(s => s.key === 'huozhe'), { key: 'huozhe', label: '活着', author: '余华', wordCount: null });
  assert.equal(r.stats.booksRead, build().stats.booksRead);
  assert.ok(!r.links.some(l => l.to === 'huozhe'), 'no thread to a book that has no place');
});
