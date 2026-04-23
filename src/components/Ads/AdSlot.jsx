/**
 * AdSlot — renders an EthicalAds placement for free users only.
 *
 * Requirements:
 *   1. VITE_EA_PUBLISHER must be set to your EthicalAds publisher id.
 *   2. The ethicalads.min.js script must be loaded (it is, in index.html).
 *   3. This component returns null for Premium subscribers.
 *
 * Usage:
 *   <AdSlot id="dashboard-top" keywords="homeschool|education" />
 *   <AdSlot id="curriculum-list" type="text" />
 */

import { useEffect, useRef } from 'react'
import { useSubscription } from '../../context/SubscriptionContext'
import './AdSlot.css'

const PUBLISHER = import.meta.env.VITE_EA_PUBLISHER

export default function AdSlot({
  id,
  type = 'image',        // 'image' | 'text'
  horizontal = false,    // true → horizontal image variant
  keywords = 'homeschool|education|family|learning',
  className = '',
}) {
  const { isPremium } = useSubscription()
  const ref = useRef(null)
  const loaded = useRef(false)

  useEffect(() => {
    if (isPremium || !PUBLISHER || !ref.current) return

    // On SPA route changes the DOM node already exists; tell EthicalAds to reload it.
    if (typeof window.ethicalads !== 'undefined') {
      try {
        window.ethicalads.reload()
      } catch (_) {}
    }
    loaded.current = true
  }, [isPremium])

  // Don't render at all for Premium users or when no publisher is configured
  if (isPremium || !PUBLISHER) return null

  return (
    <div className={`ad-slot-wrapper ${className}`}>
      <div
        ref={ref}
        id={id}
        data-ea-publisher={PUBLISHER}
        data-ea-type={type}
        data-ea-style={horizontal ? 'fixedheader' : undefined}
        data-ea-keywords={keywords}
        className={`ea-placement flat ${horizontal ? 'horizontal' : ''}`}
      />
    </div>
  )
}
