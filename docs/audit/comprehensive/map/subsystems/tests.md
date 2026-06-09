> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# Tests — `tests/`

> **Non-engine subsystem** (721 files; 664 `*.test.cjs`) · reviewer doc (DOC-01) · derived 2026-06-08.

## Purpose

The engine's **safety net**: Node built-in test-runner suites (`node --test`) plus fast-check
property tests, run with c8 coverage. They validate the engine (`src/*.cts` → compiled `.cjs`),
not the markdown corpus. The audit relies on these to tell load-bearing engine code from dead
code (a covered behavior is live by definition).

## Key shape

| Pattern | Meaning |
|---------|---------|
| `<subject>.test.cjs` | unit test for a module |
| `<subject>.<suite>.test.cjs` | other suites (`.integration.`, `.property.`) |
| `bug-NNNN-<slug>.test.cjs` | regression test for a fixed bug (issue # = NNNN) |
| `enh-NNNN-<slug>.test.cjs` / `feat-NNNN-<slug>.test.cjs` | enhancement/feature tests |
| `*.property.test.cjs` | fast-check property-based tests |

## How it connects

- **Run by `scripts/run-tests.cjs`** (propagates `NODE_V8_COVERAGE` for c8); coverage threshold
  **70% lines** over the engine.
- **Mutation tested** by Stryker (`stryker.config.mjs`); generated `.cjs` are excluded.
- **Governed by `scripts/lint-test-file-count.cjs`** — max **2 test files per production module**
  (a ratcheted allowlist).
- Custom ESLint rules guard test hygiene: `no-only-tests` (no committed `.only`),
  `no-magic-sleep-in-tests`, `no-elapsed-assertion`, `no-source-grep`, `no-raw-rmsync-in-tests`.

## What a newcomer must know

- Tests target the **compiled `.cjs`** at runtime but the **source of truth is `src/*.cts`** —
  write the test against the module's public behavior; don't grep source text (`no-source-grep`).
- **No magic sleeps / elapsed-time assertions** — these are merge-blocked by custom AST rules; use
  the projected clock (`clock.cts` in E1) and the shell-command-projection seam to control timing.
- A module with thorough tests is **live** — coverage is a useful (not sufficient) signal when
  checking the dead-code guard, since string-keyed dispatch (Site 3) is exercised through the
  router in integration tests.
- The 664 test files are a maintainability surface in their own right (the file-count ratchet
  exists to cap test sprawl) — a Phase-12 consideration.