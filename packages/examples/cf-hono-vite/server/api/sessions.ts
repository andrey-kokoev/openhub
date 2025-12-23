import { Hono } from 'hono'
import { getBindings } from '@openhub2/runtime-hono'
import { getCookie, setCookie } from 'hono/cookie'

const app = new Hono()

// GET /api/sessions - Get or create session
app.get('/', async (c) => {
  const { kv } = getBindings(c)
  
  // Get or create session
  const sessionId = getCookie(c, 'session_id') || crypto.randomUUID()
  
  // Store session in KV
  await kv.put(`session:${sessionId}`, JSON.stringify({
    createdAt: Date.now(),
    lastAccess: Date.now(),
  }), { expirationTtl: 86400 }) // 24 hours
  
  // Set cookie if new session
  if (!getCookie(c, 'session_id')) {
    setCookie(c, 'session_id', sessionId, {
      httpOnly: true,
      secure: true,
      maxAge: 86400,
    })
  }
  
  return c.text(sessionId)
})

export default app
