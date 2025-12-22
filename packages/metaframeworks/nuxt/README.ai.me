# @openhub2/metaframework-nuxt

OpenHub integration for Nuxt. Enables `nuxt dev --remote` against real cloud bindings.

## Installation

```bash
pnpm add @openhub2/metaframework-nuxt
```

Then add a provider:

```bash
pnpm add @openhub2/provider-cloudflare
```

Requires `nuxt` as a peer:

```bash
pnpm add nuxt
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

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENHUB_REMOTE_URL` | In remote mode | Deployed worker URL |
| `OPENHUB_REMOTE_SECRET` | In remote mode | Shared auth secret |

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

## What's Included

This package includes `@openhub2/runtime-nitro` and `@openhub2/dharma` as dependencies. You only need to install a provider separately.

## License

Apache-2.0