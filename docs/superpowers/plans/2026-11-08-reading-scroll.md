# Reading Scroll (书卷) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `reading.html`: a pre-rendered ink handscroll of Jerry's reading, synced from WeChat Reading, where books are places, a tiny traveler walks as you scroll, and the scroll ends in a spine wall and a colophon.

**Architecture:** A local Node sync script turns WeRead API data plus a hand-written curation file into `data/reading.json`. A browser-side generator (seeded canvas painters, one per region) paints the scroll, and a CDP render script exports WebP tiles plus `data/reading-scene.json` (tile manifest, road polyline, place anchors, dark ranges). The page loads tiles lazily and overlays real-text places, 题跋, the traveler, the spine wall and the colophon.

**Tech Stack:** Plain HTML, CSS and ES modules. Node 24 with built-in `node:test` and `fetch`, no npm dependencies. Canvas 2D. Chrome/Edge DevTools protocol on `localhost:9227` (the pattern from `scripts/check-project-pool.cjs`).

**Spec:** `docs/superpowers/specs/2026-11-08-reading-scroll-design.md`. Read it before any task.

**Visual reference:** `.superpowers/brainstorm/1848-1794160411/content/jianghu-v1.html` (approved mockup, git-ignored). Port its drawing code; do not reinvent its look.

## Global Constraints

- No npm dependencies. Tests run with `node --test tests/reading/`.
- The API key comes only from `process.env.WEREAD_API_KEY`. It never appears in output files, the page, logs or commits.
- Every WeRead request body includes `"skill_version": "1.0.5"`, with business params flat at top level (never wrapped in `params`).
- Any response with `upgrade_info` stops the sync with a non-zero exit, printing `upgrade_info.message`.
- `secret=1` books never appear in any output (places, spine wall, stats, tiba).
- Thoughts (`/review/list/mine`) are private unless their `reviewId` is listed in the curation. Highlights are public unless `highlights: false`.
- Colors: kraft `#b3a994`, ink `#1e1b17` (never pure black), highlight `#e6dcc4`, seal `#9b3a2a`. Seal red is the only accent, except the 马孔多 butterflies.
- Fonts: Noto Serif SC for places, tiba and colophon; the site's Cormorant Garamond / Inter for chrome.
- No 金庸 couplet anywhere.
- Scroll direction is a single constant `DIRECTION = 'ltr'` in `js/reading/layout.mjs`.
- Logical sizes: landscape height `560`; portrait width `400`; tiles rendered at 2× and 1×.
- Easing `cubic-bezier(0.28,0.6,0.2,1)` and durations 360–420 ms, from the site. `prefers-reduced-motion` is respected everywhere.
- Mobile breakpoint is `< 768px`, which switches to the portrait scene.

## Review Focus

1. **The wheel reaches the start or end of the scroll.** The page must then scroll vertically as normal, not trap the wheel. Trackpad horizontal swipes must pass through natively (test in Task 9).
2. **A curated title is no longer on the shelf, or a search returns nothing.** The sync warns and skips that book instead of crashing (test in Task 2).
3. **The API fails mid-sync (network, errcode).** The script exits non-zero and leaves the existing `data/reading.json` untouched (test in Task 3).
4. **A tile 404s or loads slowly.** The LQIP strip stays visible and the labels stay readable (verification in Task 10).
5. **Keyboard-only or reduced-motion visitors.** Tab reaches every place, the focused place scrolls into view with its tiba visible, and there is no inertia (verification in Task 10).

---

## File map

