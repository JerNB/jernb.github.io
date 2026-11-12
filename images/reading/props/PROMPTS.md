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


---

# 第二批（D、E 组，17 张）：把剩下的代码画换成画

第一批接入后，画面割裂主要出在仍是代码画的部分。代码只能画出平涂的色块和均匀的线条，旁边一放细线描的画，就显得简陋。这一批专门替换这些地方，接入方式和第一批一样（槽位由 cc 接，图到了我来接）。

**规则不变**：沿用第一节的尺寸、底色、留白、画风和自查规则。A、B 组前缀用于 D 组，C 组前缀（黑底夜景）用于 E 组。成品尺寸仍是卷轴占位的 5 倍。

**风格要和第一批已通过的图一致**：精细的界画线描加淡墨晕染，参考 `winehouse`、`siheyuan`、`macondo-house`、`golden-pavilion` 的线条轻重。不要比它们更重，也不要更像插画。

**两类图要特别注意**：

- **背景带**（`town-row`、`loess-gullies`、`jungle-edge`）会横向铺在场景后面，左右两端必须淡出成纯底色，不能出现竖直切边。
- **成组的人群**（`crowd-square`、`amagi-path`、`shore-jetty`）人物要小，每人约占画面高度的 8%–12%，姿态不要重复。

## D 组：白天，牛皮纸底（16 张）

| 文件名 | 替换卷轴上的 | 卷轴占位 | 生成尺寸 | 成品尺寸 | 允许的颜色 |
|---|---|---|---|---|---|
| `writing-table` | 行囊 · 黑色长案 | 380×110 | 1536×1024 | 1900×550 | 无 |
| `huashan-peaks` | 江湖山河 · 华山 | 300×200 | 1536×1024 | 1500×1000 | 无 |
| `guangmingding` | 江湖山河 · 光明顶 | 260×200 | 1536×1024 | 1300×1000 | 无 |
| `xiangyang-wall` | 江湖山河 · 襄阳城 | 240×110 | 1536×1024 | 1200×550 | 无 |
| `peach-island` | 江湖山河 · 桃花岛 | 220×120 | 1536×1024 | 1100×600 | 桃花淡粉 `#d9a79a` |
| `town-row` | 市井 · 成排的普通店铺（背景带） | 600×120 | 1536×1024 | 3000×600 | 无 |
| `rainbow-bridge` | 市井 · 虹桥 | 260×90 | 1536×1024 | 1300×450 | 无 |
| `yunnan-hillside` | 黄土 · 黄金时代 | 240×140 | 1536×1024 | 1200×700 | 无 |
| `crowd-square` | 黄土 · 沉默的大多数 | 200×90 | 1536×1024 | 1000×450 | 无 |
| `loess-gullies` | 黄土 · 梯田沟壑（背景带） | 600×200 | 1536×1024 | 3000×1000 | 无 |
| `snow-tunnel` | 雪国 · 隧道 | 220×150 | 1536×1024 | 1100×750 | 车窗暖光 `#ecd08c` |
| `amagi-path` | 雪国 · 天城山道 | 240×150 | 1536×1024 | 1200×750 | 无 |
| `pine-forest` | 海边 · 森林 | 260×160 | 1536×1024 | 1300×800 | 无 |
| `shore-jetty` | 海边 · 海边 | 260×110 | 1536×1024 | 1300×550 | 无 |
| `tipasa-ruins` | 荒漠 · 提帕萨 | 220×130 | 1536×1024 | 1100×650 | 无 |
| `jungle-edge` | 马孔多 · 两侧的棕榈与芭蕉（背景带） | 600×220 | 1536×1024 | 3000×1100 | 无 |

**writing-table（长案）**
形状：很扁的横条，只有一张案子，桌面上什么都不放（罗盘、灯、秤会摆在上面）。
> A long low Ming-style scholar's table (平头案) seen from the front with the slightly oblique 界画 projection: a plain dark-wood top with a thin edge, slender legs with a simple apron and spandrel, a stretcher between the legs near the floor. The table top is completely empty. Wood grain suggested with a few dry strokes. The table fills about 76% of the canvas width.

