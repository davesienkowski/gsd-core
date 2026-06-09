> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# ADVERSARIAL-M2-PROCESS.md — Hostile Red-Team Review of Milestone 2

> **Reviewer stance:** hostile, falsifying. Goal: break the "passed / no gaps" self-reports of the
> comprehensive deep audit (Phases 6–17). Plan-only, read-only; this file is the only artifact created.
> **Date:** 2026-06-08. **Inputs attacked:** all 12 M2 phase dirs, `ROADMAP.md`, `REQUIREMENTS.md`,
> `FINDINGS.md` (64 cards), `IMPROVEMENT-ROADMAP.md`, `TRACKING-SURFACE-POPULATED.md`,
> `RECONCILIATION.md`, `AUDIT-CHARTER.md`, `concerns/*`, `evidence/*`, `map/*`, and the priors
> (`.planning/codebase/CONCERNS.md`, `*-2026-06-05.md`) used as an oracle for the missed-concerns check.

---

## Headline verdict

**M2 is genuinely substantial work and largely earns its "passed" marks.** The scored register is
internally airtight (count, types, priority math, ranking all reconcile exactly), the top-priority
findings are real defects verified against live source, and the M1→M2 fold-in has no silent drops.
**It is NOT, however, "no gaps."** There are **3 must-note gaps** before maintainers rely on it as
"the full repo audited," the largest being that **the deep concern sweeps never swept three mapped
subsystems (CI workflows, git hooks, runtime hooks/scripts)** and **the one runnable security check
(`npm audit`) was deferred on an incorrect rationale and, when run now, falsifies a live finding.**

---

## 1. Per-phase verification-honesty table

Each phase's VERIFICATION was read against the ROADMAP success criteria and spot-checked against the
deliverable content. "Earned" = the PASS is backed by deliverable substance, not rubber-stamped.

