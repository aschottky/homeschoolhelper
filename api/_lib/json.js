export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function httpError(status, message) {
  const err = new Error(message)
  err.status = status
  return err
}

// Wrap a handler body: thrown httpErrors become JSON error responses,
// anything else becomes a logged 500.
export async function handle(fn) {
  try {
    return await fn()
  } catch (err) {
    const status = err.status || 500
    if (status >= 500) console.error(err)
    return json({ error: err.status ? err.message : 'Internal server error' }, status)
  }
}
