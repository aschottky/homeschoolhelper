import { useState } from 'react'
import { Users, Settings as SettingsIcon } from 'lucide-react'
import ChildManager from './ChildManager'
import Settings from './Settings'
import './FamilyProfile.css'

function FamilyProfile() {
  const [activeTab, setActiveTab] = useState('children')

  return (
    <div className="family-profile">
      <div className="fp-tabs">
        <button
          className={`fp-tab ${activeTab === 'children' ? 'active' : ''}`}
          onClick={() => setActiveTab('children')}
        >
          <Users size={16} />
          Children
        </button>
        <button
          className={`fp-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <SettingsIcon size={16} />
          Profile &amp; Settings
        </button>
      </div>

      <div className="fp-content">
        {activeTab === 'children' ? <ChildManager /> : <Settings />}
      </div>
    </div>
  )
}

export default FamilyProfile
