'use strict';

function formatCents(cents) {
  const sign = cents < 0 ? '-' : '+';
  const abs = Math.abs(cents);
  return sign + Math.floor(abs / 100) + '.' + String(abs % 100).padStart(2, '0');
}

function formatReport(summary) {
  return summary
    .map((m) => {
      const lines = [`== ${m.month} ==`, `income: ${formatCents(m.income)}`, `expense: ${formatCents(m.expense)}`, `net: ${formatCents(m.net)}`];
      for (const c of m.categories) lines.push(`- ${c.category}: ${formatCents(c.total)}`);
      return lines.join('\n');
    })
    .join('\n\n');
}

module.exports = { formatCents, formatReport };
