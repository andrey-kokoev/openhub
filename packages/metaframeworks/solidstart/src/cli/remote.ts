import type { CLIContext } from '@openhub2/dharma'

export function registerRemoteFlag (cli: CLIContext) {
  cli.registerFlag('remote', {
    type: 'string',
    description: 'Enable remote mode for OpenHub bindings (true, false, production, preview)',
    default: 'false'
  })
}
