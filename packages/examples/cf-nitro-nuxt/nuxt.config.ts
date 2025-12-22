import { defineNuxtConfig } from "nuxt/config"

export default defineNuxtConfig({
  modules: ['@openhub2/metaframework-nuxt'],

  openhub: {
    provider: '@openhub2/provider-cloudflare',
    remote: false, // Set to true or use --remote flag
  },

  nitro: {
    preset: 'cloudflare-pages',
  },

  devtools: { enabled: true },

  compatibilityDate: '2025-06-01',
})