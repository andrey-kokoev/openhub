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
  env: {
    DATABASE?: DatabaseBinding
    KV?: KVBinding
    STORAGE?: BlobBinding
  }
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

export type PlatformContext =
  | CloudflarePlatformContext
  | SupabasePlatformContext
  | AWSPlatformContext
  | AzurePlatformContext