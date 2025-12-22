import { describe, it, expect } from 'vitest'
import { azureProvider } from '../src/provider'

describe('azureProvider', () => {
  it('should have correct name', () => {
    expect(azureProvider.name).toBe('azure')
  })

  it('should support all bindings', () => {
    expect(azureProvider.supportedBindings).toContain('database')
    expect(azureProvider.supportedBindings).toContain('kv')
    expect(azureProvider.supportedBindings).toContain('blob')
  })

  it('should create local bindings', () => {
    const transport = { send: async () => ({ success: true }) }
    const bindings = azureProvider.createLocalBindings(transport as any)
    expect(bindings.database).toBeDefined()
    expect(bindings.kv).toBeDefined()
    expect(bindings.blob).toBeDefined()
  })

  it('should extract bindings from platform context', () => {
    const context = {
      platform: 'azure',
      env: {
        DATABASE: { prepare: () => { } },
        CACHE: { get: () => { } },
        STORAGE: { get: () => { } },
      }
    }
    const bindings = azureProvider.extractBindings(context as any)
    expect(bindings.database).toBe(context.env.DATABASE)
    expect(bindings.kv).toBe(context.env.CACHE)
    expect(bindings.blob).toBe(context.env.STORAGE)
  })
})
