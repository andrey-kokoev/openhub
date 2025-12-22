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

export type PlatformContext =
  | CloudflarePlatformContext
  | SupabasePlatformContext
  | AWSPlatformContext