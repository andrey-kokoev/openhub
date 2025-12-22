# OpenHub Metaframeworks

Metaframeworks provide developer experience on top of OpenHub runtimes.

## Available Metaframeworks

| Metaframework | Package | Status |
|---------------|---------|--------|
| Nuxt | `@openhub2/metaframework-nuxt` | Official |
| Analog | `@openhub2/metaframework-analog` | Official |
| SolidStart | `@openhub2/metaframework-solidstart` | Community |

## Creating a Metaframework Integration

A metaframework must implement `Metaframework` from `@openhub2/dharma`:
```typescript
import type { Metaframework } from '@openhub2/dharma'

export const myMetaframework: Metaframework = {
  name: 'my-metaframework',
  configureRuntime(runtime, config) { ... },
  defineConfig(schema) { ... },
  registerCLI(cli) { ... },
  registerDevtools(devtools) { ... },
}
```

See [constitution.md](../../constitution.md) Article IV for metaframework constraints.