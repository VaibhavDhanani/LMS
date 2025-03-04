import { Search, User, ShoppingCart, Star, Book, Users, Award, ChevronRight } from "lucide-react"
import "./dummy.css";
const HomePage1 = () => {
  return (
    <div className="home-page">
      <header className="header">
        <div className="header-content">
          <div className="logo">LearnHub</div>
          <nav className="main-nav">
            <a href="#" className="nav-link">
              Courses
            </a>
            <a href="#" className="nav-link">
              Categories
            </a>
            <a href="#" className="nav-link">
              Instructors
            </a>
            <a href="#" className="nav-link">
              About
            </a>
          </nav>
          <div className="header-actions">
            <div className="search-bar">
              <input type="text" placeholder="Search courses..." />
              <Search size={20} />
            </div>
            <button className="icon-btn">
              <ShoppingCart size={20} />
            </button>
            <button className="icon-btn">
              <User size={20} />
            </button>
            <button className="btn-primary">Sign Up</button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <h1>Unlock Your Potential with LearnHub</h1>
            <p>Discover a world of knowledge with our expert-led courses. Start your learning journey today!</p>
            <button className="btn-primary btn-large">Explore Courses</button>
          </div>
          <div className="hero-image">
            <img src="/placeholder.svg?height=400&width=600" alt="Students learning online" />
          </div>
        </section>

        <section className="featured-courses">
          <h2>Featured Courses</h2>
          <div className="course-grid">
            {[1, 2, 3, 4].map((course) => (
              <div key={course} className="course-card">
                <img src={`/placeholder.svg?height=200&width=300&text=Course ${course}`} alt={`Course ${course}`} />
                <div className="course-info">
                  <h3>Course Title {course}</h3>
                  <p>Instructor Name</p>
                  <div className="course-meta">
                    <span className="rating">
                      <Star size={16} fill="gold" />
                      4.5
                    </span>
                    <span className="students">
                      <Users size={16} />
                      1,234 students
                    </span>
                  </div>
                  <div className="course-price">$49.99</div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-secondary">View All Courses</button>
        </section>

        <section className="features">
          <h2>Why Choose LearnHub?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <Book size={48} />
              <h3>Diverse Course Selection</h3>
              <p>Explore a wide range of subjects taught by industry experts.</p>
            </div>
            <div className="feature-card">
              <Users size={48} />
              <h3>Interactive Learning</h3>
              <p>Engage with instructors and peers through forums and live sessions.</p>
            </div>
            <div className="feature-card">
              <Award size={48} />
              <h3>Certificates</h3>
              <p>Earn recognized certificates upon course completion.</p>
            </div>
          </div>
        </section>

        <section className="testimonials">
          <h2>What Our Students Say</h2>
          <div className="testimonial-grid">
            {[1, 2, 3].map((testimonial) => (
              <div key={testimonial} className="testimonial-card">
                <p>"LearnHub has transformed my career. The courses are top-notch and the instructors are amazing!"</p>
                <div className="testimonial-author">
                  <img
                    src={`/placeholder.svg?height=50&width=50&text=User ${testimonial}`}
                    alt={`User ${testimonial}`}
                  />
                  <div>
                    <h4>John Doe {testimonial}</h4>
                    <p>Web Developer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="cta">
          <div className="cta-content">
            <h2>Ready to Start Learning?</h2>
            <p>Join thousands of students and start your learning journey today.</p>
            <button className="btn-primary btn-large">
              Get Started <ChevronRight size={20} />
            </button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>LearnHub</h3>
            <p>Empowering learners worldwide with quality online education.</p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <a href="#">About Us</a>
            <a href="#">Courses</a>
            <a href="#">Instructors</a>
            <a href="#">Pricing</a>
          </div>
          <div className="footer-section">
            <h3>Support</h3>
            <a href="#">Help Center</a>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Contact Us</a>
          </div>
          <div className="footer-section">
            <h3>Stay Connected</h3>
            <div className="social-links">
              <a href="#" aria-label="Facebook">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" aria-label="LinkedIn">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="#" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2023 LearnHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage1

