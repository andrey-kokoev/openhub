import type { EventHandler, H3Event } from 'h3'
import type { Bindings } from '@openhub2/types'

/**
 * H3 event handler to inject OpenHub bindings into the event context
 */
export function openhubEventHandler (bindings: Bindings, handler: EventHandler): EventHandler {
  return async (event) => {
    // Inject bindings into H3's event context
    if (!event.context.openhub) {
      event.context.openhub = {}
    }
    event.context.openhub.bindings = {
      ...event.context.openhub.bindings,
      ...bindings
    }
    
    return handler(event)
  }
}

/**
 * Helper to get OpenHub bindings from H3 event
 */
export function getBindings (event: H3Event): Bindings {
  return event.context.openhub?.bindings || {}
}

/**
 * H3 middleware factory to inject bindings
 */
export function createOpenhubMiddleware (bindings: Bindings): EventHandler {
  return async (event) => {
    if (!event.context.openhub) {
      event.context.openhub = {}
    }
    event.context.openhub.bindings = {
      ...event.context.openhub.bindings,
      ...bindings
    }
  }
}
