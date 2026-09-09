---
name: prompt-master
description: Rewrite the user's request into the prompt Claude works best with, show the rewrite with one line per change so the user learns, then do the work from the rewrite. Turns "fix it", "get the tests passing", "review this, only critical issues", or long prompts written in another model's style into a brief with the goal and its reason, checkable done-criteria, explicit scope, the source of truth and any conflict with it, context as @file references, whether an assessment or a change is wanted, and the deliverable's shape. Strips instructions Anthropic documents as harmful on current Claude models (severity filters in reviews, added verification steps on Opus 5, prescriptive step recipes, show-your-reasoning). Use on /prompt-master, on vague or underspecified substantial requests, on prompts that read like they were written for a different model, or before delegating. Not for requests that already are a complete brief, or for one-line edits.
---

# Prompt Master — write the prompt Claude works best with, then run it

Two facts from Anthropic's documentation drive this skill. First, a well-specified, clear task description **in the first turn** maximizes autonomy and intelligence while minimizing tokens; ambiguity fed in over several turns costs more and performs worse. Second, current Claude models follow instructions **literally**, so a prompt written for another model's habits — severity filters, "double-check everything", step-by-step recipes — makes Claude do the wrong thing precisely. Most people don't know either fact. This skill applies both for them, shows them what changed and why, and then does the work from the better prompt.

## 1. Decide in ten seconds

Rewrite when the request is vague ("fix", "make it work", "clean up", "get the tests passing" without saying against what), when it names no done-criteria or scope, or when it conflicts with the repository. Skip when the request already states goal, done-criteria and scope, when it is a one-line edit, or when it is a plain question — answer questions.

**One exception to skipping, and it is not optional:** scan every request, complete or not, for the strip-list in §3 R8. A match always produces a rewrite, even if the only change is removing that instruction. A complete brief that says "double-check everything and add a final verification step" is still a worse prompt on Opus 5 than the same brief without it, and the user needs to see that line go and read why. Never silently comply with a strip-list instruction, and never silently ignore it either: show the removal in the Changes block (§5), then execute the cleaned prompt.

## 2. Investigate before rewriting

Never rewrite from the words alone. Read what the request points at, in parallel where the reads are independent: the README or spec, the tests, the failing command, the files named. Establish the **source of truth** and its order — a written spec outranks tests, tests outrank the current code, code outranks your assumptions — and note every disagreement between them. Two to six tool calls is normal.

## 3. The rewrite rules

Each rule names the Anthropic guidance it comes from (full URLs under Sources).

- **R1 Goal with its reason.** "I'm working on [larger task] for [who]; they need [what the output enables]." Claude performs better when it knows why. *(Prompting Claude Fable 5, "Give the reason")*
- **R2 Done-criteria that can fail.** A command that exits 0, a file in a given shape, every rule of the spec covered including ones no visible test exercises. Never a feeling. *(Best practices, self-check anchor)*
- **R3 Scope stated explicitly.** Claude does not generalize an instruction from one item to the rest: say "every section, not just the first", name what is out of scope. *(Prompting Claude Sonnet 5, "More literal instruction following")*
- **R4 Assessment or change.** If the user is describing a problem or thinking out loud, the deliverable is an assessment; if they want a change, say so. Left unsaid, Claude may fix what it was only asked to look at, or look at what it was asked to fix. *(Prompting Claude Fable 5, "State the boundaries")*
- **R5 Context as facts, not adjectives.** Paths and line ranges, `@file` references in Claude Code, the exact error text. Long material at the top, the ask at the end; for long documents, ask for relevant quotes first. *(Best practices, "Long context prompting")*
- **R6 Source of truth and conflicts.** Name it. When a test contradicts the spec, follow the spec and surface the conflict; do not edit the lower-ranked artifact to make the conflict disappear unless asked. *(Best practices, "Avoid focusing on passing tests")*
- **R7 Deliverable shape.** Exactly what the final answer looks like: a diff, a list with confidence and severity per item, a file, three sentences.
- **R8 Strip what hurts on current Claude models.**
  - *"Only report critical / high-severity issues", "be conservative", "don't nitpick"* in a review → Claude follows it literally and drops real bugs; measured recall falls while the model's bug-finding is unchanged. Replace with: **report every issue you find, including uncertain and low-severity ones, each with a confidence and an estimated severity; filtering happens afterwards.** *(Prompting Claude Sonnet 5 and Opus 5, "Code review")*
  - *"Double-check your work", "add a final verification step", "use a subagent to verify"* on Opus 5 → over-verification, more tokens, no quality gain. Remove. *(Prompting Claude Opus 5, "Task scope and over-verification")*
  - *Enumerated step-by-step recipes* for a capable model → worse than goal plus constraints; prefer "think thoroughly about X, constraints are Y". *(Prompting Claude Fable 5, "Refactor existing prompts")*
  - *"Show your reasoning / explain your thinking in the answer"* → triggers a refusal category on Fable; ask for the conclusion and evidence instead. *(Prompting Claude Fable 5, scaffolding)*
  - *"Think step by step"*, role-play preambles ("you are a senior engineer"), all-caps emphasis → no effect on adaptive-thinking models; drop them so the real instructions stand out.
