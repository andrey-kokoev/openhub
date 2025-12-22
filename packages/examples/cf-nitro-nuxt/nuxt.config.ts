import { defineNuxtConfig, type NuxtConfig } from 'nuxt/config'

const nuxtConfigInput: NuxtConfig = {
  srcDir: 'src',
  serverDir: 'src/server',
  appDir: 'src/app',
  modules: [
    '@openhub2/metaframework-nuxt',
    '@nuxt/devtools'
  ],
  openhub: {
    provider: '@openhub2/provider-cloudflare',
    remote: false
  },
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },
  compatibilityDate: "2025-12-21",
  ssr: true
}

const nuxtConfigOutput: NuxtConfig = defineNuxtConfig(nuxtConfigInput)

export default nuxtConfigOutput