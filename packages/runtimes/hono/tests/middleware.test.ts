import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { openhubMiddleware, getBindings } from '../src/middleware'
import type { Bindings } from '@openhub2/dharma'

describe('openhubMiddleware', () => {
  it('should inject bindings into Hono context', async () => {
    const app = new Hono()
    const mockBindings: Bindings = {
      database: { prepare: () => {} } as any,
      kv: { get: () => {} } as any,
      blob: { get: () => {} } as any,
    }

    app.use('*', openhubMiddleware(mockBindings))
    app.get('/test', (c) => {
      const bindings = c.get('openhub').bindings
      return c.json({ bindings: !!bindings })
    })

    const res = await app.request('/test')
    const data = await res.json()
    expect(data.bindings).toBe(true)
  })

  it('should make bindings accessible via getBindings helper', async () => {
    const app = new Hono()
    const mockBindings: Bindings = {
      database: { prepare: () => {} } as any,
      kv: { get: () => {} } as any,
      blob: { get: () => {} } as any,
    }

    app.use('*', openhubMiddleware(mockBindings))
    app.get('/test', (c) => {
      const bindings = getBindings(c)
      return c.json({ hasDatabase: !!bindings.database })
    })

    const res = await app.request('/test')
    const data = await res.json()
    expect(data.hasDatabase).toBe(true)
  })

  it('should merge bindings if called multiple times', async () => {
    const app = new Hono()
    const bindings1: Bindings = {
      database: { prepare: () => {} } as any,
    }
    const bindings2: Bindings = {
      kv: { get: () => {} } as any,
    }

    app.use('*', openhubMiddleware(bindings1))
    app.use('*', openhubMiddleware(bindings2))
    app.get('/test', (c) => {
      const bindings = getBindings(c)
      return c.json({ 
        hasDatabase: !!bindings.database,
        hasKv: !!bindings.kv
      })
    })

    const res = await app.request('/test')
    const data = await res.json()
    expect(data.hasDatabase).toBe(true)
    expect(data.hasKv).toBe(true)
  })
})
