# slug

A tiny URL-slug library. `lib/slug.js` must export `slugify` and `uniqueSlugs` exactly as specified here.

## slugify(input) -> string

1. Coerce `input` to a string (`null`/`undefined` become the empty string).
2. Transliterate accented Latin letters to their ASCII base letter (e.g. `é` -> `e`, `Å` -> `a`). Unicode NFKD normalization followed by removing combining marks is an acceptable method.
3. Lowercase everything.
4. Replace every `&` with the word `and` (so `Rock & Roll` -> `rock-and-roll`).
5. Replace every run of characters that are not `a-z` or `0-9` with a single hyphen.
6. Strip leading and trailing hyphens.
7. If the result is empty, return `untitled`.
8. Length cap: the slug must be at most 40 characters. Truncate without splitting a word: keep the longest prefix of whole hyphen-separated words whose total length is <= 40. If the first word alone is longer than 40 characters, hard-cut that word to 40 characters. Never return a slug that ends with a hyphen.

## uniqueSlugs(titles, existing = []) -> string[]

Returns one slug per title, in the same order as `titles`.

1. Each slug is `slugify(title)`, made unique against (a) every slug in `existing` and (b) every slug already produced earlier in this call.
2. Comparison is case-insensitive (`existing` may contain upper-case entries).
3. The first collision gets the suffix `-2`, the next `-3`, and so on. A suffixed candidate must itself be unique; if `-2` is taken, try `-3`, etc.
4. A suffixed slug must still respect the 40-character cap. If `base + suffix` would exceed 40, hard-cut the base to `40 - suffix.length` characters, then strip any trailing hyphens from the cut base, then append the suffix.
