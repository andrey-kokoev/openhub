# Publishing OpenHub Packages

This monorepo uses `pnpm` workspaces and custom scripts to publish packages to npmjs.org.

## Prerequisites

1. **npm authentication** - You must be logged in to npm with an account that has publish access to `@openhub2/*` packages:
   ```bash
   npm login
   ```

2. **All packages have `publishConfig`** - Each package.json includes:
   ```json
   "publishConfig": {
     "access": "public"
   }
   ```

## Publishing Scripts

### 1. Check Published Status

See which packages need publishing:

```bash
# Check which packages are behind npm
node scripts/check-published.mjs
```

Output legend:
- `OK` - Local version matches npm latest
- `DIFF` - Local version differs from npm (needs publishing)
- `TAG` - Local version is published but not on latest tag
- `MISS` - Package not found on npm (first publish)
- `SKIP` - Private package (not published)

### 2. Publish Behind Packages

Publish only packages whose local version is ahead of npm:

```bash
# Dry run (see what would be published)
DRY=1 PUBLISH=1 node scripts/publish-behind.mjs

# Actually publish
PUBLISH=1 node scripts/publish-behind.mjs
```

This script:
1. Compares local versions to npm latest
2. Topologically sorts packages (dependencies first)
3. Publishes only packages that are "behind" npm or missing

## Manual Publishing

If you need to publish a specific package:

```bash
cd packages/<package-name>
npm publish --access public
```

## Full Release Workflow

```bash
# 1. Run tests
pnpm test

# 2. Build all packages
pnpm build

# 3. Check what needs publishing
node scripts/check-published.mjs

# 4. Dry run publish
DRY=1 PUBLISH=1 node scripts/publish-behind.mjs

# 5. Actually publish
PUBLISH=1 node scripts/publish-behind.mjs

# 6. Verify
node scripts/check-published.mjs
```

## Version Bumping

Before publishing, bump versions in package.json files:

```bash
# Example: bump dharma package
# Edit packages/dharma/package.json version field
# Then update dependent packages' dependencies
```

Remember: The publish script compares versions, so you must manually update version numbers in package.json files.

## Troubleshooting

### "No access" errors
- Ensure you're logged in: `npm login`
- Verify you have publish rights to `@openhub2` scope

### "Cannot find package" errors
- The package may not exist yet (first publish) - this is handled automatically

### Workspace dependencies
- All `workspace:*` dependencies are resolved to actual versions during publish by pnpm
- The topological sort ensures dependencies are published before dependents
