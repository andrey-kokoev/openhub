import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Provider } from '@openhub2/types'

describe('context/runtime', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.doUnmock('#openhub/provider')
  })

  it('registers the first provider-like export from #openhub/provider', async () => {
    const mockProvider: Provider = {
      name: 'test-provider',
      supportedBindings: ['database'],
      createLocalBindings: () => ({}),
      createProxyHandler: () => ({ handle: async () => ({ success: true, data: {} }) }),
      extractBindings: () => ({}),
    }

    vi.doMock('#openhub/provider', () => ({ mockProvider }))

    const runtime = (await import('../../src/context/runtime')).default
    expect(runtime.getProviders()).toHaveLength(1)
    expect(runtime.getProviders()[0]).toBe(mockProvider)
  })

  it('does not register exports that do not look like providers', async () => {
    vi.doMock('#openhub/provider', () => ({
      somethingElse: { foo: 'bar' },
      another: 123,
    }))

    const runtime = (await import('../../src/context/runtime')).default
    expect(runtime.getProviders()).toHaveLength(0)
  })
})
