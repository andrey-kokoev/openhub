# @openhub2/runtime-h3

OpenHub runtime integration for H3. Manages bindings and provides middleware for context injection.

## Installation

```bash
pnpm add @openhub2/runtime-h3
```

Requires `h3` as a peer:

```bash
pnpm add h3
```

## Usage

### With H3 Event Handler

```typescript
import { createApp, eventHandler } from 'h3'
import { createRuntime, openhubEventHandler } from '@openhub2/runtime-h3'
import { cloudflareProvider } from '@openhub2/provider-cloudflare'

const app = createApp()
const runtime = createRuntime()

// Register provider
runtime.registerProvider(cloudflareProvider)

// Create bindings (in production, extract from platform context)
const bindings = cloudflareProvider.extractBindings(env)

// Use with event handler wrapper
app.use('/api/users', openhubEventHandler(bindings, eventHandler(async (event) => {
  const { database } = event.context.openhub.bindings
  const stmt = database.prepare('SELECT * FROM users')
  const users = await stmt.all()
  return users
})))
```

### With Middleware

```typescript
import { createApp, eventHandler } from 'h3'
import { createRuntime, createOpenhubMiddleware, getBindings } from '@openhub2/runtime-h3'
import { cloudflareProvider } from '@openhub2/provider-cloudflare'

const app = createApp()
const runtime = createRuntime()

// Register provider
runtime.registerProvider(cloudflareProvider)

// Create bindings
const bindings = cloudflareProvider.extractBindings(env)

// Apply middleware globally
app.use(createOpenhubMiddleware(bindings))

// Use bindings in handlers
app.use('/api/users', eventHandler(async (event) => {
  const { database, kv, blob } = getBindings(event)
  const stmt = database.prepare('SELECT * FROM users')
  const users = await stmt.all()
  return users
}))
```

### Programmatic

```typescript
import { createRuntime } from '@openhub2/runtime-h3'
import { cloudflareProvider } from '@openhub2/provider-cloudflare'

const runtime = createRuntime()
runtime.registerProvider(cloudflareProvider)
```

## What It Does

1. **Registers provider** — accepts any type system-conforming provider
2. **Provides middleware** — `createOpenhubMiddleware` injects bindings into H3 event context
3. **Context injection** — bindings available via `event.context.openhub.bindings`
4. **Detects remote mode** — via environment or config

## Middleware

The H3 runtime provides two ways to inject bindings:

### Event Handler Wrapper

```typescript
import { openhubEventHandler } from '@openhub2/runtime-h3'

app.use('/api/data', openhubEventHandler(bindings, eventHandler(async (event) => {
  const { database, kv, blob } = event.context.openhub.bindings
  // Use bindings...
})))
```

### Middleware Factory

```typescript
import { createOpenhubMiddleware, getBindings } from '@openhub2/runtime-h3'

// Apply middleware
app.use(createOpenhubMiddleware(bindings))

// Access bindings in handlers
app.use('/api/data', eventHandler(async (event) => {
  const { database, kv, blob } = getBindings(event)
  // Use bindings...
}))
```

## Context Access

Bindings are available in event handlers via H3's event context:

```typescript
app.use('/api/users', eventHandler(async (event) => {
  // Direct access
  const { database, kv, blob } = event.context.openhub.bindings
  
  // Or use helper
  const bindings = getBindings(event)
  
  const stmt = database.prepare('SELECT * FROM users')
  const users = await stmt.all()
  
  return users
}))
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENHUB_REMOTE` | No | Enable remote mode (`true`/`false`) |
| `OPENHUB_REMOTE_URL` | In remote mode | Deployed worker URL |
| `OPENHUB_REMOTE_SECRET` | In remote mode | Shared auth secret |

## License

Apache-2.0
