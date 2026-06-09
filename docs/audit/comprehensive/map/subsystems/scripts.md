# Scripts & ESLint rules — `scripts/`, `eslint-rules/`

> **Non-engine subsystem** (58 + 4 files) · reviewer doc (DOC-01) · derived 2026-06-08 from live code.

## Purpose

The **build / lint / CI toolchain**: the scripts that bundle hooks, generate identity, run tests,
and enforce the repo's many cross-file invariants — plus four custom AST ESLint rules. This is how
the project keeps the markdown corpus, the generated `.cjs`, and the engine from silently drifting
out of sync.

## Key files

### Lint suite (each is an npm script + a CI guard)

| Script | Checks |
|--------|--------|
| `scripts/lint-skill-deps.cjs` | command `requires:` closure + body cross-reference + profile closure |
| `scripts/lint-descriptions.cjs` | command `description:` ≤ 100 chars |
| `scripts/check-alias-drift.cjs` | command-alias arrays match router subcommand lists (E4) |
| `scripts/lint-package-identity-drift.cjs` | all GSD package/repo coordinate literals match `package-identity.cjs` |
| `scripts/lint-test-file-count.cjs` | ≤ 2 test files per production module (ratchet) |
| `scripts/changeset/lint.cjs` | user-facing-path PRs carry a `.changeset/*.md` |
| `scripts/lint-docs-required.cjs` | Added/Changed/Removed changesets touch `docs/` |
| `scripts/lint-shared-module-handsync.cjs` | CJS↔SDK hand-sync pairs don't drift |

### Build / generate

| Script | Role |
|--------|------|
| `scripts/build-hooks.js` | bundle `hooks/*` → `hooks/dist/` (`build:hooks`) |
| `scripts/generate-package-identity.cjs` | generate `src/`/`bin/lib` package-identity seam |
| `scripts/run-tests.cjs` | the test runner (c8 coverage propagation) |

### Custom ESLint rules (`eslint-rules/`)

`no-source-grep.cjs`, `no-magic-sleep-in-tests.cjs`, `no-elapsed-assertion.cjs`,
`no-raw-rmsync-in-tests.cjs` — AST rules wired into `eslint.config.mjs` as `local/*`.

## How it connects

- **Run in CI and via npm scripts**; `build` runs `generate:identity` then `build:hooks`,
  `prepublishOnly` runs `build:hooks`.
- They **read the corpus + engine by path** to enforce invariants (e.g. alias-drift compares
  `command-aliases.cts` against the routers) — Site-4-style path reads, not imports.

## What a newcomer must know

- **If CI fails on a lint you didn't expect, it's probably one of these** — the repo enforces
  cross-file consistency aggressively (alias drift, identity drift, skill-dep closure, changeset
  presence). Read the failing script's message; each prints a human-readable violation to stderr.
- **`package-identity.cjs` is generated** — coordinate literals (package name, repo) must flow
  through the seam, not be hardcoded (the identity-drift lint catches stray literals).
- The custom ESLint rules encode this repo's test discipline — they're `warn` today, some
  ratcheting to `error` (e.g. `no-source-grep` after issue #453).
