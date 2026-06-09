> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# Dynamic-Indirection Inventory — the dead-code cross-check

**Requirement:** METHOD-02 (Deliverable 2) · **Decision:** D-04
**Derived:** 2026-06-08 from live `src/*.cts` + real analyzer runs (see `reports/`).

## What this is

GSD-Core routes a large fraction of its real behaviour through **runtime indirection**
that static analysis cannot see: filesystem-discovered modules, big `switch` tables
keyed on runtime strings, and string-keyed dispatch objects. To a dead-code tool, the
targets of this indirection look **unused / orphaned** — but they are live on every
real invocation.

**Rule (enforced by Phase 10 success criterion #2):** *no "dead / unused / orphan"
finding is admissible until it has been checked against this inventory and the check
recorded.* The configs in this folder pre-declare the known sites as `entry` points,
but that only suppresses the *known* false positives — the inventory is the human
backstop for the rest.

## Proof that the guard is necessary (this run)

| Tool | Reported "dead/orphan" | Reality |
|------|------------------------|---------|
| **knip** (`reports/knip-output.txt`) | **45 unused files** + ~120 unused exports | The 45 are *exactly* the modules `gsd-core/bin/gsd-tools.cjs` pulls in via `require('./lib/<name>.cjs')` from **outside `src/`**. All live. |
| **madge** (`reports/madge-orphans.txt`) | **88 orphans** (every top-level `.cts`) | madge can't follow `.cjs`-specifier cross-imports → 0 edges. Pure tool artifact. |
| **dependency-cruiser** (`reports/depcruise.json`) | **13 orphans** | All 13 verified live: 3 are `readdirSync`-loaded migrations; the other 10 are consumed by the out-of-`src/` entry points (`gsd-tools.cjs` / `bin/install.js`). |

The root cause behind every column: **the true entry points live outside `src/`.**

---

## Site 0 — Out-of-`src/` entry points (the master indirection)

The CLI engine entry `gsd-core/bin/gsd-tools.cjs` and the installer `bin/install.js`
are **not** in `src/`. They consume the migrated engine via compiled-path requires:

- `gsd-core/bin/gsd-tools.cjs` — **45 distinct** `require('./lib/<name>.cjs')` calls
  (verified count). Each resolves to a compiled artifact of a `src/*.cts` module.
- `src/runtime-artifact-layout.cts:51` — `require('../../../bin/install.js')` (the
  engine reaching back *out* to the installer for converter functions).

**Why it defeats dead-code tools:** a tool scoped to `src/` never sees these entry
points, so it treats the 45 required modules as unreferenced. **Any `src/`-scoped
"unused file" result is a false positive for any module on the `require('./lib/*.cjs')`
list of `gsd-tools.cjs`.**

**Cross-check method:** before asserting a `src/<name>.cts` is dead, grep
`gsd-core/bin/gsd-tools.cjs` and `bin/install.js` for `<name>.cjs`.

---

## Site 1 — `readdirSync` migration loader (`installer-migrations`)

- **`src/installer-migrations.cts:268-283`** — `discoverInstallerMigrations()`:
  `fs.readdirSync(migrationsDir)` → `.filter(name.endsWith('.cjs'))` → `.sort()` →
  `require(source)` each file dynamically (with `delete require.cache[...]`).
- **`src/installer-migrations.cts:25`** —
  `DEFAULT_MIGRATIONS_DIR = path.join(__dirname, 'installer-migrations')`.
- **`src/installer-migrations.cts:899-900`** — the default `migrations` arg is
  `discoverInstallerMigrations({ migrationsDir })`.
- **Targets:** `src/installer-migrations/000-first-time-baseline.cts`,
  `001-legacy-orphan-files.cts`, `002-codex-legacy-hooks-json.cts`,
  `003-rename-get-shit-done-to-gsd-core.cts` (each `export = migration;`, compiled to
  `…/installer-migrations/00N-*.cjs`).

**Why it defeats dead-code tools:** the migration files are loaded by **string path at
runtime**, never statically imported. dependency-cruiser flagged
`installer-migrations/000` and `001` as orphans (`reports/depcruise.json`); knip listed
all four as unused `default` exports. **Both are false positives — every migration runs
on install.**

**Cross-check method:** any `src/installer-migrations/*.cts` flagged unused/orphan is
**live by definition** — it is discovered by the loader above. Likewise
`installer-migration-report.cts` / `installer-migration-authoring.cts` are consumed via
the loader/report path, not a static import from `src/`.

---

## Site 2 — The 14+-runtime `switch` (`runtime-artifact-layout` / `runtime-homes`)

- **`src/runtime-artifact-layout.cts:285-385`** — `resolveRuntimeArtifactLayout()`:
  a `switch (runtime)` with **15** runtime arms (`claude`, `cursor`, `gemini`,
  `codex`, `copilot`, `antigravity`, `windsurf`, `augment`, `trae`, `qwen`, `hermes`,
  `codebuddy`, `cline`, `opencode`, `kilo`) + a loud-failing `default`.
- **`src/runtime-homes.cts:76-156`** — `getGlobalConfigDir()`: a `switch (runtime)`
  with **16** arms (the 15 above **plus `grok`** — intentionally homes-only; the layout
  switch omits grok so an unknown-runtime `TypeError` fires loudly, see the file header
  comment at `runtime-artifact-layout.cts:6-9`).
- The `runtime` value arrives as a **string** from config / env / install flags; the
  per-arm helpers (`skillsKind`, `convertedCommandsKind`, converter-name strings like
  `'convertClaudeCommandToCodexSkill'`) are selected at runtime.
- **`src/runtime-artifact-layout.cts:171-175`** — `ALLOWED_RUNTIMES` Set gates the
  switch; **`src/runtime-config-adapter-registry.cts`** is a sibling string-keyed
  registry of per-runtime adapters (flagged orphan by dependency-cruiser — false:
  consumed by the installer).

**Why it defeats dead-code tools:** converter functions are invoked **by string name**
(`installExports[converterName]`) and runtime arms are selected by a string the tool
can't enumerate. A converter that is only ever named in one switch arm looks unused.

**Cross-check method:** any helper named in a `case` arm, or any
`convert*To*Skill/Command` function referenced via a `converterName` string, is live.
See `RUNTIME-DIVERGENCE-MATRIX.md` for the full per-runtime arm table.

---

## Site 3 — String-keyed router / alias dispatch

- **`src/command-routing-hub.cts:344-357`** — `_dispatchCjs()`:
  `familyHandlers[subcommand]` / `familyHandlers['']` — handlers selected by **string
  key** from a registry object; the closed `ERROR_KINDS` enum
  (`command-routing-hub.cts:50-59`) is switched on by callers.
- **`src/cjs-command-router-adapter.cts:100-124`** — `routeHubCommandFamily()` builds
  the `cjsRegistry` from a `handlers` object via `Object.fromEntries(...)` and
  dispatches by string `subcommand`.
- **The 11 `src/*-command-router.cts`** (`state-`, `verify-`, `phase-`, `phases-`,
  `roadmap-`, `init-`, `check-`, `validate-`, `verification-`, `task-`, `agent-`):
  each builds a **string-keyed `handlers` map** whose values call engine functions.
  Example: `src/state-command-router.cts:150-188` maps `'resolve-blocker'`,
  `'begin-phase'`, `'signal-waiting'`, `'complete-phase'`, … → `state.cmd*` functions.
- **`src/command-aliases.cts`** — exports the family alias tables
  (`STATE_COMMAND_ALIASES`, `VERIFY_…`, `INIT_…`, `PHASE_…`, `PHASES_…`, `VALIDATE_…`,
  `ROADMAP_…`, non-family) as `{ canonical, aliases, subcommand, mutation }` records.
  Subcommand **strings** here are the keys the routers dispatch on.
- **`gsd-core/bin/gsd-tools.cjs:524+`** — the top-level `switch (command)` (families:
  `agent`, `check`, `state`, `task`, `verify`, `phases`, `roadmap`, `phase`,
  `validate`, `init`, …) that hands off to each router.

**Why it defeats dead-code tools:** every engine `cmd*` function reachable only as a
**value in a string-keyed handler map** is invisible to "is this export referenced?"
analysis. knip's long "unused exports" list (e.g. `state.cts` / `verify.cts` command
functions) is dominated by this pattern.

