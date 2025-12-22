import type { ModuleOptions } from './module'

declare module 'nuxt/schema' {
  interface NuxtConfig {
    openhub?: ModuleOptions
  }
  interface NuxtOptions {
    openhub?: ModuleOptions
  }
}

export { }
