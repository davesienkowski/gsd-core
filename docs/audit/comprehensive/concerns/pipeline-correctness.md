> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# Pipeline Correctness — Deep Concern Sweep (Phase 13, CORR-01)

> **Requirement:** CORR-01 (Phase 13) · **Mode:** audit-and-plan only — no code changed,
> no repo/project mutation, no commit, no GitHub.
> **Charter:** `docs/audit/comprehensive/AUDIT-CHARTER.md` — problem_type=`wrongness`,
> evidence-card schema §2.2, reflexivity guard §3.1, evidence standard §3.2, MECE §1.1.
> **Source of truth:** `src/*.cts`. The compiled `gsd-core/bin/lib/*.cjs` is gitignored build
> output and is **never** a citation target (charter §0). Reproductions invoke the compiled
> engine (`gsd-core/bin/gsd-tools.cjs`) only to **observe behavior**; every `file:line` points
> at `src/`.
> **Derived:** 2026-06-08. All reproductions ran read-only in throwaway `/tmp` dirs; no repo or
> project state was mutated. Firewall honored: no `.planning/codebase/*`, no
> `.planning/notes/*-2026-06-05.md`, no frontier synthesis opened.

## 0. Method & reflexivity (behavior over narration)

This is the deep counterpart to the Milestone-1 reliability stream. The discipline is
**reproduce, don't theorize** (13-CONTEXT D-02): a concern is a *finding* only if a reviewer can
re-check it from a `src/*.cts` `file:line` **or** a concrete command-and-output reproduction.
Where the pipeline's self-description disagrees with what the engine actually does, the
**observation wins and the discrepancy is itself a finding** (charter §3.1, D-06).

Targets were chosen from the Phase-8 HOTSPOTS (`core.cts` rank 1; `config.cts` highest churn
after core; `verify.cts` — the single hottest *function* in the engine, cx 150, on the
verification path) and the Phase-9/10 leads, then resolved together with the four M1 reliability
handoffs (H-01..H-04) and the QW-REL-* quick-wins.

**The headline result.** The most severe correctness defects are not swallowed exceptions (M1
already proved those mostly clean) — they are **silent-wrong-result** paths where the engine
returns `passed: true` / a downgraded default with **exit 0** and no warning. Two of these sit on
load-bearing instruments: the config hot path (`loadConfig`) and the work verifier
(`verify-summary`). For an LLM-orchestration framework these are the worst class of defect,
because *"verifier reach = spec reach"*: a verifier that silently under-checks gives the
orchestrator false confidence.

### 0.1 Intentional patterns — assessed, NOT re-manufactured (13-CONTEXT D-05)

M1 verified these are by-design; this sweep re-confirmed each against live code and did **not**
re-card them as defects. They are recorded here so the team sees the assessment, not a gap.

| Pattern | Verdict (re-confirmed this phase) | Citation |
|---|---|---|
| Empty `catch {}` blocks | **Clean.** The 3 in `src/` are best-effort `fs.unlinkSync` cleanup. | `active-workstream-store.cts:135,154,160` |
| No-throw routing hub | **Clean.** Every non-ok hub result is re-surfaced via `error()` → exit 1. | `cjs-command-router-adapter.cts:126-135` (read this phase) |
| Drift `{skipped:true}` non-blocking | **By design** (cause preserved in `reason`); only the empty `message` is a nit → F-CORR-07. | `drift.cts:252-255, 259-270` |
| Per-migration catch-and-continue | **Clean.** Full rollback + collected `failures[]`; not silently dropped. | `installer-migrations.cts` (M1-verified) |

These are **newcomer-confusing at most, not wrong.** The genuine wrongness is elsewhere (§2).

---

## 1. Findings index (by severity)

| id | severity | title | evidence | blast |
|----|:--------:|-------|----------|-------|
| **F-CORR-01** | **5** | `verify-summary` checks only the first 2 claimed files → silent `passed:true` on fabricated work | **repro** | all-16 |
| **F-CORR-02** | **5** | Malformed `.planning/config.json` silently reverts to defaults (downgraded models/settings) on the hot path | **repro** + file:line | all-16 |
| **F-CORR-03** | 4 | `verify-summary` self-check is a keyword grep → self-graded "all pass" passes a failed phase | **repro** + file:line | all-16 |
| **F-CORR-04** | 3 | Workstream-active root-config parse failure silently swallowed; no defaults branch, no warning | **repro** + file:line | all-16 |
| **F-CORR-05** | 3 | Empty-output slug collapses distinct non-Latin/symbol phase names to the **same** `NN-` dir (collision/overwrite, `created:true`) | **repro** + file:line | all-16 |
| **F-CORR-06** | 3 | Unresolved runtime defaults slash hints to Claude `/gsd-` form — Codex/Gemini users see the wrong invocation; malformed config also triggers it | **repro** + file:line | multi |
| **F-CORR-07** | 2 | Three inconsistent "data-not-present" contracts across read commands (exit-0 default / exit-0 error-object / exit-1) | **repro** | none |
| **F-CORR-08** | 3 | Node floor contradiction: docs bless Node 18+, package requires `>=22`, no installer `process.version` guard, no `engine-strict` | **repro** + file:line | all-16 |
| **F-CORR-09** | 2 | `verify artifacts` emits an error-object with **exit 0 and no `all_passed`** when a plan declares no artifacts; declared-artifact-with-no-content-check passes vacuously | **repro** + file:line | all-16 |
| **F-CORR-10** | 2 | `validate consistency` / `validate health` wrap whole per-phase scan loops in empty catches → can report `passed` over unscanned phases | file:line | claude-only |
| **F-CORR-07b** | 1 | Drift exception branch returns an empty human `message` (cause preserved in `reason`) | file:line | claude-only |

