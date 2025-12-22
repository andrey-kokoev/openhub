import { expect, test } from 'vitest'
import { schema } from '../../src/config/schema'

test('schema defines provider property', () => {
  expect(schema.properties.provider).toBeDefined()
  expect(schema.properties.provider.type).toBe('string')
})

test('schema defines remote property', () => {
  expect(schema.properties.remote).toBeDefined()
  expect(schema.properties.remote.type).toBe('boolean')
  expect(schema.properties.remote.default).toBe(false)
})
