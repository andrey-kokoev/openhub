# @openhub2/runtime-hono

OpenHub runtime integration for Hono. Manages bindings and provides middleware for context injection.

## Installation

```bash
pnpm add @openhub2/runtime-hono
```

Requires `hono` as a peer:

```bash
pnpm add hono
```

## Usage

### With Hono Middleware

```typescript
import { Hono } from 'hono'
import { createRuntime, openhubMiddleware } from '@openhub2/runtime-hono'
import { cloudflareProvider } from '@openhub2/provider-cloudflare'

const app = new Hono()
const runtime = createRuntime()

// Register provider
runtime.registerProvider(cloudflareProvider)

// Create bindings (in production, extract from platform context)
const bindings = cloudflareProvider.extractBindings(env)

// Apply middleware
app.use('*', openhubMiddleware(bindings))

// Use bindings in handlers
app.get('/users', async (c) => {
  const { database } = c.get('openhub').bindings
  const stmt = database.prepare('SELECT * FROM users')
  const users = await stmt.all()
  return c.json(users)
})
```

### Programmatic

```typescript
import { createRuntime } from '@openhub2/runtime-hono'
import { cloudflareProvider } from '@openhub2/provider-cloudflare'

const runtime = createRuntime()
runtime.registerProvider(cloudflareProvider)
```

## What It Does

1. **Registers provider** — accepts any the type system-conforming provider
2. **Provides middleware** — `openhubMiddleware` injects bindings into Hono context
3. **Context injection** — bindings available via `c.get('openhub').bindings`
4. **Detects remote mode** — via environment or config

## Middleware

The `openhubMiddleware` function creates a Hono middleware that:

- Injects bindings into the Hono context variable store
- Makes bindings available in all downstream handlers
- Supports multiple binding types (database, kv, blob)

```typescript
import { openhubMiddleware, getBindings } from '@openhub2/runtime-hono'

// Apply middleware
app.use('*', openhubMiddleware(bindings))

// Access bindings in handlers
app.get('/api/data', async (c) => {
  const { database, kv, blob } = getBindings(c)
  // Use bindings...
})
```

## Context Access

Bindings are available in handlers via Hono's context:

```typescript
app.get('/users', async (c) => {
  // Direct access
  const { database, kv, blob } = c.get('openhub').bindings
  
  // Or use helper
  const bindings = getBindings(c)
  
  const stmt = database.prepare('SELECT * FROM users')
  const users = await stmt.all()
  
  return c.json(users)
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
