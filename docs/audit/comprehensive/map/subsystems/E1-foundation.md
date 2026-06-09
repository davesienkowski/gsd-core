# E1 — Foundation / shared utilities

> **Engine cluster** (`src/*.cts`) · reviewer doc (DOC-01) · derived 2026-06-08 from live code.
> **Source of truth:** `src/*.cts` — never the compiled `gsd-core/bin/lib/*.cjs`.

## Purpose

The seam every other cluster leans on: project-root resolution, config loading, model
resolution, the git/shell **command-projection** layer, and exit handling. Breaking anything
here has the **widest blast radius in the engine** — `core.cts` is both the most-changed and
most-depended-upon file in the repo.

## Key files (12 modules)

| File | Role | Notes |
|------|------|-------|
| `src/core.cts` | the central hub — project root, config, model resolution, git helpers, the `error()`/`ERROR_REASON` exit helper | **Hotspot #1** (churn 142 × fileCx 602; maxFn 108). Fan-in 24 / fan-out 9 — hub *and* orchestrator. Read this first. |
| `src/shell-command-projection.cts` | the single most depended-upon module (fan-in **29**) — projects shell/git commands behind a seam so they can be tested/mocked | any change ripples everywhere |
| `src/configuration.cts`, `config-schema.cts`, `config-types.cts` | config load + schema + types | |
| `src/project-root.cts` | resolve the consumer project root | |
| `src/command-arg-projection.cts` | `parseNamedArgs` / `parseMultiwordArg` — arg parsing for the CLI | used by `gsd-tools.cjs` |
| `src/cli-exit.cts` | `ExitError` / `runMain` — structured CLI exit | |
| `src/clock.cts`, `semver-compare.cts`, `secrets.cts`, `schema-detect.cts` | time, version compare, secret handling, schema detection | leaf utilities |

## How it connects

- **Consumed via `gsd-tools.cjs`** `require('./lib/core.cjs')` (Site 0) — `core` is the reason
  knip reports 45 false "unused files." It is live on every invocation.
- `core` imports config-schema, configuration, model-catalog (E7), model-profiles (E7),
  planning-workspace (E2), project-root, runtime-homes (E6), shell-command-projection,
  worktree-safety — it sits at the graph center (depcruise confirms fan-out 9).
- **Error contract:** other clusters import `error` + `ERROR_REASON` from `core.cts` and call
  `error(msg, ERROR_REASON.XXX)` to terminate with structured JSON + `process.exit(1)`.

## What a newcomer must know

- `core.cts` is huge (2,054 LOC, one function at complexity 108) — **do not** add to it
  casually; it is the top hotspot Phase 12/13 will scrutinise.
- Never shell out directly — go through `shell-command-projection.cts` so the call stays testable
  (the test suite mocks this seam; raw `child_process` will fail the projection contract).
- A defect here is **all-16-runtime blast radius** by default — tag findings accordingly.
