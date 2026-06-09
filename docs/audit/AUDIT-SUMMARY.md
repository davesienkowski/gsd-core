# GSD-Core Audit — Summary & Browsable Index

## What this is

A **plan-only** audit of the GSD-Core codebase: it maps every subsystem, inventories bloat,
gap-checks the pipeline against current AI/LLM best practice, and produces a prioritized,
assignable improvement roadmap. **No code was shipped** — every item is a recommendation a
maintainer would action, and every finding cites a concrete `file:line` (against `src/*.cts`
source, never the compiled output). The work splits into two milestones:

- **M1 — Newcomer Readiness (fast-track):** 20 ICE-ranked quick-wins ahead of the Mintlify
  spotlight — the safe "cleaner and tighter" wins. See [`QUICK-WIN-BACKLOG.md`](QUICK-WIN-BACKLOG.md).
- **M2 — Comprehensive:** 68 scored findings across five problem-types, grouped into five
  assignable workstreams. See [`comprehensive/FINDINGS.md`](comprehensive/FINDINGS.md) (register)
  and [`comprehensive/IMPROVEMENT-ROADMAP.md`](comprehensive/IMPROVEMENT-ROADMAP.md) (roadmap view).

## How to use this

- **Pick from the tables below**, then click through to the full card for evidence, repro, and the recall-gate (if any).
- **Priority / ICE = higher is more worth doing** (Impact × Confidence × Ease; M2 `priority = severity × confidence × ease`).

---

## ▶ Do-first shortlist (highest value across both milestones)

The strongest first picks: high value, small effort, low/contained risk. Spotlight-eve safe.

