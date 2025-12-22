// packages/examples/cf-nitro-nuxt/nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from '@nuxt/schema'

export default defineNuxtConfig({
  modules: ['@openhub2/metaframework-nuxt'],

  openhub: {
    provider: '@openhub2/provider-cloudflare',
    remote: false,
  },

  nitro: {
    preset: 'cloudflare-pages',
  },

  devtools: { enabled: true },

  compatibilityDate: '2025-06-01',
} satisfies NuxtConfig)
