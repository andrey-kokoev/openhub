import type {
  BlobBinding,
  BlobListOptions,
  BlobListResult,
  ProxyTransport,
} from '@openhub2/types'

export function createBlobBinding (transport: ProxyTransport): BlobBinding {
  return {
    async get (key: string): Promise<Blob | null> {
      const response = await transport.send({
        binding: 'blob',
        method: 'get',
        args: [key],
      })
      if (!response.success) throw new Error(response.error)
      return response.data as Blob | null
    },

    async put (key: string, value: Blob | ArrayBuffer | ReadableStream): Promise<void> {
      // Note: We might need to handle ReadableStream/ArrayBuffer conversion depending on transport
      const response = await transport.send({
        binding: 'blob',
        method: 'put',
        args: [key, value],
      })
      if (!response.success) throw new Error(response.error)
    },

    async delete (key: string): Promise<void> {
      const response = await transport.send({
        binding: 'blob',
        method: 'delete',
        args: [key],
      })
      if (!response.success) throw new Error(response.error)
    },

    async list (options?: BlobListOptions): Promise<BlobListResult> {
      const response = await transport.send({
        binding: 'blob',
        method: 'list',
        args: [options],
      })
      if (!response.success) throw new Error(response.error)
      return response.data as BlobListResult
    },
  }
}
