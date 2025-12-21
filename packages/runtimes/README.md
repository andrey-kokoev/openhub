# OpenHub Runtimes

Runtimes execute application code and manage bindings within request context.

## Available Runtimes

| Runtime | Package | Status |
|---------|---------|--------|
| Nitro | `@openhub/runtime-nitro` | Official |
| Hono | `@openhub/runtime-hono` | Community |
| H3 | `@openhub/runtime-h3` | Community |

## Creating a Runtime Integration

A runtime must implement `Runtime` from `@openhub/dharma`:
```typescript
import type { Runtime } from '@openhub/dharma'

export const myRuntime: Runtime = {
  name: 'my-runtime',
  registerProvider(provider) { ... },
  registerProxyEndpoint(handler) { ... },
  injectBindings(context, bindings) { ... },
  isRemoteMode() { ... },
}
```

See [constitution.md](../../constitution.md) Article III for runtime constraints.