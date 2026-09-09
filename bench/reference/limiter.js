'use strict';
function createLimiter(options) {
  const { limit, windowMs } = options || {};
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(windowMs) || windowMs < 1) throw new TypeError('invalid options');
  const logs = new Map();
  const live = (key, now) => { const kept = (logs.get(key) || []).filter((t) => t > now - windowMs); if (kept.length) logs.set(key, kept); else logs.delete(key); return kept; };
  return {
    allow(key, now) {
      const arr = live(key, now);
      if (arr.length < limit) { arr.push(now); logs.set(key, arr); return { allowed: true, remaining: limit - arr.length, retryAfterMs: 0 }; }
      return { allowed: false, remaining: 0, retryAfterMs: arr[0] + windowMs - now };
    },
    prune(now) { let removed = 0; for (const k of [...logs.keys()]) { if (!live(k, now).length) removed++; } return removed; },
    size() { return logs.size; },
  };
}
module.exports = { createLimiter };
