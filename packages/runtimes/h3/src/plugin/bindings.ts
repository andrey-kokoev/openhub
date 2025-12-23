import { defineEventHandler } from 'h3'
import { injectBindings } from '../context/inject'
import runtime from '../context/runtime'
import { H3HttpTransport } from '../transport/http'
import type { H3Event } from 'h3'
import type { Bindings, PlatformContext } from '@openhub2/dharma'

export default defineEventHandler(async (event: H3Event) => {
  // Check if we're in remote mode
  const isRemote = runtime.isRemoteMode()

  if (isRemote) {
    // In remote mode, create local bindings using the providers
    const providers = runtime.getProviders()
    const url = process.env.OPENHUB_REMOTE_URL || ''
    const secret = process.env.OPENHUB_REMOTE_SECRET || ''

    // Create transport object
    const transport = new H3HttpTransport(url, secret)

    let allBindings: Bindings = {}

    // Create local bindings from each provider
    for (const provider of providers) {
      const providerBindings = await provider.createLocalBindings(transport)
      allBindings = { ...allBindings, ...providerBindings }
    }

    // Set the runtime in the event context and inject bindings
    if (!event.context.openhub) {
      event.context.openhub = {}
    }
    event.context.openhub_runtime = runtime
    injectBindings(event, allBindings)
  } else {
    // In local mode, extract bindings from the platform environment
    // Access the platform environment from the request
    const platformContext = {
      platform: 'cloudflare',
      env: (event.node?.req as any)?.env || (event.context as any)?.cloudflare?.env || {}
    } as PlatformContext

    let allBindings: Bindings = {}

    // Extract bindings from each provider
    for (const provider of runtime.getProviders()) {
      const providerBindings = await provider.extractBindings(platformContext)
      allBindings = { ...allBindings, ...providerBindings }
    }

    // Create proxy handlers for each provider and register the last one
    for (const provider of runtime.getProviders()) {
      const proxyHandler = provider.createProxyHandler(allBindings)
      runtime.registerProxyEndpoint(proxyHandler)
    }

    // Set the runtime in the event context and inject bindings
    if (!event.context.openhub) {
      event.context.openhub = {}
    }
    event.context.openhub_runtime = runtime
    injectBindings(event, allBindings)
  }
})