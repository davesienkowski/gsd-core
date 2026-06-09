# Adversarial M2 Review — Synthesis & Remediation Summary

> **What this is.** The single synthesis of BOTH Milestone-2 red-team passes
> (`ADVERSARIAL-M2-EVIDENCE.md` — evidence/citation integrity; `ADVERSARIAL-M2-PROCESS.md` —
> process/coverage integrity), the remediation applied in response, and an overall trustworthiness
> verdict for maintainers.
> **Mode:** audit-and-plan only. Remediation edited only `docs/audit/comprehensive/**`; no
> `package.json`/`src/`/`gsd-core/`/`workflows/`/`agents/`/`commands/`/`bin/`/`.github/`/`.githooks/`/
> `hooks/`/`scripts/`/`.gitignore` was modified; no commit; no GitHub write. `npm audit` was run
> read-only (does not mutate the lockfile; `git diff package-lock.json` empty).
> **Date:** 2026-06-08.

---

## 1. The two red-teams, synthesized

Two hostile, falsify-first reviews attacked M2 from different angles. Both concluded the work is
**trustworthy to act on**, with a small, bounded set of fixes — no verdict-changing defect.

### 1a. Findings by severity (both passes)

| Source | Finding | Severity | Class | Status after remediation |
|--------|---------|:--------:|-------|--------------------------|
| PROCESS §5 GAP 2 | **3 mapped subsystems never concern-swept** (CI workflows, git hooks, runtime hooks/scripts) | **HIGH** | coverage | **CLOSED** — new `concerns/build-ci-hooks.md` (Task A); 4 cards added |
| PROCESS §5 GAP 1 | `npm audit` deferred on a wrong rationale; when run, **falsifies** the stale advisory facet | HIGH | evidence | **FIXED** — re-run = 0 vulns; F-RECON-05 facet downgraded RESOLVED |
| PROCESS §5 GAP 3 | RECONCILIATION "every prior section addressed" overstated (2 sections missing) | MEDIUM | completeness | **FIXED** — Fragile-Areas + Performance rows added to the ledger |
| EVIDENCE A-09 | "724 colon-form refs" stale (reproduces 1073) | MINOR | count | **FIXED** — 724→1073 in bloat.md, FINDINGS, roadmap |
| EVIDENCE A-05 | "18 docs say Node 18+" stale (grep reproduces 22) | MINOR | count | **FIXED** — corrected to 22 (16 user-facing + 6 audit self-refs) |
| EVIDENCE A-10 | `pipeline-correctness.md` cites prior-experiment IDs (N17/N18/#664/#584) under a "firewall honored" attestation | MINOR | firewall consistency | **FIXED** — one-line clarification: IDs are independent knowledge, not firewalled-prior seepage |
| EVIDENCE A-03 | F-AIGAP-02 "golden/balanced/budget … same model" true only for **balanced** | MINOR | framing | NOTED (the cited evidence `:116,122` + the gap stand; see §5 residual) |
| EVIDENCE A-04/A-08 | off-by-one line citations (slug `1919-1920`→`1919-1921`; validate catches `742/847`→`743/848`) | MINOR | cosmetic | NOTED (cosmetic; cited-only cards otherwise correct — see §5 residual) |

**Net:** 1 HIGH coverage gap (closed), 1 HIGH evidence falsification (fixed), 1 MEDIUM completeness
overstatement (fixed), 5 MINOR hygiene items (3 fixed, 2 noted as cosmetic residuals). **No BLOCKER;
no finding was invalidated.**

### 1b. The four guard verdicts (EVIDENCE pass)

| Guard | Verdict | Note |
|-------|---------|------|
| **Firewall integrity** | **MOSTLY HONORED** → now consistent | The one blemish (prior-experiment IDs in a sweep) is squared by the §B4 clarification; the IDs are independent knowledge that also lives in user memory. Findings rest on reproduced code. |
| **False-positive guard** | **PASS (strong)** | Every dead/unused claim carries an explicit `cross_check:`; knip's 45 + madge's 88 reported as **0 confirmed dead**; no dead code manufactured. |
| **Load-bearing guard** | **PASS** | Every prompt-corpus instructional finding routes through a named recall/parity gate; none says "delete." The one mechanical card (F-BLOAT-09 colon-form) is defensibly inert. |
| **AI-gap citation** | **PASS (solid)** | 5 of 7 sources WebFetched verbatim (exceeds the 3 requested); zero inverted/overstated citations; the riskiest (S3's 50/84/20/40 stats) checks out against full text at the correct URL. |

### 1c. Requirements coverage (PROCESS pass, strict)

12 SATISFIED, 3 PARTIAL (MAP-01, RECON-01, CORR-01-scope-caveat), 0 OVERSTATED, 0 MISSING. The
three PARTIALs were the breadth/completeness gaps above — all three are now squared:

- **MAP-01 / CORR-01** (src-scoped, not whole-repo) → Task A extends coverage to CI/hooks/scripts;
  a scope-caveat note now squares the whole-repo claim (FINDINGS §0).
- **RECON-01** ("every section addressed" overstated) → the two missing prior sections added.

---

## 2. What was fixed (Tasks A / B / C) — before / after

### Task A — supplementary coverage sweep (the HIGH gap)
New deliverable **`concerns/build-ci-hooks.md`** sweeps the previously-unswept CI workflows
(`.github/workflows/`), git hooks (`.githooks/`), runtime hooks (`hooks/*.js`), and the
build/publish scripts (`scripts/`, `bin/install.js`). **4 new findings** (register 64 → 68):

| id | type | sev | pri | one-line |
|----|------|:---:|:---:|----------|
| **F-BUILD-02** | change-cost | 3 | 75 | pre-commit hook fully stale — all 10 guards key on the retired `sdk/` tree; 9 of 10 `check:*-fresh` scripts no longer exist in package.json |
| **F-CI-01** | wrongness (sec) | 2 | 50 | no `npm audit`/advisory gate anywhere in CI (only lockfile-consistency + weekly dependabot) |
| **F-BUILD-01** | wrongness (build) | 2 | 50 | `build-hooks.js` syntax-validates `.js` hooks but skips the 4 shipped `.sh` hooks |
| **F-BUILD-03** | change-cost (build) | 1 | 20 | no byte-identical drift gate on the gitignored `hooks/dist` (= F-RECON-04 rec #1) |

**The hooks/dist defect-class question (red-team's specific ask): RESOLVED.** The F-RECON-04
duplicate-const PostToolUse error shipped to all users (#1107/#1109/#1125/#1161) is **closed in the
current tree** — `scripts/build-hooks.js:122-134` now `vm.Script`-validates every `.js` hook before
copy and `process.exit(1)`s on any SyntaxError; the file's docstring cites those exact issues; all
13 live JS hooks compile clean. The residuals are the narrower F-BUILD-01 (`.sh` uncovered) and
F-BUILD-03 (no drift gate). What *held up strong* (recorded honestly, not a gap): all 60 CI action
refs SHA-pinned; all 23 workflows declare `permissions:`; release uses OIDC trusted publishing +
`--provenance` + `environment: npm-publish` gate + install-smoke prerequisite; no
`pull_request_target` checks out PR-head untrusted code.

### Task B — hygiene & reconciliation fixes (every number re-verified LIVE)

| Item | Before | After (re-verified 2026-06-08) |
|------|--------|-------------------------------|
| **B1 F-BLOAT-09 colon count** | "724 colon-form refs" | **1073** (`grep -rho '/gsd:' agents/ commands/ gsd-core/ \| wc -l`; agents 96 + commands 38 + gsd-core 939) — fixed in bloat.md, FINDINGS, IMPROVEMENT-ROADMAP |
| **B2 F-CORR-08 Node-doc count** | "18 files / 18 onboarding docs" | **22** grep matches (16 user-facing onboarding/translation docs + 6 audit/stream self-references) — fixed in pipeline-correctness.md + FINDINGS |
| **B3 F-RECON-05 npm advisory** | "1 high + 5 moderate via claude-agent-sdk #3588" (deferred, deferral rationale wrong) | **`npm audit` = 0 vulnerabilities** (claude-agent-sdk resolved to patched **0.2.141**; ws 8.20.1; lockfile unchanged). That facet **downgraded to RESOLVED**; the security-LENS taxonomy point + injection/mask facets stand. |
| **B4 firewall attestation** | N17/N18/#664/#584 cited under "firewall honored" | one-line clarification added: the experiment IDs are independent knowledge (user memory / public PRs), not the firewalled `.planning/codebase/*` or `*-2026-06-05.md` priors (which were not opened) |
| **B5 RECONCILIATION completeness** | "every prior section addressed" overstated | "Fragile Areas" (lock deadlock) + "Performance Bottlenecks" added to the ledger; deadlock recorded as **superseded** (live 10s timeout + 30s stale-recovery in `planning-workspace.cts:117-184` defeats the *indefinite* deadlock); performance recorded-not-carded (no MECE lens) |
| **B6 scope caveat** | whole-repo claim read as exhaustive | MAP-01/CORR-01 caveat added (FINDINGS §0): fresh sweep was `src/*.cts`-scoped; Task A extends coverage to CI/hooks/scripts |

### Task C — register / roadmap / surface folded
`FINDINGS.md` (counts 64→68, type distribution wrongness 14→16 + change-cost 12→14, priority
distribution, new §3.6 with the 4 cards), `IMPROVEMENT-ROADMAP.md` (matrix + Workstream A rows
A17/A18 + Workstream D rows D3b/D13 + spotlight checklist + convergence threads + owner-slot),
`TRACKING-SURFACE-POPULATED.md` (4 rows, 64→68, security/build saved-views). **Priority math
re-checked:** F-BUILD-02 = 3×5×ease(S=5) = 75; F-CI-01 / F-BUILD-01 = 2×5×5 = 50; F-BUILD-03 =
1×4×5 = 20. Register, roadmap, and tracking surface all reconcile at **68**.

---

## 3. What held up (no remediation needed)

- **Register integrity is airtight.** The PROCESS pass independently rebuilt every count: 64 cards,
  type distribution exact, **priority math 64/64 correct (zero arithmetic errors)**, ranking follows
  the scores, roadmap↔register 1:1 (no drops, no phantoms), M1 fold-in with no silent drop. The 4
  Task-C additions preserve this (now 68/68, re-verified).
- **Top defects reproduced live.** Both passes independently reproduced the two critical correctness
  findings against the compiled engine: F-CORR-01 (verify-summary 2-file cap → silent pass on
  fabricated work) and F-CORR-02 (malformed config silently reverts to defaults on the hot path).
- **The four guards passed** (§1b) — false-positive, load-bearing, AI-gap-citation, and (after B4)
  firewall.
- **Security taxonomy decision is sound** — mapping security into `wrongness` + `tag: security`
  rather than a 6th MECE type; no prior security item silently dropped.

---

## 4. The one bonus result worth flagging

The red-team's most-feared shipping defect — the historically-realized hooks/dist duplicate-const
that broke hooks for **all users** across four issues — is **fixed in the live tree** and the audit
now records it. The audit's value here is not a new defect but a *verified closure*: a maintainer
reading F-RECON-04 + `concerns/build-ci-hooks.md` §3 sees that the worst build/publish risk is
handled, and the residuals are two low-severity hardening items.

---

## 5. Residuals (honestly carried)

- **A-03 framing** — F-AIGAP-02's prose says executor/verifier "can resolve to the same model" in
  the golden/balanced/budget profiles; strictly that overlap is **balanced-only** (golden: opus vs
  sonnet; budget: sonnet vs haiku). The cited evidence (`model-catalog.json:116,122`) and the gap
  are correct; the framing could be narrowed to "balanced profile." Not fixed here (it does not
  change the finding or its score); flagged for the execution team.
- **A-04 / A-08 off-by-one line citations** — slug card cites `core.cts:1919-1920` (live empty-output
  guard is at `:1919-1921`); validate-catches card cites `742/847` (live `743/848`). Cosmetic; both
  findings are otherwise reproduced/confirmed. Flagged, not chased.
- **Task-A breadth, not depth** — `build-ci-hooks.md` read `release.yml`/`security-scan.yml` in full
  + grepped pinning/permissions/PR-target/`npm audit` across all 23 workflows + both `.githooks` +
  `build-hooks.js` in full; it did **not** read all ~50 scripts line-by-line. A per-script defect
  sweep of the `scripts/` tail is the flagged residual (the highest-risk build/publish seam was
  covered).

---

## 6. Overall verdict

**M2 is trustworthy for a 4+ person team to execute against without re-auditing.**

The two adversarial passes attacked evidence integrity and process/coverage from opposite
directions and converged on the same conclusion: the scored register is internally airtight, the
top correctness defects reproduce live, the four guards hold, and the AI-gap citation discipline is
exemplary. The defects they found were **hygiene and breadth**, not finding-invalidating — and all
the verdict-relevant ones are now fixed: the HIGH coverage gap is closed (CI/hooks/scripts swept,
+4 cards, register 64→68), the falsified advisory facet is corrected (`npm audit` = 0), the
completeness overstatement is squared, the two stale counts are re-verified live (1073, 22), and the
firewall attestation is made literally consistent. The register, roadmap, and tracking surface all
reconcile at 68. Two cosmetic residuals (one framing narrowing, two off-by-one line citations)
remain, flagged for the execution team; neither changes any finding or its priority.

A maintainer can open `IMPROVEMENT-ROADMAP.md`, pick an item, and act — including the new
build/CI/hooks workstream rows — with the confidence the charter demanded: findings checkable
without re-deriving them.

*Plan-only attestation: this synthesis is a new deliverable under
`docs/audit/comprehensive/review/`. The remediation it summarizes edited only files under
`docs/audit/comprehensive/`. No protected path was modified; no commit; no GitHub write. `npm audit`
ran read-only.*
