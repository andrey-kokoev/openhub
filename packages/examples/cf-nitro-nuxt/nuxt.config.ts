import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@openhub2/metaframework-nuxt',
    '@nuxt/devtools'
  ],
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },
  compatibilityDate: "2025-12-21",
  ssr: true
})
