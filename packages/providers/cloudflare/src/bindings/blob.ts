import type {
  BlobBinding,
  BlobListOptions,
  BlobListResult,
  BlobPutOptions,
  ProxyTransport,
} from '@openhub2/types'

type EncodedBlob = {
  base64: string
  contentType?: string
}

function arrayBufferToBase64 (buffer: ArrayBuffer): string {
  // Prefer Buffer in Node.js
  const maybeBuffer: any = (globalThis as any).Buffer
  if (maybeBuffer?.from) {
    return maybeBuffer.from(buffer).toString('base64') as string
  }

  // Fallback for runtimes with btoa (e.g. Workers)
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

async function valueToEncodedBlob (value: Blob | ArrayBuffer | ReadableStream, contentType?: string): Promise<EncodedBlob> {
  if (value instanceof ArrayBuffer) {
    return { base64: arrayBufferToBase64(value), contentType }
  }

  if (typeof Blob !== 'undefined' && value instanceof Blob) {
    const buffer = await value.arrayBuffer()
    return { base64: arrayBufferToBase64(buffer), contentType: contentType ?? value.type }
  }

  // ReadableStream: consume to ArrayBuffer (works in Node and Workers)
  const buffer = await new Response(value).arrayBuffer()
  return { base64: arrayBufferToBase64(buffer), contentType }
}

export function createBlobBinding (transport: ProxyTransport): BlobBinding {
  return {
    async get (key: string): Promise<Blob | null> {
      const response = await transport.send({
        binding: 'blob',
        method: 'get',
        args: [key],
      })
      if (!response.success) throw new Error(response.error)
      if (response.data == null) return null

      const data = response.data as EncodedBlob
      const buffer = base64ToArrayBuffer(data.base64)
      return new Blob([buffer], { type: data.contentType || '' })
    },

    async put (key: string, value: Blob | ArrayBuffer | ReadableStream, options?: BlobPutOptions): Promise<void> {
      const httpMetadata = (options as any)?.httpMetadata as { contentType?: string } | undefined
      const encoded = await valueToEncodedBlob(value, httpMetadata?.contentType)

      const response = await transport.send({
        binding: 'blob',
        method: 'put',
        args: [key, encoded, options],
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

    async head (key: string): Promise<unknown | null> {
      const response = await transport.send({
        binding: 'blob',
        method: 'head',
        args: [key],
      })
      if (!response.success) throw new Error(response.error)
      return response.data as unknown | null
    },
  }
}
