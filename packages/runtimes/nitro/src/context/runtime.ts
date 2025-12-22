import { createRuntime } from '../runtime'
// @ts-ignore
import * as providerModule from '#openhub/provider'

const runtime = createRuntime()
const provider = Object.values(providerModule).find(p => p && typeof p === 'object' && 'name' in p)
if (provider) {
  runtime.registerProvider(provider as any)
}

export default runtime
