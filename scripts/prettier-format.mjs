import { spawnSync } from 'node:child_process';

const targets = process.argv.slice(2);

if (targets.length === 0) {
  targets.push('.');
}

const result = spawnSync(
  'pnpm',
  ['exec', 'prettier', '--write', '--ignore-unknown', ...targets],
  {
    stdio: 'inherit',
  },
);

process.exit(result.status ?? 1);
