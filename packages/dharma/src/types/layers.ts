import type {
  Bindings,
  ProxyHandler,
  ProxyTransport,
  PlatformContext,
  MetaframeworkConfig,
  ConfigSchema,
  CLIContext,
  DevtoolsContext,
} from './subtypes'

export type ProviderDefinition = {
  name: string
  supportedBindings: ('database' | 'kv' | 'blob')[]
}

export type ProviderFactory = {
  createLocalBindings (transport: ProxyTransport): Bindings
  createProxyHandler (bindings: Bindings): ProxyHandler
  extractBindings (platformContext: PlatformContext): Bindings
}

export type Provider = ProviderDefinition & ProviderFactory

export type Runtime = {
  name: string
  registerProvider (provider: Provider): void
  registerProxyEndpoint (handler: ProxyHandler): void
  injectBindings (context: unknown, bindings: Bindings): void
  isRemoteMode (): boolean
}

export type Metaframework = {
  name: string
  configureRuntime (runtime: Runtime, config: MetaframeworkConfig): void
  defineConfig (schema: ConfigSchema): void
  registerCLI?(cli: CLIContext): void
  registerDevtools?(devtools: DevtoolsContext): void
}