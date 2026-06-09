> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# Hotspots — churn × complexity ranking (where the deep sweeps look first)

> **Requirement:** MAP-01 (Phase 8) · **Mode:** audit-and-plan only · **Derived:** 2026-06-08
> **Scope:** `src/*.cts` (the engine, charter §0) — **never** compiled `gsd-core/bin/lib/*.cjs`.
> **Complexity:** `reports/complexity.json` (McCabe `fileComplexity` = 1 + decision points).
> **Churn:** `git log --follow --oneline -- <file> | wc -l` — **`--follow` is load-bearing**:
> it tracks the file through the source-tree rename (`gsd-core/bin/lib/*.cjs` → `src/*.cts`, 2026-06-02)
> so pre-migration history is **not** lost. Without `--follow` the live `src/` tree shows only
> ~6 weeks of churn; with it, `core.cts` shows its true 142 commits back to 2026-04-26.

## Why churn × complexity

A file that is **both** complex (many decision branches → many ways to be wrong) **and**
frequently changed (active edit surface → high chance the next change introduces a defect) is
where latent defects and refactor payoff concentrate (the standard hotspot heuristic — Tornhill,
*Your Code as a Crime Scene*). The product `churn × fileComplexity` directs Phases 10 (static
sweep), 12 (bloat/maintainability), and 13 (correctness) to read these first under the charter's
**saturation** stopping rule (charter §3.4.2: after coverage, keep going only on hotspots).

> **Metric caveat (read before trusting the rank):**
> - **`bin/install.js` (12,727 LOC) and `gsd-core/bin/gsd-tools.cjs` (1,928 LOC) are absent**
>   from this table — they are `.js`/non-`src/` and outside the complexity scan. The installer
>   monolith is almost certainly the **largest single change-cost surface in the repo**; do not
>   read its absence as low risk (see SUBSYSTEM-MAP §3.3).
> - The **product under-ranks a low-churn / single-hot-function file.** `verify.cts` ranks #22
>   on the product but holds the **highest single-function complexity in the engine (150)** —
>   it is called out separately below.

---

## Top hotspots (engine, ranked by churn × complexity)

| Rank | File | Cluster | Churn (follow) | fileCx | LOC | maxFn | **churn×cx** |
|------|------|---------|---------------:|-------:|----:|------:|-------------:|
| 1 | `src/core.cts` | E1 Foundation | 142 | 602 | 2054 | 108 | **85,484** |
| 2 | `src/state.cts` | E3 Artifact-lifecycle | 67 | 381 | 1900 | 40 | **25,527** |
| 3 | `src/phase.cts` | E3 Artifact-lifecycle | 73 | 297 | 1527 | 45 | **21,681** |
| 4 | `src/commands.cts` | E9 Aggregators | 52 | 287 | 1233 | 35 | **14,924** |
| 5 | `src/config.cts` | E9 Aggregators | 78 | 139 | 724 | 41 | **10,842** |
| 6 | `src/profile-output.cts` | E7 Model/profiles | 21 | 232 | 1096 | 53 | 4,872 |
| 7 | `src/roadmap.cts` | E3 Artifact-lifecycle | 38 | 117 | 619 | 26 | 4,446 |
| 8 | `src/installer-migrations.cts` | E5 Installer/migrations | 15 | 191 | 905 | 33 | 2,865 |
| 9 | `src/init.cts` | E9 Aggregators | 5 | 419 | 1996 | 51 | 2,095 |
| 10 | `src/shell-command-projection.cts` | E1 Foundation | 17 | 122 | 523 | 42 | 2,074 |
| 11 | `src/frontmatter.cts` | E3 Artifact-lifecycle | 15 | 127 | 363 | 39 | 1,905 |
| 12 | `src/milestone.cts` | E3 Artifact-lifecycle | 27 | 68 | 380 | 44 | 1,836 |
| 13 | `src/worktree-safety.cts` | E1/E2 | 9 | 176 | 1013 | 45 | 1,584 |
| 14 | `src/audit.cts` | E8 Verify/validate | 9 | 158 | 729 | 29 | 1,422 |
| 15 | `src/surface.cts` | E6 Runtime/install surface | 14 | 84 | 460 | 24 | 1,176 |
| 16 | `src/graphify.cts` | E10 Content | 10 | 112 | 553 | 20 | 1,120 |
| 17 | `src/installer-migration-report.cts` | E5 Installer/migrations | 13 | 86 | 389 | 25 | 1,118 |
| 18 | `src/intel.cts` | E10 Content | 7 | 129 | 615 | 32 | 903 |
| 19 | `src/security.cts` | E11 Guards | 10 | 87 | 459 | 17 | 870 |
| 20 | `src/workstream.cts` | E2 Workspace | 15 | 58 | 367 | 19 | 870 |
| 21 | `src/install-profiles.cts` | E6 Runtime/install surface | 9 | 95 | 555 | 15 | 855 |
| 22 | `src/verify.cts` | E8 Verify/validate | 2 | 359 | 1615 | **150** | 718 ⚠ |
| 23 | `src/runtime-artifact-layout.cts` | E6 Runtime/install surface | 14 | 43 | 344 | 23 | 602 |
| 24 | `src/gsd2-import.cts` | E10 Content | 9 | 59 | 490 | 10 | 531 |
| 25 | `src/drift.cts` | E8 Verify/validate | 8 | 66 | 388 | 22 | 528 |

