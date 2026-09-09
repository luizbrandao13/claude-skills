---
name: sonnet-lean
description: Cut token spend whenever work runs on Claude Sonnet 5 — as a delegated subagent/worker or as the session model. Applies Anthropic's documented Sonnet 5 cost levers — effort down-mapping (Sonnet 5 medium ≈ Sonnet 4.6 high), strict-effort scoping, thinking-trigger steering, verbosity control, one-shot complete briefs, and output-shape constraints. Trigger when delegating tasks to Sonnet workers (Agent tool model:"sonnet", Workflow agent() calls), when building prompts/pipelines that call a claude-sonnet-* model, or on /sonnet-lean. Do NOT trade effort down on tasks where a wrong answer forces a re-run — a failed cheap run costs more than one correct run.
---

# Sonnet Lean — spend fewer tokens per Sonnet call

Every rule here is from Anthropic's "Prompting Claude Sonnet 5" page (see Sources). Sonnet 5's defaults are tuned for capability, not cost: effort defaults to `high`, adaptive thinking is on by default, and its new tokenizer produces ~30% more tokens for the same text than Sonnet 4.6. Left alone, a Sonnet worker thinks, narrates, and pads more than the task needs. This skill sets each lever deliberately.

## 1. First question: is Sonnet even the right tier?

Route by difficulty, not habit. Bulk mechanical work — renames, extractions, format checks, file classification — goes to **Haiku**. Sonnet is for scoped work that needs real reasoning. If the task needs deep synthesis or judgment across many interacting parts, don't force it onto Sonnet at high effort — that often costs more than a stronger model doing it right once.

Measured (README, 2026-09-09): on a four-module coding task graded by hidden tests, Sonnet 5 at `low` effort scored the same 13/13 as Opus 5 and Fable 5.1, in half the time, at a fifth of Fable's cost. Start with Sonnet — as the worker, and as the session model for well-specified work — and escalate on evidence, not on habit.

## 2. Set effort deliberately (the biggest lever)

Sonnet 5's effort defaults to `high`. Anthropic's cross-model mapping: **Sonnet 5 at `medium` is comparable in intelligence to Sonnet 4.6 at `high`**, and Sonnet 5 at `high` ≈ Sonnet 4.6 at `max`. So for most delegated, well-scoped worker tasks, `medium` buys yesterday's high-effort quality at reduced spend. Effort saves what the task would otherwise spend on thinking: on mechanical work Sonnet 5 barely thinks at any level (measured 0–32 thinking tokens across `low`/`medium`/`high` on a file-outline task; see the README), so there the output constraints in §4 are the whole lever. On a task that does make it think (the same four-module job: ~9,000 thinking tokens at `high`, ~900 at `low`), quality held at every level — 13/13 hidden tests at `low`, `medium` and `high` — and what moved was **time**: `low` finished in half the time of `high`, while cost stayed flat because in Claude Code the fixed input of each run (a ~30K-token system prompt plus the files read) dwarfs the thinking saved. Inside Claude Code, effort is chiefly a latency lever; on the raw API with a small system prompt, the same reduction shows up as cost.

- **`medium`** — the lean default for delegated scoped work (focused reviews, single-module implementations, structured research reads).
- **`low`** — short, mechanical, latency-sensitive tasks that are not intelligence-sensitive (extraction, reformatting, checklist verification).
- **`high`/`xhigh`** — only when the subtask itself is genuinely hard; at that point question whether it should be delegated to Sonnet at all (§1).

Sonnet 5 **respects effort strictly**, especially at the low end: at `low`/`medium` it scopes work to exactly what was asked rather than going above and beyond. That's the cost win — but it means under-specified briefs fail quietly. If you see shallow reasoning on a complex task, **raise effort rather than prompting around it**; if you must stay at `low` for latency, add: "This task involves multistep reasoning. Think carefully through the problem before responding."

