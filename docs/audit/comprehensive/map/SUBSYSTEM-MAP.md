> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# Subsystem Map — GSD-Core (fresh re-derivation)

> **Requirement:** MAP-01 (Phase 8) · **Mode:** audit-and-plan only (no code changed)
> **Derived:** 2026-06-08 from **live code** (`git ls-files`, `src/*.cts`, the prompt corpus)
> and the Phase 7 instrumentation reports — **not** the prior `.planning/codebase/*` map
> (firewalled until Phase 16, per the charter).
> **Source-of-truth rule (charter §0):** the engine is `src/*.cts`. The compiled
> `gsd-core/bin/lib/*.cjs` is gitignored build output and is **never** the citation target.

This is the boundary atlas the deep sweeps tag findings against (`subsystem:` field, charter
§2.2). It maps **every** subsystem of the full repo, splits the ~88-module engine into
functional clusters (so no single work-unit owns the whole engine), and cross-checks each
boundary against `DYNAMIC-INDIRECTION.md` because in this codebase **the import graph is not
the whole wiring** — entry points, migration loaders, runtime `switch` tables, string-keyed
routers, and string-path corpus reads carry behavior the static graph can't see.

---

## 0. Repo-level subsystem inventory (the top-level partition)

| # | Subsystem | Live location | Count | What it is |
|---|-----------|---------------|-------|------------|
| 1 | **Engine** | `src/*.cts` (+ `src/installer-migrations/`, `src/observability/`) | 95 modules (88 emitting top-level + 4 migrations + 3 observability) | The CommonJS state/CLI engine — all stateful `.planning/` operations, routing, install logic. Source of truth; compiled to gitignored `gsd-core/bin/lib/*.cjs`. |
| 2 | **CLI entry + shared data** | `gsd-core/bin/` (non-`lib/`) | 7 files | `gsd-tools.cjs` (1,928 LOC entry that `require`s the engine), `check-latest-version.cjs`, `verify-reapply-patches.cjs`, and `bin/shared/*.{json,manifest.json}` (model catalog, config/runtime-alias manifests). |
| 3 | **Installer** | `bin/install.js` (+ `bin/lib/ui-safety-gate.cjs`) | 2 files | The deployment monolith — **12,727 LOC** single file. Detects runtime, stages skills/agents/commands, injects hooks, runs migrations. The engine reaches back into it (`runtime-artifact-layout.cts:51 require('../../../bin/install.js')`). |
| 4 | **Workflows** | `gsd-core/workflows/*.md` (+ 3 subdirs) | 108 files | Markdown-as-code orchestration the AI runtime executes; embed bash shims that call `gsd-tools.cjs`. |
| 5 | **References** | `gsd-core/references/*` (+ `few-shot-examples/`) | 69 files | Reusable guidance docs loaded by workflows/agents as context (gates taxonomy, contracts, TDD rules). |
| 6 | **Templates** | `gsd-core/templates/*` | 46 files | Scaffolding for `.planning/` artifacts (PROJECT/REQUIREMENTS/ROADMAP/STATE/PLAN/SUMMARY shapes). |
| 7 | **Contexts** | `gsd-core/contexts/*.md` | 3 files | `dev.md`, `research.md`, `review.md` — mode contexts. |
| 8 | **Agents** | `agents/gsd-*.md` | 33 files | Subagent role definitions (frontmatter: name/description/tools/color + `<role>`). |
| 9 | **Skills / Commands** | `commands/gsd/*.md` | 67 files | Thin slash-command wrappers (`/gsd-<cmd>`) installed into each runtime's skills/commands dir. |
| 10 | **Hooks** | `hooks/*` (excl. `dist/`) | 21 files | Runtime lifecycle hooks (JS + bash): session-state, context-monitor, prompt/read/workflow guards, statusline, update-banner. |
| 11 | **Tests** | `tests/*` | 721 files (664 `*.test.cjs`) | Node built-in test runner suites + fast-check property tests, against the engine. |
| 12 | **Scripts** | `scripts/*` | 58 files | Lint/check/build/CI helpers (skill-deps, descriptions, alias-drift, identity-drift, changeset, build-hooks, generate-identity). |
| 13 | **ESLint custom rules** | `eslint-rules/*.cjs` | 4 files | `no-source-grep`, `no-magic-sleep-in-tests`, `no-elapsed-assertion`, `no-raw-rmsync-in-tests`. |
| 14 | **Assets** | `assets/*` | 5 files | Static assets. |
| 15 | **SDK** | `sdk/` | **0 files — RETIRED** | The TypeScript SDK subtree was **removed** (commit `11918dcc` "retire sdk package seam"; `4fa13cf9`, `4c92aacc`). `vitest.config.ts` still points `root: './sdk'` — a **stale orphaned config** (Phase 10 lead, see §3). D-02/CLAUDE.md list SDK as a subsystem; live code shows it no longer exists. |

