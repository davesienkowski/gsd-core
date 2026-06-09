> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# Adversarial Red-Team Review — Milestone 2 (Comprehensive Deep Audit)

> **Reviewer stance:** hostile / falsify-first. Goal: refute the producing agents' "passed"
> self-reports against **live code**. Scope: evidence/factual integrity, firewall integrity,
> false-positive guard, load-bearing guard, AI-gap citation integrity.
> **Mode:** plan-only / read-only. This file is the ONLY artifact created. No deliverable, source,
> or config was edited; no commit; no GitHub. All reproductions ran read-only in `/tmp`.
> **Date:** 2026-06-08. Source-of-truth `src/*.cts` (never compiled `.cjs`); the compiled engine
> `gsd-core/bin/gsd-tools.cjs` was invoked only to *observe behavior*.

---

## 1. Headline verdict

The M2 evidence base is **trustworthy for maintainers to act on.** Every high-stakes correctness
finding I attacked **reproduced live**, every AI-gap citation I spot-checked is **verbatim-accurate**
(no inverted citations), the false-positive guard is **rigorously applied**, and the load-bearing
guard **holds** on the prompt-corpus cuts. The defects I found are **evidence-hygiene issues, not
finding-invalidating ones**: two stale grep counts that no longer reproduce, one isolated import of
firewalled prior-experiment framing into a concern sweep, and minor off-by-one line citations. None
of them overturns a finding; all are MINOR. **No BLOCKER. No must-fix that changes a verdict.**

---

## 2. Findings table

