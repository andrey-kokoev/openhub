import { join, dirname } from 'pathe'
import { createRequire } from 'node:module'
import type { Nitro } from 'nitropack'

const __require = createRequire(import.meta.url)
const __dirname = dirname(__require.resolve('@openhub2/runtime-nitro/package.json'))

export const openhubModule = (nitro: Nitro) => {
  console.log('[openhub] Nitro module starting')
  const providerName = nitro.options.runtimeConfig.openhub?.provider
  console.log('[openhub] Provider name:', providerName)

  // Register virtual module for provider
  nitro.options.virtual = nitro.options.virtual || {}
  if (providerName) {
    console.log('[openhub] Registering virtual module for', providerName)
    nitro.options.virtual['#openhub/provider'] = `export * from '${providerName}'`
  } else {
    console.log('[openhub] Registering empty virtual module for provider')
    nitro.options.virtual['#openhub/provider'] = 'export {}'
  }

  // Register proxy endpoint
  nitro.options.handlers = nitro.options.handlers || []
  nitro.options.handlers.push({
    route: '/__openhub2/proxy',
    handler: join(__dirname, 'src/endpoint/proxy.ts')
  })

  // Register bindings plugin
  nitro.options.plugins = nitro.options.plugins || []
  nitro.options.plugins.push(join(__dirname, 'src/plugin/bindings.ts'))
}
