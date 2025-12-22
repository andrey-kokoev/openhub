import { defineNuxtConfig, type NuxtConfig } from 'nuxt/config'

const nuxtConfigInput: NuxtConfig = {
  modules: [
    '@openhub2/metaframework-nuxt',
    '@nuxt/devtools'
  ],
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },
  compatibilityDate: "2025-12-21",
  ssr: true
}

const nuxtConfigOutput: NuxtConfig = defineNuxtConfig(nuxtConfigInput)

export default nuxtConfigOutput