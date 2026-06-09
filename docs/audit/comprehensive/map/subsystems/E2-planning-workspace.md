> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# E2 — Planning workspace & workstreams

> **Engine cluster** (`src/*.cts`) · reviewer doc (DOC-01) · derived 2026-06-08 from live code.
> **Source of truth:** `src/*.cts` — never the compiled `gsd-core/bin/lib/*.cjs`.

## Purpose

Owns the **`.planning/` directory itself**: where it is, how paths inside it resolve, how
parallel **workstreams** (named planning contexts) are routed and isolated, and the file
**locking** that keeps concurrent operations from corrupting state. Everything in E3 (artifact
CRUD) writes *through* E2's path resolution.

## Key files (7 modules)

| File | Role | Notes |
|------|------|-------|
| `src/planning-workspace.cts` | `.planning/` path resolution, workstream routing, file locking | Fan-in **17** (3rd-highest seam). Holds `_heldPlanningLocks` Set at **module scope** for exit-cleanup. |
| `src/active-workstream-store.cts` | the session-scoped active-workstream pointer (`resolveActiveWorkstream`, `applyResolvedWorkstreamEnv`) | **module-scope global state** — not graph-visible |
| `src/workstream.cts` | workstream operations (list/create/switch/status) | churn 15 |
| `src/workstream-inventory.cts`, `workstream-inventory-builder.cts` | enumerate the workstreams present | |
| `src/workstream-name-policy.cts` | validate/normalise workstream names | |
| `src/worktree-base-ref.cts` | base-ref helper for worktree-scoped workstreams | partners `worktree-safety.cts` (E1-adjacent) |

## How it connects

- **Below it:** depends on E1 (`core`, `shell-command-projection`, `project-root`).
- **Above it:** E3 (state/phase/roadmap) and the E9 aggregators (`init`) call into it for every
  `.planning/` read/write. `gsd-tools.cjs` requires `planning-workspace` + `active-workstream-store`
  directly (`:181-182`) so the active workstream is resolved before any family dispatch.
- Routing is **config/env-driven** (active-workstream pointer), so the import graph does not show
  which workstream a call lands in — behavior, not edges.

## What a newcomer must know

- Two pieces of **module-scope global state** live here: `_heldPlanningLocks` (lock cleanup on
  exit) and the active-workstream pointer. Treat these as singletons — do not assume a fresh
  state per call.
- A bare `.planning/STATE.md` and a `.planning/<ws>/STATE.md` can both exist; the active
  workstream decides which one a command sees. When debugging "wrong file edited," check the
  active-workstream pointer first.
- File locking is real — long-held locks block concurrent GSD commands. The cleanup is wired to
  process exit; a hard kill can leave a stale lock.