| File | Responsibility |
|---|---|
| `scripts/weread/client.mjs` | One function that calls the gateway and handles errcode/upgrade |
| `scripts/weread/build-reading.mjs` | Pure transform: API payloads + curation → `ReadingData` |
| `scripts/sync-weread.mjs` | CLI: fetch everything, build, atomically write `data/reading.json` |
| `data/reading-curation.json` | Jerry's hand-edited regions, books, places, tiba picks |
| `data/reading.json` | Generated, committed |
| `js/reading/numerals.mjs` | `toChineseNumeral` for the colophon |
| `js/reading/layout.mjs` | Region rects for landscape/portrait (shared by generator and page) |
| `js/reading/path.mjs` | Polyline arc-length helpers for the traveler |
| `js/reading/scroll.mjs` | Wheel → smooth scroll controller |
| `js/reading/page.mjs` | Page boot: tiles, places, tiba, traveler, spine wall, colophon |
| `tools/reading-scroll/ink.mjs` | Drawing primitives ported from the mockup |
| `tools/reading-scroll/regions/*.mjs` | One painter module per region family |
| `tools/reading-scroll/render.html` + `render.mjs` | Generator page with `?region=` preview |
| `scripts/render-reading-scroll.cjs` | CDP driver exporting tiles + `data/reading-scene.json` |
| `images/reading/` | Tiles, LQIP, paper tile, `props/` drop folder + `PROMPTS.md` |
| `reading.html`, `css/reading.css` | The page |
| `tests/reading/*.test.mjs` | node:test suites |

## Shared types (JSDoc in code; referenced by every task)

```
ReadingData = {
  generatedAt: string,                  // ISO date
  regions: [{ id, name, order, painter, minWidth, density }],   // density 0..1
  places:  [{ key, label, region, place, author, cover, readerLink|null,
              hours|null, wordCount|null, tiba: {quote|null, mine|null}|null,
              objectId|null }],         // only read, non-secret books
  study:   [{ key, label, author, wordCount|null }],  // all read books, incl. uncurated
  objects: [{ id, label, region:'xingnang', books:[key] }],
  links:   [{ from:key, to:key, note }],              // e.g. 加缪 → 三毛
  stats:   { hours:int, readDays:int, booksRead:int, notes:int },
  warnings:[string]
}
SceneOrient = { width, height, rects:[{regionId,x,y,w,h}],
  tiles:[{src2x, src1x, x, y, w, h}], lqip, paper,
  road:[[x,y]], dark:[[a0,a1]],        // ranges on the scroll axis
  places:{ [key]: [x,y] }, objects:{ [id]: [x,y] } }
Scene = { version:1, seed:int, landscape:SceneOrient, portrait:SceneOrient }
```

---

### Task 1: WeRead client and test harness

**Files:**
- Create: `scripts/weread/client.mjs`, `tests/reading/client.test.mjs`

**Interfaces:**
- Produces: `callWeRead(apiName: string, params: object, { apiKey: string, fetchImpl = fetch }) -> Promise<object>`. It throws `WeReadError` (with `.errcode`) when `errcode` is non-zero, and `UpgradeRequired` (with `.message` from `upgrade_info.message`) when `upgrade_info` is present. Both are exported classes.

- [ ] **Step 1: Write the failing tests** in `tests/reading/client.test.mjs`, using a stub `fetchImpl` that records the request:
  - `sends flat params with skill_version`: the body JSON equals `{api_name:'/shelf/sync', count:5, skill_version:'1.0.5'}`, the method is `POST`, the URL is `https://i.weread.qq.com/api/agent/gateway`, and the header `Authorization` is `Bearer k`.
  - `throws WeReadError on errcode`: the stub returns `{errcode:-2012, errmsg:'x'}`, and the call rejects with an instance of `WeReadError` whose `.errcode === -2012`.
  - `throws UpgradeRequired`: the stub returns `{upgrade_info:{message:'please upgrade'}}`, and the call rejects with `UpgradeRequired` whose message includes `please upgrade`.
- [ ] **Step 2: Run** `node --test tests/reading/`. Expected: FAIL (module not found).
- [ ] **Step 3: Implement `client.mjs`.**
- [ ] **Step 4: Run** `node --test tests/reading/`. Expected: 3 pass.
- [ ] **Step 5: Commit** with the message `feat(reading): WeRead gateway client`.

### Task 2: Pure transform `buildReading` and Chinese numerals

**Files:**
- Create: `scripts/weread/build-reading.mjs`, `js/reading/numerals.mjs`, `tests/reading/build-reading.test.mjs`, `tests/reading/numerals.test.mjs`, `tests/reading/fixtures/` (small hand-made JSON payloads)

