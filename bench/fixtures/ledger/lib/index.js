'use strict';
const { parseCsv } = require('./parse');
const { monthlySummary } = require('./summary');
const { formatReport } = require('./report');

function run(csvText, rules) {
  return formatReport(monthlySummary(parseCsv(csvText), rules));
}

module.exports = { run };
