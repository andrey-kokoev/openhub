import { describe, it, expect } from 'vitest'
import { createRuntime, HonoRuntime } from '../src/runtime'
import type { Provider } from '@openhub2/types'

describe('HonoRuntime', () => {
  it('should create a runtime instance', () => {
    const runtime = createRuntime()
    expect(runtime).toBeInstanceOf(HonoRuntime)
    expect(runtime.name).toBe('hono')
  })

  it('should register providers', () => {
    const runtime = createRuntime()
    const mockProvider: Provider = {
      name: 'test-provider',
      supportedBindings: ['database'],
      createLocalBindings: () => ({}),
      createProxyHandler: () => async () => ({ success: true, data: {} }),
      extractBindings: () => ({}),
    }

    runtime.registerProvider(mockProvider)
    expect(runtime.getProviders()).toHaveLength(1)
    expect(runtime.getProviders()[0]).toBe(mockProvider)
  })

  it('should register proxy endpoint', () => {
    const runtime = createRuntime()
    const mockHandler = async () => ({ success: true, data: {} })

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
    const originalValue = process.env.OPENHUB_REMOTE

    process.env.OPENHUB_REMOTE = 'true'
    expect(runtime.isRemoteMode()).toBe(true)

    process.env.OPENHUB_REMOTE = 'false'
    expect(runtime.isRemoteMode()).toBe(false)

    // Restore original value
    if (originalValue !== undefined) {
      process.env.OPENHUB_REMOTE = originalValue
    } else {
      delete process.env.OPENHUB_REMOTE
    }
  })
})
