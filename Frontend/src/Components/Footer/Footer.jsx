import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, ArrowUp, Heart, Rocket, Users, Search, Book, Target } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Platform links with icons
  const platformLinks = [
    { label: 'Browse Startups', href: '#', icon: Search },
    { label: 'Register Startup', href: '#', icon: Rocket },
    { label: 'Find Contributors', href: '#', icon: Users },
    { label: 'Startup Resources', href: '#', icon: Book },
    { label: 'Mentorship Program', href: '#', icon: Target },
  ];

  // Description points with checkmarks
  const descriptionPoints = [
    'Empowering women entrepreneurs at Banasthali Vidyapith.',
    'Connect, collaborate, and build the future together.'
  ];

  // Checkmark icon component
  const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0)">
        <path
          d="M10 0.5625C4.78125 0.5625 0.5625 4.78125 0.5625 10C0.5625 15.2188 4.78125 19.4688 10 19.4688C15.2188 19.4688 19.4688 15.2188 19.4688 10C19.4688 4.78125 15.2188 0.5625 10 0.5625ZM10 18.0625C5.5625 18.0625 1.96875 14.4375 1.96875 10C1.96875 5.5625 5.5625 1.96875 10 1.96875C14.4375 1.96875 18.0625 5.59375 18.0625 10.0312C18.0625 14.4375 14.4375 18.0625 10 18.0625Z"
          fill="currentColor"
        />
        <path
          d="M12.6875 7.09375L8.96875 10.7188L7.28125 9.0625C7 8.78125 6.5625 8.8125 6.28125 9.0625C6 9.34375 6.03125 9.78125 6.28125 10.0625L8.28125 12C8.46875 12.1875 8.71875 12.2813 8.96875 12.2813C9.21875 12.2813 9.46875 12.1875 9.65625 12L13.6875 8.125C13.9688 7.84375 13.9688 7.40625 13.6875 7.125C13.4063 6.84375 12.9688 6.84375 12.6875 7.09375Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );

  return (
    <footer className="w-full bg-gray-900">
      {/* Top padding for entire footer */}
      <div className="pt-16 md:pt-20 lg:pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Grid Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pb-20">
            
            {/* Column 1: Logo, Image & Description with Checkmarks */}
            <div className="block">
              {/* Padding above the logo/text */}
              <div className="pt-8 md:pt-12">
                {/* Added padding container above Banasthali text */}
                <div className="pt-8 md:pt-12 lg:pt-16">
                  <div className="flex items-center justify-center gap-4 mb-7">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">BV</span>
                    </div>
                    <div className="text-center">
                      <h4 className="text-xl text-white font-bold">Banasthali</h4>
                      <p className="text-orange-400 text-lg">StartupVidyapith</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-8 flex justify-center">
                  <img 
                    src="/lapywork-removebg-preview.png" 
                    alt="Girl working on laptop" 
                    className="w-full max-w-xs object-contain"
                  />
                </div>
                
                {/* Description with Checkmarks - Centered */}
                <div className="mb-8">
                  <ul className="space-y-3 max-w-md mx-auto">
                    {descriptionPoints.map((point, index) => (
                      <li key={index} className="flex text-white items-start">
                        <span className="mr-2.5 mt-0.5 text-orange-500 flex-shrink-0">
                          <CheckIcon />
                        </span>
                        <span className="text-base">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Made with Love - Centered */}
                <div className="flex items-center justify-center gap-2 text-white">
                  <Heart className="w-5 h-5 text-red-400 fill-red-400" />
                  <span className="text-base">Made with love</span>
                </div>
              </div>
            </div>
            {/* End Column 1 */}

            {/* Column 2: Platform Links with Icons and Top Padding */}
            <div className="block">
              <div className="pt-12 md:pt-16"> {/* Increased padding above Platform */}
                <h4 className="text-xl text-white font-bold mb-7">Platform</h4>
                <ul className="space-y-4">
                  {platformLinks.map((link, index) => {
                    const IconComponent = link.icon;
                    return (
                      <li key={index}>
                        <a 
                          href={link.href} 
                          className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                        >
                          <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                            <IconComponent className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                          </div>
                          <span className="text-base">{link.label}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            {/* End Column 2 */}

            {/* Column 3: Contact Information with Top Padding */}
            <div className="block">
              <div className="pt-12 md:pt-16"> {/* Increased padding above Contact Us */}
                <h4 className="text-xl text-white font-bold mb-7">Contact Us</h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-gray-400">Banasthali Vidyapith, Rajasthan, India</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-gray-400">+91 123 456 7890</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-gray-400">startups@banasthali.ac.in</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-gray-400">Mon - Fri: 9:00 AM - 6:00 PM</span>
                  </li>
                </ul>
              </div>
            </div>
            {/* End Column 3 */}
            
          </div>
          {/* End Grid */}

          {/* Bottom Section - Centered Text */}
          <div className="py-7 border-t border-gray-700">
            <div className="flex flex-col items-center justify-center gap-6 text-center">
              
              {/* Centered Copyright Text with Padding */}
              <div className="space-y-4 px-6 py-4 max-w-3xl mx-auto">
                <p className="text-gray-400 text-lg">
                  © 2025 StartupVidyapith. All rights reserved.
                </p>
                <p className="text-gray-500 text-base">
                  An initiative of Banasthali Vidyapith, Rajasthan
                </p>
                <p className="text-orange-400 text-lg leading-relaxed px-4 py-2">
                  🚀 Built by students, for students. Part of Banasthali Vidyapith's Innovation & Entrepreneurship Cell.
                </p>
              </div>

              {/* Back to Top Button */}
              <button 
                onClick={scrollToTop}
                className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors mt-4"
                aria-label="Back to top"
              >
                <ArrowUp className="w-5 h-5" />
                <span>Back to Top</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;