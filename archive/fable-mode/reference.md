# Fable Mode — Sources & Verbatim Snippet Library

Compiled 2026-07-08 from Anthropic's official documentation; re-verified against the live docs 2026-08-05, and again on 2026-09-09 when the protocol was extended for Claude Fable 5.1 and the Claude Code harness changes in releases 2.1.223–2.1.266 (see the two "Re-verification" sections below). SKILL.md adapts these; this file preserves the originals word-for-word so the protocol can be re-derived or re-tuned when the docs change.

## Sources

1. **Prompting Claude Fable 5** — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5 (primary source; all Fable snippets below)
2. **Prompting Claude Opus 4.8** — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8 (target-model behavioral profile)
3. **Prompting best practices** — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices (general agentic techniques)
4. **Introducing Claude Fable 5 and Claude Mythos 5** — https://platform.claude.com/docs/en/about-claude/models/introducing-claude-fable-5.md (capabilities, API behavior)
5. **Migration guide → Migrating to Claude Fable 5** — https://platform.claude.com/docs/en/about-claude/models/migration-guide (behavioral shifts)
6. **Launch announcement** — https://www.anthropic.com/news/claude-fable-5-mythos-5 (benchmark/behavior deltas)
7. **Prompting Claude Sonnet 5** — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5 (basis for the companion `sonnet-lean` skill; effort mapping, verbosity, tokenizer)
8. **mrtooher/fable-mode** — https://github.com/mrtooher/fable-mode (community skill, unsourced; ideas adopted 2026-07-09 listed below)
9. **Prompting Claude Opus 5** — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5 (added 2026-08-05; basis for the Opus 5 column of SKILL.md's Model calibration table)
10. **Prompting Claude Fable 5.1** — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1 (added 2026-09-09; the Fable 5.1 snippets below — updated autonomy block, scope-and-tests block, batching nudge, progress-update snippet, low-effort search trigger)
11. **Migrating to Claude Fable 5.1** — https://platform.claude.com/docs/en/models/fable-5-1/migration-guide and model page https://platform.claude.com/docs/en/models/fable-5-1/overview (added 2026-09-09; release date, pricing, thinking always-on, per-message effort)
12. **Claude Code CHANGELOG** — https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md (added 2026-09-09; releases 2.1.223–2.1.266 read in full; provenance of every harness rule in SKILL.md, listed with version numbers below)
13. **Claude Code docs** — sub-agents https://code.claude.com/docs/en/sub-agents, advisor https://code.claude.com/docs/en/advisor, prompt caching https://code.claude.com/docs/en/prompt-caching, model config https://code.claude.com/docs/en/model-config, output styles https://code.claude.com/docs/en/output-styles, goal https://code.claude.com/docs/en/goal (added 2026-09-09; used to confirm each changelog entry's current behavior)

## Re-verification 2026-08-05

All sources re-fetched and diffed against this file. Findings:

- **Fable 5 page (source 1): every adopted snippet unchanged verbatim.** New sections not yet adapted into SKILL.md (deliberately — they are API-integration guidance, not working discipline): a "Create a send-to-user tool" section for verbatim mid-run delivery; a warning that show-your-thinking instructions can trigger the `reasoning_extraction` refusal category with elevated fallbacks to Opus 4.8; safety-classifier notes (offensive cyber, bio/life-sciences, thinking extraction) with fallback guidance.
- **Opus 4.8 page (source 2): core behavioral profile unchanged** — reason-over-tools, fewer-subagents-by-default, literal instruction following, `xhigh` for coding/agentic, thinking off unless set, code-review recall trap. **No longer found in current docs:** the file-based-memory under-use note and the "~12pp ask-rate" figure (both marked historical below). The page now points forward to a "Migrating to Claude Opus 5" guide.
- **Claude Opus 5 released** (`claude-opus-5`, $5/$25 per MTok, 1M context, 128K output, knowledge cutoff May 2026). Opus 4.8 moved to the Legacy models table; Opus 4.1 retires 2026-08-05. Opus 5 reverses several 4.8 defaults — profile below; SKILL.md gained a Model calibration table from it.
- **Benchmark figures removed from platform docs:** the SWE-bench Pro and FrontierCode Diamond numbers in "The capability gap" below no longer appear anywhere in current platform docs; treat them as historical (launch-announcement era), not currently citable.
- **Best-practices page (source 3): all adopted snippets unchanged.** New caveat attached to the self-check anchor: "Claude Opus 5 is the exception: it verifies its own work well without explicit instruction, and verification instructions carried over from prompts tuned for earlier models can cause over-verification… When migrating to Claude Opus 5, remove these instructions rather than rewriting them."

## Re-verification 2026-09-09

Triggered by a read of the Claude Code changelog from 2.1.223 (the release after the 2026-08-05 pass) through 2.1.266. All sources re-fetched. Findings:

- **Claude Fable 5.1 released 2026-09-01** (`claude-fable-5-1`; default Fable in Claude Code since 2.1.257). Same $10/$50 per MTok as Fable 5, cache reads $0.25/MTok (a quarter of Fable 5's rate), 1M context, 128K output, knowledge cutoff June 2026, adaptive thinking **always on** (`disabled` returns a 400 at any effort). Fable 5 moved to the legacy models table. Anthropic's new prompting page (source 10) says existing Fable 5 prompts "should perform well on Claude Fable 5.1 without changes" and documents a handful of behavioral differences — profile below. SKILL.md was re-pointed from Fable 5 to Fable 5.1 and gained the new snippets.
- **Fable 5 page (source 1): every adopted snippet unchanged verbatim.** The Fable 5 snippets below therefore remain valid for 5.1; where the 5.1 page supersedes one (autonomy block, checkpoint behavior), the 5.1 version is recorded in the new profile and SKILL.md uses it.
- **Opus 5 page (source 9): unchanged.** Delegation, self-verification, effort, thinking-disabled artifacts, verbosity, code-review literalism all as recorded. One detail adopted into the calibration table this pass: the page names Claude Code's deterministic caps, `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` and `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`.
- **Opus 4.8 page (source 2): unchanged;** still in the legacy table, still the model whose defaults §2–§4 push against.
- **Best-practices page (source 3): all nine adopted snippets present verbatim** (investigate-before-answering, parallel tool calls, reversibility, context-limit persistence, commit-and-decide, subagent-overuse steering, self-check anchor with its Opus 5 exception, temp-file cleanup, long-context placement). The page now lists Fable 5.1 among current models.
- **Sonnet 5 page (source 7): unchanged;** Sonnet 5's $2/$10 per MTok is now its standard list price (Claude Code 2.1.24x dropped the "limited-time promo" label).
- **Benchmark figures:** still absent from platform docs; the historical marking from 2026-08-05 stands.
- **Claude Code harness:** 44 releases read. The changes that alter what SKILL.md's rules should say are listed with version numbers in "Claude Code harness changes" below; the rest (UI, gateways, permissions plumbing, Remote Control, VS Code) don't touch working discipline.

## Fable 5.1 behavioral profile (source 10 + 11, added 2026-09-09)

What the 5.1 page documents as different from Fable 5, and what SKILL.md did with each:

- **Effort:** "Start at the default effort level, `high`, then test the other levels … Re-run the sweep even if you already ran one on Claude Fable 5: effort level names don't correspond to the same amount of thinking across models." "At `medium`, results roughly match Claude Fable 5 at lower cost … At `low`, Claude Fable 5.1 is often competitive with Claude Opus and Claude Sonnet models on cost per task while scoring higher." Per-message effort changes (beta) preserve the prompt cache on 5.1; on other models a top-level change restarts it → §0 "pick the level at session start".
- **Fewer progress updates:** "Claude Fable 5.1's default behavior is to write fewer user-facing updates during long tool-calling turns than Claude Fable 5 does." Snippet:
  > Before you start, say in a line what you're about to do; brief updates while you work help the user follow along. Close with a short recap that stands on its own — what you found, what you did, and what's next — so a reader who only sees the last message has the full picture.

  And for harnesses that hide tool output (→ §11):
  > Only you see that command's output — the user's terminal shows at most a few lines of it. If the user needs to read any of it, put it in your reply.
- **One tool call per turn in agent loops** (coding and computer-use loops where the next reads are implied, not requested). Nudge (→ §2):
  > First privately list what you need next; then request every item that doesn't depend on another's result in this one response.
- **Finish the whole task** — the updated autonomy block (supersedes the Fable 5 "autonomous-pipeline reminder" below; → §8, §10):
  > You are operating autonomously. The user is not watching in real time and cannot answer questions mid-task, so asking 'Want me to…?' or 'Shall I…?' will block the work. For reversible actions that follow from the original request, proceed without asking. Stop only for destructive actions or genuine scope changes the user must decide. Offering follow-ups after the task is done is fine; asking permission before doing the work is not.
  >
  > Exception: when the user is describing a problem, asking a question, or thinking out loud rather than requesting a change, the deliverable is your assessment. Report your findings and stop. Don't apply a fix until they ask for one.
  >
  > Before ending your turn, check your last paragraph. If it is a plan, an analysis, a question, a list of next steps, or a promise about work you have not done ('I'll…', 'let me know when…'), do that work now with tool calls. That includes retrying after errors and gathering missing information yourself. Do not stop because the context or session is long. End your turn only when the task is complete or you are blocked on input only the user can provide.
  >
  > Before running a command that changes system state (such as restarts, deletes, or config edits), check that the evidence actually supports that specific action. A signal that pattern-matches to a known failure may have a different cause.

  Paired "Delivering work" block (→ §1, §8, §9): "The user's request — or the plan they approved — sets the scope, and the scope is the deliverable: don't quietly narrow, widen, or swap it. … If a question comes up partway, first do everything that doesn't depend on the answer; then state the assumption you made, or — when going ahead on a wrong guess would be unsafe or would make the work useless — put the question at the end of a turn that also delivers that progress. If one part turns out to be blocked, complete every other part in full and say exactly what you left out and why … A step you have decided on is something to run, not to announce."
- **Keep changes and tests to what the task asks for** ("unrequested additions and committed test code drop substantially with no measurable change in task success"; → §9):
  > If, while working or testing, you find a pre-existing bug, a performance concern, or behavior the task doesn't mention, don't fix, optimize or extend it in this change unless the requested behavior cannot work without it; report it as a follow-up in your summary. Where the task is ambiguous, implement the reading its wording and the surrounding code most directly support, state that assumption in your summary, and don't build for the other readings as well. Verify your work however you like; scratch scripts and quick checks need not be kept. Commit tests only where the task asks for them or this repository already keeps tests for this kind of change, sized like the neighboring test files — roughly one focused test per stated behavior — and don't turn scratch checks into additional permanent test files. This is about extras only: implement every behavior the task asks for, completely.
- **Search triggering at low effort** ("At `low` effort, Claude Fable 5.1 is less likely than Claude Fable 5 to call a search or retrieval tool"; → §2):
  > When a query centers on a name you do not confidently recognize, or recognize from a fast-moving area like AI models and developer tools where the landscape shifts within months, the name itself is the thing to verify: search before answering, and include the name as the user wrote it in at least one query alongside any reformulations. This holds even when you have some background on it — partial background is exactly what makes an out-of-date answer sound authoritative, so familiarity is not a reason to skip the search.
- **Prefer targeted edits over whole-file rewrites** (→ §9): "when it will not affect the end result, try to surgically edit a file rather than rewrite the entire thing."
- **Let the lead agent keep working while subagents run** (→ §3): "On coding tasks, letting the lead continue while subagents run lowers average time to completion at similar quality, token usage, and cost. … The model still often chooses to wait."
- **Long outputs at `xhigh`/`max`:** the model may draft a long deliverable in thinking and again in the reply; run such requests at `high` unless a gain is measured (→ §0 effort guidance unchanged).
- **Writing density / formatting in chat:** denser prose than Fable 5, less bold and fewer headers. Not adopted — the target models have the opposite tendency and §11 already covers readability.
- **Not adopted, API-integration only:** append-only history and thinking-block binding, `thinking.display: "updates"`, turn-scoped system messages, compaction-summary instruction, safeguard false positives, vision crop tools.

## Claude Code harness changes 2.1.223–2.1.266 (source 12 + 13, added 2026-09-09)

Each SKILL.md rule that describes the harness rather than the model rests on one of these. Versions are the release that introduced or last changed the behavior.

- **2.1.224** — the 200-subagent-per-session cap was removed (concurrency and depth limits still apply); the Bash tool description now says command output is displayed to the model, not reliably to the user (→ §11).
- **2.1.228** — the Write tool lets newer models overwrite an existing file they haven't read this session (→ §2).
- **2.1.229** — workflow fan-outs stagger same-prefix sibling agents so they read the first agent's cached prefix.
- **2.1.232** — subagent forking on by default: `subagent_type: "fork"` inherits the full conversation and prompt cache; non-teammate spawns in interactive sessions run in the background by default (→ §3, §4). Fable offered as an advisor again.
- **2.1.233** — Todo/task-tracking tools (TaskCreate/Get/Update/List, TodoWrite) no longer available on Opus 4.8, Sonnet 5, Fable 5, Mythos 5 and newer; `CLAUDE_CODE_ENABLE_TODO_TOOLS=1` restores them (→ §7).
- **2.1.234** — sessions continue automatically when a claude.ai usage limit resets; `/goal` check-ins on long-running background work (→ §7).
- **2.1.237** — built-in **Concise** output style: "Claude leads with the result, skips preamble and narration, and keeps responses short by default, while doing the engineering work as thoroughly as in the Default style." Output styles shape the main conversation only; subagents run their own system prompt, forks excepted (→ calibration table, §11).
- **2.1.243** — subagent frontmatter supports `effort`; `/tasks` and agent detail show the model and effort each subagent ran on; `promptCacheTtl` / `subagentPromptCacheTtl` settings (→ §3).
- **2.1.246** — a subagent that stops at `maxTurns` returns its output marked partial with a hint to continue via `SendMessage`; non-interactive sessions auto-continue responses cut off mid-stream (→ §3, §7).
- **2.1.248** — `experimental.cacheTtl` in agent frontmatter; Workflow script reference moved into the bundled `workflow-authoring` skill.
- **2.1.251** — `CLAUDE_CODE_SUBAGENT_MODEL` became a default rather than an override (per-spawn and frontmatter `model` now win); Opus 5 with thinking off and effort `xhigh`/`max` sends `high` instead of failing; `/effort` saves the level per model; `/cost` gained a prompt-cache line (→ §0, calibration table).
- **2.1.255 / 2.1.257** — Fable 5.1 accepted as advisor (2.1.255); Fable 5.1 default Fable model, `s` in `/effort` for session-only, `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` applies one model to every subagent and ignores per-spawn picks (→ §0, §3).
- **2.1.259** — `--permission-prompts none` for unattended headless hosts: anything that would prompt is denied automatically (→ §8).
- **2.1.260** — auto-compact for 1M-context Opus and Fable sessions shortly before the limit; `/effort` on Fable 5.1 no longer invalidates the prompt cache (other models still do); `/cost` names the likely cause of a cache miss; background commands started by subagents no longer time out after an hour (→ §0, §7).
- **2.1.261** — `/skill-doctor` shows which loaded skills go unused and what they cost in context.
- **Advisor tool (source 13):** "The advisor tool lets Claude consult a second, typically stronger model at key moments during a task, such as before committing to an approach, when stuck on a recurring error, or before declaring a task complete. The advisor receives the full conversation, including every tool call and result, and returns guidance that Claude applies before continuing." Accepted advisors for an Opus 4.7-or-later main model: Fable, and Opus 4.7 or later. Anthropic API only; toggling keeps the main model's prompt cache; the advisor's own read of the transcript is not cached (→ §0).

## Opus 5 behavioral profile (source 9, added 2026-08-05)

What changed relative to the Opus 4.8 profile this skill was tuned against:

- **Delegation reversed:** "Claude Opus 5 delegates to subagents more readily than prior models. … it multiplies cost and time when applied to small tasks … give explicit guidance on which scenarios warrant delegation, or set deterministic caps."
- **Self-verification built in:** "Claude Opus 5 verifies its own work without being told to. If your prompt contains explicit verification instructions … remove them: instructions like these cause over-verification." Also catches and fixes its own mistakes well without prompting.
- **Effort reversed:** "Start with the default (`high`) and adjust based on your evals: use `low` and `medium` liberally as your primary control for token cost and response time wherever quality holds, and step up to `xhigh` for demanding coding and agentic work."
- **Thinking reversed:** requests without a `thinking` field run with adaptive thinking (on 4.8 they run without); `thinking: {type: "disabled"}` with effort `xhigh` or `max` returns a 400 error. With thinking disabled, leaked tool-call text and internal XML tags can appear; thinking enabled at `low` effort performs better than disabled at similar cost.
- **Unchanged from 4.8:** the code-review literalism trap ("only high-severity" → follows literally and reports less; ask for everything, filter in a separate pass).
- **Verbosity:** default responses and written files run longer than prior Opus models; it narrates readily during agentic work; effort controls thinking volume, not visible response length — constrain length explicitly in the prompt.

## The capability gap (what a skill cannot close)

- SWE-bench Pro: Fable 5 80.3% vs Opus 4.8 69.2%. FrontierCode Diamond: 29.3% vs 13.4%. The gap **widens with task complexity**. *(Historical: these figures were removed from platform docs by 2026-08-05 — see Re-verification above.)*
- Fable: "state-of-the-art on nearly all tested benchmarks"; sustains multi-day goal-directed runs; first-shot correctness on complex well-specified problems; substantially better dense-image vision; higher bug-finding recall; better at navigating ambiguity; "significantly more dependable at dispatching and sustaining parallel subagents."
- Pricing: Fable 5.1 and Fable 5 $10/$50 per MTok; Opus 5 and Opus 4.8 $5/$25. All 1M context / 128K output. Fable 5.1 cache reads are $0.25/MTok, a quarter of Fable 5's and half of Opus 5's. (Batch API = 50% off ⇒ batched Fable costs Opus sticker price.)
- No fine-tuning/distillation exists for any Claude model; Fable never returns raw chain of thought (summarized or omitted only), so there is no distillation signal.

## Opus 4.8 behavioral profile (what SKILL.md counteracts)

From source 2 and the migration guide:

- "Claude Opus 4.8 has a tendency to favor reasoning over tool calls." `high`/`xhigh` effort shows substantially more tool usage. Explicit when/how instructions in prompts and tool descriptions give measurable lift.
- "Claude Opus 4.8 tends to spawn fewer subagents by default. However, this behavior is steerable through prompting."
- Under-reaches for file-based memory and custom tools unless triggers are explicit ("say *when* each capability applies, not just that it exists"). *(Historical: not found in current docs at 2026-08-05 re-verification; the memory rule in SKILL.md §6 rests on the Fable page, which is unchanged.)*
- More deliberate — asks on minor decisions; autonomy guidance cut ask-rate ~12pp with no over-reach increase. *(Historical: the ~12pp figure no longer appears in current docs.)*
- Interprets instructions literally, especially at lower effort. State scope explicitly.
- Effort: `xhigh` best for coding/agentic; minimum `high` for intelligence-sensitive; `max` sometimes overthinks; at `xhigh`/`max` set max_tokens ≥ 64k.
- Thinking is OFF when `thinking` field omitted — set `{type: "adaptive"}` explicitly.
- Code review: follows "only high-severity"/"be conservative" literally → measured recall drops despite better bug-finding. Fix: coverage-first reporting, filter downstream.
- Narrates more than 4.7 by default; remove forced-progress scaffolding.
- Frontend house style: warm cream (~#F4F1EA), serif display, terracotta accent — persistent; break it by specifying a concrete alternative or proposing 3–4 directions first.

## Verbatim Fable 5 snippets (source 1)

Still current for Fable 5.1 (re-verified 2026-09-09; the 5.1 page states Fable 5 prompts carry over unchanged). Where the 5.1 page publishes a newer version — the autonomy reminder and checkpoint behavior — the newer text is in the Fable 5.1 profile above and is the one SKILL.md uses.

### Anti-overplanning ("Longer turns by default")
> When you have enough information to act, act. Do not re-derive facts already established in the conversation, re-litigate a decision the user has already made, or narrate options you will not pursue in user-facing messages. If you are weighing a choice, give a recommendation, not an exhaustive survey. This does not apply to thinking blocks.

### Scope discipline ("Consider all effort levels")
> Don't add features, refactor, or introduce abstractions beyond what the task requires. A bug fix doesn't need surrounding cleanup and a one-shot operation usually doesn't need a helper. Don't design for hypothetical future requirements: do the simplest thing that works well. Avoid premature abstraction and half-finished implementations. Don't add error handling, fallbacks, or validation for scenarios that cannot happen. Trust internal code and framework guarantees. Only validate at system boundaries (user input, external APIs). Don't use feature flags or backwards-compatibility shims when you can just change the code.

### Brevity/readability ("Strong instruction following")
> Lead with the outcome. Your first sentence after finishing should answer "what happened" or "what did you find": the thing the user would ask for if they said "just give me the TLDR." Supporting detail and reasoning come after. Being readable and being concise are different things, and readability matters more.
>
> The way to keep output short is to be selective about what you include (drop details that don't change what the reader would do next), not to compress the writing into fragments, abbreviations, arrow chains like A → B → fails, or jargon.

### Checkpoint behavior
> Pause for the user only when the work genuinely requires them: a destructive or irreversible action, a real scope change, or input that only they can provide. If you hit one of these, ask and end the turn, rather than ending on a promise.

### Grounded progress claims
> Before reporting progress, audit each claim against a tool result from this session. Only report work you can point to evidence for; if something is not yet verified, say so explicitly. Report outcomes faithfully: if tests fail, say so with the output; if a step was skipped, say that; when something is done and verified, state it plainly without hedging.

(Anthropic: "In Anthropic's testing, this nearly eliminated fabricated status reports even on tasks designed to elicit them.")

### Boundaries
> When the user is describing a problem, asking a question, or thinking out loud rather than requesting a change, the deliverable is your assessment. Report your findings and stop. Don't apply a fix until they ask for one. Before running a command that changes system state (restarts, deletes, config edits), check that the evidence actually supports that specific action. A signal that pattern-matches to a known failure may have a different cause.

### Parallel subagents
> Delegate independent subtasks to subagents and keep working while they run. Intervene if a subagent goes off track or is missing relevant context.

(Context: "prefer asynchronous communication between orchestrator and subagents over blocking until each subagent returns. Long-lived subagents that keep their context across subtasks save time and cost through cache reads and avoid bottlenecking on the slowest subagent.")

### Memory system
> Store one lesson per file with a one-line summary at the top. Record corrections and confirmed approaches alike, including why they mattered. Don't save what the repo or chat history already records; update an existing note rather than creating a duplicate; delete notes that turn out to be wrong.

Bootstrap from history:
> Reflect on the previous sessions we've had together. Use subagents to identify core themes and lessons, and store them in [X]. Make sure you know to reference [X] for future use.

### Autonomous-pipeline reminder ("Rare cases of early stopping")
> You are operating autonomously. The user is not watching in real time and cannot answer questions mid-task, so asking "Want me to…?" or "Shall I…?" will block the work. For reversible actions that follow from the original request, proceed without asking. Offering follow-ups after the task is done is fine; asking permission after already discussing with the user before doing the work is not. Before ending your turn, check your last paragraph. If it is a plan, an analysis, a question, a list of next steps, or a promise about work you have not done ("I'll…", "let me know when…"), do that work now with tool calls. End your turn only when the task is complete or you are blocked on input only the user can provide.

### Context-budget reassurance
> You have ample context remaining. Do not stop, summarize, or suggest a new session on account of context limits. Continue the work.

### Give the reason, not only the request
> I'm working on [the larger task] for [who it's for]. They need [what the output enables]. With that in mind: [request].

### Final-summary re-grounding ("Readability when communicating with the user")
> Terse shorthand is fine between tool calls (that's you thinking out loud, and brevity there is good). Your final summary is different: it's for a reader who didn't see any of that.
>
> If you've been working for a while without the user watching (overnight, across many tool calls, since they last spoke), your final message is their first look at any of it. Write it as a re-grounding, not a continuation of your working thread: the outcome first, then the one or two things you need from them, each explained as if new. The vocabulary you built up while working is yours, not theirs; leave it behind unless you re-introduce it.
>
> When you write the summary at the end, drop the working shorthand. Write complete sentences. Spell out terms. Don't use arrow chains, hyphen-stacked compounds, or labels you made up earlier. When you mention files, commits, flags, or other identifiers, give each one its own plain-language clause. Open with the outcome: one sentence on what happened or what you found. Then the supporting detail. If you have to choose between short and clear, choose clear.

### Self-verification (scaffolding recommendations)
> Establish a method for checking your own work at an interval of [X] as you build. Run this every [X interval], verifying your work with subagents against the specification.

(Context: "Separate, fresh-context verifier subagents tend to outperform self-critique.")

### Other scaffolding recommendations (source 1)
- "Start at the top of your difficulty range" — assign harder tasks than to prior models; have the model scope, ask clarifying questions, then execute.
- "Refactor existing prompts and skills" — prior-model prompts are often too prescriptive; prefer goal + constraints over enumerated steps. ("Prefer general instructions over prescriptive steps — a prompt like 'think thoroughly' often produces better reasoning than a hand-written step-by-step plan.")
- send_to_user tool for verbatim mid-run delivery in async agents (tool inputs are never summarized). Requires an elicitation instruction — defining the tool alone isn't enough.
- (Fable-only, N/A on Opus:) never instruct the model to reproduce its internal reasoning in response text — triggers the `reasoning_extraction` refusal category on Fable.

## Verbatim Opus 4.8 snippets (source 2 + migration guide)

### Search-first (migration guide, Opus 4.8 section)
> \<search_first>
> For questions where current information would change the answer (recent events, current roles or prices, version-specific behavior, or anything the user flags as time-sensitive) search before answering rather than answering from memory. For open-ended research requests, begin searching immediately; do not ask a scoping question first unless the request is genuinely ambiguous about what to research.
> \</search_first>

### Capability triggering (migration guide)
> Before any task longer than a few turns, check your memory file for relevant prior context and write new findings to it as you go. When a task fans out across independent items (many files to read, many tests to run, many candidates to check), delegate to subagents rather than iterating serially.

### Subagent control (source 2)
> Do not spawn a subagent for work you can complete directly in a single response (e.g. refactoring a function you can already see).
>
> Spawn multiple subagents in the same turn when fanning out across items or reading multiple files.

### Autonomy / ask-rate (migration guide; "cut ask-rate by ~12 percentage points with no increase in over-reach")
> For minor choices (naming, formatting, default values, which approach among equivalents), pick a reasonable option and note it rather than asking. For scope changes or destructive actions, still ask first.

### Silence-default (migration guide — optional; use only if narration is excessive)
> Default to silence between tool calls. Only write text when you find something, change direction, or hit a blocker — one sentence each. Do not narrate routine actions ("Now I'll...", "Let me check...", "Looking at..."). When done: one or two sentences on the outcome. Do not recap every file or test — the user has been following along.

### Code-review coverage (source 2)
> Report every issue you find, including ones you are uncertain about or consider low-severity. Do not filter for importance or confidence at this stage - a separate verification step will do that. Your goal here is coverage: it is better to surface a finding that later gets filtered out than to silently drop a real bug. For each finding, include your confidence level and an estimated severity so a downstream filter can rank them.

Single-pass self-filter alternative: "report any bugs that could cause incorrect behavior, a test failure, or a misleading result; only omit nits like pure style or naming preferences."

## Verbatim general-agentic snippets (source 3)

### Investigate before answering
> \<investigate_before_answering>
> Never speculate about code you have not opened. If the user references a specific file, you MUST read the file before answering. Make sure to investigate and read relevant files BEFORE answering questions about the codebase. Never make any claims about code before investigating unless you are certain of the correct answer - give grounded and hallucination-free answers.
> \</investigate_before_answering>

### Parallel tool calls
> \<use_parallel_tool_calls>
> If you intend to call multiple tools and there are no dependencies between the tool calls, make all of the independent tool calls in parallel. Prioritize calling tools simultaneously whenever the actions can be done in parallel rather than sequentially. For example, when reading 3 files, run 3 tool calls in parallel to read all 3 files into context at the same time. Maximize use of parallel tool calls where possible to increase speed and efficiency. However, if some tool calls depend on previous calls to inform dependent values like the parameters, do NOT call these tools in parallel and instead call them sequentially. Never use placeholders or guess missing parameters in tool calls.
> \</use_parallel_tool_calls>

### Anti-hardcoding / general solutions
> Please write a high-quality, general-purpose solution using the standard tools available. Do not create helper scripts or workarounds to accomplish the task more efficiently. Implement a solution that works correctly for all valid inputs, not just the test cases. Do not hard-code values or create solutions that only work for specific test inputs. Instead, implement the actual logic that solves the problem generally.
>
> Focus on understanding the problem requirements and implementing the correct algorithm. Tests are there to verify correctness, not to define the solution. Provide a principled implementation that follows best practices and software design principles.
>
> If the task is unreasonable or infeasible, or if any of the tests are incorrect, please inform me rather than working around them. The solution should be robust, maintainable, and extendable.

### Reversibility / autonomy-safety balance
> Consider the reversibility and potential impact of your actions. You are encouraged to take local, reversible actions like editing files or running tests, but for actions that are hard to reverse, affect shared systems, or could be destructive, ask the user before proceeding.
>
> Examples of actions that warrant confirmation:
> - Destructive operations: deleting files or branches, dropping database tables, rm -rf
> - Hard to reverse operations: git push --force, git reset --hard, amending published commits
> - Operations visible to others: pushing code, commenting on PRs/issues, sending messages, modifying shared infrastructure
>
> When encountering obstacles, do not use destructive actions as a shortcut. For example, don't bypass safety checks (e.g. --no-verify) or discard unfamiliar files that may be in-progress work.

### Context-limit persistence
> Your context window will be automatically compacted as it approaches its limit, allowing you to continue working indefinitely from where you left off. Therefore, do not stop tasks early due to token budget concerns. As you approach your token budget limit, save your current progress and state to memory before the context window refreshes. Always be as persistent and autonomous as possible and complete tasks fully, even if the end of your budget is approaching. Never artificially stop any task early regardless of the context remaining.

### Complete usage of context (long tasks)
> This is a very long task, so it may be beneficial to plan out your work clearly. It's encouraged to spend your entire output context working on the task - just make sure you don't run out of context with significant uncommitted work. Continue working systematically until you have completed this task.

### Commit-and-decide (anti-rumination)
> When you're deciding how to approach a problem, choose an approach and commit to it. Avoid revisiting decisions unless you encounter new information that directly contradicts your reasoning. If you're weighing two approaches, pick one and see it through. You can always course-correct later if the chosen approach fails.

### Structured research
> Search for this information in a structured way. As you gather data, develop several competing hypotheses. Track your confidence levels in your progress notes to improve calibration. Regularly self-critique your approach and plan. Update a hypothesis tree or research notes file to persist information and provide transparency. Break down this complex research task systematically.

### Long-context prompting (source 3)
> Put longform data at the top: Place your long documents and inputs near the top of your prompt, above your query, instructions, and examples. This improves performance across all models. [Queries at the end can improve response quality by up to 30% in tests.]
>
> Ground responses in quotes: For long document tasks, ask Claude to quote relevant parts of the documents first before carrying out its task.

### Subagent-overuse steering (source 3)
> Use subagents when tasks can run in parallel, require isolated context, or involve independent workstreams that don't need to share state. For simple tasks, sequential operations, single-file edits, or tasks where you need to maintain context across steps, work directly rather than delegating.

### Temp-file cleanup (source 3)
> If you create any temporary new files, scripts, or helper files for iteration, clean up these files by removing them at the end of the task.

### Self-check anchor (source 3)
> Ask Claude to self-check. Append something like "Before you finish, verify your answer against [test criteria]." This catches errors reliably, especially for coding and math.

### Multi-context-window workflow (paraphrase of source 3)
1. First context window: set up framework — write tests, create setup scripts; later windows iterate on a todo list.
2. Track tests in structured form (`tests.json`); "It is unacceptable to remove or edit tests because this could lead to missing or buggy functionality."
3. Quality-of-life scripts (`init.sh`) to start servers/tests/linters.
4. Fresh window over compaction when filesystem state is rich; be prescriptive on restart: "Call pwd", "Review progress.txt, tests.json, and the git logs", "Manually run through a fundamental integration test before moving on."
5. Provide verification tools (Playwright/computer use for UIs).
6. State: structured formats for structured data, freeform notes for progress, git for checkpoints, emphasize incremental progress.

## Adopted from mrtooher/fable-mode (source 8 — community, not Anthropic)

Ideas grafted into SKILL.md on 2026-07-09 after comparing the two skills. These have no Anthropic citation; keep them because they operationalize verification, drop them if they conflict with future official guidance.

- **Failable-check standard (→ §4):** every verification names an external artifact — a test command run, a file that provably exists in shape, a source fetched this run, a diff against spec. "I reviewed it and it looks right" is not a check; unverifiable steps are explicitly marked unverified; a fix that invalidates earlier work re-runs that work's check.
- **Domain check anchors (→ §4):** software (named test command + one error path shown, files-opened list), research (claim→source-fetched-this-run mapping, training-memory claims labeled), data (shape printed first, quality assertions shown, one aggregate recomputed from raw), documents (rendered file read back vs. spec).
- **Replan budget (→ §1):** max two structural replans per run; a third means requirements-level ambiguity — escalate to the user.
- **Verify-before-flag (→ §5):** never report a problem not confirmed by a direct check; absence of evidence is not a finding.
- **Tier routing (→ §3):** match worker model to stage difficulty — Haiku for mechanical bulk, Sonnet for scoped reasoning, orchestrator model only for synthesis cheaper tiers can't verifiably do.
- **Scope-growth rule (→ §9):** new scope discovered mid-run is surfaced as a recommendation at delivery, not silently built; gold-plating counts as scope growth.

Deliberately NOT adopted: the stage-map ceremony (conflicts with §9 and with "prefer general instructions over prescriptive steps"), the per-model subagent-wrapper variants (the Agent tool's `model` parameter already covers this), and the sed word-boundary rule (Claude Code's Edit tool makes it moot).
