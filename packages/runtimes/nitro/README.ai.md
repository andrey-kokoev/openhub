# @openhub2/runtime-nitro

OpenHub runtime integration for Nitro. Manages bindings and exposes proxy endpoint.

## Installation

```bash
pnpm add @openhub2/runtime-nitro
```

Requires `nitropack` as a peer:

```bash
pnpm add nitropack
```

## Usage

### As Nitro Module

```typescript
// nitro.config.ts
import { openhubModule } from '@openhub2/runtime-nitro'

export default defineNitroConfig({
  modules: [openhubModule],
})
```

### Programmatic

```typescript
import { createRuntime } from '@openhub2/runtime-nitro'
import { cloudflareProvider } from '@openhub2/provider-cloudflare'

const runtime = createRuntime()
runtime.registerProvider(cloudflareProvider)
```

## What It Does

1. **Registers provider** — accepts any the type system-conforming provider
2. **Exposes proxy endpoint** — `/__openhub2/proxy` for remote requests
3. **Injects bindings** — into `event.context.openhub.bindings`
4. **Detects remote mode** — via environment or config

## Proxy Endpoint

In production, exposes `/__openhub2/proxy` that:

- Validates `x-openhub-secret` header
- Parses `ProxyRequest` from body
- Executes against real bindings
- Returns `ProxyResponse`

```typescript
// Request
POST /__openhub2/proxy
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

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENHUB_REMOTE` | No | Enable remote mode (`true`/`false`) |
| `OPENHUB_REMOTE_URL` | In remote mode | Deployed worker URL |
| `OPENHUB_REMOTE_SECRET` | In remote mode | Shared auth secret |

## License

Apache-2.0