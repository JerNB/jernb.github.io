import test from 'node:test';
import assert from 'node:assert/strict';
import { toChineseNumeral } from '../../js/reading/numerals.mjs';

test('numerals', () => {
  const cases = { 0: '零', 10: '十', 15: '十五', 51: '五十一', 127: '一百二十七', 250: '二百五十', 491: '四百九十一', 1005: '一千零五', 2010: '二千零一十', 12000: '一万二千' };
  for (const [n, s] of Object.entries(cases)) assert.equal(toChineseNumeral(Number(n)), s, `n=${n}`);
});
