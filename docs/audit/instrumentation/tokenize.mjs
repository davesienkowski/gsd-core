#!/usr/bin/env node
/**
 * AUDIT-SANDBOXED prompt-corpus token counter.
 *
 * Walks the GSD prompt corpus and prints a token-count-per-file table sorted
 * descending, separating the "recurring-context tax" (files eagerly included in
 * the system prompt on EVERY invocation) from on-demand files (loaded only when a
 * specific workflow/agent runs).
 *
 * Targets the prompt corpus + src/*.cts ONLY — never the gitignored compiled
 * gsd-core/bin/lib/*.cjs (ADR-457 build-at-publish).
 *
 * Tokenizer: uses `gpt-tokenizer` (cl100k/o200k BPE) if installed; otherwise
 * degrades to a clearly-labeled char/4 heuristic and prints a note. This script
 * is NOT wired into the package devDeps/CI.
 *
 * Usage (from repo root):
 *   node docs/audit/instrumentation/tokenize.mjs
 *
 * To get exact BPE counts (optional, do not commit to package):
 *   npm i -D gpt-tokenizer        # then re-run
 *
 * Notes:
 *  - "recurring tax" classification is a heuristic frame for the fast-track; the
 *    deep Phase 12 sweep refines exactly which files each runtime eager-loads.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// repo root = docs/audit/instrumentation -> ../../..
const ROOT = path.resolve(__dirname, '..', '..', '..');

// ── Corpus definition ────────────────────────────────────────────────────────
// RECURRING-CONTEXT TAX: surfaces an AI runtime enumerates into its system prompt
// for every session (command/skill wrappers + the agent roster). These cost
// tokens on every invocation, so trimming them has multiplied impact.
const RECURRING_GLOBS = [
  'commands/gsd',   // /gsd-* skill wrappers — enumerated in the system prompt
  'agents',         // agent roster — descriptions surfaced to the orchestrator
];

// ON-DEMAND: loaded only when a specific workflow/agent actually runs.
const ONDEMAND_GLOBS = [
  'gsd-core/workflows',
  'gsd-core/references',
];

function walkMd(absDir) {
  const out = [];
  if (!fs.existsSync(absDir)) return out;
  const stack = [absDir];
  while (stack.length) {
    const cur = stack.pop();
    let entries;
    try { entries = fs.readdirSync(cur, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      const full = path.join(cur, e.name);
      if (e.isDirectory()) { stack.push(full); continue; }
      if (e.isFile() && e.name.endsWith('.md')) out.push(full);
    }
  }
  return out;
}

// ── Tokenizer (gpt-tokenizer if present, else char/4 heuristic) ──────────────
let encode = null;
let tokenizerLabel = '';
try {
  const mod = await import('gpt-tokenizer');
  encode = mod.encode || (mod.default && mod.default.encode);
  tokenizerLabel = 'gpt-tokenizer (BPE, exact)';
} catch {
  encode = null;
}

function countTokens(text) {
  if (encode) return encode(text).length;
  // Heuristic fallback: ~4 chars/token is the widely-used English approximation.
  return Math.ceil(text.length / 4);
}

if (!encode) {
  tokenizerLabel = 'HEURISTIC char/4 (APPROXIMATE — install gpt-tokenizer for exact counts)';
}

// ── Collect ──────────────────────────────────────────────────────────────────
function collect(globs) {
  const files = [];
  for (const g of globs) {
    for (const f of walkMd(path.join(ROOT, g))) {
      let text;
      try { text = fs.readFileSync(f, 'utf-8'); } catch { continue; }
      files.push({ rel: path.relative(ROOT, f), tokens: countTokens(text), bytes: Buffer.byteLength(text) });
    }
  }
  files.sort((a, b) => b.tokens - a.tokens);
  return files;
}

const recurring = collect(RECURRING_GLOBS);
const ondemand = collect(ONDEMAND_GLOBS);

function sum(files) { return files.reduce((s, f) => s + f.tokens, 0); }

function printTable(title, files) {
  const total = sum(files);
  console.log(`\n=== ${title} (${files.length} files, ${total.toLocaleString()} tokens) ===`);
  console.log('tokens'.padStart(9) + '  ' + 'file');
  console.log('-'.repeat(9) + '  ' + '-'.repeat(60));
  for (const f of files) {
    console.log(String(f.tokens).padStart(9) + '  ' + f.rel);
  }
  return total;
}

// ── Report ─────────────────────────────────────────────────────────────────
console.log('GSD-Core prompt-corpus token report');
console.log('Tokenizer: ' + tokenizerLabel);
if (!encode) {
  console.log('NOTE: gpt-tokenizer not installed. Counts are an approximation.');
  console.log('      For exact BPE counts run:  npm i -D gpt-tokenizer   (do NOT commit to the package)');
}

const recurTotal = printTable('RECURRING-CONTEXT TAX (every invocation)', recurring);
const ondemandTotal = printTable('ON-DEMAND (loaded per workflow/agent)', ondemand);

console.log('\n=== SUMMARY ===');
console.log('Recurring-context tax total : ' + recurTotal.toLocaleString() + ' tokens  (paid every invocation)');
console.log('On-demand total             : ' + ondemandTotal.toLocaleString() + ' tokens  (paid per workflow run)');
console.log('Corpus grand total          : ' + (recurTotal + ondemandTotal).toLocaleString() + ' tokens');
console.log('\nThe recurring tax is the highest-leverage cut target: it multiplies across every session.');
