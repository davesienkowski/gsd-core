# Adversarial Evidence Review — Newcomer-Readiness Fast-Track Milestone

**Reviewer posture:** hostile red-team. Goal = falsify the producing streams' claims, not confirm them.
**Scope:** Evidence & factual integrity + the load-bearing guard + firewall leakage.
**Date:** 2026-06-07
**Method:** every claim re-checked against LIVE source (`src/*.cts` as source-of-truth) and, where
reproducible, re-run read-only against the compiled `gsd-core/bin/gsd-tools.cjs` in throwaway `/tmp`
dirs. Token/usage instruments (`tokenize.mjs`, `usage-extract.mjs`) re-executed from repo root.
**Constraint honored:** review is plan-only; the only file created is this one, under `docs/audit/review/`.
No deliverable, source, or config was edited; no firewalled prior was opened.

---

## Headline

The evidence base is **largely trustworthy and reproduces exactly** — but it contains **one
must-fix load-bearing-guard failure**: **QW-TOK-02** is mislabeled `mechanical` on a false
"verbatim-identical" premise. The 8 `<documentation_lookup>` blocks are **not** identical (4
distinct variants), and 3 of them carry a deliberate **supply-chain security hardening** the other
5 lack. Factoring them into one include is a behavior change, not a mechanical cut. This is exactly
the failure mode the guard exists to catch, and the guard missed it.

Everything else — both reliability bugs, all UX drift numbers, all other token counts, the firewall,
and the usage signal — held up under reproduction.

---

## Findings table

