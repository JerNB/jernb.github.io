#!/usr/bin/env node
// Sync Jerry's WeChat Reading data into data/reading.json for reading.html.
//
//   node scripts/sync-weread.mjs
//
// Needs WEREAD_API_KEY in the environment (never written anywhere). Edit
// data/reading-curation.json to place books, mark books read that WeRead
// does not show as finished, and pick which of your thoughts go public
// (tibaReviewIds). On any API error the existing reading.json is kept.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { callWeRead } from './weread/client.mjs';
import { buildReading } from './weread/build-reading.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function syncWeRead({
  apiKey,
  curationPath = path.join(root, 'data/reading-curation.json'),
  outPath = path.join(root, 'data/reading.json'),
  fetchImpl = fetch,
  log = console.log,
} = {}) {
  const curation = JSON.parse(fs.readFileSync(curationPath, 'utf8'));
  const call = (api, params = {}) => callWeRead(api, params, { apiKey, fetchImpl });

  const shelf = await call('/shelf/sync');
  const overall = await call('/readdata/detail', { mode: 'overall' });

  const notebooks = { books: [] };
  for (let lastSort; ;) {
    const page = await call('/user/notebooks', { count: 100, ...(lastSort ? { lastSort } : {}) });
    notebooks.totalNoteCount ??= page.totalNoteCount;
    notebooks.books.push(...(page.books ?? []));
    if (!page.hasMore || !page.books?.length) break;
    lastSort = page.books.at(-1).sort;
  }

  const byTitle = new Map((shelf.books ?? []).map(b => [b.title, b]));
  const curatedIds = new Set(curation.books.flatMap(e => (e.match ?? []).map(t => byTitle.get(t)?.bookId).filter(Boolean)));
  const withNotes = notebooks.books.filter(b => curatedIds.has(b.bookId));

  const reviews = {}, bookmarks = {};
  for (const b of withNotes) {
    if (b.reviewCount) {
      const all = [];
      for (let synckey = 0; ;) {
        const page = await call('/review/list/mine', { bookid: b.bookId, count: 50, synckey });
        all.push(...(page.reviews ?? []));
        if (!page.hasMore || page.synckey === undefined || page.synckey === synckey) break;
        synckey = page.synckey;
      }
      reviews[b.bookId] = { reviews: all };
    }
    if (b.noteCount) bookmarks[b.bookId] = await call('/book/bookmarklist', { bookId: b.bookId });
  }

  const search = {};
  for (const e of curation.books.filter(e => e.search !== undefined)) {
    const res = await call('/store/search', { keyword: e.search, count: 1 });
    search[e.key] = res.results?.flatMap(r => r.books ?? [])[0]?.bookInfo ?? null;
  }

  const info = {};
  const infoIds = new Set([...curatedIds, ...Object.values(search).filter(Boolean).map(b => b.bookId),
    ...(shelf.books ?? []).filter(b => b.finishReading === 1 && !b.secret).map(b => b.bookId)]);
  for (const bookId of infoIds) {
    // /book/info's wordCount is trimmed from gateway responses; sum the chapter list instead.
    const res = await call('/book/chapterinfo', { bookId });
    const words = (res.chapters ?? []).reduce((a, c) => a + (c.wordCount ?? 0), 0);
    if (words > 0) info[bookId] = { wordCount: words };
  }

  const data = buildReading({ shelf, overall, notebooks, reviews, bookmarks, search, info }, curation);
  fs.writeFileSync(outPath + '.tmp', JSON.stringify(data, null, 2) + '\n');
  fs.renameSync(outPath + '.tmp', outPath);
  for (const w of data.warnings) log(`warning: ${w}`);
  log(`wrote ${path.relative(root, outPath)}: ${data.places.length} places, ${data.study.length} books in study, ${data.stats.hours}h`);
  return data;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  syncWeRead({ apiKey: process.env.WEREAD_API_KEY }).catch(err => {
    console.error(`sync failed, reading.json left unchanged: ${err.message}`);
    process.exit(1);
  });
}
