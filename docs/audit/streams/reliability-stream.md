# Stream C — Reliability Quick-Win Stream Note

**Phase:** 4 (Reliability Quick-Win Stream)
**Produced:** 2026-06-07
**Lens:** newcomer-visible **workflow/result reliability** — places where a first-time user
gets a wrong, confusing, or silently-unreliable outcome.
**Status:** plan-only. Drafts owner-assignable quick-wins; ships no code.
**Convergence target:** Phase 5 (merges Streams A/B/C into the published backlog).

> **Method honesty (reflexivity guard, D-01).** This is a fresh, independent read of the
> **live** engine. Every concern below is grounded in a **concrete reproduction I ran** or a
> `file:line` citation in `src/*.cts` — never "the docs say it should." Source of truth is
> `src/*.cts`; reproductions were run against the compiled `gsd-core/bin/gsd-tools.cjs` to
> observe real behavior, with **no mutations** to this repo or any project state (all repros
> ran in throwaway `/tmp` dirs). A concern without a repro or `file:line` is **not** a
> quick-win — it is handed off to the Phase 13 deep correctness sweep (§4).

---

## 1. Probe results — candidate areas (verified, not assumed)

The Phase-4 CONTEXT named a *probe list* (NOT findings). Each was verified against live code.
Honest outcome of each probe:

| Candidate (from CONTEXT) | Verdict | Evidence |
|---|---|---|
| Empty-catch error swallowing | **Mostly clean** | Only 3 empty catches in `src/`, all `try { fs.unlinkSync(...) } catch {}` cleanup (`active-workstream-store.cts:135,154,160`) — legitimate best-effort. Not a finding. |
| No-throw routing hub hides failure | **Clean** | `command-routing-hub.cts` returns `{ok:false,kind}` but the adapter re-surfaces every failure via `error()` → exit 1 (`cjs-command-router-adapter.cts:126-135`). No swallowing. Not a finding. |
| Drift detector `{skipped:true}` on bad input | **By-design, low severity** | Non-blocking is intentional (`drift.cts:259-270`); but the exception path returns `message:''` (`drift.cts:252-255`) → see C-04. |
| Installer per-migration catch-and-continue | **Clean** | Migration runner has full rollback with collected `failures[]` (`installer-migrations.cts:614-664, 814+`); failures are not silently dropped. Not a finding. |
| First-run cross-runtime divergence | **Partial** | Slash-form defaults to `claude` when runtime unresolved (`runtime-slash.cts:56`) → see C-05 (handed off; depends on config wiring). |
| **NOT on the probe list, found by reproduction** | **REAL** | Malformed `.planning/config.json` silently falls back to defaults (C-01); non-Latin/symbol phase names produce empty slugs / malformed dirs (C-02). These are the headline findings. |

**Takeaway:** the *assumed* swallowing patterns are largely well-handled. The real
newcomer-visible reliability holes are two **silent-wrong-result** bugs that only surfaced by
actually running the tools with bad input — exactly the behavior-over-narration the reflexivity
guard demands.

---

## 2. Documented concerns (each with a reproduction or file:line)

### C-01 — Malformed `.planning/config.json` silently reverts to defaults (no warning) — **HIGH**

`loadConfig()` wraps the parse + merge in a try/catch whose catch, when `.planning/` exists but
the config is unparseable, returns the built-in `defaults` with **no stderr warning**:

```
src/core.cts:545   } catch {                                     # re-pinned to next 2026-06-08 (was 544)
src/core.cts:547     if (fs.existsSync(planningDir(cwd, ws))) {
src/core.cts:552       return defaults;          // ← silent: user's real config is discarded
```

By contrast, `config-get` / `config-set` correctly **error and exit 1** on the same malformed
file (`src/config.cts:639` config-get / `:429` config-set, `CONFIG_PARSE_FAILED` — re-pinned
to next 2026-06-08; was `:417`). So two code paths disagree on the same file,
and the one on the hot path (every workflow reads config via `loadConfig`) is the one that
hides the problem.

**Reproduction (run 2026-06-07):**
```bash
mkdir -p /tmp/t/.planning && cd /tmp/t
printf '{ "model_profile": "quality", "commit_docs": false, BROKEN }' > .planning/config.json

gsd-tools config-get model_profile
# → Error: Failed to read config.json: Expected double-quoted property name ...   (exit 1)  ✅ visible

gsd-tools state load   | grep model_profile
# → "model_profile": "balanced",   (exit 0)   ❌ silently WRONG — user asked for "quality"

gsd-tools resolve-model gsd-executor
# → { "profile": "balanced" }   ❌ silently downgraded models, no warning
```