| ID | Claim under test | What I did | Verdict | Severity | Fix |
|----|------------------|-----------|---------|----------|-----|
| F1 | **QW-REL-01**: `loadConfig` (core.cts) silently returns defaults on malformed config; `config-get` (config.cts) errors | Read `src/core.cts:544-552` (catch → `return defaults` when `.planning/` exists, no stderr) and `src/config.cts:416-417` (`error(... CONFIG_PARSE_FAILED)`). Reproduced in `/tmp`: one-typo config → `config-get`=exit 1 visible error; `state load`=exit 0 returns `"balanced"` (user asked `"quality"`); `resolve-model`=silently downgraded, exit 0 | **CONFIRMED** | OK (claim is sound; sev `high` justified) | none — claim is accurate; ship the warning quick-win |
| F2 | **QW-REL-02**: non-Latin/symbol phase names yield an empty slug + malformed `NN-` dir | Read `src/core.cts:1863-1865` (guards empty *input*, not empty *output*) and consumption at `src/commands.cts:1164,1169`. Reproduced: `generate-slug "日本語のテスト"`→`{"slug":""}` exit 0; `scaffold phase-dir --name "日本語テスト"`→`.planning/phases/01-`, `created:true` | **CONFIRMED** | OK | none — claim accurate |
| F3 | UX command count is **67** (installer says "66", tutorial says "86") | `ls commands/gsd/*.md \| wc -l`=67; `grep` `bin/install.js:686`="all 66 skills"; `docs/tutorials/your-first-project.md:36`="Installed 86 skills", :38="GSD Core ready" | **CONFIRMED** | OK | none — drift claims accurate |
| F4 | **QW-TOK-01**: dead commented `# hooks:` stub in **24** agent frontmatters; mechanical/safe | `grep -l '^# hooks:' agents/*.md`=24. Verified every block is *inside* frontmatter and *fully `#`-commented*; `grep '^hooks:'`=0 (no active hooks anywhere); awk scan for uncommented continuation lines = none | **CONFIRMED** | OK | none — genuinely mechanical |
| F5 | **QW-TOK-02**: duplicated `<documentation_lookup>` block in **8** agents; **"verbatim-duplicated, no per-agent variation" → mechanical** | `grep -l`=8 (count correct). md5 of each extracted block → **4 distinct hashes**: 5 researchers identical, but `gsd-phase-researcher`, `gsd-executor`, `gsd-planner` each differ. `diff` shows the 3 outliers replace `npx --yes ctx7@latest` with a `command -v ctx7` guard **and add an explicit security warning** ("Do NOT use `npx --yes` — silently executes unverified packages") | **REFUTED (the "verbatim/mechanical" claim)** | **MAJOR** | Re-tag QW-TOK-02 `instructional`/EXECUTION-RISK; the count "8" is fine but they are **not** one block. A factor-out must preserve the safe `command -v` + security-warning variant for executor/planner/phase-researcher (do NOT collapse to the `npx --yes` form). Add a recall/parity gate. |
| F6 | **QW-TOK-03**: **724** legacy colon-form `/gsd:` refs; mechanical | `grep -rho '/gsd:[a-z-]*' agents/*.md commands/gsd/*.md gsd-core/workflows/*.md`=724 (agents 96 / commands 38 / workflows 590). All occurrences are prose (descriptions, "Run /gsd:new-project"); none inside `Skill(skill=...)` dispatch calls | **CONFIRMED (count + mechanical)** | OK | none, but see F11 (the *reason* it is safe is the install transform — token-savings impact is ~0, which the stream correctly rated impact:2) |
| F7 | **UX false-positive correctly EXCLUDED**: colon refs are transformed at install (`bin/install.js`) | Confirmed `bin/install.js` runs `c.replace(/gsd:/g,'gsd-')` (lines 2030, 2200) and `content.replace(/\/gsd:([a-z0-9-]+)/g,...)` (2656, 2713, 2799) + `replace(/gsd:/gi,'gsd-')` (2316, 2436, 2556) via `scripts/fix-slash-commands.cjs`. The runtime never sees the colon form | **CONFIRMED (exclusion was correct)** | OK | none — exclusion is right |
| F8 | **QW-TOK-07**: `mandatory-initial-read.md` `@-included` by **5** files; mechanical (lock against drift) | `grep -rl`=5; each is a clean `@~/.claude/gsd-core/references/...` include line (debugger:24, executor:21, phase-researcher:19, planner:25, verifier:19) — no inline copies | **CONFIRMED** | OK | none |
| F9 | **QW-TOK-08** (folded into TOK-05): STOP banner "duplicated verbatim across command wrappers"; sweep peers | `grep -rln "injected into your context\|DO NOT READ"` across `commands/gsd/*.md` = **1 file only** (`graphify.md:11`). There are **no peers** | **OVERSTATED** | MINOR | Premise ("across wrappers", "peers") is false — banner is single-file. The fold into TOK-05 rescued it (it lives in the file TOK-05 relocates), so no action beyond dropping the "peers" framing. |
| F10 | **QW-TOK-05** config-gate/Step 0–1 is load-bearing → instructional + behavior-equivalence gate | Read `graphify.md:28-47, 51-72`: genuine gate logic (Read config → STOP branches on disabled/missing). Correctly tagged instructional with a parity harness | **CONFIRMED (correct safe call)** | OK | none |
| F11 | **QW-TOK-04** description = routing signal → instructional + routing recall gate | `agents/gsd-planner.md:3` description is uncapped prose; command desc capped ≤100 (`scripts/lint-descriptions.cjs`). The "description IS the routing signal" rationale is sound; correctly tagged instructional | **CONFIRMED (correct safe call)** | OK | none |
| F12 | Token totals: 100 files / 178,999 recurring; 173 / 449,485 on-demand; 628,484 grand total | Re-ran `node docs/audit/instrumentation/tokenize.mjs`: reproduced **exactly** (178,999 / 449,485 / 628,484; 100 + 173 files) | **CONFIRMED** | OK | none |
| F13 | Profile base sets: core=8, standard=15 | Read `src/install-profiles.cts:28-56`: core array = 8 entries, standard = 15 entries | **CONFIRMED** | OK | none |
| F14 | "~12k tokens → ~700" cold-start figure (UX F-03, QW-UX-01) — is it leaked or derivable? | `grep bin/install.js:686` contains literal `12k`, `cold-start`, `~700` | **CONFIRMED derivable (not leaked)** | OK | none |
| F15 | **QW-REL-04**: drift exception branch returns `message:''` | Read `src/drift.cts:252-255` (catch → `skipped('exception:'+errMsg)`) and `skipped()` :259-270 hardcodes `message:''`; exception text lands in `reason`, not `message` | **CONFIRMED** | OK | none |
| F16 | Usage-signal numbers reproduce; single-author caveat present/prominent; double-count fixed | Re-ran `usage-extract.mjs`: slash table reproduces **exactly** (15 rows), skill table matches. Caveat is the FIRST section (line 10, bold, "read first"); the script itself emits the caveat. Coverage 19 dirs / 92 sessions match. **Discrepancy:** script now reports **577** user messages vs committed **571** | **CONFIRMED (with minor staleness)** | MINOR | The ranked tables (the load-bearing content) are identical; the 571→577 delta is live-transcript growth, immaterial. Optionally re-snap the coverage line. No evidence of an *unfixed* double-count — nested dispatches are counted by stated design and reproduce. |
| F17 | Citation precision spot-check: `commands.cts:1164,1169`; `install-profiles.cts:443-451` (default→full); `config.cts:417` | Read each: 1164=`generateSlugInternal(name)`, 1169=`dirName=...${slug}`; 450=`return 'full'`; 417=`error(... CONFIG_PARSE_FAILED)`. All line-accurate | **CONFIRMED** | OK | none |

---

## Load-bearing guard verdict (the headline)

**Yes — one mechanical item deserved a load-bearing flag and did not get one: QW-TOK-02.**

The guard's whole job is to stop a load-bearing instruction from being mislabeled "mechanical" and
cut/factored right before a traffic spike. QW-TOK-02 is precisely that miss:

