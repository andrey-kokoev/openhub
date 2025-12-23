# Example: Cloudflare + Nitro + Nuxt

Full-stack example using OpenHub with Cloudflare bindings (D1, KV, R2).

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

### Local mode (no real bindings)

```bash
pnpm dev
```

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
| `/api/session` | GET | KV | Get/create session |
| `/api/files` | GET | R2 | List uploaded files |
| `/api/files` | POST | R2 | Upload file |

## Project Structure

```
cf-nitro-nuxt/
├── app.vue                 # Root component
├── pages/
│   └── index.vue           # Home page
├── server/
│   └── api/
│       ├── users.ts        # D1 database example
│       ├── session.ts      # KV store example
│       └── files.ts        # R2 blob example
├── nuxt.config.ts          # Nuxt + OpenHub config
├── wrangler.toml           # Cloudflare bindings
└── package.json
```

## How It Works

1. `@openhub2/metaframework-nuxt` registers the OpenHub module with Nuxt
2. Module configures `@openhub2/runtime-nitro` under the hood
3. Runtime registers `@openhub2/provider-cloudflare`
4. In dev mode with `--remote`, bindings proxy to your deployed worker
5. In production, bindings are extracted from Cloudflare's platform context

## License

Apache-2.0