**Newcomer impact:** a first-timer who hand-edits `config.json` (to set `commit_docs:false`,
a model profile, or security settings) and makes one typo gets **silently downgraded models
and ignored settings on every command** — with `state load` reporting clean success. The
result looks right and is wrong. **Quick-win:** add a single `process.stderr.write(...)` warning
in the `loadConfig` catch when the file exists-but-failed-to-parse (mirroring the existing
unknown-key warning at `core.cts:456` — re-pinned to next 2026-06-08; was `:455`), so the silent fallback announces itself. (Fixing the
divergence to *error* like `config-get` is a larger behavior change → noted for Phase 13.)

### C-02 — Non-Latin / all-symbol names produce an empty slug and a malformed phase dir — **MED**

`generateSlugInternal` strips everything outside `[a-z0-9]`, and its only guard is on empty
**input**, not empty **output**:

```
src/core.cts:1919  function generateSlugInternal(text) {                       # re-pinned to next 2026-06-08 (was 1863)
src/core.cts:1920    if (!text) return null;                                   // guards empty INPUT only
src/core.cts:1921    return text.toLowerCase().replace(/[^a-z0-9]+/g,'-')...    // non-Latin → '' OUTPUT
```

The `generate-slug` command surfaces this directly, and `scaffold phase-dir` consumes it into a
directory name (`src/commands.cts:1166,1171` — re-pinned to next 2026-06-08; was `1164,1169`).

**Reproduction (run 2026-06-07):**
```bash
gsd-tools generate-slug "日本語のテスト"   # → {"slug": ""}   (exit 0)
gsd-tools generate-slug "!!!@@@###"        # → {"slug": ""}   (exit 0)

mkdir -p /tmp/s/.planning && cd /tmp/s
gsd-tools scaffold phase-dir --phase 1 --name "日本語テスト"
# → { "created": true, "directory": ".planning/phases/01-" }   ❌ trailing-dash, no slug
ls .planning/phases/    # → 01-/
```

**Newcomer impact:** a non-English-speaking newcomer (or anyone using emoji/punctuation in a
phase name) silently gets an indistinguishable `phases/NN-/` directory, reported as
`"created": true`. Two such phases collide on the same empty slug. **Quick-win:** when the
slug collapses to empty after sanitization, fall back to a deterministic stub (e.g. `phase`,
or a transliterated/hashed token) **or** emit a warning — so the directory is never `NN-`.

### C-03 — Exit-code inconsistency across sibling commands on a missing `.planning/` — **LOW**

On a project with no `.planning/` directory, data-read commands disagree on exit code:

| Command (no `.planning/`) | stdout | exit |
|---|---|---|
| `state load` | full default config JSON | **0** |
| `progress` | `{"phases":[],...,"percent":0}` | **0** |
| `find-phase 1` | `{"found":false,...}` | **0** |
| `roadmap` | `Error: ...` | **1** |

**Reproduction (run 2026-06-07, exit captured directly, no pipe):**
```bash
cd /tmp/empty
gsd-tools state load  >/dev/null 2>&1; echo $?   # 0
gsd-tools progress    >/dev/null 2>&1; echo $?   # 0
gsd-tools find-phase 1>/dev/null 2>&1; echo $?   # 0
gsd-tools roadmap     >/dev/null 2>&1; echo $?   # 1
```

`state`/`progress`/`find-phase` returning structured "empty" results with exit 0 is a
**deliberate** contract (workflows parse `found:false` / defaults), so this is **LOW**: it is
mostly workflow-internal, not a command a newcomer types raw. The quick-win is documentation /
a consistency note, not a behavior change — flagged so Phase 5 doesn't over-rate it.

### C-04 — Drift exception path returns an empty human message — **LOW**

`drift.cts` is correctly non-blocking, but its catch-all converts a genuine internal exception
into `skipped('exception:'+msg)` whose `message` field is `''` (`drift.cts:252-255` →
`skipped()` at `259-270` sets `message:''`). The reason carries the exception text, but the
human-facing `message` a workflow might echo is blank. **LOW** (non-blocking by design; the
reason field preserves the cause). Quick-win: populate `message` on the exception branch so a
real drift-detector failure isn't echoed as an empty line.

### C-05 — Node-version contradiction on the first-run path; no installer guard — **HIGH** (added by adversarial review)

