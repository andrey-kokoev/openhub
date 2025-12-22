import type { DatabaseBinding, KVBinding, BlobBinding } from './bindings'

export type CloudflarePlatformContext = {
  platform: 'cloudflare'
  env: {
    DB?: DatabaseBinding
    KV?: KVBinding
    BLOB?: BlobBinding
  }
}

export type SupabasePlatformContext = {
  platform: 'supabase'
}

export type AWSPlatformContext = {
  platform: 'aws'
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