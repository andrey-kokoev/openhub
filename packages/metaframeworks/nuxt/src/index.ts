import type { Metaframework } from '@openhub2/dharma'
import { schema } from './config/schema'
import { registerRemoteFlag } from './cli'
import { registerDevtools } from './devtools'
import openhubModule from './module'

export const nuxtMetaframework: Metaframework = {
  name: 'nuxt',
  configureRuntime (runtime, config) {
    // Runtime configuration if needed outside the Nuxt module flow
  },
  defineConfig (configSchema) {
    Object.assign(configSchema.properties, schema.properties)
  },
  registerCLI (cli) {
    registerRemoteFlag(cli)
  },
  registerDevtools (devtools) {
    registerDevtools(devtools)
  }
}

export default openhubModule
export { openhubModule }
