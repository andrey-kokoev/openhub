import { defineNitroPlugin, useRuntimeConfig } from 'nitropack/runtime'
import type { H3Event } from 'h3'
import type { PlatformContext } from '@openhub2/dharma'
import runtime from '../context/runtime'
import { NitroHttpTransport } from '../transport/http'

function isRecord (value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function isPlatformContext (value: unknown): value is PlatformContext {
  if (!isRecord(value)) {
    return false
  }

  const platform = value.platform
  const env = value.env

  return (
    (platform === 'cloudflare' ||
      platform === 'supabase' ||
      platform === 'aws' ||
      platform === 'azure' ||
      platform === 'google') &&
    isRecord(env)
  )
}

function getPlatformContext (event: H3Event): PlatformContext | undefined {
  const openhub: unknown = event.context.openhub

  if (isRecord(openhub) && isPlatformContext(openhub.platformContext)) {
    return openhub.platformContext
  }

  const cloudflare: unknown = event.context.cloudflare
  if (isRecord(cloudflare) && isRecord(cloudflare.env)) {
    return { platform: 'cloudflare', env: cloudflare.env }
  }

  const context: unknown = event.context
  if (isPlatformContext(context)) {
    return context
  }
}

export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig().openhub as any

  if (config?.remote) {
    runtime.setRemoteMode(true)
  }

  // Nitro plugin to inject bindings into every request
  nitroApp.hooks.hook('request', async (event: H3Event) => {
    try {
      event.context.openhub = event.context.openhub || {}
      event.context.openhub.runtime = runtime

      let bindings = {}
      const platformContext = getPlatformContext(event)

      if (runtime.isRemoteMode()) {
        const providers = runtime.getProviders()
        if (providers.length > 0 && config?.remoteUrl && config?.remoteSecret) {
          const transport = new NitroHttpTransport(config.remoteUrl, config.remoteSecret)
          // For now, we use the first provider to create remote bindings
          // In the future, we might want to support multiple providers
          const provider = providers[0]
          bindings = provider.createLocalBindings(transport)
        }
      } else {
        const providers = runtime.getProviders()
        for (const provider of providers) {
          if (!platformContext) {
            continue
          }

          const extracted = provider.extractBindings(platformContext)
          bindings = { ...bindings, ...extracted }

          // Register proxy handler for the remote worker
          const handler = provider.createProxyHandler(extracted)
          runtime.registerProxyEndpoint(handler)
        }
      }

      runtime.injectBindings(event.context, bindings)
    } catch (error: any) {
      console.error('[openhub] Error in request hook:', error)
    }
  })
})
