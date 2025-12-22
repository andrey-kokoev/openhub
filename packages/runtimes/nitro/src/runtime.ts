import type { Runtime, Provider, ProxyHandler, Bindings } from '../../../dharma/src/types'

export class NitroRuntime implements Runtime {
  name = 'nitro'
  private providers: Provider[] = []
  private proxyHandler?: ProxyHandler

  registerProvider (provider: Provider): void {
    this.providers.push(provider)
  }

  registerProxyEndpoint (handler: ProxyHandler): void {
    this.proxyHandler = handler
  }

  injectBindings (context: any, bindings: Bindings): void {
    if (!context.openhub) {
      context.openhub = {}
    }
    context.openhub.bindings = {
      ...context.openhub.bindings,
      ...bindings
    }
  }

  isRemoteMode (): boolean {
    return process.env.OPENHUB_REMOTE === 'true'
  }

  getProviders (): Provider[] {
    return this.providers
  }

  getProxyHandler (): ProxyHandler | undefined {
    return this.proxyHandler
  }
}

export function createRuntime () {
  return new NitroRuntime()
}
