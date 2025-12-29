import { expectTypeOf } from 'expect-type'
import type {
  ProviderToRuntimeBoundary,
  RuntimeToProviderBoundary,
} from '../boundaries'
import type { ProxyRequest } from '../subtypes'

// P→R and R→P meet at R: ProxyHandler consumes ProxyRequest
expectTypeOf<ProviderToRuntimeBoundary['proxyHandler']['handle']>()
  .parameter(0)
  .toEqualTypeOf<ProxyRequest>()

expectTypeOf<RuntimeToProviderBoundary['proxyRequest']>()
  .toEqualTypeOf<ProxyRequest>()