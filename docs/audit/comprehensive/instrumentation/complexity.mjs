#!/usr/bin/env node
/**
 * PHASE-7 (METHOD-02) AUDIT-SANDBOXED cyclomatic-complexity scorer.
 *
 * Computes per-file decision-point complexity and physical LOC over the
 * src/*.cts source of truth, using the TypeScript compiler API (already present
 * in the repo's toolchain — no new dependency). NEVER targets the gitignored
 * compiled gsd-core/bin/lib/*.cjs. NOT wired into the package devDeps/CI (D-01).
 *
 * Cyclomatic complexity here = 1 + number of decision points, where a decision
 * point is: if / for / forIn / forOf / while / doWhile / case / catch /
 * conditional (?:) / && / || / ?? . This is the standard McCabe approximation
 * used by ESLint's `complexity` rule and most OSS complexity tools.
 *
 * Run from repo root:
 *   node docs/audit/comprehensive/instrumentation/complexity.mjs
 *
 * Output: console table (top files by complexity) + reports/complexity.json.
 * NB: high complexity is NOT a defect by itself — runtime-artifact-layout's
 * 15-arm switch and installer-migrations' lifecycle are inherently branchy
 * BY DESIGN (see DYNAMIC-INDIRECTION.md / RUNTIME-DIVERGENCE-MATRIX.md). Use
 * this to DIRECT attention in Phase 8 hotspots, not to assert debt.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const SRC = path.join(ROOT, 'src');
const REPORT_DIR = path.join(__dirname, 'reports');

function walkCts(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { out.push(...walkCts(full)); continue; }
    if (!e.isFile()) continue;
    if (!e.name.endsWith('.cts')) continue;
    if (e.name.endsWith('.d.cts') || e.name.endsWith('.test.cts')) continue;
    out.push(full);
  }
  return out;
}

const DECISION_KINDS = new Set([
  ts.SyntaxKind.IfStatement,
  ts.SyntaxKind.ForStatement,
  ts.SyntaxKind.ForInStatement,
  ts.SyntaxKind.ForOfStatement,
  ts.SyntaxKind.WhileStatement,
  ts.SyntaxKind.DoStatement,
  ts.SyntaxKind.CaseClause,
  ts.SyntaxKind.CatchClause,
  ts.SyntaxKind.ConditionalExpression,
]);

function fileComplexity(filePath) {
  const text = fs.readFileSync(filePath, 'utf-8');
  const sf = ts.createSourceFile(filePath, text, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
  let decisions = 0;
  let functions = 0;
  let maxFn = 0;
  let curFn = null;
  function visit(node) {
    const isFn =
      ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node) || ts.isMethodDeclaration(node);
    const prevFn = curFn;
    if (isFn) { functions++; curFn = { c: 1 }; }
    if (DECISION_KINDS.has(node.kind)) {
      decisions++;
      if (curFn) curFn.c++;
    }
    if (node.kind === ts.SyntaxKind.BinaryExpression) {
      const op = node.operatorToken.kind;
      if (op === ts.SyntaxKind.AmpersandAmpersandToken ||
          op === ts.SyntaxKind.BarBarToken ||
          op === ts.SyntaxKind.QuestionQuestionToken) {
        decisions++;
        if (curFn) curFn.c++;
      }
    }
    ts.forEachChild(node, visit);
    if (isFn) { maxFn = Math.max(maxFn, curFn.c); curFn = prevFn; }
  }
  visit(sf);
  const loc = text.split('\n').filter((l) => l.trim() !== '').length;
  return {
    file: path.relative(ROOT, filePath),
    loc,
    functions,
    fileComplexity: 1 + decisions,
    maxFunctionComplexity: maxFn,
  };
}

const files = walkCts(SRC).map(fileComplexity).sort((a, b) => b.fileComplexity - a.fileComplexity);

console.log('GSD-Core cyclomatic-complexity report (Phase 7, src/*.cts)');
console.log(`Files: ${files.length}  |  Total LOC: ${files.reduce((s, f) => s + f.loc, 0).toLocaleString()}`);
console.log('\n cplx  maxFn   loc  funcs  file');
console.log('-----  -----  ----  -----  ' + '-'.repeat(50));
for (const f of files.slice(0, 25)) {
  console.log(
    String(f.fileComplexity).padStart(5) + '  ' +
    String(f.maxFunctionComplexity).padStart(5) + '  ' +
    String(f.loc).padStart(4) + '  ' +
    String(f.functions).padStart(5) + '  ' +
    f.file
  );
}
if (files.length > 25) console.log(`       … ${files.length - 25} more (see complexity.json)`);

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(path.join(REPORT_DIR, 'complexity.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  metric: 'McCabe decision-point cyclomatic complexity (1 + decisions)',
  files,
}, null, 2));
console.log('\nJSON report → docs/audit/comprehensive/instrumentation/reports/complexity.json');
