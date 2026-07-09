# Fable Mode — Sources & Verbatim Snippet Library

Compiled 2026-07-08 from Anthropic's official documentation. SKILL.md adapts these; this file preserves the originals word-for-word so the protocol can be re-derived or re-tuned when the docs change.

## Sources

1. **Prompting Claude Fable 5** — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5 (primary source; all Fable snippets below)
2. **Prompting Claude Opus 4.8** — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8 (target-model behavioral profile)
3. **Prompting best practices** — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices (general agentic techniques)
4. **Introducing Claude Fable 5 and Claude Mythos 5** — https://platform.claude.com/docs/en/about-claude/models/introducing-claude-fable-5.md (capabilities, API behavior)
5. **Migration guide → Migrating to Claude Fable 5** — https://platform.claude.com/docs/en/about-claude/models/migration-guide (behavioral shifts)
6. **Launch announcement** — https://www.anthropic.com/news/claude-fable-5-mythos-5 (benchmark/behavior deltas)
7. **Prompting Claude Sonnet 5** — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5 (basis for the companion `sonnet-lean` skill; effort mapping, verbosity, tokenizer)
8. **mrtooher/fable-mode** — https://github.com/mrtooher/fable-mode (community skill, unsourced; ideas adopted 2026-07-09 listed below)

## The capability gap (what a skill cannot close)

- SWE-bench Pro: Fable 5 80.3% vs Opus 4.8 69.2%. FrontierCode Diamond: 29.3% vs 13.4%. The gap **widens with task complexity**.
- Fable: "state-of-the-art on nearly all tested benchmarks"; sustains multi-day goal-directed runs; first-shot correctness on complex well-specified problems; substantially better dense-image vision; higher bug-finding recall; better at navigating ambiguity; "significantly more dependable at dispatching and sustaining parallel subagents."
- Pricing: Fable $10/$50 per MTok; Opus 4.8 $5/$25. Both 1M context / 128K output. (Batch API = 50% off ⇒ batched Fable costs Opus sticker price.)
- No fine-tuning/distillation exists for any Claude model; Fable never returns raw chain of thought (summarized or omitted only), so there is no distillation signal.

## Opus 4.8 behavioral profile (what SKILL.md counteracts)

From source 2 and the migration guide:

- "Claude Opus 4.8 has a tendency to favor reasoning over tool calls." `high`/`xhigh` effort shows substantially more tool usage. Explicit when/how instructions in prompts and tool descriptions give measurable lift.
- "Claude Opus 4.8 tends to spawn fewer subagents by default. However, this behavior is steerable through prompting."
- Under-reaches for file-based memory and custom tools unless triggers are explicit ("say *when* each capability applies, not just that it exists").
- More deliberate — asks on minor decisions; autonomy guidance cut ask-rate ~12pp with no over-reach increase.
- Interprets instructions literally, especially at lower effort. State scope explicitly.
- Effort: `xhigh` best for coding/agentic; minimum `high` for intelligence-sensitive; `max` sometimes overthinks; at `xhigh`/`max` set max_tokens ≥ 64k.
- Thinking is OFF when `thinking` field omitted — set `{type: "adaptive"}` explicitly.
- Code review: follows "only high-severity"/"be conservative" literally → measured recall drops despite better bug-finding. Fix: coverage-first reporting, filter downstream.
- Narrates more than 4.7 by default; remove forced-progress scaffolding.
- Frontend house style: warm cream (~#F4F1EA), serif display, terracotta accent — persistent; break it by specifying a concrete alternative or proposing 3–4 directions first.

## Verbatim Fable 5 snippets (source 1)

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
