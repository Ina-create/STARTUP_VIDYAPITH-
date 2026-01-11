import React from 'react';
import './FeaturesSection.css';
import './FeatureCard'

const FeaturesSection = () => {
  const features = [
    {
      image: '/idea.jpeg', // Replace with actual image path like '/images/startup-directory.svg'
      title: 'Startup Directory',
      description: 'Browse innovative startup ideas from Banasthali students',
      color: '#FF6B35'
    },
    {
      image: 'public/team.jpeg', // Replace with actual image path
      title: 'Team Formation',
      description: 'Connect with talented students to build your dream team',
      color: '#4ECDC4'
    },
    {
      image: 'public/idea.png', // Replace with actual image path
      title: 'Idea Validation',
      description: 'Get feedback and mentorship for your startup concepts',
      color: '#FFD166'
    },
    {
      image: 'public/internship.jpeg', // Replace with actual image path
      title: 'Internship Opportunities',
      description: 'Get internships inside startups and gain real-world experience',
      color: '#06D6A0'
    }
  ];

  return (
    <section className="features-section">
      <div className="features-container">
        <div className="features-header">
          <h2 className="features-title">How It Works</h2>
          <p className="features-subtitle">
            A complete ecosystem for student entrepreneurs at Banasthali
          </p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div 
                className="feature-image-container"
                style={{ backgroundColor: `${feature.color}15` }}
              >
                <div className="feature-image">{feature.image}</div>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;