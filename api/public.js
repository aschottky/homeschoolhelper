import { pool } from './_lib/db.js'
import { json, handle } from './_lib/json.js'

// Public, unauthenticated data for the landing page and read-aloud library.
export async function GET() {
  return handle(async () => {
    const [books, resources] = await Promise.all([
      pool.query('select * from suggested_books order by sort_order, title'),
      pool.query('select * from resources order by sort_order, category'),
    ])
    return json({ suggested_books: books.rows, resources: resources.rows })
  })
}
