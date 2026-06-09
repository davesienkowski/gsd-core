#!/usr/bin/env node
/**
 * PHASE-7 (METHOD-02) AUDIT-SANDBOXED prompt-corpus + source token counter.
 *
 * Deep extension of the M1 docs/audit/instrumentation/tokenize.mjs. Adds:
 *   - o200k_base encoder (the encoding GSD's Claude/GPT-class runtimes use) when
 *     gpt-tokenizer is available, falling back to char/4 with a loud label.
 *   - a JSON report dump (reports/token-report.json) so Phase 12 can cite exact
 *     per-file figures.
 *   - the src/*.cts source tree as a third bucket (engine source token cost).
 *
 * Targets the prompt corpus + src/*.cts ONLY — never the gitignored compiled
 * gsd-core/bin/lib/*.cjs (ADR-457 build-at-publish). NOT wired into the package
 * devDeps/CI (D-01).
 *
 * Usage (from repo root):
 *   node docs/audit/comprehensive/instrumentation/tokenize.mjs
 *
 * For exact BPE counts (do NOT add to the package), install gpt-tokenizer into a
 * throwaway dir and point NODE_PATH at it:
 *   T=$(mktemp -d); (cd "$T" && npm init -y && npm i gpt-tokenizer)
 *   NODE_PATH="$T/node_modules" node docs/audit/comprehensive/instrumentation/tokenize.mjs
 *
 * Caveat carried from M1: the "recurring tax" bucket counts the FULL body of each
 * command/agent file. Runtimes typically surface only the frontmatter description
 * eagerly and load the body on demand, so the recurring figure is a conservative
 * UPPER BOUND. Phase 12 must refine which bytes each runtime eager-loads.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// repo root = docs/audit/comprehensive/instrumentation -> ../../../..
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const REPORT_DIR = path.join(__dirname, 'reports');

const RECURRING_GLOBS = ['commands/gsd', 'agents'];
const ONDEMAND_GLOBS = ['gsd-core/workflows', 'gsd-core/references'];
const SOURCE_GLOBS = ['src']; // engine source of truth (.cts)

function walk(absDir, exts) {
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
      if (!e.isFile()) continue;
      if (exts.some((x) => e.name.endsWith(x))) {
        // skip declaration + test sources in the source bucket
        if (e.name.endsWith('.d.cts') || e.name.endsWith('.test.cts')) continue;
        out.push(full);
      }
    }
  }
  return out;
}

let encode = null;
let tokenizerLabel = '';
try {
  // o200k_base is the encoding used by current Claude/GPT-class context windows.
  // createRequire honours NODE_PATH for a throwaway gpt-tokenizer install.
  const mod = require('gpt-tokenizer/encoding/o200k_base');
  encode = mod.encode || (mod.default && mod.default.encode);
  tokenizerLabel = 'gpt-tokenizer o200k_base (BPE, exact)';
} catch {
  try {
    const mod = require('gpt-tokenizer');
    encode = mod.encode || (mod.default && mod.default.encode);
    tokenizerLabel = 'gpt-tokenizer cl100k_base (BPE, exact)';
  } catch {
    encode = null;
  }
}
function countTokens(text) {
  if (encode) return encode(text).length;
  return Math.ceil(text.length / 4);
}
if (!encode) tokenizerLabel = 'HEURISTIC char/4 (APPROXIMATE — set NODE_PATH to a gpt-tokenizer install for exact counts)';

function collect(globs, exts) {
  const files = [];
  for (const g of globs) {
    for (const f of walk(path.join(ROOT, g), exts)) {
      let text;
      try { text = fs.readFileSync(f, 'utf-8'); } catch { continue; }
      files.push({ rel: path.relative(ROOT, f), tokens: countTokens(text), bytes: Buffer.byteLength(text) });
    }
  }
  files.sort((a, b) => b.tokens - a.tokens);
  return files;
}

const recurring = collect(RECURRING_GLOBS, ['.md']);
const ondemand = collect(ONDEMAND_GLOBS, ['.md']);
const source = collect(SOURCE_GLOBS, ['.cts']);

const sum = (files) => files.reduce((s, f) => s + f.tokens, 0);

function printTable(title, files, topN = Infinity) {
  const total = sum(files);
  console.log(`\n=== ${title} (${files.length} files, ${total.toLocaleString()} tokens) ===`);
  console.log('tokens'.padStart(9) + '  ' + 'file');
  console.log('-'.repeat(9) + '  ' + '-'.repeat(60));
  files.slice(0, topN).forEach((f) => console.log(String(f.tokens).padStart(9) + '  ' + f.rel));
  if (files.length > topN) console.log(`${' '.repeat(11)}… ${files.length - topN} more (see token-report.json)`);
  return total;
}

console.log('GSD-Core token report (Phase 7 comprehensive instrumentation)');
console.log('Tokenizer: ' + tokenizerLabel);

const recurTotal = printTable('RECURRING-CONTEXT TAX (every invocation, UPPER BOUND)', recurring, 15);
const ondemandTotal = printTable('ON-DEMAND (loaded per workflow/agent)', ondemand, 15);
const sourceTotal = printTable('ENGINE SOURCE src/*.cts (build-time, not a prompt cost)', source, 15);

console.log('\n=== SUMMARY ===');
console.log('Recurring-context tax (UPPER BOUND): ' + recurTotal.toLocaleString() + ' tokens/invocation');
console.log('On-demand corpus                   : ' + ondemandTotal.toLocaleString() + ' tokens (per workflow run)');
console.log('Engine source (.cts)               : ' + sourceTotal.toLocaleString() + ' tokens (not a prompt cost)');
console.log('Prompt corpus grand total          : ' + (recurTotal + ondemandTotal).toLocaleString() + ' tokens');

if (fs.existsSync(REPORT_DIR) || (() => { try { fs.mkdirSync(REPORT_DIR, { recursive: true }); return true; } catch { return false; } })()) {
  const report = {
    generatedAt: new Date().toISOString(),
    tokenizer: tokenizerLabel,
    totals: {
      recurringUpperBound: recurTotal,
      ondemand: ondemandTotal,
      engineSource: sourceTotal,
      promptCorpusGrandTotal: recurTotal + ondemandTotal,
    },
    recurring, ondemand, source,
  };
  fs.writeFileSync(path.join(REPORT_DIR, 'token-report.json'), JSON.stringify(report, null, 2));
  console.log('\nJSON report → docs/audit/comprehensive/instrumentation/reports/token-report.json');
}
