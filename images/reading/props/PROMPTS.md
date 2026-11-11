# 书卷 · 图片素材清单（给 Codex 生图用）

卷轴上的每个景物现在都是代码画的。下面任何一张图画好放进来，就会替换掉对应的代码版本；缺哪张都不会坏。

一共 21 张，分三组：

- **A 组（9 张）**：槽位已经接好，放进来重新渲染就生效。
- **B 组（8 张）**：白天场景的新素材，尺寸和位置我已经定好，图到了我来接槽位。
- **C 组（4 张）**：夜景素材，底色和混合方式跟前两组不同，图到了我来接槽位。

建议先画 A 组里的 `butterflies`、`golden-pavilion`、`compass` 三张试一下风格，满意再画其余的。

---

## 一、所有图片都要遵守的规则

### 1. 生成尺寸和成品尺寸

生图模型只出三种尺寸，所以每张图分两步：

1. 按表里写的「生成尺寸」出图：横图 `1536×1024`，方图 `1024×1024`，竖图 `1024×1536`。
2. 按表里的「成品尺寸」居中裁切并缩放，存成 WebP（质量 90）。成品尺寸是它在卷轴上实际占位的 5 倍，足够 2 倍屏清晰。

裁切时主体必须完整留在画面里，所以每条提示词都要求主体只占画面中间一部分。

### 2. 底色（最重要）

- **A、B 组**：整张画布铺满纯色牛皮纸底，颜色精确为 `#b3a994`，不要透明底，不要抠图。卷轴用「正片叠底」把图融进纸里，底色不对会出现一块方形色差。
- **C 组（夜景）**：整张画布铺满纯黑 `#000000`，画面里只有亮的东西（灯火、月光勾出的轮廓）。卷轴用「滤色」把亮部叠到夜色上，黑色部分会自动消失。

### 3. 四边必须是空的

主体四周至少留 12% 的纯底色，墨色在靠近边缘前就要淡出干净。任何碰到画布边缘的笔触，上了卷轴都会变成一条直线切边。

### 4. 画风

- 水墨：只用暖炭黑 `#1e1b17` 的浓淡变化，有晕染、有枯笔皴擦。
- 建筑用界画的细线勾勒，斜向平行透视（能看到正面和右侧面），不要西式焦点透视。
- 不要文字、印章、落款、边框、暗角、投影。
- 不是照片，不是 3D，不要数码光泽。
- 除了表里注明「允许的颜色」，一律不上色。

### 5. 共用提示词前缀

A、B 组每条提示词前面加这一段：

> Chinese ink-wash painting (水墨) on flat grey kraft paper, exact background color #b3a994 filling the whole canvas edge to edge, completely uniform, no texture gradient. Ink only: warm charcoal #1e1b17 in many dilutions, ink pooling and bleeding softly (晕染), dry-brush texture strokes (皴). Buildings drawn with fine ruled 界画 line work in oblique parallel projection showing the front and the right side. Single subject centered, occupying only the middle of the canvas, with at least 12% empty flat background on every side; all ink fades out before reaching any edge. No text, no seals, no signature, no frame, no border, no vignette, no cast shadow on the ground. Not a photo, not 3D, not glossy.

C 组每条提示词前面加这一段：

> Night scene elements on a pure black background, exact color #000000 filling the whole canvas edge to edge. Paint only what is lit: warm lamplight #ecd08c, and thin pale outlines #e6dcc4 where moonlight catches an edge, in the manner of Chinese ink painting reversed (light on dark). Everything unlit stays pure black. Single subject centered, occupying only the middle of the canvas, with at least 12% pure black on every side; all light fades out before reaching any edge. No text, no seals, no signature, no frame, no border. Not a photo, not 3D, not glossy.

### 6. 放进卷轴

1. 成品存到本文件夹，文件名用表里的名字，例如 `butterflies.webp`。
2. 把名字加进本文件夹的 `manifest.json`，例如 `["butterflies", "compass"]`。
3. 运行 `node scripts/render-reading-scroll.cjs` 重新渲染，再提交 `images/reading/` 和 `data/reading-scene.json`。

---

## 二、A 组：槽位已接好（9 张）

