'use strict';

function categorize(txn, rules) {
  let category = 'uncategorized';
  for (const rule of rules) {
    if (txn.description.includes(rule.match)) category = rule.category;
  }
  return category;
}

module.exports = { categorize };
