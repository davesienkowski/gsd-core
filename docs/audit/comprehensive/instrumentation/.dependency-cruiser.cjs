/**
 * PHASE-7 (METHOD-02) AUDIT-SANDBOXED dependency-cruiser config.
 *
 * Module-graph + cycle + orphan analysis over the src/*.cts source of truth.
 * NEVER targets the gitignored compiled gsd-core/bin/lib/*.cjs (ADR-457
 * build-at-publish). NOT wired into the package devDeps/CI (D-01, plan-only).
 *
 * Run from repo root:
 *   npx -y dependency-cruiser --config docs/audit/comprehensive/instrumentation/.dependency-cruiser.cjs --output-type err-long src
 *   npx -y dependency-cruiser --config docs/audit/comprehensive/instrumentation/.dependency-cruiser.cjs --output-type json src > docs/audit/comprehensive/instrumentation/reports/depcruise.json
 *
 * IMPORTANT cross-import note (ADR-457): src/*.cts files import sibling
 * TS-migrated modules using the .cjs specifier (nodenext convention, e.g.
 * `require('./core.cjs')` resolves to src/core.cts). The tsConfig below lets
 * dependency-cruiser follow those specifiers to the .cts source rather than the
 * compiled output. "orphan" findings MUST be cross-checked against
 * DYNAMIC-INDIRECTION.md (readdirSync migrations + string-keyed router/alias
 * dispatch make several modules look orphaned when they are live).
 */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'warn',
      comment: 'Circular dependency — report only (CLAUDE.md claims none known; this verifies).',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-orphans',
      severity: 'info',
      comment: 'Orphan module (no incoming/outgoing edges). CROSS-CHECK against DYNAMIC-INDIRECTION.md: migrations and router handlers are loaded by string path / string key and WILL appear orphaned without being dead.',
      from: {
        orphan: true,
        pathNot: ['\\.d\\.cts$', '\\.test\\.cts$'],
      },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: ['node_modules', 'gsd-core', 'bin'] },
    exclude: { path: ['\\.test\\.cts$', '\\.d\\.cts$', 'node_modules', 'gsd-core', 'bin'] },
    includeOnly: '^src/',
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.build.json' },
    enhancedResolveOptions: {
      extensions: ['.cts', '.cjs', '.ts', '.js', '.json'],
    },
    reporterOptions: {
      dot: { collapsePattern: 'node_modules/(?:@[^/]+/[^/]+|[^/]+)' },
    },
  },
};
