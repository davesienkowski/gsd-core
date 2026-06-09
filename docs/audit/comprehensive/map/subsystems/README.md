> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# Subsystem Reviewer Docs — index

> **Requirement:** DOC-01 (Phase 9) · **Mode:** audit-and-plan only · **Derived:** 2026-06-08
> **Written for a newcomer:** each doc lets you understand and work in one subsystem *without
> reading every file*. Read `../PIPELINE-TRACE.md` first for the end-to-end flow, then the doc
> for the part you'll touch.
> **Source-of-truth rule:** the engine is `src/*.cts`; never edit/cite compiled
> `gsd-core/bin/lib/*.cjs` (gitignored build output).

The repo splits into the **engine** (`src/*.cts`, sub-split into 11 functional clusters E1–E11
from the Phase-8 SUBSYSTEM-MAP so no doc owns 95 modules) and the **non-engine** subsystems
(installer, CLI entry, the markdown prompt corpus, hooks, tests, scripts).

## Engine clusters (`src/*.cts`)

| Doc | Cluster | One-line role |
|-----|---------|---------------|
| [E1-foundation.md](E1-foundation.md) | E1 Foundation / shared utils | project root, config, model resolution, shell/git projection — highest fan-in seam |
| [E2-planning-workspace.md](E2-planning-workspace.md) | E2 Planning workspace & workstreams | `.planning/` path resolution, locking, workstream routing |
| [E3-artifact-lifecycle.md](E3-artifact-lifecycle.md) | E3 State / phase / roadmap / milestone | CRUD on the `.planning/` artifacts — GSD's file-based memory |
| [E4-command-routing.md](E4-command-routing.md) | E4 Command routing & dispatch | the no-throw hub + 11 string-keyed family routers + alias tables |
| [E5-installer-migrations.md](E5-installer-migrations.md) | E5 Installer support & migrations | the `readdirSync` migration runner + 4 migration units |
| [E6-runtime-surface.md](E6-runtime-surface.md) | E6 Runtime layout / homes / slash / profiles | the 16-runtime surface — highest churn, blast-radius-heavy |
| [E7-model-catalog.md](E7-model-catalog.md) | E7 Model catalog & profiles | agent→model-tier resolution (quality/balanced/budget) |
| [E8-verification.md](E8-verification.md) | E8 Verification / validation / drift / audit | "is the work done / has the codebase drifted" — holds the hottest function |
| [E9-aggregators.md](E9-aggregators.md) | E9 Compound aggregators & command surface | `init`/`commands`/`config`/`template` — top fan-out |
| [E10-content.md](E10-content.md) | E10 Content / docs / intel / learnings / research | higher-level content ops; reads the prompt corpus by path |
| [E11-guards.md](E11-guards.md) | E11 Security / safety / supply-chain / budget | cross-cutting guards + observability trio |

## Non-engine subsystems

| Doc | Subsystem | One-line role |
|-----|-----------|---------------|
| [installer.md](installer.md) | Installer (`bin/install.js`) | the 12.7k-LOC deployment monolith |
| [cli-entry.md](cli-entry.md) | CLI entry + shared data (`gsd-core/bin/`) | `gsd-tools.cjs` entry + JSON data manifests |
| [workflows.md](workflows.md) | Workflows (`gsd-core/workflows/`) | markdown-as-code orchestration (108 files) |
| [references-contexts.md](references-contexts.md) | References & Contexts | reusable guidance docs loaded by `@~/`-include |
| [templates.md](templates.md) | Templates (`gsd-core/templates/`) | scaffolding shapes for `.planning/` artifacts |
| [agents.md](agents.md) | Agents (`agents/gsd-*.md`) | subagent role definitions |
| [skills-commands.md](skills-commands.md) | Skills / Commands (`commands/gsd/`) | thin `/gsd-<cmd>` slash-command wrappers |
| [hooks.md](hooks.md) | Hooks (`hooks/`) | runtime lifecycle hooks (session/context/guard) |
| [tests.md](tests.md) | Tests (`tests/`) | Node built-in runner + fast-check property tests |
| [scripts.md](scripts.md) | Scripts & ESLint rules | lint/check/build/CI helpers + custom AST rules |

> **Not given its own doc:** *SDK* (`sdk/`) — **retired** (0 files; `vitest.config.ts` still
> targets it — a dangling orphan, see PIPELINE-TRACE §5 / SUBSYSTEM-MAP §3). *Assets* (5 static
> files) and *Contexts* (3 mode files, folded into references-contexts.md) are too small for a
> standalone reviewer doc.

## How to use these

- **Newcomer fixing a bug:** PIPELINE-TRACE for the flow → the cluster doc named in HOTSPOTS for
  the file you're touching → the "what a newcomer must know" section before editing.
- **Deep-sweep author (Phase 10/12/13):** the `subsystem:` field on every finding draws from
  these docs' boundaries; the "connections" + "newcomer gotchas" sections are the false-positive
  guardrails (most engine modules are reached by dynamic indirection, not imports).