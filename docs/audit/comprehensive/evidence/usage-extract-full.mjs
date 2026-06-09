#!/usr/bin/env node
/**
 * AUDIT-SANDBOXED full usage-signal extractor (Phase 11 — extends M1).
 *
 * Read-only walk of the ~/.claude/projects jsonl transcript tree (the same tree
 * src/profile-pipeline.cts scans and the M1 usage-extract.mjs walked) that tallies
 * THREE levels of usage:
 *
 *   1. /gsd-* slash-command invocations         — <command-name> tags the user typed
 *   2. Skill tool invocations                   — tool_use records with input.skill
 *   3. PER-FLAG frequency (the new M2 depth):
 *        a. slash-command flags                 — flags inside <command-args>
 *        b. gsd-tools CLI subcommands + flags   — Bash tool_use commands that call
 *                                                  the gsd-tools engine (gsd_run / node "$GSD_TOOLS")
 *
 * Nothing is modified or sent anywhere — it only reads local transcripts and prints
 * ranked counts to stdout (JSON with --json). NOT wired into the package.
 *
 * SINGLE-AUTHOR CAVEAT: this is one developer's local signal, not a population claim.
 * See usage-full.md.
 *
 * Corrected-counting note (carried from M1): each slash command / skill / flag
 * occurrence is counted exactly ONCE per record (M1 fixed a command double-count bug
 * caused by both the command-message and command-name tags matching the same record).
 * Here the <command-name> tag is the single source for slash-command counts; the
 * <command-message> tag is ignored for counting.
 *
 * Usage:
 *   node docs/audit/comprehensive/evidence/usage-extract-full.mjs           # human tables
 *   node docs/audit/comprehensive/evidence/usage-extract-full.mjs --json    # machine JSON
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const JSON_OUT = process.argv.includes('--json');

const root = path.join(os.homedir(), '.claude', 'projects');

const cmdCounts = new Map();      // /gsd-* slash commands (user-typed)
const skillCounts = new Map();    // Skill tool dispatches
const slashFlagCounts = new Map();// flags inside <command-args> of /gsd-* commands
const toolSubCounts = new Map();  // gsd-tools engine subcommands (from Bash tool_use)
const toolFlagCounts = new Map(); // flags on gsd-tools engine invocations

let files = 0;
let sessions = 0;
let userMsgs = 0;
let toolInvocations = 0; // count of gsd-tools engine command-lines parsed

const bump = (m, k, n = 1) => m.set(k, (m.get(k) || 0) + n);

// Canonical gsd-tools subcommand allowlist (from `gsd-tools --help` of the engine the
// transcripts called) PLUS `query` — the namespaced dispatch verb (`gsd_run query <ns.op>`)
// that the dev-build engine exposes. Validating against this set removes shell noise
// (elif/echo/for/does/etc.) that the launcher regexes would otherwise pick up.
const TOOL_SUBCOMMANDS = new Set([
  'agent', 'agent-skills', 'audit-open', 'audit-uat', 'check', 'check-commit', 'commit',
  'commit-to-subrepo', 'config-ensure-section', 'config-get', 'config-new-project',
  'config-path', 'config-set', 'migrate-config', 'current-timestamp', 'detect-custom-files',
  'docs-init', 'effort', 'extract-messages', 'find-phase', 'from-gsd2', 'frontmatter',
  'gap-analysis', 'generate-claude-md', 'generate-claude-profile', 'generate-dev-preferences',
  'generate-slug', 'graphify', 'history-digest', 'init', 'intel', 'learnings', 'list-todos',
  'milestone', 'phase', 'phase-plan-index', 'phases', 'profile-questionnaire', 'profile-sample',
  'progress', 'prompt-budget', 'requirements', 'resolve-granularity', 'resolve-model',
  'roadmap', 'scaffold', 'state', 'task', 'template', 'validate', 'verify', 'verify-path-exists',
  'verify-summary', 'workstream', 'worktree', 'query',
]);

if (!fs.existsSync(root)) {
  console.error(`No Claude Code transcripts found at ${root}. Is Claude Code installed?`);
  process.exit(1);
}

const projectDirs = fs.readdirSync(root).filter((d) => {
  try { return fs.statSync(path.join(root, d)).isDirectory(); } catch { return false; }
});

// Pull flag tokens (--flag, -f) out of a fragment of CLI/argument text.
function extractFlags(text) {
  const out = [];
  // long flags --foo-bar and short flags -p (avoid matching "--" alone or numbers)
  const re = /(?:^|\s)(--[a-z][a-z0-9-]*|-[a-z])(?=$|[\s=])/gi;
  let m;
  while ((m = re.exec(text))) out.push(m[1].toLowerCase());
  return out;
}

// Parse gsd-tools engine invocations out of a Bash command string.
// Real invocation forms observed in transcripts:
//   gsd_run <subcommand> [flags...]
//   node "$GSD_TOOLS" <subcommand> [flags...]
//   "$GSD_TOOLS" <subcommand> [flags...]
//   node .../gsd-tools.cjs <subcommand> [flags...]
function parseGsdToolsCalls(cmd) {
  const calls = [];
  const launchers = [
    /\bgsd_run\s+/g,
    /node\s+"?\$GSD_TOOLS"?\s+/g,
    /"?\$GSD_TOOLS"?\s+(?=[a-z])/g,
    /node\s+[^\s]*gsd-tools(?:\.cjs)?"?\s+/g,
  ];
  for (const launcher of launchers) {
    let m;
    while ((m = launcher.exec(cmd))) {
      // tail = everything until end-of-line / shell separator
      const tail = cmd.slice(m.index + m[0].length).split(/[\n;|&]|>>|>/)[0];
      // first token = subcommand (must look like a gsd-tools subcommand: lowercase word, may contain - . :)
      const sub = tail.match(/^["']?([a-z][a-z0-9.:-]+)/);
      if (!sub) continue;
      let subcommand = sub[1];
      // ignore obvious non-subcommand tails (variable assignments etc.)
      if (subcommand.includes('=')) continue;
      // validate against the canonical gsd-tools subcommand set — drops shell noise
      if (!TOOL_SUBCOMMANDS.has(subcommand)) continue;
      // `query` is a dispatch verb: the real operation is the next dotted token
      if (subcommand === 'query') {
        const rest = tail.slice(sub[0].length).trim();
        const op = rest.match(/^([a-z][a-z0-9.-]+)/);
        subcommand = op ? `query ${op[1]}` : 'query';
      }
      calls.push({ subcommand, flags: extractFlags(tail) });
    }
  }
  return calls;
}

for (const d of projectDirs) {
  const pdir = path.join(root, d);
  let jsonl;
  try { jsonl = fs.readdirSync(pdir).filter((f) => f.endsWith('.jsonl')); } catch { continue; }
  for (const f of jsonl) {
    files++;
    let content;
    try { content = fs.readFileSync(path.join(pdir, f), 'utf-8'); } catch { continue; }
    sessions++;
    for (const line of content.split('\n')) {
      if (!line.trim()) continue;
      let rec;
      try { rec = JSON.parse(line); } catch { continue; }

      const content_ = rec.message?.content;

      // genuine user messages (denominator)
      if (rec.type === 'user' && typeof content_ === 'string' && rec.userType === 'external' && !rec.isMeta) {
        userMsgs++;
      }

      // assemble the textual content (string or content-array text parts)
      let text = typeof content_ === 'string' ? content_ : '';
      if (Array.isArray(content_)) {
        for (const c of content_) if (typeof c?.text === 'string') text += '\n' + c.text;
      }

      // 1. Slash commands via <command-name> tags (single source — no double count)
      const nameTags = text.match(/<command-name>([^<]+)<\/command-name>/g);
      if (nameTags) {
        for (const t of nameTags) {
          const m = t.match(/gsd[-:]([a-z0-9-]+)/i);
          if (m) bump(cmdCounts, 'gsd-' + m[1].toLowerCase());
        }
      }

      // 3a. slash-command flags inside <command-args>
      const argBlocks = text.match(/<command-name>\/?gsd[-:][a-z0-9-]+<\/command-name>[\s\S]*?<command-args>([\s\S]*?)<\/command-args>/g);
      if (argBlocks) {
        for (const block of argBlocks) {
          const am = block.match(/<command-args>([\s\S]*?)<\/command-args>/);
          if (am) for (const fl of extractFlags(am[1])) bump(slashFlagCounts, fl);
        }
      }

      // 2 + 3b. content-array tool_use records
      if (Array.isArray(content_)) {
        for (const c of content_) {
          if (c?.type !== 'tool_use') continue;
          // Skill dispatches
          if (c?.name === 'Skill' && c?.input?.skill) {
            bump(skillCounts, String(c.input.skill));
          }
          // gsd-tools engine subcommands + flags via Bash
          if (c?.name === 'Bash' && typeof c?.input?.command === 'string' && /gsd-tools|gsd_run|\$GSD_TOOLS/.test(c.input.command)) {
            const calls = parseGsdToolsCalls(c.input.command);
            for (const call of calls) {
              toolInvocations++;
              bump(toolSubCounts, call.subcommand);
              for (const fl of call.flags) bump(toolFlagCounts, fl);
            }
          }
        }
      }
    }
  }
}

const rank = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]);
const total = (m) => [...m.values()].reduce((s, v) => s + v, 0);

if (JSON_OUT) {
  console.log(JSON.stringify({
    coverage: { project_dirs: projectDirs.length, files, sessions, user_messages: userMsgs, gsd_tools_invocations: toolInvocations },
    slash_commands: Object.fromEntries(rank(cmdCounts)),
    skills: Object.fromEntries(rank(skillCounts)),
    slash_flags: Object.fromEntries(rank(slashFlagCounts)),
    tool_subcommands: Object.fromEntries(rank(toolSubCounts)),
    tool_flags: Object.fromEntries(rank(toolFlagCounts)),
  }, null, 2));
} else {
  console.log("SINGLE-AUTHOR SIGNAL — one developer's local transcripts, NOT a population claim.");
  console.log(`coverage: ${projectDirs.length} project dirs, ${sessions} sessions, ${userMsgs} user messages, ${toolInvocations} gsd-tools engine calls\n`);
  console.log('=== /gsd-* slash commands (user-typed) [total ' + total(cmdCounts) + '] ===');
  for (const [k, v] of rank(cmdCounts)) console.log(String(v).padStart(4), '/' + k);
  console.log('\n=== Skill tool invocations (dispatched) [total ' + total(skillCounts) + '] ===');
  for (const [k, v] of rank(skillCounts)) console.log(String(v).padStart(4), k);
  console.log('\n=== slash-command flags (in <command-args>) [total ' + total(slashFlagCounts) + '] ===');
  for (const [k, v] of rank(slashFlagCounts)) console.log(String(v).padStart(4), k);
  console.log('\n=== gsd-tools engine subcommands (Bash) [total ' + total(toolSubCounts) + '] ===');
  for (const [k, v] of rank(toolSubCounts)) console.log(String(v).padStart(4), k);
  console.log('\n=== gsd-tools engine flags (Bash) [total ' + total(toolFlagCounts) + '] ===');
  for (const [k, v] of rank(toolFlagCounts)) console.log(String(v).padStart(4), k);
}
