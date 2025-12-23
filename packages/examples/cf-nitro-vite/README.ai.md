# Example: Cloudflare + Nitro + Vite
Full-stack example using OpenHub with Cloudflare bindings (D1, KV, R2).

## Understanding context
If you're reading me, you probably want to read the sequence:
1. [openhub monorepo README](../../README.md)
2. [openhub runtime nitro README](../../runtime/nitro/README.md)
3. [openhub provider cloudflare README](../../provider/cloudflare/README.md)
Then come back to me for the full example details.

## Architecture

This example demonstrates a clean separation between:
- **Vite**: Frontend build tool serving static HTML/TS/CSS
- **Nitro**: Backend runtime handling API routes and server logic
- **OpenHub**: Binding layer connecting to Cloudflare (D1, KV, R2)

Unlike `cf-nitro-nuxt`, this example uses Nitro standalone (without the Nuxt metaframework layer), providing a minimal setup for understanding how OpenHub works at the runtime level.

## Prerequisites

1. Cloudflare account with:
   - D1 database created
   - KV namespace created
   - R2 bucket created

2. Update `wrangler.toml` with your binding IDs

## Setup

```bash
# From monorepo root
pnpm install

# Or from this directory
pnpm install

# Set up the D1 database schema (if using remote mode)
wrangler d1 execute openhub-examples-test-fixture --remote --file=./migrations/0001_create_users.sql
```

## Development

### Local mode (no real bindings)

```bash
pnpm dev
```

This starts both:
- Vite dev server on `http://localhost:5173` (frontend)
- Nitro dev server on `http://localhost:3000` (API)

Vite proxies `/api` requests to Nitro.

### Remote mode (real Cloudflare bindings)

1. Deploy to Cloudflare Workers first:
   ```bash
   pnpm build
   pnpm deploy
   ```

2. Set environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your deployed URL and secret
   ```

3. Run with remote bindings:
   ```bash
   pnpm dev:remote
   ```

## API Endpoints

| Endpoint | Method | Binding | Description |
|----------|--------|---------|-------------|
| `/api/users` | GET | D1 | List users from database |
| `/api/users` | POST | D1 | Create a new user |
| `/api/sessions` | GET | KV | Get/create session |
| `/api/files` | GET | R2 | List uploaded files |
| `/api/files` | POST | R2 | Upload file |

## Project Structure

```
cf-nitro-vite/
├── client/
│   ├── index.html          # Frontend HTML
│   └── main.ts             # Frontend TypeScript
├── server/
│   └── api/
│       ├── users.ts        # D1 database example
│       ├── sessions.ts     # KV store example
│       └── files.ts        # R2 blob example
├── vite.config.ts          # Vite configuration
├── nitro.config.js         # Nitro + OpenHub config
├── wrangler.toml           # Cloudflare bindings
└── package.json
```

## How It Works

1. Nitro's `openhubModule` is registered in `nitro.config.js`
2. Module registers `@openhub2/provider-cloudflare`
3. In dev mode with `OPENHUB_REMOTE=true`, bindings proxy to your deployed worker
4. In production, bindings are extracted from Cloudflare's platform context
5. Vite serves the frontend and proxies API requests to Nitro

## Differences from cf-nitro-nuxt

- **No Nuxt**: Direct Nitro usage without metaframework abstraction
- **Separate frontend**: Vite handles frontend build independently
- **Explicit configuration**: OpenHub configured directly in `nitro.config.js`
- **Simpler**: Easier to understand the runtime-provider relationship

## License

Apache-2.0