**Severity tally:** 2 critical (5), 1 high (4), 4 med (3), 3 low (2), 1 trivial (1).
**Reproduced live:** F-CORR-01/02/03/04/05/06/07/08/09 (9). **Cited-only:** F-CORR-10, F-CORR-07b (2).

**M1 handoff resolution map** (charter §5; §4 of this doc has the narrative):

| M1 handoff | Resolved into | Status |
|---|---|---|
| **H-01** config-parse contract convergence | F-CORR-02 (+ F-CORR-04 deeper root-config thread) | Resolved — contract decision specified |
| **H-02** runtime-divergence of slash hints | F-CORR-06 | Resolved — chain traced + reproduced; tied to H-01 root cause |
| **H-03** systematic exit-code audit | F-CORR-07 (+ F-CORR-09 shape variant) | Resolved — three-contract taxonomy with the full read-surface matrix |
| **H-04** full per-runtime first-run trace | F-CORR-08 (Node floor) + F-CORR-06 (slash) ; residual flagged | Resolved at evidence-ceiling; per-runtime install-artifact trace flagged as residual (charter §3.4.4) |

QW-REL fold-ins: QW-REL-01→F-CORR-02 (escalated: warning→**contract**), QW-REL-02→F-CORR-05
(escalated: collision/data-loss, severity↑), QW-REL-03→F-CORR-07, QW-REL-04→F-CORR-07b,
QW-REL-05→F-CORR-08.

---

## 2. Evidence cards

### F-CORR-01 — `verify-summary` checks only the first 2 claimed files (silent pass on fabricated work)

The work verifier `cmdVerifySummary` collects files mentioned in a SUMMARY.md, then truncates the
check set to `checkCount` (default **2**):

```
src/verify.cts:66    const checkCount = checkFileCount || 2;
src/verify.cts:102   const filesToCheck = Array.from(mentionedFiles).slice(0, checkCount);
src/verify.cts:148   const passed = missing.length === 0 && selfCheck !== 'failed';
```

So a summary claiming N created files has only its **first 2** existence-checked. If the genuine
files are listed first and fabricated files follow, the verifier reports `passed: true`. This is
*"verifier reach = spec reach"* implemented as a hard 2-file cap — the verifier's reach is
**capped below the spec it is verifying.** (A secondary reach gap: line 96 `filePath.includes('/')`
only counts files containing a slash, so a claimed bare `index.js` is never checked at all.)

**Reproduction (2026-06-08, read-only `/tmp`):**
```bash
# SUMMARY claims 5 created files; 2 real listed first, 3 fabricated after
$ cat /tmp/p13sum3/SUMMARY.md
  Created: `src/real1.js`        # exists
  Created: `src/real2.js`        # exists
  Created: `src/fabricated3.js`  # MISSING
  Created: `src/fabricated4.js`  # MISSING
  Created: `src/fabricated5.js`  # MISSING
  ## Self-Check\nAll checks pass

$ node gsd-core/bin/gsd-tools.cjs verify-summary SUMMARY.md --cwd /tmp/p13sum3
  { "passed": true,
    "checks": { "files_created": { "checked": 2, "found": 2, "missing": [] }, ... },
    "errors": [] }                                  # EXIT 0 — 3 fabricated files unverified
```

```yaml
- id: F-CORR-01
  problem_type: wrongness
  subsystem: engine            # src/*.cts, on the verification path
  file:line: "src/verify.cts:66,102,148 — checkCount default 2 caps the file-existence reach; repro /tmp/p13sum3"
  severity: 5                  # the work verifier silently passes fabricated/missing artifacts beyond position 2
  effort: M                    # raise/remove the cap + check all mentioned files; tune false-positive risk on noisy summaries
  risk: med                    # checking ALL mentioned tokens may raise false negatives on prose-mentioned (not created) files — needs a "created:"-only mode
  confidence: 5                # reproduced; file:line is the literal slice(0,2)
  runtime_blast_radius: all-16 # verify-summary is a runtime-agnostic engine command on every phase's verification gate
  mechanical_vs_instructional: n/a
  recommendation: "Phase 13/exec milestone: stop truncating to 2 — existence-check every file the summary marks as Created/Modified (parse the explicit 'Created:'/'Modified:' verbs rather than every backticked token to bound false positives), and drop the includes('/') filter so bare filenames are checked. Treat the 2-file cap as a verifier-reach regression, not a perf knob."
  recall_gate: "verifier-reach / self-grading harness (the N17 exogenous-grading + self-grade corpus) must show the widened check does not spike false BLOCKERs before shipping"
```

> **Reflexivity note.** The command's name promises it *verifies the summary*; behavior verifies
> at most 2 of its claims. Narration ≠ behavior — this is the finding (charter §3.1). It is the
> exact failure mode an external maintainer independently hit on a recent upstream PR (self-graded review
> rationalized as passing): the instrument's reach falls short of the spec it guards.

### F-CORR-02 — Malformed `.planning/config.json` silently reverts to defaults on the hot path (H-01, QW-REL-01 escalated)

`loadConfig()` wraps parse + merge in a try/catch whose catch, when `.planning/` exists but the
config is unparseable, returns built-in `defaults` with **no stderr warning**:

