# Agents — `agents/gsd-*.md`

> **Non-engine subsystem** (33 files) · reviewer doc (DOC-01) · derived 2026-06-08 from live code.

## Purpose

**Subagent role definitions** — the specialized workers an orchestrating workflow spawns to do
focused work in their own thread (research, planning, execution, review, verification). Each is a
markdown file with YAML frontmatter (name / description / **tools** / color) and a `<role>` block,
and pulls its own context via `@~/`-includes.

## Key files (selected — 33 total)

| File | Role | Notes |
|------|------|-------|
| `agents/gsd-planner.md` | authors PLAN.md files | 47K; spawned by plan-phase; returns `## PLANNING COMPLETE` (`:1104`) |
| `agents/gsd-plan-checker.md` | reviews plan quality before execution | 35K; returns a structured YAML issues block (BLOCKER/WARNING) |
| `agents/gsd-phase-researcher.md` | researches technical approaches; writes RESEARCH.md | returns `## RESEARCH COMPLETE` |
| `agents/gsd-executor.md` | implements a PLAN.md | spawned by execute-phase |
| `agents/gsd-verifier.md` | verifies executed work | |
| `agents/gsd-eval-planner.md`, `gsd-pattern-mapper.md`, … | specialized roles | |

## How it connects

- **Spawned by workflows:** `Agent(subagent_type="gsd-planner", …)` — the workflow passes context
  (CONTEXT/RESEARCH paths, model tier from E7, skills budget from `gsd_run query agent-skills`).
- **@-includes (Site 4):** an agent pulls references/templates/workflows by at-path — e.g.
  `gsd-planner.md` includes `references/mandatory-initial-read.md` (`:25`),
  `references/planner-source-audit.md` (`:100`), `workflows/execute-plan.md` (`:452`),
  `templates/summary.md` (`:453`).
- **Completion sentinels:** an agent ends with an H2 sentinel (`## PLANNING COMPLETE`) the
  orchestrator parses to route the next step (PIPELINE-TRACE §2 steps F/G).
- **Calls the engine itself:** an agent has `Bash` in its tools and runs its own shim → `gsd_run`,
  so it reads/writes `.planning/` through the same engine path as the orchestrator.

## What a newcomer must know

- **The completion sentinel is a contract** — change `## PLANNING COMPLETE` and the workflow's
  return-parsing breaks (the workflow greps for the exact marker; there's a filesystem-fallback at
  `plan-phase.md:1136` for when it's missing). Some agents use ALL-CAPS, some title-case — match
  what the consuming workflow parses.
- **Spawn by exact type name** — `subagent_type="gsd-planner"`, never a generic name (a documented
  anti-pattern in CLAUDE.md).
- The `tools:` frontmatter is a **capability gate** — the planner has `Read/Write/Bash/Glob/Grep/
  WebFetch/mcp__context7__*` but not `Agent` (planners don't spawn sub-agents).
- Installed per-runtime by `bin/install.js` into each runtime's agents dir; referenced by string
  name from workflows — invisible to the import graph (Site 4).