**Interfaces:**
- Consumes: raw payload shapes documented in `~/.agents/skills/weread-skills/{shelf,readdata,notes,search}.md`.
- Produces: `buildReading(raw, curation) -> ReadingData`, where `raw = { shelf, overall, notebooks, reviews: {[bookId]: reviewList}, bookmarks: {[bookId]: bookmarkList}, search: {[curationKey]: bookInfo|null}, info: {[bookId]: {wordCount}} }`.
- Produces: `toChineseNumeral(n: int) -> string` (0 ≤ n < 100000).
- Curation schema (also used by Task 3):
  ```
  { regions:[{id,name,order,painter,minWidth}],
    objects:[{id,label,books:[key]}],
    links:[{from,to,note}],
    books:[{ key, label, region, place,
             match?:[exact shelf title], search?:string,   // exactly one of the two
             read?:bool, tibaReviewIds?:[id], tibaHighlightId?:id, tiba?:string,
             highlights?:bool }] }
  ```

- [ ] **Step 1: Write the failing tests** (each is one `test()`):
  - `secret books never appear`: a shelf book with `secret:1`, also curated with `read:true`, is absent from `places`, `study` and `links`. Its `readLongest` hours (6.2 h = 22320 s) are subtracted from `stats.hours`, and its notebook `reviewCount+noteCount+bookmarkCount` is subtracted from `stats.notes`.
  - `read = finishReading or curation read:true`: an unfinished shelf book with `read:true` is placed; an unfinished one without the flag is not placed and not in `study`.
  - `multi-volume match merges`: a curation entry with `match:['古龙文集：绝代双骄1','古龙文集：绝代双骄2']` yields one place whose `hours` is the sum over its volumes.
  - `manual books resolve via search`: an entry with `search:'活着 余华'` and `raw.search[key]={bookId:'1',title:'活着',author:'余华',cover:'c'}` gives a place with author `余华`, cover `c` and `hours:null`.
  - `missing match warns and skips`: an entry whose `match` title is not on the shelf (or whose search is `null`) is absent from `places` and produces a `warnings` entry containing its `key`. No throw.
  - `thoughts are private by default`: with reviews `[{reviewId:'r1',content:'前已无通路，后不见归途',abstract:'绝望者没有故乡…'}]` and no `tibaReviewIds`, the tiba falls back to the first highlight's `markText` as `quote` with `mine:null`. With `tibaReviewIds:['r1']`, the tiba is `{quote:'绝望者没有故乡…', mine:'前已无通路，后不见归途'}`.
  - `highlights:false and no thoughts → tiba null`; a curated `tiba:'一句话'` gives `{quote:null, mine:'一句话'}`.
  - `uncurated finished book goes to study only, with a warning`.
  - `region density`: hours are summed per region and normalized by the max region. A region whose books all have `hours:null` gets `density 0.5`.
  - `stats.booksRead` equals `study.length`; `stats.hours` is `floor((totalReadTime − private seconds)/3600)`; `stats.readDays` equals `overall.readDays`.
  - `numerals`: `0→零, 10→十, 15→十五, 51→五十一, 127→一百二十七, 250→二百五十, 491→四百九十一, 1005→一千零五`.
- [ ] **Step 2: Run** `node --test tests/reading/`. Expected: the new tests FAIL.
- [ ] **Step 3: Implement both modules.** Per-book hours come from `overall.readLongest[].readTime` matched by `bookId` (null when absent). Use `wordCount` from `raw.info`. Output arrays are sorted by region `order`, then `key`, so they are deterministic.
- [ ] **Step 4: Run** `node --test tests/reading/`. Expected: all pass.
- [ ] **Step 5: Commit** with the message `feat(reading): build reading data from WeRead payloads`.

### Task 3: Curation file and sync CLI (real data)

**Files:**
- Create: `data/reading-curation.json`, `scripts/sync-weread.mjs`, `tests/reading/sync.test.mjs`
- Output: `data/reading.json`

**Interfaces:**
- Consumes: `callWeRead` (Task 1), `buildReading` (Task 2).
- Produces: `syncWeRead({ apiKey, curationPath, outPath, fetchImpl }) -> Promise<ReadingData>`, exported for the test. When run as a CLI, it reads the key from env, prints warnings, and exits 1 on any error.