| ID | Claim under test | What I did | Verdict | Severity | Fix |
|----|------------------|------------|---------|:--------:|-----|
| **A-01** | F-CORR-01: `verify-summary` checks only first 2 claimed files → silent `passed:true` on fabricated work (`src/verify.cts:66,102,148`) | Read source (lines confirmed: `checkCount = checkFileCount \|\| 2` @66, `slice(0,checkCount)` @102, pass formula @148, `includes('/')` filter @96). Reproduced live in `/tmp/p13sum3`: SUMMARY claims 5 created files (2 real first, 3 fabricated), got `{passed:true, files_created:{checked:2,found:2}}` exit 0. | **CONFIRMED** | OK (finding stands; sev-5 justified) | none for the finding — fix is the recommended cap removal |
| **A-02** | F-CORR-02: `loadConfig` silently returns defaults on malformed config while `config-get` errors (`src/core.cts:~545-552` vs `src/config.cts:639/429`) | Reproduced in `/tmp/p13c1` with `{...,BROKEN}`: `config-get model_profile`→`Error … exit 1`; `state load`→`"model_profile":"balanced"` exit 0; `resolve-model gsd-executor`→`{model:sonnet, profile:balanced}` exit 0 (user set `quality`). Confirmed `config.cts:429` & `:639` both `error(…, CONFIG_PARSE_FAILED)`. | **CONFIRMED** | OK | finding stands |
| **A-03** | F-AIGAP-02: executor & verifier can resolve to the SAME model (`model-catalog.json:116,122`) | Read catalog. `gsd-executor` @116 `balanced:sonnet`; `gsd-verifier` @122 `balanced:sonnet` → identical in **balanced only**. Golden: opus vs sonnet (differ). Budget: sonnet vs haiku (differ). Line numbers exact. | **CONFIRMED** (concrete claim) / **slightly OVERSTATED** (framing) | MINOR | Prose says "In the golden/balanced/budget profiles … can resolve to the same model" — true only for **balanced**. Tighten the prose to name the one profile; the cited `:116,122` evidence and the gap itself are correct. |
| **A-04** | F-CORR-05: empty-output slug collapses distinct non-Latin names to the same `NN-` dir (collision/overwrite, `created:true`) | Reproduced in `/tmp/p13s2`: `generate-slug "日本語のテスト"`→`{slug:""}`; `scaffold phase-dir --phase 1 --name 日本語` and `--name 한국어` BOTH → `.planning/phases/01-`, both `created:true`; `ls` shows ONE `01-` dir. Slug code @`core.cts:1919-1921` (card cites 1919-1920 — off by one line). | **CONFIRMED** | OK (line cite off-by-one, cosmetic) | finding stands |
| **A-05** | F-CORR-08: Node floor — package `engines>=22` vs docs "18+", no installer guard, no `.npmrc` | Verified live: `package.json:47` `">=22.0.0"`; `grep -c process.version bin/install.js`→0; `.npmrc` absent; `your-first-project.md:15` = "Node.js 18 or later". **BUT** the card's own repro command `grep -rliE 'node\.?js 18\|18\+' docs/ \| grep -v review \| wc -l` reproduces **22**, not the "18 files" the card states. | **CONFIRMED** (contradiction real) / **OVERSTATED count** | MINOR | The 18→22 file-count is stale (doc corpus grew). Fix the number in the card; the contradiction + missing guard are real and spotlight-relevant. |
| **A-06** | F-UX-07: `/gsd:` colon-form in 18/67 command bodies | `grep -rl '/gsd:' commands/gsd/*.md \| wc -l`→**18**; total command files→**67**. Exact match. | **CONFIRMED** | OK | finding stands |
| **A-07** | F-CORR-09: `verify artifacts` no-artifacts → exit-0 error-object, no `all_passed` | Reproduced in `/tmp/p13v`: plan with truths-only must_haves → `{error:"No must_haves.artifacts found…"}` exit 0, no `all_passed`. Source @`verify.cts:373`. | **CONFIRMED** | OK | finding stands |
| **A-08** | F-CORR-10: `validate` scans wrap per-phase loops in empty catches (`verify.cts:742/847`) | Confirmed `intentionally empty` catches at `verify.cts:743` and `:848` (card cites 742/847 in the prose and 743/848 in the yaml — off by one; both real). Behavioral trigger not reproduced (card honestly flags this as confidence 4, residual). | **CONFIRMED** (cited-only, as labeled) | OK | finding stands |
| **A-09** | F-BLOAT-09: "724 colon-form refs" labeled **mechanical**, safe to normalize | `grep -rho '/gsd:' agents/ commands/ gsd-core/ \| wc -l`→**1073** (agents 96 + commands 38 + gsd-core 939), not 724. The "724" is a stale M1 count (QW-TOK-03) carried unchanged into bloat.md, FINDINGS.md, and IMPROVEMENT-ROADMAP.md. Load-bearing check: `/gsd:` in `src/*.cts` is comment-only (inert); `runtime-slash.cts:36` *accepts* legacy `/gsd:` as input — so prose normalization is mechanical, but the card already adds the "verify no regression on the colon-form pass" caveat. | **OVERSTATED count** / mechanical label **OK** | MINOR | Re-run the grep and update 724→current (~1073) in all three docs. The mechanical classification is defensible (the colon form in prose/docs is inert; runtime-slash still parses legacy input, so even a missed instance degrades gracefully). |
| **A-10** | Firewall: concern sweeps must NOT cite firewalled priors (only RECONCILIATION may) | `pipeline-correctness.md` references **N17, N18, and two upstream PRs (self-grade + edge-probe)** in recall-gates and framing prose (lines 134,139,204,205,220,221). These are the user's prior-experiment program + GitHub PR content — the same material the firewall walls off (`.planning/notes/*-2026-06-05.md` / frontier synthesis). The OTHER four sweeps are clean (no N17/PR refs). RECONCILIATION cites priors 19× (allowed). The `2026-06-05` hits in all sweeps are benign **attestation** lines ("firewall honored — did NOT open…"). | **OVERSTATED / suspected seepage** | MINOR | The IDs also live in the user's MEMORY, so an agent could surface them without opening the firewalled file — hence not a clean BLOCKER. But importing the N17/PR *framing* into a sweep that attested "firewall honored" is at minimum inconsistent. The underlying findings (F-CORR-01/03) stand entirely on reproduced code, so this does not invalidate them. Fix: strip the N17/PR references from the sweep (or move that framing to RECONCILIATION), keeping the code-only evidence. |
| **A-11** | AI-gap citations S1/S5/S6/S7/S3 (inverted-citation risk) | WebFetched all 5 sources. S1 (2404.13076): both quotes verbatim in abstract ✓. S7 (2307.03172): "lost in the middle" quote verbatim ✓. S5 (2508.06225): "predicted confidence significantly overstates actual correctness, undermining reliability…" verbatim ✓. S6 (1706.04599): "modern neural networks … are poorly calibrated" verbatim ✓. S3 (2507.06920): the 50%/84%/20%/40% stats are NOT in the abstract but ARE verbatim in the full-text intro — and the card correctly cites the `/html/2507.06920v2` full-text URL, not the abstract. | **CONFIRMED accurate** (no inversion) | OK | none |

---

## 3. The four guard verdicts

**Firewall integrity verdict: MOSTLY HONORED — one isolated suspected seepage (MINOR).**
Four of five concern sweeps cite zero firewalled priors; all `2026-06-05`/frontier mentions are
benign attestation lines; the edge-probe in-flight branch is correctly scoped out in
SOURCE-OF-TRUTH-MAP. The single blemish is `pipeline-correctness.md` importing prior-experiment IDs
(N17/N18 + the upstream self-grade/edge-probe PRs) into recall-gate labels and framing prose — material the firewall walls off.
Because those IDs also live in the user's persistent memory and the findings rest entirely on
freshly-reproduced code, this is a framing/consistency lapse, not a fabricated or prior-anchored
finding. Recommend stripping the IDs from the sweep.

