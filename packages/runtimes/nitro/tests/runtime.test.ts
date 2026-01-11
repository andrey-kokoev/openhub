import { describe, it, expect, afterEach } from 'vitest'
import { createRuntime, NitroRuntime } from '../src/runtime'
import type { Provider, ProxyHandler, ProxyRequest } from '@openhub2/types'

describe('NitroRuntime', () => {
  const originalEnv = process.env.OPENHUB_REMOTE

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.OPENHUB_REMOTE
    } else {
      process.env.OPENHUB_REMOTE = originalEnv
    }
  })

  it('should create a runtime instance', () => {
    const runtime = createRuntime()
    expect(runtime).toBeInstanceOf(NitroRuntime)
    expect(runtime.name).toBe('nitro')
  })

  it('should register providers', () => {
    const runtime = createRuntime()
    const mockProvider: Provider = {
      name: 'test-provider',
      supportedBindings: ['database'],
      createLocalBindings: () => ({}),
      createProxyHandler: () => ({ handle: async () => ({ success: true, data: {} }) }),
      extractBindings: () => ({}),
    }

    runtime.registerProvider(mockProvider)
    expect(runtime.getProviders()).toHaveLength(1)
    expect(runtime.getProviders()[0]).toBe(mockProvider)
  })

  it('should register proxy endpoint', () => {
    const runtime = createRuntime()
    const mockHandler: ProxyHandler = {
      handle: async (_request: ProxyRequest) => ({ success: true, data: {} }),
    }

    runtime.registerProxyEndpoint(mockHandler)
    expect(runtime.getProxyHandler()).toBe(mockHandler)
  })

  it('should inject bindings into context (merge semantics)', () => {
    const runtime = createRuntime()
    const existingDatabase = { existing: true }
    const kvBinding = { get: async () => null }
    const context: any = { openhub: { bindings: { database: existingDatabase } } }

    runtime.injectBindings(context, { kv: kvBinding as any })

    expect(context.openhub).toBeDefined()
    expect(context.openhub.bindings).toEqual({
      database: existingDatabase,
      kv: kvBinding,
    })
  })

  it('should detect remote mode from setRemoteMode override', () => {
    const runtime = createRuntime()
    process.env.OPENHUB_REMOTE = 'false'
    runtime.setRemoteMode(true)
    expect(runtime.isRemoteMode()).toBe(true)
  })

  it('should detect remote mode from environment when not overridden', () => {
    const runtime = createRuntime()

    process.env.OPENHUB_REMOTE = 'true'
    expect(runtime.isRemoteMode()).toBe(true)

    process.env.OPENHUB_REMOTE = 'false'
    expect(runtime.isRemoteMode()).toBe(false)
  })
})
