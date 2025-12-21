# @openhub/runtime-nitro

OpenHub runtime integration for Nitro. Manages bindings and exposes proxy endpoint.

## Installation
```bash
pnpm add @openhub/runtime-nitro
```

## Peer Dependencies
```bash
pnpm add @openhub/dharma
```

## Usage

### As Nitro Module
```typescript
// nitro.config.ts
import { openhubModule } from '@openhub/runtime-nitro'

export default defineNitroConfig({
  modules: [openhubModule],
})
```

### Programmatic
```typescript
import { createRuntime } from '@openhub/runtime-nitro'
import { cloudflareProvider } from '@openhub/provider-cloudflare'

const runtime = createRuntime()
runtime.registerProvider(cloudflareProvider)
```

## What It Does

1. **Registers provider** — accepts any Dharma-conforming provider
2. **Exposes proxy endpoint** — `/__openhub/proxy` for remote requests
3. **Injects bindings** — into `event.context.openhub.bindings`
4. **Detects remote mode** — via environment or config

## Proxy Endpoint

In production, exposes `/__openhub/proxy` that:

- Validates `x-openhub-secret` header
- Parses `ProxyRequest` from body
- Executes against real bindings
- Returns `ProxyResponse`
```typescript
// Request
POST /__openhub/proxy
x-openhub-secret: your-secret
{
  "binding": "database",
  "method": "prepare",
  "args": ["SELECT * FROM users"]
}

// Response
{
  "success": true,
  "data": { ... }
}
```

## Context Injection

Bindings available in handlers:
```typescript
export default defineEventHandler((event) => {
  const { database, kv, blob } = event.context.openhub.bindings
  
  const stmt = database.prepare('SELECT * FROM users')
  const users = await stmt.all()
  
  return users
})
```

## Environment Variables
```bash
OPENHUB_REMOTE=true
OPENHUB_REMOTE_URL=https://your-app.pages.dev
OPENHUB_REMOTE_SECRET=your-shared-secret
```

## License

Apache-2.0