import { openhubModule as nitroModule } from '@openhub2/runtime-nitro'

export interface PluginOptions {
  provider?: string
  remote?: boolean | 'production' | 'preview'
}

interface VinxiConfig {
  server?: {
    nitro?: {
      modules?: any[]
      runtimeConfig?: {
        openhub?: {
          remote?: boolean | 'production' | 'preview'
          provider?: string
        }
      }
    }
  }
}

export function openhubPlugin(options: PluginOptions = {}) {
  return {
    name: '@openhub2/metaframework-solidstart',
    
    async config(vinxiConfig: VinxiConfig) {
      // Register Nitro runtime module
      vinxiConfig.server = vinxiConfig.server || {}
      vinxiConfig.server.nitro = vinxiConfig.server.nitro || {}
      vinxiConfig.server.nitro.modules = vinxiConfig.server.nitro.modules || []
      vinxiConfig.server.nitro.modules.push(nitroModule)
      
      // Configure runtime config for remote mode
      vinxiConfig.server.nitro.runtimeConfig = vinxiConfig.server.nitro.runtimeConfig || {}
      vinxiConfig.server.nitro.runtimeConfig.openhub = vinxiConfig.server.nitro.runtimeConfig.openhub || {}
      vinxiConfig.server.nitro.runtimeConfig.openhub.remote = options.remote || false
      vinxiConfig.server.nitro.runtimeConfig.openhub.provider = options.provider
      
      return vinxiConfig
    }
  }
}

export default openhubPlugin
