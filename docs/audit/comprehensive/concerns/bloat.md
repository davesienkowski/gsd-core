# Concern Sweep — Bloat (BLOAT-01..04)

> **Requirement:** BLOAT-01, BLOAT-02, BLOAT-03, BLOAT-04 (terminal, Phase 12) ·
> **Mode:** audit-and-plan only (no code changed) · **Derived:** 2026-06-08
> **Charter:** `docs/audit/comprehensive/AUDIT-CHARTER.md` — problem_type `waste` (§1.1),
> evidence-card schema (§2.2), load-bearing guard (§3.5), `src/`-only rule (§0).
> **This file is the narrative;** the scorable cards below are appended to `FINDINGS.md` (Phase 17).

This sweep **organizes** the existing Phase 7–11 + Milestone-1 evidence into the four bloat
lenses — it does **not** re-mine. Every card cites a `src/*.cts` line, an `.md` corpus path, a
report row, or a live grep a reviewer can re-check. The honest headline up front:

> **There is almost no dead code. The real bloat is corpus token mass + surface sprawl.**
> After the mandatory false-positive guard, **zero `src/*.cts` modules and zero exported
> functions survive as confirmed dead** (Phase 10). The carried-but-not-earning mass is the
> **prompt/token corpus** (626,417 tokens; 173,834 eager every invocation) and the **command/
> agent/flag surface** (67 commands, 33 agents) — none of which is "dead," all of which is a
> *progressive-disclosure / relocate-restructure* problem, never a delete-by-low-usage one.

Blast radius uses the 16-runtime classes from `instrumentation/RUNTIME-DIVERGENCE-MATRIX.md`
(`none` / `claude-only` / `multi` / `all-16` ≈ the charter `all-14+`).

---

## BLOAT-01 — Dead & duplicated code (the false-positive guard, shown)

### The guard ledger (charter SC-2 — mandatory, reproduced from Phase 10)

No "dead/unused/orphan" claim is admissible until cross-checked against `DYNAMIC-INDIRECTION.md`
+ the dispatch tables. This codebase is **indirection-driven** (the engine entry point
`gsd-tools.cjs` lives *outside* `src/`; routing is string-keyed; the corpus is read by string
path), so naive static tools over-report dead code massively:

| Signal | Source | Raw | After guard | Why |
|--------|--------|----:|-------------|-----|
| knip "unused files" | `reports/knip-output.txt` | 45 | **0 dead** | all `require('./lib/<name>.cjs')`'d by `gsd-tools.cjs` (Site 0) |
| madge "orphans" | `reports/madge-orphans.txt` | 88 | **0 dead** | madge can't follow `.cjs` specifiers; depcruise (176 edges) is authoritative |
| dep-cruiser orphans | `reports/depcruise.json` | 13 | **0 dead** | each cleared live (Phase 10 §1.2) incl. a 6th channel: **workflow markdown bash shims** |
| knip "unused exports" | `reports/knip-output.txt` | 88 | **0 confirmed dead** | dispatch-table dominated (Site 3 `cmd*` functions) |

**The 6th indirection channel** surfaced in Phase 10 (workflow `.md` files that
`require('./gsd-core/bin/lib/<name>.cjs')` directly — `code-review.md:53,344`, `autonomous.md`,
`plan-phase.md`) keeps `code-review-flags`, `fallow-runner`, `ui-safety-gate` live. The guard's
conclusions were right; its *inventory of how* is incomplete → folded into maintainability
(M-01) and handed to Phase 16.

> **Honest result, not manufactured:** no dead `.cts` was invented to fill BLOAT-01. The only
> deletion candidates that survive are at the **manifest / dead-config / unused-type** level.

### Cards — real `waste`-of-deletion (all guard-checked)

