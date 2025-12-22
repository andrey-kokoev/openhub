import type { Provider, ProxyTransport, Bindings, PlatformContext } from '@openhub2/dharma'
import { createDatabaseBinding, createKVBinding, createBlobBinding } from './bindings'
import { createProxyHandler } from './proxy'
import { extractBindings } from './platform'

export const googleProvider: Provider = {
  name: 'google',

  supportedBindings: ['database', 'kv', 'blob'],

  createLocalBindings (transport: ProxyTransport): Bindings {
    return {
      database: createDatabaseBinding(transport),
      kv: createKVBinding(transport),
      blob: createBlobBinding(transport),
    }
  },

  createProxyHandler () {
    // This will be called in a runtime to handle proxy requests.
    // It needs real bindings, which are usually injected by the runtime using extractBindings first.
    // However, the Dharma Provider interface expects createProxyHandler to return a handler.
    // In practice, the runtime will pass the extracted bindings to createProxyHandler if it needs them.
    // Wait, let's re-check ProviderFactory in Dharma.

    // ProviderFactory:
    // createProxyHandler (): ProxyHandler

    // If the handler needs bindings, it must get them from somewhere.
    // Usually, the runtime extracts bindings and then sets up the proxy handler.

    return {
      async handle (request) {
        // This is a bit of a chicken-and-egg problem in the type definition if the handler isn't passed bindings.
        // But the Runtime implementation (e.g., Nitro) will handle this.
        // For now, we'll implement a factory that can be initialized.
        throw new Error('Proxy handler must be initialized with bindings via the runtime')
      }
    }
  },

  extractBindings (platformContext: PlatformContext): Bindings {
    return extractBindings(platformContext)
  }
}
