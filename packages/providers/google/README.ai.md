# @openhub2/provider-google

OpenHub provider for Google Cloud: Cloud SQL, Firestore, Cloud Storage.

## Installation

```bash
pnpm add @openhub2/provider-google
```

## Usage

With `@openhub2/runtime-nitro`:

```typescript
import { googleProvider } from '@openhub2/provider-google'
import { createRuntime } from '@openhub2/runtime-nitro'

const runtime = createRuntime()
runtime.registerProvider(googleProvider)
```

With `@openhub2/metaframework-nuxt`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@openhub2/metaframework-nuxt'],
  openhub: {
    provider: '@openhub2/provider-google',
    remote: true,
  }
})
```

## Supported Bindings

| Binding | Google Cloud Service | the type system Type |
|---------|---------------------|-------------|
| database | Cloud SQL / Firestore | `DatabaseBinding` |
| kv | Firestore / Memorystore | `KVBinding` |
| blob | Cloud Storage | `BlobBinding` |

## Remote Mode

In remote mode, this provider creates proxy clients that forward requests to your deployed function's `/__openhub2/proxy` endpoint.

Required environment variables:

```bash
OPENHUB_REMOTE_URL=https://your-function.cloudfunctions.net
OPENHUB_REMOTE_SECRET=your-shared-secret
```

## Production Mode

In production, this provider extracts real bindings from Google Cloud's platform context:

```typescript
// Expects these bindings in your Google Cloud configuration
// DB -> Cloud SQL or Firestore database
// KV -> Firestore or Memorystore instance
// BLOB -> Cloud Storage bucket
```

## License

Apache-2.0