```yaml
- id: F-BLOAT-01
  problem_type: waste
  subsystem: engine                 # package manifest
  file:line: "package.json (\"ws\": \"8.20.1\"; @anthropic-ai/claude-agent-sdk ^0.2.84)"
  severity: 2
  effort: S
  risk: med                         # ws may be a declared peer the SDK resolves at runtime
  confidence: 3
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  cross_check: "Repo-wide grep for require('ws')/from 'ws' across *.js/*.cjs/*.cts → ZERO. M1 doc itself notes ws is transitive via the agent SDK. claude-agent-sdk: zero static import sites either, but is the documented dynamic-spawn dep — do NOT remove on a static grep alone."
  recommendation: "Probe whether `ws` is a required peer of the agent SDK at runtime; if not, drop the direct dependency. Treat the SDK separately: confirm a live spawn path before any removal claim."
  recall_gate: n/a
  provenance: "F-WASTE-01 (Phase 10)"

- id: F-BLOAT-02
  problem_type: waste
  subsystem: tests                  # dangling test config for a retired subsystem
  file:line: "vitest.config.ts:9,17 (root: './sdk' for both projects) + gsd-tools.cjs dead `// SDK handler: sdk/src/query/…` comments (PIPELINE-TRACE §5#5: :648,:731,:803,:840)"
  severity: 2
  effort: S
  risk: low                         # the sdk/ tree is gone (git ls-files sdk/ → 0); config + comments are inert
  confidence: 5                     # grep -n sdk vitest.config.ts → 2 hits; sdk/ tree retired in 11918dcc
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  cross_check: "SUBSYSTEM-MAP §0 / §3.1 + PIPELINE-TRACE §5#5: sdk/ retired (commits 11918dcc, 4fa13cf9, 4c92aacc); vitest.config.ts still sets root:'./sdk' → dangling. CLAUDE.md/D-02 still list SDK as a subsystem — narration ≠ behavior."
  recommendation: "Remove the dead `./sdk` vitest projects (or repoint at live targets) and strip the dead SDK-handler comment breadcrumbs from gsd-tools.cjs. Pure waste — deletion loses nothing live."
  recall_gate: n/a

- id: F-BLOAT-03    # AGGREGATE (charter §3.4.3 severity floor) — not N cards
  problem_type: waste
  subsystem: engine
  file:line: "src/config-types.cts:1-62 (RuntimeTiers, ModelPolicyConfig — 0 refs repo-wide) + knip 'Unused exported types (6)': ContextState (context-utilization.cts:23), AgentMeta+ModelCatalog (model-catalog.cts:34,43), HubResult (observability/event.cts:37), ResolveAntigravityOpts (runtime-homes.cts:32), WorkstreamValidationResult (workstream-name-policy.cts:16)"
  severity: 1
  effort: S
  risk: low
  confidence: 2                     # type consumers (import type / structural) are easy to miss — per-type grep needed
  runtime_blast_radius: none        # types erase at runtime
  mechanical_vs_instructional: n/a
  cross_check: "config-types.cts is NOT a dead module; but 2 of 4 interfaces are genuinely unreferenced. The other 6 are knip 'unused exported types' that each need a per-type grep before any cut (knip misses structural/type-only use — cf. config-types where 2 of 4 WERE used)."
  recommendation: "Confirm each unused interface individually (grep the type name); drop or wire those with zero structural consumers and no in-flight-feature forward-declaration. Recorded as one aggregate lead, not 8 cards."
  provenance: "F-MAINT-02 + F-MAINT-AGG-08 (Phase 10), re-lensed waste (deletion loses nothing)"

- id: F-BLOAT-04    # the dead-list that ISN'T a delete list — recorded so no one treats it as one
  problem_type: waste
  subsystem: engine
  file:line: "reports/knip-output.txt (88 'unused exports') — e.g. command-aliases.cts:22, state-command-router.cts default, runtime-homes.cts:165 getGlobalSkillsBase"
  severity: 1
  effort: M
  risk: high                        # most are live via string dispatch — a naive cut breaks routing
  confidence: 2                     # the LIST is real; the 'dead' interpretation is mostly false
  runtime_blast_radius: multi
  mechanical_vs_instructional: n/a
  cross_check: "Categorized: 11 *-command-router `default` exports (Site 3), 8 alias tables (Site 3 keys), 5 migration `default` exports (Site 1), rest entry-point-consumed (Site 0). NONE confirmed dead — knip is src/-scoped and blind to out-of-src + workflow-shim consumers."
  recommendation: "Do NOT treat as a delete list. Re-run knip with all entry points declared (gsd-tools.cjs, bin/install.js, workflow shims) and investigate only residual that survives the wider graph. Aggregate, not 88 cards."
  provenance: "F-WASTE-AGG-01 (Phase 10)"
