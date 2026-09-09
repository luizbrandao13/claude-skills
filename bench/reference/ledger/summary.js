'use strict';
const { categorize } = require('./categorize');
function monthlySummary(txns, rules) {
  const months = new Map();
  for (const t of txns) { const k = t.date.slice(0, 7); if (!months.has(k)) months.set(k, { month: k, income: 0, expense: 0, cats: new Map() }); const m = months.get(k);
    if (t.amount > 0) m.income += t.amount; else m.expense += -t.amount; const c = categorize(t, rules); m.cats.set(c, (m.cats.get(c) || 0) + t.amount); }
  return [...months.values()].sort((a, b) => a.month.localeCompare(b.month)).map((m) => ({ month: m.month, income: m.income, expense: m.expense, net: m.income - m.expense,
    categories: [...m.cats].map(([category, total]) => ({ category, total })).sort((a, b) => Math.abs(b.total) - Math.abs(a.total) || a.category.localeCompare(b.category)) }));
}
module.exports = { monthlySummary };
