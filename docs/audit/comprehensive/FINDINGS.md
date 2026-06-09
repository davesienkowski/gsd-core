# FINDINGS.md — The Single Scored Register (Milestone 2)

> **Status:** Assembled and scored (Phase 17, capstone). This is the **one source of truth**.
> `IMPROVEMENT-ROADMAP.md`, `TRACKING-SURFACE-POPULATED.md`, and the per-subsystem docs
> (`map/subsystems/`) are all **views** over this register — they must not drift from it.
> **Charter:** `docs/audit/comprehensive/AUDIT-CHARTER.md` (taxonomy §1, ICE sizing §2, card schema §2.2).
> **Mode:** Audit-and-plan only — every `recommendation` is what a maintainer *would* do; nothing here was executed.
> **Source of truth:** `src/*.cts` and the `.md` prompt corpus — never the gitignored compiled `gsd-core/bin/lib/*.cjs` (charter §0).
> **Assembled:** 2026-06-08.

---

## 0. How to read this register

- **68 scored findings**: 59 from the five concern sweeps (Phases 12–15) + 5 reconciliation
  findings (Phase 16) + **4 supplementary findings** (`concerns/build-ci-hooks.md`, added in the
  M2 adversarial-review remediation 2026-06-08: F-BUILD-01/02/03, F-CI-01). The Milestone-1
  quick-win backlog (20 items) is **folded in via `provenance`** — most M1 items are already
  absorbed into a deep card; the M1 backlog stands as the roadmap's *already-actioned / in-flight*
  tier (see `IMPROVEMENT-ROADMAP.md` §Quick-wins).
- **Scope caveat (MAP-01 / CORR-01), squared 2026-06-08.** The Phase 7–15 instrumentation and the
  five fresh concern sweeps were **`src/*.cts`-scoped** (the analyzers ran over `src/`; the
  correctness sweep reproduced engine behavior). The whole-repo coverage claim is honestly squared
  by the supplementary **`concerns/build-ci-hooks.md`** sweep, which extends coverage to the
  CI workflows (`.github/workflows/`), git hooks (`.githooks/`), runtime hooks (`hooks/*.js`), and
  the build/publish scripts (`scripts/`, `bin/install.js`) — the mapped-but-unswept subsystems the
  red-team flagged. That sweep is breadth-closing, not exhaustive (its own residual is noted there).
- **`priority = severity × confidence × ease(effort)`** where `ease`: S→5, M→3, L→1 (charter §2.1).
  Higher = better candidate to action. **`risk` is NOT in the product** — it is a separate
  sequencing/owner gate (a high-risk fix is flagged regardless of priority).
- **`problem_type`** is the MECE primary axis (exactly one of five). Tie-break order:
  Correctness > AI Gap > Bloat > Maintainability > UX.
- **Security tag** (see §1): security findings are typed `wrongness` (a security exposure *is* an
  unsafe/wrong outcome) and carry a `tag: security` annotation so the team can slice a security view.
- **`mechanical_vs_instructional`** is set on every prompt-corpus finding. `instructional` →
  EXECUTION-RISK, the recommendation is a relocate/restructure/tighten (never "delete this"), and a
  named `recall_gate` must pass before the cut (charter §3.5).

### Counts by problem-type (68 total)

| problem_type | count | plain name |
|--------------|------:|------------|
| `waste` | 17 | Bloat |
| `wrongness` | 16 | Correctness (incl. 1 security-tagged + 2 RECON + 2 supplementary F-CI-01/F-BUILD-01) |
| `human-friction` | 14 | UX (incl. 1 RECON) |
| `change-cost` | 14 | Maintainability (incl. 2 supplementary F-BUILD-02/F-BUILD-03) |
| `external-gap` | 7 | AI Gap (incl. 1 RECON) |

> **Supplementary sweep (`concerns/build-ci-hooks.md`, 2026-06-08):** the 4 build/CI/hooks findings
> (F-BUILD-01/02/03, F-CI-01) are appended below in §3.6. They raise the register from 64 → 68 and
> close the red-team's "mapped-but-never-swept" coverage gap. F-CI-01 + F-BUILD-01/03 carry
> `tag: security` / `tag: build-publish` as relevant.

### Priority distribution (top of register)

| priority | findings |
|---------:|----------|
| 125 | F-CORR-02 |
| 100 | F-AIGAP-02 |
| 75 | F-CORR-01, F-CORR-04, F-CORR-05, F-CORR-08, F-UX-01, F-UX-04, F-UX-05, F-UX-07, F-BUILD-02 |
| 60 | F-AIGAP-01, F-CORR-03, F-UX-02, F-UX-03, F-UX-09 |
| 50 | F-BLOAT-02, F-BLOAT-09, F-CORR-09, F-MAINT-10, F-MAINT-11, F-MAINT-12, F-CI-01, F-BUILD-01 |
| 45 | F-CORR-06, F-MAINT-02, F-MAINT-04, F-RECON-01 |
| 40 | F-CORR-10, F-MAINT-09, F-UX-14 |
| 36 | F-AIGAP-03, F-AIGAP-04, F-AIGAP-05, F-MAINT-07, F-RECON-03, F-RECON-04 |
| 30 | F-BLOAT-01, F-BLOAT-17, F-UX-08, F-UX-13 |
| 27 | F-RECON-02, F-RECON-05 |
| 25 | F-CORR-07b |
| 24 | F-BLOAT-10, F-BLOAT-16, F-CORR-07 |
| 20 | F-MAINT-01, F-MAINT-03, F-BUILD-03 |
| 18 | F-BLOAT-11, F-UX-10, F-UX-11 |
| 15 | F-BLOAT-13, F-BLOAT-14 |
| 12 | F-BLOAT-06, F-BLOAT-08, F-BLOAT-12, F-BLOAT-15, F-MAINT-05, F-MAINT-08, F-UX-06 |
| 10 | F-BLOAT-03 |
| 9 | F-BLOAT-05 |
| 8 | F-MAINT-06 |
| 6 | F-AIGAP-06, F-BLOAT-04, F-BLOAT-07 |

> **Priority caveat (read before sequencing).** The ICE product rewards small/high-confidence
> wins, so several *systemic* findings (the installer monolith F-MAINT-01, core.cts F-MAINT-03,
> the eager-token lever F-BLOAT-13, the two monolithic workflows F-BLOAT-14) score **low** purely
> because they are Large-effort. Their **severity** is high; they are sequenced in the roadmap as
> deliberate workstreams, not skipped because of a low product. Priority orders the *quick* work;
> severity + the roadmap's workstream grouping order the *deep* work.

---

## 1. The security-taxonomy decision (F-RECON-05; charter §1 has no security lens) — RESOLVED

**Decision: map security findings into `wrongness`, annotated `tag: security`. Do NOT add a sixth
problem-type.**

**Rationale.**
1. **The MECE 5-type axis is the LOCKED charter gate (Phase 6).** Adding a 6th type would mutate
   the locked partition and force a re-classification pass — exactly what the charter forbids
   mid-flight. The cleaner move is to find the existing type a security item belongs to.
2. **A security exposure IS a wrong/unsafe outcome.** Charter §1.1 frames `wrongness` as "where the
   pipeline can produce a **wrong or unreliable outcome**." A leaked secret, an unsanitized prompt
   re-entering context, or a live transitive CVE are all the pipeline producing an unsafe outcome —
   the same lens that owns silent-wrong-defaults owns unsafe-defaults. F-RECON-05 **already
   self-types `wrongness`** (RECONCILIATION.md:167).
3. **The tag preserves the team's ability to slice a security view** without polluting the partition.
   The roadmap renders a dedicated **Security & Exposure** workstream sub-group under Correctness so
   the prior's security items are first-class and not buried — the visibility the F-RECON-05
   taxonomy-flag demanded ("must not drop them").
4. **Severe-only escalation rule.** Per the charter's own suggestion (RECONCILIATION.md:176): a
   *severe* security item (sev ≥ 4) would be flagged at the top of the Correctness workstream; the
   carried-forward items here are sev 3 (a consistency gap, an opt-in leak path; the transitive-
   advisory facet is now RESOLVED — `npm audit` = 0 vulns 2026-06-08, claude-agent-sdk@0.2.141),
   so they sit mid-Correctness with the `security` tag, re-verify-residual intact.

**Applied:** F-RECON-05 = `wrongness` + `tag: security` (the prompt-injection-consistency,
`GSD_AUDIT_ARGS=1` mask, and `claude-agent-sdk` advisory cluster). F-RECON-02 (verifier-harness
tamper) keeps `external-gap` (it is an AI-trust-gate gap, not a present exposure) but carries
`tag: security` as a cross-slice. F-BLOAT-01 (the `ws`/SDK dep) stays `waste` but its supply-chain
facet is cross-referenced from F-RECON-05.

---

## 2. Phase-16 residual re-verification (D-07) — re-checked against LIVE code 2026-06-08