**Cross-check method:** an engine function flagged unused is live if its name appears
as a `handlers['<sub>']` value in any `*-command-router.cts`, or its subcommand string
appears in `command-aliases.cts`.

---

## Site 4 — String-path corpus references

The engine reads the **prompt corpus by string path**, not by import:

- Workflow / reference / agent / command `.md` files are resolved by path
  (e.g. `template.cts`, `docs.cts`, `init.cts` aggregators load `gsd-core/workflows/…`,
  `gsd-core/references/…` by constructed path; agents/workflows reference each other via
  `@~/.claude/gsd-core/...` at-paths inside markdown).
- `src/runtime-artifact-layout.cts:105-165` — `findInstallSourceRoot()` /
  `findAgentsSourceRoot()` locate `commands/gsd` and `agents/` by **filesystem walk**
  and a `.gsd-source` marker file, not by import.

**Why it matters:** a markdown file with no inbound *static* reference is **not**
dead — it may be loaded by path at runtime, or surfaced into a runtime's system prompt
by the installer. A `.md` "orphan" in a jscpd/graph view must be checked for string-path
/ at-path references and for installer staging before being called unused. (Markdown
duplication itself — jscpd `markdown 11.73%` — is a *separate*, valid Phase-12 concern.)

---

## Quick reference — "is this really dead?" decision flow

1. **Is it `src/installer-migrations/*.cts`?** → live (Site 1). Stop.
2. **Is it named in a `runtime-*.cts` switch arm or a `converterName` string?** → live (Site 2). Stop.
3. **Is its name a value in a `*-command-router.cts` `handlers` map, or a subcommand in `command-aliases.cts`?** → live (Site 3). Stop.
4. **Is it `require('./lib/<name>.cjs')`'d by `gsd-core/bin/gsd-tools.cjs` or `bin/install.js`?** → live (Site 0). Stop.
5. **Is it a `.md` referenced by string path / at-path / installer staging?** → live (Site 4). Stop.
6. **None of the above** → *candidate* dead code. Still cite `file:line` and state confidence; the burden of proof is on the finding.