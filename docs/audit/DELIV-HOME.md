> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# DELIV-01 — Git-Tracked Deliverable Home

**Decision date:** 2026-06-07
**Requirement:** DELIV-01 (shareable deliverables need a git-tracked home; `.planning/` is gitignored)
**Status:** Resolved

## Decision

1. **`docs/audit/` is the git-tracked home** for all shareable audit deliverables — plain
   Markdown, zero-build, greppable, diffable. (D-01)
2. **`.planning/` stays gitignored.** Do **not** un-ignore it. (D-02)
3. Deliverables live on a **dedicated audit branch of the `fork` remote**
   (davesienkowski/gsd-core), separable from upstream sync and from experiment branches.
   Not committed to upstream open-gsd until the maintainer team is ready to receive them. (D-03)

## Rationale

### Why `docs/audit/` and not `.planning/`

`.planning/` is gitignored **on purpose**. It is the GSD framework's own deliberate
`commit_docs: false` convention — the local-only working area where internal planning churn
lives. Un-ignoring it would:

- Fight the framework's own convention (this audit must respect the system it audits).
- Leak transient planning state (drafts, todos, scratch notes) into the shared history.
- Create a confusing two-source-of-truth situation between working notes and deliverables.

`docs/` is already the structured, git-tracked home the team navigates (`adr/`, `how-to/`,
`reference/`, `research/`). `docs/audit/` slots in beside them naturally. The model is:

> **`.planning/` = local working area. `docs/audit/` = the published mirror.**

The Markdown backlog in `docs/audit/` is the **source of truth**; the tracking-surface board
(see `TRACKING-SURFACE.md`) is a *view* onto it, so the surface stays reconstructable and is
not locked into GitHub.

### Why the `fork` remote, not upstream

- `gh` is authed as **davesienkowski**, so the fork is writable with no access blocker.
  Writing to upstream `open-gsd/gsd-core` would require maintainer admin.
- Pushing WIP into the community repo prematurely is attribution-noisy. WIP stays on the
  fork; upstream receives a clean handoff when the maintainer team is ready.
- A dedicated audit branch keeps the deliverables separable from `next` (upstream sync) and
  from the `feat/*` experiment branches.

## Remotes (for reference)

| Remote | URL | Role |
|--------|-----|------|
| `origin` | open-gsd/gsd-core | Upstream community repo — **not written to until handoff** |
| `fork` | davesienkowski/gsd-core | Deliverable + tracking-surface target (push here) |
| `backup` | davesienkowski/gsd-core-experiments | Experiment branches |

## Suggested branch + push (for the user to run; not run by this phase)

> Plan-only: these commands are written down, **not executed**. No commits are made by the
> audit setup phase.

```bash
# Create the dedicated audit branch and push docs/audit/ to the fork.
git checkout -b audit/newcomer-readiness-m1
git add docs/audit/
git commit -m "docs(audit): M1 fast-track setup — instrumentation, schema, streams"
git push -u fork audit/newcomer-readiness-m1
```