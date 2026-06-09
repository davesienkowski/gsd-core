> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# IMPROVEMENT-ROADMAP.md — The Hybrid-Matrix Improvement Roadmap (Milestone 2)

> **The audit's delivered product.** A 4+ person execution team should be able to open this file,
> pick an item, and execute against it without re-auditing. This is a **view** over the single
> scored register `FINDINGS.md` — it adds workstream grouping, sequencing, and ownership; it does
> not introduce new findings or re-score them.
> **Requirements:** ROADMAP-01 (hybrid matrix, problem-type primary, subsystem-tagged, grouping
> revisited), ROADMAP-02 (each item: priority, effort/risk, subsystem, runtime blast radius,
> citation; assignable across 4+).
> **Mode:** Plan-only. Every item is a recommendation; nothing here was executed.
> **Assembled:** 2026-06-08.

---

## 0. The matrix structure — and the explicit grouping call (ROADMAP-01)

The charter mandates a **hybrid matrix: problem-type primary (the MECE 5-type axis),
subsystem-tagged (secondary)**. ROADMAP-01 also requires this phase to **revisit the grouping
against the evidence and state whether a different structure serves the team better.**

**The call: keep problem-type as the primary axis, with three deliberate adjustments.**

1. **Problem-type primary is the right spine.** The 68 findings partition cleanly across the five
   types (17 waste / 16 wrongness / 14 human-friction / 14 change-cost / 7 external-gap; the +4 vs
   the original 64 are the supplementary build/CI/hooks sweep added in the M2 review remediation),
   and the
   types map 1:1 to owner skill-sets (a correctness fix is engine work; a UX fix is docs/installer
   work; an AI-gap fix is agent-prompt work). Grouping by subsystem instead would scatter the
   "verifier reach = spec reach" thread (which spans engine `verify.cts`, the agent prompts, and
   the workflows) across three buckets and hide the single most important theme.

2. **Adjustment A — a `Security & Exposure` sub-group under Correctness.** The charter's MECE axis
   has no security type. Per the §1 decision in `FINDINGS.md`, security items are typed `wrongness`
   + `tag: security`; the roadmap surfaces them as a named sub-group so they are first-class and
   not buried (F-RECON-05, F-RECON-02, the F-BLOAT-01 supply-chain facet). This is the one place
   the pure-MECE projection is annotated, deliberately.

3. **Adjustment B — a cross-cutting `Spotlight Quick-Wins` checklist tier** (§2) that *re-projects*
   the highest-priority, lowest-risk items regardless of type. The Mintlify spotlight is
   time-boxed; a team needs a single "do these first" list, not five per-type lists to reconcile.
   This does not replace the per-type grouping — it is an additional view over the same register.

4. **Adjustment C — `verify.cts` and `core.cts` are tracked as *files-with-multiple-findings*** (a
   "fix-once, close-many" annotation), because the deepest leverage is decomposing one file that
   carries a correctness defect AND a change-cost burden AND (for verify.cts) an AI-gap. The
   matrix keeps the type-primary grouping but flags these convergence points so owners sequence the
   refactor and the defect fixes together rather than colliding.

**What did NOT change:** the five-type spine, the tie-break order (Correctness > AI Gap > Bloat >
Maintainability > UX), and the ICE priority formula. The evidence did not justify re-architecting
the taxonomy — only annotating it where security, time-pressure, and file-convergence demanded.

### The matrix at a glance (problem-type x subsystem)

