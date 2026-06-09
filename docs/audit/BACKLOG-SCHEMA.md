> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# Quick-Win Backlog Schema (LOCKED)

**Locked date:** 2026-06-07
**Decisions:** D-11, D-12, D-13
**Status:** Canonical. **Phase 6's deep Audit Charter reuses and extends this schema** —
locking it here prevents drift between Milestone-1 quick-wins and Milestone-2 deep findings.

This is the single schema every quick-win item in Streams 2–4 (UX / Token / Reliability) and
the converged Phase 5 backlog conforms to. The tracking surface
(`TRACKING-SURFACE.md`) mirrors these fields.

---

## ICE scoring (D-11)

**ICE = Impact × Confidence × Ease**, each scored **1–5**, **higher = better candidate**.

| Sub-score | 1 (low) | 5 (high) | Meaning |
|-----------|---------|----------|---------|
| **Impact** | barely moves the newcomer experience | large, visible improvement | how much "cleaner and tighter" the win delivers |
| **Confidence** | hunch / single weak signal | strong evidence (usage data + citation) | how sure we are the win is real and safe |
| **Ease** | large, risky, multi-runtime change | tiny, mechanical, isolated change | how cheap/easy to execute (**replaces raw Effort** so the product is monotonic — higher = cheaper) |

> **Why Ease, not Effort.** Raw Effort is inverted (high effort = bad), which flips the axis
> when you take a product. Using **Ease** (high = cheap) keeps all three axes pointed the same
> way, so a higher ICE product unambiguously means a better candidate. ICE ranges **1–125**.

A **t-shirt size (S / M / L)** accompanies Ease for human assignment (S ≈ Ease 4–5, M ≈ 3,
L ≈ 1–2).

## Required fields per item (D-12)

| Field | Required | Values / format |
|-------|----------|-----------------|
| `id` | yes | `QW-<STREAM>-NN` (e.g. `QW-UX-01`, `QW-TOK-03`, `QW-REL-02`) |
| `title` | yes | one-line, imperative |
| `impact` | yes | 1–5 |
| `confidence` | yes | 1–5 |
| `ease` | yes | 1–5 |
| `ice` | yes | computed = impact × confidence × ease |
| `tshirt` | yes | S / M / L |
| `product` | yes | UX / Token / Reliability |
| `owner` | yes | stream- or subsystem-routed (human assigned at/after Phase 5) |
| `runtime_blast_radius` | yes | `none` / `claude-only` / `multi` / `all-14+` |
| `mechanical_vs_instructional` | prompt-corpus items only | `mechanical` (safe to cut) / `instructional` |
| `severity` | reliability items | low / med / high |
| `citation` | yes | `file:line` or a concrete repro |
| `plan_only` | yes | always `true` |
| `recall_gate` | instructional items only | named recall/edge-probe harness that must pass before the cut |

### The load-bearing guard (non-negotiable)

For any **prompt-corpus** item, `mechanical_vs_instructional` must be set:

- **mechanical** = formatting, dead boilerplate, redundant restatement → safe to cut.
- **instructional** = load-bearing instruction that shapes model behavior → tag
  **EXECUTION-RISK**, and `recall_gate` MUST name the recall/edge-probe harness that gates the
  cut. **Never** phrase an instructional item as "delete this." *"Verifier reach = spec reach"* —
  cutting load-bearing instruction right before a traffic spike is the worst-timed failure mode.

## Worked example row

```yaml
- id: QW-TOK-02
  title: "Collapse duplicated 'required reading' preamble shared by 6 workflows into one include"
  impact: 4          # trims recurring-context tax on every workflow invocation
  confidence: 4      # backed by tokenize.mjs figures + jscpd duplicate block
  ease: 3            # touches 6 files but mechanical; multi-runtime so verify install
  ice: 48            # 4 × 4 × 3
  tshirt: M
  product: Token
  owner: token-stream
  runtime_blast_radius: all-14+    # workflows ship to every runtime payload
  mechanical_vs_instructional: mechanical   # pure restatement, no behavior change
  severity: n/a
  citation: "gsd-core/workflows/plan-phase.md:12-31 (+5 peers, jscpd clone group #4)"
  plan_only: true
  recall_gate: n/a                  # mechanical → no recall gate needed
```

## Blank template

```yaml
- id: QW-<STREAM>-NN
  title: ""
  impact:            # 1-5
  confidence:        # 1-5
  ease:              # 1-5
  ice:               # impact × confidence × ease
  tshirt:            # S / M / L
  product:           # UX / Token / Reliability
  owner:             # stream- or subsystem-routed
  runtime_blast_radius:        # none / claude-only / multi / all-14+
  mechanical_vs_instructional: # mechanical / instructional (prompt-corpus only) | n/a
  severity:          # low / med / high (reliability only) | n/a
  citation:          # file:line or repro
  plan_only: true
  recall_gate:       # named harness (instructional only) | n/a
```

## Relationship to the Milestone-2 charter

Phase 6 (Audit Charter & Method) extends this schema with the deep-finding additions:
`problem_type` (waste / wrongness / external-gap / human-friction / change-cost),
`subsystem` tag, and the Severity/Effort/Risk/Confidence sizing scheme. The **field names
and ICE direction defined here are preserved** — the deep schema is a superset, so quick-win
items fold into the comprehensive roadmap without re-scoring.