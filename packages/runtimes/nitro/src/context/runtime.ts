import { createRuntime } from '../runtime'
// @ts-ignore
import * as providerModule from '#openhub/provider'

const runtime = createRuntime()

// Find the provider in the module exports
let provider: any = null
for (const key in providerModule) {
  const exportValue = (providerModule as any)[key]
  if (exportValue && typeof exportValue === 'object' && 'name' in exportValue && 'supportedBindings' in exportValue) {
    provider = exportValue
    break
  }
}

if (provider) {
  runtime.registerProvider(provider)
}

export default runtime
