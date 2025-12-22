# OpenHub - Copilot Instructions

## Project Overview

OpenHub is a universal cloud bindings system for TypeScript runtimes that enables developers to run local development against real cloud data. The project follows a strict three-layer architecture defined by the Dharma type system.

## Architecture

The system is built on three layers that must remain independent:

1. **Provider Layer** - Adapts cloud platform primitives (Cloudflare, AWS, Supabase, etc.) to universal bindings
2. **Runtime Layer** - Executes application code and manages bindings (Nitro, Hono, H3)
3. **Metaframework Layer** - Provides developer experience (Nuxt, Analog)

### Key Principle: Layer Independence

**CRITICAL**: Layers must remain decoupled:
- Providers SHALL NOT depend on any specific Runtime or Metaframework
- Runtimes SHALL NOT depend on any specific Metaframework or Provider
- Metaframeworks SHALL NOT bypass Runtime to access Provider directly

Any implementation that violates these constraints is invalid per the Constitution (see `constitution.md`).

## Dharma Type System

`@openhub2/dharma` is the supreme type contract that all layers must satisfy. It defines:

- Layer interfaces: `Provider`, `Runtime`, `Metaframework`
- Universal bindings: `DatabaseBinding`, `KVBinding`, `BlobBinding`
- Boundary contracts: `ProxyRequest`, `ProxyResponse`

**Never modify Dharma types without going through the amendment process defined in the Constitution.**

## Project Structure

```
openhub/
├── packages/
│   ├── dharma/              # Type definitions (THE source of truth)
│   ├── providers/           # Cloud platform adapters
│   │   ├── cloudflare/
│   │   ├── aws/
│   │   ├── supabase/
│   │   ├── azure/
│   │   └── google/
│   ├── runtimes/            # Runtime integrations
│   │   ├── nitro/
│   │   ├── hono/
│   │   └── h3/
│   └── metaframeworks/      # Framework integrations
│       ├── nuxt/
│       └── analog/
├── examples/                # Usage examples
├── constitution.md          # Governance and design principles
└── README.md               # User-facing documentation
```

## Development Commands

```bash
# Build all packages
pnpm build

# Run tests across all packages
pnpm test

# Type check all packages
pnpm typecheck

# Format code
pnpm format

# Lint code
pnpm lint

# Clean build artifacts
pnpm clean
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Prefer type imports: `import type { ... }`
- No `any` types - use `unknown` and type guards if needed
- Export types from Dharma, not from individual packages

### Package Dependencies

- Packages at the same layer should NOT depend on each other
- All layer implementations MUST depend on `@openhub2/dharma`
- Use peer dependencies for cross-layer references when needed
- Keep provider/runtime/metaframework packages independent

### Naming Conventions

- Package names: `@openhub2/<layer>-<name>` (e.g., `@openhub2/provider-cloudflare`)
- Export constants use camelCase with suffix: `cloudflareProvider`, `nitroRuntime`, `nuxtMetaframework`
- Binding types are PascalCase: `DatabaseBinding`, `KVBinding`, `BlobBinding`

### File Organization

- Each package must have: `package.json`, `tsconfig.json`, `README.md`, `src/index.ts`
- Type definitions go in `src/types/` when they're package-specific
- Tests should be co-located with implementation: `*.test.ts` or `*.spec.ts`

## Testing Practices

- Write tests that verify conformance to Dharma types
- Test layer boundaries - ensure no direct coupling
- Mock external dependencies (cloud APIs, platform contexts)
- Integration tests go in examples or separate test packages

## Common Patterns

### Implementing a Provider

```typescript
import type { Provider } from '@openhub2/dharma'

export const myProvider: Provider = {
  name: 'my-provider',
  supportedBindings: ['database', 'kv', 'blob'],
  createLocalBindings(transport) {
    // Return proxy clients that forward to transport
  },
  createProxyHandler() {
    // Return handler for /__openhub2/proxy endpoint
  },
  extractBindings(platformContext) {
    // Extract real bindings from platform's context
  },
}
```

### Implementing a Runtime

```typescript
import type { Runtime } from '@openhub2/dharma'

