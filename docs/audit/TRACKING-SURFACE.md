# VIEW-01 — Maintainer-Facing Tracking Surface

**Decision date:** 2026-06-07
**Requirement:** VIEW-01 (a maintainer-facing surface so 4+ maintainers see findings, status, remaining work)
**Status:** **Chosen + stand-up-ready.** Surface chosen and the exact `gh` stand-up commands are
written down — but **board creation is DEFERRED to a maintainer** under the no-GitHub-writes
constraint. The commands below are **provided, not executed**; no board exists yet.

## Decision

- **Primary:** **GitHub Projects v2** on the fork (davesienkowski/gsd-core). (D-04)
- **Fallback:** **Issues + Labels + Milestones** on the fork, if Projects v2 API/scope
  friction appears. (D-06)
- The git-tracked **Markdown backlog in `docs/audit/` is the source of truth**; the board is
  a *view* onto it. The surface is reconstructable from Markdown and not locked into GitHub. (D-05)
- Intake fields on the surface **mirror the backlog schema** in `BACKLOG-SCHEMA.md`. (D-07)

### Why the fork, why Projects v2

`gh` is authed as davesienkowski, so the fork is writable with no access blocker. Standing
the board up on upstream would need maintainer admin and would push WIP into the community
repo prematurely. Projects v2 gives a single board with custom fields (ICE sub-scores, owner,
blast radius, flags) and saved views for slicing by stream/owner — the right primitive for a
4+ person team. If the `project` token scope or the GraphQL field API proves fiddly, the
Issues+Labels+Milestones fallback reproduces the same fields with less ceremony.

## Intake fields (mirror `BACKLOG-SCHEMA.md`)

| Field | Type | Values / notes |
|-------|------|----------------|
| `impact` | number | 1–5 (higher = better) |
| `confidence` | number | 1–5 (higher = better) |
| `ease` | number | 1–5 (higher = cheaper/easier; replaces raw Effort so ICE product is monotonic) |
| `ice` | number | computed = impact × confidence × ease (1–125) |
| `tshirt` | single-select | S / M / L (human-readable companion to Ease) |
| `product` | single-select | UX / Token / Reliability (which stream/product area) |
| `owner` | text/assignee | stream- or subsystem-routed |
| `runtime_blast_radius` | single-select | none / claude-only / multi / all-14+ |
| `mechanical_vs_instructional` | single-select | n/a / mechanical / instructional (EXECUTION-RISK) |
| `severity` | single-select | (reliability items) low / med / high |
| `citation` | text | `file:line` or concrete repro |
| `plan_only` | checkbox | always **true** for this audit |

## EXACT stand-up commands (write-down only — DO NOT RUN in this phase)

> **Precheck — token scope.** Projects v2 needs the `project` gh token scope. Refresh first:
>
> ```bash
> gh auth status
> gh auth refresh -s project   # grant the 'project' scope (one-time, interactive)
> ```

### Primary path — Projects v2 on the fork

```bash
OWNER=davesienkowski
REPO=davesienkowski/gsd-core

# 1. Create the project board (owner-scoped Projects v2 live under the user, not the repo).
gh project create --owner "$OWNER" --title "GSD-Core Audit — Newcomer Readiness (M1)"

# 2. Capture the project number it prints, then list to confirm:
gh project list --owner "$OWNER"
PROJECT=<number-from-step-1>

# 3. Add custom fields (mirror the backlog schema).
#    Numeric ICE sub-scores:
gh project field-create "$PROJECT" --owner "$OWNER" --name "Impact"     --data-type NUMBER
gh project field-create "$PROJECT" --owner "$OWNER" --name "Confidence" --data-type NUMBER
gh project field-create "$PROJECT" --owner "$OWNER" --name "Ease"       --data-type NUMBER
gh project field-create "$PROJECT" --owner "$OWNER" --name "ICE"        --data-type NUMBER

#    Single-select fields:
gh project field-create "$PROJECT" --owner "$OWNER" --name "T-Shirt" \
  --data-type SINGLE_SELECT --single-select-options "S,M,L"
gh project field-create "$PROJECT" --owner "$OWNER" --name "Product" \
  --data-type SINGLE_SELECT --single-select-options "UX,Token,Reliability"
gh project field-create "$PROJECT" --owner "$OWNER" --name "Blast Radius" \
  --data-type SINGLE_SELECT --single-select-options "none,claude-only,multi,all-14+"
gh project field-create "$PROJECT" --owner "$OWNER" --name "Mechanical/Instructional" \
  --data-type SINGLE_SELECT --single-select-options "n/a,mechanical,instructional"
gh project field-create "$PROJECT" --owner "$OWNER" --name "Severity" \
  --data-type SINGLE_SELECT --single-select-options "low,med,high"

#    Text fields:
gh project field-create "$PROJECT" --owner "$OWNER" --name "Citation"  --data-type TEXT
gh project field-create "$PROJECT" --owner "$OWNER" --name "Owner"     --data-type TEXT

# 4. (Per item, at Phase 5 publication) add a draft item and set fields:
#    gh project item-create "$PROJECT" --owner "$OWNER" --title "QW-UX-01: ..." --body "..."
#    then `gh project item-edit ...` to populate the custom fields.
```

### Fallback path — Issues + Labels + Milestones on the fork

```bash
REPO=davesienkowski/gsd-core

# Milestone per milestone-tier:
gh api repos/$REPO/milestones -f title="M1 — Newcomer Readiness" \
  -f description="Fast-track quick-win backlog ahead of Mintlify spotlight"

# Labels encoding the schema dimensions (create once):
gh label create "stream:ux"          --repo $REPO --color 0e8a16 --force
gh label create "stream:token"       --repo $REPO --color 1d76db --force
gh label create "stream:reliability" --repo $REPO --color d93f0b --force
gh label create "blast:none"         --repo $REPO --color ededed --force
gh label create "blast:claude-only"  --repo $REPO --color c5def5 --force
gh label create "blast:multi"        --repo $REPO --color fbca04 --force
gh label create "blast:all-14+"      --repo $REPO --color b60205 --force
gh label create "flag:mechanical"    --repo $REPO --color 0e8a16 --force
gh label create "flag:instructional" --repo $REPO --color b60205 --force   # EXECUTION-RISK
gh label create "plan-only"          --repo $REPO --color ededed --force

# Each backlog item becomes an issue carrying ICE in the body + labels for slicing:
# gh issue create --repo $REPO --title "QW-UX-01: ..." --label "stream:ux,blast:claude-only,plan-only" \
#   --milestone "M1 — Newcomer Readiness" --body "ICE: I4×C4×E5=80 | citation: file:line | ..."
```

> **All commands above are written down for the user. This phase does not run any of them,
> create any project/board, or push any branch.**
