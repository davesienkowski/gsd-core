# Concern Sweep — UX / Onboarding (deep)

> **Phase 15** · Requirement **UX-01** · `problem_type: human-friction` · plan-only.
> **Charter:** `docs/audit/comprehensive/AUDIT-CHARTER.md` (§2.2 card schema, §3.5 load-bearing guard).
> **Derived:** 2026-06-08 from a fresh read of live code + the Phase-11 usage backbone.
> **Firewall honored:** no prior internal artifact (`.planning/codebase/*`, `*-2026-06-05.md`,
> frontier synthesis) was opened. Evidence is live `file:line`, the Phase-11 `USAGE-*` keys, or
> a concrete reproduction.

This is the deep, **two-audience** counterpart to the Milestone-1 UX stream
(`docs/audit/streams/ux-stream.md`). M1 traced the **newcomer** journey; this sweep
(a) re-confirms every M1 UX finding against the *current* code (line numbers have drifted — the
README and `bin/install.js` were restructured since M1), folding them in with `provenance`,
(b) adds the **power-user** track that is new to M2, drawn from the Phase-11 hot path, and
(c) tests the "two tracks" framing as a *hypothesis* against what the usage data actually shows.

---

## 0. The single-author caveat (inherited, load-bearing)

Every finding below that cites a `USAGE-*` key inherits the Phase-11 limiter
(`evidence/usage-full.md` § top): **the usage signal is one developer's local transcripts
(n=1 author, 92 sessions), not a population.** A low usage count is a *prompt to investigate
progressive disclosure*, **never** a standalone basis to cut a command, skill, or flag. Cards
that lean on a count carry `confidence-limiter: single-author (Phase 11)` and are capped at
`confidence: 3`. Newcomer findings are sourced from live code / docs (not the power-user log),
so they do not inherit this cap.

---

## 1. The two-tracks hypothesis — what the usage data supports (SC-3)

**Hypothesis (entering the sweep):** GSD serves two distinct audiences — newcomers (install →
first command → first result) and power-users (high-frequency orchestration) — and they need
*different* surfaces.

**Verdict: SUPPORTED in direction, REFINED in shape. The data shows two tracks, but they are
not two disjoint populations — they are two *stages of the same user*, and the friction is the
absence of a path between them.**

What the evidence actually says:

- **The power-user track is real and concentrated.** The top-4 typed commands
  (`autonomous` 18, `resume-work` 11, `explore` 10, `quick` 7 — `USAGE-CMD-01..04`) are
  **70.8 %** of all typed GSD volume; `plan-phase`/`execute-phase` are the workhorse dispatched
  skills (`USAGE-SKILL-01/02`). A heavy user lives in ~6–8 commands, not 67.
- **The newcomer track is, by construction, *unobserved* in this log.** Phase 11 is explicit:
  this is a power-user's transcript; it contains *zero* newcomer first-run sessions. So the
  newcomer track cannot be validated from usage frequency at all — it is validated from the
  **live first-run code path** (§2), which is the correct evidence type for it.
- **The two tracks are not symmetric.** The power-user's complaint is *depth* (undocumented
  flags on commands they use daily — §3); the newcomer's complaint is *breadth* (67 commands,
  no "start here", the cheaper surface invisible — §2). One audience needs **more disclosure of
  what they already use**; the other needs **less surface up front**. A single "tier the menu"
  fix does not serve both.
- **The refinement that matters:** the data shows the *same person* moving from track 1 to
  track 2 (`new-project` → `plan-phase`/`execute-phase` → `autonomous`). The genuine UX gap is
  not "pick the right audience" but **"is there a visible on-ramp from the 6-command core loop
  up to the power surface?"** The progressive-disclosure machinery (`/gsd-surface`, profiles)
  is exactly that on-ramp — and it is invisible to the newcomer at the one moment it matters
  (§2, central finding). **So the two-tracks framing should drive a *progression* design (core
  → standard → full, surfaced and reversible), not a *segmentation* design (build two products).**

