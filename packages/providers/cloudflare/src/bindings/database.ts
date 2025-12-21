import type {
  DatabaseBinding,
  PreparedStatement,
  ExecResult,
  QueryResult,
  BatchResult,
  ProxyTransport,
} from '@openhub2/dharma'

class CloudflarePreparedStatement implements PreparedStatement {
  constructor(
    private transport: ProxyTransport,
    private sql: string,
    private args: unknown[] = [],
  ) { }

  bind (...values: unknown[]): PreparedStatement {
    return new CloudflarePreparedStatement(this.transport, this.sql, values)
  }

  async all<T = unknown> (): Promise<QueryResult<T>> {
    const response = await this.transport.send({
      binding: 'database',
      method: 'all',
      args: [this.sql, this.args],
    })
    if (!response.success) throw new Error(response.error)
    return response.data as QueryResult<T>
  }

  async first<T = unknown> (): Promise<T | null> {
    const response = await this.transport.send({
      binding: 'database',
      method: 'first',
      args: [this.sql, this.args],
    })
    if (!response.success) throw new Error(response.error)
    return response.data as T | null
  }

  async run (): Promise<ExecResult> {
    const response = await this.transport.send({
      binding: 'database',
      method: 'run',
      args: [this.sql, this.args],
    })
    if (!response.success) throw new Error(response.error)
    return response.data as ExecResult
  }
}

export function createDatabaseBinding (transport: ProxyTransport): DatabaseBinding {
  return {
    prepare (sql: string): PreparedStatement {
      return new CloudflarePreparedStatement(transport, sql)
    },

    async exec (sql: string): Promise<ExecResult> {
      const response = await transport.send({
        binding: 'database',
        method: 'exec',
        args: [sql],
      })
      if (!response.success) throw new Error(response.error)
      return response.data as ExecResult
    },

    async batch (statements: PreparedStatement[]): Promise<BatchResult> {
      const rawStatements = statements.map(s => {
        const cs = s as CloudflarePreparedStatement
        // @ts-ignore - accessing private state for transport
        return { sql: cs.sql, args: cs.args }
      })

      const response = await transport.send({
        binding: 'database',
        method: 'batch',
        args: [rawStatements],
      })
      if (!response.success) throw new Error(response.error)
      return response.data as BatchResult
    },

    async dump (): Promise<ArrayBuffer> {
      const response = await transport.send({
        binding: 'database',
        method: 'dump',
        args: [],
      })
      if (!response.success) throw new Error(response.error)
      return response.data as ArrayBuffer
    },
  }
}
