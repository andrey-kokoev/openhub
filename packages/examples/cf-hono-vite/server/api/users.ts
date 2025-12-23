import { Hono } from 'hono'
import { getBindings } from '@openhub2/runtime-hono'

const app = new Hono()

// GET /api/users - List users
app.get('/', async (c) => {
  const { database } = getBindings(c)
  
  const stmt = database.prepare('SELECT id, name, email FROM users ORDER BY id DESC LIMIT 10')
  const { results } = await stmt.all()
  
  return c.json(results)
})

// POST /api/users - Create user
app.post('/', async (c) => {
  const { database } = getBindings(c)
  const body = await c.req.json()
  const { name, email } = body
  
  if (!name || !email) {
    return c.json({ error: 'Name and email are required' }, 400)
  }
  
  const stmt = database.prepare('INSERT INTO users (name, email) VALUES (?, ?)')
  const result = await stmt.bind(name, email).run()
  
  return c.json({
    id: result.meta.last_row_id,
    name,
    email
  })
})

export default app
