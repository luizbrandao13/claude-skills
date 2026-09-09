'use strict';
const assert = require('assert');
const { createLimiter } = require('../lib/limiter');

const cases = [
  ['allows up to limit then denies', () => {
    const l = createLimiter({ limit: 2, windowMs: 1000 });
    assert.strictEqual(l.allow('a', 0).allowed, true);
    assert.strictEqual(l.allow('a', 10).allowed, true);
    const r = l.allow('a', 20);
    assert.strictEqual(r.allowed, false);
    assert.strictEqual(r.retryAfterMs, 980);
  }],
  ['keys are independent', () => {
    const l = createLimiter({ limit: 1, windowMs: 1000 });
    assert.strictEqual(l.allow('a', 0).allowed, true);
    assert.strictEqual(l.allow('b', 0).allowed, true);
    assert.strictEqual(l.allow('a', 1).allowed, false);
  }],
  ['remaining counts down', () => {
    const l = createLimiter({ limit: 3, windowMs: 1000 });
    assert.strictEqual(l.allow('a', 0).remaining, 2);
    assert.strictEqual(l.allow('a', 0).remaining, 1);
    assert.strictEqual(l.allow('a', 0).remaining, 0);
  }],
  ['prune removes idle keys', () => {
    const l = createLimiter({ limit: 1, windowMs: 100 });
    l.allow('a', 0); l.allow('b', 50);
    assert.strictEqual(l.size(), 2);
    assert.strictEqual(l.prune(120), 1);
    assert.strictEqual(l.size(), 1);
  }],
];

let failed = 0;
for (const [name, fn] of cases) {
  try { fn(); console.log('PASS', name); } catch (e) { failed++; console.log('FAIL', name, '-', e.message); }
}
console.log(`${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
