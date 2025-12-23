# Example: Cloudflare + Hono + Vite

Full-stack example using OpenHub with Cloudflare bindings (D1, KV, R2).

## Architecture

This example demonstrates a clean separation between:
- **Vite**: Frontend build tool serving static HTML/TS/CSS
- **Hono**: Backend runtime handling API routes and server logic
- **OpenHub**: Binding layer connecting to Cloudflare (D1, KV, R2)

Unlike `cf-nitro-vite`, this example uses Hono as the backend runtime instead of Nitro.

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
```

## Development

### Local mode (with Wrangler dev)

```bash
pnpm dev
```

This starts both Vite (port 5173) and Wrangler dev (port 8787).

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

## License

Apache-2.0
