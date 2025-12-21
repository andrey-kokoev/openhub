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
        const targetBinding = bindings[binding]

        if (!targetBinding) {
          return {
            success: false,
            error: `Binding '${binding}' not found or not supported by this provider`,
          }
        }

        // Handle database special cases (e.g., batch, prepare/run)
        if (binding === 'database') {
          if (method === 'batch') {
            const rawStatements = args[0] as { sql: string; args: unknown[] }[]
            const statements = rawStatements.map(s => targetBinding.prepare(s.sql).bind(...s.args))
            const result = await targetBinding.batch(statements)
            return { success: true, data: result }
          }

          if (['all', 'first', 'run'].includes(method)) {
            const [sql, bindArgs] = args as [string, unknown[]]
            const stmt = targetBinding.prepare(sql).bind(...bindArgs)
            const result = await (stmt as any)[method]()
            return { success: true, data: result }
          }
        }

        // Generic method call for other methods and bindings (KV, Blob)
        if (typeof (targetBinding as any)[method] !== 'function') {
          return {
            success: false,
            error: `Method '${method}' not found on binding '${binding}'`,
          }
        }

        const data = await (targetBinding as any)[method](...args)
        return { success: true, data }
      } catch (error: any) {
        return {
          success: false,
          error: error.message || String(error),
        }
      }
    },
  }
}
