import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const readBodyMock = vi.fn()
const getHeaderMock = vi.fn()
const createErrorMock = vi.fn((opts: { statusCode: number; statusMessage: string }) => {
  const error: any = new Error(opts.statusMessage)
  error.statusCode = opts.statusCode
  error.statusMessage = opts.statusMessage
  return error
})

const useRuntimeConfigMock = vi.fn()
const getProxyHandlerMock = vi.fn()

vi.mock('h3', () => ({
  defineEventHandler: (fn: any) => fn,
  readBody: (...args: any[]) => readBodyMock(...args),
  getHeader: (...args: any[]) => getHeaderMock(...args),
  createError: (opts: any) => createErrorMock(opts),
}))

vi.mock('nitropack/runtime', () => ({
  useRuntimeConfig: (...args: any[]) => useRuntimeConfigMock(...args),
}))

vi.mock('../../src/context/runtime', () => ({
  default: {
    getProxyHandler: (...args: any[]) => getProxyHandlerMock(...args),
  },
}))

// Import after mocks are declared
import proxyEndpoint from '../../src/endpoint/proxy'

describe('/__openhub2/proxy endpoint', () => {
  const originalSecret = process.env.OPENHUB_REMOTE_SECRET

  beforeEach(() => {
    readBodyMock.mockReset()
    getHeaderMock.mockReset()
    createErrorMock.mockClear()
    useRuntimeConfigMock.mockReset()
    getProxyHandlerMock.mockReset()
    delete process.env.OPENHUB_REMOTE_SECRET
  })

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.OPENHUB_REMOTE_SECRET
    } else {
      process.env.OPENHUB_REMOTE_SECRET = originalSecret
    }
  })

  it('should reject when secret is missing', async () => {
    useRuntimeConfigMock.mockReturnValue({ openhub: {} })
    getHeaderMock.mockReturnValue('anything')

    await expect(proxyEndpoint({} as any)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('should reject when secret does not match expectedSecret', async () => {
    useRuntimeConfigMock.mockReturnValue({ openhub: { remoteSecret: 'expected' } })
    getHeaderMock.mockReturnValue('wrong')

    await expect(proxyEndpoint({} as any)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('should return 501 when proxy handler is not configured', async () => {
    useRuntimeConfigMock.mockReturnValue({ openhub: { remoteSecret: 'expected' } })
    getHeaderMock.mockReturnValue('expected')
    readBodyMock.mockResolvedValue({ binding: 'kv', method: 'get', args: ['x'] })
    getProxyHandlerMock.mockReturnValue(undefined)

    await expect(proxyEndpoint({} as any)).rejects.toMatchObject({ statusCode: 501 })
  })

  it('should forward request body to handler', async () => {
    useRuntimeConfigMock.mockReturnValue({ openhub: { remoteSecret: 'expected' } })
    getHeaderMock.mockReturnValue('expected')
    const body = { binding: 'kv', method: 'get', args: ['x'] }
    readBodyMock.mockResolvedValue(body)
    const handler = {
      handle: vi.fn(async () => ({ success: true, data: { ok: true } })),
    }
    getProxyHandlerMock.mockReturnValue(handler)

    await expect(proxyEndpoint({} as any)).resolves.toEqual({ success: true, data: { ok: true } })
    expect(handler.handle).toHaveBeenCalledWith(body)
  })

  it('should rethrow handler errors with statusCode', async () => {
    useRuntimeConfigMock.mockReturnValue({ openhub: { remoteSecret: 'expected' } })
    getHeaderMock.mockReturnValue('expected')
    readBodyMock.mockResolvedValue({ binding: 'kv', method: 'get', args: ['x'] })
    const error: any = new Error('Bad Request')
    error.statusCode = 400
    const handler = { handle: vi.fn(async () => { throw error }) }
    getProxyHandlerMock.mockReturnValue(handler)

    await expect(proxyEndpoint({} as any)).rejects.toBe(error)
  })

  it('should wrap unknown errors as 500', async () => {
    useRuntimeConfigMock.mockReturnValue({ openhub: { remoteSecret: 'expected' } })
    getHeaderMock.mockReturnValue('expected')
    readBodyMock.mockResolvedValue({ binding: 'kv', method: 'get', args: ['x'] })
    const handler = { handle: vi.fn(async () => { throw new Error('boom') }) }
    getProxyHandlerMock.mockReturnValue(handler)

    await expect(proxyEndpoint({} as any)).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'boom',
    })
  })
})
