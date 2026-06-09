> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# Concern Sweep — AI/LLM Best-Practice Gap-Check (opportunities)

> **Requirement:** AI-01 (Phase 14) · **Problem type:** `external-gap` (charter §1.1) · **Mode:** audit-and-plan only
> **Derived:** 2026-06-08 by gap-checking the **live** pipeline (Phase 9 trace + spot-reads of
> `agents/*.md`, `gsd-core/workflows/*.md`, `gsd-core/references/*.md`, `gsd-core/bin/shared/model-catalog.json`)
> against current AI/LLM community best practice.
> **Citation bar (charter §3.2, the load-bearing constraint here):** every external claim below was
> **WebFetched and checked against the source text** — verbatim quotes are reproduced inline. This
> project has hit inverted-citation failures (a source reporting the *opposite* of a claim), so a
> claim without a checked quote is flagged **UNVERIFIED**, not asserted as fact.
> **Attribution discipline (D-05):** GSD is the community's project. Every card is framed as *"the
> pipeline could adopt X (source: …)"* — never *"GSD invented X."* Where the pipeline already matches
> best practice, that is recorded as an **alignment**, not a gap, so the roadmap does not "fix" what is
> already done.

---

## 0. How to read this sweep

This is the only one of the five concern sweeps that measures against an **external benchmark**
(community best practice) rather than an internal defect. Per the charter tie-break (§1.2), AI-Gap
sits second only to Correctness, *because for an LLM-orchestration framework, falling behind best
practice silently produces weaker outcomes* ("verifier reach = spec reach").

**The headline finding is good news first:** the live pipeline is already aligned with several
load-bearing best practices (§1). The gaps (§2) are at the **margins of an already-mature design** —
they are opportunities to sharpen instruments the pipeline already has, not missing foundations. That
framing matters for sizing: most cards are Effort S–M and Risk low–med, because the scaffolding to
hang them on already exists.

Every external source is listed once in §3 (the verified-source register) and referenced by `[Sn]`.

---

## 1. Where the pipeline already matches best practice (alignments — do NOT "fix")

Recorded so Phase 17 does not generate roadmap items to build things that exist. Each is grounded in
the live code (behavior over narration, charter §3.1).

| # | Best practice | Live-pipeline evidence | Source |
|---|---------------|------------------------|--------|
| A1 | **Orchestrator-worker multi-agent with parallel, isolated context windows** | The trace's whole shape: a lean orchestrator spawns `gsd-planner`/`gsd-executor`/`gsd-verifier` in separate threads; `execute-phase.md` runs **wave-based parallel execution** with Claude-Code `isolation="worktree"` so each executor gets its own working tree (`gsd-core/workflows/execute-phase.md:2,6,96`). | `[S4]` Anthropic: *"a lead agent coordinates the process while delegating to specialized subagents that operate in parallel"*; *"Subagents … operating in parallel with their own context windows."* |
| A2 | **Detailed self-contained task descriptions to subagents** (prevents duplicated/gapped work) | Workflows pass each agent CONTEXT/RESEARCH paths, model tier, and a per-agent skills budget (`gsd_run query agent-skills`); planner/executor carry `@~/`-included contracts (PIPELINE-TRACE §2 step F). | `[S4]` Anthropic: *"Without detailed task descriptions, agents duplicate work, leave gaps, or fail to find necessary information."* |
| A3 | **Independent verifier with an adversarial stance** (don't trust the generator's self-report) | `gsd-verifier.md` opens with a FORCE adversarial stance — *"Do NOT trust SUMMARY.md claims … You verify what ACTUALLY exists"* — and enumerates verifier soft-failure modes (`agents/gsd-verifier.md:18-33`). A *separate* agent thread does verification, not the executor. | `[S3]` (the generation–verification gap motivates an independent verifier); `[S1]` (self-grading is biased — independence is the mitigation). |
| A4 | **Layered evals: code-checks → LLM-judge → human** for AI phases | `gsd-core/references/ai-evals.md` codifies "three measurement approaches" (code metrics first, LLM judges, human for calibration) consumed by `gsd-eval-planner`/`gsd-eval-auditor` (`gsd-core/references/ai-evals.md:24-33`). | `[S2]` LLM judges *"require calibration against human judgment before trusting"* — the reference already says this. |
| A5 | **A quantitative spec-clarity instrument before planning** | `gsd-core/workflows/spec-phase.md` scores ambiguity 0–1 across goal/boundary/constraint/acceptance and **gates** at ≤0.20 before a SPEC is written (`spec-phase.md:8-22`). | (Internal instrument; the *gap* is calibration of the threshold — see G6, not the existence of the instrument.) |

