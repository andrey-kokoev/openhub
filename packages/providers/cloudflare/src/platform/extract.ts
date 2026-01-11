import type { Bindings, PlatformContext, CloudflarePlatformContext } from '@openhub2/types'

export function extractBindings (context: PlatformContext): Bindings {
  if (context.platform !== 'cloudflare') {
    throw new Error(`Cloudflare provider cannot extract bindings from platform: ${context.platform}`)
  }

  const cfContext = context as CloudflarePlatformContext
  return {
    database: cfContext.env.DB,
    kv: cfContext.env.KV,
    // Prefer the canonical OpenHub binding name `BLOB` (R2 bucket),
    // but accept existing apps that still bind R2 as `R2`.
    blob: cfContext.env.BLOB ?? cfContext.env.R2,
  }
}
