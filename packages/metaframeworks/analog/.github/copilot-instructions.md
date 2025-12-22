# @openhub2/metaframework-analog

OpenHub integration for Analog. Enables Analog applications to use real cloud bindings in development.

## Installation

```bash
pnpm add @openhub2/metaframework-analog
```

Then add a provider:

```bash
pnpm add @openhub2/provider-cloudflare
```

Requires `@analogjs/platform` as a peer:

```bash
pnpm add @analogjs/platform
```

## Usage

Add the OpenHub plugin to your Vite configuration:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import analog from '@analogjs/platform'
import { openhubPlugin } from '@openhub2/metaframework-analog'

export default defineConfig({
  plugins: [
    analog(),
    openhubPlugin({
      provider: '@openhub2/provider-cloudflare',
      remote: true, // or 'production' or 'preview'
    })
  ]
})
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `provider` | `string` | - | Provider package name |
| `remote` | `boolean \| 'production' \| 'preview'` | `false` | Enable remote mode |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENHUB_REMOTE_URL` | In remote mode | Deployed worker URL |
| `OPENHUB_REMOTE_SECRET` | In remote mode | Shared auth secret |

## How It Works

1. Plugin registers `@openhub2/runtime-nitro` with Analog's Nitro server
2. Runtime registers your chosen provider
3. In remote mode, bindings proxy to deployed worker
4. In production, bindings are extracted from platform context

## Using Bindings in Your Code

```typescript
// src/server/routes/api/users.ts
import { eventHandler } from 'h3'

export default eventHandler(async (event) => {
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

## Devtools

OpenHub adds a devtools panel accessible at `/__openhub2/devtools` showing:

- Current mode (local / remote / production)
- Connected provider
- Available bindings
- Proxy endpoint status

## What's Included

This package includes `@openhub2/runtime-nitro` and `@openhub2/dharma` as dependencies. You only need to install a provider separately.

## License

Apache-2.0
