'use strict';
function formatCents(cents) { const neg = cents < 0; const abs = Math.abs(cents); const whole = String(Math.floor(abs / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (neg ? '-' : '') + whole + '.' + String(abs % 100).padStart(2, '0'); }
function formatReport(summary) { return summary.map((m) => { const l = [`== ${m.month} ==`, `income: ${formatCents(m.income)}`, `expense: ${formatCents(m.expense)}`, `net: ${formatCents(m.net)}`]; for (const c of m.categories) l.push(`- ${c.category}: ${formatCents(c.total)}`); return l.join('\n'); }).join('\n\n'); }
module.exports = { formatCents, formatReport };
