import type { Bindings, PlatformContext, GoogleCloudPlatformContext } from '@openhub2/dharma'

export function extractBindings (context: PlatformContext): Bindings {
  if (context.platform !== 'google') {
    throw new Error(`Google provider cannot extract bindings from platform: ${context.platform}`)
  }

  const gcpContext = context as GoogleCloudPlatformContext
  return {
    database: gcpContext.env.DB,
    kv: gcpContext.env.KV,
    blob: gcpContext.env.BLOB,
  }
}
