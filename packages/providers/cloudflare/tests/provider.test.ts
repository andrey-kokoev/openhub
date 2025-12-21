import { describe, it, expect } from 'vitest'
import { cloudflareProvider } from '../src/provider'

describe('cloudflareProvider', () => {
  it('should have correct name', () => {
    expect(cloudflareProvider.name).toBe('cloudflare')
  })

  it('should support all bindings', () => {
    expect(cloudflareProvider.supportedBindings).toContain('database')
    expect(cloudflareProvider.supportedBindings).toContain('kv')
    expect(cloudflareProvider.supportedBindings).toContain('blob')
  })

  it('should create local bindings', () => {
    const transport = { send: async () => ({ success: true }) }
    const bindings = cloudflareProvider.createLocalBindings(transport as any)
    expect(bindings.database).toBeDefined()
    expect(bindings.kv).toBeDefined()
    expect(bindings.blob).toBeDefined()
  })

  it('should extract bindings from platform context', () => {
    const context = {
      platform: 'cloudflare',
      env: {
        DB: { prepare: () => { } },
        KV: { get: () => { } },
        BLOB: { get: () => { } },
      }
    }
    const bindings = cloudflareProvider.extractBindings(context as any)
    expect(bindings.database).toBe(context.env.DB)
    expect(bindings.kv).toBe(context.env.KV)
    expect(bindings.blob).toBe(context.env.BLOB)
  })
})