```
src/core.cts:380   try {
src/core.cts:381     const raw = platformReadSync(configPath);   // null only on ENOENT (shell-command-projection.cts:559)
src/core.cts:385     const fileData = JSON.parse(raw) ...         // throws on malformed JSON
src/core.cts:545   } catch {
src/core.cts:547     if (fs.existsSync(planningDir(cwd, ws))) {
src/core.cts:552       return defaults;                            // ← silent: the user's real config is discarded
```

The same malformed file makes `config-get`/`config-set` **error and exit 1**
(`src/config.cts:639`, `src/config.cts:429`, `ERROR_REASON.CONFIG_PARSE_FAILED`). So two code
paths **disagree on the same file**, and the path on every workflow's hot line (`loadConfig`) is
the one that hides the problem. `loadConfig` already has a precedent for announcing silent loss —
it warns on *unknown keys* at `src/core.cts:455` — but says nothing when the **whole file** fails
to parse.

**Reproduction (2026-06-08):**
```bash
$ printf '{ "model_profile": "quality", "commit_docs": false, BROKEN }' > /tmp/p13c1/.planning/config.json

$ gsd-tools config-get model_profile --cwd /tmp/p13c1
  Error: Failed to read config.json: Expected double-quoted property name ... (EXIT 1)   # visible
$ gsd-tools state load --cwd /tmp/p13c1 | grep model_profile
  "model_profile": "balanced",                                              (EXIT 0)   # SILENT WRONG (asked quality)
$ gsd-tools resolve-model gsd-executor --cwd /tmp/p13c1
  { "model": "sonnet", "profile": "balanced", ... }                        (EXIT 0)   # silently downgraded
```

```yaml
- id: F-CORR-02
  problem_type: wrongness
  subsystem: engine
  file:line: "src/core.cts:545-552 (silent default) vs src/config.cts:639 / :429 (error+exit1); repro /tmp/p13c1"
  severity: 5                  # silent wrong models/settings on EVERY command; the worst newcomer failure (one typo → whole config ignored)
  effort: S                    # the warning is one stderr write; the full error-vs-default CONTRACT is the larger decision below
  risk: high                   # converging loadConfig to ERROR is a behavior change across all 16 runtimes; could break flows that tolerate a partial/garbage config
  confidence: 5                # reproduced; the cross-path divergence is a clean file:line oracle
  runtime_blast_radius: all-16 # loadConfig is on every runtime's hot path
  mechanical_vs_instructional: n/a
  recommendation: "Two tiers. (1) QUICK-WIN (QW-REL-01): add a one-line stderr warning in the loadConfig catch when the file exists-but-failed-to-parse, mirroring the unknown-key warning at core.cts:455 — the silent fallback then announces itself. (2) CONTRACT DECISION (H-01): converge the parse-failure contract — make loadConfig quarantine/error like config-get, OR keep defaulting but emit a structured warning the workflow can surface; a deliberate decision + regression sweep across all 16 runtimes, not a quick patch. Recommend tier-1 immediately (spotlight-safe) and tier-2 as a scoped engine change."
  recall_gate: n/a
  provenance: "QW-REL-01 (M1); escalated: the error-vs-silent-default *contract* exceeds quick-win scope (M1 H-01). Quick-win warning folds in unchanged."
  debt_quadrant: prudent-inadvertent
```

### F-CORR-03 — `verify-summary` self-check is a keyword grep (self-grading trap)

Within the same verifier, the "self-check" result is decided by grepping the summary's own prose
for pass/fail tokens:

```
src/verify.cts:124   const selfCheckPattern = /##\s*(?:Self[- ]?Check|Verification|Quality Check)/i;
src/verify.cts:126   const passPattern = /(?:all\s+)?(?:pass|✓|✅|complete|succeeded)/i;
src/verify.cts:131   } else if (passPattern.test(checkSection)) { selfCheck = 'passed'; }
```

The author of the summary (the executor agent) **grades its own work**, and the verifier accepts
"All checks pass ✅" as `self_check: "passed"`. This is *endogenous* grading — the failure mode N17
(verifier-abstention) and a recent upstream PR's external validation both flag: an agent's self-assessment is
not an independent check. In the F-CORR-01 repro the summary said "All checks pass" and the
verifier recorded `self_check: "passed"` with no independent corroboration.

```yaml
- id: F-CORR-03
  problem_type: wrongness
  subsystem: engine
  file:line: "src/verify.cts:123-134 (self_check derived from the summary's own prose); repro /tmp/p13sum3 (self_check:passed on self-asserted text)"
  severity: 4                  # the verifier's self_check signal is self-graded → false confidence; pairs with F-CORR-01
  effort: M
  risk: med                    # removing/deweighting self_check changes the pass formula at verify.cts:148
  confidence: 5                # reproduced; the grep is the literal pass/fail test
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  recommendation: "Treat self_check as advisory only — never let it raise a pass it didn't earn. The pass decision (verify.cts:148) already requires missing.length===0; keep self_check OUT of the pass gate or pair it with an EXOGENOUS grade (a separate verifier pass, per N17). Document that a self-asserted 'all pass' is not evidence."
  recall_gate: "self-grading / exogenous-grading corpus (the self-grade corpus + N17) before changing the pass formula"
  debt_quadrant: prudent-inadvertent
```

### F-CORR-04 — Workstream-active root-config parse failure is silently swallowed (H-01 deeper thread)

