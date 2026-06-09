> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# Early Usage Signal — Per-Command / Per-Skill Frequency

**Requirement:** QWIN-02 (usage signal from transcripts where available)
**Decision:** D-10
**Extracted:** 2026-06-07
**Signal type:** **REAL** (mined from live Claude Code transcripts) — see caveat below.

---

## ⚠️ SINGLE-AUTHOR / POPULATION CAVEAT (read first)

**This is one developer's signal (Dave's local Claude Code transcripts), not a population
claim.** It reflects how *one* power-user drives GSD, on *this* machine, over the sessions
present in `~/.claude/projects/`. It is an **early directional signal** to ground the
fast-track — useful for "what does a heavy user reach for," **not** for "what newcomers do"
and **not** a statistically representative usage distribution.

Concretely:
- A heavy GSD contributor's mix (lots of `gsd-autonomous`, `gsd-resume-work`, `gsd-explore`)
  is **the opposite** of a newcomer's first-run path. Do **not** infer newcomer behavior or
  justify a surface cut from this signal alone.
- **No command should be cut from the newcomer surface on the strength of low frequency here.**
  Safety/recovery commands are criticality-exempt (`STREAMS.md`).
- Phase 11 (Behavioral / Usage Mining, full) extends this with explicit population caveats;
  v2 requirement **BLOAT-02b** would re-run across multiple maintainers' transcripts to lift
  confidence beyond a single author.

---

## Method

Repurposes the transcript-extraction approach of `src/profile-pipeline.cts` (the same
read-only `~/.claude/projects/**/*.jsonl` scan that powers `/gsd-profile-user`), but instead
of sampling user *messages* it tallies:

1. **Slash-command invocations** — `<command-name>/gsd-*</command-name>` tags in transcripts
   (what the user explicitly typed).
2. **Skill tool invocations** — `Skill` tool-use records with `input.skill` (what actually
   got dispatched, including GSD and non-GSD skills).

Coverage: **19 project directories, 92 `.jsonl` sessions, 571 genuine user messages** in
`~/.claude/projects/` at extraction time.

> Re-run command (read-only):
> ```bash
> node docs/audit/instrumentation/usage-extract.mjs   # see "Reproduce" below for the script
> ```

## Ranked: `/gsd-*` slash commands (user-typed)

| Rank | Command | Invocations |
|-----:|---------|------------:|
| 1 | `/gsd-autonomous` | 18 |
| 2 | `/gsd-resume-work` | 11 |
| 3 | `/gsd-explore` | 10 |
| 4 | `/gsd-quick` | 7 |
| 5 | `/gsd-execute-phase` | 4 |
| 5 | `/gsd-new-project` | 4 |
| 7 | `/gsd-discuss-phase` | 2 |
| 7 | `/gsd-graphify` | 2 |
| 9 | `/gsd-import` | 1 |
| 9 | `/gsd-new-milestone` | 1 |
| 9 | `/gsd-progress` | 1 |
| 9 | `/gsd-ingest-docs` | 1 |
| 9 | `/gsd-config` | 1 |
| 9 | `/gsd-audit-fix` | 1 |
| 9 | `/gsd-code-review` | 1 |

## Ranked: Skill tool invocations (dispatched; incl. nested + non-GSD)

| Rank | Skill | Invocations |
|-----:|-------|------------:|
| 1 | `gsd-plan-phase` | 18 |
| 2 | `gsd-execute-phase` | 13 |
| 3 | `gsd-code-review` | 10 |
| 4 | `gsd-autonomous` | 8 |
| 4 | `superpowers:brainstorming` | 8 |
| 6 | `gsd-resume-work` | 6 |
| 7 | `gsd-ui-phase` | 5 |
| 7 | `gsd-explore` | 5 |
| 9 | `superpowers:receiving-code-review` | 4 |
| 10 | `gsd-quick` | 3 |
| — | `gsd-*` long tail (1–2 each) | verify-work, discuss-phase, audit-milestone, ingest-docs, complete-milestone, new-milestone, secure-phase, map-codebase, phase, graphify, spike |
| — | non-GSD long tail (1 each) | superpowers:{systematic-debugging, test-driven-development, verification-before-completion, writing-plans, subagent-driven-development, finishing-a-development-branch}, verify, claude-api, commit-commands:commit, loop, keybindings-help |

## What this does (and does not) license

**Directional reads it supports** (with the single-author caveat attached):
- The orchestrating commands (`gsd-autonomous`, `gsd-resume-work`, `gsd-explore`,
  `gsd-quick`) dominate this user's mix — they sit on the hot path and are worth extra
  attention for "cleaner and tighter."
- `gsd-plan-phase` / `gsd-execute-phase` are the most-dispatched *skills*, consistent with
  the plan→execute core loop being the workhorse.
- A long tail of commands appears 1–2× — but **low frequency in one author's log is not
  evidence of newcomer irrelevance** and is **not** grounds for a cut.

**Reads it does NOT support:**
- Newcomer behavior (this is a power-user's log).
- Any "delete unused command" conclusion.
- A population usage distribution.

## Reproduce

The extraction is a small read-only Node ESM walk of `~/.claude/projects/**/*.jsonl` that
counts `<command-name>` tags and `Skill` tool-use records. It mirrors the session-scan logic
in `src/profile-pipeline.cts` (`scanProjectDir` + `streamExtractMessages`). To regenerate the
tables, adapt that scan to tally command-name tags and `tool_use.name === 'Skill'` records
rather than sampling messages — the deep Phase 11 mining formalizes this as a reusable
reducer. The raw counts above were produced from the live transcript tree on 2026-06-07.