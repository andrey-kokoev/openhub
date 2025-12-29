import { H3Runtime } from '../runtime'
import type { Provider } from '@openhub2/types'

// Create a global runtime instance
const runtime = new H3Runtime()

// Auto-register providers from the #openhub/provider import
try {
  // This import may not exist in all contexts, so we handle it gracefully
  // @ts-ignore
  const providerModule = await import('#openhub/provider').catch(() => ({}))

  // Register the first export that looks like a provider
  for (const key in providerModule) {
    const exportValue = providerModule[key]
    if (isProviderLike(exportValue)) {
      runtime.registerProvider(exportValue)
      break // Only register the first provider-like export
    }
  }
} catch {
  // If the import fails, that's okay - providers may be registered manually
  console.debug('Could not import #openhub/provider, this is expected in some contexts')
}

function isProviderLike (obj: any): obj is Provider {
  return obj &&
    typeof obj.name === 'string' &&
    Array.isArray(obj.supportedBindings) &&
    typeof obj.createLocalBindings === 'function' &&
    typeof obj.createProxyHandler === 'function' &&
    typeof obj.extractBindings === 'function'
}

export default runtime