- [ ] **Step 1: Write the failing test** `failure leaves existing output untouched`. Write `{"old":true}` to a temp `outPath`, then make the stub fetch fail on the third call (`{errcode:-1}`). `syncWeRead` should reject, and the file must still read `{"old":true}`. Also add `writes atomically on success`: with full stub payloads, the output parses and contains `places`.
- [ ] **Step 2: Run** `node --test tests/reading/`. Expected: FAIL.
- [ ] **Step 3: Implement `sync-weread.mjs`.** The call order is `/shelf/sync`, then `/readdata/detail {mode:'overall'}`, then `/user/notebooks {count:100}` (paginate with `lastSort` while `hasMore`). After that, for each curated book that has notes, call `/review/list/mine {bookid}` (paginate with `synckey` while `hasMore`) and `/book/bookmarklist {bookId}`. Call `/store/search {keyword, count:1}` for `search` entries and `/book/info {bookId}` for each placed book. Write to `outPath + '.tmp'`, then rename. Use 2-space indented JSON. Put a header comment with run instructions: `node scripts/sync-weread.mjs`.
- [ ] **Step 4: Write `data/reading-curation.json`** with every book from the spec §4 table (keys in kebab pinyin, e.g. `xiao-li-fei-dao`). The regions, in order, are: `xingnang, jianghu-shanhe, jianghu-shijing, jianghu-night, loess, snow, sea, whitenight, depths, stage, desert, macondo`. Draft places for 金庸, which Jerry may edit:

  | Book | Place |
  |---|---|
  | 飞狐外传 | 商家堡 |
  | 雪山飞狐 | 玉笔峰 |
  | 连城诀 | 荆州城 |
  | 天龙八部 | 雁门关 |
  | 射雕英雄传 | 桃花岛 |
  | 白马啸西风 | 大漠 |
  | 鹿鼎记 | 扬州 |
  | 笑傲江湖 | 华山 |
  | 书剑恩仇录 | 天山 |
  | 神雕侠侣 | 襄阳城 |
  | 侠客行 | 侠客岛 |
  | 倚天屠龙记 | 光明顶 |
  | 碧血剑 | 金蛇洞 |
  | 鸳鸯刀 | 镖路 |
  | 越女剑 | 若耶溪 |

  For 古龙: 小李飞刀 → 小楼, 绝代双骄 (4 vols) → 恶人谷. Also add 陆小凤 (陆小凤传奇) and 楚留香 (楚留香传奇), both with `"read": false`, so Jerry can flip them. Add `objects` for 罗盘 / 灯 / 秤, and `links: [{from:'ju-wai-ren-or-summer', to:'sahala', note:'想到了三毛'}]`, using the real keys of 我身上有个不可战胜的夏天 and 撒哈拉的故事.
- [ ] **Step 5: Run** `node --test tests/reading/`. Expected: all pass.
- [ ] **Step 6: Run** `node scripts/sync-weread.mjs`. Expected: exit 0. `data/reading.json` has about 51 `study` entries, no title containing 随他们去, and `stats.hours` near 127. Any warnings are listed. Fix curation titles until the only warnings are intentional ones.
- [ ] **Step 7: Verify** `grep -c wrk- data/reading.json`. Expected: `0`.
- [ ] **Step 8: Commit** the curation, script, tests and `data/reading.json` with the message `feat(reading): sync WeRead into reading.json`.

### Task 4: Layout and path helpers

**Files:**
- Create: `js/reading/layout.mjs`, `js/reading/path.mjs`, `tests/reading/layout.test.mjs`, `tests/reading/path.test.mjs`

**Interfaces:**
- Produces: `DIRECTION='ltr'`, `LANDSCAPE_H=560`, `PORTRAIT_W=400`, `SLOT=150`.
- Produces: `layoutScroll(regions:[{id,minWidth}], counts:{[regionId]:int}, orient:'landscape'|'portrait') -> {width,height,rects:[{regionId,x,y,w,h}]}`. Landscape: `w = max(minWidth, (count+1)*SLOT)`, `h = 560`, and rects are packed along x in region order. Portrait: `w = 400`, `h = max(round(minWidth*0.8), (count+1)*170)`, packed along y.
- Produces: `pointAt(polyline:[[x,y]], t:number) -> [x,y]` (by arc length, clamped to 0..1); `inRanges(ranges:[[a,b]], v) -> bool`.

