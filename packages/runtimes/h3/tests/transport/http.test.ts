import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { H3HttpTransport } from '../../src/transport/http'
import type { ProxyRequest } from '@openhub2/dharma'

describe('H3HttpTransport', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    // @ts-expect-error - overridden in tests
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('should normalize base URL to include proxy endpoint', () => {
    expect(new H3HttpTransport('https://example.com', 's').url).toBe(
      'https://example.com/__openhub2/proxy',
    )
    expect(new H3HttpTransport('https://example.com/', 's').url).toBe(
      'https://example.com/__openhub2/proxy',
    )
  })

  it('should keep URL unchanged when it already ends with proxy endpoint', () => {
    expect(new H3HttpTransport('https://example.com/__openhub2/proxy', 's').url).toBe(
      'https://example.com/__openhub2/proxy',
    )
  })

  it('should call fetch with correct headers and body', async () => {
    const fetchMock = vi.mocked(globalThis.fetch)
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { ok: true } }),
    } as any)

    const transport = new H3HttpTransport('https://example.com', 'sekret')
    const request: ProxyRequest = { binding: 'kv', method: 'get', args: ['x'] }
    const response = await transport.send(request)

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/__openhub2/proxy',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-openhub-secret': 'sekret',
        },
        body: JSON.stringify(request),
      }),
    )
    expect(response).toEqual({ success: true, data: { ok: true } })
  })

  it('should return an error response when HTTP response is not ok', async () => {
    const fetchMock = vi.mocked(globalThis.fetch)
    fetchMock.mockResolvedValue({ ok: false, status: 403 } as any)

    const transport = new H3HttpTransport('https://example.com', 'sekret')
    const response = await transport.send({ binding: 'kv', method: 'get', args: ['x'] })

    expect(response).toEqual({ success: false, error: 'HTTP error! status: 403' })
  })
})