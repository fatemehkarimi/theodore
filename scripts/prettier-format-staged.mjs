import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  return result;
}

function gitList(args) {
  const result = run('git', args);

  if (result.status !== 0) {
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }
    process.exit(result.status ?? 1);
  }

  return result.stdout.split('\0').filter(Boolean);
}

const stagedFiles = gitList([
  'diff',
  '--cached',
  '--name-only',
  '--diff-filter=ACMR',
  '-z',
]).filter((file) => existsSync(file));

if (stagedFiles.length === 0) {
  process.exit(0);
}

const unstagedFiles = new Set(
  gitList([
    'diff',
    '--name-only',
    '--diff-filter=ACMR',
    '-z',
    '--',
    ...stagedFiles,
  ]),
);
const partiallyStagedFiles = stagedFiles.filter((file) =>
  unstagedFiles.has(file),
);

if (partiallyStagedFiles.length > 0) {
  console.error(
    [
      'pre-commit: some staged files also have unstaged changes.',
      'Stage or stash these files before committing so formatting does not include unstaged edits:',
      ...partiallyStagedFiles.map((file) => `  - ${file}`),
    ].join('\n'),
  );
  process.exit(1);
}

const formatResult = run('pnpm', ['prettier:format', '--', ...stagedFiles], {
  stdio: 'inherit',
});

if (formatResult.status !== 0) {
  process.exit(formatResult.status ?? 1);
}

const addResult = run('git', ['add', '--', ...stagedFiles], {
  stdio: 'inherit',
});

process.exit(addResult.status ?? 1);
