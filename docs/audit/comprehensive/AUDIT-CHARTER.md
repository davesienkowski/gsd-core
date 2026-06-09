# GSD-Core Comprehensive Audit — Audit Charter (Milestone 2)

> **Status:** LOCKED (Phase 6). This charter is the **gate** for Milestone 2.
> **Every M2 finding cites this charter's taxonomy, sizing scheme, and evidence-card schema.**
> **Mode:** Audit-and-plan only. No file under this audit modifies the GSD pipeline or package.

**Locked:** 2026-06-08 (Phase 6 — Audit Charter & Method)
**Requirement:** METHOD-01 (the audit method, grounded in established best practice,
documented as a written method statement)
**Decisions locked:** D-01..D-07 (`.planning/phases/06-audit-charter-method/06-CONTEXT.md`)
**Extends:** `docs/audit/BACKLOG-SCHEMA.md` (the Milestone-1 schema — superset, not a replacement)

This is the deep counterpart to Milestone 1's light frame (`docs/audit/STREAMS.md` +
`docs/audit/BACKLOG-SCHEMA.md`). It locks the rules **before** the deep sweeps run, so that
Phases 7–17 produce one coherent, comparable, citable body of findings rather than fifteen
incompatible local schemes. Keep it operational, not academic: a sweep author should be able
to read it, emit a finding, and know it will rank and reconcile correctly.

---

## 0. The one hard rule: analyze `src/`, never the compiled `.cjs`

**The TypeScript source of truth is `src/*.cts`** (verified live this phase: **89** tracked
`.cts` files via `git ls-files src/`). The compiled engine output `gsd-core/bin/lib/*.cjs`
(**92** files) is **gitignored build output** (verified: `git check-ignore
gsd-core/bin/lib/core.cjs` → ignored), per **ADR-457** (build-at-publish direction).

**Every static analysis, every `file:line` citation, and every dead/duplicate claim targets
`src/*.cts` and the prompt corpus — never the compiled `gsd-core/bin/lib/*.cjs`.** Analyzing
the compiled output produces false bloat: it would count `.cts`↔`.cjs` source/artifact pairs
as "duplication" and miss the actual source. A finding that cites a `bin/lib/*.cjs` path is
**invalid by construction** and must be rewritten against its `.cts` source before it enters
the register.

> ADR-457 nuance (do not over-claim): the *accepted direction* is build-at-publish, but at the
> time of verified writing the `.cjs` files are largely hand-maintained, not yet `tsc` output.
> The rule stands regardless: the git-tracked `src/*.cts` is what the team edits and reviews,
> so it is the only legitimate citation target. Do not assert a transpile pipeline exists that
> does not — that is the exact fabricated-context failure ADR-457 itself corrected.

---

## 1. Problem-type taxonomy (the MECE axis) + tie-break order

### 1.1 The five problem types (MECE partition)

Every finding is classified into **exactly one** of five mutually-exclusive, collectively-
exhaustive problem types. This is the **primary** axis of the hybrid-matrix roadmap (Phase 17;
ROADMAP-01: problem-type primary, subsystem-tagged).

| `problem_type` | Plain name | The question it answers | Maps to requirement(s) |
|----------------|-----------|-------------------------|------------------------|
| **`wrongness`** | **Correctness** | Where can the pipeline produce a **wrong or unreliable outcome**? (broken flows, runtime/compat breakage, swallowed errors, silent wrong defaults) | CORR-01 (Phase 13) |
| **`external-gap`** | **AI Gap** | Where does the pipeline **trail current AI/LLM best practice** — an opportunity, not just a defect? | AI-01 (Phase 14) |
| **`waste`** | **Bloat** | What is **carried but not earning its cost** — dead/duplicated code, surface sprawl, token tax, conceptual redundancy? | BLOAT-01..04 (Phase 12) |
| **`change-cost`** | **Maintainability** | What makes **future change slow or risky** — coupling, structural decay, test gaps, inconsistency — without being waste *or* a present defect? | (maintainability lens, Phase 12 SC-4) |
| **`human-friction`** | **UX** | Where do **humans (newcomer or power-user) stumble** — confusing surface, missing signposts, install/first-run friction? | UX-01 (Phase 15) |