**False-positive guard verdict: PASS (strong).**
`static-findings.md` and `bloat.md` apply the mandatory dynamic-indirection cross-check to EVERY
dead/unused claim, each carrying an explicit `cross_check:` field. The headline is honest: knip's 45
"unused files" and madge's 88 "orphans" are stated as **0 confirmed dead**, and the net result
("zero `src/*.cts` modules / functions confirmed dead — no dead code manufactured") matches what I
saw. No dead-code claim is asserted without its guard. They even self-report the guard's own
inventory gap (the 6th workflow-shim require channel → F-MAINT-01) rather than hiding it.

**Load-bearing guard verdict: PASS.**
Every prompt-corpus instructional finding (F-BLOAT-10/11/12/13/14, F-BLOAT-05) is labeled
`mechanical_vs_instructional` and routes through a named recall/parity gate; none says "delete." The
QW-TOK-02 lesson (the `<documentation_lookup>` block that is 4 md5 variants, 3 carrying a `command -v
ctx7` supply-chain guard) is carried forward as the cautionary anchor. The one genuinely-mechanical
card (F-BLOAT-09, colon-form normalization) is defensible: I confirmed the colon form is inert in
source comments and that `runtime-slash.cts` still *accepts* legacy `/gsd:` input, so a missed
instance degrades gracefully. No QW-TOK-02-class load-bearing cut is mislabeled mechanical.

**AI-gap citation verdict: PASS (solid).**
5 of 7 sources WebFetched and verified verbatim (exceeds the requested 3); zero inverted or
overstated citations. The riskiest one (S3's specific 50/84/20/40 statistics) checks out against the
full text, and the card cites the correct full-text URL. S2 is honestly flagged as a repo-internal
self-reference, and the doc's own UNVERIFIED register correctly says "none." This sweep met its own
load-bearing citation bar.

---

## 4. Overall

**The M2 evidence base IS trustworthy for a team to act on without re-auditing.** All eight
high-stakes correctness/AI-gap findings I attacked are CONFIRMED against live code or live sources;
the partition discipline (MECE, cross-MECE handoffs), the false-positive guard, the load-bearing
guard, and the citation bar all hold under hostile review.

**Must-fix before publish: NONE that change a verdict.** The action items are evidence-hygiene
cleanups (all MINOR):

1. **A-09 / A-05 stale grep counts** — "724 colon-form refs" actually reproduces as ~1073;
   "18 docs say Node 18+" reproduces as 22. Re-run and update the numbers in `bloat.md`,
   `FINDINGS.md`, `IMPROVEMENT-ROADMAP.md`, and the F-CORR-08 card. (The findings themselves stand.)
2. **A-10 firewall seepage** — remove the N17/N18 + upstream-PR references from `pipeline-correctness.md`
   (move to RECONCILIATION if the framing is wanted), so the sweep's "firewall honored" attestation
   is literally true.
3. **A-03 framing** — narrow F-AIGAP-02's "golden/balanced/budget … same model" to "balanced
   profile" (the only one with the executor/verifier overlap).
4. **A-04 / A-08 off-by-one line citations** — slug `1919-1920`→`1919-1921`; validate catches
   `742/847`→`743/848`. Cosmetic.

**Single most important issue:** the **stale grep counts (A-09 "724" → 1073)** — not because it
changes any conclusion, but because the charter's own evidence standard is "a 4-person team must be
able to trust findings without re-checking each one," and a cited count that fails to reproduce is
exactly the thing that erodes that trust on first verification. It is a 30-second fix; do it before
the spotlight.

---

*Reproduction ledger (read-only `/tmp`, no repo/project mutation): `/tmp/p13sum3` (A-01),
`/tmp/p13c1` (A-02), `/tmp/p13s2` (A-04), `/tmp/p13v` (A-07). Source reads: `src/verify.cts`,
`src/core.cts`, `src/config.cts`, `gsd-core/bin/shared/model-catalog.json`, `package.json`,
`docs/tutorials/your-first-project.md`, `docs/audit/comprehensive/AUDIT-CHARTER.md`. WebFetched:
arxiv 2404.13076, 2307.03172, 2508.06225, 1706.04599, 2507.06920 (abstract + /html full text).
The compiled engine was invoked only to observe behavior; no `bin/lib/*.cjs` path is cited as a
source-of-truth.*