| Finding | One-line fix | Where | ICE / pri | Lane |
|---|---|---|---:|---|
| Malformed `.planning/config.json` silently reverts to defaults on the hot path | Warn (don't silently default) when config fails to parse | `src/core.cts:545-552` vs `src/config.cts:639` | 125 | Correctness (M2 A1) / M1 QW-REL-01 |
| Executor & verifier resolvable to the **same model** → self-preference bias | Prefer a different model/tier for verifier than executor | `model-catalog.json:116,122` | 100 | AI Gap (M2 B1) |
| Docs bless **Node 18+** while package requires **≥22**, no install guard | Fix doc floor to 22 + add a `process.version` guard | `package.json:47` vs onboarding docs | 100 | Correctness / UX (M1 QW-REL-05, M2 A5) |
| README Quickstart has **0** profile mentions | Add a 2-line profile callout | `README.md` Quickstart; `bin/install.js:583` | 100 | UX (M1 QW-UX-02, M2 E1) |
| Empty-output slug collapses distinct names to one `NN-` dir (collision) | Fall back / warn when sanitization yields `''` | `src/core.cts:1919-1921` | 80 / 75 | Correctness (M1 QW-REL-02, M2 A4) |
| verify-summary checks **only the first 2** claimed files → silent pass on fabricated work | Verify all declared files, not a 2-file cap | `src/verify.cts:66,102,148` | 75 | Correctness (M2 A2) |
| Tutorial shows a fabricated "86 skills" install block | Reconcile with real installer output (live count 67) | `docs/tutorials/your-first-project.md:36-40` | 75 | UX (M1 QW-UX-04, M2 E3) |
| Newcomer's first handoff prints colon-form `/gsd:plan-phase` | Use canonical `/gsd-plan-phase` | `new-project.md:33` | 75 | UX (M2 E4) |
| Post-install "Done!" message gives no orientation | Add orient (`/gsd-help`) + slim (`/gsd-surface`) lines | `bin/install.js:11864-11877` | 64 / 75 | UX (M1 QW-UX-05, M2 E2) |
| Pre-commit hook fully stale (10 guards on the retired `sdk/` tree) | Fix or remove the dead hook (it enforces nothing today) | `.githooks/pre-commit:9-47` | 75 | Maintainability (M2 D3b) |
| Dead hooks stub (24 agents) + 1073 colon-form refs + unlocked include | 3 mechanical cleanups | agents corpus | 75 / 50 | Bloat (M1 QW-TOK-01/03/07, M2 C2) |

---

## M1 — Newcomer quick-wins (20)

ICE = Impact × Confidence × Ease (higher = better). Full detail, schema rows, and the EXECUTION-RISK
recall-gates in [`QUICK-WIN-BACKLOG.md`](QUICK-WIN-BACKLOG.md). **8 UX · 7 Token · 5 Reliability.**

### UX lane (8)

| ID | Finding → fix | Where | ICE |
|---|---|---|---:|
| QW-UX-02 | No profile docs → document the choice in README + runtime guide | `README.md`; `bin/install.js:583` | 100 |
| QW-UX-01 | No install-time profile choice → add interactive profile prompt | `src/install-profiles.cts:499-506`; `bin/install.js:371-376` | 75 |
| QW-UX-04 | Tutorial install output is fabricated → reconcile with real output | `docs/tutorials/your-first-project.md:36-40` | 75 |
| QW-UX-05 | Bare "Done!" message → add orientation + surface-slimming signpost | `bin/install.js:11864-11877` | 64 |
| QW-UX-03 | Stale `--help` counts → **largely resolved on `next`** (now derived); re-scope/close | `bin/install.js:583` | 50 |
| QW-UX-08 | ns-\* facades confusing → clarify vs underlying commands (instructional) | `src/clusters.cts:97-104`; `commands/gsd/ns-*.md` | 48 |
| QW-UX-06 | `full` is default → make `standard` the recommended newcomer choice | `src/install-profiles.cts:38-56,499-506` | 36 |
| QW-UX-07 | 67-command menu flat → tier the 6 core-loop commands as "start here" | `src/clusters.cts:33-40` vs `:97-104` | 24 |

### Token lane (7)

| ID | Finding → fix | Where | ICE |
|---|---|---|---:|
| QW-TOK-01 | Dead commented-out `# hooks:` stub in 24 agents → strip (mechanical) | `agents/gsd-planner.md:6-11` (+24) | 75 |
| QW-TOK-03 | 1073 legacy colon-form `/gsd:<cmd>` refs → normalize to `/gsd-<cmd>` (mechanical) | agents/commands/gsd-core | 40 |
| QW-TOK-02 | `<documentation_lookup>` duplicated across 8 agents → factor out, **preserve the `command -v ctx7` security guard** (instructional) | 8 agents (3 variants) | 36 |
| QW-TOK-04 | 100 uncapped `description` strings (eager bytes + routing signal) → tighten, not cut (instructional) | 100 files | 36 |
| QW-TOK-07 | `mandatory-initial-read.md` include unguarded → lock against drift (mechanical) | 5 includers | 32 |
| QW-TOK-05 | Inlined graphify workflow (3,089 tok) → relocate to `workflows/` (instructional) | `commands/gsd/graphify.md` | 32 |
| QW-TOK-06 | execute/plan-phase monoliths (21.5k/20.7k) → lazy mode-file split (instructional) | `gsd-core/workflows/*` | 12 |

### Reliability lane (5)

| ID | Finding → fix | Where | ICE |
|---|---|---|---:|
| QW-REL-01 | Config parse-fail silently defaults → warn instead | `src/core.cts:545-552` | 100 |
| QW-REL-05 | Node 18+ docs vs ≥22 package → reconcile + `process.version` guard | `package.json:47` vs docs | 100 |
| QW-REL-02 | Empty slug collapses names → fall back / warn on `''` | `src/core.cts:1919-1921` | 80 |
| QW-REL-04 | Drift-detector exception echoes blank message → populate it | `src/drift.cts:252-270` | 40 |
| QW-REL-03 | Inconsistent exit codes on no-`.planning/` reads → document/align | state/progress vs roadmap | 32 |

> **EXECUTION-RISK note:** the 5 instructional Token items (QW-TOK-02/04/05/06, QW-UX-08) are never
> phrased as "delete" — each names a recall/parity gate that must pass before any cut ("verifier reach = spec reach").

---

## M2 — Comprehensive findings (68)

Grouped by problem-type (MECE, tie-break order Correctness > AI Gap > Bloat > Maintainability > UX).
Counts: **16 Correctness · 7 AI Gap · 17 Bloat · 14 Maintainability · 14 UX**. Notable findings
only — the complete scored register is [`comprehensive/FINDINGS.md`](comprehensive/FINDINGS.md);
the workstream/sequencing view is [`comprehensive/IMPROVEMENT-ROADMAP.md`](comprehensive/IMPROVEMENT-ROADMAP.md).

### Correctness — wrongness (16) — *silent-wrong-result paths on load-bearing instruments*

The headline: the config hot path and the work verifier can both produce a silent wrong result.
Two critical defects gate trust in the whole pipeline.

| id | Finding → fix | Where | sev / eff |
|---|---|---|---|
| F-CORR-02 | Malformed config silently reverts to defaults → warn / converge contract | `src/core.cts:545-552` | 5 / S |
| F-CORR-01 | verify-summary checks only first 2 files → verify all declared | `src/verify.cts:66,102,148` | 5 / M |
| F-CORR-03 | verify self-check is a keyword grep → self-graded pass; make exogenous | `src/verify.cts:123-134` | 4 / M |
| F-CORR-05 | Empty slug collapses dirs → guard the `''` case | `src/core.cts:1919-1920` | 3 / S |
| F-CORR-08 | Node floor contradiction → fix docs + add installer guard | `package.json:47` vs docs | 3 / S |
| F-CORR-09 | verify artifacts: exit-0 error-object, no `all_passed` → consistent shape | `src/verify.cts:372-405` | 2 / S |
| F-RECON-05 | Security lens (prompt-injection consistency / secret-log mask) — `tag:security` | engine | 3 / M |
| F-CI-01 | No `npm audit` advisory gate in CI → add one (0 vulns today) | `concerns/build-ci-hooks.md` | 2 / S |
| F-BUILD-01 | `build-hooks.js` skips the 4 `.sh` hooks → extend `bash -n` validation | `scripts/build-hooks.js:158-159,205` | 2 / S |

### AI Gap — external-gap (7) — *exogenous, calibrated, tamper-resistant verification*

The strategic theme for an LLM-orchestration framework. Instructional items carry recall gates.

| id | Finding → fix | Where | sev / eff |
|---|---|---|---|
| F-AIGAP-02 | Executor & verifier same model → use a different tier for the verifier | `model-catalog.json:116,122` | 4 / S |
| F-AIGAP-01 | Verifier emits categorical verdict → add calibrated confidence | `gsd-verifier.md:169-173` | 4 / M |
| F-AIGAP-03 | No must_NOT_haves / prohibitions list → spec-gaming passes | `gsd-planner.md`/`gsd-verifier.md` | 3 / M |
| F-AIGAP-04 | Verifier evidence is self-reported → make it exogenous | `few-shot-examples/verifier.md:25-36` | 3 / M |
| F-AIGAP-05 | Load-bearing gates buried mid-context in 86.8K execute-phase.md (lost-in-the-middle) | workflows | 3 / M |

### Bloat — waste (17) — *install-profile tiering + conceptual de-duplication*

Two levers: profile tiering (the 173,834-token eager-cost lever) and de-duplication. Every
prompt-corpus cut carries the load-bearing guard.

| id | Finding → fix | Where | sev / eff |
|---|---|---|---|
| F-BLOAT-02 | Dead `vitest.config.ts ./sdk` + SDK-handler comments (SDK retired) → remove | tests | 2 / S |
| F-BLOAT-09 | 3 mechanical wins: dead hooks stub (24) + 1073 colon-form + include lock | agents | 2 / S |
| F-BLOAT-13 | The 173,834-token eager tax → install-PROFILE tiering (not corpus cutting) | agents | 3 / L |
| F-BLOAT-14 | Lazy mode-file split for execute-phase + plan-phase | workflows | 3 / L |
| F-BLOAT-10 | `<documentation_lookup>` factor-out MUST preserve the ctx7 security guard | agents | 2 / M |
| F-BLOAT-16 | 11 per-family routers → one table-driven factory? | engine | 2 / M |

### Maintainability — change-cost (14) — *the two monoliths + the installer↔engine back-edge*

`bin/install.js` (12.7k) and `core.cts` (cx-602). Sequence decompositions so correctness fixes land inside them.

| id | Finding → fix | Where | sev / eff |
|---|---|---|---|
| F-BUILD-02 | Pre-commit hook fully stale (keys on retired `sdk/`) → fix or remove | `.githooks/pre-commit:9-47` | 3 / S |
| F-MAINT-11 | Skill counts hand-maintained → derive from install-profiles.cts | installer | 2 / S |
| F-MAINT-10 | Audit-method gap → add "Site 5 — workflow shim" to indirection inventory | docs | 2 / S |
| F-MAINT-02 | Installer↔engine back-edge → break it | `runtime-artifact-layout.cts:51` | 3 / M |
| F-MAINT-01 | Decompose `bin/install.js` (12,727 LOC) along runtime-converter seams | installer | 4 / L |
| F-MAINT-03 | Decompose `core.cts` (cx-602, the 108-cx function); sequence with config fixes | engine | 4 / L |

### UX — human-friction (14) — *the spotlight workstream; lean on existing progressive disclosure*

The machinery already exists (`/gsd-surface`, profiles, clusters) — use it, don't reinvent. No
command/flag is ever deleted.

| id | Finding → fix | Where | sev / eff |
|---|---|---|---|
| F-UX-01 | README Quickstart has 0 profile mentions → 2-line callout | docs | 3 / S |
| F-UX-04 | Bare "Done!" message → add orient + slim lines | installer | 3 / S |
| F-UX-05 | Fabricated "86 skills" tutorial block → real lines | docs | 3 / S |
| F-UX-07 | First handoff says `/gsd:plan-phase` (colon) → canonical form | `new-project.md:33` | 3 / S |
| F-UX-02 | Add interactive profile prompt (highest-leverage newcomer moment) | installer | 4 / M |
| F-RECON-01 | Colon-form is a 3-way truth (source carries it, leaks for most runtimes) → fix at SOURCE | skills | 3 / M |

---

## Cross-cutting themes

- **"Verifier reach = spec reach."** The deepest thread: a work verifier that checks only 2 files,
  self-grades by keyword grep, runs the same model as the executor, and emits no calibrated
  confidence can silently pass fabricated or spec-gaming work (F-CORR-01/03, F-AIGAP-01/02/04,
  F-RECON-02, F-MAINT-08). This is the single most important finding cluster.
- **The two monoliths.** `bin/install.js` (12.7k LOC) and `core.cts` (cx-602) concentrate both
  correctness defects and change-cost; decompose them *while* fixing the defects inside, not in
  colliding PRs (F-MAINT-01/03, A-workstream).
- **Progressive disclosure built-but-invisible.** `/gsd-surface`, install profiles, and clusters
  already exist — the UX gap is that newcomers never see them (0 profile mentions in the README,
  no install-time prompt, bare post-install message). Lean on the existing machinery.
- **Silent-default failure mode.** Config parse-failure, empty-slug, and drift-exception all
  fail *quietly* — the recurring correctness anti-pattern is swallowing a wrong outcome.
- **Colon-form slash sprawl.** Legacy `/gsd:<cmd>` references persist across source and leak to
  most runtimes; canonical is `/gsd-<cmd>` (F-UX-07/08/12, F-RECON-01, F-BLOAT-09).

---

## Methodology — what this was audited with

- **Orchestration:** Claude Opus 4.8 driving ~25 subagents, with **cold adversarial red-teams**
  (separate evidence + process reviews per milestone) that surfaced genuine gaps (e.g. the
  unswept build/CI/hooks subsystems, the Node-version landmine).
- **Deterministic tool chain:** knip, dependency-cruiser, madge, jscpd, code-complexity,
  gpt-tokenizer (`o200k_base`), and `tsc` — every bloat/structure claim is tool-grounded.
- **Usage mining:** 92 real transcript sessions mined for which commands/flags are actually used.
- **Behavioral repros:** read-only reproductions in throwaway `/tmp` dirs reproduced the top defects.
- **External citations:** every AI/LLM best-practice claim was **WebFetched and checked against
  source text** (this project has hit inverted-citation failures, so unverified claims are flagged).
- **Supply chain:** `npm audit` = **0** vulnerabilities at time of audit.
- **Dogfooded on GSD** with a reconciliation firewall: findings were re-derived from live code
  before reconciling against prior artifacts (the firewall keeps the new read objective).

## Caveats

- **AI-performed but tool-grounded.** Top defects were reproduced; spot-check a finding before actioning it.
- **Usage data is single-author (n=1).** The 92-session mine is directional, not statistically representative.
- **Reflexive subject.** GSD was audited *with* GSD — the reconciliation firewall and cold
  red-teams exist to counter the self-grading risk this introduces.

---

## Go deeper

**Charter & registers**
- [`comprehensive/AUDIT-CHARTER.md`](comprehensive/AUDIT-CHARTER.md) — locked taxonomy, ICE sizing, card schema
- [`comprehensive/FINDINGS.md`](comprehensive/FINDINGS.md) — the 68 scored cards (source of truth)
- [`comprehensive/IMPROVEMENT-ROADMAP.md`](comprehensive/IMPROVEMENT-ROADMAP.md) — workstreams, sequencing, ownership
- [`comprehensive/RECONCILIATION.md`](comprehensive/RECONCILIATION.md) — new read vs prior artifacts
- [`comprehensive/TRACKING-SURFACE-POPULATED.md`](comprehensive/TRACKING-SURFACE-POPULATED.md) — board-ready intake rows

**Concern sweeps**
- [`comprehensive/concerns/pipeline-correctness.md`](comprehensive/concerns/pipeline-correctness.md)
- [`comprehensive/concerns/ai-llm-gaps.md`](comprehensive/concerns/ai-llm-gaps.md)
- [`comprehensive/concerns/bloat.md`](comprehensive/concerns/bloat.md)
- [`comprehensive/concerns/maintainability.md`](comprehensive/concerns/maintainability.md)
- [`comprehensive/concerns/ux.md`](comprehensive/concerns/ux.md)
- [`comprehensive/concerns/build-ci-hooks.md`](comprehensive/concerns/build-ci-hooks.md)

**Map & instrumentation**
- [`comprehensive/map/SUBSYSTEM-MAP.md`](comprehensive/map/SUBSYSTEM-MAP.md) · [`comprehensive/map/PIPELINE-TRACE.md`](comprehensive/map/PIPELINE-TRACE.md) · [`comprehensive/map/HOTSPOTS.md`](comprehensive/map/HOTSPOTS.md) · [`comprehensive/map/subsystems/`](comprehensive/map/subsystems/)
- [`comprehensive/instrumentation/`](comprehensive/instrumentation/) — dynamic indirection, runtime-divergence matrix, source-of-truth map
- [`comprehensive/evidence/`](comprehensive/evidence/) — static-analysis + usage backbone

**Adversarial reviews**
- [`comprehensive/review/ADVERSARIAL-M2-REVIEW-SUMMARY.md`](comprehensive/review/ADVERSARIAL-M2-REVIEW-SUMMARY.md) · [`...EVIDENCE`](comprehensive/review/ADVERSARIAL-M2-EVIDENCE.md) · [`...PROCESS`](comprehensive/review/ADVERSARIAL-M2-PROCESS.md)

**M1 deliverables**
- [`QUICK-WIN-BACKLOG.md`](QUICK-WIN-BACKLOG.md) · [`STREAMS.md`](STREAMS.md) · [`BACKLOG-SCHEMA.md`](BACKLOG-SCHEMA.md) · [`TRACKING-SURFACE.md`](TRACKING-SURFACE.md) · [`DELIV-HOME.md`](DELIV-HOME.md)
- M1 streams: [`streams/ux-stream.md`](streams/ux-stream.md) · [`streams/token-stream.md`](streams/token-stream.md) · [`streams/reliability-stream.md`](streams/reliability-stream.md)
- M1 review: [`review/ADVERSARIAL-REVIEW-SUMMARY.md`](review/ADVERSARIAL-REVIEW-SUMMARY.md)
