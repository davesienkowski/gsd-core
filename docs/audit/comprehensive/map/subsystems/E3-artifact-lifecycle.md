# E3 — State / phase / roadmap / milestone (artifact lifecycle)

> **Engine cluster** (`src/*.cts`) · reviewer doc (DOC-01) · derived 2026-06-08 from live code.
> **Source of truth:** `src/*.cts` — never the compiled `gsd-core/bin/lib/*.cjs`.

## Purpose

The **heart of GSD's file-based memory**: CRUD on every `.planning/` artifact — `STATE.md`,
phase directories (`phases/NN-slug/`), `ROADMAP.md`, milestones, plan scanning, and the
frontmatter/document-shape primitives the rest of the artifact layer is built on. When a
workflow runs `gsd_run query state` / `query phase` / `query roadmap`, this cluster does the work.

## Key files (10 modules)

| File | Role | Notes |
|------|------|-------|
| `src/state.cts` | STATE.md CRUD, frontmatter sync, progress tracking, the `cmd*` state commands | **Hotspot #2** (churn 67 × fileCx 381; 1,900 LOC). |
| `src/phase.cts` | phase directory lifecycle (add/remove/complete/find) | **Hotspot #3** (churn 73 — 2nd-highest; 1,527 LOC). |
| `src/phase-lifecycle.cts` | phase status transitions | |
| `src/roadmap.cts` | ROADMAP.md parse, phase extraction, progress tables | **Hotspot #7** |
| `src/roadmap-upgrade.cts` | migrate older ROADMAP shapes | |
| `src/milestone.cts` | milestone CRUD | churn 27 |
| `src/plan-scan.cts` | scan a phase dir for PLAN.md files | consumed by E9 `init` |
| `src/frontmatter.cts` | YAML frontmatter parse/extract — the artifact-layer primitive | Fan-in **11** (consumed across the whole layer). |
| `src/state-document.cts` | the STATE.md document model | |
| `src/decisions.cts` | locked-decision parsing | |

## How it connects

- **Below:** E1 (foundation) + E2 (workspace paths).
- **Dispatch in (Site 3):** the `cmd*` functions here are reached **only as values in
  string-keyed router handler maps** (`state-command-router.cts:150-188` maps `'begin-phase'`,
  `'complete-phase'`, … → `state.cmd*`). They look unused to knip but are live on every command.
- **Above:** E9 `init`/`commands` aggregate these for workflow bootstrapping.

## What a newcomer must know

- **The "unused function" trap:** before deleting any `cmd*` here, check
  `DYNAMIC-INDIRECTION.md` Site 3 — grep the `*-command-router.cts` handler maps and
  `command-aliases.cts`. Almost every one is dispatched by string key.
- `frontmatter.cts` is load-bearing for the *entire* artifact layer (fan-in 11) — a parse change
  ripples into STATE/ROADMAP/PLAN/SUMMARY handling.
- `state.cts` + `phase.cts` are hotspots #2/#3 (most-changed × complex) — the highest-payoff and
  highest-risk files for the deep correctness sweep (Phase 13).
