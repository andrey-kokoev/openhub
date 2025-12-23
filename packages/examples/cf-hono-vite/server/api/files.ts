import { Hono } from 'hono'
import { getBindings } from '@openhub2/runtime-hono'

const app = new Hono()

// GET /api/files - List files
app.get('/', async (c) => {
  const { blob } = getBindings(c)
  
  const list = await blob.list({ limit: 100 })
  const files = list.objects.map((obj: { key: string; size: number; uploaded: Date }) => ({
    key: obj.key,
    size: obj.size,
    uploaded: obj.uploaded,
  }))
  
  return c.json(files)
})

// POST /api/files - Upload file
app.post('/', async (c) => {
  const { blob } = getBindings(c)
  
  const formData = await c.req.formData()
  const file = formData.get('file') as File
  
  if (!file) {
    return c.json({ error: 'No file provided' }, 400)
  }
  
  const key = `uploads/${Date.now()}-${file.name}`
  await blob.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  })
  
  return c.json({ key, size: file.size })
})

export default app
