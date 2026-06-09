> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# Pipeline Trace — command → workflow → engine → agents → artifacts

> **Requirement:** MAP-02 (Phase 9) · **Mode:** audit-and-plan only (no code changed)
> **Derived:** 2026-06-08 by following live code end-to-end (`commands/gsd/`,
> `gsd-core/workflows/`, `gsd-core/bin/gsd-tools.cjs`, `src/*.cts`, `agents/`) — **not** the
> prior `.planning/codebase/*` trace (firewalled until Phase 16, per the charter).
> **Source-of-truth rule (charter §0):** the engine is `src/*.cts`; the compiled
> `gsd-core/bin/lib/*.cjs` is gitignored build output and is never the citation target.
> **Reflexivity guard (charter §3.1, D-04):** every seam below is cross-checked against the
> module graph (`instrumentation/reports/depcruise.json`, madge) — where the narration and the
> graph disagree, the disagreement is called out (§5).

This is a **sequence**, not a file inventory. It follows one concrete command,
`/gsd-plan-phase`, all the way from the user keystroke to the `.planning/` files it leaves on
disk, and shows the two wiring mechanisms that the import graph cannot see:

1. the **bash shim** that locates `gsd-tools.cjs` and turns every `gsd_run …` line in a
   workflow into a `node gsd-tools.cjs …` engine call, and
2. the **`@~/`-include** at-paths that splice reference/template/workflow markdown into a
   command's or agent's context at read time.

A second, shorter command (`/gsd-quick`) is traced in §4 for contrast.

---

## 0. The four layers, named once

| Layer | Lives in | What it is | Who runs it |
|-------|----------|-----------|-------------|
| **Command (skill)** | `commands/gsd/<cmd>.md` | thin frontmatter + `<objective>` + an `<execution_context>` of `@~/`-includes | the AI runtime, when the user types `/gsd-<cmd>` |
| **Workflow** | `gsd-core/workflows/<cmd>.md` | the step-by-step orchestration the runtime executes; embeds bash shims (`gsd_run …`) and `Agent(...)` spawns | the AI runtime (the *orchestrator*) |
| **Engine** | `src/*.cts` → compiled `gsd-core/bin/lib/*.cjs`, entered via `gsd-core/bin/gsd-tools.cjs` | the CommonJS CLI that does every stateful `.planning/` read/write and returns JSON | `node` (spawned by the shim) |
| **Agents** | `agents/gsd-*.md` | subagent roles spawned by the orchestrator; have their own tool list + `@~/`-includes | the AI runtime, in a separate thread |
| **Artifacts** | `.planning/` (consumer project) | the file-based memory: `STATE.md`, `ROADMAP.md`, `phases/NN-*/…CONTEXT/RESEARCH/PLAN/SUMMARY/VERIFICATION.md` | written by the engine and by agents |

The orchestrator never touches `.planning/` directly — it reads/writes state **only** through
`gsd-tools.cjs` (returns JSON it can parse) and delegates real authoring to agents. This is the
"reflexive" shape the audit must trace by behavior, not by import edges.

---

## 1. The two wiring mechanisms (read these before the trace)

### 1.1 The bash shim — how `gsd_run` becomes an engine call

Every workflow opens with one self-locating shim block. From
`gsd-core/workflows/plan-phase.md:34` (verbatim structure):

```bash
_GSD_SHIM_NAME="gsd-tools.cjs"
_GSD_RUNTIME_ROOT="${RUNTIME_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
GSD_TOOLS="${_GSD_RUNTIME_ROOT}/gsd-core/bin/${_GSD_SHIM_NAME}"
if   [ -f "$GSD_TOOLS" ];                                   then gsd_run() { node "$GSD_TOOLS" "$@"; }
elif [ -f "${_GSD_RUNTIME_ROOT}/.claude/gsd-core/bin/…" ]; then …                       # in-project install
elif command -v gsd-tools >/dev/null 2>&1;                 then gsd_run() { "$(command -v gsd-tools)" "$@"; }  # on PATH
elif [ -f "$HOME/.claude/gsd-core/bin/…" ];                then …                       # global install
else echo "ERROR: gsd-tools.cjs not found …"; exit 1; fi
```