| 文件名 | 所在地区 | 卷轴占位 | 生成尺寸 | 成品尺寸 | 允许的颜色 |
|---|---|---|---|---|---|
| `compass` | 行囊 · 罗盘 | 100×110 | 1024×1024 | 500×550 | 指针朱红 `#9b3a2a` |
| `lamp` | 行囊 · 灯 | 100×110 | 1024×1024 | 500×550 | 火苗暖黄 `#ecd08c` |
| `scale` | 行囊 · 秤 | 100×110 | 1024×1024 | 500×550 | 无 |
| `cave-dwellings` | 黄土 · 清平湾 | 180×100 | 1536×1024 | 900×500 | 无 |
| `old-ox` | 黄土 · 福贵的田 | 120×70 | 1536×1024 | 600×350 | 无 |
| `golden-pavilion` | 雪国 · 金阁 | 180×170 | 1024×1024 | 900×850 | 火焰橙红 `#d6783c` |
| `well` | 海边 · 甲村图书馆旁 | 60×56 | 1024×1024 | 300×280 | 无 |
| `camel-dunes` | 荒漠 · 撒哈拉 | 180×100 | 1536×1024 | 900×500 | 无 |
| `butterflies` | 马孔多 | 320×260 | 1536×1024 | 1600×1300 | 蝴蝶赭黄 `#d9b44a` |

三件器物（罗盘、灯、秤）要像同一套：同样的视角（略俯视的正面），同样的墨色轻重，都立在画面正中，底部不画桌面。

**compass（罗盘）**
形状：圆盘嵌在方形木座里，整体接近正方，略带俯视所以圆盘呈扁椭圆。
> A Chinese geomancer's compass (罗盘) seen slightly from above: a round brass dial set into a square wooden base, four or five concentric rings of tiny tick marks (marks only, no readable characters), a small glass well in the center holding one thin needle. The needle is the only color: seal red #9b3a2a. Wood grain suggested with a few dry strokes. The object fills about 60% of the canvas width.

**lamp（灯）**
形状：瘦高，高约为宽的 2.5 倍。
> A tall slender bronze oil lamp (青铜油灯) on a round foot: a thin stem, a shallow dish on top, one small flame. The flame is the only color, warm yellow #ecd08c, with a faint soft halo of the same color no wider than the dish. Patina suggested with pooled ink. The lamp fills about 75% of the canvas height and stands exactly in the center.

**scale（秤）**
形状：一个小木架吊着横杆，整体宽大于高。
> A Chinese steelyard (杆秤) hanging from a small wooden stand: a long thin beam with fine graduation dots, a hook at one end holding a shallow round pan on three cords, a small sliding weight hanging on a string toward the other end, the beam tilted slightly. Drawn with fine even lines. The object fills about 70% of the canvas width.

**cave-dwellings（窑洞）**
形状：横向长条，一面黄土崖。
> A loess cliff face in northern Shaanxi with four arched cave dwellings (窑洞) in a row, each with a lattice wooden door and window filling the arch, a stone millstone in the yard in front, a low mud wall, deep eroded gullies cut into the cliff with vertical dry-brush strokes, a strip of terraced field on top. The cliff occupies the middle 70% of the canvas width and fades into bare paper at both ends.

**old-ox（老牛）**
形状：横向，牛和人并排，下面是水田。
> An old water buffalo standing in a flooded rice paddy, head lowered, ribs showing, and beside it an old farmer in a wide straw hat holding the rope. A few horizontal strokes for the water and their broken reflections. Figures small and quiet, together filling about 50% of the canvas width.

**golden-pavilion（金阁）**
形状：接近正方，三层楼阁，下面有水中倒影。
> A three-storey Japanese pavilion standing over a still pond in light snow, deep upturned eaves, snow lying on each roof, a phoenix finial on top. It is catching fire: thin flames and embers rise from the upper storey. The fire is the only color, amber red #d6783c, and its glow tints the nearest snow faintly. The broken reflection of the pavilion and the fire lies in the pond below. Two or three snow-laden pine branches at one side. The pavilion fills about 55% of the canvas height.

**well（井）**
形状：小而扁的圆柱。
> A low round stone well in a forest clearing seen slightly from above: a ring of rough stone blocks, the opening a deep solid black ellipse, a few blades of grass and pine needles around its foot. The well fills about 55% of the canvas width.

**camel-dunes（骆驼与帐篷）**
形状：横向，左边帐篷，右边骆驼。
> A low black nomad tent with several peaks and guy ropes, pitched between soft sand dunes, and to its right a single camel kneeling at rest. Dunes drawn with two or three long thin curving lines only, a great deal of empty paper to suggest glare, short dark shadows directly under the tent and the camel. Together they fill about 65% of the canvas width.

