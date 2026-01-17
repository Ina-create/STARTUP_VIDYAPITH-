import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./SuccessStories.css";
import Header from "../../Components/Header/Header.jsx";
import {
  FaRocket,
  FaRupeeSign,
  FaCertificate,
  FaUsers,
  FaSearch,
  FaTrophy,
  FaArrowRight,
  FaShareAlt,
  FaLinkedinIn,
  FaTwitter,
  FaInstagram,
  FaFacebookF,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaChevronUp,
} from "react-icons/fa";

// Counter Component: Runs only once when visible
const StatCounter = ({ endValue }) => {
  const [count, setCount] = useState(0);
  const [hasRun, setHasRun] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasRun) {
          let start = 0;
          const finalValue = parseInt(endValue.replace(/[^0-9]/g, ""));
          const timer = setInterval(() => {
            start += Math.ceil(finalValue / 40);
            if (start >= finalValue) {
              setCount(finalValue);
              setHasRun(true);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 50);
        }
      },
      { threshold: 0.5 },
    );
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, [endValue, hasRun]);

  return (
    <span ref={domRef}>
      {count}
      {endValue.replace(/[0-9]/g, "")}
    </span>
  );
};

const SuccessStories = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [showTop, setShowTop] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const stories = [
    {
      id: 1,
      founder: "Ananya Singh",
      company: "EcoVeda Solutions",
      img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800",
      desc: "Revolutionizing sustainable packaging using agricultural waste to replace plastic.",
      fullStory:
        "Founded in 2023, EcoVeda started as a small campus project at Banasthali. Today, it has scaled to 5 states, providing livelihood to 200+ farmers and saving 500+ tons of plastic waste. Their journey is a testament to sustainable innovation and female leadership.",
      achievement: "NITI Aayog Women Award",
    },
    {
      id: 2,
      founder: "Priya Sharma",
      company: "Health-Her",
      img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=1600&fit=crop",
      desc: "AI-driven diagnostic tools empowering rural women with accessible healthcare.",
      fullStory:
        "Health-Her developed a portable AI kit for early cancer detection. Priya and her team have screened over 10,000 women in remote villages of Rajasthan, making healthcare affordable, reachable, and culturally sensitive.",
      achievement: "Startup India Grant Winner",
    },
  ];

  const filtered = stories.filter(
    (s) =>
      s.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.founder.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Page link copied to clipboard!");
  };

  const shareStory = (storyId, storyTitle) => {
    const storyUrl = `${window.location.origin}/success-stories/${storyId}`;

    if (navigator.share) {
      // Modern Web Share API
      navigator
        .share({
          title: `Check out ${storyTitle}`,
          text: `Read the success story of ${storyTitle} on Startup Vidyapith!`,
          url: storyUrl,
        })
        .then(() => console.log("Shared successfully!"))
        .catch((err) => console.error("Error sharing:", err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard
        .writeText(storyUrl)
        .then(() => alert("Link copied to clipboard!"))
        .catch(() => alert("Failed to copy. Use HTTPS or localhost."));
    }
  };
  // Inside SuccessStories component, above return()
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 300); // button appears after scrolling 300px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="success-page">
      <Header />

      {/* --- HERO SECTION --- */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content-wrapper">
          <div className="hero-text-area">
            <h1 className="hero-title">
              Where Ideas Become <br />
              <span className="gold-text">Legacies.</span>
            </h1>
            <p className="hero-quote">
              "The best way to predict the future is to create it."
            </p>
          </div>

          <div className="hero-stats-bottom">
            <div className="stat-pill">
              <FaRocket />
              <div className="stat-info">
                <p className="stat-val">
                  <StatCounter endValue="150+" />
                </p>
                <p className="stat-lab">Incubated</p>
              </div>
            </div>
            <div className="stat-pill">
              <FaRupeeSign />
              <div className="stat-info">
                <p className="stat-val">
                  <StatCounter endValue="120Cr+" />
                </p>
                <p className="stat-lab">Funding</p>
              </div>
            </div>
            <div className="stat-pill">
              <FaCertificate />
              <div className="stat-info">
                <p className="stat-val">
                  <StatCounter endValue="25+" />
                </p>
                <p className="stat-lab">Patents</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="search-section">
        <div className="search-bar-container">
          <div className="search-wrapper">
            <FaSearch className="search-icon-inside" />
            <input
              type="text"
              className="search-input-field"
              placeholder="Search by startup or founder name..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* --- MAIN STORIES SECTION --- */}
      <section className="stories-display-area">
        <div className="stories-list">
          {filtered.length > 0 ? (
            filtered.map((s) => (
              <div key={s.id} className="story-card-h">
                <div className="card-image-box">
                  <img src={s.img} alt={s.founder} />
                </div>
                <div className="card-content-box">
                  <div className="card-header-meta">
                    <span className="founder-name-tag">{s.founder}</span>
                    <button
                      className="share-icon-btn"
                      onClick={() => shareStory(s.id, s.company)}
                      title="Share Story"
                    >
                      <FaShareAlt />
                    </button>
                  </div>
                  <h3>{s.company}</h3>
                  <p className="main-desc">
                    {expandedId === s.id ? s.fullStory : s.desc}
                  </p>
                  <div className="achievement-badge">
                    <FaTrophy /> <span>{s.achievement}</span>
                  </div>
                  <div className="card-footer-actions">
                    <button
                      className="expand-btn"
                      onClick={() =>
                        setExpandedId(expandedId === s.id ? null : s.id)
                      }
                    >
                      {expandedId === s.id ? "Show Less" : "Read Full Journey"}{" "}
                      <FaArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="not-found-msg">
              <h3>No success stories found.</h3>
              <p>Try searching with a different keyword.</p>
            </div>
          )}
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="apply-cta-section">
        <div className="cta-content">
          <h2>
            Ready to share your own{" "}
            <span className="gold-text">Success Story?</span>
          </h2>
          <p>
            Join Startup Vidyapith and showcase your journey to inspire others.
          </p>
          <button className="cta-btn" onClick={() => setShowForm(true)}>
            Submit Your Story
          </button>
        </div>
      </section>
      {/* FORM MODAL
      {showStoryForm && (
        <div className="story-form-overlay">
          <div className="story-form-box">
            <h3>Submit Your Success Story</h3>
            <input type="text" placeholder="Founder Name" />
            <input type="text" placeholder="Startup Name" />
            <textarea placeholder="Your Story (short)" />

            <div className="form-actions">
              <button
                className="submit-btn"
                onClick={() => {
                  alert("Story submitted for review!");
                  setShowStoryForm(false);
                }}
              >
                Submit
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowStoryForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )} */}
      {/* --- FOOTER SECTION --- */}
      <footer className="footer-main">
        <div className="footer-top-grid">
          <div className="footer-col brand-info">
            <h2 className="footer-logo">
              Startup <span>Vidyapith</span>
            </h2>
            <p>
              Empowering women founders to lead the global market through
              innovation and resilience.
            </p>
            <div className="social-links-footer">
              <a
                href="https://www.linkedin.com/company/startup-vidyapith"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLinkedinIn />
              </a>
              <a
                href="https://twitter.com/StartupVidyapith"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTwitter />
              </a>
              <a
                href="https://instagram.com/startupvidyapith"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram />
              </a>
              <a
                href="https://facebook.com/startupvidyapith"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebookF />
              </a>
            </div>
          </div>

          <div className="footer-col quick-links">
            <h4>Explore</h4>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              {/* <li>
                <Link to="/success-stories">Success Stories</Link>
              </li> */}
              <li>
                <Link to="/about">About Us</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col contact-info">
            <h4>Connectivity</h4>
            <div className="contact-item">
              <FaEnvelope className="footer-icon" />
              <p>hub@banasthali.ac.in</p>
            </div>
            <div className="contact-item">
              <FaPhoneAlt className="footer-icon" />
              <p>+91 1438 228456</p>
            </div>
            <div className="contact-item">
              <FaMapMarkerAlt className="footer-icon" />
              <p>Rajasthan, India</p>
            </div>
          </div>
        </div>
        <div className="footer-bottom-bar">
          <p>&copy; 2026 Startup Vidyapith. All Rights Reserved.</p>
        </div>
      </footer>
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setShowForm(false)}
            >
              ×
            </button>

            <h3>Submit Your Success Story</h3>

            <form>
              <input type="text" placeholder="Founder Name" required />
              <input type="text" placeholder="Startup Name" required />
              <input type="email" placeholder="Email" required />
              <textarea placeholder="Short story (max 3–4 lines)" />

              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuccessStories;
