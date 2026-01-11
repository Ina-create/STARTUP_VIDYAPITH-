import React from 'react';
import { motion } from 'framer-motion';
import './FeatureCard.css';

const FeatureCard = ({ image, title, description, color, index }) => {
  // Enhanced animations
  const cardVariants = {
    hidden: { 
      opacity: 0,
      y: 60,
      scale: 0.95,
      rotateX: 10
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
        mass: 1,
        delay: index * 0.2
      }
    },
    hover: {
      y: -15,
      scale: 1.03,
      rotateY: 5,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const imageVariants = {
    hidden: { 
      scale: 0, 
      rotate: -180,
      opacity: 0 
    },
    visible: { 
      scale: 1, 
      rotate: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: index * 0.2 + 0.3
      }
    },
    hover: {
      rotate: 8,
      scale: 1.15,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.2 + 0.5
      }
    }
  };

  return (
    <motion.div 
      className="feature-card"
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true, amount: 0.4 }}
      style={{ 
        '--card-color': color,
        '--card-index': index
      }}
    >
      {/* Card background elements */}
      <div className="card-glow"></div>
      <div className="card-border"></div>
      
      {/* Image container */}
      <motion.div 
        className="feature-image-container"
        variants={imageVariants}
      >
        {image && image.startsWith('/') ? (
          <img 
            src={image} 
            alt={title}
            className="feature-image"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = e.target.parentNode.querySelector('.feature-image-fallback');
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="feature-image-fallback">
          {['💡', '👥', '💬', '🎯'][index]}
        </div>
      </motion.div>
      
      {/* Content */}
      <div className="card-content">
        <motion.h3 
          className="feature-title"
          variants={textVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {title}
        </motion.h3>
        
        <motion.p 
          className="feature-description"
          variants={textVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {description}
        </motion.p>
      </div>
      
      {/* Decorative corner elements */}
      <div className="corner corner-tl"></div>
      <div className="corner corner-tr"></div>
      <div className="corner corner-bl"></div>
      <div className="corner corner-br"></div>
    </motion.div>
  );
};

export default FeatureCard;