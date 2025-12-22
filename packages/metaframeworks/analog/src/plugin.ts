import { openhubModule as nitroModule } from '@openhub2/runtime-nitro'

export interface PluginOptions {
  provider?: string
  remote?: boolean | 'production' | 'preview'
}

export function openhubPlugin(options: PluginOptions = {}): any {
  return {
    name: '@openhub2/metaframework-analog',
    
    config(config: any) {
      // Ensure Nitro config exists
      if (!config.nitro) {
        config.nitro = {}
      }
      
      const nitroConfig = config.nitro
      
      // Register Nitro runtime module
      nitroConfig.modules = nitroConfig.modules || []
      nitroConfig.modules.push(nitroModule)
      
      // Configure runtime options
      nitroConfig.runtimeConfig = nitroConfig.runtimeConfig || {}
      nitroConfig.runtimeConfig.openhub = nitroConfig.runtimeConfig.openhub || {}
      nitroConfig.runtimeConfig.openhub.remote = options.remote
      nitroConfig.runtimeConfig.openhub.provider = options.provider
      
      return config
    },
    
    configureServer(server: any) {
      // Add OpenHub devtools panel if in dev mode
      // Analog uses Vite's dev server, so we can integrate here
      const isDev = process.env.NODE_ENV === 'development' || server.config.command === 'serve'
      if (isDev) {
        server.middlewares.use((req: any, res: any, next: any) => {
          if (req.url === '/__openhub2/devtools') {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>OpenHub Devtools</title>
                </head>
                <body>
                  <h1>OpenHub Devtools</h1>
                  <p>Mode: ${options.remote ? 'remote' : 'local'}</p>
                  <p>Provider: ${options.provider || 'none'}</p>
                </body>
              </html>
            `)
            return
          }
          next()
        })
      }
    }
  }
}

export default openhubPlugin