- The stream's citation asserts *"identical block in 8 agents"* and *"verbatim-duplicated reference
  text, no per-agent variation."* This is **factually wrong**. md5 over the extracted blocks yields
  **4 distinct variants**.
- The variation is **not cosmetic** — it is **security-behavioral**:
  - 5 researcher agents instruct `npx --yes ctx7@latest ...` (auto-downloads & executes the package).
  - `gsd-executor`, `gsd-phase-researcher`, `gsd-planner` instead use a `command -v ctx7` guard **and
    explicitly warn**: *"Do NOT use `npx --yes` to auto-download ctx7 — this silently executes
    unverified packages from the registry."*
- "Factor into one shared include" (the proposed action) therefore **cannot be behavior-neutral**:
  it either (a) propagates the unsafe `npx --yes` form into executor/planner (a supply-chain
  regression in the agents that actually run shell commands), or (b) propagates the hardened form to
  the 5 researchers (a behavior change). Either way it is **instructional**, not mechanical.

**Required remediation:** re-tag QW-TOK-02 `instructional` / EXECUTION-RISK; correct the citation
from "identical block in 8 agents" to "4 variants across 8 agents (one carries a security guard)";
add a recall/parity gate; and scope the factor-out to **preserve the safe `command -v` + warning
variant** for the three command-capable agents. The merged backlog's blanket line *"All other
prompt-corpus items are `mechanical` (QW-TOK-01, -02, -03, -07): … safe to cut/factor after a
verbatim-duplicate confirmation"* must drop -02 from that set — the verbatim-duplicate confirmation
**fails**.

**Every other mechanical call checked out:**
- QW-TOK-01 (dead hooks stub): all 24 blocks fully `#`-commented inside frontmatter; zero active
  hooks. Genuinely mechanical. ✅
- QW-TOK-03 (colon refs): safe *because* the installer transforms `gsd:`→`gsd-` (F7). Behavior-neutral. ✅
- QW-TOK-07 (mandatory-initial-read): all 5 are clean `@-includes`, no inline drift. ✅
- QW-TOK-08/STOP banner: single-file, not "across wrappers" (overstated premise) but the fold makes
  it harmless. ✅
- The three items already tagged load-bearing (QW-TOK-04 description routing, QW-TOK-05 graphify
  config-gate, QW-TOK-06 plan/execute orchestration) are correctly flagged with named gates. ✅

So the guard worked on the hard cases it consciously reasoned about, and failed only where the
stream *trusted an unverified "verbatim" assertion* — a self-grading false-negative, exactly as the
red-team brief predicted.

---

## Firewall integrity verdict

**CLEAN — no leak detected.** Every figure and framing in the deliverables is derivable from
non-firewalled sources: the cold-start "~12k→~700" figure is a live string in `bin/install.js:686`;
the "38+ skills hot node" reference is a live comment in `src/install-profiles.cts:47`; all token
numbers reproduce from the committed `tokenize.mjs`; all usage numbers reproduce from the committed
`usage-extract.mjs`. The phrase *"verifier reach = spec reach"* and the entire load-bearing-guard /
`recall_gate` / mechanical-vs-instructional vocabulary originate in the **allowed** frame files
(`docs/audit/BACKLOG-SCHEMA.md:51-59`, `STREAMS.md`) and in non-firewalled in-tree experiment docs
(`experiments/llm-open-problems/SYNTHESIS.md`), not in `.planning/codebase/*`,
`.planning/notes/*-2026-06-05.md`, or any frontier-synthesis. The only mentions of the firewalled
paths are the streams' own "firewall honored" attestation lines.

---

## Overall verdict

**The evidence base is trustworthy enough for maintainers to act on — after one must-fix.** Both
reliability bugs reproduce end-to-end, every UX drift number is exact, every token/usage figure
reproduces from committed instruments, citations are line-accurate, and the firewall is intact.

**Must-fix before execution (BLOCKER for QW-TOK-02 only):** correct QW-TOK-02. It is currently a
load-bearing, security-relevant item wearing a `mechanical`/"verbatim" label backed by a false
citation. Shipping it as written (collapse 8 "identical" blocks into one include) risks a
supply-chain regression (`npx --yes` reintroduced) in the agents that execute shell commands —
the worst kind of "cleaner and tighter" miss to make before a newcomer traffic spike.

**Minor cleanups (non-blocking):** drop the "across wrappers / sweep peers" framing from the folded
QW-TOK-08 (single-file banner); optionally re-snap the usage-signal coverage line (571→577).

**Severity tally:** 0 BLOCKER-by-default, **1 MAJOR (QW-TOK-02 — treat as must-fix/blocking for that
item)**, 2 MINOR (QW-TOK-08 premise, usage-signal staleness), 14 OK/CONFIRMED.