| Phase | Criteria | Verdict | Notes |
|------|---------|---------|-------|
| 6 Charter & Method | 4/4 + extras | **EARNED** | Charter genuinely defines MECE axis, tie-break, ICE schema, guards, stopping rules, M1 feed-forward. Honest §0 ADR-457 nuance. |
| 7 Full Instrumentation | 4/4 | **EARNED** | All six analyzers actually ran (output in `reports/`); source-of-truth map, dynamic-indirection inventory (5 sites), 16-runtime matrix all present. Honest about madge/jscpd tool artifacts. |
| 8 Subsystem Map | 3/3 | **EARNED (one scope gap, see §5)** | Engine sub-split into 11 clusters (95/95 assigned); HOTSPOTS by churn×cx. **But the §0 subsystem list omits `.github/workflows/` and `.githooks/`** — see Missed Concerns. |
| 9 Pipeline Trace & Docs | 3/3 | **EARNED** | End-to-end trace of `/gsd-plan-phase` with file:line; 21 subsystem docs + index; narration-vs-graph cross-check table. Deliberate scope (2 commands traced deeply) honestly stated. |
| 10 Static Evidence Sweep | 3/3 | **EARNED** | Strong: the guard ledger is the core deliverable; honest "zero confirmed-dead `.cts` after the guard" rather than manufacturing dead code. |
| 11 Usage Mining (full) | 3/3 | **EARNED** | Extractor actually run (92 sessions); single-author caveat is the first content block and made mandatory-inherit. Honest that the window did not grow, only depth. |
| 12 Bloat & Maintainability | 5/5 | **EARNED** | All four lenses + maintainability; mechanical-vs-instructional applied; recurring vs on-demand separated; M1 fold-in with provenance + 1 escalation. |
| 13 Pipeline Correctness | 4/4 | **EARNED** | 11 cards, 9/11 reproduced live; reflexivity guard applied; H-01..H-04 resolved. Top defects verified by me (F-CORR-01/02) — real. |
| 14 AI/LLM Gap-Check | 3/3 | **EARNED** | 6 gaps + 5 alignments; **every external claim WebFetched with verbatim quote** (the project's inverted-citation failure mode was actively guarded — S1 PDF-binary fallback handled honestly). |
| 15 UX / Onboarding | 4/4 | **EARNED** | Newcomer + power-user tracks; two-tracks treated as a refined hypothesis; safety/recovery exemption list; single-author caveat inherited. |
| 16 Reconciliation Firewall | 3/3 | **EARNED w/ a small completeness overstatement** | Firewall dating attested; 12 agreements + 5 RECON cards + 2 folded/recorded. **But two prior sections (Fragile Areas lock-deadlock, Performance Bottlenecks) are not in the ledger** despite the "every section addressed" claim — see §5. |
| 17 Synthesis & Scoring | 4/4 | **EARNED** | Verified independently: 64 scored, math correct, ranking follows, surface = 64 rows, M1 folded. The one deferred check (`npm audit`) is honestly flagged in-card — but the deferral rationale is wrong (see §5). |

**No phase is a rubber-stamp.** No "partial-but-marked-passed" verification was found at the
success-criteria level. The gaps below are *scope* and *completeness* issues that sit underneath the
criteria, not false PASS claims against the criteria as written.

---

## 2. Requirements coverage (every M2 requirement, strict)

| Requirement | Deliverable | Verdict | Note |
|-------------|-------------|---------|------|
| METHOD-01 | AUDIT-CHARTER.md | **SATISFIED** | MECE axis, tie-break, guards, stopping rules all present and grounded. |
| METHOD-02 | instrumentation/* (3 inventories) | **SATISFIED** | Analyzers `src/`-scoped; source-of-truth map, dynamic-indirection inventory, 16-runtime matrix all exist and ran. |
| MAP-01 | map/SUBSYSTEM-MAP.md | **PARTIAL** | "Every subsystem" — but `.github/workflows/` (23 CI files) and `.githooks/` (pre-commit/pre-push) are absent from the subsystem list. Hooks/scripts mapped; CI + git hooks not. |
| MAP-02 | map/PIPELINE-TRACE.md | **SATISFIED** | Traced as a flow with graph cross-check. |
| DOC-01 | map/subsystems/*.md (21+index) | **SATISFIED** | One reviewer doc per mapped subsystem. (Inherits MAP-01's gap — no CI/githooks doc, because not mapped.) |
| BLOAT-01 | concerns/bloat.md (F-BLOAT-01..05) | **SATISFIED** | Dead/dup with the false-positive guard; honest zero-confirmed-dead. |
| BLOAT-02 | concerns/bloat.md (F-BLOAT-06..08) | **SATISFIED** | Surface sprawl grounded in usage; single-author limiter attached. |
| BLOAT-03 | concerns/bloat.md (F-BLOAT-09..14) | **SATISFIED** | Mechanical vs instructional + recurring vs on-demand, token figures cited. |
| BLOAT-04 | concerns/bloat.md (F-BLOAT-15..17) | **SATISFIED** | Conceptual redundancy (aggregators, routers, config double-impl). |
| CORR-01 | concerns/pipeline-correctness.md | **SATISFIED (engine-scoped)** | 11 cards, behavior-first. **Scope caveat:** correctness was swept on `src/*.cts` + install transform only; hooks/CI/scripts correctness unswept (see §5). |
| AI-01 | concerns/ai-llm-gaps.md | **SATISFIED** | Sources verified verbatim — the strongest evidence discipline in the audit. |
| UX-01 | concerns/ux.md | **SATISFIED** | Two audiences, progressive disclosure, blast-radius tags. |
| RECON-01 | RECONCILIATION.md | **PARTIAL** | Firewall honored; delta recorded. **But the "every prior section addressed" claim is overstated** — Fragile Areas (lock deadlock) and Performance Bottlenecks are not in the ledger. |
| ROADMAP-01 | IMPROVEMENT-ROADMAP.md | **SATISFIED** | Hybrid matrix, problem-type primary, grouping explicitly revisited with rationale. |
| ROADMAP-02 | IMPROVEMENT-ROADMAP.md | **SATISFIED** | Every row carries priority/sev/eff/risk/subsystem/blast/citation; 5 owner slots for 4+. |

**Tally: 12 SATISFIED, 3 PARTIAL (MAP-01, RECON-01, and CORR-01 carries a scope caveat), 0 OVERSTATED, 0 MISSING.**
No requirement is fabricated-satisfied. The PARTIALs are coverage-breadth gaps, not false claims.

---

## 3. FINDINGS-register integrity (rebuilt independently)

I rebuilt every count from the raw file rather than trusting the headers.

- **Card count: 64** — confirmed by `grep -c '^- id:'` = 64. Matches the claim exactly.
- **Type distribution — EXACT MATCH.** Recomputed from the live `problem_type:` fields:
  waste 17 / wrongness 14 / human-friction 14 / change-cost 12 / external-gap 7 = 64.
  Header table (FINDINGS §0) is correct to the card.
- **Priority math — 64/64 CORRECT.** Recomputed `severity × confidence × ease(S=5,M=3,L=1)` for every
  card; all 64 match the stated `priority`. Zero arithmetic errors. Risk correctly excluded from the product.
- **Priority distribution table (FINDINGS lines 44–63) — EXACT MATCH** to my independent recomputation,
  including the top: 125 (F-CORR-02), 100 (F-AIGAP-02), then the 75-tier of 8.
- **Top-10 ranking follows from the scores** — verified; no card is promoted/demoted against its product.
- **Roadmap ↔ register: 64:64, no drops, no phantoms.** Every FINDINGS id appears as exactly one
  primary workstream row; every workstream primary maps to a real card. Cards listed in §2 spotlight,
  §3 M1 fold-in, and §5 convergence threads are explicitly labeled re-projections/views — **not**
  double-scored. F-BLOAT-01 appears as A16 but is marked "(xref)" with its primary in Workstream C;
  F-RECON-02 appears in both A15 (security sub-group) and B6 — both labeled, single-scored.
- **M1 fold-in honesty: no silent drop.** All 21 QW ids in the backlog (QW-TOK-08 folded into
  QW-TOK-05 → "20 items") appear in FINDINGS via `provenance`. All four handoffs H-01..H-04 resolved.
- **Tracking surface: exactly 64 rows** — matches the register.
- **F-UX-12** is honestly a cross-reference, not a 65th card (stated in two places). Defensible.

**Scoring soundness verdict: the register is internally airtight.** This is the strongest part of M2.
The only honest caveat the register itself raises (the ICE product under-ranks Large systemic items)
is disclosed in the priority caveat box and handled via the workstream "deep tier" — sound.

---

## 4. Security-taxonomy decision

**Sound.** Mapping security into `wrongness` + `tag: security` rather than adding a 6th MECE type is
defensible: the charter locks the 5-type partition at Phase 6, and a security exposure genuinely *is*
an unsafe/wrong outcome. The Security & Exposure sub-group keeps the items first-class, and the
severe-escalation rule (sev≥4 floats to the top of Correctness) is reasonable.

**Are the prior's security items scored, not dropped? Mostly yes — with one staleness defect.**
- Prompt-injection consistency → F-RECON-05 ✓
- `GSD_AUDIT_ARGS=1` secret-log → F-RECON-05 ✓
- npm advisory (claude-agent-sdk) → F-RECON-05 ✓ *(but stale — see §5)*
- Harness-tamper (frontier prior) → F-RECON-02 ✓
- `ws`/SDK supply-chain → F-BLOAT-01 xref ✓

No prior security item was silently dropped. **However, the npm-advisory facet of F-RECON-05 is
carried as a *live* sev-3 concern on a stale advisory count, and the audit declined to run the check
that would resolve it** (see §5).

---

## 5. Missed concerns (the highest-value section)

Distinguishing genuine misses from correctly-deferred/out-of-scope.

### GENUINE GAP 1 — `npm audit` was deferrable but is now FALSIFIED (HIGH value)
The audit (FINDINGS §2, RECONCILIATION line 161, Phase-17 VERIFICATION) repeatedly states `npm audit`
"was NOT re-run this phase (read-only; would mutate lockfile state)."

- **The rationale is wrong:** `npm audit` (read) does not mutate the lockfile; only `npm audit fix` does.
- **I ran it.** Result: **`found 0 vulnerabilities`** (both `--omit=dev` and full; metadata shows
  0 info/low/moderate/high/critical). Installed `@anthropic-ai/claude-agent-sdk@0.2.141` (the `^0.2.84`
  range pulled the patched line); `ws@8.20.1`.
- **Impact:** the prior's "1 high + 5 moderate via the claude-agent-sdk advisory" is **stale**. F-RECON-05's security severity
  is overstated on its most concrete facet; the recommended "package.json overrides for the
  claude-agent-sdk advisories" is now a no-op. The card is honest that it *might* have moved — but a
  one-command, non-mutating check that flips a live finding to closed should have been run.
- **Action for the team:** mark the F-RECON-05 npm facet RESOLVED (0 vulns 2026-06-08); the
  injection-consistency and `GSD_AUDIT_ARGS` mask facets remain valid and unverified-by-run.

### GENUINE GAP 2 — three mapped subsystems were never CONCERN-SWEPT (HIGH value)
The deep sweeps (Phases 12–15) produced **zero scored findings** with `subsystem: hooks`, `scripts`,
or `ci`. Confirmed: `grep 'subsystem: (hooks|scripts|ci)' FINDINGS.md` → none.

- **`.github/workflows/` (23 CI files: `release.yml`, `security-scan.yml`, `mutation.yml`, `test.yml`,
  `install-smoke.yml`, ...) — 0 mentions in any deliverable.** Not mapped (absent from SUBSYSTEM-MAP §0),
  not traced, not swept. For an audit whose charter prizes build/publish and supply-chain correctness,
  the release/publish pipeline being entirely unexamined is a real breadth gap. `release.yml` is the
  live build-at-publish path that F-RECON-04 reasons about *from package.json scripts alone*.
- **`.githooks/` (pre-commit, pre-push) — 0 mentions.** These gate every contributor commit; not mapped,
  not swept.
- **`hooks/` runtime hooks (21 files: `gsd-prompt-guard.js`, `gsd-read-injection-scanner.js`,
  `gsd-workflow-guard.js`, ...) — mapped (subsystem 10) and given a reviewer doc, but produced no
  concern card.** This is where the prior's "duplicate-const PostToolUse hook shipped to
  all users" bug lived. The hooks are JS source (not `src/*.cts`), so they fell outside the
  `src/`-scoped sweep — a defensible *analysis* scope, but it means the audit's correctness/security
  conclusions do **not** cover the runtime-hook attack surface. (I did a shallow duplicate-const grep;
  hits were within-function-scope false positives — no confirmed bug, low confidence, but the surface
  is genuinely unswept.)
- **`scripts/` (58 files incl. `build-hooks.js`, the lint suite) — mapped, given a doc, but only one
  scored finding touches it tangentially (F-MAINT-10 is about the *inventory* of a script, not a defect
  in script code).** `scripts/build-hooks.js` (the install-time stamp seam at the heart of F-RECON-04)
  was reasoned about indirectly, never read for defects.

**Assessment:** the `src/*.cts` + install-transform analysis scope was applied faithfully and is
honestly disclosed — but the *audit's own MAP-01 promise* ("every subsystem") and CORR-01/security
conclusions are narrower than they read. A maintainer could reasonably believe CI/hooks were audited;
they were not.

### GENUINE GAP 3 — RECONCILIATION completeness claim overstated (MEDIUM value)
RECONCILIATION line 155 asserts every prior CONCERNS section was "folded, carded, or recorded as
superseded." Two prior sections are **not in the ledger**:
- **"Fragile Areas" — the advisory `withPlanningLock()` worktree-parallel deadlock** (a held lock blocks
  all other agents indefinitely). It is *described* in `map/subsystems/E2-planning-workspace.md` but is
  neither carded nor recorded-as-superseded in RECONCILIATION. A real concurrency concern that vanished.
- **"Performance Bottlenecks"** (634-file sequential test suite; synchronous 12.7k-LOC install parse on
  every `npx`). Not addressed anywhere. Performance has no MECE lens — defensibly out of scope — **but
  the CHANGELOG scaling item with the identical "outside the five lenses" status WAS explicitly
  "recorded, not carded."** Consistency demands these two get the same treatment; they were silently
  omitted instead.

### CORRECTLY DEFERRED / out of scope (not faulted)
- `bin/install.js` / `gsd-tools.cjs` lacking complexity metrics — honestly flagged as a tool limitation;
  the LOC/change-cost claim is still carded (F-MAINT-01/07).
- Multi-maintainer usage mining (BLOAT-02b) — explicitly v2-deferred.
- Per-runtime first-run trace across 16 runtimes (H-04) — honestly flagged as residual.
- Executing any fix — out of scope by charter (audit-and-plan only).
- Performance as a *lens* — genuinely outside the 5-type MECE; only the *recording* of it was missed.

### `npm audit` result (as requested)
```
$ npm audit            → found 0 vulnerabilities
$ npm audit --omit=dev → found 0 vulnerabilities
metadata.vulnerabilities = {info:0, low:0, moderate:0, high:0, critical:0, total:0}
installed: @anthropic-ai/claude-agent-sdk@0.2.141, ws@8.20.1
```

---

## 6. Internal consistency (contradictions / double-counts)

- **No card contradicts another.** Overlapping cards (config-parse: F-CORR-02/F-BLOAT-17/F-MAINT-04;
  colon-form: F-UX-07/08/F-RECON-01/F-BLOAT-09; the two monoliths) are deliberately split by MECE
  lens with the tie-break stated and cross-`cross_check` annotations — a feature, not a contradiction.
- **No roadmap double-count of scores.** Re-projections (spotlight checklist, M1 fold-in, convergence
  threads) are labeled views; each card is scored once.
- **One internal staleness contradiction:** FINDINGS §0 / charter §0 call the engine "largely
  hand-maintained `.cjs`," while FINDINGS §2 correctly notes `build:lib` (tsc) is now LIVE and the
  charter note is "partially stale." The audit caught its own drift and disclosed it — acceptable, but
  the charter prose was not corrected (plan-only, so cannot be — flagged for the team).

---

## 7. Overall verdict

**M2 is genuinely complete enough to execute against, with three caveats a maintainer must read first.**

- The **scoring register, ranking, roadmap, and M1 fold-in are airtight** — independently rebuilt, zero
  discrepancies. Trust them.
- The **verifications are earned**, not rubber-stamped; the AI-gap source discipline and the static-sweep
  honesty ("no dead code found") are exemplary.
- **Must-fix-before-relying gaps:**
  1. **Run/record `npm audit` (done here: 0 vulns)** — flip the F-RECON-05 npm facet to RESOLVED; the
     deferral rationale ("would mutate lockfile") is factually wrong.
  2. **Treat MAP-01/CORR-01/AI-01 as `src/*.cts`-scoped, not whole-repo** — `.github/workflows/`,
     `.githooks/`, and the JS `hooks/`+`scripts/` code were mapped-or-skipped but never concern-swept.
     The release/CI/hook surface is unaudited. Either scope a follow-up sweep or relabel the coverage claim.
  3. **Close the RECONCILIATION completeness overstatement** — record the prior's lock-deadlock and
     performance concerns (even as "out of MECE scope, recorded") so the "every section addressed"
     claim is true.

**Single most important gap:** the deep audit's whole-repo coverage claim is narrower than it reads —
**the CI/publish pipeline (`.github/workflows/`, esp. `release.yml`/`security-scan.yml`), the git hooks,
and the runtime `hooks/` JS were never concern-swept**, despite the charter's emphasis on build/publish
and supply-chain correctness and despite MAP-01 promising "every subsystem."

*Plan-only attestation: this file is the only artifact created (under `docs/audit/comprehensive/review/`).
No deliverable, source, config, or protected path was edited; no commit; no GitHub write. `npm audit`
was run read-only (it does not mutate the lockfile); `git diff package-lock.json` confirmed empty.*