**Resolution order (load-bearing):** (1) `RUNTIME_DIR`/repo-root `gsd-core/bin/`, (2)
in-project `.claude/gsd-core/bin/`, (3) `gsd-tools` on `PATH`, (4) `$HOME/.claude/gsd-core/bin/`.
After this block, every `gsd_run <family> <sub> …` line later in the workflow is exactly
`node gsd-tools.cjs <family> <sub> …`. **This is "Site 0" of the dynamic-indirection
inventory** — the engine's true entry point lives outside `src/`, which is why a `src/`-scoped
dead-code tool calls 45 live modules "unused."

### 1.2 The `@~/`-include — how markdown context is spliced in

Both the command and the agents pull reference/template/workflow markdown by **at-path**, e.g.
`commands/gsd/plan-phase.md:35` →

```
<execution_context>
@~/.claude/gsd-core/workflows/plan-phase.md
@~/.claude/gsd-core/references/ui-brand.md
</execution_context>
```

`@~/.claude/gsd-core/…` resolves against the **installed** payload (the installer copies
`gsd-core/` into each runtime's config home — see §3). The runtime inlines the target file's
contents at read time. **This is "Site 4"** — a workflow/reference/agent `.md` with no inbound
*static* edge is not dead; it is loaded by string path at runtime. The import graph cannot see
any of this wiring.

---

## 2. The traced sequence — `/gsd-plan-phase 9`

### Step A — user invokes the command

User types `/gsd-plan-phase 9` (or `$gsd-plan-phase 9` on Codex). The runtime enumerated
`commands/gsd/plan-phase.md` as an installed skill at session start. Its frontmatter
(`commands/gsd/plan-phase.md:1-18`) declares `allowed-tools` (Read/Write/Bash/Glob/Grep/
**Agent**/AskUserQuestion/WebFetch/`mcp__context7__*`) and `requires: [discuss-phase, phase,
review, update]`. The `<execution_context>` at-include pulls in the workflow. `$ARGUMENTS` = `9`.

> **Graph cross-check:** the command→workflow link is an `@~/`-include (Site 4), not an import;
> depcruise/madge show nothing here. Confirmed: this seam is invisible to the static graph.

### Step B — the workflow runs the shim + initialises

The runtime now executes `gsd-core/workflows/plan-phase.md` as instructions. Step 1
("Initialize", `:29`) runs the §1.1 shim, then the first engine call:

```
gsd_run query init                 →  node gsd-tools.cjs query init …
```

`query` is a **meta-prefix** (`gsd-tools.cjs:344-346`: "Accept `query` as a meta-prefix for
canonical dotted/spaced commands"). The top-level `switch (command)` at `gsd-tools.cjs:524+`
routes the family; `init plan-phase` lands in the engine's `init.cts` aggregator
(`cmdInitPlanPhase`, `src/init.cts:319`), which assembles "everything the workflow needs"
(project root, git state, phase context paths, config flags) and returns one JSON blob the
orchestrator parses for the rest of the run.

The workflow also reads per-agent skill budgets up front (`:38-40`):

```
gsd_run query agent-skills gsd-phase-researcher
gsd_run query agent-skills gsd-planner
gsd_run query agent-skills gsd-plan-checker
```

> **Graph cross-check (depcruise.json):** `init.cts` depends on `commands, core, frontmatter,
> plan-scan, planning-workspace, runtime-homes, runtime-slash, secrets, security,
> shell-command-projection, state-document` — fan-out 11, matching the narration that `init`
> is the top aggregator (Phase 8 cluster **E9**). Graph and narration **agree** here.

### Step C — engine dispatch internals (the Site-0/Site-3 chain)

For any `gsd_run <family> <sub>` after init, the chain is:

1. `gsd-tools.cjs` `require('./lib/<name>.cjs')` pulls the compiled engine (`:173-211` — 45
   requires) — **Site 0**.
2. `switch (command)` (`:524+`) selects the family and calls its router, e.g. `query roadmap`
   → roadmap path, `query state` → `routeStateCommand`, `query config-get/-set` → config.
3. The router is a **string-keyed `handlers` map** (`src/<family>-command-router.cts`); e.g.
   `state-command-router.cts:150-188` maps `'begin-phase'`, `'complete-phase'`, … → `state.cmd*`
   functions — **Site 3**. The no-throw hub (`command-routing-hub.cts`) wraps results as
   `{ ok, kind }` so the workflow gets parseable JSON, never an exception.

> **Graph cross-check:** `cjs-command-router-adapter.cts` depends only on
> `command-routing-hub.cts` in depcruise — the router→engine-function wiring is **string-keyed
> and invisible** to the graph (Site 3). This is why knip's "unused exports" list is dominated
> by `state.cts`/`verify.cts` `cmd*` functions that are, in fact, live on every dispatch.

### Step D — validate phase, load context, handle research

The workflow walks its gates (each issuing `gsd_run` engine calls):
- **Validate phase** (`:197`) — `gsd_run query phase` / `query roadmap` confirm phase 9 exists
  and is not closed (the Closed-Phase Gate, `:58`).
- **Load CONTEXT.md** (`:329`) — reads `phases/09-…/09-CONTEXT.md` (or builds it from a `--prd`/
  `--ingest` express path, `:210`/`:314`, which parse a PRD or ADR into CONTEXT via the engine).
- **Handle research** (`:419`) — decides whether to spawn the researcher. `--view`/`--research`/
  existing-`RESEARCH.md` modifiers (`:423`) gate this. If research is needed:

```
Agent(subagent_type="gsd-phase-researcher", …)      # workflow :525-527
```

The orchestrator then **stops and waits** (the "ORCHESTRATOR RULE — CODEX RUNTIME" at `:533`).
The researcher writes `phases/09-…/RESEARCH.md` and returns the sentinel `## RESEARCH COMPLETE`
(`:537`), which the orchestrator parses to continue. (With `--research-phase N`, the workflow
exits here — research-only mode, `:540`.)

### Step E — pre-plan gates (validation strategy, UI, schema, intel)

Before the planner, the workflow runs several gates, each engine- or helper-backed:
- **Validation strategy / Nyquist** (`:558`, `:779`) — `gsd_run query config-get` for
  `workflow.nyquist_validation`.
- **UI design contract gate** (`:614`) — pipes the phase text through the standalone
  `ui-safety-gate.cjs` helper (resolved via `RUNTIME_DIR`, `:635`) to detect UI work.
- **Schema push detection** (`:687`), **security threat-model gate** (`:588`).
- **API surface regen** (`:863`) — `gsd_run intel api-surface` (engine cluster **E10**) when an
  intel gate is on; optional `gsd-pattern-mapper` agent (`:802`).

### Step F — spawn the planner

Step 8 (`:875`) spawns the worker that actually authors plans:

```
Agent(subagent_type="gsd-planner", prompt=<context + skills budget + CONTEXT/RESEARCH paths>)
```

(Chunked mode, `:1019`, splits this into an outline spawn + per-plan spawns returning
`## OUTLINE COMPLETE` / `## PLAN COMPLETE`.) The planner agent
(`agents/gsd-planner.md`) carries its own `@~/`-includes — `references/mandatory-initial-read.md`
(`:25`), `references/planner-source-audit.md` (`:100`), `references/planner-antipatterns.md`
(`:705`), `references/thinking-models-planning.md` (`:917`), `workflows/execute-plan.md` (`:452`),
`templates/summary.md` (`:453`) — and **writes `phases/09-…/PLAN.md`** (one or more). It returns
`## PLANNING COMPLETE` (`agents/gsd-planner.md:1104`), the sentinel the orchestrator parses at
`workflow:1127-1129`.

> **Graph cross-check:** none of the planner's `@~/`-includes are import edges; they are Site-4
> string-path reads. The planner→engine relationship is *also* indirect — the agent calls
> `gsd_run` via its own shim, not by importing `src/`. Graph shows nothing; behavior shows the
> whole authoring path. **This is the central reflexivity finding** (§5).

### Step G — the verification loop (plan-checker, max 3×)

Step 10 (`:1224`) spawns the reviewer:

```
Agent(subagent_type="gsd-plan-checker", …)          # workflow :1267
```

The checker returns a structured YAML issues block (BLOCKER/WARNING). The **Revision Loop**
(`:1323`, max 3 iterations, governed by `references/revision-loop.md` @-included at the command)
counts issues, re-spawns the planner in revision mode while issues decrease, and bails to an
`AskUserQuestion` if the count stalls (`:1336-1340`). Optional **plan bounce** (`:1398`) sends
plans to an external AI for refinement.

### Step H — coverage gates + record completion + commit

- **Requirements coverage gate** (`:1469`) — collects requirement IDs from plan frontmatter and
  checks them against `REQUIREMENTS.md`; **decision coverage gate** (`:1520`) checks CONTEXT
  decisions are honored.
- **Record planning completion** (`:1586`) — `gsd_run query state` writes planning status into
  `STATE.md`.
- **Annotate ROADMAP** (`:1596`) — wave dependencies / cross-cutting constraints written to
  `ROADMAP.md`.
- **Commit** (`:1610`) — if `commit_docs` is true, `gsd_run query commit` makes an atomic commit
  of the plan files.
- **Post-planning gap analysis** (`:1620`) — `gsd_run gap-analysis` (reads `REQUIREMENTS.md`,
  `CONTEXT.md`, `:1639`) surfaces residual gaps.
- **Present final status** (`:1668`) + **auto-advance check** (`:1672`).

### Step I — the artifacts left on disk

After the run, `.planning/phases/09-…/` holds (some optional): `RESEARCH.md` (if researched),
`PLAN.md` (≥1, authored by the planner), updated `STATE.md` (planning-complete) and `ROADMAP.md`
(wave annotations) at the project root. These are the inputs the **next** command in the chain,
`/gsd-execute-phase`, reads — closing the file-based-memory loop.

### The flow at a glance

```
user: /gsd-plan-phase 9
  │  command md (commands/gsd/plan-phase.md)  ──@~/-include──▶ workflow md
  ▼
workflow md (gsd-core/workflows/plan-phase.md)
  │  shim ──▶ gsd_run query init          ──▶ gsd-tools.cjs (switch→router→engine) ──▶ JSON
  │  shim ──▶ gsd_run query phase/roadmap/config-get … (state reads)
  │  Agent(gsd-phase-researcher) ──writes──▶ RESEARCH.md ; returns "## RESEARCH COMPLETE"
  │  Agent(gsd-planner)          ──writes──▶ PLAN.md(s)  ; returns "## PLANNING COMPLETE"
  │  Agent(gsd-plan-checker)     ──reviews─▶ (revision loop ×≤3)
  │  shim ──▶ gsd_run query state/commit, gap-analysis  ──▶ STATE.md / ROADMAP.md updated
  ▼
artifacts in .planning/  ───────────────────────────▶  consumed by /gsd-execute-phase
```

---

## 3. The install step that makes the `@~/` paths resolve

The whole trace assumes `@~/.claude/gsd-core/…` and `gsd-core/bin/gsd-tools.cjs` exist on the
user's machine. They get there via `bin/install.js` (`npx @opengsd/gsd-core --<runtime>`):

1. **Detect runtime** and resolve its config home (`src/runtime-homes.cts`
   `getGlobalConfigDir()`, a 16-arm `switch (runtime)` — **Site 2**).
2. **Stage the payload** — copy `gsd-core/` (workflows, references, templates, agents) and the
   engine into the runtime's home; resolve the per-runtime artifact layout
   (`src/runtime-artifact-layout.cts` `resolveRuntimeArtifactLayout()`, 15-arm `switch`).
3. **Install commands/agents** as skills (or converted commands) per runtime — converters are
   invoked **by string name** (`installExports[converterName]`), so the slash form is
   `/gsd-<cmd>` (Claude) or `$gsd-<cmd>` (Codex), per `src/runtime-slash.cts`.
4. **Inject hooks** (`hooks/hooks.json`) and **run migrations** (the `readdirSync` loader,
   `src/installer-migrations.cts:268-283` — **Site 1**).

> **Graph cross-check / Phase-8 lead (D-05):** `runtime-artifact-layout.cts:51` does
> `_require('../../../bin/install.js')` — **the engine reaches back out to the 12.7k-LOC
> installer monolith** for converter functions. depcruise shows `runtime-artifact-layout.cts`
> depending only on `install-profiles.cts`; the back-edge to `bin/install.js` is a **lazy,
> test-guarded `require` inside a function and is absent from the graph** (verified:
> `depcruise.json` lists no `install.js` dependency for this module). The installer↔engine
> boundary is **bidirectional in behavior but one-directional (or invisible) in the graph** —
> a maintainability/coupling lead for Phase 12 and a worked example of why the trace must follow
> behavior, not edges.

---

## 4. Contrast trace — `/gsd-quick` (the short path)

`commands/gsd/quick.md` → `gsd-core/workflows/quick.md` is "the same system with a shorter
path": it still runs the shim and `gsd_run` engine calls (28 `gsd_run`/`Agent(` sites in the
workflow), still spawns `gsd-planner` (quick mode) + one or more `gsd-executor`s, still tracks
`STATE.md` and makes atomic commits — but **skips the optional agents** (no dedicated researcher
/ plan-checker / verifier loop by default). The shape (command md → workflow md → shim →
gsd-tools → agents → `.planning/`) is identical; only the gate set is smaller. This confirms the
trace in §2 is the *general* pipeline shape, not a one-command special case.

---

## 5. Where narration and the module graph disagree (reflexivity findings)

The trace's whole point (D-04): the pipeline describes itself in prose; the audit must verify
against the graph. The disagreements are themselves the finding.

| # | Seam (narration says…) | Module graph says… | Verdict |
|---|------------------------|--------------------|---------|
| 1 | command → workflow → references/agents wire the whole flow | madge: **100 orphans** (every `.cts`); 0 edges to any `.md` | **Graph is blind by design.** All command/workflow/agent wiring is `@~/`-include (Site 4) or `Agent()` spawn — never an import. The graph cannot see the orchestration layer at all. |
| 2 | `gsd-tools.cjs` drives 45 engine modules | knip: **45 unused files**; madge: every `.cts` orphaned | **False positives.** The entry point is `gsd-tools.cjs` *outside* `src/` (Site 0). depcruise (which resolves `.cjs` specifiers) shows 176 real edges; madge (which can't) shows 0. Trust depcruise, not madge, for the engine. |
| 3 | routers dispatch subcommands to engine `cmd*` functions | depcruise: `cjs-command-router-adapter` → only `command-routing-hub` | **String-keyed dispatch (Site 3)** is invisible. `state.cts`/`verify.cts` command functions look unused but are live on every call. |
| 4 | engine ↔ installer is bidirectional | depcruise: `runtime-artifact-layout` → only `install-profiles` (no `install.js` edge) | **Back-edge invisible.** `runtime-artifact-layout.cts:51` lazily `require`s `bin/install.js`; the coupling is real but graph-absent. Phase-12 lead. |
| 5 | the SDK is a subsystem (CLAUDE.md / D-02) | `git ls-files sdk/` → **0 files**; `vitest.config.ts` still sets `root: './sdk'` (lines 9, 17); `gsd-tools.cjs` carries dead `// SDK handler: sdk/src/query/…` comments (`:648, :731, :803, :840`) | **Retired, with dangling references.** The SDK is gone; the stale vitest config and the comment breadcrumbs are dead pointers. Phase-10 (dead config) / Phase-12 (waste) leads. |
| 6 | (sanity) the engine has no import cycles | madge: **"No circular dependency found"** | **Agree.** The one clean signal madge gives — confirms the engine's one-way dependency chain (charter "no known circular imports"). |

**Net for the deep sweeps:** for the *engine's internal* shape, trust `depcruise.json` (it
resolves `.cjs` specifiers). For the *orchestration* shape (command/workflow/agent/artifact),
**no static graph is authoritative** — it must be traced by behavior, exactly as §2 does. Any
"dead/unused" finding against an engine module or a `.md` must pass the
`DYNAMIC-INDIRECTION.md` decision flow first (Phase-10 SC-2).

---

## 6. How later phases use this trace

- **Phase 13 (correctness)** reads §2's gate sequence as the map of where a wrong/unreliable
  outcome can be produced (sentinel-parse failures, the revision-loop stall, swallowed router
  errors) — privileging this behavioral trace over the workflow's self-description.
- **Phase 14 (AI-gap)** uses §2 as the pipeline-shape baseline to gap-check against external
  LLM-orchestration best practice.
- **Phase 12 (maintainability)** takes the §3/§5 installer↔engine back-edge and the §5 stale-SDK
  pointers as change-cost / waste leads.
- **The per-subsystem reviewer docs** (`map/subsystems/*.md`) are the boundary-level companion: a
  newcomer reads this trace for the *flow*, then a subsystem doc for the *part they'll work in*.