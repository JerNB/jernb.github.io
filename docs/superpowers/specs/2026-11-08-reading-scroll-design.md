# Reading Scroll (书卷) — Design

Date: 2026-11-08 · Status: overall plan approved by Jerry 2026-11-08; this document awaits his sign-off

## 1. Intent

Jerry reads on WeChat Reading (微信读书) and wants his reading life on the personal site as something to *look at and wander*, not a stats dashboard. The page is a horizontal ink handscroll, a "spiritual geography": every book Jerry has read becomes a place along one traveler's journey, and the regions are reading moods, not genres. A visitor should come away knowing how Jerry's taste runs (Gu Long to Murakami to Camus), which lines he underlined, and that he reads a lot. Reading statistics are present but quiet.

The page belongs to the site's "Thinker" side and must fit `DESIGN_ITERATION_MAP.md`: "stillness with a pulse", ink and water, evolve the site rather than rebuild it.

## 2. Goals / non-goals / anti-goals

**Goals**
- One new page, `reading.html`, with a horizontally scrolling ink scroll on desktop and a vertical hanging scroll (立轴) on mobile.
- Data comes from WeChat Reading through a local sync script plus a hand-written curation file.
- Scrolling is smooth: no generation work at page load, and the heavy imagery is pre-rendered.
- A tiny traveler walks along the road as the visitor scrolls. Jerry explicitly loves this.

**Non-goals**
- Live data in the browser. The API key never leaves Jerry's machine.
- Notes and highlights browsing, search, filters or per-book pages.
- Books Jerry has not read (想读). They are a possible later extension, shown as faint, unsealed places.

**Anti-goals** (the page fails if any of these happen, even if it technically works)
- It looks like a dashboard: KPI tiles, charts, card grids.
- It looks like a game map or a generic data visualization rather than ink painting.
- Private content leaks: private books, or thoughts Jerry did not mark public.
- Scrolling stutters, or the page shows a blank strip for seconds while it loads.
- It carries the 金庸 couplet at the head of the scroll. Jerry rejected it.

## 3. Approved visual direction

The reference is the approved mockup `.superpowers/brainstorm/1848-1794160411/content/jianghu-v1.html` (git-ignored; copy whatever the builder needs).

- **Paper**: grey kraft (base about `#b3a994`), with fibers and soft blotchy tone. Highlights such as the moon, lamplight and snow may be lighter than the paper (`#e6dcc4`).
- **Ink**: heavy layered ridges (mockup style "B"). Ink pools under each ridge and bleeds downward (晕染), with 皴 stroke texture and a pressure-varied brush ridge line. Near layers are dark and far layers fade into mist.
- **Ink color** `#1e1b17` (never pure black) and **seal red** `#9b3a2a`. Seal red is the single accent in a viewport. The only exception is the 马孔多 yellow butterflies.
- **Market life (市井)**: in the spirit of 清明上河图, but not a copy of any section of it. Use a bird's-eye viewpoint with rows of houses receding upward, smaller and paler, and 界画-style oblique parallel projection with no vanishing point. Add tiny people (pole carriers, umbrellas, straw hats, swordsmen), ox carts, willows, courtyard walls, wine and tea banners, an arch bridge and boats.
- **Type**: Noto Serif SC for vertical place names and 题跋 (inscriptions), and the site's existing Cormorant Garamond / Inter for page chrome.
- **Night**: a cloudy ink-wash sky, a moon with a halo, black ridges, and lit windows and lamps as warm glows.

## 4. Content structure

The journey heads **west** (China → Japan → Russia → Europe → Africa → South America), and on screen the scroll **unrolls left to right**. Jerry approved this with the overall plan on 2026-11-08; it is not a map orientation. Even so, keep direction a single layout constant so it stays cheap to flip.