> **D-02 reconciliation:** the phase context lists "SDK (`sdk/`)" as a subsystem to map.
> Live re-derivation shows it was retired; this map records that fact rather than mapping a
> non-existent tree. The only surviving SDK footprint is the dangling `vitest.config.ts`.

---

## 1. The engine, sub-split by functional cluster

The engine is **95 modules**. Clustering is derived from the resolved import graph in
`reports/depcruise.json` (94 modules / 176 edges) — fan-in (most depended-upon), fan-out
(most dependencies), and shared dependency targets — **not** guesswork. Every emitting module
is assigned to exactly **one** cluster below (coverage verified: 95/95).

**Graph signal that drives the clustering** (`depcruise.json`):
- **Top fan-in (the load-bearing seams):** `shell-command-projection` (29), `core` (24),
  `planning-workspace` (17), `frontmatter` (11), `runtime-slash` (10),
  `cjs-command-router-adapter` (7), `command-aliases` (7), `security` (6).
- **Top fan-out (the orchestrators):** `init` (11), `verify` (11), `core` (9), `commands` (9),
  `state` (8), `config` (8), `phase` (7).
- **Dependency-cruiser orphans (13):** all verified live in `DYNAMIC-INDIRECTION.md` — they
  are reached by out-of-`src/` entry points, the migration loader, or string dispatch.

### Cluster E1 — Foundation / shared utilities *(highest fan-in; the seam every cluster leans on)*
**Role:** project-root resolution, config loading, model resolution, git/shell projection,
the command-projection seam. Cutting or breaking these has the widest blast radius.
**Modules (12):** `core`, `shell-command-projection`, `configuration`, `config-schema`,
`config-types`, `project-root`, `clock`, `command-arg-projection`, `cli-exit`,
`semver-compare`, `secrets`, `schema-detect`.
**Graph signal:** `shell-command-projection` fan-in 29 (the single most depended-upon module);
`core` fan-in 24 / fan-out 9 (both a hub and an orchestrator). `core` imports config-schema,
configuration, model-catalog, model-profiles, planning-workspace, project-root, runtime-homes,
shell-command-projection, worktree-safety — it sits at the center of the graph.
**Dynamic-indirection note:** `core` is consumed primarily through `gsd-tools.cjs`'s
`require('./lib/core.cjs')` (Site 0) and is the reason knip reports 45 false "unused files."

### Cluster E2 — Planning workspace & workstreams
**Role:** `.planning/` path resolution, workstream routing, file locking, active-workstream
session pointer, workstream inventory.
**Modules (7):** `planning-workspace`, `active-workstream-store`, `workstream`,
`workstream-inventory`, `workstream-inventory-builder`, `workstream-name-policy`,
`worktree-base-ref`.
**Graph signal:** `planning-workspace` fan-in 17 (3rd-highest seam); `active-workstream-store`
holds session-scoped global state; `worktree-safety` is in E1-adjacent but its base-ref helper
lives here.
**Dynamic-indirection note:** active-workstream pointer is module-scope global state (not graph-
visible); workstream routing is config/env-driven.

