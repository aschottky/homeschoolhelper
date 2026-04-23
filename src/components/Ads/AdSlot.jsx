/**
 * AdSlot — Google AdSense placement for free users only.
 *
 * Setup (one-time, you do this):
 *   1. Apply at https://adsense.google.com — approval takes 1-2 weeks.
 *   2. After approval, add to Cloudflare Pages → Settings → Environment Variables:
 *        VITE_ADSENSE_CLIENT = ca-pub-XXXXXXXXXXXXXXXX
 *   3. For each placement, create an ad unit in AdSense dashboard → Ad units → Display ads.
 *      Copy the data-ad-slot value and add it as an env var:
 *        VITE_ADSENSE_SLOT_DASHBOARD = 1234567890
 *        VITE_ADSENSE_SLOT_CURRICULUM = 0987654321
 *        VITE_ADSENSE_SLOT_READALOUDS = 1122334455
 *        (or just use one slot ID for all placements to keep it simple)
 *
 * COPPA / Privacy:
 *   - requestNonPersonalizedAds=1 is set globally to serve non-personalized ads.
 *   - This is the safest approach for a site with mixed adult/child audiences.
 *   - Review https://support.google.com/adsense/answer/9049919 for your specific situation.
 *
 * Usage:
 *   <AdSlot slotId={import.meta.env.VITE_ADSENSE_SLOT_DASHBOARD} />
 *   <AdSlot slotId={import.meta.env.VITE_ADSENSE_SLOT_CURRICULUM} format="horizontal" />
 */

import { useEffect, useRef } from 'react'
import { useSubscription } from '../../context/SubscriptionContext'
import './AdSlot.css'

const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT

// Inject the AdSense script once per page load
let scriptInjected = false
function injectAdSenseScript(client) {
  if (scriptInjected || typeof document === 'undefined') return
  scriptInjected = true

  // requestNonPersonalizedAds=1 → COPPA-safe, no user tracking
  const script = document.createElement('script')
  script.async = true
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}&npa=1`
  script.crossOrigin = 'anonymous'
  document.head.appendChild(script)
}

export default function AdSlot({
  slotId,
  format = 'auto',   // 'auto' | 'horizontal' | 'vertical' | 'rectangle'
  className = '',
}) {
  const { isPremium } = useSubscription()
  const ref = useRef(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (isPremium || !CLIENT || !slotId || !ref.current || pushed.current) return

    injectAdSenseScript(CLIENT)

    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch (e) {
      console.warn('AdSense push failed', e)
    }
  }, [isPremium, slotId])

  if (isPremium || !CLIENT || !slotId) return null

  return (
    <div className={`ad-slot-wrapper ${className}`}>
      <span className="ad-slot-label">Advertisement</span>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={CLIENT}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
