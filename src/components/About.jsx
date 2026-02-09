import { Link } from 'react-router-dom'
import { Heart, BookOpen, Users, Sparkles, ArrowLeft, Shield } from 'lucide-react'
import './About.css'

function About() {
  return (
    <div className="about-page">
      <nav className="about-nav">
        <Link to="/" className="back-btn">
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>
      </nav>

      <header className="about-header">
        <div className="header-content">
          <h1>About Us</h1>
          <p>Meet the passionate team behind Homeschool Helper</p>
        </div>
        <div className="header-decoration">
          <div className="deco-circle"></div>
          <div className="deco-circle"></div>
          <div className="deco-circle"></div>
        </div>
      </header>

      <main className="about-content">
        {/* Mission Section */}
        <section className="mission-section">
          <div className="mission-icon">
            <Heart size={32} />
          </div>
          <h2>Our Mission</h2>
          <p>
            We believe every family deserves the tools and support to provide an excellent 
            education at home. Homeschool Helper was born from our own homeschooling journey 
            and our desire to make tracking, planning, and organizing easier for families 
            everywhere.
          </p>
        </section>

        {/* Founders Section */}
        <section className="team-section founders">
          <div className="section-header">
            <Users size={24} />
            <h2>The Founders</h2>
          </div>
          
          <div className="team-grid founders-grid">
            <div className="team-card founder">
              <div className="card-avatar">
                <div className="avatar-placeholder">
                  <span>AS</span>
                </div>
              </div>
              <div className="card-content">
                <h3>Alexander Schottky</h3>
                <p className="role">Co-Founder & Developer</p>
                <p className="bio">
                  Alexander brings his technical expertise and passion for education technology 
                  to Homeschool Helper. With a background in software development and a heart 
                  for helping families, he leads the development of our platform, ensuring it's 
                  intuitive, powerful, and built to meet the real needs of homeschooling parents. 
                  As a homeschool parent himself, Alexander understands firsthand the challenges 
                  and joys of educating children at home.
                </p>
              </div>
            </div>

            <div className="team-card founder">
              <div className="card-avatar">
                <div className="avatar-placeholder">
                  <span>BS</span>
                </div>
              </div>
              <div className="card-content">
                <h3>Brittany Schottky</h3>
                <p className="role">Co-Founder & Education Director</p>
                <p className="bio">
                  Brittany is the heart behind Homeschool Helper's educational philosophy. 
                  As a dedicated homeschooling mother, she brings years of hands-on experience 
                  in curriculum planning, record-keeping, and creating engaging learning 
                  experiences. Her vision for a comprehensive yet simple tracking system 
                  inspired the creation of Homeschool Helper. Brittany ensures that every 
                  feature we build truly serves homeschooling families.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Consultant Section */}
        <section className="team-section consultant">
          <div className="section-header">
            <BookOpen size={24} />
            <h2>Curriculum Expert</h2>
          </div>
          
          <div className="team-grid">
            <div className="team-card consultant-card">
              <div className="card-avatar">
                <div className="avatar-placeholder consultant">
                  <span>JG</span>
                </div>
              </div>
              <div className="card-content">
                <h3>Javai Garvin</h3>
                <p className="role">Curriculum Consultant & Curator</p>
                <p className="bio">
                  Javai is our curriculum expert, bringing extensive knowledge of educational 
                  methodologies, learning styles, and homeschool curricula to the Homeschool 
                  Helper team. With a deep passion for personalized education and years of 
                  experience helping families find the right resources for their unique needs, 
                  Javai curates our curriculum recommendations and provides expert consultation 
                  services to our premium members.
                </p>
                <p className="bio">
                  Whether you're exploring Charlotte Mason, classical education, unit studies, 
                  or an eclectic approach, Javai can help you navigate the options and build 
                  a curriculum that works for your family. Her personalized consultations have 
                  can help you discover an approach that works for your family.
                </p>
                <div className="expertise-tags">
                  <span className="tag">Curriculum Design</span>
                  <span className="tag">Learning Styles</span>
                  <span className="tag">Special Needs</span>
                  <span className="tag">Classical Education</span>
                  <span className="tag">Charlotte Mason</span>
                  <span className="tag">Unit Studies</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="values-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <Heart size={24} />
              </div>
              <h4>Family First</h4>
              <p>We build tools that strengthen the homeschool family bond, not complicate it.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <Sparkles size={24} />
              </div>
              <h4>Simplicity</h4>
              <p>Homeschooling is complex enough. Our tools should make life easier, not harder.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <BookOpen size={24} />
              </div>
              <h4>Excellence</h4>
              <p>We're committed to providing the best resources for your homeschool journey.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <Shield size={24} />
              </div>
              <h4>Privacy</h4>
              <p>Your data stays yours. No social feeds or sharing—just tools for your family's records.</p>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="contact-cta">
          <h2>Get In Touch</h2>
          <p>
            Have questions, feedback, or just want to say hello? We'd love to hear from you!
          </p>
          <a href="mailto:hello@homeschoolhelper.com" className="contact-btn">
            Contact Us
          </a>
        </section>
      </main>
    </div>
  )
}

export default About
