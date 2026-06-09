> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# Supplementary Concern Sweep — Build / CI / Hooks / Scripts

> **Origin:** the M2 adversarial red-team (`review/ADVERSARIAL-M2-PROCESS.md` §5 GENUINE GAP 2)
> found that **three mapped subsystems were never concern-swept**: `.github/workflows/` (CI),
> `.githooks/` (git hooks), and the JS `hooks/`+`scripts/` code. The fresh sweeps (Phases 12–15)
> were `src/*.cts`-scoped and produced **zero** findings with `subsystem: ci|hooks|scripts`. This
> file closes that coverage gap.
> **Mode:** audit-and-plan only — no code changed, no commit, no GitHub. **Derived:** 2026-06-08.
> **Charter:** `docs/audit/comprehensive/AUDIT-CHARTER.md` — problem-type taxonomy §1.1, evidence-
> card schema §2.2, severity-floor aggregate §3.4.3.
> **Source-of-truth note (charter §0 clarification):** the "never the compiled `.cjs`" rule applies
> to the gitignored **engine** output `gsd-core/bin/lib/*.cjs`. The files swept here —
> `.github/workflows/*.yml`, `.githooks/*`, `hooks/*.js`, `scripts/*.cjs|*.js`, `bin/install.js` —
> are **hand-written sources** and are legitimate citation targets. Every finding cites a live
> `file:line` or a reproducible grep a reviewer can re-run.

---

## 0. Headline result

**The build/CI/publish surface is, on the whole, well-engineered — and that is itself the audit
finding: the prior's most-feared shipping defect class is RESOLVED, and the supply-chain hygiene is
strong.** The genuine concerns are concentrated in **stale enforcement** (a fully-dead pre-commit
hook keyed on the retired `sdk/` tree) and **two narrow gaps** (no `npm audit`/advisory check in
CI; `.sh` hooks skip the syntax-validation gate that protects the `.js` hooks).

| Theme | Verdict |
|-------|---------|
| **F-RECON-04 hooks/dist defect class (the prior duplicate-const PostToolUse hook shipped to users)** | **RESOLVED.** `scripts/build-hooks.js` now syntax-validates every `.js` hook (`vm.Script`) before copy and `exit 1`s on any SyntaxError. All 13 live JS hooks pass; no duplicate-const present. |
| **CI action pinning (supply-chain)** | **STRONG.** All 60 `uses:` refs are 40-hex SHA-pinned; zero mutable tags. |
| **CI token scope** | **STRONG.** All 23 workflows declare a `permissions:` block; release/publish jobs are least-privilege per-job. |
| **npm publish gating** | **STRONG.** OIDC trusted publishing + `--provenance`, `environment: npm-publish` gate, install-smoke prerequisite, dry-run validation, already-published rejection. |
| **`pull_request_target` exposure** | **CLEAN.** The 3 PR-target workflows do not check out the PR head ref / run untrusted code. |
| **pre-commit hook** | **FULLY STALE → F-BUILD-02.** All 10 generated-file freshness guards key on the retired `sdk/` tree + non-existent `*.generated.cjs`; 9 of 10 `check:*-fresh` scripts no longer exist in package.json. |
| **Advisory scanning** | **GAP → F-CI-01.** No `npm audit` anywhere in CI or scripts; only `check-npm-integrity` (lockfile consistency) + weekly dependabot. |
| **build-hooks `.sh` validation** | **GAP → F-BUILD-01.** `.sh` hooks (4 shipped) skip the syntax gate that guards `.js` hooks; the prior incident class extends to shell hooks unguarded. |

---

## 1. Findings index (by severity)

| id | type | severity | title | evidence |
|----|------|:--------:|-------|----------|
| **F-BUILD-02** | change-cost | 3 | pre-commit hook fully stale: 10 guards key on the retired `sdk/` tree + dropped `check:*-fresh` scripts | grep + ls |
| **F-CI-01** | wrongness | 2 | no `npm audit` / advisory gate in CI or scripts — supply-chain advisory drift unmonitored except weekly dependabot | grep |
| **F-BUILD-01** | wrongness | 2 | `build-hooks.js` syntax-validates `.js` hooks but skips `.sh` hooks — the gate that closed the prior hooks/dist defect class does not cover the 4 shipped shell hooks | build-hooks.js:158-159,205 |
| **F-BUILD-03** | change-cost | 1 | `hooks/dist` is gitignored build-output (regenerated only at publish) with no byte-identical drift gate; the prior's "tarball self-consistency" residual | .gitignore + build-hooks.js |

