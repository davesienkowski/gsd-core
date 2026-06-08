#!/usr/bin/env node
/**
 * AUDIT-SANDBOXED early usage-signal extractor.
 *
 * Read-only walk of the ~/.claude/projects jsonl transcript tree (the same tree
 * src/profile-pipeline.cts scans) that tallies:
 *   1. /gsd-* slash-command invocations (<command-name> tags the user typed)
 *   2. Skill tool invocations (tool_use records with input.skill)
 *
 * Nothing is modified or sent anywhere — it only reads local transcripts and
 * prints ranked counts to stdout. NOT wired into the package.
 *
 * SINGLE-AUTHOR CAVEAT: this is one developer's local signal, not a population
 * claim. See usage-signal.md.
 *
 * Usage:
 *   node docs/audit/instrumentation/usage-extract.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const root = path.join(os.homedir(), '.claude', 'projects');
const cmdCounts = new Map();
const skillCounts = new Map();
let files = 0;
let sessions = 0;
let userMsgs = 0;

const bump = (m, k) => m.set(k, (m.get(k) || 0) + 1);

if (!fs.existsSync(root)) {
  console.error(`No Claude Code transcripts found at ${root}. Is Claude Code installed?`);
  process.exit(1);
}

const projectDirs = fs.readdirSync(root).filter((d) => {
  try { return fs.statSync(path.join(root, d)).isDirectory(); } catch { return false; }
});

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
      if (rec.type === 'user' && typeof content_ === 'string' && rec.userType === 'external' && !rec.isMeta) {
        userMsgs++;
      }

      // 1. Slash commands via <command-name> tags
      let text = typeof content_ === 'string' ? content_ : '';
      if (Array.isArray(content_)) {
        for (const c of content_) if (typeof c?.text === 'string') text += '\n' + c.text;
      }
      const tags = text.match(/<command-name>([^<]+)<\/command-name>/g);
      if (tags) {
        for (const t of tags) {
          const m = t.match(/gsd[-:]([a-z0-9-]+)/i);
          if (m) bump(cmdCounts, 'gsd-' + m[1].toLowerCase());
        }
      }

      // 2. Skill tool invocations
      if (Array.isArray(content_)) {
        for (const c of content_) {
          if (c?.type === 'tool_use' && c?.name === 'Skill' && c?.input?.skill) {
            bump(skillCounts, String(c.input.skill));
          }
        }
      }
    }
  }
}

const rank = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]);

console.log('SINGLE-AUTHOR SIGNAL — one developer\'s local transcripts, NOT a population claim.');
console.log(`coverage: ${projectDirs.length} project dirs, ${sessions} sessions, ${userMsgs} user messages\n`);
console.log('=== /gsd-* slash commands (user-typed) ===');
for (const [k, v] of rank(cmdCounts)) console.log(String(v).padStart(4), '/' + k);
console.log('\n=== Skill tool invocations (dispatched) ===');
for (const [k, v] of rank(skillCounts)) console.log(String(v).padStart(4), k);
