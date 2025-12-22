export type PreparedStatement = {
  bind (...values: unknown[]): PreparedStatement
  all<T = unknown> (): Promise<QueryResult<T>>
  first<T = unknown> (): Promise<T | null>
  run (): Promise<ExecResult>
}

export type ExecResult = {
  rowsAffected: number
  lastRowId?: number
}

export type BatchResult = ExecResult[]

export type QueryResult<T> = {
  results: T[]
  meta?: Record<string, unknown>
}

export type DatabaseBinding = {
  prepare (sql: string): PreparedStatement
  exec (sql: string): Promise<ExecResult>
  batch (statements: PreparedStatement[]): Promise<BatchResult>
  dump (): Promise<ArrayBuffer>
}

export type KVPutOptions = {
  expiration?: number
  expirationTtl?: number
}

export type KVListOptions = {
  prefix?: string
  limit?: number
  cursor?: string
}

export type KVListResult = {
  keys: { name: string; expiration?: number }[]
  cursor?: string
  list_complete: boolean
}

export type KVBinding = {
  get (key: string): Promise<string | null>
  put (key: string, value: string, options?: KVPutOptions): Promise<void>
  delete (key: string): Promise<void>
  list (options?: KVListOptions): Promise<KVListResult>
}

export type BlobListOptions = {
  prefix?: string
  limit?: number
  cursor?: string
}

export type BlobListResult = {
  objects: { key: string; size: number }[]
  cursor?: string
  truncated: boolean
}

export type BlobBinding = {
  get (key: string): Promise<Blob | null>
  put (key: string, value: Blob | ArrayBuffer | ReadableStream): Promise<void>
  delete (key: string): Promise<void>
  list (options?: BlobListOptions): Promise<BlobListResult>
}

export type Bindings = {
  database?: DatabaseBinding
  kv?: KVBinding
  blob?: BlobBinding
}