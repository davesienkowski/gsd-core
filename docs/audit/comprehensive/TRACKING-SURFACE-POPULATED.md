> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# TRACKING-SURFACE-POPULATED.md — Full Item Set + Import Commands (Milestone 2)

> **A view over `FINDINGS.md`.** This populates the Phase-1 tracking surface
> (`docs/audit/TRACKING-SURFACE.md`, VIEW-01) with the **full 68-finding register** (64 original +
> 4 supplementary build/CI/hooks from the M2 review remediation) and the exact
> `gh` import commands. **No GitHub write is performed here** — the commands are documented for a
> maintainer to run, consistent with the no-GitHub-writes constraint (Phase-1 decision D-05).
> **Source of truth:** `FINDINGS.md`. **Roadmap view:** `IMPROVEMENT-ROADMAP.md`.
> **Assembled:** 2026-06-08.

---

## 0. What changed from the Phase-1 surface

The Phase-1 surface (`TRACKING-SURFACE.md`) was a stand-up frame for the **M1 quick-win backlog**
(20 items, ICE/UX-Token-Reliability schema). This populated view extends it to the **M2
comprehensive register**: 68 findings on the deep evidence-card schema (5-type problem axis, the
`severity`/`effort`/`risk`/`confidence` sub-scores, computed `priority`, subsystem, blast radius,
mechanical/instructional, recall gate). The M1 intake fields map forward unchanged (charter §6) —
the board just gains `problem_type`, `subsystem`, `risk` (distinct from severity), and `recommendation`.

**Extended intake fields (superset of the Phase-1 schema):**

| Field | Type | Values |
|-------|------|--------|
| `problem_type` | single-select | wrongness / external-gap / waste / change-cost / human-friction |
| `subsystem` | single-select | engine / installer / workflows / agents / skills / docs / tests / sdk |
| `severity` | number | 1–5 (higher = worse) |
| `effort` | single-select | S / M / L |
| `risk` | single-select | low / med / high (risk of the *fix*) |
| `confidence` | number | 1–5 |
| `priority` | number | severity × confidence × ease(effort) |
| `runtime_blast_radius` | single-select | none / claude-only / multi / all-14+ / all-16 |
| `mechanical_vs_instructional` | single-select | n/a / mechanical / instructional |
| `tag` | text | security / shim-resolution / build-publish (optional) |
| `citation` | text | `src/*.cts:NN` / `.md` corpus / repro |
| `recall_gate` | text | named gate for instructional items |
| `provenance` | text | `QW-*` / `H-*` / Phase-10 lead |
| `plan_only` | checkbox | always **true** |

---

## 1. The full 68-item register (board rows)

Ordered by `priority` desc, then id. Every row is import-ready (matches the `FINDINGS.md` card).

