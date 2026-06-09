> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# Adversarial Process Review — Milestone 1 (Newcomer Readiness Fast-Track)

**Reviewer role:** hostile red-team. Goal = falsify the producing agents' "passed / no gaps"
self-reports, not confirm them.
**Date:** 2026-06-07
**Scope:** verification honesty · requirements/criteria coverage · schema conformance · count
reconciliation · internal consistency · **missed newcomer concerns**.
**Constraint honored:** read-only; only this file under `docs/audit/review/` was created. No
deliverable/source/config edited, no commits, no GitHub, firewall respected (no
`.planning/codebase/*`, no `*-2026-06-05.md` notes, no frontier synthesis opened).

---

## Bottom line

The milestone is **substantially honest and largely complete**. The verifications are *not*
rubber stamps — they re-derived counts, ran the instrumentation, and recorded honest negative
probes. Schema conformance is clean. Count reconciliation is honest (no silent drops). The
**one must-fix gap** is a genuine first-run newcomer landmine the streams missed:
**the docs bless Node 18+ while the package requires Node ≥22**, with **no version guard in the
installer**. The **VIEW-01 "stood up" claim is OVERSTATED** (documented commands, board never
created) — defensible under the plan-only constraint, but the requirement word "stood up" is not
literally satisfied and should be labeled DEFERRED, not PASSED, for maintainer honesty.

Findings: **1 high** (missed Node-version contradiction), **1 medium** (VIEW-01 overstated),
**3 low** (incomplete stale-count sweep; two minor missed first-run concerns). No fabricated or
load-bearing-unsafe items found. No silent count drops.

---

## 1. Per-phase verification honesty

ROADMAP success criteria checked against actual deliverable content, not the verification's own
say-so.

| Phase | Criteria | Met | Verdict | Notes |
|------|---------:|----:|---------|-------|
| **1 — Fast-Track Setup** | 5 | 4 fully + 1 overstated | **PASS w/ caveat** | SC1/2/3/5 genuinely earned (instrumentation files exist, two scripts actually executed, schema locked, streams defined). **SC4 (VIEW-01 "stood up") is OVERSTATED** — board not created; see Requirements table. |
| **2 — UX stream** | 4 | 4 | **PASS** | F-01..F-07 each carry `file:line`/grep evidence; spot-checked F-04 (`bin/install.js:686` "66 skills" vs live 67) and F-06 (tutorial "86 skills" / "GSD Core ready") — both real. Progressive-disclosure framing honored; no command cut by low usage. Honest false-positive exclusion (colon-form slash refs) recorded. |
| **3 — Token stream** | 4 | 4 | **PASS** | `tokenize.mjs` actually run (figures reproducible); load-bearing guard applied to every prompt-corpus item; 3 instructional items each name a concrete recall gate; char/4 caveat stated up front, not buried. |
| **4 — Reliability stream** | 4 | 4 | **PASS (strongest)** | Behavior-over-narration genuinely practiced: C-01/C-02 found *by reproduction*, not from the probe list; honest negative probes recorded (empty-catch, no-throw hub, installer catch all cleared). C-03 self-deprioritized to LOW so Phase 5 "doesn't over-rate it" — anti-inflation, the opposite of rubber-stamping. 4 oversized concerns handed to Phase 13, not jammed in. |
| **5 — Convergence** | 5 | 5 | **PASS** | Counts re-derived by grep, not asserted; dedup ledger traceable; SC4 (publication) honestly scoped as "the Markdown IS the publication; board is a view" under no-GitHub-writes. Same VIEW-01 caveat as Phase 1 applies but is correctly *inherited*, not re-overstated. |

**Honesty verdict:** verifications are earned, not rubber-stamped. The reliability verification
in particular shows the reflexivity guard working (negative probes, self-downrating). The single
systemic overstatement is VIEW-01's "stood up," shared by Phase 1 and Phase 5.

---

## 2. Requirements satisfaction (M1 terminal requirements)

