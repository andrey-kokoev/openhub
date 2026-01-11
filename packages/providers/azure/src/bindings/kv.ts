import type {
  KVBinding,
  KVPutOptions,
  KVListOptions,
  KVListResult,
  ProxyTransport,
} from '@openhub2/types'

export function createKVBinding (transport: ProxyTransport): KVBinding {
  return {
    async get (key: string): Promise<string | null> {
      const response = await transport.send({
        binding: 'kv',
        method: 'get',
        args: [key],
      })
      if (!response.success) throw new Error(response.error)
      return response.data as string | null
    },

    async put (key: string, value: string, options?: KVPutOptions): Promise<void> {
      const response = await transport.send({
        binding: 'kv',
        method: 'put',
        args: [key, value, options],
      })
      if (!response.success) throw new Error(response.error)
    },

    async delete (key: string): Promise<void> {
      const response = await transport.send({
        binding: 'kv',
        method: 'delete',
        args: [key],
      })
      if (!response.success) throw new Error(response.error)
    },

    async list (options?: KVListOptions): Promise<KVListResult> {
      const response = await transport.send({
        binding: 'kv',
        method: 'list',
        args: [options],
      })
      if (!response.success) throw new Error(response.error)
      return response.data as KVListResult
    },
  }
}
