# Static Evidence Sweep — Cited Findings (Phase 10)

> **Requirement:** none (evidence phase) — output consumed by **Phase 12** (bloat/maintainability)
> and **Phase 13** (correctness). · **Mode:** audit-and-plan only.
> **Derived:** 2026-06-08 from the Phase 7 analyzer reports
> (`docs/audit/comprehensive/instrumentation/reports/`) + Phase 8 `map/HOTSPOTS.md`,
> re-verified live against `src/*.cts` this phase.
> **Charter:** `docs/audit/comprehensive/AUDIT-CHARTER.md` (evidence-card schema §2.2,
> evidence standard §3.2, load-bearing guard §3.5).

## Scope & invariants (charter §0)

- Every citation targets **`src/*.cts`** or the prompt/`.md` corpus — **never** compiled
  `gsd-core/bin/lib/*.cjs`. No `.cts↔.cjs` source/artifact pair is counted as duplication.
- These are **evidence / leads** with a *provisional* `problem_type`. Phases 12/13 own final
  classification and scoring; Phase 17 scores the register. Severity/confidence here are first
  reads, not the §2.1 product.
- Branch-local `edge-probe.cjs` / `probe-core.cjs` are **excluded** (SOURCE-OF-TRUTH-MAP §"4 EXTRA").

---

## 1. The false-positive guard ledger (charter SC-2 — MANDATORY, shown)

**The rule:** no "dead / unused / orphan" finding is admissible until cross-checked against
`DYNAMIC-INDIRECTION.md` + the dispatch tables, with the check recorded. Phase 7 already proved
**knip's 45 "unused files" are ALL false** (each is `require('./lib/<name>.cjs')`'d by
`gsd-core/bin/gsd-tools.cjs` from outside `src/`). This phase re-ran the guard **live** on every
remaining dead/unused candidate. The ledger below is the credibility record: it shows what
survived and what was **dismissed**, so the volume is auditable.

### 1.1 The candidate populations

