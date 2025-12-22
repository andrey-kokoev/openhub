import type {
  ProxyHandler,
  ProxyRequest,
  ProxyResponse,
  Bindings,
} from '@openhub2/dharma'

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
          if (['all', 'first', 'run'].includes(method)) {
            const [sql, bindArgs] = args as [string, unknown[]]
            const stmt = db.prepare(sql).bind(...bindArgs)
            const result = await (stmt as any)[method]()
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