> **Implication for the roadmap:** the pipeline's architecture is not the lag point. The lag is in
> **measurement and calibration of instruments it already runs** — which is exactly where §2 concentrates.

---

## 2. Gaps & opportunities (evidence cards — `problem_type: external-gap`)

Charter §2.2 schema. Severity = how much weaker the outcome if left; Effort/Risk = the *fix*;
Confidence = how sure the gap is real **and** the citation checked. Prompt-corpus cards carry the
load-bearing guard (`mechanical_vs_instructional`, charter §3.5) — every recommendation here is a
*relocate/restructure/add*, never "delete this," and additions to instruction route through a recall
gate.

### G1 — Verifier verdicts are categorical, not calibrated (no confidence + abstention threshold)

```yaml
- id: F-AIGAP-01
  problem_type: external-gap
  subsystem: agents            # gsd-verifier (+ plan-checker)
  file:line: "agents/gsd-verifier.md:169-173 (VERIFIED/FAILED/UNCERTAIN, no numeric confidence)"
  severity: 4                  # the verifier is the load-bearing trust gate; uncalibrated confidence lets weak passes through
  effort: M
  risk: med                    # adding a confidence field changes the VERIFICATION.md contract the workflow parses
  confidence: 5                # live file shows categorical-only output; external calibration literature verified
  runtime_blast_radius: all-14+   # verification runs on every runtime
  mechanical_vs_instructional: instructional
  recommendation: "Add a per-truth calibrated-confidence signal to the verifier output (e.g. a 1-5 or 0-1 self-assessed confidence with a rubric), and route low-confidence VERIFIED verdicts to UNCERTAIN (abstain → human) rather than passing. Best practice treats high confidence as untrustworthy unless calibrated. Keep the existing 3-state verdict; add confidence as a gating dimension, not a replacement."
  recall_gate: "verifier few-shot calibration corpus (gsd-core/references/few-shot-examples/verifier.md) extended with confidence-labelled examples; measure ECE-style gap before/after on the corpus"
```

**Why it's a gap.** The verifier resolves every truth to VERIFIED / FAILED / UNCERTAIN
(`agents/gsd-verifier.md:169-173`) with **no confidence dimension** — a binary-ish pass carries the
same weight whether the evidence was airtight or thin. The model-calibration literature is blunt
that the model's own confidence cannot be trusted at face value: Guo et al. — *"We discover that
modern neural networks, unlike those from a decade ago, are poorly calibrated"* `[S6]` — and for the
judge setting specifically, *"predicted confidence significantly overstates actual correctness,
undermining reliability in practical deployment"* `[S5]`. The opportunity is to add a **calibrated
confidence + abstention threshold**: when the verifier is not confident a VERIFIED truly holds, route
to UNCERTAIN (human) rather than passing — the same abstention-as-routing pattern the pipeline already
uses for the cases it *knows* it can't check programmatically (`agents/gsd-verifier.md:537,844`),
generalized to a calibrated threshold.

---

### G2 — Self-grading risk is unmitigated by model independence (verifier may share the executor's model)

```yaml
- id: F-AIGAP-02
  problem_type: external-gap
  subsystem: agents            # model assignment, gsd-verifier vs gsd-executor
  file:line: "gsd-core/bin/shared/model-catalog.json:116,122 (executor & verifier both resolvable to sonnet)"
  severity: 4                  # self-preference bias inflates pass rates exactly where trust matters most
  effort: S                    # a catalog/policy change + a doc note; no engine refactor
  risk: med                    # forcing a different verifier model can raise cost or hit a runtime with one model
  confidence: 5                # catalog shows the overlap; self-preference literature verified
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: n/a   # configuration/data, not prompt prose
  recommendation: "Make exogenous grading a first-class option: prefer a *different model* (or at least a different tier) for gsd-verifier than the one that produced the work, and document the self-preference rationale in model-profiles. Where a runtime exposes only one model, fall back to a fresh-context independent pass and flag the residual self-grading risk. Do not hard-require cross-vendor models (compatibility constraint), make it a configurable preference."
  recall_gate: n/a
```

