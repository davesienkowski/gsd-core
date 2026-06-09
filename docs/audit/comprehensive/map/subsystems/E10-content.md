> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# E10 — Content / docs / intel / learnings / research / graphify

> **Engine cluster** (`src/*.cts`) · reviewer doc (DOC-01) · derived 2026-06-08 from live code.
> **Source of truth:** `src/*.cts` — never the compiled `gsd-core/bin/lib/*.cjs`.

## Purpose

The **higher-level content operations** layered on top of the core engine: documentation
generation, codebase intelligence (intel/API-surface), learning extraction, research
provider/store, knowledge-graph building, legacy import, and ADR parsing. These are mostly
leaf-ish — they read the prompt corpus / codebase by path and emit docs — so they hang off the
edge of the import graph.

## Key files (10 modules)

| File | Role | Notes |
|------|------|-------|
| `src/docs.cts` | generate/update project documentation | |
| `src/intel.cts` | codebase intel + `api-surface` (the `gsd_run intel api-surface` gate in plan-phase) | **Hotspot #18** |
| `src/learnings.cts` | extract decisions/lessons/patterns from completed phases (`learnings query --tag`) | |
| `src/graphify.cts` | build the project knowledge graph (`.planning/graphs/`) | **Hotspot #16** |
| `src/gsd2-import.cts` | import legacy GSD2 plans | **Hotspot #24** (generated `.cjs`) |
| `src/adr-parser.cts` | parse ADRs (nygard/madr/narrative) for the `--ingest` express path | |
| `src/research-provider.cts`, `research-store.cts` | research dispatch + storage | |
| `src/update-context.cts` | update CONTEXT.md | false orphan (out-of-`src/` consumer) |
| `src/review-reviewer-selection.cts` | pick cross-AI reviewers for `/gsd-review` | false orphan |

## How it connects

- **Corpus reads (Site 4):** these read workflows/references/agents/templates `.md` and the
  consumer codebase **by string path** — their real inputs are invisible to the import graph.
- **Entry:** reached from `gsd-tools.cjs` family handlers (`intel`, `learnings`, `docs`, …).
- `update-context` and `review-reviewer-selection` show as depcruise **orphans** — false (they
  have out-of-`src/` entry consumers).

## What a newcomer must know

- **Site-4 false orphans:** a module here flagged "orphan/unused" is almost always reached by an
  out-of-`src/` entry point or reads corpus by path — check before calling it dead.
- These are the most **self-contained** engine modules — a good place for a newcomer's first
  change, since they're leaf-ish and lower blast radius than E1/E3/E6.
- `intel api-surface` and `graphify` produce artifacts (`API-SURFACE.md`, `.planning/graphs/`)
  consumed by later workflow gates — they're part of the pipeline's content loop, not standalone.