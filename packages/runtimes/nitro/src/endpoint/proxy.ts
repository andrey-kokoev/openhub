import { defineEventHandler, readBody, getHeader, createError } from 'h3'
import { useRuntimeConfig } from 'nitropack/runtime'
import type { H3Event } from 'h3'
import type { ProxyRequest } from '@openhub2/types'
import runtime from '../context/runtime'

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig(event).openhub as any
  const secret = getHeader(event, 'x-openhub-secret')
  const expectedSecret = config?.remoteSecret || process.env.OPENHUB_REMOTE_SECRET

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
