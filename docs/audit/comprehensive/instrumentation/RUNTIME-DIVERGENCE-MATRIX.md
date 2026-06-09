> 📋 **[Audit Summary →](https://github.com/davesienkowski/gsd-core/blob/audit/comprehensive-audit/docs/audit/AUDIT-SUMMARY.md)** — one-page browsable index of every audit finding & suggested fix (M1 newcomer quick-wins + M2 comprehensive). Start here.

# Runtime Divergence Matrix — the blast-radius oracle

**Requirement:** METHOD-02 (Deliverable 3) · **Decision:** D-05
**Derived:** 2026-06-08 verbatim from `src/runtime-artifact-layout.cts`,
`src/runtime-homes.cts`, `src/runtime-slash.cts`.

## What this is

GSD-Core ships one payload across **16 runtimes**, each with its own config-dir
convention, artifact layout (commands / agents / skills), and slash-command form.
Every later **surface / layout / naming** finding must be tagged with **which runtimes
it touches** — a change that's safe for Claude can silently break Hermes (nested skills)
or Codex (`$gsd-*` shell-var form). This matrix is that blast-radius oracle.

## Runtime roster

- **Layout switch** (`runtime-artifact-layout.cts:285-385`): **15** runtimes have an
  artifact-layout arm.
- **Homes switch** (`runtime-homes.cts:76-156`): **16** runtimes have a config-dir arm
  — the 15 above **plus `grok`**.
- **grok is layout-less by design:** it has a home (`~/.agents` via `GROK_AGENTS_HOME`)
  but **no** artifact-layout arm. Resolving a layout for grok throws a `TypeError` — a
  deliberate loud-fail signal that a runtime was added to homes without a layout
  (`runtime-artifact-layout.cts:6-9`). **Blast-radius note:** grok install is therefore
  only partially wired; treat grok findings as "homes-only."

## The matrix

Legend — **kind**: `commands` = pass-through `.md` slash commands; `convCmds` =
flat per-file converted commands; `skills` = `skills/<name>/SKILL.md`. **prefix** is
the filename prefix. **slash**: how a `/gsd-*` reference is emitted to the user.

| Runtime | Global config dir (env override → default) | Artifact kinds (dest · prefix) | Slash form | Notes |
|---------|--------------------------------------------|--------------------------------|-----------|-------|
| **claude** | `CLAUDE_CONFIG_DIR` → `~/.claude` | global: skills (`skills` · `gsd-`); local: commands (`commands/gsd` · `gsd-`) + agents (`agents` · `gsd-`) | `/gsd-<cmd>` | scope-dependent layout (local vs global differ) |
| **cursor** | `CURSOR_CONFIG_DIR` → `~/.cursor` | skills (`skills` · `gsd-`) **+** convCmds (`commands` · `gsd-`) | `/gsd-<cmd>` | two surfaces (1.6+): rich skills + plain `/` commands |
| **gemini** | `GEMINI_CONFIG_DIR` → `~/.gemini` | commands (`commands/gsd` · `gsd-`) | `/gsd-<cmd>` | commands-only |
| **codex** | `CODEX_HOME` → `~/.codex` | skills (`skills` · `gsd-`) | **`$gsd-<cmd>`** | shell-var slash form; command token lowercased (`runtime-slash.cts:58-63`) |
| **grok** | `GROK_AGENTS_HOME` → `~/.agents` | **none** (no layout arm) | `/gsd-<cmd>` | homes-only; layout throws TypeError by design |
| **copilot** | `COPILOT_CONFIG_DIR` ∥ `COPILOT_HOME` → `~/.copilot` | skills (`skills` · `gsd-`) | `/gsd-<cmd>` | two env overrides checked in order |
| **antigravity** | `ANTIGRAVITY_CONFIG_DIR` → `~/.gemini/antigravity{,-ide,-cli}` (first existing) | skills (`skills` · `gsd-`) | `/gsd-<cmd>` | multi-candidate dir resolution (1.x/2.x), `runtime-homes.cts:41-59` |
| **windsurf** | `WINDSURF_CONFIG_DIR` → `~/.codeium/windsurf` | skills (`skills` · `gsd-`) | `/gsd-<cmd>` | nested under `.codeium` |
| **augment** | `AUGMENT_CONFIG_DIR` → `~/.augment` | commands (`commands` · `gsd-`) **+** skills (`skills` · `gsd-`) | `/gsd-<cmd>` | two surfaces |
| **trae** | `TRAE_CONFIG_DIR` → `~/.trae` | skills (`skills` · `gsd-`) | `/gsd-<cmd>` | |
| **qwen** | `QWEN_CONFIG_DIR` → `~/.qwen` | skills (`skills` · `gsd-`) | `/gsd-<cmd>` | uses the Claude skill converter |
| **hermes** | `HERMES_HOME` → `~/.hermes` | skills (**`skills/gsd`** · **`''`** no prefix) | `/gsd-<cmd>` | **nested** `skills/gsd/<name>/` layout + empty prefix — divergent |
| **codebuddy** | `CODEBUDDY_CONFIG_DIR` → `~/.codebuddy` | convCmds (`commands` · `gsd-`) **+** skills (`skills` · `gsd-`, emitted `user-invocable:false`) | `/gsd-<cmd>` | commands are sole `/` entry; skills hidden from `/` |
| **cline** | `CLINE_CONFIG_DIR` → `~/.cline` | global: skills (`skills` · `gsd-`); **local: none** | `/gsd-<cmd>` | skills only when global (≥ v3.48.0); also emits `.clinerules` |
| **opencode** | `OPENCODE_CONFIG_DIR` ∥ `OPENCODE_CONFIG` ∥ `XDG_CONFIG_HOME/opencode` → `~/.config/opencode` | commands (**`command`** · `gsd-`) **+** skills (`skills` · `gsd-`) | `/gsd-<cmd>` | **XDG**-based; dest dir is singular `command/` |
| **kilo** | `KILO_CONFIG_DIR` ∥ `KILO_CONFIG` ∥ `XDG_CONFIG_HOME/kilo` → `~/.config/kilo` | commands (**`command`** · `gsd-`) **+** skills (`skills` · `gsd-`) | `/gsd-<cmd>` | **XDG** for commands; **skills live at `~/.kilo/skills/` (HOME-relative, NOT the XDG config dir)** — `runtime-homes.cts:175` |

## Skills-base divergences (`getGlobalSkillsBase`, `runtime-homes.cts:165-178`)

Most runtimes: `<configDir>/skills`. Exceptions that any skills-surface finding must
account for:

- **hermes** → `<configDir>/skills/gsd` (nested category, not flat).
- **kilo** → `~/.kilo/skills` (HOME-relative, independent of the XDG `~/.config/kilo`
  used for its commands). A finding about "the kilo config dir" can be wrong about where
  its skills actually land.

## Slash-form divergence (`runtime-slash.cts`)

- The **canonical** emitted form is **`/gsd-<cmd>`** (hyphen) for all runtimes except…
- **codex** → **`$gsd-<cmd>`** (shell-var), command token lowercased, argument tail
  preserved verbatim (`runtime-slash.cts:52-63`).
- The legacy colon form `/gsd:<cmd>` is **never** emitted (the helper strips and
  normalizes any colon/`$`/hyphen input). A finding that proposes emitting colon-form
  is a regression for every runtime.

## How to tag a finding's blast radius

For any surface / layout / naming finding, record the affected set using these classes:

- **all-16** — touches the shared payload (`commands/gsd/*.md`, `agents/*.md`,
  `gsd-core/workflows|references/*.md`) or `gsd-tools.cjs` engine behaviour.
- **skills-surface (12)** — claude(global)/cursor/codex/copilot/antigravity/windsurf/
  augment/trae/qwen/hermes/codebuddy/cline/opencode/kilo emit skills; a skills change
  hits these, with **hermes** (nested) and **kilo** (HOME-relative) as special cases.
- **commands-surface** — claude(local)/gemini/cursor/augment/codebuddy/opencode/kilo.
- **single-runtime** — name the runtime + its switch arm `file:line`.
- **codex-only** — anything touching slash-form emission (`$gsd-*`).
- **homes-only / grok** — config-dir resolution without a layout (grok).