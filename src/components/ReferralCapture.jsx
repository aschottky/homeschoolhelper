import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { storeReferralCodeFromQuery } from '../lib/referralClient'

/** Captures ?ref= on any page and stores for post-signup attribution. */
export default function ReferralCapture() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) storeReferralCodeFromQuery(ref)
  }, [searchParams])

  return null
}
