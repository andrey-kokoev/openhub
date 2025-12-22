import { describe, it, expect } from 'vitest'
import { awsProvider } from '../src/provider'

describe('awsProvider', () => {
  it('should have correct name', () => {
    expect(awsProvider.name).toBe('aws')
  })

  it('should support all bindings', () => {
    expect(awsProvider.supportedBindings).toContain('database')
    expect(awsProvider.supportedBindings).toContain('kv')
    expect(awsProvider.supportedBindings).toContain('blob')
  })

  it('should create local bindings', () => {
    const transport = { send: async () => ({ success: true }) }
    const bindings = awsProvider.createLocalBindings(transport as any)
    expect(bindings.database).toBeDefined()
    expect(bindings.kv).toBeDefined()
    expect(bindings.blob).toBeDefined()
  })

  it('should extract bindings from platform context', () => {
    const context = {
      platform: 'aws',
      env: {
        RDS: { prepare: () => { } },
        DYNAMODB: { get: () => { } },
        S3: { get: () => { } },
      }
    }
    const bindings = awsProvider.extractBindings(context as any)
    expect(bindings.database).toBe(context.env.RDS)
    expect(bindings.kv).toBe(context.env.DYNAMODB)
    expect(bindings.blob).toBe(context.env.S3)
  })
})
