export default defineEventHandler(async (event) => {
  const { blob } = event.context.openhub.bindings

  if (event.method === 'GET') {
    // List files
    const list = await blob.list({ limit: 100 })
    return list.objects.map((obj: { key: string; size: number; uploaded: Date }) => ({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded,
    }))
  }

  if (event.method === 'POST') {
    // Upload file
    const formData = await readFormData(event)
    const file = formData.get('file') as File

    if (!file) {
      throw createError({ statusCode: 400, message: 'No file provided' })
    }

    const key = `uploads/${Date.now()}-${file.name}`
    await blob.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
    })

    return { key, size: file.size }
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})