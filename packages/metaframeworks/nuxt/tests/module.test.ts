import { expect, test } from 'vitest'
import { nuxtMetaframework } from '../src'

test('nuxtMetaframework has correct name', () => {
  expect(nuxtMetaframework.name).toBe('nuxt')
})

test('nuxtMetaframework implements expected methods', () => {
  expect(nuxtMetaframework.defineConfig).toBeDefined()
  expect(nuxtMetaframework.registerCLI).toBeDefined()
  expect(nuxtMetaframework.registerDevtools).toBeDefined()
})
