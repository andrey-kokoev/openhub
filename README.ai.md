# OpenHub

Universal cloud bindings for TypeScript runtimes. Run local dev against real cloud data.

## What OpenHub Does

OpenHub lets you run `nuxt dev --remote` (or any supported metaframework) and have your local code talk to real cloud databases, KV stores, and blob storage. No local emulators. No mocking. Real data, hot reload.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      METAFRAMEWORK                          │
│         (Nuxt, Analog, SolidStart)                          │
│         Config, CLI flags, Devtools                         │
└─────────────────────────┬───────────────────────────────────┘
                          │ configures
┌─────────────────────────▼───────────────────────────────────┐
│                        RUNTIME                              │
│         (Nitro, Hono, H3)                                   │
│         Request context, Proxy endpoint, Binding injection  │
└─────────────────────────┬───────────────────────────────────┘
                          │ registers
┌─────────────────────────▼───────────────────────────────────┐
│                        PROVIDER                             │
│         (Cloudflare, Supabase, AWS)                         │
│         Platform adapters, Proxy clients, Real bindings     │
└─────────────────────────────────────────────────────────────┘
```

## Core Concepts

### Type System

`@openhub2/types` is the type contract all layers must satisfy. It defines:

- **Layers**: `Provider`, `Runtime`, `Metaframework`
- **Bindings**: `DatabaseBinding`, `KVBinding`, `BlobBinding`
- **Boundaries**: What can cross between layers

### Universal Bindings

| Binding | Purpose | Cloudflare | Supabase | AWS |
|---------|---------|------------|----------|-----|
| `database` | SQL queries | D1 | Postgres | RDS |
| `kv` | Key-value store | Workers KV | Redis | DynamoDB |
| `blob` | File storage | R2 | Storage | S3 |

### Operating Modes

| Mode | Bindings Source | Use Case |
|------|-----------------|----------|
| `local` | Local emulators | Offline dev |
| `remote` | Proxy to deployed worker | Dev with real data |
| `production` | Platform context injection | Deployed app |

## Packages

```
packages/
├── types/                    # Type definitions (the law)
├── providers/
│   └── cloudflare/            # Cloudflare D1/KV/R2 adapter
├── runtimes/
│   └── nitro/                 # Nitro runtime integration
└── metaframeworks/
    └── nuxt/                  # Nuxt module + CLI
```

### Package Dependencies

```
@openhub2/metaframework-nuxt
├── @openhub2/types
└── @openhub2/runtime-nitro
        └── @openhub2/types

@openhub2/provider-cloudflare  (user installs separately)
└── @openhub2/types
```

Metaframeworks and runtimes don't depend on providers. Users choose and install their provider.

## Examples

| Example | Description |
|---------|-------------|
| [cf-nitro-nuxt](./examples/cf-nitro-nuxt/) | Nuxt + Nitro + Cloudflare (D1, KV, R2) |
| [cf-nitro-vite](./examples/cf-nitro-vite/) | Vite + Nitro + Cloudflare (D1, KV, R2) - Standalone |

## Quick Start

```bash
# Install
pnpm add @openhub2/metaframework-nuxt @openhub2/provider-cloudflare

# Configure
# nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@openhub2/metaframework-nuxt'],
  openhub: {
    provider: '@openhub2/provider-cloudflare',
    remote: true,
  }
})

# Set environment
OPENHUB_REMOTE_URL=https://your-app.pages.dev
OPENHUB_REMOTE_SECRET=your-shared-secret

# Run
nuxt dev --remote
```

## Remote Mode Flow

```
Local Dev Server                         Deployed Worker
┌──────────────────┐                    ┌──────────────────┐
│  Your Code       │                    │  /__openhub2/    │
│       │          │   HTTP POST        │     proxy        │
│       ▼          │ ─────────────────► │       │          │
│  Proxy Client    │  x-openhub-secret  │       ▼          │
│                  │ ◄───────────────── │  Real Bindings   │
│                  │   ProxyResponse    │  (D1, KV, R2)    │
└──────────────────┘                    └──────────────────┘
```

## API Surface

### In Application Code

```typescript
// server/api/users.ts
export default defineEventHandler((event) => {
  const { database, kv, blob } = event.context.openhub.bindings
  
  // SQL
  const users = await database.prepare('SELECT * FROM users').all()
  
  // KV
  const session = await kv.get('session:123')
  
  // Blob
  const avatar = await blob.get('avatars/user-1.png')
  
  return users
})
```

### Provider Implementation

```typescript
import type { Provider } from '@openhub2/types'

export const cloudflareProvider: Provider = {
  name: 'cloudflare',
  supportedBindings: ['database', 'kv', 'blob'],
  
  createLocalBindings(transport) {
    // Return proxy clients that forward to transport
  },
  
  createProxyHandler() {
    // Return handler for /__openhub2/proxy endpoint
  },
  
  extractBindings(platformContext) {
    // Extract real bindings from Cloudflare's env
  },
}
```

### Runtime Implementation

```typescript
import type { Runtime } from '@openhub2/types'