| priority | id | type | subsystem | sev | eff | risk | conf | blast | m/i | citation |
|---:|----|------|-----------|:--:|:--:|:--:|:--:|------|-----|----------|
| 125 | F-CORR-02 | wrongness | engine | 5 | S | high | 5 | all-16 | n/a | src/core.cts:545-552 vs config.cts:639 |
| 100 | F-AIGAP-02 | external-gap | agents | 4 | S | med | 5 | all-14+ | n/a | model-catalog.json:116,122 |
| 75 | F-CORR-01 | wrongness | engine | 5 | M | med | 5 | all-16 | n/a | src/verify.cts:66,102,148 |
| 75 | F-CORR-04 | wrongness | engine | 3 | S | med | 5 | all-16 | n/a | src/core.cts:372-374 |
| 75 | F-CORR-05 | wrongness | engine | 3 | S | low | 5 | all-16 | n/a | src/core.cts:1919-1920 |
| 75 | F-CORR-08 | wrongness | installer | 3 | S | med | 5 | all-16 | n/a | package.json:47 vs docs |
| 75 | F-UX-01 | human-friction | docs | 3 | S | low | 5 | none | n/a | README.md Quickstart |
| 75 | F-UX-04 | human-friction | installer | 3 | S | low | 5 | all-14+ | n/a | bin/install.js:11864-11877 |
| 75 | F-UX-05 | human-friction | docs | 3 | S | low | 5 | none | n/a | your-first-project.md:36-38 |
| 75 | F-UX-07 | human-friction | skills | 3 | S | low | 5 | all-14+ | mech | new-project.md:33 |
| 75 | F-BUILD-02 | change-cost | tests | 3 | S | low | 5 | none | n/a | .githooks/pre-commit:9-47 (stale sdk/ guards) |
| 60 | F-AIGAP-01 | external-gap | agents | 4 | M | med | 5 | all-14+ | instr | gsd-verifier.md:169-173 |
| 60 | F-CORR-03 | wrongness | engine | 4 | M | med | 5 | all-16 | n/a | src/verify.cts:123-134 |
| 60 | F-UX-02 | human-friction | installer | 4 | M | med | 5 | all-14+ | n/a | install-profiles.cts:499-507 |
| 60 | F-UX-03 | human-friction | installer | 3 | S | low | 4 | none | n/a | install-minimal-and-add-skills.md:35 |
| 60 | F-UX-09 | human-friction | skills | 3 | S | low | 4 | all-14+ | instr | resume-work.md (no argument-hint) |
| 50 | F-BLOAT-02 | waste | tests | 2 | S | low | 5 | none | n/a | vitest.config.ts:9,17 |
| 50 | F-BLOAT-09 | waste | agents | 2 | S | low | 5 | all-16 | mech | gsd-planner.md:6-11 (+24) |
| 50 | F-CORR-09 | wrongness | engine | 2 | S | low | 5 | all-16 | n/a | src/verify.cts:372-405 |
| 50 | F-MAINT-10 | change-cost | docs | 2 | S | low | 5 | none | n/a | DYNAMIC-INDIRECTION.md |
| 50 | F-MAINT-11 | change-cost | installer | 2 | S | low | 5 | none | n/a | bin/install.js:686 |
| 50 | F-MAINT-12 | change-cost | engine | 2 | S | low | 5 | none | n/a | jscpd audit.cts:467,537 |
| 50 | F-CI-01 | wrongness (tag:security) | tests | 2 | S | low | 5 | none | n/a | no npm audit gate in .github/ — build-ci-hooks.md |
| 50 | F-BUILD-01 | wrongness (tag:build) | installer | 2 | S | low | 5 | all-16 | n/a | scripts/build-hooks.js:158-159,205 (.sh skip) |
| 45 | F-CORR-06 | wrongness | engine | 3 | M | med | 5 | multi | n/a | src/runtime-slash.cts:56,79-104 |
| 45 | F-MAINT-02 | change-cost | installer | 3 | M | high | 5 | all-16 | n/a | runtime-artifact-layout.cts:51 |
| 45 | F-MAINT-04 | change-cost | engine | 3 | M | med | 5 | all-16 | n/a | src/config.cts (78 commits) |
| 45 | F-RECON-01 | human-friction | skills | 3 | M | low | 5 | multi | mech | new-project.md:33 + install transform |
| 40 | F-CORR-10 | wrongness | engine | 2 | S | low | 4 | claude-only | n/a | src/verify.cts:696-744,841-849 |
| 40 | F-MAINT-09 | change-cost | engine | 2 | S | med | 4 | none | n/a | .gitignore (95 lines) |
| 40 | F-UX-14 | human-friction | skills | 2 | S | low | 4 | claude-only | instr | clusters.cts:97-104 |
| 36 | F-AIGAP-03 | external-gap | agents | 3 | M | low | 4 | all-14+ | instr | gsd-verifier.md:122-153 |
| 36 | F-AIGAP-04 | external-gap | agents | 3 | M | med | 4 | multi | instr | few-shot/verifier.md:25-36 |
| 36 | F-AIGAP-05 | external-gap | workflows | 3 | M | med | 4 | all-14+ | instr | execute-phase.md (86.8K) |
| 36 | F-MAINT-07 | change-cost | installer | 3 | M | med | 4 | all-16 | n/a | bin/install.js + gsd-tools.cjs |
| 36 | F-RECON-03 | wrongness (tag:shim) | workflows | 3 | M | med | 4 | all-16 | n/a | 10+ gsd-core/workflows/*.md |
| 36 | F-RECON-04 | wrongness (tag:build) | installer | 4 | M | med | 3 | all-16 | n/a | package.json + build-hooks.js |
| 30 | F-BLOAT-01 | waste (tag:security) | engine | 2 | S | med | 3 | none | n/a | package.json ws/sdk |
| 30 | F-BLOAT-17 | waste | engine | 2 | M | high | 5 | all-16 | n/a | core.cts:544-551 vs config.cts:417 |
| 30 | F-UX-08 | human-friction | skills | 2 | M | low | 5 | all-14+ | mech | 18 commands/gsd/*.md |
| 30 | F-UX-13 | human-friction | docs | 2 | M | low | 5 | none | mech | install-profiles.cts:27-58 |
| 27 | F-RECON-02 | external-gap (tag:security) | agents | 3 | M | med | 3 | multi | n/a | frontier-synthesis:71,118 |
| 27 | F-RECON-05 | wrongness (tag:security) | engine | 3 | M | low | 3 | all-16 | n/a | security.cts/secrets.cts + claude-agent-sdk advisory |
| 25 | F-CORR-07b | wrongness | engine | 1 | S | low | 5 | claude-only | n/a | src/drift.cts:252-270 |
| 24 | F-BLOAT-10 | waste (tag:security) | agents | 2 | M | high | 4 | all-16 | instr | 8 agents, ctx7 guard variants |
| 24 | F-BLOAT-16 | waste | engine | 2 | M | high | 4 | multi | n/a | 11 *-command-router.cts |
| 24 | F-CORR-07 | wrongness | engine | 2 | M | low | 4 | none | n/a | repro /tmp/p13e4 + roadmap.cts |
| 20 | F-MAINT-01 | change-cost | installer | 4 | L | high | 5 | all-16 | n/a | bin/install.js (12,727 LOC) |
| 20 | F-MAINT-03 | change-cost | engine | 4 | L | high | 5 | all-16 | n/a | src/core.cts (cx-602) |
| 20 | F-BUILD-03 | change-cost (tag:build) | installer | 1 | S | low | 4 | all-16 | n/a | hooks/dist gitignored, no drift gate — build-ci-hooks.md |
| 18 | F-BLOAT-11 | waste | agents | 2 | M | med | 3 | all-16 | instr | 100 files (agent desc uncapped) |
| 18 | F-UX-10 | human-friction | skills | 2 | M | low | 3 | multi | instr | usage-full.md#USAGE-SFLAG |
| 18 | F-UX-11 | human-friction | skills | 2 | M | low | 3 | multi | instr | usage-full.md#USAGE-SKILL |
| 15 | F-BLOAT-13 | waste | agents | 3 | L | high | 5 | all-16 | instr | token-report.json 173,834 eager |
| 15 | F-BLOAT-14 | waste | workflows | 3 | L | high | 5 | all-16 | instr | execute-phase 22,199 / plan 21,365 |
| 12 | F-BLOAT-06 | waste | skills | 2 | M | med | 2 | multi | n/a | usage-full.md#USAGE-SFLAG |
| 12 | F-BLOAT-08 | waste | agents | 3 | L | high | 4 | all-16 | n/a | token-report.json (33 agents) |
| 12 | F-BLOAT-12 | waste | skills | 3 | L | high | 4 | all-16 | instr | graphify.md (3,623 tok) |
| 12 | F-BLOAT-15 | waste | engine | 3 | L | med | 4 | multi | n/a | src/init.cts clones |
| 12 | F-MAINT-05 | change-cost | engine | 3 | L | med | 4 | multi | n/a | src/init.cts (fileCx 419) |
| 12 | F-MAINT-08 | change-cost | engine | 3 | L | high | 4 | all-16 | n/a | src/verify.cts (maxFn 150) |
| 12 | F-UX-06 | human-friction | skills | 3 | L | med | 4 | multi | instr | clusters.cts:33-40 |
| 10 | F-BLOAT-03 | waste | engine | 1 | S | low | 2 | none | n/a | config-types.cts:1-62 (AGG) |
| 9 | F-BLOAT-05 | waste | docs | 3 | L | med | 3 | all-16 | instr | jscpd markdown 11.73% |
| 8 | F-MAINT-06 | change-cost | engine | 2 | L | high | 4 | all-16 | n/a | depcruise fan-in top-5 |
| 6 | F-AIGAP-06 | external-gap | workflows | 2 | L | low | 3 | none | n/a | spec-phase.md:18-22 |
| 6 | F-BLOAT-04 | waste | engine | 1 | M | high | 2 | multi | n/a | knip-output.txt (88, AGG) |
| 6 | F-BLOAT-07 | waste | skills | 3 | L | med | 2 | multi | n/a | usage-full.md#USAGE-CMD |

**68 rows.** (`all-16` and `all-14+` both denote the full-runtime tier; the Phase-1 board used
`all-14+` — keep one canonical value when creating the single-select; the deep sweeps used
`all-16` after the runtime count grew. Map both to the board's top tier.)

---

## 2. Import commands — Projects v2 on the fork (DOCUMENTED, NOT RUN)

> **Precheck (one-time, interactive):**
> ```bash
> gh auth status
> gh auth refresh -s project   # grant the 'project' scope
> ```

```bash
OWNER=davesienkowski
REPO=davesienkowski/gsd-core

# 1. Create the comprehensive-audit board (owner-scoped Projects v2).
gh project create --owner "$OWNER" --title "GSD-Core Comprehensive Audit — Improvement Roadmap (M2)"

# 2. Capture the number it prints:
gh project list --owner "$OWNER"
PROJECT=<number-from-step-1>

# 3. Custom fields (the deep evidence-card schema).
gh project field-create "$PROJECT" --owner "$OWNER" --name "Severity"   --data-type NUMBER
gh project field-create "$PROJECT" --owner "$OWNER" --name "Confidence" --data-type NUMBER
gh project field-create "$PROJECT" --owner "$OWNER" --name "Priority"   --data-type NUMBER
gh project field-create "$PROJECT" --owner "$OWNER" --name "Problem Type" \
  --data-type SINGLE_SELECT --single-select-options "wrongness,external-gap,waste,change-cost,human-friction"
gh project field-create "$PROJECT" --owner "$OWNER" --name "Subsystem" \
  --data-type SINGLE_SELECT --single-select-options "engine,installer,workflows,agents,skills,docs,tests,sdk"
gh project field-create "$PROJECT" --owner "$OWNER" --name "Effort" \
  --data-type SINGLE_SELECT --single-select-options "S,M,L"
gh project field-create "$PROJECT" --owner "$OWNER" --name "Fix Risk" \
  --data-type SINGLE_SELECT --single-select-options "low,med,high"
gh project field-create "$PROJECT" --owner "$OWNER" --name "Blast Radius" \
  --data-type SINGLE_SELECT --single-select-options "none,claude-only,multi,all-14+"
gh project field-create "$PROJECT" --owner "$OWNER" --name "Mechanical/Instructional" \
  --data-type SINGLE_SELECT --single-select-options "n/a,mechanical,instructional"
gh project field-create "$PROJECT" --owner "$OWNER" --name "Tag"       --data-type TEXT
gh project field-create "$PROJECT" --owner "$OWNER" --name "Citation"  --data-type TEXT
gh project field-create "$PROJECT" --owner "$OWNER" --name "Recall Gate" --data-type TEXT
gh project field-create "$PROJECT" --owner "$OWNER" --name "Owner"     --data-type TEXT

# 4. Per item (example — repeat for all 68 rows in §1):
#    gh project item-create "$PROJECT" --owner "$OWNER" \
#      --title "F-CORR-02: malformed config silently reverts to defaults on the hot path" \
#      --body "priority 125 | sev 5 | S | risk high | conf 5 | all-16 | src/core.cts:545-552 | see FINDINGS.md §3.1"
#    then `gh project item-edit ...` to set the custom fields.
```

## 3. Import commands — Issues + Labels + Milestones fallback (DOCUMENTED, NOT RUN)

```bash
REPO=davesienkowski/gsd-core

# Milestone per workstream:
for ws in "A — Correctness" "B — AI Gap" "C — Bloat" "D — Maintainability" "E — UX (spotlight)"; do
  gh api repos/$REPO/milestones -f title="M2 $ws" -f description="GSD-Core comprehensive audit roadmap workstream"
done

# Labels encoding the 5-type axis + the deep dimensions (create once):
gh label create "type:wrongness"      --repo $REPO --color d93f0b --force
gh label create "type:external-gap"   --repo $REPO --color 5319e7 --force
gh label create "type:waste"          --repo $REPO --color 1d76db --force
gh label create "type:change-cost"    --repo $REPO --color fbca04 --force
gh label create "type:human-friction" --repo $REPO --color 0e8a16 --force
gh label create "sub:engine"     --repo $REPO --color c5def5 --force
gh label create "sub:installer"  --repo $REPO --color c5def5 --force
gh label create "sub:workflows"  --repo $REPO --color c5def5 --force
gh label create "sub:agents"     --repo $REPO --color c5def5 --force
gh label create "sub:skills"     --repo $REPO --color c5def5 --force
gh label create "sub:docs"       --repo $REPO --color c5def5 --force
gh label create "sub:tests"      --repo $REPO --color c5def5 --force
gh label create "blast:none"        --repo $REPO --color ededed --force
gh label create "blast:claude-only" --repo $REPO --color c5def5 --force
gh label create "blast:multi"       --repo $REPO --color fbca04 --force
gh label create "blast:all-14+"     --repo $REPO --color b60205 --force
gh label create "flag:mechanical"    --repo $REPO --color 0e8a16 --force
gh label create "flag:instructional" --repo $REPO --color b60205 --force   # EXECUTION-RISK
gh label create "tag:security"       --repo $REPO --color b60205 --force
gh label create "risk:high"          --repo $REPO --color b60205 --force
gh label create "plan-only"          --repo $REPO --color ededed --force

# Each finding -> an issue (example):
# gh issue create --repo $REPO \
#   --title "F-CORR-02: malformed config silently reverts to defaults on the hot path" \
#   --label "type:wrongness,sub:engine,blast:all-14+,risk:high,plan-only" \
#   --milestone "M2 A — Correctness" \
#   --body "priority 125 | sev 5 | effort S | fix-risk high | conf 5 | src/core.cts:545-552 | recommendation + repro in FINDINGS.md §3.1"
```

> **All commands above are written down for a maintainer to run. This phase does not run any of
> them, create any project/board, push any branch, or open any issue.**

---

## 4. Saved views the team will want

- **Spotlight queue** — filter `Effort = S AND Fix Risk != high AND Priority >= 50` (the §2 checklist of `IMPROVEMENT-ROADMAP.md`).
- **By owner** — group by the Owner field (the 5 slots in roadmap §4).
- **EXECUTION-RISK** — filter `Mechanical/Instructional = instructional` (every load-bearing item; check the Recall Gate before action).
- **Security slice** — filter `Tag contains security` (F-RECON-05, F-RECON-02, F-BLOAT-01, F-BLOAT-10, F-CI-01).
- **Build / publish slice** — filter `Tag contains build` (F-RECON-04, F-BUILD-01, F-BUILD-03; + F-BUILD-02 via the .githooks subsystem).
- **Deep workstreams** — filter `Effort = L` (the systemic decompositions: F-MAINT-01/03/05/08, F-BLOAT-13/14).

*Plan-only attestation: this file is a new deliverable under `docs/audit/comprehensive/`. No
protected path was edited; no commit; no GitHub write; no board created.*