'use strict';
function categorize(txn, rules) { const d = txn.description.toLowerCase(); for (const r of rules) if (d.includes(r.match.toLowerCase())) return r.category; return 'uncategorized'; }
module.exports = { categorize };
