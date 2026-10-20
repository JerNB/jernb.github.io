// Run with Chrome/Edge remote debugging on localhost:9227; no npm dependencies.
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const fs = require('node:fs');

async function main() {
  const tabs = await (await fetch('http://127.0.0.1:9227/json')).json();
  const ws = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = ({ data }) => {
    const result = JSON.parse(data);
    if (!pending.has(result.id)) return;
    const { resolve, reject } = pending.get(result.id);
    pending.delete(result.id);
    result.error ? reject(Error(result.error.message)) : resolve(result.result);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    pending.set(++id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => (await send('Runtime.evaluate', {
    expression, returnByValue: true, awaitPromise: true
  })).result.value;
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

  try {
    await send('Page.enable');
    const failures = [];
    for (const motion of ['reduce', 'no-preference']) {
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: motion }] });
      await send('Page.navigate', { url: pathToFileURL(path.resolve(__dirname, '../projects.html')).href });
      await pause(250);
      await evaluate('document.fonts.ready.then(() => true)');
      assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('.project-card h3'), h=>h.textContent.trim()).sort()"),
        ['CareerAtlas',"GPT, I'm Cooked",'Hit Song Prediction','SongRec Demo','StatsifyFinance','慢慢来'].sort());
      // Resize the same document, including both sides of each breakpoint.
      for (const [width, height] of [[1440,900],[1920,1080],[1366,768],[1281,800],[1280,800],[1201,800],[1200,800],[1100,800],[1024,768],[941,800],[940,800],[820,1180],[768,1024],[701,800],[700,800],[430,932],[375,812],[320,720],[844,390],[1440,900]]) {
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
        await pause(750);
        const report = await evaluate(`(window.__checkProjectPool = () => {
          const stage = document.querySelector('.pool-stage').getBoundingClientRect();
          const pool = new Path2D(document.querySelector('#pool-clip path').getAttribute('d'));
          const ctx = document.createElement('canvas').getContext('2d');
          ctx.setTransform(stage.width, 0, 0, stage.height, 0, 0);
          const outside = [], clipped = [], shapes = [], overlaps = [];
          const shapeCtx = document.createElement('canvas').getContext('2d');
          for (const card of document.querySelectorAll('.project-field .project-card')) {
            const style = getComputedStyle(card), rect = card.getBoundingClientRect();
            const w = card.offsetWidth, h = card.offsetHeight;
            const radius = name => {
              const values = style[name].split(' ');
              return [values[0], values[1] || values[0]].map((v, i) => parseFloat(v) * (v.includes('%') ? (i ? h : w) / 100 : 1));
            };
            const radii = ['borderTopLeftRadius','borderTopRightRadius','borderBottomRightRadius','borderBottomLeftRadius'].map(radius);
            const factor = Math.min(1, w/(radii[0][0]+radii[1][0]), w/(radii[3][0]+radii[2][0]), h/(radii[0][1]+radii[3][1]), h/(radii[1][1]+radii[2][1]));
            const matrix = new DOMMatrix(style.transform);
            let bad = 0;
            const boundary = [], shape = new Path2D();
            shape.roundRect(0,0,w,h,radii.map(([x,y]) => ({x:x*factor,y:y*factor})));
            radii.forEach(([rx, ry], corner) => {
              rx *= factor; ry *= factor;
              const cx = corner === 0 || corner === 3 ? rx : w-rx;
              const cy = corner < 2 ? ry : h-ry;
              for (let i=0; i<=24; i++) {
                const a = (Math.PI + corner*Math.PI/2) + i*Math.PI/48;
                const x = cx + rx*Math.cos(a)-w/2, y = cy + ry*Math.sin(a)-h/2;
                const px = rect.left+rect.width/2 + matrix.a*x+matrix.c*y-stage.left;
                const py = rect.top+rect.height/2 + matrix.b*x+matrix.d*y-stage.top;
                boundary.push([px+stage.left,py+stage.top]);
                if (!ctx.isPointInPath(pool,px,py)) bad++;
              }
            });
            shapes.push({name:card.querySelector('h3').textContent.trim(),w,h,rect,matrix,shape,boundary});
            if (bad) outside.push(card.querySelector('h3').textContent.trim() + ':' + bad);
            for (const p of card.querySelectorAll('p:not(.muted-note)')) {
              if (p.scrollHeight > p.clientHeight+1) clipped.push(card.querySelector('h3').textContent.trim());
            }
          }
          const inside = (point, card) => {
            const dx = point[0]-card.rect.left-card.rect.width/2, dy = point[1]-card.rect.top-card.rect.height/2;
            const m = card.matrix, det = m.a*m.d-m.b*m.c;
            return shapeCtx.isPointInPath(card.shape,(m.d*dx-m.c*dy)/det+card.w/2,(-m.b*dx+m.a*dy)/det+card.h/2);
          };
          for (let i=0;i<shapes.length;i++) for (let j=i+1;j<shapes.length;j++) {
            if (shapes[i].boundary.filter(p=>inside(p,shapes[j])).length>2 ||
                shapes[j].boundary.filter(p=>inside(p,shapes[i])).length>2) overlaps.push(shapes[i].name+' / '+shapes[j].name);
          }
          const area = selector => { const r=document.querySelector(selector).getBoundingClientRect(); return r.width*r.height; };
          return { width:innerWidth, overflow:document.documentElement.scrollWidth>innerWidth, outside, clipped, overlaps,
            statsifySmaller:area('.project-statsify')<area('.project-songrec') };
        })()`);
        const failed = report.overflow || report.outside.length || report.clipped.length || report.overlaps.length || !report.statsifySmaller;
        if (failed) failures.push({ motion, viewport: [width,height], ...report });
        console.log((failed ? 'FAIL ' : 'PASS ') + motion + ' ' + width+'×'+height + (failed ? ' '+JSON.stringify(report) : ''));
        if (process.env.POOL_SCREENSHOTS && [1440,1024,768,375].includes(width)) {
          const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
          fs.writeFileSync(path.join(process.env.POOL_SCREENSHOTS, 'pool-'+motion+'-'+width+'.png'), Buffer.from(shot.data,'base64'));
        }
      }
      const centers = await evaluate("Array.from(document.querySelectorAll('.project-card'), card => { const r=card.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; })");
      for (const point of centers) {
        await send('Input.dispatchMouseEvent', { type:'mouseMoved', ...point });
        await pause(550);
        const report = await evaluate('__checkProjectPool()');
        assert.equal(report.outside.length, 0, 'Hover crossed the shoreline: '+JSON.stringify(report));
      }
      for (const width of [1440,1024]) {
        await send('Emulation.setDeviceMetricsOverride', {width,height:900,deviceScaleFactor:1,mobile:false});
        await send('Input.dispatchMouseEvent', {type:'mouseMoved',x:0,y:0});
        await pause(750);
        await evaluate('document.querySelector(".pool-stage").scrollIntoView({block:"center",behavior:"instant"})');
        const point = await evaluate("(() => {const r=document.querySelector('.project-card').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()");
        await send('Input.dispatchMouseEvent', {type:'mouseMoved',...point});
        await send('Input.dispatchMouseEvent', {type:'mousePressed',...point,button:'left',buttons:1,clickCount:1});
        await send('Input.dispatchMouseEvent', {type:'mouseMoved',x:5,y:5,button:'left',buttons:1});
        await pause(750);
        assert.equal(await evaluate('document.querySelector(".project-card").classList.contains("dragging")'),true,'Drag was not activated');
        let report = await evaluate('__checkProjectPool()');
        assert.equal(report.outside.length,0,'Drag crossed the shoreline: '+JSON.stringify(report));
        await send('Input.dispatchMouseEvent', {type:'mouseReleased',x:5,y:5,button:'left',buttons:0,clickCount:1});
        await pause(750);
        report = await evaluate('__checkProjectPool()');
        assert.equal(report.outside.length,0,'Released bubble crossed the shoreline: '+JSON.stringify(report));
        console.log('PASS '+motion+' drag / release '+width);
      }
    }
    assert.equal(failures.length, 0, JSON.stringify(failures, null, 2));
  } finally {
    ws.close();
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
