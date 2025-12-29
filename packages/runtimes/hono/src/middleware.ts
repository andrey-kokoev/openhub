import type { MiddlewareHandler } from 'hono'
import type { Bindings } from '@openhub2/types'

/**
 * Hono middleware to inject OpenHub bindings into the context
 */
export function openhubMiddleware (bindings: Bindings): MiddlewareHandler {
  return async (c, next) => {
    // Inject bindings into Hono's context variable store
    if (!c.get('openhub')) {
      c.set('openhub', {})
    }
    const openhub = c.get('openhub') as any
    openhub.bindings = {
      ...openhub.bindings,
      ...bindings
    }
    c.set('openhub', openhub)
    
    await next()
  }
}

/**
 * Helper to get OpenHub bindings from Hono context
 */
export function getBindings (c: any): Bindings {
  const openhub = c.get('openhub')
  return openhub?.bindings || {}
}
