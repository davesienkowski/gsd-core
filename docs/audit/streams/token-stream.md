> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# Token-Savings Quick-Win Stream (Phase 3)

**Stream:** Token (Milestone 1, fast-track)
**Author:** token-stream (independent maintainer stream)
**Date:** 2026-06-07
**Status:** Plan-only. No code changed. Items are owner-assignable drafts.
**Requirement slice:** BLOAT-03 + BLOAT-02 surface (deep versions deferred to Phase 12).

This stream quantifies where **recurring context cost** and **surface sprawl** inflate every
newcomer invocation, and drafts owner-assignable token quick-wins with the **load-bearing
guard** (D-03/D-04) applied to every prompt-corpus cut. "verifier reach = spec reach" — no
load-bearing instruction is ever phrased as "delete this."

---

## ⚠️ Measurement caveat (read before trusting any figure)

All token figures below come from **`node docs/audit/instrumentation/tokenize.mjs`**, run from
repo root on 2026-06-07. `gpt-tokenizer` is **not installed**, so the script used its labelled
**char/4 heuristic fallback** — figures are **approximate (±~10–15%)**. The script
auto-upgrades to exact BPE counts once `gpt-tokenizer` is installed (`npm i -D gpt-tokenizer`,
**do not commit to the package**).

**The recurring-context tax is a CONSERVATIVE UPPER BOUND.** `tokenize.mjs` counts the **full
body** of every command wrapper and agent file. In practice an AI runtime typically surfaces
only the **frontmatter `description`** of each agent/command into the system prompt, loading the
full body **on demand** when that agent/command is dispatched. So the ~179k "recurring tax" is
the *ceiling*, not the per-session eager cost. Every sizing below states whether the bytes it
trims are **eager** (frontmatter / always-surfaced) or **lazy** (body, paid on dispatch). The
deep Phase 12 sweep refines exactly which bytes each of the 14+ runtimes eager-loads.

**Corpus measured (D-02):** `commands/gsd/*.md` (67 files), `agents/*.md` (33 files),
`gsd-core/workflows/*.md`, `gsd-core/references/*.md`. Surface counts use `src/*.cts` as
source-of-truth. The gitignored compiled `gsd-core/bin/lib/*.cjs` is **never** measured, and
`.cts`↔`.cjs` pairs are **never** counted as duplication (ADR-457 build-at-publish).

---

## Table A — Recurring-context tax (every invocation) — highest leverage

`tokenize.mjs` totals: **100 files, ~178,999 tokens** across `commands/gsd/` + `agents/`
(conservative upper bound; eager cost is much smaller — see caveat). Ranked top contributors:

| Rank | File | Tokens | Eager vs lazy (per caveat) |
|-----:|------|-------:|----------------------------|
| 1 | `agents/gsd-planner.md` | 11,961 | body lazy; frontmatter `description` eager |
| 2 | `agents/gsd-debugger.md` | 11,644 | body lazy; description eager |
| 3 | `agents/gsd-phase-researcher.md` | 9,872 | body lazy; description eager |
| 4 | `agents/gsd-doc-writer.md` | 9,640 | body lazy; description eager |
| 5 | `agents/gsd-executor.md` | 9,448 | body lazy; description eager |
| 6 | `agents/gsd-plan-checker.md` | 8,984 | body lazy; description eager |
| 7 | `agents/gsd-verifier.md` | 8,868 | body lazy; description eager |
| 8 | `agents/gsd-code-fixer.md` | 7,986 | body lazy; description eager |
| 9 | `commands/gsd/graphify.md` | 3,089 | **OUTLIER** — full workflow inlined in the wrapper (see QW-TOK-05) |
| 10 | `commands/gsd/quick.md` | 1,734 | wrapper larger than peers |

Notes:
- The 33-agent roster dominates this bucket (the 8 largest are all agent role bodies). Because
  the body is lazy on most runtimes, the **highest-leverage eager cut is the count and length
  of `description` frontmatter across all 100 files**, not the bodies.
- `commands/gsd/graphify.md` (3,089 tok) is **3.3× the next-largest command wrapper**
  (`quick.md` 1,734) and **3.3× the comparable orchestrator** `plan-phase.md` (941 tok, which
  correctly @-includes its workflow). It inlines an entire procedural workflow directly in the
  command file — see QW-TOK-05.

## Table B — On-demand files (per workflow run)

`tokenize.mjs` totals: **173 files, ~449,485 tokens** across `gsd-core/workflows/` +
`gsd-core/references/`. Paid only when a specific workflow/agent runs, so lower per-session
leverage than Table A, but the two workhorse workflows are large. Ranked top contributors:

