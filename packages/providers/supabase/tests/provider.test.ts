import { describe, it, expect } from 'vitest'
import { supabaseProvider } from '../src/provider'

describe('supabaseProvider', () => {
  it('should have correct name', () => {
    expect(supabaseProvider.name).toBe('supabase')
  })

  it('should support all bindings', () => {
    expect(supabaseProvider.supportedBindings).toContain('database')
    expect(supabaseProvider.supportedBindings).toContain('kv')
    expect(supabaseProvider.supportedBindings).toContain('blob')
  })

  it('should create local bindings', () => {
    const transport = { send: async () => ({ success: true }) }
    const bindings = supabaseProvider.createLocalBindings(transport as any)
    expect(bindings.database).toBeDefined()
    expect(bindings.kv).toBeDefined()
    expect(bindings.blob).toBeDefined()
  })

  it('should extract bindings from platform context', () => {
    const context = {
      platform: 'supabase',
      env: {
        DATABASE: { prepare: () => { } },
        KV: { get: () => { } },
        STORAGE: { get: () => { } },
      }
    }
    const bindings = supabaseProvider.extractBindings(context as any)
    expect(bindings.database).toBe(context.env.DATABASE)
    expect(bindings.kv).toBe(context.env.KV)
    expect(bindings.blob).toBe(context.env.STORAGE)
  })
})
