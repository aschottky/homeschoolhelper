import { auth } from './auth.js'
import { pool } from './db.js'
import { httpError } from './json.js'

export async function getSession(request) {
  return auth.api.getSession({ headers: request.headers })
}

export async function requireUser(request) {
  const session = await getSession(request)
  if (!session?.user) throw httpError(401, 'Not signed in')
  return session.user
}

export async function requireAdmin(request) {
  const user = await requireUser(request)
  const { rows } = await pool.query('select is_admin from profiles where id = $1', [user.id])
  if (!rows[0]?.is_admin) throw httpError(403, 'Admin access required')
  return user
}
