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

  createProxyHandler (bindings: Bindings) {
    return createProxyHandler(bindings)
  },

  extractBindings (platformContext: PlatformContext): Bindings {
    return extractBindings(platformContext)
  }
}