When a workstream is active, `loadConfig` reads the **root** config first so the workstream can
inherit from it. That read has its own catch that swallows a parse failure with no warning and no
defaults branch — it simply proceeds with `rootParsed = null`:

```
src/core.cts:349   try {
src/core.cts:352     rootParsed = JSON.parse(raw) ...
src/core.cts:372   } catch {
src/core.cts:373     // Root config missing or unparseable — workstream config stands alone
```

A workstream user who set `model_profile: quality` (or security/commit settings) in the **root**
config and later introduces one typo there gets that root config **silently dropped**, falling to
defaults, while the workstream config alone stands — with no signal. This is a strictly *deeper*
instance of H-01 than the M1 quick-win covered (M1 cited only the workstream-config catch).

**Reproduction (2026-06-08):**
```bash
$ printf '{ "model_profile": "quality", BROKEN }' > /tmp/p13ws/.planning/config.json   # ROOT, malformed
$ printf '{ "commit_docs": false }'              > /tmp/p13ws/.planning/ws/api/config.json
$ GSD_WORKSTREAM=api gsd-tools state load --cwd /tmp/p13ws | grep model_profile
  "model_profile": "balanced",                  # root 'quality' silently lost, no warning (EXIT 0)
```

```yaml
- id: F-CORR-04
  problem_type: wrongness
  subsystem: engine
  file:line: "src/core.cts:372-374 (root-config catch swallows a parse failure when a workstream is active); repro /tmp/p13ws"
  severity: 3                  # narrower population (workstream users) but same silent-loss class; the inheritance source vanishes
  effort: S
  risk: med                    # part of the H-01 contract; same multi-runtime regression surface
  confidence: 5                # reproduced
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  recommendation: "Fold into the H-01 contract decision (F-CORR-02): whatever loadConfig does on a parse failure, do it for BOTH the root and workstream config reads. At minimum, warn on the root-config catch too. (Also note a path-resolution divergence surfaced in repro: config-get while GSD_WORKSTREAM=api looks under .planning/workstreams/api/ — verify the loadConfig workstream path and the config-get/-set path agree before any contract change.)"
  recall_gate: n/a
  provenance: "M1 H-01 thread; not in QW-REL — surfaced fresh this phase as the root-config half of the same swallow."
  debt_quadrant: prudent-inadvertent
```

### F-CORR-05 — Empty-output slug collapses distinct names to the same `NN-` dir (collision/overwrite; QW-REL-02 escalated)

`generateSlugInternal` guards empty **input** but not empty **output**: a name made entirely of
characters outside `[a-z0-9]` (non-Latin scripts, emoji, punctuation) sanitizes to `''`.

```
src/core.cts:1919  if (!text) return null;                        // guards empty INPUT only
src/core.cts:1920  return text.toLowerCase().replace(/[^a-z0-9]+/g,'-') ...   // non-Latin → '' OUTPUT
```

The slug is consumed into the phase-directory name (`src/commands.cts:1164,1169`). Two **distinct**
phase names at the same phase number therefore collapse to the **same** `NN-` directory — the
second silently reuses/overwrites the first, both reporting `created: true`. M1 rated this MED as a
"malformed dir"; the deeper reproduction shows it is a **collision / silent-overwrite**, which is a
data-correctness defect, not just cosmetics.

**Reproduction (2026-06-08):**
```bash
$ gsd-tools generate-slug "日本語のテスト"     # {"slug": ""}   (EXIT 0)
$ gsd-tools generate-slug "!!!@@@###"          # {"slug": ""}   (EXIT 0)

$ gsd-tools scaffold phase-dir --phase 1 --name "日本語"  --cwd /tmp/p13s2  # directory: ".planning/phases/01-"
$ gsd-tools scaffold phase-dir --phase 1 --name "한국어"  --cwd /tmp/p13s2  # directory: ".planning/phases/01-"  (created:true)
$ ls /tmp/p13s2/.planning/phases/   # → 01-   (ONE dir for two distinct phase names)
```

```yaml
- id: F-CORR-05
  problem_type: wrongness
  subsystem: engine
  file:line: "src/core.cts:1919-1920 (empty-OUTPUT slug ungarded); consumed src/commands.cts:1164,1169; repro /tmp/p13s2 (two names → one 01- dir)"
  severity: 3                  # collision + silent overwrite for non-English newcomers; created:true masks it
  effort: S                    # guard the empty-output case in generateSlugInternal + callers
  risk: low                    # additive guard; behavior change only on the currently-broken path
  confidence: 5                # reproduced end-to-end incl. the same-number collision
  runtime_blast_radius: all-16 # slug + phase scaffolding is runtime-agnostic engine
  mechanical_vs_instructional: n/a
  recommendation: "When sanitization collapses a name to '' after stripping, fall back to a deterministic non-empty stub (e.g. a transliterated/hashed token, or 'phase') AND surface a warning, so the directory is never 'NN-' and two phases never collide. Never return created:true for a directory whose slug is empty."
  recall_gate: n/a
  provenance: "QW-REL-02 (M1); escalated: deeper repro shows collision/overwrite (data loss), not just a trailing-dash dir — severity raised from cosmetic to correctness."
  debt_quadrant: prudent-inadvertent
```

### F-CORR-06 — Unresolved runtime defaults user-facing slash hints to Claude form (H-02)

