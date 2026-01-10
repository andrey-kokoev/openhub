import type {
  ProxyHandler,
  ProxyRequest,
  ProxyResponse,
  Bindings,
} from '@openhub2/dharma'

type EncodedBlob = {
  base64: string
  contentType?: string
}

function arrayBufferToBase64 (buffer: ArrayBuffer): string {
  const maybeBuffer: any = (globalThis as any).Buffer
  if (maybeBuffer?.from) {
    return maybeBuffer.from(buffer).toString('base64') as string
  }

  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

function base64ToArrayBuffer (base64: string): ArrayBuffer {
  const maybeBuffer: any = (globalThis as any).Buffer
  if (maybeBuffer?.from) {
    const buf = maybeBuffer.from(base64, 'base64')
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
  }

  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export function createProxyHandler (bindings: Bindings): ProxyHandler {
  return {
    async handle (request: ProxyRequest): Promise<ProxyResponse> {
      try {
        const { binding, method, args } = request

        if (binding === 'database') {
          const db = bindings.database
          if (!db) {
            return { success: false, error: 'Database binding not available' }
          }
          if (method === 'batch') {
            const rawStatements = args[0] as { sql: string; args: unknown[] }[]
            const statements = rawStatements.map(s => db.prepare(s.sql).bind(...s.args))
            const result = await db.batch(statements)
            return { success: true, data: result }
          }
          if (['all', 'first', 'run', 'raw'].includes(method)) {
            const [sql, bindArgs] = args as [string, unknown[]]
            const stmt = db.prepare(sql).bind(...bindArgs)
            const result = await (stmt as any)[method]()
            return { success: true, data: result }
          }
          if (method === 'exec') {
            const [sql] = args as [string]
            if (typeof (db as any).exec !== 'function') {
              return { success: false, error: 'Database.exec is not available' }
            }
            const result = await (db as any).exec(sql)
            return { success: true, data: result }
          }
          if (method === 'dump') {
            if (typeof (db as any).dump !== 'function') {
              return { success: false, error: 'Database.dump is not available' }
            }
            const result = await (db as any).dump()
            return { success: true, data: result }
          }
        }

        if (binding === 'kv') {
          const kv = bindings.kv
          if (!kv) {
            return { success: false, error: 'KV binding not available' }
          }
          if (typeof (kv as any)[method] !== 'function') {
            return { success: false, error: `Method '${method}' not found on KV binding` }
          }
          const data = await (kv as any)[method](...args)
          return { success: true, data }
        }

        if (binding === 'blob') {
          const blob = bindings.blob
          if (!blob) {
            return { success: false, error: 'Blob binding not available' }
          }

          // Encode binary responses for JSON transport.
          if (method === 'get') {
            const [key] = args as [string]
            const obj = await (blob as any).get(key)
            if (!obj) return { success: true, data: null }

            const contentType = obj.type || obj.httpMetadata?.contentType
            const buffer = await obj.arrayBuffer()

            const data: EncodedBlob = {
              base64: arrayBufferToBase64(buffer),
              contentType,
            }
            return { success: true, data }
          }

          if (method === 'put') {
            const [key, encoded, options] = args as [string, EncodedBlob | ArrayBuffer | string, any]
            if (encoded && typeof encoded === 'object' && 'base64' in (encoded as any)) {
              const { base64, contentType } = encoded as EncodedBlob
              const buffer = base64ToArrayBuffer(base64)
              const mergedOptions = {
                ...(options || {}),
                ...(contentType ? { httpMetadata: { ...(options?.httpMetadata || {}), contentType } } : {}),
              }
              await (blob as any).put(key, buffer, mergedOptions)
              return { success: true, data: null }
            }

            // Fallback: pass through (works when not using the HTTP JSON transport)
            if (typeof (blob as any).put !== 'function') {
              return { success: false, error: `Method 'put' not found on Blob binding` }
            }
            await (blob as any).put(key, encoded as any, options)
            return { success: true, data: null }
          }

          if (method === 'head') {
            if (typeof (blob as any).head !== 'function') {
              return { success: true, data: null }
            }
            const data = await (blob as any).head(...args)
            return { success: true, data }
          }

          if (typeof (blob as any)[method] !== 'function') {
            return { success: false, error: `Method '${method}' not found on Blob binding` }
          }
          const data = await (blob as any)[method](...args)
          return { success: true, data }
        }

        return { success: false, error: `Unknown binding '${binding}'` }
      } catch (error: any) {
        return { success: false, error: error.message || String(error) }
      }
    },
  }
}
