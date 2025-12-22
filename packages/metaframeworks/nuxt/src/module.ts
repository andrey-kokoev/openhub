import { defineNuxtModule, createResolver, addTypeTemplate } from '@nuxt/kit'
import { openhubModule as nitroModule } from '@openhub2/runtime-nitro'

export interface ModuleOptions {
  provider?: string
  remote?: boolean | 'production' | 'preview'
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@openhub2/metaframework-nuxt',
    configKey: 'openhub',
    compatibility: { nuxt: '^4.0.0' }
  },
  defaults: {
    remote: false
  },
  async setup (options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // ✅ Teach TS about `nuxt.config.ts -> openhub: {...}`
    addTypeTemplate({
      filename: 'types/openhub2-metaframework-nuxt.d.ts',
      getContents: () => `
import type { ModuleOptions } from '${resolver.resolve('./module')}'

declare module '@nuxt/schema' {
  interface NuxtConfig {
    openhub?: ModuleOptions
  }
  interface NuxtOptions {
    openhub?: ModuleOptions
  }
}

export {}
`.trim()
    })

    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.modules = nitroConfig.modules || []
      nitroConfig.modules.push(nitroModule)
    })

    // Prefer runtimeConfig.public unless you intentionally want server-only
    // @ts-ignore
    nuxt.options.runtimeConfig.openhub = nuxt.options.runtimeConfig.openhub || {}
    // @ts-ignore
    nuxt.options.runtimeConfig.openhub.remote = options.remote
    // @ts-ignore
    nuxt.options.runtimeConfig.openhub.provider = options.provider

    if (nuxt.options.dev) {
      // @ts-ignore
      nuxt.hook('devtools:customTabs', (tabs) => {
        tabs.push({
          name: 'openhub',
          title: 'OpenHub',
          icon: 'tabler:box',
          view: { type: 'iframe', src: '/__openhub2/devtools' }
        })
      })
    }
  }
})
