'use strict';
const assert = require('assert');
const { parseAmount, parseDate } = require('../lib/parse');
const { categorize } = require('../lib/categorize');
const { monthlySummary } = require('../lib/summary');
const { formatCents } = require('../lib/report');

const cases = [
  ['parseAmount plain decimal', () => assert.strictEqual(parseAmount('12.34'), 1234)],
  ['parseAmount accounting parentheses', () => assert.strictEqual(parseAmount('(1,234.50)'), 123450)],
  ['parseDate european', () => assert.strictEqual(parseDate('31/01/2026'), '2026-01-31')],
  ['categorize first match wins, case-insensitive', () => {
    const rules = [{ match: 'uber', category: 'transport' }, { match: 'eats', category: 'food' }];
    assert.strictEqual(categorize({ description: 'UBER EATS ORDER' }, rules), 'transport');
  }],
  ['monthlySummary months ascending', () => {
    const s = monthlySummary([
      { date: '2026-03-01', description: 'a', amount: 100 },
      { date: '2026-01-15', description: 'b', amount: 100 },
    ], []);
    assert.deepStrictEqual(s.map((m) => m.month), ['2026-01', '2026-03']);
  }],
  ['formatCents thousands', () => assert.strictEqual(formatCents(123456), '1,234.56')],
];

let failed = 0;
for (const [name, fn] of cases) {
  try { fn(); console.log('PASS', name); } catch (e) { failed++; console.log('FAIL', name, '-', String(e.message).split('\n')[0]); }
}
console.log(`${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
