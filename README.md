# claude-skills

Two [Claude Code skills](https://code.claude.com/docs/en/skills) that tune how Claude works, grounded in Anthropic's official prompting documentation rather than folklore:

| Skill | What it does | When it triggers |
|---|---|---|
| [`fable-mode`](fable-mode/SKILL.md) | Makes Claude Opus 4.8, Claude Opus 5, or any non-Fable model operate with Claude Fable 5's working discipline — spec-first execution, per-model tool and subagent calibration, fresh-context self-verification, grounded progress claims, memory, and calibrated autonomy. | Substantial work: multi-step coding, long-horizon agentic tasks, large refactors, audits, deep research, overnight runs. Or explicitly via `/fable-mode`. |
| [`sonnet-lean`](sonnet-lean/SKILL.md) | Cuts token spend whenever work runs on Claude Sonnet 5 — as a delegated subagent/worker or as the session model — using Anthropic's documented cost levers. | Whenever tasks are delegated to Sonnet workers, or when building prompts/pipelines that call a `claude-sonnet-*` model. Or explicitly via `/sonnet-lean`. |

The two compose: `fable-mode` decides *when* to delegate and to *which* model tier; `sonnet-lean` makes the Sonnet leg of that delegation run as cheaply as possible.

## Why these exist

**The gap between models is partly weights, partly process.** Claude Fable 5 outperforms the Opus tier for two reasons: deeper raw reasoning (which no prompt can transfer) and a documented set of working disciplines — how it specs tasks, investigates before answering, delegates, verifies its own work, and reports progress. That second half is prompt-shaped. `fable-mode` installs it, calibrated per model: on Opus 4.8 it counteracts documented defaults (favoring reasoning over tool calls, under-spawning subagents, asking too often); on Claude Opus 5 — which reverses several of those defaults, over-delegating and self-verifying unprompted — it caps rather than pushes, per the skill's Model calibration table. On well-specified work, the quality gap shrinks dramatically — at half the price. On genuinely novel, hardest-tier problems, Fable stays ahead; the skill says so rather than pretending otherwise.

**Sonnet 5's defaults are tuned for capability, not cost.** Effort defaults to `high`, adaptive thinking is on by default, and its tokenizer produces ~30% more tokens for the same text than Sonnet 4.6. Anthropic's own cross-model mapping says Sonnet 5 at `medium` effort matches Sonnet 4.6 at `high` — so most delegated worker tasks are silently overpaying. `sonnet-lean` sets each lever deliberately: effort down-mapping, one-shot complete briefs (drip-fed instructions measurably waste tokens), structured output constraints, and thinking-trigger steering.

## Installation

Clone and copy the skill folders into your Claude Code skills directory:

```bash
git clone https://github.com/henriquetell/claude-skills.git
cp -R claude-skills/fable-mode claude-skills/sonnet-lean ~/.claude/skills/
```

Per-project installation works too — use `.claude/skills/` inside a repository instead of `~/.claude/skills/`.

Each folder name must match the `name:` field in its `SKILL.md` frontmatter (they already do).

## Usage

Both skills auto-trigger when their `description` matches the task, or can be invoked explicitly:

```
/fable-mode   # then give it a substantial task
/sonnet-lean  # when setting up Sonnet-bound delegation or pipelines
```

Typical `fable-mode` session: give the full task specification in one message (goal, constraints, what "done" looks like, and why you need it). The skill batches any clarifying questions into a single round, then runs autonomously — delegating fan-out work in parallel, verifying each step against a check that can actually fail, and reporting only claims backed by tool-result evidence.

Typical `sonnet-lean` win: a Workflow/Agent stage that ran Sonnet at default settings gets rerouted as `{model: 'sonnet', effort: 'medium'}` with a complete one-turn brief and a structured output schema — same result quality tier, meaningfully fewer tokens both in and out.

Neither skill applies itself to trivial work. Running the full protocol on a one-line fix costs more than it buys, and both skills say so in their trigger descriptions.

## Is it tested? An honest A/B example

Partially — and in the spirit of these skills' own rules (only claim what you can point to evidence for), here is exactly what has and hasn't been verified.

**Verified:** both skills load and register correctly in Claude Code; every rule traces to an Anthropic doc that was fetched at authoring time (see `fable-mode/reference.md`); and the briefing rules were A/B tested once, as follows.

**The experiment (2026-07-09, Claude Code, one run per arm — a demo, not a benchmark):** two Sonnet subagents were given the *identical* task — read `fable-mode/SKILL.md` and describe its section structure — differing only in the brief.

*Arm A, naive brief (how most people delegate):*

```text
Read the file ".../fable-mode/SKILL.md" and analyze its structure.
Tell me about the sections it contains and what each one covers.
```

*Arm B, sonnet-lean briefing template:*

```text
Task: Outline the structure of one skill file so it can be indexed.
Deliverable: A numbered plain-text list, one line per top-level section:
"N. <section title> — <one-line summary, max 15 words>". Your final message
is the return value: the list only, no preamble, no recap, no commentary.
Context: Read ".../fable-mode/SKILL.md" (the whole file).
Scope: All top-level "##" sections, not just the first few. Do not evaluate
or critique the content.
Provide concise, focused responses. Skip non-essential context, and keep
examples minimal.
```

**Measured results:**

| Metric | A: naive | B: lean | Delta |
|---|---|---|---|
| Returned payload | 4,703 chars / 635 words | 1,777 chars / 271 words | **−62%** |
| Wall time | 21.9 s | 10.1 s | **−54%** |
| Coverage of the file's 14 `##` sections | 14/14 | 14/14 (verified vs. `grep -c '^## '`) | equal |
| Total subagent tokens (input + output) | 23,540 | 23,647 | ≈ equal |

**Honest reading of those numbers.** The last row matters: per-call *total* tokens barely moved, because in a subagent call the fixed input (agent system prompt + the file both agents read) dominates. What the lean brief actually cut was the **output** — the expensive tokens (billed at a multiple of input) and the ones that compound: the orchestrator ingests the returned payload into its context and re-processes it on every subsequent turn of the parent session, so a 62% smaller return keeps paying for itself. The halved wall time is consistent with roughly proportionally fewer output tokens generated. And coverage was identical — the lean output lost nothing the task actually asked for; arm A's extra 2,900 characters were prose framing, a closing recap, and the file path restated back to the caller that already supplied it.

**Not verified (and stated in the skill itself):** the effort down-mapping — the *biggest* documented lever — couldn't be measured here because this harness's interactive Agent tool exposes `model` but not `effort`; that claim rests on Anthropic's published Sonnet 5 ↔ Sonnet 4.6 equivalence, not on our measurement. This was also a single small task with one run per arm — enough to demonstrate the mechanism, not to promise a percentage. Treat the numbers as an existence proof; run your own eval before quoting savings.

## Design principles

1. **Every rule cites a source.** `fable-mode/reference.md` preserves the verbatim Anthropic snippets and URLs each rule was derived from, so the skill can be re-derived or re-tuned when the docs change. `sonnet-lean` lists its sources inline. Sources were last re-verified against the live docs on 2026-08-05; claims that have since disappeared from the docs are marked as historical in `reference.md` rather than silently kept.
2. **Checks must be able to fail.** Verification names an external artifact — a test command that ran, a file that provably exists, a source fetched in this run, a diff against spec. "I reviewed it and it looks right" doesn't count.
3. **Honest about limits.** A skill shapes procedure, not capability. Neither skill claims to make a model smarter — only to stop it from leaving documented performance or savings on the table.

## Repository layout

```
fable-mode/
  SKILL.md       # the operating protocol (sections 0–12)
  reference.md   # verbatim Anthropic source snippets + provenance of every rule
sonnet-lean/
  SKILL.md       # the token-efficiency levers, with briefing template
README.md
LICENSE
```

## Sources & credits

Built on Anthropic's official documentation:

- [Prompting Claude Fable 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5)
- [Prompting Claude Opus 4.8](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8)
- [Prompting Claude Opus 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5)
- [Prompting Claude Sonnet 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5)
- [Claude prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- [Migration guide](https://platform.claude.com/docs/en/about-claude/models/migration-guide)

Several verification ideas in `fable-mode` (the failable-check standard, domain check anchors, replan budget, verify-before-flag) were adopted from [mrtooher/fable-mode](https://github.com/mrtooher/fable-mode) — a community skill with a different architecture but a genuinely sharp verification standard. `fable-mode/reference.md` documents exactly what was adopted, what was rejected, and why.

## License

[MIT](LICENSE)
