# GSD-Core Audit — `docs/audit/`

> **Status:** Milestone 1 (Newcomer Readiness, fast-track) — setup phase complete.
> **Mode:** Audit-and-plan only. **No file in this directory modifies the GSD pipeline or package.**

## What this audit is

A fresh, independent, full-repository audit of the **GSD-Core** codebase — the framework
behind the `@opengsd/gsd-core` package. It maps every subsystem, inventories bloat across
four lenses, gap-checks the pipeline against current AI/LLM best practice, and produces a
prioritized, **assignable improvement roadmap** for a 4+ person maintainer team to execute
in a later milestone.

It is **audit-and-plan only**: it deeply understands and recommends; it does **not** change
the codebase. Mapping a reflexive system (GSD auditing GSD) must precede changing it.

This audit **serves the community gsd-core codebase** (open-gsd/gsd-core). The
work-in-progress deliverables live on **Dave's fork** (davesienkowski/gsd-core) until the
maintainer team is ready to receive them. The experiment program that informs some
recommendations is Dave's original (AI-assisted) work; GSD is the community's project — see
contribution-language note in `MAINTAINER-SIGNAL.md`.

## Two-milestone structure

| Milestone | Scope | Output |
|-----------|-------|--------|
| **M1 — Newcomer Readiness (fast-track, ASAP)** | Light instrumentation + the four newcomer-facing concern areas (onboarding/UX, token-savings, reliability) | An execution-ready, ICE-sized **quick-win backlog** ahead of the Mintlify spotlight |
| **M2 — Comprehensive Audit** | The full funnel: method → instrumentation → map → evidence → concern sweeps → reconciliation firewall → scored hybrid-matrix roadmap | The full prioritized improvement roadmap |

North-star for M1: **"cleaner and tighter"** (see `MAINTAINER-SIGNAL.md`).

## The firewall rule (hard boundary)

This directory is produced under a **fresh-pass firewall**. During Milestone 1 and all of
Milestone 2's fresh analysis, the following prior artifacts are **NOT opened**:

- `.planning/codebase/*` (prior subsystem map, 7 docs)
- `.planning/notes/*-2026-06-05.md` (pipeline-delivery audit, frontier-research synthesis)
- any prior audit / frontier-research synthesis

They are opened for the first time only at the **Phase 16 Reconciliation Firewall**, where
disagreements between the fresh read and the prior read become findings in their own right.
This keeps the new read independent and turns prior work into a validation oracle rather
than an anchor.

## Hard analysis rule

All static analysis targets **`src/*.cts` (the 83-file TypeScript source of truth)** and the
prompt corpus — **never** the gitignored, compiled `gsd-core/bin/lib/*.cjs` (ADR-457
build-at-publish). Analyzing the compiled output produces false bloat (it would also count
`.cts`↔`.cjs` source/artifact pairs as "duplication").

## Manifest of this directory

| File | Purpose | Requirement |
|------|---------|-------------|
| `README.md` | This file — what the audit is, milestones, firewall, manifest | — |
| `DELIV-HOME.md` | Decision record: git-tracked deliverable home | DELIV-01 |
| `TRACKING-SURFACE.md` | Decision + exact `gh` commands for the maintainer tracking surface | VIEW-01 |
| `BACKLOG-SCHEMA.md` | The **locked** quick-win backlog / ICE schema (canonical; Phase 6 extends it) | QWIN-01 frame |
| `STREAMS.md` | The three independent, concurrently-runnable quick-win streams | — |
| `MAINTAINER-SIGNAL.md` | The dated "cleaner and tighter" pre-reconciliation observation | — |
| `instrumentation/README.md` | How the light, sandboxed instrumentation works + exact invocations | QWIN-02 |
| `instrumentation/knip.json` | knip config scoped to `src/**/*.cts` | QWIN-02 |
| `instrumentation/.jscpd.json` | jscpd config scoped to `src/**/*.cts` + prompt corpus | QWIN-02 |
| `instrumentation/tokenize.mjs` | Runnable token-counter over the prompt corpus | QWIN-02 |
| `instrumentation/usage-signal.md` | The early per-command/skill usage signal (with population caveat) | QWIN-02 |

All instrumentation is **sandboxed here** — it is *not* wired into the package's
`devDependencies`, `build`, or CI. It is real and runnable, but kept inside the audit's home
so the system under audit is untouched.
