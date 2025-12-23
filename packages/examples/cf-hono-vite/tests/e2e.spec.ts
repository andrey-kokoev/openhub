import { test, expect } from '@playwright/test';
import { spawn, exec } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);
const packagePath = path.resolve(__dirname, '..');

test.describe('cf-hono-vite example', () => {
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

  test('pnpm run dev works and has no errors', async ({ page }) => {
    const devServer = spawn('pnpm', ['run', 'dev'], { cwd: packagePath, detached: true });
    let output = '';
    devServer.stdout.on('data', (data) => {
      output += data.toString();
    });
    await new Promise(resolve => setTimeout(resolve, 10000)); // wait for server to start

    try {
      await page.goto('http://localhost:5173');
      const pageText = await page.locator('body').innerText();
      expect(pageText).not.toContain('error');
    } finally {
      if (devServer.pid) {
        process.kill(-devServer.pid);
      }
    }
  });

  test('remote url has no errors', async ({ page }) => {
    await page.goto('https://openhub-examples-test-fixture.andrei-kokoev.workers.dev');
    const pageText = await page.locator('body').innerText();
    expect(pageText).not.toContain('error');
  });

  test('pnpm run dev:remote works and has no errors', async ({ page }) => {
    const devServer = spawn('pnpm', ['run', 'dev:remote'], { cwd: packagePath, detached: true });
    let output = '';
    devServer.stdout.on('data', (data) => {
      output += data.toString();
    });
    devServer.stderr.on('data', (data) => {
      output += data.toString();
    });

    await new Promise(resolve => setTimeout(resolve, 20000)); // wait for server to start, remote can be slower

    try {
      await page.goto('http://localhost:5173');
      const pageText = await page.locator('body').innerText();
      expect(pageText).not.toContain('error');
    } finally {
      if (devServer.pid) {
        process.kill(-devServer.pid);
      }
    }
  });
});
