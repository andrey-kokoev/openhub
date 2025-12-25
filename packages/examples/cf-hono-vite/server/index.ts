import { Hono } from 'hono'
import { createRuntime, openhubMiddleware } from '@openhub2/runtime-hono'
import { cloudflareProvider } from '@openhub2/provider-cloudflare'

// Define the Cloudflare environment type
type Env = {
  DB: D1Database
  KV: KVNamespace
  BLOB: R2Bucket
  OPENHUB_REMOTE_SECRET?: string
}

const app = new Hono<{ Bindings: Env }>()

// Initialize OpenHub runtime
const runtime = createRuntime()
runtime.registerProvider(cloudflareProvider)

// Middleware to inject OpenHub bindings
app.use('*', async (c, next) => {
  const env = c.env
  
  // Check if running in remote mode
  const isRemote = runtime.isRemoteMode()
  
  let bindings
  if (isRemote) {
    // In remote mode, create proxy bindings
    const transport = {
      async send(request: any): Promise<any> {
        const remoteUrl = (typeof process !== 'undefined' && process.env?.OPENHUB_REMOTE_URL) || ''
        const remoteSecret = (typeof process !== 'undefined' && process.env?.OPENHUB_REMOTE_SECRET) || ''
        
        const response = await fetch(`${remoteUrl}/__openhub2/proxy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-openhub-secret': remoteSecret,
          },
          body: JSON.stringify(request),
        })
        
        return await response.json()
      },
    }
    bindings = cloudflareProvider.createLocalBindings(transport)
  } else {
    // Extract real bindings from Cloudflare environment
    bindings = cloudflareProvider.extractBindings(env as any)
  }
  
  // Inject bindings using middleware
  const middleware = openhubMiddleware(bindings)
  return middleware(c, next)
})

// Register proxy endpoint for remote mode
app.post('/__openhub2/proxy', async (c) => {
  const proxyHandler = runtime.getProxyHandler()
  if (!proxyHandler) {
    return c.json({ success: false, error: 'Proxy handler not registered' }, 500)
  }
  
  const request = await c.req.json()
  const secret = c.req.header('x-openhub-secret')
  const expectedSecret = c.env.OPENHUB_REMOTE_SECRET
  
  if (expectedSecret && secret !== expectedSecret) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }
  
  // ProxyHandler is defined as (request, context) => Promise<ProxyResponse>
  const response = await (proxyHandler as any)(request, c.env)
  return c.json(response)
})

// Import API routes
import usersRoute from './api/users'
import sessionsRoute from './api/sessions'
import filesRoute from './api/files'

// Register API routes
app.route('/api/users', usersRoute)
app.route('/api/sessions', sessionsRoute)
app.route('/api/files', filesRoute)

// Health check endpoint
app.get('/__health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() })
})

export default app
