---
type: prompt
name: gsd:complete-milestone
description: Archive completed milestone and prepare for next version
argument-hint: <version>
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
requires: [audit-milestone, discuss-phase, execute-phase, new-milestone, phase, plan-phase, stats, update]
---

<objective>
Mark milestone $ARGUMENTS complete, archive to milestones/, and update ROADMAP.md and REQUIREMENTS.md.

Purpose: Create historical record of shipped version, archive milestone artifacts (roadmap + requirements), and prepare for next milestone.
Output: Milestone archived (roadmap + requirements), PROJECT.md evolved, git tagged.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/complete-milestone.md
@~/.claude/gsd-core/templates/milestone-archive.md
</execution_context>

<context>
**Project files:**
- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/STATE.md`
- `.planning/PROJECT.md`

**User input:**

- Version: $ARGUMENTS (e.g., "1.0", "1.1", "2.0")
  </context>

<process>
Execute the complete-milestone workflow end-to-end.
Preserve all workflow gates (audit pre-flight, readiness confirmation, accomplishment approval, archive-before-delete, tag and push confirmation).
</process>

<success_criteria>

- Milestone archived to `.planning/milestones/v{version}-ROADMAP.md`
- Requirements archived to `.planning/milestones/v{version}-REQUIREMENTS.md`
- `.planning/REQUIREMENTS.md` deleted (fresh for next milestone)
- ROADMAP.md collapsed to one-line entry
- PROJECT.md updated with current state
- Git tag v{version} created (if `git.create_tag` enabled)
- Commit successful
- User knows next steps (including need for fresh requirements)
  </success_criteria>