**Why MECE.** The partition follows the *mutually exclusive, collectively exhaustive*
principle (Barbara Minto, McKinsey, late 1960s) so that (a) no finding is double-counted
across two lenses and (b) no concern falls through a gap between lenses. A sweep author who
cannot place a finding into exactly one type has either found a malformed finding or exposed a
gap in the taxonomy — both are signals, not nuisances.

**MECE boundary rules (how to resolve "it's kind of both"):**

- **Correctness vs. Bloat:** if it can produce a *wrong result today*, it is `wrongness`,
  even if the root cause is also messy. Bloat is cost-without-defect.
- **Bloat vs. Maintainability:** `waste` is carried-but-unused (delete it and nothing of value
  is lost); `change-cost` is *load-bearing but hard to change safely* (you cannot just delete
  it). Dead code = waste; tangled-but-live coupling = change-cost.
- **Maintainability vs. UX:** `change-cost` is friction for the *maintainer changing the code*;
  `human-friction` is friction for the *user operating the tool*.
- **AI-Gap vs. everything:** `external-gap` is the only type framed as *opportunity against an
  external benchmark* (community best practice). A purely internal defect is never `external-gap`.

The two axes of **Fowler's Technical Debt Quadrant** (deliberate↔inadvertent, reckless↔prudent,
Fowler 2009) are **not** a sixth problem type — they are an optional *annotation* a
maintainability or correctness finding MAY carry (the `debt_quadrant` optional field, §2.3) to
tell the team whether the debt was a knowing trade-off or an accident. The quadrant informs
*how to talk about* a finding; the five-type axis decides *which lens owns* it.

### 1.2 Tie-break order (when severity ties, what gets attention first)

When two findings tie on computed priority (§2), or when a single finding genuinely spans two
lenses and must be filed once, resolve by this fixed precedence:

> **Correctness > AI Gap > Bloat > Maintainability > UX**
>
> (`wrongness` > `external-gap` > `waste` > `change-cost` > `human-friction`)

**Rationale (operational, not arbitrary):**

1. **Correctness first** — a wrong outcome erodes trust in the whole pipeline; nothing else
   matters if the tool is unreliable.
2. **AI Gap second** — for an LLM-orchestration framework, falling behind community best
   practice is a *strategic* correctness-adjacent risk (the pipeline's whole value is being a
   good harness); placed above pure waste because a missing best-practice can silently produce
   weaker outcomes ("verifier reach = spec reach").
3. **Bloat third** — waste is cheap to justify cutting and directly serves the "cleaner and
   tighter" north-star, but it is not a *defect*.
4. **Maintainability fourth** — change-cost is real but deferred pain; it loses to present
   waste because waste removal often *reduces* change-cost as a side effect.
5. **UX last in the tie-break** — *not* because UX is unimportant (it is the headline of the
   Mintlify spotlight) but because UX findings rarely *tie* with the others on the same
   evidence; when they do, the engine-correctness chain is the riskier thing to leave unowned.

> The tie-break is a **last-resort disambiguator**, not a priority ranking of the lenses. A
> high-severity UX finding still outranks a trivial correctness nit — priority (§2) is computed
> first; the tie-break only fires on a genuine tie or a single-file-twice decision.

---

## 2. Sizing — ICE-style (Severity / Effort / Risk / Confidence)

### 2.1 The scheme

Sizing extends the Milestone-1 **ICE** model (Sean Ellis, *Hacking Growth* — Impact ×
Confidence × Ease; the framework growth teams use to rank experiments). M1 scored
**Impact × Confidence × Ease** (each 1–5, higher = better candidate; see `BACKLOG-SCHEMA.md`).
M2 findings are richer than quick-wins (they include latent risk and deferred work), so the
deep scheme keeps the ICE spirit and field names but names four sub-scores:

