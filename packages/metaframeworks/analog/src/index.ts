import type { Metaframework } from '@openhub2/types'
import { schema } from './config/schema'
import { registerRemoteFlag } from './cli'
import { registerDevtools } from './devtools'
import openhubPlugin from './plugin'

export const analogMetaframework: Metaframework = {
  name: 'analog',
  configureRuntime (runtime, config) {
    // Runtime configuration if needed outside the plugin flow
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

export default openhubPlugin
export { openhubPlugin }
export type { PluginOptions } from './plugin'
