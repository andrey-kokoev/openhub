import type { ProxyRequest, ProxyResponse, HttpProxyTransport } from '@openhub2/types'

export class H3HttpTransport implements HttpProxyTransport {
  readonly url: string
  readonly secret: string

  constructor(baseUrl: string, secret: string) {
    // Ensure URL ends with the proxy endpoint if it's just a base URL
    if (!baseUrl.endsWith('/__openhub2/proxy')) {
      this.url = baseUrl.replace(/\/$/, '') + '/__openhub2/proxy'
    } else {
      this.url = baseUrl
    }
    this.secret = secret
  }

  async send(request: ProxyRequest): Promise<ProxyResponse> {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-openhub-secret': this.secret,
      },
      body: JSON.stringify(request),
    })

    if (response.ok) {
      return await response.json() as ProxyResponse
    } else {
      return {
        success: false,
        error: `HTTP error! status: ${response.status}`
      }
    }
  }
}