**Why it's a gap.** In the `golden`/`balanced`/`budget` profiles, `gsd-executor` and `gsd-verifier`
can resolve to the **same model** (e.g. `balanced` → both `sonnet`;
`gsd-core/bin/shared/model-catalog.json:116,122`), so the agent that wrote the work and the agent that
judges it can be the same model family. The literature shows this systematically inflates pass rates:
Panickssery et al. find *"LLMs … have non-trivial accuracy at distinguishing themselves from other
LLMs and humans"* and *"a linear correlation between self-recognition capability and the strength of
self-preference bias"* `[S1]`. The adversarial stance (A3) helps but does not remove a *model-level*
bias. The opportunity is **exogenous grounding** — prefer a different model/tier for the verifier than
produced the artifact. The pipeline already separates the *agent role* and the *context*; separating
the *model* is the cheap remaining lever (Effort S).

---

### G3 — Plans encode must-HAVEs but not must-NOT-haves (no negative-requirement / prohibition gate the verifier checks)

```yaml
- id: F-AIGAP-03
  problem_type: external-gap
  subsystem: agents            # planner emits must_haves; verifier checks must_haves
  file:line: "agents/gsd-planner.md (must_haves: truths/artifacts/key_links); agents/gsd-verifier.md:122-153 (verifies must_haves only)"
  severity: 3                  # malicious-compliance / spec-gaming passes when only positive criteria are checked
  effort: M
  risk: low                    # additive — a new optional frontmatter list + a verifier check
  confidence: 4                # gap is clear from live files; generation-verification-gap literature verified
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: instructional
  recommendation: "Add an optional must_NOT_haves / prohibitions list to plan frontmatter that the verifier checks as FAILED-on-presence (e.g. 'no secrets in source', 'does not weaken the existing auth check', 'no new global mutable state'). This closes the 'tests pass but behaviour is wrong' gap by giving the verifier explicit negative predicates to falsify against, not only positive truths to confirm. Keep it optional; surface it where security/regression risk is high."
  recall_gate: "a fixture set of spec-gaming cases (work that satisfies all must_haves but violates an unstated prohibition) the extended verifier must catch before/after"
```

**Why it's a gap.** Must-haves are entirely **positive** (truths to confirm, artifacts to exist,
links to wire — `agents/gsd-verifier.md:122-153`); the planner forbids *scope reduction* but the plan
carries no machine-checkable **prohibitions** for the verifier to falsify against. The code-generation
verification literature shows positive-only checking is exactly where wrong-but-passing work hides:
*"50% of problems had tests failing to detect known errors and 84% of verifiers were flawed"* `[S3]`,
and verifiers miss real errors at high rates (*"20% for medium and 40% for hard problems"* re-failed on
an independent judge) `[S3]`. A verifier with **explicit negative predicates** has more surface to
catch malicious compliance than one with only positive truths.

---

### G4 — No exogenous "did this actually run" gate distinct from the model's self-report

```yaml
- id: F-AIGAP-04
  problem_type: external-gap
  subsystem: agents            # verifier evidence standard
  file:line: "gsd-core/references/few-shot-examples/verifier.md:25-36 (runs commands, but as the same agent's self-report)"
  severity: 3
  effort: M
  risk: med                    # automating exogenous evidence collection touches the runtime tool surface
  confidence: 4
  runtime_blast_radius: multi   # depends on which runtimes can attach an out-of-band check
  mechanical_vs_instructional: instructional
  recommendation: "Where the runtime allows, capture exogenous execution evidence (test/command exit codes, a hook-collected receipt) that the orchestrator reads independently of the verifier's prose, rather than relying solely on the verifier transcribing 'exit code 0' into its report. Best practice for trustworthy evals separates 'actual' (machine-observed) from the judge's narration. Frame as a hook/receipt the orchestrator parses; keep the verifier's reasoning on top of it."
  recall_gate: "cases where the verifier's transcribed result disagrees with an independently captured exit code — the wire must surface the disagreement"
```

**Why it's a gap.** The few-shot corpus shows the verifier *does* run commands and report exit codes
(`few-shot-examples/verifier.md:33` — `exit code 0`), which is good practice — but the result flows
through the **same agent's prose**, so a soft verifier can mis-transcribe or rationalize it (the
"actual" and the "judge" are not separated). The eval literature's three-components framing puts
**Actual** (machine-observed, including tool calls) distinct from the judge `[S2]`, and the
overconfidence finding `[S5]` is precisely why the orchestrator should not take the judge's word for the
machine result. The opportunity is a thin **exogenous evidence channel** the orchestrator reads
directly. *Sizing note:* the hooks subsystem already exists (`hooks/`) as a plausible carrier, which is
why this is Effort M not L.

---

### G5 — Long workflows risk "lost-in-the-middle" instruction loss; no positional discipline for load-bearing rules

