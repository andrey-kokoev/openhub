import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createEvent } from 'h3'
import { createRuntime } from '../../src/runtime'
import type { Provider, Bindings, ProxyHandler } from '@openhub2/types'
import bindingsMiddleware from '../../src/plugin/bindings'

async function importMiddleware(runtime: any) {
  vi.doMock('../../src/context/runtime', () => ({ default: runtime }))
  return (await import('../../src/plugin/bindings')).default
}

describe('bindings middleware', () => {
  const originalRemoteEnv = process.env.OPENHUB_REMOTE
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.resetModules()
    delete process.env.OPENHUB_REMOTE
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    errorSpy.mockRestore()
    if (originalRemoteEnv === undefined) {
      delete process.env.OPENHUB_REMOTE
    } else {
      process.env.OPENHUB_REMOTE = originalRemoteEnv
    }
  })

  it('injects bindings via provider.createLocalBindings in remote mode', async () => {
    const runtime = createRuntime()

    const injected: Bindings = { kv: { get: async () => null } as any }
    const createLocalBindings = vi.fn((transport: any) => {
      expect(transport.url).toBe('https://example.com/__openhub2/proxy')
      expect(transport.secret).toBe('sekret')
      return injected
    })

    const provider: Provider = {
      name: 'test-provider',
      supportedBindings: ['kv'],
      createLocalBindings,
      createProxyHandler: () => ({ handle: async () => ({ success: true }) }),
      extractBindings: () => ({}),
    }
    runtime.registerProvider(provider)

    process.env.OPENHUB_REMOTE = 'true'
    process.env.OPENHUB_REMOTE_URL = 'https://example.com'
    process.env.OPENHUB_REMOTE_SECRET = 'sekret'

    const mockReq = {
      method: 'GET',
      url: '/',
    } as any

    const event = createEvent({ req: mockReq, res: {} as any })

    const middleware = await importMiddleware(runtime)
    await middleware(event)

    expect(createLocalBindings).toHaveBeenCalledTimes(1)
    expect(event.context.openhub_runtime).toBe(runtime)
    expect(event.context.openhub.bindings).toEqual(injected)
  })

  it('extracts and merges bindings in local mode', async () => {
    const runtime = createRuntime()

    const handler1: ProxyHandler = { handle: async () => ({ success: true, data: 1 }) }
    const handler2: ProxyHandler = { handle: async () => ({ success: true, data: 2 }) }

    const db = { prepare: () => ({}) }
    const kv = { get: async () => null }

    const provider1: Provider = {
      name: 'provider-1',
      supportedBindings: ['database'],
      createLocalBindings: () => ({}),
      extractBindings: vi.fn(() => ({ database: db as any })),
      createProxyHandler: vi.fn(() => handler1),
    }
    const provider2: Provider = {
      name: 'provider-2',
      supportedBindings: ['kv'],
      createLocalBindings: () => ({}),
      extractBindings: vi.fn(() => ({ kv: kv as any })),
      createProxyHandler: vi.fn(() => handler2),
    }
    runtime.registerProvider(provider1)
    runtime.registerProvider(provider2)

    const mockReq = {
      method: 'GET',
      url: '/',
    } as any

    const event = createEvent({ req: mockReq, res: {} as any })
    // Set up platform environment in event
    event.node = { req: { env: { DB: db, KV: kv } } }

    const middleware = await importMiddleware(runtime)
    await middleware(event)

    const platformContext = {
      platform: 'h3',
      env: { DB: db, KV: kv }
    }
    expect(provider1.extractBindings).toHaveBeenCalledWith(platformContext)
    expect(provider2.extractBindings).toHaveBeenCalledWith(platformContext)

    expect(provider1.createProxyHandler).toHaveBeenCalledWith({ database: db, kv })
    expect(provider2.createProxyHandler).toHaveBeenCalledWith({ database: db, kv })

    expect(event.context.openhub.bindings).toEqual({ database: db, kv })
    expect(runtime.getProxyHandler()).toBe(handler2)
  })
})