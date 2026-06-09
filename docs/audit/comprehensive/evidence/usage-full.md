# Full Transcript-Usage Report — Per-Command / Per-Skill / Per-Flag

**Phase:** 11 (Behavioral / Usage Mining, full) — Milestone 2 comprehensive audit
**Produces:** behavioral/usage evidence consumed by **Phase 12 (BLOAT-02)** and **Phase 15 (UX-01)**
**Extractor:** `docs/audit/comprehensive/evidence/usage-extract-full.mjs` (read-only; NOT wired into the package)
**Extracted:** 2026-06-08
**Signal type:** **REAL** (mined from live Claude Code transcripts) — see the caveat below.
**Charter:** conforms to `AUDIT-CHARTER.md` §3.2 evidence standard (every cited statistic is independently re-checkable by re-running the extractor).

---

## ⚠️ SINGLE-AUTHOR / POPULATION CAVEAT — load-bearing, inherited by every downstream finding (D-03)

**This is one developer's signal (Dave's local Claude Code transcripts on this machine), not a
population claim.** Every BLOAT-02 / UX-01 finding that cites a number from this report
**inherits this confidence limiter** and MUST carry it forward. It reflects how *one*
power-user drives GSD over the sessions present in `~/.claude/projects/` — useful for "what
does a heavy contributor reach for," **not** for "what newcomers do," and **not** a
statistically representative usage distribution.

Concretely — the guard-rails on what this data licenses:

- A heavy GSD contributor's mix (lots of `gsd-autonomous`, `gsd-resume-work`, `gsd-explore`)
  is **the opposite** of a newcomer's first-run path. Do **not** infer newcomer behavior, and
  do **not** justify a surface cut from low frequency in this signal alone.
- **No command/skill/flag may be cut from the newcomer surface on the strength of low
  frequency here.** Safety/recovery commands are criticality-exempt (M1 `STREAMS.md`); the
  charter requires surface-reduction to be tiered as **progressive disclosure, not
  deletion-by-low-usage** (Phase 12 SC-3, Phase 15 SC-2).
- This is a **single author, n=1** of the population. The v2 requirement **BLOAT-02b /
  VIEW-02** (deferred) would re-run this extractor across multiple maintainers' transcripts to
  lift confidence beyond one author. Until then, treat every count as **directional, not
  decisive**.

> **For finding authors:** when you cite a row from a table below, attach the tag
> `confidence-limiter: single-author (Phase 11)` to the evidence card. A usage statistic from
> this report can *support* a surface/UX finding; it can never be the *sole* basis for a cut.

---

## 1. Coverage & method

### Whose transcripts, and how many

| Denominator | Value | Notes |
|---|---:|---|
| Project directories scanned | **19** | every dir under `~/.claude/projects/` |
| `.jsonl` session files | **92** | one author, this machine |
| User messages (loose count) | **586** | `type=user`, `userType=external`, `!isMeta`, string content — same definition as the M1 extractor |
| User messages (strict / genuine) | **381** | additionally excludes `isSidechain`, empty, and `<command-*>` / `<task-notification>` wrappers — matches `src/profile-pipeline.cts:isGenuineUserMessage` |
| gsd-tools engine command-lines parsed | **132** | distinct `gsd_run` / `node "$GSD_TOOLS"` calls in `Bash` tool_use records |

Two user-message denominators are reported on purpose: the **loose 586** is the apples-to-apples
denominator vs the M1 signal (which used the loose definition); the **strict 381** is the
denominator a calibrated rate should use, because it strips sidechain noise and command-tag
wrappers exactly as the shipped profiler does.

### What was mined (three levels; per-flag + engine-subcommand are the M2 depth)

The extractor extends the M1 `usage-extract.mjs` reducer (itself a repurpose of the read-only
`~/.claude/projects/**/*.jsonl` scan in `src/profile-pipeline.cts` — `scanProjectDir` +
`streamExtractMessages`). It tallies:

1. **Slash-command invocations** — `<command-name>/gsd-*</command-name>` tags (what the user
   explicitly typed). *Same as M1.*