`resolveRuntime` precedence is `GSD_RUNTIME` env > `config.runtime` > `'claude'`
(`src/runtime-slash.cts:79-104`), and `formatGsdSlash` falls back to `claude` when runtime is
absent (`runtime-slash.cts:56`). So a Codex/Gemini user whose config has **no `runtime:` key** and
who has **no `GSD_RUNTIME` env** gets `/gsd-<cmd>` emitted in every fix-hint, error message, and
persisted ROADMAP entry — when Codex needs the shell-var `$gsd-<cmd>` form. Worse, `resolveRuntime`
reads config directly with its own catch (`runtime-slash.cts:98`), so a **malformed** config
(the F-CORR-02 root cause) *also* silently degrades to the Claude form. H-02 is therefore not an
isolated divergence — it shares the H-01 silent-config-swallow root cause.

**Reproduction (2026-06-08, direct module call, read-only):**
```bash
$ node -e 'const r=require("./gsd-core/bin/lib/runtime-slash.cjs");
  console.log(r.formatGsdSlash("gsd-plan-phase", r.resolveRuntime("/tmp/none")));'  # /gsd-plan-phase  (no config → claude)
$ # malformed config that INTENDED codex:
$ echo "{ runtime: codex BROKEN }" > /tmp/p13rt/.planning/config.json
$ node -e '...resolveRuntime("/tmp/p13rt")...'                                       # /gsd-plan-phase  (swallowed → claude)
$ # valid codex config:
$ echo '{"runtime":"codex"}' > /tmp/p13rt/.planning/config.json
$ node -e '...'                                                                      # $gsd-plan-phase  (correct)
```

```yaml
- id: F-CORR-06
  problem_type: wrongness
  subsystem: engine            # src/runtime-slash.cts; user-facing emission
  file:line: "src/runtime-slash.cts:56 (formatGsdSlash claude default), :79-104 (resolveRuntime precedence), :98 (malformed-config catch → claude); repro /tmp/p13rt"
  severity: 3                  # Codex/Gemini newcomers shown an invocation form that won't work; cosmetic-but-misleading on first touch
  effort: M                    # verifying/repairing the resolution chain across the install seam (does the installer always write runtime: into config?) is a cross-runtime audit
  risk: med                    # changing the default could mis-emit for genuinely-unknown runtimes
  confidence: 5                # reproduced for both the no-config and malformed-config paths
  runtime_blast_radius: multi  # codex (slash form) + any runtime relying on persisted hints; doc/UX overlap with Phase 15
  mechanical_vs_instructional: n/a
  recommendation: "Ensure bin/install.js persists `runtime:` into .planning/config.json at init for every non-Claude runtime so resolveRuntime never silently defaults; and once F-CORR-02's parse-failure warning lands, resolveRuntime's catch (:98) should also be observable rather than silently claude. Verify the GSD_RUNTIME>config.runtime>'claude' chain end-to-end per runtime (Phase 15 UX overlap)."
  recall_gate: n/a
  provenance: "M1 H-02; resolved — full chain traced + reproduced; tied to the H-01 root cause."
  debt_quadrant: prudent-inadvertent
```

### F-CORR-07 — Three inconsistent "data-not-present" contracts across read commands (H-03, QW-REL-03)

Sampling the read-command surface against a project with **no `.planning/`** (and a valid
subcommand, to exclude usage errors) shows **three** distinct contracts for "the data isn't there":

| command (no `.planning/`) | stdout shape | exit |
|---|---|---|
| `state load` | structured default config JSON | **0** |
| `progress` | `{milestone…, percent:0}` | **0** |
| `find-phase 1` | `{found:false, directory:null}` | **0** |
| `phases list` | `{directories:[], count:0}` | **0** |
| `roadmap validate` | `{warnings:[]}` (vacuous pass) | **0** |
| `roadmap analyze` | **`{error:"ROADMAP.md not found", milestones:[]}`** | **0** |
| `audit-uat` | `Error: No phases directory found …` | **1** |
| `milestone complete` | `Error: version required …` | **1** |

So the surface uses **(1) exit-0 structured default**, **(2) exit-0 error-object** (`roadmap
analyze`), and **(3) exit-1 hard error** (`audit-uat`) for what is the same condition. The exit-0
*query* contract (returning `found:false`/defaults) is deliberate and workflow-parsed — but the
exit-0 *error-object* shape (variant 2) is the genuinely confusing one: a workflow checking the
exit code sees success while the payload is an error.

**Reproduction (2026-06-08):**
```bash
$ cd /tmp/p13e4   # no .planning/
$ for c in "state load" "progress" "find-phase 1" "phases list" \
           "roadmap analyze" "roadmap validate" "milestone complete" "audit-uat"; do
    gsd-tools $c --cwd /tmp/p13e4 >/dev/null 2>&1; echo "exit=$? :: $c"; done
  # exit=0 state load / progress / find-phase 1 / phases list / roadmap analyze / roadmap validate
  # exit=1 milestone complete / audit-uat
```

