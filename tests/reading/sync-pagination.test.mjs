import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { syncWeRead } from '../../scripts/sync-weread.mjs';

test('notebook pagination stops when the cursor makes no progress', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'weread-'));
  const curationPath = path.join(dir, 'c.json');
  fs.writeFileSync(curationPath, JSON.stringify({ regions: [], objects: [], links: [], books: [] }));
  let notebookCalls = 0;
  const fetchImpl = async (_u, init) => {
    const { api_name } = JSON.parse(init.body);
    if (api_name === '/user/notebooks') notebookCalls++;
    const body = { '/shelf/sync': { books: [] }, '/readdata/detail': { totalReadTime: 0, readDays: 0 },
      '/user/notebooks': { hasMore: 1, books: [{ bookId: 'x' }] } }[api_name] ?? {};
    return { ok: true, status: 200, json: async () => body };
  };
  await syncWeRead({ apiKey: 'k', curationPath, outPath: path.join(dir, 'o.json'), fetchImpl, log: () => {} });
  assert.ok(notebookCalls <= 2, `called ${notebookCalls} times`);
});
