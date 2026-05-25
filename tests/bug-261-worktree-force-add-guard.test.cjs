'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const HOOK_PATH = path.join(__dirname, '..', 'hooks', 'gsd-workflow-guard.js');

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function makeRepo(branch) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsd-bug-261-'));
  git(dir, ['init', '-q']);
  git(dir, ['config', 'user.email', 'test@example.com']);
  git(dir, ['config', 'user.name', 'Test User']);
  git(dir, ['config', 'commit.gpgsign', 'false']);
  fs.writeFileSync(path.join(dir, 'README.md'), '# test\n');
  git(dir, ['add', 'README.md']);
  git(dir, ['commit', '-q', '-m', 'chore: init']);
  git(dir, ['checkout', '-q', '-b', branch]);
  return dir;
}

function runHook(cwd, command) {
  return spawnSync(process.execPath, [HOOK_PATH], {
    cwd,
    encoding: 'utf8',
    input: JSON.stringify({
      cwd,
      tool_name: 'Bash',
      tool_input: { command },
    }),
  });
}

describe('bug #261: workflow guard blocks forced git add on worktree-agent branches', () => {
  test('blocks git add -f on worktree-agent branch before it can stage gitignored files', () => {
    const dir = makeRepo('worktree-agent-a1');
    try {
      const result = runHook(dir, 'git add -f .planning/phases/01/01-01-SUMMARY.md');
      assert.strictEqual(result.status, 2);
      const envelope = JSON.parse(result.stdout);
      assert.strictEqual(envelope.decision, 'block');
      assert.strictEqual(envelope.code, 'WORKTREE_AGENT_FORCE_ADD_FORBIDDEN');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test('blocks git add --force with git global options on worktree-agent branch', () => {
    const dir = makeRepo('worktree-agent-b2');
    try {
      const result = runHook(path.dirname(dir), `git -C "${dir}" add --force .planning/SUMMARY.md`);
      assert.strictEqual(result.status, 2);
      assert.strictEqual(JSON.parse(result.stdout).code, 'WORKTREE_AGENT_FORCE_ADD_FORBIDDEN');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test('allows ordinary git add on worktree-agent branch', () => {
    const dir = makeRepo('worktree-agent-c3');
    try {
      const result = runHook(dir, 'git add .planning/SUMMARY.md');
      assert.strictEqual(result.status, 0);
      assert.strictEqual(result.stdout, '');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test('allows git add -f outside worktree-agent branches', () => {
    const dir = makeRepo('feature-docs');
    try {
      const result = runHook(dir, 'git add -f .planning/SUMMARY.md');
      assert.strictEqual(result.status, 0);
      assert.strictEqual(result.stdout, '');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
