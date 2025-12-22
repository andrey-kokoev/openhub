import type { ProxyHandler } from '@openhub2/dharma'

export function createProxyHandler (): ProxyHandler {
  return {
    async handle (request) {
      throw new Error('Proxy handler must be initialized with bindings via the runtime')
    }
  }
}
