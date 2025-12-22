import { createRuntime } from './runtime'
import { join, dirname } from 'pathe'
import { createRequire } from 'node:module'
import type { Nitro } from 'nitropack'

const __require = createRequire(import.meta.url)
const __dirname = dirname(__require.resolve('@openhub2/runtime-nitro/package.json'))

export const openhubModule = (nitro: Nitro) => {
  const runtime = createRuntime()

  // Register proxy endpoint
  nitro.options.handlers = nitro.options.handlers || []
  nitro.options.handlers.push({
    route: '/__openhub2/proxy',
    handler: join(__dirname, 'src/endpoint/proxy.ts')
  })

  // Register bindings plugin
  nitro.options.plugins = nitro.options.plugins || []
  nitro.options.plugins.push(join(__dirname, 'src/plugin/bindings.ts'))

  // Inject runtime into nitro context for internal use
  nitro.options.runtimeConfig.openhub = nitro.options.runtimeConfig.openhub || {}
  nitro.options.runtimeConfig.openhub.runtime = runtime
}