export const nitroRuntime: Runtime = {
  name: 'nitro',
  
  registerProvider(provider) {
    // Store provider reference
  },
  
  registerProxyEndpoint(handler) {
    // Mount handler at /__openhub2/proxy
  },
  
  injectBindings(context, bindings) {
    // Add bindings to request context
  },
  
  isRemoteMode() {
    // Check env/config for remote mode
  },
}
```

### Metaframework Implementation

```typescript
import type { Metaframework } from '@openhub2/types'

export const nuxtMetaframework: Metaframework = {
  name: 'nuxt',
  
  configureRuntime(runtime, config) {
    // Pass user config to runtime
  },
  
  defineConfig(schema) {
    // Extend framework config schema with openhub options
  },
  
  registerCLI(cli) {
    // Add --remote flag to dev command
  },
  
  registerDevtools(devtools) {
    // Add OpenHub panel to devtools
  },
}
```

## Proxy Protocol

### Request

```http
POST /__openhub2/proxy
Content-Type: application/json
x-openhub-secret: <shared-secret>

{
  "binding": "database",
  "method": "prepare",
  "args": ["SELECT * FROM users WHERE id = ?", [1]]
}
```

### Response

```json
{
  "success": true,
  "data": {
    "results": [{"id": 1, "name": "Alice"}],
    "meta": {"duration": 1.5}
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENHUB_REMOTE` | No | Enable remote mode (`true`/`false`) |
| `OPENHUB_REMOTE_URL` | In remote mode | Deployed worker URL |
| `OPENHUB_REMOTE_SECRET` | In remote mode | Shared auth secret |

## Constraints (from Constitution)

### Providers SHALL NOT
- Depend on any specific Runtime
- Depend on any specific Metaframework
- Define bindings outside the type system's universal set

### Runtimes SHALL NOT
- Depend on any specific Metaframework
- Depend on any specific Provider
- Modify the type system's type contracts

### Metaframeworks SHALL NOT
- Bypass Runtime to access Provider directly
- Modify the type system's type contracts
- Require a specific Provider

## Substitutability Guarantee

Any Provider conforming to the type system works with any conforming Runtime.
Any Runtime conforming to the type system works with any conforming Metaframework.

```
Provider: Cloudflare ─┐
Provider: Supabase ───┼──► Runtime: Nitro ───┬──► Metaframework: Nuxt
Provider: AWS ────────┘    Runtime: Hono ────┤    Metaframework: Analog
                           Runtime: H3 ──────┘    Metaframework: SolidStart
```

## File Structure Reference

```
openhub/
├── README.md                 # This file
├── constitution.md           # Governance and design principles
├── tsconfig.json             # Root TypeScript config
├── packages/
│   ├── types/
│   │   ├── src/
│   │   │   ├── index.ts      # Main exports
│   │   │   ├── types/
│   │   │   │   ├── layers.ts     # Provider, Runtime, Metaframework types
│   │   │   │   ├── boundaries.ts # Cross-layer contracts
│   │   │   │   └── subtypes/
│   │   │   │       └── index.ts  # Bindings, ProxyHandler, etc.
│   │   │   └── index.ts
│   │   └── package.json
│   ├── providers/
│   │   ├── README.md
│   │   └── cloudflare/
│   │       ├── src/index.ts
│   │       └── package.json
│   ├── runtimes/
│   │   ├── README.md
│   │   └── nitro/
│   │       ├── src/index.ts
│   │       └── package.json
│   └── metaframeworks/
│       ├── README.md
│       └── nuxt/
│           ├── src/index.ts
│           └── package.json
├── examples/
│   └── cf-nitro-nuxt/        # Full-stack Cloudflare example
│       ├── server/api/       # API routes using bindings
│       ├── pages/            # Vue pages
│       ├── nuxt.config.ts
│       └── wrangler.toml
└── pnpm-workspace.yaml
```

## Adding a New Provider

1. Create `packages/providers/<name>/`
2. Implement `Provider` from `@openhub2/types`
3. Export provider instance
4. Add to providers README table

## Adding a New Runtime

1. Create `packages/runtimes/<name>/`
2. Implement `Runtime` from `@openhub2/types`
3. Export runtime factory
4. Add to runtimes README table

## Adding a New Metaframework

1. Create `packages/metaframeworks/<name>/`
2. Implement `Metaframework` from `@openhub2/types`
3. Export module/plugin
4. Add to metaframeworks README table

## License

Apache-2.0

## See Also

- [constitution.md](./constitution.md) — Governance, amendment process, Bill of Rights
- [packages/types](./packages/types/) — Type definitions
- [packages/providers](./packages/providers/) — Cloud platform adapters
- [packages/runtimes](./packages/runtimes/) — Runtime integrations
- [packages/metaframeworks](./packages/metaframeworks/) — Framework integrations