2. **Skill tool invocations** — `Skill` tool-use records with `input.skill` (what actually got
   dispatched, GSD + non-GSD). *Same as M1.*
3. **PER-FLAG / PER-ENGINE-SUBCOMMAND frequency — NEW in M2:**
   - **3a. Slash-command flags** — flag tokens inside `<command-args>`.
   - **3b. gsd-tools engine subcommands + flags** — the `Bash` tool_use commands that invoke
     the GSD engine (`gsd_run <sub>`, `node "$GSD_TOOLS" <sub>`). Subcommands are validated
     against the canonical `gsd-tools --help` allowlist (drops shell-noise tokens like
     `elif`/`echo`/`for`). The `query` dispatch verb is expanded to its namespaced operation
     (`query roadmap.get-phase`, `query init.phase-op`, …) so the table shows the real engine
     surface, not an opaque `query` bucket.

> **Re-run (read-only, deterministic):**
> ```bash
> node docs/audit/comprehensive/evidence/usage-extract-full.mjs          # human tables
> node docs/audit/comprehensive/evidence/usage-extract-full.mjs --json   # machine JSON (Appendix A)
> ```

### Corrected-counting note (carried from M1)

M1 caught and fixed a **command double-count bug** (both `<command-message>` and
`<command-name>` tags matched the same record). This extractor carries the corrected logic
forward: the `<command-name>` tag is the **single source** for slash-command counts;
`<command-message>` is ignored for counting. Each command/skill/flag occurrence is counted
**exactly once per record**.

---

## 2. Ranked: `/gsd-*` slash commands (user-typed) — `USAGE-CMD`

Total slash invocations: **65** across 92 sessions (≈0.71 typed GSD command / session).

| Key | Rank | Command | Invocations | % of typed |
|---|---:|---|---:|---:|
| `USAGE-CMD-01` | 1 | `/gsd-autonomous` | 18 | 27.7% |
| `USAGE-CMD-02` | 2 | `/gsd-resume-work` | 11 | 16.9% |
| `USAGE-CMD-03` | 3 | `/gsd-explore` | 10 | 15.4% |
| `USAGE-CMD-04` | 4 | `/gsd-quick` | 7 | 10.8% |
| `USAGE-CMD-05` | 5 | `/gsd-execute-phase` | 4 | 6.2% |
| `USAGE-CMD-06` | 5 | `/gsd-new-project` | 4 | 6.2% |
| `USAGE-CMD-07` | 7 | `/gsd-discuss-phase` | 2 | 3.1% |
| `USAGE-CMD-08` | 7 | `/gsd-graphify` | 2 | 3.1% |
| `USAGE-CMD-09` | 9 | `/gsd-import` | 1 | 1.5% |
| `USAGE-CMD-10` | 9 | `/gsd-new-milestone` | 1 | 1.5% |
| `USAGE-CMD-11` | 9 | `/gsd-progress` | 1 | 1.5% |
| `USAGE-CMD-12` | 9 | `/gsd-ingest-docs` | 1 | 1.5% |
| `USAGE-CMD-13` | 9 | `/gsd-config` | 1 | 1.5% |
| `USAGE-CMD-14` | 9 | `/gsd-audit-fix` | 1 | 1.5% |
| `USAGE-CMD-15` | 9 | `/gsd-code-review` | 1 | 1.5% |

**15 distinct commands typed** out of the ~70-command installed surface. The unobserved tail
(~55 commands typed 0× in this log) is **NOT evidence of irrelevance** — see the caveat. The
top-4 (`autonomous`, `resume-work`, `explore`, `quick`) account for **70.8%** of typed volume:
the orchestrating/hot-path commands dominate *this* user's mix.

---

## 3. Ranked: Skill tool invocations (dispatched; incl. nested + non-GSD) — `USAGE-SKILL`

Total skill dispatches: **104**. Note dispatches > typed commands (65) because one typed
command fans out to several skill dispatches (e.g. `autonomous` → `plan-phase` → `execute-phase`).

