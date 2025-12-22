export default defineEventHandler(async (event) => {
  const { database } = event.context.openhub.bindings

  if (event.method === 'GET') {
    // List users
    const stmt = database.prepare('SELECT id, name, email FROM users ORDER BY id DESC LIMIT 10')
    const { results } = await stmt.all()
    return results
  }

  if (event.method === 'POST') {
    // Create user
    const body = await readBody(event)
    const { name, email } = body

    if (!name || !email) {
      throw createError({ statusCode: 400, message: 'Name and email are required' })
    }

    const stmt = database.prepare('INSERT INTO users (name, email) VALUES (?, ?)')
    const result = await stmt.bind(name, email).run()

    return {
      id: result.meta.last_row_id,
      name,
      email
    }
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})