export const myRuntime: Runtime = {
  name: 'my-runtime',
  registerProvider(provider) {
    // Store provider reference
  },
  registerProxyEndpoint(handler) {
    // Mount handler at /__openhub2/proxy
  },
  injectBindings(context, bindings) {
    // Add bindings to request context at context.openhub.bindings
  },
  isRemoteMode() {
    // Check env/config for remote mode flag
  },
}
```

### Implementing a Metaframework

```typescript
import type { Metaframework } from '@openhub2/dharma'

export const myMetaframework: Metaframework = {
  name: 'my-metaframework',
  configureRuntime(runtime, config) {
    // Pass user config to runtime
  },
  defineConfig(schema) {
    // Extend framework config with openhub options
  },
  registerCLI(cli) {
    // Add --remote flag to dev command
  },
  registerDevtools(devtools) {
    // Add OpenHub panel to devtools UI
  },
}
```

## Operating Modes

OpenHub supports three operating modes:

1. **local** - Uses local emulators (offline dev)
2. **remote** - Proxies to deployed worker (dev with real data)
3. **production** - Direct platform context injection (deployed app)

## Proxy Protocol

Remote mode uses a proxy protocol for communication between local dev and deployed workers:

- Endpoint: `/__openhub2/proxy`
- Authentication: `x-openhub-secret` header
- Request format: `{ binding, method, args }`
- Response format: `{ success, data }`

## Environment Variables

- `OPENHUB_REMOTE` - Enable remote mode (true/false)
- `OPENHUB_REMOTE_URL` - Deployed worker URL (required in remote mode)
- `OPENHUB_REMOTE_SECRET` - Shared auth secret (required in remote mode)

## Documentation Guidelines

- Update README.md files when adding new features
- Document all public APIs with JSDoc comments
- Keep constitution.md in sync with architectural changes
- Examples should be complete and runnable

## Common Gotchas

1. **Layer Violations**: Never import a Provider directly into a Runtime, or a Runtime directly into a Metaframework. Always use Dharma types and runtime registration.

2. **Type Mutations**: Don't extend or modify Dharma types in implementation packages. If you need additional types, create them separately and compose.

3. **Platform Lock-in**: Avoid platform-specific APIs in shared code. Keep platform specifics inside Provider implementations.

4. **Breaking Changes**: Any change to Dharma types requires major version bump and six-month deprecation notice per the Constitution.

5. **Binding Names**: Stick to the universal binding set: `database`, `kv`, `blob`. Platform-specific bindings belong in provider docs, not the type system.

## Adding New Components

### New Provider

1. Create `packages/providers/<name>/`
2. Implement `Provider` interface from Dharma
3. Add to providers README table
4. Ensure no dependencies on specific runtimes or metaframeworks

### New Runtime

1. Create `packages/runtimes/<name>/`
2. Implement `Runtime` interface from Dharma
3. Add to runtimes README table
4. Ensure no dependencies on specific metaframeworks

### New Metaframework

1. Create `packages/metaframeworks/<name>/`
2. Implement `Metaframework` interface from Dharma
3. Add to metaframeworks README table
4. Ensure it works with any conforming runtime

## Security Considerations

- Never commit secrets or API keys
- Validate proxy requests with shared secret
- Sanitize user input in proxy handlers
- Use environment variables for sensitive configuration

## Build System

- Uses pnpm workspaces for monorepo management
- TypeScript with strict mode enabled
- ESLint for linting, Prettier for formatting
- Each package builds independently to `dist/`

## References

- See `constitution.md` for governance and architectural principles
- See `README.md` for user-facing documentation
- See `packages/dharma/README.md` for type system details
- Each package has its own README with specific usage instructions
