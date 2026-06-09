# E5 — Installer support & migrations

> **Engine cluster** (`src/*.cts`) · reviewer doc (DOC-01) · derived 2026-06-08 from live code.
> **Source of truth:** `src/*.cts` — never the compiled `gsd-core/bin/lib/*.cjs`.

## Purpose

The **versioned migration runner** that fires on every install, plus the authoring/reporting
helpers and the four migration units the runner discovers at runtime. Migrations make installs
idempotent and let an upgrade clean up artifacts a prior version left behind (legacy hooks,
renamed dirs, orphan files).

## Key files (7 modules)

| File | Role | Notes |
|------|------|-------|
| `src/installer-migrations.cts` | the runner — `discoverInstallerMigrations()` (`:268-283`) does `fs.readdirSync` → `require(source)` each `.cjs` migration | **Hotspot #8** |
| `src/installer-migration-authoring.cts` | helpers for writing a migration | |
| `src/installer-migration-report.cts` | per-migration result reporting | **Hotspot #17** |
| `src/installer-migrations/000-first-time-baseline.cts` | baseline migration | `export = migration` |
| `src/installer-migrations/001-legacy-orphan-files.cts` | remove legacy orphan files | |
| `src/installer-migrations/002-codex-legacy-hooks-json.cts` | fix legacy Codex hooks.json | |
| `src/installer-migrations/003-rename-get-shit-done-to-gsd-core.cts` | the #604 dir rename | |

## How it connects

- **Loaded by string path (Site 1):** `discoverInstallerMigrations()` reads the migrations dir,
  filters `.cjs`, sorts, and `require()`s each — the units are **never statically imported**.
- **Invoked by the installer:** `bin/install.js` calls the runner during install. The cluster's
  true partner lives in subsystem **#3 (the installer monolith)**, not in `src/`.

## What a newcomer must know

- **The migration units are false orphans.** depcruise flags `000`/`001` as orphans and knip
  lists all four as unused `default` exports — both wrong (Site 1). Any
  `src/installer-migrations/*.cts` is **live by definition** — the loader discovers it. Never
  call one dead.
- Migrations are **ordered by filename** (the `.sort()`) — the `NNN-` numeric prefix is the run
  order. Add a new one with the next number.
- Each migration is wrapped so one failure logs and continues — a failed migration does **not**
  abort the install (charter: "one failed migration does not abort install").
- Migration units `export = migration` (single default) — the one place in the engine that
  deviates from the named-exports convention, because the loader expects a default.
