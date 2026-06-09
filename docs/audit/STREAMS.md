> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# The Three Quick-Win Streams (Fan-Out Frame)

**Defined:** 2026-06-07
**Decision:** D-15
**Status:** Locked frame for Phases 2–4

The fast-track is organized as **three independent, owner-assignable, concurrently-runnable
streams** so Phases 2–4 fan out to different maintainers without blocking each other. Each
stream produces a stream note + a set of quick-win candidates conforming to
`BACKLOG-SCHEMA.md`. **Phase 5 converges** the three into one deduplicated, published backlog.

> **Owners are roles, not people.** Phase 1 defines the routing frame; actual human owners
> are assigned by the maintainer team at/after Phase 5.

All three streams are **plan-only** and **firewalled** (no prior artifacts opened).

---

## Shared success bar (every item, every stream)

An item is "done" for a stream when it is:

1. **ICE-sized** — Impact × Confidence × Ease, each 1–5 (`BACKLOG-SCHEMA.md`).
2. **Owner-assignable** — routed to a stream/subsystem owner.
3. **Runtime-blast-radius tagged** — `none` / `claude-only` / `multi` / `all-14+`.
4. **Plan-only** — a recommendation a maintainer can pick up, not a shipped change.
5. **Cited** — `file:line` or a concrete reproduction; no assertion-only claims.
6. **(Prompt-corpus items)** carry the `mechanical_vs_instructional` flag; **load-bearing**
   items are tagged EXECUTION-RISK and **name their recall/edge-probe harness gate** — never
   "delete this."

---

## Stream A — UX / Onboarding (Phase 2)

| Aspect | Definition |
|--------|------------|
| **Scope boundary** | The newcomer's first-run path: install → first command → first result. Friction, confusing surface, missing signposts. Surface-reduction is **progressive disclosure**, not deletion. |
| **NOT in scope** | Deep two-audience UX assessment (that is Phase 15); correctness/error behavior (Stream C); token cost (Stream B). |
| **Evidence drawn on** | The Phase 1 **usage signal** (`instrumentation/usage-signal.md`) for which commands newcomers actually reach for; concrete reproductions of install/first-run friction; the command/skill surface. |
| **Owner routing** | UX/onboarding owner; items touching the installer route to the `bin/` subsystem owner. |
| **Stream-specific bar** | Safety/recovery commands are **criticality-exempt** — never cut by low usage. Any newcomer-facing change notes its **power-user impact** so a fast cut does not silently degrade the existing audience. |

## Stream B — Token-Savings (Phase 3)

| Aspect | Definition |
|--------|------------|
| **Scope boundary** | Recurring-context **token tax** (always-included prompt files) vs on-demand files; command/skill/flag surface sprawl that inflates every newcomer invocation. |
| **NOT in scope** | Full-corpus deep bloat sweep + conceptual redundancy (Phase 12); dead/duplicated `src/` code beyond what `knip`/`jscpd` surface here. |
| **Evidence drawn on** | `instrumentation/tokenize.mjs` (per-file token counts, recurring vs on-demand split); `instrumentation/.jscpd.json` duplicate blocks; `instrumentation/knip.json` unused exports; the usage signal for surface-trim candidates. |
| **Owner routing** | Token/prompt-corpus owner; `src/` findings route to the engine owner. |
| **Stream-specific bar** | **Every** prompt-corpus quick-win is explicitly **mechanical (safe to cut)** or **load-bearing instructional density (behavior change)**. Load-bearing items are tagged EXECUTION-RISK and routed to a **named recall/edge-probe harness** — never "delete this." Surface trims are tiered as progressive disclosure, not deletion-by-low-usage. |

## Stream C — Reliability (Phase 4)

| Aspect | Definition |
|--------|------------|
| **Scope boundary** | Newcomer-visible workflow/result-reliability concerns: broken first-run flows, confusing failure modes, swallowed errors on the happy path. |
| **NOT in scope** | The full correctness sweep (Phase 13). Anything too large for a quick-win is **explicitly handed off** to Phase 13 rather than forced into the fast-track. |
| **Evidence drawn on** | **Observed behavior** (reproductions) over the pipeline's self-description (reflexivity guard); `file:line` citations in `src/*.cts` and the workflow/agent corpus. |
| **Owner routing** | Reliability owner; items route to the owning subsystem (engine / installer / workflows). |
| **Stream-specific bar** | Each item carries **severity** (low/med/high). Findings privilege behavior over narration. |

---

## Convergence (Phase 5)

Phase 5 merges and de-duplicates the three stream notes into a single quick-win backlog,
publishes it to the tracking surface (`TRACKING-SURFACE.md`) in the git-tracked home, and
confirms every item meets the shared success bar. No load-bearing-density item is presented
as a safe deletion. The backlog ships ahead of the Mintlify spotlight.