This verdict is reflected in the recommendations: surface-reduction is tiered as **progressive
disclosure that the user can walk up**, never a fork into two fixed audiences.

---

## 2. Newcomer track — install → first command → first result

Re-walked on the **live** code. M1's seven friction points (F-01..F-07) all **persist**; line
numbers have drifted (README + `bin/install.js` restructured), so citations are re-pinned. Two
findings are **new** to the deep pass. The central M1 thread — *the progressive-disclosure
machinery exists but is invisible to newcomers; the default install is `full`/67* — is the
spine of this section and is deepened below.

### Central finding (deepened): the cheaper surface exists, is fully wired, and is invisible at every newcomer touchpoint

The machinery is real and excellent: `core` (8 skills, ~130 desc tokens), `standard`
(14 skills, ~700), `full` (67, ~1,200) are defined in `src/install-profiles.cts:27-58`;
`/gsd-surface` re-tiers live without reinstall; the `.gsd-profile` marker survives `gsd update`.
A whole how-to (`docs/how-to/install-minimal-and-add-skills.md`) documents it. **Yet a newcomer
never meets it:** it is absent from the README (verified 0 hits), absent from the interactive
installer prompt, absent from the post-install message, and absent from the tutorial. The
how-to that explains it is reachable only from `docs/README.md` — not from the Quickstart a
newcomer follows. The asset is built; the *signposting* is the entire gap. Every newcomer card
below is a facet of this one thread.

### Stage 0 — Discovery (README)

- **F-UX-01 — Install size/cost is invisible before commit; the leaner profile is undiscoverable
  at the discovery stage.** `grep -niE "profile|minimal|surface" README.md` → **0 hits** (the
  README was restructured since M1 — npx is now `README.md:43`, Quickstart `:40-56` — but still
  mentions no profile choice). The newcomer cannot make an informed "how much am I installing?"
  decision, and the `install-minimal-and-add-skills` how-to is not linked from the Quickstart.

### Stage 1 — Install

- **F-UX-02 — The default install surfaces the entire 67-command surface; the
  progressive-disclosure lever is never offered at the one interactive moment it matters.**
  `resolveEffectiveProfile()` returns `'full'` for any fresh install with no flag and no marker
  (`src/install-profiles.cts:499-507`, the "Else → 'full'" branch). `core`/`standard` are wired
  but the installer prompts only for runtime + global/local — there is **no** "Which profile?"
  prompt. A newcomer must already know to pass `--profile=core`.
- **F-UX-03 — Cold-start token cost of the default is real and unflagged.** The `full` default
  carries ~1,200 description tokens of always-on system prompt every session vs ~130 for `core`
  (`docs/how-to/install-minimal-and-add-skills.md:35,47-49`). The newcomer pays this without
  being told it is optional. (Token *quantification* is the Bloat/Token lens; this is the
  *discoverability* facet — the choice is hidden.)

### Stage 2 — Post-install signpost

- **F-UX-04 — The "Done!" message points only to `/gsd-new-project`; no pointer to `/gsd-help`
  (orient) or `/gsd-surface` (slim).** `bin/install.js:11864-11877` — both branches (claude-global
  and all-other) print one next step + a Discord link. A newcomer who just received 67 commands
  has no in-terminal route to orient or reduce.
- **F-UX-05 — The tutorial's promised install output does not match the real installer (drift on
  the newcomer's literal first screen).** `docs/tutorials/your-first-project.md:36-38` shows
  `✓ Installed 86 skills …` / `✓ GSD Core ready`; the real installer prints
  `✓ Installed <count> skills/commands to …` (`bin/install.js:9952-10095`) and ends with
  `Done! …` (`:11866`) — never "GSD Core ready". The "86 skills" claim is doubly wrong (live = 67).

### Stage 3 — First command → first result

