# Light Instrumentation (Sandboxed)

**Requirement:** QWIN-02 (light-touch instrumentation underpins the quick-win backlog)
**Decisions:** D-08, D-09, D-10

This is the **light, sandboxed** instrumentation for the fast-track. All of it is **real and
runnable**, but it lives **entirely inside `docs/audit/instrumentation/`** — it is **NOT**
wired into the GSD package's `package.json` devDependencies, `build`, or CI. The system under
audit stays untouched (audit-and-plan, reflexive-safety).

## Hard targeting rule

All analyzers target the **`src/*.cts` source of truth (83 files)** and the **prompt corpus**.
They **never** target the gitignored, compiled `gsd-core/bin/lib/*.cjs` (ADR-457
build-at-publish). Analyzing the compiled output produces **false bloat** — and would count
`.cts`↔`.cjs` source/artifact pairs as "duplication."

## Tools (all free / OSS — no budget)

| Tool | What it finds | Config | Targets |
|------|---------------|--------|---------|
| **gpt-tokenizer** (via `tokenize.mjs`) | prompt-corpus token cost; recurring-tax vs on-demand split | `tokenize.mjs` | prompt corpus `.md` |
| **knip** | unused files / exports / dependencies | `knip.json` | `src/**/*.cts` |
| **jscpd** | copy-paste / duplicated blocks | `.jscpd.json` | `src/**/*.cts` + prompt corpus `.md` |

## Exact invocations (run from repo root)

```bash
# 1. Token cost of the prompt corpus (recurring tax vs on-demand).
node docs/audit/instrumentation/tokenize.mjs
#    For exact BPE counts (optional, do NOT add to the package):
#    npm i -D gpt-tokenizer    # then re-run the line above

# 2. Unused files / exports across the src/*.cts source of truth.
npx -y knip --config docs/audit/instrumentation/knip.json

# 3. Copy-paste detection across src + the prompt corpus.
npx -y jscpd --config docs/audit/instrumentation/.jscpd.json
```

> `npx -y` runs the tools without installing them into the project — keeping the package's
> dependency tree untouched.

## False-positive guard for `knip` (read before trusting any "unused" result)

GSD-Core uses **dynamic loaders** that static analysis cannot see. Anything flagged unused
must be cross-checked against these before being asserted dead:

- **`installer-migrations`** — `readdirSync`-style migration discovery (migrations look unused).
- **`runtime-artifact-layout` / `runtime-homes`** — 14+-runtime `switch` dispatch.
- **`*-router` / `command-routing-hub`** — string-keyed dispatch hub (handlers look unused).

`knip.json` declares these as `entry` points to suppress the most common false positives, but
the deep Phase 7 instrumentation builds the full dynamic-indirection inventory. In the
fast-track, **treat knip output as a candidate list, not a verdict.**

## Tokenizer output, captured 2026-06-07 (char/4 heuristic — see caveat)

Run with the char/4 fallback (gpt-tokenizer not installed); figures are approximate and
**upper-bound** for the recurring tax (see nuance below):

| Bucket | Files | Approx tokens | When paid |
|--------|-------|---------------|-----------|
| **Recurring-context tax** (`commands/gsd/`, `agents/`) | 100 | ~179,000 | every invocation |
| **On-demand** (`gsd-core/workflows/`, `gsd-core/references/`) | (per run) | ~449,000 | per workflow run |
| **Corpus grand total** | — | ~628,000 | — |

**Nuance for Stream B (Token-Savings):** the "recurring tax" bucket counts the **full body**
of every command wrapper and agent file. In practice an AI runtime typically surfaces only
the **frontmatter `description`** of each agent/command into the system prompt and loads the
full body **on demand** when that agent/command runs. So ~179k is a **conservative upper
bound** on the eager cost; Stream B / Phase 12 must refine *which bytes* of each file are
eager vs lazy per runtime before sizing a cut. The largest single files (the agent role
bodies — e.g. `agents/gsd-planner.md` ~12k, `agents/gsd-debugger.md` ~11.6k) are the
highest-leverage inspection targets regardless.

The script auto-upgrades to exact BPE counts once `gpt-tokenizer` is installed.
