# GSD-Core Quick-Win Backlog — Newcomer Readiness (Milestone 1)

**Converged:** 2026-06-07 (Phase 5 — Quick-Win Backlog Convergence & Publication)
**Source streams:** [UX](streams/ux-stream.md) · [Token](streams/token-stream.md) · [Reliability](streams/reliability-stream.md)
**Schema:** [BACKLOG-SCHEMA.md](BACKLOG-SCHEMA.md) (LOCKED) · **Home:** [DELIV-HOME.md](DELIV-HOME.md) · **Publication:** [TRACKING-SURFACE.md](TRACKING-SURFACE.md)
**Status:** Plan-only. This file is the **published source of truth**; the GitHub board is a *view* onto it (run by a maintainer — see Publication).

This is the single merged, de-duplicated quick-win backlog for the fast-track Newcomer Readiness
milestone, ahead of the Mintlify spotlight. It folds the three independent maintainer streams
(UX / Token / Reliability) into one ICE-ranked, owner-routed, blast-radius-tagged list. Every
prompt-corpus item carries its **mechanical-vs-instructional** flag; every load-bearing item
names the **recall/edge-probe gate** that must pass before any cut — *"verifier reach = spec reach."*
A maintainer should be able to read **▶ Start Here**, pick an item, and execute without re-auditing.