**huashan-peaks（华山）**
形状：横向，三四座陡峭的花岗岩峰，中间最高。
> The granite peaks of Mount Hua: three or four sheer vertical cliffs rising from mist, the middle one tallest, faces modelled with axe-cut texture strokes (斧劈皴), a few twisted pines clinging to ledges, a thread of a plank path along one cliff with one tiny figure on it. The base dissolves into mist and bare paper. Peaks fill about 70% of the canvas width.

**guangmingding（光明顶）**
形状：横向，云海上一座山顶，顶上有一组殿宇。
> A broad mountain summit above a sea of clouds, on top a small compound of halls and a tall flagpole with a blank banner, steps cut into the rock leading up, a few figures in robes on the steps. Clouds left as bare paper outlined with soft wash. The summit fills about 65% of the canvas width.

**xiangyang-wall（襄阳城）**
形状：扁长横条，一段城墙加一座城楼。
> A stretch of a massive Song-dynasty city wall with crenellations and a two-storey gate tower over an arched gateway, the gate open, a few soldiers on the wall and travellers at the gate, the wall running off to both sides and fading into paper. Fine ruled line work. The wall fills about 78% of the canvas width.

**peach-island（桃花岛）**
形状：横向，海上一座小岛。
> A small rocky island in a calm sea, covered with blossoming peach trees whose blossoms are the only color, pale pink #d9a79a; a hidden pavilion among the trees, a small jetty with a moored boat, water drawn with a few horizontal strokes that fade away. The island fills about 60% of the canvas width.

**town-row（市井店铺，背景带）**
说明：替换小镇里成排的代码房子，横向铺在三栋酒楼后面。
形状：很扁很长，一整排店铺，左右两端淡出。
> A long continuous row of ordinary Song-dynasty street shops in the manner of a riverside market town: tiled roofs at slightly different heights, open shopfronts with awnings, blank cloth signs, a willow or two between the buildings, small crowds of townspeople, porters and a donkey in front. Everything drawn small and light, mid-distance. The row runs across the middle 84% of the canvas width and fades into bare paper at both ends, with no vertical edge.

**rainbow-bridge（虹桥）**
形状：扁横向，一座木拱桥，桥上有人群。
> A wooden arched bridge built of interlocking timber beams (虹桥) over a canal, crowded with tiny figures: vendors with stalls on the bridge, people leaning on the railing, a porter with a load; under the arch a boat is lowering its mast. Fine ruled line work. The bridge fills about 70% of the canvas width.

**yunnan-hillside（黄金时代：云南山坡）**
形状：横向，一面缓坡。
> A gentle hillside in Yunnan: contour lines of small rice terraces, clumps of banana plants with broad leaves, a small bamboo hut on stilts near the top, a buffalo resting below. Quiet, sunny, sparse. The hillside fills about 68% of the canvas width.

**crowd-square（沉默的大多数）**
形状：扁横向，一群人全部朝同一个方向站着。
> A crowd of forty or so small figures in plain 1970s clothes standing in loose rows on an empty square, all facing the same way (toward the right), seen from behind and the side; no one speaks, no banners, no text. Each figure is small and simply drawn; postures vary slightly. The crowd fills about 66% of the canvas width.

**loess-gullies（黄土沟壑，背景带）**
形状：很扁很长，层层黄土台塬，左右两端淡出。
> The Loess Plateau seen across a valley: layer upon layer of flat-topped terraced hills (塬) and deep eroded gullies, horizontal terrace lines, sparse trees on the ridges, a few cave-dwelling openings far away. Light, airy, receding into mist toward the top. Runs across the middle 84% of the canvas width and fades into bare paper at both ends, with no vertical edge.

**snow-tunnel（隧道）**
形状：横向，山体中一个隧道口，一列火车正驶出。
> A railway tunnel mouth in a snowy mountainside at dusk, a small old steam train emerging from it, its carriage windows glowing faintly warm #ecd08c (the only color), snow on the slopes left as bare paper edged with soft wash, a signal lamp beside the track. The mountainside fills about 64% of the canvas width.

**amagi-path（天城山道）**
形状：横向，一条盘山小路，一行巡演艺人走在雨里。
> A winding mountain road through cedar woods in light rain, a small troupe of travelling performers walking along it: a young girl carrying a drum, two women, a man with a bundle, and a student in a school cap following a little behind. Rain suggested with a few fine slanting strokes. The scene fills about 66% of the canvas width.