| Rank | File | Tokens | When paid |
|-----:|------|-------:|-----------|
| 1 | `gsd-core/workflows/execute-phase.md` | 21,527 | per execute-phase run |
| 2 | `gsd-core/workflows/plan-phase.md` | 20,693 | per plan-phase run |
| 3 | `gsd-core/workflows/new-project.md` | 13,383 | per new-project run (**newcomer first-run path**) |
| 4 | `gsd-core/workflows/docs-update.md` | 12,751 | per docs-update run |
| 5 | `gsd-core/workflows/quick.md` | 9,987 | per quick run (hot path) |
| 6 | `gsd-core/references/user-profiling.md` | 9,444 | when profiling reference loaded |
| 7 | `gsd-core/workflows/settings-advanced.md` | 8,718 | per advanced-settings run |
| 8 | `gsd-core/workflows/help/modes/full.md` | 8,302 | per `/gsd-help` full mode |
| 9 | `gsd-core/workflows/review.md` | 8,241 | per review run |
| 10 | `gsd-core/references/checkpoints.md` | 7,734 | when checkpoints reference loaded |

Note: the discuss-phase workflow already demonstrates the **lazy mode-file pattern**
(`gsd-core/workflows/discuss-phase/modes/*.md`, each ~0.3–2.2k tok) — only the selected mode
loads. This is the progressive-disclosure pattern to replicate, cited in QW-TOK-05/06.

**Summary (tokenize.mjs):** recurring tax ~178,999 · on-demand ~449,485 · **grand total
~628,484 tokens** (char/4 upper bound).

---

## Drafted token quick-wins (BACKLOG-SCHEMA format)

Each item is ICE-sized (Impact × Confidence × Ease, 1–5, higher = better), owner-assignable,
runtime-blast-radius tagged, plan-only. Every prompt-corpus item carries the
**mechanical_vs_instructional** flag (D-03). Instructional items are tagged **EXECUTION-RISK**
and name a **recall_gate** — never "delete this."

### Quick-win count: 8 (5 mechanical · 3 load-bearing/instructional)

