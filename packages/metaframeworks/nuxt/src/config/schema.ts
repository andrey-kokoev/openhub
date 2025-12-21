import type { ConfigSchema } from '@openhub/dharma'

export const schema: ConfigSchema = {
  properties: {
    provider: {
      type: 'string',
      description: 'Provider package name (e.g. @openhub/provider-cloudflare)'
    },
    remote: {
      type: 'boolean',
      default: false,
      description: 'Enable remote mode for bindings'
    }
  }
}
