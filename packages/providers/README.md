# OpenHub Providers

Providers adapt cloud platforms to OpenHub's universal bindings.

## Available Providers

| Provider | Package | Status |
|----------|---------|--------|
| Cloudflare | `@openhub/provider-cloudflare` | Official |
| Supabase | `@openhub/provider-supabase` | Community |
| AWS | `@openhub/provider-aws` | Community |

## Creating a Provider

A provider must implement `Provider` from `@openhub/dharma`:
```typescript
import type { Provider } from '@openhub/dharma'

export const myProvider: Provider = {
  name: 'my-provider',
  supportedBindings: ['database', 'kv', 'blob'],
  createLocalBindings(transport) { ... },
  createProxyHandler() { ... },
  extractBindings(platformContext) { ... },
}
```

See [constitution.md](../../constitution.md) Article II for provider constraints.