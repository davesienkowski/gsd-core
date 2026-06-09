> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# Concern Sweep — Maintainability (change-cost lens)

> **Requirement:** Phase 12 SC-4 (the maintainability / `change-cost` lens) ·
> **Mode:** audit-and-plan only (no code changed) · **Derived:** 2026-06-08
> **Charter:** problem_type `change-cost` (§1.1) — *load-bearing but hard to change safely;
> you cannot just delete it.* Distinct from `waste` (delete-and-nothing-is-lost → `bloat.md`)
> and from `wrongness` (wrong-result-today → Phase 13). Cards append to `FINDINGS.md` (Phase 17).

This lens captures **structural decay, coupling, test gaps, and inconsistency that make future
change slow or risky** — not waste, not a present defect. The MECE boundary (charter §1):
oversized-but-live `core.cts` is `change-cost` (you can't delete it); a dead vitest config is
`waste` (it's in `bloat.md`). The Fowler `debt_quadrant` annotation is set where meaningful.

The dominant maintainability fact: **two monoliths the team must change carefully** —
`bin/install.js` (12,727 LOC, the largest single change-cost surface, *invisible to the
complexity scan because it is `.js` outside `src/`*) and `src/core.cts` (the engine's
churn × complexity rank-1 hub). Both have **all-16 runtime blast radius** on any defect.

---

## 1. Structural decay — the oversized modules

The churn × complexity ranking (`map/HOTSPOTS.md`, McCabe complexity × `--follow` git churn)
is the change-risk heuristic (Tornhill, *Your Code as a Crime Scene*): a file that is **both**
complex (many ways to be wrong) **and** frequently changed (high chance the next edit breaks it)
is where refactor payoff concentrates.

```yaml
- id: F-MAINT-01    # the installer monolith — top change-cost surface in the repo
  problem_type: change-cost
  subsystem: installer              # bin/ — NOT src/, outside the complexity scan
  file:line: "bin/install.js (12,727 LOC, 216 top-level functions — wc -l + grep -c verified)"
  severity: 4                       # largest single change-cost surface (SUBSYSTEM-MAP §3.3)
  effort: L
  risk: high                        # touches every one of 16 runtimes' install path
  confidence: 5
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  cross_check: "Absent from HOTSPOTS only because it is .js outside src/; HOTSPOTS metric-caveat explicitly flags it must NOT be skipped for lack of a metric. Not a dead-code claim — a size/change-cost claim."
  recommendation: "Top decomposition target. Plan-only: propose module extraction along the runtime-artifact-layout / per-runtime-converter seams (the matrix's 16 arms are natural cut lines). Do not refactor here. Pairs with F-MAINT-02 (the coupling that makes it worse)."
  debt_quadrant: prudent-inadvertent
  provenance: "F-MAINT-05 (Phase 10) / SUBSYSTEM-MAP §3.3"

- id: F-MAINT-02    # installer<->engine bidirectional coupling — graph-invisible
  problem_type: change-cost
  subsystem: installer
  file:line: "src/runtime-artifact-layout.cts:51 `_require('../../../bin/install.js')` (engine reaches BACK into the 12.7k-LOC installer for converter functions)"
  severity: 3
  effort: M
  risk: high
  confidence: 5                     # read this phase; PIPELINE-TRACE §3/§5#4
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  cross_check: "depcruise shows runtime-artifact-layout depending only on install-profiles — the back-edge to bin/install.js is a LAZY, test-guarded require inside a function, absent from the graph. The installer<->engine boundary is bidirectional in behavior but one-way/invisible in the graph."
  recommendation: "Break the back-edge: extract the converter functions install.js exposes into a small shared module both the installer and runtime-artifact-layout import one-way, so the dependency stops being bidirectional. A worked example of why coupling must be traced by behavior, not edges."
  debt_quadrant: prudent-inadvertent
  provenance: "PIPELINE-TRACE §5#4 + SUBSYSTEM-MAP §3.2"

- id: F-MAINT-03    # core.cts — the engine's rank-1 hotspot
  problem_type: change-cost
  subsystem: engine                 # cluster E1
  file:line: "src/core.cts (602 fileCx, 2054 LOC, maxFn 108, churn 142, fan-in 24/out 9 — HOTSPOTS rank 1, churn×cx 85,484)"
  severity: 4                       # most-changed × most-complex × most-depended-upon
  effort: L
  risk: high
  confidence: 5
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  cross_check: "complexity.json (McCabe) + git --follow churn. Size/complexity hotspot, not dead code. fan-in 24 / fan-out 9 = both a hub and an orchestrator; any defect has all-16 blast radius."
  recommendation: "The single highest-risk file in the engine. Phase 13 (correctness) reads it first; this lens evaluates DECOMPOSITION. The single 108-complexity function is the priority unit — split the hub (config-load, model-resolution, git/shell-projection) from the orchestrator responsibilities."
  debt_quadrant: prudent-inadvertent
  provenance: "F-MAINT-06 (Phase 10)"

- id: F-MAINT-04    # config.cts — highest-churn-after-core = unstable contract
  problem_type: change-cost
  subsystem: engine                 # cluster E9
  file:line: "src/config.cts (78 commits = highest churn after core; fileCx 139, 724 LOC, maxFn 41)"
  severity: 3
  effort: M
  risk: med
  confidence: 5
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  cross_check: "HOTSPOTS rank 5. 78 commits on a config aggregator signals an UNSTABLE CONTRACT — the config shape keeps changing. Distinct from F-BLOAT-17 (which is the redundant double-implementation of config-LOAD); this is the churn/contract-instability of config.cts itself."
  recommendation: "Stabilize the config contract: a single typed config schema (config-schema.cts already exists in E1) as the one source of truth, so config shape changes are localized. The high churn is the symptom; the diffuse contract is the cause."
  debt_quadrant: prudent-inadvertent

- id: F-MAINT-05    # init.cts aggregator sprawl (size + clone density)
  problem_type: change-cost
  subsystem: engine                 # cluster E9
  file:line: "src/init.cts (fileCx 419 = 2nd-highest, 1996 LOC, churn 5) + 11 intra-file clones + cross-file clones init.cts↔roadmap/config/commands (jscpd typescript)"
  severity: 3
  effort: L
  risk: med
  confidence: 4
  runtime_blast_radius: multi
  mechanical_vs_instructional: n/a
  cross_check: "Huge LOW-churn aggregator (HOTSPOTS 'separately flagged' — product under-ranks it). Big surface, low recent activity. Its clones re-implement aggregation other modules provide (→ F-BLOAT-15, the conceptual-redundancy twin of this card)."
  recommendation: "Decompose init.cts; the clone clusters collapse as a side effect. This card is the change-cost view; F-BLOAT-15 is the conceptual-redundancy view of the same module — fix once, both close."
  debt_quadrant: prudent-inadvertent
  provenance: "F-MAINT-07 (Phase 10)"
```

> **Severity-floor aggregate (charter §3.4.3) — the oversized tail, carried as the ranked table
> not 20 cards:** `state.cts` (1900 LOC, churn 67, rank 2), `phase.cts` (1527, churn 73, rank 3),
> `commands.cts` (1233, rank 4), `profile-output.cts` (1096, maxFn 53), `worktree-safety.cts`
> (1013). Plus the non-`src/` secondary monolith `gsd-core/bin/gsd-tools.cjs` (1,928 LOC entry,
> also outside the complexity scan). The roadmap needs the ranked surface (HOTSPOTS table), not
> a near-duplicate size card per file.

---

## 2. Coupling (beyond the installer↔engine back-edge in §1)

The engine is **acyclic** — `madge: "No circular dependency found"`, confirmed by depcruise
(94 modules / 176 edges). That clean signal is recorded so the team does not chase a cycle that
does not exist. The coupling concerns are concentration, not cycles:

```yaml
- id: F-MAINT-06    # load-bearing seams — concentration risk
  problem_type: change-cost
  subsystem: engine                 # clusters E1/E2
  file:line: "depcruise.json fan-in: shell-command-projection 29 (most depended-upon), core 24, planning-workspace 17, frontmatter 11, runtime-slash 10"
  severity: 2
  effort: L
  risk: high
  confidence: 4
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  cross_check: "SUBSYSTEM-MAP §1 graph signal. A change to shell-command-projection (fan-in 29) or core (fan-in 24) ripples across the whole engine — high change-cost by concentration, even with no cycles."
  recommendation: "Recorded as a concentration map for sequencing, not a refactor demand: any change to the top-5 fan-in seams needs the widest regression net. These are the seams that make 'small' engine edits expensive. Stable narrow interfaces over these seams reduce future change-cost."
  debt_quadrant: prudent-deliberate    # high fan-in on shared utilities is a deliberate, reasonable shape
```

---

## 3. Test gaps & test-surface health

The test surface is large and governed: **721 test files (664 `*.test.cjs`)**, Node built-in
runner + fast-check property tests, c8 coverage threshold 70% lines over the engine, governed by
`lint-test-file-count.cjs` (max 2 test files per production module, ratcheted). The gap is not
*quantity* — it is *where the metric can't reach*:

```yaml
- id: F-MAINT-07    # the test/coverage blind spots — the two monoliths
  problem_type: change-cost
  subsystem: installer
  file:line: "bin/install.js (12,727 LOC) + gsd-core/bin/gsd-tools.cjs (1,928 LOC) — both .js/.cjs outside src/, so outside the c8-over-src/ coverage threshold and the McCabe scan"
  severity: 3
  effort: M
  risk: med
  confidence: 4
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  cross_check: "Coverage threshold (CLAUDE.md) is '70% lines over get-shit-done/bin/lib/*.cjs' — the COMPILED engine, not bin/install.js or gsd-tools.cjs. The two largest, riskiest change surfaces sit OUTSIDE the coverage gate. M1 handoff H-04 (full first-run install trace per runtime) was deferred precisely because the installer is not exhaustively reproduced."
  recommendation: "Bring bin/install.js + gsd-tools.cjs under an explicit coverage target (even a lower one) so the two highest-change-cost files are not unmeasured. Pairs with F-MAINT-01 decomposition — smaller extracted modules are testable where the 12.7k monolith is not. The per-runtime first-run trace (H-04) is the integration-test gap."
  debt_quadrant: prudent-inadvertent
  provenance: "M1 handoff H-04 (Phase 13/15) — the test-gap facet owned here"

- id: F-MAINT-08    # verify.cts — the hot function on the verification path (P13 handoff)
  problem_type: change-cost
  subsystem: engine                 # cluster E8
  file:line: "src/verify.cts (maxFn 150 — single hottest function in the engine; fileCx 359, 1615 LOC, churn 2)"
  severity: 3
  effort: L
  risk: high
  confidence: 4
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  cross_check: "HOTSPOTS 'separately flagged': the churn×cx product UNDER-ranks it (#22) because churn is low, but a complexity-150 function is the most defect-prone UNIT in the engine and sits on the verification path ('verifier reach = spec reach'). Static signal only — the DEFECT is Phase 13's to confirm."
  recommendation: "Change-cost view: a 150-complexity single function is near-untestable per-branch and risky to edit. Decompose it. HANDOFF → Phase 13 reads it for swallowed-error / silent-default / branch-coverage gaps (the correctness view of the same function)."
  debt_quadrant: prudent-inadvertent
  provenance: "F-CORR-LEAD-01 (Phase 10) — change-cost facet; correctness facet → Phase 13"
```

---

## 4. Inconsistency (drift surfaces & narration-vs-behavior mismatches)

Inconsistency that makes change error-prone — not a present defect, but a trap the next edit can
fall into:

```yaml
- id: F-MAINT-09    # .gitignore per-line enumeration drift surface
  problem_type: change-cost
  subsystem: engine                 # build/repo hygiene
  file:line: ".gitignore (95 explicit /gsd-core/bin/lib/*.cjs lines, one per emitting source — SOURCE-OF-TRUTH-MAP)"
  severity: 2
  effort: S
  risk: med                         # switching to a glob could mask a real file that SHOULD be tracked
  confidence: 4
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  cross_check: "Per-line enumeration (not a glob) means each ADR-457 migration must hand-add its emitted .cjs; a forgotten line would COMMIT a build artifact (the exact failure ADR-457 corrects). 95 hand-maintained lines = 95 drift points."
  recommendation: "Replace the 95 enumerated lines with a `gsd-core/bin/lib/**/*.cjs` glob (or a generated block) to remove the drift surface. Verify no hand-tracked exception is masked before switching."
  debt_quadrant: prudent-deliberate
  provenance: "F-OBS-DEP-01 (Phase 10)"

- id: F-MAINT-10    # the dynamic-indirection guard is itself under-documented
  problem_type: change-cost
  subsystem: docs                   # the audit/guard method, not runtime code
  file:line: "instrumentation/DYNAMIC-INDIRECTION.md (Site 0 lists only gsd-tools.cjs + bin/install.js; misses the workflow-shim require channel: gsd-core/workflows/code-review.md:53,344, autonomous.md, plan-phase.md)"
  severity: 2
  effort: S
  risk: low
  confidence: 5
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  cross_check: "Phase 10 cleared code-review-flags/fallow-runner/ui-safety-gate as live via workflow markdown bash shims — a require channel the guard's Site 0 documents only for two entry points. The guard's CONCLUSIONS were correct; its inventory of HOW is incomplete."
  recommendation: "Add a 'Site 5 — workflow markdown bash shims' entry to the dynamic-indirection inventory so future dead-code passes don't re-flag these. A credibility improvement to the audit method. HANDOFF → Phase 16 (recon) confirms against the prior map."
  debt_quadrant: prudent-inadvertent
  provenance: "F-MAINT-01 (Phase 10)"

- id: F-MAINT-11    # stale skill counts — the same number hand-written in many places
  problem_type: change-cost
  subsystem: installer
  file:line: "bin/install.js:686 ('66' skills — live = 67; 'core 7' — live 8; 'standard ~13' — live 14) + docs/tutorials/your-first-project.md:36-40 ('86 skills') — none derived from src/install-profiles.cts"
  severity: 2
  effort: S
  risk: low
  confidence: 5
  runtime_blast_radius: none        # help text + docs only
  mechanical_vs_instructional: n/a
  cross_check: "Multiple hand-written counts of the same surface, all stale because none is derived from install-profiles.cts (the source of truth). QW-UX-03/04 fix the CURRENT instances; the maintainability concern is the DRIFT MECHANISM — counts will re-drift."
  recommendation: "Derive every surfaced skill count programmatically from install-profiles.cts so help text / tutorial / README cannot drift again. The quick-wins patch the symptoms; this is the drift-proofing. M1 explicitly handed the 'single derived source-of-truth for the count' to this phase."
  debt_quadrant: prudent-inadvertent
  provenance: "QW-UX-03, QW-UX-04 (M1, symptom fixes) + M1 UX handoff (drift-proof count); maintainability facet owned here"
```

---

## 5. Internal duplication as change-cost (the TS clones)

Distinct from BLOAT-01's *dead* duplication and BLOAT-04's *conceptual* redundancy: these are
real intra-source copy-paste clones — live, behavior-preserving to extract, raising the cost of
keeping the copies in sync.

```yaml
- id: F-MAINT-12
  problem_type: change-cost
  subsystem: engine
  file:line: "reports/jscpd (typescript, 2.69% / 83 clones) — densest: audit.cts:467-478 vs 537-548 (phase-dir scan boilerplate, 7 clones in audit.cts); clusters init.cts (11), state.cts (9), install-profiles.cts (8)"
  severity: 2
  effort: S
  risk: low
  confidence: 5                     # read audit.cts:467 & :537 — identical readdirSync→filter→map→sort preamble
  runtime_blast_radius: none        # internal refactor, behavior-preserving
  mechanical_vs_instructional: n/a
  cross_check: "TypeScript-format clones only — NO .cts↔.cjs source/artifact pair counted (charter §0). Spot-confirmed in audit.cts. The clone density concentrates in the SAME files flagged oversized (init/state/audit), so clone reduction is a side effect of the oversized-module refactor, not a separate workstream."
  recommendation: "Extract a shared `listPhaseDirs(planDir)` helper (audit.cts is the densest, 7 of 83). Fold the rest of the clone reduction into the F-MAINT-03/05 decompositions rather than a standalone de-dup pass."
  debt_quadrant: prudent-inadvertent
  provenance: "F-MAINT-03 + F-MAINT-AGG-04 (Phase 10)"
```

---

## Handoffs (charter §3.4.5)

| To | Item | Card |
|----|------|------|
| **Phase 13 (correctness)** | `verify.cts` 150-cx function (swallowed-error / branch-coverage); `core.cts` read-first | F-MAINT-08, F-MAINT-03 |
| **Phase 13** | config-load failure-contract decision (error vs warn-default) | F-BLOAT-17 (bloat.md) / QW-REL-01 |
| **Phase 15 (UX)** | full first-run install→first-command trace per runtime (the integration-test gap) | F-MAINT-07 (H-04) |
| **Phase 16 (recon)** | add "Site 5 — workflow markdown bash shims" to the indirection guard | F-MAINT-10 |

## Honesty statement (charter §3.2)

Every card cites a `src/*.cts`/`bin/` line, a report figure, or a live count. The change-cost
mass is concentrated in **two monoliths the complexity scan can't see** (`bin/install.js`,
`gsd-tools.cjs`) and the **engine's rank-1 hub `core.cts`** — all all-16 blast radius. The
engine has **no import cycles** (recorded as a clean result). Maintainability findings are
load-bearing-but-hard-to-change (`change-cost`), kept distinct from waste (`bloat.md`) and from
present defects (Phase 13) per the MECE boundary.

*Plan-only attestation: this phase created only `docs/audit/comprehensive/concerns/bloat.md`,
`concerns/maintainability.md`, and the Phase-12 planning artifacts. No protected path
(`package.json`, `src/`, `gsd-core/`, `workflows/`, `agents/`, `commands/`, `bin/`,
`.gitignore`) was edited; no git commit; no GitHub write. The firewall (`.planning/codebase/*`,
`.planning/notes/*-2026-06-05.md`, frontier-synthesis) was honored — only Phase 7–11 evidence,
the charter, the M1 backlog, and live `src/*.cts` were opened.*