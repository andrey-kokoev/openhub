import type { Runtime, Provider, ProxyHandler, Bindings } from '@openhub2/dharma'

export class NitroRuntime implements Runtime {
  name = 'nitro'
  private providers: Provider[] = []
  private proxyHandler?: ProxyHandler
  private remote = false

  setRemoteMode (remote: boolean): void {
    this.remote = remote
  }

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
    return this.remote || process.env.OPENHUB_REMOTE === 'true'
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