| Req | Claim | Verdict | Evidence / judgment |
|-----|-------|---------|---------------------|
| **QWIN-02** (light instrumentation + evidence pass) | satisfied | **SATISFIED** | `docs/audit/instrumentation/` has `knip.json`, `tokenize.mjs`, `usage-extract.mjs`, `usage-signal.md`; two scripts executed with real output; `src/*.cts`-targeted, never compiled `.cjs`; single-author caveat stated. Evidence underpins the backlog credibly. |
| **DELIV-01** (git-tracked home resolved) | satisfied | **SATISFIED** | `DELIV-HOME.md` resolves `docs/audit/` as the git-tracked home, keeps `.planning/` gitignored (respects framework `commit_docs:false`), names the `fork`/branch target. Decision is sound and complete. Deliverables genuinely live there. |
| **VIEW-01** (surface chosen AND "stood up") | satisfied | **OVERSTATED → should be PARTIAL/DEFERRED** | **Chosen: yes** (Projects v2 primary, Issues+Labels+Milestones fallback, fields mirror schema). **"Stood up": NO.** `TRACKING-SURFACE.md:42` heading is literally *"EXACT stand-up commands (write-down only — DO NOT RUN)"*; `:118-119` confirms "does not run any of them, create any project/board, or push any branch." The board does not exist. The verifications redefine "stood up" = "readiness artifact (commands + field spec)" (01-VERIFICATION SC4). That is a reasonable plan-only interpretation, but the requirement verb is "stood up," and a maintainer reading "PASSED" could wrongly believe a board exists. **Honest label = chosen + stand-up-ready; board creation DEFERRED to a maintainer (one `gh auth refresh` + the documented block).** Not a process failure — the no-GitHub-writes constraint forced it — but it must be surfaced as deferred, not passed. |
| **QWIN-01** (published quick-win backlog) | satisfied | **SATISFIED** (with the VIEW-01 caveat) | `QUICK-WIN-BACKLOG.md` exists: 19 items, all ICE-sized, owner-routed across 4 slots (>3), blast-radius tagged, load-bearing guard applied. "Published" = the Markdown is the source of truth; the GitHub board (the other half of "published to the tracking surface") inherits VIEW-01's deferral. As a *document* it is execution-ready; as a *board* it is not yet live. |

**VIEW-01 explicit judgment:** The requirement says "chosen via research **and stood up**." Only
the first half is literally true. "Stood up" is satisfied *as readiness*, not *as an existing
board*. Under the autonomous plan-only / no-GitHub-writes constraint this is the correct and
honest stopping point — but the deliverables present it as PASSED where DEFERRED-to-maintainer is
the accurate status. **Overstated, not dishonest** (the limitation is disclosed in the body text);
the gap is that the *status label* outruns the *body disclosure*.

---

## 3. Schema conformance of `QUICK-WIN-BACKLOG.md`

Checked every one of the 19 active YAML items against `BACKLOG-SCHEMA.md` required fields.

| Check | Result |
|-------|--------|
| ICE sub-scores (impact/confidence/ease) + computed `ice` product | **PASS** — all 19; products re-verified (e.g. QW-UX-02 4×5×5=100; QW-REL-01 5×5×4=100; QW-TOK-06 4×3×1=12). No arithmetic error found. |
| `product` present | **PASS** — all 19 (UX/Token/Reliability). |
| `owner` (routing) | **PASS** — all 19; routed across 4 owner slots. |
| `runtime_blast_radius` from allowed set | **PASS** — all 19 carry none/claude-only/multi/all-14+. |
| `citation` (`file:line` or repro) | **PASS** — all 19. Spot-checked several against live code: accurate. |
| `plan_only: true` | **PASS** — all 19. |
| `tshirt` | **PASS** — all 19. |
| prompt-corpus items carry `mechanical_vs_instructional` | **PASS** — all prompt-corpus items flagged; engine/installer items correctly `n/a` with a clarifying comment. |
| load-bearing items name a recall/edge-probe gate | **PASS** — the 4 instructional items (QW-TOK-04, -05, -06, QW-UX-08) each name a concrete, distinct gate (agent-routing recall; graphify behavior-equivalence; plan/execute edge-probe + verifier-reach; lint:descriptions + skill-deps closure). |
| ZERO "delete this" phrasing on load-bearing items | **PASS** — postures are tighten/relocate/restructure/clarify; the only "delete this"-adjacent string is the schema's prohibition sentence. |
| reliability items carry `severity` | **PASS** — QW-REL-01 high, -02 med, -03/-04 low. |

