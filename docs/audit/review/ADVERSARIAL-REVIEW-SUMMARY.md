# Adversarial Review — Synthesis & Remediation Summary

**Date:** 2026-06-08
**Milestone:** Newcomer-Readiness Fast-Track (Milestone 1) — plan-only audit
**Inputs:** [`ADVERSARIAL-EVIDENCE.md`](ADVERSARIAL-EVIDENCE.md) (evidence/factual-integrity +
load-bearing guard + firewall) · [`ADVERSARIAL-PROCESS.md`](ADVERSARIAL-PROCESS.md)
(verification honesty + requirements coverage + schema + counts + missed concerns)
**Posture of both reviews:** hostile red-team — falsify, don't confirm.

This one-pager synthesizes both red-team reports, records what was fixed (with before/after for
the two material items), states what survived hostile review, lists the residual deferred items,
and gives an overall trustworthiness verdict for maintainers.

---

## Findings by severity (both reports merged)

| Sev | ID | Finding | Disposition |
|-----|----|---------|-------------|
| **MAJOR / BLOCKER (for that item)** | Evidence F5 | **QW-TOK-02 mislabeled `mechanical`** on a false "verbatim-identical in 8 agents" premise. The `<documentation_lookup>` blocks are **4 distinct variants**; 3 carry a supply-chain security guard. | **FIXED** — re-tagged load-bearing/EXECUTION-RISK + named parity gate. |
| **HIGH** | Process H-1 | **Node-version contradiction:** docs bless Node 18+ while `package.json` requires ≥22; no installer guard. First-run landmine. | **FIXED** — added as **QW-REL-05** (ICE 100, Start-Here #2). |
| **MEDIUM** | Process VIEW-01 | **VIEW-01 "stood up" overstated** — board never created; status label outran the disclosure. | **FIXED** — relabeled *chosen + stand-up-ready; board creation DEFERRED*. |
| **LOW** | Process L-1 | **QW-UX-03 under-scoped** — same `--help` block also has stale "core — 7" (actual 8) and "standard — ~13" (actual 14). | **FIXED** — QW-UX-03 widened to all three counts. |
| **MINOR** | Evidence F9 | QW-TOK-08 "across wrappers / sweep peers" framing overstated (banner is single-file). | Non-blocking; folded item, harmless. Noted, not re-worked. |
| **MINOR** | Evidence F16 | Usage signal user-message count drifted 571 → 577 (live-transcript growth). | Immaterial; ranked tables identical. Deferred. |
| **LOW** | Process L-2 | No non-interactive/no-flag install probe. | Correctly handed to Phase 13. |
| **OK / CONFIRMED** | F1–F4, F6–F8, F10–F15, F17 | Both reliability bugs, all UX drift numbers, all token totals, profile base sets, citations — reproduced exactly. | No action. |

**Tally:** 1 MAJOR (fixed), 1 HIGH (fixed), 1 MEDIUM (fixed), 1 LOW (fixed), 2 MINOR (deferred,
immaterial), 1 LOW (correctly pre-deferred), 14+ OK/CONFIRMED.

---

## What was fixed — before / after

### FIX 1 (BLOCKER) — QW-TOK-02 re-tag (self-verified before re-tagging)

Re-verified live (read-only `grep` + `md5sum` + `diff` over `agents/*.md`):

- 8 agents carry `<documentation_lookup>`; **md5 yields 4 distinct variants** (not 1): the 5
  researcher agents share one hash; `gsd-phase-researcher`, `gsd-executor`, `gsd-planner` each
  differ.
- The 5 researchers instruct `npx --yes ctx7@latest …` (auto-downloads + executes the package).
- The 3 shell-executing agents instead use a `command -v ctx7` guard **and** the explicit warning
  *"Do NOT use `npx --yes` … silently executes unverified packages from the registry."*

| | Before | After |
|--|--------|-------|
| `mechanical_vs_instructional` | `mechanical` ("verbatim-duplicated reference text, no per-agent variation") | **`instructional` / EXECUTION-RISK** |
| citation | "identical block in 8 agents (grep -l → 8)" | "8 agents, **4 distinct md5 variants**; 3 carry a `command -v ctx7` supply-chain guard + 'Do NOT use `npx --yes`' warning" |
| `recall_gate` | `n/a` | **ctx7-guard parity harness** — md5/diff all 8 blocks before & after; executor/planner/phase-researcher MUST retain the guard + warning; collapsing to the `npx --yes` form is a blocker |
| posture | "factor into one include … safe to cut/factor" | factor-out that **preserves the safe `command -v` + warning variant**, never collapses to `npx --yes` |

Counts updated: token-stream split now **4 mechanical / 4 load-bearing**; backlog load-bearing
header now **5** (adds QW-TOK-02); the blanket "all other prompt-corpus items are mechanical"
line drops -02.

### FIX 2 (HIGH) — new item QW-REL-05 (Node-version contradiction)

Verified live (read-only): `package.json` `engines.node = ">=22.0.0"`; docs bless "Node 18+" at
`docs/how-to/install-on-your-runtime.md:5` and `docs/tutorials/your-first-project.md:15` (+ the
4 translations → ~15 files); **no** `process.version` guard in `bin/install.js`; **no** `.npmrc`
`engine-strict` (npm only warns `EBADENGINE`).

Added as **QW-REL-05** — ICE 100 (I5 × C5 × E4), severity **high**, blast `all-14+` (doc half
`none`), Reliability + UX co-lens, `plan_only: true`. Landed in the backlog (sorted table, YAML,
owner routing → 5, dedup ledger) and in `streams/reliability-stream.md` (concern **C-05** +
YAML + evidence index + severity tally → 2 high). Backlog total **19 → 20**; Start-Here shortlist
re-ranked with QW-REL-05 at **#2** (high ICE, half ships at `blast: none`, textbook spotlight-eve
first-touch failure).