Where to set it: the Workflow tool's `agent(prompt, {model: 'sonnet', effort: 'medium'})` (load the bundled `/workflow-authoring` skill before writing a script); a custom subagent definition with `model: sonnet` and `effort: medium` in its frontmatter, which gives interactive Agent-tool delegation an effort lever the tool call itself lacks (the Agent tool takes `model` but not `effort`; an unspecified effort inherits the session's); on the API, `output_config: {effort: "..."}` with `thinking: {type: "adaptive"}`. Then check `/tasks`: it shows the model and effort each worker actually ran on, and when `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` is set every per-spawn and frontmatter model pick is silently ignored. Pick effort once at the start — on Sonnet 5 a mid-session effort change invalidates the prompt cache and the next turn re-reads the whole conversation uncached.

## 3. One complete brief, one turn

Anthropic's own token-efficiency guidance: well-specified, clear, accurate task descriptions **upfront in the first turn** maximize autonomy and minimize extra token usage; ambiguous prompts drip-fed across multiple turns reduce token efficiency *and* performance. For a Sonnet worker that means the brief contains, in one message:

- the task and the reason behind it (one line);
- the exact deliverable shape (see §4);
- the context it needs — **file paths and line ranges over pasted content** when the worker can read files itself; when you must inline long material, put it at the top and the ask at the end;
- what is explicitly out of scope.

Sonnet 5 follows instructions **literally**, especially at lower effort: it won't generalize an instruction from one item to the others or infer requests you didn't make. State scope explicitly ("apply this to every section, not just the first") — a re-run caused by an under-specified brief erases every token you saved.

## 4. Constrain the output — tokens out are the expensive ones

- Demand the deliverable's exact shape. Where the harness supports it, pass a **structured-output schema** (Workflow `agent(..., {schema})`) — validated data, no prose wrapper, no parsing retries.
- For prose outputs, include Anthropic's verbosity steer: *"Provide concise, focused responses. Skip non-essential context, and keep examples minimal."* Target specific verbosity patterns (over-explaining, restating the brief) with positive instructions — showing what good output looks like beats "don't" lists.
- Tell workers their final message **is the return value**: raw findings/data only — no preamble, no narrated recap of steps, no restating the task.
- Don't ask for interim status scaffolding ("summarize after every 3 tool calls") — Sonnet 5 already calibrates progress updates; forced ones are pure token overhead.
- When Sonnet 5 is the **session** model in Claude Code, the built-in **Concise** output style (`/config` → Output style) applies the results-first, no-narration steer at the system-prompt level for the whole session, "while doing the engineering work as thoroughly as in the Default style." It shapes the main conversation only — non-fork subagents run their own system prompt, so workers still need the steer in the brief. Select it at session start; a mid-session switch rebuilds the prompt cache.

## 5. Batch items per worker — the spawn is the expensive part

Every subagent call carries a fixed cost before it does anything useful: its system prompt, tool definitions, `CLAUDE.md`, and the files it reads. Measured in Claude Code (README, 2026-09-09): three Sonnet workers outlining one file each used 140,707 tokens in total; one worker outlining all three used 69,361 — half — with identical coverage, at about twice the wall time because the items ran in sequence inside one worker. The rules:

- Give **one worker every item that shares context** (same repo area, same instruction) unless latency matters more than tokens or the items would overflow its context.
- Keep the brief's shape *per item* — a header line per item, then that item's deliverable — so the return stays machine-readable (template in §7).
- Fan out across workers only when the items are independent **and** you need them in parallel; then keep every worker's configuration identical (model, effort, agent type, tools, schema) so they read each other's cached prefix.
- For large returns, have the worker write the full output to a file and return the path plus a three-line summary: the parent re-reads every returned token on every later turn. (Unmeasured; follows from the same token accounting.)

## 6. Thinking and API parameters