```

### The real duplication MASS — markdown corpus, not code

TS code clones are **2.69%** (83 clones / 1,091 lines — *low*, and they are change-cost not
dead → see maintainability M-05). The dup that matters for BLOAT is the **markdown corpus at
11.73%**, and even that is not a delete-the-file case:

```yaml
- id: F-BLOAT-05    # the headline duplication lead
  problem_type: waste
  subsystem: docs                   # prompt/reference corpus
  file:line: "jscpd markdown 11.73% (13,456 dup lines / 389 .md files); sample pair: docs/zh-CN/references/verification-patterns.md vs gsd-core/references/verification-patterns.md (shared 150-397 code-fence region)"
  severity: 3                       # recurring token tax across the corpus
  effort: L
  risk: med                         # translation pairs + load-bearing reference prose intermixed
  confidence: 3                     # 11.73% aggregate is real; per-pair mech-vs-instr NOT yet assessed
  runtime_blast_radius: all-16      # corpus ships to every runtime's system prompt
  mechanical_vs_instructional: instructional   # corpus is load-bearing until proven otherwise (§3.5)
  cross_check: "The zh-CN ↔ gsd-core match is NOT an identical file (diff over 150-397 = 300 changed lines): jscpd matched the shared *untranslated English code-fence blocks* embedded in both. So this is corpus structure (translations re-embed English fences), not delete-the-file."
  recommendation: "Per-pair classify before any cut. The mechanical share = repeated English code-fences re-embedded across translations (factor into a single shared, non-translated fence include). The instructional share = duplicated reference prose → relocate/single-source behind a recall gate, never delete. Pairs with F-BLOAT-13 (recurring-context tax)."
  recall_gate: "edge-probe / workflow-parity harness before trimming any reference prose; verbatim-diff confirmation before factoring any code-fence"
  provenance: "F-WASTE-02 (Phase 10)"
```

---

## BLOAT-02 — Command / skill / flag / config surface sprawl

> **Inherited caveat (load-bearing on every card here):** Phase 11 usage is **one author's
> Claude transcripts (n=1)**. A low `USAGE-*` count is a *prompt to investigate progressive
> disclosure*, **never** a standalone justification to cut. Safety/recovery commands are
> **criticality-exempt**. Surface reduction is tiered as progressive disclosure (charter
> Phase-12 SC-3), never deletion-by-low-usage. Every card below carries
> `confidence-limiter: single-author (Phase 11)`.

The shape of the surface (SUBSYSTEM-MAP §0): **67 installed commands, 33 agents, ~70-token-each
slash flags.** Against real traffic (`usage-full.md`): **15 of ~67 commands ever typed**; the
top-4 (`autonomous`/`resume-work`/`explore`/`quick`) = 70.8% of typed volume; **only 11 distinct
slash flags** appear and `gsd-resume-work` alone owns 5 of the rare ones.

```yaml
- id: F-BLOAT-06    # the slash-flag surface — the key near-unexercised lead
  problem_type: waste
  subsystem: skills
  file:line: "evidence/usage-full.md#USAGE-SFLAG-01..11 (only 11 distinct slash flags observed across 65 typed cmds; resume-work owns --interactive/--wave/--gaps-only/--no-transition/-p)"
  severity: 2
  effort: M
  risk: med                         # a flag may be load-bearing for a runtime/CI path the n=1 log never hit
  confidence: 2                     # single-author signal
  runtime_blast_radius: multi       # slash-flag surface is documented in command md (skills-surface ≥12)
  confidence_limiter: single-author (Phase 11)
  mechanical_vs_instructional: n/a  # surface/IA, not prompt-corpus prose
  cross_check: "USAGE-SFLAG total = 20 flag tokens across all typed slash commands; most invocations pass prose, not flags. The user-facing slash-flag surface is barely exercised even by a power user."
  recommendation: "Tier the flag surface as progressive disclosure: keep all flags reachable; demote rarely-touched ones out of the first-screen help / argument-hint into an advanced/`--help` tier. Do NOT remove any flag. resume-work's 5 niche flags are the densest cluster to relocate to advanced docs."
  recall_gate: n/a

