# E7 — Model catalog & profiles

> **Engine cluster** (`src/*.cts`) · reviewer doc (DOC-01) · derived 2026-06-08 from live code.
> **Source of truth:** `src/*.cts` — never the compiled `gsd-core/bin/lib/*.cjs`.

## Purpose

Resolves **which model each agent runs on**. Maps every agent type (`gsd-planner`,
`gsd-executor`, …) to a quality/balanced/budget model tier based on the user's configured profile,
and renders profile state for the user. Small cluster (3 modules) but it sits on the hot path of
every agent spawn.

## Key files (3 modules)

| File | Role | Notes |
|------|------|-------|
| `src/model-catalog.cts` | reads the agent→tier catalog and resolves a model for an agent | Fan-in 3; data lives in `gsd-core/bin/shared/model-catalog.json` (subsystem #2), read by this module |
| `src/model-profiles.cts` | the quality/balanced/budget profile shapes | |
| `src/profile-output.cts` | renders profile state for the user (`/gsd-config`, profile display) | **Hotspot #6** (fileCx 232, maxFn 53) |

## How it connects

- **Data, not code:** the actual tier mappings live in `gsd-core/bin/shared/model-catalog.json`
  (CLI-entry subsystem). `model-catalog.cts` reads that JSON — the path is env-overridable via
  `GSD_MODEL_CATALOG` (used by tests and custom deployments).
- **Consumed by `core.cts` (E1)** `resolveModelInternal()` and by `gsd-tools.cjs`
  `resolve-model` (`:546`) — the workflow asks "what model for gsd-planner?" before spawning.
- `profile-output` has high single-function complexity (maxFn 53) for a 3-module cluster — the
  rendering logic is the heavy part.

## What a newcomer must know

- To change a model assignment you edit **the JSON** (`model-catalog.json`), not the `.cts` — the
  `.cts` is the resolver, the JSON is the catalog.
- `GSD_MODEL_CATALOG` lets a test or deployment point at a different catalog file — if model
  resolution behaves oddly in a test, check whether this env var is set.
- The three tiers (quality/balanced/budget) are the only contract — an agent's model is always
  one of its three tier entries, selected by the user's profile.
