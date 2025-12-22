import { expect, test } from 'vitest'
import { analogMetaframework } from '../src'

test('analogMetaframework has correct name', () => {
  expect(analogMetaframework.name).toBe('analog')
})

test('analogMetaframework implements expected methods', () => {
  expect(analogMetaframework.defineConfig).toBeDefined()
  expect(analogMetaframework.registerCLI).toBeDefined()
  expect(analogMetaframework.registerDevtools).toBeDefined()
})