- **F-UX-06 — The 6-command core loop has no "start here" affordance in the 67-entry slash menu.**
  With `full` default the menu renders all 67 `/gsd-*` entries — including 6 `ns-*` namespace
  facades (`src/clusters.cts:97-104`) that are alternate dispatchers, not beginner actions —
  with no ordering or grouping. The core loop is only 6 (`src/clusters.cts:33-40`). The one
  curated tour (`/gsd-help` default tier, `gsd-core/workflows/help.md`) is opt-in and unsignposted
  (see F-UX-04).
- **F-UX-07 (NEW) — The newcomer's first command-to-command handoff instructs a non-canonical
  colon-form slash command.** `commands/gsd/new-project.md:33` tells the user: *"Run
  `/gsd:plan-phase 1` to start execution."* The colon form is the documented **anti-pattern** —
  canonical is `/gsd-plan-phase` (a `scripts/fix-slash-commands.cjs` exists specifically to
  correct it; CLAUDE.md architecture: *"legacy `/gsd:<cmd>` is never emitted"*). On Codex this
  would render as a shell-var `$gsd-*`, not a colon form at all. So the very first handoff a
  newcomer is told to type may not match the menu they see. This is a *behavior-over-narration*
  finding: the command file's prose contradicts the runtime's canonical emission.
- **F-UX-08 (NEW) — The colon-form anti-pattern is systemic in shipped command prose, not a
  one-off.** `grep -rln "/gsd:" commands/gsd/*.md` → **18 of 67 files** (incl. new-project,
  plan-phase, quick, ship, verify-work, progress, review, …). Every copy-pasteable `/gsd:…`
  example in a shipped command body is a small trust/correctness papercut for both audiences and
  diverges per-runtime. This is `human-friction` (the user is told to type the wrong token); a
  Bloat/Maintainability co-lens (a single emitter would prevent the drift) is noted, not owned here.

---

## 3. Power-user track — the Phase-11 hot path (new in M2)

The power-user surface is `USAGE-CMD-01..04` (autonomous / resume-work / explore / quick) plus
the workhorse dispatched skills `plan-phase`/`execute-phase`. Their friction is **depth**, not
breadth — undocumented controls on commands used daily — and it is exactly the facet a newcomer
sweep cannot see.

- **F-UX-09 (NEW) — `gsd-resume-work` (the #2 power-user command) ships with NO `argument-hint`,
  yet it owns the largest share of the live flag surface.** `commands/gsd/resume-work.md` has no
  `argument-hint` frontmatter (contrast `autonomous.md:4` which lists all four of its flags).
  Phase 11 shows the same user driving resume-work with **5+ distinct flags** — `-p`,
  `--interactive`, `--wave`, `--gaps-only`, `--no-transition` (`USAGE-SFLAG-05/07/08/09/10`),
  plus `--stopped-at`, `--resume-file` (`USAGE-TFLAG-07/08`). None appear in the command's
  `argument-hint`, and the `/gsd-help` full mode lists `/gsd:resume-work` with **no flags at
  all** (`gsd-core/workflows/help/modes/full.md:268-275`) — `--wave`/`--gaps-only` are documented
  there only under *execute-phase* (`:112-116`). A power-user cannot discover their own daily
  controls from any first-class surface; they are folklore. *Evidence:*
  `commands/gsd/resume-work.md` (no `argument-hint`); `USAGE-SFLAG-05/07/08/09/10`,
  `USAGE-TFLAG-07/08`; `gsd-core/workflows/help/modes/full.md:268-275`.
  `confidence-limiter: single-author (Phase 11)` — the *existence* of the flags is code-checkable;
  the *frequency* is single-author.
- **F-UX-10 (NEW) — The user-facing slash-flag surface is barely exercised and undocumented —
  a progressive-disclosure lead, NOT a cut list.** Across **all** typed slash commands only
  **20 flag tokens / 11 distinct flags** appear (`USAGE-SFLAG-*`), and `resume-work` owns 5 of
  the rarest. Read with the caveat, this says: the documented-but-unsurfaced flag surface earns
  little visible use *for this user* — a candidate for **progressive disclosure** (surface the
  2–3 load-bearing flags in `argument-hint`/help; tier the rest behind `--help`/full mode),
  never deletion-by-low-usage (charter §3.5). `--from`/`--to` (autonomous range,
  `USAGE-SFLAG-01/02`) and the engine `--files`/`--phase-dir` pair (`USAGE-TFLAG-01/02`) are the
  genuinely load-bearing ones to keep first-class. `confidence-limiter: single-author (Phase 11)`.
- **F-UX-11 (NEW) — GSD runs interleaved with non-GSD skill packs; the hot path assumes GSD
  owns the session, which it does not.** Phase 11 shows `superpowers:*` skills among the most
  dispatched (`USAGE-SKILL-05/09/11/12`: brainstorming 8, receiving-code-review 4,
  systematic-debugging 2, TDD 2) — interleaved with the GSD loop. The power-user's real workflow
  blends GSD with other packs, but GSD's surface (help, command bodies, the "Done!" signpost)
  presents as if GSD is the whole world. For a power-user this is low-grade friction (context
  switches between two command vocabularies); the takeaway is a *humility* one for IA design:
  GSD's menu/help should coexist gracefully with a crowded `/`-menu, reinforcing F-UX-06 (the
  67-entry GSD block is part of an even larger real menu). *Evidence:* `USAGE-SKILL-05/09/11/12`.
  `confidence-limiter: single-author (Phase 11)`.
