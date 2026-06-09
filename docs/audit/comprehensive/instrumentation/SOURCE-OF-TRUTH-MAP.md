# Source-of-Truth Map — `src/*.cts` → `gsd-core/bin/lib/*.cjs`

**Requirement:** METHOD-02 (Deliverable 1) · **Decision:** D-03 · **Authority:** `tsconfig.build.json` (ADR-457)
**Derived:** 2026-06-08 from a clean `tsc -p tsconfig.build.json` build (**0 errors**) + `git ls-files` + `git check-ignore`.

## Why this exists

GSD-Core is **build-at-publish** (ADR-457). The TypeScript sources under `src/*.cts`
are the **source of truth**; `tsc` compiles them to `.cjs` artifacts under
`gsd-core/bin/lib/`, which are **gitignored**. Any later audit finding that

- cites a `gsd-core/bin/lib/*.cjs` file as "source," or
- counts a `src/foo.cts` ↔ `gsd-core/bin/lib/foo.cjs` pair as "duplication,"

is **invalid by construction**. This map is the authority every downstream phase
checks against. **Audit on `.cts`. Never on the compiled `.cjs`.**

## The compile

`tsconfig.build.json`:
```
rootDir: src   outDir: gsd-core/bin/lib   include: ["src/**/*.cts"]
module/moduleResolution: nodenext   target: ES2022   noEmitOnError: true
```
Because sources use the `.cts` extension, `tsc` emits `.cjs` natively. The build
script chain is `generate:identity → build:lib (tsc) → build:hooks`.

**Cross-import convention (load-bearing for the graph tools):** a `src/*.cts` module
imports a sibling migrated module with the **`.cjs`** specifier, e.g.
`require('./core.cjs')` / `import core = require('./core.cjs')`. Under nodenext, `tsc`
resolves that specifier to `src/core.cts` at build time. **Consequence:** a graph tool
pointed at `src/` that does not resolve `.cjs → .cts` (e.g. madge) sees these imports
as external and reports every module as an orphan. dependency-cruiser with
`tsConfig: tsconfig.build.json` + `extensions:['.cts','.cjs',...]` resolves them
correctly (94 modules, 176 edges, vs madge's 0 edges / 88 false orphans).

## Counts (this build)

| Bucket | Count |
|--------|-------|
| `src/**/*.cts` total | **96** |
| &nbsp;&nbsp;— top-level **emitting** `.cts` | 88 |
| &nbsp;&nbsp;— top-level declaration (`package-identity.d.cts`, emits nothing) | 1 |
| &nbsp;&nbsp;— `src/installer-migrations/*.cts` | 4 |
| &nbsp;&nbsp;— `src/observability/*.cts` | 3 |
| Compiled `.cjs` under `gsd-core/bin/lib/` | **99** (88 root + 4 migrations + 3 observability + 4 non-`src/`) |
| `.gitignore` lines enumerating compiled `.cjs` | **95** (one per emitting source: 88+4+3) |

> Note: the context doc and the M1 configs say "83 files." That figure is **stale** —
> the live source tree is 88 emitting top-level `.cts` (96 `.cts` all-in). Configs in
> this folder are scoped by glob (`src/**/*.cts`), so they track the live count.

## The 1:1 mapping (verified complete — 0 missing outputs)

Every emitting `src/<name>.cts` → `gsd-core/bin/lib/<name>.cjs`, same basename,
same relative subpath:

- **88 top-level:** `src/<name>.cts` → `gsd-core/bin/lib/<name>.cts`'s `.cjs`
  (e.g. `src/core.cts` → `gsd-core/bin/lib/core.cjs`; `src/state.cts` →
  `…/state.cjs`; all 11 `*-command-router.cts`; `command-routing-hub`,
  `cjs-command-router-adapter`, `runtime-artifact-layout`, `runtime-homes`,
  `runtime-slash`, `installer-migrations`, etc.).
- **4 migrations:** `src/installer-migrations/00N-*.cts` →
  `gsd-core/bin/lib/installer-migrations/00N-*.cjs`.
- **3 observability:** `src/observability/{event,logger,redaction}.cts` →
  `gsd-core/bin/lib/observability/*.cjs`.

The full machine-checkable basename list is implicit: it is exactly the set of
`src/**/*.cts` minus `*.d.cts`. A verification loop confirmed **0 emitting sources
without a corresponding `.cjs`**.

## The 4 EXTRA `.cjs` in `bin/lib/` that have NO `src/*.cts` source

These must NOT be mistaken for compiled source — and must NOT be audited as if they
were build artifacts of `src/`:

| File | Origin | Tracked? | Audit treatment |
|------|--------|----------|-----------------|
| `gsd-core/bin/lib/package-identity.cjs` | **Generated** by `scripts/generate-package-identity.cjs` from `package.json` (issue #498). Has a `src/package-identity.d.cts` **type declaration only** (emits nothing). | **git-tracked** | Generated artifact. Do not audit as source; do not count its `.d.cts` as a duplicate. Edits go to the generator + `package.json`. |
| `gsd-core/bin/lib/legacy-cleanup.cjs` | **Hand-written**, not yet migrated to `src/`. No `.cts` source. | **git-tracked** | Hand-written engine code, but in the OLD location. It is *real source* until ADR-457 migrates it. Audit the `.cjs` directly here (it IS the source). Flag as a migration-backlog item, not duplication. |
| `gsd-core/bin/lib/edge-probe.cjs` | Hand-written, **in-flight feature** (`feat/non-inferable-pipeline` branch, dated Jun 5). No `.cts` source. | **untracked + un-gitignored** (working-tree only) | Branch-local, not mainline. Exclude from comprehensive findings unless the audit explicitly scopes the edge-probe feature. |
| `gsd-core/bin/lib/probe-core.cjs` | Same as `edge-probe.cjs` (its shared core). | **untracked + un-gitignored** | Same — branch-local, exclude from mainline findings. |

Also note the two hand-written tracked entry/util `.cjs` **outside `bin/lib/`** that
have no `src/` source: `gsd-core/bin/gsd-tools.cjs` (the CLI engine entry, 81 KB),
`gsd-core/bin/check-latest-version.cjs`, `gsd-core/bin/verify-reapply-patches.cjs`.
**`gsd-tools.cjs` is the single most important non-`src/` file** — it is the runtime
entry point that `require('./lib/<name>.cjs')`s the 45 migrated engine modules. It is
the reason knip pointed at `src/` reports 45 false "unused files" (see
`DYNAMIC-INDIRECTION.md`).

## `.gitignore` shape (a maintenance fact for Phase 12)

The compiled outputs are **enumerated one-per-line** in `.gitignore` (95 explicit
`/gsd-core/bin/lib/*.cjs` entries), not covered by a blanket `bin/lib/*.cjs` glob.
Each ADR-457 migration must add its emitted `.cjs` to this list by hand. This is a
drift surface (a migrated module whose `.cjs` is forgotten in `.gitignore` would get
committed). Candidate maintainability finding for Phase 12 — recorded here as an
observation, not asserted as a defect.
