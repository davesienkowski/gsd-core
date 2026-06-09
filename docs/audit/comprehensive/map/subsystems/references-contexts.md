> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# References & Contexts — `gsd-core/references/`, `gsd-core/contexts/`

> **Non-engine subsystem** (69 + 3 files) · reviewer doc (DOC-01) · derived 2026-06-08.

## Purpose

**Reusable guidance documents** loaded as context by workflows and agents — the shared "rules of
the road" the orchestration layer @-includes so the same gate taxonomy, agent contracts, and TDD
rules don't have to be repeated in every workflow. Contexts are the 3 mode files (dev / research /
review) that set the working stance.

## Key files (selected)

| File | Role |
|------|------|
| `gsd-core/references/gates.md` | the gate taxonomy (block / loop / escalate / terminate checkpoints) |
| `gsd-core/references/agent-contracts.md` | the contract every agent honors |
| `gsd-core/references/revision-loop.md` | the max-3 revision-loop rules (plan-phase @-includes this) |
| `gsd-core/references/tdd.md` | TDD gate enforcement (planner @-includes when tdd_mode) |
| `gsd-core/references/mandatory-initial-read.md` | the planner/executor "read this first" |
| `gsd-core/references/planner-source-audit.md`, `planner-antipatterns.md`, `thinking-models-planning.md` | planner guidance |
| `gsd-core/references/few-shot-examples/` | few-shot fixtures |
| `gsd-core/contexts/{dev,research,review}.md` | the 3 mode contexts |

## How it connects

- **In (Site 4):** workflows and agents @-include these via `@~/.claude/gsd-core/references/<file>`
  at-paths — e.g. `commands/gsd/plan-phase.md` includes `references/ui-brand.md`,
  `revision-loop.md`, `gate-prompts.md`, `agent-contracts.md`, `gates.md`; `agents/gsd-planner.md`
  includes `mandatory-initial-read.md`, `planner-source-audit.md`, etc.
- **Pure documentation** — no code, no engine dependency. They are inert text spliced into prompts.

## What a newcomer must know

- **Orphan ≠ dead** (Site 4): a reference with no apparent inbound link may be @-included by a
  workflow/agent or staged into a runtime prompt — check string-path/at-path references before
  calling it unused.
- These are **load-bearing instruction**, not boilerplate — `gates.md`/`agent-contracts.md`/
  `revision-loop.md` shape model behavior. Any BLOAT-03 cut here is `instructional` and must route
  to a recall/edge-probe gate ("verifier reach = spec reach"), never "delete this."
- Markdown duplication across references is a **valid** Phase-12 concern (jscpd reported markdown
  ~11.7% duplication) — but verbatim-duplicate confirmation must precede any cut.