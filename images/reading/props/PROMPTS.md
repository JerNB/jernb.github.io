# 书卷 · prop paintings (for Codex imagegen)

The reading scroll draws every landmark below with code. Any prop you paint here replaces the code version. Nothing breaks if a prop is missing.

## How to swap one in

1. Generate the image from the prompt below. Use the shared style block, then the subject line.
2. Save it here as `<name>.webp`. Keep the background flat kraft: no transparency and no cut-out. The scroll blends it in with *multiply*.
3. Add `"<name>"` to `manifest.json` in this folder, for example `["inn-moon", "well"]`.
4. Re-render the scroll with `node scripts/render-reading-scroll.cjs`, then commit `images/reading/` and `data/reading-scene.json`.

## Shared style (prefix every prompt)

> Chinese ink-wash painting (水墨) on flat grey kraft paper, exact background color #b3a994, filling the whole canvas edge to edge. Ink only: warm charcoal #1e1b17 in many dilutions, ink pooling under ridgelines and bleeding downward (晕染), dry-brush texture strokes (皴). No color except where noted. Single subject centered with generous empty paper around it. No text, seals, signatures, frames, borders, vignettes, or shadows. Not a photo, not 3D, not digital-gloss. In the spirit of Song-dynasty 界画 and 清明上河图 line work, without copying any specific painting.

## Props

| name | size | where | subject |
|---|---|---|---|
| `inn-moon` | 900×800 | 古龙 · 夜 (小楼) | A two-storey wayside inn at night, its paper windows glowing warm, a wine banner with an empty flag beside the door, a lantern at the eave. The surrounding paper is darkened with night ink wash. The warm window glow may use a faint amber, #ecd08c. |
| `golden-pavilion` | 900×850 | 雪国 (金阁) | A three-tiered Japanese pavilion over a pond in light snow, catching fire: thin amber-red flame and embers rising (#d6783c allowed for the fire only), reflection in the pond. |
| `cave-dwellings` | 900×500 | 黄土 (清平湾) | Loess cliff with four arched cave dwellings (窑洞), lattice doors, a millstone, eroded gullies, terraced fields above. |
| `old-ox` | 600×350 | 黄土 (福贵的田) | An old water buffalo standing in a flooded paddy, head lowered, an old farmer in a straw hat beside it. |
| `well` | 300×280 | 海边与深井 | A round stone well in a pine forest clearing, the opening a deep black circle. |
| `petersburg-bridge` | 1400×550 | 白夜之城 | A stone canal bridge with iron lamp posts on a pale white night, two small figures on it, onion domes faint in the distance. Very light ink, no darkness. |
| `high-window` | 400×500 | 深处 | A small barred window high in a dark prison wall, a pale shaft of light falling diagonally. |
| `camel-dunes` | 900×500 | 荒漠与大海 (撒哈拉) | A camel resting beside a small nomad tent among soft dunes, long shadows, strong light. |
| `butterflies` | 1600×1300 | 马孔多 | A cloud of small butterflies over rainforest canopy. Butterflies in ochre yellow #d9b44a (the only color allowed), everything else ink. |
| `compass` | 500×550 | 行囊 (罗盘) | A Chinese geomancer's compass (罗盘) on a square wooden base, concentric rings, one thin red needle (#9b3a2a allowed). |
| `lamp` | 500×550 | 行囊 (灯) | A tall bronze oil lamp with a single small flame and soft glow (#ecd08c allowed for the flame). |
| `scale` | 500×550 | 行囊 (秤) | A Chinese steelyard (杆秤) hanging from a stand: beam, hook, small pan, sliding weight. |
