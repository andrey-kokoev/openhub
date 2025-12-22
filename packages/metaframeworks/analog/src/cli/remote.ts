import type { CLIContext } from '@openhub2/dharma'

export function registerRemoteFlag (cli: CLIContext) {
  cli.registerFlag('remote', {
    type: 'boolean',
    description: 'Enable remote mode for OpenHub bindings',
    default: false
  })
}
