import type { Bindings, PlatformContext, AWSPlatformContext } from '@openhub2/types'

export function extractBindings (context: PlatformContext): Bindings {
  if (context.platform !== 'aws') {
    throw new Error(`AWS provider cannot extract bindings from platform: ${context.platform}`)
  }

  const awsContext = context as AWSPlatformContext
  return {
    database: awsContext.env.RDS,
    kv: awsContext.env.DYNAMODB,
    blob: awsContext.env.S3,
  }
}