**Schema verdict: PASS. Zero violating items.** This is the cleanest part of the milestone.

---

## 4. Count reconciliation (~20 → 19), built independently

Stream items (counted by `grep '^- id:'`): **UX 8 + Token 8 + Reliability 4 = 20 numbered.**
Backlog active items: **19** (8 UX + 7 Token + 4 Reliability).

| Stream item | Disposition in backlog | Verified |
|-------------|------------------------|----------|
| QW-UX-01..08 | present (8) | ✓ all 8 present |
| QW-TOK-01..07 | present (7) | ✓ |
| **QW-TOK-08** | **FOLDED → QW-TOK-05** | ✓ appears only in a code comment + dedup ledger; not an active row. Rationale (same file `graphify.md`, banner is a sub-task of the relocation) is sound. |
| QW-REL-01..04 | present (4) | ✓ |

**The two "cross-lens merges"** (QW-UX-01 ← Token cold-start facet; QW-UX-08 ← Token ns-* sprawl)
are **not** dropped numbered items — they are dual-lens *tags* applied to existing UX items. The
Token stream raised cold-start and ns-* only as **non-numbered** surface-sprawl guidance (token-
stream.md §"Surface-sprawl candidates"), never as `QW-TOK-NN` rows. So the "20 → 19" arithmetic
is exact: **one numbered item folded (TOK-08), zero silent drops.** The merges add provenance
tags; they do not change the count.

**Reconciliation verdict: HONEST. No silent drops.** The dedup ledger is accurate. (Minor: the
backlog prose says "from 20 numbered stream items" — correct; the description "~20" in the task
brief lands exactly at 20.)

---

## 5. Internal consistency

| Check | Result |
|-------|--------|
| "Start Here" ranking follows ICE then blast radius then risk | **CONSISTENT.** Order is ICE-desc (100,100,80,75,75,75,50); the three 75s break as QW-UX-04 (blast none) > QW-TOK-01 (all-14+, S) > QW-UX-01 (all-14+, M), matching the stated tie-break (lower blast, then size-as-risk). |
| QW-REL-01/02 ranked #2/#3 despite `all-14+` + high/med severity | **CONSISTENT, disclosed.** The file explicitly carves a separate "spotlight-eve shortlist" of the four zero-runtime-risk items (UX-02/04/03 + TOK-01) and justifies the REL ranking with "blast radius is *reach*, not *risk* — the change is one line." Coherent, not a contradiction. |
| Owner slots ≥ 3 | **CONSISTENT** — 4 slots, each non-empty. |
| Stream notes vs backlog ICE values | **CONSISTENT** — spot-checked QW-UX-01 (75), QW-TOK-06 (12), QW-REL-02 (80): identical across stream note and backlog. |
| `core` profile size: UX stream says "8 skills" | **CORRECT vs `src/`** — `src/install-profiles.cts:28-37` = 8 entries. (But see §6 L-1: the *installer help text* says "7" — a stale count the streams did not flag.) |

No cross-document contradiction found among the deliverables themselves.

---

## 6. Missed concerns (the high-value check)

Adversarial brainstorm of what a real newcomer hits in the first 10 minutes that is **not** in
the backlog. Distinguished genuine misses from correctly-deferred items.

### GENUINE MISSES (should have been caught in M1)

**H-1 (HIGH) — Node version contradiction on the first-run path; no installer guard.**
- `package.json` `engines.node` = **`>=22.0.0`** (verified).
- Every onboarding doc tells newcomers **"Node.js 18+"**: `docs/how-to/install-on-your-runtime.md:5`,
  `docs/tutorials/your-first-project.md:15`, `docs/tutorials/onboarding-an-existing-codebase.md:15`
  — and all four translations (15 files total via `grep -rliE 'node.js 18'`).
