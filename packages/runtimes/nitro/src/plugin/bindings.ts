export default (nitro: any) => {
  const runtime = nitro.options.runtimeConfig.openhub?.runtime

  if (!runtime) {
    console.error('[openhub] Runtime not found in nitro options')
    return
  }

  // Nitro plugin to inject bindings into every request
  nitro.hooks.hook('request', async (event: any) => {
    let bindings = {}

    if (runtime.isRemoteMode()) {
      const providers = runtime.getProviders()
      if (providers.length > 0) {
        // Placeholder for remote binding logic
      }
    } else {
      const providers = runtime.getProviders()
      for (const provider of providers) {
        const extracted = provider.extractBindings(event.context)
        bindings = { ...bindings, ...extracted }
      }
    }

    runtime.injectBindings(event.context, bindings)
  })
}
