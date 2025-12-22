import { expect, test } from 'vitest'
import { solidstartMetaframework } from '../src'

test('solidstartMetaframework has correct name', () => {
  expect(solidstartMetaframework.name).toBe('solidstart')
})

test('solidstartMetaframework implements expected methods', () => {
  expect(solidstartMetaframework.defineConfig).toBeDefined()
  expect(solidstartMetaframework.registerCLI).toBeDefined()
  expect(solidstartMetaframework.registerDevtools).toBeDefined()
})