**pine-forest（森林）**
形状：横向，一片疏林。
> A quiet forest of tall straight pines and cedars, trunks in varied ink tones, a narrow path leading into it, mist between the trunks, one small figure walking alone on the path. The forest fills about 68% of the canvas width and thins out at both ends.

**shore-jetty（海边）**
形状：扁横向，一段海岸和一座小栈桥。
> A quiet seashore: a gentle curve of beach, a short wooden jetty running out into calm water, two small figures sitting at the end of the jetty looking out to sea, gentle waves drawn with a few strokes. The scene fills about 70% of the canvas width.

**tipasa-ruins（提帕萨）**
形状：横向，海边的罗马遗迹。
> Roman ruins by the Mediterranean at Tipasa: broken columns of different heights, a fallen capital, a low wall of cut stone, wild wormwood bushes growing between the stones, the sea behind as a few calm horizontal strokes under strong light. Lots of empty paper. The ruins fill about 64% of the canvas width.

**jungle-edge（马孔多的林边，背景带）**
说明：替换马孔多两侧的代码棕榈，中间要留空给布恩迪亚家和蝴蝶。
形状：很扁很长，左右各一丛浓密的热带树，中间留空。
> Two dense clumps of tropical vegetation, one on the left third and one on the right third of the canvas: tall coconut and royal palms, banana plants with broad torn leaves, almond trees, vines, in wet heavy ink. The middle third of the canvas is left almost empty (only low grass), because a house will stand there. Both outer ends fade into bare paper, with no vertical edge.

## E 组：夜景，黑底（1 张）

| 文件名 | 替换卷轴上的 | 卷轴占位 | 生成尺寸 | 成品尺寸 |
|---|---|---|---|---|
| `evil-valley` | 古龙夜 · 恶人谷 | 280×170 | 1536×1024 | 1400×850 |

**evil-valley（恶人谷）**
形状：横向，两面陡崖夹着一道窄谷。
> Two jagged black cliffs facing each other across a narrow gorge at night, their edges caught by thin pale moonlight #e6dcc4, deep inside the gorge a scatter of small warm lamps #ecd08c from hidden dwellings, a narrow path winding in. Everything unlit stays pure black. The gorge fills about 66% of the canvas width.

## 第二批交付后

和第一批一样：Codex 交付 `.webp` 和检查记录，cc 评审、接槽位、重新渲染。三张背景带铺在代码画的地平线上，其余的替换对应的代码景物。

---

# 第三批（F–K 组，30 张）：补齐地标，填满天空，做出装裱

前两批解决的是「把代码画的东西换成画」。这一批解决剩下的三个问题：

1. **还有 8 处地点没有画**：猪栏、乡土、双水村、太阳以西、甲村图书馆、塔希提、阿尔及尔海滩、撒哈拉。它们现在要么是代码画，要么标签下面什么都没有。
2. **天空是空的**：每一屏的上半部分都是平涂的纸色，所有景物挤在下面一条线上。真正的手卷靠远山、云、雁和近景的树石，把纸面上下都用起来。
3. **卷轴没有装裱**：画心直接从「行囊」开始，到书房结束，没有包首、隔水、引首、拖尾，不像一卷画。

三批都到位以后，`recede()` 的模糊和雾化滤镜就可以删掉。远近关系由画本身的墨色浓淡来表达，不再靠后期处理。

**规则不变**：沿用第一节的尺寸、底色、留白、画风和自查规则。F、G、H、J 组用 A/B 组前缀（牛皮纸底），注明「黑」的用 C 组前缀（黑底），K 组的写法在各条里单独说明。

**风格要和已通过的图一致**：参考 `winehouse`、`siheyuan`、`macondo-house`、`golden-pavilion` 的线条轻重。

**和前两批不同的两条规则**：

- **背景带**（「用在」一栏标「带」的）横向铺在场景后面，左右两端必须淡出成纯底色，不能有竖直切边。远景带的墨色要很淡，最深处不超过 `#1e1b17` 的 35% 浓度。
- **近景**（G 组 `foreground-*`）要贴着卷轴的下边缘放，所以**只有下边缘允许墨色碰边**，左、右、上三边照常淡出。

**汉字一律不进图**：生图模型写的汉字常常缺笔、错字。引首的大字、印章、签条都由 cc 用字体排，或者用 Jerry 的手写扫描。

