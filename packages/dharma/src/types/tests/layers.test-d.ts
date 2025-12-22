import { expectTypeOf } from 'expect-type'
import type { Provider, Runtime } from '../layers'
import type {
  Bindings,
  ProxyHandler,
  ProxyTransport,
  PlatformContext,
} from '../subtypes'

// Provider must produce bindings and proxyHandler
expectTypeOf<Provider['createLocalBindings']>()
  .parameter(0)
  .toEqualTypeOf<ProxyTransport>()

expectTypeOf<Provider['createLocalBindings']>()
  .returns
  .toEqualTypeOf<Bindings>()

expectTypeOf<Provider['createProxyHandler']>()
  .returns
  .toEqualTypeOf<ProxyHandler>()

expectTypeOf<Provider['extractBindings']>()
  .parameter(0)
  .toEqualTypeOf<PlatformContext>()

expectTypeOf<Provider['extractBindings']>()
  .returns
  .toEqualTypeOf<Bindings>()

// Runtime must accept Provider
expectTypeOf<Runtime['registerProvider']>()
  .parameter(0)
  .toEqualTypeOf<Provider>()