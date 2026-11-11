#!/usr/bin/env node
// Pre-render the reading scroll into WebP tiles + data/reading-scene.json.
//
//   node scripts/render-reading-scroll.cjs
//
// Serves the repo on a throwaway local port, opens tools/reading-scroll/render.html in
// headless Edge/Chrome (or a browser already on localhost:9227), paints both
// orientations at 2x, and writes images/reading/{tiles,lqip,paper}. Re-run after
// changing data/reading.json, a painter, or adding props to images/reading/props/.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { withPage } = require('../tools/reading-scroll/cdp.cjs');

const root = path.resolve(__dirname, '..');
const OUT = path.join(root, 'images/reading');
const TYPES = { '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.css': 'text/css' };

function serve() {
  const server = http.createServer((req, res) => {
    const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}
// content hash in the URL: a re-rendered tile must never be served from a browser's cache
const url = rel => `images/reading/${rel}?v=${require('crypto').createHash('md5').update(fs.readFileSync(path.join(OUT, rel))).digest('hex').slice(0, 8)}`;
const save = (rel, dataUrl) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, Buffer.from(dataUrl.split(',')[1], 'base64')); return fs.statSync(f).size; };

(async () => {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await withPage(async ({ goto, evaluate }) => {
      await goto(`${base}/tools/reading-scroll/render.html?export=1`);
      await evaluate('new Promise(r => { const t = setInterval(() => window.exportScene && (clearInterval(t), r()), 100); })');
      const scene = { version: 1, seed: 20261108, generatedAt: new Date().toISOString().slice(0, 10) };
      fs.rmSync(path.join(OUT, 'tiles'), { recursive: true, force: true });
      save('paper.webp', await evaluate('exportPaper()'));
      for (const orient of ['landscape', 'portrait']) {
        const out = await evaluate(`exportScene('${orient}')`);
        let bytes2x = 0;
        const tiles = out.tiles.map(t => {
          bytes2x += save(`tiles/${orient}/${t.name}@2x.webp`, t.dataUrl2x);
          save(`tiles/${orient}/${t.name}.webp`, t.dataUrl1x);
          return { src2x: url(`tiles/${orient}/${t.name}@2x.webp`), src1x: url(`tiles/${orient}/${t.name}.webp`), x: t.x, y: t.y, w: t.w, h: t.h };
        });
        save(`lqip-${orient}.webp`, out.lqipDataUrl);
        scene[orient] = { ...out.scene, tiles, lqip: url(`lqip-${orient}.webp`), paper: url('paper.webp') };
        console.log(`${orient}: ${out.scene.width}×${out.scene.height}, ${tiles.length} tiles, ${(bytes2x / 1048576).toFixed(2)} MB @2x`);
      }
      const reading = JSON.parse(fs.readFileSync(path.join(root, 'data/reading.json'), 'utf8'));
      for (const orient of ['landscape', 'portrait']) {
        const miss = [...reading.places.map(p => p.key).filter(k => !scene[orient].places[k]), ...reading.objects.map(o => o.id).filter(k => !scene[orient].objects[k])];
        if (miss.length) throw new Error(`${orient}: no anchor for ${miss.join(', ')}`);
      }
      fs.writeFileSync(path.join(root, 'data/reading-scene.json'), JSON.stringify(scene) + '\n');
      console.log('wrote data/reading-scene.json');
    });
  } finally { server.close(); }
})().catch(e => { console.error(e.message); process.exit(1); });