### Cluster E3 — State / phase / roadmap / milestone *(the artifact-lifecycle core)*
**Role:** CRUD on the `.planning/` artifacts — STATE.md, phase dirs, ROADMAP.md, milestones,
plan scanning, document shape. This is the heart of GSD's file-based memory.
**Modules (10):** `state`, `state-document`, `phase`, `phase-lifecycle`, `roadmap`,
`roadmap-upgrade`, `milestone`, `plan-scan`, `frontmatter`, `decisions`.
**Graph signal:** `state` fan-out 8, `phase` fan-out 7, `roadmap` fan-out 5; `frontmatter`
fan-in 11 (consumed across the whole artifact layer). All depend on E1+E2.
**Dynamic-indirection note:** the command functions here (`cmd*`) are reached **only** as
values in string-keyed router handler maps (Site 3) — they look unused to knip but are live.

### Cluster E4 — Command routing & dispatch
**Role:** the no-throw routing hub, the CJS router adapter, the 11 per-family command routers,
and the alias tables that key dispatch.
**Modules (15):** `command-routing-hub`, `cjs-command-router-adapter`, `command-aliases`,
`state-command-router`, `verify-command-router`, `verification-command-router`,
`phase-command-router`, `phases-command-router`, `roadmap-command-router`,
`init-command-router`, `check-command-router`, `validate-command-router`,
`task-command-router`, `agent-command-router`, `context-utilization`.
**Graph signal:** `cjs-command-router-adapter` fan-in 7, `command-aliases` fan-in 7; the routers
are thin (low complexity) and fan out to the engine clusters they front.
**Dynamic-indirection note (Site 3, critical):** dispatch is **string-keyed**
(`familyHandlers[subcommand]`, `Object.fromEntries(handlers)`); the top-level
`switch (command)` lives in `gsd-tools.cjs:524+` **outside `src/`**. Router→engine wiring is
mostly invisible to "is this export referenced?" analysis.

### Cluster E5 — Installer support & migrations
**Role:** the versioned migration runner, migration authoring/reporting, and the four migration
units the `readdirSync` loader discovers at runtime.
**Modules (7):** `installer-migrations`, `installer-migration-authoring`,
`installer-migration-report`, `installer-migrations/000-first-time-baseline`,
`installer-migrations/001-legacy-orphan-files`,
`installer-migrations/002-codex-legacy-hooks-json`,
`installer-migrations/003-rename-get-shit-done-to-gsd-core`.
**Graph signal:** `installer-migrations/000` & `001` show as dependency-cruiser **orphans** —
false positives.
**Dynamic-indirection note (Site 1):** migration units are loaded by **string path at
runtime** (`fs.readdirSync(migrationsDir)` → `require(source)`), never statically imported.
Any "orphan" here is live by definition. Note: the engine also reaches the installer monolith
(`bin/install.js`) — the cluster's true partner lives in subsystem #3, not in `src/`.

### Cluster E6 — Runtime layout / homes / slash / install-profiles *(the 16-runtime surface)*
**Role:** map each of 16 runtimes to its config dir, artifact layout, slash form, and skill
surface budget. Highest **churn** cluster (see HOTSPOTS).
**Modules (8):** `runtime-artifact-layout`, `runtime-homes`, `runtime-slash`,
`runtime-name-policy`, `runtime-config-adapter-registry`, `install-profiles`, `surface`,
`clusters`.
**Graph signal:** `runtime-slash` fan-in 10; `install-profiles` fan-in from `surface` +
`runtime-artifact-layout`. `runtime-config-adapter-registry` shows as orphan (false: consumed
by the installer).
**Dynamic-indirection note (Site 2, critical):** the per-runtime behavior is selected by a
`switch (runtime)` with 15 layout arms / 16 homes arms keyed on a **runtime string**, and
converter functions are invoked **by string name** (`installExports[converterName]`). See
`RUNTIME-DIVERGENCE-MATRIX.md` — any finding here MUST carry a runtime blast-radius tag.