| Key | Rank | Skill | Invocations | GSD? |
|---|---:|---|---:|:--:|
| `USAGE-SKILL-01` | 1 | `gsd-plan-phase` | 18 | ✓ |
| `USAGE-SKILL-02` | 2 | `gsd-execute-phase` | 13 | ✓ |
| `USAGE-SKILL-03` | 3 | `gsd-code-review` | 10 | ✓ |
| `USAGE-SKILL-04` | 4 | `gsd-autonomous` | 8 | ✓ |
| `USAGE-SKILL-05` | 4 | `superpowers:brainstorming` | 8 | ✗ |
| `USAGE-SKILL-06` | 6 | `gsd-resume-work` | 6 | ✓ |
| `USAGE-SKILL-07` | 7 | `gsd-ui-phase` | 5 | ✓ |
| `USAGE-SKILL-08` | 7 | `gsd-explore` | 5 | ✓ |
| `USAGE-SKILL-09` | 9 | `superpowers:receiving-code-review` | 4 | ✗ |
| `USAGE-SKILL-10` | 10 | `gsd-quick` | 3 | ✓ |
| `USAGE-SKILL-11` | 11 | `superpowers:systematic-debugging` | 2 | ✗ |
| `USAGE-SKILL-12` | 11 | `superpowers:test-driven-development` | 2 | ✗ |
| `USAGE-SKILL-TAIL-GSD` | — | GSD long tail, 1× each | verify-work, discuss-phase, audit-milestone, ingest-docs, complete-milestone, new-milestone, secure-phase, map-codebase, phase, graphify, spike | ✓ |
| `USAGE-SKILL-TAIL-EXT` | — | non-GSD long tail, 1× each | `verify`, `claude-api`, `commit-commands:commit`, `loop`, `keybindings-help`, `superpowers:{verification-before-completion, writing-plans, subagent-driven-development, finishing-a-development-branch}` | ✗ |

**32 distinct skills dispatched** (21 GSD, 11 non-GSD). `gsd-plan-phase` / `gsd-execute-phase`
are the workhorses, consistent with the plan→execute core loop being the engine of real work.
Non-GSD `superpowers:*` skills interleave heavily — the user's actual workflow blends GSD with
other skill packs (relevant to UX-01: GSD does not run in isolation).

---

## 4. Ranked: per-flag frequency (NEW M2 depth)

### 4a. Slash-command flags (in `<command-args>`) — `USAGE-SFLAG`

Only **20 flag tokens** appear across all typed slash commands — most invocations pass prose
arguments, not flags. The flags that *do* appear cluster on the autonomous/range commands.

| Key | Flag | Count | Seen on (commands) |
|---|---|---:|---|
| `USAGE-SFLAG-01` | `--from` | 7 | `gsd-autonomous`, `gsd-import` |
| `USAGE-SFLAG-02` | `--to` | 3 | `gsd-autonomous` |
| `USAGE-SFLAG-03` | `--fix` | 2 | `gsd-autonomous` |
| `USAGE-SFLAG-04` | `--auto` | 1 | `gsd-autonomous`, `gsd-new-project` |
| `USAGE-SFLAG-05` | `-p` | 1 | `gsd-resume-work` |
| `USAGE-SFLAG-06` | `--next` | 1 | `gsd-progress` |
| `USAGE-SFLAG-07` | `--interactive` | 1 | `gsd-resume-work` |
| `USAGE-SFLAG-08` | `--wave` | 1 | `gsd-resume-work` |
| `USAGE-SFLAG-09` | `--gaps-only` | 1 | `gsd-resume-work` |
| `USAGE-SFLAG-10` | `--no-transition` | 1 | `gsd-resume-work` |
| `USAGE-SFLAG-11` | `--manifest` | 1 | `gsd-ingest-docs` |

**Read for BLOAT-02 / UX-01:** the user-facing slash flag surface is *barely exercised* — even
this power-user touches only ~11 distinct flags, and `gsd-resume-work` alone owns 5 of the
rarely-used ones. This is a **per-flag surface-sprawl signal** (which user-facing flags earn
their documentation/cognitive cost), to be inherited with the single-author caveat.