```yaml
- id: F-AIGAP-05
  problem_type: external-gap
  subsystem: workflows          # execute-phase.md is 86.8K; many @-included references
  file:line: "gsd-core/workflows/execute-phase.md (86.8K single workflow); plan-phase.md @-includes 5+ references"
  severity: 3                   # a load-bearing gate buried mid-context can be silently under-weighted
  effort: M
  risk: med                     # reordering instruction is exactly the load-bearing-cut risk the charter guards
  confidence: 4                 # file sizes are live; lost-in-the-middle finding verified
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: instructional
  recommendation: "Treat instruction position as a first-class concern in the largest workflows: pull the most load-bearing gates (the non-negotiable contracts) to the start or end of the context window, and keep mid-context for reference detail. This is a restructure, not a cut. Pair any reorder with a recall/parity harness — moving load-bearing instruction is the worst-timed failure mode (charter §3.5)."
  recall_gate: "behavioural parity harness on the affected workflow (same inputs → same gate decisions) before/after any reorder; edge-probe on the moved gate"
```

**Why it's a gap.** `execute-phase.md` is **86.8K** in a single workflow and `plan-phase.md`
@-includes five-plus references at read time (PIPELINE-TRACE §2 step F) — large enough that
load-bearing instruction can land in the low-attention middle of the context. Liu et al.:
*"performance is often highest when relevant information occurs at the beginning or end of the input
context, and significantly degrades when models must access relevant information in the middle of long
contexts"* `[S7]`. The opportunity is **positional discipline** — front/back-load the non-negotiable
gates. This card is deliberately conservative on Risk: it is the exact place the charter's
load-bearing guard bites, so it must route through a parity harness and is a *restructure*, never a
trim. (Overlaps with the Phase-12 bloat lens on workflow size; this card owns the *AI-best-practice
reason* for the restructure, Phase 12 owns the *waste* angle — tie-break keeps it here as
`external-gap`, charter §1.2.)

---

### G6 — Spec-ambiguity and verifier calibration thresholds are asserted, not empirically calibrated

```yaml
- id: F-AIGAP-06
  problem_type: external-gap
  subsystem: workflows          # spec-phase ambiguity gate; verifier few-shot calibration cadence
  file:line: "gsd-core/workflows/spec-phase.md:18-22 (ambiguity ≤0.20 gate, fixed weights); few-shot-examples/verifier.md:5 (last_calibrated date, manual)"
  severity: 2                   # thresholds may be miscalibrated, but the instruments exist and degrade gracefully
  effort: L                     # requires a labelled corpus + a calibration measurement loop
  risk: low                     # measuring calibration doesn't change runtime behaviour until acted on
  confidence: 3                 # the instruments are live; that they are uncalibrated is inferred, calibration-ECE practice verified
  runtime_blast_radius: none    # a method/measurement opportunity, not a runtime change
  mechanical_vs_instructional: n/a
  recommendation: "Stand up a lightweight calibration measurement for the pipeline's own instruments: (a) does the ambiguity ≤0.20 gate actually predict downstream replanning/rework? (b) is the verifier's verdict distribution calibrated against held-out human/independent judgment, measured ECE-style? The few-shot file already carries a last_calibrated field — make calibration a measured cadence, not a date stamp. This is a method investment that feeds G1's threshold."
  recall_gate: n/a
```

