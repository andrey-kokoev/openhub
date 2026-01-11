import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRuntime } from '../../src/runtime'
import type { Provider, Bindings, ProxyHandler } from '@openhub2/types'

type NitroAppHarness = {
  nitroApp: any
  getRequestHook: () => ((event: any) => Promise<void>) | undefined
}

function createNitroAppHarness (): NitroAppHarness {
  let requestHook: ((event: any) => Promise<void>) | undefined
  const nitroApp = {
    hooks: {
      hook: (name: string, fn: any) => {
        if (name === 'request') {
          requestHook = fn
        }
      },
    },
  }
  return {
    nitroApp,
    getRequestHook: () => requestHook,
  }
}

async function importPlugin (runtime: any, runtimeConfig: any) {
  vi.doMock('nitropack/runtime', () => ({
    defineNitroPlugin: (fn: any) => fn,
    useRuntimeConfig: () => runtimeConfig,
  }))
  vi.doMock('../../src/context/runtime', () => ({ default: runtime }))

  return (await import('../../src/plugin/bindings')).default as (nitroApp: any) => void
}

describe('bindings plugin', () => {
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

    const runtimeConfig = {
      openhub: {
        remote: true,
        remoteUrl: 'https://example.com',
        remoteSecret: 'sekret',
      },
    }

    const plugin = await importPlugin(runtime, runtimeConfig)
    const harness = createNitroAppHarness()
    plugin(harness.nitroApp)

    const hook = harness.getRequestHook()
    expect(hook).toBeTypeOf('function')

    const event: any = { context: {} }
    await hook?.(event)

    expect(createLocalBindings).toHaveBeenCalledTimes(1)
    expect(event.context.openhub.runtime).toBe(runtime)
    expect(event.context.openhub.bindings).toEqual(injected)
  })

  it('does not create remote bindings without remoteUrl/remoteSecret', async () => {
    const runtime = createRuntime()

    const createLocalBindings = vi.fn(() => ({ kv: {} as any }))
    const provider: Provider = {
      name: 'test-provider',
      supportedBindings: ['kv'],
      createLocalBindings,
      createProxyHandler: () => ({ handle: async () => ({ success: true }) }),
      extractBindings: () => ({}),
    }
    runtime.registerProvider(provider)

    const runtimeConfig = {
      openhub: {
        remote: true,
        remoteUrl: 'https://example.com',
      },
    }

    const plugin = await importPlugin(runtime, runtimeConfig)
    const harness = createNitroAppHarness()
    plugin(harness.nitroApp)

    const event: any = { context: {} }
    await harness.getRequestHook()?.(event)

    expect(createLocalBindings).not.toHaveBeenCalled()
    expect(event.context.openhub.runtime).toBe(runtime)
    expect(event.context.openhub.bindings).toEqual({})
  })

  it('extracts and merges bindings in local mode from openhub.platformContext', async () => {
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

    const runtimeConfig = { openhub: {} }

    const plugin = await importPlugin(runtime, runtimeConfig)
    const harness = createNitroAppHarness()
    plugin(harness.nitroApp)

    const event: any = {
      context: {
        openhub: {
          platformContext: {
            platform: 'cloudflare',
            env: { DB: db },
          },
        },
      },
    }

    await harness.getRequestHook()?.(event)

    expect(provider1.extractBindings).toHaveBeenCalledWith(event.context.openhub.platformContext)
    expect(provider2.extractBindings).toHaveBeenCalledWith(event.context.openhub.platformContext)

    expect(provider1.createProxyHandler).toHaveBeenCalledWith({ database: db })
    expect(provider2.createProxyHandler).toHaveBeenCalledWith({ kv })

    expect(event.context.openhub.bindings).toEqual({ database: db, kv })
    expect(runtime.getProxyHandler()).toBe(handler2)
  })

  it('extracts platform context from event.context.cloudflare.env when present', async () => {
    const runtime = createRuntime()

    const extractBindings = vi.fn(() => ({ database: {} as any }))
    const provider: Provider = {
      name: 'provider',
      supportedBindings: ['database'],
      createLocalBindings: () => ({}),
      extractBindings,
      createProxyHandler: () => ({ handle: async () => ({ success: true }) }),
    }
    runtime.registerProvider(provider)

    const plugin = await importPlugin(runtime, { openhub: {} })
    const harness = createNitroAppHarness()
    plugin(harness.nitroApp)

    const cloudflareEnv = { DB: {} }
    const event: any = { context: { cloudflare: { env: cloudflareEnv } } }
    await harness.getRequestHook()?.(event)

    expect(extractBindings).toHaveBeenCalledWith({ platform: 'cloudflare', env: cloudflareEnv })
  })

  it('extracts platform context from event.context when it matches PlatformContext', async () => {
    const runtime = createRuntime()

    const extractBindings = vi.fn(() => ({ kv: {} as any }))
    const provider: Provider = {
      name: 'provider',
      supportedBindings: ['kv'],
      createLocalBindings: () => ({}),
      extractBindings,
      createProxyHandler: () => ({ handle: async () => ({ success: true }) }),
    }
    runtime.registerProvider(provider)

    const plugin = await importPlugin(runtime, { openhub: {} })
    const harness = createNitroAppHarness()
    plugin(harness.nitroApp)

    const event: any = { context: { platform: 'aws', env: {} } }
    await harness.getRequestHook()?.(event)

    expect(extractBindings).toHaveBeenCalledWith(event.context)
  })
})
