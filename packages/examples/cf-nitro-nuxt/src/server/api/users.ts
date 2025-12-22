export default defineEventHandler(async (event) => {
  const { database } = event.context.openhub.bindings

  const stmt = database.prepare('SELECT id, name, email FROM users LIMIT 10')
  const { results } = await stmt.all()

  return results
})