| # | Section | Books | Key imagery |
|---|---|---|---|
| 1 | 行囊 | Functional books, grouped on objects: 罗盘 = 猜想与反驳; 灯 = 思考，快与慢, 助推; 秤 = 芒格之道, 纳瓦尔宝典. Future finance books go on 秤. | A small 清供 still life of travel gear |
| 2 | 江湖 · 金庸山河 | All 15 金庸 novels as places: 华山, 光明顶, 襄阳城, 桃花岛, 大漠 … | Steep double peak, city wall, island with peach dots |
| 2b | 江湖 · 市井 | (a transition zone; it can host minor 金庸/古龙 places) | 清明上河图-style town and river |
| 2c | 江湖 · 古龙夜 | 小李飞刀, 绝代双骄 (4 vols as one place), 陆小凤, 楚留香 (a boat) | Moon, lone lit inn, swordsman |
| 3 | 黄土与田野 | 王小波: 黄金时代, 地久天长, 沉默的大多数, 一只特立独行的猪, 革命时期的爱情; 史铁生: 我的遥远的清平湾; 路遥: 平凡的世界; 余华: 活着 | Sub-places 黄金时代 (Yunnan fields), 清平湾/双水村 (loess and cave dwellings), 福贵的田 (old ox, paddy). 乡土中国 is a faint vertical inscription on the slope, not a place. |
| 4 | 雪国 | 雪国, 伊豆的舞女 (川端); 春雪, 金阁寺 (三岛) | Snow, tunnel, mountain road, the golden pavilion burning (the one fire on the scroll) |
| 5 | 海边与深井 | 挪威的森林, 且听风吟, 国境以南 太阳以西, 海边的卡夫卡 | Sea, well, forest |
| 6 | 白夜之城 | 白夜 | Petersburg bridge, white night |
| 7 | 深处 | 自深深处, 月亮与六便士 | High prison window, distant moon |
| 8 | 舞台 | 阳光下的葡萄干, 表象与现实 | A stage (a quiet nod to Jerry the performer) |
| 9 | 荒漠与大海 | 我身上有个不可战胜的夏天, 局外人 (加缪); 撒哈拉的故事 (三毛) | Mediterranean light. The scroll warms slightly here. A faint ink line joins 加缪 and 三毛, carrying Jerry's note 「想到了三毛」 |
| 10 | 马孔多 | 百年孤独 | Rainforest and yellow butterflies, the one place with color |
| 11 | 书房 | All read books as a spine wall | Spine thickness = book length (word count) |
| 12 | 卷尾跋 | Reading stats | Vertical colophon text: total hours, reading days, books read, notes |

The pool is about 51 books. Books marked private on WeRead are never shown.

## 5. Data

### 5.1 Sources
- **WeChat Reading API** via `POST https://i.weread.qq.com/api/agent/gateway`, `Authorization: Bearer $WEREAD_API_KEY`, `skill_version` per the installed `weread-skills` SKILL.md. Endpoints:
  - `/shelf/sync` for books, covers, `finishReading` and `secret`
  - `/readdata/detail` with `mode=overall` for `totalReadTime` (in seconds), `readDays`, `readStat`, and `readLongest` (per-book hours, top 10 only)
  - `/readdata/detail` with `mode=annually` per year for richer per-book hours where available
  - `/user/notebooks` for per-book counts
  - `/review/list/mine` for Jerry's thoughts (`content` and `abstract`)
  - `/book/bookmarklist` for highlights
  - `/store/search` to resolve books that are not on the shelf (金庸, 活着, 平凡的世界, 局外人) to cover, author and bookId
  - `/book/info` for `wordCount` (spine thickness)
- **Curation file** `data/reading-curation.json`, written by hand and committed:
  - `regions[]`: id, name, order, sub-places
  - `books[]`: title or bookId, region, place name (e.g. 华山), status override (`read`), `tibaReviewId` or `tibaQuote` to pick the inscription, `public: true` on individual thoughts
  - `manual[]`: books outside the shelf, resolved via search
  - `objects[]`: 行囊 objects and their books

### 5.2 Rules
- A book is "read" if WeRead `finishReading=1` or the curation marks it `read`. The curation always wins.
- `secret=1` books are never emitted.
- **Thoughts are private by default.** Only thoughts whose id is listed in the curation are emitted. When a book has no public thought, its 题跋 falls back to one of Jerry's own highlights (the curation may pin which one). Highlights are quotes from the book, not Jerry's words; they are public by default but can be turned off per book.
- **题跋 for books with no WeRead notes** (金庸, 活着, 平凡的世界, 局外人 …): the curation may hold an optional `tiba` line written by Jerry; without one, the place shows only its name and seal. Launch does not wait on this content. *(my call)*
- **New finished books**: regions are append-only with fixed slots plus slack, so adding a book never shifts other regions. A finished book that is missing from the curation goes to the 书房 spine wall only, and sync prints a warning listing it. Tiles are re-rendered only when the curation or the painter changes, not on every sync. *(my call)*
- **Colophon totals exclude private books**: subtract their hours (from `readLongest`) and their notes (from `/user/notebooks`). Reading days can't be split, so they stay account-wide. *(my call)*
- Ink density per region comes from the sum of known reading hours. Books with no WeRead hours (read elsewhere) get a medium default so they never look unread.

### 5.3 Sync
- `scripts/sync-weread.mjs` (Node 24, no npm deps, the same style as `scripts/check-project-pool.cjs`). Jerry runs it locally and it reads `WEREAD_API_KEY` from the environment.
- Output: `data/reading.json`, committed. This is the only file the page reads. It is deterministic and sorted, so diffs stay readable.
- If any response includes `upgrade_info`, the script stops and prints it.
- GitHub Actions scheduling is a later option, not part of this build.

## 6. Rendering architecture (the hybrid approach Jerry picked)