- [ ] **Step 1: Write the failing tests.**
  - `landscape packs in order`: regions `[{id:'a',minWidth:700},{id:'b',minWidth:300}]` with counts `{a:2,b:4}` give rects `a:{x:0,w:700}` and `b:{x:700,w:750}`, a width of `1450` and a height of `560`.
  - `portrait stacks`: the same input gives `a:{y:0,h:560}` and `b:{y:560,h:850}` with `w:400`.
  - `adding a book only grows its own region`: going from count 4 to 5 changes `b.w` but not `a`.
  - `pointAt`: on `[[0,0],[10,0],[10,10]]`, `t=0 → [0,0]`, `t=0.5 → [10,0]`, `t=0.75 → [10,5]`, and `t=2 → [10,10]`.
  - `inRanges([[5,9]], 9) === true` and `inRanges([[5,9]], 10) === false`.
- [ ] **Step 2: Run** the tests and confirm they fail. **Step 3: Implement both modules.** **Step 4: Run** the tests and confirm they pass.
- [ ] **Step 5: Commit** with the message `feat(reading): scroll layout and path helpers`.

### Task 5: Ink primitives and the generator page

**Files:**
- Create: `tools/reading-scroll/ink.mjs`, `tools/reading-scroll/render.html`, `tools/reading-scroll/render.mjs`, `tools/reading-scroll/regions/index.mjs`

**Interfaces:**
- Produces, in `ink.mjs`: `makeInk(ctx, seed) -> api`. `api` has `rng()`, `rr(a,b)`, `fbm(x,o)`, `fbm2(x,y,o)`, `paper(rect)`, `mountain(opts) -> top:[[x,y]]`, `mist(x,y,w,h,a)`, `hmist(x,w,a)`, `field(x,y,w,h,scale,fn)`, `house(x,y,w,h,d,opts)`, `person(x,y,s,kind,light)`, `cart`, `willow`, `pine`, `boat(x,y,w,light,lamp)`, `bridge(x0,x1,y)`, `cityWall`, `nightSky(rect)`, `moon(x,y,r)`, `prop(name, x,y,w,h, fallbackFn)`. These are ported from the mockup with the mockup's constants (kraft `#b3a994`, `fadeStrip` 晕染, cone peaks, `OB={dx:.62,dy:-.42}` oblique axis). All coordinates are relative to the passed rect, so painters work at any offset.
- `prop` draws `images/reading/props/<name>.webp` with `globalCompositeOperation='multiply'` if it was preloaded; otherwise it calls `fallbackFn`.
- Painter contract (used by Tasks 6–8). Each region module exports `paint(api, rect, region, places, orient) -> { road:[[x,y]], anchors:{[key]:[x,y]}, objects?:{[id]:[x,y]}, dark?:[[a0,a1]] }`. The road enters at the rect's leading edge and exits at its trailing edge (left→right in landscape, top→bottom in portrait), so roads chain. Ink tone scales with `region.density` (`tone × (0.7 + 0.6·density)`), so regions read more heavily inked the longer Jerry spent there. `regions/index.mjs` maps `painter` names to modules, starting with a `placeholder` painter that draws paper, one mountain and a road, and anchors places evenly.
- `render.mjs` exports `paintScene(reading, orient, seed) -> {canvas, sceneOrient}` (no tiles yet) and drives `render.html?orient=landscape|portrait&region=<id>&seed=`, which previews one region or the whole scroll on screen.

