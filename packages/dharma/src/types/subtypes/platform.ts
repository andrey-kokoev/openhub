import type { DatabaseBinding, KVBinding, BlobBinding } from './bindings'

export type CloudflarePlatformContext = {
  platform: 'cloudflare'
  env: {
    DB?: DatabaseBinding
    KV?: KVBinding
    BLOB?: BlobBinding
    /** Legacy/alternate R2 bucket binding name used by some apps. */
    R2?: BlobBinding
  }
}

export type SupabasePlatformContext = {
  platform: 'supabase'
  env: {
    DATABASE?: DatabaseBinding
    KV?: KVBinding
    STORAGE?: BlobBinding
  }
}

export type AWSPlatformContext = {
  platform: 'aws'
  env: {
    RDS?: DatabaseBinding
    DYNAMODB?: KVBinding
    S3?: BlobBinding
  }
}

export type AzurePlatformContext = {
  platform: 'azure'
  env: {
    DATABASE?: DatabaseBinding
    CACHE?: KVBinding
    STORAGE?: BlobBinding
  }
}

export type GoogleCloudPlatformContext = {
  platform: 'google'
  env: {
    DB?: DatabaseBinding
    KV?: KVBinding
    BLOB?: BlobBinding
  }
}

export type PlatformContext =
  | CloudflarePlatformContext
  | SupabasePlatformContext
  | AWSPlatformContext
  | AzurePlatformContext
  | GoogleCloudPlatformContext