*(Full 95-row ranking is reproducible from the command in the next section; the tail below rank
25 is low-product and is handled in aggregate per the charter severity-floor rule.)*

---

## The top 5 — where Phases 10/12/13 start

1. **`src/core.cts` (E1, 85,484).** The foundation seam: 142 commits, fileCx 602, 2,054 LOC,
   one function at complexity **108**. Fan-in 24 / fan-out 9 — both a hub and an orchestrator.
   The single highest-risk file in the engine: most-changed × most-complex × most-depended-upon.
   **Any defect here has all-16 blast radius.** Sweeps start here.
2. **`src/state.cts` (E3, 25,527).** STATE.md CRUD — 67 commits, fileCx 381, 1,900 LOC. The
   artifact-lifecycle core; its `cmd*` functions are reached via E4 string dispatch (run the
   dynamic-indirection guard before any "unused" claim).
3. **`src/phase.cts` (E3, 21,681).** Phase directory lifecycle — 73 commits (2nd-highest churn),
   fileCx 297, 1,527 LOC. High edit-frequency on complex branching.
4. **`src/commands.cts` (E9, 14,924).** Command-surface aggregator — fan-out 9, 1,233 LOC. A
   prime BLOAT-02 (surface sprawl) and maintainability lead.
5. **`src/config.cts` (E9, 10,842).** Config aggregator — **78 commits (highest churn after
   core)**, fileCx 139. High churn signals an unstable contract → a correctness (CORR-01) and
   change-cost lead.

## Separately flagged (the product under-ranks these)

- **`src/verify.cts` — single hottest function (maxFn 150), fileCx 359, 1,615 LOC, churn only 2.**
  Low churn drops it to rank #22 on the product, but a complexity-150 function is the most
  defect-prone *unit* in the engine and sits on the verification path ("verifier reach = spec
  reach"). **Phase 13 (correctness) must read `verify.cts` regardless of its product rank.**
- **`src/init.cts` — fileCx 419 (2nd-highest), 1,996 LOC, churn 5.** A huge low-churn aggregator;
  big surface, low recent activity → a Phase-12 maintainability/bloat lead more than a correctness
  one.
- **`bin/install.js` (12,727 LOC) and `gsd-core/bin/gsd-tools.cjs` (1,928 LOC)** — outside the
  complexity scan entirely. The installer monolith is the largest single change-cost surface in
  the repo and **must not be skipped for lack of a metric** (SUBSYSTEM-MAP §3.3).

## Cluster-level read

The top of the ranking is dominated by **E1 (Foundation: core, shell-command-projection)**,
**E3 (Artifact-lifecycle: state, phase, roadmap, milestone, frontmatter)**, and **E9
(Aggregators: commands, config, init)** — these three clusters own 9 of the top 12 rows. A
4+ person team can route the deep sweeps by cluster: E1+E3 (correctness-heavy), E9 (bloat/
maintainability-heavy), E6 (runtime blast-radius-heavy).

---

## Reproduction (re-checkable)

Churn × complexity for every `src/*.cts`, joining `--follow` churn with `complexity.json`:

```bash
node -e '
const cp=require("child_process"), fs=require("fs");
const comp=JSON.parse(fs.readFileSync("docs/audit/comprehensive/instrumentation/reports/complexity.json","utf8")).files;
const files=[...new Set(cp.execSync("git ls-files \"src/*.cts\" \"src/**/*.cts\"").toString().split("\n").filter(Boolean))].filter(f=>!f.endsWith(".d.cts"));
const rows=files.map(f=>{
  const churn=parseInt(cp.execSync(`git log --follow --oneline -- "${f}" | wc -l`).toString())||0;
  const c=comp.find(x=>x.file===f)||{fileComplexity:0,loc:0,maxFunctionComplexity:0};
  return {f,churn,cx:c.fileComplexity,loc:c.loc,mx:c.maxFunctionComplexity,score:churn*c.fileComplexity};
}).sort((a,b)=>b.score-a.score);
for(const r of rows) console.log([r.score,r.churn,r.cx,r.loc,r.mx,r.f].join("\t"));
'
```