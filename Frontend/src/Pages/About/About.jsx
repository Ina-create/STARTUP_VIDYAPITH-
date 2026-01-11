import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Header from '../../Components/Header/Header.jsx'; // Add Header import
import './About.css';

function About() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const storyRef = useRef(null);
  const teamRef = useRef(null);
  const impactRef = useRef(null);

  // Parallax effects
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroParallax = useTransform(heroProgress, [0, 1], [0, -100]);

  const { scrollYProgress: storyProgress } = useScroll({
    target: storyRef,
    offset: ["start end", "end start"]
  });
  const storyScale = useTransform(storyProgress, [0, 0.5, 1], [0.9, 1, 0.95]);

  const { scrollYProgress: teamProgress } = useScroll({
    target: teamRef,
    offset: ["start end", "end start"]
  });
  const teamY = useTransform(teamProgress, [0, 1], [100, -50]);

  const { scrollYProgress: impactProgress } = useScroll({
    target: impactRef,
    offset: ["start end", "end start"]
  });
  const impactScale = useTransform(impactProgress, [0, 0.5, 1], [0.85, 1, 0.9]);

  return (
    <div ref={containerRef} className="about-wilderness">
      {/* Header Component */}
      <Header />
      
      {/* Hero Section - Adjusted with padding for fixed header */}
      <section ref={heroRef} className="about-hero" style={{ paddingTop: '80px' }}>
        <motion.div 
          className="hero-background"
          style={{ y: heroParallax }}
        >
          <div className="hero-gradient"></div>
        </motion.div>
        
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="hero-header"
          >
            <h1 className="hero-title">
              Startup<span className="highlight">_</span>Vidyapith
            </h1>
            <p className="hero-subtitle">
              Empowering Student Entrepreneurs at Banasthali Vidyapith
            </p>
          </motion.div>
          
          <motion.div 
            className="hero-scroll-indicator"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="scroll-line"></div>
          </motion.div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="impact-stats">
        <div className="stats-container">
          {[
            { number: '50+', label: 'Startups Launched', color: '#FF6B35' },
            { number: '100+', label: 'Student Members', color: '#4ECDC4' },
            { number: '20+', label: 'Mentors', color: '#FFD166' },
            { number: '15+', label: 'Events Conducted', color: '#06D6A0' }
          ].map((stat, index) => (
            <motion.div 
              key={index}
              className="stat-card"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="stat-number" style={{ color: stat.color }}>
                {stat.number}
              </div>
              <div className="stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section ref={storyRef} className="about-story">
        <motion.div 
          className="story-container"
          style={{ scale: storyScale }}
        >
          <div className="story-header">
            <span className="section-label">Our Story</span>
            <h2 className="section-title">
              Where It All Began
            </h2>
            <div className="title-line">
              <div className="line-dot"></div>
            </div>
          </div>
          
          <div className="story-content">
            <div className="story-text">
              <p className="story-paragraph">
                Founded in the vibrant campus of Banasthali Vidyapith, Startup_Vidyapith 
                emerged from a simple realization: every student has the potential to 
                innovate and create.
              </p>
              <p className="story-paragraph">
                What started as a small group of passionate students has grown into 
                a thriving ecosystem where ideas meet execution, and dreams transform 
                into impactful ventures.
              </p>
              <motion.button
                className="story-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Read Our Journey
                <svg className="button-arrow" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
            
            <div className="story-image">
              <motion.div 
                className="image-frame"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="image-overlay"></div>
                <div className="image-placeholder">
                  <img 
                    src="/images/team-photo.jpg" 
                    alt="Team Founding Story" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = `
                        <div class="image-fallback">
                          <span>👭👭</span>
                          <p>Our Founding Team</p>
                        </div>
                      `;
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-section">
        <div className="mission-grid">
          <motion.div 
            className="mission-card mission-card-primary"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="mission-icon">🎯</div>
            <h3 className="mission-title">Our Mission</h3>
            <p className="mission-text">
              To create a nurturing environment where student entrepreneurs 
              can transform ideas into sustainable businesses through 
              mentorship, resources, and community support.
            </p>
          </motion.div>
          
          <motion.div 
            className="mission-card mission-card-secondary"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="mission-icon">🌟</div>
            <h3 className="mission-title">Our Vision</h3>
            <p className="mission-text">
              To become the leading student-run innovation hub in India, 
              empowering a generation of women entrepreneurs who drive 
              technological and social change.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Team */}
      <section ref={teamRef} className="team-section">
        <div className="team-container">
          <div className="team-header">
            <span className="section-label">Meet The Team</span>
            <h2 className="section-title">
              Four Girls, One Vision
            </h2>
            <p className="team-subtitle">
              Passionate students driving innovation at Banasthali
            </p>
          </div>

          <motion.div 
            className="team-grid"
            style={{ y: teamY }}
          >
            {[1, 2, 3, 4].map((member, index) => (
              <motion.div 
                key={index}
                className="team-member"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="member-avatar">
                  <div className="avatar-initials">
                    {['SV', 'BP', 'RS', 'AK'][index]}
                  </div>
                  <div className="avatar-hover">
                    <span className="hover-emoji">💼</span>
                  </div>
                </div>
                <div className="member-info">
                  <h4 className="member-name">
                    Team Member {member}
                  </h4>
                  <p className="member-role">
                    {['Founder', 'Tech Lead', 'Design Head', 'Marketing'][index]}
                  </p>
                  <p className="member-bio">
                    Passionate about {['entrepreneurship', 'technology', 'design', 'innovation'][index]} 
                    and creating impact through startups.
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Innovation Image */}
      <section className="innovation-section">
        <div className="innovation-container">
          <motion.div 
            className="innovation-image"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="image-frame-large">
              <img 
                src="/images/cartoon-girl.png" 
                alt="Innovation Illustration" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = `
                    <div class="image-fallback-large">
                      <span>🚀</span>
                      <p>Innovation & Creativity</p>
                    </div>
                  `;
                }}
              />
            </div>
            <div className="image-caption">
              <h3 className="caption-title">Innovation in Action</h3>
              <p className="caption-text">
                Symbolizing the creative spirit that drives every Startup_Vidyapith member
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Impact & Vision */}
      <section ref={impactRef} className="impact-section">
        <motion.div 
          className="impact-container"
          style={{ scale: impactScale }}
        >
          <div className="impact-header">
            <span className="section-label">Our Impact</span>
            <h2 className="section-title">
              Building The Future
            </h2>
          </div>
          
          <div className="impact-content">
            <div className="impact-text">
              <p className="impact-paragraph">
                At Startup_Vidyapith, we believe in creating lasting impact. 
                Through our initiatives, we've helped students launch ventures, 
                develop essential skills, and build a supportive community of 
                like-minded innovators.
              </p>
              
              <div className="impact-features">
                {[
                  'Mentorship Programs',
                  'Startup Incubation',
                  'Skill Workshops',
                  'Networking Events',
                  'Funding Support',
                  'Community Building'
                ].map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="feature-tag"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <span className="feature-check">✓</span>
                    {feature}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Join CTA */}
      <section className="join-section">
        <div className="join-container">
          <motion.div 
            className="join-card"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="join-content">
              <h2 className="join-title">Ready to Innovate?</h2>
              <p className="join-text">
                Join our community of student entrepreneurs and start your journey 
                with Startup_Vidyapith today.
              </p>
              
              <div className="join-buttons">
                <motion.button
                  className="join-button primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Become a Member
                </motion.button>
                <motion.button
                  className="join-button secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Attend an Event
                </motion.button>
              </div>
            </div>
            
            <div className="join-decoration">
              <div className="decoration-circle"></div>
              <div className="decoration-circle"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <div className="footer-container">
          <div className="footer-logo">
            Startup<span className="highlight">_</span>Vidyapith
          </div>
          <p className="footer-tagline">
            Empowering Student Entrepreneurs at Banasthali Vidyapith
          </p>
          <div className="footer-social">
            <a href="#" className="social-link">Instagram</a>
            <a href="#" className="social-link">LinkedIn</a>
            <a href="#" className="social-link">Twitter</a>
          </div>
          <p className="footer-copyright">
            © 2024 Startup_Vidyapith. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default About;