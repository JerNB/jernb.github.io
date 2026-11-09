import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { syncWeRead } from '../../scripts/sync-weread.mjs';

const curation = {
  regions: [{ id: 'loess', name: '黄土', order: 0, painter: 'loess', minWidth: 900 }],
  objects: [], links: [],
  books: [{ key: 'golden-age', label: '黄金时代', region: 'loess', place: '黄金时代', match: ['黄金时代'] }],
};
const payloads = {
  '/shelf/sync': { books: [{ bookId: 'b1', title: '黄金时代', author: '王小波', finishReading: 1, secret: 0 }] },
  '/readdata/detail': { totalReadTime: 7200, readDays: 3, readLongest: [] },
  '/user/notebooks': { totalNoteCount: 1, hasMore: 0, books: [{ bookId: 'b1', reviewCount: 0, noteCount: 1, bookmarkCount: 0, sort: 1 }] },
  '/review/list/mine': { reviews: [], hasMore: 0 },
  '/book/bookmarklist': { updated: [{ bookmarkId: 'm', markText: '划线' }] },
  '/book/chapterinfo': { bookId: 'b1', chapters: [{ wordCount: 60 }, { wordCount: 40 }] },
};
function fetchFor(failOnCall) {
  let n = 0;
  return async (_url, init) => {
    n++;
    const { api_name } = JSON.parse(init.body);
    const body = n === failOnCall ? { errcode: -1, errmsg: 'boom' } : payloads[api_name];
    return { ok: true, status: 200, json: async () => body };
  };
}
function tmp() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'weread-'));
  const curationPath = path.join(dir, 'curation.json');
  fs.writeFileSync(curationPath, JSON.stringify(curation));
  return { curationPath, outPath: path.join(dir, 'reading.json') };
}

test('failure leaves existing output untouched', async () => {
  const { curationPath, outPath } = tmp();
  fs.writeFileSync(outPath, '{"old":true}');
  await assert.rejects(syncWeRead({ apiKey: 'k', curationPath, outPath, fetchImpl: fetchFor(3), log: () => {} }));
  assert.equal(fs.readFileSync(outPath, 'utf8'), '{"old":true}');
});

test('writes atomically on success', async () => {
  const { curationPath, outPath } = tmp();
  await syncWeRead({ apiKey: 'k', curationPath, outPath, fetchImpl: fetchFor(0), log: () => {} });
  const data = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  assert.equal(data.places[0].key, 'golden-age');
  assert.deepEqual(data.places[0].tiba, { quote: '划线', mine: null });
  assert.equal(data.places[0].wordCount, 100);
  assert.ok(!fs.existsSync(outPath + '.tmp'));
});
