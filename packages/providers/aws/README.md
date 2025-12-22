# @openhub2/provider-aws

OpenHub provider for AWS: RDS, DynamoDB, S3.

## Installation

```bash
pnpm add @openhub2/provider-aws
```

## Usage

With `@openhub2/runtime-nitro`:

```typescript
import { awsProvider } from '@openhub2/provider-aws'
import { createRuntime } from '@openhub2/runtime-nitro'

const runtime = createRuntime()
runtime.registerProvider(awsProvider)
```

With `@openhub2/metaframework-nuxt`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@openhub2/metaframework-nuxt'],
  openhub: {
    provider: '@openhub2/provider-aws',
    remote: true,
  }
})
```

## Supported Bindings

| Binding | AWS Service | Dharma Type |
|---------|-------------|-------------|
| database | RDS | `DatabaseBinding` |
| kv | DynamoDB | `KVBinding` |
| blob | S3 | `BlobBinding` |

## Remote Mode

In remote mode, this provider creates proxy clients that forward requests to your deployed application's `/__openhub2/proxy` endpoint.

Required environment variables:

```bash
OPENHUB_REMOTE_URL=https://your-api.execute-api.us-east-1.amazonaws.com
OPENHUB_REMOTE_SECRET=your-shared-secret
```

## Production Mode

In production, this provider extracts real bindings from AWS platform context:

```typescript
// Expects these bindings in environment
// RDS -> RDS database connection
// DYNAMODB -> DynamoDB table
// S3 -> S3 bucket
```

## License

Apache-2.0
