import { auth } from './_lib/auth.js'

// Vercel's bare /api functions don't support multi-segment catch-all routes,
// so vercel.json rewrites /api/auth/<anything> to /api/auth?authPath=<anything>.
// Rebuild the original URL before handing the request to Better Auth.
function toAuthRequest(request) {
  const url = new URL(request.url)
  const subPath = url.searchParams.get('authPath') || ''
  url.searchParams.delete('authPath')
  const target = new URL(`/api/auth/${subPath}`, url.origin)
  url.searchParams.forEach((value, key) => target.searchParams.append(key, value))
  return new Request(target, request)
}

export async function GET(request) {
  return auth.handler(toAuthRequest(request))
}

export async function POST(request) {
  return auth.handler(toAuthRequest(request))
}
