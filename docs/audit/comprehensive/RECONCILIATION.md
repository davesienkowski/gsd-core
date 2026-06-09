> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# Reconciliation — Fresh Audit vs. Prior Internal Artifacts (the Firewall Delta)

> **Phase 16** · Requirement **RECON-01** · **Mode:** audit-and-plan only — no code changed,
> no commit, no GitHub.
> **Charter:** `docs/audit/comprehensive/AUDIT-CHARTER.md` §3.3 (the firewall), §2.2 (card schema
> for any new finding), D-04/D-05 (this phase's bucketing rule).
> **Derived:** 2026-06-08. **THE FIREWALL LIFTS HERE** — this is the only phase in the entire
> audit permitted to open the prior internal artifacts.

This file records what changed when the fresh, independent read was finally laid against the
prior internal artifacts. Its discipline (charter D-05): **the fresh pass is the system of
record; the prior is the cross-check oracle.** Reconciliation *raises confidence* on agreements
and *adds findings* on disagreements — it **never overwrites** the independent read. Where the
fresh pass and the prior disagree, the disagreement is itself a finding (methodology evidence,
16-CONTEXT §specifics).

---

## 0. The firewall held — attestation with dates (SC-1)

The hard boundary required by the charter (§3.3) and the ROADMAP Phase-16 SC-1 is that **all
fresh analysis was dated and complete BEFORE any prior was opened.** Verified live this phase:

| Body of work | Status before today | Date stamped in the artifact |
|---|---|---|
| M1 quick-win backlog (`docs/audit/QUICK-WIN-BACKLOG.md`) | complete | **Converged 2026-06-07** (Phase 5) |
| M1 streams (`docs/audit/streams/{ux,token,reliability}-stream.md`) | complete | feed the 2026-06-07 backlog |
| M2 charter (`AUDIT-CHARTER.md`) | locked | **2026-06-08 (Phase 6)** |
| M2 concern sweeps (`concerns/{bloat,maintainability,pipeline-correctness,ai-llm-gaps,ux}.md`) | complete | **all "Derived: 2026-06-08"** (verified: grep of all 5 files) |
| M2 evidence/map/instrumentation | complete | 2026-06-08 (Phases 7–11) |
| **Priors (opened for the FIRST time today)** | — | `.planning/codebase/*` **refreshed 2026-06-05**; `pipeline-delivery-audit` **2026-06-05**; `frontier-research-synthesis` **2026-06-05** |

**The boundary is honored.** Every fresh artifact is stamped 2026-06-07 (M1) or 2026-06-08 (M2);
every prior is stamped 2026-06-05 and was opened for the first time in Phase 16. Each fresh sweep
carries an explicit per-file firewall attestation ("the firewall … was honored — no
`.planning/codebase/*`, no `*-2026-06-05.md`, no frontier synthesis opened"); this phase confirms
those attestations are consistent with the dating. The priors are an **older** read (2026-06-05,
on the pre-`src/`-rename `get-shit-done/` payload), which is exactly why they function as an
independent oracle rather than an anchor.

> **Why the priors are a genuine oracle, not a contaminant.** The priors were authored against the
> `get-shit-done/bin/lib/*.cjs` layout (pre-rename) and cite `.cjs` paths throughout. The
> fresh pass re-derived everything from `src/*.cts` per charter §0. That two reads built on
> *different path universes* still converge on the same hotspots (`core`, `init`, `bin/install.js`,
> the config-parse split, the colon-form) is the strongest possible corroboration: the findings are
> properties of the system, not of one reader's vantage.

---

## 1. The delta — three buckets (SC-2)

Counts: **12 agreements** (confidence-raising corroborations) · **4 disagreements** promoted to
new `F-RECON-*` findings · **5 prior-only** concerns evaluated (3 carded as still-valid
`F-RECON-*`, 2 assessed as superseded/closed and recorded, not carded).

### 1a. Agreements — prior corroborates a fresh finding → raise confidence

Each row: the prior independently reached the same place as the fresh finding, from the older
`.cjs` vantage. Per charter D-04, this **raises confidence**; it does not rewrite the fresh card.
The fresh card stays the system of record — this table is the confidence annotation.

| # | Fresh finding | Prior corroboration (independent, 2026-06-05) | Confidence effect |
|---|---|---|---|
| **A-1** | **F-CORR-02 / F-BLOAT-17** — `loadConfig` silently defaults vs `config-get` errors on a malformed config (the config-parse contract split) | CONCERNS "Tech Debt" does not name this split, BUT the prior **delivery audit** independently flags non-inferable silent-default as the paradigm's core risk; and the fresh repro stands alone. The prior's *absence* of this exact split is itself notable — the fresh pass found a defect the prior missed (see D-3). | Fresh confidence already 5 (reproduced); **unchanged** — prior neither confirms nor denies the specific split. Logged for transparency. |
| **A-2** | **F-CORR-08 / QW-REL-05** — Node floor contradiction (docs 18+ vs `engines >=22`, no installer guard) | Not in priors — net-new to the fresh pass (adversarial-review origin). | No change; flagged as a fresh-only strength. |
| **A-3** | **F-MAINT-01 / F-MAINT-07** — `bin/install.js` monolith is the top change-cost surface, outside the coverage gate | CONCERNS "Tech Debt": *"`bin/install.js` is a 10,936-line monolith … the highest-risk file in the project"* + "Test Coverage Gaps: `bin/install.js` install logic is not unit-tested … Priority: High" | **Raise F-MAINT-01/07 confidence 5→5 (held) but corroborated by an independent reader.** Two independent audits, different vantages, same #1 monolith. The LOC differs (prior 10,936 → fresh 12,727) — the file GREW, sharpening the finding, not weakening it. |
| **A-4** | **F-MAINT-03** — `core.cts` is the engine's rank-1 churn×complexity hub | CONCERNS "Tech Debt": *"`core.cjs` (2,121 lines) … any breakage in `core.cjs` affects 30+ downstream modules"* | Corroborated by independent reader. Prior says fan-out "30+"; fresh measured fan-in 24/out 9 — same hub character. |
| **A-5** | **F-MAINT-05 / F-BLOAT-15** — `init.cts` oversized aggregator with cross-file clones | CONCERNS: *"`init.cjs` (2,112 lines) … handles every possible runtime's init flow in a single switch-heavy file"* | Independent corroboration of the second monolith. |
| **A-6** | **F-BLOAT-02** — dead `vitest.config.ts` (`root:'./sdk'`) + dead SDK-handler comments after the SDK retirement | CONCERNS "Multi-Runtime Drift": *"`model-catalog.cjs`/`runtime-name-policy.cjs` … stale `sdk/shared/` dev-path fallback … ADR-0174 retired the SDK … dead reference"* + "comments in `verify.cjs`/`validate.cjs` reference `sdk/src/query/...` files that no longer exist" | **Raise F-BLOAT-02 confidence.** The prior independently found the *same* SDK-retirement debris (different files: catalog/name-policy fallbacks; fresh found the vitest config). Together they show the SDK retirement (ADR-0174) left a **broader** debris field than either pass alone carded → see D-4/F-RECON-04. |
| **A-7** | **F-MAINT-04** — `config.cts` highest-churn-after-core = unstable contract | CONCERNS lists `core`/`init` as oversized; the prior does not isolate `config.cts` churn — but the SDK-handsync debt entry shows the same "contract keeps changing under a retired boundary" pattern. | Partial corroboration; fresh confidence held at 5 (churn count is checkable). |
| **A-8** | **F-MAINT-09** — `.gitignore` per-line `.cjs` enumeration drift surface | CONCERNS "Build/Publish Fragility" repeatedly flags build-at-publish drift (`hooks/dist`, `{{GSD_VERSION}}` stamping) — same *class* (hand-maintained build hygiene that drifts). | Corroborated as a class; specific `.gitignore` line is fresh. |
| **A-9** | **F-AIGAP-01 / F-AIGAP-06** — verifier verdicts are categorical, not calibrated; thresholds asserted not measured | Frontier synthesis: *"Tier-aware abstention vs confidence scalar — STRONGLY VALIDATES abstain; CHALLENGES scalar … Judge ECE 11.8%→74%, tier-dependent; Trust-or-Escalate gives provable ≥80% agreement via abstention."* | **Strong corroboration.** The fresh G1/G6 (add calibrated confidence + abstention threshold) is exactly what the prior frontier read concluded. Note the *refinement* the prior carries: prefer **abstention** over a raw confidence **scalar** — fresh G1 already frames it as a *gating dimension*, consistent. |
| **A-10** | **F-AIGAP-02 / F-AIGAP-04** — self-grading bias unmitigated by model independence; no exogenous "did it run" gate | Frontier: *"LLM self-judgment has a systematic FALSE-NEGATIVE bias; exogenous grounding is the universal fix"* + *"RewardHackingAgents ~50% tamper → LOCK the harness"* + *"FactReview: removing execution evidence flips 17% of claims."* | **Strong corroboration + one escalation the fresh pass under-weighted:** the prior adds **harness-locking** (the implementing agent must not be able to edit the verification harness). Fresh G2/G4 covered model-independence + an exogenous receipt but NOT tamper-locking → see D-2/F-RECON-02. |
| **A-11** | **F-AIGAP-03** — plans encode must-HAVEs but not must-NOT-haves | Frontier: *"Safety / must-NOT elicitation — VALIDATES the gap strongly … presence-verifier structurally can't confirm absence (Verifier Tax)"* and ranks up-front per-requirement must-NOT elicitation as the **#1 novel-ground** item. | **Strong corroboration.** The fresh G3 (add must_NOT_haves the verifier falsifies against) is the prior's top-ranked frontier gap. Confidence-raise justified. |
| **A-12** | **F-AIGAP-05** — long workflows risk lost-in-the-middle; no positional discipline | Frontier: lost-in-the-middle is named a **cross-cutting law** (#3 "more is worse," 20–30pt drop) and listed under both Verify and Spec clusters. | Strong corroboration; G5 confidence held at 4 (file sizes live, finding well-replicated). |

> **Net on agreements:** the fresh pass and the prior, built on different path universes and
> different methods (the prior is a codebase map + a delivery-grep + an LLM-researcher synthesis;
> the fresh pass is reproduce-don't-theorize), **converge on every structural hotspot and every
> AI-gap.** That convergence is the audit's credibility result. The AI-gap agreements (A-9..A-12)
> are especially load-bearing: the fresh Phase-14 sweep re-derived its best-practice claims from
> live WebFetched sources and *independently* landed on the same six gaps the prior frontier
> synthesis reached — strong evidence the AI-gap roadmap is real, not a single reader's framing.

### 1b. Disagreements — "prior said X, fresh pass found Y" → promoted to NEW findings

Per charter D-04/D-05 these are **not** resolved by picking a winner; each becomes a finding in
its own right. The fresh card is untouched; these `F-RECON-*` cards record the *delta* and what a
maintainer should reconcile.

```yaml
- id: F-RECON-01
  problem_type: human-friction        # the colon-form tension (D-06) — full resolution in §2
  subsystem: skills                   # commands/gsd/*.md + the install transform seam
  file:line: "PRIOR: ARCHITECTURE.md:250 ('legacy /gsd:<cmd> is never emitted') vs ARCHITECTURE.md:258 ('leaks into agent prose after install') vs CONCERNS.md:107-111 (the confirmed-bug 'Users see wrong slash-command syntax') ─── FRESH: F-UX-07/08 (18 source command bodies emit /gsd:, incl. new-project.md:33) ─── LIVE: bin/install.js:2176, :2288, :10299-10305, :52,58 (transform allow-listed to {claude,qwen,hermes})"
  severity: 3                         # carries F-UX-07's severity (newcomer's first handoff); see §2
  effort: M
  risk: low
  confidence: 5                       # all three readings + the live transform verified this phase
  runtime_blast_radius: multi         # corrected for {claude,qwen,hermes}; LEAKS for other hyphen runtimes outside the allow-list; Codex self-converts via $gsd-
  mechanical_vs_instructional: mechanical    # colon→hyphen substitution (matches F-UX-07/08)
  recommendation: "Reconcile the three readings into ONE true statement (see §2): the SOURCE corpus still carries colon-form (fresh is right that it is present); the INSTALLED Claude/Qwen/Hermes artifact is transformed to hyphen (M1's 'transformed at install' is right FOR those 3 runtimes); the prior map is right that it is an anti-pattern that 'leaks after install' for runtimes OUTSIDE the allow-list. The durable fix the fresh pass recommends (single emitter / lint + fix-slash-commands.cjs at SOURCE) is STILL warranted because (a) the transform is allow-listed, not universal, and (b) source-corpus colon-form is the seed every new leak grows from. Do NOT rely on the install transform as the fix — it is a per-runtime backstop, not a source normalization."
  recall_gate: n/a
  cross_check: "Live bin/install.js verified this phase: convertClaudeCommandToClaudeSkill calls transformContentToHyphen(body) for SKILL.md bodies; normalizeAgentBodyForRuntime gated on HYPHEN_NAME_AGENT_RUNTIMES={claude,qwen,hermes}; Gemini converts gsd:→gsd- in its own path (:2288). So colon-form IS user-facing on the SOURCE side and on any installed runtime NOT in the allow-list."
  provenance: "Reconciles M1 QW-TOK-03 (mechanical, 'runtime-slash converts — verify no regression') vs Phase-15 F-UX-07/08 (user-facing) vs PRIOR ARCHITECTURE/CONCERNS. D-06."

- id: F-RECON-02
  problem_type: external-gap          # the verifier-harness TAMPER risk the fresh AI-gap sweep under-weighted
  subsystem: agents                   # verifier harness integrity
  file:line: "PRIOR frontier-research-synthesis-2026-06-05.md:71,118 ('RewardHackingAgents 50% tamper → LOCK the harness'; 'LOCK the verification harness so the implementing agent can't edit it') ─── FRESH ai-llm-gaps.md G2/G4 cover model-independence + an exogenous receipt but NOT harness-locking"
  severity: 3                         # a verifier the implementing agent can edit is a defeat-the-gate path the fresh sweep did not card
  effort: M
  risk: med                           # locking the harness touches the executor↔verifier tool boundary
  confidence: 3                       # the 50% tamper figure is from an LLM-researcher synthesis flagged UNVERIFIED (see frontier caveat); the PRINCIPLE (separate write-access from grading) is sound and first-party-aligned (N17 exogenous grading)
  runtime_blast_radius: multi
  mechanical_vs_instructional: n/a
  recommendation: "Add a seventh AI-gap card to the roadmap (or extend F-AIGAP-04): the exogenous-evidence channel must also be TAMPER-RESISTANT — the agent that produces the work should not be able to edit the verification harness/receipt it is graded against. This is the prior's harness-locking insight, which the fresh G2 (model independence) and G4 (exogenous receipt) imply but never state. Treat the cited 50%-tamper magnitude as UNVERIFIED (frontier-synthesis self-caveat: 1-of-3 spot-checked citations was inverted) — adopt the direction, re-derive the magnitude before quoting it."
  recall_gate: "a fixture where the implementing agent attempts to weaken/edit the harness; the locked harness must reject it"
  provenance: "Prior-frontier insight (harness-locking) absent from the fresh AI-gap sweep → promoted. Aligns with first-party N17 exogenous-grading."

- id: F-RECON-03
  problem_type: wrongness             # the gsd_run shim version-skew hazard the fresh correctness sweep did not reach
  subsystem: workflows                # the gsd_run shim preamble across ~10+ workflows
  file:line: "PRIOR CONCERNS.md:32-52 ('Silent version-win by a broken global binary'; 'git rev-parse || pwd makes root ambiguous'; hardcoded $HOME/.claude/...gsd-tools.cjs bypasses the shim in 5 workflows) ─── FRESH pipeline-correctness.md swept the ENGINE (src/*.cts) but not the workflow-shim RESOLUTION path"
  severity: 3                         # a stale global gsd-tools binary winning the PATH race dispatches an old API against a new workflow → silent no-op / corrupt state; the prior gives concrete file:line
  effort: M
  risk: med
  confidence: 4                       # prior cites concrete workflow lines; the hazard class is checkable, the live re-pin to gsd-core/ paths needs confirming (see note)
  runtime_blast_radius: all-16        # every runtime resolves the shim; non-Claude runtimes hit the hardcoded-$HOME bypass hardest
  mechanical_vs_instructional: n/a
  recommendation: "Card the shim-resolution hazard the fresh correctness sweep did not reach: (1) emit a `gsd_run --version` assertion after shim resolution and fail loudly on skew (prior's fix); (2) replace hardcoded `node \"$HOME/.claude/...gsd-tools.cjs\"` calls (prior cited plan-review-convergence/ingest-docs/spec-phase/plan-phase/update) with the resolved `gsd_run`; (3) extend `audit-workflow-script-paths.cjs` to catch hardcoded $HOME paths + validate `gsd_run query <handler>` tokens against the registered handler manifest. This is the workflow-layer correctness surface; the fresh Phase-13 sweep was scoped to the engine. Confirm the prior's line numbers against the post-rename `gsd-core/workflows/` paths before sizing."
  recall_gate: n/a
  provenance: "Prior CONCERNS 'Runtime Resolution Shim Hazards' + 'Markdown-as-Prompt Fragility' — a correctness surface OUTSIDE the engine that Phase 13 did not sweep. Promoted, scoped to recall-the-gap (the fresh pass's MECE correctness lens should own it)."

- id: F-RECON-04
  problem_type: wrongness             # build/publish fragility: stale hooks/dist + version-stamp seam (a SHIPPING defect class)
  subsystem: installer                # build-at-publish pipeline
  file:line: "PRIOR CONCERNS.md:8-20 ('build-at-publish for hooks/dist'; '{{GSD_VERSION}} replaced at install not build' → tarball ships unreplaced literal; recurred as a duplicate-const PostToolUse hook error for ALL users, since fixed) ─── FRESH pass did not card the build/publish pipeline (it is outside src/ and outside the install-transform code the fresh pass read)"
  severity: 4                         # a stale/empty hooks/dist breaks hooks for EVERY user immediately after install; the prior cites it ALREADY HAPPENED once across 4 issues
  effort: M
  risk: med
  confidence: 3                       # the prior cites a real prior incident (4 issue numbers) but the fresh pass did not re-reproduce; carded at the prior's confidence, residual = re-verify the current build:hooks/prepublishOnly gate against live package.json
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  recommendation: "Card the build/publish fragility class the fresh pass missed (it sits in scripts/build-hooks.js + package.json prepublishOnly, outside src/): (1) a CI pre-publish gate asserting hooks/dist is byte-identical to a fresh build (or commit hooks/dist); (2) stamp {{GSD_VERSION}} in build-hooks.js from package.json, not in install.js, so the tarball is self-consistent. The prior shows this is not theoretical — it shipped a hook-breaking duplicate-const to all users (the prior hooks/dist incident cluster). RE-VERIFY against live package.json/scripts before sizing (the prior is 2026-06-05). This overlaps F-CORR-08's 'installer guard' theme but is a distinct SHIPPING-integrity defect, not a first-run config defect."
  recall_gate: n/a
  provenance: "Prior CONCERNS 'Build/Publish Fragility' — a real, recurred shipping defect class the fresh correctness/maintainability sweeps did not reach. Promoted; re-verify residual flagged (charter §3.4.4)."
```

### 1c. Prior-only — concerns the prior raised that the fresh pass did not surface (evaluated, carded if still valid)

The four `F-RECON-*` above are the *carded* prior-only/disagreement findings (F-RECON-02/03/04
are prior-only insights the fresh pass missed; F-RECON-01 is the three-way colon-form tension).
Below are the remaining prior-only concerns, each **evaluated against live code** this phase and
either folded into an existing fresh card, carded, or recorded as superseded.

> **Completeness correction (M2 adversarial-review remediation, 2026-06-08).** The original ledger
> overstated completeness: the red-team (`review/ADVERSARIAL-M2-PROCESS.md` §5 GENUINE GAP 3) found
> two prior CONCERNS sections were **not** in the ledger — **"Fragile Areas"** (the advisory-lock
> worktree deadlock) and **"Performance Bottlenecks."** Both are now added as the last two rows
> below (each re-checked live and recorded with its disposition), so the "every prior section
> folded, carded, or recorded" claim is literally true. Neither reproduces as a scored finding:
> the deadlock is mitigated by a live timeout + stale-recovery, and performance has no MECE lens
> (recorded, like the CHANGELOG scaling item).

| Prior-only concern (2026-06-05) | Evaluation vs live code (2026-06-08) | Disposition |
|---|---|---|
| **Prompt-injection surface** — GSD-written `.md` re-enters LLM context; needs `sanitizeForDisplay()` consistency (CONCERNS "Security") | Live: `security.cjs`/`secrets.cjs`/`hooks/gsd-*-injection-scanner` + `scripts/prompt-injection-scan.sh` CI check all exist. The fresh charter scoped the audit to bloat/maint/correctness/AI-gap/UX — **security was not a fresh lens.** The concern is valid and live-relevant. | **CARDED → F-RECON-05** (below): a genuine prior-only lens the fresh taxonomy did not cover. |
| **`GSD_AUDIT_ARGS=1` may log API keys** (audit-log path bypasses `maskIfSecret`) (CONCERNS "Security") | Opt-in, default-redacted; concrete file:line in prior. Not a fresh lens. | Folded into **F-RECON-05** (security cluster) — secondary item; re-verify the audit-log mask path. |
| **`npm audit`: 1 high + 5 moderate via `@anthropic-ai/claude-agent-sdk`** (the prior advisory) (CONCERNS "Dependencies at Risk") | `npm audit` re-run read-only 2026-06-08 (M2 adversarial-review follow-up): **`found 0 vulnerabilities`** (the `^0.2.84` range resolved to the patched `claude-agent-sdk@0.2.141`). The 2026-06-05 "1 high + 5 mod" count is **STALE/RESOLVED**. `git diff package-lock.json` empty — `npm audit` (read) does not mutate the lockfile, so the prior deferral rationale was wrong. | **F-RECON-05 npm-advisory facet DOWNGRADED to RESOLVED.** The security-LENS taxonomy point + the injection-consistency / `GSD_AUDIT_ARGS` mask facets stand (not run-verified). See F-CI-01 (`build-ci-hooks.md`): no `npm audit` gate in CI to catch future drift. |
| **CHANGELOG.md 192.7 KB scaling limit** (gsd update parses it from raw.githubusercontent) (CONCERNS "Scaling Limits") | A forward-looking scaling concern, not a present defect; outside all five fresh lenses (it is neither waste nor a present wrong-result). | **Recorded, not carded.** Legitimate but low-urgency and orthogonal to the audit's MECE taxonomy; handed to Phase 17 as a "prior-noted scaling watch item," not a scored finding. |
| **Subagent-spawning parity undefined for most runtimes; no cross-runtime e2e install test** (CONCERNS "Multi-Runtime Drift" / "Missing Critical Features") | Overlaps the fresh **F-MAINT-07** (the per-runtime first-run trace = the integration-test gap, H-04 residual) and **F-CORR-06/08** (runtime divergence). The fresh pass DID reach this — as a flagged *residual*, not a missed concern. | **Already covered** by F-MAINT-07 + the H-04 residual; this reconciliation **raises confidence** on F-MAINT-07 (an independent reader named the same gap). Not a new card. |
| **Fragile Areas — the advisory `withPlanningLock()` worktree-parallel deadlock** (a held lock blocks all other agents indefinitely) (prior CONCERNS "Fragile Areas") — *added to the ledger in the M2 adversarial-review remediation; previously omitted* | Re-checked live 2026-06-08: `src/planning-workspace.cts:117-184` now bounds the wait — a **10s acquisition timeout** (`:120,:146`), **30s stale-lock recovery** (`:166-169`), and a timeout-path force-break + re-acquire (`:180-183`). The prior's *indefinite* deadlock does **not** reproduce: a contending agent waits ≤10s then breaks a stale/held lock. Residual nuance: the timeout force-break (`:181-183`) could break a lock still held by a slow-but-alive holder — a narrow correctness edge, not the indefinite deadlock. | **Recorded — superseded for the indefinite-deadlock claim** (mitigated by the timeout + stale-recovery). The narrow force-break-while-alive edge is low-severity and below the per-sweep severity floor (charter §3.4.3); noted here, not carded. |
| **Performance Bottlenecks** — 634-file sequential test suite; synchronous 12.7k-LOC install parse on every `npx` (prior CONCERNS "Performance Bottlenecks") — *added to the ledger in the M2 adversarial-review remediation; previously omitted* | Performance has **no MECE lens** in the charter's five-type taxonomy (§1.1) — defensibly out of scope, exactly like the CHANGELOG scaling item above. The install-parse cost overlaps the fresh **F-MAINT-01** (the 12.7k-LOC `bin/install.js` monolith, parsed on every `npx`) as a change-cost surface; the test-suite serialization is a CI/dev-time perf concern with no present wrong-result. | **Recorded, not carded** — same treatment as the CHANGELOG scaling watch item (consistency restored: both prior "outside the five lenses" performance/scaling items are now recorded, not silently omitted). The install-parse facet is *partially* covered by F-MAINT-01's decomposition recommendation. |

```yaml
- id: F-RECON-05
  problem_type: wrongness             # security was not one of the five fresh lenses — a genuine taxonomy gap surfaced by the prior
  subsystem: engine                   # security.cjs/secrets.cjs + observability/redaction + dependency surface
  file:line: "PRIOR CONCERNS.md:122-138 (prompt-injection sanitize consistency; GSD_AUDIT_ARGS=1 secret-leak; npm-audit 1 high+5 mod via the claude-agent-sdk advisory — STALE/RESOLVED). FRESH: the AUDIT-CHARTER 5-type taxonomy (bloat/maint/correctness/AI-gap/UX) has NO security lens."
  severity: 3                         # the LENS gap + two live facets (secret-logging path, injection-sanitize consistency) are real; the npm-advisory facet is now RESOLVED (0 vulns 2026-06-08)
  effort: M
  risk: low                           # mostly additive guards
  confidence: 3                       # prior cites concrete file:line; the two guard facets not reproduced fresh; the npm-audit facet IS now run-verified (0 vulns)
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  recommendation: "Surface security as a roadmap concern-area the fresh five-lens taxonomy did not own. Carry-forwards, each re-verified before action: (1) ensure every gsd_run handler that writes .planning/*.md routes through sanitizeForDisplay() (prompt-injection consistency); (2) apply maskIfSecret on the GSD_AUDIT_ARGS=1 audit-log path; (3) [RESOLVED] npm audit re-run read-only 2026-06-08 = 0 vulnerabilities (the ^0.2.84 range resolved to the patched claude-agent-sdk@0.2.141) — the prior advisory's '1 high + 5 mod' is stale and the package.json-overrides recommendation is a no-op; close this facet. (The deferral rationale 'would mutate lockfile state' was wrong — `npm audit` read does not touch the lockfile.) NOTE for Phase 17: this is the one place the charter's MECE taxonomy has a true gap — security findings have no home type. Phase 17 decision (§1 of FINDINGS): typed wrongness + tag:security. Do NOT silently drop facets (1)/(2). See F-CI-01 for the missing CI advisory gate."
  recall_gate: n/a
  provenance: "Prior CONCERNS 'Security Considerations' + 'Dependencies at Risk' — an entire lens the fresh charter did not include. Promoted as the highest-value prior-only contribution."
```

---

## 2. The colon-form tension, resolved (D-06, SC-2)

**The flagged tension.** M1 framed colon-form `/gsd:` as *transformed at install → not
user-visible* (QW-TOK-03, tagged `mechanical`, ICE 40, with the note "Codex uses `$gsd-`;
runtime-slash converts — verify no regression"). Phase 15 found it *user-facing*: **18 of 67
source command bodies emit `/gsd:`** (F-UX-08), and `commands/gsd/new-project.md:33` tells a
newcomer *"Run `/gsd:plan-phase 1`"* on their very first command-to-command handoff (F-UX-07).

**What the prior map says (opened this phase).** The prior is internally split — and *each half*
matches one side of the fresh tension:

- `ARCHITECTURE.md:250` (a *constraint* claim): *"Canonical form is `/gsd-<cmd>` (hyphen); legacy
  `/gsd:<cmd>` (colon) is **never emitted**."* — matches M1's "not user-visible" framing.
- `ARCHITECTURE.md:258` (the *anti-pattern* admission, same file): colon form *"**leaks into agent
  prose after install**"* — matches Phase 15's "user-facing" finding.
- `CONCERNS.md:107-111` (a `confirmed-bug`): *"At least 16 `.cjs` files … still emit
  … `/gsd:<cmd>` … **Users see wrong slash-command syntax in GSD output** … Higher impact on
  runtimes where `/gsd:cmd` is not a valid command form."*

So the prior **already adjudicated this**: colon-form IS user-facing (a confirmed bug), and the
"never emitted" line is an *aspiration*, not a measured fact.

**What the live install transform actually does (verified this phase in `bin/install.js`).**

| Mechanism | Lines | Behavior |
|---|---|---|
| `convertClaudeCommandToClaudeSkill` → `transformContentToHyphen(body, names)` | `:2176` | Rewrites `/gsd:` → `/gsd-` in **installed SKILL.md command bodies** (Claude path). |
| `normalizeAgentBodyForRuntime` gated on `HYPHEN_NAME_AGENT_RUNTIMES = {claude, qwen, hermes}` | `:52, :58-72, :10299-10305` | Rewrites colon→hyphen in **agent bodies** — **only for those 3 runtimes**; an explicit *allow-list* ("better to leak than to mangle a runtime whose namespace we haven't verified", `:48-50`). |
| Gemini converter | `:2288` (`c.replace(/gsd:/g,'gsd-')`) | Gemini self-converts in its own path. |
| Codex | (shell-var `$gsd-` form) | Codex renders `$gsd-`, so colon-form is wrong there in a different way. |

**Resolution — it is a three-way truth, and all three readings are partly right:**

1. **The SOURCE corpus carries colon-form (Phase 15 is correct).** `commands/gsd/new-project.md:33`
   and 17 other source command bodies literally contain `/gsd:` (verified: `grep -rln '/gsd:'
   commands/gsd/*.md` → 18). The source is the prompt corpus a contributor reads and copies.
2. **The INSTALLED artifact is corrected — but only for the 3 allow-listed hyphen runtimes (M1 is
   correct *for Claude/Qwen/Hermes*).** For a Claude newcomer, the install transform rewrites the
   SKILL.md body, so the *installed* `/gsd:plan-phase` handoff becomes `/gsd-plan-phase`. M1's "not
   user-visible" holds for the default Claude spotlight audience **at the installed layer**.
3. **It LEAKS for runtimes outside the allow-list, and the SOURCE is the seed (the prior map is
   correct).** The transform is an *allow-list*, not universal; any installed hyphen-namespace
   runtime not in `{claude, qwen, hermes}` leaks colon-form into prose — exactly the prior's
   "leaks after install." And because the **source** still carries it, every new command
   and every hand-edit re-seeds the leak.

**The reconciled finding (carded as F-RECON-01).** The tension is **not** "M1 wrong, Phase 15
right." It is: *the install transform is a per-runtime backstop that masks the source defect for
the default audience, which is exactly why both prior readers and M1 could plausibly call it
"not visible."* But the durable fix Phase 15 recommends — normalize at SOURCE via a lint +
`scripts/fix-slash-commands.cjs`, ideally a single emitter — **remains warranted**, because (a)
the transform is allow-listed not universal, (b) Codex/$-form and non-allow-listed runtimes are
not covered, and (c) the source corpus is the seed every future leak grows from. **Do not rely on
the install transform as the fix.** Severity stays at F-UX-07's level (the newcomer's first
handoff); blast radius is `multi` (corrected for 3 runtimes, leaks for the rest). No fresh finding
is overwritten: F-UX-07/08 stand as the system of record; F-RECON-01 records the install-transform
nuance and the prior's confirming adjudication, *raising* the team's confidence that this is a real
user-facing issue with a known-incomplete backstop.

---

## 3. No fresh finding silently revised toward the prior (SC-3) — the discipline statement

Per charter D-05 and ROADMAP SC-3, this reconciliation **adjusted confidence and added findings;
it did not overwrite the independent read.** Concretely:

- **Every fresh card (`F-CORR-*`, `F-BLOAT-*`, `F-MAINT-*`, `F-AIGAP-*`, `F-UX-*`, `QW-*`) is
  unchanged.** No severity, recommendation, or citation in `concerns/*.md` or `QUICK-WIN-BACKLOG.md`
  was edited by this phase (this phase's allowed paths exclude them; it created only
  `RECONCILIATION.md` + its planning artifacts).
- **Agreements (§1a) are recorded as confidence annotations**, not as edits to the fresh cards.
  Where the fresh pass already carried confidence 5 (reproduced), the prior corroboration is logged
  as independent-reader support, not a re-score.
- **Disagreements and prior-only insights became NEW `F-RECON-*` findings (§1b/§1c)**, carried at
  their own (often lower) confidence with explicit re-verify residuals — they do not retroactively
  raise or lower a fresh card.
- **The colon-form resolution did NOT pick a winner.** F-UX-07/08 remain the system of record;
  F-RECON-01 adds the install-transform nuance the fresh pass under-stated, without softening the
  fresh finding.
- **Where the prior was the weaker read, the fresh pass wins by construction** (D-05: fresh is the
  system of record). Example: the prior's `ARCHITECTURE.md:250` "never emitted" aspiration is
  *not* adopted over the fresh F-UX-08 measurement; the fresh measurement stands and the prior's
  own confirmed-bug entry corroborates it.

**One reliability note carried from the priors.** The frontier-research synthesis self-flags that
it was produced by LLM researchers and that **1 of 3 spot-checked citations was inverted** (the
same instrument-class failure this audit guards against, MEMORY: "Verify research-agent
citations"). Accordingly, the AI-gap agreements (§1a A-9..A-12) lean on the synthesis only for
*direction*, never magnitude — and the fresh Phase-14 sweep's WebFetched, source-text-checked
citations remain the system of record for every AI-gap claim. F-RECON-02 explicitly tags the
prior's "50% tamper" figure UNVERIFIED for this reason.

---

## 4. Summary ledger (for Phase 17 scoring)

| Bucket | Count | IDs |
|---|---:|---|
| **Agreements** (confidence-raising) | **12** | A-1 … A-12 |
| **Disagreements → new findings** | **4** | F-RECON-01 (colon-form), F-RECON-02 (harness-lock), F-RECON-03 (shim version-skew), F-RECON-04 (build/publish fragility) |
| **Prior-only → new finding** | **1** | F-RECON-05 (security lens — taxonomy gap) |
| **Prior-only → folded / recorded** | **2** | subagent-parity (folded → F-MAINT-07, confidence-raised); CHANGELOG scaling (recorded, not scored) |

**Phase-17 handoff.** The five `F-RECON-*` cards append to `FINDINGS.md` alongside the concern-sweep
cards. F-RECON-05 carries a **taxonomy flag**: the charter's five problem types have no `security`
home — Phase 17 must decide (treat severe security as `wrongness`, or add a security annotation) and
must not drop the prior's security items. F-RECON-03/04/05 each carry a **re-verify residual** (the
priors are 2026-06-05, pre-rename; confirm line numbers/advisory counts against live before sizing).

---

## 5. Most significant disagreement

**F-RECON-04 (build/publish fragility) is the most significant disagreement** — not because it is
the loudest, but because it is the only one the prior shows *already shipped a defect to every
user* (the `hooks/dist` duplicate-const PostToolUse error, since fixed). The fresh
pass, scoped to `src/*.cts` + the install-transform code, never reached the `scripts/build-hooks.js`
+ `package.json prepublishOnly` seam, so a **severity-4, all-16, historically-realized** shipping
defect class was entirely absent from the fresh register. The colon-form resolution (F-RECON-01)
is the most *intricate* delta, but F-RECON-04 is the most *consequential* one the firewall surfaced:
a whole defect class the independent fresh read missed because it lived outside the lenses' scope.

---

## 6. Plan-only attestation

This phase created only `docs/audit/comprehensive/RECONCILIATION.md` and the Phase-16 planning
artifacts under `.planning/phases/16-reconciliation-firewall/`. No protected path (`package.json`,
`src/`, `gsd-core/`, `workflows/`, `agents/`, `commands/`, `bin/`, `.gitignore`) was edited; no git
commit; no GitHub write; no project-state mutation. **The firewall lifted as designed:** the priors
(`.planning/codebase/*`, `.planning/notes/*-2026-06-05.md`, the frontier synthesis) were opened for
the first time in the entire audit *here*, after all fresh analysis (M1 2026-06-07, M2 2026-06-08)
was dated and complete — verified against the artifacts' own date stamps (§0). `bin/install.js` and
the source command corpus were opened **read-only** to verify the colon-form transform behavior
(§2); no install artifact was modified.

*Reconciliation: 2026-06-08 — Phase 16, RECON-01.*