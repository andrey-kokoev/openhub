import type { Metaframework } from '@openhub2/types'
import { schema } from './config/schema'
import { registerRemoteFlag } from './cli'
import { registerDevtools } from './devtools'
import openhubModule from './module'

/**
 * OpenHub Metaframework for Nuxt
 * 
 * Conforms to Article IV of the OpenHub Constitution.
 * Provides developer experience on top of @openhub2/runtime-nitro.
 * 
 * Powers:
 * - Configure Runtimes (via Nuxt module)
 * - Register Providers with Runtimes
 * - Extend CLI with --remote flag
 * - Provide devtools integration
 * 
 * Limits (Article IV Section 3):
 * - Does not bypass Runtime to access Provider directly
 * - Does not modify the type system's type contracts
 * - Does not require a specific Provider
 */
export const nuxtMetaframework: Metaframework = {
  name: 'nuxt',

  configureRuntime (_runtime, _config) {
    // Runtime configuration happens in the Nuxt module
    // This hook is available for metaframeworks that need
    // to configure the runtime outside the module flow
  },

  defineConfig (configSchema) {
    // Extend the OpenHub config schema with Nuxt-specific options
    Object.assign(configSchema.properties, schema.properties)
    if (schema.required) {
      configSchema.required = [
        ...(configSchema.required || []),
        ...schema.required,
      ]
    }
  },

  registerCLI (cli) {
    // Register --remote flag for nuxt dev
    registerRemoteFlag(cli)
  },

  registerDevtools (devtools) {
    // Register OpenHub panel in Nuxt Devtools
    registerDevtools(devtools)
  },
}

// Export both the metaframework definition and the Nuxt module
export default openhubModule
export { openhubModule }

