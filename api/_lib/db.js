import pg from 'pg'

// One pool per warm serverless instance. DATABASE_URL is injected by the
// Neon integration on Vercel (pooled connection string).
const globalForPg = globalThis

export const pool =
  globalForPg.__pgPool ??
  new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 30000,
  })

globalForPg.__pgPool = pool

// Run a callback inside a transaction with a dedicated client.
export async function withTransaction(fn) {
  const client = await pool.connect()
  try {
    await client.query('begin')
    const result = await fn(client)
    await client.query('commit')
    return result
  } catch (err) {
    await client.query('rollback')
    throw err
  } finally {
    client.release()
  }
}