- `bin/install.js` has **no `process.version` guard** (grep for version/major/EBADENGINE/EOL → none).
- There is **no `.npmrc` with `engine-strict`**, so npm only *warns* (`EBADENGINE`) — it does not
  block. A newcomer on Node 18/20 (which the docs explicitly bless: *"`node --version` should
  print `v18.x.x` or higher"*) installs successfully, then the Node-22-targeted engine can fail at
  runtime with an opaque error.
- **Why this is a real miss, not a defer:** the UX stream scrutinized `your-first-project.md:36-40`
  for the "86 skills" drift (F-06) — the Node-18 line is `:15` of the *same file*, one screen up.
  The reliability stream's whole remit is "newcomer gets a wrong/confusing outcome on the happy
  path." A version mismatch that the docs actively endorse is the textbook case. It is small
  (ICE-sized: a doc edit `18+`→`22+` plus a one-line installer guard), high-impact, blast `none`
  for the doc half. **This belongs in the M1 backlog as ~QW-REL-05 / QW-UX-09.**

**L-1 (LOW) — Incomplete stale-count sweep (QW-UX-03 under-scoped).**
- QW-UX-03 fixes "66 skills" → live 67. But the *same* `--help` block (`bin/install.js:686`) also
  says **"core — 7 main-loop skills"** (actual core = 8, `src/install-profiles.cts:28-37`) and
  **"standard — ~13 skills"** (actual standard = 14, `:38-56`). Three stale counts in one string;
  the quick-win names only one. Easy widen of QW-UX-03's scope (it already notes "derive
  programmatically so it cannot drift again," which would fix all three).

**L-2 (LOW) — No "what happens with no/invalid runtime selection" reliability probe.**
- The reliability stream handed runtime-resolution divergence to Phase 13 (H-02: `runtime-slash.cts:56`
  defaults to `claude`). Fair. But a more basic newcomer case — *running `npx @opengsd/gsd-core`
  in a non-TTY/CI context with no `--<runtime>` flag* — is not probed at all (the installer gates
  the interactive prompt on `isTTY`, per QW-UX-01's own note at `bin/install.js:8599`, but the
  fall-through behavior when non-interactive AND no flag is unverified). Low confidence it's a
  bug; flagged as an untested first-run branch worth a Phase-13 probe.

### CORRECTLY DEFERRED (not misses)

- **Full per-runtime first-run trace across 14+ runtimes** → reliability H-04 (Phase 13). Correct;
  too large for a quick-win.
- **`gsd update` clobbering behavior** → out of the *newcomer* first-run scope (update is a
  second-session concern); the workflow exists (`commands/gsd/update.md`, `gsd-core/workflows/update.md`)
  and profile persistence across update is already noted as "what's good" in the UX stream. Correct
  to leave for the deep sweep.
- **No-API-key / wrong-runtime errors** → these are runtime-host concerns (Claude Code's own auth),
  largely outside GSD-Core's installer surface; reasonable to leave to Phase 13/15.
- **Systematic exit-code contract** → reliability H-03 (Phase 13). Correct.
- **Exact eager-vs-lazy token byte split** → Token handoff to Phase 12. Correct (the char/4 caveat
  is honest about this).
- **Deep menu IA across 67 commands** → UX handoff to Phase 15. Correct.

---

## 7. Overall verdict

**The milestone is genuinely complete enough for maintainers to act on, with two corrections
required before they fully rely on it:**

1. **Add the Node-version contradiction as an M1 backlog item** (H-1). It is the kind of
   spotlight-eve, first-touch failure the fast-track exists to prevent, it is quick-win-sized, and
   it sits literally adjacent to evidence the UX stream already cited. This is the single most
   important gap.
2. **Relabel VIEW-01 from "stood up / PASSED" to "chosen + stand-up-ready; board creation deferred
   to a maintainer"** (medium). The body text already discloses this; only the status label
   overstates. No board exists; saying "stood up" risks a maintainer assuming otherwise.

Lower-priority polish: widen QW-UX-03 to sweep the "7"/"~13" stale counts too (L-1); add a
non-interactive-no-flag install probe to the Phase-13 handoff (L-2).

**What held up under hostile review:** schema conformance (clean), count reconciliation (honest,
zero silent drops), the load-bearing guard (every instructional item gated, no "delete this"), and
the reliability stream's behavior-over-narration discipline (negative probes recorded, findings
self-downrated to resist inflation). These are not rubber stamps.