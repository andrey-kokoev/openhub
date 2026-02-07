import type { ConfigSchema } from '@openhub2/types'

/**
 * OpenHub Configuration Schema for Nuxt
 * 
 * Conforms to the type system's ConfigSchema type (Article I).
 * Defines the shape of OpenHub configuration in nuxt.config.ts
 * 
 * Article IV Section 1: "A Metaframework provides developer experience: 
 * configuration, CLI, devtools."
 * 
 * This schema enables:
 * - Type-safe configuration in nuxt.config.ts
 * - Runtime validation of configuration values
 * - IDE autocompletion and inline documentation
 * 
 * Example usage:
 * ```typescript
 * // nuxt.config.ts
 * export default defineNuxtConfig({
 *   modules: ['@openhub2/metaframework-nuxt'],
 *   openhub: {
 *     provider: '@openhub2/provider-cloudflare',
 *     remote: true
 *   }
 * })
 * ```
 */
export const schema: ConfigSchema = {
  properties: {
    provider: {
      type: 'string',
      description: 'Provider package name (e.g., @openhub2/provider-cloudflare)',
    },
    remote: {
      type: 'boolean',
      default: false,
      description: 'Enable remote mode (true, false, "production", or "preview")',
    },
  },
  required: ['provider'],
}

