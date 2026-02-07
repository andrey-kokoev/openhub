import type { Bindings, PlatformContext, SupabasePlatformContext } from '@openhub2/types'

export function extractBindings (context: PlatformContext): Bindings {
  if (context.platform !== 'supabase') {
    throw new Error(`Supabase provider cannot extract bindings from platform: ${context.platform}`)
  }

  const sbContext = context as SupabasePlatformContext
  return {
    database: sbContext.env.DATABASE,
    kv: sbContext.env.KV,
    blob: sbContext.env.STORAGE,
  }
}
