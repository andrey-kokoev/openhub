import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { openhubModule } from '../src/module'

function toPosixPath (value: string): string {
  return value.replace(/\\/g, '/')
}

describe('openhubModule', () => {
  let logSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy.mockRestore()
  })

  it('should register provider virtual module when provider is configured', () => {
    const nitro: any = {
      options: {
        runtimeConfig: {
          openhub: {
            provider: '@openhub2/provider-cloudflare',
          },
        },
      },
    }

    openhubModule(nitro)

    expect(nitro.options.virtual['#openhub/provider']).toBe(
      "export * from '@openhub2/provider-cloudflare'",
    )

    const proxyEntry = nitro.options.handlers.find((h: any) => h.route === '/__openhub2/proxy')
    expect(proxyEntry).toBeDefined()
    expect(toPosixPath(proxyEntry.handler).endsWith('src/endpoint/proxy.ts')).toBe(true)

    expect(
      nitro.options.plugins.some((p: string) => toPosixPath(p).endsWith('src/plugin/bindings.ts')),
    ).toBe(true)
  })

  it('should register empty provider virtual module when provider is not configured', () => {
    const nitro: any = {
      options: {
        runtimeConfig: {
          openhub: {},
        },
      },
    }

    openhubModule(nitro)

    expect(nitro.options.virtual['#openhub/provider']).toBe('export {}')
  })

  it('should preserve existing Nitro options and append handlers/plugins', () => {
    const existingHandler = { route: '/existing', handler: '/existing.ts' }
    const existingPlugin = '/existing-plugin.ts'
    const nitro: any = {
      options: {
        runtimeConfig: {
          openhub: {
            provider: '@openhub2/provider-cloudflare',
          },
        },
        virtual: {
          '#some/other': 'export const x = 1',
        },
        handlers: [existingHandler],
        plugins: [existingPlugin],
      },
    }

    openhubModule(nitro)

    expect(nitro.options.virtual['#some/other']).toBe('export const x = 1')
    expect(nitro.options.handlers).toHaveLength(2)
    expect(nitro.options.handlers[0]).toBe(existingHandler)
    expect(nitro.options.plugins).toHaveLength(2)
    expect(nitro.options.plugins[0]).toBe(existingPlugin)
  })
})
