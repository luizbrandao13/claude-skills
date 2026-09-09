'use strict';

function createLimiter(options) {
  const limit = options.limit;
  const windowMs = options.windowMs;
  const buckets = {};

  return {
    allow(key, now) {
      let b = buckets[key];
      if (!b || now - b.start >= windowMs) {
        b = buckets[key] = { start: now, count: 0 };
      }
      if (b.count < limit) {
        b.count += 1;
        return { allowed: true };
      }
      return { allowed: false, retryAfterMs: b.start + windowMs - now };
    },
  };
}

module.exports = { createLimiter };
