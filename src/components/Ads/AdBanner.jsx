import { useSubscription } from '../../context/SubscriptionContext'
import './AdBanner.css'

const AD_CONTENT = [
  {
    title: 'Master Math at Home',
    description: 'Interactive math curriculum for K-12',
    sponsor: 'MathWizards Academy',
    cta: 'Learn More',
    color: '#E8A87C'
  },
  {
    title: 'Science Kits Delivered',
    description: 'Hands-on experiments shipped monthly',
    sponsor: 'ScienceBox',
    cta: 'Get Started',
    color: '#8FB39A'
  },
  {
    title: 'Reading Adventures Await',
    description: 'Curated book boxes for young readers',
    sponsor: 'LitKids',
    cta: 'Subscribe',
    color: '#2D5A4A'
  },
  {
    title: 'Art Supplies Bundle',
    description: '50% off your first creative kit order',
    sponsor: 'ArtStart',
    cta: 'Shop Now',
    color: '#D4896A'
  }
]

function AdBanner({ variant = 'horizontal', className = '' }) {
  const { isPremium, upgradeToPremium } = useSubscription()

  if (isPremium) return null

  // Pick a random ad
  const ad = AD_CONTENT[Math.floor(Math.random() * AD_CONTENT.length)]

  return (
    <div className={`ad-banner ad-${variant} ${className}`}>
      <div className="ad-content" style={{ '--ad-color': ad.color }}>
        <span className="ad-label">Advertisement</span>
        <div className="ad-main">
          <div className="ad-text">
            <h4>{ad.title}</h4>
            <p>{ad.description}</p>
            <span className="ad-sponsor">Sponsored by {ad.sponsor}</span>
          </div>
          <button className="ad-cta">{ad.cta}</button>
        </div>
      </div>
      <button className="ad-remove" onClick={upgradeToPremium}>
        Remove ads – Go Premium
      </button>
    </div>
  )
}

export default AdBanner