**butterflies（黄蝴蝶）**
形状：一团不规则的云，上疏下密，没有清晰边界。
> A drifting cloud of about one hundred small butterflies seen from far away, densest in the lower middle of the canvas and thinning out upward and sideways into single stragglers. Each butterfly is two tiny wing dabs in ochre yellow #d9b44a, the only color; sizes vary, some slightly blurred as if in motion. No trees, no ground, nothing else on the canvas. The cloud stays inside the middle 75% of the canvas.

---

## 三、B 组：白天场景的新素材（8 张，图到后我来接槽位）

| 文件名 | 所在地区 | 卷轴占位 | 生成尺寸 | 成品尺寸 | 允许的颜色 |
|---|---|---|---|---|---|
| `bundle` | 行囊 · 包袱斗笠 | 160×120 | 1536×1024 | 800×600 | 无 |
| `winehouse` | 市井 · 酒楼（三栋共用） | 130×110 | 1536×1024 | 650×550 | 无 |
| `siheyuan` | 黄土 · 胡同 | 220×130 | 1536×1024 | 1100×650 | 无 |
| `factory` | 黄土 · 豆腐厂 | 200×140 | 1536×1024 | 1000×700 | 无 |
| `snow-house` | 雪国 · 松枝家 | 160×120 | 1536×1024 | 800×600 | 无 |
| `petersburg-quay` | 白夜之城 | 420×180 | 1536×1024 | 2100×900 | 路灯暖白 `#f0e8d2` |
| `casbah` | 荒漠 · 阿尔及尔 | 200×150 | 1536×1024 | 1000×750 | 无 |
| `macondo-house` | 马孔多 · 布恩迪亚家 | 200×140 | 1536×1024 | 1000×700 | 无 |

**bundle（行囊）**
形状：横向一组静物，高低错落。
> A traveler's kit resting on the ground: a cloth bundle tied with a knot, a wide conical bamboo hat leaning against it, a wooden walking staff lying across, a gourd flask on a cord. Loose wet brushwork for the cloth, fine lines for the hat's weave. The group fills about 60% of the canvas width.

**winehouse（酒楼）**
说明：松鹤楼、回雁楼、扬州茶馆三栋楼共用这张图，招牌上的字由代码写，所以招牌必须留空。
形状：两层楼，宽略大于高，左侧挂一块竖长的空白招牌。
> A two-storey Song-dynasty wine house: grey tiled hip-and-gable roofs with gently curved eaves on both storeys, an open upper balcony with a railing where two or three tiny figures sit drinking, an open shopfront below with a counter, three paper lanterns under the eave, and a tall narrow blank signboard hanging from a bracket on the left side of the building, completely empty with no writing. A blank banner on a pole at the right. The building fills about 60% of the canvas width.

**siheyuan（胡同四合院）**
形状：横向长条，一道灰砖墙，中间偏左是门楼。
> A stretch of old Beijing hutong wall seen from the lane: a long grey brick wall with visible brick courses, a small gatehouse with a tiled roof and a dark double door set left of center, two round stone drum blocks at the door and one step, the low grey tiled roofs of the courtyard rooms showing above the wall, one large bare locust tree rising from inside the yard, and an old bicycle leaning against the wall to the right of the door. 1970s, quiet, no people. The wall fills about 75% of the canvas width and fades into bare paper at both ends.

**factory（豆腐厂）**
形状：横向，厂房在左，右边一根高烟囱，烟向右上飘。
> A small 1970s Chinese brick workshop: a long low building with a saw-tooth roof of four teeth, tall many-paned windows, a plain door, and to its right one tall round brick chimney with banding. Thin smoke leans from the chimney toward the upper right and dissolves into the paper as soft diluted ink. The building fills about 50% of the canvas width; the chimney reaches about 75% of the canvas height.

**snow-house（雪中的日式宅邸）**
形状：横向，两层木屋，屋顶宽大。
> A two-storey traditional Japanese wooden residence in snow: wide low roofs with deep eaves, thick snow lying on both roofs left as bare unpainted paper edged with a thin ink line, paper shoji screens in a fine grid between dark wooden posts, a raised veranda running along the front, one stone lantern capped with snow in the garden, one pine with snow on its boughs. The house fills about 55% of the canvas width.

