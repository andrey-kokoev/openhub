# OpenHub Runtimes

Runtimes execute application code and manage bindings within request context.

## Available Runtimes

| Runtime | Package | Status |
|---------|---------|--------|
| Nitro | `@openhub2/runtime-nitro` | Official |
| Hono | `@openhub2/runtime-hono` | Community |
| H3 | `@openhub2/runtime-h3` | Community |

## Creating a Runtime Integration

A runtime must implement `Runtime` from `@openhub2/dharma`:
```typescript
import type { Runtime } from '@openhub2/dharma'

export const myRuntime: Runtime = {
  name: 'my-runtime',
  registerProvider(provider) { ... },
  registerProxyEndpoint(handler) { ... },
  injectBindings(context, bindings) { ... },
  isRemoteMode() { ... },
}
```

See [constitution.md](../../constitution.md) Article III for runtime constraints.