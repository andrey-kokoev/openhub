import { defineEventHandler, readBody, getHeader, createError } from 'h3'
import type { H3Event } from 'h3'
import type { ProxyRequest } from '@openhub2/dharma'
import runtime from '../context/runtime'

export default defineEventHandler(async (event: H3Event) => {
  const secret = getHeader(event, 'x-openhub-secret')
  const expectedSecret = process.env.OPENHUB_REMOTE_SECRET

  if (!expectedSecret || secret !== expectedSecret) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const body = await readBody<ProxyRequest>(event)
  // Use the singleton runtime

  const handler = runtime.getProxyHandler()
  if (!handler) {
    throw createError({
      statusCode: 501,
      statusMessage: 'Proxy handler not configured'
    })
  }

  return await handler.handle(body)
})
