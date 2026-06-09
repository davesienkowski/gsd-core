> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# Workflows — `gsd-core/workflows/`

> **Non-engine subsystem** (108 files) · reviewer doc (DOC-01) · derived 2026-06-08 from live code.

## Purpose

The **orchestration layer**: markdown documents the AI runtime executes as step-by-step
instructions. A workflow is "markdown-as-code" — it embeds bash shims (`gsd_run …` engine calls)
and `Agent(...)` spawns, walks a numbered process with gates, parses agent completion sentinels,
and leaves `.planning/` artifacts behind. This is the **largest single prompt-corpus surface** in
the repo.

## Key files (selected — 108 total)

| File | Role | Notes |
|------|------|-------|
| `gsd-core/workflows/plan-phase.md` | the plan-phase orchestration (the PIPELINE-TRACE worked example) | 83K; ~15 numbered steps, 3 agent spawns, the revision loop |
| `gsd-core/workflows/execute-phase.md` | wave-based phase execution | falls back to sequential when `Agent()` is unavailable |
| `gsd-core/workflows/execute-plan.md` | single-plan execution | @-included by the planner agent |
| `gsd-core/workflows/quick.md` | the short path (`/gsd-quick`) | 28 `gsd_run`/`Agent(` sites |
| 3 subdirs | `discuss-phase/`, `execute-phase/`, `help/` | multi-file workflows |

## How it connects

- **In:** a command (`commands/gsd/<cmd>.md`) @-includes its workflow via
  `@~/.claude/gsd-core/workflows/<cmd>.md` (Site 4); the runtime then executes it.
- **Shim (Site 0):** every workflow opens with the self-locating shim that defines `gsd_run` →
  `node gsd-tools.cjs` (PIPELINE-TRACE §1.1).
- **Agents:** workflows spawn agents by `subagent_type` and parse their completion sentinels
  (`## PLANNING COMPLETE`, `## RESEARCH COMPLETE`, …).
- **References/templates:** workflows @-include reference docs (gates, contracts, revision-loop)
  and read templates by path.

## What a newcomer must know

- **Invisible to the import graph.** A workflow has **no** static inbound edge — madge sees 0 edges
  to any `.md`. A workflow with no apparent reference is **not** dead; it's loaded by @-include or
  staged into a runtime prompt by the installer (Site 4). Never call one dead from a graph view.
- **Markdown frontmatter is enforced like code:** `scripts/lint-descriptions.cjs` (≤100-char
  `description`), `scripts/lint-skill-deps.cjs` (`requires:` closure), `check-alias-drift.cjs`.
- **The shim block is load-bearing prose** — it is real bash the runtime runs, not documentation.
  Editing it changes how `gsd-tools` is located across runtimes.
- These are the highest-value target for BLOAT-03 (prompt/token bloat) — but every cut needs the
  mechanical-vs-instructional guard: workflow prose *is* the program's behavior.