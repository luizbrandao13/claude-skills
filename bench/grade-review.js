// Grade code-review runs on the `review` fixture: how many of the 11 planted bugs each report mentions.
//   node bench/grade-review.js <runs-dir>
// Matching is by regex over the final report; read the reports (graded.json) before quoting a number.
'use strict';
const fs = require('fs'), path = require('path');
const RUNS = path.resolve(process.argv[2] || '');
const BUGS = [
  ['1 eval of user input (critical)',        /\beval\b|code injection|arbitrary code/i],
  ['2 paginate off-by-one (critical)',       /paginat|off[- ]by[- ]one|limit ?- ?1|drops? the last/i],
  ['3 float money math (high)',              /floating[- ]point|\bfloat\b|precision|rounding|cents|0\.1 \+ 0\.2|=== ?order\.paid|float equality/i],
  ['4 sortItems mutates input (medium)',     /mutat|in[- ]place|caller'?s (array|items)|side[- ]effect|sortItems/i],
  ['5 orderDay timezone/padding (medium)',   /time ?zone|\bUTC\b|local time|off by one day|orderDay|zero[- ]pad/i],
  ['6 legacyTaxRate dead code / 0.7 (low)',  /legacyTaxRate|dead code|unused function|never called|0\.7/i],
  ['7 submitOrder missing await (critical)', /await|unhandled (promise )?rejection|fire[- ]and[- ]forget|submitOrder/i],
  ['8 loadOrder swallows errors (high)',     /swallow|console\.log\(err|returns? undefined|silently|loadOrder/i],
  ['9 cloneOrder shallow copy (high)',       /shallow|Object\.assign|same (items )?array|deep[- ]?(copy|clone)|cloneOrder/i],
  ['10 orderCache unbounded (medium)',       /cache[^.]{0,120}(grow|evict|leak|unbounded|never (cleared|removed|expires)|memory)|(leak|unbounded|evict)[^.]{0,120}cache/i],
  ['11 isValidEmail too strict (low)',       /isValidEmail|email[^.]{0,80}(restrictive|reject|strict|uppercase|plus|subdomain|digits)/i],
];
const CRIT = new Set([0, 1, 6]);
const ids = fs.readdirSync(RUNS).filter((f) => f.endsWith('.json') && !f.startsWith('graded')).map((f) => f.replace('.json', '')).sort();
const rows = [];
for (const id of ids) {
  let j = {}; try { j = JSON.parse(fs.readFileSync(path.join(RUNS, id + '.json'), 'utf8')); } catch (e) { j = { parse_error: String(e) }; }
  const rep = j.result || '';
  const found = BUGS.map(([name, re]) => re.test(rep));
  const mu = j.modelUsage || {}; let out = 0; for (const k in mu) out += mu[k].outputTokens || 0;
  rows.push({ id, subtype: j.subtype, turns: j.num_turns, api_s: j.duration_ms ? Math.round(j.duration_ms / 1000) : null, cost: j.total_cost_usd ? +j.total_cost_usd.toFixed(3) : null, out_tokens: out,
    recall_all: `${found.filter(Boolean).length}/${BUGS.length}`, recall_critical: `${found.filter((f, i) => f && CRIT.has(i)).length}/${CRIT.size}`,
    missed: BUGS.filter((b, i) => !found[i]).map((b) => b[0]), report_chars: rep.length, report: rep });
}
for (const r of rows) { const { report, ...rest } = r; console.log(JSON.stringify(rest)); }
fs.writeFileSync(path.join(RUNS, 'graded-review.json'), JSON.stringify(rows, null, 1));
