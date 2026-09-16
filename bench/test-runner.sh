#!/bin/bash
set -eu

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
TMPROOT="$(mktemp -d "${TMPDIR:-/tmp}/claude-skills-runner-test.XXXXXX")"
trap 'rm -rf -- "$TMPROOT"' EXIT

CALLER="$TMPROOT/caller with spaces"
FAKE_BIN="$TMPROOT/bin"
CAPTURE="$TMPROOT/capture"
PROMPT_SOURCE="$ROOT/bench/prompts/vague_ledger.txt"
DEFAULT_PROMPT="$ROOT/bench/prompts/precise_ledger.txt"
SKILL_SOURCE="$ROOT/prompt-master/SKILL.md"

[ -f "$PROMPT_SOURCE" ] || { printf 'runner test source missing: %s\n' "$PROMPT_SOURCE" >&2; exit 1; }
[ -f "$DEFAULT_PROMPT" ] || { printf 'runner test source missing: %s\n' "$DEFAULT_PROMPT" >&2; exit 1; }
[ -f "$SKILL_SOURCE" ] || { printf 'runner test source missing: %s\n' "$SKILL_SOURCE" >&2; exit 1; }

mkdir -p "$CALLER" "$FAKE_BIN" "$CAPTURE"
cp "$PROMPT_SOURCE" "$CALLER/prompt.txt"
cp "$SKILL_SOURCE" "$CALLER/skill.md"

cat > "$FAKE_BIN/claude" <<'EOF'
#!/bin/bash
set -eu
: > "$CLAUDE_CAPTURE/invoked"
while [ "$#" -gt 0 ]; do
  case "$1" in
    -p)
      printf '%s' "$2" > "$CLAUDE_CAPTURE/prompt"
      shift 2
      ;;
    --append-system-prompt)
      printf '%s' "$2" > "$CLAUDE_CAPTURE/skill"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done
printf '%s\n' '{"result":"offline runner test","modelUsage":{}}'
EOF
chmod +x "$FAKE_BIN/claude"

run_runner() {
  (
    cd "$CALLER"
    PATH="$FAKE_BIN:$PATH" CLAUDE_CAPTURE="$CAPTURE" \
      "$ROOT/bench/run.sh" "$@"
  )
}

assert_not_invoked() {
  [ ! -e "$CAPTURE/invoked" ] || {
    printf '%s\n' "fake claude was invoked after runner validation failure" >&2
    exit 1
  }
}

run_runner ledger fake-model relative-paths 1 \
  --prompt prompt.txt \
  --skill skill.md \
  --out runs
cmp "$CALLER/prompt.txt" "$CAPTURE/prompt"
cmp "$CALLER/skill.md" "$CAPTURE/skill"
test -f "$CALLER/runs/ledger-relative-paths-1.json"
test -f "$CALLER/runs/ledger-relative-paths-1.done"

printf '%s\n' "preserve me" > "$CALLER/runs/ledger-relative-paths-1/marker"
rm -f "$CAPTURE/invoked"
if run_runner ledger fake-model relative-paths 1 \
  --prompt missing-prompt.txt \
  --out runs 2> "$CAPTURE/missing-prompt.err"; then
  printf '%s\n' "missing prompt unexpectedly succeeded" >&2
  exit 1
fi
assert_not_invoked
[ -f "$CALLER/runs/ledger-relative-paths-1/marker" ] || {
  printf '%s\n' "existing run was removed before missing prompt validation" >&2
  exit 1
}
grep -F "missing-prompt.txt" "$CAPTURE/missing-prompt.err"

if run_runner ledger fake-model missing-skill 1 \
  --prompt prompt.txt \
  --skill missing-skill.md \
  --out runs 2> "$CAPTURE/missing-skill.err"; then
  printf '%s\n' "missing skill unexpectedly succeeded" >&2
  exit 1
fi
assert_not_invoked
grep -F "missing-skill.md" "$CAPTURE/missing-skill.err"

if run_runner ledger fake-model unknown-option 1 \
  --unknown value > "$CAPTURE/unknown-option.err" 2>&1; then
  printf '%s\n' "unknown option unexpectedly succeeded" >&2
  exit 1
fi
assert_not_invoked
grep -F "unknown arg --unknown" "$CAPTURE/unknown-option.err"

run_runner ledger fake-model absolute-paths 1 \
  --prompt "$CALLER/prompt.txt" \
  --skill "$CALLER/skill.md" \
  --out "$CALLER/absolute runs"
cmp "$CALLER/prompt.txt" "$CAPTURE/prompt"
cmp "$CALLER/skill.md" "$CAPTURE/skill"
test -f "$CALLER/absolute runs/ledger-absolute-paths-1.done"

run_runner ledger fake-model default-prompt 1 --out runs
cmp "$DEFAULT_PROMPT" "$CAPTURE/prompt"
test -f "$CALLER/runs/ledger-default-prompt-1.done"

printf '%s\n' "runner relative paths: PASS"
