# claude-skills

Two [Claude Code skills](https://code.claude.com/docs/en/skills) that tune how Claude works, grounded in Anthropic's official prompting documentation rather than folklore:

| Skill | What it does | When it triggers |
|---|---|---|
| [`fable-mode`](fable-mode/SKILL.md) | Makes Claude Opus 4.8 (or any non-Fable model) operate with Claude Fable 5's working discipline — spec-first execution, aggressive tool and subagent use, fresh-context self-verification, grounded progress claims, memory, and calibrated autonomy. | Substantial work: multi-step coding, long-horizon agentic tasks, large refactors, audits, deep research, overnight runs. Or explicitly via `/fable-mode`. |
| [`sonnet-lean`](sonnet-lean/SKILL.md) | Cuts token spend whenever work runs on Claude Sonnet 5 — as a delegated subagent/worker or as the session model — using Anthropic's documented cost levers. | Whenever tasks are delegated to Sonnet workers, or when building prompts/pipelines that call a `claude-sonnet-*` model. Or explicitly via `/sonnet-lean`. |

The two compose: `fable-mode` decides *when* to delegate and to *which* model tier; `sonnet-lean` makes the Sonnet leg of that delegation run as cheaply as possible.

## Why these exist

**The gap between models is partly weights, partly process.** Claude Fable 5 outperforms Opus 4.8 for two reasons: deeper raw reasoning (which no prompt can transfer) and a documented set of working disciplines — how it specs tasks, investigates before answering, delegates, verifies its own work, and reports progress. That second half is prompt-shaped. `fable-mode` installs it on Opus 4.8, explicitly counteracting Opus 4.8's documented defaults (favoring reasoning over tool calls, under-spawning subagents, under-using memory, asking too often). On well-specified work, the quality gap shrinks dramatically — at half the price. On genuinely novel, hardest-tier problems, Fable stays ahead; the skill says so rather than pretending otherwise.

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

## Design principles

1. **Every rule cites a source.** `fable-mode/reference.md` preserves the verbatim Anthropic snippets and URLs each rule was derived from, so the skill can be re-derived or re-tuned when the docs change. `sonnet-lean` lists its sources inline.
2. **Checks must be able to fail.** Verification names an external artifact — a test command that ran, a file that provably exists, a source fetched in this run, a diff against spec. "I reviewed it and it looks right" doesn't count.
3. **Honest about limits.** A skill shapes procedure, not capability. Neither skill claims to make a model smarter — only to stop it from leaving documented performance or savings on the table.

## Repository layout

```
fable-mode/
  SKILL.md       # the operating protocol (12 sections)
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
- [Prompting Claude Sonnet 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5)
- [Claude prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- [Migration guide](https://platform.claude.com/docs/en/about-claude/models/migration-guide)

Several verification ideas in `fable-mode` (the failable-check standard, domain check anchors, replan budget, verify-before-flag) were adopted from [mrtooher/fable-mode](https://github.com/mrtooher/fable-mode) — a community skill with a different architecture but a genuinely sharp verification standard. `fable-mode/reference.md` documents exactly what was adopted, what was rejected, and why.

## License

[MIT](LICENSE)
