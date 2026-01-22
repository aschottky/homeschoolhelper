import { Star, Quote } from 'lucide-react'
import './Testimonials.css'

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Mom of 3 • Homeschooling 5 years',
    image: 'SM',
    content: 'HomeSchool Helper transformed our chaotic days into joyful learning adventures. The flexible scheduling tool alone saved my sanity!',
    rating: 5
  },
  {
    name: 'David & Emily Chen',
    role: 'Parents of twins • New to homeschooling',
    image: 'DC',
    content: 'As first-time homeschoolers, we were overwhelmed. The curated curriculum guides gave us confidence and direction from day one.',
    rating: 5
  },
  {
    name: 'Rebecca Torres',
    role: 'Single mom • 2 kids',
    image: 'RT',
    content: 'The community here is incredible. I\'ve found local co-op partners, swapped curriculum tips, and made lifelong friends.',
    rating: 5
  }
]

function Testimonials() {
  return (
    <section id="testimonials" className="testimonials">
      <div className="container">
        <div className="testimonials-header">
          <span className="section-tag">Success Stories</span>
          <h2>Families who found their <span className="highlight">rhythm</span></h2>
          <p className="section-subtitle">
            Join thousands of families who have discovered the joy of 
            personalized education with HomeSchool Helper.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="testimonial-card"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="testimonial-quote">
                <Quote className="quote-icon" />
              </div>
              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="star-icon" />
                ))}
              </div>
              <p className="testimonial-content">{testimonial.content}</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  {testimonial.image}
                </div>
                <div className="author-info">
                  <span className="author-name">{testimonial.name}</span>
                  <span className="author-role">{testimonial.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="testimonials-stats">
          <div className="stat-box">
            <span className="stat-number">10,000+</span>
            <span className="stat-label">Happy Families</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">4.9/5</span>
            <span className="stat-label">Average Rating</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">50+</span>
            <span className="stat-label">Countries</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
