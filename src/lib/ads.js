/**
 * EthicalAds configuration
 * ------------------------
 * Provider: https://www.ethicalads.io/
 * No cookies, no fingerprinting, contextual targeting only.
 *
 * Setup:
 *   1. Apply at ethicalads.io/publishers/ (they approve manually; ~50k+ pageviews preferred)
 *   2. After approval, add your publisher id to Cloudflare Pages env vars:
 *        VITE_EA_PUBLISHER = your-publisher-id
 *   3. Replace the placeholder line in public/ads.txt with the one from your dashboard.
 *
 * Architecture:
 *   - ethicalads.min.js is loaded once in index.html (async, no render-blocking).
 *   - <AdSlot> (src/components/Ads/AdSlot.jsx) renders the data-ea-publisher div.
 *   - AdSlot returns null for Premium users and when VITE_EA_PUBLISHER is not set.
 *   - On SPA route changes, AdSlot calls window.ethicalads.reload() in a useEffect.
 *
 * Current placements (free users only):
 *   - dashboard-top   — Dashboard, below header, above stats
 *   - curriculum-top  — Curriculum page, below header, above filters
 *   - read-alouds-top — Read-Alouds page, below header
 *
 * CSS customisation:
 *   - Brand colours are set via CSS custom properties in AdSlot.css.
 *   - EthicalAds uses the "flat" theme for a clean, minimal look.
 */
export function getAdsConfig() {
  return {
    enabled: !!import.meta.env.VITE_EA_PUBLISHER,
    provider: 'ethical',
    publisherId: import.meta.env.VITE_EA_PUBLISHER || null,
  }
}