**Why pre-render:** the mockup generated everything at load, which took about 2–3 s and made scrolling feel sticky. Jerry asked for it to feel 丝滑.

1. **Generator page** `tools/reading-scroll/render.html`: the seeded procedural painter (paper, ridges, 晕染, 皴, mist, market town, people, boats, night). It reads `data/reading.json` (region extents, ink density) and composites AI-painted prop images.
2. **Render script** `scripts/render-reading-scroll.cjs`: drives local Chrome/Edge over the DevTools protocol (the existing pattern in this repo). It renders the generator at 2× and exports **WebP tiles** (for example 1200 px wide segments, plus a 1× set) for the desktop strip and a separate vertical layout for mobile. The tiles go to `images/reading/`.
3. **Page** `reading.html` with `css/reading.css` (or a section in `style.css`) and `js/reading-scroll.js`:
   - Tiles are lazy-loaded with `IntersectionObserver`. A blurred low-quality placeholder of the whole strip loads first, so the visitor never sees a blank strip.
   - Live DOM layer: place names (vertical serif), seals, 题跋 on hover or focus, the colophon, the 行囊 object labels and the spine wall. All of it is real text, selectable and accessible.
   - **Traveler**: a tiny SVG figure that follows a precomputed road path (exported by the generator as a polyline in `reading.json`). Its position is driven by scroll progress, and it switches to the light variant in night sections.
   - **Scroll feel**: on desktop, vertical wheel input maps to horizontal movement through a lerped `requestAnimationFrame` loop (inertia and gentle damping). Native horizontal scroll, trackpad and drag still work. Only `transform` and `opacity` are animated.
   - **Mobile (< 768 px)**: a vertical 立轴 using the mobile tile set and native vertical scrolling. The traveler walks downward.
   - **Reduced motion**: no inertia, the traveler jumps between places, and hover fades are instant.
4. **AI-painted props**: generated with imagegen (Jerry's existing workflow, with prompts recorded like `images/ai-cashflow-chapter-prompts.md`) on the same kraft paper color. They are composited with multiply in the generator, so no cut-outs are needed. Initial set: inn under the moon, 金阁, cave dwellings, old ox, well, Petersburg bridge, high window, camel and dunes, yellow butterflies, and the three 行囊 objects. **v1 ships with procedural stand-ins for every prop** (Jerry's decision, 2026-11-08). Claude has no image generator, so Jerry generates the props in Codex. The build delivers `images/reading/props/PROMPTS.md` (one prompt per prop, kraft paper color `#b3a994`, ink-only, no text), a drop folder `images/reading/props/`, and a generator that uses `<prop>.webp` when present and the procedural stand-in otherwise. Swapping a prop in means re-running the render script.

## 7. Site integration
- Add a "Reading" link to the sidebar nav of every page that has the sidebar (including blog posts and field notes), between Projects and Performance. The homepage's five editorial entries stay untouched, since they are a protected composition. *(my call)*
- Use the existing `body.atmo` shell, sidebar, `page-title-ripple.js` on the H1, and the existing easing and duration tokens.
- The page header stays quiet: H1 「书卷」 / "Reading", plus one line of intro. The scroll is the hero.
- Keyboard: Tab moves between places, and focus shows the 题跋 and scrolls the place into view.

## 8. Open items for the builder
- **Per-book hours** beyond the overall top 10: check what `annually` responses provide. Fall back to defaults.
- **Region widths**: proportional to book count, with a minimum width per region.
- **Tile format and size budget**: aim for under 3 MB total on desktop for first view plus scroll-ahead.
- **Exact place names** for each 金庸 novel. Draft them; Jerry edits them in the curation file.

## 9. Approaches considered

| Approach | Trade-off | Verdict |
|---|---|---|
| A. Fully AI-painted panels with text overlaid | Best brush texture, but hard to keep consistent, can't reflect data, heavy, and needs new images for every new region | Rejected |
| B. Fully procedural SVG/canvas | Data-driven and light, but hard to get true brushwork, and it can't draw specific landmarks well | Rejected |
| **C. Hybrid**: procedural terrain and town, AI-painted props, real text | Data stays live where it matters and has brushwork where character matters; the cost is blending two techniques | **Chosen by Jerry** |

Within C, the build adds pre-rendered tiles instead of in-browser generation. That is my call, made for smoothness.

## 10. Calls I made (please check)
1. Scroll direction is left to right, east to west.
2. Page name and nav position: `reading.html`, "Reading", between Projects and Performance.
3. Thoughts are private by default and shown only when listed. Highlights are public by default.
4. Stats appear only in the closing 卷尾跋 colophon, never as a dashboard.
5. Spine thickness uses book length, not reading hours.
6. The heavy imagery is pre-rendered into tiles by a local script, not generated in the browser.