### 4b. gsd-tools engine subcommands (Bash) — `USAGE-TOOL`

The engine is the busier surface: **132 engine calls** vs 65 typed commands — most engine
traffic is workflow-internal (`gsd_run query …`), not user-typed. Top engine operations:

| Key | Rank | Engine subcommand | Count |
|---|---:|---|---:|
| `USAGE-TOOL-01` | 1 | `query commit` | 16 |
| `USAGE-TOOL-02` | 2 | `query config-get` | 13 |
| `USAGE-TOOL-03` | 3 | `graphify` | 12 |
| `USAGE-TOOL-04` | 4 | `query agent-skills` | 10 |
| `USAGE-TOOL-05` | 5 | `gap-analysis` | 9 |
| `USAGE-TOOL-06` | 6 | `query init.phase-op` | 8 |
| `USAGE-TOOL-07` | 7 | `query init.new-project` | 7 |
| `USAGE-TOOL-08` | 8 | `query roadmap.get-phase` | 5 |
| `USAGE-TOOL-09` | 9 | `query config-new-project` | 4 |
| `USAGE-TOOL-10` | 10 | `query {init.plan-phase, init.execute-phase, config-set, todo.match-phase}` | 3 each |
| `USAGE-TOOL-11` | 10 | `init` (top-level) | 3 |
| `USAGE-TOOL-TAIL` | — | 22 further `query …` ops at 1–2× | state.*, roadmap.*, phase.*, model/agent resolution, check.*, plan.init, worktree.reap-orphans, generate-claude-md, … |

**37 distinct engine operations observed.** `query commit`, `query config-get`, and the
`query init.*` family dominate — the engine surface that workflows actually lean on is the
config + commit + init-aggregator path, not the long tail of one-off query ops.

### 4c. gsd-tools engine flags (Bash) — `USAGE-TFLAG`

**56 flag tokens**, post-validation (git/grep flags on the same command-line are excluded —
only flags on the validated engine-subcommand segment are counted):

| Key | Flag | Count |
|---|---|---:|
| `USAGE-TFLAG-01` | `--files` | 17 |
| `USAGE-TFLAG-02` | `--phase-dir` | 9 |
| `USAGE-TFLAG-03` | `--phase-req-ids` | 6 |
| `USAGE-TFLAG-04` | `--pick` | 3 |
| `USAGE-TFLAG-05` | `--default` | 3 |
| `USAGE-TFLAG-06` | `--help` | 3 |
| `USAGE-TFLAG-07` | `--stopped-at` | 2 |
| `USAGE-TFLAG-08` | `--resume-file` | 2 |
| `USAGE-TFLAG-09` | `--raw` | 2 |
| `USAGE-TFLAG-10` | `--phase` | 2 |
| `USAGE-TFLAG-11` | `--name` / `--plans` / `--output` | 2 each |
| `USAGE-TFLAG-12` | `--cwd` | 1 |

`--files` (attached to `query commit`) and the `--phase-dir` / `--phase-req-ids` pair (gap-analysis
and phase ops) are the load-bearing engine flags. The global flags `--pick` / `--raw` appear,
confirming workflows do parse structured engine output.

---

## 5. Keying for BLOAT-02 / UX-01 (D-04)

Every row above carries a stable **`USAGE-*` key** so a deep finding can cite a single
statistic. Use the key in the evidence card's `file:line` slot when the citation is a usage
statistic rather than a code line, e.g.:

```yaml
file:line: "evidence/usage-full.md#USAGE-CMD-09 (/gsd-import typed 1× / 92 sessions)"
confidence-limiter: single-author (Phase 11)
```

