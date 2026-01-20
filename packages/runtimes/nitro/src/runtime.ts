import type { Runtime, Provider, ProxyHandler, Bindings } from '@openhub2/types'

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
    if (this.remote) {
      return true
    }
    try {
      return typeof process !== 'undefined' && process.env?.OPENHUB_REMOTE === 'true'
    } catch {
      return false
    }
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