```yaml
- id: F-CORR-07
  problem_type: wrongness
  subsystem: engine
  file:line: "repro /tmp/p13e4 (exit-code + shape matrix); roadmap-analyze error-object-with-exit-0 is the variant-2 case (src/roadmap.cts cmdRoadmapAnalyze 'ROADMAP.md not found' branch)"
  severity: 2                  # mostly workflow-internal; the exit-0 error-object is the confusing edge, not the exit-0 defaults
  effort: M                    # a principled contract across the full ~50-subcommand surface is a sweep
  risk: low                    # documentation/contract clarification; behavior change only if commands are aligned
  confidence: 4                # exit codes captured directly; matrix is a sample of the surface, not exhaustive (charter §3.4.4 — residual flagged)
  runtime_blast_radius: none   # contract/doc clarification
  mechanical_vs_instructional: n/a
  recommendation: "Define and document a 3-way contract: QUERIES that legitimately return 'absent' (state/progress/find-phase/phases list) keep exit-0 + structured default; commands that hard-require an artifact (audit-uat/milestone) keep exit-1; ELIMINATE the exit-0 error-object shape (roadmap analyze) by either making it a structured default (exit 0, no `error` key) or a hard error (exit 1) — pick per command, do not leave a payload that says 'error' on a success exit. Quick-win = document the contract (QW-REL-03); the alignment is the deeper H-03 sweep."
  recall_gate: n/a
  provenance: "QW-REL-03 (M1) + M1 H-03; resolved — sampling widened to a 3-contract taxonomy with the error-object variant identified as the real defect."
```

### F-CORR-08 — Node floor contradiction with no installer guard (H-04, QW-REL-05)

`package.json` `engines.node` requires **`>=22.0.0`** (`package.json:47`), but onboarding docs tell
newcomers **"Node.js 18+"**, `bin/install.js` has **no `process.version` guard**, and there is **no
`.npmrc` with `engine-strict`** (so npm only *warns* `EBADENGINE`). A newcomer on Node 18–21 — a
version the docs explicitly bless — installs successfully. The engine does not hard-crash on Node 18
(the one Node-22-era call in `src/` is `structuredClone`, `src/configuration.cts:196`, which is Node
17+), so the failure is **late and confusing** rather than immediate: the package declares it won't
run, but nothing enforces it and the docs contradict it.

**Reproduction (2026-06-08, read-only):**
```bash
$ grep '"node"' package.json                                       # ">=22.0.0"
$ grep -cniE 'process\.version|engine-strict|EBADENGINE' bin/install.js   # 0  (no guard)
$ ls .npmrc                                                         # not present
$ grep -rliE 'node\.?js 18|18\+' docs/ | grep -v review | wc -l     # 22 files (re-verified live 2026-06-08; 16 are user-facing onboarding/translation docs, 6 are audit/stream self-references)
$ head docs/tutorials/your-first-project.md  # "Node.js 18 or later — node --version should print v18.x.x or higher"
```

```yaml
- id: F-CORR-08
  problem_type: wrongness
  subsystem: installer         # bin/ + docs
  file:line: "package.json:47 (engines.node '>=22.0.0') vs docs/tutorials/your-first-project.md:15 & docs/how-to/install-on-your-runtime.md:5 ('Node.js 18+', 22 files match the grep re-verified live 2026-06-08; 16 of those are user-facing onboarding/translation docs, 6 are audit/stream self-references); no process.version guard in bin/install.js; no .npmrc; repro /tmp (read-only)"
  severity: 3                  # spotlight-eve first-touch landmine: docs endorse a version the package rejects
  effort: S                    # doc floor edit (18→22) + one-line process.version major-version guard in bin/install.js
  risk: med                    # the install-guard half touches every runtime's install path (the doc half is blast:none)
  confidence: 5                # all four facts verified live; engines/docs/guard/npmrc
  runtime_blast_radius: all-16 # install-path guard touches every runtime install; doc half is none
  mechanical_vs_instructional: n/a
  recommendation: "Quick-win (QW-REL-05): correct the doc floor 18+ → 22+ across the 16 user-facing onboarding docs (incl. translations; 22 total grep matches, 6 being audit/stream self-references) AND add a one-line process.version major-version guard in bin/install.js that fails fast with a clear message. RESIDUAL (H-04, charter §3.4.4): a full per-runtime install→first-command→first-artifact failure-mode trace across all 16 runtimes was not exhaustively reproduced here (the 12.7k-LOC bin/install.js monolith — see static F-MAINT-05); flagged as a follow-up, carded at the confidence reached."
  recall_gate: n/a
  provenance: "QW-REL-05 (M1, adversarial-review H-1) + M1 H-04; resolved at evidence-ceiling, per-runtime trace residual flagged."
  debt_quadrant: reckless-inadvertent   # a declared engine floor with no enforcement + contradicting docs is a knowing-gap-adjacent oversight
```

### F-CORR-09 — `verify artifacts`: error-object with exit 0 + no `all_passed`; vacuous pass on content-less declarations

Two adjacent reach/contract gaps in `cmdVerifyArtifacts`:

1. **No-artifacts plan** → emits `{error:'No must_haves.artifacts found'}` with **exit 0 and no
   `all_passed` field** (`src/verify.cts:372-375`). An orchestrator reading `all_passed` gets
   `undefined` (falsy *or* skipped, depending on the check); one reading the exit code gets success.
   Same exit-0-error-object hazard as F-CORR-07.
2. **Vacuous pass** → a declared artifact with only a `path` (no `min_lines`/`contains`/`exports`)
   passes as long as the file *exists*, regardless of content (`src/verify.cts:385-405`). The
   artifact verifier confirms presence, not correctness — fine if understood, but combined with (1)
   it means "no checks declared" and "all checks trivially pass" are easy to reach unknowingly.

**Reproduction (2026-06-08):**
```bash
$ gsd-tools verify artifacts /tmp/p13v/plan-none.md --cwd /tmp/p13v       # {"error":"No must_haves.artifacts found"}  EXIT 0
$ gsd-tools verify artifacts /tmp/p13v/plan-vacuous.md --cwd /tmp/p13v     # {"all_passed":true,"passed":1,...}          EXIT 0
                                                                            # plan declares only a path; 1-line file passes
```