| Finding lens | Cite from | What the key supports |
|---|---|---|
| **BLOAT-02** (command/skill/flag/config surface sprawl) | `USAGE-CMD-*`, `USAGE-SKILL-*`, `USAGE-SFLAG-*`, `USAGE-TFLAG-*` | "this slice of the surface is observed near-zero in real traffic" → **progressive-disclosure tiering** candidate (never a deletion-by-low-usage, per charter §3.5 / Phase 12 SC-3) |
| **UX-01** (newcomer vs power-user friction) | `USAGE-CMD-01..04` (hot path), `USAGE-SKILL-05/09/11/12` (non-GSD interleave), `USAGE-SFLAG-*` (flag discoverability) | "the power-user hot path is X; the newcomer path is unobserved here" → validates/refines the **two-tracks hypothesis** (Phase 15 SC-3) |

**Mandatory inheritance:** any card citing a `USAGE-*` key copies the single-author caveat
(§ top) into its confidence reasoning. A low USAGE count is a *prompt to investigate
progressive disclosure*, never a standalone justification to cut.

---

## 6. Reconciliation with the M1 early signal (`docs/audit/instrumentation/usage-signal.md`) — D-04

**No silent contradiction.** The M2 numbers are a **superset** of M1 at the same window:

| Dimension | M1 (`usage-signal.md`) | M2 (this report) | Delta & why |
|---|---|---|---|
| Project dirs | 19 | **19** | identical tree |
| Sessions (`.jsonl`) | 92 | **92** | identical window — see note below |
| User messages | 571 (stated 571–577) | **586** (loose) / 381 (strict) | M1 used the *loose* definition; 586 is the same definition re-run later (a few messages accrued). **+15 = drift, not method change.** M2 additionally reports the *strict* 381 (matches the shipped `isGenuineUserMessage`) for calibrated rates. |
| Slash-command ranking | top: autonomous 18, resume-work 11, explore 10, quick 7 | **identical** (18 / 11 / 10 / 7) | exact match — single-count logic preserved ✓ |
| Skill ranking | top: plan-phase 18, execute-phase 13, code-review 10, autonomous 8 | **identical** (18 / 13 / 10 / 8) | exact match ✓ |
| **Per-flag** | — (not measured at M1) | **NEW** (§4) | the M2 depth: slash flags + engine subcommands + engine flags |
| **Engine subcommands** | — (not measured at M1) | **NEW** (§4b) | namespaced `query …` operations surfaced |

**On "larger window":** the CONTEXT note anticipated extending the *time* window. In fact the
GSD-bearing transcript tree under `~/.claude/projects/` is **unchanged at 92 sessions** since
M1 — the GSD activity in this log hasn't grown. The genuine M2 advance is **analytic depth**
(per-flag + per-engine-subcommand), not a wider session window. This is documented honestly
rather than overstated: the window is the same; the resolution is finer.

**Corrected counting confirmed:** the slash-command and skill rankings reproduce M1
**byte-for-byte at the top**, which independently confirms the M1 double-count fix is carried
forward correctly. The only numeric delta (571 → 586 user messages) is benign accrual under an
unchanged definition, not a counting correction.

---

## 7. What this report does and does NOT license (restated for downstream authors)

**Supports** (with the single-author caveat attached):
- Identifying the **power-user hot path** (autonomous / resume-work / explore / quick;
  plan-phase / execute-phase skills) for "cleaner and tighter" attention.
- Flagging **near-zero-traffic slices of the flag/engine surface** as *progressive-disclosure
  candidates* for BLOAT-02 — to investigate, not to delete.
- Showing GSD runs **interleaved with non-GSD skill packs** (`superpowers:*`), a real-workflow
  fact for UX-01.

**Does NOT support:**
- Newcomer behavior (this is a power-user's log).
- Any "delete unused command/skill/flag" conclusion (charter §3.5; safety/recovery exempt).
- A population usage distribution (n=1 author → BLOAT-02b deferred).

---

## Appendix A — raw machine output

Regenerate with `node docs/audit/comprehensive/evidence/usage-extract-full.mjs --json`. The
full JSON object (`coverage`, `slash_commands`, `skills`, `slash_flags`, `tool_subcommands`,
`tool_flags`) is the deterministic source for every table above; the extractor is read-only and
sends nothing anywhere.