**Severity tally:** 0 critical, 0 high, 1 med (3), 2 low (2), 1 trivial (1).
**F-RECON-04 status update (verified this sweep):** the duplicate-const PostToolUse defect class is
**RESOLVED** in the current tree — recorded in §3, not a new card.

---

## 2. Evidence cards

```yaml
- id: F-BUILD-02
  problem_type: change-cost
  subsystem: tests              # build/dev hygiene — .githooks gate the contributor commit path
  file:line: ".githooks/pre-commit:9-47 (10 generated-file freshness guards, all keyed on ^sdk/src/... + gsd-core/bin/lib/*.generated.cjs); git ls-files sdk/ -> 0; 9 of 10 referenced check:*-fresh npm scripts absent from package.json (only check:alias-drift survives)"
  severity: 3                   # the entire pre-commit gate is inert AND a latent crash trap
  effort: S                     # rewrite the guards against the live src/*.cts -> *.cjs seam, or remove the dead arms
  risk: low                     # the hook does nothing today; replacing dead arms cannot regress a live check
  confidence: 5                 # grep + ls + package.json scan all reproduce
  runtime_blast_radius: none    # dev-time hook, not shipped to runtimes
  mechanical_vs_instructional: n/a
  cross_check: "Same SDK-retirement debris field as F-BLOAT-02 + RECON A-6. Confirmed: gsd-core/bin/lib/secrets.generated.cjs does NOT exist; command-aliases.cjs exists WITHOUT the .generated suffix the guard greps for. So both the trigger paths (sdk/src/...) and the output paths (*.generated.cjs) are stale, AND `npm run check:secrets-fresh` would fail 'Missing script' if a guard ever fired."
  recommendation: "Re-point the pre-commit freshness guards at the live src/*.cts -> gsd-core/bin/lib/*.cjs build seam (build:lib is now tsc, F-RECON-04 delta), or delete the dead arms and keep only check:alias-drift (the one live script). Either way the hook must enforce something real or be honestly empty — a hook that silently no-ops while looking like a gate is the worst of both. NB .githooks is protected — the exec team edits it, not the audit."
  recall_gate: n/a
  debt_quadrant: reckless-inadvertent   # a gate left enforcing nothing after the sdk/ retirement, never updated

- id: F-CI-01
  problem_type: wrongness
  subsystem: ci
  tag: security
  file:line: "grep -rln 'npm audit' .github/ scripts/ -> NONE; security-scan.yml runs prompt-injection/base64/secret scans + check-npm-integrity.cjs (lockfile consistency only, no advisory query); .github/dependabot.yml = weekly npm + actions"
  severity: 2                   # a known CVE in a transitive dep can sit unflagged for up to a week (dependabot cadence); no PR-time advisory gate
  effort: S                     # add an `npm audit --audit-level=high` step to security-scan.yml (advisory query only; not `npm audit fix`)
  risk: low                     # additive CI step; can start non-blocking (|| true) then ratchet
  confidence: 5                 # grep reproduces NONE; check-npm-integrity scope verified (lockfile satisfy/missing/extraneous, not advisories)
  runtime_blast_radius: none    # CI-only
  mechanical_vs_instructional: n/a
  cross_check: "Distinct from check-npm-integrity (which validates lockfile<->manifest consistency, NOT vulnerabilities). The supply-chain ADVISORY surface is the F-RECON-05 facet; this card is the CI-process gap that lets it drift. NB `npm audit` (read) is currently 0 vulnerabilities (2026-06-08, F-RECON-05 update) — so the gate would pass clean today; the gap is the MISSING gate, not a live vuln."
  recommendation: "Add an advisory gate (`npm audit --audit-level=high`, read-only) to security-scan.yml so a newly-disclosed transitive CVE fails a PR rather than waiting on the weekly dependabot run. Start advisory (warn), then ratchet to blocking. Pairs with F-RECON-05 (the dep-surface finding) — this is its CI-enforcement half."
  recall_gate: n/a

- id: F-BUILD-01
  problem_type: wrongness
  subsystem: installer          # the build/publish seam (scripts/build-hooks.js)
  file:line: "scripts/build-hooks.js:158-159 (`if (hook.endsWith('.js'))` gates validateSyntax — .sh files skip) and :205 (subdir loop, same .js-only gate); 4 shipped .sh hooks (gsd-session-state/gsd-validate-commit/gsd-phase-boundary/gsd-graphify-update) copied without any validation"
  severity: 2                   # a broken shell hook ships to all users the same way the prior duplicate-const .js hook did; the validator added to prevent that does not cover .sh
  effort: S                     # add a `bash -n`/`sh -n` syntax check for .sh hooks in build-hooks.js (skipped on Windows runners where bash may be absent — degrade gracefully)
  risk: low                     # additive check; can warn-not-fail where a shell is unavailable
  confidence: 5                 # the .js-only gate is the literal condition at :158-159 and :205; the .sh hooks are in HOOKS_TO_COPY (:48-53)
  runtime_blast_radius: all-16  # a broken .sh hook installs to every runtime that opts into community/graphify hooks
  mechanical_vs_instructional: n/a
  cross_check: "The same defect CLASS the .js validateSyntax() guards (the prior hooks/dist defect class — a broken hook shipped to all users). The .js gate is the fix; the .sh hooks (community + graphify, opt-in) are the uncovered remainder. Opt-in lowers blast vs the always-on .js hooks, hence sev 2 not 4."
  recommendation: "Extend build-hooks.js validation to .sh hooks (`bash -n`), guarded so a runner without bash degrades to a warning rather than failing the build. Closes the shell half of the prior hooks/dist defect class the .js validator already closes."
  recall_gate: n/a

- id: F-BUILD-03
  problem_type: change-cost
  subsystem: installer
  tag: build-publish
  file:line: ".gitignore (hooks/dist gitignored — git ls-files hooks/dist/ -> 0); scripts/build-hooks.js regenerates hooks/dist on build:hooks/prepublishOnly only; no CI gate asserts the shipped hooks/dist is byte-identical to a fresh build"
  severity: 1                   # the syntax validator (F-RECON-04 fix) makes a CORRUPT dist unlikely; this is the residual 'is the tarball self-consistent' hygiene gap the prior raised
  effort: S                     # a CI step that runs `npm run build:hooks` and asserts `git diff --exit-code` on a tracked dist, OR commit hooks/dist
  risk: low
  confidence: 4                 # gitignore + 0 tracked dist files confirmed; the absence of a drift gate confirmed by grep (no build-then-diff step in CI)
  runtime_blast_radius: all-16
  mechanical_vs_instructional: n/a
  cross_check: "This is F-RECON-04's recommendation (1) — 'a CI pre-publish gate asserting hooks/dist is byte-identical to a fresh build (or commit hooks/dist)'. The validateSyntax() guard already prevents the WORST outcome (a syntactically-broken hook shipping); this card is the lower-severity 'no drift detection' residual. Sev dropped to 1 BECAUSE the syntax gate now exists."
  recommendation: "Optional hardening: either commit hooks/dist (so the tarball content is reviewable in PRs) or add a CI step that runs build:hooks and `git diff --exit-code hooks/dist`. Lower priority now that validateSyntax() closes the corruption path; this only adds drift visibility."
  recall_gate: n/a
  debt_quadrant: prudent-deliberate
```

