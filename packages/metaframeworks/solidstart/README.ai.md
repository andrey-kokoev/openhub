# @openhub2/metaframework-solidstart

OpenHub integration for SolidStart. Enables `solid-start dev --remote` against real cloud bindings.

## Installation

```bash
pnpm add @openhub2/metaframework-solidstart
```

Then add a provider:

```bash
pnpm add @openhub2/provider-cloudflare
```

Requires `@solidjs/start` as a peer:

```bash
pnpm add @solidjs/start
```

## Usage

```typescript
// app.config.ts
import { defineConfig } from "@solidjs/start/config";
import openhub from "@openhub2/metaframework-solidstart";

export default defineConfig({
  plugins: [
    openhub({
      provider: "@openhub2/provider-cloudflare",
      remote: true, // or 'production' or 'preview'
    }),
  ],
});
```

## CLI

```bash
# Run dev server with remote bindings
solid-start dev --remote

# Run dev server with specific environment
solid-start dev --remote=production
solid-start dev --remote=preview
```

## Configuration

| Option     | Type                                   | Default | Description           |
| ---------- | -------------------------------------- | ------- | --------------------- |
| `provider` | `string`                               | -       | Provider package name |
| `remote`   | `boolean \| 'production' \| 'preview'` | `false` | Enable remote mode    |

## Environment Variables

| Variable                | Required       | Description         |
| ----------------------- | -------------- | ------------------- |
| `OPENHUB_REMOTE_URL`    | In remote mode | Deployed worker URL |
| `OPENHUB_REMOTE_SECRET` | In remote mode | Shared auth secret  |

## How It Works

1. Plugin registers `@openhub2/runtime-nitro` with Vinxi/Nitro
2. Runtime registers your chosen provider
3. In remote mode, bindings proxy to deployed worker
4. In production, bindings are extracted from platform context

## Devtools

OpenHub adds a panel to SolidStart Devtools showing:

- Current mode (local / remote / production)
- Connected provider
- Available bindings
- Proxy endpoint status

## What's Included

This package includes `@openhub2/runtime-nitro` and `@openhub2/types` as dependencies. You only need to install a provider separately.

## License

Apache-2.0
