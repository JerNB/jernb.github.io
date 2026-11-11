// Tiny DevTools-protocol helper (no npm deps). Uses a browser already listening on
// localhost:9227, or launches headless Edge/Chrome with that port.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const PORT = 9227;
const CANDIDATES = [
  process.env.BROWSER,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].filter(Boolean);

const pause = ms => new Promise(r => setTimeout(r, ms));
async function endpoint() {
  try { return (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find(t => t.type === 'page'); } catch { return null; }
}

async function withPage(fn, { width = 1400, height = 900 } = {}) {
  let child = null;
  let page = await endpoint();
  if (!page) {
    const exe = CANDIDATES.find(p => fs.existsSync(p));
    if (!exe) throw new Error('No Chrome/Edge found; set BROWSER=/path/to/chrome');
    child = spawn(exe, ['--headless=new', `--remote-debugging-port=${PORT}`, '--disable-gpu', '--hide-scrollbars',
      `--user-data-dir=${fs.mkdtempSync(path.join(os.tmpdir(), 'reading-cdp-'))}`, `--window-size=${width},${height}`, 'about:blank'],
      { stdio: 'ignore' });
    for (let i = 0; i < 50 && !(page = await endpoint()); i++) await pause(200);
    if (!page) throw new Error('browser did not start');
  }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map();
  ws.onmessage = ({ data }) => { const m = JSON.parse(data); const p = pending.get(m.id); if (p) { pending.delete(m.id); m.error ? p.rej(Error(m.error.message)) : p.res(m.result); } };
  const send = (method, params = {}) => new Promise((res, rej) => { pending.set(++id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expression => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const goto = async url => { await send('Page.enable'); await send('Network.enable'); await send('Network.setCacheDisabled', { cacheDisabled: true });   // never verify against a stale tile
    await send('Page.navigate', { url }); await pause(400);
    await evaluate('new Promise(r => document.readyState === "complete" ? r() : addEventListener("load", r))'); };
  try { return await fn({ send, evaluate, goto, pause }); }
  finally { ws.close(); if (child) child.kill(); }
}

module.exports = { withPage, PORT };

// CLI: node tools/reading-scroll/cdp.cjs snap <url> <out.png> [maxWidth]
// Saves the generator's painted canvas (exact pixels, downscaled to maxWidth).
if (require.main === module && process.argv[2] === 'snap') {
  const [, , , url, out, maxW = '2400'] = process.argv;
  withPage(async ({ goto, evaluate }) => {
    await goto(url);
    await evaluate('new Promise(r => { const t = setInterval(() => window.__done && (clearInterval(t), r()), 100); })');
    const data = await evaluate(`(() => { const c = document.querySelector('#stage canvas'); const k = Math.min(1, ${maxW} / c.width);
      const o = document.createElement('canvas'); o.width = c.width * k; o.height = c.height * k; o.getContext('2d').drawImage(c, 0, 0, o.width, o.height);
      return o.toDataURL('image/png'); })()`);
    fs.writeFileSync(out, Buffer.from(data.split(',')[1], 'base64'));
    console.log(out);
  }).catch(e => { console.error(e.message); process.exit(1); });
}

// CLI: node tools/reading-scroll/cdp.cjs page <url> <out.png> <width> <height> [scrollX] [js]
// Screenshot of a real page at a given viewport (for verifying reading.html).
if (require.main === module && process.argv[2] === 'page') {
  const [, , , url, out, w = '1440', h = '900', sx = '0', js = ''] = process.argv;
  withPage(async ({ send, goto, evaluate, pause }) => {
    const mobile = Number(w) < 768;
    await send('Emulation.setDeviceMetricsOverride', { width: Number(w), height: Number(h), deviceScaleFactor: 1, mobile });
    await goto(url);
    await evaluate("new Promise(r => { const t = setInterval(() => document.querySelector('.scroll')?.dataset.state === 'ready' && (clearInterval(t), r()), 100); })");
    await evaluate(`document.querySelector('.scroll').scrollLeft = ${Number(sx)}; document.querySelector('.scroll').dispatchEvent(new Event('scroll'))`);
    if (js) await evaluate(js);
    await pause(1500);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
    console.log(out);
  }, { width: Number(w), height: Number(h) }).catch(e => { console.error(e.message); process.exit(1); });
}
