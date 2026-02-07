import type { Runtime, Provider, ProxyHandler, Bindings } from '@openhub2/types'

export class HonoRuntime implements Runtime {
  name = 'hono'
  private providers: Provider[] = []
  private proxyHandler?: ProxyHandler
  private remoteModeOverride: boolean | undefined

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

  setRemoteMode (isRemote: boolean): void {
    this.remoteModeOverride = isRemote
  }

  isRemoteMode (): boolean {
    if (this.remoteModeOverride !== undefined) {
      return this.remoteModeOverride
    }
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
  return new HonoRuntime()
}
