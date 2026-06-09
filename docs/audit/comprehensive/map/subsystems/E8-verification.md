> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# E8 — Verification / validation / drift / audit

> **Engine cluster** (`src/*.cts`) · reviewer doc (DOC-01) · derived 2026-06-08 from live code.
> **Source of truth:** `src/*.cts` — never the compiled `gsd-core/bin/lib/*.cjs`.

## Purpose

The **"is the work actually done / has the codebase drifted"** lens: plan-structure checks,
artifact validation, commit-hash verification, structural drift detection, and the retroactive
audit. This cluster is on the **verification path** — and in a spec-driven pipeline,
"verifier reach = spec reach," so its correctness is strategically load-bearing.

## Key files (8 modules)

| File | Role | Notes |
|------|------|-------|
| `src/verify.cts` | plan-structure checks, artifact validation, commit hashes | **Holds the single hottest function in the engine: maxFn 150** (fileCx 359, 1,615 LOC). Fan-out 11 (ties `init`). Low churn (2) hides it at product-rank #22 — Phase 13 **must** read it regardless. |
| `src/verification.cts` | the verification command surface | |
| `src/validate.cts` | artifact validation commands | |
| `src/drift.cts` | structural drift detection (new dir / barrel / route / migration); returns `{skipped:true}` on bad input — never blocks | **Hotspot #25** |
| `src/audit.cts` | retroactive phase/milestone audit | **Hotspot #14** |
| `src/artifacts.cts` | artifact existence/shape helpers | |
| `src/uat.cts` | UAT criteria handling | |
| `src/gap-checker.cts` | requirements/decision gap analysis (`gsd_run gap-analysis`) | consumed in plan-phase step 13e |

## How it connects

- **Below:** E1 + E3 (it validates the artifacts E3 writes).
- **Dispatch in (Site 3):** verify/validate command functions reached via the E4 string-keyed
  routers (`verify-command-router`, `verification-command-router`, `validate-command-router`).
- **Used by:** the plan-phase verification gates (requirements/decision coverage), the verify and
  execute workflows, and `gsd-verifier`/`gsd-plan-checker` agents indirectly via the tools they call.

## What a newcomer must know

- **`verify.cts` is the most defect-prone *unit* in the engine** (a complexity-150 function).
  Touching it is high-risk; it is a mandatory Phase-13 read even though churn×complexity
  under-ranks it. Do not refactor it casually.
- `drift.cts` is deliberately **non-blocking** — it returns `{skipped:true}` on malformed input
  rather than throwing, so a drift miscalc never halts a workflow. Preserve that contract.
- This cluster is where the audit's "verifier reach = spec reach" thesis bites: a gap in
  verification silently lets a wrong plan/execution through.