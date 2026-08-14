// The app has two modes:
//  - normal: talks to the /api backend (Vercel functions + Neon Postgres)
//  - demo:   no backend; everything persists to localStorage only
// Set VITE_DEMO_MODE=true to force demo mode (useful for offline UI work).
export const isBackendConfigured = () => import.meta.env.VITE_DEMO_MODE !== 'true'
