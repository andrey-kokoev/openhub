# @openhub/provider-cloudflare

OpenHub provider for Cloudflare Workers bindings: D1, KV, R2.

## Installation
```bash
pnpm add @openhub/provider-cloudflare
```

## Peer Dependencies
```bash
pnpm add @openhub/dharma
```

## Usage

With `@openhub/runtime-nitro`:
```typescript
import { cloudflareProvider } from '@openhub/provider-cloudflare'
import { createRuntime } from '@openhub/runtime-nitro'

const runtime = createRuntime()
runtime.registerProvider(cloudflareProvider)
```

With `@openhub/metaframework-nuxt`:
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@openhub/metaframework-nuxt'],
  openhub: {
    provider: '@openhub/provider-cloudflare',
    remote: true,
  }
})
```

## Supported Bindings

| Binding | Cloudflare Service | Dharma Type |
|---------|-------------------|-------------|
| database | D1 | `DatabaseBinding` |
| kv | Workers KV | `KVBinding` |
| blob | R2 | `BlobBinding` |

## Remote Mode

In remote mode, this provider creates proxy clients that forward requests to your deployed worker's `/__openhub/proxy` endpoint.

Required environment variables:
```bash
OPENHUB_REMOTE_URL=https://your-worker.pages.dev
OPENHUB_REMOTE_SECRET=your-shared-secret
```

## Production Mode

In production, this provider extracts real bindings from Cloudflare's platform context:
```typescript
// Expects these bindings in wrangler.toml / wrangler.json
// DB -> D1 database
// KV -> KV namespace
// BLOB -> R2 bucket
```

## License

Apache-2.0