## 优先级

如果只能先做一部分，按这个顺序：

1. **G 组远景带和近景**：对整卷观感提升最大，每一屏都看得到。
2. **F 组地标**：消灭「标签下面是空的」。
3. **H、I 组**：去掉最像网页的两处——脏渐变和平涂的圆。
4. **K、J 组**。

## F 组：缺画的地标（8 张，牛皮纸底）

| 文件名 | 替换卷轴上的 | 卷轴占位 | 生成尺寸 | 成品尺寸 | 允许的颜色 |
|---|---|---|---|---|---|
| `pig-pen` | 黄土 · 猪栏 | 160×100 | 1536×1024 | 800×500 | 无 |
| `village-shrine` | 黄土 · 乡土 | 200×150 | 1536×1024 | 1000×750 | 无 |
| `shuangshui-village` | 黄土 · 双水村 | 260×130 | 1536×1024 | 1300×650 | 无 |
| `sea-sun` | 海边 · 太阳以西 | 260×120 | 1536×1024 | 1300×600 | 落日淡朱 `#c9826a` |
| `kafka-library` | 海边 · 甲村图书馆 | 220×120 | 1536×1024 | 1100×600 | 无 |
| `tahiti-hut` | 深处 · 塔希提 | 260×170 | 1536×1024 | 1300×850 | 赭黄 `#c8a46a` |
| `algiers-beach` | 荒漠 · 阿尔及尔海滩 | 240×110 | 1536×1024 | 1200×550 | 无 |
| `sahara-camp` | 荒漠 · 撒哈拉 | 280×130 | 1536×1024 | 1400×650 | 无 |

**pig-pen（猪栏）**
形状：横向，一个低矮的土坯猪圈，一头猪站在矮墙上。
> A low rammed-earth pigsty with a thatched lean-to roof and a crooked wooden gate, one lean black-and-white pig standing on top of the low wall looking out over it as if about to leave, a few chickens pecking outside, a bare tree behind. The pig is small but clearly the subject. The pen fills about 55% of the canvas width.

**village-shrine（乡土）**
形状：横向，村口一棵老树，树下一座小土地庙。
> The entrance of a north China village: a huge old pagoda tree with a gnarled split trunk and a wide canopy of dotted leaves, beneath it a tiny brick earth-god shrine no taller than a man, a stone millstone, two old men sitting on a bench, a dirt road leading off between low mud-brick walls. The tree and shrine fill about 60% of the canvas width.

**shuangshui-village（双水村）**
形状：扁长横条，黄土坡上几排窑洞，坡下一条河。
> A small loess-plateau village on a terraced slope: two short rows of cave dwellings with arched lattice windows cut into the hillside, a threshing ground in front, a thin river with a plank bridge at the foot of the slope, a few people carrying water on shoulder poles. Loess earth modelled with soft horizontal dry-brush strokes, not stripes. The village fills about 70% of the canvas width.

**sea-sun（太阳以西）**
形状：横向，平静海面上一轮将落的太阳。
> A calm open sea at dusk drawn with a few long horizontal ink strokes that fade toward the edges, a large low setting sun half sunk into the horizon, painted as a soft wash disc in pale vermilion #c9826a with a loose broken edge, its reflection a column of short broken strokes on the water, one distant sail. No hard circle outline. The scene fills about 70% of the canvas width.

**kafka-library（甲村图书馆）**
形状：横向，一座安静的日式私人图书馆，带小庭院。
> A quiet old private library in a Japanese seaside town: a two-storey wooden house with a tiled roof and deep eaves, sliding paper doors half open showing bookshelves inside, a small garden with a stone lantern, a pine and a gravel path, a low wooden gate. Fine ruled line work. The building fills about 60% of the canvas width.

**tahiti-hut（塔希提）**
形状：横向，热带海边一间茅屋，几棵椰树。
> A bamboo hut with a steep thatched roof on stilts at the edge of a tropical lagoon, three or four coconut palms with drooping fronds drawn with loose wet strokes, a dugout canoe pulled up on the sand, a woman seated in the doorway. The only colour is a faint warm ochre #c8a46a washed into the thatch and the sand. The scene fills about 65% of the canvas width.

