import type { ProxyTransport, ProxyRequest, ProxyResponse } from '@openhub2/types'

export function createTransport (url: string, secret: string): ProxyTransport {
  return {
    async send (request: ProxyRequest): Promise<ProxyResponse> {
      const response = await fetch(`${url}/__openhub2/proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-openhub-secret': secret,
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return response.json()
    },
  }
}
