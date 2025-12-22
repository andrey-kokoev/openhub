import type { ModuleOptions } from './module'

/**
 * Type augmentation for Nuxt schema
 * 
 * This allows TypeScript to recognize the `openhub` config key in nuxt.config.ts
 * and provides autocompletion and type checking for OpenHub options.
 * 
 * Usage:
 * ```typescript
 * // nuxt.config.ts
 * export default defineNuxtConfig({
 *   openhub: {
 *     provider: '@openhub2/provider-cloudflare',
 *     remote: true
 *   }
 * })
 * ```
 */
declare module 'nuxt/schema' {
  interface NuxtConfig {
    openhub?: ModuleOptions
  }
  interface NuxtOptions {
    openhub?: ModuleOptions
  }
}

export { }