**algiers-beach（阿尔及尔海滩）**
形状：扁长横条，正午刺眼的海滩，一块礁石，一个人影。
> A glaring Mediterranean beach at noon: a long low line of sea, a single large dark rock at the water edge, a small spring trickling from behind it, one lone figure in a white shirt standing on the sand with a short black shadow directly beneath him. Most of the image is bare paper to suggest blinding light; ink only on the rock, the figure and a few strokes of surf. The scene fills about 60% of the canvas width.

**sahara-camp（撒哈拉）**
形状：扁长横条，沙丘之间一顶帐篷，几棵枣椰。
> A nomad camp in the Sahara: one low black goat-hair tent with its sides rolled up, a couple of date palms, a kneeling camel, a small fire with a teapot, a woman and a man sitting on a rug, long soft dune ridges behind drawn with a few dry curving strokes. The camp fills about 65% of the canvas width.

## G 组：远景带与近景（9 张，牛皮纸底）

远景带铺在各地区的地平线后面，取代现在代码画的远山；近景贴着卷轴下沿，给画面一个「眼前」的层次。带子会被横向重复铺开，所以两端的墨色要淡到完全消失。

| 文件名 | 用在 | 卷轴占位 | 生成尺寸 | 成品尺寸 |
|---|---|---|---|---|
| `far-ridge-soft` | 带 · 市井、海边的缓坡远山 | 900×160 | 1536×1024 | 4500×800 |
| `far-ridge-steep` | 带 · 江湖山河、雪国的陡峭远山 | 900×220 | 1536×1024 | 4500×1100 |
| `far-ridge-loess` | 带 · 黄土高原的远塬 | 900×140 | 1536×1024 | 4500×700 |
| `cloud-sea` | 带 · 山腰的云海（山河、雪国） | 900×120 | 1536×1024 | 4500×600 |
| `mist-band` | 带 · 地区之间的薄雾 | 600×80 | 1536×1024 | 3000×400 |
| `geese-flock` | 天空 · 雁阵（每个地区可复用一两次） | 140×50 | 1536×1024 | 700×250 |
| `foreground-rocks` | 近景 · 下沿的石头和杂草 | 600×90 | 1536×1024 | 3000×450 |
| `foreground-reeds` | 近景 · 水边的芦苇 | 600×100 | 1536×1024 | 3000×500 |
| `foreground-branch` | 近景 · 从下沿伸进画面的一枝老松 | 300×200 | 1536×1024 | 1500×1000 |

**far-ridge-soft（缓坡远山）**
> A very long, very faint band of distant rolling hills in the Mi Fu dotted manner: soft rounded ridges overlapping in two or three layers, the farthest almost invisible, wet dotted texture, the bottom edge dissolving into mist. Very pale ink, at most 35% density. The band runs across the middle 90% of the canvas and fades completely to bare paper at both ends.

**far-ridge-steep（陡峭远山）**
> A long faint band of distant steep mountains in the Northern Song monumental manner: sharp peaks and ridges in two or three receding layers, the nearest modelled with light hemp-fibre texture strokes, the farthest only a pale silhouette, mist filling the valleys and dissolving the bases. Very pale ink, at most 35% density. The band runs across the middle 90% of the canvas and fades completely to bare paper at both ends.

**far-ridge-loess（黄土远塬）**
> A long faint band of distant loess plateau: flat-topped tablelands with deep eroded gullies between them, drawn with soft horizontal dry-brush strokes, a single tiny tree on one ridge. Very pale ink, at most 30% density. The band fades completely to bare paper at both ends and along the bottom.

**cloud-sea（云海）**
> A long band of a sea of clouds seen from above: soft billowing cloud tops outlined with the faintest wash and left as bare paper inside, a couple of distant peak tips piercing through. The band fades to bare paper at both ends, top and bottom.

**mist-band（薄雾）**
> A long thin horizontal band of drifting mist made of a few very wet, very pale ink washes, soft and uneven, thicker in the middle and vanishing at both ends. Nothing else. At most 20% density.

**geese-flock（雁阵）**
> A small loose V-shaped skein of eight to twelve wild geese in flight, each bird two or three quick brush strokes, the formation slightly broken, birds getting smaller toward one end. Nothing else on the canvas.

