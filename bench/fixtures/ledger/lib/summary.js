'use strict';
const { categorize } = require('./categorize');

function monthlySummary(txns, rules) {
  const months = {};
  for (const t of txns) {
    const month = t.date.slice(0, 7);
    const m = (months[month] = months[month] || { month, income: 0, expense: 0, net: 0, cats: {} });
    const dollars = t.amount / 100;
    if (dollars > 0) m.income += dollars; else m.expense += -dollars;
    const c = categorize(t, rules);
    m.cats[c] = (m.cats[c] || 0) + dollars;
  }
  return Object.values(months).map((m) => ({
    month: m.month,
    income: Math.round(m.income * 100),
    expense: Math.round(m.expense * 100),
    net: Math.round((m.income - m.expense) * 100),
    categories: Object.entries(m.cats)
      .map(([category, total]) => ({ category, total: Math.round(total * 100) }))
      .sort((a, b) => b.total - a.total),
  }));
}

module.exports = { monthlySummary };