| Signal | Source report | Raw count | After guard |
|--------|---------------|-----------|-------------|
| knip "unused files" | `reports/knip-output.txt` | 45 | **0 dead** (all false — Site 0; proven Phase 7) |
| madge "orphans" | `reports/madge-orphans.txt` | 88 | **0 dead** (pure tool artifact — madge can't follow `.cjs` specifiers; dep-cruiser is authoritative) |
| dependency-cruiser orphans | `reports/depcruise.json` | 13 | **0 dead** (all 13 cleared live — see 1.2) |
| knip "unused exports" | `reports/knip-output.txt` | 88 | **0 confirmed dead** (dispatch-table dominated — see F-WASTE-AGG-01) |
| knip "unused exported types" | `reports/knip-output.txt` | 6 | type-only; cleared/aggregated (F-MAINT-02) |
| knip "unused dependencies" | `reports/knip-output.txt` | 4 (+2 dev) | **2 survive as candidates** (`ws`, `@anthropic-ai/claude-agent-sdk`); 2 dev dismissed (see F-WASTE-01) |

**Net dead-code result, stated honestly:** after the mandatory cross-check, **no `src/*.cts`
module and no exported function survives as confirmed dead code.** The only surviving
`waste`-of-deletion candidates are at the **dependency-manifest** and **unused-type** level
(F-WASTE-01, F-MAINT-02), at deliberately modest confidence. This is the expected outcome for a
heavily indirection-driven engine — and exactly why an un-cross-checked dead-code claim would have
been invalid.

### 1.2 The 13 dependency-cruiser orphans — each cleared live (none dead)

Each orphan was run through the DYNAMIC-INDIRECTION 6-step flow plus a repo-wide consumer grep.
**Finding of note:** the guard's documented Site 0 covered only `gsd-tools.cjs` + `bin/install.js`.
This sweep surfaced a **6th live channel the inventory under-documents: workflow markdown bash
shims** that `require('./gsd-core/bin/lib/<name>.cjs')` directly (e.g. `gsd-core/workflows/code-review.md`,
`autonomous.md`, `plan-phase.md`). That channel keeps several "orphans" live and is recorded as
F-MAINT-01 (a guard-completeness lead, not a defect).

| Orphan (`src/…cts`) | Cleared-live evidence | Live channel |
|---------------------|-----------------------|--------------|
| `cli-exit.cts` | `gsd-tools.cjs` `require('./lib/cli-exit.cjs')` (1) | Site 0 |
| `prompt-budget.cts` | `gsd-tools.cjs` require (1) | Site 0 |
| `update-context.cts` | `gsd-tools.cjs` require (1) | Site 0 |
| `package-legitimacy.cts` | `gsd-tools.cjs` require (2) | Site 0 |
| `installer-migration-report.cts` | `bin/install.js` ref (1) | Site 0 (installer) |
| `runtime-config-adapter-registry.cts` | `bin/install.js` ref (1) | Site 0 + Site 2 (per-runtime adapter registry) |
| `installer-migrations/000-first-time-baseline.cts` | `readdirSync` loader | Site 1 |
| `installer-migrations/001-legacy-orphan-files.cts` | `readdirSync` loader | Site 1 |
| `code-review-flags.cts` | `gsd-core/workflows/code-review.md:53` `require('./gsd-core/bin/lib/code-review-flags.cjs')` + `tests/code-review-flags.test.cjs` | **Site 5 (workflow shim)** |
| `fallow-runner.cts` | `gsd-core/workflows/code-review.md:344` `require(...fallow-runner.cjs)` + `tests/feat-3210-fallow-integration.test.cjs` | **Site 5 (workflow shim)** |
| `ui-safety-gate.cts` | `gsd-core/workflows/autonomous.md`, `plan-phase.md` + 3 tests | **Site 5 (workflow shim)** |
| `semver-compare.cts` | `scripts/run-tests.cjs:42`, `hooks/gsd-statusline.js:9` (`isSemverNewer`), `scripts/changeset/cli.cjs` + tests | scripts/hooks consumers |
| `config-types.cts` | `import type` consumed by `core.cts`, `model-catalog.cts`, `config.cts` (type-only → erases at runtime → invisible to dep-cruiser) | type-only import |

---

## 2. Evidence cards

### 2.1 Dead / unused (all guard-checked)

```yaml
- id: F-WASTE-01
  problem_type: waste
  subsystem: engine            # package manifest
  file:line: "package.json:52  (\"ws\": \"8.20.1\")  + package.json:51 (@anthropic-ai/claude-agent-sdk ^0.2.84)"
  severity: 2                  # manifest cruft; no runtime cost, small trust/clarity cost
  effort: S
  risk: med                    # ws may be a peer the SDK resolves at runtime; removing a real peer breaks agent spawn
  confidence: 3                # zero direct import sites found repo-wide; but cannot prove the SDK doesn't need ws as a declared peer without a runtime probe
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  cross_check: "Repo-wide grep for require('ws')/from 'ws' across *.js/*.cjs/*.cts/*.mts → ZERO matches (incl. sdk/). M1 doc QUICK-WINS-CONFIRMED-BUGS.md:21 itself notes ws is 'transitive via @anthropic-ai/claude-agent-sdk'. claude-agent-sdk: zero source import sites either, but it is the documented agent-spawn dependency (may load dynamically)."
  recommendation: "Phase 12: confirm whether `ws` is required as a declared peer of the agent SDK; if not, drop the direct dependency. Treat `@anthropic-ai/claude-agent-sdk` separately — verify it is actually invoked (dynamic spawn) before any removal claim; do NOT delete on the strength of a static grep alone."
  recall_gate: n/a

- id: F-WASTE-AGG-01
  problem_type: waste
  subsystem: engine
  file:line: "reports/knip-output.txt (88 unused exports) — e.g. src/command-aliases.cts:22 STATE_COMMAND_ALIASES; src/state-command-router.cts default; src/runtime-homes.cts:165 getGlobalSkillsBase"
  severity: 1                  # aggregate; per-item below severity floor (charter §3.4.3)
  effort: M
  risk: high                   # most are live via string dispatch — a naive cut breaks routing
  confidence: 2                # the LIST is real; the 'dead' interpretation is mostly false
  runtime_blast_radius: multi
  mechanical_vs_instructional: n/a
  cross_check: "Categorized the 88: 11 are *-command-router.cts `default` exports (Site 3), 8 are command-aliases.cts alias tables (Site 3 keys), 5 are installer-migration `default` exports (Site 1), the rest are entry-point-consumed helpers (runtime-homes/security/installer-migration-report → Site 0). NONE confirmed dead. knip is scoped to src/ and cannot see the out-of-src + workflow-shim consumers."
  recommendation: "Do NOT treat as a delete list. Phase 12 may use it as a *narrowing* lens: re-run knip with the entry points (gsd-tools.cjs, bin/install.js, workflow shims) declared, and investigate only any residual that survives that wider graph. Recorded here as an aggregate, not 88 cards."
  recall_gate: n/a
```

### 2.2 Duplication (jscpd TypeScript clones only — real intra-source clones)

> Source: `reports/jscpd/jscpd-report.json`, **typescript format only** (83 clones, 1,091 lines,
> **2.69%** of TS — low). The markdown corpus (`11.73%`) is a **separate Phase-12 lead**, carded
> at 2.4, not as a code clone. No `.cts↔.cjs` pair is counted.

```yaml
- id: F-MAINT-03
  problem_type: change-cost
  subsystem: engine
  file:line: "src/audit.cts:467-478 (scanUatGaps) vs src/audit.cts:537-548 (scanVerificationGaps); also 481-495 vs 551-565, 599-610, 613-627 (7 clones total in audit.cts)"
  severity: 2
  effort: S
  risk: low
  confidence: 5                # read both blocks: identical phases-dir scan preamble (readdirSync→filter dir→map name→sort, same catch shape)
  runtime_blast_radius: none   # internal refactor, behavior-preserving
  mechanical_vs_instructional: n/a
  cross_check: "Confirmed real intra-file copy-paste by reading src/audit.cts:467 and :537 — same phase-dir enumeration boilerplate duplicated across the two gap scanners. Not a source/artifact pair."
  recommendation: "Phase 12: extract a shared `listPhaseDirs(planDir)` helper; audit.cts is the densest TS-clone file (7 of 83)."
  debt_quadrant: prudent-inadvertent

- id: F-MAINT-AGG-04
  problem_type: change-cost
  subsystem: engine
  file:line: "reports/jscpd/jscpd-report.json (typescript) — clone clusters: init.cts (11), state.cts (9), install-profiles.cts (8), audit.cts (7), profile-output.cts (5), verify.cts (4), phase.cts (4); cross-file: commands.cts↔init.cts, config.cts↔init.cts, init.cts↔roadmap.cts (×3)"
  severity: 2
  effort: M
  risk: low
  confidence: 4                # jscpd line-pairs are checkable; spot-confirmed in audit.cts
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  cross_check: "TypeScript-format clones only; markdown/json/bash clone rows excluded. The cross-file init.cts↔roadmap.cts/config.cts/commands.cts pairs suggest init.cts re-implements aggregation other modules already do — a BLOAT-02 / change-cost lead, not duplication-as-dead."
  recommendation: "Phase 12: the clone density concentrates in the aggregators (init.cts) and lifecycle (state/phase) — same files flagged oversized. Treat clone reduction as a side effect of the oversized-module refactor, not a separate workstream."
  debt_quadrant: prudent-inadvertent

- id: F-WASTE-02
  problem_type: waste
  subsystem: docs             # prompt/reference corpus
  file:line: "jscpd markdown 11.73% (13,456 dup lines / 389 .md files); concrete pair: docs/zh-CN/references/verification-patterns.md vs gsd-core/references/verification-patterns.md (shared 150-397 code-fence region)"
  severity: 3                 # recurring token tax across the corpus; the headline bloat lens
  effort: L
  risk: med                   # translation pairs + load-bearing reference prose are intermixed
  confidence: 3               # the 11.73% aggregate is real; per-pair mechanical-vs-instructional NOT yet assessed
  runtime_blast_radius: all-14+   # corpus ships to every runtime's system prompt
  mechanical_vs_instructional: instructional   # corpus is load-bearing until proven otherwise — guard §3.5
  cross_check: "The zh-CN ↔ gsd-core verification-patterns.md match is NOT an identical-file duplicate (diff over 150-397 = 300 changed lines): jscpd matched the shared *untranslated English code-fence blocks* embedded in both docs. So this is corpus structure, not a delete-the-file case."
  recommendation: "HANDOFF → Phase 12 (BLOAT). Treat the 11.73% markdown corpus as the primary bloat lead. Per charter §3.5 every cut needs mechanical-vs-instructional classification + a recall_gate; do NOT card any corpus cut as 'delete' here."
  recall_gate: "(Phase-12) edge-probe / workflow-parity harness before trimming any reference prose"
```

### 2.3 Dependency issues

```yaml
- id: F-MAINT-01
  problem_type: change-cost
  subsystem: engine
  file:line: "docs/audit/comprehensive/instrumentation/DYNAMIC-INDIRECTION.md (Site 0) — under-documents the workflow-shim require channel; live examples: gsd-core/workflows/code-review.md:53,344; autonomous.md; plan-phase.md"
  severity: 2
  effort: S
  risk: low
  confidence: 5               # the workflow shims literally require('./gsd-core/bin/lib/<name>.cjs') — read this phase
  runtime_blast_radius: none  # documentation/guard-completeness, not runtime
  mechanical_vs_instructional: n/a
  cross_check: "Cleared code-review-flags / fallow-runner / ui-safety-gate as live via workflow markdown bash shims, a require channel the Phase-7 guard's Site 0 lists only for gsd-tools.cjs + bin/install.js. The guard's CONCLUSIONS were correct (these are live) but its inventory of *how* is incomplete."
  recommendation: "Phase 12/16: add a 'Site 5 — workflow markdown bash shims' entry to the dynamic-indirection inventory so future dead-code passes don't re-flag these. A maintainability/credibility improvement to the audit method, not a code defect."
  debt_quadrant: prudent-inadvertent

- id: F-OBS-DEP-01    # observation, not a defect
  problem_type: change-cost
  subsystem: engine
  file:line: ".gitignore (95 explicit /gsd-core/bin/lib/*.cjs lines, one per emitting source — SOURCE-OF-TRUTH-MAP §'.gitignore shape')"
  severity: 2
  effort: S
  risk: med
  confidence: 4
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  cross_check: "Per-line enumeration (not a glob) means each ADR-457 migration must hand-add its emitted .cjs; a forgotten line would commit a build artifact. depcruise+madge already prove no circular deps (madge-circular.txt: 'No circular dependency found')."
  recommendation: "Phase 12: replace the 95 enumerated lines with a `gsd-core/bin/lib/**/*.cjs` glob (or a generated block) to remove the drift surface. Recorded as observation; not asserted as a present defect."
  debt_quadrant: prudent-deliberate
```

> **No circular dependencies** (`reports/madge-circular.txt` + dep-cruiser 94 modules / 176 edges).
> Recorded as a clean result, not a finding.

### 2.4 Oversized modules

```yaml
- id: F-MAINT-05
  problem_type: change-cost
  subsystem: installer        # bin/ (NOT src/ — outside the complexity scan)
  file:line: "bin/install.js  (12,727 LOC, 216 top-level functions — verified `wc -l` + `grep -c '^(async )?function'` this phase)"
  severity: 4                 # largest single change-cost surface in the repo (Phase 8 SUBSYSTEM-MAP §3.3)
  effort: L
  risk: high                  # touches every one of 14+ runtimes' install path
  confidence: 5               # direct line count
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: n/a
  cross_check: "Not a dead-code claim — a size/change-cost claim. Absent from HOTSPOTS complexity table only because it is .js outside src/; HOTSPOTS metric-caveat explicitly flags it must not be skipped for lack of a metric."
  recommendation: "Phase 12 (maintainability): the install monolith is the top decomposition target. Plan-only — propose module extraction along the runtime-artifact-layout / converter seams; do not refactor here."
  debt_quadrant: prudent-inadvertent

- id: F-MAINT-06
  problem_type: change-cost
  subsystem: engine
  file:line: "src/core.cts:1 (602 fileCx, 2054 LOC, maxFn 108, churn 142, fan-in 24/out 9 — HOTSPOTS rank 1, churn×cx 85,484)"
  severity: 4                 # most-changed × most-complex × most-depended-upon; all-16 blast radius on any defect
  effort: L
  risk: high
  confidence: 5               # complexity.json + git --follow churn
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: n/a
  cross_check: "Size/complexity hotspot, not dead code. Sourced from complexity.json (McCabe) + HOTSPOTS churn×cx."
  recommendation: "Phase 13 (correctness) reads core.cts first; Phase 12 evaluates decomposition. The single 108-complexity function is the priority unit."
  debt_quadrant: prudent-inadvertent

- id: F-CORR-LEAD-01
  problem_type: wrongness     # provisional — a correctness LEAD for Phase 13
  subsystem: engine
  file:line: "src/verify.cts (maxFn 150 — the single hottest function in the engine; fileCx 359, 1615 LOC, churn only 2 → HOTSPOTS rank #22 on the product but flagged separately)"
  severity: 4                 # most defect-prone *unit*; sits on the verification path ('verifier reach = spec reach')
  effort: L
  risk: high
  confidence: 4               # complexity.json maxFunctionComplexity=150 is checkable; the *defect* is a hypothesis Phase 13 confirms
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: n/a
  cross_check: "Static complexity signal only — no behavioral defect asserted here. HOTSPOTS 'Separately flagged': product rank under-weights it because churn is low; Phase 13 must read it regardless."
  recommendation: "HANDOFF → Phase 13 (correctness): read verify.cts's 150-complexity function for swallowed-error / silent-default / branch-coverage gaps. Carded at static confidence; behavioral confirmation is Phase 13's job."

- id: F-MAINT-07
  problem_type: change-cost
  subsystem: engine
  file:line: "src/init.cts (fileCx 419 = 2nd-highest, 1996 LOC, churn 5) and the cross-file clones init.cts↔roadmap/config/commands (§2.2)"
  severity: 3
  effort: L
  risk: med
  confidence: 4
  runtime_blast_radius: multi
  mechanical_vs_instructional: n/a
  cross_check: "Huge low-churn aggregator (HOTSPOTS 'Separately flagged'). Its 11 intra-file + cross-file clones suggest it re-implements aggregation other modules already provide — bloat/maintainability, not a defect."
  recommendation: "Phase 12: init.cts is a BLOAT-02 (surface sprawl) + change-cost lead; pairs with the duplication clusters in §2.2."
  debt_quadrant: prudent-inadvertent
```

> Other oversized engine files (Phase 8 HOTSPOTS top-25: `state.cts` 1900 LOC, `phase.cts` 1527,
> `commands.cts` 1233, `profile-output.cts` 1096, `worktree-safety.cts` 1013) are carried to
> Phase 12 **in aggregate via the HOTSPOTS table** (charter §3.4.3 severity-floor) rather than
> one card each — the roadmap needs the ranked surface, not 20 near-duplicate size cards.
> `gsd-core/bin/gsd-tools.cjs` (1,928 LOC, non-`src/` entry) noted as a secondary monolith.

### 2.5 Type / contract concerns

```yaml
- id: F-MAINT-02
  problem_type: change-cost
  subsystem: engine
  file:line: "src/config-types.cts:1-62 — interfaces RuntimeTiers and ModelPolicyConfig have ZERO references repo-wide (TierEntry→core/model-catalog, ProjectConfig→config.cts are used)"
  severity: 1
  effort: S
  risk: low
  confidence: 4               # grepped all 4 interface names across *.cts/*.cjs/*.ts repo-wide
  runtime_blast_radius: none  # types erase at runtime
  mechanical_vs_instructional: n/a
  cross_check: "config-types.cts is NOT a dead module (depcruise/knip flag it because type-only `import type` edges erase and are invisible). But 2 of its 4 exported interfaces (RuntimeTiers, ModelPolicyConfig) are genuinely unreferenced — a real, small, low-risk unused-type pocket."
  recommendation: "Phase 12: drop or wire RuntimeTiers/ModelPolicyConfig. Trivial; only if they are not a forward-declared contract for an in-flight feature (check before cutting)."
  debt_quadrant: prudent-inadvertent

- id: F-MAINT-AGG-08
  problem_type: change-cost
  subsystem: engine
  file:line: "reports/knip-output.txt 'Unused exported types (6)': ContextState (src/context-utilization.cts:23), AgentMeta+ModelCatalog (src/model-catalog.cts:34,43), HubResult (src/observability/event.cts:37), ResolveAntigravityOpts (src/runtime-homes.cts:32), WorkstreamValidationResult (src/workstream-name-policy.cts:16)"
  severity: 1
  effort: S
  risk: low
  confidence: 2               # 'unused exported type' from knip; type consumers (import type / structural use) are easy to miss — needs per-type confirmation
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  cross_check: "Aggregated, not asserted dead per-item: knip cannot see structural / type-only consumers reliably (cf. config-types where 2 of 4 WERE used). Each needs a per-type grep before any cut."
  recommendation: "Phase 12: confirm each of the 6 individually (grep the type name) before treating as removable; recorded as a low-confidence aggregate lead, not 6 cards."
  debt_quadrant: prudent-inadvertent
```

---

## 3. Handoffs (charter §3.4.5)

| To phase | Item | Card |
|----------|------|------|
| **Phase 12 (bloat)** | Markdown corpus 11.73% duplication — primary bloat lead, instructional-guarded | F-WASTE-02 |
| **Phase 12 (bloat)** | `bin/install.js` 12,727-LOC monolith decomposition | F-MAINT-05 |
| **Phase 12 (maint)** | TS clone clusters + init.cts aggregator sprawl | F-MAINT-AGG-04, F-MAINT-07 |
| **Phase 12 (maint)** | `.gitignore` per-line enumeration drift surface | F-OBS-DEP-01 |
| **Phase 12 (waste)** | `ws` / agent-SDK dependency audit (runtime probe needed) | F-WASTE-01 |
| **Phase 13 (correctness)** | `verify.cts` complexity-150 function + `core.cts` | F-CORR-LEAD-01, F-MAINT-06 |
| **Phase 16 (recon)** | Add "Site 5 — workflow markdown bash shims" to the dynamic-indirection guard | F-MAINT-01 |

## 4. Honesty statement (charter §3.2, SC-1)

Every card cites a `file:line` / report row / live grep a reviewer can re-check. Every dead/unused
candidate carries its `cross_check`. **After the mandatory guard, zero `src/*.cts` modules and zero
exported functions survived as confirmed dead** — the surviving deletion candidates are two
manifest dependencies (low confidence, runtime probe required) and a small unused-interface pocket.
That is the honest result; no dead code was invented to fill the category (charter SC-2). The
largest evidence is **change-cost (oversized modules) and corpus-level waste (markdown 11.73%)**,
not engine dead code.

*Plan-only attestation: this phase created only
`docs/audit/comprehensive/evidence/static-findings.md` and the Phase-10 planning artifacts under
`.planning/phases/10-static-evidence-sweep/`. No protected path (`package.json`, `src/`,
`gsd-core/`, `workflows/`, `agents/`, `commands/`, `bin/`, `.gitignore`) was edited; no git commit;
no GitHub write. The firewall (`.planning/codebase/*`, `.planning/notes/*-2026-06-05.md`, frontier
synthesis) was honored — only Phase 7 reports, Phase 8 map files, the charter, and live `src/*.cts`
were opened.*
