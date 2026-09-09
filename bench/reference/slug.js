'use strict';
function slugify(input) {
  let t = input == null ? '' : String(input);
  t = t.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, ' and ');
  t = t.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (!t) return 'untitled';
  if (t.length > 40) {
    const words = t.split('-'); let out = '';
    for (const w of words) { const c = out ? out + '-' + w : w; if (c.length <= 40) out = c; else break; }
    t = out || words[0].slice(0, 40);
  }
  return t;
}
function uniqueSlugs(titles, existing = []) {
  const taken = new Set(existing.map((e) => e.toLowerCase()));
  const out = [];
  for (const title of titles) {
    const base = slugify(title); let cand = base; let n = 2;
    while (taken.has(cand)) {
      const suf = '-' + n; let b = base;
      if (b.length + suf.length > 40) b = b.slice(0, 40 - suf.length).replace(/-+$/, '');
      cand = b + suf; n++;
    }
    taken.add(cand); out.push(cand);
  }
  return out;
}
module.exports = { slugify, uniqueSlugs };
