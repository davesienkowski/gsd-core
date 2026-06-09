# E6 — Runtime layout / homes / slash / install-profiles (the 16-runtime surface)

> **Engine cluster** (`src/*.cts`) · reviewer doc (DOC-01) · derived 2026-06-08 from live code.
> **Source of truth:** `src/*.cts` — never the compiled `gsd-core/bin/lib/*.cjs`.

## Purpose

The cluster that makes GSD **multi-runtime**: maps each of 16 runtimes (claude, cursor, gemini,
codex, copilot, antigravity, windsurf, augment, trae, qwen, hermes, codebuddy, cline, opencode,
kilo, grok) to its config-dir, its artifact layout (skills vs commands vs converted-commands),
its slash form (`/gsd-` vs `$gsd-`), and its skill-surface budget. **Highest-churn cluster** and
the one where **every finding carries a runtime blast-radius tag**.

## Key files (8 modules)

| File | Role | Notes |
|------|------|-------|
| `src/runtime-artifact-layout.cts` | `resolveRuntimeArtifactLayout()` — a 15-arm `switch (runtime)` (`:285-385`); locates install source roots by filesystem walk (`:105-165`) | **Reaches back to `bin/install.js:51`** for converters — the bidirectional edge |
| `src/runtime-homes.cts` | `getGlobalConfigDir()` — a 16-arm `switch (runtime)` (`:76-156`); grok is homes-only | |
| `src/runtime-slash.cts` | emit `/gsd-<cmd>` vs `$gsd-<cmd>` per runtime | Fan-in **10** |
| `src/runtime-name-policy.cts` | validate/normalise runtime names | |
| `src/runtime-config-adapter-registry.cts` | string-keyed per-runtime adapter registry | false orphan (consumed by installer) |
| `src/install-profiles.cts` | core/standard/full skill-surface budgets, staged install | **Hotspot #21** |
| `src/surface.cts` | the surfaced-skill set builder | **Hotspot #15** |
| `src/clusters.cts` | skill cluster groupings for `/gsd-surface` | |

## How it connects

- **Selected by string (Site 2):** the `runtime` value arrives as a **string** from config / env
  / install flags; the per-arm helpers (`skillsKind`, `convertedCommandsKind`) and converter
  functions (`installExports['convertClaudeCommandToCodexSkill']`) are chosen at runtime by name.
- **Used by the installer** (`bin/install.js`) to stage the payload per runtime, and by
  `runtime-slash` everywhere a command name is rendered.
- **`ALLOWED_RUNTIMES`** (`runtime-artifact-layout.cts:171-175`) gates the switch; an unknown
  runtime fires a loud `TypeError` (the layout switch intentionally omits grok so it fails loudly).

## What a newcomer must know

- **Site 2 false positives:** any helper named in a `case` arm, or any `convert*To*Skill/Command`
  referenced via a `converterName` string, is **live** — never call it dead. See
  `RUNTIME-DIVERGENCE-MATRIX.md`.
- **Always tag blast radius.** A change here is multi-runtime by default; the matrix distinguishes
  special cases (hermes nests `skills/gsd/`; kilo uses HOME-relative skills). Never tag `none`
  without checking the matrix.
- This is the **highest-churn** cluster — adding a runtime touches the 15-arm and 16-arm switches
  plus the slash/homes/layout/profile logic; it is the most error-prone "add one thing" task in
  the engine.
