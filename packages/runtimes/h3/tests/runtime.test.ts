import { describe, it, expect } from 'vitest'
import { createRuntime, H3Runtime } from '../src/runtime'
import type { Provider } from '@openhub2/types'

describe('H3Runtime', () => {
  it('should create a runtime instance', () => {
    const runtime = createRuntime()
    expect(runtime).toBeInstanceOf(H3Runtime)
    expect(runtime.name).toBe('h3')
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

  it('should inject bindings into context', () => {
    const runtime = createRuntime()
    const context: any = {}
    const bindings = { database: {}, kv: {}, blob: {} }

    runtime.injectBindings(context, bindings)
    expect(context.openhub).toBeDefined()
    expect(context.openhub.bindings).toEqual(bindings)
  })

  it('should detect remote mode from environment', () => {
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