> **Provenance:** this concern was **missed by the original reliability sweep** and surfaced by
> the adversarial Process review (`docs/audit/review/ADVERSARIAL-PROCESS.md`, H-1). Added here so
> the stream note matches the published backlog. It is a Reliability finding with a UX/install
> co-lens (it is also a doc-drift issue on the newcomer's first screen).

`package.json` `engines.node` requires **`>=22.0.0`**, but every onboarding doc tells a newcomer
**"Node.js 18+"** — and `bin/install.js` has **no `process.version` guard**, and there is **no
`.npmrc` with `engine-strict`** (so npm only *warns* `EBADENGINE`, it does not block). A newcomer
on Node 18–21, which the docs explicitly endorse, installs successfully and then hits a confusing
or late Node-22-targeted runtime failure.

**Verification (run 2026-06-08, read-only):**
```bash
grep -A2 '"engines"' package.json                 # → node: ">=22.0.0"
grep -niE 'node.?js 18|v18' docs/how-to/install-on-your-runtime.md docs/tutorials/your-first-project.md
# → install-on-your-runtime.md:5  "Node.js 18+ and npm (or npx)"
# → your-first-project.md:15      "Node.js 18 or later — node --version should print v18.x.x or higher"
grep -rliE 'node.?js 18' docs/ | grep -v review    # → 18 doc files on next (re-pinned 2026-06-08; was ~15) (en + ja-JP/ko-KR/pt-BR/zh-CN translations)
grep -niE 'process\.version|EBADENGINE|engine-strict' bin/install.js   # → none
ls .npmrc                                          # → not present
```

**Newcomer impact:** the docs actively tell a first-timer that Node 18 is fine; the package
rejects it. This is the textbook spotlight-eve first-touch landmine the fast-track exists to
prevent. **Quick-win (QW-REL-05):** correct the doc floor `18+` → `22+` across all ~15 onboarding
docs (the doc half is `blast: none`) **and** add a one-line `process.version` major-version guard
in `bin/install.js` that fails fast with a clear message (the installer half is `all-14+`). The
full per-runtime engine-compat sweep stays a Phase-13 concern (H-04).

---

## 3. Drafted reliability quick-wins (BACKLOG-SCHEMA, ICE + severity)

```yaml
- id: QW-REL-01
  title: "Warn (don't silently default) when .planning/config.json exists but fails to parse"
  impact: 5          # silently-wrong models/settings on every command is the worst newcomer failure
  confidence: 5      # reproduced; divergence vs config-get is a clear file:line oracle
  ease: 4            # one stderr write in the loadConfig catch, mirroring the existing unknown-key warning
  ice: 100           # 5 × 5 × 4
  tshirt: S
  product: Reliability
  owner: reliability-stream / core.cts owner
  runtime_blast_radius: all-14+    # loadConfig is on every runtime's hot path
  mechanical_vs_instructional: n/a # engine code, not prompt corpus
  severity: high
  citation: "src/core.cts:545-552 (silent fallback) vs src/config.cts:639 config-get / :429 config-set (errors); repro in §2 C-01"   # re-pinned to next 2026-06-08 (was core 544-551, config 417)
  plan_only: true
  recall_gate: n/a

- id: QW-REL-02
  title: "Never emit an empty slug — fall back / warn when sanitization collapses a name to ''"
  impact: 4          # malformed phases/NN-/ dirs + collisions; hits non-English newcomers specifically
  confidence: 5      # reproduced end-to-end (slug → scaffold → dir)
  ease: 4            # guard the empty-OUTPUT case in generateSlugInternal + its callers
  ice: 80            # 4 × 5 × 4
  tshirt: S
  product: Reliability
  owner: reliability-stream / core.cts owner
  runtime_blast_radius: all-14+    # slug + phase scaffolding is runtime-agnostic
  mechanical_vs_instructional: n/a
  severity: med
  citation: "src/core.cts:1919-1921; consumed at src/commands.cts:1166,1171; repro in §2 C-02"   # re-pinned to next 2026-06-08 (was core 1863-1865, commands 1164,1169)
  plan_only: true
  recall_gate: n/a

- id: QW-REL-03
  title: "Document (or align) the exit-code contract for no-.planning/ data reads"
  impact: 2          # mostly workflow-internal; low newcomer-typed exposure
  confidence: 4      # exit codes captured directly
  ease: 4            # a doc note / contract comment; no behavior change recommended in the quick-win
  ice: 32            # 2 × 4 × 4
  tshirt: S
  product: Reliability
  owner: reliability-stream / docs
  runtime_blast_radius: none       # documentation/contract clarification
  mechanical_vs_instructional: n/a
  severity: low
  citation: "state load/progress/find-phase → exit 0 vs roadmap → exit 1; repro in §2 C-03"
  plan_only: true
  recall_gate: n/a

- id: QW-REL-04
  title: "Populate the human message on the drift-detector exception branch (no blank echo)"
  impact: 2          # rare path; non-blocking by design
  confidence: 4      # file:line confirmed; message:'' on exception
  ease: 5            # set message from errMsg in the catch; one-line change
  ice: 40            # 2 × 4 × 5
  tshirt: S
  product: Reliability
  owner: reliability-stream / drift.cts owner
  runtime_blast_radius: claude-only  # drift mapper is primarily a Claude Agent() flow
  mechanical_vs_instructional: n/a
  severity: low
  citation: "src/drift.cts:252-255 (catch) → src/drift.cts:259-270 (skipped sets message:''); §2 C-04"
  plan_only: true
  recall_gate: n/a

- id: QW-REL-05      # added by adversarial review (H-1); Reliability leads, UX/install co-lens
  title: "Resolve the Node-version contradiction: docs bless Node 18+ while package requires >=22; add a process.version guard"
  impact: 5          # docs endorse a Node version the package rejects → confusing/late first-run failure
  confidence: 5      # verified: engines '>=22' vs '18+' docs vs no installer guard vs no .npmrc
  ease: 4            # doc floor edit (blast none) + one-line process.version guard in bin/install.js
  ice: 100           # 5 × 5 × 4
  tshirt: S
  product: Reliability
  owner: reliability-stream / bin-subsystem co-lens
  runtime_blast_radius: all-14+    # install-path guard touches every runtime install (doc half is blast:none)
  mechanical_vs_instructional: n/a # docs + installer code, not prompt corpus
  severity: high
  citation: "package.json engines.node='>=22.0.0' vs 'Node.js 18+' at docs/how-to/install-on-your-runtime.md:5 & docs/tutorials/your-first-project.md:15 (+4 translations, ~15 files); no process.version guard in bin/install.js; no .npmrc engine-strict; repro in §2 C-05"
  plan_only: true
  recall_gate: n/a
  handoff_note: "Full per-runtime engine-compat trace stays Phase 13 (H-04). The quick-win is the doc-floor correction + a single fail-fast version guard."
```

**Severity tally:** 2 high (QW-REL-01, QW-REL-05), 1 med (QW-REL-02), 2 low (QW-REL-03, QW-REL-04).

---

## 4. Handed off to Phase 13 (deep correctness sweep) — NOT forced into the fast-track (D-04)

These are real or suspected but **too large/systemic for a safe quick-win**; they are explicitly
deferred to Phase 13 rather than jammed into the fast-track:

- **H-01 — Converge the config-parse-failure contract (error vs silent-default).** QW-REL-01
  only adds a *warning*. Making `loadConfig` **error** like `config-get` (or repair/quarantine
  the bad file) changes behavior for every command and every runtime, and could break workflows
  that currently tolerate a missing/partial config. Needs a deliberate contract decision +
  regression sweep. **Phase 13.**
- **H-02 — Runtime-divergence of user-facing slash hints when runtime is unresolved.**
  `runtime-slash.cts:56` defaults to `claude` (`/gsd-…`) when no runtime is resolved; a
  Codex/Gemini newcomer could see the wrong invocation form in error/fix hints. Verifying the
  full resolution chain (`GSD_RUNTIME` > config.runtime > 'claude') across 14+ runtimes and the
  install seam is a cross-runtime audit, not a quick-win. **Phase 13 (with Phase 15 UX overlap).**
- **H-03 — Systematic exit-code audit across the whole subcommand surface.** C-03 found one
  inconsistency by sampling; a full, principled exit-code contract (which commands are
  "queries returning empty" vs "hard errors") across all ~50 subcommands is a sweep. **Phase 13.**
- **H-04 — Full first-run install→first-command→first-artifact failure-mode trace across all
  runtimes.** The install path (`bin/install.js`, ~11k lines bundled) and its per-runtime
  artifact layout were not exhaustively reproduced here; a complete first-run reliability trace
  per runtime is a deep correctness task. **Phase 13.**

---

## 5. Evidence index

| ID | Type | Citation |
|---|---|---|
| C-01 | repro + file:line | `src/core.cts:545-552`; `src/config.cts:639` (config-get) / `:429` (config-set); §2 repro — re-pinned to next 2026-06-08 |
| C-02 | repro + file:line | `src/core.cts:1919-1921`; `src/commands.cts:1166,1171`; §2 repro — re-pinned to next 2026-06-08 |
| C-03 | repro (exit codes) | direct exit-code capture, §2 table |
| C-04 | file:line | `src/drift.cts:252-255, 259-270` |
| C-05 | file:line + repro | `package.json` engines `>=22.0.0`; `docs/how-to/install-on-your-runtime.md:5`; `docs/tutorials/your-first-project.md:15` (+4 translations); no guard in `bin/install.js`; no `.npmrc` (added by adversarial review H-1) |
| Probe verdicts | file:line | `active-workstream-store.cts:135/154/160`; `command-routing-hub.cts`; `cjs-command-router-adapter.cts:126-135`; `installer-migrations.cts:614-664` |

*All reproductions ran read-only in throwaway `/tmp` directories on 2026-06-07; no repo or
project-state mutations were made. Firewall honored: no `.planning/codebase/*`,
`.planning/notes/*-2026-06-05.md`, or frontier-synthesis artifacts were opened.*