- **Items after dedup:** **20** (19 from the three streams — 20 numbered stream items, 1 intra-stream fold removed a numbered item, 2 further cross-lens overlaps merged as dual-lens tags; see [Dedup ledger](#dedup-ledger) — **plus 1 added by the adversarial review: QW-REL-05**, the Node-version contradiction the streams missed).
- **By product:** 8 UX · 7 Token · 5 Reliability.
- **Prompt-corpus load-bearing (EXECUTION-RISK):** 5 — QW-TOK-02, QW-TOK-04, QW-TOK-05, QW-TOK-06, QW-UX-08 (each names a recall/parity gate). *QW-TOK-02 was re-tagged from `mechanical` by the adversarial review — its `<documentation_lookup>` blocks are not verbatim; 3 carry a supply-chain security guard.*
- **ICE direction:** higher = better candidate (Impact × Confidence × Ease, each 1–5; range 1–125).

---

## ▶ Start Here (ranked first picks for the spotlight)

The unambiguous first picks: **highest ICE × lowest blast radius**, all small/mechanical, all
plan-only. Pick top-down — each is independently shippable and safe before a traffic spike.
(Rank = ICE, then lower blast radius, then lower runtime risk as tie-breaks.)

| # | ID | Title | ICE | Size | Blast | Product | Owner |
|--:|----|-------|----:|------|-------|---------|-------|
| 1 | **QW-UX-02** | Document the profile choice in README Quickstart + install-on-your-runtime guide | **100** | S | none | UX | UX/Onboarding |
| 2 | **QW-REL-05** | Resolve Node-version contradiction (docs 18+ vs package ≥22) + add `process.version` guard | **100** | S | all-14+ (doc half: none) | Reliability (high) + UX | core.cts / bin |
| 3 | **QW-REL-01** | Warn (don't silently default) when `.planning/config.json` exists but fails to parse | **100** | S | all-14+ | Reliability (high) | core.cts |
| 4 | **QW-REL-02** | Never emit an empty slug — fall back / warn when sanitization collapses a name to `''` | **80** | S | all-14+ | Reliability (med) | core.cts |
| 5 | **QW-UX-04** | Reconcile the tutorial's claimed install output with the real installer output | **75** | S | none | UX | UX/Onboarding |
| 6 | **QW-TOK-01** | Strip the dead commented-out PostToolUse hooks stub from 24 agent frontmatters | **75** | S | all-14+ | Token (mechanical) | Token |
| 7 | **QW-UX-01** | Add an interactive profile prompt to the installer (core/standard/full) | **75** | M | all-14+ | UX + Token | bin-subsystem |
| 8 | **QW-UX-03** | Fix stale counts in installer `--help` text — **LARGELY RESOLVED on `next`** (counts now derived from `PROFILES.*.length`; re-scope/close) | **50** | S | none | UX | bin-subsystem |

**Spotlight-eve shortlist (the lowest-runtime-risk first picks):**
**QW-UX-02, QW-UX-04, QW-UX-03** (docs/help-text only — `blast: none`) plus **QW-TOK-01**
(pure dead-comment delete, mechanical). These four have nothing load-bearing and no behavior
change; they are the safest "cleaner and tighter" wins to ship first. **QW-REL-05's doc half**
(blessing 18+ → 22+ across the ~15 onboarding docs) is also `blast: none` and belongs in this
zero-risk first wave; its `process.version` installer-guard half is the one-line `all-14+` part.

> **Why QW-REL-05/01/02 rank high despite `all-14+` blast.** They are tiny, isolated, additive
> (a version guard / a warning / a fallback) on the install or engine hot path, with end-to-end
> reproductions and a clear `file:line` oracle. High ICE earned on Impact × Confidence; the
> blast radius is *reach*, not *risk* — the change itself is one line. **QW-REL-05 is ranked #2
> because it is the textbook spotlight-eve first-touch failure** (the docs actively endorse a
> Node version the package rejects), and half of it ships at `blast: none`.

---

## Owner routing (3+ maintainers)

Items are routed so the work parallelizes cleanly across at least three owners. Owners are
**role slots** to be filled by name at/after publication; the routing is by stream + subsystem.

| Owner slot | Scope | Items | Count |
|------------|-------|-------|------:|
| **UX / Onboarding owner** | docs, tutorial, README, menu IA, command-copy | QW-UX-02, QW-UX-04, QW-UX-07, QW-UX-08 | 4 |
| **bin-subsystem owner** (installer) | `bin/install.js`, profile resolution, install-time UX | QW-UX-01, QW-UX-03, QW-UX-05, QW-UX-06 | 4 |
| **Token owner** | prompt-corpus token cuts, includes, surface tiering | QW-TOK-01, QW-TOK-02, QW-TOK-03, QW-TOK-04, QW-TOK-05, QW-TOK-06 | 6 |
| **Reliability / core.cts owner** | engine correctness (`src/core.cts`, `drift.cts`) + first-run install gate | QW-REL-01, QW-REL-02, QW-REL-03, QW-REL-04, QW-REL-05 | 5 |

> Note: QW-UX-01 is a **bin-subsystem** item with a **Token** co-lens (it sets cold-start cost
> at install). The bin owner leads; the Token owner consults on the cold-start framing. QW-UX-08
> is a **UX** item with a **Token** co-lens (ns-\* surface sprawl); the UX owner leads.
> 4 owner slots, all independently workable — exceeds the 3+ requirement.

---

## The merged backlog

ICE = Impact × Confidence × Ease (1–5 each, higher = better). `plan_only: true` on every item.
**EXECUTION-RISK** marks load-bearing prompt-corpus items — never phrased as "delete this"; each
names its `recall_gate`. Stream IDs are preserved as provenance.

### Sorted by ICE (descending)

| ID | Title | Stream(s) | I | C | E | **ICE** | Size | Product | Blast | Mech/Instr | Sev | Owner | Citation |
|----|-------|-----------|--:|--:|--:|--------:|------|---------|-------|------------|-----|-------|----------|
| **QW-UX-02** | Document the profile choice in README Quickstart + runtime guide | UX | 4 | 5 | 5 | **100** | S | UX | none | n/a | n/a | UX/Onboarding | `README.md` Quickstart (0 profile hits); `bin/install.js:583` |
| **QW-REL-01** | Warn (don't silently default) when `config.json` fails to parse | Reliability | 5 | 5 | 4 | **100** | S | Reliability | all-14+ | n/a | **high** | core.cts | `src/core.cts:545-552` vs `src/config.cts:639`(get)/`:429`(set); repro C-01 |
| **QW-REL-05** | Resolve Node-version contradiction (docs say 18+, package needs ≥22) + add `process.version` guard | Reliability + **UX** | 5 | 5 | 4 | **100** | S | Reliability | all-14+ | n/a | **high** | core.cts / bin | `package.json engines '>=22'` vs docs `Node 18+` (install-on-your-runtime.md:5, your-first-project.md:15, +translations, 18 doc files); no install guard |
| **QW-REL-02** | Never emit an empty slug — fall back / warn on `''` sanitization | Reliability | 4 | 5 | 4 | **80** | S | Reliability | all-14+ | n/a | **med** | core.cts | `src/core.cts:1919-1921`; `src/commands.cts:1166,1171`; repro C-02 |
| **QW-UX-01** | Add interactive profile prompt to the installer (core/standard/full) | UX + **Token** | 5 | 5 | 3 | **75** | M | UX | all-14+ | n/a | n/a | bin-subsystem | `src/install-profiles.cts:499-506`; `bin/install.js:371-376` (flags), no interactive prompt |
| **QW-UX-04** | Reconcile tutorial's claimed install output with real installer output | UX | 3 | 5 | 5 | **75** | S | UX | none | n/a | n/a | UX/Onboarding | `docs/tutorials/your-first-project.md:36-40` vs `bin/install.js:10111,11874` |
| **QW-TOK-01** | Strip dead commented-out PostToolUse hooks stub from 24 agent frontmatters | Token | 3 | 5 | 5 | **75** | S | Token | all-14+ | **mechanical** | n/a | Token | `agents/gsd-planner.md:6-11` (+24 via `grep '^# hooks:'`) |
| **QW-UX-05** | Add orientation + surface-slimming signpost to the post-install 'Done!' message | UX | 4 | 4 | 4 | **64** | S | UX | all-14+ | n/a | n/a | bin-subsystem | `bin/install.js:11864-11877` (both 'Done!' branches) |
| **QW-UX-03** | Fix stale counts in installer `--help` — **LARGELY RESOLVED ON next** (counts now derived) | UX | 2 | 5 | 5 | **50** | S | UX | none | n/a | n/a | bin-subsystem | `bin/install.js:583` (now derives `PROFILES.{core,standard}.length`, 'full — all skills'); live 67; `src/install-profiles.cts:28-37` core=8, `:38-56` standard=14 |
| **QW-UX-08** | Clarify ns-\* namespace facades vs underlying commands for newcomers | UX + **Token** | 3 | 4 | 4 | **48** | S | UX | claude-only | **instructional** | n/a | UX/Onboarding | `src/clusters.cts:97-104`; `commands/gsd/ns-*.md` (6) |
| **QW-REL-04** | Populate human message on drift-detector exception branch (no blank echo) | Reliability | 2 | 4 | 5 | **40** | S | Reliability | claude-only | n/a | **low** | drift.cts | `src/drift.cts:252-255 → 259-270` (message:''); C-04 |
| **QW-TOK-03** | Normalize legacy colon-form `/gsd:<cmd>` refs to canonical `/gsd-<cmd>` | Token | 2 | 5 | 4 | **40** | S | Token | all-14+ | **mechanical** | n/a | Token | `grep -rho '/gsd:[a-z-]*' agents commands gsd-core` → **1073** (corrected); CLAUDE.md anti-pattern |
| **QW-UX-06** | Make `standard` (not `full`) the recommended/highlighted newcomer choice | UX | 4 | 3 | 3 | **36** | M | UX | all-14+ | n/a | n/a | bin-subsystem | `src/install-profiles.cts:38-56` + `:499-506` (default=full) |
| **QW-TOK-02** | Factor `<documentation_lookup>` into one include (8 agents) — **preserve the `command -v` security guard** | Token | 3 | 4 | 3 | **36** | M | Token | all-14+ | **instructional** | n/a | Token | 8 agents, **3 variants** on next (md5); **2** carry `command -v ctx7` guard + "Do NOT use `npx --yes`" warning (was 4 variants / 3 guarded on feat — re-pin) |
| **QW-TOK-04** | Audit/tighten the 100 agent/command `description` strings (the eager bytes) | Token | 4 | 3 | 3 | **36** | M | Token | all-14+ | **instructional** | n/a | Token | 100 files (tokenize.mjs); agent desc uncapped (`gsd-planner.md:3`) |
| **QW-TOK-07** | Lock the `mandatory-initial-read.md` include against drift across 5 includers | Token | 2 | 4 | 4 | **32** | S | Token | all-14+ | **mechanical** | n/a | Token | `gsd-core/references/mandatory-initial-read.md`; 5 includers |
| **QW-REL-03** | Document (or align) the exit-code contract for no-`.planning/` data reads | Reliability | 2 | 4 | 4 | **32** | S | Reliability | none | n/a | **low** | docs | `state/progress/find-phase`→0 vs `roadmap`→1; repro C-03 |
| **QW-TOK-05** | Relocate inlined graphify workflow out of `graphify.md` into a `workflows/` file | Token | 4 | 4 | 2 | **32** | L | Token | all-14+ | **instructional** | n/a | Token | `commands/gsd/graphify.md` (3,089 tok) vs `plan-phase.md` (941) |
| **QW-UX-07** | Tier the slash-menu so the 6 core-loop commands read as 'start here' | UX | 4 | 3 | 2 | **24** | L | UX | multi | n/a | n/a | UX/Onboarding | live 67; `src/clusters.cts:33-40` vs `:97-104` |
| **QW-TOK-06** | Replicate discuss-phase lazy mode-file pattern for execute/plan-phase workflows | Token | 4 | 3 | 1 | **12** | L | Token | all-14+ | **instructional** | n/a | Token | `execute-phase.md` (21,527) / `plan-phase.md` (20,693) |

### EXECUTION-RISK items — recall gates (the load-bearing guard)

The five load-bearing prompt-corpus items below are **never** presented as deletions. Each is a
relocate/restructure/tighten with a **named recall or edge-probe gate** that must pass *before*
the change lands. Cutting load-bearing instruction right before a traffic spike is the
worst-timed failure mode.

| ID | Why load-bearing | Posture | `recall_gate` (must pass first) |
|----|------------------|---------|---------------------------------|
| **QW-TOK-02** | NOT verbatim — 3 of the 8 `<documentation_lookup>` blocks carry a `command -v ctx7` supply-chain security guard + "Do NOT use `npx --yes`" warning the others lack | factor-out preserving the guarded variant, never collapse to `npx --yes` | **ctx7-guard parity harness** — md5/diff all 8 blocks before & after; executor/planner/phase-researcher MUST retain the `command -v ctx7` guard + warning; collapsing to the `npx --yes` form is a supply-chain regression and a blocker |
| **QW-TOK-04** | The `description` IS the routing signal a model reads to pick an agent | tighten, not cut | **agent-routing recall harness** — A/B an ambiguous task → agent selection (prohibition-elicitation style); each trimmed description must still route to the correct agent before the cut lands |
| **QW-TOK-05** | The inlined Step 0/1/config-gate text is load-bearing graphify orchestration | relocate verbatim, never delete | **graphify behavior-equivalence harness** — run `/gsd-graphify build\|query\|status\|diff` before & after; config-gate STOP branches must fire identically |
| **QW-TOK-06** | Every branch is load-bearing plan/execute orchestration | restructure, never delete | **plan/execute edge-probe + verifier-reach harness** — edge-probe taxonomy + plan-checker/verifier suite must pass identically on a fixture phase, mode-split vs monolithic; any drop in caught edges is a blocker. ⚠️ **edge-probe-dependent:** `gsd-core/references/edge-probe.md` (and `src/edge-probe.cts`) are **NOT on `next`** (edge-probe PR #584/#550 unmerged). The recall-gate *methodology* is a valid gate name; the concrete edge-probe.md/edge-probe.cts harness assumes that PR merges. Until then, use the plan-checker/verifier suite alone as the parity oracle. |
| **QW-UX-08** | Edits command-file frontmatter/body prose that ships to the runtime | clarify copy, never hide/delete | **`lint:descriptions` (≤100 char) + `lint:skill-deps` closure** — confirm no ns-\* `requires`/closure breaks before any copy change; ns-\* still dispatch identically |

> **The remaining prompt-corpus items are `mechanical`** (QW-TOK-01, -03, -07): formatting,
> dead boilerplate, or genuinely verbatim-duplicated reference text — safe to cut/factor after a
> verbatim-duplicate confirmation. No mechanical item is on the engine behavior path.
> **QW-TOK-02 was dropped from the mechanical set** by the adversarial review: its
> `<documentation_lookup>` blocks are **not** verbatim (4 md5 variants; 3 carry a `command -v ctx7`
> supply-chain guard), so it is now load-bearing/EXECUTION-RISK with a parity gate (above).

### Per-item detail (full schema rows)

```yaml
# ── UX (8) ───────────────────────────────────────────────────────────────────
- id: QW-UX-01      # bin-subsystem leads; Token co-lens (sets ~12k→700 cold-start at install)
  title: "Add an interactive profile prompt to the installer (core / standard / full, default highlighted)"
  streams: [UX, Token]
  impact: 5; confidence: 5; ease: 3; ice: 75; tshirt: M
  product: UX
  owner: bin-subsystem-owner
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: n/a    # installer code, not prompt-corpus
  severity: n/a
  citation: "src/install-profiles.cts:499-506 (default→full); bin/install.js:371-376 (--profile/--minimal flag parse), no interactive profile prompt at the call site"   # re-pinned to next 2026-06-08 (was install-profiles 443-451; bin 8311-8316)
  plan_only: true
  recall_gate: n/a
  power_user_impact: "Skipped when --profile/--minimal passed or stdin non-TTY (installer gates runtime prompt on isTTY, bin/install.js:12127 — re-pinned; was :8599). Flag/CI installs unchanged; marker still persisted."

- id: QW-UX-02
  title: "Document the profile choice in the README Quickstart and install-on-your-runtime guide"
  streams: [UX]
  impact: 4; confidence: 5; ease: 5; ice: 100; tshirt: S
  product: UX
  owner: ux-onboarding-owner
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  severity: n/a
  citation: "README.md Quickstart (grep -niE 'profile|surface' → 0 hits); bin/install.js:583 (--profile help text exists)"   # re-pinned to next 2026-06-08 (was :686)
  plan_only: true
  recall_gate: n/a

- id: QW-UX-03
  title: "Fix ALL three stale skill counts in the installer --help block ('66'→67, core '7'→8, standard '~13'→14)"
  streams: [UX]
  impact: 2; confidence: 5; ease: 5; ice: 50; tshirt: S
  product: UX
  owner: bin-subsystem-owner
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  severity: n/a
  status_on_next: "LARGELY RESOLVED / RE-SCOPE — re-pin 2026-06-08. The three hard-coded stale counts existed on feat but are GONE on next: bin/install.js:583 now derives 'core — ${PROFILES.core.length} main-loop skills' and 'standard — ${PROFILES.standard.length} skills', and 'full — all skills (default)' carries NO number. The executor's own 'derive programmatically' recommendation was already implemented upstream. The remaining defect (if any) is only that the tutorial/README still say '86' (that is QW-UX-04). Close QW-UX-03 or re-scope to a drift-lock TEST that asserts the help counts equal PROFILES.*.length."
  citation: "RE-PIN 2026-06-08 (next): bin/install.js:583 derives PROFILES.core.length / PROFILES.standard.length, 'full — all skills (default)' has no number (was :686 hard-coded '66'/'7'/'~13' on feat). Live facts still hold: commands/gsd/*.md = 67; src/install-profiles.cts:28-37 core = 8; :38-56 standard = 14"
  plan_only: true
  recall_gate: n/a
  note: "On feat this was three stale counts in one --help string; on next they are already derived programmatically. Verify before scheduling — the work this item describes is mostly done."

- id: QW-UX-04
  title: "Reconcile the tutorial's claimed install output with the real installer output"
  streams: [UX]
  impact: 3; confidence: 5; ease: 5; ice: 75; tshirt: S
  product: UX
  owner: ux-onboarding-owner
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  severity: n/a
  citation: "docs/tutorials/your-first-project.md:36-40 ('86 skills' + 'GSD Core ready') vs bin/install.js:10111,11874; live count 67"   # re-pinned to next 2026-06-08 (was 8775,10271)
  plan_only: true
  recall_gate: n/a

- id: QW-UX-05
  title: "Add an orientation + surface-slimming signpost to the post-install 'Done!' message"
  streams: [UX]
  impact: 4; confidence: 4; ease: 4; ice: 64; tshirt: S
  product: UX
  owner: bin-subsystem-owner
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: n/a    # installer output, not a shipped prompt
  severity: n/a
  citation: "bin/install.js:11864-11877 (both 'Done!' branches point only at /gsd-new-project + Discord)"   # re-pinned to next 2026-06-08 (was 10262-10274)
  plan_only: true
  recall_gate: n/a
  power_user_impact: "Keep ≤2 lines so it does not bury the primary /gsd-new-project step."

- id: QW-UX-06
  title: "Make the standard profile (not full) the recommended/default-highlighted newcomer choice"
  streams: [UX]
  impact: 4; confidence: 3; ease: 3; ice: 36; tshirt: M
  product: UX
  owner: bin-subsystem-owner
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: n/a
  severity: n/a
  citation: "src/install-profiles.cts:38-56 (standard set) + :499-506 (current default = full)"   # re-pinned to next 2026-06-08 (default was :443-451)
  plan_only: true
  recall_gate: n/a
  power_user_impact: "MUST preserve full via flag/marker. Ship ONLY behind the interactive prompt (QW-UX-01) so non-interactive/CI installs keep 'full' back-compat. Do NOT silently flip the bare default."

- id: QW-UX-07
  title: "Tier the slash-menu surface so the 6 core-loop commands read as 'start here' (progressive disclosure)"
  streams: [UX]
  impact: 4; confidence: 3; ease: 2; ice: 24; tshirt: L
  product: UX
  owner: ux-onboarding-owner
  runtime_blast_radius: multi
  mechanical_vs_instructional: n/a
  severity: n/a
  citation: "live count 67; src/clusters.cts:33-40 (core_loop=6) vs :97-104 (ns_meta=6 facades)"
  plan_only: true
  recall_gate: n/a
  power_user_impact: "Progressive disclosure only — NO command removed. If unachievable as a quick-win, hand to Phase 15."

- id: QW-UX-08      # UX leads; Token co-lens (ns-* surface sprawl)
  title: "Clarify the ns-* namespace facades vs their underlying commands for newcomers"
  streams: [UX, Token]
  impact: 3; confidence: 4; ease: 4; ice: 48; tshirt: S
  product: UX
  owner: ux-onboarding-owner
  runtime_blast_radius: claude-only
  mechanical_vs_instructional: instructional    # EXECUTION-RISK — edits runtime-shipped command prose
  severity: n/a
  citation: "src/clusters.cts:97-104 (ns_meta facades); commands/gsd/ns-*.md (6 files)"
  plan_only: true
  recall_gate: "lint:descriptions (scripts/lint-descriptions.cjs, ≤100 char) + lint:skill-deps closure — confirm no ns-* requires/closure breaks before any copy change"
  power_user_impact: "None to behavior — ns-* still dispatch identically. If it grows into 'hide ns-* from core/standard', tier via clusters — never delete."

# ── Token (6) ────────────────────────────────────────────────────────────────
- id: QW-TOK-01
  title: "Strip the dead commented-out PostToolUse hooks stub from 24 agent frontmatters"
  streams: [Token]
  impact: 3; confidence: 5; ease: 5; ice: 75; tshirt: S
  product: Token
  owner: token-stream
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: mechanical    # commented-out YAML, inert
  severity: n/a
  citation: "agents/gsd-planner.md:6-11 (commented '# hooks:' block); 24 agents (grep '^# hooks:' agents/*.md → 24)"
  plan_only: true
  recall_gate: n/a

- id: QW-TOK-02
  title: "Factor the <documentation_lookup> Context7 block into one shared include across 8 agents — PRESERVING the command -v security guard variant"
  streams: [Token]
  impact: 3; confidence: 4; ease: 3; ice: 36; tshirt: M
  product: Token
  owner: token-stream
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: instructional    # EXECUTION-RISK — NOT verbatim: 3 variants across 8 agents on next; 2 carry a command -v ctx7 supply-chain security guard
  severity: n/a
  citation: "RE-PIN 2026-06-08 (next): 8 agents carry <documentation_lookup> (grep -l → 8: executor, planner, phase-researcher, advisor/ai/domain/project/ui-researcher) but md5 = 3 DISTINCT variants: 6 researchers share one (no guard); gsd-executor and gsd-planner use a `command -v ctx7` guard + explicit 'Do NOT use npx --yes — silently executes unverified packages' warning. Drift from feat: feat said 4 variants / 3 guarded (incl. gsd-phase-researcher); on next phase-researcher no longer carries the ctx7 guard → 2 guarded agents"
  plan_only: true
  recall_gate: "ctx7-guard parity harness — md5/diff all 8 documentation_lookup blocks before & after; the shell-executing guarded agents (on next: executor + planner) MUST retain the `command -v ctx7` guard + 'Do NOT use npx --yes' warning. Collapsing the guarded variant into the `npx --yes` form is a supply-chain regression and a blocker. (Re-confirm the guarded-agent set at execution time — it drifted between feat and next.)"

- id: QW-TOK-03
  title: "Normalize legacy colon-form /gsd:<cmd> references to canonical /gsd-<cmd>"
  streams: [Token]
  impact: 2; confidence: 5; ease: 4; ice: 40; tshirt: S
  product: Token
  owner: token-stream
  runtime_blast_radius: all-14+    # Codex uses $gsd-<cmd>; runtime-slash.cjs converts — verify no regression
  mechanical_vs_instructional: mechanical    # textual reference normalization
  severity: n/a
  citation: "RE-PIN 2026-06-08 — COLON COUNT CORRECTED: grep -rho '/gsd:[a-z-]*' agents commands gsd-core | wc -l → 1073 on next (the backlog's verify command). The earlier '724' was the token stream's NARROWER grep (`agents/*.md commands/gsd/*.md gsd-core/workflows/*.md`), which is 719 on next — not contamination, just a smaller file set. Canonical scope is the broad 1073. CLAUDE.md anti-pattern 'Hardcoding colon-form slash-command references'"
  plan_only: true
  recall_gate: n/a

- id: QW-TOK-04
  title: "Audit and tighten the 100 agent/command `description` frontmatter strings (the only reliably-eager bytes)"
  streams: [Token]
  impact: 4; confidence: 3; ease: 3; ice: 36; tshirt: M
  product: Token
  owner: token-stream
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: instructional    # EXECUTION-RISK — the description IS the agent-routing signal
  severity: n/a
  citation: "100 files (tokenize.mjs recurring bucket); command desc capped (scripts/lint-descriptions.cjs ≤100), agent desc uncapped (agents/gsd-planner.md:3)"
  plan_only: true
  recall_gate: "agent-routing recall harness — each trimmed description must still route the orchestrator to the correct agent (edge-probe prohibition-elicitation style A/B) before any cut lands"

- id: QW-TOK-05
  title: "Move the inlined graphify procedural workflow out of commands/gsd/graphify.md into a workflows/ file the wrapper @-includes"
  streams: [Token]
  impact: 4; confidence: 4; ease: 2; ice: 32; tshirt: L
  product: Token
  owner: token-stream
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: instructional    # EXECUTION-RISK — relocate load-bearing Step 0/1 text, never delete
  severity: n/a
  citation: "commands/gsd/graphify.md (3,089 tok, full Step 0/1 config-gate inlined) vs commands/gsd/plan-phase.md:32-35 (941 tok, @-includes)"
  plan_only: true
  recall_gate: "graphify behavior-equivalence harness — run /gsd-graphify build|query|status|diff before & after; config-gate STOP branches must fire identically; no relocation lands until parity is shown"

- id: QW-TOK-06
  title: "Replicate the discuss-phase lazy mode-file pattern for execute-phase (21.5k) and plan-phase (20.7k)"
  streams: [Token]
  impact: 4; confidence: 3; ease: 1; ice: 12; tshirt: L
  product: Token
  owner: token-stream
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: instructional    # EXECUTION-RISK — every branch is load-bearing orchestration
  severity: n/a
  citation: "gsd-core/workflows/execute-phase.md (21,527 tok), plan-phase.md (20,693 tok) vs discuss-phase/modes/*.md lazy-load split"
  plan_only: true
  recall_gate: "plan/execute edge-probe + verifier-reach harness — edge-probe taxonomy + plan-checker/verifier suite must pass identically (mode-split vs monolithic) on a fixture phase; any drop in caught edges is a blocker. ⚠️ RE-PIN 2026-06-08 — edge-probe-dependent: `gsd-core/references/edge-probe.md` and `src/edge-probe.cts` are NOT on next (edge-probe PR #584/#550 unmerged). The recall-gate METHODOLOGY (edge-case taxonomy) is a valid gate name; the concrete edge-probe.md harness assumes that PR merges. Until then, use the plan-checker/verifier suite alone as the parity oracle."

- id: QW-TOK-07
  title: "Lock the mandatory-initial-read.md include against drift across the 5 files that @-include it"
  streams: [Token]
  impact: 2; confidence: 4; ease: 4; ice: 32; tshirt: S
  product: Token
  owner: token-stream
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: mechanical    # verify existing include is the single source; no behavior change
  severity: n/a
  citation: "gsd-core/references/mandatory-initial-read.md (55 tok), @-included by 5 files (grep -l → 5)"
  plan_only: true
  recall_gate: n/a

# NOTE: QW-TOK-08 (trim verbatim 'STOP — DO NOT READ' banner boilerplate) is FOLDED into
# QW-TOK-05's scope: the banner lives in commands/gsd/graphify.md alongside the inlined
# workflow being relocated. Deduped — see ledger. (mechanical sub-task of the relocation.)

# ── Reliability (5) ──────────────────────────────────────────────────────────
- id: QW-REL-01
  title: "Warn (don't silently default) when .planning/config.json exists but fails to parse"
  streams: [Reliability]
  impact: 5; confidence: 5; ease: 4; ice: 100; tshirt: S
  product: Reliability
  owner: reliability-stream / core.cts owner
  runtime_blast_radius: all-14+    # loadConfig is on every runtime's hot path
  mechanical_vs_instructional: n/a    # engine code, not prompt corpus
  severity: high
  citation: "src/core.cts:545-552 (silent fallback) vs src/config.cts:639 config-get / :429 config-set (errors); repro C-01"   # re-pinned to next 2026-06-08 (was core 544-551, config 417)
  plan_only: true
  recall_gate: n/a
  handoff_note: "Converging loadConfig to ERROR (like config-get) is a behavior change → Phase 13 (H-01)."

- id: QW-REL-02
  title: "Never emit an empty slug — fall back / warn when sanitization collapses a name to ''"
  streams: [Reliability]
  impact: 4; confidence: 5; ease: 4; ice: 80; tshirt: S
  product: Reliability
  owner: reliability-stream / core.cts owner
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: n/a
  severity: med
  citation: "src/core.cts:1919-1921; consumed at src/commands.cts:1166,1171; repro C-02"   # re-pinned to next 2026-06-08 (was core 1863-1865, commands 1164,1169)
  plan_only: true
  recall_gate: n/a

- id: QW-REL-03
  title: "Document (or align) the exit-code contract for no-.planning/ data reads"
  streams: [Reliability]
  impact: 2; confidence: 4; ease: 4; ice: 32; tshirt: S
  product: Reliability
  owner: reliability-stream / docs
  runtime_blast_radius: none
  mechanical_vs_instructional: n/a
  severity: low
  citation: "state load/progress/find-phase → exit 0 vs roadmap → exit 1; repro C-03"
  plan_only: true
  recall_gate: n/a
  handoff_note: "Full principled exit-code contract across ~50 subcommands → Phase 13 (H-03)."

- id: QW-REL-04
  title: "Populate the human message on the drift-detector exception branch (no blank echo)"
  streams: [Reliability]
  impact: 2; confidence: 4; ease: 5; ice: 40; tshirt: S
  product: Reliability
  owner: reliability-stream / drift.cts owner
  runtime_blast_radius: claude-only    # drift mapper is primarily a Claude Agent() flow
  mechanical_vs_instructional: n/a
  severity: low
  citation: "src/drift.cts:252-255 (catch) → 259-270 (skipped sets message:''); repro C-04"
  plan_only: true
  recall_gate: n/a

- id: QW-REL-05      # Reliability leads; UX/install co-lens (first-run path)
  title: "Resolve the Node-version contradiction: docs bless Node 18+ while package requires >=22; add a process.version guard"
  streams: [Reliability, UX]
  impact: 5; confidence: 5; ease: 4; ice: 100; tshirt: S
  product: Reliability
  owner: reliability-stream / bin-subsystem co-lens
  runtime_blast_radius: all-14+    # install-path; every runtime install touches it
  mechanical_vs_instructional: n/a    # docs + installer code, not prompt corpus
  severity: high
  citation: "package.json engines.node = '>=22.0.0' (package.json:47) vs docs blessing 'Node.js 18+' at docs/how-to/install-on-your-runtime.md:5 and docs/tutorials/your-first-project.md:15 (+ translations ja-JP/ko-KR/pt-BR/zh-CN — 18 doc files on next via `grep -rliE 'node.?js 18' docs/ | grep -v review`, re-pinned 2026-06-08; was ~15); no process.version guard in bin/install.js (grep → none, still 0); no .npmrc engine-strict (npm only WARNs EBADENGINE)"
  plan_only: true
  recall_gate: n/a
  handoff_note: "Doc half (18+ → 22+) is blast:none and trivial; the installer process.version guard is the all-14+ half. A newcomer on Node 18–21 (which the docs actively endorse: 'node --version should print v18.x.x or higher') installs successfully then hits a confusing/late Node-22 runtime failure — the exact spotlight-eve first-touch landmine the fast-track exists to prevent."
```

---

## Re-pin pass (verified against `next`, 2026-06-08)

M1 (these 20 quick-wins) was originally analyzed against `feat/non-inferable-pipeline` (= `next`
+ ~97 commits of unmerged edge-probe / experiment work). That branch was later **rebased onto
clean `origin/next`**, so the deliverables' `file:line` citations had been measured against a
different tree. This pass re-verified **every** citation against the current `next` working tree
(this branch's tracked source == `origin/next`, tip `29c0a2f5`), fixed drift, and flagged
anything that only exists on the edge-probe branch. **Source of truth: `src/*.cts`** (never the
gitignored compiled `.cjs`). **Plan-only:** only the 4 M1 deliverable markdown files were edited;
no `src/`, `bin/`, `gsd-core/` source was touched.

### (a) Coverage — citations verified

All cited surfaces were opened on `next` and checked against the described code/behavior:
`src/core.cts` (loadConfig silent-default, generateSlugInternal), `src/config.cts` (parse-fail
errors), `src/commands.cts` (slug consumer), `src/install-profiles.cts` (resolveEffectiveProfile
default, PROFILES core/standard arrays), `src/drift.cts` (exception branch), `src/clusters.cts`
(core_loop / ns_meta), `bin/install.js` (help text, profile flags, isTTY gate, install-output
strings, both 'Done!' branches), the onboarding docs (README, your-first-project,
install-on-your-runtime + translations), `package.json` engines, the agent corpus
(`# hooks:` stub ×24, `<documentation_lookup>` ×8, descriptions), `commands/gsd/graphify.md` /
`plan-phase.md`, and `gsd-core/references/mandatory-initial-read.md`. **~30 distinct
file:line / count citations verified across the 20 items + 5 stream findings (C-01…C-05).**

### (b) Drifted-and-fixed (old → new line numbers)

The big driver was **`bin/install.js`, which grew from ~11k lines (feat) to 12,727 (next)** —
every bin citation moved.

| Item | Citation | Old (feat) | New (`next`) |
|------|----------|-----------|--------------|
| QW-REL-01 | `core.cts` silent-default catch block | `544-551` | **`545-552`** |
| QW-REL-01 | `config.cts` parse-fail error (config-get / config-set) | `417` | **`639` (get) / `429` (set)** |
| QW-REL-01 | `core.cts` unknown-key warning (mirror target) | `455` | **`456`** |
| QW-REL-02 | `core.cts` `generateSlugInternal` | `1863-1865` | **`1919-1921`** |
| QW-REL-02 | `commands.cts` slug consumer (scaffold phase-dir) | `1164,1169` | **`1166,1171`** |
| QW-UX-01 / -06 | `install-profiles.cts` `resolveEffectiveProfile` default→full | `443-451` | **`499-506`** (marker honoring `447-448` → **`503-504`**) |
| QW-UX-01 | `bin/install.js` `--profile`/`--minimal` flag parse | `264-281` | **`371-376`** |
| QW-UX-01 | `bin/install.js` isTTY gate | `8599` | **`12127`** |
| QW-UX-02 / -03 | `bin/install.js` `--help` profile block | `686` | **`583`** |
| QW-UX-04 | `bin/install.js` `Installed <count> commands to commands/gsd/` | `8775` | **`10111`** |
| QW-UX-04 / -05 | `bin/install.js` `Done!` run-/gsd-new-project line | `10271` | **`11874`** |
| QW-UX-05 | `bin/install.js` both `Done!` branches | `10262-10274` | **`11864-11877`** |
| QW-TOK-02 | `<documentation_lookup>` variant structure | 4 variants / 3 guarded (incl. phase-researcher) | **3 variants / 2 guarded (executor + planner)** — see (c) |

**Exact-and-unchanged on `next` (verified, no edit needed):** `clusters.cts:33-40` (core_loop=6)
and `:97-104` (ns_meta=6); `install-profiles.cts:28-37` (core=8) and `:38-56` (standard=14);
`drift.cts:252-255 → 259-270` (`message:''`); `agents/gsd-planner.md:6-11` (`# hooks:` stub, ×24
agents); `gsd-planner.md:3` (uncapped description); `graphify.md:11` (STOP banner);
`plan-phase.md:32-35` (@-includes); `mandatory-initial-read.md` (×5 includers);
`your-first-project.md:36-40` ('86 skills'/'GSD Core ready'); `your-first-project.md:15` &
`install-on-your-runtime.md:5` ('Node.js 18'); `package.json:47` (engines `>=22.0.0`); README
0 profile hits. **Live counts:** commands/gsd = **67**, agents = **33** (both match).

### (c) Edge-probe-dependent items flagged (not on `next`)

- **QW-TOK-06 recall_gate** cited `gsd-core/references/edge-probe.md`. That file — and
  `src/edge-probe.cts` — are **NOT on `next`** (edge-probe PR #584/#550 unmerged). Flagged in
  both the EXECUTION-RISK table and the YAML: the recall-gate *methodology* (edge-case taxonomy)
  remains a valid gate NAME, but the concrete edge-probe.md/edge-probe.cts harness assumes that PR
  merges. Until then, the plan-checker/verifier suite alone is the parity oracle. (References to
  "edge-probe" as the NAME of the gate methodology elsewhere are intentionally left intact.)
- **QW-TOK-02** drifted (not absent): the `<documentation_lookup>` corpus on `next` is 8 agents
  with **3** md5 variants and **2** carrying the `command -v ctx7` supply-chain guard
  (gsd-executor, gsd-planner). On feat it was 4 variants / 3 guarded — **`gsd-phase-researcher` no
  longer carries the ctx7 guard on `next`**, and the researcher set now includes
  `gsd-ai-researcher`. The load-bearing thesis (NOT verbatim; a real guard exists in a subset;
  never collapse to `npx --yes`) still holds; only the agent list moved. Re-confirm the guarded
  set at execution time.

### (d) Colon-form count correction

The backlog's QW-TOK-03 said **724**. The true count on `next` via the backlog's own verify
command `grep -rho '/gsd:[a-z-]*' agents commands gsd-core | wc -l` is **1073** — corrected in the
ICE table and the YAML. The `724` was **not contamination**: it was the token stream's *narrower*
grep (`agents/*.md commands/gsd/*.md gsd-core/workflows/*.md`), which on `next` is **719** (a
slightly different, smaller file set). Both figures are now recorded with their exact greps; the
canonical scope is the broad **1073**.

### (e) Item that no longer reproduces on `next`

- **QW-UX-03 (stale `--help` counts) is LARGELY RESOLVED on `next`.** The three hard-coded stale
  counts (`full — all 66 skills`, `core — 7 main-loop skills`, `standard — ~13 skills`) existed on
  feat but are **gone** on `next`: `bin/install.js:583` now derives
  `core — ${PROFILES.core.length}` and `standard — ${PROFILES.standard.length}`, and
  `full — all skills (default)` carries no number. The executor's own "derive programmatically"
  recommendation was already implemented upstream. **QW-UX-03 should be closed or re-scoped to a
  drift-lock test.** (The tutorial/README "86 skills" mismatch is a *separate* defect — that is
  QW-UX-04, which still reproduces.) Every other finding (C-01…C-05, the slug bug, the silent
  config default, the drift blank message, the Node-version contradiction, the colon-form sprawl,
  the inlined graphify workflow, the `# hooks:` stub) **still reproduces on `next`** — edge-probe
  was additive, so the core-engine behaviors are intact.

---

## Dedup ledger

20 numbered stream items → **19** distinct backlog items from the streams, **+1 added by the
adversarial review → 20 total**. Three stream reconciliations (one removes a numbered item; two
are dual-lens tags on existing items) plus one post-review addition:

| Action | Items | Resolution |
|--------|-------|------------|
| **Merged (cross-lens)** | `QW-UX-01` ← cold-start facet | UX-01 (installer profile prompt) and the Token stream's "cold-start ~12k→700" cold-start facet (Token §F-03 / surface-sprawl) are the **same lever** seen from two lenses. Merged into **QW-UX-01** carrying `streams: [UX, Token]`; higher ICE (75) and the bin-subsystem owner preserved; Token co-lens recorded in routing. |
| **Merged (cross-lens)** | `QW-UX-08` ← ns-\* sprawl | UX-08 (clarify ns-\* facades) and the Token stream's ns-\* **surface-sprawl** recommendation are the **same surface concern**. The Token stream raised ns-\* only as progressive-disclosure guidance (not a numbered QW); folded into **QW-UX-08** as `streams: [UX, Token]`. UX-08's instructional flag + recall gate are the stricter posture and are **kept** (load-bearing guard preserved). |
| **Folded (intra-stream)** | `QW-TOK-08` → `QW-TOK-05` | QW-TOK-08 (trim the verbatim `STOP — DO NOT READ` / banner boilerplate) targets the **same file** (`commands/gsd/graphify.md`) whose inlined workflow QW-TOK-05 relocates; the banner is a mechanical sub-task of that relocation. Folded into QW-TOK-05's scope to avoid a same-file double-edit. |
| **Added (adversarial review)** | `QW-REL-05` (new) | The adversarial **Process** review found a genuine first-run newcomer landmine the three streams missed: docs bless **Node 18+** while `package.json` requires **≥22**, with no `process.version` guard in `bin/install.js`. Added as QW-REL-05 (Reliability + UX co-lens, ICE 100). This is the only net-new item; it raises the total from 19 to **20**. |

No items were dropped for scope (D-02): all 20 are within onboarding / UX / token-savings /
reliability. Out-of-scope material is carried as Milestone-2 handoffs below, not silently lost.

---

## Publication

**The git-tracked Markdown above is the published source of truth.** A maintainer publishes the
*view* by running the exact stand-up commands in **[TRACKING-SURFACE.md](TRACKING-SURFACE.md)**
(GitHub Projects v2 on the fork, primary; Issues+Labels+Milestones fallback). Those commands are
**provided for a maintainer to run** — they are **not** executed in this plan-only pass (no
GitHub side effects, no board created, no branch pushed).

> **VIEW-01 status — chosen + stand-up-ready; board creation DEFERRED to a maintainer.** The
> surface is *chosen* (Projects v2 primary, Issues+Labels+Milestones fallback) and *stand-up-ready*
> (exact `gh` commands + field spec written down). It is **not yet "stood up" as a live board** —
> under the no-GitHub-writes constraint the commands are provided, not executed, so **no board
> exists yet**. The accurate label is *deferred: board creation* (one `gh auth refresh -s project`
> + the documented block), not *done*.

**To stand up the board** (maintainer, post-handoff):
1. `gh auth refresh -s project` (one-time scope grant — see TRACKING-SURFACE precheck).
2. Run the Projects v2 block: create board → add custom fields mirroring this schema → add one
   item per row above, setting Impact/Confidence/Ease/ICE/T-Shirt/Product/Blast/Mech-Instr/Severity.
3. Fill the four owner slots (UX / bin-subsystem / Token / Reliability) with names.
4. Seed the board's first sprint from **▶ Start Here**.

**To commit the deliverable** (maintainer): see **[DELIV-HOME.md](DELIV-HOME.md)** — branch
`audit/newcomer-readiness-m1` on the `fork` remote (davesienkowski/gsd-core), not upstream.

The intake fields on the board map 1:1 to the schema, so the board is fully reconstructable from
this file — it is a view, not a second source of truth.

---

## Handed off to Milestone 2

Consolidated from the three streams. These are **in-scope concerns too large/systemic for a safe
quick-win** — deferred to the deep sweeps, not jammed into the fast-track. They are inputs to
Milestone 2, not a substitute for its sweeps.

### → Phase 13 (deep pipeline-correctness sweep) — from Reliability stream

| Ref | Handoff | Why deferred |
|-----|---------|--------------|
| **H-01** | Converge the config-parse-failure contract (error vs silent-default) | QW-REL-01 only *warns*. Making `loadConfig` **error** (or repair/quarantine) changes behavior for every command/runtime — needs a contract decision + regression sweep. |
| **H-02** | Runtime-divergence of slash hints when runtime is unresolved | `runtime-slash.cts:56` defaults to `claude`; verifying the full resolution chain across 14+ runtimes is a cross-runtime audit (Phase 15 UX overlap). |
| **H-03** | Systematic exit-code audit across the whole subcommand surface | QW-REL-03 documents one inconsistency; a principled contract across ~50 subcommands is a sweep. |
| **H-04** | Full first-run install→first-command→first-artifact failure trace across all runtimes | `bin/install.js` (~11k bundled lines) + per-runtime layout not exhaustively reproduced; a complete per-runtime first-run reliability trace is deep. |

### → Phase 15 (deep UX / onboarding assessment) — from UX stream

| Handoff | Why deferred |
|---------|--------------|
| Deep two-audience (newcomer vs power-user) menu/IA redesign over all 67 commands + per-runtime menu-rendering differences | QW-UX-07 is the quick-win slice (tier the core loop as "start here"); the full IA pass is the deep terminal-UX assessment. |
| Programmatic, drift-proof skill-count surfacing everywhere (help text, tutorial, README badges) | QW-UX-03/04 fix the current instances; a single derived source-of-truth for the count is a maintainability item. |

### → Phase 12 (deep bloat/maintainability sweep) — from Token stream

| Handoff | Why deferred |
|---------|--------------|
| Exact per-runtime **eager-vs-lazy** byte refinement (which bytes each of the 14+ runtimes eager-loads) | The token figures are a conservative char/4 upper bound; the deep sweep installs `gpt-tokenizer` for exact BPE counts and pins eager cost per runtime — refines the ICE of QW-TOK-04/05/06. |
| Full surface-sprawl tiering of the long tail into `core`/`standard`/`full` via `install-profiles.cts` | The quick-win keeps the full surface reachable; a principled per-command tiering across all 67 wrappers is the deep progressive-disclosure pass (overlaps Phase 15). |

---

*Plan-only attestation: this convergence created only `docs/audit/QUICK-WIN-BACKLOG.md` and the
Phase 5 planning artifacts. No `package.json`, `src/`, `gsd-core/`, `workflows/`, `agents/`,
`commands/`, `bin/`, or `.gitignore` was edited. No git commit, no GitHub write, no branch push.
The firewall (`.planning/codebase/*`, `.planning/notes/*-2026-06-05.md`, frontier-synthesis) was
honored — only the three stream notes and the Phase-1 frame files were opened.*
</content>
</invoke>
