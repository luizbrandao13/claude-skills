'use strict';
const assert = require('assert');
const { createLimiter } = require('../lib/limiter');
const cases = [
  ['H1 allow/deny with remaining and retry', () => {
    const l = createLimiter({ limit: 3, windowMs: 1000 });
    assert.deepStrictEqual(l.allow('a', 0), { allowed: true, remaining: 2, retryAfterMs: 0 });
    assert.deepStrictEqual(l.allow('a', 0), { allowed: true, remaining: 1, retryAfterMs: 0 });
    assert.deepStrictEqual(l.allow('a', 0), { allowed: true, remaining: 0, retryAfterMs: 0 });
    assert.deepStrictEqual(l.allow('a', 500), { allowed: false, remaining: 0, retryAfterMs: 500 });
  }],
  ['H2 exact window boundary is expired', () => {
    const l = createLimiter({ limit: 1, windowMs: 1000 });
    l.allow('a', 0);
    assert.strictEqual(l.allow('a', 999).allowed, false);
    assert.strictEqual(l.allow('a', 1000).allowed, true);
  }],
  ['H3 denied requests are not recorded', () => {
    const l = createLimiter({ limit: 1, windowMs: 1000 });
    l.allow('a', 0);
    for (let t = 1; t < 1000; t += 100) assert.strictEqual(l.allow('a', t).allowed, false);
    assert.deepStrictEqual(l.allow('a', 1000), { allowed: true, remaining: 0, retryAfterMs: 0 });
  }],
  ['H4 sliding (not fixed) window', () => {
    const l = createLimiter({ limit: 3, windowMs: 1000 });
    l.allow('a', 0); l.allow('a', 100); l.allow('a', 200);
    assert.deepStrictEqual(l.allow('a', 250), { allowed: false, remaining: 0, retryAfterMs: 750 });
    assert.strictEqual(l.allow('a', 1050).allowed, true);
    assert.deepStrictEqual(l.allow('a', 1060), { allowed: false, remaining: 0, retryAfterMs: 40 });
  }],
  ['H5 retryAfterMs uses oldest in-window timestamp', () => {
    const l = createLimiter({ limit: 2, windowMs: 100 });
    l.allow('k', 0); l.allow('k', 90);
    assert.strictEqual(l.allow('k', 95).retryAfterMs, 5);
    assert.strictEqual(l.allow('k', 100).allowed, true);
    assert.strictEqual(l.allow('k', 150).retryAfterMs, 40);
  }],
  ['H6 keys independent', () => {
    const l = createLimiter({ limit: 1, windowMs: 1000 });
    assert.strictEqual(l.allow('a', 0).allowed, true);
    assert.strictEqual(l.allow('b', 0).allowed, true);
    assert.strictEqual(l.allow('a', 1).allowed, false);
    assert.strictEqual(l.allow('c', 1).allowed, true);
  }],
  ['H7 prune count and size', () => {
    const l = createLimiter({ limit: 2, windowMs: 100 });
    l.allow('a', 0); l.allow('b', 50); l.allow('c', 90);
    assert.strictEqual(l.size(), 3);
    assert.strictEqual(l.prune(150), 2);
    assert.strictEqual(l.size(), 1);
    assert.strictEqual(l.prune(150), 0);
    assert.strictEqual(l.prune(190), 1);
    assert.strictEqual(l.size(), 0);
  }],
  ['H8 prune keeps in-window timestamps only', () => {
    const l = createLimiter({ limit: 2, windowMs: 100 });
    l.allow('a', 0); l.allow('a', 80);
    l.prune(100);
    assert.deepStrictEqual(l.allow('a', 100), { allowed: true, remaining: 0, retryAfterMs: 0 });
  }],
  ['H9 invalid options throw TypeError', () => {
    for (const o of [undefined, {}, { limit: 0, windowMs: 10 }, { limit: 1.5, windowMs: 10 }, { limit: 1, windowMs: 0 }, { limit: 1, windowMs: 'x' }, { limit: '2', windowMs: 10 }]) {
      assert.throws(() => createLimiter(o), TypeError, JSON.stringify(o));
    }
  }],
  ['H10 limit 1 window 1 edge', () => {
    const l = createLimiter({ limit: 1, windowMs: 1 });
    assert.strictEqual(l.allow('a', 5).allowed, true);
    assert.deepStrictEqual(l.allow('a', 5), { allowed: false, remaining: 0, retryAfterMs: 1 });
    assert.strictEqual(l.allow('a', 6).allowed, true);
  }],
];
let failed = 0;
for (const [name, fn] of cases) {
  try { fn(); console.log('PASS', name); } catch (e) { failed++; console.log('FAIL', name, '-', String(e.message).split('\n')[0]); }
}
console.log(`HIDDEN ${cases.length - failed}/${cases.length}`);
process.exit(failed ? 1 : 0);
