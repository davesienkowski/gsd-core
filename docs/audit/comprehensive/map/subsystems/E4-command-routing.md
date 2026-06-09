> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# E4 — Command routing & dispatch

> **Engine cluster** (`src/*.cts`) · reviewer doc (DOC-01) · derived 2026-06-08 from live code.
> **Source of truth:** `src/*.cts` — never the compiled `gsd-core/bin/lib/*.cjs`.

## Purpose

The **dispatch backbone**: turns a `gsd-tools <family> <subcommand>` invocation into a call on
the right engine function. A no-throw routing hub, the CJS router adapter, 11 per-family routers,
and the alias tables that key dispatch. This is the largest cluster (15 modules) but the
individual files are thin — the complexity is in the *string-keyed* wiring, not the code.

## Key files (15 modules)

| File | Role | Notes |
|------|------|-------|
| `src/command-routing-hub.cts` | the **no-throw hub** — returns `{ ok, kind }` result objects, never throws; closed `ERROR_KINDS` enum (`:50-59`) | depends on observability/event+logger (E11) |
| `src/cjs-command-router-adapter.cts` | `routeHubCommandFamily()` builds `cjsRegistry` via `Object.fromEntries`, dispatches by string `subcommand` (`:100-124`) | Fan-in 7 |
| `src/command-aliases.cts` | family alias tables (`STATE_…`, `VERIFY_…`, `INIT_…`, `PHASE_…`, …) as `{canonical, aliases, subcommand, mutation}` | Fan-in 7; subcommand strings here are the keys routers dispatch on |
| `src/state-command-router.cts` … (11 routers: `state-`, `verify-`, `verification-`, `phase-`, `phases-`, `roadmap-`, `init-`, `check-`, `validate-`, `task-`, `agent-`) | each builds a **string-keyed `handlers` map** → engine `cmd*` functions | thin, low-complexity |
| `src/context-utilization.cts` | context-budget accounting surfaced through routing | |

## How it connects

- **Entry (Site 0/3):** `gsd-tools.cjs:524+` holds the top-level `switch (command)` *outside
  `src/`* and hands each family to its router; the router then dispatches by string subcommand.
- **Out:** routers call the engine clusters they front (E3 state/phase/roadmap, E8 verify/validate,
  E7 model, E9 init).
- **Aliases ↔ routers** must stay in sync — `scripts/check-alias-drift.cjs` enforces that the
  alias arrays match the router subcommand lists (CI guard).

## What a newcomer must know

- **This is Site 3 of dynamic indirection.** The router→engine link is `handlers['<sub>'] =
  engine.cmdX` — invisible to "is this export referenced?" tools. Never call a `cmd*` "dead"
  without checking the handler maps + `command-aliases.cts`.
- The hub **never throws** — if you add a handler, return a result object; an uncaught throw
  breaks the no-throw contract the workflows rely on.
- Adding a subcommand means touching three places: the router's handler map, `command-aliases.cts`,
  and (often) the `gsd-tools.cjs` switch — and `check-alias-drift.cjs` will fail CI if they drift.