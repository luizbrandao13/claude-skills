---
name: sonnet-lean
description: Cut token spend whenever work runs on Claude Sonnet 5 — as a delegated subagent/worker or as the session model. Applies Anthropic's documented Sonnet 5 cost levers — effort down-mapping (Sonnet 5 medium ≈ Sonnet 4.6 high), strict-effort scoping, thinking-trigger steering, verbosity control, one-shot complete briefs, and output-shape constraints. Trigger when delegating tasks to Sonnet workers (Agent tool model:"sonnet", Workflow agent() calls), when building prompts/pipelines that call a claude-sonnet-* model, or on /sonnet-lean. Do NOT trade effort down on tasks where a wrong answer forces a re-run — a failed cheap run costs more than one correct run.
---

# Sonnet Lean — spend fewer tokens per Sonnet call

Every rule here is from Anthropic's "Prompting Claude Sonnet 5" page (see Sources). Sonnet 5's defaults are tuned for capability, not cost: effort defaults to `high`, adaptive thinking is on by default, and its new tokenizer produces ~30% more tokens for the same text than Sonnet 4.6. Left alone, a Sonnet worker thinks, narrates, and pads more than the task needs. This skill sets each lever deliberately.

## 1. First question: is Sonnet even the right tier?

Route by difficulty, not habit. Bulk mechanical work — renames, extractions, format checks, file classification — goes to **Haiku**. Sonnet is for scoped work that needs real reasoning. If the task needs deep synthesis or judgment across many interacting parts, don't force it onto Sonnet at high effort — that often costs more than a stronger model doing it right once.

## 2. Set effort deliberately (the biggest lever)

Sonnet 5's effort defaults to `high`. Anthropic's cross-model mapping: **Sonnet 5 at `medium` is comparable in intelligence to Sonnet 4.6 at `high`**, and Sonnet 5 at `high` ≈ Sonnet 4.6 at `max`. So for most delegated, well-scoped worker tasks, `medium` buys yesterday's high-effort quality at reduced spend.

- **`medium`** — the lean default for delegated scoped work (focused reviews, single-module implementations, structured research reads).
- **`low`** — short, mechanical, latency-sensitive tasks that are not intelligence-sensitive (extraction, reformatting, checklist verification).
- **`high`/`xhigh`** — only when the subtask itself is genuinely hard; at that point question whether it should be delegated to Sonnet at all (§1).

Sonnet 5 **respects effort strictly**, especially at the low end: at `low`/`medium` it scopes work to exactly what was asked rather than going above and beyond. That's the cost win — but it means under-specified briefs fail quietly. If you see shallow reasoning on a complex task, **raise effort rather than prompting around it**; if you must stay at `low` for latency, add: "This task involves multistep reasoning. Think carefully through the problem before responding."

Where to set it: the Workflow tool's `agent(prompt, {model: 'sonnet', effort: 'medium'})`; on the API, `output_config: {effort: "..."}` with `thinking: {type: "adaptive"}`. (The interactive Agent tool takes `model` but not `effort` — there, the brief and output constraints below are your levers.)

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

## 5. Thinking and API parameters

- Adaptive thinking is **on by default** (a change from Sonnet 4.6). For mechanical workloads, prefer lowering effort over disabling thinking — with thinking off, Sonnet 5 reaches for tools less, so tool-dependent tasks degrade. If it over-thinks on simple calls (common with large system prompts), steer: *"Thinking adds latency and should only be used when it will meaningfully improve answer quality, typically for problems that require multistep reasoning. When in doubt, respond directly."*
- `max_tokens` is a hard cap on thinking **plus** response; too tight at `high`+ yields all-thinking-then-truncation. The new tokenizer's ~30% inflation means limits tuned for Sonnet 4.6 may truncate — leave headroom, and use `max_tokens` (not prompts) as the hard cost ceiling.
- `temperature`/`top_p`/`top_k` return a 400 error on Sonnet 5 — remove them; steer variety via the prompt.
- Manual extended thinking (`budget_tokens`) is removed — adaptive thinking + effort replaces it.

## 6. Worker briefing template

```text
Task: [one sentence — what and why].
Deliverable: [exact shape — schema / file / list format]. Your final message is the
return value: raw data only, no preamble or recap.
Context: [paths + line ranges; inline long material above this line, ask below it].
Scope: [explicit boundaries — "every X, not just the first"; what NOT to do].
Provide concise, focused responses. Skip non-essential context, and keep examples minimal.
```

Pair with `{model: 'sonnet', effort: 'medium'}` (or `low` per §2).

## When NOT to lean

Don't down-tier effort on: tasks whose failure you can't cheaply detect, verification/judge passes guarding a decision, or anything you'd have to re-run on a stronger setting anyway. The cheapest run is the one that's correct the first time.

## Sources

- Prompting Claude Sonnet 5 — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5 (effort mapping, strict effort compliance, thinking defaults and steering snippets, tokenizer +30%, sampling-params removal, interactive-coding token-efficiency guidance)
- Re-verified against the live docs 2026-08-05: every lever above unchanged. Sonnet 4.6 now sits in Anthropic's legacy models table — the Sonnet 5 ↔ 4.6 effort equivalence remains the docs' own current framing.
- Prompting best practices — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices (long-context placement, output-format control, subagent guidance)
- Companion: the `fable-mode` skill §3 handles *when* to delegate and to which tier; this skill handles *how cheaply* the Sonnet leg runs.
