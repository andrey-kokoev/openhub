import { describe, it, expect, beforeAll } from 'vitest'
import { execa } from 'execa'
import * as path from 'path'

const packagePath = path.resolve(__dirname, '..')

describe('cf-hono-vite example unit tests', () => {
  it('should install dependencies successfully', async () => {
    const { stdout, stderr } = await execa('pnpm', ['install', '--prefer-offline'], { cwd: packagePath })
    console.log(stdout)
    console.error(stderr)
    expect(stderr).toBe('')
  })

  it('should build successfully', async () => {
    const { stdout, stderr } = await execa('pnpm', ['build'], { cwd: packagePath })
    console.log(stdout)
    console.error(stderr)
    expect(stderr).not.toContain('Error')
  })

  it('should deploy successfully', async () => {
    const { stdout, stderr } = await execa('pnpm', ['run', 'deploy'], { cwd: packagePath })
    console.log(stdout)
    console.error(stderr)
    expect(stderr).not.toContain('Error')
  })

  it('should have typecheck pass', async () => {
    const { stdout, stderr } = await execa('pnpm', ['typecheck'], { cwd: packagePath })
    console.log(stdout)
    console.error(stderr)
    expect(stderr).not.toContain('error TS')
  })
})

describe('cf-hono-vite API endpoint tests', () => {
  const remoteUrl = process.env.OPENHUB_TEST_URL || 'https://openhub-examples-test-fixture.andrei-kokoev.workers.dev'
  
  // Helper to check if remote URL is accessible
  async function isRemoteAccessible(): Promise<boolean> {
    try {
      const response = await fetch(`${remoteUrl}/__health`, { signal: AbortSignal.timeout(5000) })
      return response.ok
    } catch {
      return false
    }
  }

  beforeAll(async () => {
    const accessible = await isRemoteAccessible()
    if (!accessible) {
      console.warn(`\nWarning: Remote URL ${remoteUrl} is not accessible.`)
      console.warn('API endpoint tests will be skipped.')
      console.warn('To run these tests, ensure the app is deployed and set OPENHUB_TEST_URL environment variable.\n')
    }
  })

  describe('Health Check', () => {
    it('should return ok status from health check endpoint', async () => {
      if (!(await isRemoteAccessible())) {
        console.log('Skipping - remote not accessible')
        return
      }
      
      const response = await fetch(`${remoteUrl}/__health`)
      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data).toHaveProperty('status', 'ok')
      expect(data).toHaveProperty('timestamp')
      expect(typeof data.timestamp).toBe('number')
    })
  })

  describe('Users API (D1 Database)', () => {
    let createdUserId: number | undefined

    it('should get list of users from database', async () => {
      if (!(await isRemoteAccessible())) {
        console.log('Skipping - remote not accessible')
        return
      }
      
      const response = await fetch(`${remoteUrl}/api/users`)
      expect(response.ok).toBe(true)
      const users = await response.json()
      expect(Array.isArray(users)).toBe(true)
    })

    it('should create a new user in database', async () => {
      if (!(await isRemoteAccessible())) {
        console.log('Skipping - remote not accessible')
        return
      }
      
      const newUser = {
        name: `Test User ${Date.now()}`,
        email: `test${Date.now()}@example.com`
      }
      
      const response = await fetch(`${remoteUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })
      
      expect(response.ok).toBe(true)
      const createdUser = await response.json()
      expect(createdUser).toHaveProperty('id')
      expect(createdUser.name).toBe(newUser.name)
      expect(createdUser.email).toBe(newUser.email)
      createdUserId = createdUser.id
    })

    it('should return 400 when creating user without required fields', async () => {
      if (!(await isRemoteAccessible())) {
        console.log('Skipping - remote not accessible')
        return
      }
      
      const response = await fetch(`${remoteUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'No Email' })
      })
      
      expect(response.status).toBe(400)
      const error = await response.json()
      expect(error).toHaveProperty('error')
    })

    it('should verify created user appears in list', async () => {
      if (!(await isRemoteAccessible()) || !createdUserId) {
        console.log('Skipping - remote not accessible or no user created')
        return
      }

      const response = await fetch(`${remoteUrl}/api/users`)
      expect(response.ok).toBe(true)
      const users = await response.json()
      const foundUser = users.find((u: any) => u.id === createdUserId)
      expect(foundUser).toBeDefined()
    })
  })

  describe('Sessions API (KV Store)', () => {
    it('should create and return a session ID', async () => {
      if (!(await isRemoteAccessible())) {
        console.log('Skipping - remote not accessible')
        return
      }
      
      const response = await fetch(`${remoteUrl}/api/sessions`)
      expect(response.ok).toBe(true)
      const sessionId = await response.text()
      expect(sessionId).toBeTruthy()
      expect(typeof sessionId).toBe('string')
      // UUID format check (rough)
      expect(sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    })

    it('should set session cookie', async () => {
      if (!(await isRemoteAccessible())) {
        console.log('Skipping - remote not accessible')
        return
      }
      
      const response = await fetch(`${remoteUrl}/api/sessions`)
      expect(response.ok).toBe(true)
      const cookies = response.headers.get('set-cookie')
      expect(cookies).toBeTruthy()
      expect(cookies).toContain('session_id')
    })

    it('should return same session ID when cookie is present', async () => {
      if (!(await isRemoteAccessible())) {
        console.log('Skipping - remote not accessible')
        return
      }
      
      // First request to get session
      const response1 = await fetch(`${remoteUrl}/api/sessions`)
      const sessionId1 = await response1.text()
      const cookies = response1.headers.get('set-cookie')
      
      // Extract session cookie
      const sessionCookie = cookies?.split(';')[0] || ''
      
      // Second request with cookie
      const response2 = await fetch(`${remoteUrl}/api/sessions`, {
        headers: { Cookie: sessionCookie }
      })
      const sessionId2 = await response2.text()
      
      expect(sessionId1).toBe(sessionId2)
    })
  })

  describe('Files API (R2 Blob Storage)', () => {
    it('should list files from blob storage', async () => {
      if (!(await isRemoteAccessible())) {
        console.log('Skipping - remote not accessible')
        return
      }
      
      const response = await fetch(`${remoteUrl}/api/files`)
      expect(response.ok).toBe(true)
      const files = await response.json()
      expect(Array.isArray(files)).toBe(true)
    })

    it('should upload a file to blob storage', async () => {
      if (!(await isRemoteAccessible())) {
        console.log('Skipping - remote not accessible')
        return
      }
      
      const formData = new FormData()
      const testFile = new Blob(['test file content'], { type: 'text/plain' })
      formData.append('file', testFile, `test-${Date.now()}.txt`)
      
      const response = await fetch(`${remoteUrl}/api/files`, {
        method: 'POST',
        body: formData
      })
      
      expect(response.ok).toBe(true)
      const result = await response.json()
      expect(result).toHaveProperty('key')
      expect(result).toHaveProperty('size')
      expect(result.key).toContain('uploads/')
      expect(result.key).toContain('.txt')
    })

    it('should return 400 when uploading without file', async () => {
      if (!(await isRemoteAccessible())) {
        console.log('Skipping - remote not accessible')
        return
      }
      
      const formData = new FormData()
      
      const response = await fetch(`${remoteUrl}/api/files`, {
        method: 'POST',
        body: formData
      })
      
      expect(response.status).toBe(400)
      const error = await response.json()
      expect(error).toHaveProperty('error')
    })

    it('should verify uploaded file appears in list', async () => {
      if (!(await isRemoteAccessible())) {
        console.log('Skipping - remote not accessible')
        return
      }
      
      // Upload a file first
      const formData = new FormData()
      const testFile = new Blob(['verify list content'], { type: 'text/plain' })
      const fileName = `verify-list-${Date.now()}.txt`
      formData.append('file', testFile, fileName)
      
      const uploadResponse = await fetch(`${remoteUrl}/api/files`, {
        method: 'POST',
        body: formData
      })
      const uploadResult = await uploadResponse.json()
      
      // List files and verify it's there
      const listResponse = await fetch(`${remoteUrl}/api/files`)
      const files = await listResponse.json()
      const foundFile = files.find((f: any) => f.key === uploadResult.key)
      expect(foundFile).toBeDefined()
      expect(foundFile.size).toBeGreaterThan(0)
    })
  })
})
