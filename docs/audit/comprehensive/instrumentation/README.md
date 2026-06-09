# Phase 7 — Full Instrumentation (Comprehensive Audit)

**Requirement:** METHOD-02 · **Milestone:** 2 (Comprehensive Audit) · **Status:** plan-only
**Decisions:** D-01 .. D-06 (see `07-CONTEXT.md`)
**Charter:** `docs/audit/comprehensive/AUDIT-CHARTER.md` (Phase 6)

This is the **deep** extension of the Milestone-1 light instrumentation
(`docs/audit/instrumentation/`). Everything here is **real and runnable** but lives
**entirely inside `docs/audit/comprehensive/instrumentation/`** — it is **NOT** wired
into the GSD package's `package.json` devDependencies, `build`, or CI (D-01,
reflexive-system safety). Analyzers were run with `npx -y <tool>` / throwaway
installs; the package dependency tree is untouched (verified: no diff to
`package.json` / `package-lock.json`).

## The hard targeting rule

Every analyzer targets the **`src/*.cts` source of truth** and the **prompt corpus**.
They **never** target the gitignored, compiled `gsd-core/bin/lib/*.cjs` (ADR-457
build-at-publish). Analyzing build output produces **false bloat** and counts
`.cts`↔`.cjs` source/artifact pairs as "duplication." See `SOURCE-OF-TRUTH-MAP.md`.

## The credibility firewall (read before trusting ANY result)

This codebase is **hostile to naive static analysis**. The true entry points
(`gsd-core/bin/gsd-tools.cjs`, `bin/install.js`) live **outside `src/`** and consume
the engine via `require('./lib/<name>.cjs')` — a specifier that resolves to compiled
output, invisible to a tool pointed at `src/`. On top of that, three live-indirection
mechanisms (readdirSync migration loader, 14+-runtime switch, string-keyed
router/alias dispatch) hide real usage from dead-code tools.

**Demonstrated false positives (this run):**
- **knip** reported **45 "unused files"** — exactly the 45 modules `gsd-tools.cjs`
  pulls in via `require('./lib/*.cjs')` from outside `src/`. All 45 are live.
- **madge** reported **88 orphans** (every top-level `.cts`) — it cannot follow the
  `.cjs`-specifier cross-imports at all.
- **dependency-cruiser** (correctly following cross-imports) reported **13 orphans** —
  all 13 verified live (3 are `readdirSync`-loaded migrations; the rest are consumed
  by the out-of-`src/` entry points).

→ **No "dead/unused/orphan" finding is admissible until cross-checked against
`DYNAMIC-INDIRECTION.md`.** Phase 10's success criterion (#2) enforces this.

## Tools (all free / OSS — no budget)

| Tool | What it finds | Config | Real run captured |
|------|---------------|--------|-------------------|
| **gpt-tokenizer** (`tokenize.mjs`) | prompt-corpus + source token cost; recurring-tax vs on-demand split | `tokenize.mjs` | `reports/token-report.json` (o200k_base, exact) |
| **knip** | unused files / exports / deps | `knip.json` | `reports/knip-output.txt` |
| **madge** | module graph + circular deps | `.madgerc` | `reports/madge-circular.txt`, `madge-orphans.txt`, `madge-graph.json` |
| **dependency-cruiser** | module graph + cycles + orphans (cross-import aware) | `.dependency-cruiser.cjs` | `reports/depcruise.json` |
| **jscpd** | copy-paste / duplication | `.jscpd.json` | `reports/jscpd-output.txt`, `reports/jscpd/jscpd-report.json` |
| **complexity** (`complexity.mjs`, TS compiler API) | McCabe cyclomatic complexity per file/function | `complexity.mjs` | `reports/complexity.json` |

## Exact invocations (run from repo root)

```bash
# 1. Token cost (recurring tax vs on-demand vs engine source). Exact BPE:
T=$(mktemp -d); (cd "$T" && npm init -y >/dev/null && npm i gpt-tokenizer >/dev/null)
NODE_PATH="$T/node_modules" node docs/audit/comprehensive/instrumentation/tokenize.mjs
rm -rf "$T"
#    (Without the NODE_PATH install it degrades to a labeled char/4 heuristic.)

# 2. Unused files / exports across src/*.cts. CROSS-CHECK every hit vs DYNAMIC-INDIRECTION.md.
npx -y knip --config docs/audit/comprehensive/instrumentation/knip.json

# 3. Module graph + cycles (madge — cannot follow .cjs-specifier cross-imports; cycles only are reliable).
npx -y madge --circular --extensions cts --ts-config tsconfig.build.json src
npx -y madge --json --extensions cts --ts-config tsconfig.build.json src > docs/audit/comprehensive/instrumentation/reports/madge-graph.json

# 4. Module graph + cycles + orphans (dependency-cruiser — DOES follow cross-imports; preferred graph tool).
npx -y dependency-cruiser --config docs/audit/comprehensive/instrumentation/.dependency-cruiser.cjs --output-type json 'src/**/*.cts' > docs/audit/comprehensive/instrumentation/reports/depcruise.json

# 5. Copy-paste detection across src + the prompt corpus.
npx -y jscpd --config docs/audit/comprehensive/instrumentation/.jscpd.json

# 6. Cyclomatic complexity over src/*.cts (uses the repo's own typescript; no new dep).
node docs/audit/comprehensive/instrumentation/complexity.mjs
```

## Headline numbers (this run — 2026-06-08)

- **Source of truth:** 96 `.cts` files (88 top-level emitting + 1 `.d.cts` decl +
  4 migrations + 3 observability) → 88 root `.cjs` 1:1, **plus 4 non-`src/` `.cjs`**
  (see `SOURCE-OF-TRUTH-MAP.md`). Build (`tsc -p tsconfig.build.json`): **0 errors**.
- **Cycles:** **none** (madge + dependency-cruiser both confirm — validates
  CLAUDE.md's "no circular imports" claim).
- **Module graph:** 94 modules, 176 internal dependency edges (dependency-cruiser).
- **Duplication:** `.cts` source **2.69%** duplicated tokens (103 files) — healthy;
  **markdown corpus 11.73%** (389 files) — the real Phase-12 duplication target.
- **Tokens (o200k_base, exact):** recurring tax **173,834** (upper bound, every
  invocation) · on-demand **452,583** · prompt corpus grand total **626,417** ·
  engine source 338,518 (build-time, not a prompt cost).
- **Complexity hotspots:** `core.cts` (602), `init.cts` (419), `state.cts` (381),
  `verify.cts` (359, max-fn 150). Directs Phase 8 hotspots; not asserted as debt.

## Deliverables in this folder

| File | Purpose |
|------|---------|
| `SOURCE-OF-TRUTH-MAP.md` | `src/*.cts` → `gsd-core/bin/lib/*.cjs` map + the 4 extra non-`src/` `.cjs` |
| `DYNAMIC-INDIRECTION.md` | live-indirection sites that read as "unused"; the dead-code cross-check |
| `RUNTIME-DIVERGENCE-MATRIX.md` | 15+-runtime config-dir / layout / slash-form matrix; blast-radius tags |
| `knip.json` / `.madgerc` / `.dependency-cruiser.cjs` / `.jscpd.json` | analyzer configs |
| `tokenize.mjs` / `complexity.mjs` | runnable analyzer scripts |
| `reports/` | captured real output of every analyzer run |