- id: F-BLOAT-07    # command surface — 67 installed, 15 ever typed
  problem_type: waste
  subsystem: skills
  file:line: "evidence/usage-full.md#USAGE-CMD-01..15 (15 distinct commands typed / ~67 installed; top-4 = 70.8%) + src/clusters.cts (core_loop=6, ns_meta=6 facades)"
  severity: 3                       # 67-command first-screen is the newcomer's first cognitive cost
  effort: L
  risk: med
  confidence: 2
  runtime_blast_radius: multi       # per-runtime menu rendering differs (matrix)
  confidence_limiter: single-author (Phase 11)
  mechanical_vs_instructional: n/a
  cross_check: "USAGE-CMD: ~55 commands typed 0× in this log — NOT evidence of irrelevance (power-user log; newcomer path unobserved). The signal supports tiering the hot path forward, not pruning the tail."
  recommendation: "Tier the slash menu via clusters.cts: surface the 6 core-loop commands as 'start here'; demote the long tail to a discoverable second tier (progressive disclosure). NO command removed. Overlaps QW-UX-07 (quick-win slice) + Phase 15 (deep IA). Safety/recovery (resume-work, undo, pause-work, health) criticality-exempt from any demotion."
  recall_gate: n/a
  provenance: "QW-UX-07 (M1, quick-win slice); escalated: full 67-command two-audience IA exceeds quick-win scope → Phase 15"

- id: F-BLOAT-08    # agent surface — recurring-token cost (also a BLOAT-03 hinge)
  problem_type: waste
  subsystem: agents
  file:line: "reports/token-report.json (33 agents = 141,634 recurring tokens — 81% of the 173,834 eager tax); largest gsd-planner.md 11,779, gsd-debugger.md 10,783"
  severity: 3
  effort: L
  risk: high                        # agent description/body is the routing signal (see F-BLOAT-12)
  confidence: 4                     # exact BPE token counts
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a  # surface-count framing here; per-file prose cuts carded under BLOAT-03
  cross_check: "33 agents installed; usage-full.md#USAGE-SKILL shows 21 GSD skills dispatched, with plan/execute/code-review/autonomous dominating. The agent count itself is the eager-cost lever; the body-prose cuts are BLOAT-03."
  recommendation: "Treat agent COUNT and per-agent body SIZE as two levers. Count: confirm the install-profiles tiering already gates which agents ship per profile (core/standard/full) so newcomers don't eager-load all 33. Size: see F-BLOAT-11/12. Do not delete agents on low dispatch — many are recovery/specialist."
  recall_gate: n/a
