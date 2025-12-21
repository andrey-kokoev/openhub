import { createRuntime } from './runtime'
import { join } from 'pathe'

export const openhubModule = (nitro: any) => {
  const runtime = createRuntime()

  // Register proxy endpoint
  nitro.options.handlers = nitro.options.handlers || []
  nitro.options.handlers.push({
    route: '/__openhub/proxy',
    handler: join(nitro.options.srcDir, 'endpoint/proxy.ts')
  })

  // Register bindings plugin
  nitro.options.plugins = nitro.options.plugins || []
  nitro.options.plugins.push(join(nitro.options.srcDir, 'plugin/bindings.ts'))

  // Inject runtime into nitro context for internal use
  nitro.options.runtimeConfig.openhub = {
    runtime
  }
}