**foreground-rocks（近景石草）**
> A long low band of foreground ground: a few dark wet-ink rocks with axe-cut texture strokes, clumps of wild grass and small shrubs between them, darker and larger than anything in the landscape behind. The bottom edge of the band is the only edge allowed to touch the canvas edge; both ends and the top fade to bare paper. Leave long gaps of bare paper between the rock groups.

**foreground-reeds（近景芦苇）**
> A long low band of reeds and rushes at the water edge, tall leaning stalks with feathery heads drawn with quick flicks, a few duckweed dots on the water line. The bottom edge may touch the canvas edge; both ends and the top fade to bare paper. Leave gaps between clumps.

**foreground-branch（近景老松）**
> A single gnarled old pine branch reaching in from the lower left corner and curving up into the picture, rough bark in dry brush, clusters of needles in dark wet ink. Only the bottom edge may touch the canvas edge. Nothing else on the canvas.

## H 组：地区之间的过渡（4 张）

现在从白天进入古龙夜、再从夜回到白天，两处衔接都是一条深色渐变，看起来像纸脏了。改成「走进一座山」：白天这边是山，山背后就是夜。

| 文件名 | 用在 | 卷轴占位 | 生成尺寸 | 成品尺寸 | 底色 |
|---|---|---|---|---|---|
| `dusk-mountain` | 市井 → 古龙夜 | 360×420 | 1024×1536 | 1800×2100 | 牛皮纸 |
| `dawn-mountain` | 古龙夜 → 黄土 | 360×420 | 1024×1536 | 1800×2100 | 牛皮纸 |
| `night-clouds` | 古龙夜的天空 | 600×140 | 1536×1024 | 3000×700 | 黑 |
| `snow-veil` | 黄土 → 雪国 | 300×420 | 1024×1536 | 1500×2100 | 牛皮纸 |

**dusk-mountain（入夜之山）**
形状：竖向，一座巨大的山，越往右墨色越重，到右边缘几乎全黑。
> One massive towering mountain in the Northern Song manner occupying most of the canvas height, its left flank lit and modelled with light texture strokes, its right side sinking into heavier and heavier ink washes until the right third is near-black wet ink, as if night lies behind it. A tiny path winds up the lit left flank and disappears into a dark cleft. The left, top and bottom edges fade to bare paper; only the right edge may stay dark.

**dawn-mountain（出夜之山）**
形状：入夜之山的镜像，左边几乎全黑，越往右越亮。
> A massive mountain whose left third is near-black wet ink fading rightwards into lighter and lighter washes, its right flank lit by morning and modelled with light texture strokes, a path coming out of a dark cleft and descending the right flank, a thin mist at its foot. The right, top and bottom edges fade to bare paper; only the left edge may stay dark.

**night-clouds（夜云）**
用 C 组前缀。
> A long band of night clouds drifting across the sky, only their edges lit by moonlight in thin pale #e6dcc4 lines with the faintest glow, the cloud bodies pure black. The band fades to black at both ends.

**snow-veil（落雪）**
> A tall veil of falling snow over a pale mountain shoulder: its top half left white as bare paper with only faint wash for shadows, scattered soft snowflakes reserved as small blots of bare paper in a pale grey wash, getting denser toward the right. All edges fade to bare paper.

## I 组：日月（3 张）

现在的月亮和太阳都是平涂的圆片，边缘太硬，是画面里最像网页元素的东西。

| 文件名 | 用在 | 卷轴占位 | 生成尺寸 | 成品尺寸 | 底色 | 允许的颜色 |
|---|---|---|---|---|---|---|
| `moon-night` | 古龙夜 | 120×120 | 1024×1024 | 600×600 | 黑 | 月白 `#e6dcc4` |
| `sun-desert` | 荒漠 | 120×120 | 1024×1024 | 600×600 | 牛皮纸 | 淡金 `#e3d3a6` |
| `moon-pale` | 深处 · 塔希提 | 100×100 | 1024×1024 | 500×500 | 牛皮纸 | 无 |

**moon-night（夜月）**
用 C 组前缀。
> A full moon painted the way ink painters do it: a soft disc of pale #e6dcc4 with an uneven, slightly bled edge, a wide faint halo around it, a thin wisp of black cloud crossing its lower third. No hard outline, no craters. Centered, about 30% of the canvas width.

