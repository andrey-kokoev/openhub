import type { ProxyRequest, ProxyResponse, HttpProxyTransport } from '@openhub2/types'

export class HonoHttpTransport implements HttpProxyTransport {
  constructor(public url: string, public secret: string) {
    // Ensure URL ends with the proxy endpoint if it's just a base URL
    if (!this.url.endsWith('/__openhub2/proxy')) {
      this.url = this.url.replace(/\/$/, '') + '/__openhub2/proxy'
    }
  }

  async send (request: ProxyRequest): Promise<ProxyResponse> {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-openhub-secret': this.secret
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error! status: ${response.status}`
      }
    }

    return await response.json() as ProxyResponse
  }
}
