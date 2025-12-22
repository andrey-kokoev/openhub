# @openhub2/provider-supabase

OpenHub provider for Supabase bindings.

## Supported Bindings

| Binding | Supabase Service |
|---------|------------------|
| `database` | Postgres |
| `kv` | Redis (via Upstash) |
| `blob` | Storage |

## Usage

```typescript
import { supabaseProvider } from '@openhub2/provider-supabase'

// Provider is automatically detected when using OpenHub
```

## Configuration

Set these environment variables:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-or-service-role-key
SUPABASE_DB_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres
```

## License

Apache-2.0