**sun-desert（荒漠的日）**
> A white-hot desert sun as a soft disc of pale gold #e3d3a6 with no outline, surrounded by a wide glare of bare paper and the faintest warm wash, as if the light is bleaching the paper. Centered, about 30% of the canvas width.

**moon-pale（白昼的月）**
> A pale daytime moon: a soft disc left as bare paper inside a very faint grey wash ring, almost invisible. Centered, about 30% of the canvas width.

## J 组：点景（3 张，牛皮纸底）

画里有了人和小动静才活。这些小东西会散放在路边和水上。人物要小，每人约占画面高度的 8%–12%，姿态不要重复。

| 文件名 | 用在 | 卷轴占位 | 生成尺寸 | 成品尺寸 |
|---|---|---|---|---|
| `river-boats` | 市井、海边的水面 | 260×70 | 1536×1024 | 1300×350 |
| `road-travellers` | 各处路边（挑担、骑驴、推车） | 260×70 | 1536×1024 | 1300×350 |
| `ox-cart` | 黄土 · 路上 | 120×70 | 1536×1024 | 600×350 |

**river-boats（河上小船）**
> Three small boats spread far apart along a calm river: a fisherman casting a net from a skiff, a covered sampan being poled, a tiny boat with a cormorant. Water suggested only by a few short horizontal strokes around each boat. Long bare gaps between them.

**road-travellers（路人）**
> Four small groups of travellers spread far apart along an unseen road: a porter with a shoulder pole, a man riding a donkey, two people pushing a wheelbarrow, an old woman with a basket. Each group tiny and drawn with a few lively strokes, no ground beneath them except a faint smudge. Long bare gaps between the groups.

**ox-cart（牛车）**
> A single ox pulling a wooden two-wheeled cart loaded with hay, a farmer walking beside it holding a switch. Drawn small and loose. Nothing else.

## K 组：装裱与书房（3 张）

一卷手卷从右往左依次是：天杆、包首、引首（大字题名）、隔水、画心、隔水、拖尾（题跋），最后是地杆。现在只有画心。这组素材给 cc 做出卷首和卷尾。

| 文件名 | 用途 | 生成尺寸 | 成品尺寸 | 底色 | 允许的颜色 |
|---|---|---|---|---|---|
| `brocade-tile` | 包首和隔水的锦缎，四方连续 | 1024×1024 | 512×512 | 锦缎本身铺满 | 旧赭 `#8a6a4a`、旧青 `#4a5a5a`、暗金 `#a89060` |
| `scholar-window` | 书房书架背后的一扇圆窗 | 1024×1024 | 1000×1000 | 牛皮纸 | 无 |
| `study-objects` | 书房里的文房小物 | 1536×1024 | 1300×700 | 牛皮纸 | 朱砂 `#b8432f`（只用在印泥上） |

**brocade-tile（锦缎）**
不加前缀，单独使用这一段。
> A seamless repeating tile of antique Chinese silk brocade used for scroll mounting: a small dense pattern of interlocking cloud scrolls and tiny rosettes, woven look with fine thread texture, muted and worn, colours only faded ochre #8a6a4a, old teal #4a5a5a and dull gold #a89060. The pattern must tile seamlessly in all four directions. Flat, evenly lit, no folds, no perspective, no shadow, no border, no text.

**scholar-window（圆窗）**
> A round moon window in a white-washed study wall, seen straight on, its frame a thin dark-wood ring; through it a few stalks of bamboo and the corner of a garden rock, painted lightly. The wall itself is bare paper. The window fills about 70% of the canvas.

**study-objects（文房小物）**
> A small loose arrangement of scholar's objects spread far apart on bare paper: an inkstone with a little water, a brush resting on a brush rest, a small celadon water dropper, an open seal-paste box showing vermilion #b8432f paste (the only colour), a scholar's rock on a wooden stand. Each object small, with long bare gaps between them so they can be cropped apart.

## 第三批交付后

和前两批一样：Codex 交付 `.webp` 和检查记录，cc 评审、接入、重新渲染。全部接入后，cc 会：

- 删掉 `recede()` 的模糊和雾化；
- 删掉 `dusk()` 的深色渐变，换成 H 组的两座山；
- 把页面顶部的标题「书卷」挪进卷轴做成引首，把书房和卷尾跋做成拖尾。
