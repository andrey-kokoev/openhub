import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

const getProxyHandlerMock = vi.fn()

vi.mock('../../src/context/runtime', () => ({
  default: {
    getProxyHandler: (...args: any[]) => getProxyHandlerMock(...args),
  },
}))

// Import after mocks are declared
import proxyEndpoint from '../../src/endpoint/proxy'

describe('/__openhub2/proxy endpoint', () => {
  const originalSecret = process.env.OPENHUB_REMOTE_SECRET
  let app: Hono

  beforeEach(() => {
    getProxyHandlerMock.mockReset()
    delete process.env.OPENHUB_REMOTE_SECRET
    app = new Hono()
    app.use('/__openhub2/proxy', proxyEndpoint)
  })

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.OPENHUB_REMOTE_SECRET
    } else {
      process.env.OPENHUB_REMOTE_SECRET = originalSecret
    }
  })

  it('should reject when secret is missing', async () => {
    process.env.OPENHUB_REMOTE_SECRET = undefined
    const req = new Request('http://localhost/__openhub2/proxy', {
      headers: { 'x-openhub-secret': 'anything' },
    })
    const res = await app.request(req)
    expect(res.status).toBe(401)
  })

  it('should reject when secret does not match expectedSecret', async () => {
    process.env.OPENHUB_REMOTE_SECRET = 'expected'
    const req = new Request('http://localhost/__openhub2/proxy', {
      headers: { 'x-openhub-secret': 'wrong' },
    })
    const res = await app.request(req)
    expect(res.status).toBe(401)
  })

  it('should return 501 when proxy handler is not configured', async () => {
    process.env.OPENHUB_REMOTE_SECRET = 'expected'
    getProxyHandlerMock.mockReturnValue(undefined)
    const req = new Request('http://localhost/__openhub2/proxy', {
      method: 'POST',
      headers: { 'x-openhub-secret': 'expected', 'content-type': 'application/json' },
      body: JSON.stringify({ binding: 'kv', method: 'get', args: ['x'] }),
    })
    const res = await app.request(req)
    expect(res.status).toBe(501)
  })

  it('should forward request body to handler', async () => {
    process.env.OPENHUB_REMOTE_SECRET = 'expected'
    const body = { binding: 'kv', method: 'get', args: ['x'] }
    const handler = {
      handle: vi.fn(async () => ({ success: true, data: { ok: true } })),
    }
    getProxyHandlerMock.mockReturnValue(handler)
    const req = new Request('http://localhost/__openhub2/proxy', {
      method: 'POST',
      headers: { 'x-openhub-secret': 'expected', 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })

    const res = await app.request(req)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true, data: { ok: true } })
    expect(handler.handle).toHaveBeenCalledWith(body)
  })

  it('should rethrow handler errors with statusCode', async () => {
    process.env.OPENHUB_REMOTE_SECRET = 'expected'
    const error = new HTTPException(400, { message: 'Bad Request' })
    const handler = { handle: vi.fn(async () => { throw error }) }
    getProxyHandlerMock.mockReturnValue(handler)
    const req = new Request('http://localhost/__openhub2/proxy', {
      method: 'POST',
      headers: { 'x-openhub-secret': 'expected', 'content-type': 'application/json' },
      body: JSON.stringify({ binding: 'kv', method: 'get', args: ['x'] }),
    })

    const res = await app.request(req)
    expect(res.status).toBe(400)
  })

  it('should wrap unknown errors as 500', async () => {
    process.env.OPENHUB_REMOTE_SECRET = 'expected'
    const handler = { handle: vi.fn(async () => { throw new Error('boom') }) }
    getProxyHandlerMock.mockReturnValue(handler)
    const req = new Request('http://localhost/__openhub2/proxy', {
      method: 'POST',
      headers: { 'x-openhub-secret': 'expected', 'content-type': 'application/json' },
      body: JSON.stringify({ binding: 'kv', method: 'get', args: ['x'] }),
    })

    const res = await app.request(req)
    expect(res.status).toBe(500)
  })
})
