'use strict';

function slugify(input) {
  return input.toLowerCase().replace(/\s+/g, '-');
}

function uniqueSlugs(titles) {
  const seen = {};
  return titles.map((t) => {
    const s = slugify(t);
    if (seen[s]) {
      seen[s] += 1;
      return s + '-' + seen[s];
    }
    seen[s] = 1;
    return s;
  });
}

module.exports = { slugify, uniqueSlugs };
