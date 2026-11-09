// Registers every region painter (imported for side effects by render.html).
import { registerPainters } from './index.mjs';
import { shanhe, shijing, night } from './jianghu.mjs';
import { xingnang } from './xingnang.mjs';
import { loess } from './loess.mjs';
import { snow } from './snow.mjs';
import { sea } from './sea.mjs';
import { whitenight, depths, stage } from './westward.mjs';
import { desert, macondo } from './south.mjs';

registerPainters({ shanhe, shijing, night, xingnang, loess, snow, sea, whitenight, depths, stage, desert, macondo });
