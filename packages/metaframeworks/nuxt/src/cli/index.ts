import type { CLIContext } from '@openhub2/types'
import { remoteFlagOptions, parseRemoteFlag } from './remote'

/**
 * Register CLI flags for Nuxt commands
 * Conforms to Article IV Section 2 of the Constitution:
 * Metaframeworks may extend CLI with flags and commands
 */
export function registerRemoteFlag (cli: CLIContext): void {
  cli.registerFlag('remote', remoteFlagOptions)
}

// Re-export parseRemoteFlag for testing and external use
export { parseRemoteFlag }

