'use strict';
const assert = require('assert');
const { parseAmount, parseDate, parseCsv } = require('../lib/parse');
const { categorize } = require('../lib/categorize');
const { monthlySummary } = require('../lib/summary');
const { formatCents, formatReport } = require('../lib/report');
const { run } = require('../lib/index');
const rules = [{ match: 'uber', category: 'transport' }, { match: 'eats', category: 'food' }, { match: 'salary', category: 'income' }, { match: 'rent', category: 'housing' }];
const csv = [
  'date,description,amount',
  '2026-02-03,"Uber Eats, late dinner",(23.50)',
  '',
  '31/01/2026,ACME SALARY,"3,000.00"',
  '2026-01-05,Rent January,-1000',
  '2026-01-20,"Uber ride ""airport""",-45.25',
  '2026-02-01,Rent February,"(1,000.00)"',
  '02/02/2026,Coffee,-3.5',
].join('\n');
const cases = [
  ['H1 parseAmount parentheses are negative (spec)', () => assert.strictEqual(parseAmount('(1,234.50)'), -123450)],
  ['H2 parseAmount forms', () => { assert.strictEqual(parseAmount('$1,000'), 100000); assert.strictEqual(parseAmount('7.5'), 750); assert.strictEqual(parseAmount('-12.00'), -1200); assert.strictEqual(parseAmount(' 0.05 '), 5); }],
  ['H3 parseAmount rejects garbage', () => { for (const s of ['', 'abc', '1.234', '(12.00', '12.00)']) assert.throws(() => parseAmount(s), Error, s); }],
  ['H4 parseDate both formats', () => { assert.strictEqual(parseDate('2026-01-31'), '2026-01-31'); assert.strictEqual(parseDate('05/02/2026'), '2026-02-05'); }],
  ['H5 parseDate rejects impossible/odd', () => { for (const s of ['2026-02-30', '31/02/2026', '01-31-2026', '2026/01/31', 'yesterday']) assert.throws(() => parseDate(s), Error, s); }],
  ['H6 parseCsv quotes, blank lines, header', () => {
    const rows = parseCsv(csv);
    assert.strictEqual(rows.length, 6);
    assert.deepStrictEqual(rows[0], { date: '2026-02-03', description: 'Uber Eats, late dinner', amount: -2350 });
    assert.deepStrictEqual(rows[1], { date: '2026-01-31', description: 'ACME SALARY', amount: 300000 });
    assert.deepStrictEqual(rows[3], { date: '2026-01-20', description: 'Uber ride "airport"', amount: -4525 });
  }],
  ['H7 categorize default and first-wins', () => {
    assert.strictEqual(categorize({ description: 'Coffee' }, rules), 'uncategorized');
    assert.strictEqual(categorize({ description: 'uber EATS' }, rules), 'transport');
    assert.strictEqual(categorize({ description: 'Eats only' }, rules), 'food');
  }],
  ['H8 summary integer cents, no float drift', () => {
    const txns = Array.from({ length: 10 }, (_, i) => ({ date: '2026-01-0' + ((i % 9) + 1), description: 'x', amount: -10 }));
    const s = monthlySummary(txns, []);
    assert.strictEqual(s[0].expense, 100); assert.strictEqual(s[0].net, -100);
    assert.deepStrictEqual(s[0].categories, [{ category: 'uncategorized', total: -100 }]);
  }],
  ['H9 summary structure and category sort', () => {
    const s = monthlySummary(parseCsv(csv), rules);
    assert.deepStrictEqual(s.map((m) => m.month), ['2026-01', '2026-02']);
    assert.deepStrictEqual(s[0], { month: '2026-01', income: 300000, expense: 104525, net: 195475, categories: [{ category: 'income', total: 300000 }, { category: 'housing', total: -100000 }, { category: 'transport', total: -4525 }] });
    assert.deepStrictEqual(s[1], { month: '2026-02', income: 0, expense: 102700, net: -102700, categories: [{ category: 'housing', total: -100000 }, { category: 'transport', total: -2350 }, { category: 'uncategorized', total: -350 }] });
  }],
  ['H10 category tie-break by name', () => {
    const s = monthlySummary([{ date: '2026-01-01', description: 'b', amount: -100 }, { date: '2026-01-01', description: 'a', amount: 100 }], [{ match: 'b', category: 'beta' }, { match: 'a', category: 'alpha' }]);
    assert.deepStrictEqual(s[0].categories.map((c) => c.category), ['alpha', 'beta']);
  }],
  ['H11 formatCents', () => { assert.strictEqual(formatCents(123456), '1,234.56'); assert.strictEqual(formatCents(-50), '-0.50'); assert.strictEqual(formatCents(0), '0.00'); assert.strictEqual(formatCents(-100000), '-1,000.00'); assert.strictEqual(formatCents(5), '0.05'); }],
  ['H12 formatReport exact', () => {
    const out = formatReport([{ month: '2026-01', income: 300000, expense: 104525, net: 195475, categories: [{ category: 'income', total: 300000 }, { category: 'housing', total: -100000 }] }, { month: '2026-02', income: 0, expense: 350, net: -350, categories: [{ category: 'uncategorized', total: -350 }] }]);
    assert.strictEqual(out, '== 2026-01 ==\nincome: 3,000.00\nexpense: 1,045.25\nnet: 1,954.75\n- income: 3,000.00\n- housing: -1,000.00\n\n== 2026-02 ==\nincome: 0.00\nexpense: 3.50\nnet: -3.50\n- uncategorized: -3.50');
  }],
  ['H13 run integration', () => {
    const out = run(csv, rules);
    assert.strictEqual(out, '== 2026-01 ==\nincome: 3,000.00\nexpense: 1,045.25\nnet: 1,954.75\n- income: 3,000.00\n- housing: -1,000.00\n- transport: -45.25\n\n== 2026-02 ==\nincome: 0.00\nexpense: 1,027.00\nnet: -1,027.00\n- housing: -1,000.00\n- transport: -23.50\n- uncategorized: -3.50');
  }],
];
let failed = 0;
for (const [name, fn] of cases) {
  try { fn(); console.log('PASS', name); } catch (e) { failed++; console.log('FAIL', name, '-', String(e.message).split('\n')[0]); }
}
console.log(`HIDDEN ${cases.length - failed}/${cases.length}`);
process.exit(failed ? 1 : 0);
