import { defineNitroPlugin, useRuntimeConfig } from 'nitropack/runtime'
import type { NitroRuntimeConfig } from 'nitropack/types'
import type { H3Event } from 'h3'
import type { PlatformContext } from '@openhub2/dharma'
import type { NitroRuntime } from '../runtime'

type OpenhubNitroRuntimeConfig = NitroRuntimeConfig & {
  openhub?: {
    runtime?: NitroRuntime
  }
}

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
  const runtime = useRuntimeConfig<OpenhubNitroRuntimeConfig>().openhub?.runtime

  if (!runtime) {
    console.error('[openhub] Runtime not found in runtime config')
    return
  }

  // Nitro plugin to inject bindings into every request
  nitroApp.hooks.hook('request', async (event: H3Event) => {
    event.context.openhub = event.context.openhub || {}
    event.context.openhub.runtime = runtime

    let bindings = {}
    const platformContext = getPlatformContext(event)

    if (runtime.isRemoteMode()) {
      const providers = runtime.getProviders()
      if (providers.length > 0) {
        // Placeholder for remote binding logic
      }
    } else {
      const providers = runtime.getProviders()
      for (const provider of providers) {
        if (!platformContext) {
          continue
        }

        const extracted = provider.extractBindings(platformContext)
        bindings = { ...bindings, ...extracted }
      }
    }

    runtime.injectBindings(event.context, bindings)
  })
})