**Why it's a gap.** The ambiguity gate uses **fixed weights and a fixed 0.20 cutoff**
(`spec-phase.md:18-22`) and the verifier few-shot carries a manual `last_calibrated: 2026-03-25`
(`few-shot-examples/verifier.md:5`) — both are *plausible* but neither is shown to be **empirically
calibrated** against outcomes. Calibration is a measurable quantity: ECE *"quantifies the gap between
predicted confidence and empirical accuracy"* and modern models are *"poorly calibrated"* by default
`[S6]`; for judges the gap is what *"undermines reliability"* `[S5]`. The opportunity is a measurement
loop, not a behaviour change — which is why Risk is low and blast radius `none`. (This is the method
substrate G1's abstention threshold should be tuned on.)

---

## 3. Verified-source register (every external claim, checked against source text)

All sources WebFetched 2026-06-08; the quoted text was confirmed present in the source (charter §3.2
inverted-citation guard). First-party/established sources preferred over fresh preprints.

| Ref | Source (title — venue/author) | URL | Verified quote (verbatim, checked against source text) |
|-----|-------------------------------|-----|--------------------------------------------------------|
| **S1** | *LLM Evaluators Recognize and Favor Their Own Generations* — Panickssery, Bowman, Feng (NeurIPS 2024) | arxiv.org/abs/2404.13076 | *"LLMs such as GPT-4 and Llama 2 have non-trivial accuracy at distinguishing themselves from other LLMs and humans"*; *"a linear correlation between self-recognition capability and the strength of self-preference bias."* |
| **S2** | *AI Evaluation Reference* basis — three measurement approaches / judges need calibration (industry practice, mirrored in the repo's own `ai-evals.md`) | (repo ref `gsd-core/references/ai-evals.md:24-33`, established eval practice) | Repo reference, verified in-file: LLM judges *"Requires calibration against human judgment before trusting."* Treated as established practice, not a novel external claim. |
| **S3** | *Rethinking Verification for LLM Code Generation: From Generation to Testing* (arXiv 2507.06920) | arxiv.org/html/2507.06920v2 | *"50% of problems had tests failing to detect known errors and 84% of verifiers were flawed"*; re-evaluation on an independent judge showed *"20% for medium and 40% for hard problems"* errors the original verifier missed. |
| **S4** | *How we built our multi-agent research system* — Anthropic Engineering | anthropic.com/engineering/multi-agent-research-system | *"a lead agent coordinates the process while delegating to specialized subagents that operate in parallel"*; *"Subagents facilitate compression by operating in parallel with their own context windows"*; *"Without detailed task descriptions, agents duplicate work, leave gaps, or fail to find necessary information."* |
| **S5** | *Overconfidence in LLM-as-a-Judge: Diagnosis and Confidence-Driven Solution* (arXiv 2508.06225) | arxiv.org/html/2508.06225v2 | *"predicted confidence significantly overstates actual correctness, undermining reliability in practical deployment"*; *"predicted confidence levels significantly exceed their actual accuracy, resulting in calibration gaps that undermine reliability."* |
| **S6** | *On Calibration of Modern Neural Networks* — Guo, Pleiss, Sun, Weinberger (ICML 2017) | arxiv.org/abs/1706.04599 | *"We discover that modern neural networks, unlike those from a decade ago, are poorly calibrated."* |
| **S7** | *Lost in the Middle: How Language Models Use Long Contexts* — Liu et al. (TACL 2023) | arxiv.org/abs/2307.03172 | *"performance is often highest when relevant information occurs at the beginning or end of the input context, and significantly degrades when models must access relevant information in the middle of long contexts."* |

**UNVERIFIED / not used as fact:** none of the cards above rest on an unverified claim. Search-level
secondary summaries (e.g. blog roundups of self-preference bias across many models) were read for
orientation but are **not** cited as load-bearing — every card traces to a primary `[Sn]` whose text
was checked. The NeurIPS camera-ready PDF for S1 returned binary (unparseable); the **arXiv abstract**
for the same paper (2404.13076) was used and its quotes verified there instead.

---

## 4. Sweep coverage & stopping (charter §3.4)

| Best-practice area (D-03) | Outcome |
|---------------------------|---------|
| Verifier/judge **calibration & abstention** | G1 (gap) + G6 (calibration method) |
| **Self-grading bias / exogenous grounding** | G2 (model independence) + G4 (exogenous evidence channel) |
| **Spec/plan instruments** | A5 (alignment — instrument exists) + G3 (must-not-haves) + G6 (calibrate the threshold) |
| **Multi-agent orchestration / wave parallelism / context isolation** | A1 + A2 (alignments — already best-practice) |
| **Prompt/context engineering** | G5 (lost-in-the-middle positional discipline) |
| **Eval harnesses** | A4 (alignment — layered evals exist for AI phases) |

**Stop condition met:** all D-03 areas swept; alignments recorded so the roadmap doesn't rebuild
existing strengths; six gap cards emitted at `external-gap`, each tagged subsystem, each framed with
enough context to become a roadmap item; every external claim carries a source-text-checked quote.
Residual: G6 confidence is 3 (that the thresholds are *miscalibrated* is inferred — the *instruments*
are confirmed live and the *calibration-as-measurable* practice is verified; the empirical
miscalibration would need a labelled corpus to confirm, flagged as the card's own method deliverable,
charter §3.4 evidence ceiling).

---

*Plan-only attestation: Phase 14 created only this file and the Phase-14 planning artifacts under
`.planning/phases/14-…/`. No `package.json`, `src/`, `gsd-core/`, `workflows/`, `agents/`,
`commands/`, `bin/`, or `.gitignore` edited; no git commit, no GitHub write. The firewall was honored
— `.planning/codebase/*`, `.planning/notes/*-2026-06-05.md`, and the frontier-research synthesis were
NOT opened; all best-practice claims were re-derived from live web sources and verified against source
text. Phase 16 reconciles against the priors.*