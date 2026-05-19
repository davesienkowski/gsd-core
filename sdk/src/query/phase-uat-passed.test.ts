/**
 * Unit tests for isPhaseUatPassed — walking skeleton (cycle 1 of ~15).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { isPhaseUatPassed, REASON_CODE } from './phase-uat-passed.js';

const UAT_PASS_CONTENT = `---
status: complete
phase: 5
source: roadmap
started: 2026-05-18T00:00:00Z
updated: 2026-05-18T00:00:00Z
---

### 1. First item
expected: thing should happen
result: pass
`;

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'gsd-uat-passed-'));
  const phaseDir = join(tmpDir, '.planning', 'phases', '05-walking-skeleton');
  await mkdir(phaseDir, { recursive: true });
  await writeFile(join(phaseDir, '05-HUMAN-UAT.md'), UAT_PASS_CONTENT);
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe('isPhaseUatPassed', () => {
  it('returns passed=true when a single UAT file contains one pass result', async () => {
    const result = await isPhaseUatPassed(tmpDir, '5');
    expect(result.passed).toBe(true);
    expect(result.items.length).toBe(1);
    expect(result.items[0].result).toBe('pass');
    expect(result.reasons.length).toBe(0);
  });

  it('returns passed=false with NON_PASS_RESULT reason when single UAT item has result: issue', async () => {
    const nonPassContent = `---
status: complete
phase: 5
source: roadmap
started: 2026-05-18T00:00:00Z
updated: 2026-05-18T00:00:00Z
---

### 1. Some item
expected: thing happens
result: issue
`;
    const localTmp = await mkdtemp(join(tmpdir(), 'gsd-uat-c2-'));
    try {
      const phaseDir = join(localTmp, '.planning', 'phases', '05-non-pass');
      await mkdir(phaseDir, { recursive: true });
      await writeFile(join(phaseDir, '05-HUMAN-UAT.md'), nonPassContent);

      const result = await isPhaseUatPassed(localTmp, '5');
      expect(result.passed).toBe(false);
      expect(result.items.length).toBe(1);
      expect(result.reasons.length).toBe(1);
      expect(result.reasons[0].code).toBe(REASON_CODE.NON_PASS_RESULT);
      expect(result.reasons[0].capturedValue).toBe('issue');
      expect(result.reasons[0].itemName).toBe('Some item');
    } finally {
      await rm(localTmp, { recursive: true, force: true });
    }
  });
});
