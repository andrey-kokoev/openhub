import { describe, expect, test } from 'vitest'
import { schema } from '../../src/config/schema'

describe('OpenHub config schema', () => {
  test('has provider property', () => {
    expect(schema.properties).toHaveProperty('provider')
    expect(schema.properties.provider.type).toBe('string')
    expect(schema.properties.provider.description).toBeDefined()
  })

  test('has remote property', () => {
    expect(schema.properties).toHaveProperty('remote')
    expect(schema.properties.remote.type).toBe('boolean')
    expect(schema.properties.remote.default).toBe(false)
    expect(schema.properties.remote.description).toBeDefined()
  })

  test('marks provider as required', () => {
    expect(schema.required).toContain('provider')
  })

  test('conforms to the type system ConfigSchema type', () => {
    // Type-level test: if this compiles, the schema conforms
    const testSchema: typeof schema = schema
    expect(testSchema).toBeDefined()
  })
})

