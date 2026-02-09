import { Link } from 'react-router-dom'
import { Scale, Shield, Briefcase, ArrowLeft, ExternalLink } from 'lucide-react'
import './LegalHelp.css'

const LINKS = {
  insurance: [
    { url: 'https://hslda.org/content/hs/membership/', title: 'HSLDA Membership & Group Benefits', desc: 'Home School Legal Defense Association offers membership benefits including group insurance options for homeschool families.' },
    { url: 'https://www.homeschool.com/articles/homeschool_insurance/', title: 'Homeschool.com – Homeschool Insurance', desc: 'Information on insurance options and considerations for homeschooling families.' },
    { url: 'https://www.nheri.org/', title: 'National Home Education Research Institute', desc: 'Research and resources on homeschooling, including links to legal and insurance information.' },
  ],
  workPermits: [
    { url: 'https://www.dol.gov/agencies/whd/child-labor', title: 'U.S. Department of Labor – Child Labor', desc: 'Federal rules on child labor and work permits for minors, with links to state-specific requirements.' },
    { url: 'https://www.dol.gov/agencies/whd/state/child-labor', title: 'DOL State Child Labor Laws', desc: 'State-by-state information on work permits and employment rules for minors.' },
    { url: 'https://youthrules.dol.gov/', title: 'YouthRules! – Youth Employment', desc: 'Resources for teens and parents on work permits, hours, and permissible jobs for minors.' },
  ]
}

function LegalHelp() {
  return (
    <div className="legal-page">
      <nav className="legal-nav">
        <Link to="/" className="back-btn">
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>
      </nav>

      <header className="legal-header">
        <div className="header-content">
          <Scale size={48} className="header-icon" />
          <h1>Legal Help</h1>
          <p>Resources for homeschool insurance, work permits, and legal compliance</p>
        </div>
      </header>

      <main className="legal-content">
        <section className="legal-section">
          <div className="section-header">
            <Shield size={28} />
            <h2>Homeschooler&apos;s Insurance</h2>
          </div>
          <p className="section-intro">
            Homeschool families may need liability coverage, umbrella policies, or group benefits. 
            The links below provide information on insurance options tailored to homeschoolers.
          </p>
          <ul className="legal-links">
            {LINKS.insurance.map((link, i) => (
              <li key={i}>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="legal-link">
                  <span className="link-title">{link.title}</span>
                  <ExternalLink size={16} className="link-icon" />
                </a>
                <p className="link-desc">{link.desc}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="legal-section">
          <div className="section-header">
            <Briefcase size={28} />
            <h2>Minor Work Permits</h2>
          </div>
          <p className="section-intro">
            When homeschooled teens work, they may need a work permit or employment certificate. 
            Requirements vary by state. These resources explain federal rules and link to state-specific information.
          </p>
          <ul className="legal-links">
            {LINKS.workPermits.map((link, i) => (
              <li key={i}>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="legal-link">
                  <span className="link-title">{link.title}</span>
                  <ExternalLink size={16} className="link-icon" />
                </a>
                <p className="link-desc">{link.desc}</p>
              </li>
            ))}
          </ul>
        </section>

        <p className="legal-disclaimer">
          These links are provided for informational purposes. HomeSchool Helper does not endorse any 
          external organization. Laws and requirements vary by state—please verify with your state 
          department of labor or education for current rules.
        </p>
      </main>
    </div>
  )
}

export default LegalHelp
