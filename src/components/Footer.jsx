import { Link } from 'react-router-dom'
import { BookOpen, Mail, MapPin, Phone } from 'lucide-react'
import './Footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <BookOpen className="logo-icon" />
              <span className="logo-text">
                <span className="logo-home">Home</span>School Helper
              </span>
            </Link>
            <p>
              Empowering families to create meaningful, personalized 
              education experiences at home.
            </p>
            <div className="footer-contact">
              <a href="mailto:hello@homeschoolhelper.com">
                <Mail size={18} />
                hello@homeschoolhelper.com
              </a>
              <a href="tel:+18053317942">
                <Phone size={18} />
                (805) 331-7942
              </a>
              <span>
                <MapPin size={18} />
                Fordland, Missouri
              </span>
            </div>
          </div>

          <div className="footer-links">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Curriculum Guides</a></li>
              <li><a href="#">Printable Worksheets</a></li>
              <li><a href="#">Video Lessons</a></li>
              <li><a href="#">Activity Ideas</a></li>
              <li><a href="#">Book Lists</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about" className="footer-link-btn">About Us</Link></li>
              <li><Link to="/legal-help" className="footer-link-btn">Legal Help</Link></li>
              <li><Link to="/about" className="footer-link-btn">Our Team</Link></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Press Kit</a></li>
              <li><a href="mailto:hello@homeschoolhelper.com">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} HomeSchool Helper. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
