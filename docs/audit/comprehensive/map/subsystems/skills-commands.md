> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# Skills / Commands — `commands/gsd/*.md`

> **Non-engine subsystem** (67 files) · reviewer doc (DOC-01) · derived 2026-06-08 from live code.

## Purpose

The **user-facing entry points** — thin slash-command wrappers. Each file registers a
`/gsd-<cmd>` (Claude) or `$gsd-<cmd>` (Codex) command in the runtime; when invoked, it @-includes
its workflow and passes `$ARGUMENTS` through. They are deliberately thin: frontmatter +
`<objective>` + an `<execution_context>` of @-includes — the real logic lives in the workflow.

## Key files (selected — 67 total)

| File | Role | Notes |
|------|------|-------|
| `commands/gsd/plan-phase.md` | `/gsd-plan-phase` | 64 lines; @-includes `workflows/plan-phase.md` |
| `commands/gsd/execute-phase.md` | `/gsd-execute-phase` | |
| `commands/gsd/quick.md` | `/gsd-quick` | the short path |
| `commands/gsd/debug.md`, `verify-work.md`, `progress.md`, … | the rest of the surface | |
| namespaced `gsd-ns-*` | grouped command bundles (context/ideate/manage/project/review/workflow) | |

## How it connects

- **Frontmatter declares the contract:** `name` (`gsd:<stem>`), `description` (≤100 chars,
  CI-enforced), `argument-hint`, `allowed-tools` (incl. `Agent` for orchestrators), `requires`
  (skill-dep closure, CI-enforced).
- **@-include → workflow (Site 4):** `<execution_context>` pulls
  `@~/.claude/gsd-core/workflows/<cmd>.md` — that's the entire wiring from command to orchestration.
- **Installed per-runtime** by `bin/install.js`: as skills, commands, or converted-commands
  depending on the runtime (E6 + `RUNTIME-DIVERGENCE-MATRIX`). Slash form rendered by
  `runtime-slash.cts`.

## What a newcomer must know

- **A command is a wrapper, not the program** — to change behavior, edit the *workflow*, not the
  command. The command only declares tools, args, and which workflow to load.
- **Blast radius ≥ skills-surface (12):** any surface finding here is multi-runtime by default —
  the command installs differently across 16 runtimes (hermes nests `skills/gsd/`; kilo uses
  HOME-relative skills). Never tag `none`.
- **Surface sprawl (BLOAT-02) lives here** — 67 commands is the count BLOAT-02 assesses; reductions
  must be tiered as **progressive disclosure**, and safety/recovery commands are
  **criticality-exempt** (never cut by low usage).
- `requires:` must list every skill the body references, or `lint-skill-deps.cjs` fails CI.