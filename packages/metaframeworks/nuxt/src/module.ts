import { defineNuxtModule, addModule, createResolver } from '@nuxt/kit'
import { openhubModule as nitroModule } from '@openhub/runtime-nitro'

export interface ModuleOptions {
  provider?: string
  remote?: boolean | 'production' | 'preview'
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@openhub/metaframework-nuxt',
    configKey: 'openhub',
    compatibility: {
      nuxt: '^4.0.0'
    }
  },
  defaults: {
    remote: false
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Register Nitro runtime module via nitro:config hook
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.modules = nitroConfig.modules || []
      nitroConfig.modules.push(nitroModule)
    })

    // Configure nitro for remote mode if needed
    // @ts-ignore
    nuxt.options.runtimeConfig.openhub = nuxt.options.runtimeConfig.openhub || {}
    // @ts-ignore
    nuxt.options.runtimeConfig.openhub.remote = options.remote
    // @ts-ignore
    nuxt.options.runtimeConfig.openhub.provider = options.provider

    // Add devtools integration if enabled
    if (nuxt.options.dev) {
      // @ts-ignore
      nuxt.hook('devtools:customTabs', (tabs) => {
        tabs.push({
          name: 'openhub',
          title: 'OpenHub',
          icon: 'tabler:box',
          view: {
            type: 'iframe',
            src: '/__openhub/devtools'
          }
        })
      })
    }
  }
})
