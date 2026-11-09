// Registers every region painter (imported for side effects by render.html).
import { registerPainters } from './index.mjs';
import { shanhe, shijing, night } from './jianghu.mjs';
import { xingnang } from './xingnang.mjs';
import { loess } from './loess.mjs';

registerPainters({ shanhe, shijing, night, xingnang, loess });
