import type { Bindings, PlatformContext, CloudflarePlatformContext } from '@openhub/dharma'

export function extractBindings(context: PlatformContext): Bindings {
  if (context.platform !== 'cloudflare') {
    throw new Error(`Cloudflare provider cannot extract bindings from platform: ${context.platform}`)
  }

  const cfContext = context as CloudflarePlatformContext
  return {
    database: cfContext.env.DB,
    kv: cfContext.env.KV,
    blob: cfContext.env.BLOB,
  }
}
