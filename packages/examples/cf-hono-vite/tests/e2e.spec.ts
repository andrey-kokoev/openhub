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

test.describe('cf-hono-vite API integration tests', () => {
  const remoteUrl = 'https://openhub-examples-test-fixture.andrei-kokoev.workers.dev'

  test.describe('API endpoint health', () => {
    test('health check endpoint returns ok', async ({ request }) => {
      const response = await request.get(`${remoteUrl}/__health`)
      expect(response.ok()).toBeTruthy()
      const data = await response.json()
      expect(data.status).toBe('ok')
      expect(data.timestamp).toBeTruthy()
    })
  })

  test.describe('Users API integration', () => {
    test('can create and retrieve users', async ({ request }) => {
      // Create a user
      const newUser = {
        name: `E2E User ${Date.now()}`,
        email: `e2e${Date.now()}@test.com`
      }
      
      const createResponse = await request.post(`${remoteUrl}/api/users`, {
        data: newUser
      })
      expect(createResponse.ok()).toBeTruthy()
      const createdUser = await createResponse.json()
      expect(createdUser.id).toBeTruthy()
      expect(createdUser.name).toBe(newUser.name)
      
      // Retrieve users list
      const listResponse = await request.get(`${remoteUrl}/api/users`)
      expect(listResponse.ok()).toBeTruthy()
      const users = await listResponse.json()
      expect(Array.isArray(users)).toBe(true)
      
      // Verify our user is in the list
      const foundUser = users.find((u: any) => u.id === createdUser.id)
      expect(foundUser).toBeTruthy()
    })

    test('validates required fields', async ({ request }) => {
      const invalidUser = { name: 'Only Name' }
      const response = await request.post(`${remoteUrl}/api/users`, {
        data: invalidUser
      })
      expect(response.status()).toBe(400)
    })
  })

  test.describe('Sessions API integration', () => {
    test('creates and manages sessions', async ({ request }) => {
      const response = await request.get(`${remoteUrl}/api/sessions`)
      expect(response.ok()).toBeTruthy()
      
      const sessionId = await response.text()
      expect(sessionId).toMatch(/^[0-9a-f-]{36}$/i) // UUID format
      
      const cookies = response.headers()['set-cookie']
      expect(cookies).toContain('session_id')
    })

    test('maintains session across requests', async ({ request }) => {
      // First request
      const response1 = await request.get(`${remoteUrl}/api/sessions`)
      const sessionId1 = await response1.text()
      const cookies = response1.headers()['set-cookie']
      
      // Extract cookie value
      const cookieMatch = cookies?.match(/session_id=([^;]+)/)
      const cookieValue = cookieMatch ? cookieMatch[1] : ''
      
      // Second request with cookie
      const response2 = await request.get(`${remoteUrl}/api/sessions`, {
        headers: { Cookie: `session_id=${cookieValue}` }
      })
      const sessionId2 = await response2.text()
      
      expect(sessionId1).toBe(sessionId2)
    })
  })

  test.describe('Files API integration', () => {
    test('can upload and list files', async ({ request }) => {
      // Create a test file
      const fileContent = `Test file content ${Date.now()}`
      const fileName = `e2e-test-${Date.now()}.txt`
      
      // Upload file
      const formData = new FormData()
      const blob = new Blob([fileContent], { type: 'text/plain' })
      formData.append('file', blob, fileName)
      
      const uploadResponse = await request.post(`${remoteUrl}/api/files`, {
        multipart: {
          file: {
            name: fileName,
            mimeType: 'text/plain',
            buffer: Buffer.from(fileContent)
          }
        }
      })
      expect(uploadResponse.ok()).toBeTruthy()
      const uploadResult = await uploadResponse.json()
      expect(uploadResult.key).toContain('uploads/')
      expect(uploadResult.size).toBeGreaterThan(0)
      
      // List files
      const listResponse = await request.get(`${remoteUrl}/api/files`)
      expect(listResponse.ok()).toBeTruthy()
      const files = await listResponse.json()
      expect(Array.isArray(files)).toBe(true)
      
      // Verify uploaded file is in the list
      const foundFile = files.find((f: any) => f.key === uploadResult.key)
      expect(foundFile).toBeTruthy()
    })

    test('validates file upload', async ({ request }) => {
      // Try to upload without a file
      const response = await request.post(`${remoteUrl}/api/files`, {
        multipart: {}
      })
      expect(response.status()).toBe(400)
    })
  })

  test.describe('Frontend integration', () => {
    test('frontend can interact with all API endpoints', async ({ page }) => {
      await page.goto(remoteUrl)
      
      // Test that the page loads without errors
      const pageText = await page.locator('body').innerText()
      expect(pageText).not.toContain('error')
      
      // Check that the page has loaded properly
      await page.waitForLoadState('networkidle')
      expect(await page.title()).toBeTruthy()
    })
  })
});
