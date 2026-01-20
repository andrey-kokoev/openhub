import { eventHandler, readBody, getHeader, createError } from 'h3'
import type { H3Event } from 'h3'
import type { ProxyRequest } from '@openhub2/types'
import runtime from '../context/runtime'

export default eventHandler(async (event: H3Event) => {
  // For H3, we might need to get the secret differently than Nitro
  const secret = getHeader(event, 'x-openhub-secret')
  const expectedSecret = process.env.OPENHUB_REMOTE_SECRET

  if (!expectedSecret || secret !== expectedSecret) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  try {
    const body = await readBody<ProxyRequest>(event)
    const handler = runtime.getProxyHandler()

    if (!handler) {
      throw createError({
        statusCode: 501,
        statusMessage: 'Proxy handler not configured'
      })
    }

    return await handler.handle(body)
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal Server Error'
    })
  }
})