- **R9 Ask once, or assume.** If different readings would lead to materially different work, ask all questions in one batch, at most three, then stop. Unattended, or when the difference is minor: pick the reading the spec and code most directly support and record it as a numbered assumption.

## 4. Claude Code mechanics check

While rewriting, note anything the harness offers that the user didn't use: plan mode for multi-file changes; `@file` instead of describing a file; a model and effort matched to the task (Sonnet at `low` or `medium` for well-specified work, escalate on evidence — see `sonnet-lean`); a subagent when work fans out across independent items; an existing skill or `CLAUDE.md` convention that applies. One line each, only when relevant.

## 5. Show the rewrite

```text
Original: <the request, verbatim>

Rewritten prompt:
Goal: …            (R1)
Done when: …       (R2)
Scope: … / Out of scope: …   (R3)
Mode: assessment | change    (R4)
Context: …         (R5)
Source of truth: …; conflicts: …   (R6)
Deliverable: …     (R7)
Assumptions: 1. … (R9)

Changes: one line each — what changed, why, which rule.
```

Interactive: show this before starting, then execute unless the user asked for the prompt only ("just rewrite", "prompt only", `/prompt-master --only`). Unattended: put the rewrite at the top of the final report so the reader sees what the work was measured against.

## 6. Execute the rewritten prompt, not the original

Work against **Done when**; run every check it names and look at the output. Report against the rewrite: each done-criterion with its evidence, every conflict and how it was resolved, every assumption restated, anything unmet stated plainly. Things noticed but not asked for go in one "follow-ups" line, not in the change.

## When NOT to apply

Complete briefs, one-line edits, questions. Rewriting a prompt that already is one wastes the tokens this skill exists to save.

## Measured (2026-09-09; method and numbers in the repository README and `bench/`)

- **The code-review trap (R8).** Prompt: "Review lib/orders.js. Only report critical issues." against a file with 11 planted bugs. Sonnet 5 unassisted: 2 and 4 of 11. Sonnet 5 with this skill: 9 and 10 of 11, same cost, rewrite shown with reasons. Opus 5: 10 of 11 unassisted (it hedges around the filter on its own), 11 of 11 with the skill at twice the cost.
- **Vague prompts (R1, R2, R6, R9; run under the earlier name `spec-first`).** "Tests are failing in this project. Get them passing." with a visible test that contradicts the spec: correctness identical to no skill on Sonnet 5 and Opus 5, cost 5–19% higher, and one consistent difference — every unassisted run rewrote the test to make it pass; every skill run left it, followed the spec, and reported the conflict.
- **The over-verification trap (R8, second bullet), Opus 5 — a negative result.** A complete brief with "double-check all of your work … include a final verification step … re-verify before responding" added cost 39% more than the same brief without it, for the same 13/13, confirming Anthropic's warning. This skill did not recover that cost: on the first attempt it skipped the rewrite entirely because the brief was complete (§1 was corrected to make strip-list matches mandatory); after the correction it removed the instruction in one run of two, and that run cost as much as the raw ones because rule R2 led the model to build a large scratch test suite instead. Treat R8's second bullet as documented, not demonstrated, and the §1 exception as a known weak spot on already-complete prompts.
- **Not measured:** the interactive path (§3 R9, one round of questions), the Claude Code mechanics check (§4), and anything beyond one review file and two coding tasks.

## Sources

- Prompting Claude Sonnet 5 — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5 ("Interactive coding products", "More literal instruction following", "Code review harnesses")
- Prompting Claude Opus 5 — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5 ("Task scope and over-verification", "Self-correction", code review in "Capability improvements")
- Prompting Claude Fable 5 — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5 ("Give the reason, not only the request", "State the boundaries", "Recommended scaffolding changes")
- Prompting Claude Fable 5.1 — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1 ("Finish the whole task", the "Delivering work" block)
- Claude prompting best practices — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices ("Be clear and direct", "Add context", "Long context prompting", "Avoid focusing on passing tests and hardcoding", self-check anchor)
