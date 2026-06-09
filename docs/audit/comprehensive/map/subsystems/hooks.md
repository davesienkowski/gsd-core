> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# Hooks — `hooks/`

> **Non-engine subsystem** (21 files, excl. `dist/`) · reviewer doc (DOC-01) · derived 2026-06-08.

## Purpose

**Runtime lifecycle hooks** injected into the AI runtime to add session/context/guard behavior
around GSD operations — the bits that fire on session start, before a tool runs, on a prompt, at a
phase boundary, etc. They are how GSD enforces things outside the workflow's own steps (e.g.
"don't read this file," "validate this commit," "show the statusline").

## Key files (selected — 21 total)

| File | Role | Kind |
|------|------|------|
| `hooks/hooks.json` | the manifest registering each hook + its matcher | config |
| `hooks/gsd-prompt-guard.js`, `gsd-read-guard.js`, `gsd-workflow-guard.js` | guard hooks (block disallowed prompt/read/workflow actions) | JS |
| `hooks/gsd-context-monitor.js` | context-utilization monitoring | JS |
| `hooks/gsd-statusline.js`, `gsd-update-banner.js` | UI surfaces | JS |
| `hooks/gsd-phase-boundary.sh`, `gsd-validate-commit.sh`, `gsd-session-state.sh`, `gsd-graphify-update.sh` | lifecycle bash hooks | Bash |
| `hooks/lib/` | shared hook helpers | |

## How it connects

- **Registered via `hooks.json`** and **injected by `bin/install.js`** into the runtime's hook
  configuration during install.
- **Bundled to `hooks/dist/`** by `scripts/build-hooks.js` (the `build:hooks` npm script,
  `prepublishOnly`). `dist/` is build output — excluded from the subsystem count.
- **Call into the engine guards (E11):** guard hooks lean on `security`/`prompt-budget`/
  `code-review-flags` semantics; the context-monitor relates to `context-utilization` (E4).

## What a newcomer must know

- **`dist/` is generated** — never edit `hooks/dist/*`; edit the source hook and re-run
  `npm run build:hooks`.
- Hooks are **registered, not imported** (via `hooks.json` matchers) — invisible to the module
  graph; a hook with no static reference is live if it's in the manifest.
- Two languages: **JS hooks** (guards, monitors, UI) and **bash hooks** (phase-boundary,
  commit-validate, session-state, graphify-update). The runtime decides which fire when.
- Guard hooks are a **correctness/safety surface** — a broken guard can let a disallowed action
  through silently (Phase-13 lead) or block a legitimate one (Phase-15 UX friction).