- [ ] **Step 1: Port the primitives** from the mockup into `ink.mjs` (drawing code only; drop the DOM labels and the couplet).
- [ ] **Step 2: Build `render.html`/`render.mjs`** with the placeholder painter for all regions.
- [ ] **Step 3: Verify** by serving the repo root with `npx --yes http-server -p 8765 -c-1` (or any static server) and opening `/tools/reading-scroll/render.html?orient=landscape`. Expected: kraft paper across the full width from Task 4's layout, a placeholder mountain per region, a continuous road and no console errors. Do the same with `?orient=portrait`: 400 px wide and stacked.
- [ ] **Step 4: Commit** with the message `feat(reading): ink primitives and generator page`.

### Task 6: 江湖 painters (山河, 市井, 古龙夜)

**Files:**
- Create: `tools/reading-scroll/regions/jianghu.mjs` (exports `shanhe`, `shijing`, `night`); register them in `index.mjs`.

**Interfaces:**
- Consumes: the painter contract (Task 5).
- Produces: anchors for every place in these regions.
  - `shanhe`: anchors 华山 on the steep double peak's flank, 光明顶 on a far ridge, 襄阳城 at the city wall gate, 桃花岛 at the island with peach dots, 大漠 on pale far dunes. Other places sit on secondary ridges.
  - `shijing`: the bird's-eye town from the mockup, with five receding rows, willows, courtyard walls, wine and tea banners, an arch bridge landing on both banks, boats and people.
  - `night`: `dark` covering its full extent, a moon with a halo, a rim-lit ridge, the lit inn with 酒 banner (小楼), a swordsman, and 恶人谷 as a dark valley.

- [ ] **Step 1: Port the mockup's 江湖 composition** into the three painters at landscape size. Fix the known mockup gaps: the bridge must touch both banks, the night ridge needs a visible moon rim, and boats on dark water need a lamp glow.
- [ ] **Step 2: Add portrait compositions.** The same elements are restacked vertically: peaks above, town rows below, the river running down the side, and the night as a tall moonlit band.
- [ ] **Step 3: Verify** `render.html?region=jianghu-shanhe` (then `shijing` and `night`) in both orients by screenshot, compared against the mockup. Expected: equal or better ink quality, no banding stripes, no hard vertical edges, and every anchor visually sitting on its landmark.
- [ ] **Step 4: Commit** with the message `feat(reading): 江湖 painters`.

### Task 7: 行囊 and 黄土与田野 painters

**Files:**
- Create: `tools/reading-scroll/regions/xingnang.mjs`, `tools/reading-scroll/regions/loess.mjs`

**Interfaces:** the painter contract. `xingnang` returns `objects` anchors for `compass`, `lamp` and `scale`, drawn as a small 清供 still life on a low table using procedural fallbacks for `prop('compass'|'lamp'|'scale')`. `loess` draws loess terraces and cave dwellings (窑洞) for 清平湾/双水村, Yunnan fields for 黄金时代, and a paddy with an old ox for 福贵的田. It writes 乡土中国 as a faint vertical inscription on the slope with `fillText`, and returns an anchor for 乡土中国 there.

- [ ] **Step 1: Implement both painters** in both orients.
- [ ] **Step 2: Verify** each with `render.html?region=` screenshots in both orients. Expected: 行囊 reads as three distinct objects, and 黄土 is visibly a different landscape from 江湖 (flat-topped terraces, not peaks).
- [ ] **Step 3: Commit** with the message `feat(reading): 行囊 and 黄土 painters`.

### Task 8: Remaining painters

**Files:**
- Create: `tools/reading-scroll/regions/snow.mjs`, `sea.mjs`, `whitenight.mjs`, `depths.mjs`, `stage.mjs`, `desert.mjs`, `macondo.mjs`

**Interfaces:** the painter contract, with this content:
- **snow**: snowfields in paper-light, a tunnel mouth, a mountain road (伊豆), and 金阁 with the scroll's single fire glow.
- **sea**: a horizon, a stone well, a pine forest.
- **whitenight**: a Petersburg bridge under a pale sky. It is not dark.
- **depths**: `dark` over part of the region, a high barred window, and a distant moon (月亮与六便士).
- **stage**: a simple stage with curtain folds.
- **desert**: strong light from a warmer paper tint (+4% warmth, no new hue), dunes, a camel, and the sea at the edge.
- **macondo**: rainforest with yellow butterflies `#d9b44a` at 0.7–0.9 alpha, the only non-ink color.

