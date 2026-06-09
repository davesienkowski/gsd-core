> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# Installer — `bin/install.js`

> **Non-engine subsystem** · reviewer doc (DOC-01) · derived 2026-06-08 from live code.

## Purpose

The **deployment entry point**: `npx @opengsd/gsd-core --<runtime>` runs this to copy the GSD
payload into a runtime's config home, register slash-commands, inject hooks, and run migrations.
It is also a worked example of the audit's biggest maintainability lead: a **single 12,727-LOC
`.js` file**.

## Key files (2)

| File | Role | Notes |
|------|------|-------|
| `bin/install.js` | the whole installer — runtime detection, payload staging, skill/agent/command install, hook injection, migration invocation, slash-command registration, converter functions | **12,727 LOC, one file.** `.js` (not `.cts`) → **outside the `src/` complexity scan**, so it has no complexity metric — but it is plausibly the **largest single change-cost surface in the repo**. |
| `bin/lib/ui-safety-gate.cjs` | the one **hand-written** `.cjs` (not compiled from `src/`) | a standalone gate helper the plan-phase workflow pipes phase text through |

## How it connects

- **Calls the engine** for per-runtime decisions: `runtime-homes.cts` (config dir), 
  `runtime-artifact-layout.cts` (layout), `runtime-slash.cts` (slash form), `install-profiles.cts`
  (surface budget), `installer-migrations.cts` (the migration runner).
- **The engine calls back into it (the bidirectional edge):** `runtime-artifact-layout.cts:51`
  does `_require('../../../bin/install.js')` to get **converter functions**, invoked by string
  name (`installExports[converterName]`). This edge is a **lazy require inside a function and is
  invisible to depcruise** (PIPELINE-TRACE §5, finding #4).
- **Makes the `@~/` paths resolve:** by copying `gsd-core/` into the runtime's home, it is what
  turns `@~/.claude/gsd-core/…` at-includes into real file reads at runtime (PIPELINE-TRACE §3).

## What a newcomer must know

- **It is a monolith with no complexity metric.** Do not read its absence from HOTSPOTS as "low
  risk" — it's absent because the complexity tool only scans `src/*.cts`. Any change here is
  high-blast-radius (it stages *every* runtime).
- The installer↔engine coupling is **bidirectional** — changing converter signatures in
  `install.js` can break `runtime-artifact-layout.cts`, and vice versa. They are not a clean
  one-way dependency.
- It runs **migrations** on every install (idempotent); a fresh install and an upgrade both flow
  through the same path. See E5 for the migration units.
- `ui-safety-gate.cjs` is the **only** hand-written `.cjs` outside the compiled set — it is not
  generated from `src/`, so edit it directly (unlike the gitignored `bin/lib/*.cjs`).