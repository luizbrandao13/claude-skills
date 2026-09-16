#!/bin/bash
set -eu

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
TMPROOT="$(mktemp -d "${TMPDIR:-/tmp}/claude-skills-runner-test.XXXXXX")"
trap 'rm -r "$TMPROOT"' EXIT

CALLER="$TMPROOT/caller"
FAKE_BIN="$TMPROOT/bin"
CAPTURE="$TMPROOT/capture"
mkdir -p "$CALLER" "$FAKE_BIN" "$CAPTURE"
cp "$ROOT/bench/prompts/vague_ledger.txt" "$CALLER/prompt.txt"
cp "$ROOT/prompt-master/SKILL.md" "$CALLER/skill.md"

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

(
  cd "$CALLER"
  PATH="$FAKE_BIN:$PATH" CLAUDE_CAPTURE="$CAPTURE" \
    "$ROOT/bench/run.sh" ledger fake-model relative-paths 1 \
      --prompt prompt.txt \
      --skill skill.md \
      --out runs
)

cmp "$CALLER/prompt.txt" "$CAPTURE/prompt"
cmp "$CALLER/skill.md" "$CAPTURE/skill"
test -f "$CALLER/runs/ledger-relative-paths-1.json"
test -f "$CALLER/runs/ledger-relative-paths-1.done"

rm "$CAPTURE/invoked"
if (
  cd "$CALLER"
  PATH="$FAKE_BIN:$PATH" CLAUDE_CAPTURE="$CAPTURE" \
    "$ROOT/bench/run.sh" ledger fake-model missing-prompt 1 \
      --prompt missing-prompt.txt \
      --out runs
) 2> "$CAPTURE/missing-prompt.err"; then
  printf '%s\n' "missing prompt unexpectedly succeeded" >&2
  exit 1
fi
test ! -e "$CAPTURE/invoked"
grep -F "missing-prompt.txt" "$CAPTURE/missing-prompt.err"

if (
  cd "$CALLER"
  PATH="$FAKE_BIN:$PATH" CLAUDE_CAPTURE="$CAPTURE" \
    "$ROOT/bench/run.sh" ledger fake-model missing-skill 1 \
      --prompt prompt.txt \
      --skill missing-skill.md \
      --out runs
) 2> "$CAPTURE/missing-skill.err"; then
  printf '%s\n' "missing skill unexpectedly succeeded" >&2
  exit 1
fi
test ! -e "$CAPTURE/invoked"
grep -F "missing-skill.md" "$CAPTURE/missing-skill.err"

printf '%s\n' "runner relative paths: PASS"
