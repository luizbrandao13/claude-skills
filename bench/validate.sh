#!/bin/bash
# Prove the fixtures are fair before spending model tokens: the reference solution must pass every hidden test and
# the buggy starting code must fail most of them. (The ledger reference deliberately fails one visible test: that
# test contradicts the spec on purpose.)
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"; V="${TMPDIR:-/tmp}/claude-skills-bench/validate"; rm -rf "$V"; mkdir -p "$V"
for t in slug limiter ledger; do
  cp -R "$HERE/fixtures/$t" "$V/$t-ref"; cp -R "$HERE/fixtures/$t" "$V/$t-buggy"
  if [ -d "$HERE/reference/$t" ]; then cp "$HERE/reference/$t/"*.js "$V/$t-ref/lib/"; else cp "$HERE/reference/$t.js" "$V/$t-ref/lib/$t.js"; fi
  for a in ref buggy; do cp "$HERE/hidden/$t.hidden.test.js" "$V/$t-$a/test/hidden.test.js"; done
  echo "== $t reference: visible $(cd "$V/$t-ref" && node test/visible.test.js | tail -1) | hidden $(cd "$V/$t-ref" && node test/hidden.test.js | tail -1)"
  echo "== $t buggy:     visible $(cd "$V/$t-buggy" && node test/visible.test.js | tail -1) | hidden $(cd "$V/$t-buggy" && (node test/hidden.test.js 2>/dev/null | tail -1 || echo crash))"
done
