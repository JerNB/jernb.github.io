// Minimal WeChat Reading (微信读书) Agent API Gateway client.
// See ~/.agents/skills/weread-skills/SKILL.md for the contract.

export const GATEWAY = 'https://i.weread.qq.com/api/agent/gateway';
export const SKILL_VERSION = '1.0.5';

export class WeReadError extends Error {
  constructor(apiName, errcode, errmsg) {
    super(`${apiName} failed: errcode ${errcode}${errmsg ? ` (${errmsg})` : ''}`);
    this.name = 'WeReadError';
    this.errcode = errcode;
  }
}

export class UpgradeRequired extends Error {
  constructor(message) {
    super(`weread-skills upgrade required: ${message}`);
    this.name = 'UpgradeRequired';
  }
}

/** Call one gateway API. Business params are sent flat beside api_name. */
export async function callWeRead(apiName, params = {}, { apiKey, fetchImpl = fetch } = {}) {
  if (!apiKey) throw new Error('WEREAD_API_KEY is not set');
  const res = await fetchImpl(GATEWAY, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_name: apiName, ...params, skill_version: SKILL_VERSION }),
  });
  if (!res.ok) throw new WeReadError(apiName, `http ${res.status}`);
  const data = await res.json();
  if (data && data.upgrade_info) throw new UpgradeRequired(data.upgrade_info.message || 'see upgrade_info');
  if (data && data.errcode) throw new WeReadError(apiName, data.errcode, data.errmsg);
  return data;
}
