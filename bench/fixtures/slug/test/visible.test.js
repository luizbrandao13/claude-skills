'use strict';
const assert = require('assert');
const { slugify, uniqueSlugs } = require('../lib/slug');

const cases = [
  ['basic punctuation', () => assert.strictEqual(slugify('Hello, World!'), 'hello-world')],
  ['accents', () => assert.strictEqual(slugify('Crème Brûlée'), 'creme-brulee')],
  ['duplicates in one call', () => assert.deepStrictEqual(uniqueSlugs(['Post', 'post']), ['post', 'post-2'])],
  ['existing slugs', () => assert.deepStrictEqual(uniqueSlugs(['New'], ['new']), ['new-2'])],
];

let failed = 0;
for (const [name, fn] of cases) {
  try { fn(); console.log('PASS', name); } catch (e) { failed++; console.log('FAIL', name, '-', e.message); }
}
console.log(`${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