---

## 3. F-RECON-04 build/publish defect class — RESOLVED (verified this sweep)

The red-team (`ADVERSARIAL-M2-PROCESS.md` §5) asked specifically whether the F-RECON-04 defect
class (the `hooks/dist` duplicate-const PostToolUse error shipped to all users) is still present.
**It is resolved.**

- `scripts/build-hooks.js:117-134` defines `validateSyntax(filePath)` which compiles each file with
  `new vm.Script(content)` and returns the `SyntaxError` message (without executing).
- `scripts/build-hooks.js:159-166` runs it on every `.js` hook before copy; on any syntax error it
  sets `hasErrors` and **`process.exit(1)`** (`:230-233`) — the build fails rather than shipping a
  broken hook.
- The file's own header docstring (`:2-7`) cites the prior duplicate-const incident cluster as the
  exact incident this guard was added to prevent.
- **Live verification:** compiling all 13 shipped `.js` hooks with `vm.Script` → **0 syntax errors**;
  no duplicate-const present in the current tree.

So the F-RECON-04 card's severity-4 *historically-realized* shipping defect is **closed for `.js`
hooks**. The two residuals this sweep surfaces are narrower: the validator does not cover `.sh`
hooks (**F-BUILD-01**), and there is no byte-identical drift gate on the gitignored dist
(**F-BUILD-03**, = F-RECON-04 recommendation #1). The `{{GSD_VERSION}}` install-time-not-build-time
stamp seam (F-RECON-04 recommendation #2) remains as carded — that facet is unchanged.

> **Disposition:** F-RECON-04 stays in the register (its `{{GSD_VERSION}}` seam + the publish-gate
> recommendation stand), but its blast/severity narrative should note the duplicate-const facet is
> RESOLVED and the residual is the narrower F-BUILD-01/03 pair (annotated in `FINDINGS.md` §2).

---

## 4. What held up (recorded so the team sees the assessment, not a gap)

These were examined and found **clean** — recorded per charter §3.4 so the coverage is honest, not
silently passed over:

| Surface | Assessment | Evidence |
|---------|-----------|----------|
| **CI action pinning** | All `uses:` are 40-hex SHA-pinned; zero `@vN`/`@branch` mutable refs | `grep -rhoE 'uses: [^ ]+@[0-9a-f]{40}'` → 60; mutable-tag grep → 0 |
| **CI token scope** | Every one of 23 workflows declares `permissions:`; release jobs least-priv per-job (`contents: read` default, `id-token: write` only on publish jobs) | per-file `grep -ql permissions:` → all 23 |
| **npm publish gating** | OIDC trusted publishing + `--provenance`; `environment: npm-publish`; install-smoke required before rc/finalize; `npm publish --dry-run` validation; already-published rejection (`release.yml:95-104`) | `release.yml` read in full |
| **`pull_request_target`** | 3 workflows (pr-template-format, close-draft-prs[-sweep]); none checks out the PR **head** ref — pr-template-format checks out base policy + reads PR data via `gh`, the others are label/comment-only | `release.yml`/PR-target workflows read; no `ref: ...head...` checkout |
| **security-scan.yml** | Runs prompt-injection + base64-obfuscation + secret scans + secret-exclusion lint + `.planning/`-leak guard on every PR touching shipped paths; `permissions: contents: read` | `security-scan.yml` read in full |
| **build-hooks atomicity** | Per-PID staging dir + atomic `rename(2)` with Windows EPERM/EBUSY retry + copy-fallback; documents the bug-2136 flaky-install race it fixes | `build-hooks.js:62-115,169-189` |
| **`.js` hook syntax** | All 13 shipped JS hooks compile clean | `vm.Script` over `hooks/*.js` → 0 errors |

---

## 5. Honesty & coverage statement (charter §3.2, §3.4)

Every card cites a live `file:line` or a reproducible grep. This sweep is **breadth-closing**, not
exhaustive: it read `release.yml` and `security-scan.yml` in full, action-pinned/permissions across
all 23 workflows by grep, both `.githooks`, `scripts/build-hooks.js` in full, and inventoried
`hooks/` + `scripts/`. It did **not** read all 23 workflows or all ~50 scripts line-by-line — the
remaining tail was scanned for the high-value patterns (pinning, token scope, PR-target,
`npm audit`) and is flagged here as a residual (charter §3.4.4): a per-script defect sweep of the
~50-file `scripts/` tree was not performed; the highest-risk seam (the build/publish path) was.
No finding was manufactured — three of the four cards are low/trivial, and the most-feared prior
defect class was found **resolved**, which is the honest result.

*Plan-only attestation: this file is a new deliverable under `docs/audit/comprehensive/concerns/`.
No protected path (`package.json`, `src/`, `gsd-core/`, `workflows/`, `agents/`, `commands/`,
`bin/`, `.github/`, `.githooks/`, `hooks/`, `scripts/`, `.gitignore`) was edited; no git commit; no
GitHub write. `npm audit` was run read-only (it does not mutate the lockfile); `git diff
package-lock.json` confirmed empty. The `.github/`, `.githooks/`, `hooks/`, and `scripts/` files
were opened read-only for analysis per the charter §0 clarification (hand-written sources, valid
targets).*