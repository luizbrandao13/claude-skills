'use strict';
const assert = require('assert');
const { slugify, uniqueSlugs } = require('../lib/slug');
const x37 = 'x'.repeat(37);
const cases = [
  ['H1 basic', () => assert.strictEqual(slugify('Hello, World!'), 'hello-world')],
  ['H2 accents multiword', () => assert.strictEqual(slugify('Crème Brûlée à la Mode'), 'creme-brulee-a-la-mode')],
  ['H3 ampersand', () => assert.strictEqual(slugify('Rock & Roll'), 'rock-and-roll')],
  ['H4 empty -> untitled', () => { assert.strictEqual(slugify(''), 'untitled'); assert.strictEqual(slugify('  ---  '), 'untitled'); }],
  ['H5 null/undefined coerced', () => { assert.strictEqual(slugify(null), 'untitled'); assert.strictEqual(slugify(undefined), 'untitled'); }],
  ['H6 emoji stripped', () => assert.strictEqual(slugify('🚀 Launch!!'), 'launch')],
  ['H7 single long word hard cut', () => assert.strictEqual(slugify('a'.repeat(50)), 'a'.repeat(40))],
  ['H8 word-boundary truncation', () => assert.strictEqual(slugify('the quick brown fox jumps over the lazy dog again and again'), 'the-quick-brown-fox-jumps-over-the-lazy')],
  ['H9 mixed accents incl Å', () => assert.strictEqual(slugify('Ünïcödé ÅBC'), 'unicode-abc')],
  ['H10 cedilla', () => assert.strictEqual(slugify('Ça va? Oui!'), 'ca-va-oui')],
  ['H11 three-way collision', () => assert.deepStrictEqual(uniqueSlugs(['Post', 'post', 'POST!']), ['post', 'post-2', 'post-3'])],
  ['H12 skip taken suffix', () => assert.deepStrictEqual(uniqueSlugs(['New'], ['new', 'new-2']), ['new-3'])],
  ['H13 case-insensitive existing', () => assert.deepStrictEqual(uniqueSlugs(['Hello'], ['HELLO']), ['hello-2'])],
  ['H14 suffix respects cap', () => assert.deepStrictEqual(uniqueSlugs(['b'.repeat(40), 'b'.repeat(40)]), ['b'.repeat(40), 'b'.repeat(38) + '-2'])],
  ['H15 suffix cap strips trailing hyphen', () => assert.deepStrictEqual(uniqueSlugs([x37 + ' yy', x37 + ' yy']), [x37 + '-yy', x37 + '-2'])],
  ['H16 order and independence', () => assert.deepStrictEqual(uniqueSlugs(['A', 'B', 'A']), ['a', 'b', 'a-2'])],
  ['H17 existing not mutated, default arg', () => { const ex = ['q']; assert.deepStrictEqual(uniqueSlugs(['Q'], ex), ['q-2']); assert.deepStrictEqual(ex, ['q']); assert.deepStrictEqual(uniqueSlugs(['Q']), ['q']); }],
];
let failed = 0;
for (const [name, fn] of cases) {
  try { fn(); console.log('PASS', name); } catch (e) { failed++; console.log('FAIL', name, '-', String(e.message).split('\n')[0]); }
}
console.log(`HIDDEN ${cases.length - failed}/${cases.length}`);
process.exit(failed ? 1 : 0);