### Cluster E7 — Model catalog & profiles
**Role:** agent→model-tier resolution (quality/balanced/budget), profile shapes.
**Modules (3):** `model-catalog`, `model-profiles`, `profile-output`.
**Graph signal:** `model-catalog` fan-in 3; `profile-output` fan-out 5 (renders profile state).
Data lives in `gsd-core/bin/shared/model-catalog.json` (subsystem #2), read by `model-catalog`.
**Dynamic-indirection note:** model catalog path is env-overridable (`GSD_MODEL_CATALOG`).

### Cluster E8 — Verification / validation / drift / audit
**Role:** plan-structure checks, artifact validation, structural drift detection, retroactive
audit. The "is the work actually done / has the codebase drifted" lens.
**Modules (8):** `verify`, `verification`, `validate`, `drift`, `audit`, `artifacts`,
`uat`, `gap-checker`.
**Graph signal:** `verify` fan-out 11 (ties `init` for most dependencies); contains the single
**hottest function** in the engine — `verify.cts` maxFunctionComplexity **150** (see HOTSPOTS,
flagged separately because the churn×complexity product under-ranks a low-churn / hot-function
file).
**Dynamic-indirection note:** verify/validate command functions reached via E4 string dispatch.

### Cluster E9 — Compound context aggregators & commands surface
**Role:** the big "assemble everything a workflow needs" aggregators and the command-surface
builder. High fan-out, low fan-in (they sit at the top, pulling many clusters together).
**Modules (4):** `init`, `commands`, `config`, `template`.
**Graph signal:** `init` fan-out 11, `commands` fan-out 9, `config` fan-out 8 — three of the
top-four fan-out modules. `init` imports commands/core/frontmatter/plan-scan/planning-workspace/
runtime-homes/runtime-slash/secrets/security/shell-command-projection/state-document.
**Dynamic-indirection note:** these are entered from `gsd-tools.cjs` family handlers (Site 0/3).

### Cluster E10 — Content / docs / intel / learnings / research / graphify
**Role:** higher-level content operations — docs generation, codebase intel, learning
extraction, research provider/store, graphify, gsd2 import, ADR parsing, decisions.
**Modules (10):** `docs`, `intel`, `learnings`, `graphify`, `gsd2-import`, `adr-parser`,
`research-provider`, `research-store`, `update-context`, `review-reviewer-selection`.
**Graph signal:** mostly leaf-ish (read corpus / emit docs); `update-context` &
`review-reviewer-selection` show as orphans (false: out-of-`src/` entry consumers).
**Dynamic-indirection note (Site 4):** these read the prompt corpus **by string path**
(workflows/references/agents `.md`), so their real inputs are invisible to the import graph.

### Cluster E11 — Security / safety / supply-chain / budget *(cross-cutting guards)*
**Role:** secret scanning, prompt-injection / package-legitimacy / UI-safety gates, prompt
budget, code-review flags, fallow static-analysis runner.
**Modules (8):** `security`, `package-legitimacy`, `ui-safety-gate`, `prompt-budget`,
`code-review-flags`, `fallow-runner`, `profile-pipeline`, plus the **observability** trio
`observability/event`, `observability/logger`, `observability/redaction`.
**Graph signal:** `security` fan-in 6; `package-legitimacy`, `ui-safety-gate`, `prompt-budget`,
`code-review-flags`, `fallow-runner`, `profile-pipeline` show as orphans/low-fan (cross-cutting
guards invoked from entry points / hooks, not from the engine core). `command-routing-hub`
depends on `observability/event` + `logger`.
**Dynamic-indirection note:** `profile-pipeline` is the usage-mining reducer repurposed by the
audit (Phase 1/11) — invoked out-of-band, not in the request path. `ui-safety-gate` also exists
as the one hand-written `bin/lib/ui-safety-gate.cjs` (subsystem #3).

> **Cluster coverage check:** E1(12)+E2(7)+E3(10)+E4(15)+E5(7)+E6(8)+E7(3)+E8(8)+E9(4)+
> E10(10)+E11(11 incl. 3 observability) = **95 modules** — every emitting `src/*.cts` is
> assigned to exactly one cluster.

---

## 2. Non-engine subsystem boundaries & responsibilities

### Installer (`bin/install.js`, subsystem #3)
- **Boundary:** a **single 12,727-LOC file** plus the lone hand-written `bin/lib/ui-safety-gate.cjs`.
- **Responsibility:** runtime detection, payload staging (skills/agents/commands per runtime),
  hook injection, migration invocation, slash-command registration.
- **Cross-check:** the engine imports *back* into it — `runtime-artifact-layout.cts:51`
  `require('../../../bin/install.js')` for converter functions. This is a **bidirectional
  boundary**: installer↔engine is not a clean one-way dependency (a structural-decay /
  change-cost lead for Phase 12). The 12.7k-LOC monolith is itself a maintainability hotspot
  the complexity tool does not cover (it is `.js`, outside the `src/*.cts` complexity scan).

### CLI entry + shared data (`gsd-core/bin/`, subsystem #2)
- **Boundary:** `gsd-tools.cjs` (1,928 LOC) is the **single CLI entry** that `require`s the
  45 migrated engine modules and holds the top-level `switch (command)` family dispatch
  (`:524+`). `bin/shared/*.json` are data manifests the engine reads.
- **Responsibility:** route every `gsd-tools <family> <sub>` invocation to an E4 router.
- **Cross-check (Site 0):** this file is the master indirection — it is why every `src/`-scoped
  dead-code result is suspect. It is **not** in `src/` and **not** complexity-scanned.

### Workflows (`gsd-core/workflows/`, 108 files)
- **Boundary:** markdown documents the AI runtime executes as instructions; the largest single
  prompt-corpus surface. Three subdirs (`discuss-phase/`, `execute-phase/`, `help/`).
- **Responsibility:** orchestrate each GSD operation; issue bash shims that call `gsd-tools.cjs`.
- **Cross-check (Site 4):** loaded by **string path** by E9/E10 aggregators and surfaced into
  runtime prompts by the installer — a workflow with no static inbound edge is **not** dead.

### References (`gsd-core/references/`, 69 files) & Contexts (3 files)
- **Boundary:** pure-documentation context (gates taxonomy, agent contracts, TDD rules,
  edge-probe fixtures, `few-shot-examples/`). Contexts are 3 mode files.
- **Responsibility:** loaded by workflows/agents via `@~/.claude/gsd-core/references/...` at-paths.
- **Cross-check (Site 4):** at-path / string-path referenced — orphan ≠ dead.

### Templates (`gsd-core/templates/`, 46 files)
- **Boundary:** scaffolding shapes for `.planning/` artifacts.
- **Responsibility:** consumed by `template.cts` (E9) which reads them by path.

### Agents (`agents/gsd-*.md`, 33 files)
- **Boundary:** subagent role definitions (frontmatter + `<role>` + inline at-refs).
- **Responsibility:** spawned by orchestrating workflows via `Agent(subagent_type="gsd-...")`.
- **Cross-check:** installed by `bin/install.js` into each runtime's agents dir; referenced by
  name (string) from workflows.

### Skills / Commands (`commands/gsd/*.md`, 67 files)
- **Boundary:** thin slash-command wrappers (frontmatter + objective).
- **Responsibility:** register `/gsd-<cmd>` (or `$gsd-<cmd>` for codex) in the runtime.
- **Cross-check (RUNTIME-DIVERGENCE-MATRIX):** installed differently per runtime — skills vs
  commands vs converted-commands, with hermes (nested `skills/gsd/`) and kilo (HOME-relative
  skills) as special cases. Any surface finding here is **blast-radius ≥ skills-surface (12)**.

### Hooks (`hooks/`, 21 files)
- **Boundary:** runtime lifecycle hooks — JS (`gsd-prompt-guard`, `gsd-read-guard`,
  `gsd-workflow-guard`, `gsd-context-monitor`, `gsd-statusline`, `gsd-update-banner`,
  cursor session hooks) + bash (`gsd-phase-boundary`, `gsd-validate-commit`,
  `gsd-session-state`, `gsd-graphify-update`) + `hooks.json` manifest + `hooks/lib/`.
- **Responsibility:** session/context/guard behavior injected into the runtime.
- **Cross-check:** bundled to `hooks/dist/` by `scripts/build-hooks.js`; registered via
  `hooks.json`. `dist/` is build output (excluded from this map's count).

### Tests (`tests/`, 721 files; 664 `*.test.cjs`)
- **Boundary:** Node built-in test runner suites + fast-check property tests, run via
  `scripts/run-tests.cjs` with c8 coverage. Naming: `bug-/enh-/feat-NNNN-*.test.cjs`,
  `*.property.test.cjs`, `*.integration.test.cjs`.
- **Responsibility:** validate the engine. Governed by `lint-test-file-count.cjs` (max 2 test
  files per production module, ratcheted).

### Scripts (`scripts/`, 58 files) & ESLint rules (4 files)
- **Boundary:** lint/check/build/CI helpers + 4 custom AST ESLint rules.
- **Responsibility:** the lint suite (skill-deps, descriptions, alias-drift, identity-drift,
  changeset, docs-required, shared-module-handsync, pr-checks), build (`build-hooks.js`,
  `generate-package-identity.cjs`), and test runner.

### Assets (5 files) & SDK (retired, see §0/§3)

---

## 3. Boundary findings surfaced during re-derivation (leads, not scored findings)

These are **observations** from the fresh map, recorded for the relevant deep phase (not scored
evidence cards — that is Phases 10/12/13's job). Each carries a checkable pointer.

1. **`sdk/` is gone but `vitest.config.ts` still targets it.** `git ls-files sdk/` → 0 files;
   retired in `11918dcc`. `vitest.config.ts` sets `root: './sdk'` for both projects → the
   config is a **dangling orphan**. → *Phase 10 (dead config) / Phase 12 (waste).*
2. **Installer↔engine is bidirectional.** `runtime-artifact-layout.cts:51`
   `require('../../../bin/install.js')` — the engine reaches back out to the 12.7k-LOC installer.
   → *Phase 12 maintainability (coupling/change-cost).*
3. **`bin/install.js` is a 12,727-LOC monolith** outside the `src/*.cts` complexity scan, so it
   is invisible to `complexity.json`/HOTSPOTS yet is plausibly the single largest change-cost
   surface in the repo. → *Phase 12 maintainability (flagged so it isn't missed for lack of a
   metric).*
4. **`.gitignore` enumerates compiled `.cjs` one-per-line (95 entries)** rather than a glob — a
   drift surface (a forgotten migration `.cjs` would get committed). → *Phase 12 maintainability*
   (also noted in `SOURCE-OF-TRUTH-MAP.md`).
5. **Stale "83/88 files" counts.** Phase-7 configs/context cite 83; live tree is 88 emitting
   top-level (96 `.cts` all-in). This map uses the live counts.

---

## 4. How later phases use this map

- **Charter `subsystem:` field** (§2.2) draws from §0's named subsystems; an engine finding also
  carries its **cluster (E1–E11)** so a 4+ person team can route by cluster, not by 95-file list.
- **Blast-radius tagging** (charter, RUNTIME-DIVERGENCE-MATRIX): any E6 / skills / commands /
  workflows / agents finding is multi-runtime by default — never tag `none` without checking the
  matrix.
- **Dead-code guard** (Phase 10 SC-2): before any "unused" claim, run the
  `DYNAMIC-INDIRECTION.md` decision flow — most engine modules are reached via Sites 0–4, not
  the import graph. The per-cluster "Dynamic-indirection note" above is the first checkpoint.
- **Where to look first:** `HOTSPOTS.md` ranks the engine by churn × complexity; clusters E1
  (core), E3 (state/phase/roadmap), E9 (init/commands/config) own the top of that list.