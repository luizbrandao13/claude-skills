# claude-skills

Two [Claude Code skills](https://code.claude.com/docs/en/skills) that make Claude cheaper and more accurate by fixing the two things most people get wrong without knowing it: **how the request is written** and **how work is handed to a smaller model**. Every rule cites the Anthropic documentation it comes from. Every claim of benefit was measured with tests the model never saw, and the benchmark is in [`bench/`](bench/) so you can rerun it. A third skill was built, measured, found useless, and retired in public; that story is at the end.

| Skill | What it does | Measured | Use it when |
|---|---|---|---|
| [`prompt-master`](prompt-master/SKILL.md) | Rewrites your request into the prompt Claude works best with, shows you the rewrite with one reason per change, then does the work from the rewrite. | Sonnet 5 code review: from finding 2–4 of 11 planted bugs to 9–10, same cost. Vague "get the tests passing": stopped Claude from rewriting a test to make it pass. Did **not** save cost on Opus 5 when a complete brief carried "double-check everything". | The request is vague, written in another model's style, conflicts with the repo, or is about to be delegated. |
| [`sonnet-lean`](sonnet-lean/SKILL.md) | Makes every piece of work that runs on Sonnet 5 cost less: route to the cheapest model that passes, batch items per worker, brief once and completely, constrain the output. | Worker payloads down 62–80% with identical coverage, three times. Batching halved total tokens. Sonnet at `low` effort matched Fable 5.1 on a real task at a fifth of the price. | Any time work goes to Sonnet: a subagent, a Workflow stage, a pipeline, or Sonnet as your session model. |

## Why anyone needs this

Two facts from Anthropic's own documentation explain almost everything in this repository.

**Current Claude models follow instructions literally.** Tell Sonnet 5 or Opus 5 to "only report critical issues" in a code review and it will investigate just as thoroughly as before, then report less; Anthropic's pages for both models say measured recall falls while the model's bug-finding ability is unchanged. Tell Opus 5 to "double-check your work" and it verifies work it was already going to verify, at your expense. Give it a numbered recipe and it follows the recipe instead of thinking. None of this is visible from the outside. The output looks fine. It is just worse than it would have been with one sentence changed.

**Where the tokens actually go is not where people think.** A subagent call in Claude Code carries roughly 45,000 tokens of fixed input before it does anything. Everything a worker returns is re-read by the parent on every later turn. Effort settings save thinking tokens, but on a mechanical task there are almost none to save. So the levers that matter are how many workers you spawn, what they return, and which model does the work, not the knobs most people reach for first.

Both skills exist to apply those facts for you.

**If you are new to prompting**, you type "fix the login bug" and `prompt-master` turns it into a brief with a goal, a definition of done, a scope, and the files that matter, then shows you what it wrote. You get a better result without learning anything first, and you learn anyway, one rewrite at a time.

**If you prompt well but learned on another model**, you carry habits that hurt here: role-play preambles, "think step by step", severity filters, "be conservative", "verify everything twice". `prompt-master` strips them, tells you why, and cites the page that says so.

**If you pay the bill**, `sonnet-lean` is where the savings are. Its three measured levers each stand on their own: send the work to Sonnet when Sonnet passes, send three items to one worker instead of one item to three, and make workers return the deliverable instead of an essay about it.

**If you review other people's Claude output**, both skills make it more trustworthy: `prompt-master` insists on checkable done-criteria and on following the spec over a convenient test, and it reports assumptions as numbered items rather than burying them.

## prompt-master: how it works

The skill runs at the start of a task, before any work. Six steps.

1. **Decide in ten seconds.** A request that already states its goal, its done-criteria and its scope is left alone. A one-line edit is left alone. A question is answered. Everything else, and anything containing an instruction from the strip-list below, is rewritten.
2. **Investigate before rewriting.** The skill never rewrites from the words alone. It reads what the request points at, in parallel: the README or spec, the tests, the failing command, the named files. It establishes the **source of truth** and its order (a written spec outranks tests, tests outrank the current code, code outranks assumptions) and notes every place two of them disagree.
3. **Apply the rewrite rules.** Nine rules, each tied to the Anthropic guidance it comes from:
   - **R1** the goal with its reason, because Claude performs better when it knows why;
   - **R2** done-criteria that can fail: a command that exits 0, a file in a given shape, every rule in the spec covered;
   - **R3** scope stated explicitly, because Claude does not generalize an instruction from one item to the rest;
   - **R4** assessment or change, because a problem described out loud is not a request to fix it;
   - **R5** context as facts and `@file` references, long material first and the ask last;
   - **R6** the source of truth named, conflicts surfaced, never silently resolved by editing the weaker artifact;
   - **R7** the deliverable's exact shape;
   - **R8** the strip-list (next section);
   - **R9** ask once, at most three questions in one batch, or assume and number the assumption.
4. **Check the Claude Code mechanics** the user didn't use: plan mode for a multi-file change, `@file` instead of describing a file, a model and effort matched to the task, a subagent when work fans out.
5. **Show the rewrite.** Original prompt, rewritten prompt, and a one-line "what changed and why" per change. In an interactive session this appears before any work starts; in an unattended run it heads the final report.
6. **Execute the rewrite, not the original.** Every done-criterion gets its check run and its output looked at; the report lists each criterion with evidence, each conflict with its resolution, each assumption restated.

### The strip-list, with sources

| If your prompt says | What a current Claude model does with it | Replaced by | Source |
|---|---|---|---|
| "only report critical issues", "be conservative", "don't nitpick" | Finds the bugs, then withholds the ones below your bar. Recall drops. | Report every issue with a confidence and a severity; filter afterwards. | Prompting Claude Sonnet 5 and Opus 5, code review |
| "double-check your work", "add a final verification step", "use a subagent to verify" | On Opus 5, verifies work it already verifies. More tokens, same quality. | Removed. | Prompting Claude Opus 5, "Task scope and over-verification" |
| A numbered step-by-step recipe | Follows the recipe instead of reasoning about the goal. | Goal plus constraints. | Prompting Claude Fable 5, "Refactor existing prompts and skills" |
| "show your reasoning", "explain your thinking in the answer" | On Fable, can trigger a refusal category. | Ask for the conclusion and its evidence. | Prompting Claude Fable 5, scaffolding notes |
| "think step by step", "you are a senior engineer", ALL CAPS emphasis | Nothing. Adaptive thinking already decides how much to think. | Dropped, so the real instructions stand out. | Effort and thinking documentation |

### Example, from an actual run

The prompt was `Review lib/orders.js. Only report critical issues.` The skill investigated the file and the README, then printed:

```text
Original: Review lib/orders.js. Only report critical issues.

Rewritten prompt:
Goal: Review lib/orders.js, the order helpers behind the checkout service, so
  defects are found before they reach money handling.                    (R1)
Done when: every exported function has been read against the README's data
  contract, and each defect is listed with a failure scenario, a severity and
  a confidence.                                                           (R2)
Scope: all 12 exports plus module-level state. Out of scope: style, naming. (R3)
Mode: assessment, no code changes.                                        (R4)
Context: @lib/orders.js, @README.md. No tests exist in the repo.          (R5)
Deliverable: findings most-severe first, each with file:line and a repro. (R7)
Assumptions: 1. Discount codes can come from user input.                  (R9)

Changes:
- Dropped "only report critical issues": on current Claude models a severity
  filter is followed literally and suppresses real bugs. Replaced with
  "report everything with severity and confidence, filter afterwards". (R8)
- Added the reason, the scope, and that this is an assessment. (R1, R3, R4)
```

Then it reviewed the file and found all eleven planted bugs. The unassisted run on the same model found ten and put six of them in a paragraph labelled "not detailing per your critical-only scope". The unassisted run on Sonnet found two.

### When not to use it

A request that already is a brief. A one-line edit. A question. Rewriting a prompt that is already good wastes the tokens the skill exists to save, and the skill says so in its own first step.

## sonnet-lean: how it works

The skill applies whenever work runs on Sonnet 5: a subagent you spawn, a Workflow stage, a pipeline that calls a `claude-sonnet-*` model, or Sonnet as your session model. Seven levers, in the order they pay.

1. **Route by difficulty, not habit.** Mechanical bulk goes to Haiku. Scoped reasoning goes to Sonnet. Only synthesis that a cheaper tier cannot verifiably do goes to Opus or Fable. Measured: Sonnet at `low` effort matched Opus 5 and Fable 5.1 on a four-module coding task, 13 of 13 hidden tests each, at $0.34 per run against $1.06 and $1.76.
2. **Batch items per worker.** Every spawn carries about 45,000 tokens of fixed input. One worker outlining three files used 69,361 tokens; three workers outlining one file each used 140,707, with identical coverage. Fan out only when you need the items in parallel, and then keep every worker's configuration identical so they share the cached prompt prefix.
3. **One complete brief, one turn.** Task and reason, exact deliverable shape, the context as file paths and line ranges, what is out of scope. Sonnet follows instructions literally, especially at lower effort, so "every section, not just the first" has to be written down. A second message to fix an under-specified first one costs more than the first one saved.
4. **Constrain the output.** A structured schema where the harness supports it; otherwise the documented verbosity steer and a rule that the worker's final message is the return value, raw data only. Measured three times on three files: payloads down 62 to 80 percent, wall time roughly halved, coverage identical.
5. **Set effort deliberately, and know what it buys.** Anthropic's mapping says Sonnet 5 at `medium` matches Sonnet 4.6 at `high`. Measured on a task that made Sonnet think: quality held at `low`, `medium` and `high`; time halved from `high` to `low`; cost was flat, because inside Claude Code the fixed input dominates. Effort is a latency lever in Claude Code and a cost lever on the raw API.
6. **Thinking and API parameters.** Adaptive thinking stays on; lower effort rather than disabling it, because with thinking off Sonnet reaches for tools less. `max_tokens` is the hard cost ceiling. Sampling parameters return an error on Sonnet 5 and are removed. Subagent cache TTL is a cost lever on API billing.
7. **Two briefing templates**, one per item and one batched, that a worker can execute without a second message.

### When not to lean

Tasks whose failure you cannot cheaply detect, verification passes that guard a decision, and anything you would have to re-run on a stronger setting. The cheapest run is the one that is correct the first time.

## Which skill on which model

| Model | prompt-master | sonnet-lean | Notes from the measurements |
|---|---|---|---|
| **Sonnet 5** | Yes, and this is where it pays most. Sonnet follows a severity filter literally: 2–4 of 11 bugs unassisted, 9–10 with the rewrite, same cost. | Yes, always; it is the skill's target model. | The cheapest model that passed every hidden test in this repository. Start here for well-specified work and escalate on evidence. |
| **Opus 5** | Only for vague requests and for the assessment-or-change and source-of-truth rules. Not as a cost saver: on a complete brief carrying "double-check everything" it removed the instruction in one run of two and saved nothing either way. Review gains were small (10 to 11 of 11) at double the cost. | Yes, whenever Opus delegates to Sonnet workers. | Verifies its own work unprompted; extra verification instructions cost tokens for nothing (measured: +39%). The fix is to not write them, which no skill does as reliably as you can. |
| **Fable 5.1** | Yes, chiefly for R1 (the reason), R4 (assessment or change) and stripping show-your-reasoning, which can trigger a refusal on Fable. Not benchmarked as the session model beyond a baseline. | Yes, whenever Fable delegates to Sonnet workers; Fable is the model most often orchestrating. | On the tasks here Fable scored the same as Sonnet at `low` and cost five times more. Reserve it for work where Opus at higher effort still falls short, as Anthropic's own model page says. |
| **Opus 4.8** | Untested. Same literal-following profile as Opus 5, so the strip-list should apply. | Yes, as an orchestrator of Sonnet workers. | Legacy model. Scored the same as Opus 5 on the ledger task. |
| **Haiku 4.5** | Not tested as a session model. | Sonnet-lean's routing rule sends mechanical bulk here. | Cheapest tier; no effort parameter. |

## Installation

```bash
git clone https://github.com/henriquetell/claude-skills.git
cp -R claude-skills/prompt-master claude-skills/sonnet-lean ~/.claude/skills/
```

Per-project installation works too: use `.claude/skills/` inside a repository. Each folder name matches the `name:` in its `SKILL.md`. Run `/skill-doctor` (Claude Code 2.1.261 or later) after a few sessions to see what each skill costs in context and whether it is being used.

## Usage

Both skills auto-trigger when their description matches the task. Explicitly:

```text
/prompt-master fix the login bug          # rewrite, show, then do
/prompt-master --only review this file    # rewrite and show, don't execute
/sonnet-lean                              # when setting up Sonnet delegation or a pipeline
```

They compose. A typical flow: a vague request comes in, `prompt-master` turns it into a brief, and when the work fans out to Sonnet workers the brief becomes the worker prompt through `sonnet-lean`'s template.

## The measurements

Everything below was produced by [`bench/`](bench/): fixtures with a precise spec, deliberately wrong starting code, hidden tests validated against a reference solution, headless `claude -p` runs with the skill under test appended to the system prompt and the `Skill` tool disallowed so an installed copy cannot leak into a baseline arm. Two runs per cell unless stated. Two runs show a consistent gap; they do not estimate it precisely. Run your own before quoting a percentage.

### sonnet-lean

**The briefing template, three runs on three files.** Two Sonnet subagents, identical task (outline one file's top-level sections), differing only in the brief: a naive "read this file and tell me about its sections" against the skill's template.

| Run | Target | Payload naive → lean | Wall time | Coverage | Total tokens |
|---|---|---|---|---|---|
| 2026-07-09 | 14-section skill file | 4,703 → 1,777 chars (−62%) | 21.9 → 10.1 s | 14/14 both | 23,540 / 23,647 |
| 2026-08-05 | 9-section reference file | 4,988 → 989 chars (−80%) | 24.1 → 8.2 s | 9/9 both | 33,429 / 32,127 |
| 2026-09-09 | 12-section reference file | 4,263 → 1,150 chars (−73%) | 21.2 → 8.5 s | 12/12 both | 53,060 / 52,241 |

Total tokens barely move because the fixed input dominates a single call. What the brief cuts is the output, which is the expensive part and the part the parent re-reads on every later turn.

**Batching.** One Sonnet worker outlining three files against three workers outlining one each: 69,361 tokens against 140,707, coverage 35/35 both, wall time 26 s against 12 s in parallel.

**Effort on a mechanical task.** Headless Sonnet 5 on the outline task at `low`, `medium`, `high`: 0, 0 and 32 thinking tokens, cost $0.14 each, coverage 12/12 each. Nothing to save.

**Effort on a task that thinks.** The four-module ledger task, 13 hidden tests, one visible test contradicting the spec:

| | `low` | `medium` | `high` |
|---|---|---|---|
| Hidden tests | 13/13, 13/13 | 13/13, 13/13 | 13/13, 13/13 |
| Thinking tokens | 870 / 1,382 | 5,430 / 6,108 | 9,063 / 9,195 |
| Mean cost | $0.34 | $0.32 | $0.38 |
| Mean API time | 75 s | 106 s | 159 s |

On the same task Fable 5.1 scored 13/13 at $1.76 and Opus 5 at $1.06.

### prompt-master

**Round one, vague prompts.** "Tests are failing in this project. Get them passing." on the ledger task, and "The slug library doesn't really match the readme, fix it up." on the slug task. Raw prompt against raw prompt plus the skill (then named `spec-first`, rules R1, R2, R6, R9).

| | Sonnet 5, ledger | Opus 5, ledger | Sonnet 5, slug |
|---|---|---|---|
| Hidden tests, raw / with skill | 13/13 both / 13/13 both | 13/13 both / 13/13 both | 17/17 both / 17/17 both |
| Rewrote the contradicting test to pass, raw | 2/2 | 2/2 | — |
| Rewrote it, with skill | 0/2 | 0/2 | — |
| Mean cost raw → with skill | $0.40 → $0.42 | $0.71 → $0.85 | $0.25 → $0.29 |

Correctness identical. The one consistent difference: told to get tests passing, every unassisted run changed the test's expectation to match the spec, disclosed in the report; every skill run left the test failing, followed the spec, and put the conflict in front of the reader. Whether you want that is a judgment call; the skill's position is that a test is the user's artifact.

**Round two, the code-review trap.** `bench/fixtures/review/lib/orders.js`, 84 lines, 11 planted bugs: an `eval` on user input, a pagination off-by-one, float money math, a missing `await`, a swallowed error, a shallow clone, a timezone bug, an in-place sort, an unbounded cache, dead code, an over-strict email regex. Prompt: "Review lib/orders.js. Only report critical issues."

| | Sonnet 5, raw | Sonnet 5, with skill | Opus 5, raw | Opus 5, with skill |
|---|---|---|---|---|
| Planted bugs mentioned | 2/11, 4/11 | 9/11, 10/11 | 10/11, 10/11 | 11/11, 11/11 |
| Mean cost | $0.11 | $0.11 | $0.15 | $0.34 |
| Mean API time | 25 s | 45 s | 25 s | 72 s |

On Sonnet this is the first clear correctness win for any skill in this repository. On Opus the effect is small because Opus already hedges around the filter, and the skill doubled the cost of a short review. Every skill run printed the original, the rewrite, and a reason per change.

**Round three, the over-verification trap on Opus 5. A negative result.** Anthropic's Opus 5 page says instructions like "double-check your work" and "include a final verification step" cause over-verification: more tokens, no quality gain. The precise ledger prompt was rerun with exactly those phrases added. Reference point: the same prompt without them, from the fable-mode benchmark, cost $1.06 per run.

| Opus 5, ledger, 13 hidden tests | Plain prompt (reference) | With "double-check" added, raw | With "double-check" added, prompt-master |
|---|---|---|---|
| Hidden tests | 13/13, 13/13 | 13/13, 13/13 | 13/13, 13/13 |
| Mean cost | $1.06 | $1.47 | $1.52 |
| Mean API time | 222 s | 288 s | 288 s |
| Thinking tokens | 4,780 / 6,626 | 8,790 / 8,994 | 4,383 / 4,579 |
| Rewrite shown, instruction removed | — | — | 1 of 2 runs |

**Honest reading.** The trap is real: the two added sentences raised Opus 5's cost by about 39 percent and its time by 30 percent for an identical result, which is what the documentation predicts. The skill did not fix it. In a first attempt it never rewrote the prompt at all, because the request was already a complete brief and the skill's first step said to leave complete briefs alone; that rule was corrected so that a strip-list match always produces a rewrite, and the prompt-master arm was rerun. After the fix, one run of two showed the rewrite and removed the instruction with the right citation; the other still skipped it. And the run that did remove it cost the same as the raw runs anyway: thinking tokens halved, but the model then wrote a 102-assertion scratch suite "which is checkable where double-check isn't", replacing vague verification with heavier concrete verification. Two conclusions. First, on a complete brief on Opus 5, prompt-master is not a cost saver, and the skill's own rule R2 (checkable done-criteria) is part of why. Second, the skill's trigger on already-complete prompts is unreliable and remains a known defect. Both are stated in the skill.

**Not measured.** The interactive question round (R9) and the mechanics check; the skill on Opus 4.8 or Fable as the session model; the return-by-file rule in sonnet-lean; and where `low` effort starts to lose to `high`, since every task here sat at the ceiling for every model.

### Retired: fable-mode

`fable-mode` tried to make Opus 4.8 and Opus 5 work with Claude Fable's documented operating discipline: spec-first autonomy, fresh-context verifier subagents, grounded progress claims, a failable-check standard, file-based state. Every rule cited an Anthropic page. On 2026-09-09 it was benchmarked with the decision fixed in advance: it stays if it wins on correctness or on honesty about a deliberately wrong test.

Sixteen runs over four tasks and two models: identical correctness, scope and honesty with and without it, and 37 to 64 percent more cost with it. Fable 5.1 itself, run on the same ledger task with no skill, scored the same 13/13 as Opus alone and as Sonnet at `low`, at $1.76 against $1.06 and $0.34. The reason the skill bought nothing is that Claude Code's own system prompt already installs that discipline on current models, and Anthropic's Opus 5 guidance says added verification instructions cause over-verification. It lives in [`archive/`](archive/) with its `reference.md`, a dated, source-linked snapshot of Anthropic's guidance for Fable 5.1, Opus 5 and Opus 4.8 that stays useful on its own. Its one durable idea, "make the first turn complete", became `prompt-master`.

## Design principles

1. **Every rule cites a source.** Each skill lists the Anthropic page and section each rule comes from, with the date it was last re-verified against the live docs and the Claude Code changelog (2026-09-09, through Claude Code 2.1.266).
2. **Every claim of benefit is measured against a check that can fail.** Hidden tests validated against a reference solution, coverage against `grep`, cost and time from the harness's own JSON. "It felt better" is not a result. The apparatus is in `bench/`.
3. **A skill that doesn't beat the baseline is retired, in public.** A skill that does beat it says exactly where: prompt-master's win is on Sonnet, on prompts with a severity filter, and it is stated that way.
4. **Skills cost context.** `/skill-doctor` shows what each one costs and whether it is used. Keep only what earns its place.

## Repository layout

```
prompt-master/
  SKILL.md              # the request-to-prompt rewriter: rules R1–R9, strip-list, sources, measurements
sonnet-lean/
  SKILL.md              # the token-efficiency levers, batching rule, briefing templates, sources
bench/
  README.md             # how to rerun every number in this file
  fixtures/ hidden/ reference/ prompts/   # four tasks, hidden tests, known-good solutions, prompts
  validate.sh run.sh grade.js grade-review.js
archive/
  README.md
  fable-mode/           # retired protocol and its source-linked reference library
README.md
LICENSE
```

## Sources & credits

Built on Anthropic's official documentation: [Prompting Claude Sonnet 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5), [Prompting Claude Opus 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5), [Prompting Claude Fable 5.1](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1), [Prompting Claude Fable 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5), [Claude prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices), [Effort](https://platform.claude.com/docs/en/build-with-claude/effort), the [Claude Code CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md) and the Claude Code docs on [subagents](https://code.claude.com/docs/en/sub-agents), [prompt caching](https://code.claude.com/docs/en/prompt-caching) and [output styles](https://code.claude.com/docs/en/output-styles).

Several verification ideas in the retired `fable-mode` (the failable-check standard, domain check anchors, verify-before-flag) were adopted from [mrtooher/fable-mode](https://github.com/mrtooher/fable-mode); `archive/fable-mode/reference.md` documents what was adopted and why. The failable-check standard outlived the skill: it is the rule every benchmark here was run under.

## License

[MIT](LICENSE)
