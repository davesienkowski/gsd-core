> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# E11 — Security / safety / supply-chain / budget (cross-cutting guards)

> **Engine cluster** (`src/*.cts`) · reviewer doc (DOC-01) · derived 2026-06-08 from live code.
> **Source of truth:** `src/*.cts` — never the compiled `gsd-core/bin/lib/*.cjs`.

## Purpose

The **cross-cutting guards** invoked from entry points and hooks rather than from the engine
core: secret scanning, prompt-injection / package-legitimacy / UI-safety gates, prompt-budget
accounting, code-review flags, the fallow static-analysis runner — plus the **observability
trio** (event/logger/redaction) the routing hub leans on.

## Key files (11 modules, incl. 3 observability)

| File | Role | Notes |
|------|------|-------|
| `src/security.cts` | secret scanning, `safeJsonParse`, prompt-injection helpers | Fan-in **6**. **Hotspot #19** |
| `src/package-legitimacy.cts` | supply-chain / package-legitimacy gate | orphan (entry-point invoked) |
| `src/ui-safety-gate.cts` | the UI-safety gate (detects UI work in phase text) | also exists as the lone hand-written `gsd-core/bin/lib/ui-safety-gate.cjs` (subsystem #2/#3); the plan-phase workflow pipes phase text through it (`:635`) |
| `src/prompt-budget.cts` | prompt/token budget accounting | orphan (entry-point invoked) |
| `src/code-review-flags.cts` | code-review flag computation | |
| `src/fallow-runner.cts` | invoke the optional `fallow` static-analysis binary | |
| `src/profile-pipeline.cts` | the **usage-mining reducer** repurposed by the audit (Phase 1/11) | invoked out-of-band, not in the request path |
| `src/observability/event.cts`, `logger.cts`, `redaction.cts` | structured event/log emission + secret redaction | `command-routing-hub` depends on event+logger |

## How it connects

- **Invoked from the edges, not the core:** most of these are called by entry points (`gsd-tools.cjs`,
  `bin/install.js`) and **hooks**, not from the engine clusters — which is why they show as
  orphans / low-fan in depcruise (cross-cutting guards, not graph hubs).
- **Observability:** the no-throw routing hub (E4) emits via `observability/event` + `logger`;
  `redaction` keeps secrets out of logs.
- `ui-safety-gate` is dual-existing: the `.cts` source and a hand-written `.cjs` the workflow
  resolves as a standalone helper.

## What a newcomer must know

- **These are false orphans (entry-point/hook-invoked).** `package-legitimacy`, `prompt-budget`,
  `code-review-flags`, `fallow-runner`, `profile-pipeline` look unused to the graph but are live
  on the install / hook / audit paths — check before calling any dead.
- `profile-pipeline.cts` is the engine module **the audit itself reuses** for usage mining — it
  is not part of the runtime request path.
- Secrets must never reach logs — route log output through `observability/redaction`; the
  `secrets`/`security` modules are the canonical scrubbers.
- `fallow` is **optional** (`npm i -D fallow` or `cargo install fallow`) — `fallow-runner` must
  degrade gracefully when the binary is absent.