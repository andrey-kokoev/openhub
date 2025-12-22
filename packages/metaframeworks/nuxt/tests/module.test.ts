import { describe, expect, test } from 'vitest'
import { nuxtMetaframework } from '../src'

describe('nuxtMetaframework', () => {
  test('has correct name', () => {
    expect(nuxtMetaframework.name).toBe('nuxt')
  })

  test('implements Dharma Metaframework interface', () => {
    expect(nuxtMetaframework.configureRuntime).toBeDefined()
    expect(nuxtMetaframework.defineConfig).toBeDefined()
    expect(nuxtMetaframework.registerCLI).toBeDefined()
    expect(nuxtMetaframework.registerDevtools).toBeDefined()
  })

  test('configureRuntime is callable', () => {
    const runtime = {} as any
    const config = {} as any
    expect(() => nuxtMetaframework.configureRuntime(runtime, config)).not.toThrow()
  })

  test('defineConfig extends schema', () => {
    const configSchema = { properties: {}, required: [] }
    nuxtMetaframework.defineConfig(configSchema)
    expect(configSchema.properties).toHaveProperty('provider')
    expect(configSchema.properties).toHaveProperty('remote')
  })

  test('registerCLI is callable with CLI context', () => {
    const cli = {
      registerFlag: () => { },
      registerCommand: () => { },
    }
    expect(() => nuxtMetaframework.registerCLI!(cli)).not.toThrow()
  })

  test('registerDevtools is callable with devtools context', () => {
    const devtools = {
      registerPanel: () => { },
    }
    expect(() => nuxtMetaframework.registerDevtools!(devtools)).not.toThrow()
  })
})