**petersburg-quay（涅瓦河畔）**
说明：这张最宽，替换白夜整段的近景。
形状：很扁的横幅，下沿是花岗岩河堤。
> A stretch of Saint Petersburg embankment on a white night, drawn in very light diluted ink, nothing dark: on the left a three-storey neoclassical palace front with ranks of tall windows and a columned pediment; on the right a small church with one large and two small onion domes topped with crosses; bare linden trees between them; along the whole bottom a granite quay wall of coursed blocks with a cast-iron railing and four lamp posts. The lamps are the only color, a faint warm white #f0e8d2 glow. At the railing in the middle stand two tiny figures, a man and a woman under one umbrella. Behind everything, very pale, a distant skyline with one thin needle spire. The scene fills the middle 80% of the canvas width and sits in the lower two thirds; the top third is empty paper.

**casbah（阿尔及尔白城）**
形状：下宽上窄的一堆方盒子，像一座小山。
> The old casbah of Algiers seen from across the bay: dozens of small flat-roofed cubic houses stacked up a steep hill, narrowing toward the top, tiny dark square windows and arched doors, a few small domes, one square minaret rising above the roofs. Walls left almost as bare paper with thin outlines, so the town reads as white in strong sunlight; only the right-hand side of each cube carries a pale wash. The town fills about 55% of the canvas width and 65% of its height.

**macondo-house（布恩迪亚家）**
形状：横向，一栋大屋带两栋小屋，后面一棵大树。
> A village house in the Colombian lowlands a century ago: a long low adobe house with cracked mud walls and a steep shaggy palm-thatch roof, a veranda along the front with wooden posts and a hammock, two smaller thatched huts beside it, a great chestnut tree spreading over the courtyard, banana plants with broad leaves at the corners. Wet, heavy tropical ink for the foliage, dry ragged strokes for the thatch. The group fills about 65% of the canvas width.

---

## 四、C 组：夜景素材（4 张，黑底，图到后我来接槽位）

注意：这组用的是 C 组前缀，底色纯黑，只画亮的部分。

| 文件名 | 所在地区 | 卷轴占位 | 生成尺寸 | 成品尺寸 |
|---|---|---|---|---|
| `inn-moon` | 古龙夜 · 小楼 | 180×160 | 1024×1024 | 900×800 |
| `plum-manor` | 古龙夜 · 万梅山庄 | 240×140 | 1536×1024 | 1200×700 |
| `pleasure-boat` | 古龙夜 · 香帅的船 | 180×120 | 1536×1024 | 900×600 |
| `high-window` | 深处 · 高窗 | 120×300 | 1024×1536 | 480×1200 |

**inn-moon（小楼）**
形状：接近正方，两层小楼。
> A two-storey wayside inn at night: every paper window glows warm #ecd08c, the open door spills a soft pool of the same light onto the ground, one lantern hangs at the corner of the eave. The roof tiles, eaves and walls are shown only by thin pale outlines. A blank wine banner on a pole beside the door, outlined, with no writing. The inn fills about 50% of the canvas width.

**plum-manor（万梅山庄）**
形状：横向，一道矮墙，中间一个圆月门。
> A walled garden at night: a long low wall shown by a thin pale line along its top, a round moon gate in the middle glowing warm #ecd08c from the lit hall behind it, and three old plum trees in full blossom rising above the wall, their gnarled branches thin pale lines, their blossoms hundreds of tiny pale #e6dcc4 dots. A few petals falling. The wall fills about 70% of the canvas width.

**pleasure-boat（画舫）**
形状：横向，船身细长，下面有灯影。
> A Chinese pleasure boat (画舫) on dark water at night: a long low hull shown by one thin pale line, a cabin with four lit paper windows glowing warm #ecd08c, a curved cabin roof outlined, a single mast with a furled pale sail, one small lantern at the bow. Below the boat, a few short broken horizontal strokes of warm light for the reflection. The boat fills about 60% of the canvas width.

**high-window（高窗）**
形状：竖长条，上面一个小窗，下面一道斜光。
> A small barred window high in a prison wall, seen from inside in darkness: the window is a pale rectangle #e6dcc4 crossed by four black vertical bars, placed in the upper quarter of the canvas. From it a faint shaft of light falls diagonally down and to the right, widening and fading to nothing before it reaches the bottom. At the foot of the shaft, one tiny seated figure outlined in pale light. The window is about 22% of the canvas width.

---

## 五、每张图交付前的自查

1. 底色是不是纯色：A、B 组 `#b3a994`，C 组 `#000000`。用取色器在四个角各点一下。
2. 四边有没有被笔触碰到。
3. 有没有文字、印章、边框。
4. 除了注明的那一种颜色，有没有别的颜色混进来。
5. 裁切后主体是否完整，成品尺寸是否和表里一致。
