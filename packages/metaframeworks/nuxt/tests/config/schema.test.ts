import { expect, test } from 'vitest'
import { schema } from '../../src/config/schema'

test('schema has expected properties', () => {
  expect(schema.properties).toHaveProperty('provider')
  expect(schema.properties).toHaveProperty('remote')
  expect(schema.properties.remote.default).toBe(false)
})
