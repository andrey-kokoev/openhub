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

### Remote Mode with Proxy Endpoint

When running in remote mode, the runtime can proxy requests to remote services:

```typescript
import { createApp } from 'h3'
import { bindingsMiddleware } from '@openhub2/runtime-h3'

const app = createApp()

// Apply bindings middleware to automatically handle local/remote mode
app.use(bindingsMiddleware)

// The proxy endpoint is automatically available at /__openhub2/proxy
// when using remote mode with appropriate secrets
```

### Programmatic

```typescript
import { createRuntime } from '@openhub2/runtime-h3'
import { cloudflareProvider } from '@openhub2/provider-cloudflare'

const runtime = createRuntime()
runtime.registerProvider(cloudflareProvider)
```

## What It Does

1. **Registers provider** — accepts any the type system-conforming provider
2. **Provides middleware** — `createOpenhubMiddleware` and `bindingsMiddleware` inject bindings into H3 event context
3. **Context injection** — bindings available via `event.context.openhub.bindings`
4. **Detects remote mode** — via environment or config
5. **Proxy endpoint** — `/__openhub2/proxy` for remote mode communication
6. **Transport layer** — HTTP transport for remote communication

## Modules

The H3 runtime is organized into several modules:

### Runtime
Core runtime functionality for managing providers and bindings.

### Middleware
Context injection and binding management utilities.

### Context
Runtime context management and binding injection.

### Plugin
Bindings middleware that handles local/remote mode switching.

### Transport
HTTP transport for remote communication with proxy endpoints.

### Endpoint
Proxy endpoint implementation for remote mode.

## Middleware

The H3 runtime provides several ways to inject bindings:

### Event Handler Wrapper

```typescript
import { openhubEventHandler } from '@openhub2/runtime-h3'

app.use('/api/data', openhubEventHandler(bindings, eventHandler(async (event) => {
  const { database, kv, blob } = event.context.openhub.bindings
  // Use bindings...
})))
```

### Bindings Middleware (Auto-configures Local/Remote)

```typescript
import { bindingsMiddleware } from '@openhub2/runtime-h3'

// Apply middleware that automatically handles local/remote mode
app.use(bindingsMiddleware)
```

### Middleware Factory

```typescript
import { createOpenhubMiddleware, getBindings } from '@openhub2/runtime-h3'

// Apply middleware with specific bindings
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

## Remote Mode

The runtime supports remote mode where bindings are handled via HTTP proxy:

```typescript
// Enable remote mode
process.env.OPENHUB_REMOTE = 'true'
process.env.OPENHUB_REMOTE_URL = 'https://my-worker.example.com'
process.env.OPENHUB_REMOTE_SECRET = 'shared-secret'
```

In remote mode, the runtime creates local bindings that communicate with remote services via the proxy endpoint.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENHUB_REMOTE` | No | Enable remote mode (`true`/`false`) |
| `OPENHUB_REMOTE_URL` | In remote mode | Deployed worker URL |
| `OPENHUB_REMOTE_SECRET` | In remote mode | Shared auth secret for proxy endpoint |

## License

Apache-2.0
