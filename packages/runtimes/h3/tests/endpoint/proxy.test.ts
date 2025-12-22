import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createEvent, readBody, getHeader } from 'h3'
import { createRuntime } from '../../src/runtime'

const getProxyHandlerMock = vi.fn()

vi.mock('../../src/context/runtime', () => ({
  default: {
    getProxyHandler: (...args: any[]) => getProxyHandlerMock(...args),
  },
}))

// Mock h3 functions properly
vi.mock('h3', async (importOriginal) => {
  const actual = await importOriginal<typeof import('h3')>()
  return {
    ...actual,
    readBody: vi.fn(),
    getHeader: vi.fn(),
    createError: vi.fn((options) => {
      const error: any = new Error(options.statusMessage)
      error.statusCode = options.statusCode
      return error
    })
  }
})

// Import after mocks are declared
import proxyEndpoint from '../../src/endpoint/proxy'

describe('/__openhub2/proxy endpoint', () => {
  const originalSecret = process.env.OPENHUB_REMOTE_SECRET

  beforeEach(() => {
    getProxyHandlerMock.mockReset()
    delete process.env.OPENHUB_REMOTE_SECRET
    vi.clearAllMocks()
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

    const mockReq = {
      method: 'POST',
      url: '/__openhub2/proxy',
    } as any

    const event = createEvent({ req: mockReq, res: {} as any })

    // Mock getHeader to return the provided secret
    vi.mocked(getHeader).mockImplementation((_event, name) => {
      return name === 'x-openhub-secret' ? 'anything' : null
    })

    // Mock readBody to return some dummy data so it doesn't fail during the call
    vi.mocked(readBody).mockResolvedValue({ binding: 'kv', method: 'get', args: ['x'] })

    await expect(proxyEndpoint(event)).rejects.toThrow()
  })

  it('should reject when secret does not match expectedSecret', async () => {
    process.env.OPENHUB_REMOTE_SECRET = 'expected'

    const mockReq = {
      method: 'POST',
      url: '/__openhub2/proxy',
    } as any

    const event = createEvent({ req: mockReq, res: {} as any })

    // Mock getHeader to return wrong secret
    vi.mocked(getHeader).mockImplementation((_event, name) => {
      return name === 'x-openhub-secret' ? 'wrong' : null
    })

    // Mock readBody to return some dummy data so it doesn't fail during the call
    vi.mocked(readBody).mockResolvedValue({ binding: 'kv', method: 'get', args: ['x'] })

    await expect(proxyEndpoint(event)).rejects.toThrow()
  })

  it('should return 501 when proxy handler is not configured', async () => {
    process.env.OPENHUB_REMOTE_SECRET = 'expected'
    getProxyHandlerMock.mockReturnValue(undefined)

    const mockReq = {
      method: 'POST',
      url: '/__openhub2/proxy',
    } as any

    const event = createEvent({ req: mockReq, res: {} as any })

    // Mock getHeader to return the correct secret
    vi.mocked(getHeader).mockImplementation((_event, name) => {
      return name === 'x-openhub-secret' ? 'expected' : null
    })

    const mockBody = { binding: 'kv', method: 'get', args: ['x'] }
    vi.mocked(readBody).mockResolvedValue(mockBody)

    await expect(proxyEndpoint(event)).rejects.toThrow()
  })

  it('should forward request body to handler', async () => {
    process.env.OPENHUB_REMOTE_SECRET = 'expected'
    const body = { binding: 'kv', method: 'get', args: ['x'] }
    const result = { success: true, data: { ok: true } }
    const handler = {
      handle: vi.fn(async () => result),
    }
    getProxyHandlerMock.mockReturnValue(handler)

    const mockReq = {
      method: 'POST',
      url: '/__openhub2/proxy',
    } as any

    const event = createEvent({ req: mockReq, res: {} as any })

    // Mock getHeader to return the correct secret
    vi.mocked(getHeader).mockImplementation((_event, name) => {
      return name === 'x-openhub-secret' ? 'expected' : null
    })

    vi.mocked(readBody).mockResolvedValue(body)

    const response = await proxyEndpoint(event)

    expect(handler.handle).toHaveBeenCalledWith(body)
    expect(response).toEqual(result)
  })

  it('should rethrow handler errors with statusCode', async () => {
    process.env.OPENHUB_REMOTE_SECRET = 'expected'
    const error = new Error('Bad Request')
    Object.assign(error, { statusCode: 400 })
    const handler = {
      handle: vi.fn(async () => { throw error })
    }
    getProxyHandlerMock.mockReturnValue(handler)

    const mockReq = {
      method: 'POST',
      url: '/__openhub2/proxy',
    } as any

    const event = createEvent({ req: mockReq, res: {} as any })

    // Mock getHeader to return the correct secret
    vi.mocked(getHeader).mockImplementation((_event, name) => {
      return name === 'x-openhub-secret' ? 'expected' : null
    })

    const mockBody = { binding: 'kv', method: 'get', args: ['x'] }
    vi.mocked(readBody).mockResolvedValue(mockBody)

    await expect(proxyEndpoint(event)).rejects.toThrow()
  })

  it('should wrap unknown errors as 500', async () => {
    process.env.OPENHUB_REMOTE_SECRET = 'expected'
    const handler = {
      handle: vi.fn(async () => { throw new Error('boom') })
    }
    getProxyHandlerMock.mockReturnValue(handler)

    const mockReq = {
      method: 'POST',
      url: '/__openhub2/proxy',
    } as any

    const event = createEvent({ req: mockReq, res: {} as any })

    // Mock getHeader to return the correct secret
    vi.mocked(getHeader).mockImplementation((_event, name) => {
      return name === 'x-openhub-secret' ? 'expected' : null
    })

    const mockBody = { binding: 'kv', method: 'get', args: ['x'] }
    vi.mocked(readBody).mockResolvedValue(mockBody)

    await expect(proxyEndpoint(event)).rejects.toThrow()
  })
})