- [ ] **Step 1: Implement all seven painters** in both orients. Prop fallbacks are procedural.
- [ ] **Step 2: Verify** the whole scroll with `render.html?orient=landscape`, then `portrait`. Expected: regions chain with a continuous road, there are no seams at rect edges (use a shared mist band at each seam), and seal red appears nowhere in the painted layer.
- [ ] **Step 3: Commit** with the message `feat(reading): remaining region painters`.

### Task 9: Tile export and the scroll controller

**Files:**
- Create: `scripts/render-reading-scroll.cjs`, `js/reading/scroll.mjs`, `tests/reading/scroll.test.mjs`
- Output: `images/reading/tiles/{landscape,portrait}/{n}@2x.webp|{n}.webp`, `images/reading/lqip-{orient}.webp`, `images/reading/paper.webp`, `data/reading-scene.json`

**Interfaces:**
- The render script uses CDP on `localhost:9227` (same pattern as `scripts/check-project-pool.cjs`). It opens `render.html?export=1`, calls `window.exportScene(orient)` for each orient, and that returns `{sceneOrient, tiles:[{name, dataUrl2x, dataUrl1x}], lqipDataUrl, paperDataUrl}`. Tiles are cut every 1200 logical px along the scroll axis, encoded as WebP at quality 0.86. The LQIP is the whole strip at 1/16 scale. Paper is a seamless 512² kraft tile. The script writes the files and `data/reading-scene.json` in the `Scene` shape.
- Produces: `stepToward(cur, target, dtMs, halfLifeMs=120) -> number`; `wheelIntent({deltaX, deltaY, deltaMode}, pos, max, orient) -> {capture:bool, target:number}`; `createScrollController(viewport, {orient, reducedMotion, onFrame})`.

- [ ] **Step 1: Write the failing tests** in `scroll.test.mjs`:
  - `stepToward converges`: from 0 to 100 with `dt=120`, the result is `50`; `dt=0` gives `0`; `|target−cur| < 0.5` snaps to `target`.
  - `wheel captured mid-scroll`: `deltaY:100` at pos 500 of max 2000 in landscape gives `{capture:true, target:600}`.
  - `wheel released at end`: `deltaY:100` at pos 2000/2000 gives `capture:false`, and `deltaY:-100` at pos 0 also gives `capture:false`.
  - `horizontal trackpad passes through`: `deltaX:40, deltaY:5` gives `capture:false`.
  - `portrait never captures`: `capture:false`.
  - `deltaMode 1 (lines) scales by 16`.
- [ ] **Step 2: Run** the tests and confirm they fail. **Step 3: Implement `scroll.mjs`.** The controller runs one `requestAnimationFrame` loop, sets `viewport.scrollLeft`, and with reduced motion it jumps directly. **Step 4: Run** the tests and confirm they pass.
- [ ] **Step 5: Implement the render script and run it.** First start Chrome with `--remote-debugging-port=9227`, then run `node scripts/render-reading-scroll.cjs`. Expected: tiles are written, the total landscape `@2x` size is under 3 MB plus a reasonable scroll-ahead (report the number), and `reading-scene.json` has an anchor for every `places[].key` and every object.
- [ ] **Step 6: Commit** the script, controller, tests, `images/reading/**` and `data/reading-scene.json` with the message `feat(reading): tile export and scroll controller`.

### Task 10: The page

**Files:**
- Create: `reading.html`, `css/reading.css`, `js/reading/page.mjs`

**Interfaces:**
- Consumes: `data/reading.json`, `data/reading-scene.json`, `layout.mjs`, `path.mjs`, `scroll.mjs`, `numerals.mjs`.
- `reading.html` copies the shell of `about.html` (`body.atmo`, sidebar with `Reading` active, skip link, `page-title-ripple.js`). It has H1 `书卷`, one intro line (`我读过的书，画成一条往西走的路。`), then `<div class="scroll" data-orient>` holding the track.
- The orient is `portrait` when `matchMedia('(max-width: 767px)')` matches, and it re-renders on change.

