# checkout helpers

`lib/orders.js` holds the order helpers used by the checkout service. Orders look like
`{ id, items: [{ sku, price, qty }], paid, createdAt: 'YYYY-MM-DD', status }`. `db` is an async
store with `insert(table, row)` and `findOne(table, query)`.
