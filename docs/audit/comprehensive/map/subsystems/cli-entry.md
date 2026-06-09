> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# CLI entry + shared data — `gsd-core/bin/`

> **Non-engine subsystem** (#2) · reviewer doc (DOC-01) · derived 2026-06-08 from live code.

## Purpose

The **single CLI entry** the workflows shell into, plus the JSON/manifest data the engine reads.
Every `gsd_run <family> <sub>` line in a workflow ends up as `node gsd-tools.cjs <family> <sub>`,
and `gsd-tools.cjs` is the master indirection point: it `require`s the compiled engine and holds
the top-level family `switch`.

## Key files (7)

| File | Role | Notes |
|------|------|-------|
| `gsd-core/bin/gsd-tools.cjs` | the CLI entry — `require('./lib/<name>.cjs')` × **45** (`:173-211`), the `switch (command)` family dispatch (`:524+`), the `query` meta-prefix (`:344-346`) | **1,928 LOC, `.cjs` → outside the complexity scan.** This is **Site 0** of dynamic indirection — the true entry point lives outside `src/`. |
| `gsd-core/bin/check-latest-version.cjs` | version check | |
| `gsd-core/bin/verify-reapply-patches.cjs` | patch reapply verification | |
| `gsd-core/bin/shared/model-catalog.json` | the agent→model-tier catalog | read by `model-catalog.cts` (E7); path env-overridable via `GSD_MODEL_CATALOG` |
| `gsd-core/bin/shared/*.manifest.json` | config / runtime-alias manifests | data the engine reads |

## How it connects

- **In:** invoked by workflow bash shims (the §1.1 shim in every workflow) and available as
  `gsd-tools` on PATH after install.
- **Down:** `require`s the 45 compiled engine modules and dispatches each family to its E4 router.
- **Data:** `bin/shared/*.json` are read by E7 (model catalog) and E1/E6 (config/runtime aliases)
  — code in `src/`, data here.

## What a newcomer must know

- **`gsd-tools.cjs` is why `src/`-scoped dead-code results are suspect.** The 45 `require('./lib/
  *.cjs')` calls are the only inbound reference for most engine modules — a tool scoped to `src/`
  never sees them and reports 45 "unused files." Always cross-check against this file's require
  list (DYNAMIC-INDIRECTION Site 0).
- It is **not in `src/` and not complexity-scanned** — like `bin/install.js`, its size/risk is
  invisible to HOTSPOTS.
- **Dead SDK breadcrumbs:** it still carries `// SDK handler: sdk/src/query/…` comments
  (`:648, :731, :803, :840`) pointing at the retired `sdk/` tree — stale pointers, a Phase-10/12
  lead (PIPELINE-TRACE §5 finding #5).
- The `query` prefix is a **meta-prefix**: `gsd-tools query <x>` and `gsd-tools <x>` resolve the
  same canonical command — workflows use the `query` form.