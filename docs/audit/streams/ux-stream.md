# Stream A — UX / Onboarding Quick-Win Stream Note

**Phase:** 2 (Onboarding & UX Quick-Win Stream)
**Produced:** 2026-06-07
**Lens:** the **newcomer's** first-run path — install → first command → first result.
**Status:** plan-only. Drafts owner-assignable quick-wins; ships no code.
**Convergence target:** Phase 5 (merges Streams A/B/C into the published backlog).

> **Method honesty.** This is a fresh, independent read of the **live** install flow,
> command surface, and onboarding docs. Friction points are backed by a concrete
> reproduction / `file:line` citation, or the Phase-1 usage signal — never assertion.
> The usage signal is a **single-author power-user log** (`instrumentation/usage-signal.md`);
> it is used only to say "what a heavy user reaches for," **never** to justify cutting a
> command. Surface reduction here is **progressive disclosure**, not deletion. Safety/recovery
> commands are **criticality-exempt**.

---

## 1. The newcomer journey (traced, with friction points)

The path a first-time user actually walks, reconstructed from the live code and the
git-tracked onboarding docs. Each friction point (**F-NN**) carries its evidence.

### Stage 0 — Discovery (README → decision to install)

A newcomer lands on `README.md`. The Quickstart is clean and short:

```bash
npx @opengsd/gsd-core@latest      # README.md:36
/gsd-new-project                  # README.md (Quickstart, "start your first project")
```

The README links a tutorial (`docs/tutorials/your-first-project.md`) and a per-runtime
install guide (`docs/how-to/install-on-your-runtime.md`) — both exist (verified). Good.

- **F-01 — The size/scope of the install is invisible before you commit to it.**
  The README never mentions that the default install surfaces the **full** skill set
  (all 67 commands), nor that a leaner `--profile=core` exists. `grep -niE
  "profile|minimal|surface" README.md` → **no matches**. A newcomer cannot make an
  informed "how much am I installing?" choice from the landing page.
  *Evidence:* `README.md` Quickstart (lines ~34–52, no profile mention); contrast
  `bin/install.js:583` `--help` text which documents `core / standard / full`
  (re-pinned to next 2026-06-08; was `:686`).

### Stage 1 — Install (`npx @opengsd/gsd-core@latest`)

The interactive installer prompts for **runtime** and **global/local** (per README:
"The installer prompts for your runtime ... and whether to install globally or locally").
It does **not** prompt for a **skill profile**. A fresh, non-interactive install resolves
to the **`full`** profile by default.

- **F-02 — The default install dumps the entire 67-command surface; the progressive-
  disclosure lever is never offered at the one moment it matters.**
  `resolveEffectiveProfile()` returns `'full'` for any fresh install with no explicit
  flag and no pre-existing marker (the "Else → 'full'" branch). The leaner `core`
  (8 skills) and `standard` (15 skills) profiles exist and are fully wired — but a
  newcomer must already *know* to pass `--profile=core` on the CLI to get them. There is
  no interactive "Which profile? [core / standard / full]" prompt.
  *Evidence:* `src/install-profiles.cts:499-506` (`resolveEffectiveProfile` default
  branch — re-pinned to next 2026-06-08; was `:443-451`); `bin/install.js` call site has
  no interactive profile prompt — the only profile inputs are the `--profile=`/`--minimal`
  flags parsed at `bin/install.js:371-376` (re-pinned to next; was `264-281`); `bin/install.js:583`
  help text now reads *"full — all skills (default)"* (re-pinned to next; was `:686` *"all 66 skills"* —
  the "66" hard-coded number was removed on next; see F-04).

- **F-03 — Cold-start token cost of the default is real and unflagged to the newcomer.**
  The installer's own `--help` text states the `core` profile *"Cuts cold-start overhead
  from ~12k tokens to ~700"* — i.e. the default `full` surface costs the user ~12k tokens
  of always-on system-prompt description on every session. The newcomer pays this without
  being told it is optional. (Token *quantification* is Stream B's job; this is the
  **UX/discoverability** facet: the choice is hidden.)
  *Evidence:* `bin/install.js:583` (`--minimal ... Cuts cold-start overhead from ~12k
  tokens to ~700` — re-pinned to next 2026-06-08; was `:686`).

