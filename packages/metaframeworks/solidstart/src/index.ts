import type { Metaframework } from '@openhub2/dharma'
import { schema } from './config/schema'
import { registerRemoteFlag } from './cli'
import { registerDevtools } from './devtools'
import openhubPlugin from './plugin'

export const solidstartMetaframework: Metaframework = {
  name: 'solidstart',
  configureRuntime (runtime, config) {
    // Runtime configuration if needed outside the Vinxi plugin flow
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
