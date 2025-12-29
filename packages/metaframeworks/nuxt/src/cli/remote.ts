import type { FlagOptions } from '@openhub2/types'

/**
 * --remote flag for `nuxt dev`
 * 
 * Article IV Section 2: "A Metaframework may extend CLI with flags and commands"
 * 
 * Enables remote mode to proxy bindings to a deployed worker instead of
 * using local platform bindings. This allows developers to:
 * - Test against production-like data without local platform setup
 * - Share a development environment with real cloud bindings
 * - Debug issues that only occur with real cloud infrastructure
 * 
 * Usage:
 * ```bash
 * nuxt dev --remote              # Use default remote config
 * nuxt dev --remote=production   # Use production bindings
 * nuxt dev --remote=preview      # Use preview bindings
 * ```
 * 
 * Requires environment variables:
 * - OPENHUB_REMOTE_URL: URL of deployed worker
 * - OPENHUB_REMOTE_SECRET: Shared authentication secret
 */
export const remoteFlagOptions: FlagOptions = {
  type: 'string',
  description: 'Connect to remote bindings (true, production, or preview)',
  default: undefined,
}

/**
 * Process --remote flag value
 * 
 * Handles various flag formats:
 * - `--remote` → true (default remote mode)
 * - `--remote=true` → true
 * - `--remote=production` → 'production'
 * - `--remote=preview` → 'preview'
 * - `--remote=false` → false
 * - (no flag) → false
 * 
 * @param value - Raw flag value from CLI
 * @returns Normalized remote mode configuration
 */
export function parseRemoteFlag (value: string | boolean | undefined): boolean | 'production' | 'preview' {
  if (value === undefined || value === false || value === 'false') {
    return false
  }
  if (value === true || value === 'true') {
    return true
  }
  if (value === 'production' || value === 'preview') {
    return value
  }
  // Default to true for any other truthy value
  return true
}

