import { defineNuxtModule, createResolver, addTypeTemplate } from '@nuxt/kit'
import { openhubModule as nitroModule } from '@openhub2/runtime-nitro'

/**
 * OpenHub Module Options for Nuxt
 * 
 * Conforms to Dharma's MetaframeworkConfig type
 */
export interface ModuleOptions {
  /** Provider package name (e.g., @openhub2/provider-cloudflare) */
  provider?: string
  /** Enable remote mode: false (local), true, 'production', or 'preview' */
  remote?: boolean | 'production' | 'preview'
}

/**
 * OpenHub Nuxt Module
 * 
 * Architecture (Article IV):
 * - Configures @openhub2/runtime-nitro via Nitro hooks
 * - Registers provider with runtime
 * - Sets up proxy endpoints for remote mode
 * - Adds devtools panel
 * 
 * Conforms to Constitutional limits:
 * - Does not bypass Runtime to access Provider directly
 * - Does not modify Dharma's type contracts
 * - Does not require a specific Provider (provider is configurable)
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@openhub2/metaframework-nuxt',
    configKey: 'openhub',
    compatibility: { nuxt: '^4.0.0' },
  },
  defaults: {
    remote: false,
  },
  async setup (options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // ✅ Type augmentation: teach TS about nuxt.config.ts -> openhub: {...}
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
`.trim(),
    })

    // ✅ Register OpenHub Nitro Runtime module
    // This is how the Metaframework configures the Runtime (Article IV Section 2)
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.modules = nitroConfig.modules || []
      nitroConfig.modules.push(nitroModule)

      // Pass OpenHub config to Nitro runtime
      nitroConfig.runtimeConfig = nitroConfig.runtimeConfig || {}
      nitroConfig.runtimeConfig.openhub = {
        remote: options.remote,
        provider: options.provider,
      }
    })

    // ✅ Expose config to app (client + server)
    nuxt.options.runtimeConfig.openhub = nuxt.options.runtimeConfig.openhub || {}
    // @ts-expect-error - nuxt type augmentation
    nuxt.options.runtimeConfig.openhub.remote = options.remote
    // @ts-expect-error - nuxt type augmentation
    nuxt.options.runtimeConfig.openhub.provider = options.provider

    // ✅ Register devtools panel in dev mode
    if (nuxt.options.dev) {
      // @ts-expect-error - devtools:customTabs hook is not in the types
      nuxt.hook('devtools:customTabs', (tabs: any[]) => {
        tabs.push({
          name: 'openhub',
          title: 'OpenHub',
          icon: 'tabler:box',
          view: { type: 'iframe', src: '/__openhub2/devtools' },
        })
      })
    }
  },
})