```yaml
- id: F-CORR-09
  problem_type: wrongness
  subsystem: engine
  file:line: "src/verify.cts:372-375 (no-artifacts → exit-0 error-object, no all_passed) and :385-405 (path-only artifact passes on existence alone); repro /tmp/p13v"
  severity: 2                  # depends on the orchestrator reading the right field; the missing all_passed is the real ambiguity
  effort: S                    # always include all_passed (false) in the no-artifacts branch; document existence-only semantics
  risk: low
  confidence: 5                # reproduced both branches
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  recommendation: "Make the no-artifacts branch return {all_passed:false, reason:'no artifacts declared'} (or exit 1) so consumers get a consistent shape; and document that artifact verification is presence + optional content predicates, not correctness — a plan that wants real coverage must declare min_lines/contains/exports. Pairs with F-CORR-07 (kill exit-0 error-objects)."
  recall_gate: n/a
  debt_quadrant: prudent-inadvertent
```

### F-CORR-10 — `validate` scans wrap whole per-phase loops in empty catches (under-report risk)

Distinct from the legitimate cleanup empty-catches (§0.1), two **validation** functions wrap their
*entire per-phase-root scan* in `catch { /* intentionally empty */ }`:

```
src/verify.cts:696   try { ... readdirSync(phaseRoot) ... read each PLAN.md frontmatter ... }
src/verify.cts:742   catch { /* intentionally empty */ }        # cmdValidateConsistency
src/verify.cts:841   try { ... read ROADMAP.md inside health ... }
src/verify.cts:847   catch { /* intentionally empty */ }        # cmdValidateHealth
```

If a `readdirSync`/`readFileSync` throws mid-loop (a permission error, an unreadable file, a race),
the scan for that phase root is **silently abandoned** and the function can still report
`passed: true` / no warnings — a *validator* under-reporting because of a swallowed I/O error.
Carded at **file:line confidence** (a real-fault reproduction would need an induced FS error, which
exceeds read-only scope — charter §3.4.4); the swallow is structurally present and on the
verification path, so it is a genuine (if low-blast) reach gap, not the benign cleanup pattern.

```yaml
- id: F-CORR-10
  problem_type: wrongness
  subsystem: engine
  file:line: "src/verify.cts:696-744 (cmdValidateConsistency per-phase loop) and :841-849 (cmdValidateHealth roadmap read) — whole-loop empty catch"
  severity: 2                  # a validator can report clean over phases it failed to scan; needs an I/O fault to trigger (rare)
  effort: S                    # narrow the try, or record a warning ('could not scan phase X: <err>') in the catch instead of swallowing
  risk: low
  confidence: 4                # file:line confirmed; behavioral trigger not reproduced (would require an induced FS fault — residual)
  runtime_blast_radius: claude-only   # validate/health are primarily the health/manager Claude flow
  mechanical_vs_instructional: n/a
  recommendation: "Replace the whole-loop swallow with a per-phase warning so a scan failure DEGRADES the result (adds a warning / sets a 'scan_incomplete' flag) instead of silently passing. A validator must never report 'consistent' over a phase it could not read."
  recall_gate: n/a
  debt_quadrant: prudent-inadvertent
```

### F-CORR-07b — Drift exception branch returns an empty human message (QW-REL-04)

`drift.cts` is correctly non-blocking; on an internal exception it returns
`skipped('exception:'+errMsg)` (`src/drift.cts:255`), but `skipped()` hard-codes `message: ''`
(`src/drift.cts:268`). The cause is preserved in `reason`, but a workflow that echoes the
human-facing `message` prints a blank line on a real drift-detector failure.

```yaml
- id: F-CORR-07b
  problem_type: wrongness
  subsystem: engine
  file:line: "src/drift.cts:252-255 (exception → skipped('exception:'+msg)) → :259-270 (skipped sets message:'')"
  severity: 1                  # rare path; non-blocking by design; reason carries the cause
  effort: S                    # populate message from errMsg on the exception branch
  risk: low
  confidence: 5                # file:line confirmed (read this phase)
  runtime_blast_radius: claude-only   # drift mapper is primarily a Claude Agent() flow
  mechanical_vs_instructional: n/a
  recommendation: "On the exception branch only, set message to a human line derived from errMsg (keep message:'' for the deliberate by-design skips) so a real failure isn't echoed as a blank line."
  recall_gate: n/a
  provenance: "QW-REL-04 (M1); folds in unchanged."
  debt_quadrant: prudent-deliberate
```

---

## 3. Cross-MECE notes (findings that live in another lens — handed off, not carded here)

Per charter §1.1, a concern that cannot produce a *wrong result today* is not `wrongness`. Two
strong leads from the upstream evidence were assessed and **routed away** to keep the partition
clean:

