# @openhub2/dharma

Type constraints for the OpenHub ecosystem.

## What is Dharma?

Dharma defines the law that all OpenHub layers must conform to:

- **Layers**: Provider, Runtime, Metaframework
- **Boundaries**: What crosses between layers
- **Bindings**: Database, KV, Blob

## Installation

If you're using an OpenHub metaframework or runtime, dharma is included as a transitive dependency. You only need to install it directly if you're building a Provider, Runtime, or Metaframework.

```bash
pnpm add -D @openhub2/dharma
```

## Usage

### Layer Types

```typescript
import type { Provider, Runtime, Metaframework } from '@openhub2/dharma'
```

### Binding Types

```typescript
import type { 
  DatabaseBinding, 
  KVBinding, 
  BlobBinding,
  Bindings 
} from '@openhub2/dharma/subtypes'
```

### Boundary Types

```typescript
import type { ProxyRequest, ProxyResponse } from '@openhub2/dharma/boundaries'
```

## Exports

| Export | Path | Contents |
|--------|------|----------|
| Main | `@openhub2/dharma` | `Provider`, `Runtime`, `Metaframework` |
| Layers | `@openhub2/dharma/layers` | Layer type definitions |
| Boundaries | `@openhub2/dharma/boundaries` | `ProxyRequest`, `ProxyResponse`, cross-layer contracts |
| Subtypes | `@openhub2/dharma/subtypes` | `Bindings`, `DatabaseBinding`, `KVBinding`, `BlobBinding` |

## For Implementers

If you are building a Provider, Runtime, or Metaframework, your implementation must satisfy the types defined here.

### Provider

```typescript
import type { Provider } from '@openhub2/dharma'

export const myProvider: Provider = {
  name: 'my-provider',
  supportedBindings: ['database', 'kv', 'blob'],
  createLocalBindings(transport) { /* ... */ },
  createProxyHandler() { /* ... */ },
  extractBindings(platformContext) { /* ... */ },
}
```

### Runtime

```typescript
import type { Runtime } from '@openhub2/dharma'

export const myRuntime: Runtime = {
  name: 'my-runtime',
  registerProvider(provider) { /* ... */ },
  registerProxyEndpoint(handler) { /* ... */ },
  injectBindings(context, bindings) { /* ... */ },
  isRemoteMode() { /* ... */ },
}
```

### Metaframework

```typescript
import type { Metaframework } from '@openhub2/dharma'

export const myMetaframework: Metaframework = {
  name: 'my-metaframework',
  configureRuntime(runtime, config) { /* ... */ },
  defineConfig(schema) { /* ... */ },
  registerCLI(cli) { /* ... */ },
  registerDevtools(devtools) { /* ... */ },
}
```

See [constitution.md](../../constitution.md) for the full constitution.

## License

Apache-2.0