'use strict';
function parseAmount(str) {
  let s = String(str).trim(); let neg = false;
  if (s.startsWith('$')) s = s.slice(1).trim();
  if (s.startsWith('(') && s.endsWith(')')) { neg = true; s = s.slice(1, -1).trim(); }
  else if (s.startsWith('-')) { neg = true; s = s.slice(1).trim(); }
  if (!/^\d{1,3}(,\d{3})*(\.\d{1,2})?$|^\d+(\.\d{1,2})?$/.test(s)) throw new Error('bad amount: ' + str);
  const [w, d = ''] = s.replace(/,/g, '').split('.');
  const cents = parseInt(w, 10) * 100 + parseInt((d + '00').slice(0, 2), 10);
  return neg ? -cents : cents;
}
function valid(y, m, d) { const dt = new Date(Date.UTC(y, m - 1, d)); return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d; }
function parseDate(str) {
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str); let y, mo, d;
  if (m) { y = +m[1]; mo = +m[2]; d = +m[3]; }
  else if ((m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(str))) { d = +m[1]; mo = +m[2]; y = +m[3]; }
  else throw new Error('bad date: ' + str);
  if (!valid(y, mo, d)) throw new Error('bad date: ' + str);
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
function splitCsvLine(line) {
  const out = []; let cur = ''; let q = false;
  for (let i = 0; i < line.length; i++) { const ch = line[i];
    if (q) { if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
    else if (ch === '"') q = true; else if (ch === ',') { out.push(cur); cur = ''; } else cur += ch; }
  out.push(cur); return out;
}
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  lines.shift();
  return lines.map((line) => { const [date, description, amount] = splitCsvLine(line); return { date: parseDate(date.trim()), description: description.trim(), amount: parseAmount(amount) }; });
}
module.exports = { parseAmount, parseDate, parseCsv };
