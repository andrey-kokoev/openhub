export default defineEventHandler(async (event) => {
  const { kv } = event.context.openhub.bindings

  // Get or create session
  const sessionId = getCookie(event, 'session_id') || crypto.randomUUID()

  // Store session in KV
  await kv.put(`session:${sessionId}`, JSON.stringify({
    createdAt: Date.now(),
    lastAccess: Date.now(),
  }), { expirationTtl: 86400 }) // 24 hours

  // Set cookie if new session
  if (!getCookie(event, 'session_id')) {
    setCookie(event, 'session_id', sessionId, {
      httpOnly: true,
      secure: true,
      maxAge: 86400,
    })
  }

  return sessionId
})