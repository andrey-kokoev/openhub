export type ProxyRequest = {
  binding: 'database' | 'kv' | 'blob'
  method: string
  args: unknown[]
}

export type ProxyResponse = {
  success: boolean
  data?: unknown
  error?: string
}

export type ProxyHandler = {
  handle (request: ProxyRequest): Promise<ProxyResponse>
}

export type ProxyTransport = {
  send (request: ProxyRequest): Promise<ProxyResponse>
}

export type HttpProxyTransport = ProxyTransport & {
  url: string
  secret: string
}