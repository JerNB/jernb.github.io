// Chinese numerals for the scroll's colophon (卷尾跋), e.g. 127 → 一百二十七.
const DIGITS = '零一二三四五六七八九';
const UNITS = ['', '十', '百', '千'];

function below10000(n) {
  let out = '', zero = false;
  for (let i = 3; i >= 0; i--) {
    const d = Math.floor(n / 10 ** i) % 10;
    if (d === 0) { if (out) zero = true; continue; }
    if (zero) { out += '零'; zero = false; }
    out += DIGITS[d] + UNITS[i];
  }
  return out;
}

export function toChineseNumeral(n) {
  n = Math.floor(n);
  if (!Number.isFinite(n) || n < 0 || n >= 100000000) throw new RangeError(`unsupported: ${n}`);
  if (n === 0) return '零';
  const wan = Math.floor(n / 10000), rest = n % 10000;
  let s = wan ? below10000(wan) + '万' : '';
  if (rest) s += (wan && rest < 1000 ? '零' : '') + below10000(rest);
  if (s.startsWith('一十')) s = s.slice(1); // 十五, not 一十五
  return s;
}
