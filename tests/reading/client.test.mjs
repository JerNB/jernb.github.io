import test from 'node:test';
import assert from 'node:assert/strict';
import { callWeRead, WeReadError, UpgradeRequired } from '../../scripts/weread/client.mjs';

function stub(response) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return { ok: true, status: 200, json: async () => response };
  };
  return { calls, fetchImpl };
}

test('sends flat params with skill_version', async () => {
  const { calls, fetchImpl } = stub({ books: [] });
  await callWeRead('/shelf/sync', { count: 5 }, { apiKey: 'k', fetchImpl });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://i.weread.qq.com/api/agent/gateway');
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer k');
  assert.deepEqual(JSON.parse(calls[0].init.body), { api_name: '/shelf/sync', count: 5, skill_version: '1.0.5' });
});

test('throws WeReadError on errcode', async () => {
  const { fetchImpl } = stub({ errcode: -2012, errmsg: 'x' });
  await assert.rejects(callWeRead('/shelf/sync', {}, { apiKey: 'k', fetchImpl }),
    err => err instanceof WeReadError && err.errcode === -2012);
});

test('throws UpgradeRequired', async () => {
  const { fetchImpl } = stub({ upgrade_info: { message: 'please upgrade' } });
  await assert.rejects(callWeRead('/shelf/sync', {}, { apiKey: 'k', fetchImpl }),
    err => err instanceof UpgradeRequired && err.message.includes('please upgrade'));
});