- Adaptive thinking is **on by default** (a change from Sonnet 4.6). For mechanical workloads, prefer lowering effort over disabling thinking — with thinking off, Sonnet 5 reaches for tools less, so tool-dependent tasks degrade. If it over-thinks on simple calls (common with large system prompts), steer: *"Thinking adds latency and should only be used when it will meaningfully improve answer quality, typically for problems that require multistep reasoning. When in doubt, respond directly."*
- `max_tokens` is a hard cap on thinking **plus** response; too tight at `high`+ yields all-thinking-then-truncation. The new tokenizer's ~30% inflation means limits tuned for Sonnet 4.6 may truncate — leave headroom, and use `max_tokens` (not prompts) as the hard cost ceiling.
- `temperature`/`top_p`/`top_k` return a 400 error on Sonnet 5 — remove them; steer variety via the prompt.
- Manual extended thinking (`budget_tokens`) is removed — adaptive thinking + effort replaces it.
- **Cache is a cost lever too.** In Claude Code, subagent and workflow requests get a 5-minute prompt cache even on a subscription; `subagentPromptCacheTtl: "1h"` (or `experimental.cacheTtl: 1h` in one agent's frontmatter) keeps a worker's cache warm across a long fan-out, at the higher 1-hour write rate. Workers with the same model, effort, agent type, tools, and output schema read each other's cached prefix in a workflow fan-out — vary the brief, not the configuration.

## 7. Worker briefing template

```text
Task: [one sentence — what and why].
Deliverable: [exact shape — schema / file / list format]. Your final message is the
return value: raw data only, no preamble or recap.
Context: [paths + line ranges; inline long material above this line, ask below it].
Scope: [explicit boundaries — "every X, not just the first"; what NOT to do].
Provide concise, focused responses. Skip non-essential context, and keep examples minimal.
```

Pair with `{model: 'sonnet', effort: 'medium'}` (or `low` per §2).

Batched variant (§5), one worker for N items:

```text
Task: [one sentence — what and why]. This covers [N] items.
Deliverable, per item: a header line "### <item>", then [exact shape]. Your final
message is the return value: the [N] blocks only, no preamble or recap.
Context: [paths per item; shared material above this line, ask below it].
Scope: every item listed, in order; [what NOT to do].
Provide concise, focused responses. Skip non-essential context, and keep examples minimal.
```

## When NOT to lean

Don't down-tier effort on: tasks whose failure you can't cheaply detect, verification/judge passes guarding a decision, or anything you'd have to re-run on a stronger setting anyway. The cheapest run is the one that's correct the first time.

## Sources

- Prompting Claude Sonnet 5 — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5 (effort mapping, strict effort compliance, thinking defaults and steering snippets, tokenizer +30%, sampling-params removal, interactive-coding token-efficiency guidance)
- Re-verified against the live docs 2026-08-05 and 2026-09-09: every lever above unchanged. Sonnet 4.6 sits in Anthropic's legacy models table — the Sonnet 5 ↔ 4.6 effort equivalence remains the docs' own current framing. Sonnet 5's $2/$10 per MTok is now its standard list price.
- Batching (§5), effort as a latency lever (§2), and the Sonnet-vs-Opus-vs-Fable comparison (§1) — measured 2026-09-09; method and numbers in this repository's README.
- Harness levers (frontmatter `effort`, `/tasks`, cache TTL settings, Concise output style, the model-force caveat) — Claude Code docs: https://code.claude.com/docs/en/sub-agents, https://code.claude.com/docs/en/prompt-caching, https://code.claude.com/docs/en/output-styles; Claude Code changelog releases 2.1.237, 2.1.243, 2.1.248, 2.1.251, 2.1.257 — https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md
- Prompting best practices — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices (long-context placement, output-format control, subagent guidance)
- The former companion skill `fable-mode` (when to delegate, to which tier) was retired on 2026-09-09 after benchmarks showed no gain over Claude Code's defaults; §1 above keeps the tier-routing rule this skill needs. Its sourced reference library lives in `archive/fable-mode/reference.md`.
