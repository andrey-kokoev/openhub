import { expectTypeOf } from 'expect-type'
import type { Provider } from '../layers'
import type {
  ProviderToRuntimeBoundary,
  RuntimeToMetaframeworkBoundary,
  MetaframeworkToRuntimeBoundary,
} from '../boundaries'
import type { Bindings } from '../subtypes'

// P→R→M: bindings flow through
expectTypeOf<ProviderToRuntimeBoundary>().toHaveProperty('bindings')
expectTypeOf<RuntimeToMetaframeworkBoundary>().toHaveProperty('bindings')
expectTypeOf<ProviderToRuntimeBoundary['bindings']>().toEqualTypeOf<Bindings>()
expectTypeOf<RuntimeToMetaframeworkBoundary['bindings']>().toEqualTypeOf<Bindings>()

// M→R→P: provider flows through
expectTypeOf<MetaframeworkToRuntimeBoundary>().toHaveProperty('provider')
expectTypeOf<MetaframeworkToRuntimeBoundary['provider']>().toEqualTypeOf<Provider>()