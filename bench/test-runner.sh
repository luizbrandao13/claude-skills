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
printf '%s\n' "runner relative paths: PASS"
