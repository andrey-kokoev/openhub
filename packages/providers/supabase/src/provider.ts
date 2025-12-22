import type { Provider, ProxyTransport, Bindings, PlatformContext } from '@openhub2/dharma'
import { createDatabaseBinding, createKVBinding, createBlobBinding } from './bindings'
import { createProxyHandler } from './proxy'
import { extractBindings } from './platform'

export const supabaseProvider: Provider = {
  name: 'supabase',

  supportedBindings: ['database', 'kv', 'blob'],

  createLocalBindings (transport: ProxyTransport): Bindings {
    return {
      database: createDatabaseBinding(transport),
      kv: createKVBinding(transport),
      blob: createBlobBinding(transport),
    }
  },

  createProxyHandler () {
    return {
      async handle (request) {
        throw new Error('Proxy handler must be initialized with bindings via the runtime')
      }
    }
  },

  extractBindings (platformContext: PlatformContext): Bindings {
    return extractBindings(platformContext)
  }
}
