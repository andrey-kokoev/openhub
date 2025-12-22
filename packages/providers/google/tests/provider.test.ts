import { describe, it, expect } from 'vitest'
import { googleProvider } from '../src/provider'

describe('googleProvider', () => {
  it('should have correct name', () => {
    expect(googleProvider.name).toBe('google')
  })

  it('should support all bindings', () => {
    expect(googleProvider.supportedBindings).toContain('database')
    expect(googleProvider.supportedBindings).toContain('kv')
    expect(googleProvider.supportedBindings).toContain('blob')
  })

  it('should create local bindings', () => {
    const transport = { send: async () => ({ success: true }) }
    const bindings = googleProvider.createLocalBindings(transport as any)
    expect(bindings.database).toBeDefined()
    expect(bindings.kv).toBeDefined()
    expect(bindings.blob).toBeDefined()
  })

  it('should extract bindings from platform context', () => {
    const context = {
      platform: 'google',
      env: {
        DB: { prepare: () => { } },
        KV: { get: () => { } },
        BLOB: { get: () => { } },
      }
    }
    const bindings = googleProvider.extractBindings(context as any)
    expect(bindings.database).toBe(context.env.DB)
    expect(bindings.kv).toBe(context.env.KV)
    expect(bindings.blob).toBe(context.env.BLOB)
  })
})
