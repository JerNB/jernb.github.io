// Browser regression tests for reading.html: what keyboard and touch visitors can reach.
// Runs the real page in headless Chrome/Edge over CDP; skipped when no browser is installed.
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { withPage } = require('../../tools/reading-scroll/cdp.cjs');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png' };

let server, base;
test.before(async () => {
  server = http.createServer((req, res) => {
    const f = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] ?? 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => server?.close());

/** Load reading.html at a viewport and hand the page to `fn`; skip the test without a browser. */
async function onPage(t, width, height, fn) {
  try {
    await withPage(async page => {
      await page.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 768 });
      await page.send('Emulation.setFocusEmulationEnabled', { enabled: true });   // a headless page never has window focus, so focus events would not fire
      if (width < 768) await page.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
      await page.goto(`${base}/reading.html`);
      await page.evaluate("new Promise(r => { const t = setInterval(() => document.querySelector('.scroll')?.dataset.state === 'ready' && (clearInterval(t), r()), 50); })");
      await fn(page);
    }, { width, height });
  } catch (e) {
    if (/No Chrome\/Edge found/.test(e.message)) return t.skip('no headless browser');
    throw e;
  }
}
const OPEN = `(async () => { document.querySelector('.roll').click();
  await new Promise(r => { const t = setInterval(() => !document.querySelector('.scroll').classList.contains('is-rolled') && document.querySelector('.roll').hidden && (clearInterval(t), r()), 50); }); })()`;
const slipOn = "document.querySelector('.jian').classList.contains('is-on')";

test('while the scroll is rolled up, nothing inside it can take focus', async t => {
  await onPage(t, 1440, 900, async ({ evaluate }) => {
    const r = await evaluate(`(() => { const s = document.querySelector('.scroll'), p = s.querySelector('.place'); p.focus();
      return { inert: s.inert, focusedInside: s.contains(document.activeElement), slip: ${slipOn} }; })()`);
    assert.deepEqual(r, { inert: true, focusedInside: false, slip: false });
    await evaluate(OPEN);
    const after = await evaluate(`(() => { const s = document.querySelector('.scroll'), p = s.querySelector('.place'); p.focus();
      return { inert: s.inert, focused: document.activeElement === p }; })()`);
    assert.deepEqual(after, { inert: false, focused: true });
  });
});

test('every book in the bookcase is a keyboard control that opens and closes its slip', async t => {
  await onPage(t, 1440, 900, async ({ evaluate }) => {
    await evaluate(OPEN);
    const r = await evaluate(`(async () => {
      const books = [...document.querySelectorAll('.bookcase .book button')], n = (await (await fetch('data/reading.json')).json()).study.length;
      books[0].focus(); const opened = ${slipOn}; const label = document.querySelector('.jian-head').textContent;
      books[0].blur(); const closed = !${slipOn};
      return { count: books.length, n, tabbable: books.every(b => b.tabIndex === 0), opened, closed, named: label.includes(books[0].closest('.book').dataset.title) };
    })()`);
    assert.equal(r.count, r.n);
    assert.deepEqual({ tabbable: r.tabbable, opened: r.opened, closed: r.closed, named: r.named }, { tabbable: true, opened: true, closed: true, named: true });
  });
});

test('a touch tap on a book opens its slip and the tap does not dismiss it', async t => {
  await onPage(t, 390, 844, async ({ evaluate }) => {
    await evaluate(OPEN);
    const r = await evaluate(`(() => {
      const b = document.querySelector('.bookcase .book button'); b.scrollIntoView({ block: 'center' });
      const o = { bubbles: true, pointerType: 'touch', isPrimary: true };
      b.dispatchEvent(new PointerEvent('pointerenter', o)); b.dispatchEvent(new PointerEvent('pointerdown', o));
      b.dispatchEvent(new PointerEvent('pointerup', o)); b.click();
      const open = ${slipOn};
      document.body.dispatchEvent(new PointerEvent('pointerdown', o));     // a tap elsewhere closes it
      return { open, closedByOutsideTap: !${slipOn} };
    })()`);
    assert.deepEqual(r, { open: true, closedByOutsideTap: true });
  });
});

test('a place label carries only its name, and the red seal only where there is a 划线 or 批注 to read', async t => {
  await onPage(t, 1440, 900, async ({ evaluate }) => {
    await evaluate(OPEN);
    const r = await evaluate(`(async () => {
      const d = await (await fetch('data/reading.json')).json(), noted = p => !!(p.tiba?.quote || p.tiba?.mine);
      const byPlace = {}; for (const p of d.places) if (!p.objectId) (byPlace[p.place] ??= []).push(p);
      const labels = [...document.querySelectorAll('.place')].map(b => ({ name: b.querySelector('.name').textContent, kids: b.children.length, seal: !!b.querySelector('.seal') }));
      const wrong = labels.filter(l => byPlace[l.name] && l.seal !== byPlace[l.name].some(noted)).map(l => l.name);
      return { bookSpans: document.querySelectorAll('.place .book').length, wrong, unsealed: labels.filter(l => !l.seal).length };
    })()`);
    assert.equal(r.bookSpans, 0);
    assert.deepEqual(r.wrong, []);
    assert.ok(r.unsealed > 0, 'some places have nothing to read and carry no seal');
  });
});
