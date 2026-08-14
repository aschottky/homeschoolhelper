/**
 * Ads & affiliate configuration
 * ==============================
 *
 * 1. GOOGLE ADSENSE (display ads — free users only)
 * -------------------------------------------------
 * Apply: https://adsense.google.com  (approval 1-2 weeks)
 *
 * Vercel → Project → Settings → Environment Variables:
 *   VITE_ADSENSE_CLIENT   = ca-pub-XXXXXXXXXXXXXXXX   ← your publisher ID
 *   VITE_ADSENSE_SLOT_DASHBOARD  = 1234567890         ← Dashboard ad unit
 *   VITE_ADSENSE_SLOT_CURRICULUM = 0987654321         ← Curriculum ad unit
 *   VITE_ADSENSE_SLOT_READALOUDS = 1122334455         ← Read-Alouds ad unit
 *
 * How to create ad units:
 *   AdSense dashboard → Ads → By ad unit → Display ads → give it a name → copy slot ID
 *
 * Privacy/COPPA:
 *   AdSlot.jsx injects the script with ?npa=1 (non-personalized ads).
 *   This is the safe default for mixed adult/child audiences.
 *   Review https://support.google.com/adsense/answer/9049919 for your situation.
 *
 * The AdSlot component returns null until VITE_ADSENSE_CLIENT is set,
 * so nothing renders in dev or until you're approved.
 *
 *
 * 2. AMAZON ASSOCIATES (affiliate links — curriculum page)
 * -------------------------------------------------------
 * Apply: https://affiliate-program.amazon.com  (instant approval for small sites)
 *
 * Vercel → Project → Settings → Environment Variables:
 *   VITE_AMAZON_TAG = yourname-20    ← your Associates tracking tag
 *
 * Falls back to 'homeschoolhelp-20' placeholder until you set the var.
 * All "Find on Amazon" links use rel="nofollow noopener noreferrer" and open in a new tab.
 * The affiliate disclosure is shown below the curriculum header as required by FTC rules.
 *
 *
 * 3. FUTURE UPGRADE PATH
 * ----------------------
 * ~50k sessions/month → apply to Mediavine (https://www.mediavine.com/publishers/)
 * for 3–5× higher RPM on family/education content. Swap AdSense for their script.
 */
export function getAdsConfig() {
  return {
    adsense: {
      enabled: !!import.meta.env.VITE_ADSENSE_CLIENT,
      client: import.meta.env.VITE_ADSENSE_CLIENT || null,
    },
    amazon: {
      tag: import.meta.env.VITE_AMAZON_TAG || 'homeschoolhelp-20',
    },
  }
}
