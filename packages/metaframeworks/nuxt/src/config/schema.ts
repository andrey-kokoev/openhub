import type { ConfigSchema } from '../../../../dharma/src/types'

export const schema: ConfigSchema = {
  properties: {
    provider: {
      type: 'string',
      description: 'Provider package name (e.g. @openhub2/provider-cloudflare)'
    },
    remote: {
      type: 'boolean',
      default: false,
      description: 'Enable remote mode for bindings'
    }
  }
}
