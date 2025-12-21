import type { Provider } from './layers'
import type {
  Bindings,
  ProxyHandler,
  ProxyRequest,
  PlatformContext,
  MetaframeworkConfig,
  RemoteConfig,
} from './subtypes'

export type ProviderToRuntimeBoundary = {
  bindings: Bindings
  proxyHandler: ProxyHandler
}

export type RuntimeToProviderBoundary = {
  platformContext: PlatformContext
  proxyRequest: ProxyRequest
}

export type RuntimeToMetaframeworkBoundary = {
  ready: boolean
  bindings: Bindings
  remoteMode: boolean
}

export type MetaframeworkToRuntimeBoundary = {
  config: MetaframeworkConfig
  provider: Provider
  remoteConfig?: RemoteConfig
}