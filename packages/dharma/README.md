# @openhub/dharma

Type constraints for the OpenHub ecosystem.

## What is Dharma?

Dharma defines the law that all OpenHub layers must conform to:

- **Layers**: Provider, Runtime, Metaframework
- **Boundaries**: What crosses between layers
- **Bindings**: Database, KV, Blob

## Installation
```bash
pnpm add -D @openhub/dharma
```

## Usage
```typescript
import type { Provider, Runtime, Metaframework } from '@openhub/dharma'
import type { Bindings, ProxyHandler } from '@openhub/dharma/subtypes'
```

## For Implementers

If you are building a Provider, Runtime, or Metaframework, your implementation must satisfy the types defined here.

See [constitution.md](../../constitution.md) for the full constitution.

## License

Apache-2.0