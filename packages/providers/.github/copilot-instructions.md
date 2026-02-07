# OpenHub Providers

Providers adapt cloud platforms to OpenHub's universal bindings.

## Available Providers

| Provider | Package | Status |
|----------|---------|--------|
| Cloudflare | `@openhub2/provider-cloudflare` | Official |
| Azure | `@openhub2/provider-azure` | Official |
| Supabase | `@openhub2/provider-supabase` | Official |
| Google | `@openhub2/provider-google` | Official |
| Supabase | `@openhub2/provider-supabase` | Community |
| AWS | `@openhub2/provider-aws` | Community |

## Creating a Provider

A provider must implement `Provider` from `@openhub2/types`:
```typescript
import type { Provider } from '@openhub2/types'

export const myProvider: Provider = {
  name: 'my-provider',
  supportedBindings: ['database', 'kv', 'blob'],
  createLocalBindings(transport) { ... },
  createProxyHandler() { ... },
  extractBindings(platformContext) { ... },
}
```

See [constitution.md](../../constitution.md) Article II for provider constraints.