- **Stale `vitest.config.ts` (`root: './sdk'`) + dead SDK comments** (Phase-9 reflexivity finding
  #5). Verified live: `git ls-files sdk/` → **0 files**, `vitest.config.ts:9,17` still point at the
  non-existent `./sdk`, vitest is **not** in `package.json` deps and is **not wired to any npm
  script**, and `gsd-core/bin/gsd-tools.cjs:648,731,803,840…` carry dead `// SDK handler: sdk/src/…`
  comments. This is a **broken-but-never-run** config: it cannot produce a wrong *pipeline* outcome
  (it is dead), so by MECE it is **`waste`/`change-cost`, not `wrongness`** → **handoff to Phase 12**
  (already a Phase-9/10 lead). The one *correctness-adjacent* risk worth flagging to Phase 12: a
  vitest project rooted at a missing dir collects 0 tests and exits green, so if anyone ever wired
  it into CI it would give a **false-green** — but since it is unwired, that is a latent
  maintainability hazard, not a present defect.
- **`bin/install.js` 12,727-LOC monolith** (static F-MAINT-05) — the per-runtime first-run trace
  residual (H-04) lives partly inside it. Carded as the change-cost surface in Phase 12; the
  *behavioral* first-run defects it can hide are captured here as F-CORR-08 (Node floor) + F-CORR-06
  (slash form), with the exhaustive per-runtime trace flagged as a residual.

---

## 4. How the M1 reliability handoffs resolved (charter §5, narrative)

- **H-01 (config-parse contract).** Resolved into **F-CORR-02** (workstream-config silent default,
  the hot-path divergence vs `config-get`) **plus the deeper F-CORR-04** (root-config silent swallow
  when a workstream is active — *new* this phase). The quick-win warning (QW-REL-01) folds in
  unchanged; the **contract decision** (error vs default vs structured-warning, applied to BOTH
  reads) is specified as a scoped engine change with an all-16-runtime regression gate.
- **H-02 (slash-hint divergence).** Resolved into **F-CORR-06**: the full
  `GSD_RUNTIME > config.runtime > 'claude'` chain traced and reproduced for the no-config AND
  malformed-config paths, showing it shares the H-01 silent-config-swallow root cause; recommendation
  is to persist `runtime:` at install and make the resolver's catch observable.
- **H-03 (exit-code audit).** Resolved into **F-CORR-07** (a three-contract taxonomy:
  exit-0-default / exit-0-error-object / exit-1, with the **error-object-on-success-exit** variant
  identified as the real defect) **plus F-CORR-09** (the same shape inside `verify artifacts`). The
  full ~50-subcommand principled contract is the deeper work; the sample is honest about being a
  sample (residual flagged, charter §3.4.4).
- **H-04 (per-runtime first-run trace).** Resolved at the **evidence ceiling**: the two concrete
  first-run correctness landmines were reproduced — **F-CORR-08** (Node floor with no guard) and
  **F-CORR-06** (wrong slash form on unresolved runtime). The exhaustive per-runtime
  install→first-command→first-artifact trace through the 12.7k-LOC `bin/install.js` is **explicitly
  flagged as a residual follow-up** (charter §3.4.4) rather than blocking the sweep on one expensive
  confirmation.

---

## 5. Honesty & coverage statement (charter §3.2, §3.4, SC-1..SC-4)

Every card cites a `src/*.cts` `file:line` and/or a concrete `/tmp` reproduction a reviewer can
re-run; no `bin/lib/*.cjs` path is cited (charter §0). **9 of 11 findings were reproduced live**
against the compiled engine; the 2 cited-only (F-CORR-10, F-CORR-07b) carry exact `file:line` and
state why a behavioral trigger was out of read-only scope. The hottest HOTSPOTS targets were read
(`core.cts`, `config.cts`, `verify.cts` incl. its cx-150 health function); the intentional patterns
M1 flagged were **re-confirmed clean and NOT re-carded** (§0.1). All four M1 handoffs are resolved;
all five QW-REL items are folded in (two escalated). Where behavior contradicts the pipeline's
self-narration (verify-summary's name vs its 2-file reach; `created:true` on an empty slug;
`config-get` errors while `loadConfig` hides), the **observation is recorded as the finding**
(charter §3.1). Two oversized leads were routed to Phase 12 to keep the MECE partition clean (§3).

*Plan-only attestation: this phase created only
`docs/audit/comprehensive/concerns/pipeline-correctness.md` and the Phase-13 planning artifacts
under `.planning/phases/13-concern-sweep-pipeline-correctness-deep/`. No protected path
(`package.json`, `src/`, `gsd-core/`, `workflows/`, `agents/`, `commands/`, `bin/`, `.gitignore`,
`vitest.config.ts`) was edited; no git commit; no GitHub write; no project-state mutation. All
reproductions ran read-only in throwaway `/tmp` directories. The firewall (`.planning/codebase/*`,
`.planning/notes/*-2026-06-05.md`, frontier synthesis) was honored — only the charter, Phase 7–10
deliverables, the M1 reliability stream + quick-win backlog, and live `src/*.cts` were opened.*

> **Firewall clarification (added in the M2 adversarial-review remediation, 2026-06-08).** The
> experiment references in this sweep's recall-gate and framing prose (N17 verifier-abstention, N18
> prohibition-elicitation, and the upstream edge-probe / self-grade PRs) are **not** drawn from the firewalled prior artifacts
> (`.planning/codebase/*`, `.planning/notes/*-2026-06-05.md`, the frontier synthesis), which were
> not opened during this phase. They are independent knowledge from the author's separate
> experiment program (general knowledge / persistent user memory) and from public GitHub PR
> content — the same IDs the red-team confirmed (`ADVERSARIAL-M2-EVIDENCE.md` A-10) "also live in
> the user's MEMORY, so an agent could surface them without opening the firewalled file." The
> findings themselves (F-CORR-01/03) rest entirely on freshly-reproduced `src/*.cts` code, not on
> any prior-experiment framing. The "firewall honored" attestation is therefore literally true:
> no prior-AUDIT artifact was opened; the experiment IDs are independent knowledge, not seepage.