- **F-UX-12 (NEW) — The colon-form anti-pattern (F-UX-08) also lands in the power-user hot path.**
  `quick.md`, `plan-phase.md`, `progress.md`, `verify-work.md`, `ship.md`, `review.md` are among
  the 18 colon-form files — all power-user commands. The same systemic copy issue hits both
  tracks; carded once at F-UX-08, cross-referenced here so the power-user track is not understated.

---

## 4. What is already good (keep — do not regress)

- The **progressive-disclosure machinery is fully built** and is the asset to lean on, not
  reinvent: `/gsd-surface` re-tiers live; `--profile=core|standard|full` composes and persists;
  10 named clusters (`src/clusters.cts:32-137`); `core`/`standard` both include `surface` and
  `help` so a slimmed install can still grow and orient itself (`src/install-profiles.cts:28-56`).
- `/gsd-help` is **well-tiered** (brief/default/full/topic, lazy-loaded mode files) — the default
  tier is a curated one-page tour, not a 67-line dump (`gsd-core/workflows/help.md`).
- **`/gsd-new-project` is a strong single entry point** (it asks one question first, then writes
  `.planning/PROJECT.md`).
- **Qwen already gets runtime-level progressive disclosure for free:** its skills carry a numeric
  `priority` so the most-used workflows sort first in the `/skills` list
  (`docs/how-to/install-on-your-runtime.md:329`). This is a *proof the menu-ordering lever exists*
  for at least one runtime — relevant to F-UX-06's feasibility (see card below).

---

## 5. Evidence cards (charter §2.2 schema)

