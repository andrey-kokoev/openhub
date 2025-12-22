import { describe, it, expect } from 'vitest'
import { openhubEventHandler, getBindings, createOpenhubMiddleware } from '../src/middleware'
import type { H3Event } from 'h3'

describe('H3 Middleware', () => {
  it('openhubEventHandler should inject bindings into event context', async () => {
    const bindings = { database: { foo: 'bar' }, kv: {}, blob: {} }
    const mockEvent = {
      context: {}
    } as H3Event

    const handler = openhubEventHandler(bindings, async (event) => {
      expect(event.context.openhub).toBeDefined()
      expect(event.context.openhub.bindings).toEqual(bindings)
      return 'success'
    })

    const result = await handler(mockEvent)
    expect(result).toBe('success')
  })

  it('getBindings should extract bindings from event', () => {
    const bindings = { database: {}, kv: {}, blob: {} }
    const mockEvent = {
      context: {
        openhub: {
          bindings
        }
      }
    } as H3Event

    const extractedBindings = getBindings(mockEvent)
    expect(extractedBindings).toEqual(bindings)
  })

  it('getBindings should return empty object if no bindings', () => {
    const mockEvent = {
      context: {}
    } as H3Event

    const extractedBindings = getBindings(mockEvent)
    expect(extractedBindings).toEqual({})
  })

  it('createOpenhubMiddleware should create middleware that injects bindings', async () => {
    const bindings = { database: {}, kv: {}, blob: {} }
    const middleware = createOpenhubMiddleware(bindings)
    
    const mockEvent = {
      context: {}
    } as H3Event

    await middleware(mockEvent)
    
    expect(mockEvent.context.openhub).toBeDefined()
    expect(mockEvent.context.openhub.bindings).toEqual(bindings)
  })

  it('should merge bindings when context already has openhub', async () => {
    const existingBindings = { database: { existing: true } }
    const newBindings = { kv: { new: true }, blob: {} }
    
    const mockEvent = {
      context: {
        openhub: {
          bindings: existingBindings
        }
      }
    } as H3Event

    const middleware = createOpenhubMiddleware(newBindings)
    await middleware(mockEvent)

    expect(mockEvent.context.openhub.bindings).toEqual({
      database: { existing: true },
      kv: { new: true },
      blob: {}
    })
  })
})
