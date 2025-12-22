import type { Bindings, PlatformContext, AzurePlatformContext } from '@openhub2/dharma'

export function extractBindings (context: PlatformContext): Bindings {
  if (context.platform !== 'azure') {
    throw new Error(`Azure provider cannot extract bindings from platform: ${context.platform}`)
  }

  const azureContext = context as AzurePlatformContext
  return {
    database: azureContext.env.DATABASE,
    kv: azureContext.env.CACHE,
    blob: azureContext.env.STORAGE,
  }
}