- [ ] **Step 1: Track and tiles.** The track's background is the LQIP strip, stretched to full size, under the `paper.webp` repeat. There is one `<img loading="lazy" decoding="async">` per tile using `srcset` with `1x/2x`. Each tile fades in on load (opacity, 400 ms, site easing; instant with reduced motion). A failed tile simply stays hidden over the LQIP.
- [ ] **Step 2: Places.** Each is a `<button class="place">` positioned at its scene anchor, with vertical Noto Serif SC text and a seal `<span>` holding `读`. If `tiba` is present, the tiba shows on hover and focus: `quote` in ink-soft and `mine` in grey-green `#4d5c48`, or light variants inside `dark` ranges. Focus calls `scrollIntoView({inline:'center', block:'nearest'})`. Use the 行囊 object labels from `objects`. The 加缪→三毛 `links` draw as an inline SVG faint ink curve with the note centered along it.
- [ ] **Step 3: Traveler.** An inline SVG figure (the mockup's straw-hat walker) is placed with `pointAt(scene.road, progress)`, where `progress = scrollPos / max`. It uses the light fill when `inRanges(scene.dark, scrollAxisPos)`. Updates go through the controller's `onFrame` and transforms only.
- [ ] **Step 4: Spine wall (书房).** This is DOM after the painted strip, on the paper tile. There is one spine per `study` book, with height fixed by the shelf, width `clamp(10px, wordCount/25000 px, 46px)` (default 18 px when null), tone varied ±6% by key hash, and a vertical title. Hovering lifts it 4 px (the site's `translateY` interaction, not scale) and shows title and author.
- [ ] **Step 5: Colophon (卷尾跋).** A vertical text block in Noto Serif SC: `读书凡{hours}小时，{readDays}日。书{booksRead}部，笔记{notes}条。` with each number passed through `toChineseNumeral`, and a small seal `书卷` beneath.
- [ ] **Step 6: Verify on desktop at 1440×900.** Scroll the whole scroll with the wheel: it should be smooth and inertial, and at the end the page continues scrolling vertically. Hover 华山 to see its tiba. Tab through the places: each scrolls into view with its tiba visible. Take screenshots of 江湖, the desert link and the colophon.
- [ ] **Step 7: Verify at 375×812 and 320×720.** The portrait scroll scrolls natively, the traveler walks downward, there is no horizontal page overflow, and the identity and H1 appear before the scroll in the first viewport.
- [ ] **Step 8: Verify reduced motion** (emulated): no inertia and instant fades. **Verify a missing tile**: block one tile URL in DevTools, and the LQIP shows there with the labels intact.
- [ ] **Step 9: Commit** with the message `feat(reading): reading scroll page`.

### Task 11: Site integration and the props hand-off

**Files:**
- Modify: the 29 HTML files containing `class="nav-links"` (`grep -l 'class="nav-links"' -r --include=*.html .`, excluding `.superpowers`)
- Create: `images/reading/props/PROMPTS.md`

- [ ] **Step 1: Insert the nav link** `<a class="nav-link" href="{rel}reading.html">Reading</a>` immediately after the Projects link in every file, with `{rel}` matching how that file's other nav links are prefixed (`../`, `../../` or none). Do not touch `index.html`'s editorial entries.
- [ ] **Step 2: Verify** `grep -L 'reading.html' $(grep -l 'class="nav-links"' -r --include=*.html . | grep -v .superpowers)`. Expected: empty output. Open one blog post and one field note, and confirm the link resolves.
- [ ] **Step 3: Write `PROMPTS.md`.** Write one prompt per prop: `inn-moon, golden-pavilion, cave-dwellings, old-ox, well, petersburg-bridge, high-window, camel-dunes, butterflies, compass, lamp, scale`. Each is ink-only on flat kraft `#b3a994`, has no text or border, is a single subject with generous paper margin, and is tied to the 清明上河图/ink language. State the output name `<prop>.webp`, the folder, and the command to re-render (`node scripts/render-reading-scroll.cjs`).
- [ ] **Step 4: Run** `node --test tests/reading/`. Expected: all pass.
- [ ] **Step 5: Commit** with the message `feat(reading): add Reading to site nav and props prompts`.
