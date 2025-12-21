import { defineEventHandler, readBody, getHeader, createError } from 'h3'
import type { ProxyRequest } from '@openhub/dharma'

export default defineEventHandler(async (event: any) => {
  const secret = getHeader(event, 'x-openhub-secret')
  const expectedSecret = process.env.OPENHUB_REMOTE_SECRET

  if (!expectedSecret || secret !== expectedSecret) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const body = await readBody<ProxyRequest>(event)
  const runtime = event.context.openhub?.runtime

  if (!runtime) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Runtime not initialized'
    })
  }

  const handler = runtime.getProxyHandler()
  if (!handler) {
    throw createError({
      statusCode: 501,
      statusMessage: 'Proxy handler not configured'
    })
  }

  return await handler.handle(body)
})