### FIX 3 (MED) — VIEW-01 relabel

`docs/audit/TRACKING-SURFACE.md`, the backlog Publication section, and both
`01-VERIFICATION.md` / `05-VERIFICATION.md` now state **chosen + stand-up-ready; board creation
DEFERRED to a maintainer** (commands provided, not executed; no board exists). Phase status kept
`passed` (the readiness artifact genuinely satisfies the plan-only interpretation), but the label
no longer outruns the disclosure.

### FIX 4 (LOW) — QW-UX-03 widened

Verified live: `src/install-profiles.cts:28-37` core array = **8** (help says 7);
`:38-56` standard array = **14** (help says ~13). QW-UX-03 now fixes all three counts
(`66`→67, core `7`→8, standard `~13`→14) in `bin/install.js:686`, with a note to derive them
programmatically. Updated in `streams/ux-stream.md` (F-04 + YAML) and the backlog.

---

## What held up under hostile review

- **Firewall: CLEAN.** Every figure is derivable from non-firewalled sources (live `bin/install.js`
  strings, `src/install-profiles.cts` comments, the committed `tokenize.mjs` / `usage-extract.mjs`).
  No `.planning/codebase/*`, `*-2026-06-05.md`, or frontier-synthesis content leaked.
- **Repros confirmed end-to-end.** Both reliability bugs (silent config-default C-01, empty-slug
  C-02) reproduce; drift `message:''` (C-04) confirmed; exit-code divergence (C-03) confirmed.
- **Token/usage figures reproduce exactly** (178,999 / 449,485 / 628,484; 100 + 173 files; ranked
  usage tables identical).
- **Schema conformance: clean** — every item carries the required fields; ICE products re-verified.
- **Count reconciliation: honest** — 20 numbered stream items → 19, one fold (TOK-08→TOK-05), zero
  silent drops; the +1 (QW-REL-05) is the only net-new item and is explicitly logged.
- **Load-bearing guard worked on the cases it reasoned about** (TOK-04/-05/-06, UX-08 correctly
  gated) and **failed only where the stream trusted an unverified "verbatim" assertion** (TOK-02)
  — the exact self-grading false-negative the brief predicted, now closed.
- **Anti-inflation discipline genuine** — the reliability stream self-downrated C-03 to LOW and
  handed oversized concerns to Phase 13 rather than padding the fast-track.

## Residual / deferred (non-blocking)

- **LOW** — non-interactive/no-flag install branch → Phase 13 (H-04 / Process L-2).
- **Phase 12** — exact eager-vs-lazy token byte split (current figures are an honest char/4 upper
  bound).
- **MINOR** — usage-signal user-message count 571 → 577 (live-transcript growth; ranked tables
  unaffected; optional re-snap).
- **MINOR** — drop the "across wrappers / sweep peers" framing on the folded QW-TOK-08 (cosmetic).

---

## Overall verdict

**The milestone is now trustworthy for maintainers to act on without re-auditing.** The single
blocking item (QW-TOK-02's supply-chain-relevant mislabel) is corrected with a named parity gate
that explicitly forbids reintroducing `npx --yes`; the one genuine missed first-run landmine
(Node 18 vs ≥22) is now a high-ICE, top-of-shortlist backlog item; the one overstated status
(VIEW-01) is relabeled to match its disclosure; and the under-scoped count fix is widened. Every
correction was re-verified against live source (`src/*.cts` / `package.json` / `agents/*.md`,
read-only) before being written. Everything else survived hostile review — repros, token/usage
figures, schema, counts, and the firewall all held. Backlog total **20**; load-bearing items
**5**, each gated; **0** "delete this" on any load-bearing item.
