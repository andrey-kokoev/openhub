# @openhub2/metaframework-nuxt

OpenHub integration for Nuxt. Enables `nuxt dev --remote` against real cloud bindings.

## Installation
```bash
pnpm add @openhub2/metaframework-nuxt
```

## Peer Dependencies
```bash
pnpm add @openhub2/dharma @openhub2/runtime-nitro @openhub2/provider-cloudflare
```

## Usage
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@openhub2/metaframework-nuxt'],
  openhub: {
    provider: '@openhub2/provider-cloudflare',
    remote: true, // or 'production' or 'preview'
  }
})
```

## CLI
```bash
# Run dev server with remote bindings
nuxt dev --remote

# Run dev server with specific environment
nuxt dev --remote=production
nuxt dev --remote=preview
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `provider` | `string` | - | Provider package name |
| `remote` | `boolean \| 'production' \| 'preview'` | `false` | Enable remote mode |

## Environment Variables
```bash
OPENHUB_REMOTE_URL=https://your-app.pages.dev
OPENHUB_REMOTE_SECRET=your-shared-secret
```

## How It Works

1. Module registers `@openhub2/runtime-nitro` with Nuxt
2. Runtime registers your chosen provider
3. In remote mode, bindings proxy to deployed worker
4. In production, bindings are extracted from platform context

## Devtools

OpenHub adds a panel to Nuxt Devtools showing:

- Current mode (local / remote / production)
- Connected provider
- Available bindings
- Proxy endpoint status

## License

Apache-2.0