> **Correction (adversarial review, 2026-06-07):** QW-TOK-02 was originally tagged
> `mechanical` on a "verbatim-identical in 8 agents" premise. Re-verification (md5/diff of each
> `<documentation_lookup>` block) **refutes** that: the blocks are **not all identical**, and a
> subset carry a deliberate **supply-chain security guard** (`command -v ctx7` + "Do NOT use
> `npx --yes`" warning) the others lack. Factoring them is therefore **load-bearing /
> EXECUTION-RISK**, not mechanical. Re-tagged below with a named parity gate. The mechanical set
> is now 4 (QW-TOK-01, -03, -07, -08).
>
> **RE-PIN 2026-06-08 (verified against `next`):** the variant *structure* drifted from the feat
> measurement. On clean `next` the 8 `<documentation_lookup>` agents are
> **executor, planner, phase-researcher, advisor/ai/domain/project/ui-researcher** (note: feat
> said "5 researchers"; on next there are 6 researcher-type agents incl. `gsd-ai-researcher`).
> md5 yields **3 distinct variants** (not 4): `gsd-executor` (carries `command -v ctx7` guard +
> "Do NOT use `npx --yes`" warning), `gsd-planner` (carries the `command -v ctx7` guard), and one
> shared variant across the 6 researchers (no guard). **`gsd-phase-researcher` no longer carries
> the `command -v ctx7` guard on `next`** — so the load-bearing guard now lives in **2** agents
> (executor + planner), not 3. The thesis (NOT verbatim; a real supply-chain guard exists in a
> subset; never collapse to `npx --yes`) **still holds** — only the agent list/variant count moved.

```yaml
- id: QW-TOK-01
  title: "Strip the dead commented-out PostToolUse hooks stub from 24 agent frontmatters"
  impact: 3          # eager-region cut (frontmatter), multiplied across the whole roster
  confidence: 5      # measured: 24 files, ~3,435 bytes (~858 tok char/4); pure comments, never executed
  ease: 5            # delete commented lines; no behavior path touches them
  ice: 75            # 3 × 5 × 5
  tshirt: S
  product: Token
  owner: token-stream
  runtime_blast_radius: all-14+    # agents ship to every runtime payload
  mechanical_vs_instructional: mechanical   # commented-out YAML, inert
  severity: n/a
  citation: "agents/gsd-planner.md:6-11 (commented `# hooks:` block); 24 agents carry it (grep '^# hooks:' agents/*.md → 24)"
  plan_only: true
  recall_gate: n/a

- id: QW-TOK-02
  title: "Factor the <documentation_lookup> Context7/ctx7 block into one shared include across 8 agents — PRESERVING the command -v security guard variant"
  impact: 3          # ~2,836 tok (char/4) duplicated across 8 agents; body region (lazy) but high duplication
  confidence: 4      # measured: 8 agents carry the block — but it is NOT one block (4 distinct md5 variants)
  ease: 3            # needs a shared @~/.claude/gsd-core/references/ include + 8 edits; verify per runtime AND preserve the guarded variant
  ice: 36            # 3 × 4 × 3
  tshirt: M
  product: Token
  owner: token-stream
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: instructional   # EXECUTION-RISK — NOT verbatim; 3 variants on next, 2 carry a supply-chain security guard (command -v ctx7 + "Do NOT use npx --yes" warning)
  severity: n/a
  citation: "RE-PIN 2026-06-08 (next): 8 agents carry <documentation_lookup> (grep -l → 8: executor, planner, phase-researcher, advisor/ai/domain/project/ui-researcher) but md5 yields 3 DISTINCT variants: 6 researchers share one (no guard); gsd-executor and gsd-planner instead use a `command -v ctx7` guard with an explicit 'Do NOT use npx --yes — silently executes unverified packages' supply-chain warning (agents/gsd-executor.md, gsd-planner.md). NB drift from feat: feat cited 4 variants and 3 guarded agents incl. gsd-phase-researcher; on next phase-researcher no longer carries the ctx7 guard, leaving 2 guarded agents."
  plan_only: true
  recall_gate: "ctx7-guard parity harness — md5/diff the documentation_lookup block of all 8 agents before & after; the shell-executing guarded agents (on next: executor + planner) MUST still carry the `command -v ctx7` guard + 'Do NOT use npx --yes' warning. Any factor-out that collapses the guarded variant into the `npx --yes` form is a supply-chain regression and a blocker. (Re-confirm the guarded-agent set at execution time — it drifted between feat and next.)"

- id: QW-TOK-03
  title: "Normalize legacy colon-form /gsd:<cmd> references to canonical /gsd-<cmd> in the prompt corpus"
  impact: 2          # mostly correctness/consistency; token delta small, but anti-pattern per CLAUDE.md
  confidence: 5      # RE-PIN 2026-06-08 (next): stream-method grep (agents/*.md commands/gsd/*.md gsd-core/workflows/*.md) = 719 (was 724 on feat). Broader grep (agents commands gsd-core, recursive — the backlog's verify command) = 1073. Canonical form is hyphen.
  ease: 4            # mechanical sed-style rewrite, but multi-runtime so verify slash emission
  ice: 40            # 2 × 5 × 4
  tshirt: S
  product: Token
  owner: token-stream
  runtime_blast_radius: all-14+    # Codex uses $gsd-<cmd>; runtime-slash.cjs converts — verify no regression
  mechanical_vs_instructional: mechanical   # textual reference normalization, no behavior change
  severity: n/a
  citation: "grep -rho '/gsd:[a-z-]*' agents/*.md commands/gsd/*.md gsd-core/workflows/*.md → 719 on next (re-pinned 2026-06-08; was 724 on feat). The broader recursive grep over `agents commands gsd-core` (the backlog's verify command) = 1073. CLAUDE.md anti-pattern 'Hardcoding colon-form slash-command references'"
  plan_only: true
  recall_gate: n/a

- id: QW-TOK-04
  title: "Audit and tighten the 100 agent/command `description` frontmatter strings (the only reliably-eager bytes)"
  impact: 4          # these are the bytes ACTUALLY surfaced into the system prompt every session
  confidence: 3      # eager-region hypothesis is per-runtime; lint already caps command desc ≤100 chars (agents uncapped)
  ease: 3            # per-string copy edit across 100 files; needs the eager/lazy refinement first
  ice: 36            # 4 × 3 × 3
  tshirt: M
  product: Token
  owner: token-stream
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: instructional   # the description IS the routing signal a model uses to pick an agent — EXECUTION-RISK
  severity: n/a
  citation: "100 files in tokenize.mjs recurring bucket; command desc capped by scripts/lint-descriptions.cjs (≤100), agent desc uncapped (e.g. agents/gsd-planner.md:3 is a full sentence)"
  plan_only: true
  recall_gate: "agent-routing recall harness — confirm each trimmed description still routes the orchestrator to the correct agent (edge-probe prohibition-elicitation style A/B on ambiguous task → agent selection) before any cut lands"

- id: QW-TOK-05
  title: "Move the inlined graphify procedural workflow out of commands/gsd/graphify.md into a gsd-core/workflows/ file the wrapper @-includes (match plan-phase.md's thin-wrapper pattern)"
  impact: 4          # 3,089 tok wrapper → ~900 tok wrapper; 3.3× the next-largest command, in the eager bucket
  confidence: 4      # measured outlier (graphify 3,089 vs plan-phase 941 vs quick 1,734); pattern already exists
  ease: 2            # not a cut — a refactor that relocates load-bearing steps; must preserve every gate verbatim
  ice: 32            # 4 × 4 × 2
  tshirt: L
  product: Token
  owner: token-stream
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: instructional   # the inlined Step 0/1/config-gate text is load-bearing — relocate, never delete — EXECUTION-RISK
  severity: n/a
  citation: "commands/gsd/graphify.md (3,089 tok, full Step 0/Step 1 config-gate workflow inlined) vs commands/gsd/plan-phase.md:32-35 (941 tok, @-includes its workflow)"
  plan_only: true
  recall_gate: "graphify behavior-equivalence harness — run /gsd-graphify build|query|status|diff before & after the relocation and diff outputs; the config-gate STOP branches must fire identically. No relocation lands until parity is shown."

- id: QW-TOK-06
  title: "Replicate the discuss-phase lazy mode-file pattern for the largest monolithic workflows (execute-phase 21.5k, plan-phase 20.7k) — split rarely-hit branches into on-demand mode files"
  impact: 4          # the two biggest on-demand files; trims per-run cost on the core plan→execute loop
  confidence: 3      # pattern proven (discuss-phase/modes/*) but these workflows are denser; needs branch-frequency read
  ease: 1            # large structural refactor of the two most load-bearing workflows; highest care
  ice: 12            # 4 × 3 × 1
  tshirt: L
  product: Token
  owner: token-stream
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: instructional   # every branch is load-bearing orchestration — restructure, never delete — EXECUTION-RISK
  severity: n/a
  citation: "gsd-core/workflows/execute-phase.md (21,527 tok), plan-phase.md (20,693 tok) vs the proven gsd-core/workflows/discuss-phase/modes/*.md lazy-load split"
  plan_only: true
  recall_gate: "plan/execute edge-probe + verifier-reach harness — the edge-probe taxonomy and the plan-checker/verifier suite must pass identically on a fixture phase with mode-split vs monolithic workflows before adoption. Treat any drop in caught edges as a blocker. ⚠️ RE-PIN 2026-06-08: `gsd-core/references/edge-probe.md` is NOT on `next` (edge-probe PR unmerged upstream) — the literal file citation is edge-probe-dependent. The recall-gate methodology (edge-case taxonomy) remains valid as a GATE NAME; the concrete edge-probe.md harness assumes that PR merges. Until then, use the plan-checker/verifier suite alone as the parity oracle."

- id: QW-TOK-07
  title: "De-duplicate the @~/.claude/gsd-core/references/mandatory-initial-read.md preamble handling across the 5 files that @-include it"
  impact: 2          # the include file itself is tiny (55 tok); win is consistency, near-zero token delta
  confidence: 4      # measured: 5 includers; already factored as an include (good), just verify no inline copies drifted
  ease: 4            # verification pass + lint, not a structural change
  ice: 32            # 2 × 4 × 4
  tshirt: S
  product: Token
  owner: token-stream
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: mechanical   # confirming the existing include is the single source; no behavior change
  severity: n/a
  citation: "gsd-core/references/mandatory-initial-read.md (55 tok), @-included by 5 files (grep -l mandatory-initial-read → 5); already-good pattern to lock against drift"
  plan_only: true
  recall_gate: n/a

- id: QW-TOK-08
  title: "Trim the redundant 'STOP — DO NOT READ THIS FILE' / banner boilerplate where it is duplicated verbatim across command wrappers"
  impact: 2          # small per-file, but eager bucket and repeated across many wrappers
  confidence: 3      # the STOP banner appears in graphify.md and peers; needs an exact-duplicate sweep to size
  ease: 4            # mechanical removal of verbatim-duplicated banner lines
  ice: 24            # 2 × 3 × 4
  tshirt: S
  product: Token
  owner: token-stream
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: mechanical   # boilerplate banner restatement; the canonical injection note can live once
  severity: n/a
  citation: "commands/gsd/graphify.md:11 ('**STOP -- DO NOT READ THIS FILE...**') + the 'GSD > GRAPHIFY' banner block; sweep peers for verbatim copies before sizing"
  plan_only: true
  recall_gate: n/a
```

### Mechanical vs load-bearing split

| Class | IDs | Posture |
|-------|-----|---------|
| **Mechanical (safe to cut)** | QW-TOK-01, -03, -07, -08 (4) | Delete/factor after a verbatim-duplicate confirmation. |
| **Load-bearing / instructional (EXECUTION-RISK)** | QW-TOK-02, -04, -05, -06 (4) | **Never deleted.** Each names a recall/edge-probe gate that must pass before the change lands. Relocation/restructure only. |

(QW-TOK-04 raises the mechanical count question: trimming a `description` *string* looks
mechanical but the description IS the routing signal a model reads to pick an agent — under
D-04 "when in doubt → load-bearing," so it is tagged instructional with a routing recall gate.
**QW-TOK-02 is the same lesson learned the hard way:** it *looked* like a verbatim-duplicate
factor-out, but the blocks are not verbatim — 3 of the 8 carry a `command -v ctx7` supply-chain
security guard the others lack, so factoring them is load-bearing and gated (ctx7-guard parity
harness). Net split: **4 mechanical edits, 4 load-bearing** — QW-TOK-02/-04 are counted with the
load-bearing set because each carries a recall/parity gate.)

---

## Surface-sprawl candidates (progressive disclosure, not deletion)

Grounded in `docs/audit/instrumentation/usage-signal.md` (**single-author signal — Dave's
local transcripts; NOT a newcomer or population claim**). Per D-05 and ROADMAP "Hard rules,"
**no command is cut from the newcomer surface on low frequency**; the lever is the existing
`install-profiles.cjs` (src/install-profiles.cts) core/standard/full tiering.

The surface is large: **67 command wrappers + 33 agents = 100 enumerable surfaces.** The
usage signal shows a heavy user reaches mostly for the orchestrating/core-loop commands
(`gsd-autonomous`, `gsd-resume-work`, `gsd-explore`, `gsd-quick`; skills `gsd-plan-phase`,
`gsd-execute-phase`). A long tail appears 1–2× — which is **not** evidence of newcomer
irrelevance.

| Candidate | Signal | Progressive-disclosure recommendation (NOT a cut) |
|-----------|--------|---------------------------------------------------|
| The 6 `ns-*` namespace router wrappers (`ns-context`, `ns-ideate`, `ns-manage`, `ns-project`, `ns-review`, `ns-workflow`, ~5,576 bytes total) | None appear in the usage signal | These are *meta-routers* that already exist to reduce surface — keep them in `core`/`standard`; route the verbose individual sub-commands they front into `full`-tier disclosure so newcomers see the routers, not all 67 leaves. |
| Long-tail commands (1–2 invocations: `import`, `ingest-docs`, `audit-fix`, `code-review`, `config`, etc.) | Low single-author frequency | **Do not cut.** Tier into `standard`/`full` via `install-profiles.cjs` so the newcomer `core` surface stays tight; full surface remains one `/gsd-surface full` away. |
| Safety/recovery commands (`gsd-undo`, `gsd-resume-work`, `gsd-pause-work`, `gsd-health`, `gsd-forensics`) | Mixed (resume-work is rank 2; others low) | **Criticality-exempt (STREAMS.md).** Never tier out of reach by low usage — a newcomer who breaks something needs the recovery path present. |
| Agent roster (33 agents, all in recurring bucket) | Agents are dispatched, not user-typed | Agents are not directly newcomer-facing surface; their cost is the bodies (Table A). Route via QW-TOK-04/-05, not surface tiering. |

**Power-user guard:** every tiering recommendation keeps the full surface reachable via
`/gsd-surface` / `install-profiles.cjs` `full` profile, so a fast newcomer-facing tightening
does not silently degrade the heavy-user mix the usage signal documents.

---

## Plan-only attestation

This stream created only `docs/audit/streams/token-stream.md` and the Phase 3 planning
artifacts. It edited no `package.json`, `src/`, `gsd-core/`, `workflows/`, `agents/`,
`commands/`, or `bin/`. No npm install, no git commit, no GitHub write. The firewall
(`.planning/codebase/*`, `.planning/notes/*-2026-06-05.md`, frontier-research-synthesis) was
honored. Every figure is reproducible via `node docs/audit/instrumentation/tokenize.mjs`.