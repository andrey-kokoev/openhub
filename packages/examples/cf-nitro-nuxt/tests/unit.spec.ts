
import { describe, test, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

const packagePath = path.resolve(__dirname, '..');

describe('cf-nitro-nuxt example unit tests', () => {
  test('pnpm install works', async () => {
    const { stdout, stderr } = await execAsync('pnpm install --prefer-offline', { cwd: packagePath });
    console.log(stdout);
    console.error(stderr);
    expect(stderr).toBe('');
  });

  test('pnpm build works', async () => {
    const { stdout, stderr } = await execAsync('pnpm build', { cwd: packagePath });
    console.log(stdout);
    console.error(stderr);
    expect(stderr).not.toContain('Error');
  });

  test('pnpm deploy works', async () => {
    const { stdout, stderr } = await execAsync('pnpm run deploy', { cwd: packagePath });
    console.log(stdout);
    console.error(stderr);
    expect(stderr).not.toContain('Error');
  });
});
