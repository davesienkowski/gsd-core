# E9 — Compound context aggregators & command surface

> **Engine cluster** (`src/*.cts`) · reviewer doc (DOC-01) · derived 2026-06-08 from live code.
> **Source of truth:** `src/*.cts` — never the compiled `gsd-core/bin/lib/*.cjs`.

## Purpose

The **"assemble everything a workflow needs in one call"** layer. These are the big high-fan-out
modules that sit at the top of the engine, pulling many clusters together so a workflow's first
`gsd_run query init` returns one JSON blob instead of forcing ten round-trips. Also the
command-surface builder. High fan-out, low fan-in — they orchestrate, they aren't depended on.

## Key files (4 modules)

| File | Role | Notes |
|------|------|-------|
| `src/init.cts` | the compound init aggregators (`cmdInitPlanPhase :319`, `cmdInitExecutePhase :187`, new-project/new-milestone/quick/ingest-docs) | Fan-out **11** (top). fileCx **419** (2nd-highest), 1,996 LOC, churn 5 — a big low-churn aggregator (Phase-12 bloat/maintainability lead more than correctness). |
| `src/commands.cts` | command-surface builder; `determinePhaseStatus`, the static command catalog | Fan-out 9. **Hotspot #4** (churn 52 × fileCx 287). Prime BLOAT-02 surface-sprawl lead. |
| `src/config.cts` | config aggregator (`config-get`/`config-set` surface) | Fan-out 8. **Hotspot #5** — **highest churn after core (78)**; unstable contract → correctness + change-cost lead. |
| `src/template.cts` | reads `gsd-core/templates/*` by path and scaffolds `.planning/` artifacts | Site-4 corpus reader |

## How it connects

- **Entry (Site 0/3):** entered from `gsd-tools.cjs` family handlers — `init` via `query init …`,
  `config` via `query config-get/-set`, `commands`/`template` via their families.
- **Down:** `init` imports commands, core (E1), frontmatter (E3), plan-scan (E3),
  planning-workspace (E2), runtime-homes (E6), runtime-slash (E6), secrets, security (E11),
  shell-command-projection (E1), state-document (E3) — depcruise confirms this fan-out of 11.
- **Corpus reads (Site 4):** `template.cts` loads templates by string path; the import graph does
  not show its real inputs.

## What a newcomer must know

- `init.cts` is the **first thing every workflow calls** — a bug here breaks the bootstrap of
  every command. It is large and low-churn; treat it as a careful-refactor, not a quick-edit.
- `config.cts` has the **highest churn after core** — the config contract is unstable; changes
  here are a recurring source of churn and a correctness lead (Phase 13).
- `commands.cts` is the surface-sprawl epicentre (BLOAT-02) — when assessing "too many commands,"
  start here.