| problem-type \\ subsystem | engine | installer | workflows | agents | skills | docs | tests |
|---|---|---|---|---|---|---|---|
| **Correctness** (`wrongness`) | CORR-01/02/03/04/05/06/07/07b/09/10, RECON-05(sec) | CORR-08, RECON-04(build), BUILD-01(build) | RECON-03(shim) | — | — | — | CI-01(sec) |
| **AI Gap** (`external-gap`) | — | — | AIGAP-05/06 | AIGAP-01/02/03/04, RECON-02(sec) | — | — | — |
| **Bloat** (`waste`) | BLOAT-01/03/04/15/16/17 | — | BLOAT-14 | BLOAT-08/09/10/11/13 | BLOAT-05/06/07/12 | BLOAT-05 | BLOAT-02 |
| **Maintainability** (`change-cost`) | MAINT-03/04/05/06/08/09/12 | MAINT-01/02/07/11, BUILD-03(build) | — | — | — | MAINT-10 | BUILD-02 |
| **UX** (`human-friction`) | — | UX-02/03/04 | — | — | UX-06/07/08/09/10/11/14, RECON-01 | UX-01/05/13 | — |

(`BLOAT-05` and `MAINT-11`/`F-UX-13` straddle two subsystems; shown in both for the matrix view.
The 4 supplementary build/CI/hooks findings — F-CI-01, F-BUILD-01/02/03 — sit under `tests` (CI/hook
process) and `installer` (build/publish seam); detail in §1 workstreams A and D and in
`concerns/build-ci-hooks.md`.)

---

## 1. Workstreams (problem-type primary) — assignable to 4+ owners

Five workstreams, each ownable by one maintainer (or a pair for the two large ones). Within each,
items are ordered by `priority` (the §2.1 ICE product), with the **high-severity / large-effort
systemic items broken out as a "deep" sub-tier** so they are not lost behind quick wins. Every row
carries: priority, severity, effort, risk, subsystem, runtime blast radius, citation.

### Workstream A — Correctness (`wrongness`, 16) — OWNER: engine / core.cts

> The headline theme: **silent-wrong-result paths on load-bearing instruments** (config hot path +
> work verifier). "Verifier reach = spec reach." Two critical defects gate trust in the whole pipeline.

| # | id | pri | sev | eff | risk | subsystem | blast | finding (citation) |
|---|----|----:|:---:|:---:|:----:|-----------|-------|--------------------|
| A1 | **F-CORR-02** | **125** | 5 | S | **high** | engine | all-16 | Malformed config silently reverts to defaults on the hot path; config-get errors on the same file — `src/core.cts:545-552` vs `src/config.cts:639` |
| A2 | **F-CORR-01** | 75 | 5 | M | med | engine | all-16 | verify-summary checks only the first 2 claimed files -> silent pass on fabricated work — `src/verify.cts:66,102,148` |
| A3 | F-CORR-04 | 75 | 3 | S | med | engine | all-16 | Root-config parse failure silently swallowed when a workstream is active — `src/core.cts:372-374` |
| A4 | F-CORR-05 | 75 | 3 | S | low | engine | all-16 | Empty-output slug collapses distinct names to one `NN-` dir (collision/overwrite) — `src/core.cts:1919-1920` |
| A5 | F-CORR-08 | 75 | 3 | S | med | installer | all-16 | Node floor contradiction (docs 18+, package >=22), no installer guard — `package.json:47` vs docs |
| A6 | F-CORR-03 | 60 | 4 | M | med | engine | all-16 | verify-summary self-check is a keyword grep -> self-graded pass — `src/verify.cts:123-134` |
| A7 | F-CORR-09 | 50 | 2 | S | low | engine | all-16 | verify artifacts: exit-0 error-object, no all_passed; vacuous pass — `src/verify.cts:372-405` |
| A8 | F-CORR-06 | 45 | 3 | M | med | engine | multi | Unresolved runtime defaults slash hints to Claude form — `src/runtime-slash.cts:56,79-104,98` |
| A9 | F-CORR-10 | 40 | 2 | S | low | engine | claude-only | validate scans wrap per-phase loops in empty catches -> under-report — `src/verify.cts:696-744,841-849` |
| A10 | **F-RECON-03** | 36 | 3 | M | med | **workflows** | all-16 | Workflow-shim version-skew + hardcoded `$HOME` gsd-tools bypass (10+ workflows) — re-verified live |
| A11 | **F-RECON-04** | 36 | 4 | M | med | **installer** | all-16 | Build/publish fragility: `{{GSD_VERSION}}` stamped at install not build (STANDS). **Duplicate-const hooks/dist facet RESOLVED** (build-hooks.js now syntax-validates each .js hook) — residuals are A17/A18 |
| A12 | F-CORR-07 | 24 | 2 | M | low | engine | none | Three inconsistent "data-not-present" contracts across read commands |
| A13 | F-CORR-07b | 25 | 1 | S | low | engine | claude-only | Drift exception branch returns an empty human message — `src/drift.cts:252-270` |
| A17 | **F-CI-01** | 50 | 2 | S | low | tests (CI) | none | No `npm audit`/advisory gate in CI (only lockfile-consistency + weekly dependabot) — `concerns/build-ci-hooks.md`; `tag:security` |
| A18 | **F-BUILD-01** | 50 | 2 | S | low | installer | all-16 | `build-hooks.js` syntax-validates `.js` hooks but skips the 4 `.sh` hooks — the prior hooks/dist defect class uncovered for shell — `scripts/build-hooks.js:158-159,205` |

