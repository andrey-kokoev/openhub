import type { ProxyRequest, ProxyResponse, HttpProxyTransport } from '@openhub/dharma'

export function createTransport(config: { url: string; secret: string }): HttpProxyTransport {
  return {
    url: config.url,
    secret: config.secret,
    async send(request: ProxyRequest): Promise<ProxyResponse> {
      const response = await fetch(`${this.url}/__openhub/proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-openhub-secret': this.secret,
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP Error ${response.status}: ${response.statusText}`,
        }
      }

      return await response.json()
    },
  }
}