| Sub-score | Scale | Direction | Meaning |
|-----------|-------|-----------|---------|
| **Severity** | 1–5 | higher = worse | How bad is the problem if left? (the M1 **Impact** axis, re-pointed: a correctness defect's blast, a bloat's recurring cost, a UX friction's reach) |
| **Effort** | S / M / L | — | How much work to fix (t-shirt; mirrors M1's t-shirt that accompanies Ease). S≈small/mechanical/isolated, M≈moderate, L≈large/multi-runtime |
| **Risk** | low / med / high | higher = riskier | Risk of the *fix itself* (regression, multi-runtime breakage, cutting load-bearing instruction). Distinct from Severity (risk of the *problem*). |
| **Confidence** | 1–5 | higher = surer | How sure the finding is real and the citation checkable (the M1 **Confidence** axis, unchanged) |

**Computed priority (for ranking + tie-break):**

```
priority = Severity × Confidence × Ease
where Ease = the monotonic inverse of Effort  (S→5, M→3, L→1)  and risk down-weights
```

This **preserves the M1 ICE direction** (higher = better candidate to action) and keeps all
axes pointed the same way (the explicit reason M1 chose **Ease** over raw Effort —
`BACKLOG-SCHEMA.md` §"Why Ease, not Effort"). **Risk** does not enter the product (it is not
monotonic with "good candidate"); it is carried as a separate gate: a high-Risk fix is
flagged for sequencing/owner attention regardless of its priority product. M1 items fold in
unchanged because M1's `ice = impact × confidence × ease` equals M2's `priority` when M2
Severity = M1 Impact (see mapping §3).

### 2.2 The per-finding evidence-card schema

Every concern sweep (Phases 12–15) emits findings as **evidence cards** in this schema.
Phase 17 assembles them into `FINDINGS.md` (§4) and the roadmap. **A finding without a
checkable citation is not a finding** (§3 evidence standard).

| Field | Required | Values / format | Notes |
|-------|----------|-----------------|-------|
| `id` | yes | `F-<TYPE>-NN` (e.g. `F-CORR-01`, `F-BLOAT-07`, `F-UX-03`, `F-AIGAP-02`, `F-MAINT-04`) | Deep-finding namespace; M1 IDs (`QW-*`) are preserved as provenance, not renumbered |
| `problem_type` | yes | one of: `wrongness` / `external-gap` / `waste` / `change-cost` / `human-friction` | The MECE primary axis (§1.1) — exactly one |
| `subsystem` | yes | engine (`src/*.cts`) / installer (`bin/`) / workflows / references / agents / skills / templates / tests / sdk / docs | Secondary (matrix tag); from the Phase 8 subsystem map |
| `file:line` | yes | `src/<file>.cts:NN` or a concrete reproduction | **Cite `src/`, never `bin/lib/*.cjs`** (§0). Prompt-corpus findings cite the `.md` path. A repro counts as a citation. |
| `severity` | yes | 1–5 (higher = worse) | §2.1 |
| `effort` | yes | S / M / L | §2.1 |
| `risk` | yes | low / med / high | risk of the *fix* (§2.1) |
| `confidence` | yes | 1–5 (higher = surer) | §2.1 |
| `runtime_blast_radius` | yes | `none` / `claude-only` / `multi` / `all-14+` | From the Phase 7 14+-runtime divergence matrix; *reach*, not *risk* |
| `mechanical_vs_instructional` | prompt-corpus findings only | `mechanical` (safe to cut) / `instructional` (load-bearing) / `n/a` | The load-bearing guard (§3.5) |
| `recommendation` | yes | imperative, plan-only — *what a maintainer would do*; never executed here | For instructional items: a relocate/restructure/tighten, **never "delete this"** |
| `recall_gate` | instructional items only | named recall / edge-probe / parity harness that must pass before the cut | Required whenever `mechanical_vs_instructional: instructional` |

**Optional / carry-forward fields** (set when meaningful; ignored otherwise):

| Field | When | Values |
|-------|------|--------|
| `priority` | computed at scoring (Phase 17) | `severity × confidence × ease(effort)` (§2.1) |
| `debt_quadrant` | maintainability / correctness debt | `reckless-deliberate` / `reckless-inadvertent` / `prudent-deliberate` / `prudent-inadvertent` (Fowler 2009) |
| `provenance` | M1 fold-ins + escalations | source `QW-*` id and "escalated: <why it exceeded quick-win scope>" (§5) |
| `cross_check` | dead/duplicate findings | the Phase-7 dynamic-indirection / dispatch-table check that cleared the false-positive guard |
| `owner` | at/after Phase 17 | subsystem- or stream-routed role slot |

### 2.3 Worked evidence card

```yaml
- id: F-CORR-03
  problem_type: wrongness
  subsystem: engine            # src/*.cts
  file:line: "src/core.cts:544-551"   # silent fallback on unparseable config; repro C-01
  severity: 5                  # silent wrong default on every runtime's hot path
  effort: S                    # one guarded branch
  risk: high                   # converging to ERROR is a behavior change across 14+ runtimes
  confidence: 5                # file:line + reproduction
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: n/a    # engine code, not prompt corpus
  recommendation: "Warn (or quarantine) on parse failure instead of silently defaulting; the full error-vs-default contract decision is a Phase-13 sweep deliverable."
  recall_gate: n/a
  priority: 25                 # 5 × 5 × ease(S=5) — risk:high carried as a sequencing gate, not in the product
  debt_quadrant: prudent-inadvertent
  provenance: "QW-REL-01 (M1); escalated: the error-vs-silent-default *contract* exceeded quick-win scope (M1 H-01)"
```

---

## 3. Guards, evidence standard, the firewall, and stopping rules

### 3.1 Reflexivity guard — behavior over narration

GSD audits GSD; the system describes its own behavior in prose the audit must not trust at
face value. **Every finding privileges observed behavior over the pipeline's self-
description.** A claim sourced only from a workflow's or agent's *description of what it does*
is not evidence — confirm it against the code path (`src/*.cts`) or a reproduction. Where a
finding *is* about a mismatch between narration and behavior, that mismatch is itself the
finding (and is usually `wrongness` or `human-friction`).

### 3.2 Evidence standard — every finding cited and checkable

**A finding is admissible only if a reviewer can independently re-check it without re-auditing.**
Concretely: a `file:line` against `src/*.cts` (or the `.md` corpus), or a concrete
reproduction (command + observed output). No assertion-only findings; no "it seems / probably
/ I think." Confidence (§2.1) records how sure — but even a low-confidence finding carries a
checkable pointer. This is the same bar M1 held (`STREAMS.md` shared success bar #5) and the
reason the team can execute the roadmap without re-deriving it.

> External (AI-Gap / best-practice) claims carry the *stricter* bar: a **WebFetched, verified
> primary source**, checked against the source text — this project has hit inverted-citation
> failures where a researcher misrepresented a source (see MEMORY: "Verify research-agent
> citations"). First-party experiments outrank preprints.

### 3.3 Fresh-pass / anti-anchoring — **the firewall** (hard boundary)

The audit is a **fresh, independent re-derivation** from live code. To keep it objective and
turn prior work into a *validation oracle* rather than an *anchor*, the following prior
artifacts are **NOT opened** during any fresh-analysis phase (1–15):

- `.planning/codebase/*` (the prior subsystem map)
- `.planning/notes/*-2026-06-05.md` (prior pipeline-delivery audit, frontier-research synthesis)
- any prior audit / frontier-research synthesis

They are opened **for the first time only at Phase 16 (Reconciliation Firewall)**, where
agreements raise confidence and **disagreements become findings in their own right** ("prior
said X, fresh pass found Y"). No fresh finding is silently revised toward the prior;
reconciliation *adds* findings and *adjusts confidence* — it never overwrites the independent
read (RECON-01).

> **Web research is NOT a firewall violation.** Researching established codebase-audit /
> tech-debt / AI-pipeline best practice from external public sources (and the verified
> citations in §6) is explicitly permitted (D-07). The firewall is about *this project's prior
> internal artifacts*, not about external method literature.

### 3.4 Audit stopping rules — when a sweep is "done enough"

A plan-only audit can sweep forever; these rules say when a concern sweep stops, so phases
terminate on a defensible bar rather than exhaustion:

1. **Coverage bar met.** The sweep's subsystem(s) have each been read at the boundary level
   from the Phase 8 map — no in-scope subsystem is entirely un-examined.
2. **Saturation.** New reading is yielding mostly duplicates of findings already carded (the
   marginal new-finding rate has dropped off) — keep going only on the hotspot files (Phase 8
   churn × complexity ranking), not the whole tail.
3. **Severity floor.** Below a per-sweep severity floor, findings are *noted in aggregate*
   (e.g. "12 minor `n/a`-default messages") rather than carded one-by-one — the roadmap needs
   the pattern, not 12 cards.
4. **Evidence ceiling.** If confirming a finding to the evidence standard (§3.2) would require
   work beyond the sweep's scope (e.g. a full per-runtime reproduction across 14+ runtimes),
   **card it at the confidence it has reached and flag the residual** as a follow-up — do not
   block the sweep on one expensive confirmation.
5. **Scope handoff.** A concern larger than the sweep (systemic, cross-subsystem, contract-
   level) is **carded as a finding and explicitly handed to the owning sweep / Phase 17**, not
   force-fit — exactly as M1 handed oversized concerns to M2 (`QUICK-WIN-BACKLOG.md`
   "Handed off to Milestone 2").

### 3.5 The load-bearing guard (carried forward verbatim from M1, non-negotiable)

For any **prompt-corpus** finding, `mechanical_vs_instructional` MUST be set:

- **mechanical** = formatting, dead boilerplate, verbatim-duplicated reference text → safe to
  cut after a verbatim-duplicate confirmation.
- **instructional** = load-bearing instruction that shapes model behavior → tag it
  **EXECUTION-RISK**, phrase the recommendation as a relocate/restructure/tighten (**never
  "delete this"**), and `recall_gate` MUST name the recall / edge-probe / parity harness that
  gates the change. *"Verifier reach = spec reach"* — cutting load-bearing instruction is the
  worst-timed failure mode, and the deep sweep is held to the same guard as the fast-track.

---

## 4. The `docs/audit/comprehensive/` subtree + `FINDINGS.md` register (D-01)

Milestone 2's deliverable home is `docs/audit/comprehensive/`. The full subtree is defined
here so **every later phase knows exactly where to write**:

```
docs/audit/comprehensive/
├── AUDIT-CHARTER.md          # THIS FILE — the locked gate (Phase 6, METHOD-01)
├── FINDINGS.md               # the SHARED REGISTER — every concern sweep appends evidence-cards here (§2.2)
├── instrumentation/          # Phase 7: analyzer configs (knip, madge, dep-cruiser, jscpd, complexity, gpt-tokenizer)
├── map/                      # Phase 8: repo inventory, subsystem boundaries, hotspots
│   └── subsystems/           # Phase 9: one reviewer-facing doc per subsystem (DOC-01)
├── evidence/                 # Phases 10–11: raw static + behavioral/usage evidence the sweeps cite
├── concerns/                 # Phases 12–15: the per-lens sweep write-ups
│   ├── bloat.md              # Phase 12 (BLOAT-01..04)
│   ├── maintainability.md    # Phase 12 (change-cost lens)
│   ├── pipeline-correctness.md   # Phase 13 (CORR-01)
│   ├── ai-llm-gaps.md        # Phase 14 (AI-01)
│   └── ux.md                 # Phase 15 (UX-01)
├── RECONCILIATION.md         # Phase 16: the firewall delta (priors opened here for the first time)
└── IMPROVEMENT-ROADMAP.md    # Phase 17: the scored hybrid matrix (ROADMAP-01/02)
```

**`FINDINGS.md` is the single shared register.** Each concern sweep (12–15) **appends** its
evidence-cards (§2.2 schema) to `FINDINGS.md` — the `concerns/*.md` files are the *narrative*
write-ups; `FINDINGS.md` is the *structured, scorable* list. Phase 17 scores the register and
projects three **views** over it (the hybrid-matrix `IMPROVEMENT-ROADMAP.md`, the per-subsystem
docs, and the tracking surface). There is **one source of truth** (the register); everything
else is a view, so the roadmap and the board cannot drift (the same single-source model M1
used for `QUICK-WIN-BACKLOG.md` → tracking board).

---

## 5. How the Milestone-1 quick-wins feed forward (D-06)

The M1 quick-win backlog (`docs/audit/QUICK-WIN-BACKLOG.md`, 20 ICE-sized items + handoffs) is
an **input** to the deep sweeps, **never a substitute for re-deriving findings.**

1. **Inputs, not conclusions.** A sweep treats M1 items as *leads to re-confirm against live
   code*, not as pre-accepted findings. The fresh pass re-derives; if it independently lands on
   the same place, the M1 item folds in carrying `provenance: QW-*` and gains confidence.
2. **Escalate what exceeded quick-win scope.** M1 explicitly **handed off** oversized concerns
   (`QUICK-WIN-BACKLOG.md` "Handed off to Milestone 2" — H-01..H-04 → Phase 13; the deep IA /
   count-source-of-truth handoffs → Phase 15; eager-vs-lazy byte refinement + full surface
   tiering → Phase 12). The owning sweep **picks these up and resolves them into full
   evidence-cards** at the deep evidence standard.
3. **Fold in, don't merely repeat.** Phases 12 and 15 must *fold in* the M1 token / UX
   quick-wins (Phase-12 SC-5, Phase-15 SC-4) — re-rank them on the unified §2 scheme and
   absorb them into `FINDINGS.md`, not duplicate them as a separate untracked list. Phase 17
   then renders the M1 backlog as the roadmap's *already-actioned / in-flight quick-wins tier*
   so the two views do not drift (Phase-17 SC-3).
4. **Schema continuity guarantees no re-scoring.** Because the §3 mapping preserves M1 field
   names and ICE direction, an M1 item folds into the comprehensive roadmap **without being
   re-scored** (`BACKLOG-SCHEMA.md` §"Relationship to the Milestone-2 charter": the deep schema
   is a superset). M1 `Impact`→`Severity`, M1 `Ease`→`effort` (inverted t-shirt), M1
   `Confidence`→`Confidence` (unchanged), M1 `severity`(reliability)→informs `Severity`.

---

## 6. Schema mapping — M1 `BACKLOG-SCHEMA.md` ↔ M2 evidence card (D-03)

The deep evidence card is a **superset** of the M1 quick-win schema. M1 and M2 items rank on
**one axis** because the field names and ICE direction are preserved. Mapping:

| M1 field (`BACKLOG-SCHEMA.md`) | M2 evidence-card field (§2.2) | Relationship |
|--------------------------------|-------------------------------|--------------|
| `id` (`QW-<STREAM>-NN`) | `id` (`F-<TYPE>-NN`) + `provenance` | M1 id preserved as provenance; not renumbered |
| `impact` (1–5) | `severity` (1–5) | **Re-pointed, same scale/direction.** M1 "Impact" = how much it improves; M2 "Severity" = how bad if left. Same 1–5, higher = more important to action. |
| `ease` (1–5) | `effort` (S/M/L) + computed `ease` | Same axis; M2 surfaces the t-shirt as the stored field and recovers `ease` (S→5/M→3/L→1) for the product. M1 already pairs a t-shirt with Ease. |
| `confidence` (1–5) | `confidence` (1–5) | **Unchanged.** |
| `ice` (= impact×confidence×ease) | `priority` (= severity×confidence×ease) | **Same formula, same direction** (higher = better candidate). M1 `ice` == M2 `priority` when severity=impact. |
| `tshirt` (S/M/L) | `effort` (S/M/L) | M1's t-shirt *is* the M2 `effort` field, promoted to first-class. |
| `product` (UX/Token/Reliability) | `problem_type` (5-type MECE) | M1's 3 streams widen to the 5-type axis: Token→`waste`, Reliability→`wrongness`, UX→`human-friction`; M2 adds `external-gap` + `change-cost`. |
| `runtime_blast_radius` | `runtime_blast_radius` | **Unchanged** (`none`/`claude-only`/`multi`/`all-14+`). |
| `mechanical_vs_instructional` | `mechanical_vs_instructional` | **Unchanged** (load-bearing guard, §3.5). |
| `severity` (reliability only, low/med/high) | `risk` (low/med/high) **and** informs `severity` | M1's reliability "severity" (how bad the defect) informs M2 `Severity` (1–5); M2 adds a distinct `risk` = risk of the *fix*. |
| `citation` (`file:line`/repro) | `file:line` | **Unchanged**; the `src/`-not-`.cjs` rule (§0) is now explicit. |
| `recall_gate` | `recall_gate` | **Unchanged.** |
| `plan_only: true` | (charter-level invariant) | The whole audit is plan-only; not repeated per card. |
| — (new) | `subsystem` | **Added** — the matrix's secondary axis. |
| — (new) | `recommendation` | **Added** — the plan-only "what to do". |
| — (new) | `debt_quadrant` (optional) | **Added** — Fowler annotation for debt findings. |

**Net:** the deep card adds `problem_type` (widened), `subsystem`, `recommendation`, a distinct
`risk`, and an optional `debt_quadrant`; everything else is the M1 schema unchanged. An M1 row
becomes an M2 card by widening `product`→`problem_type`, tagging `subsystem`, adding a
`recommendation`, and (if it was reliability) splitting defect-severity from fix-risk — **no
re-scoring of the ICE product.**

---

## 7. Method-grounding sources (verified this phase — D-07)

External method literature, WebFetched/searched and confirmed against source text before
citing (this project has hit inverted-citation failures; §3.2):

| Concept used | Origin | Source |
|--------------|--------|--------|
| **MECE** problem-type partition (§1) | Barbara Minto, McKinsey, late 1960s — "mutually exclusive and collectively exhaustive" | en.wikipedia.org/wiki/MECE_principle |
| **ICE** sizing (§2) | Sean Ellis (*Hacking Growth*; coined "growth hacking") — Impact × Confidence × Ease | growthmethod.com/ice-framework/ ; productplan.com/glossary/ice-scoring-model |
| **Technical Debt Quadrant** (`debt_quadrant`, §1.1/§2.3) | Martin Fowler, 2009 — deliberate↔inadvertent × reckless↔prudent | martinfowler.com/bliki/TechnicalDebtQuadrant.html |
| **MoSCoW** (prioritization lineage informing the tie-break framing) | DSDM / Dai Clegg — Must/Should/Could/Won't | en.wikipedia.org/wiki/MoSCoW_method |

These are external public method references; opening them is explicitly **not** a firewall
violation (§3.3, D-07).

---

## 8. Charter invariants (the one-line contract for sweep authors)

- Cite `src/*.cts` (or the `.md` corpus / a repro) — **never** `gsd-core/bin/lib/*.cjs`. (§0)
- Classify into **exactly one** of five problem types; break ties Correctness > AI Gap >
  Bloat > Maintainability > UX. (§1)
- Score Severity / Effort / Risk / Confidence; rank by `severity × confidence × ease`. (§2)
- Emit an **evidence card** (§2.2) to `FINDINGS.md`; a finding without a checkable citation is
  not a finding. (§3.2, §4)
- Privilege **behavior over narration**. (§3.1)
- Do **not** open prior internal artifacts before Phase 16 — the **firewall**. (§3.3)
- Prompt-corpus cuts carry `mechanical_vs_instructional`; load-bearing → EXECUTION-RISK +
  named `recall_gate`, **never "delete this."** (§3.5)
- M1 quick-wins are **inputs to re-confirm**, escalated where oversized, folded-in not
  repeated. (§5)
- **Plan-only.** Recommend; do not change the codebase.

---

*Plan-only attestation: Phase 6 created only `docs/audit/comprehensive/AUDIT-CHARTER.md` and the
Phase-6 planning artifacts under `.planning/phases/06-audit-charter-method/`. No `package.json`,
`src/`, `gsd-core/`, `workflows/`, `agents/`, `commands/`, `bin/`, or `.gitignore` was edited;
no git commit, no GitHub write. The firewall (`.planning/codebase/*`,
`.planning/notes/*-2026-06-05.md`, frontier synthesis) was honored — only `docs/audit/*` M1
deliverables, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, the Phase-6 CONTEXT, ADR-457,
and verified external method sources were opened.*
