'use strict';

function parseAmount(str) {
  const n = parseFloat(String(str).replace('$', ''));
  return Math.round(n * 100);
}

function parseDate(str) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(str);
  if (m) return `${m[3]}-${m[1]}-${m[2]}`;
  throw new Error('bad date: ' + str);
}

function parseCsv(text) {
  const lines = text.split('\n');
  lines.shift();
  return lines.map((line) => {
    const [date, description, amount] = line.split(',');
    return { date: parseDate(date), description: description.trim(), amount: parseAmount(amount) };
  });
}

module.exports = { parseAmount, parseDate, parseCsv };