**Security & Exposure sub-group** (typed `wrongness`/`external-gap` + `tag: security`):

| # | id | pri | sev | eff | risk | subsystem | blast | finding |
|---|----|----:|:---:|:---:|:----:|-----------|-------|---------|
| A14 | **F-RECON-05** | 27 | 3 | M | low | engine | all-16 | Security lens (prompt-injection consistency / GSD_AUDIT_ARGS secret-log / claude-agent-sdk advisory). Re-verify `npm audit` before action |
| A15 | F-RECON-02 | 27 | 3 | M | med | agents | multi | Verifier harness must be TAMPER-RESISTANT (implementing agent can't edit the harness). Magnitude UNVERIFIED; adopt direction |
| (A16) | F-BLOAT-01 (xref) | 30 | 2 | S | med | engine | none | `ws`/claude-agent-sdk dep — supply-chain facet of A14; primary card in Workstream C |

### Workstream B — AI Gap (`external-gap`, 7) — OWNER: agent-prompt / AI-systems

> The strategic theme for an LLM-orchestration framework: **exogenous, calibrated, tamper-resistant
> verification.** All instructional or config — touches the trust gate. EXECUTION-RISK on the
> instructional items (recall gates named).

| # | id | pri | sev | eff | risk | subsystem | blast | mech/instr | finding |
|---|----|----:|:---:|:---:|:----:|-----------|-------|------------|---------|
| B1 | **F-AIGAP-02** | **100** | 4 | S | med | agents | all-14+ | n/a | Executor & verifier resolvable to the same model -> self-preference bias — `model-catalog.json:116,122` |
| B2 | F-AIGAP-01 | 60 | 4 | M | med | agents | all-14+ | **instr** | Verifier emits categorical verdict, no calibrated confidence — `gsd-verifier.md:169-173` |
| B3 | F-AIGAP-03 | 36 | 3 | M | low | agents | all-14+ | **instr** | No must_NOT_haves / prohibitions list -> spec-gaming passes — `gsd-planner.md`/`gsd-verifier.md:122-153` |
| B4 | F-AIGAP-04 | 36 | 3 | M | med | agents | multi | **instr** | Verifier evidence is self-reported, not exogenous — `few-shot-examples/verifier.md:25-36` |
| B5 | F-AIGAP-05 | 36 | 3 | M | med | workflows | all-14+ | **instr** | Load-bearing gates buried mid-context in the 86.8K execute-phase.md (lost-in-the-middle) |
| B6 | F-RECON-02 | 27 | 3 | M | med | agents | multi | n/a | (also in Security sub-group A15) harness tamper-resistance |
| B7 | F-AIGAP-06 | 6 | 2 | L | low | workflows | none | n/a | Pipeline-instrument calibration is uncadenced (ambiguity gate, verifier ECE) |

### Workstream C — Bloat (`waste`, 17) — OWNER: token / surface (pairs with Phase-15 UX owner)

> Two levers: **install-profile tiering** (the dominant 173,834-token eager-cost lever) and
> **conceptual de-duplication** (config-load, aggregators, routers). Every prompt-corpus cut carries
> the load-bearing guard.

| # | id | pri | sev | eff | risk | subsystem | blast | mech/instr | finding |
|---|----|----:|:---:|:---:|:----:|-----------|-------|------------|---------|
| C1 | **F-BLOAT-02** | 50 | 2 | S | low | tests | none | n/a | Dead `vitest.config.ts root:'./sdk'` + dead SDK-handler comments (SDK retired) |
| C2 | **F-BLOAT-09** | 50 | 2 | S | low | agents | all-16 | **mech** | 3 M1 mechanical wins: dead hooks stub (24 agents) + 1073 colon-form refs (re-verified live 2026-06-08) + single-include lock |
| C3 | F-BLOAT-01 | 30 | 2 | S | med | engine | none | n/a | `ws`/claude-agent-sdk dep probe (supply-chain xref A14) |
| C4 | F-BLOAT-17 | 30 | 2 | M | high | engine | all-16 | n/a | config-load redundancy (two read paths, opposite failure semantics) — defect half is A1 |
| C5 | F-BLOAT-10 | 24 | 2 | M | **high** | agents | all-16 | **instr** | `<documentation_lookup>` factor-out MUST preserve the ctx7 security guard (3 of 8 variants) |
| C6 | F-BLOAT-16 | 24 | 2 | M | high | engine | multi | n/a | 11 per-family routers -> one table-driven factory? + verify/verification + phase/phases twins |
| C7 | F-BLOAT-11 | 18 | 2 | M | med | agents | all-16 | **instr** | Tighten 100 agent/command description strings (the eager bytes); cap agent desc |
| C8 | **F-BLOAT-13** | 15 | 3 | L | high | agents | all-16 | **instr** | The 173,834-token eager tax -> install-PROFILE tiering is the lever, not corpus cutting |
| C9 | **F-BLOAT-14** | 15 | 3 | L | high | workflows | all-16 | **instr** | Lazy mode-file split for execute-phase + plan-phase (the two heaviest workflows) — overlaps B5 |
| C10 | F-BLOAT-08 | 12 | 3 | L | high | agents | all-16 | n/a | 33 agents = 81% of eager tax; count + body-size are two levers |
| C11 | F-BLOAT-12 | 12 | 3 | L | high | skills | all-16 | **instr** | Relocate graphify.md's inlined workflow (~2,700 tok eager->on-demand) |
| C12 | F-BLOAT-15 | 12 | 3 | L | med | engine | multi | n/a | init.cts re-implements aggregation (conceptual-redundancy twin of B-side MAINT-05) |
| C13 | F-BLOAT-06 | 12 | 2 | M | med | skills | multi | n/a | Slash-flag surface barely exercised -> progressive disclosure (no cut) |
| C14 | F-BLOAT-05 | 9 | 3 | L | med | docs | all-16 | **instr** | 11.73% markdown dup = re-embedded English code-fences across translations |
| C15 | F-BLOAT-03 | 10 | 1 | S | low | engine | none | n/a | AGGREGATE: per-type grep the 6 unused interfaces; drop the confirmed-dead |
| C16 | F-BLOAT-07 | 6 | 3 | L | med | skills | multi | n/a | 67-command surface -> tier the core loop forward (no removal) — overlaps UX-06 |
| C17 | F-BLOAT-04 | 6 | 1 | M | high | engine | multi | n/a | AGGREGATE: 88 knip "unused exports" is NOT a delete list (string dispatch) |

### Workstream D — Maintainability (`change-cost`, 14) — OWNER: engine architecture

> The two monoliths (`bin/install.js` 12.7k, `core.cts` 2k cx-602) + the invisible installer<->engine
> back-edge. Sequence the decompositions so correctness fixes (Workstream A) land inside them.

| # | id | pri | sev | eff | risk | subsystem | blast | finding |
|---|----|----:|:---:|:---:|:----:|-----------|-------|---------|
| D1 | **F-MAINT-10** | 50 | 2 | S | low | docs | none | Audit-method gap: add "Site 5 — workflow shim" to the dynamic-indirection inventory |
| D2 | **F-MAINT-11** | 50 | 2 | S | low | installer | none | Drift-proof the skill counts (derive from install-profiles.cts) — durable twin of UX-13 |
| D3 | F-MAINT-12 | 50 | 2 | S | low | engine | none | Extract `listPhaseDirs` helper; fold the rest of clone reduction into D5/D6 |
| D3b | **F-BUILD-02** | **75** | 3 | S | low | tests (.githooks) | none | pre-commit hook fully stale: 10 guards key on the retired `sdk/` tree + 9/10 dropped `check:*-fresh` scripts — `.githooks/pre-commit:9-47`; `concerns/build-ci-hooks.md` |
| D4 | F-MAINT-02 | 45 | 3 | M | high | installer | all-16 | Break the installer<->engine back-edge — `runtime-artifact-layout.cts:51` |
| D5 | F-MAINT-04 | 45 | 3 | M | med | engine | all-16 | config.cts unstable contract (78 commits) -> single typed schema |
| D6 | F-MAINT-09 | 40 | 2 | S | med | engine | none | Replace 95 enumerated `.gitignore` lines with a glob (more relevant now build:lib is live) |
| D7 | F-MAINT-07 | 36 | 3 | M | med | installer | all-16 | The two monoliths sit outside the coverage gate; bring under a target |
| D8 | **F-MAINT-01** | 20 | 4 | L | high | installer | all-16 | Decompose `bin/install.js` (12,727 LOC) along the runtime-converter seams |
| D9 | **F-MAINT-03** | 20 | 4 | L | high | engine | all-16 | Decompose `core.cts` (cx-602, the 108-cx function); sequence with A1/A3 (config) |
| D10 | F-MAINT-05 | 12 | 3 | L | med | engine | multi | Decompose init.cts (clone clusters collapse; twin of C12) |
| D11 | F-MAINT-08 | 12 | 3 | L | high | engine | all-16 | Decompose the cx-150 verify.cts function; fix A2/A6/A7/A9 during it |
| D12 | F-MAINT-06 | 8 | 2 | L | high | engine | all-16 | Concentration MAP (top-5 fan-in seams) — sequencing guidance, not a refactor demand |
| D13 | **F-BUILD-03** | 20 | 1 | S | low | installer | all-16 | No byte-identical drift gate on the gitignored `hooks/dist` (= F-RECON-04 rec #1, low-pri now the syntax gate exists) — `concerns/build-ci-hooks.md` |

### Workstream E — UX (`human-friction`, 14) — OWNER: docs / onboarding (spotlight-critical)

> The Mintlify-spotlight workstream. The progressive-disclosure machinery already exists
> (`/gsd-surface`, profiles, clusters) — lean on it, don't reinvent. No command/flag is ever
> deleted; safety/recovery commands are criticality-exempt.

| # | id | pri | sev | eff | risk | subsystem | blast | mech/instr | finding |
|---|----|----:|:---:|:---:|:----:|-----------|-------|------------|---------|
| E1 | **F-UX-01** | 75 | 3 | S | low | docs | none | n/a | README Quickstart has 0 profile mentions -> 2-line callout |
| E2 | **F-UX-04** | 75 | 3 | S | low | installer | all-14+ | n/a | Post-install "Done!" message -> add orient (/gsd-help) + slim (/gsd-surface) |
| E3 | **F-UX-05** | 75 | 3 | S | low | docs | none | n/a | Tutorial shows a fabricated "86 skills" install block -> real lines |
| E4 | **F-UX-07** | 75 | 3 | S | low | skills | all-14+ | **mech** | Newcomer's first handoff says `/gsd:plan-phase` (colon) — `new-project.md:33` |
| E5 | **F-UX-02** | 60 | 4 | M | med | installer | all-14+ | n/a | Add an interactive profile prompt (the highest-leverage newcomer moment; sets C8's cold-start) |
| E6 | F-UX-03 | 60 | 3 | S | low | installer | none | n/a | Surface the cold-start cost beside the profile choice |
| E7 | F-UX-09 | 60 | 3 | S | low | skills | all-14+ | **instr** | resume-work (the #2 power-user command) hides its flags -> add argument-hint |
| E8 | **F-RECON-01** | 45 | 3 | M | low | skills | multi | **mech** | Colon-form is a 3-way truth: source carries it, transform allow-listed to 3 runtimes, leaks for the rest. Fix at SOURCE |
| E9 | F-UX-14 | 40 | 2 | S | low | skills | claude-only | **instr** | Clarify the 6 ns-* facades as "advanced dispatcher" (no delete) |
| E10 | F-UX-08 | 30 | 2 | M | low | skills | all-14+ | **mech** | 18 source command bodies emit colon-form (incl. power-user hot path, F-UX-12) -> codemod + lint |
| E11 | F-UX-13 | 30 | 2 | M | low | docs | none | **mech** | One drift-proof skill-count source (durable twin of D2) |
| E12 | F-UX-06 | 12 | 3 | L | med | skills | multi | **instr** | Tier the 67-command menu ("start here") via clusters + Qwen priority (overlaps C16) |
| E13 | F-UX-10 | 18 | 2 | M | low | skills | multi | **instr** | Lightly-used flag surface -> progressive disclosure, not a cut |
| E14 | F-UX-11 | 18 | 2 | M | low | skills | multi | **instr** | Design the GSD menu to coexist with a crowded `/`-menu (IA humility) |

---

## 2. Spotlight Quick-Wins checklist (cross-cutting tier) — do these first

The highest-priority, lowest-risk, smallest-effort items, re-projected across all five types for
the time-boxed Mintlify spotlight. **All are S-effort, low-or-med risk, confidence >= 4, and
spotlight-safe** (no load-bearing prompt cut without its recall gate). Owners in brackets.

- [ ] **F-CORR-02 tier-1** (pri 125, S) — add the one-line stderr warning when config fails to parse (the contract decision is deferred to Workstream A). [engine] — *blast all-16; the warning itself is low-risk*
- [ ] **F-UX-01** (pri 75, S) — 2-line profile callout in README Quickstart. [docs]
- [ ] **F-UX-05** (pri 75, S) — replace the tutorial's fabricated "86 skills" block with real output. [docs]
- [ ] **F-UX-07** (pri 75, S) — fix the colon-form on the newcomer's first handoff (`new-project.md:33`). [skills, mechanical]
- [ ] **F-CORR-05** (pri 75, S) — guard the empty-output slug (collision/overwrite). [engine]
- [ ] **F-CORR-08** (pri 75, S) — correct the Node 18->22 doc floor + add a `process.version` guard. [installer + docs]
- [ ] **F-CORR-04** (pri 75, S) — warn on the root-config swallow (fold into the H-01 contract). [engine]
- [ ] **F-AIGAP-02** (pri 100, S) — prefer a different model/tier for the verifier than the executor. [agents]
- [ ] **F-UX-04** (pri 75, S) — add orient + slim lines to the post-install "Done!" message. [installer]
- [ ] **F-BLOAT-09** (pri 50, S, mechanical) — strip the dead hooks stub + normalize 1073 colon-form refs (re-verified live 2026-06-08) + lock the include. [agents]
- [ ] **F-BLOAT-02** (pri 50, S) — remove the dead `vitest.config.ts ./sdk` config + SDK-handler comments. [tests]
- [ ] **F-CORR-09** (pri 50, S) — make the no-artifacts branch return a consistent `{all_passed:false}` shape. [engine]
- [ ] **F-MAINT-11 / F-UX-13** (pri 50, S then M) — derive the skill counts from install-profiles.cts (drift-proof). [installer/docs]
- [ ] **F-MAINT-10** (pri 50, S) — add "Site 5 — workflow shim" to the dynamic-indirection inventory. [docs]
- [ ] **F-UX-09** (pri 60, S) — add resume-work's argument-hint. [skills, instructional — `lint:descriptions` gate]
- [ ] **F-BUILD-02** (pri 75, S) — fix or remove the fully-stale pre-commit hook (10 guards on the retired `sdk/` tree; 9/10 `check:*-fresh` scripts gone). [tests/.githooks] — *blast none; the hook enforces nothing today*
- [ ] **F-CI-01** (pri 50, S) — add an `npm audit --audit-level=high` advisory gate to security-scan.yml (read-only; npm audit is 0 vulns today). [tests/CI, security]
- [ ] **F-BUILD-01** (pri 50, S) — extend `build-hooks.js` syntax validation to the 4 `.sh` hooks (`bash -n`). [installer/build]

> **EXECUTION-RISK reminder.** The quick-wins above are deliberately the mechanical / additive ones.
> The instructional items (F-AIGAP-01/03/04/05, F-BLOAT-05/10/11/12/13/14, F-UX-06/09/10/11/14)
> are **NOT** in the spotlight checklist — each requires its named recall/edge-probe/parity gate
> (see the per-card `recall_gate` in `FINDINGS.md`) before any cut. Cutting load-bearing instruction
> right before a traffic spike is the worst-timed failure mode the charter §3.5 guards against.

---

## 3. Already-actioned / in-flight quick-wins tier (the M1 fold-in, ROADMAP-SC-3)

The Milestone-1 quick-win backlog (`docs/audit/QUICK-WIN-BACKLOG.md`, 20 ICE-sized items) is the
roadmap's **already-scoped fast-track tier**. It is rendered here as a view so the two registers do
not drift: each M1 item is **absorbed into a deep finding via `provenance`** (so it is scored once,
on the unified scheme). The M1 backlog remains the operational checklist for the spotlight; the deep
card carries the escalated/contract scope.

| M1 item | ICE | Folds into (deep card) | Status |
|---------|----:|------------------------|--------|
| QW-UX-02 | 100 | F-UX-01 | in-flight (still 0 profile mentions live) |
| QW-REL-01 | 100 | F-CORR-02 (tier-1 warning) | in-flight (contract = A1 deep) |
| QW-REL-05 | 100 | F-CORR-08 | in-flight |
| QW-REL-02 | 80 | F-CORR-05 | in-flight (escalated to collision) |
| QW-UX-01 | 75 | F-UX-02 / F-UX-03 | in-flight |
| QW-UX-04 | 75 | F-UX-05 | in-flight |
| QW-TOK-01 | 75 | F-BLOAT-09 | in-flight (mechanical) |
| QW-UX-05 | 64 | F-UX-04 | in-flight |
| QW-UX-03 | 50 | F-UX-13 / F-MAINT-11 | in-flight |
| QW-UX-08 | 48 | F-UX-14 | in-flight (instructional) |
| QW-REL-04 | 40 | F-CORR-07b | in-flight |
| QW-TOK-03 | 40 | F-BLOAT-09 / F-RECON-01 | in-flight (mechanical) |
| QW-UX-06 | 36 | F-UX-02 (sub-decision: standard-as-default) | in-flight |
| QW-TOK-02 | 36 | F-BLOAT-10 | in-flight (instructional — ctx7 guard) |
| QW-TOK-04 | 36 | F-BLOAT-11 | in-flight (instructional) |
| QW-TOK-07 | 32 | F-BLOAT-09 | in-flight (mechanical) |
| QW-REL-03 | 32 | F-CORR-07 | in-flight |
| QW-TOK-05 | 32 | F-BLOAT-12 | in-flight (instructional) |
| QW-UX-07 | 24 | F-UX-06 / F-BLOAT-07 | in-flight (escalated to deep IA) |
| QW-TOK-06 | 12 | F-BLOAT-14 | escalated (lazy-load restructure) |

(QW-TOK-08 was folded into QW-TOK-05 at M1; 20 items total.) The M1 **handoffs** H-01..H-04 are
resolved into the deep cards (H-01->F-CORR-02/04, H-02->F-CORR-06, H-03->F-CORR-07/09, H-04->F-CORR-08
+ F-MAINT-07 residual).

---

## 4. Sequencing & ownership guidance (ROADMAP-02)

**Owner routing (4+ people).** Five workstreams map to five owner slots; the two large ones
(A Correctness, C/D engine+token) can be split or paired:

| Owner slot | Workstream(s) | Lead findings | rough size |
|------------|---------------|---------------|-----------|
| **Engine / correctness** | A + D (engine half) | F-CORR-02/01/03, F-MAINT-03 | L (deep) |
| **Installer / build / CI** | A (installer half) + D (installer half) | F-CORR-08, F-RECON-04 (dup-const RESOLVED), F-MAINT-01/02/07, F-BUILD-01/02/03, F-CI-01 | L (deep) |
| **AI-systems / agent prompts** | B | F-AIGAP-02/01/03/04, F-RECON-02 | M |
| **Token / surface** | C | F-BLOAT-13/14/09, profile tiering | M-L |
| **Docs / onboarding (spotlight)** | E | F-UX-01/02/04/05/07 | M (spotlight-urgent) |

**Sequencing rules:**
1. **Spotlight quick-wins (§2) first** — they are S-effort, blast-safe, and the spotlight is dated-unknown-but-imminent.
2. **Fix-once convergence points:** decompose `verify.cts` (D11) *while* fixing F-CORR-01/03/09/10; decompose `core.cts` (D9) *while* fixing F-CORR-02/04. Do not let a refactor PR and a defect PR collide on the same hot file.
3. **High-risk gate:** every `risk: high` item (F-CORR-02 contract, F-BLOAT-10/13/14/16, F-MAINT-01/02/03/08) needs the widest regression net + its recall gate before merge — flagged regardless of priority.
4. **Instructional items never ship without their recall gate** (charter §3.5) — see each card's `recall_gate`.
5. **The contract decisions (H-01 config-parse, H-03 exit-code) are deliberate engine changes**, not quick patches — schedule them as scoped multi-runtime work after the tier-1 quick-wins.

---

## 5. Cross-references (one register, no drift)

- **Source of truth:** `FINDINGS.md` (the 68 scored cards — 64 original + 4 supplementary
  build/CI/hooks from the M2 review remediation). This roadmap, `TRACKING-SURFACE-POPULATED.md`,
  and the per-subsystem docs (`map/subsystems/`) are views.
- **Convergence threads** (a maintainer should read these together):
  - *"Verifier reach = spec reach"*: F-CORR-01, F-CORR-03, F-AIGAP-01, F-AIGAP-02, F-AIGAP-04, F-RECON-02, F-MAINT-08.
  - *Config-parse contract*: F-CORR-02, F-CORR-04, F-BLOAT-17, F-MAINT-04 (+ H-01).
  - *Colon-form slash*: F-UX-07, F-UX-08, F-UX-12, F-RECON-01, F-BLOAT-09 (QW-TOK-03).
  - *Skill-count drift*: F-UX-05, F-UX-13, F-MAINT-11.
  - *Eager token tax*: F-BLOAT-08, F-BLOAT-11, F-BLOAT-12, F-BLOAT-13, F-UX-02 (profile prompt).
  - *The two monoliths*: F-MAINT-01 (install.js), F-MAINT-03 (core.cts), F-MAINT-07 (coverage gap), F-CORR-08 H-04 residual.
  - *Security & exposure*: F-RECON-05 (npm-audit facet RESOLVED), F-RECON-02, F-BLOAT-01, F-BLOAT-10 (ctx7 guard), F-CI-01 (CI advisory gate).
  - *Build / publish integrity*: F-RECON-04 (dup-const RESOLVED via build-hooks validateSyntax), F-BUILD-01 (.sh validation gap), F-BUILD-03 (dist drift gate), F-BUILD-02 (stale pre-commit hook).

*Plan-only attestation: this file is a new deliverable under `docs/audit/comprehensive/`. No
protected path was edited; no commit; no GitHub write.*