- **F-04 — [LARGELY RESOLVED ON `next` — re-pin 2026-06-08]** This finding was measured against
  `feat/non-inferable-pipeline`, where the `--help` text hard-coded three stale counts
  (*"full — all 66 skills"*, *"core — 7 main-loop skills"*, *"standard — ~13 skills"*). **On clean
  `next`, the help text at `bin/install.js:583` was already rewritten to derive the counts
  programmatically** — it now reads
  `core — ${PROFILES.core.length} main-loop skills incl. phase (~130 desc tokens)`,
  `standard — ${PROFILES.standard.length} skills incl. phase, review, config (~700)`, and
  `full — all skills (default)` (no "66" number at all). So `core`/`standard` can no longer drift,
  and the `full` number is gone. **The defect QW-UX-03 was written to fix no longer exists on `next`.**
  The live arrays are still `src/install-profiles.cts:28-37` core = **8** and `:38-56` standard = **14**
  (unchanged), and the live `commands/gsd/*.md` count is **67** — so the *facts* still hold, but the
  stale-string instance is gone. **QW-UX-03 should be re-scoped or closed** (see backlog re-pin note).
  *Evidence:* `bin/install.js:583` (now derives `PROFILES.core.length` / `PROFILES.standard.length`,
  "full — all skills"); `src/install-profiles.cts:28-37` core = 8; `:38-56` standard = 14; live 67.

### Stage 2 — Post-install signpost (the "Done!" message)

After install, the user sees a single next-step line. For Claude global:

> `Done! Restart Claude Code, then in any directory either type /gsd-new-project or ask
> Claude to run the gsd-new-project skill.`  — `bin/install.js:11866` (re-pinned to next 2026-06-08; was `:10263`)

For all other targets:

> `Done! Open a blank directory in <program> and run /gsd-new-project.` — `bin/install.js:11874` (re-pinned to next 2026-06-08; was `:10271`)

This is a good single next step. Two gaps:

- **F-05 — The post-install message points only to `/gsd-new-project`; it does not point
  to `/gsd-help` (the curated one-page tour) or mention that the surface can be slimmed.**
  A newcomer who just got 67 commands has no in-terminal signpost to (a) orient
  (`/gsd-help`) or (b) reduce the surface (`/gsd-surface profile core`). The only pointer
  is `/gsd-new-project` and a Discord link (`bin/install.js:11868,11876`).
  *Evidence:* `bin/install.js:11864-11877` (both "Done!" branches — re-pinned to next 2026-06-08;
  was `10262-10274` / `10265,10273`).

