# Example: Cloudflare + Hono + Vite
Full-stack example using OpenHub with Cloudflare bindings (D1, KV, R2).

## Understanding context
If you're reading me, you probably want to read the sequence:
1. [openhub monorepo README](../../README.md)
2. [openhub runtime hono README](../../runtimes/hono/README.ai.md)
3. [openhub provider cloudflare README](../../providers/cloudflare/README.ai.md)
Then come back to me for the full example details.

## Architecture

This example demonstrates a clean separation between:
- **Vite**: Frontend build tool serving static HTML/TS/CSS
- **Hono**: Backend runtime handling API routes and server logic
- **OpenHub**: Binding layer connecting to Cloudflare (D1, KV, R2)

Unlike `cf-nitro-nuxt` and `cf-nitro-vite`, this example uses Hono as the backend runtime instead of Nitro, providing a minimal setup for understanding how OpenHub works with different runtimes.

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

### Local mode (with Wrangler dev)

```bash
pnpm dev
```

This starts both:
- Vite dev server on `http://localhost:5173` (frontend)
- Wrangler dev server on `http://localhost:8787` (Hono API)

Vite proxies `/api` requests to Wrangler/Hono.

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
cf-hono-vite/
├── client/
│   ├── index.html          # Frontend HTML
│   └── main.ts             # Frontend TypeScript
├── server/
│   ├── index.ts            # Hono app entry point
│   └── api/
│       ├── users.ts        # D1 database example
│       ├── sessions.ts     # KV store example
│       └── files.ts        # R2 blob example
├── vite.config.ts          # Vite configuration
├── wrangler.toml           # Cloudflare bindings + Wrangler config
└── package.json
```

## How It Works

1. Hono `createRuntime()` is called in `server/index.ts`
2. Runtime registers `@openhub2/provider-cloudflare`
3. Middleware injects bindings into Hono context using `openhubMiddleware`
4. In dev mode with `OPENHUB_REMOTE=true`, bindings proxy to your deployed worker
5. In production, bindings are extracted from Cloudflare's platform context
6. Vite serves the frontend and proxies API requests to Hono
7. API routes use `getBindings(c)` to access OpenHub bindings from Hono context

## Differences from cf-nitro-vite

- **Hono instead of Nitro**: Uses Hono web framework with Wrangler dev server
- **Wrangler dev**: Runs Hono with `wrangler dev` instead of Nitro's dev server
- **Middleware pattern**: Uses Hono middleware for binding injection
- **Context access**: Bindings accessed via `getBindings(c)` or `c.get('openhub').bindings`
- **Direct deployment**: Deploys Hono app directly to Cloudflare Workers

## Key Hono Patterns

### Accessing Bindings

```typescript
import { getBindings } from '@openhub2/runtime-hono'

app.get('/users', async (c) => {
  const { database, kv, blob } = getBindings(c)
  // Use bindings...
})
```

### Route Modules

```typescript
import { Hono } from 'hono'
import { getBindings } from '@openhub2/runtime-hono'

const users = new Hono()

users.get('/', async (c) => {
  const { database } = getBindings(c)
  // Handle request...
})

export default users
```

### Middleware Integration

```typescript
import { openhubMiddleware } from '@openhub2/runtime-hono'

app.use('*', openhubMiddleware(bindings))
```

## Testing

### Unit Tests

```bash
pnpm test:unit
```

### E2E Tests

```bash
pnpm test:e2e
```

## License

Apache-2.0