All cards: `problem_type: human-friction`, `plan_only: true`. M1 folds carry `provenance`.
Cards leaning on a usage count carry `confidence-limiter: single-author (Phase 11)`.
These cards are the Phase-15 contribution to the `FINDINGS.md` register (Phase 17 aggregates;
not written here — outside this phase's allowed paths).

### Newcomer track

```yaml
- id: F-UX-01
  problem_type: human-friction
  subsystem: docs
  file:line: "README.md (grep -niE 'profile|minimal|surface' → 0 hits; Quickstart :40-56)"
  severity: 3            # the leaner option is undiscoverable at the decision point
  effort: S
  risk: low
  confidence: 5
  runtime_blast_radius: none      # docs only
  mechanical_vs_instructional: n/a
  recommendation: "Add a 2-line profile callout to the README Quickstart (core ~130 / standard ~700 / full ~1,200 desc tokens) and link docs/how-to/install-minimal-and-add-skills.md. Additive; flags already exist."
  recall_gate: n/a
  provenance: "QW-UX-02 (M1, ICE 100); re-confirmed live — README restructured but still 0 profile mentions."

- id: F-UX-02
  problem_type: human-friction
  subsystem: installer            # bin/
  file:line: "src/install-profiles.cts:499-507 (default→'full'); bin/install.js interactive prompt (runtime + global/local only, no profile arm)"
  severity: 4            # the single highest-leverage newcomer moment sets surface + cold-start cost
  effort: M
  risk: med              # touches interactive flow; MUST stay no-op for --profile/--minimal/non-TTY/CI
  confidence: 5
  runtime_blast_radius: all-14+   # installer serves every runtime
  mechanical_vs_instructional: n/a
  recommendation: "Add an interactive 'Which profile? [core / standard / full]' prompt, default highlighted, gated on isTTY and skipped when --profile/--minimal is passed (installer already gates the runtime prompt on isTTY). Non-interactive/CI installs keep 'full' back-compat unchanged."
  recall_gate: n/a
  provenance: "QW-UX-01 (M1, ICE 75; UX+Token co-lens — sets the ~1,200→~130 cold-start at install)."

- id: F-UX-03
  problem_type: human-friction
  subsystem: installer
  file:line: "docs/how-to/install-minimal-and-add-skills.md:35,47-49 (~130 vs ~1,200 desc tokens); default=full per F-UX-02"
  severity: 3
  effort: S
  risk: low
  confidence: 4
  runtime_blast_radius: none      # surfacing the cost is copy; the cost itself is the Token lens
  mechanical_vs_instructional: n/a
  recommendation: "Surface the cold-start cost beside the profile choice (in the F-UX-02 prompt and the F-UX-01 README callout). Token *quantification* is the Bloat/Token sweep; this card owns only the discoverability facet."
  recall_gate: n/a
  provenance: "QW-UX-01 cold-start facet (M1, merged UX+Token lever)."

- id: F-UX-04
  problem_type: human-friction
  subsystem: installer
  file:line: "bin/install.js:11864-11877 (both 'Done!' branches → only /gsd-new-project + Discord)"
  severity: 3
  effort: S
  risk: low
  confidence: 5
  runtime_blast_radius: all-14+   # both branches serve every runtime
  mechanical_vs_instructional: n/a
  recommendation: "Add ≤2 lines to the 'Done!' message: orient (/gsd-help) and, when installed at 'full', slim (/gsd-surface profile core). Render via the per-runtime slash form (runtime-slash) so it is correct on Codex ($gsd-*). Keep /gsd-new-project the primary step."
  recall_gate: n/a
  provenance: "QW-UX-05 (M1, ICE 64)."

- id: F-UX-05
  problem_type: human-friction
  subsystem: docs
  file:line: "docs/tutorials/your-first-project.md:36-38 ('86 skills' + 'GSD Core ready') vs bin/install.js:9952-10095,11866 (real strings); live commands/gsd/*.md = 67"
  severity: 3            # drift on the newcomer's literal first screen
  effort: S
  risk: low
  confidence: 5
  runtime_blast_radius: none      # docs only
  mechanical_vs_instructional: n/a
  recommendation: "Replace the tutorial's fabricated output block with the real installer lines; drop the hard-coded '86' (derive or omit the count). See F-UX-13 for a single drift-proof count source."
  recall_gate: n/a
  provenance: "QW-UX-04 (M1, ICE 75); re-confirmed live — still '86 skills'/'GSD Core ready'."

- id: F-UX-06
  problem_type: human-friction
  subsystem: skills               # commands/gsd/*.md surface + per-runtime menu
  file:line: "live count 67; src/clusters.cts:33-40 (core_loop=6) vs :97-104 (ns_meta=6 facades); gsd-core/workflows/help.md (curated tour is opt-in)"
  severity: 3
  effort: L              # menu ordering is partly runtime-controlled; needs naming/description/priority affordances
  risk: med              # touches shipped command frontmatter across the skills-surface (12 runtimes)
  confidence: 4
  runtime_blast_radius: multi     # depends which runtimes expose menu ordering (Qwen has 'priority'; others vary)
  mechanical_vs_instructional: instructional   # edits frontmatter/description prose that ships to the runtime
  recommendation: "Tier the slash menu so the 6 core-loop commands read as 'start here' (progressive disclosure — NO command removed; full surface stays reachable). Lean on the existing cluster grouping + the Qwen-style numeric 'priority' frontmatter (docs/how-to/install-on-your-runtime.md:329) where the runtime supports it; for runtimes without ordering, fall back to the F-UX-02 default-profile lever so the menu is short by construction."
  recall_gate: "lint:descriptions (≤100 char) + lint:skill-deps closure must pass after any frontmatter/description change"
  provenance: "QW-UX-07 (M1, ICE 24) — explicit M1 Phase-15 handoff: the deep two-audience menu/IA pass. Folded in + deepened (the on-ramp framing from §1, not segmentation)."

- id: F-UX-07
  problem_type: human-friction
  subsystem: skills               # commands/gsd/new-project.md (prompt corpus)
  file:line: "commands/gsd/new-project.md:33 ('Run /gsd:plan-phase 1') — colon anti-pattern on the first command-to-command handoff"
  severity: 3            # newcomer is told to type a non-canonical token at the worst moment
  effort: S
  risk: low
  confidence: 5
  runtime_blast_radius: all-14+   # colon form is wrong on every runtime; Codex renders $gsd-*
  mechanical_vs_instructional: mechanical   # canonical-form substitution, not load-bearing instruction (the instruction = 'run plan-phase next' is preserved)
  recommendation: "Replace '/gsd:plan-phase' with the canonical '/gsd-plan-phase' (or a runtime-rendered token). Part of the systemic F-UX-08 sweep, but flagged separately because it sits on the newcomer's first handoff. cross_check: scripts/fix-slash-commands.cjs exists precisely to correct colon-form."
  recall_gate: n/a

- id: F-UX-08
  problem_type: human-friction
  subsystem: skills               # 18/67 commands/gsd/*.md (prompt corpus)
  file:line: "grep -rln '/gsd:' commands/gsd/*.md → 18 files (incl. new-project, plan-phase, quick, ship, verify-work, progress, review)"
  severity: 2            # papercut, but systemic and trust-eroding for both audiences
  effort: M              # 18 files; ideally one emitter so it cannot drift back
  risk: low
  confidence: 5
  runtime_blast_radius: all-14+
  mechanical_vs_instructional: mechanical   # verbatim colon→hyphen substitution; no behavior change
  recommendation: "Normalize all 18 colon-form '/gsd:' examples in shipped command bodies to the canonical hyphen form (or a runtime-rendered token). Prefer a lint/codemod so it cannot regress; scripts/fix-slash-commands.cjs is the existing seam. Bloat/Maintainability co-lens (single emitter) noted, not owned here."
  recall_gate: n/a
```

### Power-user track

```yaml
- id: F-UX-09
  problem_type: human-friction
  subsystem: skills               # commands/gsd/resume-work.md (prompt corpus)
  file:line: "commands/gsd/resume-work.md (no argument-hint frontmatter); evidence/usage-full.md#USAGE-SFLAG-05/07/08/09/10 + #USAGE-TFLAG-07/08; gsd-core/workflows/help/modes/full.md:268-275 (resume-work listed with no flags)"
  severity: 3            # the #2 power-user command hides its own daily controls
  effort: S              # add an argument-hint + a help-mode flag list
  risk: low
  confidence: 4          # flag existence is code-checkable; frequency is single-author
  runtime_blast_radius: all-14+   # argument-hint/help ships to every runtime
  mechanical_vs_instructional: instructional   # adds frontmatter/help prose that ships to the runtime
  recommendation: "Add an argument-hint to resume-work covering its load-bearing flags (e.g. [--interactive] [--gaps-only] [--wave N] [--stopped-at] [--resume-file]) and document them in the /gsd-help full mode alongside the command. Surface the 2-3 most-used first (progressive disclosure), tier the rest behind --help."
  recall_gate: "lint:descriptions (≤100 char) — argument-hint/description must stay within the gate"
  confidence-limiter: "single-author (Phase 11)"

- id: F-UX-10
  problem_type: human-friction
  subsystem: skills               # user-facing slash-flag surface
  file:line: "evidence/usage-full.md#USAGE-SFLAG-* (20 tokens / 11 distinct flags across ALL typed commands; resume-work owns 5 of the rarest); load-bearing: #USAGE-SFLAG-01/02 (--from/--to), #USAGE-TFLAG-01/02 (--files/--phase-dir)"
  severity: 2
  effort: M
  risk: low
  confidence: 3          # capped — single-author count is the basis for the 'barely exercised' claim
  runtime_blast_radius: multi
  mechanical_vs_instructional: instructional   # flag documentation/surfacing is prompt-corpus copy
  recommendation: "Treat the lightly-used flag surface as a PROGRESSIVE-DISCLOSURE lead, NOT a cut list (charter §3.5): keep --from/--to and the engine --files/--phase-dir first-class; tier the long tail behind --help/full mode. No flag is deleted on low usage; safety/recovery flags criticality-exempt."
  recall_gate: "lint:descriptions; any flag re-tiering must keep the flag reachable via --help (no removal)"
  confidence-limiter: "single-author (Phase 11)"

- id: F-UX-11
  problem_type: human-friction
  subsystem: skills               # IA / help surface
  file:line: "evidence/usage-full.md#USAGE-SKILL-05/09/11/12 (superpowers:* interleaved among most-dispatched skills)"
  severity: 2            # low-grade context-switching friction; an IA-humility signal
  effort: M
  risk: low
  confidence: 3
  runtime_blast_radius: multi
  mechanical_vs_instructional: instructional
  recommendation: "Design GSD's menu/help to coexist with a crowded '/'-menu (other skill packs interleave): keep the GSD block self-identifying and scannable, reinforcing F-UX-06's 'start here' tiering. Do NOT assume GSD owns the session. No change cuts non-GSD skills (out of scope); this is an IA-design constraint, not a surface cut."
  recall_gate: n/a
  confidence-limiter: "single-author (Phase 11)"
```

### Maintainability co-lens carded here (the second M1 Phase-15 handoff)

```yaml
- id: F-UX-13
  problem_type: human-friction
  subsystem: docs                 # cross-cutting: help text, tutorial, README, install output
  file:line: "src/install-profiles.cts:27-58 (the authoritative profile sets) vs hardcoded counts: docs/tutorials/your-first-project.md:36 ('86'); bin/install.js --help text (stale '66'/'7'/'~13' per QW-UX-03); live commands/gsd/*.md = 67"
  severity: 2            # recurring first-touch trust erosion; counts drift every time the surface changes
  effort: M              # one derived source + replace the call sites
  risk: low
  confidence: 5
  runtime_blast_radius: none      # the surfaces are docs/help text
  mechanical_vs_instructional: mechanical
  recommendation: "Establish ONE drift-proof skill-count source derived from src/install-profiles.cts + the live commands/gsd/ listing, consumed by the installer --help, the 'Installed N skills' line, the tutorial, and any README badge — so counts cannot drift again. (QW-UX-03 fixes the current instances; this card resolves the M1 'single drift-proof skill-count source' handoff.) debt_quadrant: prudent-inadvertent."
  recall_gate: n/a
  provenance: "QW-UX-03 (M1, ICE 50, fixes current instances) + explicit M1 Phase-15 handoff 'programmatic drift-proof skill-count surfacing everywhere'. This card owns the durable single-source fix; QW-UX-03 the immediate count corrections."
  debt_quadrant: prudent-inadvertent

- id: F-UX-14
  problem_type: human-friction
  subsystem: skills               # ns-* facades on the newcomer surface
  file:line: "src/clusters.cts:97-104 (ns_meta = 6 facades: ns-context/ideate/manage/project/review/workflow); commands/gsd/ns-*.md (6 files)"
  severity: 2
  effort: S
  risk: low
  confidence: 4
  runtime_blast_radius: claude-only   # description/menu copy; verify other runtimes separately
  mechanical_vs_instructional: instructional   # edits command-file frontmatter/body prose that ships
  recommendation: "Clarify (do NOT delete) that the 6 ns-* entries are alternate dispatchers, not distinct beginner actions — e.g. mark descriptions as 'advanced dispatcher'. If they grow noisy on the newcomer surface, tier them out via the existing ns_meta cluster (already disable-able), never delete. ns-* still dispatch identically."
  recall_gate: "lint:descriptions (≤100 char) + lint:skill-deps closure — confirm no ns-* requires/closure break before any copy change"
  provenance: "QW-UX-08 (M1, ICE 48, UX+Token co-lens — ns-* surface sprawl)."
```

---

## 6. Tiering & criticality-exemption summary (SC-2)

- **All surface-reduction recs are progressive disclosure, never deletion.** F-UX-02/06/10/14
  route the user *through* the existing `install-profiles` / `/gsd-surface` / cluster machinery
  (the explicit M1 directive: lean on the built lever, don't reinvent or delete).
- **The lightly-used flag surface (F-UX-10) is a disclosure lead, not a cut list** — `--from`/
  `--to`/`--files`/`--phase-dir` stay first-class; the tail is tiered behind `--help`, reachable.
- **Safety/recovery commands are criticality-exempt** and appear in **no** cut/tier-out
  recommendation regardless of their usage count: `pause-work`, `resume-work`, `undo`, `health`,
  `forensics`, `recover` paths, `debug`. (F-UX-09 *adds* discoverability to `resume-work`; it
  never trims it.)
- **Blast-radius tags** follow the Phase-7 matrix: docs-only = `none`; installer/command
  frontmatter = `all-14+` (skills-surface = 12+ runtimes); menu-ordering = `multi` (runtime
  support varies — Qwen has `priority`, others do not); ns-* copy = `claude-only` pending
  per-runtime verification.

---

## 7. Coverage against the Phase-15 success criteria

| Criterion | Met by |
|---|---|
| **SC-1** — friction for BOTH audiences, each claim usage-backed or reproduced | §2 newcomer (F-UX-01..08, live `file:line`) + §3 power-user (F-UX-09..12, `USAGE-*` keys + `file:line`) |
| **SC-2** — recs tiered as progressive disclosure + blast-radius tagged; safety/recovery exempt; unexercised flags = disclosure lead | §6; every card carries `runtime_blast_radius`; F-UX-10 is explicitly a lead-not-cut; safety/recovery exempt list in §6 |
| **SC-3** — two-tracks treated as a hypothesis the data validates/refines | §1 — verdict: supported-in-direction, refined to a *progression* (on-ramp) not a *segmentation*; newcomer track validated from live code (unobservable in the power-user log) |
| **SC-4** — fold in (not repeat) M1 QW-UX-*, escalate beyond-scope; pick up both M1 Phase-15 handoffs; deepen the central finding | QW-UX-01..08 fold in with `provenance` (F-UX-01..06,14); the two M1 handoffs resolved: deep menu/IA → F-UX-06 (+§1 on-ramp framing), single drift-proof count → F-UX-13; central finding deepened in §2 |

---

## 8. Plan-only attestation

This phase created only `docs/audit/comprehensive/concerns/ux.md` and the Phase-15 planning
artifacts under `.planning/phases/15-concern-sweep-ux-onboarding-deep/`. No `src/`, `bin/`,
`commands/`, `gsd-core/`, `package.json`, or `.gitignore` was edited; no git commit, no GitHub
write. The firewall (`.planning/codebase/*`, `*-2026-06-05.md`, frontier synthesis) was
honored — only the Phase-7/9/11 M2 evidence, the M1 UX stream + quick-win backlog, the charter,
and live code/docs were opened. Every count and `file:line` is independently re-checkable.