- **F-06 — The tutorial's promised install output does not match the real installer
  output (doc/code drift on the newcomer's very first screen).**
  `docs/tutorials/your-first-project.md:36-40` tells the newcomer they "will see output
  like":
  ```
  ✓ Installed 86 skills to .claude/commands/
  ✓ GSD Core ready — run /gsd-new-project to start
  ```
  The real installer prints `✓ Installed <count> commands to commands/gsd/`
  (`bin/install.js:10111`) and ends with `Done! ... run /gsd-new-project`
  (`bin/install.js:11874`) — **not** "GSD Core ready". The tutorial also claims **"86
  skills"** while the live count is **67**. A first-timer comparing the doc to their
  screen sees a mismatch on step 1.
  *Evidence:* `docs/tutorials/your-first-project.md:36-40` vs `bin/install.js:10111,11874`
  (re-pinned to next 2026-06-08; was `8775,10271`); live `commands/gsd/*.md` count = 67.

### Stage 3 — First command (`/gsd-new-project` → first result)

`/gsd-new-project` is a sound first command: it gathers context, asks one question first,
then writes `.planning/PROJECT.md` etc. (`commands/gsd/new-project.md:22-34`). Its body
ends by pointing the user to the next step. This stage is in good shape.

- **F-07 — The slash-menu the newcomer scrolls *before* picking `/gsd-new-project` shows
  all 67 commands with no ordering or "start here" grouping.**
  The runtime renders one menu entry per installed skill. With the `full` default, a
  newcomer opens the menu to 67 `/gsd-*` entries — including 6 `ns-*` namespace facades
  (`ns-context`, `ns-ideate`, `ns-manage`, `ns-project`, `ns-review`, `ns-workflow`) that
  are *alternate dispatchers* over the same workflows, not distinct beginner actions
  (`src/clusters.cts:97-104`). The core loop a newcomer needs is 6 commands
  (`src/clusters.cts:33-40`). There is no visual "these 6 first" affordance at the menu
  level; the only curated tour is behind `/gsd-help` default mode, which the newcomer is
  not pointed to (see F-05).
  *Evidence:* live count 67; `src/clusters.cts:33-40` (`core_loop` = 6); `src/clusters.cts:97-104`
  (`ns_meta` = 6 facades); `gsd-core/workflows/help.md:5-24` (`/gsd-help` default tier is
  the curated tour, but it is opt-in).

### What is already good (keep — do not regress)

- **The progressive-disclosure machinery is fully built and is the asset to lean on, not
  reinvent.** `/gsd-surface` (`commands/gsd/surface.md`) can apply a profile, list, or
  disable a cluster *without reinstall*; `--profile=core|standard|full` is composable and
  persisted across `gsd update`; 10 named clusters exist (`src/clusters.cts:32-137`); the
  install marker (`.gsd-profile`) and surface state (`.gsd-surface.json`) are honored on
  update. Every quick-win below **routes the newcomer to existing levers** rather than
  proposing new mechanism.
- **`/gsd-help` is well-tiered** (brief / default / full / topic; lazy-loaded mode files)
  — the default tier is a curated one-page tour, not a 67-line dump (`gsd-core/workflows/help.md:5-24`).
- **The first command (`/gsd-new-project`) is a strong, single, obvious entry point.**

---

## 2. Drafted UX quick-wins (BACKLOG-SCHEMA format)

ICE = Impact × Confidence × Ease, each 1–5, higher = better. `plan_only: true` on every
item. Power-user impact noted per item. Surface-reduction items are **progressive
disclosure**, never deletion; safety/recovery commands are **criticality-exempt**.

```yaml
- id: QW-UX-01
  title: "Add an interactive profile prompt to the installer (core / standard / full, default highlighted)"
  impact: 5          # the single highest-leverage newcomer moment — sets surface + cold-start cost at install
  confidence: 5      # machinery already exists (profiles wired); gap is purely the missing prompt
  ease: 3            # touches the installer's interactive flow + must stay no-op for non-interactive/flag installs; multi-runtime
  ice: 75            # 5 × 5 × 3
  tshirt: M
  product: UX
  owner: bin-subsystem-owner
  runtime_blast_radius: all-14+    # installer serves every runtime
  mechanical_vs_instructional: n/a # installer code, not prompt-corpus
  severity: n/a
  citation: "src/install-profiles.cts:499-506 (default→full); bin/install.js call site has no interactive profile prompt (flags parsed at bin/install.js:371-376)"   # re-pinned to next 2026-06-08 (was install-profiles 443-451; bin 8311-8316/264-281)
  plan_only: true
  recall_gate: n/a
  power_user_impact: "None on flag/CI installs — prompt MUST be skipped when --profile/--minimal is passed or stdin is non-TTY (installer already gates the runtime prompt on isTTY, bin/install.js:12127 — re-pinned to next; was :8599). Power users keep flag-driven installs unchanged; marker still persisted."

- id: QW-UX-02
  title: "Document the profile choice in the README Quickstart and install-on-your-runtime guide"
  impact: 4          # makes the leaner option discoverable at the discovery stage, before commit
  confidence: 5      # pure docs; the flag/levers already exist and are cited
  ease: 5            # docs-only, additive, zero runtime risk
  ice: 100           # 4 × 5 × 5
  tshirt: S
  product: UX
  owner: ux-onboarding-owner
  runtime_blast_radius: none       # docs only
  mechanical_vs_instructional: n/a
  severity: n/a
  citation: "README.md Quickstart (no profile mention; grep -niE 'profile|surface' README.md → 0 hits); bin/install.js:583 (--profile help text exists)"   # re-pinned to next 2026-06-08 (was :686)
  plan_only: true
  recall_gate: n/a
  power_user_impact: "Pure addition — power users already know the flags; a short callout does not change their path."

- id: QW-UX-03
  title: "Fix ALL three stale skill counts in the installer --help block ('66'→67, core '7'→8, standard '~13'→14)"
  impact: 2          # small, but it is a first-touch trust signal
  confidence: 5      # all three are directly verifiable against src/install-profiles.cts and the live count
  ease: 5            # three numbers in one help-block string
  ice: 50            # 2 × 5 × 5
  tshirt: S
  product: UX
  owner: bin-subsystem-owner
  runtime_blast_radius: none       # help text only
  mechanical_vs_instructional: n/a
  severity: n/a
  citation: "RE-PIN 2026-06-08 — LARGELY RESOLVED ON next: bin/install.js:583 already derives counts (`PROFILES.core.length` / `PROFILES.standard.length`) and 'full — all skills' has no number. The three hard-coded stale counts (66/7/~13) existed on feat (was bin/install.js:686) but are GONE on next. Live facts still: commands/gsd/*.md = 67; src/install-profiles.cts:28-37 core = 8; :38-56 standard = 14."
  plan_only: true
  recall_gate: n/a
  status_on_next: "OBSOLETE/RE-SCOPE — the stale-count instance this fixes no longer exists on next; the executor's own 'derive programmatically' recommendation was already implemented. Close or re-scope to a drift-lock test."
  power_user_impact: "None. (Was: three stale counts in one --help string; now derived programmatically on next.)"

- id: QW-UX-04
  title: "Reconcile the tutorial's claimed install output with the real installer output"
  impact: 3          # the newcomer's literal first screen mismatches the guide
  confidence: 5      # both strings are cited and divergent
  ease: 5            # docs-only edit to one code block
  ice: 75            # 3 × 5 × 5
  tshirt: S
  product: UX
  owner: ux-onboarding-owner
  runtime_blast_radius: none       # docs only
  mechanical_vs_instructional: n/a
  severity: n/a
  citation: "docs/tutorials/your-first-project.md:36-40 ('86 skills' + 'GSD Core ready') vs bin/install.js:10111,11874 (real strings) — re-pinned to next 2026-06-08 (was 8775,10271); live count 67"
  plan_only: true
  recall_gate: n/a
  power_user_impact: "None — power users skip the tutorial."

- id: QW-UX-05
  title: "Add an orientation + surface-slimming signpost to the post-install 'Done!' message"
  impact: 4          # gives the newcomer two missing next steps: orient (/gsd-help) and slim (/gsd-surface)
  confidence: 4      # message is the right surface; exact wording needs a quick maintainer pass
  ease: 4            # two console.log branches; mechanical string change, multi-runtime (verify $/colon forms)
  ice: 64            # 4 × 4 × 4
  tshirt: S
  product: UX
  owner: bin-subsystem-owner
  runtime_blast_radius: all-14+    # both 'Done!' branches serve every runtime
  mechanical_vs_instructional: n/a # installer output, not a shipped prompt
  severity: n/a
  citation: "bin/install.js:11864-11877 (both 'Done!' branches point only at /gsd-new-project + Discord) — re-pinned to next 2026-06-08 (was 10262-10274)"
  plan_only: true
  recall_gate: n/a
  power_user_impact: "Negligible — one extra line. Keep it to ≤2 lines so it does not bury the primary /gsd-new-project step."

- id: QW-UX-06
  title: "Make the standard profile (not full) the recommended/default-highlighted newcomer choice"
  impact: 4          # standard = core loop + phase/review/config/progress + resume/pause/workspace; the realistic first-run set without the full firehose
  confidence: 3      # 'best default' is a judgment call; standard already exists and is closure-correct
  ease: 3            # if paired with QW-UX-01 it is a default selection; standalone it is a default-resolution change with back-compat care
  ice: 36            # 4 × 3 × 3
  tshirt: M
  product: UX
  owner: bin-subsystem-owner
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: n/a
  severity: n/a
  citation: "src/install-profiles.cts:38-56 (standard set) + :499-506 (current default = full) — re-pinned to next 2026-06-08 (default was 443-451)"
  plan_only: true
  recall_gate: n/a
  power_user_impact: "MUST preserve full via flag/marker; existing installs keep their marker (resolveEffectiveProfile honors a non-full marker, src/install-profiles.cts:503-504 — re-pinned to next; was 447-448). NOTE: changing the bare default is a behavior change — recommend shipping ONLY behind the interactive prompt (QW-UX-01) so non-interactive/CI installs keep 'full' back-compat. Do NOT silently flip the non-interactive default."

- id: QW-UX-07
  title: "Tier the slash-menu surface so the 6 core-loop commands read as 'start here' (progressive disclosure)"
  impact: 4          # the 67-entry menu is the newcomer's first overwhelm; the core loop is only 6
  confidence: 3      # the cluster grouping exists; how a given runtime renders/sorts the menu is runtime-dependent
  ease: 2            # menu ordering/grouping is partly runtime-controlled; likely needs naming/description affordances, not a one-liner
  ice: 24            # 4 × 3 × 2
  tshirt: L
  product: UX
  owner: ux-onboarding-owner
  runtime_blast_radius: multi       # depends on which runtimes expose menu ordering
  mechanical_vs_instructional: n/a
  severity: n/a
  citation: "live count 67; src/clusters.cts:33-40 (core_loop=6) vs :97-104 (ns_meta=6 facades)"
  plan_only: true
  recall_gate: n/a
  power_user_impact: "Progressive disclosure only — NO command removed; full surface remains reachable. Power users unaffected since nothing is cut. (If unachievable as a quick-win, hand to Phase 15.)"

- id: QW-UX-08
  title: "Clarify the ns-* namespace facades vs their underlying commands for newcomers"
  impact: 3          # 6 ns-* menu entries look like distinct beginner actions but are alternate dispatchers — confusing surface
  confidence: 4      # the facade nature is verifiable in the cluster + command files
  ease: 4            # docs/description clarification (e.g. mark as 'advanced dispatcher'); no behavior change
  ice: 48            # 3 × 4 × 4
  tshirt: S
  product: UX
  owner: ux-onboarding-owner
  runtime_blast_radius: claude-only # description/menu copy; verify other runtimes separately
  mechanical_vs_instructional: instructional   # edits command-file frontmatter/body prose that ships to the runtime
  severity: n/a
  citation: "src/clusters.cts:97-104 (ns_meta facades); commands/gsd/ns-*.md (6 files)"
  plan_only: true
  recall_gate: "lint:descriptions (scripts/lint-descriptions.cjs, ≤100 char gate) + lint:skill-deps closure — confirm no ns-* requires/closure breaks before any copy change"
  power_user_impact: "None to behavior — ns-* still dispatch identically. Power users who use the namespace facades keep them. If the recommendation grows into 'hide ns-* from core/standard surface', tier it via clusters (already disable-able) — never delete."
```

### Items deferred to Phase 15 (too big for a quick-win)

- **Deep two-audience (newcomer vs power-user) menu/IA redesign.** QW-UX-07 is the
  quick-win slice (tier the core loop as "start here"). A full information-architecture
  pass over all 67 commands + per-runtime menu-rendering differences is the Phase-15
  deep terminal-UX assessment — handed off, not forced into the fast-track.
- **Programmatic, drift-proof skill-count surfacing everywhere** (help text, tutorial,
  README badges). QW-UX-03/04 fix the current instances; a single derived source-of-truth
  for the count is a Phase-15 maintainability item.

---

## 3. Coverage against the Phase-2 success criteria

| Criterion | Met by |
|---|---|
| 1. Cited newcomer-journey friction (install→first command→first result), no assertion | §1 stages 0–3, F-01..F-07, every point `file:line`-cited |
| 2. ICE-sized, owner-assignable; surface-reduction tiered as progressive disclosure; safety/recovery criticality-exempt | §2 (8 items, all ICE-scored + owner); QW-UX-06/07/08 explicitly progressive-disclosure; no item cuts a command by low usage |
| 3. runtime_blast_radius tag + plan_only | every item tagged `none`/`claude-only`/`multi`/`all-14+`; `plan_only: true` on all |
| 4. Power-user impact noted | `power_user_impact` field on every item |
