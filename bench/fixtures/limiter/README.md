# limiter

A sliding-window rate limiter with an injectable clock. `lib/limiter.js` must export `createLimiter` exactly as specified here. Time is always passed in explicitly as an integer number of milliseconds; the library never reads the system clock. Callers pass non-decreasing `now` values.

## createLimiter({ limit, windowMs }) -> limiter

- `limit`: maximum number of allowed requests per key within any window. Must be an integer >= 1.
- `windowMs`: window length in milliseconds. Must be an integer >= 1.
- If either option is missing or invalid, throw a `TypeError`.

## limiter.allow(key, now) -> { allowed, remaining, retryAfterMs }

Sliding-window log semantics, per key:

1. A recorded timestamp `t` is **inside** the window at time `now` when `t > now - windowMs`. A timestamp exactly `windowMs` old is expired.
2. Count the key's recorded timestamps inside the window. If the count is less than `limit`: record `now` for this key and return `{ allowed: true, remaining: limit - (count + 1), retryAfterMs: 0 }`.
3. Otherwise do **not** record anything and return `{ allowed: false, remaining: 0, retryAfterMs: oldest + windowMs - now }`, where `oldest` is the oldest recorded timestamp still inside the window (i.e. how long until one slot frees up).
4. Keys are fully independent.

## limiter.prune(now) -> number

Remove every expired timestamp (per rule 1) from every key. Delete keys that have no timestamps left. Return the number of keys deleted.

## limiter.size() -> number

Number of keys currently tracked (keys with at least one recorded timestamp, expired or not, since the last prune/allow touched them).