```

**Config surface:** no separate sprawl finding — config is a *contract*-stability concern
(churn 78 on `config.cts`), carded under **maintainability M-04**, not BLOAT (it is load-bearing,
not carried-unused).

---

## BLOAT-03 — Prompt / token bloat (full corpus)

**The corpus, measured exactly (Phase 7 `token-report.json`, gpt-tokenizer o200k_base):**

| Bucket | Tokens | Files | What it is | When paid |
|--------|-------:|------:|-----------|-----------|
| **Recurring-context tax** | **173,834** | 100 | agents (141,634 / 33) + commands (32,200 / 67) | **eager, every invocation (upper bound)** |
| **On-demand** | **452,583** | 175 | workflows (362,603 / 106) + references (89,980 / 69) | only when the command runs |
| Engine source | 338,518 | 95 | `src/*.cts` (not a prompt cost) | — |
| **Prompt-corpus grand total** | **626,417** | 275 | recurring + on-demand | — |

The recurring tax is the expensive bucket because it is paid on **every** invocation. The
on-demand bucket is larger in absolute terms but only loaded for the specific command run.

### The two mandatory separations (charter Phase-12 SC-2)

**(a) recurring vs on-demand** — done in the table above and in F-BLOAT-13 vs F-BLOAT-14/15.
**(b) mechanical (safe to cut) vs load-bearing instructional density (EXECUTION-RISK).**

> **The QW-TOK-02 lesson, carried forward (charter D-04):** an apparent "verbatim duplicate"
> can carry behavioral variants. The `<documentation_lookup>` block appears in 8 agents but is
> **4 distinct md5 variants** — 3 carry a `command -v ctx7` supply-chain guard + an explicit
> "Do NOT use `npx --yes` — silently executes unverified packages" warning the other 5 lack.
> Collapsing all 8 to one include would be a **supply-chain regression**. Therefore: **no
> prompt-corpus cut ships without a verbatim-diff (mechanical) or a named recall/parity gate
> (instructional).** "Verifier reach = spec reach" — cutting load-bearing instruction right
> before a traffic spike is the worst-timed failure mode.

### Mechanical (safe to cut after a verbatim-duplicate confirmation)

```yaml
- id: F-BLOAT-09    # FOLD-IN of QW-TOK-01/03/07 (M1 mechanical token wins)
  problem_type: waste
  subsystem: agents                 # + commands/workflows for the colon-form sub-item
  file:line: "agents/gsd-planner.md:6-11 dead `# hooks:` stub (24 agents, grep '^# hooks:'→24); /gsd:<cmd> colon-form refs (grep -rho '/gsd:' agents/ commands/ gsd-core/ | wc -l → 1073: agents 96 + commands 38 + gsd-core 939, re-verified live 2026-06-08); gsd-core/references/mandatory-initial-read.md (55 tok, @-included by 5 files)"
  severity: 2
  effort: S
  risk: low
  confidence: 5
  runtime_blast_radius: all-16      # Codex uses $gsd-<cmd>; runtime-slash converts — verify no regression on the colon-form pass
  mechanical_vs_instructional: mechanical
  cross_check: "QW-TOK-01: commented-out inert YAML. QW-TOK-03: textual reference normalization (CLAUDE.md anti-pattern). QW-TOK-07: verify the single existing include is the source-of-truth (no behavior change). None on the engine behavior path."
  recommendation: "Ship the three M1 mechanical wins: strip the dead hooks stub (24 agents); normalize the 1073 colon-form refs to /gsd-<cmd>; lock mandatory-initial-read.md as the single include. Verbatim-duplicate / inert confirmation only."
  recall_gate: n/a
  provenance: "QW-TOK-01, QW-TOK-03, QW-TOK-07 (M1) — folded in, re-ranked on §2 scheme"
```

### Load-bearing instructional density (EXECUTION-RISK — never "delete this")

```yaml
- id: F-BLOAT-10    # the ctx7 security-variant include — QW-TOK-02 fold-in
  problem_type: waste
  subsystem: agents
  file:line: "8 agents carry <documentation_lookup> (grep -l→8) but md5 = 4 variants; gsd-executor/gsd-planner/gsd-phase-researcher carry a `command -v ctx7` guard + 'Do NOT use npx --yes' warning the other 5 lack"
  severity: 2
  effort: M
  risk: high                        # collapsing the guarded variant = supply-chain regression
  confidence: 4
  runtime_blast_radius: all-16
  mechanical_vs_instructional: instructional    # NOT verbatim — carries security-behavioral variants
  cross_check: "The exact QW-TOK-02 lesson: a duplicate that wasn't. 3 of 8 blocks are a security-hardened variant. A naive 'factor to one include' loses the guard."
  recommendation: "Factor into AT MOST two shared includes — a guarded variant (for the 3 shell-executing agents) and an unguarded variant — never one. The 3 executing agents MUST retain the `command -v ctx7` guard + warning."
  recall_gate: "ctx7-guard parity harness — md5/diff all 8 blocks before & after; executor/planner/phase-researcher MUST retain the guard + warning; collapsing to `npx --yes` is a blocker"
  provenance: "QW-TOK-02 (M1) — re-tagged instructional by the M1 adversarial review; folded in"

- id: F-BLOAT-11    # agent/command description strings — QW-TOK-04 fold-in
  problem_type: waste
  subsystem: agents
  file:line: "100 files recurring bucket (tokenize.mjs); command desc capped (scripts/lint-descriptions.cjs ≤100) but AGENT desc uncapped (agents/gsd-planner.md:3)"
  severity: 2
  effort: M
  risk: med
  confidence: 3
  runtime_blast_radius: all-16
  mechanical_vs_instructional: instructional    # the description IS the routing signal a model reads to pick an agent
  cross_check: "These are the only reliably-EAGER bytes (frontmatter description is enumerated in the system prompt). Agent descriptions are uncapped, unlike commands."
  recommendation: "Tighten (do not cut) the 100 description strings; consider extending the ≤100-char lint cap to agent descriptions for drift-proofing. Each trimmed description must still route correctly."
  recall_gate: "agent-routing recall harness — A/B an ambiguous task → agent selection (prohibition-elicitation style); each trimmed description must still route to the correct agent before the cut lands"
  provenance: "QW-TOK-04 (M1) — folded in"

- id: F-BLOAT-12    # graphify inlined workflow — QW-TOK-05 fold-in (recurring-bucket offender)
  problem_type: waste
  subsystem: skills                 # commands/gsd/graphify.md is in the RECURRING bucket (3,623 tok — top command)
  file:line: "commands/gsd/graphify.md (3,623 recurring tok, full Step 0/1 config-gate inlined) vs commands/gsd/plan-phase.md (941 tok, @-includes the workflow)"
  severity: 3                       # graphify.md is the single heaviest command in the eager bucket — 3.8× the @-include pattern
  effort: L
  risk: high                        # the inlined Step 0/1/config-gate text is load-bearing graphify orchestration
  confidence: 4
  runtime_blast_radius: all-16
  mechanical_vs_instructional: instructional
  cross_check: "token-report.json recurring: graphify.md 3,623 — the one command that inlines its whole workflow instead of @-including a workflows/ file like every other command. The eager cost is paid every session graphify is surfaced."
  recommendation: "Relocate the inlined procedural workflow out of commands/gsd/graphify.md into a gsd-core/workflows/graphify.md the wrapper @-includes (matching plan-phase's 941-tok wrapper). Relocate verbatim, never delete; this moves ~2,700 tok from eager→on-demand."
  recall_gate: "graphify behavior-equivalence harness — run /gsd-graphify build|query|status|diff before & after; config-gate STOP branches must fire identically"
  provenance: "QW-TOK-05 (M1) — folded in; confirmed graphify.md is the top recurring command"
```

### Recurring-context tax (eager) vs on-demand — the two structural cards

```yaml
- id: F-BLOAT-13    # the eager tax, framed as a structural lever
  problem_type: waste
  subsystem: agents
  file:line: "token-report.json totals.recurringUpperBound = 173,834 (100 files: 33 agents=141,634 + 67 commands=32,200)"
  severity: 3
  effort: L
  risk: high                        # agents/commands are load-bearing instruction, eager by nature
  confidence: 5
  runtime_blast_radius: all-16
  mechanical_vs_instructional: instructional
  cross_check: "Exact BPE totals. 81% of the eager tax is agent bodies; the lever is install-profile tiering (which agents/commands ship per profile) NOT body-prose deletion. QW-UX-01's interactive profile prompt sets this cold-start cost at install (~12k→700 claim, M1)."
  recommendation: "The dominant eager-cost lever is install-PROFILE tiering, not corpus cutting: confirm core/standard/full profiles gate the agent+command surface so a newcomer eager-loads a small subset, not all 100 files. Body-level cuts (F-BLOAT-10/11/12) are secondary and gated. Per-runtime eager-vs-lazy byte refinement was handed from M1 → this is its home (see below)."
  recall_gate: "per-profile parity — the core/standard profile must still drive the plan→execute loop after any agent demotion"
  provenance: "M1 Token-stream handoff: exact per-runtime eager-vs-lazy byte refinement (now measured: 173,834 eager via gpt-tokenizer)"

- id: F-BLOAT-14    # oversized monolithic workflows — QW-TOK-06 ESCALATED
  problem_type: waste
  subsystem: workflows
  file:line: "token-report.json ondemand: execute-phase.md 22,199; plan-phase.md 21,365 (the two heaviest on-demand files) vs discuss-phase/modes/*.md lazy-load split"
  severity: 3
  effort: L
  risk: high                        # every branch is load-bearing plan/execute orchestration
  confidence: 5
  runtime_blast_radius: all-16
  mechanical_vs_instructional: instructional
  cross_check: "These two workflows are 5.7%/5.5% of the ENTIRE on-demand corpus each. discuss-phase already proves a lazy mode-file pattern; execute/plan-phase are monolithic. On-demand so not eager-paid, but loaded whole whenever the core loop runs."
  recommendation: "ESCALATED beyond quick-win: replicate discuss-phase's lazy mode-file split for execute-phase and plan-phase. M1 sized this L/ICE-12 (a quick-win-scope miss); it is a genuine restructure of the two hottest workflows, owned here as a deep change-cost-adjacent waste finding. Restructure, never delete."
  recall_gate: "plan/execute edge-probe + verifier-reach harness — edge-probe taxonomy (gsd-core/references/edge-probe.md) + plan-checker/verifier suite must pass IDENTICALLY mode-split vs monolithic on a fixture phase; any drop in caught edges is a blocker"
  provenance: "QW-TOK-06 (M1, ICE 12); escalated: a true lazy-load restructure of the two core-loop workflows exceeds quick-win scope"
```

---

## BLOAT-04 — Conceptual redundancy (overlapping mechanisms / abstractions)

The deep-value lens M1 never touched. Sourced from the Phase 8 cluster map (E1–E11) + the
Phase 9 trace — *concepts implemented more than once in different ways*, distinct from textual
duplication.

```yaml
- id: F-BLOAT-15    # aggregator re-implementation — the densest conceptual redundancy
  problem_type: waste
  subsystem: engine                 # cluster E9
  file:line: "src/init.cts (fileCx 419, 1996 LOC) cross-file clones init.cts↔roadmap.cts (×3), init.cts↔config.cts, init.cts↔commands.cts (jscpd typescript); init imports commands/core/config/frontmatter/plan-scan/state-document (fan-out 11)"
  severity: 3
  effort: L
  risk: med
  confidence: 4
  runtime_blast_radius: multi       # init aggregator feeds many command paths
  mechanical_vs_instructional: n/a
  cross_check: "SUBSYSTEM-MAP E9 + PIPELINE-TRACE §2B: init/commands/config are three top-fan-out aggregators. The cross-file init↔roadmap/config/commands clones indicate init.cts RE-IMPLEMENTS aggregation those modules already provide rather than composing them — one concept (assemble-context) realized redundantly."
  recommendation: "Converge the aggregation concept: have init.cts COMPOSE roadmap/config/commands accessors instead of re-deriving them inline. The clone clusters (M-05) collapse as a side effect. A decomposition of the E9 aggregator triad, not a textual de-dup."
  recall_gate: n/a

- id: F-BLOAT-16    # the 11 per-family routers — a repeated dispatch abstraction
  problem_type: waste
  subsystem: engine                 # cluster E4
  file:line: "11 per-family routers: src/{state,verify,verification,phase,phases,roadmap,init,check,validate,task,agent}-command-router.cts — each a thin string-keyed handlers map fronting one engine cluster"
  severity: 2
  effort: M
  risk: high                        # routing is string-keyed and load-bearing on every dispatch
  confidence: 4
  runtime_blast_radius: multi
  mechanical_vs_instructional: n/a
  cross_check: "SUBSYSTEM-MAP E4 + PIPELINE-TRACE §C: 11 routers + cjs-command-router-adapter, all the same shape (familyHandlers[subcommand] → cmd*). Plus the parallel verify-/verification- and phase-/phases- near-twin pairs. One dispatch concept expressed 11 times; the verify/verification + phase/phases pairs are the closest conceptual overlap."
  recommendation: "Investigate whether the 11 hand-rolled routers can share one table-driven router factory (register family → handler-map), and whether verify-/verification- and phase-/phases- can merge or document their distinction. Plan-only: this is a routing-layer refactor with high fix-risk — sequence carefully, recall-gate every family. Note: alias-drift lint (check:alias-drift) already guards router↔alias consistency."
  recall_gate: n/a

- id: F-BLOAT-17    # config-load: same concept, two divergent behaviors (cross-references CORR)
  problem_type: waste
  subsystem: engine                 # cluster E1/E9
  file:line: "src/core.cts:544-551 (loadConfig SILENTLY defaults on parse failure) vs src/config.cts:417 (config-get ERRORS on parse failure)"
  severity: 2                       # bloat-lens severity; the CORRECTNESS severity is Phase-13's call
  effort: M
  risk: high
  confidence: 5
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  cross_check: "Two implementations of 'read .planning/config.json' with OPPOSITE failure semantics. As a CONCEPTUAL-REDUNDANCY finding it is 'one concept realized two ways'; the WRONG-OUTCOME aspect (silent default) is filed as wrongness → Phase 13 / QW-REL-01. Per charter tie-break (Correctness > Bloat), the defect half belongs to Phase 13; the redundancy half is noted here."
  recommendation: "Bloat lens: converge on a single config-read path with one defined failure contract. The contract decision (error vs warn-and-default) is a Phase-13/QW-REL-01 deliverable — do not pre-empt it here."
  recall_gate: n/a
  provenance: "QW-REL-01 (M1) — the redundancy facet; the correctness facet is Phase 13 (H-01)"
```

> **Severity-floor aggregate (charter §3.4.3):** minor conceptual overlaps not carded
> individually — multiple `listPhaseDirs`-style phase-dir enumeration re-implementations
> (also in M-05), and the `verify`/`validate`/`verification` naming triad in cluster E8. The
> roadmap needs the pattern (converge aggregation + dispatch concepts), not 10 micro-cards.

---

## Fold-in ledger (charter §5 — M1 quick-wins folded in, NOT repeated)

| M1 ID | Folded into | Status |
|-------|-------------|--------|
| QW-TOK-01, -03, -07 | **F-BLOAT-09** | mechanical wins, re-ranked on §2 scheme |
| QW-TOK-02 | **F-BLOAT-10** | instructional (ctx7 security variant) — the carried lesson |
| QW-TOK-04 | **F-BLOAT-11** | instructional (routing-signal descriptions) |
| QW-TOK-05 | **F-BLOAT-12** | instructional; confirmed graphify.md is the top recurring command |
| QW-TOK-06 | **F-BLOAT-14** | **ESCALATED** — lazy-load restructure of the two core-loop workflows exceeds quick-win scope |
| M1 Token handoff: per-runtime eager-vs-lazy byte refinement | **F-BLOAT-13** | resolved — eager tax now measured exactly (173,834) |
| M1 Token handoff: full surface-sprawl tiering | **F-BLOAT-07** (+ Phase 15) | deep progressive-disclosure tiering owned here, IA overlap → Phase 15 |
| QW-UX-07 (surface tier) | **F-BLOAT-07** | quick-win slice noted; full IA escalated → Phase 15 |
| QW-REL-01 (config redundancy facet) | **F-BLOAT-17** | redundancy facet here; correctness facet → Phase 13 |

The M1 backlog is **not** duplicated as a separate list; each item is absorbed as a card with
`provenance:`. Phase 17 renders the M1 backlog as the roadmap's already-actioned / in-flight
quick-wins tier so the two views do not drift.

---

## Honesty statement (charter §3.2)

Every card cites a `src/*.cts` line, an `.md` path, a `token-report.json` figure, a `USAGE-*`
key, or a live grep. **After the mandatory guard, zero `src/*.cts` modules and zero exported
functions are confirmed dead — no dead code was manufactured.** The real bloat mass is the
**token corpus** (173,834 eager / 626,417 total) and the **command/agent/flag surface**, both
treated as *relocate / restructure / tier-as-progressive-disclosure* problems under the
load-bearing guard — never delete-by-low-usage. Every prompt-corpus instructional cut names its
recall/parity gate. Usage-grounded cards carry the single-author (n=1) confidence limiter.

*Plan-only attestation: this phase created only `docs/audit/comprehensive/concerns/bloat.md`,
`concerns/maintainability.md`, and the Phase-12 planning artifacts under
`.planning/phases/12-concern-sweep-bloat-maintainability-deep/`. No protected path
(`package.json`, `src/`, `gsd-core/`, `workflows/`, `agents/`, `commands/`, `bin/`,
`.gitignore`) was edited; no git commit; no GitHub write. The firewall
(`.planning/codebase/*`, `.planning/notes/*-2026-06-05.md`, frontier-synthesis) was honored —
only Phase 7–11 evidence, the charter, the M1 backlog, and live `src/*.cts` were opened.*
