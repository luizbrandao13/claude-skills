# ledger

A small personal-finance library: parse a CSV of transactions, categorize them by rules, summarize per month, and render a text report. The modules under `lib/` must behave exactly as specified here. `lib/index.js` wires them together.

All money is handled as **integer cents**. Never use floating point for sums.

## lib/parse.js

### parseAmount(str) -> integer cents

- Trim whitespace. An optional leading `$` is allowed.
- Thousands separators (`,`) are allowed and ignored: `1,234.50` -> `123450`.
- Up to two decimal places. Missing decimals mean whole units: `1,000` -> `100000`; `7.5` -> `750`.
- Negative amounts are written either with a leading minus (`-12.00`) or in accounting parentheses (`(12.00)`). Both mean `-1200`.
- Anything else (empty string, letters, more than two decimals, unbalanced parenthesis) throws an `Error`.

### parseDate(str) -> "YYYY-MM-DD"

- Accepts ISO `YYYY-MM-DD` or European `DD/MM/YYYY` (day first). `31/01/2026` -> `2026-01-31`.
- Any other shape, or an impossible calendar date, throws an `Error`.

### parseCsv(text) -> transaction[]

- The first non-blank line is the header and is exactly `date,description,amount`. It is skipped.
- Blank lines anywhere are skipped.
- Fields may be wrapped in double quotes; a quoted field may contain commas. A doubled quote inside a quoted field (`""`) is a literal quote.
- Each row becomes `{ date, description, amount }` using `parseDate`, a trimmed description, and `parseAmount`.

## lib/categorize.js

### categorize(txn, rules) -> string

- `rules` is an ordered array of `{ match, category }`.
- A rule matches when `match` occurs anywhere in the transaction description, **case-insensitively**.
- The **first** matching rule in array order wins.
- If no rule matches, the category is `uncategorized`.

## lib/summary.js

### monthlySummary(txns, rules) -> month[]

- One entry per calendar month that has at least one transaction, in **ascending** month order.
- Each entry: `{ month: "YYYY-MM", income, expense, net, categories }` where `income` is the sum of positive amounts, `expense` is the sum of the absolute values of negative amounts, `net = income - expense`. All integer cents.
- `categories` is an array of `{ category, total }` with `total` the **signed** sum of that category's amounts in that month, sorted by absolute total **descending**, ties broken by category name ascending.

## lib/report.js

### formatCents(cents) -> string

- Two decimal places, thousands separators, a leading `-` for negatives, no `+` for positives. `123456` -> `1,234.56`; `-50` -> `-0.50`; `0` -> `0.00`.

### formatReport(summary) -> string

For each month, in the order given, emit exactly these lines:

```
== YYYY-MM ==
income: <formatCents>
expense: <formatCents>
net: <formatCents>
- <category>: <formatCents>      (one line per entry in categories, in order)
```

Months are separated by one blank line. No trailing newline at the end of the report.

## lib/index.js

### run(csvText, rules) -> string

`formatReport(monthlySummary(parseCsv(csvText), rules))`.
