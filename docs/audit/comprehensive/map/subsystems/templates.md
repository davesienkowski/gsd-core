# Templates — `gsd-core/templates/`

> **Non-engine subsystem** (46 files) · reviewer doc (DOC-01) · derived 2026-06-08 from live code.

## Purpose

**Scaffolding shapes** for the `.planning/` artifacts. When a workflow or the engine creates a new
PROJECT.md / REQUIREMENTS.md / ROADMAP.md / STATE.md / PLAN.md / SUMMARY.md, it starts from the
template here — so every consumer project's artifacts share one canonical structure the engine
knows how to parse.

## Key files (selected — 46 total)

| File | Role |
|------|------|
| `gsd-core/templates/project.md` | PROJECT.md shape |
| `gsd-core/templates/requirements.md` | REQUIREMENTS.md shape |
| `gsd-core/templates/roadmap.md` | ROADMAP.md shape (phases, progress table) |
| `gsd-core/templates/state.md` | STATE.md shape |
| `gsd-core/templates/plan.md` | PLAN.md shape (the executor's prompt) |
| `gsd-core/templates/summary.md` | SUMMARY.md shape (planner @-includes this) |

## How it connects

- **Consumed by `template.cts` (E9):** the engine reads template files **by string path** (Site 4)
  and writes the scaffolded artifact into `.planning/`.
- **@-included by agents:** the planner @-includes `templates/summary.md`
  (`agents/gsd-planner.md:453`) so the plans it writes match the SUMMARY shape executors will fill.
- **Round-trip contract:** the templates' structure must match what the E3 artifact-lifecycle
  parsers (`state-document.cts`, `roadmap.cts`, `frontmatter.cts`) expect — template shape and
  parser are two halves of one contract.

## What a newcomer must know

- **Template ↔ parser is a coupled pair.** Changing a template heading or frontmatter field can
  silently break the E3 parser that reads the resulting artifact — change both halves together.
- Loaded by **path, not import** (Site 4) — a template with no apparent reference is not dead; the
  engine resolves it at runtime.
- These define the **canonical artifact structure** the whole pipeline depends on — a low-churn
  but high-blast-radius surface (every consumer project inherits these shapes).