The priors behind F-RECON-03/04/05 are dated 2026-06-05 (pre-#604 rename). Per D-07 they were
re-verified against live `src/`/`bin/`/`gsd-core/`/`package.json` before sizing. **All three still
reproduce; one material environment change was found that *strengthens* F-RECON-04's framing.**

| Residual | Re-verify result (2026-06-08) | Verdict |
|----------|-------------------------------|---------|
| **F-RECON-03** (workflow-shim `$HOME`-hardcoded gsd-tools) | `grep -rln 'HOME/.claude' gsd-core/workflows/` -> still present in **10+ workflows** (ai-integration-phase, plan-review-convergence, health, stats, remove-phase, diagnose-issues, ...). `scripts/audit-workflow-script-paths.cjs` exists but does not yet assert version-skew or ban hardcoded `$HOME`. | **Reproduces.** Path prefix is now `gsd-core/workflows/` post-#604; the hazard class is unchanged. Size as carded. |
| **F-RECON-04** (build/publish fragility; `{{GSD_VERSION}}` stamped at install) | `package.json` now has **`build:lib` = `tsc -p tsconfig.build.json`** (NEW — the ADR-457 transpile pipeline is now LIVE; 96 `src/*.cts` -> 92 `gsd-core/bin/lib/*.cjs`). `prepublishOnly = build:lib && build:hooks`. `hooks/dist/` is gitignored so it ships only via the build. **`{{GSD_VERSION}}` is still resolved in `bin/install.js` (8 hits), NOT in `scripts/build-hooks.js` (0 hits)** — the exact install-time-not-build-time stamp seam the prior flagged. **DUPLICATE-CONST FACET RESOLVED** (supplementary sweep, see `concerns/build-ci-hooks.md` §3): `scripts/build-hooks.js:122-134` now `vm.Script`-validates every `.js` hook before copy and `exit 1`s on SyntaxError — the #1107/1109/1125/1161 class is closed; all 13 live JS hooks pass. | **Partially reproduces.** The `{{GSD_VERSION}}` install-time stamp seam is confirmed live (carded facet stands). The historically-realized duplicate-const shipping defect is **RESOLVED**; the residual is narrower → **F-BUILD-01** (.sh hooks skip the validator) + **F-BUILD-03** (no byte-identical drift gate). The "largely hand-maintained `.cjs`" charter §0 note is partially stale (real `tsc` build now exists). |
| **F-RECON-05** (security lens — prompt-injection / secret-log / advisory) | `src/security.cts`, `src/secrets.cts`, `scripts/prompt-injection-scan.sh` all present; `sanitizeForDisplay`/`maskIfSecret` live across `src/{init,audit,secrets,uat,security}.cts` + `observability/redaction.cts`. `package.json` still declares `@anthropic-ai/claude-agent-sdk ^0.2.84` and `ws 8.20.1`. | **Reproduces (injection/mask paths live), but the npm-advisory facet is RESOLVED.** `npm audit` re-run read-only 2026-06-08 (it does NOT mutate the lockfile — the prior deferral rationale was wrong; `git diff package-lock.json` confirmed empty after): **`found 0 vulnerabilities`** (info/low/moderate/high/critical all 0). The `^0.2.84` range resolved to the patched **`@anthropic-ai/claude-agent-sdk@0.2.141`**; `ws@8.20.1`. The prior's "1 high + 5 moderate via #3588" is **STALE/RESOLVED** — the recommended `package.json` overrides for that advisory are now a no-op. The security-LENS taxonomy point + the injection-consistency / `GSD_AUDIT_ARGS` mask facets **stand** (not run-verified). |

**One material environment delta to flag to the execution team:** the `build:lib` (`tsc`) step is
now wired (it was not, at charter-writing time). This means the `.cts`->`.cjs` build-at-publish
direction (ADR-457) is **actively in effect**, which (a) makes F-RECON-04's "tarball must be
self-consistent" gate *more* important (a real build now runs at publish), and (b) confirms the
charter §0 source-of-truth rule is correct (edit `src/*.cts`; `.cjs` is generated). No finding
changes type or severity from this delta; F-RECON-04's recommendation gains weight.

---

## 3. The scored register

> Each card is the charter §2.2 evidence card with a computed `priority`. Provenance IDs (`QW-*`,
> Phase-10 `F-WASTE-*`/`F-MAINT-*` leads, M1 `H-*` handoffs) are preserved. Cards are grouped by
> problem-type for the register; the roadmap re-projects them into workstreams.

### 3.1 Correctness — `wrongness` (14)

```yaml
- id: F-CORR-02
  problem_type: wrongness
  subsystem: engine
  file:line: "src/core.cts:545-552 (silent default) vs src/config.cts:639 / :429 (error+exit1); repro /tmp/p13c1"
  severity: 5
  effort: S
  risk: high
  confidence: 5
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  priority: 125
  recommendation: "Two tiers. (1) QUICK-WIN (QW-REL-01): one-line stderr warning in the loadConfig catch when the file exists-but-failed-to-parse, mirroring the unknown-key warning at core.cts:455. (2) CONTRACT DECISION (H-01): converge the parse-failure contract; deliberate decision + all-16-runtime regression sweep. Tier-1 immediately (spotlight-safe); tier-2 a scoped engine change."
  recall_gate: n/a
  debt_quadrant: prudent-inadvertent
  provenance: "QW-REL-01 (M1); escalated: error-vs-silent-default *contract* exceeds quick-win scope (M1 H-01)."

- id: F-CORR-01
  problem_type: wrongness
  subsystem: engine
  file:line: "src/verify.cts:66,102,148 — checkCount default 2 caps the file-existence reach (re-verified live 2026-06-08); repro /tmp/p13sum3"
  severity: 5
  effort: M
  risk: med
  confidence: 5
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  priority: 75
  recommendation: "Stop truncating to 2 — existence-check every file the summary marks Created/Modified (parse the explicit verbs to bound false positives), and drop the includes('/') filter so bare filenames are checked. A verifier-reach regression, not a perf knob."
  recall_gate: "verifier-reach / self-grading harness (N17 exogenous-grading + #664 self-grade corpus) must show the widened check does not spike false BLOCKERs"

- id: F-CORR-04
  problem_type: wrongness
  subsystem: engine
  file:line: "src/core.cts:372-374 (root-config catch swallows a parse failure when a workstream is active); repro /tmp/p13ws"
  severity: 3
  effort: S
  risk: med
  confidence: 5
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  priority: 75
  recommendation: "Fold into the H-01 contract (F-CORR-02): same parse-failure behavior for BOTH root and workstream config reads. At minimum, warn on the root-config catch. (Verify the config-get/loadConfig workstream-path divergence before any contract change.)"
  recall_gate: n/a
  debt_quadrant: prudent-inadvertent
  provenance: "M1 H-01 thread; surfaced fresh as the root-config half of the same swallow."

- id: F-CORR-05
  problem_type: wrongness
  subsystem: engine
  file:line: "src/core.cts:1919-1920 (empty-OUTPUT slug unguarded, re-verified live :1920); consumed src/commands.cts:1164,1169; repro /tmp/p13s2 (two names -> one 01- dir)"
  severity: 3
  effort: S
  risk: low
  confidence: 5
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  priority: 75
  recommendation: "When sanitization collapses a name to '' after stripping, fall back to a deterministic non-empty stub AND warn, so the directory is never 'NN-' and two phases never collide. Never return created:true for an empty-slug directory."
  recall_gate: n/a
  debt_quadrant: prudent-inadvertent
  provenance: "QW-REL-02 (M1); escalated: deeper repro shows collision/overwrite (data loss), severity cosmetic->correctness."

- id: F-CORR-08
  problem_type: wrongness
  subsystem: installer
  file:line: "package.json:47 (engines.node '>=22.0.0') vs docs ('Node.js 18+', 22 files match grep re-verified live 2026-06-08; 16 user-facing onboarding/translation docs + 6 audit/stream self-references); no process.version guard in bin/install.js; no .npmrc; repro /tmp"
  severity: 3
  effort: S
  risk: med
  confidence: 5
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  priority: 75
  recommendation: "Quick-win (QW-REL-05): correct the doc floor 18->22 across the 16 user-facing onboarding docs (22 total grep matches; 6 are audit/stream self-references) AND add a one-line process.version major-version guard in bin/install.js. RESIDUAL (H-04): the full per-runtime first-run trace across all 16 runtimes is a flagged follow-up (the 12.7k-LOC monolith, F-MAINT-01)."
  recall_gate: n/a
  debt_quadrant: reckless-inadvertent
  provenance: "QW-REL-05 (M1) + M1 H-04; resolved at evidence-ceiling, per-runtime trace residual flagged."

- id: F-CORR-03
  problem_type: wrongness
  subsystem: engine
  file:line: "src/verify.cts:123-134 (self_check derived from the summary's own prose); repro /tmp/p13sum3"
  severity: 4
  effort: M
  risk: med
  confidence: 5
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  priority: 60
  recommendation: "Treat self_check as advisory only. Keep it OUT of the pass gate (verify.cts:148 already requires missing.length===0) or pair it with an EXOGENOUS grade (per N17). A self-asserted 'all pass' is not evidence."
  recall_gate: "self-grading / exogenous-grading corpus (#664 + N17) before changing the pass formula"
  debt_quadrant: prudent-inadvertent

- id: F-CORR-09
  problem_type: wrongness
  subsystem: engine
  file:line: "src/verify.cts:372-375 (no-artifacts -> exit-0 error-object, no all_passed) and :385-405 (path-only artifact passes on existence alone); repro /tmp/p13v"
  severity: 2
  effort: S
  risk: low
  confidence: 5
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  priority: 50
  recommendation: "Make the no-artifacts branch return {all_passed:false, reason:'no artifacts declared'} (or exit 1) for a consistent shape; document that artifact verification is presence + optional content predicates, not correctness. Pairs with F-CORR-07."
  recall_gate: n/a
  debt_quadrant: prudent-inadvertent

- id: F-CORR-06
  problem_type: wrongness
  subsystem: engine
  file:line: "src/runtime-slash.cts:56 (formatGsdSlash claude default), :79-104 (resolveRuntime precedence), :98 (malformed-config catch -> claude); repro /tmp/p13rt"
  severity: 3
  effort: M
  risk: med
  confidence: 5
  runtime_blast_radius: multi
  mechanical_vs_instructional: n/a
  priority: 45
  recommendation: "Ensure bin/install.js persists runtime: into config at init for every non-Claude runtime so resolveRuntime never silently defaults; once F-CORR-02's parse warning lands, the resolver catch (:98) should also be observable. Verify the resolution chain end-to-end per runtime."
  recall_gate: n/a
  debt_quadrant: prudent-inadvertent
  provenance: "M1 H-02; full chain traced + reproduced; shares the H-01 root cause."

- id: F-CORR-10
  problem_type: wrongness
  subsystem: engine
  file:line: "src/verify.cts:696-744 (cmdValidateConsistency per-phase loop) and :841-849 (cmdValidateHealth roadmap read) — whole-loop empty catch"
  severity: 2
  effort: S
  risk: low
  confidence: 4
  runtime_blast_radius: claude-only
  mechanical_vs_instructional: n/a
  priority: 40
  recommendation: "Replace the whole-loop swallow with a per-phase warning so a scan failure DEGRADES the result (warning / 'scan_incomplete' flag) instead of silently passing. A validator must never report 'consistent' over a phase it could not read."
  recall_gate: n/a
  debt_quadrant: prudent-inadvertent

- id: F-CORR-07
  problem_type: wrongness
  subsystem: engine
  file:line: "repro /tmp/p13e4 (exit-code + shape matrix); roadmap-analyze error-object-with-exit-0 is variant-2 (src/roadmap.cts cmdRoadmapAnalyze branch)"
  severity: 2
  effort: M
  risk: low
  confidence: 4
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  priority: 24
  recommendation: "Define + document a 3-way contract: absent-queries keep exit-0 + structured default; hard-require-artifact commands keep exit-1; ELIMINATE the exit-0 error-object shape (roadmap analyze). Quick-win = document (QW-REL-03); alignment is the H-03 sweep (residual: sample, not exhaustive)."
  recall_gate: n/a
  provenance: "QW-REL-03 (M1) + M1 H-03; widened to a 3-contract taxonomy."

- id: F-CORR-07b
  problem_type: wrongness
  subsystem: engine
  file:line: "src/drift.cts:252-255 (exception -> skipped('exception:'+msg)) -> :259-270 (skipped sets message:'')"
  severity: 1
  effort: S
  risk: low
  confidence: 5
  runtime_blast_radius: claude-only
  mechanical_vs_instructional: n/a
  priority: 25
  recommendation: "On the exception branch only, set message from errMsg (keep message:'' for deliberate skips) so a real failure isn't echoed as a blank line."
  recall_gate: n/a
  debt_quadrant: prudent-deliberate
  provenance: "QW-REL-04 (M1); folds in unchanged."

# --- Reconciliation findings typed wrongness (Phase 16) ---

- id: F-RECON-03
  problem_type: wrongness
  subsystem: workflows
  tag: shim-resolution
  file:line: "PRIOR CONCERNS.md:32-52 (stale global gsd-tools wins PATH race; hardcoded $HOME/.claude/...gsd-tools.cjs bypasses the shim). LIVE re-verify 2026-06-08: 'HOME/.claude' still in 10+ gsd-core/workflows/*.md; scripts/audit-workflow-script-paths.cjs exists but no version-skew/$HOME assertion."
  severity: 3
  effort: M
  risk: med
  confidence: 4
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  priority: 36
  recommendation: "(1) emit a gsd_run --version assertion after shim resolution and fail loudly on skew; (2) replace hardcoded node \"$HOME/.claude/...gsd-tools.cjs\" with the resolved gsd_run across the 10+ workflows; (3) extend audit-workflow-script-paths.cjs to catch hardcoded $HOME + validate gsd_run query <handler> tokens against the registered handler manifest. RE-VERIFIED live; path prefix is now gsd-core/workflows/ post-#604."
  recall_gate: n/a
  provenance: "Prior CONCERNS 'Runtime Resolution Shim Hazards'; promoted (Phase 16), re-verified (Phase 17)."

- id: F-RECON-04
  problem_type: wrongness
  subsystem: installer
  tag: build-publish
  file:line: "PRIOR CONCERNS.md:8-20 ({{GSD_VERSION}} replaced at install not build; duplicate-const PostToolUse hook shipped to all users, #1107/#1109/#1125/#1161). LIVE re-verify 2026-06-08: package.json now has build:lib (tsc) + prepublishOnly=build:lib&&build:hooks; hooks/dist gitignored (.gitignore:18); {{GSD_VERSION}} still resolved in bin/install.js (8 hits), 0 in scripts/build-hooks.js — install-time stamp seam CONFIRMED."
  severity: 4
  effort: M
  risk: med
  confidence: 3
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  priority: 36
  recommendation: "(1) [LARGELY RESOLVED → see F-BUILD-01/03] the #1107-class duplicate-const ship is now prevented by build-hooks.js validateSyntax() (vm.Script per .js hook, exit 1 on SyntaxError); the RESIDUALS are F-BUILD-01 (.sh hooks skip the validator) + F-BUILD-03 (no byte-identical drift gate / commit hooks/dist). (2) [STANDS] stamp {{GSD_VERSION}} in build-hooks.js from package.json, not in install.js, so the tarball is self-consistent. MATERIAL DELTA: the build:lib tsc step is now LIVE — the publish path runs a real build, raising the importance of (2)."
  recall_gate: n/a
  provenance: "Prior CONCERNS 'Build/Publish Fragility'; promoted (Phase 16), re-verified + build:lib delta noted (Phase 17)."

- id: F-RECON-05
  problem_type: wrongness
  subsystem: engine
  tag: security
  file:line: "PRIOR CONCERNS.md:122-138 (prompt-injection sanitize consistency; GSD_AUDIT_ARGS=1 secret-leak; npm-audit 1 high+5 mod via claude-agent-sdk #3588 — STALE/RESOLVED, see below). LIVE re-verify 2026-06-08: src/security.cts + src/secrets.cts + scripts/prompt-injection-scan.sh present; sanitizeForDisplay/maskIfSecret live across src/{init,audit,secrets,uat,security}.cts + observability/redaction.cts; npm audit re-run read-only -> 0 vulnerabilities (claude-agent-sdk resolved to patched 0.2.141; ws 8.20.1)."
  severity: 3
  effort: M
  risk: low
  confidence: 3
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  priority: 27
  recommendation: "TAXONOMY: typed wrongness + tag:security per the Phase-17 decision (§1). The security-LENS taxonomy point stands. Carry-forwards: (1) ensure every gsd_run handler that writes .planning/*.md routes through sanitizeForDisplay(); (2) apply maskIfSecret on the GSD_AUDIT_ARGS=1 audit-log path; (3) [DOWNGRADED — npm-advisory facet RESOLVED] npm audit re-run read-only 2026-06-08 = 0 vulnerabilities (the ^0.2.84 range resolved to the patched claude-agent-sdk@0.2.141); the prior's '1 high + 5 mod via #3588' is STALE and the recommended package.json overrides are now a no-op — close this facet. Do NOT drop facets (1)/(2). NB: the deferral rationale 'would mutate lockfile state' was wrong — `npm audit` (read) does not touch the lockfile (verified empty git diff). See also F-CI-01: there is no `npm audit` gate in CI to catch future drift."
  recall_gate: n/a
  provenance: "Prior CONCERNS 'Security Considerations' + 'Dependencies at Risk'; promoted as the highest-value prior-only contribution."
```

### 3.2 AI Gap — `external-gap` (7)

```yaml
- id: F-AIGAP-02
  problem_type: external-gap
  subsystem: agents
  file:line: "gsd-core/bin/shared/model-catalog.json:116,122 (executor & verifier both resolvable to sonnet)"
  severity: 4
  effort: S
  risk: med
  confidence: 5
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: n/a
  priority: 100
  recommendation: "Make exogenous grading a first-class option: prefer a different model (or tier) for gsd-verifier than the one that produced the work; document the self-preference rationale in model-profiles. Where a runtime exposes only one model, fall back to a fresh-context independent pass + flag the residual. Make it a configurable preference, not a hard cross-vendor requirement."
  recall_gate: n/a

- id: F-AIGAP-01
  problem_type: external-gap
  subsystem: agents
  file:line: "agents/gsd-verifier.md:169-173 (VERIFIED/FAILED/UNCERTAIN, no numeric confidence)"
  severity: 4
  effort: M
  risk: med
  confidence: 5
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: instructional
  priority: 60
  recommendation: "Add a per-truth calibrated-confidence signal to the verifier output (1-5 or 0-1 with a rubric); route low-confidence VERIFIED verdicts to UNCERTAIN (abstain -> human). Keep the 3-state verdict; add confidence as a gating dimension, not a replacement."
  recall_gate: "verifier few-shot calibration corpus (gsd-core/references/few-shot-examples/verifier.md) extended with confidence-labelled examples; measure ECE-style gap before/after"

- id: F-AIGAP-03
  problem_type: external-gap
  subsystem: agents
  file:line: "agents/gsd-planner.md (must_haves: truths/artifacts/key_links); agents/gsd-verifier.md:122-153 (verifies must_haves only)"
  severity: 3
  effort: M
  risk: low
  confidence: 4
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: instructional
  priority: 36
  recommendation: "Add an optional must_NOT_haves / prohibitions list to plan frontmatter the verifier checks as FAILED-on-presence. Closes the 'tests pass but behaviour is wrong' gap with explicit negative predicates. Keep it optional; surface where security/regression risk is high. [Aligns with prohibition-probe #644.]"
  recall_gate: "a fixture set of spec-gaming cases (work that satisfies all must_haves but violates an unstated prohibition) the extended verifier must catch"

- id: F-AIGAP-04
  problem_type: external-gap
  subsystem: agents
  file:line: "gsd-core/references/few-shot-examples/verifier.md:25-36 (runs commands, but as the same agent's self-report)"
  severity: 3
  effort: M
  risk: med
  confidence: 4
  runtime_blast_radius: multi
  mechanical_vs_instructional: instructional
  priority: 36
  recommendation: "Where the runtime allows, capture exogenous execution evidence (test/command exit codes, a hook-collected receipt) the orchestrator reads independently of the verifier's prose. Frame as a hook/receipt the orchestrator parses; keep the verifier's reasoning on top. [See F-RECON-02 for the tamper-resistance extension.]"
  recall_gate: "cases where the verifier's transcribed result disagrees with an independently captured exit code — the wire must surface the disagreement"

- id: F-AIGAP-05
  problem_type: external-gap
  subsystem: workflows
  file:line: "gsd-core/workflows/execute-phase.md (86.8K single workflow); plan-phase.md @-includes 5+ references"
  severity: 3
  effort: M
  risk: med
  confidence: 4
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: instructional
  priority: 36
  recommendation: "Treat instruction position as a first-class concern in the largest workflows: pull the most load-bearing gates to the start/end of the context window. A restructure, not a cut. Pair any reorder with a recall/parity harness (charter §3.5). [Overlaps F-BLOAT-14 — same two workflows.]"
  recall_gate: "behavioural parity harness on the affected workflow (same inputs -> same gate decisions) before/after any reorder; edge-probe on the moved gate"

- id: F-RECON-02
  problem_type: external-gap
  subsystem: agents
  tag: security
  file:line: "PRIOR frontier-research-synthesis-2026-06-05.md:71,118 ('RewardHackingAgents 50% tamper -> LOCK the harness'); FRESH G2/G4 cover model-independence + exogenous receipt but NOT harness-locking"
  severity: 3
  effort: M
  risk: med
  confidence: 3
  runtime_blast_radius: multi
  mechanical_vs_instructional: n/a
  priority: 27
  recommendation: "Extend F-AIGAP-04: the exogenous-evidence channel must be TAMPER-RESISTANT — the agent that produces the work should not be able to edit the verification harness/receipt it is graded against. Treat the cited 50%-tamper magnitude as UNVERIFIED (1-of-3 spot-checked citations inverted); adopt the direction, re-derive the magnitude before quoting."
  recall_gate: "a fixture where the implementing agent attempts to weaken/edit the harness; the locked harness must reject it"
  provenance: "Prior-frontier insight (harness-locking) absent from the fresh AI-gap sweep; promoted. Aligns with first-party N17."

- id: F-AIGAP-06
  problem_type: external-gap
  subsystem: workflows
  file:line: "gsd-core/workflows/spec-phase.md:18-22 (ambiguity <=0.20 gate, fixed weights); few-shot-examples/verifier.md:5 (last_calibrated date, manual)"
  severity: 2
  effort: L
  risk: low
  confidence: 3
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  priority: 6
  recommendation: "Stand up a lightweight calibration measurement for the pipeline's own instruments: (a) does the ambiguity <=0.20 gate predict downstream replanning? (b) is the verifier's verdict calibrated against held-out judgment (ECE-style)? Make calibration a measured cadence, not a date stamp. Feeds F-AIGAP-01's threshold."
  recall_gate: n/a
```

### 3.3 Bloat — `waste` (17)

```yaml
- id: F-BLOAT-02
  problem_type: waste
  subsystem: tests
  file:line: "vitest.config.ts:9,17 (root: './sdk' for both projects) + gsd-tools.cjs dead `// SDK handler: sdk/src/query/...` comments (:648,:731,:803,:840)"
  severity: 2
  effort: S
  risk: low
  confidence: 5
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  priority: 50
  cross_check: "sdk/ retired (11918dcc, 4fa13cf9, 4c92aacc); git ls-files sdk/ -> 0. RECON A-6 confirms a broader SDK-retirement debris field (catalog/name-policy fallbacks) — confidence raised."
  recommendation: "Remove the dead ./sdk vitest projects (or repoint) and strip the dead SDK-handler comment breadcrumbs. Pure waste. NB vitest.config.ts is a root file the exec team edits, not the audit."
  recall_gate: n/a

- id: F-BLOAT-09
  problem_type: waste
  subsystem: agents
  file:line: "agents/gsd-planner.md:6-11 dead `# hooks:` stub (24 agents); /gsd:<cmd> colon-form refs (grep -rho '/gsd:' agents/ commands/ gsd-core/ | wc -l -> 1073: agents 96 + commands 38 + gsd-core 939, re-verified live 2026-06-08); gsd-core/references/mandatory-initial-read.md (@-included by 5 files)"
  severity: 2
  effort: S
  risk: low
  confidence: 5
  runtime_blast_radius: all-16
  mechanical_vs_instructional: mechanical
  priority: 50
  cross_check: "QW-TOK-01 inert YAML; QW-TOK-03 textual normalization; QW-TOK-07 single-include lock. None on the engine behavior path."
  recommendation: "Ship the three M1 mechanical wins: strip the dead hooks stub (24 agents); normalize the 1073 colon-form refs to /gsd-<cmd>; lock mandatory-initial-read.md as the single include. Verbatim-duplicate/inert confirmation only. [Colon-form overlaps F-UX-08/F-RECON-01.]"
  recall_gate: n/a
  provenance: "QW-TOK-01, QW-TOK-03, QW-TOK-07 (M1) — folded in, re-ranked."

- id: F-BLOAT-01
  problem_type: waste
  subsystem: engine
  tag: security
  file:line: "package.json (\"ws\": \"8.20.1\"; @anthropic-ai/claude-agent-sdk ^0.2.84)"
  severity: 2
  effort: S
  risk: med
  confidence: 3
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  priority: 30
  cross_check: "Repo-wide grep for require('ws')/from 'ws' -> ZERO; ws is transitive via the agent SDK. claude-agent-sdk has zero static import sites but IS the documented dynamic-spawn dep — do NOT remove on a static grep alone. Supply-chain facet cross-refs F-RECON-05."
  recommendation: "Probe whether ws is a required SDK peer at runtime; if not, drop the direct dep. Treat the SDK separately: confirm a live spawn path before any removal. Pairs with F-RECON-05 (re-run npm audit)."
  recall_gate: n/a
  provenance: "F-WASTE-01 (Phase 10)"

- id: F-BLOAT-17
  problem_type: waste
  subsystem: engine
  file:line: "src/core.cts:544-551 (loadConfig SILENTLY defaults on parse failure) vs src/config.cts:417 (config-get ERRORS)"
  severity: 2
  effort: M
  risk: high
  confidence: 5
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  priority: 30
  cross_check: "Two implementations of 'read config.json' with OPPOSITE failure semantics. The WRONG-OUTCOME aspect is F-CORR-02; per tie-break (Correctness > Bloat) the defect half is Phase 13, the redundancy half is here."
  recommendation: "Bloat lens: converge on a single config-read path with one defined failure contract. The contract decision is the F-CORR-02 / H-01 deliverable — do not pre-empt it here."
  recall_gate: n/a
  provenance: "QW-REL-01 (M1) — the redundancy facet; correctness facet is F-CORR-02."

- id: F-BLOAT-10
  problem_type: waste
  subsystem: agents
  tag: security
  file:line: "8 agents carry <documentation_lookup> but md5 = 4 variants; gsd-executor/gsd-planner/gsd-phase-researcher carry a `command -v ctx7` guard + 'Do NOT use npx --yes' warning the other 5 lack"
  severity: 2
  effort: M
  risk: high
  confidence: 4
  runtime_blast_radius: all-16
  mechanical_vs_instructional: instructional
  priority: 24
  cross_check: "QW-TOK-02 — a duplicate that wasn't. 3 of 8 blocks are a security-hardened variant. A naive 'factor to one include' loses the supply-chain guard."
  recommendation: "Factor into AT MOST two shared includes — a guarded variant (for the 3 shell-executing agents) and an unguarded variant — never one. The 3 executing agents MUST retain the `command -v ctx7` guard + warning."
  recall_gate: "ctx7-guard parity harness — md5/diff all 8 blocks before & after; collapsing to npx --yes is a blocker"
  provenance: "QW-TOK-02 (M1) — re-tagged instructional by the M1 adversarial review; folded in."

- id: F-BLOAT-16
  problem_type: waste
  subsystem: engine
  file:line: "11 per-family routers: src/{state,verify,verification,phase,phases,roadmap,init,check,validate,task,agent}-command-router.cts"
  severity: 2
  effort: M
  risk: high
  confidence: 4
  runtime_blast_radius: multi
  mechanical_vs_instructional: n/a
  priority: 24
  cross_check: "11 routers + cjs-command-router-adapter, same shape; verify-/verification- and phase-/phases- are near-twin pairs. alias-drift lint (check:alias-drift) already guards router<->alias consistency."
  recommendation: "Investigate a shared table-driven router factory; decide whether verify-/verification- and phase-/phases- can merge or need a documented distinction. High fix-risk — sequence carefully, recall-gate every family."
  recall_gate: n/a

- id: F-BLOAT-11
  problem_type: waste
  subsystem: agents
  file:line: "100 files recurring bucket (tokenize.mjs); command desc capped (lint-descriptions.cjs <=100) but AGENT desc uncapped (agents/gsd-planner.md:3)"
  severity: 2
  effort: M
  risk: med
  confidence: 3
  runtime_blast_radius: all-16
  mechanical_vs_instructional: instructional
  priority: 18
  cross_check: "The only reliably-EAGER bytes (frontmatter description is enumerated in the system prompt). Agent descriptions are uncapped, unlike commands."
  recommendation: "Tighten (do not cut) the 100 description strings; consider extending the <=100-char lint cap to agent descriptions. Each trimmed description must still route correctly."
  recall_gate: "agent-routing recall harness — each trimmed description must still route to the correct agent before the cut lands"
  provenance: "QW-TOK-04 (M1) — folded in."

- id: F-BLOAT-13
  problem_type: waste
  subsystem: agents
  file:line: "token-report.json totals.recurringUpperBound = 173,834 (100 files: 33 agents=141,634 + 67 commands=32,200)"
  severity: 3
  effort: L
  risk: high
  confidence: 5
  runtime_blast_radius: all-16
  mechanical_vs_instructional: instructional
  priority: 15
  cross_check: "Exact BPE totals. 81% of the eager tax is agent bodies; the lever is install-profile tiering NOT body-prose deletion. QW-UX-01's profile prompt sets cold-start at install."
  recommendation: "The dominant eager-cost lever is install-PROFILE tiering, not corpus cutting: confirm core/standard/full profiles gate the agent+command surface so a newcomer eager-loads a small subset. Body-level cuts (F-BLOAT-10/11/12) are secondary + gated."
  recall_gate: "per-profile parity — core/standard must still drive the plan->execute loop after any agent demotion"
  provenance: "M1 Token-stream handoff (now measured: 173,834 eager via gpt-tokenizer)."

- id: F-BLOAT-14
  problem_type: waste
  subsystem: workflows
  file:line: "token-report.json ondemand: execute-phase.md 22,199; plan-phase.md 21,365 vs discuss-phase/modes/*.md lazy-load split"
  severity: 3
  effort: L
  risk: high
  confidence: 5
  runtime_blast_radius: all-16
  mechanical_vs_instructional: instructional
  priority: 15
  cross_check: "Each is ~5.5-5.7% of the ENTIRE on-demand corpus. discuss-phase already proves a lazy mode-file pattern. [Overlaps F-AIGAP-05 — same two workflows, position facet.]"
  recommendation: "ESCALATED beyond quick-win: replicate discuss-phase's lazy mode-file split for execute-phase and plan-phase. Restructure, never delete."
  recall_gate: "plan/execute edge-probe + verifier-reach harness — must pass IDENTICALLY mode-split vs monolithic; any drop in caught edges is a blocker"
  provenance: "QW-TOK-06 (M1, ICE 12); escalated."

- id: F-BLOAT-08
  problem_type: waste
  subsystem: agents
  file:line: "reports/token-report.json (33 agents = 141,634 recurring tokens — 81% of the eager tax); largest gsd-planner.md 11,779, gsd-debugger.md 10,783"
  severity: 3
  effort: L
  risk: high
  confidence: 4
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  priority: 12
  cross_check: "33 agents installed; plan/execute/code-review/autonomous dominate dispatch. The agent count is the eager-cost lever; body-prose cuts are F-BLOAT-10/11."
  recommendation: "Treat agent COUNT and per-agent body SIZE as two levers. Count: confirm install-profiles tiering gates which agents ship per profile. Size: F-BLOAT-11/12. Do not delete agents on low dispatch — many are recovery/specialist."
  recall_gate: n/a

- id: F-BLOAT-12
  problem_type: waste
  subsystem: skills
  file:line: "commands/gsd/graphify.md (3,623 recurring tok, full Step 0/1/config-gate inlined) vs commands/gsd/plan-phase.md (941 tok, @-includes the workflow)"
  severity: 3
  effort: L
  risk: high
  confidence: 4
  runtime_blast_radius: all-16
  mechanical_vs_instructional: instructional
  priority: 12
  cross_check: "The one command that inlines its whole workflow instead of @-including a workflows/ file. Eager cost paid every session graphify is surfaced."
  recommendation: "Relocate the inlined procedural workflow out of commands/gsd/graphify.md into a gsd-core/workflows/graphify.md the wrapper @-includes. Relocate verbatim, never delete; moves ~2,700 tok eager->on-demand."
  recall_gate: "graphify behavior-equivalence harness — config-gate STOP branches must fire identically before & after"
  provenance: "QW-TOK-05 (M1) — folded in."

- id: F-BLOAT-15
  problem_type: waste
  subsystem: engine
  file:line: "src/init.cts (fileCx 419, 1996 LOC) cross-file clones init<->roadmap (x3), init<->config, init<->commands (jscpd); init fan-out 11"
  severity: 3
  effort: L
  risk: med
  confidence: 4
  runtime_blast_radius: multi
  mechanical_vs_instructional: n/a
  priority: 12
  cross_check: "init/commands/config are three top-fan-out aggregators. The clones indicate init.cts RE-IMPLEMENTS aggregation those modules provide. Conceptual-redundancy twin of F-MAINT-05."
  recommendation: "Converge the aggregation concept: have init.cts COMPOSE roadmap/config/commands accessors instead of re-deriving them inline. Fix once with F-MAINT-05."
  recall_gate: n/a

- id: F-BLOAT-06
  problem_type: waste
  subsystem: skills
  file:line: "evidence/usage-full.md#USAGE-SFLAG-01..11 (only 11 distinct slash flags across 65 typed cmds; resume-work owns 5)"
  severity: 2
  effort: M
  risk: med
  confidence: 2
  runtime_blast_radius: multi
  mechanical_vs_instructional: n/a
  priority: 12
  cross_check: "Most invocations pass prose, not flags. confidence_limiter: single-author (Phase 11)."
  recommendation: "Tier the flag surface as progressive disclosure: keep all flags reachable; demote rarely-touched ones into an advanced/--help tier. Do NOT remove any flag."
  recall_gate: n/a

- id: F-BLOAT-07
  problem_type: waste
  subsystem: skills
  file:line: "evidence/usage-full.md#USAGE-CMD-01..15 (15 distinct commands typed / ~67 installed; top-4 = 70.8%) + src/clusters.cts (core_loop=6, ns_meta=6)"
  severity: 3
  effort: L
  risk: med
  confidence: 2
  runtime_blast_radius: multi
  mechanical_vs_instructional: n/a
  priority: 6
  cross_check: "~55 commands typed 0x in this log — NOT evidence of irrelevance (power-user log; newcomer path unobserved). Supports tiering the hot path forward, not pruning the tail. confidence_limiter: single-author."
  recommendation: "Tier the slash menu via clusters.cts: surface the 6 core-loop commands as 'start here'; demote the long tail. NO command removed. Overlaps F-UX-06 + QW-UX-07. Safety/recovery (resume-work, undo, pause-work, health) criticality-exempt."
  recall_gate: n/a
  provenance: "QW-UX-07 (M1, quick-win slice); escalated to Phase 15."

- id: F-BLOAT-05
  problem_type: waste
  subsystem: docs
  file:line: "jscpd markdown 11.73% (13,456 dup lines / 389 .md files); sample: docs/zh-CN/references/verification-patterns.md vs gsd-core/references/verification-patterns.md (shared 150-397 code-fence)"
  severity: 3
  effort: L
  risk: med
  confidence: 3
  runtime_blast_radius: all-16
  mechanical_vs_instructional: instructional
  priority: 9
  cross_check: "The zh-CN <-> gsd-core match is NOT an identical file (300 changed lines): jscpd matched shared untranslated English code-fence blocks. Corpus structure, not delete-the-file."
  recommendation: "Per-pair classify before any cut. Mechanical share = repeated English code-fences (factor into a single shared non-translated fence include). Instructional share = duplicated reference prose -> relocate/single-source behind a recall gate, never delete. Pairs with F-BLOAT-13."
  recall_gate: "edge-probe / workflow-parity harness before trimming reference prose; verbatim-diff before factoring any code-fence"
  provenance: "F-WASTE-02 (Phase 10)"

- id: F-BLOAT-03
  problem_type: waste
  subsystem: engine
  file:line: "src/config-types.cts:1-62 (RuntimeTiers, ModelPolicyConfig — 0 refs) + knip 'Unused exported types (6)'"
  severity: 1
  effort: S
  risk: low
  confidence: 2
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  priority: 10
  cross_check: "config-types.cts is NOT a dead module; 2 of 4 interfaces are unreferenced. The 6 knip types each need a per-type grep (knip misses structural/type-only use)."
  recommendation: "AGGREGATE (charter §3.4.3). Confirm each unused interface individually; drop those with zero structural consumers. One aggregate lead, not 8 cards."
  recall_gate: n/a
  provenance: "F-MAINT-02 + F-MAINT-AGG-08 (Phase 10), re-lensed waste."

- id: F-BLOAT-04
  problem_type: waste
  subsystem: engine
  file:line: "reports/knip-output.txt (88 'unused exports') — e.g. command-aliases.cts:22, state-command-router.cts default, runtime-homes.cts:165"
  severity: 1
  effort: M
  risk: high
  confidence: 2
  runtime_blast_radius: multi
  mechanical_vs_instructional: n/a
  priority: 6
  cross_check: "11 *-command-router default exports (string dispatch), 8 alias tables, 5 migration defaults, rest entry-point-consumed. NONE confirmed dead — knip is src/-scoped and blind to out-of-src + workflow-shim consumers."
  recommendation: "Do NOT treat as a delete list. Re-run knip with all entry points declared and investigate only residual that survives the wider graph. Aggregate, not 88 cards."
  recall_gate: n/a
  provenance: "F-WASTE-AGG-01 (Phase 10)"
```

### 3.4 Maintainability — `change-cost` (12)

```yaml
- id: F-MAINT-10
  problem_type: change-cost
  subsystem: docs
  file:line: "instrumentation/DYNAMIC-INDIRECTION.md (Site 0 misses the workflow-shim require channel: gsd-core/workflows/code-review.md:53,344, autonomous.md, plan-phase.md)"
  severity: 2
  effort: S
  risk: low
  confidence: 5
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  priority: 50
  cross_check: "Phase 10 cleared code-review-flags/fallow-runner/ui-safety-gate as live via workflow markdown bash shims. Conclusions correct; inventory incomplete."
  recommendation: "Add a 'Site 5 — workflow markdown bash shims' entry to the dynamic-indirection inventory so future dead-code passes don't re-flag these. A credibility improvement to the audit method."
  recall_gate: n/a
  debt_quadrant: prudent-inadvertent
  provenance: "F-MAINT-01 (Phase 10)"

- id: F-MAINT-11
  problem_type: change-cost
  subsystem: installer
  file:line: "bin/install.js:686 ('66' skills — live 67; 'core 7' — live 8; 'standard ~13' — live 14) + docs/tutorials/your-first-project.md:36-40 ('86 skills') — none derived from src/install-profiles.cts"
  severity: 2
  effort: S
  risk: low
  confidence: 5
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  priority: 50
  cross_check: "Multiple hand-written counts, all stale because none is derived from install-profiles.cts. QW-UX-03/04 fix the CURRENT instances; this is the DRIFT MECHANISM."
  recommendation: "Derive every surfaced skill count programmatically from install-profiles.cts so help text / tutorial / README cannot drift again. Same durable fix as F-UX-13."
  recall_gate: n/a
  debt_quadrant: prudent-inadvertent
  provenance: "QW-UX-03, QW-UX-04 (M1) + M1 UX handoff; maintainability facet."

- id: F-MAINT-12
  problem_type: change-cost
  subsystem: engine
  file:line: "reports/jscpd (typescript, 2.69% / 83 clones) — densest: audit.cts:467-478 vs 537-548 (7 clones); clusters init.cts (11), state.cts (9), install-profiles.cts (8)"
  severity: 2
  effort: S
  risk: low
  confidence: 5
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  priority: 50
  cross_check: "TypeScript-format clones only — NO .cts<->.cjs pair counted (charter §0). Clone density concentrates in the SAME files flagged oversized (init/state/audit)."
  recommendation: "Extract a shared listPhaseDirs(planDir) helper (audit.cts is densest). Fold the rest into F-MAINT-03/05 decompositions, not a standalone de-dup pass."
  recall_gate: n/a
  debt_quadrant: prudent-inadvertent
  provenance: "F-MAINT-03 + F-MAINT-AGG-04 (Phase 10)"

- id: F-MAINT-02
  problem_type: change-cost
  subsystem: installer
  file:line: "src/runtime-artifact-layout.cts:51 `_require('../../../bin/install.js')` (engine reaches BACK into the 12.7k-LOC installer)"
  severity: 3
  effort: M
  risk: high
  confidence: 5
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  priority: 45
  cross_check: "depcruise shows runtime-artifact-layout depending only on install-profiles — the back-edge is a LAZY, test-guarded require inside a function, absent from the graph. Bidirectional in behavior, one-way/invisible in the graph."
  recommendation: "Break the back-edge: extract the converter functions install.js exposes into a small shared module both sides import one-way. A worked example of why coupling must be traced by behavior, not edges."
  recall_gate: n/a
  debt_quadrant: prudent-inadvertent
  provenance: "PIPELINE-TRACE §5#4 + SUBSYSTEM-MAP §3.2"

- id: F-MAINT-04
  problem_type: change-cost
  subsystem: engine
  file:line: "src/config.cts (78 commits = highest churn after core; fileCx 139, 724 LOC, maxFn 41)"
  severity: 3
  effort: M
  risk: med
  confidence: 5
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  priority: 45
  cross_check: "HOTSPOTS rank 5. 78 commits on a config aggregator signals an UNSTABLE CONTRACT. Distinct from F-BLOAT-17 (the redundant double-implementation of config-LOAD)."
  recommendation: "Stabilize the config contract: a single typed config schema (config-schema.cts exists in E1) as the one source of truth. High churn is the symptom; the diffuse contract is the cause."
  recall_gate: n/a
  debt_quadrant: prudent-inadvertent

- id: F-MAINT-09
  problem_type: change-cost
  subsystem: engine
  file:line: ".gitignore (95 explicit /gsd-core/bin/lib/*.cjs lines, one per emitting source)"
  severity: 2
  effort: S
  risk: med
  confidence: 4
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  priority: 40
  cross_check: "Per-line enumeration means each ADR-457 migration must hand-add its emitted .cjs; a forgotten line COMMITS a build artifact. 95 drift points. MORE relevant now that build:lib (tsc) is live (F-RECON-04 delta)."
  recommendation: "Replace the 95 enumerated lines with a gsd-core/bin/lib/**/*.cjs glob (or generated block). Verify no hand-tracked exception is masked. NB .gitignore is protected — the exec team edits it, not the audit."
  recall_gate: n/a
  debt_quadrant: prudent-deliberate
  provenance: "F-OBS-DEP-01 (Phase 10)"

- id: F-MAINT-07
  problem_type: change-cost
  subsystem: installer
  file:line: "bin/install.js (12,727 LOC) + gsd-core/bin/gsd-tools.cjs (1,928 LOC) — both outside src/, so outside the c8-over-src/ coverage threshold and the McCabe scan"
  severity: 3
  effort: M
  risk: med
  confidence: 4
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  priority: 36
  cross_check: "Coverage threshold is '70% lines over gsd-core/bin/lib/*.cjs', not bin/install.js or gsd-tools.cjs. The two largest, riskiest change surfaces sit OUTSIDE the gate. RECON: prior independently named the same gap -> confidence-raised."
  recommendation: "Bring bin/install.js + gsd-tools.cjs under an explicit coverage target. Pairs with F-MAINT-01 decomposition — smaller modules are testable where the monolith is not. The per-runtime first-run trace (H-04) is the integration-test gap."
  recall_gate: n/a
  debt_quadrant: prudent-inadvertent
  provenance: "M1 handoff H-04; the test-gap facet. RECON-confidence-raised."

- id: F-MAINT-01
  problem_type: change-cost
  subsystem: installer
  file:line: "bin/install.js (12,727 LOC, 216 top-level functions — wc -l + grep -c verified)"
  severity: 4
  effort: L
  risk: high
  confidence: 5
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  priority: 20
  cross_check: "Absent from HOTSPOTS only because it is .js outside src/; HOTSPOTS metric-caveat flags it must NOT be skipped. A size/change-cost claim, not dead code."
  recommendation: "Top decomposition target. Propose module extraction along the runtime-artifact-layout / per-runtime-converter seams (the matrix's 16 arms are natural cut lines). Pairs with F-MAINT-02 + F-MAINT-07."
  recall_gate: n/a
  debt_quadrant: prudent-inadvertent
  provenance: "F-MAINT-05 (Phase 10) / SUBSYSTEM-MAP §3.3"

- id: F-MAINT-03
  problem_type: change-cost
  subsystem: engine
  file:line: "src/core.cts (602 fileCx, 2054 LOC, maxFn 108, churn 142, fan-in 24/out 9 — HOTSPOTS rank 1, churn x cx 85,484)"
  severity: 4
  effort: L
  risk: high
  confidence: 5
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  priority: 20
  cross_check: "complexity.json (McCabe) + git churn. fan-in 24 = hub + orchestrator; any defect has all-16 blast. The single highest-risk file in the engine."
  recommendation: "Evaluate DECOMPOSITION: the single 108-complexity function is the priority unit — split the hub (config-load, model-resolution, git/shell-projection) from the orchestrator. Sequence with F-CORR-02/04 (config) which live in this file."
  recall_gate: n/a
  debt_quadrant: prudent-inadvertent
  provenance: "F-MAINT-06 (Phase 10)"

- id: F-MAINT-05
  problem_type: change-cost
  subsystem: engine
  file:line: "src/init.cts (fileCx 419 = 2nd-highest, 1996 LOC, churn 5) + 11 intra-file clones + cross-file clones init<->roadmap/config/commands"
  severity: 3
  effort: L
  risk: med
  confidence: 4
  runtime_blast_radius: multi
  mechanical_vs_instructional: n/a
  priority: 12
  cross_check: "Huge LOW-churn aggregator (HOTSPOTS 'separately flagged'). Its clones re-implement aggregation other modules provide (-> F-BLOAT-15)."
  recommendation: "Decompose init.cts; the clone clusters collapse as a side effect. Change-cost view; F-BLOAT-15 the conceptual-redundancy view of the same module — fix once, both close."
  recall_gate: n/a
  debt_quadrant: prudent-inadvertent
  provenance: "F-MAINT-07 (Phase 10)"

- id: F-MAINT-08
  problem_type: change-cost
  subsystem: engine
  file:line: "src/verify.cts (maxFn 150 — single hottest function in the engine; fileCx 359, 1615 LOC, churn 2)"
  severity: 3
  effort: L
  risk: high
  confidence: 4
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  priority: 12
  cross_check: "churn x cx UNDER-ranks it (#22) because churn is low, but a cx-150 function is the most defect-prone UNIT and sits on the verification path. The DEFECTS are F-CORR-01/03/09/10."
  recommendation: "Decompose the 150-complexity function. The correctness defects in the same function (F-CORR-01/03/09/10) are best fixed during the decomposition."
  recall_gate: n/a
  debt_quadrant: prudent-inadvertent
  provenance: "F-CORR-LEAD-01 (Phase 10) — change-cost facet."

- id: F-MAINT-06
  problem_type: change-cost
  subsystem: engine
  file:line: "depcruise.json fan-in: shell-command-projection 29, core 24, planning-workspace 17, frontmatter 11, runtime-slash 10"
  severity: 2
  effort: L
  risk: high
  confidence: 4
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  priority: 8
  cross_check: "A change to shell-command-projection (fan-in 29) or core (fan-in 24) ripples across the whole engine — high change-cost by concentration, even with no cycles."
  recommendation: "A concentration MAP for sequencing, not a refactor demand: any change to the top-5 fan-in seams needs the widest regression net. Stable narrow interfaces reduce future change-cost."
  recall_gate: n/a
  debt_quadrant: prudent-deliberate
```

### 3.5 UX — `human-friction` (14)

```yaml
- id: F-UX-01
  problem_type: human-friction
  subsystem: docs
  file:line: "README.md (grep -niE 'profile|minimal|surface' -> 0 hits; Quickstart :40-56)"
  severity: 3
  effort: S
  risk: low
  confidence: 5
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  priority: 75
  recommendation: "Add a 2-line profile callout to the README Quickstart (core ~130 / standard ~700 / full ~1,200 desc tokens) and link docs/how-to/install-minimal-and-add-skills.md. Additive; flags already exist."
  recall_gate: n/a
  provenance: "QW-UX-02 (M1, ICE 100); re-confirmed live — README restructured but still 0 profile mentions."

- id: F-UX-04
  problem_type: human-friction
  subsystem: installer
  file:line: "bin/install.js:11864-11877 (both 'Done!' branches -> only /gsd-new-project + Discord)"
  severity: 3
  effort: S
  risk: low
  confidence: 5
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: n/a
  priority: 75
  recommendation: "Add <=2 lines to the 'Done!' message: orient (/gsd-help) and, when installed at 'full', slim (/gsd-surface profile core). Render via the per-runtime slash form so it's correct on Codex. Keep /gsd-new-project the primary step."
  recall_gate: n/a
  provenance: "QW-UX-05 (M1, ICE 64)."

- id: F-UX-05
  problem_type: human-friction
  subsystem: docs
  file:line: "docs/tutorials/your-first-project.md:36-38 ('86 skills' + 'GSD Core ready') vs bin/install.js:9952-10095,11866; live commands/gsd/*.md = 67"
  severity: 3
  effort: S
  risk: low
  confidence: 5
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  priority: 75
  recommendation: "Replace the tutorial's fabricated output block with the real installer lines; drop the hard-coded '86'. See F-UX-13/F-MAINT-11 for the single drift-proof count source."
  recall_gate: n/a
  provenance: "QW-UX-04 (M1, ICE 75); re-confirmed live — still '86 skills'."

- id: F-UX-07
  problem_type: human-friction
  subsystem: skills
  file:line: "commands/gsd/new-project.md:33 ('Run /gsd:plan-phase 1') — colon anti-pattern on the first command-to-command handoff"
  severity: 3
  effort: S
  risk: low
  confidence: 5
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: mechanical
  priority: 75
  recommendation: "Replace '/gsd:plan-phase' with the canonical '/gsd-plan-phase' (or a runtime-rendered token). Part of the F-UX-08 sweep but flagged separately — it sits on the newcomer's first handoff. [See F-RECON-01 for the install-transform nuance.]"
  recall_gate: n/a

- id: F-UX-02
  problem_type: human-friction
  subsystem: installer
  file:line: "src/install-profiles.cts:499-507 (default->'full'); bin/install.js interactive prompt (no profile arm)"
  severity: 4
  effort: M
  risk: med
  confidence: 5
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: n/a
  priority: 60
  recommendation: "Add an interactive 'Which profile? [core / standard / full]' prompt, default highlighted, gated on isTTY and skipped when --profile/--minimal is passed. Non-interactive/CI keeps 'full' back-compat. The single highest-leverage newcomer moment — sets the F-BLOAT-13 cold-start lever."
  recall_gate: n/a
  provenance: "QW-UX-01 (M1, ICE 75; UX+Token co-lens). QW-UX-06 (standard-as-default) is a sub-decision of this prompt."

- id: F-UX-03
  problem_type: human-friction
  subsystem: installer
  file:line: "docs/how-to/install-minimal-and-add-skills.md:35,47-49 (~130 vs ~1,200 desc tokens); default=full per F-UX-02"
  severity: 3
  effort: S
  risk: low
  confidence: 4
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  priority: 60
  recommendation: "Surface the cold-start cost beside the profile choice (in the F-UX-02 prompt and the F-UX-01 README callout). Token quantification is the Bloat sweep; this card owns the discoverability facet."
  recall_gate: n/a
  provenance: "QW-UX-01 cold-start facet (M1)."

- id: F-UX-09
  problem_type: human-friction
  subsystem: skills
  file:line: "commands/gsd/resume-work.md (no argument-hint frontmatter); evidence/usage-full.md#USAGE-SFLAG-05/07/08/09/10; help/modes/full.md:268-275"
  severity: 3
  effort: S
  risk: low
  confidence: 4
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: instructional
  priority: 60
  recommendation: "Add an argument-hint to resume-work covering its load-bearing flags (e.g. [--interactive] [--gaps-only] [--wave N] [--stopped-at] [--resume-file]) and document them in /gsd-help full mode. Surface the 2-3 most-used first; tier the rest behind --help. confidence-limiter: single-author."
  recall_gate: "lint:descriptions (<=100 char) — argument-hint/description must stay within the gate"

- id: F-RECON-01
  problem_type: human-friction
  subsystem: skills
  file:line: "PRIOR ARCHITECTURE.md:250 ('legacy /gsd: never emitted') vs :258 ('leaks into agent prose after install') vs CONCERNS.md:107-111 (#3584); FRESH F-UX-07/08 (18 source bodies emit /gsd:); LIVE bin/install.js:2176,:2288,:10299-10305 (transform allow-listed to {claude,qwen,hermes})"
  severity: 3
  effort: M
  risk: low
  confidence: 5
  runtime_blast_radius: multi
  mechanical_vs_instructional: mechanical
  priority: 45
  cross_check: "transformContentToHyphen(body) for SKILL.md; normalizeAgentBodyForRuntime gated on {claude,qwen,hermes}; Gemini self-converts (:2288). Colon-form IS user-facing on the SOURCE side and on any installed runtime NOT in the allow-list."
  recommendation: "Reconcile to ONE truth: SOURCE corpus still carries colon-form (F-UX-07/08 right); INSTALLED Claude/Qwen/Hermes is transformed (M1 right for those 3); it LEAKS for runtimes outside the allow-list (prior right). The durable fix (single emitter / lint + fix-slash-commands.cjs at SOURCE) is STILL warranted. Do NOT rely on the install transform as the fix."
  recall_gate: n/a
  provenance: "Reconciles M1 QW-TOK-03 vs Phase-15 F-UX-07/08 vs PRIOR (D-06). F-UX-07/08 remain the system of record."

- id: F-UX-14
  problem_type: human-friction
  subsystem: skills
  file:line: "src/clusters.cts:97-104 (ns_meta = 6 facades); commands/gsd/ns-*.md (6 files)"
  severity: 2
  effort: S
  risk: low
  confidence: 4
  runtime_blast_radius: claude-only
  mechanical_vs_instructional: instructional
  priority: 40
  recommendation: "Clarify (do NOT delete) that the 6 ns-* entries are alternate dispatchers — mark descriptions as 'advanced dispatcher'. If noisy, tier them out via the ns_meta cluster (already disable-able), never delete. ns-* still dispatch identically."
  recall_gate: "lint:descriptions (<=100 char) + lint:skill-deps closure — confirm no ns-* requires/closure break"
  provenance: "QW-UX-08 (M1, ICE 48, UX+Token co-lens)."

- id: F-UX-08
  problem_type: human-friction
  subsystem: skills
  file:line: "grep -rln '/gsd:' commands/gsd/*.md -> 18 files (incl. new-project, plan-phase, quick, ship, verify-work, progress, review)"
  severity: 2
  effort: M
  risk: low
  confidence: 5
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: mechanical
  priority: 30
  recommendation: "Normalize all 18 colon-form '/gsd:' examples in shipped command bodies to canonical hyphen. Prefer a lint/codemod so it cannot regress; scripts/fix-slash-commands.cjs is the existing seam. [F-UX-12: the same 18 files include the power-user hot path.] [See F-RECON-01.]"
  recall_gate: n/a

- id: F-UX-13
  problem_type: human-friction
  subsystem: docs
  file:line: "src/install-profiles.cts:27-58 (authoritative profile sets) vs hardcoded counts: docs/tutorials/your-first-project.md:36 ('86'); bin/install.js --help (stale '66'/'7'/'~13'); live = 67"
  severity: 2
  effort: M
  risk: low
  confidence: 5
  runtime_blast_radius: none
  mechanical_vs_instructional: mechanical
  priority: 30
  recommendation: "Establish ONE drift-proof skill-count source derived from src/install-profiles.cts + the live commands/gsd/ listing, consumed everywhere a count is shown. (QW-UX-03 fixes current instances; this card + F-MAINT-11 own the durable single-source fix.)"
  recall_gate: n/a
  debt_quadrant: prudent-inadvertent
  provenance: "QW-UX-03 (M1, ICE 50) + M1 Phase-15 handoff."

- id: F-UX-06
  problem_type: human-friction
  subsystem: skills
  file:line: "live count 67; src/clusters.cts:33-40 (core_loop=6) vs :97-104 (ns_meta=6); gsd-core/workflows/help.md (curated tour is opt-in)"
  severity: 3
  effort: L
  risk: med
  confidence: 4
  runtime_blast_radius: multi
  mechanical_vs_instructional: instructional
  priority: 12
  recommendation: "Tier the slash menu so the 6 core-loop commands read as 'start here' (progressive disclosure — NO command removed). Lean on the cluster grouping + Qwen-style numeric 'priority' frontmatter where supported; otherwise fall back to the F-UX-02 default-profile lever so the menu is short by construction."
  recall_gate: "lint:descriptions (<=100 char) + lint:skill-deps closure after any frontmatter/description change"
  provenance: "QW-UX-07 (M1, ICE 24) — explicit M1 Phase-15 handoff; folded in + deepened."

- id: F-UX-10
  problem_type: human-friction
  subsystem: skills
  file:line: "evidence/usage-full.md#USAGE-SFLAG-* (20 tokens / 11 distinct flags; resume-work owns 5); load-bearing: --from/--to, --files/--phase-dir"
  severity: 2
  effort: M
  risk: low
  confidence: 3
  runtime_blast_radius: multi
  mechanical_vs_instructional: instructional
  priority: 18
  recommendation: "Treat the lightly-used flag surface as a PROGRESSIVE-DISCLOSURE lead, NOT a cut list: keep --from/--to and --files/--phase-dir first-class; tier the long tail behind --help. No flag deleted on low usage; safety/recovery criticality-exempt. confidence-limiter: single-author."
  recall_gate: "lint:descriptions; any flag re-tiering must keep the flag reachable via --help (no removal)"

- id: F-UX-11
  problem_type: human-friction
  subsystem: skills
  file:line: "evidence/usage-full.md#USAGE-SKILL-05/09/11/12 (superpowers:* interleaved among most-dispatched skills)"
  severity: 2
  effort: M
  risk: low
  confidence: 3
  runtime_blast_radius: multi
  mechanical_vs_instructional: instructional
  priority: 18
  recommendation: "Design GSD's menu/help to coexist with a crowded '/'-menu: keep the GSD block self-identifying and scannable, reinforcing F-UX-06's 'start here' tiering. Do NOT assume GSD owns the session. confidence-limiter: single-author."
  recall_gate: n/a
```

> **F-UX-12** is recorded as a cross-reference, not a standalone card: the colon-form anti-pattern
> (F-UX-08) also lands in the power-user hot path (`quick.md`, `plan-phase.md`, `progress.md`,
> `verify-work.md`, `ship.md`, `review.md` are among the 18). Carded once at F-UX-08.

### 3.6 Supplementary — Build / CI / Hooks / Scripts (4; `concerns/build-ci-hooks.md`, 2026-06-08)

> Added in the M2 adversarial-review remediation to close the red-team's "mapped-but-never-swept"
> coverage gap (CI workflows, git hooks, runtime hooks, build/publish scripts). Two `wrongness`
> (F-CI-01, F-BUILD-01) + two `change-cost` (F-BUILD-02, F-BUILD-03). Narrative + the "what held
> up" assessment (action pinning, token scope, publish gating all STRONG) are in
> `concerns/build-ci-hooks.md`. **The F-RECON-04 hooks/dist duplicate-const defect class
> (#1107/1109/1125/1161) is verified RESOLVED there** — `build-hooks.js` now syntax-validates every
> `.js` hook before copy.

```yaml
- id: F-BUILD-02
  problem_type: change-cost
  subsystem: tests             # build/dev hygiene — .githooks gate the contributor commit path
  file:line: ".githooks/pre-commit:9-47 (10 generated-file freshness guards keyed on ^sdk/src/... + gsd-core/bin/lib/*.generated.cjs); git ls-files sdk/ -> 0; 9 of 10 referenced check:*-fresh npm scripts absent from package.json (only check:alias-drift survives)"
  severity: 3
  effort: S
  risk: low
  confidence: 5
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  priority: 75                 # 3 × 5 × ease(S=5)
  cross_check: "Same SDK-retirement debris field as F-BLOAT-02 + RECON A-6. Confirmed live: gsd-core/bin/lib/secrets.generated.cjs does NOT exist; command-aliases.cjs lacks the .generated suffix the guard greps for; `npm run check:secrets-fresh` would fail 'Missing script' if a guard ever fired. The gate is doubly dead (trigger paths + npm scripts both gone)."
  recommendation: "Re-point the pre-commit freshness guards at the live src/*.cts -> gsd-core/bin/lib/*.cjs build seam (build:lib is now tsc), or delete the dead arms and keep only check:alias-drift. A hook that silently no-ops while looking like a gate is the worst of both. NB .githooks is protected — the exec team edits it, not the audit."
  recall_gate: n/a
  debt_quadrant: reckless-inadvertent
  provenance: "Supplementary sweep build-ci-hooks.md (M2 review remediation); SDK-retirement debris twin of F-BLOAT-02."

- id: F-CI-01
  problem_type: wrongness
  subsystem: tests             # CI process (.github/workflows)
  tag: security
  file:line: "grep -rln 'npm audit' .github/ scripts/ -> NONE; security-scan.yml runs injection/base64/secret scans + check-npm-integrity.cjs (lockfile consistency only); .github/dependabot.yml = weekly npm+actions"
  severity: 2
  effort: S
  risk: low
  confidence: 5
  runtime_blast_radius: none   # CI-only
  mechanical_vs_instructional: n/a
  priority: 50                 # 2 × 5 × ease(S=5)
  cross_check: "Distinct from check-npm-integrity (validates lockfile<->manifest consistency, NOT advisories). This is the CI-enforcement half of F-RECON-05's dep-surface facet. npm audit is currently 0 vulnerabilities (2026-06-08) so the gate would pass clean today — the gap is the MISSING gate, not a live vuln."
  recommendation: "Add an advisory gate (`npm audit --audit-level=high`, read-only) to security-scan.yml so a newly-disclosed transitive CVE fails a PR rather than waiting on weekly dependabot. Start advisory, ratchet to blocking. Pairs with F-RECON-05."
  recall_gate: n/a
  provenance: "Supplementary sweep build-ci-hooks.md (M2 review remediation); CI-enforcement half of F-RECON-05."

- id: F-BUILD-01
  problem_type: wrongness
  subsystem: installer         # build/publish seam (scripts/build-hooks.js)
  tag: build-publish
  file:line: "scripts/build-hooks.js:158-159 (if hook.endsWith('.js') gates validateSyntax — .sh skip) and :205 (subdir loop, same .js-only gate); 4 shipped .sh hooks copied without validation"
  severity: 2
  effort: S
  risk: low
  confidence: 5
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  priority: 50                 # 2 × 5 × ease(S=5)
  cross_check: "The same defect CLASS the .js validateSyntax() guards (#1107/1109/1125/1161 — a broken hook shipped to all users). The .js gate is the fix; the .sh hooks (community + graphify, opt-in) are the uncovered remainder. Opt-in lowers blast vs always-on .js hooks -> sev 2 not 4."
  recommendation: "Extend build-hooks.js validation to .sh hooks (`bash -n`), degrading to a warning where a runner lacks bash. Closes the shell half of the #1107 defect class the .js validator already closes."
  recall_gate: n/a
  provenance: "Supplementary sweep build-ci-hooks.md (M2 review remediation); residual of the now-RESOLVED F-RECON-04 .js fix."

- id: F-BUILD-03
  problem_type: change-cost
  subsystem: installer
  tag: build-publish
  file:line: ".gitignore (hooks/dist gitignored — git ls-files hooks/dist/ -> 0); scripts/build-hooks.js regenerates hooks/dist on build:hooks/prepublishOnly only; no CI gate asserts shipped hooks/dist is byte-identical to a fresh build"
  severity: 1
  effort: S
  risk: low
  confidence: 4
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  priority: 20                 # 1 × 4 × ease(S=5)
  cross_check: "F-RECON-04 recommendation (1). The validateSyntax() guard already prevents the WORST outcome (a syntactically-broken hook shipping); this is the lower-severity 'no drift detection' residual. Sev 1 BECAUSE the syntax gate now exists."
  recommendation: "Optional hardening: commit hooks/dist (reviewable in PRs) OR add a CI step that runs build:hooks and `git diff --exit-code hooks/dist`. Lower priority now that validateSyntax() closes the corruption path; adds drift visibility only."
  recall_gate: n/a
  debt_quadrant: prudent-deliberate
  provenance: "Supplementary sweep build-ci-hooks.md (M2 review remediation); = F-RECON-04 recommendation (1) residual."
```

---

## 4. Aggregate-only / recorded-not-carded (charter §3.4.3, §3.4.4)

- **F-CORR §0.1 intentional patterns** — empty cleanup catches, no-throw hub, drift `{skipped:true}`,
  per-migration catch-and-continue: **re-confirmed clean, NOT defects** (recorded so the team sees
  the assessment, not a gap).
- **CHANGELOG.md 192.7 KB scaling watch** (prior CONCERNS "Scaling Limits") — neither waste nor a
  present wrong-result; **recorded, not scored** (RECONCILIATION §1c). A watch item for the team.
- **knip 88 "unused exports" + 6 "unused types"** — captured as F-BLOAT-04 / F-BLOAT-03; explicitly
  **not** delete-lists (most are live via string dispatch).

---

## 5. Provenance & coverage ledger

- **M1 -> M2 fold-in:** all 20 M1 quick-wins accounted for. 18 absorbed into a deep card via
  `provenance` (QW-REL-01->F-CORR-02; QW-REL-02->F-CORR-05; QW-REL-03->F-CORR-07; QW-REL-04->F-CORR-07b;
  QW-REL-05->F-CORR-08; QW-UX-01->F-UX-02/03; QW-UX-02->F-UX-01; QW-UX-03->F-UX-13/F-MAINT-11;
  QW-UX-04->F-UX-05; QW-UX-05->F-UX-04; QW-UX-07->F-UX-06/F-BLOAT-07; QW-UX-08->F-UX-14;
  QW-TOK-01/03/07->F-BLOAT-09; QW-TOK-02->F-BLOAT-10; QW-TOK-04->F-BLOAT-11; QW-TOK-05->F-BLOAT-12;
  QW-TOK-06->F-BLOAT-14). QW-TOK-08 folded into QW-TOK-05 at M1. QW-UX-06 is a sub-decision of F-UX-02.
- **M1 handoffs:** H-01->F-CORR-02/04; H-02->F-CORR-06; H-03->F-CORR-07/09; H-04->F-CORR-08 +
  F-MAINT-07 (residual flagged).
- **Phase-16 reconciliation:** 12 agreements (confidence-raising, not re-scored), 5 new F-RECON cards
  (all in this register), 2 prior-only folded/recorded.
- **Citation discipline:** every card cites `src/*.cts`, the `.md` corpus, or a concrete repro. No
  `gsd-core/bin/lib/*.cjs` path is a citation target. The few `gsd-core/bin/shared/model-catalog.json`
  and `gsd-core/references/`/`gsd-core/workflows/` citations are the prompt-corpus / shared data, not
  the compiled engine (allowed).

*Plan-only attestation: this file is a new deliverable under `docs/audit/comprehensive/`. No
protected path was edited; no commit; no GitHub write. Live `src/`/`bin/`/`package.json` were read
read-only for the D-07 residual re-verification.*
